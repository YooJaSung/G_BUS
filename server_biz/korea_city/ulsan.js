/**
 * Created by airnold on 15. 4. 24..
 */

//   get method // html
//   http://m.its.ulsan.kr/m/001/001/content2.do
//   route param -> brtNo, brtDirection, brtClass, brtId

//   http://m.its.ulsan.kr/m/001/001/arrInfo.do
//   station param -> brtNo, brtDirection, brtClass, bnodeOldid, stopServiceid, stopName, brtId

var request = require('request');
var cheerio = require('cheerio');
var errorHaldling = require('../../utility/errorHandling.js');

var ulsanObject = {};

var routeurl = "http://m.its.ulsan.kr/m/001/001/content2.do";

var stationurl = "http://m.its.ulsan.kr/m/001/001/arrInfo.do";

/**
 *
 * request data format
 */

var requestData = {};
requestData.route = {};
requestData.route.brtNo = "" ;
requestData.route.brtDirection = "";
requestData.route.brtClass = "";
requestData.route.brtId = "";

requestData.station = {};
requestData.station.brtNo = "";
requestData.station.brtDirection = "";
requestData.station.brtClass = "";
requestData.station.bnodeOldid = "";
requestData.station.stopServiceid = "";
requestData.station.stopName = "";
requestData.station.brtId = "";


ulsanObject.urlRouteRequest = function(dbObject, callback){

    /**
     * 1. routeUrl 포멧을 db에서 선택한 데이터를 가지고 맞춰준다
     * 2. post or get 방식에 따라 request 까지 해준다.
     */


    requestData.route.brtNo = dbObject[0].routenm;
    var stringArray = splitColon(dbObject[0].routedesc);

    //routedesc x:x:x:x 2 번과 4번짜르기 class = 2번째 direction = 4번째
    requestData.route.brtDirection = stringArray[3];
    requestData.route.brtClass = stringArray[1];

    requestData.route.brtId = dbObject[0].routeid;

    var url = routeurl + "?brtNo=" + requestData.route.brtNo +
            "&brtDirection=" + requestData.route.brtDirection +
            "&brtClass=" + requestData.route.brtClass +
            "&brtId=" + requestData.route.brtId ;

    request( url , function (error, response, html) {
        if (!error && response.statusCode == 200) {
            var ulsan_bus_location_seq = [];
            var $ = cheerio.load(html);
            console.log(html);
            var $li = $('.nx li');

            if($li.length === 0){
                // 잘못된 버스번호
                callback(ulsan_bus_location_seq);
            }else{
                $li.each(function(i){

                    if($(this).find('img').attr('src') === '/m/img/ico_bus.png'){

                        ulsan_bus_location_seq.push(i*1+1);
                    }
                });

                callback(ulsan_bus_location_seq);
            }

        }else{
            throw error;
        }
    });


};
ulsanObject.urlStationRequest = function(dbObject, callback){

    var ulsan_list = [];

    for(var i in dbObject){

        requestData.station.brtNo = dbObject[i].routenm;
        var stringArray = splitColon(dbObject[i].routedesc);
        requestData.station.brtDirection = stringArray[3];
        requestData.station.brtClass = stringArray[1];
        requestData.station.bnodeOldid = dbObject[i].stopdesc;
        requestData.station.stopServiceid = dbObject[i].arsid;
        requestData.station.stopName = "";
        requestData.station.brtId = dbObject[i].stopid;

        var url = stationurl+"?brtNo=" + requestData.station.brtNo +
            "&brtDirection=" + requestData.station.brtDirection +
            "&brtClass=" + requestData.station.brtClass +
            "&bnodeOldid=" + requestData.station.bnodeOldid +
            "&stopServiceid=" + requestData.station.stopServiceid +
            "&stopName=" + requestData.station.stopName +
            "&brtId=" + requestData.station.brtId;

        request(url,
            function (error, response, html) {
                if (!error && response.statusCode == 200) {

                    var $ = cheerio.load(html);
                    var $arrInfo = $('.arrInfo');
                    var $bs = $('.bs');

                    console.log("정류소 번호 : " + $bs.find('span[title=정류소번호]').text());

                    $arrInfo.each(function() {

                        var temp = {};
                        temp.routeid = dbObject[i].routeid;
                        temp.arrive_time = $(this).find("span[class='strong']").text();
                        temp.routenm = $(this).find('dd[class=brtNo]').text();

                        ulsan_list.push(temp);

                    })
                }else{
                    throw error;
                }
            }
        )
    }

    callback(ulsan_list);

};

function splitColon(beforeString){
    var afterString = beforeString.split(":");
    return afterString;
}
module.exports = ulsanObject;


