var mongoose = require('mongoose');
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;


/*===============
Models for DebateTab registration
 
	-Just use ObjectId for _id on every document.
================*/

exports.Round = new Schema({
	id			: ObjectId,
	division	: ObjectId,
	round_number	: Number,
	result		: String,
	judge     : ObjectId,
	room	:	ObjectId
});

exports.Room = new Schema({
	id			: ObjectId ,
	room_number	: String ,
	division 	: ObjectId ,
	tournament_id : ObjectId ,
	stop_scheduling : Boolean
})

exports.Judge = new Schema({
	id			: ObjectId ,
	name 	: String ,
	divisions 	: Array ,
	school		: ObjectId ,
	stop_scheduling : Boolean
});
exports.Coach = new Schema({
	id    		: ObjectId ,
	email		: String ,
	password	: String ,
	first_name	: String ,
	last_name	: String ,
	cell_phone	: String
});

exports.Competitor = new Schema({
	id			: ObjectId ,
	email		: String ,
	first_name	: String ,
	last_name	: String ,
	cell_phone	: String 

});

exports.Team = new Schema({
	id			: ObjectId ,
	team_code	: String , //An abbreviation like Round Rock AC or Hendrickson LK
							//will be displayed on pairing, so must be unique

	stop_scheduling	: Boolean , //true if team drops out of tournament 
								//and needs to be taken off pairing.
	competitors : [{}]
});

exports.Division = new Schema({
	id				: ObjectId ,
	division_name	: String ,  //eg: VCX, NLD
	comp_per_team	: Number , //number of competitors per team. 2 in CX, 1 in LD
	break_to		: Number , //quarterfinals, octofinals, etc.
	prelim_judges	: Number , //number of judges in prelims
	max_speaks		: Number , //maximum speaker points possible
	flighted_rounds : Boolean ,
	prelims			: Number , //

});

exports.Tournament = new Schema({
	id			: ObjectId ,
	name		: String ,
	start_date	: Date ,
	end_date	: Date ,
	divisions	: [exports.Division] ,
	location	: String //eg: Austin, Texas
});

exports.School = new Schema({
	tournament_id: ObjectId ,
	school_name		: String
	

});