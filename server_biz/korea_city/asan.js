/**
 * Created by airnold on 15. 4. 24..
 */

var request = require('request');


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


asanObject.urlRouteRequest = function (dbObject, callback) {


    var dbTemp = dbObject[0];
    requestData.route.busRouteId = dbTemp[0].routeid;

    request.post({
        url: 'http://bus.asan.go.kr/mobile/traffic/searchBusRealLocationDetail',
        form: {
            busRouteId: requestData.route.busRouteId
        }
    }, function (error, httpResponse, json) {

        var asan_bus_location_seq = [];
        var asan_bus_location_temp = [];
        var up_seq = [];
        var down_seq = [];
        var trnseq = dbTemp[0].trnseq;

        if (error) {
            throw error;
        } else {
            var parsed = JSON.parse(json);

            var arr = [];
            for (var x in parsed) {
                arr.push(parsed[x]);
            }
            if (arr.length === 0) {
                asan_bus_location_seq.push(up_seq);
                callback(asan_bus_location_seq);
            }
            var jsondata = arr[0];

            for (var i in jsondata) {
                /**
                 * +1 된 값
                 */
                asan_bus_location_temp.push(findRouteSeq(jsondata[i].stop_id, dbTemp));
            }

            if(trnseq === null || trnseq === dbTemp.length){
                up_seq = asan_bus_location_temp;
                asan_bus_location_seq.push(up_seq);
                callback(asan_bus_location_seq);

            }else{
                for(var i in asan_bus_location_temp){
                    if(asan_bus_location_temp[i] <= trnseq){
                        up_seq.push(asan_bus_location_temp[i]*1);
                    }else{
                        down_seq.push((asan_bus_location_temp[i]*1) - trnseq);
                    }
                }

                asan_bus_location_seq.push(up_seq);
                asan_bus_location_seq.push(down_seq);
                callback(asan_bus_location_seq);
            }
        }
    });
};
asanObject.urlStationRequest = function (dbObject, callback) {


    var dbTemp = dbObject[0];

    requestData.station.busStopId = dbTemp[0].stopid;

    request.post({
        url: 'http://bus.asan.go.kr/mobile/traffic/searchBusStopRoute',
        form: {
            busStopId: requestData.station.busStopId
        }
    }, function (error, response, json) {
        if (!error && response.statusCode == 200) {

            var psd = JSON.parse(json);
            var asan_list = psd.busStopRouteList;
            var asan_arrive_list = [];


            for (var i in asan_list) {
                var temp = {};
                temp.arrive_time = asan_list[i].provide_type;
                temp.routenm = asan_list[i].route_name;
                temp.cur_pos = asan_list[i].rstop;
                temp.routeid = asan_list[i].route_id;

                asan_arrive_list.push(temp);
            }

            callback(asan_arrive_list);

        } else {
            throw error;
        }
    });

};

function findRouteSeq(stopid, dbTemp) {
    var seq = undefined;

    for (var i in dbTemp) {

        if (dbTemp[i].stopid === stopid) {
            seq = dbTemp[i].seq;
            break;
        }
    }
    return seq;
}

module.exports = asanObject;


