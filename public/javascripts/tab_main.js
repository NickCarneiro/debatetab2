/*
=====
DebateTab
Author: Nick Carneiro
=====
*/



var tab = {
	debug: false,
	warnings: []
};
//one var per declaration helps protect against accidental globals
var model = {};
var view = {};
//currently unused
var router = {};
var collection = {};

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

//debug console
console.dbg = function(message){
	if(tab.debug === true){
		console.log(message);
	}
}

//functions to manipulate the interface and ui state
var ui = {};



