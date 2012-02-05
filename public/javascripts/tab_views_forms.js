view.RoomForm = Backbone.View.extend({
	el: $("#room_form") ,
	events: { 
		"keyup #newroom_name": "keyupRoom"
	},  
	initialize: function(){
		_.bindAll(this, "render");
		collection.divisions.bind("add", this.addDivSelect);
		collection.divisions.bind("reset", this.render);
	} ,

	render: function(model){
		
		if(model != undefined){	
			this.model = model;
			$("#newroom_id").val(this.model.get("id"));
			$("#newroom_name").val(this.model.get("name"));
			$("#newroom_division").val((this.model.get("division").get("id")));
			$("#newroom_stop_scheduling").prop("checked", this.model.get("stop_scheduling"));
		}
		$("#room_form").dialog({
			buttons: {
				"Save": function(){
					view.roomForm.addRoom();
				} ,
				"Close": function(){
					view.roomForm.clearEditForm();
					$(this).dialog("close");
				}
			}
		});

		_(collection.divisions.models).each(function(division){ // in case collection is not empty
	    	this.addDivSelect(division);
		}, this);
	} ,

	keyupRoom: function(event){
		if(event.which === 13){
			this.addRoom();
		}
		
	} ,
	clearEditForm: function(){
		$("#newroom_id").val("");
		$("#newroom_name").val("");
		//$("#newroom_division").val("");
		$("#newroom_stop_scheduling").prop("checked", false);

	} ,

	//add new division to dropdown box
	addDivSelect: function(division){
		var divOptionView = new view.DivisionOption({
			model: division
		});
		$("#newroom_division", this.el).append(divOptionView.render().el);
	} ,
	addRoom: function(){
		//TODO: validate room name
			//	
		var id = $("#newroom_id").val();
		var room_name = $("#newroom_name").val();
		var div_name_id = $("#newroom_division").val();
		var division = collection.getDivisionFromId(div_name_id);
		var stop_scheduling = $("#newroom_stop_scheduling").prop("checked");

		$(".edit_model_overlay").fadeOut();
		
		if(id.length > 0){
			
			var room = collection.getRoomFromId(id);
			room.set({
				
				name: room_name, 
				division: division,
				stop_scheduling: stop_scheduling

		});
		}else{
		
		var room = new model.Room();
		room.set({
			id: (new ObjectId).toString(),
			name: room_name, 
			division: division,
			stop_scheduling: stop_scheduling
			
		});
		collection.rooms.add(room);
		
		
		}
		room.save();
		this.clearEditForm();
		
	} ,

});
