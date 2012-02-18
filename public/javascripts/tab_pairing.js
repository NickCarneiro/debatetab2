/*
=========================================
BEGIN: Define Pairing Functions
=========================================
*/	

// all functions for tab below this point


pairing.prelimRoundValid = function (team1, team2, round){
		//this case is for round 1 or a tournament with no power matching
	if(team1 === undefined || team2 === undefined){
		return false;
	}

	if(team1.get("division") != team2.get("division")){
		//are from the same division
		console.log("WARNING: checked for valid round between teams from different divisions.");
		return false;
	} 
	if(team1.get("school") === team2.get("school")){
		//are from same school
		return false;
	} else {
		if(round === 1 || round === undefined){
			return true;
		} else {
			if(pairing.alreadyDebated(team1, team2, round)){
				return false;
			} else {
				return true;
			}		
		}
	}
}


pairing.compareTeams = function(team){
	//comparison function used when sorting teams
	console.log("wins: " + team.get("wins"));
	return team.get("wins");

}

//called by update records.
//loops through speaks array and sums them.
//sets total_speaks and adjusted_speaks
pairing.updateSpeaks = function(){
	$.each(collection.teams, function(i){
		var team = collection.teams.at(i);
		var speaks = team.get("speaks");
		var all_points = [];

		var total_points = 0;
		var adjusted_points = 0;
		//copy speaker points into another array that we can sort
		$.each(speaks, function(j, point){
			all_points.push(point);
		});

		//if any round has a zero, that means it was a bye. average the other rounds.
		var division = team.get("division");
		if(division.get("comp_per_team") == 1){
			//ld
			var total = 0;
			$.each(all_points, function(j, point){
				total += parseFloat(point);
			});

			var avg = total / all_points.length;
			//insert average for any bye rounds
			$.each(all_points, function(j, point){
				if(point == 0){
					all_points[j] = avg;
				}
			});
		} else {
			//cx or pf. 
			/*
			0 John's speaks
			1 Jack's speaks
			2 John's speaks
			3 Jack
			4 John 
			5 Jack
			*/

			var speaker1 = 0;
			var speaker2 = 0;
			$.each(all_points, function(j, point){
				if(j % 2 === 0){
					speaker1 += parseFloat(point);
				} else {
					speaker2 += parseFloat(point)
				}
				
			});

			var speaker1_avg = speaker1 / (all_points.length / 2);
			var speaker2_avg = speaker2 / (all_points.length / 2);

			//insert average for any bye rounds
			$.each(all_points, function(j, point){
				if(j % 2 === 0){
					if(point == 0){
						all_points[j] = speaker1_avg;
					}
				} else {
					if(point == 0){
						all_points[j] = speaker2_avg;
					}
				}
				
			});


		}

		all_points.sort();

		

		//TODO check what high lows means
		$.each(all_points, function(j, point){
			total_points += parseFloat(point);

			//array is sorted. to drop high lows, skip first and last
			if(j < all_points.length - 1 && j > 0){
				adjusted_points += parseFloat(point);
			}
		});

		team.set({"total_points": total_points, adjusted_points: adjusted_points});

	});
}

//iterates over round collection and sets wins, losses in each team model
//in the teams collection
pairing.updateRecords = function(){
//update win loss records for each team
	for(var i = 0; i < collection.teams.length; i++){
		collection.teams.at(i).set({wins:  0});
		collection.teams.at(i).set({losses: 0});
		collection.teams.at(i).set({speaks: []});
		collection.teams.at(i).set({ranks: []});

		for(var j = 0; j < collection.rounds.length; j++){
			//get winner
			if(collection.rounds.at(j).getWinner() === collection.teams.at(i)){
				var new_wins = collection.teams.at(i).get("wins") + 1;
				collection.teams.at(i).set({wins: new_wins});
			}
			if(collection.rounds.at(j).getLoser() === collection.teams.at(i)){
				var new_losses = collection.teams.at(i).get("losses") + 1;
				collection.teams.at(i).set({losses: new_losses});
			}

			//update speaker points
			var aff_points = collection.rounds.at(j).get("aff_points") || [];
			var neg_points = collection.rounds.at(j).get("neg_points") || [];
		
			if(collection.rounds.at(j).get("team1") === collection.teams.at(i) 
				&& collection.rounds.at(j).get("aff") == 0 
				|| collection.rounds.at(j).get("team2") === collection.teams.at(i) 
				&& collection.rounds.at(j).get("aff") == 1 ){
				var new_speaks = collection.teams.at(i).get("speaks");
				var new_ranks = collection.teams.at(i).get("ranks");
				for(var k = 0; k < aff_points.length; k++){
					new_speaks.push(aff_points[k].speaks);
					new_ranks.push(aff_points[k].rank);
				}
				collection.teams.at(i).set({"speaks": new_speaks});
				collection.teams.at(i).set({"ranks": new_ranks});
			
			} else if(collection.rounds.at(j).get("team1") === collection.teams.at(i)
				&& collection.rounds.at(j).get("aff") == 1 
				||collection.rounds.at(j).get("team2") === collection.teams.at(i) 
				&& collection.rounds.at(j).get("aff") == 0 ){
				var new_speaks = collection.teams.at(i).get("speaks");
				var new_ranks = collection.teams.at(i).get("ranks");
				for(var k = 0; k < neg_points.length; k++){
					new_speaks.push(neg_points[k].speaks);
					new_ranks.push(neg_points[k].rank);
				}

				collection.teams.at(i).set({"speaks": new_speaks});
				collection.teams.at(i).set({"ranks": new_ranks});
			}
		}

		//calculate totals
		var speaks = collection.teams.at(i).get("speaks");
		var ranks = collection.teams.at(i).get("ranks");
		//total ranks
		var total_ranks = 0;
		for(var j = 0; j < ranks.length; j++){
			var ranks_float = parseFloat(ranks[j]) || 0;
			total_ranks += ranks_float;
		}

		var speaks_copy = [];
		for(var j = 0; j < speaks.length; j++){
			speaks_copy[j] = speaks[j];
		}
		//drop high and low
		speaks_copy = speaks_copy.sort();
		if(speaks_copy.length >=3){
			speaks_copy[0] = 0;
			speaks_copy[speaks_copy.length-1] = 0;
		}
		var adjusted_speaks = 0;
		for(var j = 0; j < speaks_copy.length; j++){
			var speaks_float = parseFloat(speaks_copy[j]) || 0;
			adjusted_speaks += speaks_float;
		}
		var total_speaks = 0;
		var high = -1;
		var low = 1000;
		for(var k = 0; k < speaks.length; k++){
			var speaks_float = parseFloat(speaks[k]) || 0;
			total_speaks += speaks_float;
		}
		collection.teams.at(i).set({"total_speaks": total_speaks});
		collection.teams.at(i).set({"adjusted_speaks": adjusted_speaks});
		collection.teams.at(i).set({"total_ranks": total_ranks});
		collection.teams.at(i).save();

	}

	pairing.updateSpeaks();
}

