/**
 * Created by airnold on 15. 4. 22..
 */

var express = require('express');
var stationRouter = express.Router();
var nimble = require('nimble');

var koreaDb = require('../../server_biz/korea_common/korea_db.js');

stationRouter.all('/stationSearch', function(req,res, next){

    var stationNm = req.body.stationNm;
    var cityCodeObj = req.body.cityObject;


    koreaDb.stationSearch(cityCodeObj, stationNm , function(stationData){
        res.send(stationData);
    });
});

stationRouter.all('/stationDetail', function(req,res, next){

    var cityEnNm = req.body.cityEnNm;
    var rid = req.body.rid;
    var cityCode = req.body.cityCode;

    var cityDir = "../../server_biz/korea_city/" + cityEnNm + ".js";
    var cityObject = require(cityDir);

    var dbObject = undefined;
    var urlStationObject = undefined;
    var stationObject = undefined;



    nimble.series([
        function(DBCallback){
            koreaDb.dbStationDetail(cityCode, rid , function(stationDetailData){

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

