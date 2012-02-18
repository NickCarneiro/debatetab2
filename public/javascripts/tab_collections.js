
/*
=========================================
Define Backbone Models
=========================================
*/	


model.Competitor = Backbone.Model.extend({
	default: {
		name: "",
		total_speaks: 0,
		adjusted_speaks: 0,
		total_ranks: 0
	}
});

model.Team = Backbone.Model.extend({
	idAttribute: "_id",
	default: {
		team_code	: "default team_code" ,
		division	: null , //reference to division
		school	: null , //reference to school
		wins:	0,
		losses:	0,

		stop_scheduling : false ,
		competitors : []

	} ,
	initialize: function() {
		if(this.id === undefined){
			this.set({
				_id: (new ObjectId()).toString()
			});
		}
		this.set({tournament_id: tab.tournament_id});
		
	} 
});

model.School = Backbone.Model.extend({
	idAttribute: "_id" ,
	initialize: function() {
		if(this.id === undefined){
			this.set({
				_id: (new ObjectId()).toString()
			});
		}

		this.set({tournament_id: tab.tournament_id});
	}
});

model.Room = Backbone.Model.extend({
	idAttribute: "_id" ,
	initialize: function() {
		if(this.id === undefined){
			this.set({
				_id: (new ObjectId()).toString()
			});
		}
		this.set({tournament_id: tab.tournament_id});
	}
});

model.Judge = Backbone.Model.extend({
	idAttribute: "_id" ,
	default: {
		id			: null,
		name		: null,
		school		: null
	} ,
	initialize: function() {
		if(this.id === undefined){
			this.set({
				_id: (new ObjectId()).toString()
			});
		}	
		this.set({tournament_id: tab.tournament_id});
	}
    
});



model.Round = Backbone.Model.extend({
	idAttribute: "_id" ,
	default: {
		division	: null, //ref to division
		team1		: null, //reference to team1 in teams collection
		team2		: null, //
		aff			: null, //team1 or team2
		result		: null,
		room        : null,
		team1_points : null,
		team2_points : null
		/*
		result can be: 0 - 7:
		0 AFF_WIN_NEG_LOSS
		1 AFF_BYE_NEG_FORFEIT
		2 NEG_WIN_AFF_LOSS
		3 NEG_BYE_AFF_FORFEIT
		4 DOUBLE_WIN
		5 DOUBLE_LOSS
		6 DOUBLE_BYE
		7 DOUBLE_FORFEIT
		*/


	} ,
	initialize: function(){
		if(this.id === undefined){
			this.set({
			_id: (new ObjectId()).toString()
			});
		}	
		this.set({tournament_id: tab.tournament_id});
	},

	//returns winning team, false if no winner
	getWinner: function(){
		//if round is a bye, the real team is the winner.
		if(this.get("result") === undefined){
			return false;
		} else if(this.get("result") == 0 || this.get("result") == 1){
			//aff won
			return this.get("aff") == 0 ? this.get("team1") : this.get("team2");
		} else if(this.get("result") == 2 || this.get("result") == 3){
			//neg won
			return this.get("aff") == 0 ? this.get("team2") : this.get("team1"); 
		} else {
			con.write("fatal error: invalid round result: " + this.get("result"));
		}
	},

	getLoser: function(){
		if(this.get("result") === undefined){
			return false;
		} else if(this.get("result") == 0 || this.get("result") == 1){
			//aff won
			return this.get("aff") == 0 ? this.get("team2") : this.get("team1");
		} else if(this.get("result") == 2 || this.get("result") == 3){
			return this.get("aff") == 0 ? this.get("team1") : this.get("team2"); 
		} else {
			con.write("fatal error: invalid round result: " + this.get("result"));
		}
	}
});



model.Division = Backbone.Model.extend({
	idAttribute: "_id" ,
	default: {
		id				: null ,
		division_name	: "VCX" ,  //eg: VCX, NLD
		comp_per_team	: 2 , //number of competitors per team. 2 in CX, 1 in LD
		break_to		: "quarterfinals" , //quarterfinals, octofinals, etc.
		prelim_judges	: 1 , //number of judges in prelims
		record_ranks	: true ,
		max_speaks		: 30 , //maximum speaker points possible
		flighted_rounds : false ,
		prelims			: -1 , //
		prelim_matching : [] ,
		schedule		: [] //array of round info objects that contain a round_number and powermatching_method
	} ,
	initialize: function(){
		
		if(this.id === undefined){
			this.set({
				_id: new ObjectId().toString()
			});
		}
		this.set({tournament_id: tab.tournament_id});
	}
});

