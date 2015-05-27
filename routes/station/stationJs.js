/**
 * Created by airnold on 15. 4. 22..
 */

var express = require('express');
var stationRouter = express.Router();
var nimble = require('nimble');

var koreaDb = require('../../server_biz/korea_common/korea_db.js');

stationRouter.all('/stationSearch', function(req,res, next){

    var getdata = req.body.data;
    var stationNm = getdata.stationNm;
    var cityCodeObj = getdata.cityObject;

    koreaDb.stationSearch(cityCodeObj, stationNm , function(stationData){
        res.send(stationData);
    });

});

stationRouter.all('/stationDetail', function(req,res, next){


    var getdata = req.body.data;
    var cityEnNm = getdata.cityEnNm;
    var sid = getdata.sid;
    var cityCode = getdata.cityCode;

    var cityDir = "../../server_biz/korea_city/" + cityEnNm + ".js";
    var cityObject = require(cityDir);

    var dbObject = undefined;
    var urlStationObject = undefined;
    var aroundXY = undefined;
    var stationObject = {};

    nimble.series([
        function(DBCallback){
            koreaDb.dbStationDetail(cityCode, sid , function(stationDetailData){

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
        function(aroundCallback){
            koreaDb.dbAroundXY(cityCode, dbObject, function(aroundxyData){
                aroundXY = aroundxyData;
                aroundCallback();
            });
        },
        function(resCallback){

            stationObject.urlStationObject = urlStationObject;
            stationObject.dbObject = dbObject;
            stationObject.aroundXY = aroundXY;

            res.send(stationObject);
            resCallback();
        }
    ]);
});

module.exports = stationRouter;