pairing.deleteAllRounds = function(){
	
	console.dbg("rounds length " + collection.rounds.length);
	while(collection.rounds.at(0) != undefined){
	
		console.dbg("removing round " + collection.rounds.at(0).get("team1"));
		collection.rounds.at(0).destroy();
		//collection.rounds.remove(round);
	}
}

//delete all existing rounds in this round number and division
pairing.deleteRound = function(round_number, division){
	
	var toDelete = [];
	for(var i = 0; i < collection.rounds.length; i++){
		if(collection.rounds.at(i).get("division") === division && collection.rounds.at(i).get("round_number") === round_number){
			toDelete.push(collection.rounds.at(i));
		}
	}

	for(var i = 0; i < toDelete.length; i++){
		toDelete[i].destroy();
	}
}

//generate random results for specified round
pairing.simulateResults = function(round_number, division){
	//generate results for specified round
	$.each(collection.rounds, function(k){
		var round = collection.rounds.at(k)
			if(round.get("round_number") === round_number && round.get("division") === division){	
			
			//result is 0 thru 3
			round.set({result: Math.floor(Math.random() * 4)});

			//TODO: set speaker points and ranks

		}
	});
}

pairing.runSimulation = function(){
	$.each(collection.divisions, function(i){
		var division = collection.divisions.at(i);
		for(var j = 1; j < 3; j++){
			pairing.simulateResults(j, division);
		}
		
	});
	pairing.updateRecords();
	pairing.printRecords();
};



//set the sides in a debate round by setting Round.aff to 0 (team1) or 1 (team2)
//TODO: make better than random
pairing.setSides = function(round_number, division){

	//if round_number is one, choose sides randomly
	if(round_number === 1){
		for(var i = 0; i < collection.rounds.length; i++){
			//skip irrelevant rounds
			if(collection.rounds.at(i).get("round_number") != round_number || collection.rounds.at(i).get("division") != division){
				continue;
			}
			collection.rounds.at(i).set({aff: Math.floor(Math.random() * 2)});
		}
		
	} else{
		//give aff to the team with fewer aff rounds
		var sides = [];
		//one pass over teams to initialize affs and negs to zero
		for(var i = 0; i < collection.teams.length; i++){
			if(collection.teams.at(i).get("division") != division){
				continue;
			}
			sides[collection.teams.at(i).get("id")] = {aff: 0, neg: 0};
		}

		for(var i = 0; i < collection.rounds.length; i++){
			//one pass over previous rounds to count affs and negs for each team
			if(collection.rounds.at(i).get("round_number") >= round_number || collection.rounds.at(i).get("division") != division){
				continue;
			}
			if(collection.rounds.at(i).get("team1") != undefined 
				&& collection.rounds.at(i).get("team2") != undefined){
					
				if(collection.rounds.at(i).get("aff") === 0){
					sides[collection.rounds.at(i).get("team1").get("id")].aff++;
					sides[collection.rounds.at(i).get("team2").get("id")].neg++;
				} else if(collection.rounds.at(i).get("aff") === 1){
					sides[collection.rounds.at(i).get("team1").get("id")].neg++;
					sides[collection.rounds.at(i).get("team2").get("id")].aff++;
				} else {
					console.log("WARNING: previous round had no side set");
				}
			
			}
		}
		
		//set sides according to past records
		for(var i = 0; i < collection.rounds.length; i++){
			//skip irrelevant rounds
			if(collection.rounds.at(i).get("round_number") != round_number || collection.rounds.at(i).get("division") != division){
				continue;
			}
			//skip bye rounds
			if(collection.rounds.at(i).get("team1") === undefined 
				|| collection.rounds.at(i).get("team2") === undefined){
				continue;
			}
			if(sides[collection.rounds.at(i).get("team1").get("id")] > sides[collection.rounds.at(i).get("team2").get("id")]){
				//team2 should be aff
				collection.rounds.at(i).set({aff: 1});
			} else {
				//team1 should be aff
				collection.rounds.at(i).set({aff: 0});
			}

		} 
	}
	
}

pairing.setFlip = function(round_number, division){
	$.each(collection.rounds, function(i){
		var round = collection.rounds.at(i);
		if(round.get("round_number") === round_number && round.get("division") === division){
			round.set({aff: "flip"});
		}
	});
};

//return number of debates scheduled for @round_number
pairing.roundCount = function(round_number){
	var count = 0;
	for(var i = 0; i < collection.rounds.length; i++){
		if(collection.rounds.at(i).get("round_number") === round_number){
			count++;
		}
	}
	//console.log("roundCount " + count);
	return count;
};