/*
=========================================
Define Backbone Collections
=========================================
*/	


collection.Teams = Backbone.Collection.extend({
	model: model.Team ,

	search : function(letters){
		if(letters == "") return this;

		var pattern = new RegExp(letters,"gi");
		return _(this.filter(function(data) {
		  	return pattern.test(data.get("team_code"));
		}));
	} ,

	comparator: function(team){
		return team.get("team_code");
	},

	localStorage: new Store("Teams") ,
	backend: "teams",
	initialize: function() {
		this.bindBackend();
	} ,
	url: function() {
		return '/trn/' + tab.tournament_id + '/teams';
	}
	
});	


collection.Judges = Backbone.Collection.extend({
		model: model.Judge ,

		search : function(letters){
			if(letters == "") return this;

			var pattern = new RegExp(letters,"gi");
			return _(this.filter(function(data) {
			  	return pattern.test(data.get("name"));
			}));
		} ,
		comparator: function(team){
			return team.get("name");
		},
		localStorage: new Store("Judges") ,
		backend: "judges",
		initialize: function() {
			this.bindBackend();
		} ,
		url: function() {
			return '/trn/' + tab.tournament_id + '/judges';
		}
});	

collection.Schools = Backbone.Collection.extend({
	model: model.School ,
	search : function(letters){
		if(letters == "") return this;

		var pattern = new RegExp(letters,"gi");
		return _(this.filter(function(data) {
		  	return pattern.test(data.get("school_name"));
		}));
	} ,
	localStorage: new Store("Schools") ,
	backend: "schools" ,
	initialize: function() {
	    this.bindBackend();
	} ,

	comparator: function(team){
		return team.get("school_name");
	},

	url: function() {
		return '/trn/' + tab.tournament_id + '/schools';
	}
});	

collection.Rooms = Backbone.Collection.extend({
	model: model.Room ,
	backend: "rooms" ,
	initialize: function() {
	    this.bindBackend();
	} ,
	search : function(letters){
		if(letters == "") return this;

		var pattern = new RegExp(letters,"gi");
		return _(this.filter(function(data) {
		  	return pattern.test(data.get("name"));
		}));
	} ,
	localStorage: new Store("Rooms") ,
	url: function() {
		return '/trn/' + tab.tournament_id + '/rooms';
	}
});	

collection.Divisions = Backbone.Collection.extend({
		model: model.Division ,
		localStorage: new Store("Divisions") ,
		backend: "divisions" ,
		initialize: function() {
		    this.bindBackend();
		} ,
		url: function() {
			return '/trn/' + tab.tournament_id + '/divisions';
		}
});	

collection.Rounds = Backbone.Collection.extend({
		model: model.Round ,
		localStorage: new Store("Rounds"),
		backend: "rounds",
		initialize: function() {
			this.bindBackend();
		} ,
		filterRounds: function(round_number, division){
			return _(this.filter(function(data){
				
				if(data.get("division") === division && data.get("round_number") == round_number){
					
					return true;
				} else {
					return false;
				}
			}));
		} ,
		comparator: function(round){
			return round.get("result") === undefined ? -1 : 1;
		
		} ,
		url: function() {
			return '/trn/' + tab.tournament_id + '/rounds';
		}
});	

//turn all object copies back into model references.
//neded because when JSON or localstorage is loaded into collections, all references become object copies

