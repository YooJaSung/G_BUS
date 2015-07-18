/**
 * Created by airnold on 15. 4. 24..
 */

var request = require('request');
var cheerio = require('cheerio');
var commonBiz = require('../korea_common/common_biz.js');

var daejeonObject = {};

var routeurlup = "http://mbus.dj.go.kr/routeSearch/upRouteRunInfo.do";
var routeurldown = "http://mbus.dj.go.kr/routeSearch/downRouteRunInfo.do";
var stationurl = "http://mbus.dj.go.kr/stationSearch/stationSearchView1.do";

var nimble = require('nimble');

var requestData = {};
requestData.route = {};
requestData.route.routeCd = "posInfo";
requestData.route.routeNo = "";
requestData.route.runWay = "";


requestData.station = {};
requestData.station.stationId = "";


daejeonObject.urlRouteRequest = function (dbObject, callback) {

    var dbTemp = dbObject[0];

    requestData.route.routeCd = dbTemp[0].routeid;
    requestData.route.routeNo = dbTemp[0].routenm;
    requestData.route.runWay = '';
    var up_seq = [];
    var down_seq = [];
    var daejeon_bus_location_seq = [];

    nimble.series([
        function (upCallback) {
            var url = routeurlup + '?routeCd=' + requestData.route.routeCd + '&routeNo=' + requestData.route.routeNo + '&runWay=' + requestData.route.runWay
            request(
                url
                , function (error, response, html) {
                    if (!error && response.statusCode == 200) {

                        var $ = cheerio.load(html);

                        var $tr = $('tbody tr');

                        $tr.each(function (i) {
                            if ($(this).find('img').attr('src') === '/images/icon_bus.gif') {
                                up_seq.push(i * 1 + 1);
                            }
                        });
                        upCallback();

                    } else {
                        throw error;
                    }
                });
        },
        function (downCallback) {
            var url = routeurldown + '?routeCd=' + requestData.route.routeCd + '&routeNo=' + requestData.route.routeNo + '&runWay=' + requestData.route.runWay
            request(
                url
                , function (error, response, html) {
                    if (!error && response.statusCode == 200) {
                        var $ = cheerio.load(html);
                        var $tr = $('tbody tr');

                        $tr.each(function (i) {
                            if ($(this).find('img').attr('src') === '/images/icon_bus.gif') {
                                down_seq.push(i * 1 + 1);
                            }
                        });
                        downCallback();
                    } else {
                        throw error;
                    }
                });
        },
        function (resCallback) {
            daejeon_bus_location_seq.push(up_seq);
            daejeon_bus_location_seq.push(down_seq);
            callback(daejeon_bus_location_seq);
            resCallback();
        }
    ]);
};


daejeonObject.urlStationRequest = function (dbObject, callback) {

    var dbTemp = dbObject[0];
    requestData.station.stationId = dbTemp[0].stopid;
    var url = stationurl + '?stationId=' + requestData.station.stationId;

    request(url, function (error, response, html) {
        if (!error && response.statusCode == 200) {

            var daejeon_list = [];
            var $ = cheerio.load(html);

            var $tr = $('tbody tr');

            $tr.each(function () {
                var temp = {};

                temp.routenm = $(this).find('td:nth-child(1)').text();
                temp.arrive_time = '약 ' + $(this).find('td:nth-child(2)').text();
                temp.cur_pos = $(this).find('td:nth-child(3)').text();
                temp.routeid = commonBiz.findRouteid(dbTemp, temp.routenm);

                daejeon_list.push(temp);
            });

            callback(daejeon_list);
        }
    });
};

module.exports = daejeonObject;