pairing.printRecords = function(division){
	collection.teams.sort();
	//
	$.each(collection.divisions, function(index){
		var div = collection.divisions.at(index);
		if(division === div || division === undefined){
			
			console.log("############## TEAM RECORDS IN " + div.get("division_name") + " ###############");
			for(var i = 0; i < collection.teams.length; i++){
				if(collection.teams.at(i).get("division") != div){
					continue;
				}
				var padding = 20 - collection.teams.at(i).get("team_code").length;
					var spaces = "";
					for(var j = 0; j < padding; j++){
						spaces = spaces + " ";
					}
				console.log(collection.teams.at(i).get("team_code") + " : " +  
					spaces + collection.teams.at(i).get("wins") + "-" + collection.teams.at(i).get("losses"));
			}
		}
	});
}




//returns true if two teams have already debated each other in prelims
pairing.alreadyDebated = function(team1, team2, round_number){

	for(var i = 0; i < collection.rounds.length; i++){
		if(collection.rounds.at(i).get("round_number") < round_number){
			if(collection.rounds.at(i).get("team1") == team1 && collection.rounds.at(i).get("team2") == team2){
				return true;
			} else if(collection.rounds.at(i).get("team1") == team2 && collection.rounds.at(i).get("team2") == team1){
				return true;
			} 
		}
		
	}
	//if we get here, they have never debated.
	return false;
}

/**
Print pairings in the debug console. Does not modify anything. Just prints.
**/
pairing.printPairings = function(round_number, division){
	console.log("############## ROUND " + round_number +" in " + division.get("division_name") + "###############");
	for(var i = 0; i < collection.rounds.length; i++){
		if(collection.rounds.at(i).get("round_number") === round_number
			&& collection.rounds.at(i).get("division") === division){
			if(collection.rounds.at(i).get("aff") === 0 || 
				collection.rounds.at(i).get("aff") === undefined){
				var left_team = collection.rounds.at(i).get("team1");
				var right_team = collection.rounds.at(i).get("team2");
			}else {
				var left_team = collection.rounds.at(i).get("team2");
				var right_team = collection.rounds.at(i).get("team1");
			}
			
			var left_team_code = left_team === undefined ? "BYE" : left_team.get("team_code");
			var padding = 30 - left_team_code.length;
			var spaces = "";
			for(var j = 0; j < padding; j++){
				spaces = spaces + " ";
			}
			var room = "";
			if(collection.rounds.at(i).get("room") != undefined){
				room = collection.rounds.at(i).get("room").get("name");
			}

			var judge = "#";
			if(collection.rounds.at(i).get("judge") != undefined){
				judge = collection.rounds.at(i).get("judge").get("name");
			}
			var right_team_code = right_team === undefined ? "BYE" : right_team.get("team_code");
			console.log(left_team_code + spaces + 
				right_team_code + " " + room + " " + judge);
			}
		
	}

}

/*
Make sure no team gets a BYE if they have already had one in a previous round
*/
pairing.fixRepeatedByes = function(round_number, division){

	//first, find the team with a bye. assuming there is only 1.
	var bye_round = undefined; //round where bye is occurring
	var bye_team = undefined; //team that has no opponent
	var bye_round_index = undefined;
	$.each(collection.rounds, function(i){
		var round = collection.rounds.at(i);
		//skip all irrelevant rounds
		if(collection.rounds.at(i).get("round_number") != round_number || collection.rounds.at(i).get("division") != division){
			return true;
		}

		var team1 = collection.rounds.at(i).get("team1");
		var team2 = collection.rounds.at(i).get("team2");

		if(team1 === undefined || team2 === undefined){
			bye_round = round;
			bye_team = team1 === undefined ? team2 : team1;
			bye_round_index = i;
		}

	});
	

	if(bye_round != undefined){
		console.dbg("bye found: " + bye_team.get("team_code"));
		if(pairing.alreadyHadBye(bye_team, round_number, division) === true){
			//find someone who can debate against bye in bye_round
			//console.log(bye.get("team_code") + " has already had a bye. Finding valid opponent.");
			//this code is run after the power match so rounds are in sorted order of most wins to fewest.
			//first try to go downwards to find a valid opponent.
			//console.log("going downward to find team to swap for bye");
			for(var i = bye_round_index + 1; i < collection.rounds.length; i++){
				//try to take team1
				if(pairing.prelimRoundValid(bye, collection.rounds.at(i).get("team1"))){
					if(!pairing.alreadyHadBye(collection.rounds.at(i).get("team2"))){
						//found a valid switch. 
						pairing.replaceByeWithTeam(bye_round, collection.rounds.at(i).get("team1"));
						return;
					}
				}
				//couldn't take team1. try team2.
				if(!pairing.prelimRoundValid(bye, collection.rounds.at(i).get("team2"))){
					if(!pairing.alreadyHadBye(collection.rounds.at(i).get("team1"))){
						//found a valid switch. 
						pairing.replaceByeWithTeam(bye_round, collection.rounds.at(i).get("team2"));
						return;
					}
				}
			}

			//console.log("going upward to find team to swap for bye");
			//try going upward from the bye round if nothing below works.
			for(var i = bye_round_index - 1; i >= 0; i--){
				//try to take team1
				if(pairing.prelimRoundValid(bye, collection.rounds.at(i).get("team1"))){
					if(!pairing.alreadyHadBye(collection.rounds.at(i).get("team2"))){
						//found a valid switch. 
						pairing.replaceByeWithTeam(bye_round, collection.rounds.at(i).get("team1"));
						//over write source team with bye
						
						collection.rounds.at(i).set({"team1": undefined});

						return;
					}
				}
				//couldn't take team1. try team2.
				if(!pairing.prelimRoundValid(bye, collection.rounds.at(i).get("team2"))){
					if(!pairing.alreadyHadBye(collection.rounds.at(i).get("team1"))){
						//found a valid switch. 
						pairing.replaceByeWithTeam(bye_round, collection.rounds.at(i).get("team2"));
						//over write source team with bye
						
						collection.rounds.at(i).set({"team2": undefined});

						return;
					}
				}
			}

			console.log("ERROR: could not fix bye by switching teams");

		}
	} else {
		//no byes found
		console.dbg("No byes found");
	}

}

