//UI module

//define functions for UI
ui.showMenu = function(menu_item){
	$(".main_container").hide();
	$("#" + menu_item + "_container").show();
	$("#main_menu > li").removeClass("menu_item_selected");
	$("#main_menu > li").addClass("menu_item");
	$("#menu_" + menu_item).addClass("menu_item_selected");
	localStorage.setItem("selected", menu_item);
	
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
	$("#main_menu > li").click(function(){
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
collection.schools.fetch({silent:true});
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
view.statsArea = new view.StatsArea();



//restore references is silent so we have to manually render	
//view.renderAll();

/*
=========================================
Debug event bindings
=========================================
*/	

$(function(){


$("#debug_tournament_id").html("Tournament ID: " + '<a href="/tab/'+tab.tournament_id+'">' + tab.tournament_id + '</a>');
$("#clear_storage").click(function(){

	$.confirm({
			'title'		: 'Clear localStorage',
			'message'	: 'You are about to delete ALL LOCAL DATA <br />This will erase the entire tournament! Continue?',
			'buttons'	: {
				'Yes'	: {
					
					'class'	: 'blue',
					'action': collection.emptyCollections,
				},
				'No'	: {
					'class'	: 'gray',
					'action': function(){}	
				}
			},
			
		});
	
});

$("#export_data").click(function(){
	collection.exportAll();
});	

$("#import_data").click(function(){
	var json = $("#import_box").val();
	collection.import(json);
});	

$("#import_joy_data").click(function(){
	var joy_data = $("#import_box").val().trim();
	collection.importJoyFile(joy_data);
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

//client-side function call Code for sending a single text
$("#single_text").click(function(){

	var pNumber = $("#debug_sms_input_phone").val();
	if(pNumber == '' || pNumber == ' ') {
		pNumber = ' ';
		$("#debug_sms_input_phone").val("<Phone Number> for single");
		con.write("For a single text, enter phone number. There is no default. Not sending msg.");
		return;
	}

	var msg = $("#debug_sms_input_message").val();
	if($.trim(msg) == '') {
		msg = 'Hello World!';
	}

	var data = {phone_number: pNumber, message: msg};

	$.post("/text", data, function(res){
		console.log('Message sent from UI: ' + res.body);
		con.write(res);
		$("#debug_sms_input_phone").val("");
		$("#debug_sms_input_message").val("");
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


/*
=========================================
Edit round event bindings
=========================================
*/	
$("#edit_round_swap").click(function(){
	console.log("swapping sides");
	view.roundTable.swapSides();
})

$("#print_boxes").click(function(){
	view.roundTable.printBoxes();
})

$("#edit_round_cancel").click(function(){
	$("#edit_round_error").html("");
	$("#selected_team_winnder").html("");
	$("#edit_round_lpw").attr("checked", false);
	$("#edit_round_dialog").dialog("close");
});

$("#edit_round_judge").change(function(){
	view.roundTable.changeJudge();
});

$("#left_team_select, #right_team_select").live("change", function(){
	view.roundTable.changeTeam();
});

$("#edit_round_room").live("change", function(){
	view.roundTable.changeRoom();
});

$("#edit_round_save").click(function(){
	view.roundTable.saveRound();
});

$("#edit_round_result").change(function(){
	view.roundTable.displayWinner()
});


});