/*
Diagram of references that need to be restored.
items at lower levels point to items at higher levels. 
There are 7 total references that need to be restored.

schools
	teams
	judges

divisions
	rooms
	rounds
	judges (has array of divisions)

rooms
	rounds

teams
	rounds

judges
	rounds

*/
collection.restoreReferences = function(){
	console.log("Restoring references");
	try {
	//for each collection, restore its references
	$.each(collection, function(col_name, col){
		//only do work on collections. The collection namespace also contains function.
		//skip those with this:
		if(typeof col.pluck != "function"){
			return true; //continue
		}
		//console.log("checking " + col_name);
		//for each model in the collection, look for objects in its attributes that should be models.
		col.forEach(function(elem, index){
			//for each attribute, see if it has an id.
			$.each(elem.attributes, function(attr_name, attr){
				//restore references for strings containing ids and objects containing string ids
				if(attr instanceof Array){ //if we have an array
					//restore references for each thing in array
					$.each(attr, function(i, array_attr){
							var model = undefined;
							if(array_attr.id != undefined){
								model = collection.getModelFromId(array_attr.id);
							} else if(array_attr.length != undefined) {
								model = collection.getModelFromId(array_attr);
							}
							
							//if we found a model for the id, replace the object copy with the model reference
							if(model != undefined && typeof model.attributes === "object"){
								attr[i] = model;

								console.dbg("creating array reference from " + col_name + " array to " + attr_name);
							}
						
					});
				}
				else if(attr != null && attr_name != "_id" ){
					var model = collection.getModelFromId(attr);
					//if we found a model for the id, replace the object copy with the model reference
					if(model != undefined && typeof model.attributes === "object"){
						var setmodel = {};
						setmodel[attr_name] = model;
						elem.setByName(attr_name, model, {silent: true});
						console.dbg("creating reference from " + col_name + " to " + attr_name);
					}
				} 
			})

		});

	});

	} catch(e){
		console.log(e.message + " " + e.stack);
	}

	collection.restoreValues();

}

	//convert results, round numbers, sides back to integers. 
	//stop scheduling to boolean
	//convert speaker points back to floats
collection.restoreValues = function(){

	$.each(collection.rounds, function(i){
		var round = collection.rounds.at(i);
		var round_number = round.get("round_number");
		if(typeof round_number === "string"){
			round.set({round_number: parseInt(round_number)});
		}

		var aff = round.get("aff");
		if(typeof aff === "string"){
			round.set({aff: parseInt(aff)});
		}

		var result = round.get("result");
		if(typeof result === "string"){
			round.set({result: parseInt(result)});
		}

		var stop_scheduling = round.get("stop_scheduling");
		if(stop_scheduling === "true"){
			round.set({stop_scheduling: true});
		}



	});

	$.each(collection.rooms, function(i){
		var room = collection.rooms.at(i);
		if(room.get("stop_scheduling") === "true"){
			room.set({stop_scheduling: true});
		}
	});

	$.each(collection.divisions, function(i){
		var division = collection.divisions.at(i);
		if(division.get("flighted_rounds") == true){
			division.set({flighted_rounds: true});
		}
	})
}

//restore references before attributes object from server is turned back into a model
//called from backbone.io.js
collection.restore = function(elem){
	//for each attribute, see if it has an id.
	$.each(elem, function(attr_name, attr){

		if(attr == null){
			return true;
		}
		//try to turn strings into models
		if(attr instanceof Array){ //if we have an array
			//restore references for each thing in array
			$.each(attr, function(i, array_attr){
					var model = undefined;
					if(array_attr.id != undefined){
						model = collection.getModelFromId(array_attr.id);
					} else if(array_attr.length != undefined) {
						model = collection.getModelFromId(array_attr);
					}
					
					//if we found a model for the id, replace the object copy with the model reference
					if(model != undefined && typeof model.attributes === "object"){
						attr[i] = model;

					}
				
			});
		}
		else if(typeof attr === "string" && attr_name != "_id"){
			var model = collection.getModelFromId(attr);
			//if we found a model for the id, replace the object copy with the model reference
			if(model != undefined && typeof model.attributes === "object"){
				elem[attr_name] = model;
			}
		} else {
			//console.log("else: " + attr_name);
		}
	})

};

collection.prepareForMongoose = function(obj){
	$.each(obj, function(attr_name, attr){
		if(attr == null){
			
			return true;
		} else if(attr.id != undefined){
			
			//replace object containing id with string.
			obj[attr_name] = attr.id;
		}
	});
}

//save every model in every collection
collection.saveAll = function(){
	console.log("saving all models");
	$.each(collection, function(col_name, col){
		//only do work on collections. The collection namespace also contains function.
		//skip those with this:
		if(col instanceof Backbone.Collection === false){
			return true; //continue
		}
		//console.log("checking " + col_name);
		//for each model in the collection, look for objects in its attributes that should be models.
		col.forEach(function(elem, index){
			
			elem.save();
		});
	});
}
//iterate over every collection, looking for a model with the id
collection.getModelFromId = function(model_id){
	var matching_model = undefined;
	$.each(collection, function(col_name, col){
		//only do work on collections. The collection namespace also contains function.
		//skip those with this:
		if(typeof col.pluck != "function"){
			return true; //continue
		}

		//for each model in the collection, look for models matching the id
		matching_model = col.get(model_id);

		if(matching_model != undefined){
			return false;
		}

	});
	
	return matching_model;
}

