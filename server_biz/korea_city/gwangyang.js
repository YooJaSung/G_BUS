/**
 * Created by airnold on 15. 4. 24..
 */


var request = require('request');
var cheerio = require('cheerio');
var commonBiz = require('../korea_common/common_biz.js');

var gwangyangObject = {};

var routeurl = "http://bis.gwangyang.go.kr:8282/internet/pgm/map/route/routeMap.jsp";
var routemurl = "http://mbis.gwangyang.go.kr:8286/smart/search/routeResult.jsp";

var stationurl = "http://mbis.gwangyang.go.kr:8286/search/arrivalList.jsp";


var requestData = {};

requestData.route = {};
requestData.route.upperBusRouteID = "" ;
requestData.route.busRouteID = "";

requestData.station = {};
requestData.station.stationID = "" ;
requestData.station.nodeID = "" ;
requestData.station.bitFalg = "" ;
requestData.station.toNodeName = "" ;
requestData.station.mobile_no = "";
requestData.station.menuSeq = "";

gwangyangObject.urlRouteRequest = function(dbObject, callback){


    var dbTemp = dbObject[0];

    requestData.route.upperBusRouteID = dbTemp[0].routeid;
    requestData.route.busRouteID = dbTemp[0].routedesc;

    var url = routemurl + "?search=yes&upperBusRouteID=" + requestData.route.upperBusRouteID +
            "&busRouteID=" + requestData.route.busRouteID;


    /*request(url, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            var gwangyang_bus_location_seq = [];
            var $ = cheerio.load(html);
            var $icon = $('.rmt_icon');
            if($icon.length === 0){
                // 잘못된 버스 번호 요청
                callback(gwangyang_bus_location_seq);
            }else{

                $icon.each(function(i){
                    //  /internet/images/route/icon_bus_sc01.gif
                    if($(this).find('img').attr('src') === '/internet/images/route/icon_bus_sc02.gif' || $(this).find('img').attr('src') === '/internet/images/route/icon_bus_sc01.gif'){
                        gwangyang_bus_location_seq.push(i*1+1);
                    }
                });
                callback(gwangyang_bus_location_seq);
            }
        }else{
            throw error;
        }
    })*/


    request(url, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            var gwangyang_bus_location_seq = [];
            var up_seq = [];
            var $ = cheerio.load(html);
            var $tr = $('.resultDiv tr');

            $tr.each(function(i){

                if($(this).find('td[width=20]').find('img').attr('src') === '/smart/images/icon_bus.gif'){
                    up_seq.push(i * 1 + 1);
                }


            });
            gwangyang_bus_location_seq.push(up_seq);
            callback(gwangyang_bus_location_seq);
        }else{
            throw error;
        }
    })

};
gwangyangObject.urlStationRequest = function(dbObject, callback){


    var dbTemp = dbObject[0];

    requestData.station.stationID = dbTemp[0].stopid;
    requestData.station.nodeID = dbTemp[0].stopdesc;
    requestData.station.bitFlag = "0";
    requestData.station.toNodeName = "";
    requestData.station.mobile_no = "";
    requestData.station.menuSeq = "2";


    var url = stationurl + "?stationID=" + requestData.station.stationID +
            "&nodeID=" + requestData.station.nodeID +
            "&bitFlag=" + requestData.station.bitFalg +
            "&toNodeName=" + requestData.station.toNodeName +
            "&mobile_no=" + requestData.station.mobile_no +
            "&menuSeq=" + requestData.station.menuSeq;

    request.get({
            uri: url
        },
        function (error, response, html) {
            if (!error && response.statusCode == 200) {
                var $ = cheerio.load(html);
                var $table = $('table[class=resultTable]');
                var $tr = $table.find('tr');
                var gwangyang_arrive_list = [];

                $tr.each(function(){

                    var temp = {};

                    temp.routenm = $(this).find('td:nth-child(1)').text();
                    if(temp.routenm === "정류장도착 예정정보가 없습니다."){

                    }else{
                        temp.arrive_time = "약 " + $(this).find('span').text() + " 후 도착";
                        temp.cur_pos = "";
                        temp.routeid = commonBiz.findRouteid(dbTemp, commonBiz.splitSomething(temp.routenm, '번'));
                        gwangyang_arrive_list.push(temp);
                    }


                });
                callback(gwangyang_arrive_list);
            }else{
                throw error;
            }
        });

};

module.exports = gwangyangObject;


