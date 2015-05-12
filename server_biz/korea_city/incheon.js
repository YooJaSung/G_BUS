/**
 * Created by airnold on 15. 4. 24..
 */

// get method // html
//   http://m.ictr.or.kr/localbus/busRoutePath.do
//   route param -> keyword
//   http://m.ictr.or.kr/localbus/busStopArriveInfo.do
//   station param -> keyword

var request = require('request');
var jsdom = require('jsdom');
var iconv = require('iconv');
var cheerio = require('cheerio');

var incheonObject = {};

var routeurl = "http://m.ictr.or.kr/localbus/busRoutePath.do";

var stationurl = "http://m.ictr.or.kr/localbus/busStopArriveInfo.do";

/**
 *
 * request data format
 */

var requestData = {};
requestData.route = {};
requestData.route.keyword = "" ;

requestData.station = {};
requestData.station.keyword = "";






incheonObject.urlRouteRequest = function(dbObject, callback){

    /**
     * 1. routeUrl 포멧을 db에서 선택한 데이터를 가지고 맞춰준다
     * 2. post or get 방식에 따라 request 까지 해준다.
     */

    requestData.route.keyword = dbObject[0].routeid;

    var url = routeurl + "?keyword=" + requestData.route.keyword;

    request(url , function (error, response, html) {


        if (!error && response.statusCode == 200) {
            var incheon_bus_location_seq = [];
            var $ = cheerio.load(html);
            var $a = $('.subMenu2 > li a');

            $a.each(function (i) {

                if ($(this).find('span img').attr('src') === '/images/bus_icon.png') {
                    console.log(i);
                    incheon_bus_location_seq.push(i);
                }
            });

            callback(incheon_bus_location_seq);

        }else{
            throw error;
        }
    });


};
incheonObject.urlStationRequest = function(dbObject, callback){

    requestData.station.keyword = dbObject[0].stopid;

    var url = stationurl+"?keyword=" + requestData.station.keyword;

    request.get({
        url: stationurl,
        encoding: null
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var ic = new iconv.Iconv('euc-kr', 'utf-8');
            var buf = ic.convert(body);
            var utf8String = buf.toString('utf-8');
            jsdom.env({
                html: utf8String,
                scripts: ['http://code.jquery.com/jquery-1.6.min.js'],
                done: function (err, window) {
                    //Use jQuery just as in a regular HTML page
                    var $ = window.jQuery;
                    var $sub_a = $(".subMenu2 li");

                    var incheon_list = [];

                    $sub_a.each(function () {
                        var temp = {};
                        var str = $(this).text();
                        var res = str.split(" ");

                        temp.route_no = res[0].replace(/\s/gi, '');
                        temp.route_endstation = res[1].replace(/\s/gi, '');
                        temp.arrive_time = res[2].replace(/\s/gi, '') + res[3].replace(/\s/gi, '');
                        temp.cur_pos = res[4].replace(/\s/gi, '') + res[5].replace(/\s/gi, '');

                        incheon_list.push(temp);

                    });

                    callback(incheon_list);
                }
            });
        }else{
            throw error;
        }
    });

};







module.exports = incheonObject;


