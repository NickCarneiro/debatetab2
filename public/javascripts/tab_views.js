
/*
=========================================
Define Backbone Views
=========================================
*/

//utility function to render everything after restoring references
view.renderAll = function(){
	console.log("rendering all views");
	view.divisionTable.render();
	view.roundTable.render();
	view.judgeTable.render();
	view.roomTable.render();
	view.teamTable.render();
	view.schoolTable.render();

	view.teamTable.renderDivisionSelect();
	view.teamTable.render();

	view.roundTable.renderDivisionSelect();


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
		$(this.el).data("id", this.model.id);
		//set the value attr to the ObjectId
		//This will be read by jQuery to figure out which division was selected
		$(this.el).attr("value", this.model.id);
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
		$(this.el).data("id", this.model.id);
		//set the value attr to the ObjectId
		//This will be read by jQuery to figure out which division was selected
		$(this.el).attr("value", this.model.id);
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
		collection.divisions.bind("sync", this.render, this);
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
		$(this.el).data("id", this.model.id);
		//set the value attr to the ObjectId
		//This will be read by jQuery to figure out which division was selected
		$(this.el).attr("value", this.model.id);
		$(this.el).data("division_id", this.model.id);
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
		try {
			
			
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
		} catch(e) {
		 	console.log(e.stack())
		}
		finally {
			
		
			return this; //required for chainable call, .render().el ( in appendJudge)
		}
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
		collection.schools.bind("change", this.render, this);
		collection.divisions.bind("reset", this.render, this);
		collection.divisions.bind("sync", this.render, this);
		

    	
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
		try {
			if(! this.model instanceof Backbone.Model){
				throw new Exception("Could not render room. No valid room model attached.");
			}
			var division = this.model.get("division");
			
			var division_name = (division === undefined) ? "No division" : division ? division.get("division_name") : "No Division Assigned";
			$(this.el).html('<td class="name">' + this.model.get("name") + '</td>' +
				' <td>' + division_name + '</td>' +
				'<td class="remove"><button>Remove</button></td>');
		} catch(e){
			console.log(e.message);
			console.log(e.stack);
		} finally {
			return this;
		}
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
		collection.divisions.bind("sync", this.render);
		this.render();
		
	} ,
	
	render: function(){
		$("#newroom_division").empty();
		$("#rooms_table").empty();
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
		$(this.el).data("id", this.model.id);
		//set the value attr to the ObjectId
		//This will be read by jQuery to figure out which division was selected
		$(this.el).attr("value", this.model.id);
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

	
	
	showEditForm: function(){
		view.roundForm.render(this.model);
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
		
		"click #add_round_button": "addEmptyRound",
		"click #validate_round": "validateRound"
	

	} ,

	
	initialize: function(){
		_.bindAll(this, "render", "appendRound", "renderRoundNumberSelect");
		
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
	
	addEmptyRound: function(){
		var div_id = $("#rounds_division_select").val();
		var division = collection.getDivisionFromId(div_id);
		var round_number = $("#rounds_round_number_select").val();
		var round = new model.Round();

		round.set({"round_number": round_number});
		round.set({"division": division});
		
		collection.rounds.add(round);
		round.save();
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
		if(div.get("prelims") != undefined){
			for(var i = 0; i < div.get("prelims"); i++){
				this.appendRoundNumberOption(i + 1);
			}
		} else {
			//show dialog about setting up division
			view.showMessageDialog("You must configure this division in the Divisions tab before you can put rounds in it.");
			//todo: pulse the divisions tab.
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

	appendRound: function(round){
		var roundView = new view.Round({
			model: round
		});

		//put round at top if it has no competitors
		if(round.get("team1") === undefined && round.get("team2") === undefined){
			$("#rounds_table", this.el).prepend(roundView.render().el);
		} else {
			$("#rounds_table", this.el).append(roundView.render().el);
		}
		
		
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
		$("#schools_table").html("");
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
					try {
						collection.deleteDivision(division);
					}
					catch(e){
						console.log(e.stack);
					}
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
		$("#divisions_table").empty();
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





view.SetupScreen = Backbone.View.extend({
	el: $("#setup") , // attaches `this.el` to an existing element.
	events: {
		"click #export_data": "exportAll",
		"click #import_data": "showImportDialog"
	} ,
	initialize: function(){
		
		this.render();
		
	} ,
	render: function(){
		
	} ,

	showImportDialog: function(){

		$( "#import_data_dialog").dialog({
			width: 700,
			title: "Import Tournament",
			modal: true,
			buttons: {
				
				"Import" : {
					text: "Import",
					click: function(){
						view.setupScreen.import();
					} ,
					class: "btn btn-large"
				} ,
				
				"Cancel" : {
					text: "Cancel",
					click: function(){
						$(this).dialog("close");
						
					} ,
					class: "btn btn-large"
				} ,	
			}
		});
		

		
	} ,

	import: function(){
		try {
			if($("#import_type").val() === "native"){
				var json = $("#import_box").val();
				collection.importNative(json);
			} else {
				var joy_data = $("#import_box").val().trim();
				collection.importJoyFile(joy_data);
			}
			//importing is silent because attempts at rendering 
			//will fail when references aren't restored.
			view.renderAll();
			collection.saveAll();
			
			$("#import_data_dialog").dialog("close");
			//show newly imported teams
			$("#menu_teams").trigger("click");
		} catch(e){
			$("#import_message")
				.text("Tournament data was invalid. Are you sure you selected the proper format above?")
				.show();
			console.log(e);
			if(e.stack != undefined){
				console.log(e.stack);
			}
		}
		
	} ,

	exportAll: function(){
		console.log("exporting");
		collection.exportAll();
	}

	

});

					

view.showMessageDialog = function(message){
	$("#message_dialog_message").text(message);
	$("#message_dialog").dialog(
		{ 
			buttons: {

				"Save" : {
					text: "OK" ,
					click: function() { $(this).dialog("close"); } ,
					class: "btn btn-large"
				}
			}
		}	
	);
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

