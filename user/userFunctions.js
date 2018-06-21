var httprequest = require('request');
var helper = require('../utils/helper.js');
var crypto    = require('crypto');
let algorithm = 'sha256';  
let addAccountUrl="/getAccount";


//checking user params 
function checkHeaderParams (authParams){
	console.log(authParams);
	if( typeof authParams.currentmillis !== 'undefined' && typeof authParams.auth !== 'undefined' && 
		typeof authParams.sessionToken !== 'undefined' && typeof authParams.user_id !== 'undefined' && 
		typeof authParams.client_id !== 'undefined' && typeof authParams.imei !== 'undefined' )
		return true;
	else
		return false;
}



exports.addAccount = function (request, res) {
	console.log(request);
	var authParams={
		auth:request.get('auth'),
		sessionToken : request.get('sessionToken'),
		user_id:request.body.user_id,
		client_id:request.body.client_id,
		currentmillis:request.body.currentmillis,
		imei:request.body.imei,
		bank_id:request.body.bank_id,
	}
	var register_number = request.body.register_number;
	var account_number = request.body.account_number;

	if (checkHeaderParams (authParams) && typeof register_number !== 'undefined' && typeof account_number !== 'undefined'  ) {
		var bindvarsapi = {
			p_auth_params: JSON.stringify(authParams),
			p_data: JSON.stringify(request.body),
			out_code: {type: 2002,dir: 3003},
			out_message: {type: 2001,dir: 3003},
			out_api: {type: 2001,dir: 3003},
			out_url: {type: 2001,dir: 3003}
		};
		helper.addBankAccount( bindvarsapi ,request,function (result){
			console.log(result);
			if(result.out_code==200){
						// bank ruu yavah paramsaa hiij ugch bna
						var bank_params={
							register_number:register_number,
							account_number:account_number,
							currentmillis:getMillis()


						};

						let options=callBankService(result.out_api,result.out_url+addAccountUrl,bank_params);
						console.log( JSON.stringify(options));
						httprequest.post(options, function(error, response, body){
							console.log(body);
							res.json(body);
						});
					}
					else{

						res.json(helper.setResponse(result.out_code, result.out_message, null));
					}
				})
	} else {
		res.json(helper.setResponse(201, null, null));
	}
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
