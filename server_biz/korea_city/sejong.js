/**
 * Created by airnold on 15. 4. 24..
 */

// post method // json
//   http://mbis.sejong.go.kr/web/traffic/searchBusRealLocationDetail
//   http://mbis.sejong.go.kr/mobile/traffic/searchBusRouteDetail
//   route param -> busRouteId
// 두개의 요청을 비교하여 seq 생성
//   http://mbis.sejong.go.kr/mobile/traffic/searchBusStopRoute
//   station param -> busStopId

var request = require('request');
var errorHaldling = require('../../utility/errorHandling.js');

var sejongObject = {};

var routeurl_first = "http://mbis.sejong.go.kr/web/traffic/searchBusRealLocationDetail";

var routeurl_second = "http://mbis.sejong.go.kr/mobile/traffic/searchBusRouteDetail";


var stationurl = "http://mbis.sejong.go.kr/mobile/traffic/searchBusStopRoute";

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

var databaseData = {};
databaseData.sid = "";
databaseData.cityCd = "";
databaseData.rid = "";
databaseData.stopNm = "";
databaseData.routeNm = "";


sejongObject.urlRouteRequest = function (dbObject, callback) {

    /**
     * 1. routeUrl 포멧을 db에서 선택한 데이터를 가지고 맞춰준다
     * 2. post or get 방식에 따라 request 까지 해준다.
     */

    requestData.route.busRouteId = dbObject[0].routeid;

    var routename = [];
    var routerealbusloc = [];
    var sejong_bus_location_seq = [];

    request.post({
        url: routeurl_first,
        form: {
            busRouteId: requestData.route.busRouteId
        }
    }, function (error, response, json) {
        if (!error && response.statusCode == 200) {


            var parsed = JSON.parse(json);

            for (var x in parsed) {
                routerealbusloc.push(parsed[x]);
            }

        } else {
            throw error;
        }
    });

    request.post({
        url: routeurl_second,
        form: {
            busRouteId: requestData.route.busRouteId
        }
    }, function (error, response, json) {
        if (!error && response.statusCode == 200) {
            var parsed = JSON.parse(json);

            for (var x in parsed) {
                routename.push(parsed[x]);
            }
            var routedata = routename[0];
            var busloc = routerealbusloc[0];


            for (var i in routedata) {
                /*console.log(routedata[i]);*/

                for (var j in busloc) {
                    if (routedata[i].stop_id === busloc[j].stop_id) {
                        console.log(i);
                        sejong_bus_location_seq.push(i);
                    }
                }
            }
            callback(sejong_bus_location_seq);

        } else {
            errorHaldling.throw(5001, 'Route URL Request Error');
        }
    });

};
sejongObject.urlStationRequest = function (dbObject, callback) {

    requestData.station.busStopId = dbObject[0].stopid;

    request.post({
        url: stationurl,
        form: {
            busStopId: requestData.station.busStopId
        }
    }, function (error, response, json) {
        if (!error && response.statusCode == 200) {
            var parsed_json = JSON.parse(json);
            var sejong_list = parsed_json.busStopRouteList;

            for(var i in sejong_list){
                console.log("노선 번호 : "+sejong_list[i].route_name);
                console.log("노선 ID : "+ sejong_list[i].route_id);
                console.log("예상 도착 시간 : "+sejong_list[i].provide_type);
                console.log("현재 위치 : "+ sejong_list[i].rstop+"\n");
            }
            callback(sejong_list);

        }else{
            errorHaldling.throw(5002, 'Station URL Request Error');
        }
    });

};


module.exports = sejongObject;


