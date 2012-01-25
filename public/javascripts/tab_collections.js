
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
		if(!this.id == undefined){
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
	comparator : function(team){
		return team.get("wins") * -1;
	} ,
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
				
				if(attr.id != undefined){
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


