view.TeamForm = Backbone.View.extend({
	el: $("#team_form") ,
	events: { 
		"change #newteam_division": "showCompetitors",
		"focus #newteam_name": "generateTeamName",
		"keyup #newteam_name":		"keyupTeamName"
	},  
	initialize: function(){
		_.bindAll(this, "render", "addDivSelect");
		

		//keep division and schools dropdown boxes up to date
		collection.divisions.bind("add", this.addDivSelect);
		collection.schools.bind("add", this.addSchoolSelect);
	} ,

	render: function(model){
		//populate form
		_(collection.divisions.models).each(function(division){ // pre-existing divisions
	    	this.addDivSelect(division);
		}, this);
		_(collection.schools.models).each(function(school){ // pre-existing schools
	    	this.addSchoolSelect(school);
		}, this);


		if(model != undefined){
			this.model = model;
		
			$("#newteam_id").val(this.model.get("id"));
			$("#newteam_division").val(this.model.get("division").get("id"));
			$("#newteam_school").val(this.model.get("school").get("id")); 	
			$("#newteam_name").val(this.model.get("team_code"));
			$("#newteam_stop_scheduling").prop("checked", this.model.get("stop_scheduling"));
			$("#newteam_competitors").html('');
			//TODO populate competitor names and phone numbers here
			var competitors = this.model.get("competitors");
			for(var i = 0; i < competitors.length; i++){
				$("#newteam_competitors").append('Name: <input class="newteam_competitor" type="text" value="' + competitors[i].name + '"/> <br />');
				var phone_number = competitors[i].phone_number || "";
				$("#newteam_competitors").append('Phone: <input class="competitor_phone" type="text" value="' + phone_number + '"/> <br /> <br />');
			}

		}
		$("#team_form").dialog({
			buttons: {
				"Save": function(){
					view.teamForm.addTeam();
					view.teamForm.clearEditForm();
					collection.teams.sort();
				} ,
				"Close": function(){
					$(this).dialog("close");

				}
			}
		});
		
	
	} ,
	//called when a competitor name box is modified.
	//generate a team name if every competitor name has been entered.
	generateTeamName: function(){
		var competitors =  $("#newteam_competitors > .newteam_competitor");

		//count number of filled in competitor names to see if they are all complete
		var i = 0;
		$("#newteam_competitors > .newteam_competitor").each(function(index, comp_name){
			if($(comp_name).val().length > 0){
				i++;
			}
		});
		if(i === competitors.length){
			//generate team name and place in box
			var team_code = $("#newteam_school option:selected").text().trim();

			//case 1: 1 competitor. Use initials like
			//Nick Carneiro => Round Rock NC
			if(competitors.length === 1){
				var whole_name = $(competitors.get(0)).val();
				var names = whole_name.split(" ");
				if(names.length >= 2){
					
					team_code += " " + names[0].substr(0,1) + names[1].substr(0,1);
				}
			} else if(competitors.length >=2){		
				var whole_name = $(competitors.get(1)).val();	//TODO: fix indexing, should work for
				var names = whole_name.split(" ");				//any number of competitors
				var last_name = names[names.length-1];

				var whole_name_2 = $(competitors.get(0)).val();
				var names_2 = whole_name_2.split(" ");
				var last_name_2 = names_2[names_2.length-1];

				team_code += " " + last_name.substr(0,1).toUpperCase() 
					+ last_name_2.substr(0,1).toUpperCase();
				
			} else {
			
				//can't generate team code
			}

			$("#newteam_name").val(team_code);
			
		} else {
		console.log("failed");
			return;
		}

	} ,
	//show correct number of competitor name inputs depending on competitors
	//per team in selected division
	showCompetitors: function(){
		$("#newteam_competitors").html("");
		var division_id = $("#newteam_division").val();
		var comp_per_team = null;
		collection.divisions.each( 
			function(division){

				if(division.get("id") == division_id){

					comp_per_team = division.get("comp_per_team");
				}
			}
		); 
		if(comp_per_team === null){
				comp_per_team = 1;
		}
		
		for(var i = 0; i < comp_per_team; i++){

			$("#newteam_competitors").append('Name: <input class="newteam_competitor" type="text" /> <br />');
			$("#newteam_competitors").append('Phone: <input class="competitor_phone" type="text" /> <br /> <br />');

		}
	} ,

	clearEditForm: function(){
		$("#newteam_id").val("");
		//$("#newteam_division").val("");
		//$("#newteam_school").val("");
		$("#newteam_competitors").find("input").val("");
		$("#newteam_name").val("");
	} ,
	
	keyupTeamName: function(event){
		if(event.which === 13){
			this.addTeam();
		}
	} ,

	//add new division to dropdown box
	addDivSelect: function(division){
		var divOptionView = new view.DivisionOption({
			model: division
		});
		$("#newteam_division", this.el).append(divOptionView.render().el);
		this.showCompetitors();
	} ,
	//add new school to dropdown box
	addSchoolSelect: function(school){
		var schoolOptionView = new view.SchoolOption({
			model: school
		});
		$("#newteam_school", this.el).append(schoolOptionView.render().el);
	} ,
	addTeam: function(){
		//validate team code
		var id = $("#newteam_id").val();
		var team_code = $("#newteam_name").val();
		var school_id = $("#newteam_school").val();
		var team = new model.Team();
		var division_id = $("#newteam_division").val();
		var division = collection.getDivisionFromId(division_id);
		var school = collection.getSchoolFromId(school_id);
		var competitors = [];
		var stop_scheduling = $("#newteam_stop_scheduling").prop("checked");

		//populate competitors based on form entries
		var i = 0;
		$("#newteam_competitors").children().each(function(){
				if(($(this).hasClass("newteam_competitor")) == true)
				{
					competitors.push({name: $(this).val(), phone_number: ""});
					i++;
					$(this).val("");
				}
				else if($(this).hasClass("competitor_phone")) {
					//it's a phone number box
					competitors[i-1].phone_number = $(this).val();
					$(this).val("");

				}
				
			
		});
	
		
	if(id.length > 0){
		
		var team = collection.getTeamFromId(id);
			team.set({
				team_code: team_code,
				school: school,
				competitors: competitors,
				division: division,
				stop_scheduling: stop_scheduling
			});
		
		}
		else{
		
		var team = new model.Team();
			team.set({
				id: (new ObjectId).toString(),
				team_code: team_code,
				school: school,
				competitors: competitors,
				division: division,
				stop_scheduling: stop_scheduling
		});
		collection.teams.add(team);
		}
		
		team.save();
		
	}
});


