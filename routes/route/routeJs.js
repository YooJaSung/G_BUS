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

    /* var routeNm = req.body.routeNm;
     var cityCodeObj = req.body.cityObject;*/

    var tempCityCodeObj = [
        {
            "cityCode": "101",
            "cityEnNm": "seoul"
        },
        {
            "cityCode": "102",
            "cityEnNm": "gyunggi"
        },
        {
            "cityCode": "103",
            "cityEnNm": "incheon"
        }
    ];

    koreaDb.routeSearch(tempCityCodeObj, "10", function (routeData) {
        console.log(routeData);
        res.send(routeData);
    });

});

routeRouter.all('/routeDetail', function (req, res, next) {

    var cityDir = "../../server_biz/korea_city/" + "busan" + ".js";
    var cityObject = require(cityDir);

    var dbObject = undefined;
    var urlRouteObject = undefined;
    var routeObject = undefined;

    /**
     * nimble 사용하여 series 로 구성 dbObject -> urlrequest method
     */

    nimble.series([
        function(DBCallback){

            koreaDb.dbRouteDetail('102', "937", function (routeDetailData) {

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

            res.send(routeObject);
            resCallback();
        }

    ]);
});

module.exports = routeRouter;