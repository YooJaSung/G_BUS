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
var koreaCommonBiz = require('../../server_biz/korea_common/common_biz.js');


var nodeCache = require('node-cache');
var DetailCache = new nodeCache(
    {
        stdTTL : 100,
        checkperiod: 150
    }
);

koreaDbObject.routeSearch = function(cityObject, routeNm, callback){

    var routeQuery = dbQuery.g_busquery.ROUTESEARCH;

    var citycds = queryCityCode(cityObject);

    pool.getConnection(function(err, db){
       if(err){
           throw err;
       }else{
            db.query(routeQuery, [citycds, routeNm], function(err, rows){
                if(err){
                    throw err;

                }else{
                    db.release();
                    console.log('Route_Search DB Result');
                    callback(rows);
                }
            })
       }
    });
};

koreaDbObject.stationSearch = function(cityObject, stationNm, callback){

    var stationQuery = dbQuery.g_busquery.STATIONSEARCH;
    var citycds = queryCityCode(cityObject);

    pool.getConnection(function(err, db){
        if(err){
            throw err;
        }else{
            db.query(stationQuery, [citycds, stationNm], function(err, rows){
                if(err){
                    throw err;

                }else{
                    db.release();
                    console.log('Station_Search DB Result');
                    callback(rows);
                }
            })
        }
    });


};


function queryCityCode (cityObject){


    var citycds = '';

    for(var i in cityObject){


        if(i < cityObject.length -1 ){
            citycds += cityObject[i].citycode + " , ";
        }
        else{
            citycds +=  cityObject[i].citycode;
        }

    }

    return citycds;
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



    var cacheName  = koreaCommonBiz.makeDetailCacheName(cityCd, rid);

    DetailCache.get(cacheName, function(err,value){
        if(!err){
            if(value === undefined){
                var routeDetailQuery = dbQuery.g_busquery.ROUTEDETAIL;
                //citycd, rid
                pool.getConnection(function(err, db){
                    if(err){
                        throw err;
                    }else{
                        db.query(routeDetailQuery, [cityCd, rid], function(err, rows){

                            if(err){
                                throw err;

                            }else{
                                db.release();
                                console.log('Route_Detail DB Result');

                                DetailCache.set(cacheName, rows, function(err, success){
                                    if(!err && success){
                                        console.log('Route_Detail input cache success ');
                                    }else{
                                        throw err;
                                    }
                                });

                                callback(rows);
                            }
                        })
                    }
                });
            }else{
                console.log('Route_Detail Cache Result');
                callback(value);
            }
        }else{
            throw err;
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

    var cacheName  = koreaCommonBiz.makeDetailCacheName(cityCd, sid);


    DetailCache.get(cacheName, function(err,value){
        if(!err){
            if(value === undefined){

                var stationDetailQuery = dbQuery.g_busquery.STATIONDETAIL;
                //cityCd, sid
                pool.getConnection(function(err, db){
                    if(err){
                        throw err;
                    }else{
                        db.query(stationDetailQuery, [cityCd, sid], function(err, rows){

                            if(err){
                                throw err;

                            }else{
                                db.release();
                                console.log('Station_Detail DB Result');

                                DetailCache.set(cacheName, rows, function(err, success){
                                    if(!err && success){
                                        console.log('Station_Detail input cache success ');
                                    }else{
                                        throw err;
                                    }
                                });

                                callback(rows);
                            }
                        })
                    }
                });

            }else{
                console.log('Station_Detail Cache Result');
                callback(value);
            }
        }else{
            throw err;
        }
    });
};

koreaDbObject.dbAroundXY = function(cityCd, dbObject, callback){
    var getAroundQuery = dbQuery.g_busquery.AROUNDXY;

    var dbTemp = dbObject[0];
    pool.getConnection(function(err,db){
        if(err){
            throw err;
        }else{
            db.query(getAroundQuery,[cityCd,dbTemp[0].latix,dbTemp[0].longy], function(err,rows){

                if(err){
                    throw err;

                }else{
                    db.release();
                    console.log('Station_Search AroundXY DB REsult');
                    callback(rows);
                }

            })
        }
    })
};


/**
 *
 * place Search db Access
 *
 */

koreaDbObject.placeSearch = function( sx, sy, ex, ey ,sname, ename, callback){
    var placeSearchQuery = dbQuery.g_busquery.PLACESEARCH;

    pool.getConnection(function(err, db){
       if(err){
           throw err;
       }else{
           db.query(placeSearchQuery,[sx, sy, ex, ey, sname, ename], function(err, rows){
               if(err){
                   throw err;

               }else{
                   db.release();
                   callback(rows);
               }
           })
       }
    });

};

module.exports = koreaDbObject;