view.JudgeForm = Backbone.View.extend({
	el: $("#judge_form") ,
	events: { 
		"keyup #new_judge_name": "keyupJudgeName"
	},  
	initialize: function(){
		_.bindAll(this, "render", "addSchoolSelect");
		collection.divisions.bind("reset", this.render);
		collection.schools.bind("reset", this.render);

		$("#newjudge_school", this.el).append('<option value="no_affiliation">No Affiliation</option>');
		collection.divisions.each(function(division){ // pre-existing schools
	    	this.addDivisionCheckbox(division);
		}, this);

		collection.schools.each(function(school){ // pre-existing schools
        	this.addSchoolSelect(school);
    	}, this);
	} ,

	render: function(model){
		this.clearEditForm();
		if(model != undefined){
			this.model = model;
			$("#newjudge_id").val(this.model.get("id"));
			$("#new_judge_name").val(this.model.get("name"));
			$("#newjudge_school").val(this.model.get("school") === undefined ? "no_affiliation" : this.model.get("school").get("id")); 	
			
			var div = this.model.get("divisions");
			
			$("#newjudge_divisions").children().each(function(i, li){
				if($(li).attr != undefined){
					//console.log($(li).find("input").attr("checked"));
					
					for(var i = 0; i < div.length; i++)
					
					if($(li).data("division_id") === div[i].id){
					
						$(li).find("input").attr("checked", true);
					}
					
				}
			});

			$("#newjudge_stop_scheduling").prop("checked", this.model.get("stop_scheduling"));
		}
		
		
		$("#judge_form").dialog({
			buttons: {
				"Save": function(){
					view.judgeForm.addJudge();
				} ,
				"Close": function(){
					view.judgeForm.clearEditForm();
					$(this).dialog("close");
				}
			}
		});
	} ,

	//add new school to dropdown box
	addSchoolSelect: function(school){
		
			
		
		var schoolOptionView = new view.SchoolOption({
			model: school
		});
		$("#newjudge_school", this.el).append(schoolOptionView.render().el);
		
	} ,

	addDivisionCheckbox: function(division){
		var divisionCheckboxView = new view.DivisionCheckbox({
			model: division
		});	
		$("#newjudge_divisions", this.el).append(divisionCheckboxView.render().el);
	} ,

	keyupJudgeName: function(event){
		if(event.which === 13){
			this.addJudge();
		}
	} ,

	clearEditForm: function(){
		$("#newjudge_id").val("");
		$("#new_judge_name").val("");
		//$("#newjudge_school").val("");
		$("#newjudge_divisions").find("input").attr("checked", false);
		$("#newjudge_stop_scheduling").prop("checked", false);

	} ,
	
	addJudge: function(){
		//TODO: validate judge name
		var id = $("#newjudge_id").val();
		var judge_name = $("#new_judge_name").val();

		var judge = new model.Judge();
		var school_id = $("#newjudge_school").val();
		//may be undefined
		var school = collection.getSchoolFromId(school_id);
		var divisions = [];
		var stop_scheduling = $("#newjudge_stop_scheduling").prop("checked");

		$("#newjudge_divisions").children().each(function(i, li){
			if($(li).attr != undefined){
				//console.log($(li).find("input").attr("checked"));
			
				if($(li).find("input").attr("checked") === "checked"){

					var division_id = $(li).data("division_id");
					var div = collection.getDivisionFromId(division_id);
					divisions.push(div);
				}
			}
		});
		
		if(id.length > 0){
			var judge = collection.getJudgeFromId(id);
			judge.set({
			
			
			name: judge_name,
			school: school,
			divisions: divisions,
			stop_scheduling: stop_scheduling

			
		});
		}else{
		
		var judge = new model.Judge();
		judge.set({
			
			id: (new ObjectId).toString(),
			name: judge_name,
			school: school,
			divisions: divisions,
			stop_scheduling: stop_scheduling

			
		});
		collection.judges.add(judge);
		}
		
		judge.save();
		this.clearEditForm();
	} ,

});



