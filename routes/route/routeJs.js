/**
 * Created by airnold on 15. 4. 22..
 */

var express = require('express');
var routeRouter = express.Router();
var nimble = require('nimble');


var koreaDb = require('../../server_biz/korea_common/korea_db.js');
var koreaCommonBiz = require('../../server_biz/korea_common/common_biz.js');

var nodeCache = require('node-cache');
var myCache = new nodeCache(
    {
        stdTTL : 100,
        checkperiod: 150
    }
);


routeRouter.post('/routeSearch', function (req, res, next) {

     var getdata = req.body.data;
     var routeNm = getdata.routenm;
     var cityCodeObj = getdata.cityobject;

    var cacheName  = koreaCommonBiz.makeCacheName(cityCodeObj, routeNm);

    myCache.get(cacheName, function(err,value){
       if(!err){
           if(value === undefined){
               koreaDb.routeSearch(cityCodeObj, routeNm, function (routeData) {
                   console.log('Route_Search Response');
                   res.send(routeData);
                   myCache.set(cacheName, routeData, function(err, success){
                       if(!err && success){
                           console.log('cache success ');
                       }else{
                           throw err;
                       }
                   });
               });
           }else{
               res.send(value);
           }
       }else{
           throw err;
       }
    });
});


routeRouter.all('/routeDetail', function (req, res, next) {

    var getdata = req.body.data;
    var cityEnNm = getdata.cityennm;
    var rid = getdata.rid;
    var cityCode = getdata.citycode;

    var cityDir = "../../server_biz/korea_city/" + cityEnNm + ".js";
    var cityObject = require(cityDir);

    var dbObject = undefined;
    var urlRouteObject = undefined;
    var timetempObject = undefined;
    var routeObject = {};

    nimble.series([
        function(DBCallback){
            koreaDb.dbRouteDetail(cityCode, rid, function (routeDetailData) {
                console.log('Route_Detail DB Nimble');
                dbObject = routeDetailData;
                DBCallback();
            });
        },
        function(urlCallback){
            cityObject.urlRouteRequest(dbObject, function (urlRouteData) {
                console.log('Route_Detail URL Nimble');
                urlRouteObject = urlRouteData;
                urlCallback();
            });
        },
        function(timeCallback){
            timetempObject = koreaCommonBiz.makeTimeObject(dbObject);
            timeCallback();
        },
        function(resCallback){

            routeObject.urlRouteObject = urlRouteObject;
            routeObject.dbObject = dbObject;
            routeObject.timeObject = timetempObject;
            console.log('Route_Deatil Response Nimble');

            res.send(routeObject);

            resCallback();
        }
    ]);
});

module.exports = routeRouter;