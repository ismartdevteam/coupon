let express = require("express");
let logger = require("express-logger");
let session = require("express-session");
let bodyParser = require("body-parser");
myConnection = require('express-myconnection');

let helmet = require('helmet');
let mainServices = require('./routes/services');
let vendorServices = require('./routes/vendorFunctions');
let mysql      = require('mysql');
dbOptions = require('./utils/dbconfig.js');
let app = express();
app.use(myConnection(mysql, dbOptions, 'request'));


app.use(bodyParser.json()) ;

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
app.get("/vendor/login",vendorServices.login);
app.get("/vendor/getCoupons",vendorServices.getCoupons);
app.get("/vendor/addorUpdateCoupon",vendorServices.addorUpdateCoupon);
app.get("/vendor/getRegisterCoupons",vendorServices.getRegisterCoupons);
app.get("/vendor/useUserCoupons",vendorServices.useUserCoupons);
app.get("/getCoupon",mainServices.getCoupon);

app.get('*', function(req, res){
	res.send('hello world');
});

let port = process.env.PORT || 8989;
app.listen(port, function() {
	console.log("Listening on " + port);
});