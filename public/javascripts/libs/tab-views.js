
/*
=========================================
Define Backbone Views
=========================================
*/


//An individual division option 
//managed by view.TeamTable
//also used in roundsTable filter
view.DivisionOption = Backbone.View.extend({
	tagName: "option",
	initialize: function(){
		_.bindAll(this, "render", "unrender", "remove");
	    this.model.bind('remove', this.unrender);
		this.model.bind('change', this.render);

	} ,
	remove: function(division){
		this.model.destroy();
	} ,
	render: function(){
		//associate data element "id" with ObjectId in case we want to use this later
		$(this.el).data("id", this.model.get("id"));
		//set the value attr to the ObjectId
		//This will be read by jQuery to figure out which division was selected
		$(this.el).attr("value", this.model.get("id"));
		$(this.el).html(this.model.get("division_name"));
		return this; //required for chainable call, .render().el ( in appendTeam)
	} ,
	unrender: function(){
		$(this.el).remove();
	}
});



//An individual school option 
//managed by view.TeamTable
view.SchoolOption = Backbone.View.extend({
	tagName: "option",
	initialize: function(){
		_.bindAll(this, "render", "unrender", "remove");
	    this.model.bind('remove', this.unrender);
		this.model.bind('change', this.render);

	} ,
	remove: function(division){
		this.model.destroy();
	} ,
	render: function(){
		//associate data element "id" with ObjectId in case we want to use this later
		$(this.el).data("id", this.model.get("id"));
		//set the value attr to the ObjectId
		//This will be read by jQuery to figure out which division was selected
		$(this.el).attr("value", this.model.get("id"));
		$(this.el).html(this.model.get("school_name"));
		return this; //required for chainable call, .render().el ( in appendTeam)
	} ,
	unrender: function(){
		$(this.el).remove();
	}
});