view.RoomForm = Backbone.View.extend({
	el: $("#room_form") ,
	events: { 
		"keyup #newroom_name": "keyupRoom"
	},  
	initialize: function(){
		_.bindAll(this, "render");
		collection.divisions.bind("add", this.addDivSelect);
		collection.divisions.bind("reset", this.render);
	} ,

	render: function(model){
		
		if(model != undefined){	
			this.model = model;
			$("#newroom_id").val(this.model.get("id"));
			$("#newroom_name").val(this.model.get("name"));
			$("#newroom_division").val((this.model.get("division").get("id")));
			$("#newroom_stop_scheduling").prop("checked", this.model.get("stop_scheduling"));
		}
		$("#room_form").dialog({
			buttons: {
				"Save": function(){
					view.roomForm.addRoom();
				} ,
				"Close": function(){
					view.roomForm.clearEditForm();
					$(this).dialog("close");
				}
			}
		});

		_(collection.divisions.models).each(function(division){ // in case collection is not empty
	    	this.addDivSelect(division);
		}, this);
	} ,

	keyupRoom: function(event){
		if(event.which === 13){
			this.addRoom();
		}
		
	} ,
	clearEditForm: function(){
		$("#newroom_id").val("");
		$("#newroom_name").val("");
		//$("#newroom_division").val("");
		$("#newroom_stop_scheduling").prop("checked", false);

	} ,

	//add new division to dropdown box
	addDivSelect: function(division){
		var divOptionView = new view.DivisionOption({
			model: division
		});
		$("#newroom_division", this.el).append(divOptionView.render().el);
	} ,
	addRoom: function(){
		//TODO: validate room name
			//	
		var id = $("#newroom_id").val();
		var room_name = $("#newroom_name").val();
		var div_name_id = $("#newroom_division").val();
		var division = collection.getDivisionFromId(div_name_id);
		var stop_scheduling = $("#newroom_stop_scheduling").prop("checked");

		
		if(id.length > 0){
			
			var room = collection.getRoomFromId(id);
			room.set({
				
				name: room_name, 
				division: division,
				stop_scheduling: stop_scheduling

		});
		}else{
		
		var room = new model.Room();
		room.set({
			id: (new ObjectId).toString(),
			name: room_name, 
			division: division,
			stop_scheduling: stop_scheduling
			
		});
		collection.rooms.add(room);
		
		
		}
		room.save();
		this.clearEditForm();
		
	} ,

});

view.SchoolForm = Backbone.View.extend({
	el: $("#school_form") ,
	events: { 
		"keyup #newschool_name": "keyupSchoolName"
	},  
	initialize: function(){
		_.bindAll(this, "render");
		
	} ,

	render: function(model){
		
		if(model != undefined){	
			this.model = model;

			//populate form with existing values
			$("#newschool_id").val(this.model.get("id"));
			$("#newschool_name").val(this.model.get("school_name"));


		}

		$("#school_form").dialog({
			buttons: {
				"Save": function(){
					view.schoolForm.addSchool();
				} ,
				"Close": function(){
					view.schoolForm.clearEditForm();
					$(this).dialog("close");
				}
			}
		});

	
	} ,

	keyupSchoolName: function(event){
		if(event.which === 13){
			this.addSchool();
		}
	},

	clearEditForm: function(){
		$("#newschool_id").val("");
		$("#newschool_name").val("");
	} ,
	addSchool: function(){
		//TODO: validate school name
		var id = $("#newschool_id").val();
		var school_name = $("#newschool_name").val();
		
		if(id.length > 0)
		{
			
			var school = collection.getSchoolFromId(id);
			console.log(school);
			school.set({
			
				school_name: school_name
			
			});
		}
		else {

			var school = new model.School();
			school.set({
			
				id		   : (new ObjectId).toString(),
				school_name: school_name
			
			});
			collection.schools.add(school);
		}
		
		school.save();
		this.clearEditForm();
		
	} ,

});