collection.getDivisionFromId = function(division_id){
	return collection.divisions.get(division_id);
};

collection.getSchoolFromId = function(school_id){
	return collection.schools.get(school_id);
}


collection.getTeamFromId = function(team_id){
	return collection.teams.get(team_id);
}

collection.getRoomFromId = function(room_id){
	return collection.rooms.get(room_id)
}

collection.getJudgeFromId = function(judge_id){
	return collection.judges.get(judge_id);
}

collection.getRoundFromId = function(round_id){
	return collection.rounds.get(round_id)
}

//export all collections to JSON
collection.exportAll = function(){
	//create col object containing all the tournament data.
	//can't just export collection because it has some helper functions in it.
	var col = {};
	col.divisions = collection.divisions;
	col.teams = collection.teams;
	col.schools = collection.schools;
	col.judges = collection.judges;
	col.rooms = collection.rooms;
	col.rounds = collection.rounds;
	var temp = Backbone.Model.prototype.toJSON;

	//TERRIBLE hack to export less data
	Backbone.Model.prototype.toJSON = Backbone.toJSONReferences;
	var export_string = JSON.stringify(col);
	Backbone.Model.prototype.toJSON = temp;

	var uri = 'data:text/plain;charset="UTF-8",' + encodeURIComponent(export_string);
	window.open(uri, "tournament.json");

};

//used to import native JSON format
collection.importNative = function(json){

	//delete all existing data
	collection.emptyCollections();
	localStorage.clear();
	
	var collections = json;
	//col is plain javascript object containing arrays.
	
	//create models and push to collections.
	delete collections[0]._id;
	delete collections[0].tourney_id;
	console.log(collections[0]);
	$.each(collections[0], function(index, col){
		console.log("importing " + index);
		
		for(var i = 0; i < col.length; i++){
			//create model
			var m = new Backbone.Model(col[i]);
			//push into appropriate collection;
			collection[index].add(m, {silent: true});
			//m.save();
		}
	});

	collection.restoreReferences();
	


}



collection.emptyCollections = function(){
	collection.emptyCollection(collection.divisions);
	collection.emptyCollection(collection.teams);
	collection.emptyCollection(collection.rounds);
	collection.emptyCollection(collection.judges);
	collection.emptyCollection(collection.rooms);
	collection.emptyCollection(collection.schools);
	localStorage.clear();
}

//destroy all models in a collection silently
collection.emptyCollection = function(collection){
	var ids = []
	collection.each(function(model){
		ids.push(model.id);
	});

	$.each(ids, function(i, model_id){
		collection.get(model_id).destroy({silent: true});
	});
}
collection.teamsInDivision = function(division){
	var teamcount = 0;
	for(var i = 0; i < collection.teams.length; i++){
		if(collection.teams.at(i).get("division") === division){
			teamcount++;	
		}
	}
	return teamcount;
}

//generates and sets team code from for given @team model
collection.generateTeamCode = function(team){
	var competitors = team.get("competitors");
	var school = team.get("school");
	if(school === undefined){
		throw "Cannot create team code for a team with no school.";
	}
	var school_name = school.get("school_name").substring(0,16);
	var team_code = school_name;
	//case 1: 1 competitor. Use initials like
	//Nick Carneiro => Round Rock NC
	if(competitors.length === 1){
		var whole_name = competitors[0].name;
		var names = whole_name.split(" ");
		if(names.length >= 2){
			
			team_code += " " + names[0].substr(0,1) + names[1].substr(0,1);
		}
	} else if(competitors.length >=2){		
		var whole_name = competitors[1].name	//TODO: fix indexing, should work for
		var names = whole_name.split(" ");				//any number of competitors
		var last_name = names[names.length-1];

		var whole_name_2 = competitors[0].name;
		var names_2 = whole_name_2.split(" ");
		var last_name_2 = names_2[names_2.length-1];

		team_code += " " + last_name.substr(0,1).toUpperCase() 
			+ last_name_2.substr(0,1).toUpperCase();
		
	} else {
	
		//can't generate team code
		team_code = school_name + " XX";

	}

	team.set({team_code: team_code});
}

