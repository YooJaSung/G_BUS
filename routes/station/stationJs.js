/**
 * Created by airnold on 15. 4. 22..
 */

var express = require('express');
var stationRouter = express.Router();
var nimble = require('nimble');

var koreaDb = require('../../server_biz/korea_common/korea_db.js');

stationRouter.all('/stationSearch', function(req,res, next){
    /**
     * 1. database access and get data
     * 2. url format method call param @dataObject
     * 3. url request devide city
     * 4. function( dbDataObject ) -> return url format
     */

    /*var stationNm = req.body.stationNm;
    var cityCodeObj = req.body.cityObject;*/
    var tempCityCodeObj = [
        {
            "cityCode" : "101",
            "cityEnNm" : "seoul"
        },
        {
            "cityCode" : "102",
            "cityEnNm" : "gyunggi"
        },
        {
            "cityCode" : "103",
            "cityEnNm" : "incheon"
        }
    ];

    koreaDb.stationSearch(tempCityCodeObj, '시청' , function(stationData){
        res.send(stationData);
    });
});

stationRouter.all('/stationDetail', function(req,res, next){

    var cityDir = "../../server_biz/korea_city/" + "asan" + ".js";
    var cityObject = require(cityDir);

    var dbObject = undefined;
    var urlStationObject = undefined;
    var stationObject = undefined;


    /**
     * nimble 사용하여 series 로 구성 dbObject -> urlrequest method
     */

    nimble.series([
        function(DBCallback){
            koreaDb.dbStationDetail('102', "2844" , function(stationDetailData){

                dbObject = stationDetailData;
                DBCallback();
            });
        },
        function(urlCallback){
            cityObject.urlStationRequest(dbObject, function(urlStationData){
                urlStationObject = urlStationData;
                urlCallback();
            });

        },
        function(resCallback){

            stationObject.urlStationObject = urlStationObject;
            stationObject.dbObject = dbObject;

            res.send(stationObject);
            resCallback();
        }
    ]);
});

module.exports = stationRouter;

