let httprequest = require('request');
let helper = require('../utils/helper.js');
let crypto    = require('crypto');
var path = require('path');
let fs = require('fs');
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
					
					data =rows[1][0];
					data.data =JSON.parse(data.data);
					console.log(data.data.vendor_id);	
					if(data.code==200){

						req.getConnection(function(err, connection) {
							if(err){
								console.log(err.message);
								res.json(helper.setResponse(300,null,  null));
								return;
							}
							queryStr='select * from coupons  where vendor_id=?';
							console.log(queryStr);
							connection.query(queryStr,[data.data.vendor_id], function(err, c_rows) {
								if (err) {
									console.log(err.message);
									res.json(helper.setResponse(303, null, null));
								} else {
									console.log();	
									data.data.coupons=c_rows;
									res.json(helper.setResponse(data.code, "",data.data));
								} 
							});

						});

					}else
					res.json(helper.setResponse(data.code, "",null));
				} 
			});

		});
	}else
	res.json(helper.setResponse(201, null, null));
}


exports.addorUpdateCoupon = function (req, res) {
	let api_key = req.get('api_key');
	let v_api_key = req.get('v_api_key');
	let vendor_id = req.query.vendor_id;
	let coupon_name =  req.query.coupon_name;
	let coupon_id =  req.query.coupon_id;
	let description =  req.query.description;
	let type_id =  req.query.type_id;
	let discount =  req.query.discount;
	let limit =  req.query.limit;
	let start_date =  req.query.start_date;
	let end_date =  req.query.end_date;
	let image =  req.query.image;
	if ( typeof api_key !== 'undefined' &&  typeof v_api_key !== 'undefined' && typeof vendor_id !== 'undefined' && typeof coupon_name !== 'undefined'&& typeof type_id !== 'undefined'&& typeof description !== 'undefined'&& typeof discount !== 'undefined' && typeof limit !== 'undefined' && typeof start_date !== 'undefined'&& typeof end_date !== 'undefined'&& typeof image !== 'undefined') {
		req.getConnection(function(err, connection) {
			if(err){
				console.log(err.message);
				res.json(helper.setResponse(300,null,  null));
				return;
			}
			let queryStr="call CHECK_VENDOR_ACCESS(?,?,?,@code) ; SELECT @code as code";
			console.log(queryStr);
			connection.query(queryStr,[api_key,v_api_key,vendor_id], function(err, rows) {
				if (err) {
					console.log(err.message);
					res.json(helper.setResponse(303, null, null));
				} else {
					data =rows[1][0];
					if(data.code==200){
						req.getConnection(function(err, connection) {
							if(err){
								console.log(err.message);
								res.json(helper.setResponse(300,null,  null));
								return;
							}
							queryStr='insert into coupons(id,vendor_id,coupon_name,description,type_id,discount,limit_count,start_date,end_date) values(?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE coupon_name=?,description=?, type_id=?, discount=?, limit_count=? ,start_date=?,end_date=?';
							console.log(queryStr);
							connection.query(queryStr,[coupon_id,vendor_id,coupon_name,description,type_id,discount,limit,start_date,end_date,coupon_name,description,type_id,discount,limit,start_date,end_date], function(err, i_rows) {
								if (err) {
									console.log(err);
									res.json(helper.setResponse(303, null, null));
								} else {
									console.log(i_rows);	
									res.json(helper.setResponse(200, "",i_rows.insertId));
								} 
							});

						});
					}else
					res.json(helper.setResponse(data.code, "",null));
				} 
			});

		});
	}else
	res.json(helper.setResponse(201, null, null));
}


exports.getRegisterCoupons = function (req, res) {
	let api_key = req.get('api_key');
	let v_api_key = req.get('v_api_key');
	let vendor_id = req.query.vendor_id;
	if ( typeof api_key !== 'undefined' &&  typeof v_api_key !== 'undefined' && typeof vendor_id !== 'undefined') {
		req.getConnection(function(err, connection) {
			if(err){
				console.log(err);
				res.json(helper.setResponse(300,null,  null));
				return;
			}
			let queryStr="call CHECK_VENDOR_ACCESS(?,?,?,@code) ; SELECT @code as code";
			console.log(queryStr);
			connection.query(queryStr,[api_key,v_api_key,vendor_id], function(err, rows) {
				if (err) {
					console.log(err);
					res.json(helper.setResponse(303, null, null));
				} else {
					data =rows[1][0];
					if(data.code==200){
						req.getConnection(function(err, connection) {
							if(err){
								console.log(err);
								res.json(helper.setResponse(300,null,  null));
								return;
							}
							queryStr='SELECT c.type_id,c.coupon_name,c.description, uc.* FROM coupon.user_coupons uc left join coupons c on uc.coupon_id=c.id where c.vendor_id=? and is_valid="Y"';
							console.log(queryStr);
							connection.query(queryStr,[vendor_id], function(err, i_rows) {
								if (err) {
									console.log(err);
									res.json(helper.setResponse(303, null, null));
								} else {
									console.log(i_rows);	
									res.json(helper.setResponse(200, "",i_rows));
								} 
							});

						});
					}else
					res.json(helper.setResponse(data.code, "",null));
				} 
			});

		});
	}else
	res.json(helper.setResponse(201, null, null));
}