//delete all references to a division and then delete the division itself
collection.deleteDivision = function(division){

	//delete associated rooms
	collection.rooms.each(function(room){
		if(room.get("division") === division){
			room.destroy();
		}
	});
	//delete judge references to division
	$.each(collection.judges, function(i){
		var judge = collection.judges.at(i);
		var divs = judge.get("divisions");
		//console.log(divs);
		var new_divs = [];
		$.each(divs, function(j, div){

			if(division != div){
				//console.log("saving division:" + div.get("division_name"));
				new_divs.push(div);
			}
		});

		judge.set({divisions: new_divs});
		judge.save();
	})
	//delete all teams in division
	var team_count = 0;
	var to_delete = [];
	collection.teams.each(function(team){
		if(team.get("division") === division){
			team_count++;
			to_delete.push(team);
		}
	});
	var delete_count = 0;
	$.each(to_delete, function(i, team){
		team.destroy();
		delete_count++;
	})

	console.log("team count: " + team_count + " delete count: " + delete_count);

	//and finally, delete the division model itself
	division.destroy();
}

collection.deleteModel = function(model){
	
}

//deletes EVERYTHING and replaces with joy import

//we don't call .save() because it turns models stored in arrays into dereferenced objects
collection.importJoyFile = function(joy_file){
	var joy = joy_file.split("\n");
	if(joy[0] != "Divisions"){
		throw new Exception("Not a valid Joy of Tournaments JOT_Debate.txt file.");
	}
	//map joy id divisions to our division models
	var divisions = {}; 
	var schools = {};
	
	collection.emptyCollections();

	var section = "";
	$.each(joy, function(i, line){

		//keep track of what section we're in
		if(line === "Divisions"){
			section = "Divisions";
			return true;
		} else if(line === "Schools"){
			section = "Schools";
			return true;
		} else if(line === "Teams"){
			section = "Teams";
			return true;
		} else if(line === "Judges"){
			section = "Judges";
			return true;
		}

		if(section === "Divisions"){
			var joy_division = collection.parseDivisionLine(line);
			//console.dbg(joy_division);
			var division = new model.Division();
			division.set({division_name: joy_division.name});
			collection.divisions.add(division);
			//division.save();
			divisions[joy_division.number] = division;
		} else if(section === "Schools"){
			var joy_school = collection.parseSchoolLine(line);
			//remove "high school" from school name
			joy_school.name = joy_school.name.replace(/high school/gi, "").trim();
			var school = new model.School();
			school.set({school_name: joy_school.name});
			collection.schools.add(school);
			//school.save();
			schools[joy_school.number] = school;
		} else if(section === "Teams"){
			var joy_team = collection.parseTeamLine(line);
			var team = new model.Team();
			team.set({division: divisions[joy_team.division_number], school: schools[joy_team.school_number]});
			
			var competitors = [];
			$.each(joy_team.names, function(i, name){
				competitors.push({name: name});
			});
			team.set({competitors: competitors});
			//generate team code
			collection.generateTeamCode(team);
			collection.teams.add(team);
			//team.save();
		} else if(section === "Judges"){
			var joy_judge = collection.parseJudgeLine(line);
			var judge = new model.Judge();
			var judge_divisions = [];

			//convert division numbers to actual division model references

			$.each(joy_judge.division_numbers, function(i, div_num){
				
				judge_divisions.push(divisions[div_num]);
			});
			
			judge.set({name: joy_judge.name});
			judge.set({divisions: judge_divisions});
		
			judge.set({school: schools[joy_judge.school_number]});
			collection.judges.add(judge);
			
			//judge.save();
		}


	});

	//TODO: 
	//check competitors per team for each division
	//check if any teams have duplicate team codes in same division

	$("#import_box").val("");
	console.dbg("Imported JOT tournament data.");
	console.dbg("Divisions: " + collection.divisions.length);
	console.dbg("Schools: " + collection.schools.length);
	console.dbg("Teams: " + collection.teams.length);
	console.dbg("Judges: " + collection.judges.length);

}

//parses a line like this:
// "%1009   ;Klepper, Mark; #21161 ;$1;$2;$5;*ALL,*Y;+PF only; Days: Fri"
collection.parseJudgeLine = function(line){
	joy_judge = {division_numbers: [], school_number: "", name: ""};
	var before_star = line.split("*")[0];
	var divisions = before_star.match(/\$./g);
	$.each(divisions, function(i, div){
		var div_number = div.substr(1,1);
		joy_judge.division_numbers.push(div_number);
	});
	var cols = before_star.split(";");
	$.each(cols, function(i, col){
		l = col.trim();
		
		if(collection.isAlpha(l.charAt(0))){
			joy_judge.name = l;
		} else if(l.charAt(0) === "#"){
			joy_judge.school_number = l.substring(1).trim();
		}
	});
	return joy_judge;
		
};

