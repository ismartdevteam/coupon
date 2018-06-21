var httprequest = require('request');
exports.getBankList = function (request, res) {

	var auth = request.get('auth');
	var sessionToken = request.get('sessionToken');
	var user_id = request.body.user_id;
	var api_key = request.body.api_key;
	var currentmillis = request.body.currentmillis;

	if (typeof api_key !== 'undefined' && typeof user_id !== 'undefined' && typeof sessionToken !== 'undefined' &&  typeof auth !== 'undefined'  && typeof currentmillis !== 'undefined') {
		var bindvarsapi = {
			p_key: api_key+currentmillis,
			p_session:sessionToken,
			p_user_id:user_id,
			p_auth: auth,
			res: {type: 2001,dir: 3003},
			code: {type: 2001,dir: 3003},
			message: {type: 2001,dir: 3003}
		};
		request.getConnection(function (err, connection) {
			if (err) {
				res.json(constant.setResponse(500, err.message, null));
				return;
			}
			connection.execute(
				"BEGIN check_api(:p_key,:p_session,:p_user_id,:p_auth,:res,:code,:message); END; ",
				bindvarsapi,
				function (err, result) {
				if (err) {
					res.json(constant.setResponse(501, err.message, null));
					return;
				}
				if (result.outBinds.code == '200') {
					
						

				} else {
					res.json(constant.setResponse(result.outBinds.code, result.outBinds.message, null));
					return;
				}
			});
		})
	} else {
		res.json(constant.setResponse(504, null, null));
	}
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
			code: {type: 2001,dir: 3003},
			message: {type: 2001,dir: 3003}
		};
		request.getConnection(function (err, connection) {
			if (err) {
				res.json(constant.setResponse(500, err.message, null));
				return;
			}
			connection.execute(
				"BEGIN check_api(:p_key,:p_data,:res,:code,:message); END; ",
				bindvarsapi,
				function (err, result) {
				if (err) {
					res.json(constant.setResponse(501, err.message, null));
					return;
				}
				if (result.outBinds.code == '200') {
					if (result.outBinds.res == auth) {
						var bindvars = {
							user_name: user_name,
							register_number: register_number,
							account_number: account_number,
							accnt_balance: {type: 2001,dir: 3003},
							code: {type: 2001,dir: 3003},
							message: {type: 2001,dir: 3003}
						};
						request.getConnection(function (err, connection) {
							if (err) {
								res.json(constant.setResponse(500, err.message, null));
								return;
							}
							connection.execute(
								"BEGIN getaccntbalance(:user_name,:register_number,:account_number,:accnt_balance,:code,:message); END; ",
								bindvars,
								function (err, result) {
								if (err) {
									res.json(constant.setResponse(501, err.message, null));
									return;
								}
								var data = {
									accnt_balance: result.outBinds.accnt_balance
								};
								res.json(constant.setResponse(200, '', data));
							});
						})
					} else {
						res.json(constant.setResponse(505, null, null));
						return;
					}
				} else {
					res.json(constant.setResponse(result.outBinds.code, result.outBinds.message, null));
					return;
				}
			});
		})
	} else {
		res.json(constant.setResponse(504, null, null));
	}
}
