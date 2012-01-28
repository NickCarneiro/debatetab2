
forms.generateCxBallotString = function(options){
	var left_label = options.flip === false ? "Affirmative" : "Team 1";
	var right_label = options.flip === false ? "Negative" : "Team 2";
	
	var ballot ='<img src="debatetablogo.png"></img>'+
		'<div id="ballotLabel">CROSS EXAMINATION DEBATE BALLOT</div>'+
		'<br /><br />'+
		'<div id="roundNumber">Round: '+options.round+'</div> '+
		'<div id="room">Room: '+options.room+'</div> ';
		if(options.flip == true){
			ballot = ballot + '<div id="flip">FLIP FOR SIDES</div>';
		}
		ballot = ballot + '<div id="judgeName">Judge: '+options.judge+'</div> <br /><br />'+
		
		'<div id="team_codes">' +
		'<div id="affCode">'+left_label+': '+options.aff_team_code+'</div> '+
		'<div id="negCode">'+right_label+': '+options.neg_team_code+'</div>'+
		'</div>' +
		'<div id="instr">Please place the debater\'s first and last name in the appropriate blank</div> </br></br>'+
		'<div id="affPointsLabel">Points</div>'+
		'<div id="affRanksLabel">Ranks</div>'+
		'<div id="negPointsLabel">Points</div>'+
		'<div id="negRanksLabel">Ranks</div> <br /><br />'+
		'<div id="firstAff">1st AFF. _______________________   _____   _____</div>'+
		'<div id="firstNeg">1st NEG. _______________________   _____   _____</div> <br /> <br />'+
		'<div id="secondAff">2nd AFF. _______________________   _____   _____</div>'+
		'<div id="secondNeg">2nd NEG. _______________________   _____   _____</div> <br /> <br />'+
		'<div id="instr2">Speakers should be rated on a scale from 20-30 points.  Half points (.5) are allowed.  You may have a tie in points, but you must'+ 
		'indicate the person doing the better job of debating.</div> <br /><br />'+
		'<div id="instr3">COMMENTS AND REASON(S) FOR DECISION </div>'+
		'<div id="decision">In my opinion, the better debating was done by AFFIRMATIVE  NEGATIVE  representing ___________</div>'+
		'<div id="circleOne">(circle one)</div>'+
		'<div id="tCodeLabel">(Team Code)</div><br /><br /><br />'+
		'<div id="sigArea">____________________________</div>'+
		'<div id="schoolAffiliation">___________________________</div>'+
		'<div id="sigLabel">Judge Signature</div>'+
		'<div id="schoolAffLabel">Affiliation (School) </div>';
		return ballot;
		
}
forms.printBallots = function(round_number, division){
	var css = $("#ballot_css").html();
	var export_string = '<html>'+
		'<head>	'	+

					//fix paths if needed
		'<style>' +
		css +
		'</style>' +
		'</head>'+
		'<body>';
	
	//put ballots in middle of this string
	$.each(collection.rounds, function(i){
		var round = collection.rounds.at(i);
		if(round.get("division") != division || round.get("round_number") != round_number){
			return true;
		}

		var room = round.get("room");
		if(room != undefined){
			room = room.get("name");
		} else {
			room = "";
		}

		var judge = round.get("judge");
		if(judge === undefined){
			judge = "";
		} else {
			judge = judge.get("name");
		}

		var flip = round.get("aff") === "flip" ? true : false;
		var options = {
			round: round_number, 
			room: room, 
			judge: judge, 
			aff_team_code: "Round Rock AC",
			neg_team_code: "Westwood BX",
			flip: false
		};

		var ballot_type = division.get("ballot_type");
		if(ballot_type === "TFA_CX"){
			export_string += forms.generateCxBallotString(options);
		} else if(ballot_type === "TFA_LD") {
			export_string += forms.generateLdBallotString(options);
		}
		
	});

	export_string += "</body></html>";
			
			
			
	var uri = 'data:text/html;charset="UTF-8",' + encodeURIComponent(export_string);
	window.open(uri,'Ballots');
			

};


