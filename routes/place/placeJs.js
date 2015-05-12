/**
 * Created by airnold on 15. 4. 22..
 */

var express = require('express');
var placeRouter = express.Router();

/**
 *
 * 동적 require를 통해 분기를 처리하지않고 바로 파일을 로드할 수 있도록.
 * citycode에 따른 동적 파일 로드
 */
var temp = '../../server_config/mysql/DBConnect.js';
var pool = require(temp);

pool.getConnection(function(err, db){
    if(err){
        console.log('db error');
    }else{
        console.log('success');
    }
});


module.exports = placeRouter;

