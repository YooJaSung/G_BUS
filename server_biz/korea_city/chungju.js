

/**
 * Created by airnold on 15. 4. 24..
 */

// post method // json
//   http://m.dcbis.go.kr/rest/getRunBusDetail.json
//   route param -> routeid
//   http://www.dcbis.go.kr/rest/getRouteRunBusDetail.json
//   station param -> sid

var request = require('request');
var errorHaldling = require('../../utility/errorHandling.js');

var chungjuObject = {};

var routeurl = "http://m.dcbis.go.kr/rest/getRunBusDetail.json";

var stationurl = "http://www.dcbis.go.kr/rest/getRouteRunBusDetail.json";


/**
 *
 * request data format
 */

var requestData = {};
requestData.route = {};
requestData.route.routeid = "" ;

requestData.station = {};
requestData.station.sid = "";


chungjuObject.urlRouteRequest = function(dbObject, callback){

    /**
     * 1. routeUrl 포멧을 db에서 선택한 데이터를 가지고 맞춰준다
     * 2. post or get 방식에 따라 request 까지 해준다.
     */

    requestData.route.routeid = dbObject[0].routeid;

    request.post({
        url: routeurl,
        form: {
            routeid: requestData.route.routeid
        }
    }, function (error, response, json) {
        if (!error && response.statusCode == 200) {
            var chungju_bus_location_seq = [];

            var parsed = JSON.parse(json);
            var arr = [];
            for(var x in parsed){
                arr.push(parsed[x]);
            }
            var jsondata = arr[0];
            for(var i in jsondata){
                if(jsondata[i].tagType !== ' '){
                    console.log(i);
                    chungju_bus_location_seq.push(i);
                }
            }

            callback(chungju_bus_location_seq);

        }else{
            errorHaldling.throw(5001, 'Route URL Request Error');
        }
    });

};
chungjuObject.urlStationRequest = function(dbObject, callback){

    requestData.station.sid = dbObject[0].stopid;

    request.post({
        url: stationurl,
        form: {
            sid: requestData.station.sid
        }
    }, function (error, response, json) {
        if (!error && response.statusCode == 200) {
            var parsed_json = JSON.parse(json);
            var chungju_list = parsed_json.model;

            for(var i in chungju_list){
                console.log("노선 번호 : "+ chungju_list[i].BUSROUTENO);
                console.log("차량번호 : "+ chungju_list[i].VEHICLENO);
                console.log("예상 도착 시간 : "+ chungju_list[i].PREDICTTRAVELTIME);
                console.log("정류소 번호 : "+ chungju_list[i].BUSSTATIONID+"\n");
            }

            callback(chungju_list);

        }else{
            errorHaldling.throw(5002, 'Station URL Request Error');
        }
    });

};







module.exports = chungjuObject;


