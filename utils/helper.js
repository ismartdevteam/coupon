//http response json 
var setResponse= exports.setResponse = function (code,msg, data) {
  var response ={ 
    code:code
  };
  switch(code){
    case 200:
    response.message="Successful";
    break;
    case 201:
    response.message="mismatch params";
    break;
    case 300:
    response.message="error connection: "+msg;
    break;
    case 301:
    response.message="error query: "+msg;
    break;
    case 302:
    response.message="data not found: "+msg;
    break;
    case 303:
    response.message="db error: "+msg;
    break;
    
    case 400:
    response.message="mismatch user client";
    break;
    case 401:
    response.message="mismatch user auth:"+msg;
    break;
    case 402:
    response.message="user session expired :"+msg;
    break;
    case 403:
    response.message="request expired";
    break;
    case 501:
    response.message="error while running procedure:"+msg;
    break;

    case 601:
    response.message="no bank details found:"+msg;
    break;
    default:
    response.message="unknown error: "+msg;

  }

  response.data=data;

  return response;


}


//main db function duudaj bgaa heseguud


exports.addBankAccount= function (bindvarsapi,request , callback){
	

  request.getConnection(function (err, connection) {
    if (err) {
      return callback(setResponse(500, err.message, null)); 
    }
    connection.execute(
      "BEGIN ADD_BANK_ACCOUNT(:p_auth_params,:p_data,:out_code,:out_message,:out_api,:out_url); END; ",
      bindvarsapi,{autoCommit: true},
      function (err, result) {
        if (err) {
         return callback(setResponse(501, err.message, null));
       }

       

       return callback(result.outBinds);
     });
  })
}

exports.checkUserAuth= function (bindvarsapi,request , callback){
 console.log(bindvarsapi);
 var response;
 request.getConnection(function (err, connection) {
  if (err) {
    return callback(setResponse(500, err.message, null)); 
  }
  connection.execute(
    "BEGIN check_user_auth(:p_client_id,:p_millis,:p_session,:p_user_id,:p_auth,:p_imei,:p_data,:p_req_type,:code,:message); END; ",
    bindvarsapi,{autoCommit: true},
    function (err, result) {
      
      if (err) {
       return callback(setResponse(501, err.message, null));
     }
     console.log(result);
     if (result.outBinds.code == '200') {
      response= setResponse(200, null,null);
    } else {
      response =setResponse(result.outBinds.code, result.outBinds.message, null);

    }
    return callback(response);
  });
})

}

