
/*
=========================================
Define Backbone Models
=========================================
*/	

model.Tournament = Backbone.Model.extend({
	default: {
		tournament_name: "Debate Tournament"
	},
	initialize: function() {
		if(this.id === undefined){
			this.set({
				id: (new ObjectId()).toString()
			});
		}	
	}
});

model.Competitor = Backbone.Model.extend({
	default: {
		name: "",
		total_speaks: 0,
		adjusted_speaks: 0,
		total_ranks: 0
	}
});

model.Team = Backbone.Model.extend({
	default: {
		id			: null ,
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
				competitors: new collection.Competitors() ,
				id: (new ObjectId()).toString()
			});
		}
		
	} 
});

model.School = Backbone.Model.extend({
	default: {
		id: null,
		school_name: "DEFAULT_SCHOOL_NAME",
		division: null

	} ,
	initialize: function() {
		if(this.id === undefined){
			this.set({
				id: (new ObjectId()).toString()
			});
		}
	}
});

model.Room = Backbone.Model.extend({
	default: {
		id: null,
		school_name: "DEFAULT_ROOM_NAME",
		division: null,
		name: null

	} ,
	initialize: function() {
		if(this.id === undefined){
			this.set({
				id: (new ObjectId()).toString()
			});
		}
	}
});

model.Judge = Backbone.Model.extend({
	default: {
		id			: null,
		name		: null,
		school		: null
	} ,
	initialize: function() {
		if(this.id === undefined){
			this.set({
				id: (new ObjectId()).toString()
			});
		}	
	}
    
});



model.Round = Backbone.Model.extend({
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
			id: (new ObjectId()).toString()
			});
		}	
	},

	//returns winning team, false if no winner
	getWinner: function(){
		//if round is a bye, the real team is the winner.
		if(this.get("team1") === undefined){
			return this.get("team2");
		} else if(this.get("team2") === undefined){
			return this.get("team1");
		} else if(this.get("result") === undefined){
			return false;
		} else if(this.get("result") == 0 || this.get("result") == 1){
			return this.get("aff") == 0 ? this.get("team1") : this.get("team2");
		} else if(this.get("result") == 2 || this.get("result") == 3){
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
				id: new ObjectId().toString()
			});
		}
	}
});

/*
=========================================
Define Backbone Collections
=========================================
*/	

collection.Competitors = Backbone.Collection.extend({
		model: model.Competitor
});



collection.Teams = Backbone.Collection.extend({
	model: model.Team ,

	search : function(letters){
		if(letters == "") return this;

		var pattern = new RegExp(letters,"gi");
		return _(this.filter(function(data) {
		  	return pattern.test(data.get("team_code"));
		}));
	} ,
	//keep sorted in descending order of wins
	//overwrite this to change method of ranking for TFA vs UIL vs NFL or other league rules
	
	/*
	comparator : function(team){

		return team.get("wins") * -1;
	} ,
	*/
	
	
	comparator: function(team){
		return team.get("team_code");
	},
	


	localStorage: new Store("Teams")
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
		localStorage: new Store("Judges")
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
	localStorage: new Store("Schools")
});	

collection.Rooms = Backbone.Collection.extend({
	model: model.Room ,
	search : function(letters){
		if(letters == "") return this;

		var pattern = new RegExp(letters,"gi");
		return _(this.filter(function(data) {
		  	return pattern.test(data.get("name"));
		}));
	} ,
	localStorage: new Store("Rooms")
});	

collection.Divisions = Backbone.Collection.extend({
		model: model.Division ,
		localStorage: new Store("Divisions")
});	

collection.Rounds = Backbone.Collection.extend({
		model: model.Round ,
		localStorage: new Store("Rounds"),
		filterRounds: function(round_number, division){
			return _(this.filter(function(data){
				
				if(data.get("division") === division && data.get("round_number") == round_number){
					
					return true;
				} else {
					return false;
				}
			}));
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
				//console.log(attr);
				if(attr != null && attr.id != undefined){
					var model = collection.getModelFromId(attr.id);
					//if we found a model for the id, replace the object copy with the model reference
					if(model != undefined && typeof model.attributes === "object"){
						var setmodel = {};
						setmodel[attr_name] = model;
						elem.setByName(attr_name, model);
						console.dbg("creating reference from " + col_name + " to " + attr_name);
					}
				} else if(attr instanceof Array){ //if we have an array
					//restore references for each thing in array
					for(var i = 0; i < attr.length; i++){
						if(attr[i].id != undefined){

							var model = collection.getModelFromId(attr[i].id);
							//if we found a model for the id, replace the object copy with the model reference
							if(model != undefined && typeof model.attributes === "object"){
								attr[i] = model;
								console.dbg("creating reference from " + col_name + " array to " + attr_name);
							}
						}
					}
				}
			})

		});

	});
	} catch(e){
		console.log(e.message + " " + e.stack);
	}

	//convert results, round numbers, sides back to integers. 
	//stop scheduling to boolean
	//convert speaker points back to floats
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
		col.forEach(function(elem, index){
			if(elem.id === model_id){
				//found a matching model
				matching_model = elem;
			}
		});

	});
	return matching_model;
}

