/*
=========================================
API used by client-side javascript to persist backbone models in database.
=========================================
*/	


module.exports = function(app){
	var backboneio = app.backboneio;
	app.school_backend = backboneio.createBackend();
	var School = mongoose.model('School', app.Models.School);
	app.school_backend.use(backboneio.middleware.mongooseStore(School));

	app.division_backend = backboneio.createBackend();
	var Division = mongoose.model('Division', app.Models.Division);
	app.division_backend.use(backboneio.middleware.mongooseStore(Division));


}