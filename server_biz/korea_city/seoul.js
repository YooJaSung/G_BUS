

/**
 * Created by airnold on 15. 4. 24..
 */


var request = require('request');
var xml2jsparser = require('xml2json');

var commonBiz = require('../korea_common/common_biz.js');

var seoulObject = {};

var routeurl = "http://ws.bus.go.kr/api/rest/buspos/getBusPosByRtid?" +
    "serviceKey=3Dk6D80iliB7j4NcdFAiIGHm2O3X7HXg8j27%2BTt7%2FOhxiAecZ%2FffBwSQZCjGcqzTlONzGeUh%2F17714ETt5z39Q%3D%3D";

var stationurl = "http://ws.bus.go.kr/api/rest/stationinfo/getStationByUid?" +
    "serviceKey=3Dk6D80iliB7j4NcdFAiIGHm2O3X7HXg8j27%2BTt7%2FOhxiAecZ%2FffBwSQZCjGcqzTlONzGeUh%2F17714ETt5z39Q%3D%3D";

/**
 *
 * request data format
 */

var requestData = {};
requestData.route = {};
requestData.route.busRouteId = "";


requestData.station = {};
requestData.station.arsId = "";


seoulObject.urlRouteRequest = function (dbObject, callback) {

    var dbTemp = dbObject[0];

    requestData.route.busRouteId = dbTemp[0].routeid;

    var url = routeurl + "&busRouteId=" + requestData.route.busRouteId;

    request(url, function (error, response, body) {
        var seoul_bus_location_seq = [];
        var up_seq = [];
        if (error) {
            throw error;
        }
        else {
            var xmldata = body;
            var options = {
                object: true,
                sanitize: false,
                arrayNotation: true
            };
            var result = xml2jsparser.toJson(xmldata, options);

            var tempre = result.ServiceResult[0].msgBody[0];
            var locArr = tempre.itemList;
            if(locArr === undefined){
                seoul_bus_location_seq.push(up_seq);
            }else {


                for (var i in locArr) {
                    var seq = locArr[i].sectOrd[0];
                    seq = seq * 1 + 1;
                    up_seq.push(seq);
                }
                seoul_bus_location_seq.push(up_seq);
            }

            callback(seoul_bus_location_seq);

        }
    });
};
seoulObject.urlStationRequest = function (dbObject, callback) {

    var dbTemp = dbObject[0];

    var seoul_list = [];

    if(dbTemp[0].arsid === '0' || dbTemp[0].arsid === 0){
        callback(seoul_list);
    }

    requestData.station.arsId = dbTemp[0].arsid;

    var url = stationurl + "&arsId=" + requestData.station.arsId;

    request(url, function (error, response, body) {

        if (error) {
            throw error;
        }
        else {

            var xmldata = body;
            var options = {
                object: true,
                sanitize: false,
                arrayNotation: true
            };

            var result = xml2jsparser.toJson(xmldata, options);

            var tempre = result.ServiceResult[0].msgBody[0];
            var stArr = tempre.itemList;
            for(var i in stArr){

                if(stArr[i].isLast1 === '-2'){
                    var temp = {};
                    temp.routenm = stArr[i].rtNm[0];
                    temp.routeid = stArr[i].busRouteId[0];
                    temp.arrive_time = "운행종료";
                    temp.cur_pos = '';
                }else if(stArr[i].isLast1 === '-1'){
                    var temp = {};
                    temp.routenm = stArr[i].rtNm[0];
                    temp.routeid = stArr[i].busRouteId[0];
                    temp.arrive_time = "출발준비중";
                    temp.cur_pos = '';
                }
                else{
                    var temp = {};
                    temp.routenm = stArr[i].rtNm[0];
                    temp.routeid = stArr[i].busRouteId[0];
                    temp.arrive_time = "약 " + commonBiz.changeTomin(stArr[i].traTime1[0]) + " 후 도착";
                    if(stArr[i].stationNm1 === undefined){
                        temp.cur_pos = '';
                    }else{
                        temp.cur_pos = stArr[i].stationNm1[0];
                    }
                }



                seoul_list.push(temp);
            }
            callback(seoul_list);
        }
    });

};

module.exports = seoulObject;