//@round is the bye round that is being modified
//@team is the real team replacing the bye team in @round
pairing.replaceByeWithTeam = function(round, team){
	
	
	if(round.get("team1") === undefined){
		//replace team1
		round.set({team1: team});
		console.log("Replacing bye for " + round.get("team2").get("team_code") + " with " + team.get("team_code"));
	} else if(round.get("team2") === undefined){
		//replace team 2
		round.set({team2: team});
		console.log("Replacing bye for " + round.get("team1").get("team_code") + " with " + team.get("team_code"));

	} else {
		console.log(round);
		console.log("FATAL ERROR: bye round in replaceByeWithTeam was not actually a bye round. See chrome console.")
	}
}
/*
return true if @team has already had a bye.
@division is the division that @team is competing in
@round is the round that the caller is currently attempting to pair
*/
pairing.alreadyHadBye = function(team, round_number, division){
	//found a bye. check the other rounds.
		for(var i = 0; i < collection.rounds.length; i++){
			if(collection.rounds.at(i).get("round_number") < round_number && collection.rounds.at(i).get("division") === division){
				//only check previous rounds in the division this team is entered.
				var team1 = collection.rounds.at(i).get("team1");
				var team2 = collection.rounds.at(i).get("team2");
				if(team1 === team && team2 === undefined){
					//team has had a bye previously
					return true;

				} else if(team2 === team && team1 === undefined){
					//team has had a bye previously
					return true
				} 
			}
		}
		//didn't find any previous byes
		return false;
}



//flip for sides in the third round
pairing.pairUilPrelim = function(round_number, division){
	

	pairing.updateRecords();
	pairing.printRecords(division);
	pairing.deleteRound(round_number, division);

	try{
		if(round_number < 3){
			//no power match
			pairing.pairPrelim(round_number, division);


		} else if(round_number === 3){
			//powermatch and flip
			pairing.pairPrelim(round_number, division, {powermatch: true, flip: true});
		} else {
			console.log(typeof round_number);
		}

		if(tab.warnings.length > 0){
			view.showWarningsDialog();
		}
	} catch(e){
		//show error dialog
		console.log(e.message);
		console.log(e);
		view.showMessageDialog(e.message);
	}

}

//set "desired_side" property on each team's model
pairing.getSideConstraints = function(round_number, division){
	//check sides for all previous rounds
	$.each(collection.rounds, function(i){
		var round = collection.rounds.at(i);

		//skip irrelevant rounds
		if(round.get("round_number") >= round_number || round.get("division") != division){
			return true;
		}

		//if it was a bye, don't increment anything
		if(round.get("team1") === undefined || round.get("team2") === undefined){
			return true;
		}

		if(round.get("aff") === 0){
			var aff = round.get("team1");
			var aff_debates = aff.get("aff_debates") || 0;
			aff_debates++;
			aff.set({aff_debates: aff_debates});

			var neg = round.get("team2");
			var neg_debates = neg.get("neg_debates") || 0;
			neg_debates++;
			neg.set({neg_debates: neg_debates});
		} else {
			var aff = round.get("team2");
			var aff_debates = aff.get("aff_debates") || 0;
			aff_debates++;
			aff.set({aff_debates: aff_debates});

			var neg = round.get("team1");
			var neg_debates = neg.get("neg_debates") || 0;
			neg_debates++;
			neg.set({neg_debates: neg_debates});
		}

	});

	//set desired round for each team
	$.each(collection.teams, function(i){
		//skip irrelevant rounds
		var team = collection.teams.at(i);

		if(team.get("division") != division){
			return true;
		}
		if(team.get("aff_debates") > team.get("neg_debates")){
			team.set({desired_side: "neg"});
		} else if(team.get("aff_debates") < team.get("neg_debates")){
			team.set({desired_side: "aff"});
		} else {
			team.set({desired_side: "none"});
		}
	})
}

