/**
 * Created by airnold on 15. 4. 27..
 */

// get html
// route -> http://mbus.changwon.go.kr/mobile/busLocation.jsp
// param -> routeId
// station -> http://mbus.changwon.go.kr/mobile/busArrStation.jsp
// param -> stationId

var request = require('request');
var jsdom = require('jsdom');

var errorHaldling = require('../../utility/errorHandling.js');
var changwonObject = {};

var routeurl = "http://mbus.changwon.go.kr/mobile/busLocation.jsp";

var stationurl = "http://mbus.changwon.go.kr/mobile/busArrStation.jsp";

/**
 *
 * request data format
 */

var requestData = {};
requestData.route = {};
requestData.route.routeId = "" ;



requestData.station = {};
requestData.station.stationId = "";

changwonObject.urlRouteRequest = function(dbObject, callback){

    /**
     * 1. routeUrl 포멧을 db에서 선택한 데이터를 가지고 맞춰준다
     * 2. post or get 방식에 따라 request 까지 해준다.
     */

    requestData.route.routeId = dbObject[0].routeid;

    var url = routeurl + "?routeId=" + requestData.route.routeId;

    request(url, function (error, response, body) {

        if (!error && response.statusCode == 200) {
            var changwon_bus_location_seq = [];
            jsdom.env({
                html: body,
                scripts: ['http://code.jquery.com/jquery-1.6.min.js'],
                done: function (err, window) {
                    var $ = window.jQuery;
                    var document = window.document;
                    var $sub_a = $('.sub-content table tbody tr td a ');
                    $sub_a.each(function (i) {
                        /*
                         0에서 시작이기에 해당 시퀀스가 버스가 있는 위치
                         */
                        if ($(this).find('img').attr('src') === '../images/mobile/ico_bus_7.gif') {
                            console.log($(this).find('img').attr('src'));
                            console.log(i);
                            changwon_bus_location_seq.push(i);
                        }

                    });

                    callback(changwon_bus_location_seq);

                }
            });
        }else{
            errorHaldling.throw(5001, 'Route URL Request Error');
        }
    });



};
changwonObject.urlStationRequest = function(dbObject, callback){

    requestData.station.stationId = dbObject[0].stopid;
    var url = stationurl + "stationId=" + requestData.station.stationId;

    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            jsdom.env({
                html: body,
                scripts: ['http://code.jquery.com/jquery-1.6.min.js'],
                done: function (err, window) {
                    //Use jQuery just as in a regular HTML page
                    var $ = window.jQuery;
                    var document = window.document;
                    var $sub_a = $("table[class=box4]");

                    var changwon_list = [];
                    $sub_a.each(function () {
                        var temp = {};
                        temp.route_no = $(this).find("span[class=bustype4]").text();
                        var str = $(this).find("span[class=bustype7]").text();
                        var res = str.split("도착");
                        temp.arrive_time = res[0];
                        temp.cur_pos = res[1];
                        changwon_list.push(temp);
                    });

                    callback(changwon_list);
                }
            });
        }else{
            errorHaldling.throw(5002, 'Station URL Request Error');
        }
    });

};







module.exports = changwonObject;


