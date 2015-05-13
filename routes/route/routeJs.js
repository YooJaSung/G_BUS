/**
 * Created by airnold on 15. 4. 22..
 */

var express = require('express');
var routeRouter = express.Router();
var nimble = require('nimble');

var koreaDb = require('../../server_biz/korea_common/korea_db.js');


routeRouter.all('/routeSearch', function (req, res, next) {

    /**
     * 1. database access and get data
     * 2. url format method call param @dataObject
     * 3. url request devide city
     * 4. function( dbDataObject ) -> return url format
     */
     var getdata = req.body.data;
     var routeNm = getdata.routeNm;
     var cityCodeObj = getdata.cityObject;

    console.log('routeSearch1');

    koreaDb.routeSearch(cityCodeObj, routeNm, function (routeData) {
        console.log('routeSearch4');
        res.status(200).send(routeData);
    });

});

routeRouter.all('/routeDetail', function (req, res, next) {

    var getdata = req.body.data;
    var cityEnNm = getdata.cityEnNm;
    var rid = getdata.rid;
    var cityCode = getdata.cityCode;



    var cityDir = "../../server_biz/korea_city/" + cityEnNm + ".js";
    var cityObject = require(cityDir);

    var dbObject = undefined;
    var urlRouteObject = undefined;
    var routeObject = {};

    /**
     * nimble 사용하여 series 로 구성 dbObject -> urlrequest method
     */

    nimble.series([

        function(DBCallback){
            koreaDb.dbRouteDetail(cityCode, rid, function (routeDetailData) {

                dbObject = routeDetailData;
                DBCallback();
            });
        },
        function(urlCallback){
            cityObject.urlRouteRequest(dbObject, function (urlRouteData) {

                urlRouteObject = urlRouteData;
                urlCallback();
            });
        },
        function(resCallback){

            routeObject.urlRouteObject = urlRouteObject;
            routeObject.dbObject = dbObject;
            res.status(200).send(routeObject);
            resCallback();
        }
    ]);
});

module.exports = routeRouter;