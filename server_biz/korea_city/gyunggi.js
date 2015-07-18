
/**
 * Created by airnold on 15. 4. 24..
 */

var request = require('request');
var xml2jsparser = require('xml2json');

var gyunggiObject = {};

var routeurl = "http://openapi.gbis.go.kr/ws/rest/buslocationservice?" +
    "serviceKey=3Dk6D80iliB7j4NcdFAiIGHm2O3X7HXg8j27%2BTt7%2FOhxiAecZ%2FffBwSQZCjGcqzTlONzGeUh%2F17714ETt5z39Q%3D%3D";

var stationurl = "http://openapi.gbis.go.kr/ws/rest/busarrivalservice/station?" +
    "serviceKey=3Dk6D80iliB7j4NcdFAiIGHm2O3X7HXg8j27%2BTt7%2FOhxiAecZ%2FffBwSQZCjGcqzTlONzGeUh%2F17714ETt5z39Q%3D%3D";


var requestData = {};
requestData.route = {};
requestData.route.routeId = "";

requestData.station = {};
requestData.station.stationId = "";

gyunggiObject.urlRouteRequest = function (dbObject, callback) {

    var dbTemp = dbObject[0];

    requestData.route.routeId = dbTemp[0].routeid;

    var url = routeurl + "&routeId=" + requestData.route.routeId;

    request(url, function (error, response, body) {
        var bus_loc_temp = [];
        var gyunggi_bus_location_seq = [];
        var up_seq = [];
        var down_seq = [];
        var trnseq = dbTemp[0].trnseq;

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
            if (result.response[0].msgBody === undefined) {

                gyunggi_bus_location_seq.push(up_seq);
                gyunggi_bus_location_seq.push(down_seq);
                callback(gyunggi_bus_location_seq);

            }
            else {
                var tempre = result.response[0].msgBody[0];
                var locarr = tempre.busLocationList;

                for (var i in locarr) {
                    console.log(locarr[i]);
                    var seq = locarr[i].stationSeq[0];
                    if(seq <= trnseq){
                        seq = seq*1+1;
                        up_seq.push(seq);
                    }else{
                        seq = seq*1+1-trnseq;
                        down_seq.push(seq);
                    }

                }

                gyunggi_bus_location_seq.push(up_seq);
                gyunggi_bus_location_seq.push(down_seq);
                callback(gyunggi_bus_location_seq);
            }
        }
    });
};
gyunggiObject.urlStationRequest = function (dbObject, callback) {

    var dbTemp = dbObject[0];


    requestData.station.stationId = dbTemp[0].stopid;


    var url = stationurl + "&stationId=" + requestData.station.stationId;

    request(url, function (error, response, body) {

        var gyunggi_list = [];
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

            if (result.response[0].msgBody === undefined) {

                gyunggi_list = [];
                callback(gyunggi_list);
            }
            else {
                var tempre = result.response[0].msgBody[0];
                var stArr = tempre.busArrivalList;

                for(var i in stArr){
                    var temp = {};
                    var routenm = findRoutenm(stArr[i].routeId[0], dbTemp);
                    temp.routenm = routenm;
                    temp.arrive_time = "약 "+ stArr[i].predictTime1[0] + "분 후 도착";
                    temp.routeid = stArr[i].routeId[0];
                    if(stArr[i].LocationNo1 === undefined){
                        temp.cur_pos = '';
                    }else{
                        temp.cur_pos = stArr[i].LocationNo1[0];
                    }
                    gyunggi_list.push(temp);
                }
                callback(gyunggi_list);
            }
        }
    });
};


function findRoutenm(routeid,dbTemp){

    var reRoutenm = undefined;
    for(var i in dbTemp){
        if(dbTemp[i].routeid === routeid){
            reRoutenm = dbTemp[i].routenm;
        }
    }
    return reRoutenm;
}


module.exports = gyunggiObject;


