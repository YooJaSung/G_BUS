/**
 * Created by airnold on 15. 4. 24..
 */

// post method // json
//   http://its.wonju.go.kr/map/RoutePosition.do
//   route param -> route_id
    // html data
//   http://its.wonju.go.kr/map/AjaxRouteListByStop.do
//   station param -> stop_id

var request = require('request');
var errorHaldling = require('../../utility/errorHandling.js');

var wonjuObject = {};

var routeurl = "http://its.wonju.go.kr/map/RoutePosition.do";

var stationurl = "http://its.wonju.go.kr/map/AjaxRouteListByStop.do";


/**
 *
 * request data format
 */

var requestData = {};
requestData.route = {};
requestData.route.route_id = "" ;

requestData.station = {};
requestData.station.stop_id = "";




wonjuObject.urlRouteRequest = function(dbObject, callback){

    /**
     * 1. routeUrl 포멧을 db에서 선택한 데이터를 가지고 맞춰준다
     * 2. post or get 방식에 따라 request 까지 해준다.
     */

    requestData.route.route_id = dbObject[0].routeid ;


    request.post({
        url: routeurl,
        form: {
            route_id: requestData.route.route_id
        }
    }, function (error, response, json) {
        if (!error && response.statusCode == 200) {

            var wonju_bus_location_seq = [];


            var parsed = JSON.parse(json);
            var arr = [];
            for(var x in parsed){
                arr.push(parsed[x]);
            }
            var jsondata = arr;
            for(var i in jsondata){
                wonju_bus_location_seq.push(i);
            }
            wonju_bus_location_seq.sort();
            callback(wonju_bus_location_seq);

        }else{
            errorHaldling.throw(5001, 'Route URL Request Error');
        }

    });

};
wonjuObject.urlStationRequest = function(dbObject, callback){

    requestData.station.stop_id = dbObject[0].stopid;

    request.post({
        url: stationurl,
        form: {
            stop_id: requestData.station.stop_id
        }
    }, function (error, httpResponse, html ) {
        if (!error && httpResponse.statusCode == 200) {
            var $ = cheerio.load(html);
            var $tr = $("tr");
            var wonju_list = [];

            var temp;

            $tr.each(function () {
                var route_json = {};

                temp = $(this).find('span').text() + $(this).find('sub').text();
                route_json.route_name = temp.replace(/\s/gi, '');

                temp = $(this).find('td:nth-child(2)').text();
                route_json.curr_pos = temp.replace(/\s/gi, '');

                temp = $(this).find('td:nth-child(3)').text();
                route_json.arrive_time = temp.replace(/\s/gi, '');

                route_list.push(route_json);

            });

            callback(wonju_list);
        }else{
            errorHaldling.throw(5002, 'Station URL Request Error');
        }
    });

};

module.exports = wonjuObject;