//The big daddy pairing function for non-powermatched rounds
pairing.pairPrelim = function(round_number, division, options){
	if(round_number > 1){
		//worry about side constraints

		pairing.getSideConstraints(round_number, division);
		var desired_aff = [];
		var desired_neg = [];
		var desired_any = [];

		$.each(collection.teams, function(i){
			var team = collection.teams.at(i);
			if(team.get("stop_scheduling") === true || team.get("division") != division){
				return true;
			}
			if(team.get("desired_side") === "aff"){
				desired_aff.push(team);
			} else if(team.get("desired_side") === "neg"){
				desired_neg.push(team)
			} else {
				//put no desire on shorter side.
				if(desired_neg.length < desired_aff.length){
					desired_neg.push(team);
				} else {
					desired_aff.push(team);
				}
			}
		});

		//all the teams that we need to pair are in desired_aff or desired_neg
		console.dbg("desired_aff: " + desired_aff.length);
		console.dbg("desired_neg: " + desired_neg.length);
		var total_teams = desired_aff.length + desired_neg.length
		console.dbg("total teams to pair: " + total_teams);

		var already_paired = {};

		var powermatch = options === undefined ? false : options.powermatch;
		if(powermatch === true){
			collection.teams.sort();
		} else {
			collection.teams.models = _.shuffle(collection.teams.models);
		}

		//match up desired aff teams with desired neg teams
		$.each(desired_aff, function(i, team1){
			//skip teams already on pairing
			if(already_paired[team1.id] != undefined){
				return true;
			}
			console.dbg("finding competitor for " + team1.get("team_code"));
			$.each(desired_neg, function(j, team2){
				console.dbg("checking " + team2.get("team_code"));
				//skip team2 if already paired
				if(already_paired[team2.id] != undefined){
					return true;
				}

				//skip team2 if already debated
				if(pairing.alreadyDebated(team1, team2, round_number)){
					console.dbg(team1.get("team_code") + " had already debated " + team2.get("team_code"));
					return true;
				}

				if(pairing.prelimRoundValid(team1, team2)){
					
					//put both teams in round
					var round = new model.Round({division: division, round_number: parseInt(round_number), judge: undefined});
					round.set({team1: team1});
					round.set({team2: team2});
					round.set({aff: 0});
					collection.rounds.add(round);
					//mark as paired
					already_paired[team1.id] = true;
					already_paired[team2.id] = true;

					console.dbg("found valid team: " + team2.get("team_code"));
					//go to next team1 in outer loop
					return false;

				}
			});
		});

		//at this point we've tried to pair everyone,
		//but there could be a double bye at the bottom of the pairing
		//because the two remaining teams could not debate

		var unpaired_teams = pairing.getUnpairedTeams(already_paired, division);
		console.dbg("total teams: " + total_teams);
		console.dbg("unpaired teams: " + unpaired_teams.length);
		//find a place for unpaired teams
		pairing.pairRemainingTeams(round_number, division, unpaired_teams, options);
		
		//make sure no team has had more than 1 bye
		pairing.fixRepeatedByes(round_number, division);

		var flip = options === undefined ? false : options.flip;
		if(flip === true){
			pairing.setFlip(round_number, division);
		} else {
			pairing.setSides(round_number, division);
		}
		pairing.pairJudges(round_number, division);
		pairing.pairRooms(round_number, division);
		


	} else { //first round. don't worry about side constraints
		
	
	var total_teams = collection.teamsInDivision(division);
	var total_rounds = Math.ceil(total_teams / 2);
	
	collection.teams.models = _.shuffle(collection.teams.models);
	
	

	console.log("Total teams: " + total_teams);
	console.log("Creating total rounds: " + total_rounds);
	

	//for each round, find some opponents
	var already_paired = {};
	
	$.each(collection.teams, function(i){
		var team1 = collection.teams.at(i);
		//skip team2 if not in division
		if(team1.get("division") != division){
			return true;
		}
		//skip teams already on pairing
		if(already_paired[team1.id] != undefined){
			return true;
		}

		if(team1.get("stop_scheduling") === true){
			return true;
		}
		console.dbg("finding competitor for " + team1.get("team_code"));


		$.each(collection.teams, function(j){
			var team2 = collection.teams.at(j);
			console.dbg("checking " + team2.get("team_code"));
			//skip team2 if already paired
			if(already_paired[team2.id] != undefined){
				return true;
			}

			if(team2.get("stop_scheduling") === true){
				return true;
			}
			//skip team2 if not in division
			if(team2.get("division") != division){
				return true;
			}
			//skip team2 if already debated
			if(pairing.alreadyDebated(team1, team2, round_number)){
				console.dbg(team1.get("team_code") + " had already debated " + team2.get("team_code"));
				return true;
			}

			if(pairing.prelimRoundValid(team1, team2)){
				
				//put both teams in round
				var round = new model.Round({division: division, round_number: parseInt(round_number), judge: undefined});
				round.set({team1: team1});
				round.set({team2: team2});
				collection.rounds.add(round);
				//mark as paired
				already_paired[team1.id] = true;
				already_paired[team2.id] = true;
				console.dbg("found valid team: " + team2.get("team_code"));
				//go to next team1 in outer loop
				return false;

			}
		});
		
	});



	//at this point we've tried to pair everyone,
	//but there could be a double bye at the bottom of the pairing
	//because the two remaining teams could not debate

	var unpaired_teams = pairing.getUnpairedTeams(already_paired, division);

	//find a place for unpaired teams
	pairing.pairRemainingTeams(round_number, division, unpaired_teams);
	
	//make sure no team has had more than 1 bye
	pairing.fixRepeatedByes(round_number, division);
	pairing.setSides(round_number, division);
	pairing.pairJudges(round_number, division);
	pairing.pairRooms(round_number, division);
	
	}
	
}

