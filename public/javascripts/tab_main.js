/*
=====
DebateTab
Author: Nick Carneiro
=====
*/

var tab = {
	debug: false,
	warnings: [],
	tournament_id: undefined
};


//one var per declaration helps protect against accidental globals
var model = {};
var view = {};
//currently unused
var router = {};
var collection = {};

//functions for generating ballots, boxes, pairings, breaks, brackets
var forms = {};

//contains helpful functions for pairing rounds
var pairing = {};
pairing.name2debate = {};
// define HashMap of round names to num_debates_that_take_place
pairing.name2debate["triple octafinals"] = 32;
pairing.name2debate["double octafinals"] = 16;
pairing.name2debate["octafinals"] = 8;
pairing.name2debate["quarterfinals"] = 4;
pairing.name2debate["semifinals"] = 2;
pairing.name2debate["finals"] = 1;

pairing.debate2name = {};
//define HashMap of num_debates_that_take_place to round names
pairing.debate2name["32"] = "triple octafinals";
pairing.debate2name["16"] = "double octafinals";
pairing.debate2name["8"] = "octafinals";
pairing.debate2name["4"] = "quarterfinals";
pairing.debate2name["2"] = "semifinals";
pairing.debate2name["1"] = "finals";

pairing.result_types = {
	"0": "AFF Win Neg Loss",
	"1": "AFF BYE Neg Forfeit",
	"2": "Neg Win Aff Loss",
	"3": "Neg BYE Aff Forfeit",
	"4": "Double Win",
	"5": "Double Loss",
	"6": "Double BYE",
	"7": "Double Forfeit"

}

//debug console
console.dbg = function(message){
	if(tab.debug === true){
		console.log(message);
	}
}


//load debug status on page load. off by default
tab.debug = true;
if(localStorage["debug"] != undefined){

	tab.debug = localStorage["debug"] === "true" ? true: false;
	//console.log("debug mode is " + tab.debug);
}

//functions to manipulate the interface and ui state
var ui = {};

var Exception = function(message){
	this.message = message;
}


//set tournament id
if(localStorage["tournament_id"] != undefined){
	console.dbg("tournament_id was loaded from localStorage")
	tab.tournament_id = localStorage["tournament_id"]
}
else if($("#tournament_id").html().trim() != ""){
	console.log("tournament id was found in #tournament_id div");
	tab.tournament_id = $("#tournament_id").html().trim();
} else {
	console.dbg("generating new tournament id");
	tab.tournament_id = (new ObjectId()).toString();
}
console.dbg("setting tournament_id in localstorage to " + tab.tournament_id);
localStorage["tournament_id"] = tab.tournament_id;
console.dbg(tab.tournament_id);


