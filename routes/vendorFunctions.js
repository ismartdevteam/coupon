var httprequest = require('request');
var helper = require('../utils/helper.js');
var crypto    = require('crypto');
let algorithm = 'sha256';  
exports.login = function (req, res) {
	let api_key = req.get('api_key');
	let username = req.query.username;
	let password = req.query.password;
	if ( typeof api_key !== 'undefined' && typeof username !== 'undefined' && typeof password !== 'undefined') {
		req.getConnection(function(err, connection) {
			if(err){
				console.log(err.message);
				res.json(helper.setResponse(300,null,  null));
				return;
			}
			let queryStr='call LOGIN_VENDOR(?,?,?,@code,@data) ; SELECT @code as code,@data as data';
			console.log(queryStr);
			connection.query(queryStr,[api_key,username,password], function(err, rows) {
				if (err) {
					console.log(err.message);
					res.json(helper.setResponse(303, null, null));
				} else {
					console.log();	
					data =rows[1][0];
					res.json(helper.setResponse(data.code, "",data.data));
				} 
			});

		});
	}else
	res.json(helper.setResponse(201, null, null));
}
exports.addProduct = function (req, res) {
	let api_key = req.get('api_key');
	let v_api_key = req.get('v_api_key');
	let vendor_id = req.query.vendor_id;
	var product_name =  req.query.product_name;
	var product_price =  req.query.product_price;
	var product_description =  req.query.product_description;
	if ( typeof api_key !== 'undefined' &&  typeof v_api_key !== 'undefined' && typeof vendor_id !== 'undefined' && typeof product_name !== 'undefined'&& typeof product_price !== 'undefined'&& typeof product_description !== 'undefined') {
		req.getConnection(function(err, connection) {
			if(err){
				console.log(err.message);
				res.json(helper.setResponse(300,null,  null));
				return;
			}
			let queryStr="call ADD_PRODUCT(?,?,?,?,?,?,@code) ; SELECT @code as code";
			console.log(queryStr);
			connection.query(queryStr,[api_key,v_api_key,vendor_id,product_name,product_price,product_description], function(err, rows) {
				if (err) {
					console.log(err.message);
					res.json(helper.setResponse(303, null, null));
				} else {
					console.log();	
					data =rows[1][0];
					res.json(helper.setResponse(data.code, "",data.data));
				} 
			});

		});
	}else
	res.json(helper.setResponse(201, null, null));
}
function getMillis(){
	let d = new Date();
	let millis = d.getTime();
	return millis;
}

function callBankService ( bank_api,bank_url,params){
	
	var hmac = crypto.createHmac(algorithm,params.currentmillis.toString());
	let encryptData= bank_api+params.currentmillis;
	let auth= hmac.update(encryptData.toString()).digest('hex');
	console.log("auth key to bank",auth);
	let options = {
		url: bank_url.toString(),
		headers: {
			'Content-Type': 'application/json',
			'auth':auth.toString()
		},
		body:  JSON.stringify(params)
	};

	return options;

}




exports.getAccntBalance = function (request, res) {

	var auth = request.get('auth');
	var user_name = request.body.user_name;
	var register_number = request.body.register_number;
	var account_number = request.body.account_number;
	var currentmillis = request.body.currentmillis;

	if (typeof auth !== 'undefined' && typeof user_name !== 'undefined' && typeof register_number !== 'undefined' && typeof account_number !== 'undefined' && typeof currentmillis !== 'undefined') {
		var bindvarsapi = {
			p_key: currentmillis,
			p_data: user_name + register_number + account_number,
			res: {type: 2001,dir: 3003},
			code: {type: 2002,dir: 3003},
			message: {type: 2001,dir: 3003}
		};
		request.getConnection(function (err, connection) {
			if (err) {
				res.json(helper.setResponse(500, err.message, null));
				return;
			}
			connection.execute(
				"BEGIN check_api(:p_key,:p_data,:res,:code,:message); END; ",
				bindvarsapi,
				function (err, result) {
					if (err) {
						res.json(helper.setResponse(501, err.message, null));
						return;
					}
					if (result.outBinds.code == '200') {
						if (result.outBinds.res == auth) {
							var bindvars = {
								user_name: user_name,
								register_number: register_number,
								account_number: account_number,
								accnt_balance: {type: 2001,dir: 3003},
								code: {type: 2002,dir: 3003},
								message: {type: 2001,dir: 3003}
							};
							request.getConnection(function (err, connection) {
								if (err) {
									res.json(helper.setResponse(500, err.message, null));
									return;
								}
								connection.execute(
									"BEGIN getaccntbalance(:user_name,:register_number,:account_number,:accnt_balance,:code,:message); END; ",
									bindvars,
									function (err, result) {
										if (err) {
											res.json(helper.setResponse(501, err.message, null));
											return;
										}
										var data = {
											accnt_balance: result.outBinds.accnt_balance
										};
										res.json(helper.setResponse(200, '', data));
									});
							})
						} else {
							res.json(helper.setResponse(505, null, null));
							return;
						}
					} else {
						res.json(helper.setResponse(result.outBinds.code, result.outBinds.message, null));
						return;
					}
				});
		})
	} else {
		res.json(helper.setResponse(504, null, null));
	}
}