collection.parseTeamLine = function(line){
	joy_team = {division_number: "", names: [], school_number: ""};
	joy_team.division_number = line.substring(1,2);
	var team_arr = line.split(";");
	$.each(team_arr, function(i, value){
		l = value.trim();
		if(l.charAt(0) === "$"){
			//skip the first chunk
			
		} else if(collection.isAlpha(l.charAt(0))){
			//got a competitor's name
			joy_team.names.push(l);
		} else if(l.charAt(0) === "#"){
			//got school number
			joy_team.school_number = l.substring(1);
		} else {
			throw new Excpetion("Unrecognized character in Team line.");
		}
	});

	return joy_team;
}

//gets number and name from a string like: "$$2VLD" 
collection.parseDivisionLine = function(line){
	var joy_division = {};

	//get the number
	var number = "";
	for(var i = 0; i < line.length; i++){
		if(number.length > 1){
			//set artificial ceiling of 9 divisions for now.
			break;
		}
		if(collection.isNumeric(line.charAt(i))){
			number += line.charAt(i);
		}
	}
	joy_division.number = number;
	//get the name
	var name = "";
	for(var i = line.length - 1; i >= 0; i--){
		if(collection.isNumeric(line.charAt(i))){
			break;
		} else {
			name = line.charAt(i) + name;
		}
		
	}

	joy_division.name = name;
	return joy_division;
};

collection.parseSchoolLine = function(line){
	if(line.charAt(0) != "#"){
		throw new Exception("Invalid school line in joy file.");
	}
	var joy_school = {};
	var section = "numbers";
	var number = "";
	var name = "";
	for(var i = 1; i < line.length; i++){
		if(section === "numbers"){
			if(collection.isNumeric(line.charAt(i))){
				number += line.charAt(i);
			} else {
				section = "space";
			}
		} else if(section === "space") {
			if(line.charAt(i) != " "){
				section = "name"
				name+= line.charAt(i);
			}
		} else {
			name += line.charAt(i);
		}
	}

	joy_school.number = number;
	joy_school.name = name;
	return joy_school;
}

//returns true if char is a string of 0-9
collection.isNumeric = function(char){
	if(char.charCodeAt(0) >= 48 && char.charCodeAt(0) <= 57){
		return true;
	} else {
		return false;
	}
}

collection.isAlpha = function(char){
	var lower = char.toLowerCase();
	if(lower.charCodeAt(0) >= 97 && lower.charCodeAt(0) <= 122){
		return true;
	} else {
		return false;
	}
}

//comparator function for sorting teams
collection.sortTeams = function(team1, team2){

	//see uil constitution
	//http://www.uiltexas.org/files/academics/manuals/sm_manual12_cx.pdf
	//wins, total speaks, adjusted speaks, ranks, opposition win/loss

	//check wins
	if(team1.get("wins") > team2.get("wins")){
		return -1;
	} else if(team2.get("wins") > team1.get("wins")){
		return 1
	} else {
		//wins were the same. check total speaks
		if(team1.get("total_speaks") > team2.get("total_speaks")){
			return -1;
		} else if(team2.get("total_speaks") > team1.get("total_speaks")){
			return 1
		} else {
			//total speaks were the same. check adjusted speaks
			if(team1.get("adjusted_speaks") > team2.get("adjusted_speaks")){
				return -1;
			} else if(team2.get("adjusted_speaks") > team1.get("adjusted_speaks")){
				return 1;
			} else {
				return 0;
				tab.warnings.push("Two teams were tied on wins, speaks, and adjusted speaks.");
			}
		}
	}
}

collection.sortSpeakers = function(speaker1, speaker2){
	if(speaker1.adjusted_points > speaker2.adjusted_points){
		return -1;
	} else if(speaker2.adjusted_points > speaker1.adjusted_points){
		return 1
	} else {
		if(speaker1.total_points > speaker2.total_points){
			return -1;
		} else if(speaker2.total_points > speaker1.total_points){
			return 1
		} else {
			return 0;
		}
	}
}



