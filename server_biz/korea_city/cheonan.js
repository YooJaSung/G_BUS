/**
 * Created by airnold on 15. 4. 24..
 */

var request = require('request');
var xml2jsparser = require('xml2json');

var chunanObject = {};

var routeurl = "http://its.cheonan.go.kr/include/bis/RouteStation.jsp";

var stationurl = "http://its.cheonan.go.kr/include/bis/PredictInfo.jsp";

var requestData = {};
requestData.route = {};
requestData.route.route_no = "" ;
requestData.route.route_class = "" ;

requestData.station = {};
requestData.station.stop_no = "";

chunanObject.urlRouteRequest = function(dbObject, callback){


    var dbTemp = dbObject[0];

    requestData.route.route_class = dbTemp[0].routedesc;
    requestData.route.route_no = dbTemp[0].routenm;

    request.post({
        url: routeurl,
        form: {
            route_no: requestData.route.route_no,
            route_class: requestData.route.route_class
        }
    }, function (err, httpResponse, body) {
        if (err) {
            throw err;
        } else {
            var chunan_bus_location_seq = [];
            var up_seq = [];
            var xmldata = body;
            var options = {
                object: true,
                sanitize: false,
                arrayNotation: true
            };
            var bus_location_data = xml2jsparser.toJson(xmldata, options);

            var bus_location_data_item = bus_location_data.found_item[0].item;

            if(bus_location_data === undefined){

                callback(chunan_bus_location_seq.push(up_seq));
            }else{
                for (var i in bus_location_data_item) {
                    if (bus_location_data_item[i].bus_name[0] !== 'null') {
                        up_seq.push(bus_location_data_item[i].stop_seq[0]);
                    }
                }

                chunan_bus_location_seq.push(up_seq);
                callback(chunan_bus_location_seq);
            }
        }
    });


};
chunanObject.urlStationRequest = function(dbObject, callback){


    var dbTemp = dbObject[0];
    requestData.station.stop_no = dbTemp[0].stopid;

    request.post({
        url: stationurl,
        form: {
            stop_no: requestData.station.stop_no
        }
    }, function (err, httpResponse, body) {
        if (err) {
            throw err;
        } else {
            var xmldata = body;
            var options = {
                object: true,
                sanitize: false,
                arrayNotation: true
            };
            var chunan_list = xml2jsparser.toJson(xmldata, options);

            var chunan_arrive_list = [];

            for (var x in chunan_list.found_item[0].item) {

                var temp = {};
                if (chunan_list.found_item[0].item[x].remain_time != 'null') {
                    temp.arrive_time = "약 " + chunan_list.found_item[0].item[x].remain_time[0] + "분 후 도착";
                    temp.routenm = chunan_list.found_item[0].item[x].route_name[0];
                    temp.cur_pos = chunan_list.found_item[0].item[x].remain_stop_count[0] + ' 구간 전';
                    temp.routeid = chunan_list.found_item[0].item[x].route_no[0];
                    chunan_arrive_list.push(temp);
                }
            }
            if(chunan_arrive_list.length === 0){
                var temp = {};
                temp.arrive_time = "";
                temp.routenm = "";
                temp.cur_pos = "";
                temp.routeid = "";

                chunan_arrive_list.push(temp);
                callback(chunan_arrive_list);
            }else{
                callback(chunan_arrive_list);
            }
        }
    });




};


module.exports = chunanObject;


