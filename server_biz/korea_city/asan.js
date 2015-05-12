/**
 * Created by airnold on 15. 4. 24..
 */

// post method // get json data
//   http://bus.asan.go.kr/mobile/traffic/searchBusRealLocationDetail -> route
//   route param -> busRouteId
//   http://bus.asan.go.kr/mobile/traffic/searchBusStopRoute  -> station
//   station param -> busStopId

var request = require('request');
var errorHaldling = require('../../utility/errorHandling.js');


var asanObject = {};

var routeurl = "http://bus.asan.go.kr/mobile/traffic/searchBusRealLocationDetail";
var stationurl = "http://bus.asan.go.kr/mobile/traffic/searchBusStopRoute";

/**
 *
 * request data format
 */

var requestData = {};
requestData.route = {};
requestData.route.busRouteId = "";

requestData.station = {};
requestData.station.busStopId = "";

/**
 *
 * database data format
 */

asanObject.urlRouteRequest = function (dbObject, callback) {

    // dbObject에 있는 stop_name과 비교해야 함.

    /**
     * 1. routeUrl 포멧을 db에서 선택한 데이터를 가지고 맞춰준다
     * 2. post or get 방식에 따라 request 까지 해준다.
     */
    requestData.route.busRouteId = dbObject[0].routeid;

    request.post({
        url: 'http://bus.asan.go.kr/mobile/traffic/searchBusRealLocationDetail',
        form: {
            busRouteId: requestData.route.busRouteId
        }
    }, function (error, httpResponse, json) {

        var asan_bus_location_seq = [];
        if (error) {
            errorHaldling.throw(5001, 'Route URL Request Error');
        } else {
            var parsed = JSON.parse(json);
            // json -> array 변환
            var arr = [];
            for (var x in parsed) {
                arr.push(parsed[x]);
            }
            var jsondata = arr[0];
            // 방어코드
            if (arr.length === 0) {
                callback(asan_bus_location_seq);
            } else {

                for(var i in jsondata){
                    asan_bus_location_seq.push(findRouteSeq(jsondata[i].stop_id, dbObject));
                }
                callback(asan_bus_location_seq);
            }
        }
    });

};
asanObject.urlStationRequest = function (dbObject, callback) {

    requestData.station.busStopId = dbObject[0].stopid;

    request.post({
        url: 'http://bus.asan.go.kr/mobile/traffic/searchBusStopRoute',
        form: {
            busStopId:requestData.station.busStopId
        }
    }, function (error, response, json) {
        if (!error && response.statusCode == 200) {

            var psd = JSON.parse(json);
            var arriveTime_list = psd.busStopRouteList;

            for (var i in arriveTime_list) {
                console.log("노선명 : " + arriveTime_list[i].route_name);
                console.log("노선 id : " + arriveTime_list[i].route_id);
                console.log("예상 도착시간 : " + arriveTime_list[i].provide_type);
            }

            callback(arriveTime_list);

        } else {
            errorHaldling.throw(5002, 'Station URL Request Error');
        }
    });

};

function findRouteSeq(stopid, dbObject) {
    var seq = undefined;

    for (var i in dbObject) {
        /**
         * urlarr에 있는 stopid와 db에 stopnm을 비교하여 seq저장
         */

        if(dbObject[i].stopid === stopid){
            seq =  dbObject[i].seq;
            break;
        }
    }
    return seq;
}

module.exports = asanObject;