collection.getDivisionFromId = function(division_id){
	for(var i = 0; i < collection.divisions.length; i++){
		if(division_id === collection.divisions.at(i).get("id")){
			return collection.divisions.at(i);
		}
	}
	return undefined;
};

collection.getSchoolFromId = function(school_id){
	for(var i = 0; i < collection.schools.length; i++){
		if(school_id === collection.schools.at(i).get("id")){
			return collection.schools.at(i);
		}
	}
	return undefined;
}


collection.getTeamFromId = function(team_id){
	for(var i = 0; i < collection.teams.length; i++){
		if(team_id === collection.teams.at(i).get("id")){
			return collection.teams.at(i);
		}
	}
	return undefined;
}

collection.getRoomFromId = function(room_id){
	for(var i = 0; i < collection.rooms.length; i++){
		if(room_id === collection.rooms.at(i).get("id")){
			return collection.rooms.at(i);
		}
	}
	return undefined;
}

collection.getJudgeFromId = function(judge_id){
	for(var i = 0; i < collection.judges.length; i++){
		if(judge_id === collection.judges.at(i).get("id")){
			return collection.judges.at(i);
		}
	}
	return undefined;
}

collection.getRoundFromId = function(round_id){
	for(var i = 0; i < collection.rounds.length; i++){
		if(round_id === collection.rounds.at(i).get("id")){
			return collection.rounds.at(i);
		}
	}
	return undefined;
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
	var export_string = JSON.stringify(col);

	var uri = 'data:text/plain;charset="UTF-8",' + encodeURIComponent(export_string);
	window.open(uri, "tournament.json");

};

//used to import native JSON format
collection.import = function(json){
	//delete all existing data
	collection.emptyCollections();
	localStorage.clear();

	var collections = JSON.parse(json);
	//col is plain javascript object containing arrays.

	//create models and push to collections.
	$.each(collections, function(index, col){
		console.log("importing " + index);
		for(var i = 0; i < col.length; i++){
			//create model
			var m = new Backbone.Model(col[i]);
			//push into appropriate collection;
			collection[index].add(m);
			m.save();
		}
	});
	

	//save all to localstorage

}



collection.emptyCollections = function(){
	collection.divisions.reset();
	collection.teams.reset();
	collection.schools.reset();
	collection.judges.reset();
	collection.rooms.reset();
	collection.rounds.reset();
	localStorage.clear();
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
	console.log(collection.teams.length);
	collection.teams.each(function(team){

		if(team.get("division") === division){
			team.destroy();
		}
	});

	//and finally, delete the division model itself
	division.destroy();
}

//deletes EVERYTHING and replaces with joy import
collection.importJoyFile = function(joy_file){
	try {
		var joy = joy_file.split("\n");
		if(joy[0] != "Divisions"){
			return "Not a valid Joy of Tournaments JOT_Debate.txt file.";
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
				division.save();
				divisions[joy_division.number] = division;
			} else if(section === "Schools"){
				var joy_school = collection.parseSchoolLine(line);
				//remove "high school" from school name
				joy_school.name = joy_school.name.replace(/high school/gi, "").trim();
				var school = new model.School();
				school.set({school_name: joy_school.name});
				collection.schools.add(school);
				school.save();
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
				team.save();
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
				judge.save();
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
	} catch (e){
		console.log("Failed to import JOT tournament data.")
		console.log(e.stack);
	}
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
			throw "Unrecognized character in Team line.";
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
		throw "Invalid school line in joy file.";
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


collection.sortTeams = function(team1, team2){

	//see uil constitution
	//http://www.uiltexas.org/files/academics/manuals/sm_manual12_cx.pdf
	//wins, total speaks, adjusted speaks, ranks, opposition win/loss
	var sort_string = team.get("wins").toString() + team.get("total_speaks").toString() + team.get("adjusted_speaks");

	//check wins
	if(team1.get("wins") > team2.get("wins")){
		return 1;
	} else if(team2.get("wins") > team1.get("wins")){
		return -1
	} else {
		//wins were the same. check total speaks
		if(team1.get("total_speaks") > team2.get("total_speaks")){
			return 1;
		} else if(team2.get("total_speaks") > teams1.get("total_speaks")){
			return -1
		} else {
			//total speaks were the same. check adjusted speaks
			if(team1.get("adjusted_speaks") > team2.get("adjusted_speaks")){
				return 1;
			} else if(team2.get("adjusted_speaks") > team1.get("adjusted_speaks")){
				return -1;
			} else {
				return 0;
				tab.warnings.push("Two teams were tied on wins, speaks, and adjusted speaks.");
			}
		}
	}
}

/*
=========================================
Initialize Backbone Collections
=========================================
*/	
collection.divisions = new collection.Divisions();
collection.teams = new collection.Teams();
collection.schools = new collection.Schools();
collection.judges = new collection.Judges();
collection.rooms = new collection.Rooms();
collection.rounds = new collection.Rounds();



model.tournament = new model.Tournament();
model.tournament.set({tournament_name: localStorage.getItem("tournament_name") || "Debate Tournament"});


