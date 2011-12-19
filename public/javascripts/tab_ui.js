//UI module
tab.ui = (function (){

//define functions for UI
this.showMenu = function(menu_item){
	$(".main_container").hide();
	$("#" + menu_item + "_container").show();
	$("#main_menu > li").removeClass("menu_item_selected");
	$("#main_menu > li").addClass("menu_item");
	$("#menu_" + menu_item).addClass("menu_item_selected");
	
}

//Bind events to UI on page load and initialize it.
$(function(){	
	
	//Main Menu Controls
	$("#main_menu > li").click(function(){
		//menu item ids are like: menu_judges
		var menu_item_name = $(this).attr("id").substr(5);
		//TODO: save menu state in a model so it opens to where you were if browser gets closed
		showMenu(menu_item_name);
		$(this).removeClass("menu_item");
		
	});

	//initialize containers for main menu
	$(".main_container").hide();
	$(".main_container").removeClass("hidden");
	showMenu("rounds");
});	


}()); //end the IIFE