view.TeamTable = Backbone.View.extend({
	el: $("#teams") , // attaches `this.el` to an existing element.
	events: {
		"click #add_team_button": "addTeam",
		"keyup #teams_search": "search",
		"change #newteam_division": "showCompetitors",
		"focus #newteam_name": "generateTeamName",
		"keyup #newteam_name":		"keyupTeamName",
		"click #toggle_team_form": "showNewForm"
	} ,
	initialize: function(){
		_.bindAll(this, "render", "addTeam", "appendTeam", 
			"renderSearch", "search", "addDivSelect");
		
		
		collection.teams.bind("add", this.appendTeam);
		collection.teams.bind("reset", this.render, this);

		//keep division and schools dropdown boxes up to date
		collection.divisions.bind("add", this.addDivSelect);
		collection.schools.bind("add", this.addSchoolSelect);

		//populate dropdowns with initial divisions and schools
		collection.divisions.bind("reset", this.render, this);
		collection.divisions.bind("reset", this.showCompetitors, this);
		collection.schools.bind("reset", this.render, this);
		
		this.render();
		
	} ,

	showNewForm: function(){
		//team controls
		$("#team_form_overlay").fadeToggle();

	} ,
	keyupTeamName: function(event){
		if(event.which === 13){
			this.addTeam();
		}
	} ,
	
	clearEditForm: function(){
		console.log("clearing teams form");
		$("#newteam_id").val("");
		$("#newteam_division").val("");
		$("#newteam_school").val("");
		$("#newteam_competitors").find("input").val("");
		$("#newteam_name").val("");
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
	clearView: function(){
		//clear table
		$("#teams_table").empty();
		$("#newteam_division").empty();
		$("#newteam_school").empty();
	} ,
	render: function(){
		//clear everything and re-render from collections
		this.clearView();
		//populate table
		_(collection.teams.models).each(function(team){ // for pre-existing teams
        	this.appendTeam(team);
    	}, this);

    	//populate form
    	_(collection.divisions.models).each(function(division){ // pre-existing divisions
        	this.addDivSelect(division);
    	}, this);
    	_(collection.schools.models).each(function(school){ // pre-existing schools
        	this.addSchoolSelect(school);
    	}, this);

	} ,

	renderSearch: function(results){
		$("#teams_table").html("");

		results.each(function(result){
			var teamView = new view.Team({
				model: result
			});
			$("#teams_table", this.el).append(teamView.render().el);
		});
		return this;
	} ,
	
	addTeam: function(){
		//validate team code
		var id = $("#newteam_id").val();
		var team_code = $("#newteam_name").val();
		var school_id = $("#newteam_school").val();
		var team = new model.Team();
		var division_id = $("#newteam_division").val();
		var division = pairing.getDivisionFromId(division_id);
		var school = pairing.getSchoolFromId(school_id);
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
	
		$(".edit_model_overlay").fadeOut();
		
	if(id.length > 0){
		
		var team = pairing.getTeamFromId(id);
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
		this.clearEditForm();
	} ,

	appendTeam: function(team){
		var teamView = new view.Team({
			model: team
		});
		$("#teams_table", this.el).append(teamView.render().el);
	} ,
	search: function(e){
		var letters = $("#teams_search").val();
		this.renderSearch(collection.teams.search(letters));
	}
	
});

view.Team = Backbone.View.extend({
	tagName: "tr" ,
	events: { 
      'click td.remove': 'remove',
	  'click td.name': 'showEditForm'
    },  

	initialize: function(){
		_.bindAll(this, "render", "unrender", "remove");
	    this.model.bind('remove', this.unrender);
		this.model.bind('change', this.render);

	} ,
	showEditForm: function(){
		//populate form with existing values
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
			$("#newteam_competitors").append('Phone: <input class="competitor_phone" type="text" value="' + competitors[i].phone_number + '"/> <br /> <br />');
		}


		$("#team_form_overlay").fadeIn();
	} ,

	remove: function(team){
		var team = this.model;
		$.confirm({
			'title'		: 'Delete Team',
			'message'	: 'You are about to delete a team <br />It cannot be restored at a later time! Continue?',
			'buttons'	: {
				'Yes'	: {
					'model': team,
					'class'	: 'blue',
					'action': function(model){
						model.destroy();
					}
				},
				'No'	: {
					'class'	: 'gray',
					'action': function(){}	
				}
			},
			
		});
	} ,
	render: function(){
		var wins = this.model.get("losses") || "0";
		var losses = this.model.get("wins") || "0";
		$(this.el).html('<td class="name">' + this.model.get("team_code") + 
			'</td> <td>'+this.model.get("division").get("division_name") +'</td><td>' + 
			wins + "-"+ losses + '</td><td class="remove"><button>Remove</button></td>');
		return this; //required for chainable call, .render().el ( in appendTeam)
	} ,
	unrender: function(){
		$(this.el).remove();
	}
});

view.DivisionCheckbox = Backbone.View.extend({
	tagName: "li" ,
	initialize: function(){
		_.bindAll(this, "render", "unrender", "remove");
	    this.model.bind('remove', this.unrender);
		this.model.bind('change', this.render);

	} ,
	remove: function(division){
		this.model.destroy();
	} ,
	render: function(){
		//associate data element "id" with ObjectId in case we want to use this later
		$(this.el).data("id", this.model.get("id"));
		//set the value attr to the ObjectId
		//This will be read by jQuery to figure out which division was selected
		$(this.el).attr("value", this.model.get("id"));
		$(this.el).data("division_id", this.model.get("id"));
		$(this.el).html('<input type="checkbox" /> ' + this.model.get("division_name"));
		return this; //required for chainable call, .render().el ( in appendTeam)
	} ,
	unrender: function(){
		$(this.el).remove();
	}
	
});
view.Judge = Backbone.View.extend({
	tagName: "tr" ,
	events: { 
      'click td.remove': 'remove',
	  'click td.name': 'showEditForm'
    },  

	initialize: function(){
		_.bindAll(this, "render", "unrender", "remove");
	    this.model.bind('remove', this.unrender);
		this.model.bind('change', this.render);

	} ,
	showEditForm: function(){
		//populate form with existing values
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
		$("#judge_form_overlay").fadeIn();
	} ,

	remove: function(judge){
		var judge = this.model;
		$.confirm({
			'title'		: 'Delete Judge',
			'message'	: 'You are about to delete a Judge <br />It cannot be restored at a later time! Continue?',
			'buttons'	: {
				'Yes'	: {
					'model': judge,
					'class'	: 'blue',
					'action': function(model){
						model.destroy();
					}
				},
				'No'	: {
					'class'	: 'gray',
					'action': function(){}	
				}
			},
			
		});
		
		
	} ,
	render: function(){
		var divisions = this.model.get("divisions");
		var div_string = "";
		for(var i = 0; i < divisions.length; i++){
			var div = "";
			if(divisions[i] != undefined){
				div = divisions[i].get("division_name");
			}
			
			div_string = div_string + div + " ";
		}
		var school = this.model.get("school") === undefined ? "None" : this.model.get("school").get("school_name");
		$(this.el).html('<td class="name">' + this.model.get("name") + '</td><td>'+ school +'</td><td>' + div_string + '</td><td class="remove"><button>Remove</button></td>');
		return this; //required for chainable call, .render().el ( in appendJudge)
	} ,
	unrender: function(){
		$(this.el).remove();
	}
});

		
		//$('.simpledialog').simpleDialog();


view.JudgeTable = Backbone.View.extend({
	el: $("#judges") , // attaches `this.el` to an existing element.
	events: {
		"click #add_judge_button": "addJudge" ,
		"keyup #judges_search": "search" ,
		"keyup #new_judge_name": "keyupJudgeName"
	} ,
	initialize: function(){
		_.bindAll(this, "render", "addJudge", "appendJudge", "addSchoolSelect");
		
		collection.judges.bind("add", this.appendJudge);
		collection.schools.bind("add", this.addSchoolSelect);
		collection.divisions.bind("add", this.addDivisionCheckbox);

		collection.judges.bind("reset", this.render, this);
		collection.schools.bind("reset", this.render, this);
		collection.divisions.bind("reset", this.render, this);

		collection.schools.each(function(school){ // pre-existing schools
        	this.addSchoolSelect(school);
    	}, this);

    	$("#newjudge_school", this.el).append('<option value="no_affiliation">No Affiliation</option>');
    	collection.divisions.each(function(division){ // pre-existing schools
        	this.addDivisionCheckbox(division);
    	}, this);
		this.render();
		
	} ,
	keyupJudgeName: function(event){
		if(event.which === 13){
			this.addJudge();
		}
	} ,
	render: function(){
		_(collection.judges.models).each(function(judge){ // in case collection is not empty
        	this.appendJudge(judge);
    	}, this);
	} ,
	clearEditForm: function(){
		console.log("clearing judge form");
		$("#newjudge_id").val("");
		$("#new_judge_name").val("");
		$("#newjudge_school").val("");
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
		var school = pairing.getSchoolFromId(school_id);
		var divisions = [];
		var stop_scheduling = $("#newjudge_stop_scheduling").prop("checked");

		$("#newjudge_divisions").children().each(function(i, li){
			if($(li).attr != undefined){
				//console.log($(li).find("input").attr("checked"));
			
				if($(li).find("input").attr("checked") === "checked"){

					var division_id = $(li).data("division_id");
					var div = pairing.getDivisionFromId(division_id);
					divisions.push(div);
				}
			}
		});
		
		$(".edit_model_overlay").fadeOut();
		if(id.length > 0){
			var judge = pairing.getJudgeFromId(id);
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

	appendJudge: function(judge){
		var judgeView = new view.Judge({
			model: judge
		});
		$("#judges_table", this.el).append(judgeView.render().el);
	} ,
	search: function(e){
		var letters = $("#judges_search").val();
		this.renderSearch(collection.judges.search(letters));
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
	renderSearch: function(results){
		$("#judges_table").html("");

		results.each(function(result){
			var judgeView = new view.Judge({
				model: result
			});
			$("#judges_table", this.el).append(judgeView.render().el);
		});
		return this;
	} 
	
});


view.Room = Backbone.View.extend({
	tagName: "tr" ,
	events: { 
      'click td.remove': 'remove',
	  'click td.name': 'showEditForm'
    },  

	initialize: function(){
		_.bindAll(this, "render", "unrender", "remove");
	    this.model.bind('remove', this.unrender);
		this.model.bind('change', this.render);

	} ,
	showEditForm: function(){
		//populate form with existing values
		$("#newroom_id").val(this.model.get("id"));
		$("#newroom_name").val(this.model.get("name"));
		$("#newroom_division").val((this.model.get("division").get("id")));
		$("#newroom_stop_scheduling").prop("checked", this.model.get("stop_scheduling"));
		$("#room_form_overlay").fadeIn();
	} ,

	remove: function(room){
		var room = this.model;
		$.confirm({
			'title'		: 'Delete Room',
			'message'	: 'You are about to delete a room <br />It cannot be restored at a later time! Continue?',
			'buttons'	: {
				'Yes'	: {
					'model': room,
					'class'	: 'blue',
					'action': function(model){
						model.destroy();
					}
				},
				'No'	: {
					'class'	: 'gray',
					'action': function(){}	
				}
			},
			
		});
	} ,
	render: function(){
		$(this.el).html('<td class="name">' + this.model.get("name") + '</td> <td>' +this.model.get("division").get("division_name") + '</td><td class="remove"><button>Remove</button></td>');
		return this; //required for chainable call, .render().el ( in appendRoom)			.get("division_name")
	} ,
	unrender: function(){
		$(this.el).remove();
	}
});

view.RoomTable = Backbone.View.extend({
	el: $("#rooms") , // attaches `this.el` to an existing element.
	events: {
		"click #add_room_button": "addRoom" ,
		"keyup #newroom_name": "keyupRoom" ,
		"keyup #rooms_search": "search"
	} ,

	keyupRoom: function(event){
		if(event.which === 13){
			this.addRoom();
		}
		
	} ,
	initialize: function(){
		_.bindAll(this, "render", "addRoom", "appendRoom");
		
		collection.rooms.bind("add", this.appendRoom);
		collection.rooms.bind("reset", this.render, this);
		collection.divisions.bind("add", this.addDivSelect);
		collection.divisions.bind("reset", this.render);
		this.render();
		
	} ,
	
	render: function(){
		$("#newroom_division").empty();
		$("#room_table").empty();
		_(collection.rooms.models).each(function(room){ // in case collection is not empty
        	this.appendRoom(room);
    	}, this);

    	_(collection.divisions.models).each(function(division){ // in case collection is not empty
        	this.addDivSelect(division);
    	}, this);
	} ,
	clearEditForm: function(){
		console.log("clearing rooms form");
		$("#newroom_id").val("");
		$("#newroom_name").val("");
		$("#newroom_division").val("");
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
		var division = pairing.getDivisionFromId(div_name_id);
		var stop_scheduling = $("#newroom_stop_scheduling").prop("checked");

		$(".edit_model_overlay").fadeOut();
		
		if(id.length > 0){
			
			var room = pairing.getRoomFromId(id);
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

	appendRoom: function(room){
		var roomView = new view.Room({
			model: room
		});
		$("#rooms_table", this.el).append(roomView.render().el);
	} ,
	search: function(e){
		var letters = $("#rooms_search").val();
		this.renderSearch(collection.rooms.search(letters));
	} ,
	renderSearch: function(results){
		$("#rooms_table").html("");

		results.each(function(result){
			var roomView = new view.Room({
				model: result
			});
			$("#rooms_table", this.el).append(roomView.render().el);
		});
		return this;
	} 
	
});

//An individual room option in the select on the Add New Room form.
//managed by view.RoomTable
view.RoomOption = Backbone.View.extend({
	tagName: "option",
	initialize: function(){
		_.bindAll(this, "render", "unrender", "remove");
	    this.model.bind('remove', this.unrender);
		this.model.bind('change', this.render);

	} ,
	remove: function(division){
		this.model.destroy();
	} ,
	render: function(){
		//associate data element "id" with ObjectId in case we want to use this later
		$(this.el).data("id", this.model.get("id"));
		//set the value attr to the ObjectId
		//This will be read by jQuery to figure out which division was selected
		$(this.el).attr("value", this.model.get("id"));
		$(this.el).html(this.model.get("school_name"));
		return this; //required for chainable call, .render().el ( in appendTeam)
	} ,
	unrender: function(){
		$(this.el).remove();
	}
});


view.DivisionStats = Backbone.View.extend ({
	tagName: "tr" ,
	events: { 
    },  

	initialize: function(){
		_.bindAll(this, "render", "unrender", "remove");
	    this.model.bind('remove', this.unrender);
		this.model.bind('change', this.render);

	} ,
	render: function(){
		var teams = pairing.teamsInDivision(this.model)
		teams = (teams != undefined) ?  teams : "-";

		var ded_judges = pairing.dedicatedJudges(this.model);
		ded_judges = (ded_judges != undefined) ?  ded_judges : "-";

		var total_judges = pairing.totalJudges(this.model);
		total_judges = (total_judges != undefined) ?  total_judges : "-";

		var reqd_judges = pairing.requiredJudges(this.model);
		reqd_judges = (reqd_judges != undefined) ?  pairing.requiredJudges(this.model) : "-";

		var rooms = pairing.totalRooms(this.model)
		rooms = (rooms != undefined) ?  rooms : "-";

		var reqd_rooms = pairing.requiredRooms(this.model);
		reqd_rooms = (reqd_rooms != undefined) ?  reqd_rooms : "-";

		$(this.el).html('<td>'+ this.model.get("division_name") + '</td><td>' + teams + '</td>'+
		'<td>' + ded_judges + '</td><td>' + total_judges + '</td><td>' + reqd_judges + '</td><td>' +rooms + '</td><td>' + 
		reqd_rooms + '</td>');
		return this; //required for chainable call, .render().el ( in appendRoom)			.get("division_name")
	} ,
	unrender: function(){
		$(this.el).remove();
	}
});

view.StatsArea = Backbone.View.extend({
	el: $("#settings_stats") , // attaches `this.el` to an existing element.
	events: {
		
	} ,



	initialize: function(){
		_.bindAll(this, "render");
		
		this.render();
	
	} ,
	
	render: function(){
		$("#stats_schools").text("Total schools: " + collection.schools.length);
		$("#settings_stats").empty();
		$(this.el).append("<tr><td>Name</td><td>Teams</td><td>Dedicated Judges</td><td>Total Judges</td><td>Required Judges</td><td>Rooms</td><td>Required Rooms</td></tr>");
    	collection.divisions.each(function(division){ // in case collection is not empty
        	this.addDivStat(division);
    	}, this);
	} ,

	//add new division to dropdown box
	addDivStat: function(division){
		var divStatView = new view.DivisionStats({
			model: division
		});
		$(this.el).append(divStatView.render().el);
	} ,

	
});
view.Round = Backbone.View.extend({
	tagName: "tr" ,
	events: { 
      'click td.remove': 'remove',
      'click td.roundrow': 'showEditForm'
    },  


	initialize: function(){
		_.bindAll(this, "render", "unrender", "remove");
	    this.model.bind('remove', this.unrender);
		this.model.bind('change', this.render);

	} ,
	remove: function(round){
		var round = this.model;
		$.confirm({
			'title'		: 'Delete Round',
			'message'	: 'You are about to delete a round <br />It cannot be restored at a later time! Continue?',
			'buttons'	: {
				'Yes'	: {
					'model': round,
					'class'	: 'blue',
					'action': function(model){
						model.destroy();
					}
				},
				'No'	: {
					'class'	: 'gray',
					'action': function(){}	
				}
			},
			
		});
	} ,
	render: function(){
		var team1 = this.model.get("team1");
		var team2 = this.model.get("team2");
		if(team1 != undefined){
			var team1_cd = team1.get("team_code");
		} else {
			team1_cd = "Error";
		}
		if(team2 != undefined){
			var team2_cd = team2.get("team_code");
		} else {
			team2_cd = "Error";
		}
		if(this.model.get("aff") === 0){
			var aff = team1_cd;
			var neg = team2_cd;
		} else {
			var aff = team2_cd;
			var neg = team1_cd;
		}

		var judge = "";
		var room = "";

		if(this.model.get("judge") != undefined){
			judge = this.model.get("judge").get("name");
		}
		if(this.model.get("room") != undefined){
			room = this.model.get("room").get("name");
		}
		var div_name = this.model.get("division").get("division_name");
		var num = this.model.get("round_number");
		$(this.el).html('<td class="roundrow">' + aff + '</td> <td class="roundrow">' + neg + '</td><td class="roundrow">'+judge+
			'</td><td class="roundrow">'+room+'</td><td class="roundrow">' + div_name + '</td><td class="remove"><button>Remove</button></td>');
		return this; //required for chainable call, .render().el
	} ,
	unrender: function(){
		$(this.el).remove();
	},
	
	//fills the rooms and judges selects on the edit round form
	populateRoomsAndJudges: function(){
		var div_id = $("#rounds_division_select").val();
		var division = pairing.getDivisionFromId(div_id);
		//empty out existing rooms and judges
		$("#editround_judge").html("");
		$("#editround_room").html("");
		for(var i = 0; i < collection.rooms.length; i++){
			//skip irrelevant rooms
			if(collection.rooms.at(i).get("division") != division){
				continue;
			}
			$("#editround_room").append('<option value="'+collection.rooms.at(i).get("id")+'">'
				+ collection.rooms.at(i).get("name") +'</option>');

		}

		for(var i = 0; i < collection.judges.length; i++){
			
			$("#editround_judge").append('<option value="'+collection.judges.at(i).get("id")+'">'
				+ collection.judges.at(i).get("name") +'</option>');

		}

	} ,
	populateTeamSelects: function(){
		//empty out existing teams
		$("#editround_team1_code").html("");
		$("#editround_team2_code").html("");

		var div_id = $("#rounds_division_select").val();
		var division = pairing.getDivisionFromId(div_id);
		var round_number = $("#rounds_round_number_select").val();
		for(var i = 0; i < collection.teams.length; i++){
			//skip irrelevant teams
			if(collection.teams.at(i).get("division") != division){
				continue;
			}

			$("#editround_team1_code").append('<option value="'+collection.teams.at(i).get("id")+'">'
				+ collection.teams.at(i).get("team_code") +'</option>');

			$("#editround_team2_code").append('<option value="'+collection.teams.at(i).get("id")+'">'
			+ collection.teams.at(i).get("team_code") +'</option>');
		}

		//add BYE teams to both
		$("#editround_team1_code").append('<option value="-1">BYE</option>');
		$("#editround_team2_code").append('<option value="-1">BYE</option>');

	} ,
	showEditForm: function(){
		//populate form with existing values
		//populate team 1 competitors
		$("#editround_id").val(this.model.get("id"));
		this.populateTeamSelects();
		this.populateRoomsAndJudges();
		view.roundTable.drawForm(this.model);
		
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
		
		$(".edit_model_overlay").css("height", $(document).height());
		$("#round_form_overlay").fadeIn();
	} ,
});


view.RoundTable = Backbone.View.extend({
	el: $("#rounds") , // attaches `this.el` to an existing element.
	events: {
		
		"keyup #rounds_search": "search",
		"click #pair_round_button" : "pairRound",
		"click #print_ballots_button" : "printBallots",
		
		"change #rounds_division_select" : "renderRoundNumberSelect",
		"change #rounds_round_number_select" : "filterDivisions",
		"click button#save_round_button": "editRound",
		"click #add_round_button": "addEmptyRound",
		"change #editround_team1_code": "changeTeam",
		"change #editround_team2_code": "changeTeam",
		"change #editround_judge": "changeJudge",
		"change #editround_room": "changeRoom",
		"click #editround_swap_sides": "swapSides",
		"click #print_pairings": "printPairingsPrompt",
		"click #print_pairings_confirm": "printPairings",
		"click #print_teams_button": "printTeams",
		"click #text_pairings_button": "textPairingsPrompt",
		"click #text_pairings_confirm": "textPairings"

	} ,
	initialize: function(){
		_.bindAll(this, "render", "addRound", "appendRound", "renderRoundNumberSelect");
		
		collection.rounds.bind("add", this.appendRound);
		collection.rounds.bind("reset", this.render, this);
		collection.rounds.bind("change", this.render, this);

		collection.divisions.bind("change", this.renderDivisionSelect, this);
		collection.divisions.bind("reset", this.renderDivisionSelect, this);
		collection.divisions.bind("add", this.renderDivisionSelect, this);
		this.render();
		
	} ,

	textPairingsPrompt: function(){
		$("#text_pairings_details").fadeIn();
	} ,
	textPairings: function(){
		$("#text_pairings_details").fadeOut();
		var div_id = $("#rounds_division_select").val();
		var div = pairing.getDivisionFromId(div_id);
		var round_number = $("#rounds_round_number_select").val();
		var start_time = $("#text_pairings_start").val();
		var data = [];
		for(var i =0; i < collection.rounds.length; i++) //collection.rounds.length
		{
			if(collection.rounds.at(i).get("round_number") != round_number || collection.rounds.at(i).get("division") != div){
					continue;
				}

				if(collection.rounds.at(i).get("team1").get("aff") == 0){
						var aff = collection.rounds.at(i).get("team1").get("team_code");
						var neg = collection.rounds.at(i).get("team2").get("team_code");
					} else {
						var neg = collection.rounds.at(i).get("team1").get("team_code");
						var aff = collection.rounds.at(i).get("team2").get("team_code");
				}

				var judge = (collection.rounds.at(i).get("judge") != undefined ? collection.rounds.at(i).get("judge").get("name") : "");
				var room = (collection.rounds.at(i).get("room") != undefined ? collection.rounds.at(i).get("room").get("name") : "");

				for(var j = 0; j < collection.rounds.at(i).get("team1").get("competitors").length; j++){
					
					var phone_number = collection.rounds.at(i).get("team1").get("competitors")[j].phone_number;
					//skip invalid numbers
					if(phone_number.length > 9 && phone_number.length < 12){

						data.push(
							{
								phone_number: phone_number, message: 
							
							'Aff: ' + aff + "\n" +
							'Neg: ' + neg + "\n" +
							'Judge: ' + judge + "\n" +
							'Room: ' + room + "\n" +
							'Start: ' + start_time
							}
						);
					}
				}

				for(var j = 0; j < collection.rounds.at(i).get("team2").get("competitors").length; j++){

					var phone_number = collection.rounds.at(i).get("team2").get("competitors")[j].phone_number;
					//skip invalid numbers
					if(phone_number.length > 9 && phone_number.length < 12){
						data.push(
							{
								phone_number: phone_number, message: 
							
							'Aff: ' + aff + "\n" +
							'Neg: ' + neg + "\n" +
							'Judge: ' + judge + "\n" +
							'Room: ' + room + "\n" +
							'Start: ' + start_time
							}
						);
					}
				}

		}
		//send this as a mass text
		$.post("/textMass", data, function(res){
				console.log('Response from server: ' + res.body);
				con.write(res);
			});
		console.log(data);

	
	} ,
	printTeams: function(){
		//recalculate team wins and points
		var div_id = $("#rounds_division_select").val();
		var division = pairing.getDivisionFromId(div_id);
		pairing.updateRecords(division);
		pdf.generateTeams(division);
	} ,
	printPairingsPrompt: function(){
		$("#print_pairings_details").fadeIn();
	} ,
	printPairings: function(){
		var div_id = $("#rounds_division_select").val();
		var division = pairing.getDivisionFromId(div_id);
		var round_number = $("#rounds_round_number_select").val();
		var start = $("#print_pairings_start").val();
		var message = $("#print_pairings_message").val();
		var headers = {
			tournament_name: 'Round Rock HS Tournament',
			date: '11/18/11',
			round_number: round_number,
			start_time_text: start,
			message: message,
			division: division
		};

		var titles = [ 
				"Affirmative",
				"Negative",
				"Judge",
				"Room"
		];
		
	    pdf.generatePairingSheet(headers,titles, round_number, division);
		
	} ,
	swapSides: function(){
		var round_id = $("#editround_id").val();
		var round = pairing.getRoundFromId(round_id);
		var aff = round.get("aff");
		if(aff == 0){
			round.set({aff: 1})
		} else {
			round.set({aff: 0})
		}
		round.save();
		this.drawForm(round);
	} ,
	changeJudge: function(){
		var judge_id = $("#editround_judge").val();
		var judge = pairing.getJudgeFromId(judge_id);
		var round_id = $("#editround_id").val();
		var round = pairing.getRoundFromId(round_id);
		round.set({judge: judge});
		round.save();
		this.drawForm(round);
	} ,
	changeRoom: function(){
		var room_id = $("#editround_room").val();
		var room = pairing.getRoomFromId(room_id);
		var round_id = $("#editround_id").val();
		var round = pairing.getRoundFromId(round_id);
		round.set({room: room});
		round.save();
		this.drawForm(round);
	} ,
	changeTeam: function(){
		//update edit round form to reflect new team
		var aff_id = $("#editround_team1_code").val();
		var aff = pairing.getTeamFromId(aff_id);
		var neg_id = $("#editround_team2_code").val();
		var neg = pairing.getTeamFromId(neg_id);
		var round_id = $("#editround_id").val();
		var round = pairing.getRoundFromId(round_id);

		

		if(aff === undefined){
			//create bye teams if necessary
			var bye_team = new model.Team();
			bye_team.set({team_code: "BYE"});
			aff = bye_team;
		}
		if(neg === undefined){
			var bye_team = new model.Team();
			bye_team.set({team_code: "BYE"});
			neg = bye_team;
		}

		if(round.get("aff") == 0){
			round.set({team1: aff, team2: neg});
		} else {
			round.set({team1: neg, team2: aff});
		}
		
		//change team in round
		this.drawForm(round);

	} ,

	drawForm: function(round){

		var aff;
		var neg;
		if(round.get("aff") == 0){
			aff = round.get("team1");
			neg = round.get("team2");
		} else {
			aff = round.get("team2");
			neg = round.get("team1");
		}

					
		
		//draw left side of form (aff)
		var competitors = aff.get("competitors");
		if(competitors != undefined){
			//clear out existing form data
			$("#editround_team1 > .competitors").html('');
			var aff_id = aff.get("team_code") === "BYE" ? -1 : aff.get("id");
			$("#editround_team1_code").val(aff_id);
			$("#editround_team1_id").text(aff_id);

			var points = round.get("aff_points") || []; 
			for(var i = 0; i < competitors.length; i++){
				
				var speaks = (points[i] === undefined ? "" : points[i].speaks);
				var rank = (points[i] === undefined ? "" : points[i].rank);
				var competitor_input = competitors[i].name + 
					'<br /> Points: <input class="editround_speaks" value="'+ speaks +'"/> ' +
					'Rank: <input class="editround_ranks" value="'+ rank +'"/> <br />';

				$("#editround_team1 > .competitors").append(competitor_input);
			}

		} else {
			//no competitors? team1 must have been a bye
			$("#editround_team1_code").text("BYE");
		}


		//draw right side of form
		competitors = neg.get("competitors");
		if(competitors != undefined){
			//clear out existing form data
			$("#editround_team2 > .competitors").html('');
			//id of -1 means BYE
			var neg_id = neg.get("team_code") === "BYE" ? -1 : neg.get("id");
			$("#editround_team2_code").val(neg_id);
			$("#editround_team2_id").text(neg_id);

			var points = round.get("neg_points") || []; 
			for(var i = 0; i < competitors.length; i++){
				
				var speaks = (points[i] === undefined ? "" : points[i].speaks);
				var rank = (points[i] === undefined ? "" : points[i].rank);
				var competitor_input = competitors[i].name + 
					'<br /> Points: <input class="editround_speaks" value="'+ speaks +'"/> ' +
					'Rank: <input class="editround_ranks" value="'+ rank +'"/> <br />';

				$("#editround_team2 > .competitors").append(competitor_input);
			}

		} else {
			//no competitors? team1 must have been a bye
			$("#editround_team2_code").text("BYE");
		}

		//select correct room and judge from dropdowns
		var judge_id = round.get("judge") === undefined ? "-1" : round.get("judge").get("id");
		$("#editround_judge").val(judge_id);
		var room_id = round.get("room") === undefined ? "-1" : round.get("room").get("id");
		$("#editround_room").val(room_id);
		//populate result box
		
		$("#editround_result_select").val(round.get("result"));

	} ,
	addEmptyRound: function(){
		var div_id = $("#rounds_division_select").val();
		var division = pairing.getDivisionFromId(div_id);
		var round_number = $("#rounds_round_number_select").val();
		var round = new model.Round();
		var bye_team = new model.Team();
		bye_team.set({team_code: "BYE"});

		round.set({"round_number": round_number});
		round.set({"division": division});
		round.set({"team1": bye_team});
		round.set({"team2": bye_team});
		collection.rounds.add(round);
	} ,
	editRound: function(){
		//verify speaker points
		var team1_id = $("#editround_team1_code").val();
		var team2_id = $("#editround_team2_code").val();
		var team1 = pairing.getTeamFromId(team1_id);
		var team2 = pairing.getTeamFromId(team2_id);
		var round_id = $("#editround_id").val();
		var round = pairing.getRoundFromId(round_id);
		var result = $("#editround_result_select").val();
		//construct points object for each row in the form
		var aff_points = [];
		var i = 0;
		$("#editround_team1 > .competitors").children().each(function(){
			if($(this).hasClass("editround_speaks")){
				aff_points.push({speaks: $(this).val(), rank: ""});
				i++;
			} else if($(this).hasClass("editround_ranks")){
				aff_points[i-1].rank = $(this).val();
			}
		});

		var neg_points = [];
		var i = 0;
		$("#editround_team2 > .competitors").children().each(function(){
			if($(this).hasClass("editround_speaks")){
				neg_points.push({speaks: $(this).val(), rank: ""});
				i++;
			} else if($(this).hasClass("editround_ranks")){
				neg_points[i-1].rank = $(this).val();
			}
		});
		round.set({"aff_points": aff_points});
		round.set({"neg_points": neg_points});
		round.set({"result": result});

		round.save()
		//speaker points are stored in the round model in aff_points, and neg_points

		//hide form
		$(".edit_model_overlay").fadeOut();
		//clear form
	} ,
	printBallots: function(){
		var div_id = $("#rounds_division_select").val();
		var div = pairing.getDivisionFromId(div_id);
		var round_number = $("#rounds_round_number_select").val();
		var ballot_type = div.get("ballot_type");
		if(ballot_type === "TFA_CX"){
			pdf.generateCXBallot(round_number, div);
		} else if(ballot_type === "TFA_LD"){
			pdf.generateLDBallot(round_number, div);
		} else if(ballot_type === "TFA_PF") {
			pdf.generatePFBallot(round_number, div);
		} else {
			con.write("FATAL ERROR: unrecognized ballot type.")
		}
		
	},
	pairRound: function(){
		var div_id = $("#rounds_division_select").val();
		var div = pairing.getDivisionFromId(div_id);
		var round_number = $("#rounds_round_number_select").val();
		//check if round has already been paired.
		var already_paired = pairing.alreadyPaired(round_number, div);
		if(already_paired === true){
			//pop up dialog for confirmation
			$.confirm({
				'title'		: 'Repair Confirmation',
				'message'	: 'You are about to repair a round that has already been paired. <br />It cannot be restored at a later time! Continue?',
				'buttons'	: {
					'Yes'	: {
						'class'	: 'blue',
						'action': function(){

							pairing.pairRound(round_number, div);
						}
					},
					'No'	: {
						'class'	: 'gray',
						'action': function(){}	// Nothing to do in this case. You can as well omit the action property.
					}
				}
			});
		} else {
			pairing.pairRound(round_number, div);
		}
	} ,

	renderRoundNumberSelect: function(){
		$("#rounds_round_number_select").empty();
		//show round options for selected division
		var div_id = $("#rounds_division_select").val();
		var div = pairing.getDivisionFromId(div_id);
		if(div === undefined){
			return;
		}
		if(div.get("schedule") != undefined){
			for(var i = 0; i < div.get("schedule").length; i++){
				this.appendRoundNumberOption(div.get("schedule")[i].round_number);
			}
		}

		this.filterDivisions();
	} ,
	appendRoundNumberOption: function(round_number){
		//since the objects in the schedule array are not models, we don't have a bonafide option subview.
		$("#rounds_round_number_select", this.el).append('<option value="'+round_number+'">'+round_number+'</option>');
		
	} ,
    
    	
	
	renderDivisionSelect: function(){
		$("#rounds_division_select").empty();
		collection.divisions.each(function(division){ // in case collection is not empty
        	this.appendDivisionOption(division);
    	}, this);
    	this.renderRoundNumberSelect();
	} ,

	appendDivisionOption: function(division){
		var divOptionView = new view.DivisionOption({
			model: division
		});
		$("#rounds_division_select", this.el).append(divOptionView.render().el);
		
	} ,

	render: function(){
		$("#rounds_table").empty();
		_(collection.rounds.models).each(function(round){ // in case collection is not empty
        	this.appendRound(round);
    	}, this);

    	this.renderDivisionSelect();
    	this.renderRoundNumberSelect();
    	this.filterDivisions();
	} ,

	addRound: function(){
		//TODO: validate round name
		
	} ,

	appendRound: function(round){
		var roundView = new view.Round({
			model: round
		});
		$("#rounds_table", this.el).append(roundView.render().el);
		//save round to localstorage
		round.save();
	} ,

	filterDivisions: function(){
		var division_id = $("#rounds_division_select").val();
		var division = pairing.getDivisionFromId(division_id);
		var round_number = $("#rounds_round_number_select").val();
		this.renderSearch(collection.rounds.filterRounds(round_number, division));
	} ,
	search: function(e){
		var letters = $("#rounds_search").val();
		this.renderSearch(collection.rounds.search(letters));
	} ,
	renderSearch: function(results){
		$("#rounds_table").html("");

		results.each(function(result){
			var roundView = new view.Round({
				model: result
			});
			$("#rounds_table", this.el).append(roundView.render().el);
		});
		return this;
	} 
	
});


//part of the edit round form
view.CompetitorInput = Backbone.View.extend({
	tagName: "div" ,
	events: { 
      
    },  

	initialize: function(){
		_.bindAll(this, "render", "unrender", "remove");
	    this.model.bind('remove', this.unrender);
		this.model.bind('change', this.render);

	} ,
	render: function(){
		console.log("rendering competitor input");
		//these will be rendered in order that they appear in the competitors array in a team model
		var html = '<span class="competitor_name">' + this.model.get("name") + '</span> Speaker points: <input type="text" class="speaker_points" />' +
			'Rank: <input type="text" class="rank" />'
		$(this.el).html(html);
		return this; //required for chainable call, .render().el
	} ,
	unrender: function(){
		$(this.el).remove();
	}
});

view.School = Backbone.View.extend({
	tagName: "tr" ,
	events: { 
      'click td.remove': 'remove',
	  'click td.name': 'showEditForm'
    },  

	initialize: function(){
		_.bindAll(this, "render", "unrender", "remove");
	    this.model.bind('remove', this.unrender);
		this.model.bind('change', this.render);

	} ,
	
	showEditForm: function(){
		//populate form with existing values
		$("#newschool_id").val(this.model.get("id"));
		$("#newschool_name").val(this.model.get("school_name"));
		$("#school_form_overlay").fadeIn();
	} ,
	
	remove: function(school){
		var school = this.model;
		$.confirm({
			'title'		: 'Delete School',
			'message'	: 'You are about to delete a School <br />It cannot be restored at a later time! Continue?',
			'buttons'	: {
				'Yes'	: {
					'model': school,
					'class'	: 'blue',
					'action': function(model){
						model.destroy();
						}
					},
					'No'	: {
					'class'	: 'gray',
					'action': function(){}	
				}
			},

		});
			
	} ,
	render: function(){
		$(this.el).html('<td class="name">' + this.model.get("school_name") + '</td> <td class="remove"><button>Remove</button></td>');
		return this; //required for chainable call, .render().el
	} ,
	unrender: function(){
		$(this.el).remove();
	}
});



view.SchoolTable = Backbone.View.extend({
	el: $("#schools") , // attaches `this.el` to an existing element.
	events: {
		"click #add_school_button": "addSchool" ,
		"keyup #schools_search": "search",
		"keyup #newschool_name": "keyupSchoolName"
	} ,

	initialize: function(){
		_.bindAll(this, "render", "addSchool", "appendSchool");
		
		collection.schools.bind("add", this.appendSchool);
		collection.schools.bind("reset", this.render, this);
		this.render();
		
	} ,
	
	keyupSchoolName: function(event){
		if(event.which === 13){
			this.addSchool();
		}
	},
	render: function(){
		_(collection.schools.models).each(function(school){ // in case collection is not empty
        	this.appendSchool(school);
    	}, this);
	} ,
	clearEditForm: function(){
		console.log("clearing school form");
		$("#newschool_id").val("");
		$("#newschool_name").val("");
	} ,
	addSchool: function(){
		//TODO: validate school name
		var id = $("#newschool_id").val();
		var school_name = $("#newschool_name").val();
		$(".edit_model_overlay").fadeOut();
		
		if(id.length > 0)
		{
			var school = pairing.getSchoolFromId(id);
			school.set({
			
			school_name: school_name
			
			});
		}
		else
		{
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

	appendSchool: function(school){
		var schoolView = new view.School({
			model: school
		});
		$("#schools_table", this.el).append(schoolView.render().el);
	} ,
	search: function(e){
		var letters = $("#schools_search").val();
		this.renderSearch(collection.schools.search(letters));
	} ,
	renderSearch: function(results){
		$("#schools_table").html("");

		results.each(function(result){
			var schoolView = new view.School({
				model: result
			});
			$("#schools_table", this.el).append(schoolView.render().el);
		});
		return this;
	} 
	
});

view.Division = Backbone.View.extend({
	tagName: "tr" ,
	events: { 
      'click td.remove': 'remove',
      'click td.name': 'showEditForm'
    },  

	initialize: function(){
		_.bindAll(this, "render", "unrender", "remove");
	    this.model.bind('remove', this.unrender);
		this.model.bind('change', this.render);

	} ,
	showEditForm: function(){
		console.log("showing division edit form");
		//populate form with existing values
		$("#newdiv_id").val(this.model.get("id"));
		$("#newdiv_division_name").val(this.model.get("division_name"));
		$("#newdiv_comp_per_team").val(this.model.get("comp_per_team"));
		$("#newdiv_flighted_rounds").val(this.model.get("flighted_rounds"));
		$("#newdiv_combine_speaks").val(this.model.get("combine_speaks"));
		$("#newdiv_break_to").val(this.model.get("break_to"));
		$("#newdiv_max_speaks").val(this.model.get("max_speaks"));
		$("#newdiv_prelims").val(this.model.get("prelims"));
		$("#newdiv_ballot_type").val(this.model.get("ballot_type"));

		$(".edit_model_overlay").css("height", $(document).height());
		$("#division_form_overlay").fadeIn();
	} ,
	remove: function(division){
		var division = this.model;
		$.confirm({
			'title'		: 'Delete Round',
			'message'	: 'You are about to delete a Division <br />It cannot be restored at a later time! Continue?',
			'buttons'	: {
				'Yes'	: {
					'model': division,
					'class'	: 'blue',
					'action': function(model){
						model.destroy();
						}
					},
					'No'	: {
					'class'	: 'gray',
					'action': function(){}	
				}
			},
			
		});
		
	} ,
	render: function(){
		$(this.el).html('<td class="name">' + this.model.get("division_name") + '</td><td class="remove"><button>Remove</button></td>');
		return this; //required for chainable call, .render().el ( in appendTeam)
	} ,
	unrender: function(){
		$(this.el).remove();
	}
});


view.DivisionTable = Backbone.View.extend({
	el: $("#divisions") , // attaches `this.el` to an existing element.
	events: {
		"click #add_division_button": "addDivision" 
	} ,
	initialize: function(){
		_.bindAll(this, "render", "addDivision", "appendDivision");
		
		collection.divisions.bind("add", this.appendDivision);
		collection.divisions.bind("reset", this.render, this);
		this.render();
		
	} ,
	
	render: function(){
		_(collection.divisions.models).each(function(division){ // in case collection is not empty
        	this.appendDivision(division);
    	}, this);
	} ,
	clearEditForm: function(){
		console.log("clearing division form");
		$("#newdiv_id").val("");
		$("#newdiv_division_name").val("");
		$("#newdiv_comp_per_team").val("");
		$("#newdiv_flighted_rounds").val(false);
		$("#newdiv_combine_speaks").val(false);
		$("#newdiv_break_to").val("4");
		$("#newdiv_max_speaks").val("30");
		$("#newdiv_prelims").val("4");
		$("#newdiv_ballot_type").val("TFA_CX");
	} ,
	addDivision: function(){
		//TODO: validate school name
	

		
		
		//TODO: verify all this input
		var division_name = $("#newdiv_division_name").val();
		var comp_per_team = parseInt($("#newdiv_comp_per_team").val(), 10);
		//TODO: verify that this boolean works
		var flighted_rounds = new Boolean($("#newdiv_flighted_rounds").val());
		var break_to = $("#newdiv_break_to").val();
		var max_speaks = parseInt($("#newdiv_max_speaks").val());
		var prelims = parseInt($("#newdiv_prelims").val());
		var schedule = [];
		var ballot_type = $("#newdiv_ballot_type").val();
		var combine_speaks = new Boolean($("#newdiv_combine_speaks").val());

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


		$(".edit_model_overlay").fadeOut();

		//check if we are modifying an existing division or created a new one
		var id = $("#newdiv_id").val();
		console.log(id);
		if(id.length > 0){
			console.log("updating existing model");
			//update existing model
			var division = pairing.getDivisionFromId(id);
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


	} ,

	appendDivision: function(division){
		var divisionView = new view.Division({
			model: division
		});
		$("#divisions_table", this.el).append(divisionView.render().el);
	}
	
});