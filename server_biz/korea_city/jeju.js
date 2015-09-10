/**
 * Created by airnold on 15. 4. 27..
 */

var request = require('request');
var commonBiz = require('../korea_common/common_biz.js');
var iconv = require('iconv');
var cheerio = require('cheerio');

var jejuObject = {};

var routeurl = "http://bus.jeju.go.kr/data/line/realTimeBusPosition";

var stationurl = "http://bus.jeju.go.kr/web/search/stationDetailInfo";



/**
 *
 * request data format
 */

var requestData = {};
requestData.route = {};
requestData.route.routeId = {};



requestData.station = {};
requestData.station.stationId = '';


jejuObject.urlRouteRequest = function (dbObject, callback) {

    var dbTemp = dbObject[0];


    requestData.route.routeId = dbTemp[0].routeid;

    request.post({
        url: routeurl,

        form: {
            routeId: requestData.route.routeId
        }
    }, function (error, response, json) {
        var jeju_bus_location_seq = [];
        var up_seq = [];
        if (!error && response.statusCode == 200) {

            var parsed = JSON.parse(json);


            var arr = [];
            for (var x in parsed) {
                arr.push(parsed[x]);
            }

            var jsondata = arr;

            for (var i in jsondata) {

                up_seq.push(findRouteSeq(jsondata[i].currStationId, dbTemp));

            }

            jeju_bus_location_seq.push(up_seq);
            callback(jeju_bus_location_seq);


        }
    });

};


jejuObject.urlStationRequest = function (dbObject, callback) {

    var dbTemp = dbObject[0];

    requestData.station.stationId = dbTemp[0].stopid;

    request.post({
        url: stationurl,
        form: {
            stationId: requestData.station.stationId
        },
        encoding : null
    }, function (error, response, html) {
        var jeju_list = [];
        if (!error && response.statusCode == 200) {

            var ic = new iconv.Iconv('euc-kr', 'utf-8');
            var buf = ic.convert(html);
            var utf8String = buf.toString('utf-8');
            var $ = cheerio.load(utf8String);

            var $tr = $('.layer_station_detail_info_arrive_bus_info_list tr');

            var $routeid = $("input[name='arriveBusRouteId']");

            var rtemp = [];
            $routeid.each(function(){
                rtemp.push($(this).val());
            });

            $tr.each(function(i){
                var temp = {};
                temp.routeid = rtemp[i];
                temp.routenm = $(this).find('td:nth-child(1)').text();
                if(temp.routenm === "도착예정정보가 없습니다."){

                }else{
                    temp.arrive_time = '약' +  $(this).find('td:nth-child(2)').text() + ' 후 도착';
                    temp.cur_pos = $(this).find('td:nth-child(3)').text();

                    jeju_list.push(temp);
                }

            });

            callback(jeju_list);

        }else{
            throw error;
        }
    });
};


function findRouteSeq(stopid, dbTemp) {
    var seq = undefined;

    for (var i in dbTemp) {

        if (dbTemp[i].stopid == stopid) {
            seq = dbTemp[i].seq;
            break;
        }
    }
    return seq;
}


module.exports = jejuObject;


