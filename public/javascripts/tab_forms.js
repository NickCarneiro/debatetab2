
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


forms.getSpeakerArray = function(division){
	//construct object of speakers and compute their points.
	//then turn it into and array and sort it on adj, then total
	var speakers = {};
	$.each(collection.teams, function(i){
		var team = collection.teams.at(i);
		if(team.get("division") != division){
			return true;
		}
		var comps = team.get("competitors");
		

		if(division.get("comp_per_team") == 1){
			
			var comp = team.get("competitors")[0];
			if(speakers[comp.name] === undefined){
				speakers[comp.name] = comp;
				speakers[comp.name].total_points = 0;
				speakers[comp.name].adjusted_points = 0;
			}

			//ld. all points belong to this competitor
			var speaks = team.get("speaks");
			//speaks is an array of speaker points awarded in each round.
			var total_points = 0;
			var adjusted_points = 0;
			$.each(speaks, function(k, point){
				if(k >0 || k < speaks.length - 1){
					adjusted_points += parseFloat(point);
				}

				total_points += parseFloat(point);
			});
			
			

			//save calculated speaks
			speakers[comp.name].total_points = total_points;
			speakers[comp.name].adjusted_points = adjusted_points;

		} else {
			//two competitors on the team
			var comp = team.get("competitors")[0];
			if(speakers[comp.name] === undefined){
				speakers[comp.name] = comp;
				speakers[comp.name].total_points = 0;
				speakers[comp.name].adjusted_points = 0;
			}

			//CX. two competitors
			var speaks = team.get("speaks");
			//speaks is an array of speaker points awarded in each round.
			var total_points = 0;
			var adjusted_points = 0;
			$.each(speaks, function(k, point){
				if(k % 2 === 1){
					return true;
				}
				if(k > 0 || k < speaks.length - 2){
					adjusted_points += parseFloat(point);
				}

				total_points += parseFloat(point);
			});

			//now calculate for 2nd competitor on this team
			var comp = team.get("competitors")[1];
			if(speakers[comp.name] === undefined){
				speakers[comp.name] = comp;
				speakers[comp.name].total_points = 0;
				speakers[comp.name].adjusted_points = 0;
			}

			//CX. two competitors
			var speaks = team.get("speaks");
			//speaks is an array of speaker points awarded in each round.
			var total_points = 0;
			var adjusted_points = 0;
			$.each(speaks, function(k, point){
				//skip points meant for other guy
				if(k % 2 === 0){
					return true;
				}
				if(k > 1 || k < speaks.length - 1){
					adjusted_points += parseFloat(point);
				}

				total_points += parseFloat(point);
			});

			//save calculated speaks
			speakers[comp.name].total_points = total_points;
			speakers[comp.name].adjusted_points = adjusted_points;
		}
	});
	var speakers_arr = [];
	$.each(speakers, function(i, speaker){
		speakers_arr.push(speaker);
	});
	speakers_arr.sort(collection.sortSpeakers);
	return speakers_arr;
}


//todo: give competitors IDs. assumes that everyone in the division has unique names
forms.printSpeakers = function(division){
	var speakers = forms.getSpeakerArray(division);
	console.log(speakers);
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
		'<tr><td>Name</td><td>Adjusted Points</td><td>Total Points</td></tr>';
		$.each(speakers, function(i, speaker){
			export_string += '<tr><td>' + speaker.name + '</td><td>'+ speaker.adjusted_points + '</td>' +
				'<td>' + speaker.total_points + '</td>' + 
				'</tr>';
		});
		export_string += '</table>'; //close pairing_container
		export_string += "</body></html>";
		var uri = 'data:text/html;charset="UTF-8",' + encodeURIComponent(export_string);
		window.open(uri,'Speakers');

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
			'<td>' + team.get("total_points") + '</td><td>' + team.get("adjusted_points") + '</td>'+
			'</tr>';
	});
	export_string += '</table>'; //close pairing_container
	export_string += "</body></html>";

	var uri = 'data:text/html;charset="UTF-8",' + encodeURIComponent(export_string);
	window.open(uri,'Teams');
}

forms.printBoxes = function(division){
	//each row is a team, each column is all the data on that round round.
	var css = $("#ballot_css").html();
	var export_string = '<html>'+
		'<head>	'	+

					//fix paths if needed
		'<style>' +
		css +
		'td{ ' +
		'border: 1px solid #000; ' +
		'padding: 4px; '+
		'}' +
		'</style>' +
		'</head>'+
		'<body><div id="pairing_division_name">'+ division.get("division_name") +'</div>'+
		'<table id="boxes">';

	var round_count = parseInt(division.get("prelims"));
	
	$.each(collection.teams, function(i, team){
		var team = collection.teams.at(i);

		if(team.get("division") != division){
			return true;
		}

		export_string += '<tr>';
		export_string += '<td>' + team.get("team_code") + '</td>';
		$.each(collection.rounds, function(j, round){

			var round = collection.rounds.at(j);
			if(round.get("team1") === team || round.get("team2") === team){
				export_string += '<td>';

				//print the details of this round in the box
				//W or L
				var result_letter = "-";
				if( round.getWinner() === team ){
					result_letter = "W";
				} else if(round.getLoser() === team){
					result_letter = "L"
				}
				var aff = round.get("aff") == 0 ? round.get("team1") : round.get("team2");
				var neg = round.get("aff") == 0 ? round.get("team2") : round.get("team1");
				if(aff === undefined){
					var aff_code = "BYE";
				} else {
					var aff_code = aff.get("team_code");
					
				}

				if(neg === undefined){
					var neg_code = "BYE";
				} else {
					var neg_code = neg.get("team_code");
				}

				

				export_string += 'AFF: ' + aff_code + '<br />';
				var aff_points = round.get("aff_points");
				
				//show aff points and ranks
				if(aff_points != undefined){
					$.each(aff_points, function(i, row){
						export_string +=  row.points || "no points" + ' : ' + row.rank  + '<br />';
					});
					
				}

				//show neg points and ranks
				export_string += 'NEG: ' + neg_code + '<br />';
				var neg_points = round.get("neg_points");
				if(neg_points != undefined){
					$.each(neg_points, function(i, row){
						export_string +=  row.points || "no points" + ' : ' + row.rank  + '<br />';
					});
				}

				//show W or L
				export_string += '<span class="result_letter">'+result_letter+'</span><br />';
				//show name of result
				if(pairing.result_types[round.get("result")] != undefined){
					var result_name = pairing.result_types[round.get("result")];
				}else {
					var result_name = "No result";
				}
				export_string +=  result_name + '<br />';
				export_string += '</td>';
			}
			
		});

		//last column contains overall record
		export_string += '<td>' +
		team.get("wins") + ' - ' + team.get("losses") +
		'</td></tr>';
		

	});
	
	export_string += '</table>'; //close pairing_container
	export_string += "</body></html>";
	var uri = 'data:text/html;charset="UTF-8",' + encodeURIComponent(export_string);
	window.open(uri,'Teams');

}


