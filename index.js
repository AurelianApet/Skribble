const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
var session = require('express-session');
const fs = require('fs');

const port = process.env.PORT || '80';


var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/skirbbl_database',function(err,res){
	if(err){
		console.log("DB connection error!!! \n"+err);
	}else{
		console.log("DB [point_database] connected successfully...");
	}
    
        console.log('#############################################');
})


app.set('port', port);
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded());
app.use(session({
    secret:'@#@$MYSIGN#@$#$',
    resave:true,
    saveUninitialized:true 
}));


app.use(express.static('frontend'));
app.use(express.static("frontend/views"));


app.use(function (err, req, res, next) {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).send(JSON.stringify({
            error: {
                code: "INVALID_JSON",
                message: "The body of your request is not valid JSON."
            }
        }))
    }
});


var router = require('./backend/Router/main')(app);
require('./backend/Controller/SocketController')(app,port);


