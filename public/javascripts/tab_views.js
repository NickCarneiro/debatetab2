
/*
=========================================
Define Backbone Views
=========================================
*/

//utility function to render everything after restoring references
view.renderAll = function(){
	view.divisionTable.render();
	view.roundTable.render();
	view.judgeTable.render();
	view.roomTable.render();
	view.teamTable.render();
	view.schoolTable.render();

}

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
		"click #add_team": "showEditForm",
		"keyup #teams_search": "search",
		
		"change #teams_division_select" : "render",
		"click #print_teams" : "printTeams",
		"click #print_speakers" : "printSpeakers"

	} ,
	initialize: function(){
		_.bindAll(this, "render", "appendTeam", 
			"renderSearch", "search", "showEditForm");
		
		
		collection.teams.bind("add", this.appendTeam);
		collection.teams.bind("reset", this.render, this);

	

		//populate dropdowns with initial divisions and schools
		collection.divisions.bind("reset", this.render, this);
		
		collection.schools.bind("reset", this.render, this);

		collection.divisions.bind("add", this.renderDivisionSelect, this);
		this.renderDivisionSelect();
		this.render();
		
	} ,
	printTeams: function(){
		var division_id = $("#teams_division_select").val();
		var division = collection.getDivisionFromId(division_id);
		
		try {

			pairing.updateRecords();
			forms.printTeams(division);
			
		} catch(e){
			console.log(e);
			view.showMessageDialog(e.message);
		}
		
	} ,

	printSpeakers: function(){
		var division_id = $("#teams_division_select").val();
		var division = collection.getDivisionFromId(division_id);
		
		try {

			pairing.updateRecords();
			forms.printSpeakers(division);
			
		} catch(e){
			console.log(e);
			view.showMessageDialog(e.message);
		}
	} ,
	renderDivisionSelect: function(){
		$("#teams_division_select").empty();
		collection.divisions.each(function(division){ // in case collection is not empty
        	this.appendDivisionOption(division);
    	}, this);
	} ,
	appendDivisionOption: function(division){
		var divOptionView = new view.DivisionOption({
			model: division
		});
		$("#teams_division_select", this.el).append(divOptionView.render().el);
		
	} ,
	render: function(){
		//clear everything and re-render from collections
		this.clearView();
		//populate table
		var division_id = $("#teams_division_select").val();
		var division = collection.getDivisionFromId(division_id);
		_(collection.teams.models).each(function(team){ // for pre-existing teams
			
			if(team.get("division") === division){
				this.appendTeam(team);
			}
        	
    	}, this);

	} ,
	showEditForm: function(){
		//populate form with existing values
		view.teamForm.render();

	} ,
	clearView: function(){
		//clear table
		$("#teams_table").empty();
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
	  'click td.row': 'showEditForm'
    },  

	initialize: function(){
		_.bindAll(this, "render", "unrender", "remove");
	    this.model.bind('remove', this.unrender);
		this.model.bind('change', this.render);

	} ,
	showEditForm: function(){
		view.teamForm.render(this.model);
	} ,

	remove: function(team){ 
		var team = this.model;
		var dialog = $('<div>You are about to delete a team. <br />It cannot be restored at a later time! Continue?</div>')
		$( dialog ).dialog({
			resizable : false,
			height :160,
			modal : true,
			title : 'Delete Team',
			buttons : {
				"Yes": function() {
					team.destroy();
					$(this).dialog("close");
				},
				"No": function() {
					$(this).dialog("close");
				}
			}
		});
	} ,
	render: function(){
		var wins = this.model.get("losses") || "0";
		var losses = this.model.get("wins") || "0";
		$(this.el).html('<td class="name row">' + this.model.get("team_code") + 
			'</td> <td class="row">'+this.model.get("division").get("division_name") +'</td><td class="row">' + 
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
		$(this.el).html('<input class="division_list" type="checkbox" /> ' + this.model.get("division_name"));
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
	  'click td.row': 'showEditForm'
    },  

	initialize: function(){
		_.bindAll(this, "render", "unrender", "remove","showEditForm");
	    this.model.bind('remove', this.unrender);
		this.model.bind('change', this.render);

	} ,
	showEditForm: function(){
		//populate form with existing values
		view.judgeForm.render(this.model);
	} ,

	
	remove: function(judge){
		var judge = this.model;
		

		var dialog = $('<div>You are about to delete a judge. <br />It cannot be restored at a later time! Continue?</div>')
		$( dialog ).dialog({
			resizable : false,
			height :160,
			modal : true,
			title : 'Delete Team',
			buttons : {
				"Yes": function() {
					judge.destroy();
					$(this).dialog("close");

				},
				"No": function() {
					$(this).dialog("close");
				}
			}
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
		$(this.el).html('<td class="name row">' + this.model.get("name") + '</td><td class="row">'+ school +'</td><td class="row">' + div_string + '</td><td class="remove"><button>Remove</button></td>');
		return this; //required for chainable call, .render().el ( in appendJudge)
	} ,
	unrender: function(){
		$(this.el).remove();
	}
});

		


view.JudgeTable = Backbone.View.extend({
	el: $("#judges") , // attaches `this.el` to an existing element.
	events: {
		"click #add_judge": "showEditForm" ,
		"keyup #judges_search": "search" 
		
	} ,
	initialize: function(){
		_.bindAll(this, "render", "appendJudge", "showEditForm");
		
		collection.judges.bind("add", this.appendJudge);
		collection.divisions.bind("remove", this.render);
		

		collection.judges.bind("reset", this.render, this);
		collection.schools.bind("reset", this.render, this);
		collection.divisions.bind("reset", this.render, this);

		

    	
		this.render();
		
	} ,
	
	render: function(){
		$("#judges_table").html("");
		_(collection.judges.models).each(function(judge){ // in case collection is not empty
        	this.appendJudge(judge);
    	}, this);
	} ,
	showEditForm: function(){
		view.judgeForm.render();
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
		view.roomForm.render(this.model);
	} ,

	remove: function(room){
		var room = this.model;
		var dialog = $('<div>You are about to delete a room. <br />It cannot be restored at a later time! Continue?</div>')
		$( dialog ).dialog({
			resizable : false,
			height :160,
			modal : true,
			title : 'Delete Team',
			buttons : {
				"Yes": function() {
					room.destroy();
					$(this).dialog("close");
				},
				"No": function() {
					$(this).dialog("close");
				}
			}
		});
	} ,
	render: function(){
		var division = this.model.get("division");
		var division_name = division ? division.get("division_name") : "No Room Name";
		$(this.el).html('<td class="name">' + this.model.get("name") + '</td>' +
			' <td>' + division_name + '</td>' +
			'<td class="remove"><button>Remove</button></td>');
		return this; //required for chainable call, .render().el ( in appendRoom)			.get("division_name")
	} ,
	unrender: function(){
		$(this.el).remove();
	}
});

view.RoomTable = Backbone.View.extend({
	el: $("#rooms") , // attaches `this.el` to an existing element.
	events: {
		"click #add_room": "showEditForm"
		
	} ,
	showEditForm: function(){
		
		view.roomForm.render();
		
	},
	
	initialize: function(){
		_.bindAll(this, "render", "appendRoom");
		
		collection.rooms.bind("add", this.appendRoom);
		collection.rooms.bind("reset", this.render, this);
		collection.divisions.bind("reset", this.render);
		this.render();
		
	} ,
	
	render: function(){
		$("#newroom_division").empty();
		$("#room_table").empty();
		_(collection.rooms.models).each(function(room){ // in case collection is not empty
        	this.appendRoom(room);
    	}, this);

    
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
		

		var dialog = $('<div>You are about to delete a round. <br />It cannot be restored at a later time! Continue?</div>')
		$( dialog ).dialog({
			resizable : false,
			height :160,
			modal : true,
			title : 'Delete Round',
			buttons : {
				"Yes": function() {
					round.destroy();
					$(this).dialog("close");
				},
				"No": function() {
					$(this).dialog("close");
				}
			}
		});
	} ,
	render: function(){
		var team1 = this.model.get("team1");
		var team2 = this.model.get("team2");
		if(team1 != undefined){
			var team1_cd = team1.get("team_code");
		} else {
			team1_cd = "BYE";
		}
		if(team2 != undefined){
			var team2_cd = team2.get("team_code");
		} else {
			team2_cd = "BYE";
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
		var row_class = this.model.get("result") === undefined ? "roundrow" : "roundrow entered";
		$(this.el).html('<td class="'+row_class+'">' + aff + '</td> <td class="'+row_class+'">' 
			+ neg + '</td><td class="'+row_class+'">'+judge+
			'</td><td class="' + row_class + '">'+room+'</td><td class="' + row_class + '">' 
			+ div_name + '</td><td class="remove"><button>Remove</button></td>');
		return this; //required for chainable call, .render().el
	} ,
	unrender: function(){
		$(this.el).remove();
	},

	
	//fills the rooms and judges selects on the edit round form
	populateRoomsAndJudges: function(){
		var div_id = $("#rounds_division_select").val();
		var division = collection.getDivisionFromId(div_id);
		//empty out existing rooms and judges
		$("#edit_round_judge").html("");
		$("#edit_round_room").html("");
		for(var i = 0; i < collection.rooms.length; i++){
			//skip irrelevant rooms
			if(collection.rooms.at(i).get("division") != division){
				continue;
			}
			$("#edit_round_room").append('<option value="'+collection.rooms.at(i).get("id")+'">'
				+ collection.rooms.at(i).get("name") +'</option>');

		}

		for(var i = 0; i < collection.judges.length; i++){
			
			$("#edit_round_judge").append('<option value="'+collection.judges.at(i).get("id")+'">'
				+ collection.judges.at(i).get("name") +'</option>');

		}

	} ,
	populateTeamSelects: function(){
		//empty out existing teams
		$("#left_team_select").html("");
		$("#right_team_select").html("");

		var div_id = $("#rounds_division_select").val();
		var division = collection.getDivisionFromId(div_id);
		var round_number = $("#rounds_round_number_select").val();
		for(var i = 0; i < collection.teams.length; i++){
			//skip irrelevant teams
			if(collection.teams.at(i).get("division") != division){
				continue;
			}

			$("#left_team_select").append('<option value="'+collection.teams.at(i).get("id")+'">'
				+ collection.teams.at(i).get("team_code") +'</option>');

			$("#right_team_select").append('<option value="'+collection.teams.at(i).get("id")+'">'
			+ collection.teams.at(i).get("team_code") +'</option>');
		}

		//add BYE teams to both
		$("#left_team_select").append('<option value="-1">BYE</option>');
		$("#right_team_select").append('<option value="-1">BYE</option>');

	} ,
	showEditForm: function(){
		//populate form with existing values
		//populate team 1 competitors
		$("#edit_round_dialog").data("round_id", this.model.get("id"));
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
		
		//show dialog
		$( "#edit_round_dialog").dialog({
			width: 700,
			title: "Edit Round ",
			modal: true
		});
	} ,
});


view.RoundTable = Backbone.View.extend({
	el: $("#rounds") , // attaches `this.el` to an existing element.
	events: {
		
		"click #pair_round_button" : "pairRoundConfirm",
		"click #print_ballots_button" : "printBallots",
		"click #print_pairings_button" : "printPairings",
		"change #rounds_division_select" : "renderRoundNumberSelect",
		"change #rounds_round_number_select" : "filterDivisions",
		"change #edit_round_result" : "displayWinner",
		"click button#save_round_button": "saveRound",
		"click #add_round_button": "addEmptyRound",
		"click #validate_round": "validateRound",

		"change #left_team_select": "changeTeam",
		"change #right_team_select": "changeTeam",
		//can't get these to fire
		"change #edit_round_judge": "changeJudge",
		"change #edit_round_room": "changeRoom",
		"click #edit_round_swap": "swapSides"
		//
	

	} ,

	
	initialize: function(){
		_.bindAll(this, "render", "addRound", "appendRound", "renderRoundNumberSelect");
		
		collection.rounds.bind("add", this.appendRound);
		collection.rounds.bind("reset", this.render, this);
		collection.rounds.bind("change", this.renderRounds, this);

		collection.divisions.bind("change", this.renderDivisionSelect, this);
		collection.divisions.bind("reset", this.renderDivisionSelect, this);
		collection.divisions.bind("add", this.renderDivisionSelect, this);
		$("#pairing_indicator").hide();
		this.render();
		
	} ,

	validateRound: function(){
		
		var div_id = $("#rounds_division_select").val();
		var division = collection.getDivisionFromId(div_id);
		var round_number = $("#rounds_round_number_select").val();

		pairing.validateRound(round_number, division);

		if(tab.warnings.length > 0){
			view.showWarningsDialog();
		} else {
			view.showMessageDialog("Round is valid.");
		}
	} ,

	printBoxes: function(){
		var div_id = $("#rounds_division_select").val();
		var division = collection.getDivisionFromId(div_id);

		try {
			forms.printBoxes(division);
		} catch(e){
			console.log(e);
			view.showMessageDialog(e.message);
		}
		
	} ,

	displayWinner: function(){
		//put winner's name in box above save button
		
		var result = $("#edit_round_result").val();
		if(result == 0 || result == 1){
			//aff win
			var winner = $("#left_team_select").val();

		} else if(result == 2 || result == 3){
			//neg win
			var winner = $("#right_team_select").val();
		}

		if(winner != "-1"){
			winner = collection.getTeamFromId(winner);
			if(winner != undefined){
				winner = winner.get("team_code");
			}
		} else {
			
		}
		$("#selected_winner").text(winner || "");
	} ,
	textPairingsPrompt: function(){
		$("#text_pairings_details").fadeIn();
	} ,
	textPairings: function(){
		$("#text_pairings_details").fadeOut();
		var div_id = $("#rounds_division_select").val();
		var div = collection.getDivisionFromId(div_id);
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
				console.log(res);
			});
		console.log(data);

	
	} ,
	printTeams: function(){
		//recalculate team wins and points
		var div_id = $("#rounds_division_select").val();
		var division = collection.getDivisionFromId(div_id);
		pairing.updateRecords(division);
		pdf.generateTeams(division);
	} ,
	
	printPairings: function(){
		var div_id = $("#rounds_division_select").val();
		var division = collection.getDivisionFromId(div_id);
		var round_number = $("#rounds_round_number_select").val();
		forms.generatePairings(round_number, division);
		
	} ,
	swapSides: function(){
		var round_id = $("#edit_round_dialog").data("round_id");
		var round = collection.getRoundFromId(round_id);
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
		console.log("changing judge");
		var judge_id = $("#edit_round_judge").val();
		var judge = collection.getJudgeFromId(judge_id);
		var round_id = $("#edit_round_dialog").data("round_id");
		var round = collection.getRoundFromId(round_id);
		round.set({judge: judge});
		round.save();
		this.drawForm(round);
	} ,
	changeRoom: function(){
		var room_id = $("#edit_round_room").val();
		var room = collection.getRoomFromId(room_id);
		var round_id = $("#edit_round_dialog").data("round_id");
		var round = collection.getRoundFromId(round_id);
		round.set({room: room});
		round.save();
		this.drawForm(round);
	} ,
	changeTeam: function(){
		//update edit round form to reflect new team
		var aff_id = $("#left_team_select").val();
		var aff = collection.getTeamFromId(aff_id);
		var neg_id = $("#right_team_select").val();
		var neg = collection.getTeamFromId(neg_id);
		var round_id = $("#edit_round_dialog").data("round_id");
		var round = collection.getRoundFromId(round_id);

	

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

		var aff_id = aff === undefined ? -1 : aff.get("id");
		var neg_id = neg === undefined ? -1 : neg.get("id");
		
		//draw left side of form (aff)
		var competitors = aff === undefined ? undefined : aff.get("competitors");
		if(competitors != undefined){
			//clear out existing form data
			$("#left_team_container").html('');
			
			$("#left_team_select").val(aff_id);
			

			var points = round.get("aff_points") || []; 
			for(var i = 0; i < competitors.length; i++){
				
				var speaks = (points[i] === undefined ? "" : points[i].speaks);
				var rank = (points[i] === undefined ? "" : points[i].rank);
				var competitor_input = '<span class="competitor_name">' + competitors[i].name + "</span>" + 
					'<br /> Points: <input class="edit_round_speaks" value="'+ speaks +'"/> ' +
					'Rank: <input class="edit_round_ranks" value="'+ rank +'"/> <br />';

				$("#left_team_container").append(competitor_input);
			}

		} else {
			//no competitors? team1 must have been a bye
			$("#left_team_select").val("-1");
		}

		//draw right side of form

		var competitors = neg === undefined ? undefined : neg.get("competitors");
		if(competitors != undefined){
			//clear out existing form data
			$("#right_team_container").html('');
			
			$("#right_team_select").val(neg_id);
			

			var points = round.get("neg_points") || []; 
			for(var i = 0; i < competitors.length; i++){
				
				var speaks = (points[i] === undefined ? "" : points[i].speaks);
				var rank = (points[i] === undefined ? "" : points[i].rank);
				var competitor_input = '<span class="competitor_name">' + competitors[i].name + '</span>' +
					'<br /> Points: <input class="edit_round_speaks" value="'+ speaks +'"/> ' +
					'Rank: <input class="edit_round_ranks" value="'+ rank +'"/> <br />';

				$("#right_team_container").append(competitor_input);
			}

		} else {
			//no competitors? team1 must have been a bye
			$("#left_team_select").val(-1);
		}
		

		//select correct room and judge from dropdowns
		var judge_id = round.get("judge") === undefined ? "-1" : round.get("judge").get("id");
		$("#edit_round_judge").val(judge_id);
		var room_id = round.get("room") === undefined ? "-1" : round.get("room").get("id");
		$("#edit_round_room").val(room_id);
		//populate result box
		
		$("#edit_round_result").val(round.get("result"));

	} ,
	addEmptyRound: function(){
		var div_id = $("#rounds_division_select").val();
		var division = collection.getDivisionFromId(div_id);
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


	saveRound: function(){
		try {
			//verify speaker points
			var team1_id = $("#left_team_select").val();
			var team2_id = $("#right_team_select").val();
			var team1 = collection.getTeamFromId(team1_id);
			var team2 = collection.getTeamFromId(team2_id);
			var round_id = $("#edit_round_dialog").data("round_id");
			var round = collection.getRoundFromId(round_id);
			var result = $("#edit_round_result").val();
			var is_bye = (team1_id == "-1" || team2_id == "-1" || result == 1 || result == 3 || result == 6 || result == 7);
			var max_speaks = round.get("division").get("max_speaks");
			if(max_speaks === undefined){
				max_speaks = 30;
			}
			var comp_per_team = round.get("division").get("comp_per_team");
			if(comp_per_team === undefined){
				comp_per_team = 2;
			}
			var max_rank = comp_per_team * 2;
			//construct points object for each row in the form
			var aff_points = [];
			var i = 0;
			$("#left_team_container").children().each(function(){
				if($(this).hasClass("edit_round_speaks")){
					if($(this).val() > max_speaks){
						throw new Exception("Entered speaker point value was greater than max speaks for this division.");
					}

					if(is_bye === true){
						aff_points.push({speaks: "0", rank: ""});
					} else {
						if($(this).val() == ""){
							throw new Exception("Empty speaker points");
						}
						aff_points.push({speaks: $(this).val(), rank: ""});	
					}
				
					i++;
				} else if($(this).hasClass("edit_round_ranks")){
					if(is_bye === true){
						aff_points[i-1].rank = "0";
					} else {
						if($(this).val() == ""){
							throw new Exception("Empty rank");
						} else if($(this).val() > max_rank){
							throw new Exception("Rank exceeded maximum rank.");
						}
						aff_points[i-1].rank = $(this).val();
						
					}
					
					
				}
			});

			var neg_points = [];
			var i = 0;
			$("#right_team_container").children().each(function(){
				if($(this).hasClass("edit_round_speaks")){
					if($(this).val() > max_speaks){
						throw new Exception("Entered speaker point value was greater than max speaks for this division.");
					}
					if(is_bye === true){
						neg_points.push({speaks: "0", rank: ""});
					} else {
						if($(this).val() == ""){
							throw new Exception("Empty speaker points");
						}
						neg_points.push({speaks: $(this).val(), rank: ""});
					}
					
					i++;
				} else if($(this).hasClass("edit_round_ranks")){
					if(is_bye === true){
						neg_points[i-1].rank = "0";
					} else {
						if($(this).val() == "" && is_bye === false){
							throw new Exception("Empty rank");
						} else if($(this).val() > max_rank){
							throw new Exception("Rank exceeded maximum rank.");
						}
						neg_points[i-1].rank = $(this).val();
					}
					
				}
			});
			//check for unconfirmed LPW
			var total_neg_points = 0;
			$.each(neg_points, function(i, points){
				total_neg_points += parseInt(points.speaks);
			})
			var total_aff_points = 0;
			$.each(aff_points, function(i, points){
				total_aff_points += parseInt(points.speaks);
			})
			/*
			console.log(result);
			console.log(total_aff_points);
			console.log(total_neg_points);
			*/
			if((result == 0 && total_aff_points < total_neg_points) || (result == 2 && total_neg_points < total_aff_points)){
				if($("#edit_round_lpw").attr("checked") === undefined){
					throw new Exception("Unconfirmed LPW");
				}
			}
			round.set({"aff_points": aff_points});
			round.set({"neg_points": neg_points});
			if(result == -1){
				round.set({"result": undefined});
			} else {
				round.set({"result": result});
			}
			
			$("#edit_round_error").text("");
			$("#selected_winner").html("");
			$("#edit_round_lpw").attr("checked", false);
			round.save()
			//speaker points are stored in the round model in aff_points, and neg_points

			$("#edit_round_dialog").dialog("close");
		} catch(e){
			$("#edit_round_error").text(e.message);
			console.log(e);
		}
	} ,
	printBallots: function(){
		var div_id = $("#rounds_division_select").val();
		var division = collection.getDivisionFromId(div_id);
		var round_number = $("#rounds_round_number_select").val();
		try {
			forms.printBallots(round_number, division);
		} catch(e){

			view.showMessageDialog(e.message);
			console.log(e);
		}
		
		
	},
	pairRound: function(round_number, division){
		$("#rounds_table").hide();
		$("#pairing_indicator").show('fast', function(){
			pairing.pairUilPrelim(round_number, division);
			$("#pairing_indicator").hide();
			$("#rounds_table").show();
		});
		
		
	},
	pairRoundConfirm: function(){
		

		var div_id = $("#rounds_division_select").val();
		var division = collection.getDivisionFromId(div_id);
		var round_number = parseInt($("#rounds_round_number_select").val());

		//check if round has already been paired.
		var already_paired = pairing.alreadyPaired(round_number, division);
		if(already_paired === true){
			//pop up dialog for confirmation
			var dialog = $('<div>You are about to re-pair a round that has already been paired. <br />It cannot be restored at a later time! Continue?</div>')
			$( dialog ).dialog({
				resizable : false,
				modal : true,
				title : 'Re-pair Round',
				buttons : {
					"Yes": function() {
						console.log(round_number);
						console.log(division);
						view.roundTable.pairRound(round_number, division);
						$(this).dialog("close");
					},
					"No": function() {
						$(this).dialog("close");
					}
				}
			});
		} else {
			this.pairRound(round_number, division);
		}

		
	} ,

	renderRoundNumberSelect: function(){
		
		$("#rounds_round_number_select").empty();
		//show round options for selected division
		var div_id = $("#rounds_division_select").val();
		var div = collection.getDivisionFromId(div_id);
		if(div == undefined){
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

    	//update total rounds
	} ,

	renderRounds: function(){
		$("#rounds_table").empty();
		_(collection.rounds.models).each(function(round){ // in case collection is not empty
        	this.appendRound(round);
    	}, this);
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
		var division = collection.getDivisionFromId(division_id);
		var round_number = $("#rounds_round_number_select").val();
		this.renderSearch(collection.rounds.filterRounds(round_number, division));
		
	} ,
	search: function(e){
		var letters = $("#rounds_search").val();
		this.renderSearch(collection.rounds.search(letters));
	} ,
	renderSearch: function(results){
		$("#rounds_table").html("");

		var remaining_ballots = 0;
		results.each(function(result){
			if(result.get("result") === undefined){
				remaining_ballots++;
			}
			var roundView = new view.Round({
				model: result
			});
			$("#rounds_table", this.el).append(roundView.render().el);
		});

		$("#remaining_ballots").text(remaining_ballots);

		//update remaining round coun
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
		view.schoolForm.render(this.model);
	} ,
	
	remove: function(school){
		var school = this.model;

		var dialog = $('<div>You are about to delete a school. <br />It cannot be restored at a later time! Continue?</div>')
		$( dialog ).dialog({
			resizable : false,
			height :160,
			modal : true,
			title : 'Delete School',
			buttons : {
				"Yes": function() {
					school.destroy();
					$(this).dialog("close");
				},
				"No": function() {
					$(this).dialog("close");
				}
			}
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
		"click #add_school": "showEditForm" ,
		"keyup #schools_search": "search"
	
	} ,

	initialize: function(){
		_.bindAll(this, "render", "appendSchool");
		
		collection.schools.bind("add", this.appendSchool);
		collection.schools.bind("reset", this.render, this);
		this.render();
		
	} ,
	
	
	render: function(){
		_(collection.schools.models).each(function(school){ // in case collection is not empty
        	this.appendSchool(school);
    	}, this);
	} ,
	
	showEditForm: function(){
		view.schoolForm.render();
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
		view.divisionForm.render(this.model);
	} ,
	remove: function(division){
		var division = this.model;
		var dialog = $('<div>You are about to delete a division. <br />It cannot be restored at a later time! Continue?</div>')
		$( dialog ).dialog({
			resizable : false,
			height :160,
			modal : true,
			title : 'Delete Division',
			buttons : {
				"Yes": function() {
					collection.deleteDivision(division);
					$(this).dialog("close");
				},
				"No": function() {
					$(this).dialog("close");
				}
			}
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
		"click #add_division": "showEditForm"
	} ,
	initialize: function(){
		_.bindAll(this, "render", "appendDivision");
		
		collection.divisions.bind("add", this.appendDivision);
		collection.divisions.bind("reset", this.render, this);
		this.render();
		
	} ,
	showEditForm: function(){
		view.divisionForm.render();
	} ,
	
	render: function(){
		_(collection.divisions.models).each(function(division){ // in case collection is not empty
        	this.appendDivision(division);
    	}, this);
	} ,

	
	

	appendDivision: function(division){
		var divisionView = new view.Division({
			model: division
		});
		$("#divisions_table", this.el).append(divisionView.render().el);
	}
	
});

view.showMessageDialog = function(message){
	$("#message_dialog_message").text(message);
	$("#message_dialog").dialog({ buttons: [
	    {
	        text: "Ok",
	        click: function() { $(this).dialog("close"); }
	    }
	] });
}

//called to show a list of nonfatal warnings, like not having enough rooms.
view.showWarningsDialog = function(){
	var warnings = "";
	$.each(tab.warnings, function(i, warning){
		warnings += warning + "<br />";
	})
	$("#warnings_dialog_message").html(warnings);

	tab.warnings = [];
	$("#warnings_dialog").dialog({ buttons: [
	    {
	        text: "Ok",
	        click: function() { $(this).dialog("close"); }
	    }
	] });
}

