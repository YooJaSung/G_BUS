/**
 * Created by airnold on 15. 4. 27..
 */

// get html
// route -> http://mits.busan.go.kr/bus_real.jsp
// param -> line_id
// station -> http://bus.busan.go.kr/busanBIMS/Ajax/map_Arrival.asp
// param -> optARSNO

var request = require('request');
var jsdom = require('jsdom');
var errorHaldling = require('../../utility/errorHandling.js');

var busanObject = {};

var routeurl = "http://mits.busan.go.kr/bus_real.jsp";
var stationurl = "http://bus.busan.go.kr/busanBIMS/Ajax/map_Arrival.asp";

/**
 *
 * request data format
 */

var requestData = {};
requestData.route = {};
requestData.route.line_id = "";


requestData.station = {};
requestData.station.optARSNO = "";


busanObject.urlRouteRequest = function (dbObject, callback) {

    requestData.route.line_id = dbObject[0].routeid;

    var url = routeurl + "?line_id=" + requestData.route.line_id;

    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var busan_bus_location_seq = [];
            jsdom.env({
                html: body,
                scripts: ['http://code.jquery.com/jquery-1.6.min.js'],
                done: function (err, window) {
                    //Use jQuery just as in a regular HTML page
                    var $ = window.jQuery;
                    var document = window.document;
                    var $body = $('body');
                    var $wrapper = $body.find('#wrapper');
                    var $img = $wrapper.find('img');

                    if ($img.length === 0) {
                        // 잘못된 버스
                        callback(busan_bus_location_seq);
                    }

                    else {

                        $img.each(function (i) {
                            if ($img[i].src === 'file://images/bus_real_green_GL_4045.png') {
                                /*
                                 sequence start at 1, real time bus location sequence save array and send to front
                                 */
                                console.log($img[i].src);

                                busan_bus_location_seq.push(i * 1 + 1);
                            }
                        });
                        console.log(busan_bus_location_seq);
                        callback(busan_bus_location_seq);
                    }


                }
            });
        } else {
            throw error;
        }
    });

    /**
     * 1. routeUrl 포멧을 db에서 선택한 데이터를 가지고 맞춰준다
     * 2. post or get 방식에 따라 request 까지 해준다.
     */

};
busanObject.urlStationRequest = function (dbObject, callback) {
    requestData.station.optARSNO = dbObject[0].stopid;

    var url = stationurl + "?optARSNO=" + requestData.station.optARSNO;

    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var xmldata = body;
            var options = {
                object: true,
                sanitize: false,
                arrayNotation: true
            };
            var parsed_data = xml2jsparser.toJson(xmldata, options);
            var busan_arrie_list = [];

            var busan_list = parsed_data.Buss;

            for (var x in arriveTime_list[0].bus) {
                var temp = {};
                temp.arrive_time = busan_list[0].bus[x].value5;
                temp.routenm = busan_list[0].bus[x].value0; //한글깨짐 고쳐야 함
                temp.routeid = busan_list[0].bus[x].value6;
                temp.cur_pos = busan_list[0].bus[x].value4;
                busan_arrie_list.push(temp);
            }

            callback(busan_arrie_list);

        } else {
            throw error;
        }
    });
};


module.exports = busanObject;


