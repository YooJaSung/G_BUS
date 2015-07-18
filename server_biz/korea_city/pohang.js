/**
 * Created by airnold on 15. 4. 27..
 */


var request = require('request');
var cheerio = require('cheerio');

var commonBiz = require('../korea_common/common_biz.js');


var pohangObject = {};

var routeurl = "http://bis2.ipohang.org/bis2/busWayPop.do";

var stationurl = "http://bis2.ipohang.org/bis2/bstopDetailSearchAjax.do";

var requestData = {};
requestData.route = {};
requestData.route.routeId = '';

requestData.station = {};
requestData.station.bStopid = '';

pohangObject.urlRouteRequest = function (dbObject, callback) {

    var dbTemp = dbObject[0];

    requestData.route.routeId  = dbTemp[0].routeid;
    var url = routeurl+'?routeId=' + requestData.route.routeId;

    request(url, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);
            var up_seq = [];
            var down_seq = [];
            var pohang_bus_location_seq = [];
            var trnseq = dbTemp[0].trnseq;

            var $temp = $('#busWayHeight div');
            $temp.each(function(){

                if($(this).find('img').attr('src') === '../images/busLineInfo/icon_busCar.png'){

                    up_seq.push(findRouteSeq($(this).prev().text(), dbTemp));

                }
            });


            var $temp = $('#busWayLow div');
            $temp.each(function(){
                if($(this).find('img').attr('src') === '../images/busLineInfo/icon_busCar.png'){

                    down_seq.push(findRouteSeqFrom($(this).prev().text(), dbTemp, trnseq)*1-trnseq);

                }
            });
            pohang_bus_location_seq.push(up_seq);
            pohang_bus_location_seq.push(down_seq);
            callback(pohang_bus_location_seq);

        }
    });

};
pohangObject.urlStationRequest = function (dbObject, callback) {

    var dbTemp = dbObject[0];

    requestData.station.bStopid = dbTemp[0].stopid;

    request.post({
        url: stationurl,

        form: {
            bStopid: requestData.station.bStopid
        }
    }, function (error, response, json) {
        if (!error && response.statusCode == 200) {

            var psd = JSON.parse(json);
            var pohang_temp = psd.arrivalInfo;
            var pohang_list = [];

            for (var i in pohang_temp) {
                if (pohang_temp[i].CURR_BSTOP !== null) {

                    var temp = {};
                    temp.routenm = pohang_temp[i].ROUTE_NAME;
                    temp.arrive_time = '약 ' + pohang_temp[i].REST_TIME + '분 후 도착';
                    temp.cur_pos = pohang_temp[i].REST_BSTOP + '전';
                    temp.routeid = pohang_temp[i].ROUTE_ID;

                    pohang_list.push(temp);

                }
            }

            callback(pohang_list);


        }else{
            throw error;
        }
    });

};


function findRouteSeq(stopnm, dbTemp) {
    var seq = undefined;

    for (var i in dbTemp) {
        if (dbTemp[i].stopnm === stopnm) {
            seq = dbTemp[i].seq;
            break;
        }
    }
    return seq;
}

function findRouteSeqFrom(stopnm, dbTemp, trnseq) {
    var seq = undefined;

    for(var i = trnseq ; i < dbTemp.length ; i++){
        if (dbTemp[i].stopnm === stopnm) {
            seq = dbTemp[i].seq;
            break;
        }

    }
    return seq;
}

module.exports = pohangObject;


