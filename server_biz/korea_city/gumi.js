/**
 * Created by airnold on 15. 4. 24..
 */

// get method // html
//   http://m.bis.gumi.go.kr/GMBIS/m/page/getBrtBusPosList.do
//   route param -> act=srchBrtBusPos, brtId, brtDirection, brtClass, menuCode=1_12

//   http://m.bis.gumi.go.kr/GMBIS/m/page/srchBusArr.do
//   station param -> act=srchBusArr, stopId, stopKname, menuCode=1_03, stopServiceid

var request = require('request');
var cheerio = require('cheerio');
var errorHaldling = require('../../utility/errorHandling.js');

var gumiObject = {};

var routeurl = "http://m.bis.gumi.go.kr/GMBIS/m/page/getBrtBusPosList.do";

var stationurl = "http://m.bis.gumi.go.kr/GMBIS/m/page/srchBusArr.do";

/**
 *
 * request data format
 */

var requestData = {};
requestData.route = {};
requestData.route.act = "srchBrtBusPos" ;
requestData.route.brtId = "" ;
requestData.route.brtDirection = "1" ;
requestData.route.brtClass = "0" ;
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
    requestData.route.brtId = dbObject[0].routenm;
    requestData.route.brtDirection = dbObject[0].routeid;
    requestData.route.brtClass = dbObject[0].routedesc;

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
            $li.each(function(i){
                console.log($(this).attr('class'));
                if($(this).attr('class') === 'list_desc'){
                    gumi_bus_location_seq.push(i);
                }
            });

            callback(gumi_bus_location_seq);

        }else{
            errorHaldling.throw(5001, 'Route URL Request Error');
        }
    })

};
gumiObject.urlStationRequest = function(dbObject, callback){

    requestData.station.stopId = dbObject[0].stopid;

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
                var gumi_list = [];

                $arrive_desc.each(function(){
                    var temp = {};
                    temp.route_no = $(this).find("BLINK[name='brtNo']").text();
                    temp.route_time = $(this).find("li[class='bus_state'] > span").text();
                    temp.cur_pos = $(this).children().last().text();

                    gumi_list.push(temp);
                });

                console.log(gumi_list);
                callback(gumi_list);
            }else{
                errorHaldling.throw(5002, 'Station URL Request Error');
            }
        });


};








module.exports = gumiObject;