view.DivisionForm = Backbone.View.extend({
	el: $("#division_form") ,
	events: { 
	},  
	initialize: function(){
		_.bindAll(this, "render");
		
	} ,

	render: function(model){

		if(model != undefined){
			this.model = model;
		
			//populate form with existing values
			$("#newdiv_id").val(this.model.get("id"));
			$("#newdiv_division_name").val(this.model.get("division_name"));
			$("#newdiv_comp_per_team").val(this.model.get("comp_per_team"));
			$("#newdiv_flighted_rounds").attr("checked", this.model.get("flighted_rounds"));
			$("#newdiv_combine_speaks").val(this.model.get("combine_speaks"));
			$("#newdiv_break_to").val(this.model.get("break_to"));
			$("#newdiv_prelims").val(this.model.get("prelims"));
			$("#newdiv_ballot_type").val(this.model.get("ballot_type"));
		}
		$("#division_form").dialog({
			buttons: {
				"Save": function(){
					view.divisionForm.addDivision();
					$(this).dialog("close");
				} ,
				"Cancel": function(){
					view.divisionForm.clearEditForm();
					$(this).dialog("close");
				}
			}
		});
	} ,

	clearEditForm: function(){
		$("#newdiv_id").val("");
		$("#newdiv_division_name").val("");
		$("#newdiv_comp_per_team").val("");
		$("#newdiv_flighted_rounds").attr("checked", false);
		$("#newdiv_combine_speaks").val(false);
		$("#newdiv_break_to").val("4");
		$("#newdiv_prelims").val("4");
		$("#newdiv_ballot_type").val("TFA_CX");
		$("#division_form").dialog("close");
	} ,
	addDivision: function(){
		//TODO: validate school name
	

		
		
		//TODO: verify all this input
		var division_name = $("#newdiv_division_name").val();
		var comp_per_team = $("#newdiv_comp_per_team").val();
		//TODO: verify that this boolean works
		var flighted_rounds = Boolean($("#newdiv_flighted_rounds").attr("checked"));
		var break_to = $("#newdiv_break_to").val();
		var max_speaks = 30;
		var prelims = $("#newdiv_prelims").val();
		var schedule = [];
		var ballot_type = $("#newdiv_ballot_type").val();
		var combine_speaks = Boolean($("#newdiv_combine_speaks").val());

		for(var i = 0; i < prelims; i++){
			var num = i + 1;
			schedule.push({round_number: num, type: "prelim", matching: "power"});
		}
		var elims = [
			{name:	"triple octafinals", debates: 32}, 
			{name: "double octafinals", debates: 16},
			{name: "octafinals", debates: 8},
			{name: "quarterfinals", debates: 4},
			{name:  "semifinals", debates: 2},
			{name: "finals", debates: 1}
		];


		for(var i = 0; i < elims.length; i++){
			if(break_to >= elims[i].debates){
				schedule.push({round_number:elims[i].name, type: "elim"});
			}
		}



		//check if we are modifying an existing division or created a new one
		var id = $("#newdiv_id").val();
		console.log(id);
		if(id.length > 0){
			console.log("updating existing model");
			//update existing model
			var division = collection.getDivisionFromId(id);
			division.set({
			division_name	: division_name,
			comp_per_team	: comp_per_team,
			flighted_rounds	: flighted_rounds,
			break_to		: break_to,
			max_speaks		: max_speaks,
			prelims			: prelims,
			schedule		: schedule,
			ballot_type		: ballot_type

		});
		} else {
			console.log("creating new model");
			var division = new model.Division();
			division.set({
			id				: (new ObjectId).toString(),
			division_name	: division_name,
			comp_per_team	: comp_per_team,
			flighted_rounds	: flighted_rounds,
			break_to		: break_to,
			max_speaks		: max_speaks,
			prelims			: prelims,
			schedule		: schedule,
			ballot_type		: ballot_type,
			combine_speaks	: combine_speaks

		});
			collection.divisions.add(division);
		}
		
		division.save();
		this.clearEditForm();


	}
});

