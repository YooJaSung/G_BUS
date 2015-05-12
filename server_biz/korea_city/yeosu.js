/**
 * Created by airnold on 15. 4. 24..
 */

// get method // html
//   http://mbis.yeosu.go.kr:8286/smart/routeResult.htm
//   route param -> busRouteID
// html data
//   http://its.yeosu.go.kr/New/include/clip/searchPredictInfo.jsp
//   station param -> sId

var request = require('request');
var cheerio = require('cheerio');
var yeosuObject = {};

var routeurl = "http://mbis.yeosu.go.kr:8286/smart/routeResult.htm";

var stationurl = "http://its.yeosu.go.kr/New/include/clip/searchPredictInfo.jsp";

/**
 *
 * request data format
 */

var requestData = {};
requestData.route = {};
requestData.route.busRouteID = "" ;

requestData.station = {};
requestData.station.sId = "";




yeosuObject.urlRouteRequest = function(dbObject, callback){

    /**
     * 1. routeUrl 포멧을 db에서 선택한 데이터를 가지고 맞춰준다
     * 2. post or get 방식에 따라 request 까지 해준다.
     */

    requestData.route.busRouteID = dbObject[0].routeid ;

    var url = routeurl+"?busRouteID="+requestData.route.busRouteID;

    request(url, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            var yeosu_bus_location_seq = [];
            var $ = cheerio.load(html);
            var $td = $('td[width="20"]');
            $td.each(function(i){
                if($(this).find('img').attr('src') === 'images/icon_bus.gif'){
                    yeosu_bus_location_seq.push(i);
                }
            });
            callback(yeosu_bus_location_seq);
        }else{
            throw error;
        }
    })

};
yeosuObject.urlStationRequest = function(dbObject, callback){

    requestData.station.sId = dbObject[0].stopid;

    request.post({
        url: stationurl,
        form: {
            sId: requestData.station.sId
        }
    }, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);
            var $table = $('.list01_table');

            var $tr = $table.find('tr');
            var $td = $tr.find('.t_a_c');

            var yeosu_list = [];

            $tr.each(function(){
                var temp = {};

                if($(this).find('td').attr('class') !== 'col t_a_c') {
                    temp.route_name = $(this).find('td:nth-child(1)').text();
                    temp.curr_pos = $(this).find('td:nth-child(2)').text();
                    temp.arrive_time = $(this).children().last().text();
                    yeosu_list.push(temp);
                }
            });
            callback(yeosu_list);

        }else{
            throw error;
        }
    });

};

module.exports = yeosuObject;


