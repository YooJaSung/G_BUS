/**
 * Created by airnold on 15. 4. 29..
 */

/**
 *
 * 1. database 연동을 위한 변수 생성
 * 2. 변수에 2가지 쿼리 미리 세팅 (routesearch, stationsearch)
 * 3. 한국 버전 쿼리는 모두 이 파일에서 처리해준다
 *
 */

var koreaDbObject = {};
var dbQuery = require('../../server_config/mysql/mysql_config.js');
var pool = require('../../server_config/mysql/DBConnect.js');
var errorHaldling = require('../../utility/errorHandling.js');

koreaDbObject.routeSearch = function(cityObject, routeNm, callback){


    var routeQuery = dbQuery.g_busquery.ROUTESEARCH;

    var routeStr = queryCityCodeRoute(cityObject, routeQuery);

    pool.getConnection(function(err, db){
       if(err){
           throw err;
       }else{
            db.query(routeStr, ["%"+routeNm+"%"], function(err, rows){

                callback(rows);
            })
       }
    });
};

koreaDbObject.stationSearch = function(cityObject, stationNm, callback){

    var stationQuery = dbQuery.g_busquery.STATIONSEARCH;
    var stationStr = queryCityCodeStation(cityObject, stationQuery);

    pool.getConnection(function(err, db){
        if(err){
            throw err;
        }else{
            db.query(stationStr, ["%"+stationNm+"%"], function(err, rows){
                callback(rows);
            })
        }
    });


};

function queryCityCodeRoute (cityObject, routeQuery){
    routeQuery += ' AND ( ';

    /**
     * cityObject 반복문을 통해 추가해주기
     * cityObject 숫자에 맞춰 마지막 index에서는 OR 없게 한다
     */




    console.log(cityObject.length);
    for(var i in cityObject){
        if(i < cityObject.length -1 ){
            routeQuery += "R.CITYCD = " + cityObject[i].cityCode + " OR ";
        }
        else{
            routeQuery += "R.CITYCD = " + cityObject[i].cityCode;
        }

    }

    routeQuery += ' ) ';
    routeQuery += 'LIMIT 30 ;';


    return routeQuery;
}

function queryCityCodeStation (cityObject, stationQuery){


    stationQuery += ' AND ( ' ;
    /**
     * cityObject 반복문을 통해 str 추가
     * cityObject 숫자에 맞춰 마지막 index에서는 OR 없게 한다
     */

    for(var i in cityObject){
        if(i < cityObject.length -1 ){
            stationQuery += "S.citycd = " + cityObject[i].cityCode + " OR ";
        }
        else{
            stationQuery += "S.citycd = " + cityObject[i].cityCode;
        }

    }

    stationQuery += ' ) ;';

    return stationQuery;
}


/**
 *
 * @param cityCd
 * @param rid
 * @param callback
 *
 * route Detail db access
 */

koreaDbObject.dbRouteDetail = function(cityCd, rid, callback){


    var routeDetailQuery = dbQuery.g_busquery.ROUTEDETAIL;
    //citycd, rid
    pool.getConnection(function(err, db){
        if(err){
            throw err;
        }else{
            db.query(routeDetailQuery, [cityCd, rid], function(err, rows){
                console.log('routeDetail3');
                callback(rows);
            })
        }
    });

};

/**
 *
 * @param cityCd
 * @param sid
 * @param callback
 *
 * station Detail db access
 *
 */

koreaDbObject.dbStationDetail = function(cityCd, sid, callback){

    var stationDetailQuery = dbQuery.g_busquery.STATIONDETAIL;
    //cityCd, sid
    pool.getConnection(function(err, db){
        if(err){
            throw err;
        }else{
            db.query(stationDetailQuery, [cityCd, sid], function(err, rows){
                callback(rows);
            })
        }
    });
};

koreaDbObject.dbAroundXY = function(cityCd, dbObject, callback){
    var getAroundQuery = dbQuery.g_busquery.AROUNDXY;
    pool.getConnection(function(err,db){
        if(err){
            throw err;
        }else{
            db.query(getAroundQuery,[cityCd, dbObject[0].LATIX,dbObject[0].LATIX,dbObject[0].LONGY,dbObject[0].LONGY, dbObject[0].LATIX,dbObject[0].LATIX,dbObject[0].LONGY], function(err,rows){
                callback(rows);
            })
        }
    })
};


/**
 *
 * place Search db Access
 *
 */

koreaDbObject.placeSearch = function(cityCd, sx, sy, ex, ey){

};




module.exports = koreaDbObject;
