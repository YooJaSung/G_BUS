/**
 * Created by airnold on 15. 4. 24..
 */

// post method // json
//   http://bis.hwasun.go.kr/busmap/busLocationList
//   route param -> LINE_ID

//   http://m.bis.hwasun.go.kr/mobile/busArriveInfoList
//   station param -> BUSSTOP_ID

var request = require('request');
var errorHaldling = require('../../utility/errorHandling.js');

var hwasoonObject = {};

var routeurl = "http://bis.hwasun.go.kr/busmap/busLocationList";

var stationurl = "http://m.bis.hwasun.go.kr/mobile/busArriveInfoList";

/**
 *
 * request data format
 */

var requestData = {};
requestData.route = {};
requestData.route.LINE_ID = "" ;

requestData.station = {};
requestData.station.BUSSTOP_ID = "";






hwasoonObject.urlRouteRequest = function(dbObject, callback){

    /**
     * 1. routeUrl 포멧을 db에서 선택한 데이터를 가지고 맞춰준다
     * 2. post or get 방식에 따라 request 까지 해준다.
     */
    requestData.route.LINE_ID = dbObject[0].routeid;


    request.post({
        url: routeurl,
        form: {
            LINE_ID  : requestData.route.LINE_ID
        }
    }, function (error, response, json) {
        var hwasoon_bus_location_seq = [];
        if (!error && response.statusCode == 200) {

            var parsed = JSON.parse(json);
            var arr = [];
            for(var x in parsed){
                arr.push(parsed[x]);
            }
            var jsondata = arr[0];

            for(var i in jsondata){
                if(jsondata[i].CARNO !== null ){
                    hwasoon_bus_location_seq.push(i);
                }
            }

            callback(hwasoon_bus_location_seq);

        }else{
            errorHaldling.throw(5001, 'Route URL Request Error');
        }
    });

};
hwasoonObject.urlStationRequest = function(dbObject, callback){

    requestData.station.BUSSTOP_ID = dbObject[0].stopid;

    request.post({
        url: stationurl,
        form: {
            BUSSTOP_ID: requestData.station.BUSSTOP_ID
        }
    }, function (error, response, json) {
        if (!error && response.statusCode == 200) {

            var psd = JSON.parse(json);
            var hwasoon_list = psd.list;

            for(var i in hwasoon_list) {
                console.log("노선 번호 : "+hwasoon_list[i].LINE_NAME);
                console.log("남은 정류장 갯수 : "+hwasoon_list[i].REMAIN_STOP);
                console.log("예상 도착 시간 : "+hwasoon_list[i].REMAIN_MIN + "분");
                console.log("현재 위치 : "+hwasoon_list[i].BUSSTOP_NAME);
                console.log("노선 ID : "+hwasoon_list[i].LINE_ID + "\n");
            }

            callback(hwasoon_list);

        }else{
            errorHaldling.throw(5002, 'Station URL Request Error');
        }
    });

};








module.exports = hwasoonObject;


