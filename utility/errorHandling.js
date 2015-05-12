/**
 * Created by airnold on 15. 5. 12..
 */

exports.throw = function(status, errorMessage){
    var err = new Error(errorMessage);
    err.status = status;
    throw err;
};


/**
 *
 *
 * 5001 -> route URL request error
 * 5002 -> station URL request error
 * 5003 -> database error
 *
 *
 */