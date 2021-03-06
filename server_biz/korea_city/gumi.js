/**
 * Created by airnold on 15. 4. 24..
 */


var request = require('request');
var cheerio = require('cheerio');
var commonBiz = require('../korea_common/common_biz.js');

var gumiObject = {};

var routeurl = "http://m.bis.gumi.go.kr/GMBIS/m/page/getBrtBusPosList.do";

var stationurl = "http://m.bis.gumi.go.kr/GMBIS/m/page/srchBusArr.do";

var requestData = {};
requestData.route = {};
requestData.route.act = "srchBrtBusPos" ;
requestData.route.brtId = "" ;
requestData.route.brtDirection = "" ;
requestData.route.brtClass = "" ;
requestData.route.menuCode = "1_12" ;

requestData.station = {};
requestData.station.act = "srchBusArr";
requestData.station.stopId = "";
requestData.station.stopKname = "";
requestData.station.menuCode = "1_03";
requestData.station.stopServiceid = "";


gumiObject.urlRouteRequest = function(dbObject, callback){

    /**
     * 1. routeUrl 포멧을 db에서 선택한 데이터를 가지고 맞춰준다
     * 2. post or get 방식에 따라 request 까지 해준다.
     */

    var dbTemp = dbObject[0];
    requestData.route.brtId = dbTemp[0].routeid;
    var dirclass = dbTemp[0].routedesc.split(':');
    requestData.route.brtDirection = dirclass[0];
    requestData.route.brtClass = dirclass[1];

    var url = routeurl+"?act=" + requestData.route.act +
            "&brtId=" + requestData.route.brtId +
            "&brtDirection=" + requestData.route.brtDirection +
            "&brtClass=" + requestData.route.brtClass +
            "&menuCode=" + requestData.route.menuCode;

    request(url, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            var gumi_bus_location_seq = [];
            var $ = cheerio.load(html);
            var $li = $('#list01_12 li');
            var up_seq = [];

            if( $li.length === 0){
                gumi_bus_location_seq.push(up_seq);
                callback(gumi_bus_location_seq);
            }else{
                var j = 0;
                $li.each(function(i){

                    if($(this).attr('class') === 'list_desc'){
                        up_seq.push(i-j);
                        j++;
                    }
                });

                gumi_bus_location_seq.push(up_seq);
                callback(gumi_bus_location_seq);
            }
        }else{
            throw error;
        }
    })

};
gumiObject.urlStationRequest = function(dbObject, callback){

    var dbTemp = dbObject[0];
    requestData.station.stopId = dbTemp[0].stopid;

    var url = stationurl + "?act=" + requestData.station.act +
            "&stopId=" + requestData.station.stopId +
            "&stopKname=" + requestData.station.stopKname +
            "&menuCode=" + requestData.station.menuCode +
            "&stopServiceid=" + requestData.station.stopServiceid;

    request(url,
        function (error, response, html) {
            if (!error && response.statusCode == 200) {
                var $ = cheerio.load(html);
                var $arrive_desc = $('.arrive_desc');
                var gumi_arrive_list = [];

                $arrive_desc.each(function(){

                    var temp = {};
                    temp.routenm = $(this).find("BLINK[name='brtNo']").text();
                    temp.arrive_time = $(this).find("li[class='bus_state'] > span").text();
                    temp.cur_pos = $(this).children().last().text();
                    temp.routeid = commonBiz.findRouteid(dbTemp, temp.routenm);


                    gumi_arrive_list.push(temp);
                });

                if(gumi_arrive_list.length === 0){
                    var temp = {};
                    temp.arrive_time = "";
                    temp.routenm = "";
                    temp.cur_pos = "";
                    temp.routeid = "";
                    gumi_arrive_list.push(temp);

                    callback(gumi_arrive_list);

                }else{
                    callback(gumi_arrive_list);
                }

            }else{
                throw error;
            }
        });
};

module.exports = gumiObject;


