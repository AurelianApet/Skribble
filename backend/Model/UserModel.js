var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	user_name:{type:String, require: true},
	password:{type:String, require: true},
//	status:{type:String}, //"guessed","guessing","drawing"
	score:{type:Number},
	color_pos:{type:String},
	eye_pos:{type:String},
	mouth_pos:{type:String}
	// mustDraw:{type:Boolean},
	// socketID:{type:String}

});


var user = mongoose.model('col_users',userSchema);
module.exports = user;