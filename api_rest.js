/*
=========================================
REST API used by client-side javascript to persist backbone models in database.
=========================================
*/	


module.exports = function(app){
	var db = app.db;
	//container for collections
	var col = []
	col.tournaments = db.collection('tournaments');
	col.rounds = db.collection('schools');
	col.teams = db.collection('teams');
	col.judges = db.collection('judges');
	col.rooms = db.collection('rooms');
	col.schools = db.collection('schools');
	col.divisions = db.collection('divisions');

	
	app.get('/trn/:tournament_id/:collection/:model_id', function(req, res){
		console.log("tournament_id: " + req.params.tournament_id);
		console.log("collection: " + req.params.collection);
		console.log("model_id: " + req.params.model_id);
		console.log(req.body);

		//return requested model
		try{
			
			col[req.params.collection].find({_id:req.params.model_id}, function(err, docs) {
				// docs is now a sorted array
				console.log(docs);
				if(docs.length > 0){
					res.send(docs[0]);
				} else {
					res.send(404);
				}
				
			});
		} catch(e){
			console.log(e);
		}

	});

	app.post('/trn/:tournament_id/:collection/', function(req, res){
		//create a model
		//todo: restrict to legitimate collections and require authorization
		var model = req.body;
		console.log(model);
		try{
			col[req.params.collection].save(model, function(err, docs){
				console.log("inserted");
				console.log(docs);
				res.send(200);
			});

		} catch(e){
			//return error
			res.send(500);
			console.log(e);
		}
	});

	app.put('/trn/:tournament_id/:collection/:model_id', function(req, res){
		try{
			console.log("update");
			console.log(req.body);
			col[req.params.collection].update({_id: req.params.model_id}, req.body, function(err, docs){
				res.send(200);
			});
			
		} catch(e){
			//return error
			res.send(500);
			console.log(e);
		}
	});

	app.delete('/trn/:tournament_id/:collection/:model_id', function(req, res){
		try{
			console.log("delete");
			console.log(req.body);
			col[req.params.collection].remove({_id: req.params.model_id}, function(docs, err){
				res.send(200);
			});
			
		} catch(e){
			//return error
			res.send(500);
			console.log(e);
		}
	});

	//other routes..
}