forms.generateLdBallotString = function(options){

	var left_label = options.flip === false ? "Affirmative" : "Team 1";
	var right_label = options.flip === false ? "Negative" : "Team 2";
	var ballot = '<div id="ballotLabel">LINCOLN DOUGLAS DEBATE BALLOT</div>'+
		'<br /><br />'+
		'<div id="roundNumber">Round: '+options.round+'</div> '+
		'<div id="room">Room: '+options.room+'</div> ';
		if(options.flip == true){
			ballot = ballot + '<div id="flip">FLIP FOR SIDES</div>';
		}
		ballot = ballot + '<div id="judgeName">Judge: '+options.judge+'</div> <br /><br />'+
		'<div id="team_codes">' +
		'<div id="affCode">'+left_label+': '+options.aff_team_code+'</div> '+
		'<div id="negCode">'+right_label+': '+options.neg_team_code+'</div>'+
		'</div>' +
		'<div id="instr">Please place the debater\'s first and last name in the appropriate blank</div> </br></br>'+
		'<div id="affPointsLabelLD">Points</div>'+
		'<div id="negPointsLabelLD">Points</div><br /><br />'+
		'<div id="firstAff">AFFIRMATIVE _______________________   ______</div>'+
		'<div id="firstNeg">NEGATIVE _______________________   ______</div> <br /> <br />'+
		'<div id="instr2">Speakers should be rated on a scale from 20-30 points.  Half points (.5) are allowed.  You may have a tie in points, but you must'+ 
		'indicate the person doing the better job of debating.</div> <br /><br />'+
		'<div id="instr3">COMMENTS AND REASON(S) FOR DECISION </div>'+
		'<div id="decision">In my opinion, the better debating was done by AFFIRMATIVE  NEGATIVE  representing ___________</div>'+
		'<div id="circleOne">(circle one)</div>'+
		'<div id="tCodeLabel">(Team Code)</div><br /><br /><br />'+
		'<div id="sigArea">____________________________</div>'+
		'<div id="schoolAffiliation">___________________________</div>'+
		'<div id="sigLabel">Judge Signature</div>'+
		'<div id="schoolAffLabel">Affiliation (School) </div>';
		
		return ballot;
				
}