exports.couponImageUpload=function(req, res) {
	let coupon_id = req.body.coupon_id;
	if (!req.files && typeof coupon_id !== 'undefined')
		return 	res.json(helper.setResponse(201,null,  null));
	let sampleFile = req.files.sampleFile;
	var  uploadDir  = path.join(__dirname, '../public/uploads/'+coupon_id);
	if (!fs.existsSync(uploadDir)){
		fs.mkdirSync(uploadDir);
	}

	let fileName=replaceAll(sampleFile.name,"~","");

  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv(uploadDir+"/"+fileName, function(err) {
  	if (err)
  		return res.json(helper.setResponse(500,null,  null));
  	req.getConnection(function(err, connection) {
  		if(err){
  			console.log(err.message);
  			res.json(helper.setResponse(300,null,  null));
  			return;
  		}
  		let queryStr="update  coupons set images=concat(COALESCE(images,''),'~',?) where id=?";
  		console.log(queryStr);
  		connection.query(queryStr,['uploads/'+coupon_id+'/'+fileName,coupon_id], function(err, rows) {
  			if (err) {
  				console.log(err.message);
  				res.json(helper.setResponse(303, null, null));
  			} else {
  				res.json(helper.setResponse(200, "", {url:'uploads/'+coupon_id+'/'+fileName}));
  			}
  		});
  	});

  }); 
};


exports.imageDelete = function(req, res) {
	var coupon_id = req.query.coupon_id;
	var url = req.query.url;
	
	if ( typeof url !== 'undefined' && typeof coupon_id !== 'undefined')
	{
		req.getConnection(function(err, connection) {
			if(err){
				console.log(err.message);
				return res.json(helper.setResponse(300,null,  null));
			}
			let queryStr="update  coupons set images=REPLACE(images,?,'') where id=?";
			connection.query(queryStr,["~"+url,coupon_id], function(err, rows) {
				if (err) {
					console.log(err.message);
					res.json(helper.setResponse(303, null, null));
				} else {
					res.json(helper.setResponse(200, "",null));
				}
			});
		});

	} 
	else
		res.json(helper.setResponse(201, null, null));
};

exports.getCoupons = function (req, res) {
	let api_key = req.get('api_key');
	let v_api_key = req.get('v_api_key');
	let vendor_id = req.query.vendor_id;
	if ( typeof api_key !== 'undefined' &&  typeof v_api_key !== 'undefined' && typeof vendor_id !== 'undefined') {
		req.getConnection(function(err, connection) {
			if(err){
				console.log(err);
				res.json(helper.setResponse(300,null,  null));
				return;
			}
			let queryStr="call CHECK_VENDOR_ACCESS(?,?,?,@code) ; SELECT @code as code";
			console.log(queryStr);
			connection.query(queryStr,[api_key,v_api_key,vendor_id], function(err, rows) {
				if (err) {
					console.log(err);
					res.json(helper.setResponse(303, null, null));
				} else {
					data =rows[1][0];
					if(data.code==200){
						req.getConnection(function(err, connection) {
							if(err){
								console.log(err);
								res.json(helper.setResponse(300,null,  null));
								return;
							}
							queryStr='SELECT c.* from coupons c where c.vendor_id=? ';
							console.log(queryStr);
							connection.query(queryStr,[vendor_id], function(err, i_rows) {
								if (err) {
									console.log(err);
									res.json(helper.setResponse(303, null, null));
								} else {
									res.json(helper.setResponse(200, "",i_rows));
								} 
							});

						});
					}else
					res.json(helper.setResponse(data.code, "",null));
				} 
			});

		});
	}else
	res.json(helper.setResponse(201, null, null));
}

exports.useUserCoupons = function (req, res) {
	let api_key = req.get('api_key');
	let v_api_key = req.get('v_api_key');
	let vendor_id = req.query.vendor_id;
	let coupons = req.query.coupons +'';
	if ( typeof api_key !== 'undefined' &&  typeof v_api_key !== 'undefined' && typeof vendor_id !== 'undefined') {
		req.getConnection(function(err, connection) {
			if(err){
				console.log(err);
				res.json(helper.setResponse(300,null,  null));
				return;
			}
			let queryStr="call CHECK_VENDOR_ACCESS(?,?,?,@code) ; SELECT @code as code";
			console.log(queryStr);
			connection.query(queryStr,[api_key,v_api_key,vendor_id], function(err, rows) {
				if (err) {
					console.log(err);
					res.json(helper.setResponse(303, null, null));
				} else {
					data =rows[1][0];
					if(data.code==200){
						req.getConnection(function(err, connection) {
							if(err){
								console.log(err);
								res.json(helper.setResponse(300,null,  null));
								return;
							}

							queryStr='update user_coupons set is_used="Y" , used_date=CURRENT_TIMESTAMP where id in('+coupons+') and is_used!="Y"';
							console.log(queryStr);
							connection.query(queryStr, function(err, u_rows) {
								if (err) {
									console.log(err);
									res.json(helper.setResponse(303, null, null));
								} else {
									console.log(u_rows);	
									if(u_rows.affectedRows >0)
										res.json(helper.setResponse(200, "",u_rows.affectedRows));
									else
										res.json(helper.setResponse(404, "",u_rows.affectedRows));

								} 
							});

						});
					}else
					res.json(helper.setResponse(data.code, "",null));
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

function replaceAll(str, find, replace) {
	return str.replace(new RegExp(find, 'g'), replace);
};