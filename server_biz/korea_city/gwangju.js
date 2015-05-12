/**
 * Created by airnold on 15. 4. 24..
 */

// get method // json
//   http://bus.gjcity.net/busmap/busLocationList
//   route param -> LINE_ID
// html data
//   http://m.bus.gjcity.net/mobile/busArriveInfoList
//   station param -> BUSSTOP_ID

var request = require('request');

var gwangjuObject = {};

var routeurl = "http://bus.gjcity.net/busmap/busLocationList";

var stationurl = "http://m.bus.gjcity.net/mobile/busArriveInfoList";

/**
 *
 * request data format
 */

var requestData = {};
requestData.route = {};
requestData.route.LINE_ID = "" ;

requestData.station = {};
requestData.station.BUSSTOP_ID = "";


gwangjuObject.urlRouteRequest = function(dbObject, callback){

    /**
     * 1. routeUrl 포멧을 db에서 선택한 데이터를 가지고 맞춰준다
     * 2. post or get 방식에 따라 request 까지 해준다.
     */
    requestData.route.LINE_ID = dbObject[0].routeid;

    var url = routeurl + "?LINE_ID=" +  requestData.route.LINE_ID;

    request(url, function (error, response, json) {
        if (!error && response.statusCode == 200) {
            var gwangju_bus_location_seq = [];
            var parsed = JSON.parse(json);
            var arr = [];
            for(var x in parsed){
                arr.push(parsed[x]);
            }
            var jsondata = arr[0];
            for(var i in jsondata){
                if(jsondata[i].CARNO !== null){
                    gwangju_bus_location_seq.push(i);
                    console.log(i);
                }
            }

            callback(gwangju_bus_location_seq);

        }else{
            throw error;
        }
    });

};
gwangjuObject.urlStationRequest = function(dbObject, callback){

    requestData.station.BUSSTOP_ID = dbObject[0].stopid;

    request.post({
        url: stationurl,
        form: {
            BUSSTOP_ID: requestData.station.BUSSTOP_ID
        }
    }, function (error, response, json) {
        if (!error && response.statusCode == 200) {

            var psd = JSON.parse(json);
            var gwangju_list = psd.list;

            for(var i in gwangju_list) {
                console.log("노선 번호 : "+gwangju_list[i].LINE_NAME);
                console.log("남은 정류장 갯수 : "+gwangju_list[i].REMAIN_STOP);
                console.log("예상 도착 시간 : "+gwangju_list[i].REMAIN_MIN + "분");
                console.log("현재 위치 : "+gwangju_list[i].BUSSTOP_NAME);
                console.log("노선 ID : "+gwangju_list[i].LINE_ID + "\n");
            }

            callback(gwangju_list);

        }else{
            throw error;
        }
    });

};







module.exports = gwangjuObject;