pairing.pairRemainingTeams = function(round_number, division, unpaired_teams, options){
	
	
	if(unpaired_teams.length === 0){
		//woohoo! everyone is on the pairing.
	} else if(unpaired_teams.length === 1){
		//if it's just one team, give it a bye
		console.dbg("creating a bye round because one team was left unpaired.");
		var round = new model.Round({round_number: parseInt(round_number), division: division, team1: unpaired_teams[0], judge: undefined});
		collection.rounds.add(round);
	} else if (unpaired_teams.length === 2){
		//2 unpaired teams. find rounds for them
		console.log("There were " + unpaired_teams.length + " unpaired teams");
		$.each(collection.rounds,function(i){
			var round = collection.rounds.at(i);
			//we need 4 teams total for this swap
			if(round.get("round_number") != round_number){
				return true;
			}
			if(round.get("division") != division){
				return true;
			}

			var team1 = round.get("team1");
			var team2 = round.get("team2");
			if(pairing.prelimRoundValid(team1, unpaired_teams[0]) && pairing.prelimRoundValid(team2, unpaired_teams[1])){
				console.dbg("splitting up " + team1.get("team_code") + " : " + team2.get("team_code"));
				console.dbg("created: " + team1.get("team_code") + " : " + unpaired_teams[0].get("team_code"));
				console.dbg("created: " + team2.get("team_code") + " : " + unpaired_teams[1].get("team_code"));
				var new_round = new model.Round({round_number: parseInt(round_number), 
					division: division,
					team1: team1,
					team2: unpaired_teams[0],
					judge: undefined
					});
				collection.rounds.add(new_round);
				//update existing round with swap
				round.set({team1: team2, team2: unpaired_teams[1]});
				return false;
			} else if(pairing.prelimRoundValid(team1, unpaired_teams[1]) && pairing.prelimRoundValid(team2, unpaired_teams[0])){
				
				console.dbg("splitting up " + team1.get("team_code") + " : " + team2.get("team_code"));
				console.dbg("created: " + team1.get("team_code") + " : " + unpaired_teams[1].get("team_code"));
				console.dbg("created: " + team2.get("team_code") + " : " + unpaired_teams[0].get("team_code"));
				var new_round = new model.Round({round_number: parseInt(round_number), 
					division: division,
					team1: team1,
					team2: unpaired_teams[1],
					judge: undefined
					});
				collection.rounds.add(new_round);
				//update existing round with swap
				round.set({team1: team2, team2: unpaired_teams[0]});
				return false;
			}



		});
	} else {
		//
		throw new Exception("More than 2 unpaired teams.");
	}

}


pairing.getUnpairedTeams = function(already_paired, division){
	var unpaired = [];
	$.each(collection.teams, function(i){
		var team = collection.teams.at(i);
		//skip teams that we should stop scheduling
		if(team.get("stop_scheduling") === true){
			return true;
		}

		if(team.get("division") != division){
			return true;
		}

		if(already_paired[team.id] === undefined){
			//found unpaired team
			unpaired.push(team);
		}
	});

	return unpaired;
}





pairing.pairJudges = function(round_number, division){
	//shuffle the judges
	collection.judges.models = _.shuffle(collection.judges.models);
	//copy judges into working array
	var paired_judges = [];
	var paired_judges_flighted = {};
	//count rounds that we could not find a judge for
	var no_judge = 0;

	if(division.get("flighted_rounds") === true){
		for(var i = 0; i < collection.rounds.length; i++){
			if(collection.rounds.at(i).get("division") != division 
				|| collection.rounds.at(i).get("round_number") != round_number){
				continue;
			}
			//don't give byes a judge
			if(collection.rounds.at(i).get("team1") === undefined ||
				collection.rounds.at(i).get("team2") === undefined){
				continue;
			}

			for(var j = 0; j < collection.judges.length; j++){
				var judge = collection.judges.at(j);
				//don't pair judges that have already been placed in 2 rounds
				if(paired_judges_flighted[judge.id] >= 2){
					//console.log("judge has already been paired.");
					continue;
				}
				//don't pair judges that can't judge this division
				if(judge.get("divisions").indexOf(division) === -1){
					continue;
				}
				

				if(pairing.canJudge(collection.rounds.at(i).get("team1"), collection.rounds.at(i).get("team2"), judge, round_number, division)){
					//console.log("successfully paired " + judge.get("name"));
					collection.rounds.at(i).set({judge: judge});

					if(paired_judges_flighted[judge.id] === undefined){
						paired_judges_flighted[judge.id] = 1;
						collection.rounds.at(i).set({flight: "A"});
					} else {
						paired_judges_flighted[judge.id]++;
						collection.rounds.at(i).set({flight: "B"});
					}
					
					break; //successfully paired a judge to this round. go to next round.
				} else {
					//console.log("could not pair " + judge.get("name"));
				}

			}

			//check if we successfully paired a judge
			if(collection.rounds.at(i).get("team1") != undefined &&
				collection.rounds.at(i).get("team2") != undefined){
				//if the round is not a bye and it has no judge
				if(collection.rounds.at(i).get("judge") === undefined){
					no_judge++;
				}
			}

		}
	} else {
		
		for(var i = 0; i < collection.rounds.length; i++){
			if(collection.rounds.at(i).get("division") != division 
				|| collection.rounds.at(i).get("round_number") != round_number){
				continue;
			}
			//don't give byes a judge
			if(collection.rounds.at(i).get("team1") === undefined ||
				collection.rounds.at(i).get("team2") === undefined){
				continue;
			}

			for(var j = 0; j < collection.judges.length; j++){
				var judge = collection.judges.at(j);
				//don't pair judges that have already been placed in a round
				if(paired_judges.indexOf(judge) != -1){
					//console.log("judge has already been paired.");
					continue;
				}
				//don't pair judges that can't judge this division
				if(judge.get("divisions").indexOf(division) === -1){
					continue;
				}
				

				if(pairing.canJudge(collection.rounds.at(i).get("team1"), collection.rounds.at(i).get("team2"), judge, round_number, division)){
					//console.log("successfully paired " + judge.get("name"));
					collection.rounds.at(i).set({judge: judge});
					paired_judges.push(judge);
					
					break; //successfully paired a judge to this round. go to next round.
				} else {
					//console.log("could not pair " + judge.get("name"));
				}

			}

			//check if we successfully paired a judge
			if(collection.rounds.at(i).get("team1") != undefined &&
				collection.rounds.at(i).get("team2") != undefined){
				//if the round is not a bye and it has no judge
				if(collection.rounds.at(i).get("judge") === undefined){
					no_judge++;
				}
			}

		}
	}
	if(no_judge > 0){
		var round = no_judge > 1 ? "rounds" : "round";
		tab.warnings.push("Unable to find a judge for " + no_judge + " " + round + ".");
	}
}

//checks to see if a judge has heard team1 or team2 in a prior round.