forms.generatePairings = function(round_number, division){
	var css = $("#ballot_css").html();
	var export_string = '<html>'+
		'<head>	'	+

					//fix paths if needed
		'<style>' +
		css +
		'</style>' +
		'</head>'+
		'<body>';
	
	export_string += '<div id="pairing_division_name">' + division.get("division_name") + '</div>';
	export_string += '<div id="pairing_round_number">Round: ' + round_number + '</div>';

	//TODO hard coded to flip on third round
	var left_team_title = round_number == 3 ? "Flip for sides" : "Affirmative";
	var right_team_title = round_number == 3 ? "Flip for sides" : "Negative";
	
	if(division.get("flighted_rounds") != true){
		//just dump all rounds
		export_string += '<table class="pairing_container">';
		export_string += '<tr class="table_header"><td>'+left_team_title+'</td><td>'+right_team_title+'</td><td>Room</td><td>Judge</td></tr>';
		$.each(collection.rounds, function(i){
			var round = collection.rounds.at(i);
			if(round.get("division") != division || round.get("round_number") != round_number){
				return true;
			}

			//add round
			var left_team = "BYE";
			var right_team = "BYE"
			if(round.get("aff") == 0){
				left_team = round.get("team1");
				right_team = round.get("team2");
			} else{
				//if aff is 0
				right_team = round.get("team1");
				left_team = round.get("team2");
			} 
			//set left and right teams to team codes instead of models
			left_team = left_team === undefined ? "BYE" : left_team.get("team_code");
			right_team = right_team === undefined ? "BYE" : right_team.get("team_code");

			var room = round.get("room");
			if(room != undefined){
				room = room.get("name");
			} else {
				room = "";
			}

			var judge = round.get("judge");
			if(judge === undefined){
				judge = "";
			} else {
				judge = judge.get("name");
			}

			
			export_string += '<tr><td>' + right_team + '</td><td>'+left_team+'</td><td>'+room+'</td><td>' + judge + '</td></tr>';
			

		});

		export_string += '</table>';
	} else {
		//split up into flights
		
		var flight_a = '<tr class="table_header"><td>'+left_team_title+'</td><td>'+right_team_title+'</td><td>Room</td><td>Judge</td></tr>';
		var flight_b = '<tr class="table_header"><td>'+left_team_title+'</td><td>'+right_team_title+'</td><td>Room</td><td>Judge</td></tr>';
		$.each(collection.rounds, function(i){
			var round = collection.rounds.at(i);
			if(round.get("division") != division || round.get("round_number") != round_number){
				return true;
			}

			//add round
			var left_team = "BYE";
			var right_team = "BYE"
			if(round.get("aff") == 0){
				left_team = round.get("team1");
				right_team = round.get("team2");
			} else{
				//if aff is 0
				right_team = round.get("team1");
				left_team = round.get("team2");
			} 
			//set left and right teams to team codes instead of models
			left_team = left_team === undefined ? "BYE" : left_team.get("team_code");
			right_team = right_team === undefined ? "BYE" : right_team.get("team_code");

			var room = round.get("room");
			if(room != undefined){
				room = room.get("name");
			} else {
				room = "";
			}

			var judge = round.get("judge");
			if(judge === undefined){
				judge = "";
			} else {
				judge = judge.get("name");
			}

			if(round.get("flight") === "A"){
				flight_a += '<tr><td>' + right_team + '</td><td>'+left_team+'</td><td>'+room+'</td><td>' + judge + '</td></tr>';
			} else {
				flight_b += '<tr><td>' + right_team + '</td><td>'+left_team+'</td><td>'+room+'</td><td>' + judge + '</td></tr>'
			}

		});

		export_string += '<div class="flight_title">Flight A</div><br />';
		export_string += '<table class="pairing_container">';
		export_string += flight_a;
		export_string += '</table> <br />';
		export_string += '<div class="flight_title">Flight B</div> <br />';
		export_string += '<table class="pairing_container">';
		export_string += flight_b;
		export_string += '</table>';
		$.each(collection.rounds, function(i){
			var round = collection.rounds.at(i);
			if(round.get("division") != division || round.get("round_number") != round_number){
				return true;
			}

			if(round.get("flight") === "B"){
				//add round
			}

		});
	}

	export_string += '</table>'; //close pairing_container
	export_string += "</body></html>";
			
			
			
	var uri = 'data:text/html;charset="UTF-8",' + encodeURIComponent(export_string);
	window.open(uri,'Pairings');
}

forms.printTeams = function(division){
	//get array of teams and sort it
	var teams = [];
	$.each(collection.teams, function(i){
		var team = collection.teams.at(i);
		if(team.get("division") != division){
			return true;
		}
		teams.push(team);
	});

	teams.sort(collection.sortTeams);

	var css = $("#ballot_css").html();
	var export_string = '<html>'+
		'<head>	'	+

					//fix paths if needed
		'<style>' +
		css +
		'</style>' +
		'</head>'+
		'<body><div id="pairing_division_name">'+ division.get("division_name") +'</div>'+

		'<table>' +
		'<tr><td>Team Code</td><td>Record</td><td>Total Points</td><td>Adjusted Points</td></tr>';
	
	$.each(teams, function(i, team){
		export_string += '<tr><td>' + team.get("team_code") + '</td><td>'+ team.get("wins") + '-' +team.get("losses") +'</td>' +
			'<td>' + team.get("total_speaks") + '</td><td>' + team.get("adjusted_speaks") + '</td>'+
			'</tr>';
	});
	export_string += '</table>'; //close pairing_container
	export_string += "</body></html>";

	var uri = 'data:text/html;charset="UTF-8",' + encodeURIComponent(export_string);
	window.open(uri,'Teams');
}



