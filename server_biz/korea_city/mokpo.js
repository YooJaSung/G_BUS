/**
 * Created by airnold on 15. 4. 24..
 */

// get method // html
//   http://bis.mokpo.go.kr/main/bus/bus_locationpop_line_frame.jsp
    //   route param -> inp_brt_stdid, btype = 없음
// html data
//   http://bis.mokpo.go.kr/main/bus/bus_locationpop_pop.jsp
//   station param -> stop_stdid

var request = require('request');
var cheerio = require('cheerio');
var errorHaldling = require('../../utility/errorHandling.js');

var mokpoObject = {};

var routeurl = "http://bis.mokpo.go.kr/main/bus/bus_locationpop_line_frame.jsp";

var stationurl = "http://bis.mokpo.go.kr/main/bus/bus_locationpop_pop.jsp";


/**
 *
 * request data format
 */

var requestData = {};
requestData.route = {};
requestData.route.inp_brt_stdid = "" ;
requestData.route.btype = "";

requestData.station = {};
requestData.station.stop_stdid = "";



mokpoObject.urlRouteRequest = function(dbObject, callback){

    /**
     * 1. routeUrl 포멧을 db에서 선택한 데이터를 가지고 맞춰준다
     * 2. post or get 방식에 따라 request 까지 해준다.
     */

    requestData.route.inp_brt_stdid = dbObject[0].routeid;

    var url = routeurl+"?inp_brt_stdid="+requestData.route.inp_brt_stdid+
            "&btype=";

    request(url, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            var mokpo_bus_location_seq = [];
            var $ = cheerio.load(html);

            var $div = $('#busstop_wrap, #busstop_wrap2');
            $div.each(function(i){
                if($(this).find('li').attr('class') === 'businfo' || $(this).find('li').attr('class') === 'businfo2'){
                    mokpo_bus_location_seq.push(i);

                }
            });

            callback(mokpo_bus_location_seq);

        }else{
            errorHaldling.throw(5001, 'Route URL Request Error');
        }
    })

};
mokpoObject.urlStationRequest = function(dbObject, callback) {

    requestData.station.stop_stdid = dbObject[0].stopid;

    var url = stationurl + "?stop_stdid=" + requestData.station.stop_stdid;

    request.get({
            uri: url,
            encoding: null
        },
        function (error, response, html) {
            if (!error && response.statusCode == 200) {
                var ic = new iconv.Iconv('euc-kr', 'utf-8');
                var buf = ic.convert(html);
                var utf8String = buf.toString('utf-8');

                var $ = cheerio.load(utf8String);
                var $table = $('.table_list');
                var $tr = $table.find('tr');
                var mokpo_list = [];

                $tr.each(function (i) {
                    if (i !== 0) {

                        var temp = {};
                        temp.route_name = $(this).find('td:nth-child(1)').text();
                        temp.curr_pos = $(this).find('td:nth-child(2)').text();
                        temp.arrive_time = $(this).children().last().text();

                        mokpo_list.push(temp);
                    }
                });

                callback(mokpo_list);

            } else {
                errorHaldling.throw(5002, 'Station URL Request Error');
            }
        });
};


module.exports = mokpoObject;


