/**
 * route & arrive 모두 여기서 포멧팅
 * 1. url 설정(url config)
 * 2. 요청 변수 설정
 * 3. module.exports 로 외부에서 사용가능하도록 만들어줄 예정
 */


/**
 * Created by airnold on 15. 4. 24..
 */


var request = require('request');
var xml2jsparser = require('xml2json');
var errorHaldling = require('../../utility/errorHandling.js');

var gyunggiObject = {};

var routeurl = "http://openapi.gbis.go.kr/ws/rest/buslocationservice?" +
    "serviceKey=3Dk6D80iliB7j4NcdFAiIGHm2O3X7HXg8j27%2BTt7%2FOhxiAecZ%2FffBwSQZCjGcqzTlONzGeUh%2F17714ETt5z39Q%3D%3D";

var stationurl = "http://openapi.gbis.go.kr/ws/rest/busarrivalservice/station?" +
    "serviceKey=3Dk6D80iliB7j4NcdFAiIGHm2O3X7HXg8j27%2BTt7%2FOhxiAecZ%2FffBwSQZCjGcqzTlONzGeUh%2F17714ETt5z39Q%3D%3D";

var pool = require('../../server_config/mysql/DBConnect.js');
var mysqlConfig = require('../../server_config/mysql/mysql_config.js');

/**
 *
 * request data format
 */

var requestData = {};
requestData.route = {};
requestData.route.routeId = "";


requestData.station = {};
requestData.station.stationId = "";

gyunggiObject.urlRouteRequest = function (dbObject, callback) {

    /**
     * 1. routeUrl 포멧을 db에서 선택한 데이터를 가지고 맞춰준다
     * 2. post or get 방식에 따라 request 까지 해준다.
     */

    requestData.route.routeId = dbObject[0].routeid;

    var url = routeurl + "&routeId=" + requestData.route.routeId;

    request(url, function (error, response, body) {

        var gyunggi_bus_location_seq = [];

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

                callback(gyunggi_bus_location_seq);
            }
            else {
                var tempre = result.response[0].msgBody[0];
                var locarr = tempre.busLocationList;

                for (var i in locarr) {
                    var seq = locarr[i].stationSeq[0];
                    seq = seq*1+1;
                    gyunggi_bus_location_seq.push(seq);
                }
                callback(gyunggi_bus_location_seq);

            }
        }
    });
};
gyunggiObject.urlStationRequest = function (dbObject, callback) {

    requestData.station.stationId = dbObject[0].stopid;


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
                    var routenm = findRoutenm(stArr[i].routeId[0], dbObject);
                    temp.routenm = routenm;
                    temp.arrive_time = stArr[i].predictTime1[0];
                    temp.routeid = stArr[i].routeId[0];

                    gyunggi_list.push(temp);
                }
                callback(gyunggi_list);

            }

        }
    });

};

function findRoutenm(routeid,dbObject){

    var reRoutenm = undefined;
    for(var i in dbObject){
        if(dbObject[i].routeid === routeid){

            reRoutenm = dbObject[i].routenm;

        }
    }

    return reRoutenm;
}


module.exports = gyunggiObject;