//returns true if judge, team1, or team2 is undefined
pairing.canJudge = function(team1, team2, judge, round_number, division){
	if(team1 === undefined || team2 === undefined || judge === undefined || round_number == 1){
		return true;
	}
	//check for school affiliations
	var school1 = team1.get("school");
	var school2 = team2.get("school");


	if(judge.get("school") === school1 || judge.get("school") === school2){
		return false;
	}
	

	for(var i = 0; i < collection.rounds.length; i++){

		if(collection.rounds.at(i).get("round_number") >= round_number){
			continue;
		}
		//check to see if judge has judged the either of the teams before
		if(collection.rounds.at(i).get("team1") === team1 && collection.rounds.at(i).get("judge") === judge){
			return false;
		}
		else if(collection.rounds.at(i).get("team2") === team1 && collection.rounds.at(i).get("judge") === judge){
			return false;
		}
		else if(collection.rounds.at(i).get("team1") === team2 && collection.rounds.at(i).get("judge") === judge){
			return false;
		}
		else if(collection.rounds.at(i).get("team2") === team2 && collection.rounds.at(i).get("judge") === judge){
			return false;
		}
	}
	

	return true;	
}

//if round is flighted, must call this after pairing judges
pairing.pairRooms = function(round_number, division){

	//increment every time we cannot pair a room
	var roomless = 0;

	if(division.get("flighted_rounds") == true){
		//put all available rooms into an array.
		var rooms = [];
		for(var i = 0; i < collection.rooms.length; i++){
			if(collection.rooms.at(i).get("division") === division && collection.rooms.at(i).get("stop_scheduling") != true){
				rooms.push(collection.rooms.at(i));
			}
		}

		//map judges to rooms
		var judge_room_map = {};
		$.each(collection.rounds, function(i){
			var round = collection.rounds.at(i);
			//skip rounds without judges
			if(round.get("judge") === undefined){
				return true;
			}
			//skip irrelevant rounds
			if(collection.rounds.at(i).get("division") != division 
					|| collection.rounds.at(i).get("round_number") != round_number){
					return true;
			}

			if(judge_room_map[round.get("judge").id] === undefined){
				//assign this room to this round and this judge
				if(rooms.length > 0){
					var room = rooms.pop();
					judge_room_map[round.get("judge").id] = room;
					round.set({room: room});
				} else {
					roomless++;
				}
				
			} else {
				//this judge has already had a room assigned
				var room = judge_room_map[round.get("judge").id];
				round.set({room: room});
			}

		});

		//
	} else {
		
		
		//put all available rooms into an array.
		var rooms = [];

		
		for(var i = 0; i < collection.rooms.length; i++){
			if(collection.rooms.at(i).get("division") === division && collection.rooms.at(i).get("stop_scheduling") != true){
				rooms.push(collection.rooms.at(i));
			}
		}

		//minimize room moves by keeping team1 in the same room.
		if(round_number === 1){
			//just randomly assign rooms


			
			var room_count = rooms.length;
			var round_count = 0;
			//stick a room in every round in this division with the right round number
			for(var i = 0; i < collection.rounds.length; i++){
				//only give out rooms to valid rounds
				if(collection.rounds.at(i).get("division") != division 
					|| collection.rounds.at(i).get("round_number") != round_number){
					continue;
				}

				//don't give byes a room
				if(collection.rounds.at(i).get("team1") === undefined ||
					collection.rounds.at(i).get("team2") === undefined){
					continue;
				}

				round_count++;
				if(rooms.length > 0){
					room = rooms.pop();
					collection.rounds.at(i).set({room: room});
				} else {
					roomless++;
					console.dbg("WARNING: Needed another room.")
				}


			}

			if(room_count < round_count){
				tab.warnings.push("WARNING: Only had " + room_count + " rooms. Needed " + round_count);
			}
		} else {
			//construct associative array of team1's and rooms.
			var prev_rooms = {};
			for(var i = 0; i < collection.rounds.length; i++){
				//only look at previous round in this division
				if(collection.rounds.at(i).get("division") != division 
					|| collection.rounds.at(i).get("round_number") != round_number - 1){
					continue;
				}
				//byes don't have rooms to get
				if(collection.rounds.at(i).get("team1") === undefined ||
					collection.rounds.at(i).get("team2") === undefined){
					continue;
				}
				var team1_id = collection.rounds.at(i).get("team1").get("id");
				prev_rooms[team1_id] = collection.rounds.at(i).get("room");
			}
			//now dish out rooms based on where team1 was last round

			for(var i = 0; i < collection.rounds.length; i++){
				//only give out rooms to valid rounds
				if(collection.rounds.at(i).get("division") != division 
					|| collection.rounds.at(i).get("round_number") != round_number){
					continue;
				}
				//don't give byes a room
				if(collection.rounds.at(i).get("team1") === undefined ||
					collection.rounds.at(i).get("team2") === undefined){
					continue;
				}

				round_count++;
				var team1_id = collection.rounds.at(i).get("team1").get("id");
				var team2_id = collection.rounds.at(i).get("team2").get("id");
				var room1 = prev_rooms[team1_id];
				var room2 = prev_rooms[team2_id];
				if(room1 != undefined && rooms.indexOf(room1) > -1){
					//team1 stays in same room		
					var room_index = rooms.indexOf(room1);
					
					collection.rounds.at(i).set({room: room1});
					rooms.splice(room_index, 1);
					
					
				} else if(room2 != undefined && rooms.indexOf(room2) > -1){
					//team2 stays in same room
					var room_index = rooms.indexOf(room2);
					collection.rounds.at(i).set({room: room2});
					rooms.splice(room_index, 1);
					
				} else {
					//neither team had a previous room.
					//console.log("neither team had previous room");
					
					if(rooms.length > 0){
						collection.rounds.at(i).set({room: rooms.pop()});
					} else {
						roomless++;
						console.log("WARNING: Needed another room");
					} 
				}


			}

		}
	}

	if(roomless > 0){
		tab.warnings.push(roomless + " rounds are missing rooms.");
	}
	

};

