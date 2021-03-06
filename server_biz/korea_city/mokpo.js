/**
 * Created by airnold on 15. 4. 24..
 */


var request = require('request');
var cheerio = require('cheerio');
var iconv = require('iconv');

var commonBiz = require('../korea_common/common_biz.js');

var mokpoObject = {};

var routeurl = "http://bis.mokpo.go.kr/main/bus/bus_locationpop_line_frame.jsp";

var stationurl = "http://bis.mokpo.go.kr/main/bus/bus_locationpop_pop.jsp";

/**
 *
 * request data format
 */

var requestData = {};
requestData.route = {};
requestData.route.inp_brt_stdid = "";
requestData.route.btype = "";

requestData.station = {};
requestData.station.stop_stdid = "";

mokpoObject.urlRouteRequest = function (dbObject, callback) {


    var dbTemp = dbObject[0];

    requestData.route.inp_brt_stdid = dbTemp[0].routeid;

    var url = routeurl + "?inp_brt_stdid=" + requestData.route.inp_brt_stdid +
        "&btype=";

    request(url, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            var mokpo_bus_location_seq = [];
            var up_seq = [];
            var $ = cheerio.load(html);

            var $div = $('#busstop_wrap, #busstop_wrap2');
            if ($div.length === 0) {
                // 잘못된 버스번호
                mokpo_bus_location_seq.push(up_seq);
                callback(mokpo_bus_location_seq);
            } else {
                $div.each(function (i) {
                    if ($(this).find('li').attr('class') === 'businfo' || $(this).find('li').attr('class') === 'businfo2') {
                        up_seq.push(i * 1 + 1);
                    }
                });
                mokpo_bus_location_seq.push(up_seq);
                callback(mokpo_bus_location_seq);
            }

        } else {
            throw error;
        }
    })

};
mokpoObject.urlStationRequest = function (dbObject, callback) {

    var dbTemp = dbObject[0];


    requestData.station.stop_stdid = dbTemp[0].arsid;

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
                var mokpo_arrive_list = [];

                $tr.each(function (i) {
                    if (i !== 0) {

                        var temp = {};

                        if ($(this).children().last().text() === '결과가 없습니다.') {

                        } else {

                            temp.routenm = $(this).find('td:nth-child(1)').text().split(' - ')[0];
                            temp.cur_pos = $(this).find('td:nth-child(2)').text();
                            temp.arrive_time = "약 " + $(this).children().last().text() + "후 도착";
                            temp.routeid = commonBiz.findRouteid(dbTemp, temp.routenm);

                            mokpo_arrive_list.push(temp);
                        }
                    }
                });

                callback(mokpo_arrive_list);

            } else {
                throw error;
            }
        });
};

module.exports = mokpoObject;
