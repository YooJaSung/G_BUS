/**
 * Created by airnold on 15. 4. 24..
 */

// post method // json
//   http://bis.jinju.go.kr/MainBusRouteListAjax.do
//   route param -> brt_id

//   http://bis.jinju.go.kr/MainBusArrivalListAjax.do
//   station param -> stop_id

var request = require('request');

var jinjuObject = {};

var routeurl = "http://bis.jinju.go.kr/MainBusRouteListAjax.do";

var stationurl = "http://bis.jinju.go.kr/MainBusArrivalListAjax.do";


/**
 *
 * request data format
 */

var requestData = {};
requestData.route = {};
requestData.route.brt_id = "" ;

requestData.station = {};
requestData.station.stop_id = "";


jinjuObject.urlRouteRequest = function(dbObject , callback){

    /**
     * 1. routeUrl 포멧을 db에서 선택한 데이터를 가지고 맞춰준다
     * 2. post or get 방식에 따라 request 까지 해준다.
     */

    requestData.route.brt_id = dbObject[0].routeid;

    request.post({
        url: routeurl,
        form: {
            brt_id: requestData.route.brt_id
        }
    }, function (error, response, json) {
        var jinju_bus_location_seq = [];
        if (!error && response.statusCode == 200) {

            var parsed = JSON.parse(json);
            var arr = [];
            for(var x in parsed){
                arr.push(parsed[x]);
            }

            var jsondata = arr[2];

            for(var i in jsondata){
                console.log(jsondata[i].BRN_FROMSEQNO);
                jinju_bus_location_seq.push(jsondata[i].BRN_FROMSEQNO);
                //-1 or 그대로 해야함
            }

            callback(jinju_bus_location_seq);

        }
    });


};
jinjuObject.urlStationRequest = function(dbObject, callback){

    requestData.station.stop_id = dbObject[0].stopid;

    request.post({
        url: stationurl,
        form: {
            stop_id: requestData.station.stop_id
        }
    }, function (error, response, json) {
        if (!error && response.statusCode == 200) {
            var psd = JSON.parse(json);

            //jinju_bus_list --> 해당 정류소에 정차하는 모든 노선
            //jinju_bus_curr --> 현재 도착 예정 노선
            var jinju_bus_list = psd.AllBusArrivalInfoResult.AllBusArrivalInfo.MsgBody.BUSINFO.BusListInfo.list;
            var jinju_bus_curr = psd.AllBusArrivalInfoResult.AllBusArrivalInfo.MsgBody.BUSINFO.CurrentAllBusArrivalInfo.list;

            for(var i in jinju_bus_curr) {
                console.log("노선 번호 : "+jinju_bus_curr[i].lineNo);
                console.log("노선 ID : "+jinju_bus_curr[i].routeId);
                console.log("노선 위치 : "+ jinju_bus_curr[i].remainStopCnt + "전");
                console.log("도착 예정 시간 : "+ jinju_bus_curr[i].remainTime+"초\n");
            }

            callback(jinju_bus_curr);

        }else{
            throw error;
        }
    });

};








module.exports = jinjuObject;


