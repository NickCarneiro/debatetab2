//UI module

//define functions for UI
ui.showMenu = function(menu_item){
	$(".main_container").hide();
	$("#" + menu_item + "_container").show();
	$("#main_menu > div").removeClass("menu_item_selected");
	$("#main_menu > div").addClass("menu_item");
	$("#menu_" + menu_item).addClass("menu_item_selected");
	localStorage.setItem("selected", menu_item);

	//make the height the window height minus the top of the container
	

	if($("#" + menu_item + "_table").length != 0){
		var height = $(window).height() - $("#" + menu_item + "_table").position().top - 80;
		$(".table_container").height(height);
	}
	
	
}

//Bind events to UI on page load and initialize it.
$(function(){	
	//initialize containers for main menu
	$(".main_container").hide();
	$(".main_container").removeClass("hidden");
	var previous_view = localStorage.getItem("selected");

	if(previous_view != undefined){
		//show saved menu
		ui.showMenu(previous_view);
	
	} 
	//Main Menu Controls
	$("#main_menu > div").click(function(){
		//menu item ids are like: menu_judges
		var menu_item_name = $(this).attr("id").substr(5);
		//TODO: save menu state in a model so it opens to where you were if browser gets closed
		ui.showMenu(menu_item_name);
		$(this).removeClass("menu_item");
		
	});

	//dialogs
	$(".dialog").hide();

	
});	

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

/*
=========================================
Load localStorage into Collections
=========================================
*/	

//note: calling fetch runs the constructors of the models.
collection.teams.fetch({silent:true});
collection.divisions.fetch({silent:true});
collection.schools.fetch();
collection.judges.fetch({silent:true});
collection.rooms.fetch({silent:true});
collection.rounds.fetch({silent:true});

collection.restoreReferences();	



/*
=========================================
Initialize Backbone Views
=========================================
*/	
//turn object copies into object references to original models
view.teamTable = new view.TeamTable(); 
view.schoolTable = new view.SchoolTable(); 
view.divisionTable = new view.DivisionTable(); 
view.judgeTable = new view.JudgeTable(); 
view.roomTable = new view.RoomTable();  
view.roundTable = new view.RoundTable();


//initialize forms

view.teamForm = new view.TeamForm();
view.judgeForm = new view.JudgeForm();
view.roomForm = new view.RoomForm();
view.schoolForm = new view.SchoolForm();
view.divisionForm = new view.DivisionForm();
view.roundForm = new view.RoundForm();
view.setupScreen = new view.SetupScreen();

view.renderAll();


/*
=========================================
Debug event bindings
=========================================
*/	

$(function(){


$("#debug_tournament_id").html("Tournament ID: " + '<a href="/tab/'+tab.tournament_id+'">' + tab.tournament_id + '</a>');
$("#clear_storage").click(function(){
	console.log("asdf");
	var dialog = $('<div>You are about to delete ALL LOCAL DATA <br />This will erase the entire tournament! Continue?</div>')
	$( dialog ).dialog({
		resizable : false,
		height :190,
		modal : true,
		title : 'Delete localStorage',
		buttons : {
			"Yes": function() {
				localStorage.clear();
				$(this).dialog("close");
			},
			"No": function() {
				$(this).dialog("close");
			}
		}
	});

	
});


$("#pair_delete_all_rounds").click(function(){
	
	$.confirm({
			'title'		: 'Delete All Rounds',
			'message'	: 'You are about to delete ALL ROUNDS <br />This will erase the entire tournament! Continue?',
			'buttons'	: {
				'Yes'	: {
					
					'class'	: 'blue',
					'action': pairing.deleteAllRounds
				},
				'No'	: {
					'class'	: 'gray',
					'action': function(){}	
				}
			},
			
		});
	
});




$("#toggle_debug").click(function(){
	tab.debug = !(tab.debug);
	localStorage["debug"] = tab.debug;
	console.log("debug mode is now " + tab.debug);
});

$("#pair_print_pairings").click(function(){
	//print pairings for every division and every round
	var rounds = [];
	for(var i = 0; i < collection.rounds.length; i++){
		if(rounds.indexOf(collection.rounds.at(i).get("round_number")) === -1){
			rounds.push(collection.rounds.at(i).get("round_number"));
		}
	}
	for(var i = 0; i < collection.divisions.length; i++){
		for(var j = 0; j < rounds.length; j++){
			pairing.printPairings(rounds[j], collection.divisions.at(i));
		}
	}

});


$("#save_to_database").click(function(){
	var tourneyData = {};
	tourneyData.divisions = collection.divisions;
	tourneyData.teams = collection.teams;
	tourneyData.schools = collection.schools;
	tourneyData.judges = collection.judges;
	tourneyData.rooms = collection.rooms;
	tourneyData.rounds = collection.rounds;
	tourneyData.tourney_id = 12812;	//date of tourney
	
	var export_string = JSON.stringify(tourneyData,"",'\t');
	console.log(export_string);
	
	$.post('/saveTourney', {tourneyData: export_string},
		function(data){
				
		
		});

});


$("#get_from_database").click(function(){

	$.get('/getTourney', function(data){
		
		collection.import(data);
		
	});

});

$("#validate_round").click(function(){
		
		round_number = $("#rounds_round_number_select").val();
		division = $("#rounds_division_select").val();
		pairing.validateRounds(round_number, division);
		console.log("clicked");
});

/*
=========================================
Edit round event bindings
=========================================
*/	

$("#send_sms").click(function(){
	var div_id = $("#rounds_division_select").val();
	var division = collection.getDivisionFromId(div_id);

	var round_number = $("#rounds_round_number_select").val();
	$("#sms_confirm_message").text("Send text for " + division.get("division_name") + " and round " + round_number);
	$( "#sms_confirm" ).dialog({
				resizable: false,
				height:250,
				modal: true,
				buttons: {
					"Send": function() {
						pairing.sendSms(round_number, division);
						$( this ).dialog( "close" );
					},
					Cancel: function() {
						$( this ).dialog( "close" );
					}
				}
			});
});


$("#print_boxes").click(function(){
	view.roundTable.printBoxes();
})




//grow tables to fill window space after forms

/*
=========================================
Miscellaneous visual effects
=========================================
*/	



});