pairing.dedicatedJudges = function(division){
	var judges = 0;
	
	for(var i = 0; i < collection.judges.length; i++){
		var divisions = collection.judges.at(i).get("divisions");
		if(divisions.indexOf(division) != -1 && divisions.length === 1){
			judges++;
		}
	}

	return judges;
};

pairing.totalJudges = function(division){
	var judges = 0;
	
	for(var i = 0; i < collection.judges.length; i++){
		var divisions = collection.judges.at(i).get("divisions");
		if(divisions.indexOf(division) != -1){
			judges++;
		}
	}

	return judges;
};

pairing.requiredJudges = function(division){
	//TODO support paneled prelims
	var teams = collection.teamsInDivision(division);
	return Math.floor(teams / 2);
}

pairing.totalRooms = function(division){
	var rooms = 0;
	
	for(var i = 0; i < collection.rooms.length; i++){

		if(collection.rooms.at(i).get("division") === division){
			rooms++;
		}
	}

	return rooms;
};

pairing.requiredRooms = function(division){
	var teams = collection.teamsInDivision(division);
	return Math.floor(teams / 2);
}

//returns true if round has already been paired
pairing.alreadyPaired = function(round_number, division){
	for(var i = 0; i < collection.rounds.length; i++){
		if(collection.rounds.at(i).get("division") === division && collection.rounds.at(i).get("round_number") === round_number){
			return true;
		}
	}
	return false;
}



pairing.sendSms = function(round_number, division){
	
	var start_time = $("#text_pairings_start").val();
	var data = [];
	for(var i =0; i < collection.rounds.length; i++) //collection.rounds.length
	{
		if(collection.rounds.at(i).get("round_number") != round_number || collection.rounds.at(i).get("division") != division){
				continue;
			}

			if(collection.rounds.at(i).get("aff") == 0){
				var aff = collection.rounds.at(i).get("team1");
				if(aff != undefined){
					aff = aff.get("team_code");
				}
					
				var neg = collection.rounds.at(i).get("team2");
				if(neg != undefined){
					neg = neg.get("team_code");
				}
					
				} else {
					var aff = collection.rounds.at(i).get("team2");
					if(aff != undefined){
						aff = aff.get("team_code");
					}
						
					var neg = collection.rounds.at(i).get("team1");
					if(neg != undefined){
						neg = neg.get("team_code");
					}
				}

			var judge = (collection.rounds.at(i).get("judge") != undefined ? collection.rounds.at(i).get("judge").get("name") : "");
			var room = (collection.rounds.at(i).get("room") != undefined ? collection.rounds.at(i).get("room").get("name") : "");

			for(var j = 0; j < collection.rounds.at(i).get("team1").get("competitors").length; j++){
				
				var phone_number = collection.rounds.at(i).get("team1").get("competitors")[j].phone_number;
				if(phone_number === undefined){
					continue;
				}
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


}

/*
Check for the following problems:
judges have judged either team before and are from either of the teams' schools
any round that is not a bye is missing a room
teams have already debated in a previous round
a team is on the pairing more than once
more than one bye
*/
pairing.validateRound = function(round_number, division){

	var bye_count = 0;
	console.log(division);
	var teams = {};
	$.each(collection.rounds, function(i){

		var round = collection.rounds.at(i);
		var judge = round.get("judge");

			if(round.get("division") != division){		//skip irrelevant rounds and divisions
				return true;
			}
			if(round.get("round_number") != round_number){
				return true;
			}

			//checking if judge allowed to judge both teams
			if(!pairing.canJudge(round.get("team1"), round.get("team2"), round.get("judge"), round_number, division)){
				if(judge != undefined){
					var judge_name = round.get("judge").get("name")
				} else {
					judge_name = "No name";
				}
				
				tab.warnings.push(judge_name + " already judged");
				return true;
			}

			//checking if round has a room and is not a bye
			if(round.get("room") === undefined && (round.get(team1) != undefined || round.get(team2) != undefined))
			{	
				tab.warnings.push("No room scheduled");
				return true;
			}

			//checking if teams have not debated before
			if(pairing.alreadyDebated(round.get("team1"), round.get("team2"), round_number))
			{
				tab.warnings.push(round.get("team1").get("team_code") + "and" + round.get("team2").get("team_code") + "have already debated");
				return true;
			}

			//checking if same team scheduled multiple times in same round

			var team1 = round.get("team1");
			var team2 = round.get("team2");
			if(team1 != undefined){
				if(teams[team1.id] === undefined){
				teams[team1.id] = 1;
				} else{
					teams[team1.id]++;
				}
			}

			if(team2 != undefined){
				if(teams[team2.id] === undefined){
				teams[team2.id] = 1;
				} else{
					teams[team2.id]++;
				}
			}


			//checking for more than one BYE
			if(team1 === "BYE" || team2 === "BYE" )
			{
				bye_count++;
			}
			if(bye_count > 1)
			{
				tab.warnings.push("More than 1 bye in same round");
			}

	});

	//team count is the number of times team with id is on the pairing
	$.each(teams, function(id, team_count){
		if(team_count > 1){
			var team = collection.getTeamFromId(id);
			
			if(team != undefined){
				var team_code = team.get("team_code");
				tab.warnings.push(team_code + " is on the pairing " + team_count + " times.");
			}
			
		}
	});

	return false;
}

/*
=========================================
END: Define Pairing Functions
=========================================
*/	