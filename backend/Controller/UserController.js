//require('rootpath')();

var fs = require('fs');
var UserModel = require('../Model/UserModel')
// exports.Read = function(req,res)
// {
// 	fs.readFile( __dirname + "/../../data/"+"user.json","utf8",function(err,data){
// 		console.log(data);
// 		res.end(data);
// 	});
// }
// exports.ReadByName = function(req,res)
// {
// 	fs.readFile( __dirname + "/../../data/"+"user.json","utf8",function(err,data){
// 		var users = JSON.parse(data);
// 		res.json(users[req.params.username]);
// 	})
// }
// exports.Create = function(req, res)
// {
// 	var result = {};
// 	var username = req.params.username;

// 	//CHECK REQ VALIDITY
// 	if(!req.body["password"] || !req.body["name"]){
// 		result["success"] = 0;
// 		result["error"] = "invalid request";
// 		res.json(result);
// 		return;
// 	}

// 	//LOAD DATA & CHECK DUPLICATION
// 	fs.readFile( __dirname+"/../data/user.json",'uft8',function(err,data){
// 		var users = JSON.parse(data);
// 		if(users[username]){
// 			//DUPLICATION FOUND
// 			result["success"] = 0;
// 			result["error"] = "duplicate";
// 			res.json(result);
// 			return;
// 		}

// 		//ADD TO DATA
// 		users[username] = req.body;

// 		// SAVE DATA
// 		fs.writeFile(__dirname + "/../data/user.json",JSON.stringify(users,null,'\t'),"uft8",function(err,data){
// 			result = {"success":1};
// 			res.json(result);
// 		})
// 	})
// }
exports.Create = function (req,res) {
	var obj = new UserModel();
	obj.user_name = req.body.user_name;
	obj.password = req.body.password;
    obj.score = 0;
    obj.color_pos = req.body.color_pos;
    obj.eye_pos = req.body.eye_pos;
    obj.mouth_pos = req.body.mouth_pos;
	obj.save(function(err,result){
		if(err){

			console.error("save data error\n"+err);
			console.log("save data err");
			res.json(result);
			return;
		}else
        {
			console.log("save data successfull");
            console.log(result);
			res.json(result);
		}
	});
}




exports.LogIn = function(req, res)
{
    var sess = req.session;
    
    UserModel.findOne({user_name: req.body.user_name}, function(err, user){
        var result = {};
        
        if (err) { 
            result = {
                status:"error",
                msg:err
            }
            return res.json(result);
        }else if (!user){
            result = {
                status:"error",
                msg:"User not found!"
            }
            return res.json(result);
        }else{

            if(user.password == req.body.password){
                sess.user_id = user._id;
                sess.user_name = user.user_name;

                result = {
                    status:"success",
                    msg:"User logged in successfully.",
                    user:user
                }
                return res.json(result);
            }else{
                result = {
                    status:"error",
                    msg:"Incorrect password."
                }
                return res.json(result);
            }
        }
        
    });
}