var express = require("express");
var logger = require("express-logger");
var session = require("express-session");
var bodyParser = require("body-parser");

var helmet = require('helmet');

var app = express();

var oracledb = require('oracledb');
var dbConfig = require('./dbconfig.js');
 oracleMiddle = require('./oracle-middle.js');

dbOptions = {
	user: dbConfig.user,
	password: dbConfig.password,
	connectString: dbConfig.connectString};
console.log(dbOptions);

var userFunctions = require('./user/userFunctions');
var mainServices = require('./user/services');
app.use(oracleMiddle(oracledb,dbOptions,'pool'))

app.use(logger({path: "/logs/logfile.txt"}));  

app.use(bodyParser.json()) 

app.set('trust proxy', 1) ;
app.use(session({
	secret: '83FBA6C63CE9EA2DF342F016B30A615610EE82AC280197A9',
	resave: false,
	saveUninitialized: true,
	cookie: { secure: true }

}));


app.get('/', function(req, res){
	res.send('hello world');
});
app.get('*', function(req, res){
	res.send('hello world');
});
app.post("/getBankList",mainServices.getBankList);
app.post("/user/addAccount",userFunctions.addAccount);

// app.post("/user/getBankAccounts",userFunctions.getBankAccounts);



var port = process.env.PORT || 8989;
app.listen(port, function() {
	console.log("Listening on " + port);
});