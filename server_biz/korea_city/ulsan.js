/**
 * Created by airnold on 15. 4. 24..
 */

var request = require('request');
var cheerio = require('cheerio');
var nimble = require('nimble');

var ulsanObject = {};

var routeurl = "http://m.its.ulsan.kr/m/001/001/content2.do";
var stationurl = "http://m.its.ulsan.kr/m/001/001/arrInfo.do";

/**
 *
 * request data format
 */

var requestData = {};
requestData.route = {};
requestData.route.brtNo = "";
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

ulsanObject.urlRouteRequest = function (dbObject, callback) {
    var dbTemp = dbObject[0];

    var descArr = dbTemp[0].routedesc.split('^');

    console.log(dbTemp[0].routedesc);
    var ulsan_bus_location_seq = [];
    var up_seq = [];
    var down_seq = [];

    nimble.series([
        function(upCallback){
            requestData.route.brtNo = dbTemp[0].routenm;
            var stringArray = splitColon(descArr[0]);

            requestData.route.brtDirection = stringArray[0];
            requestData.route.brtClass = stringArray[1];

            requestData.route.brtId = dbTemp[0].routeid;

            var url = routeurl + "?brtNo=" + requestData.route.brtNo +
                "&brtDirection=" + requestData.route.brtDirection +
                "&brtClass=" + requestData.route.brtClass +
                "&brtId=" + requestData.route.brtId;

            request(url, function (error, response, html) {
                if (!error && response.statusCode == 200) {

                    var $ = cheerio.load(html);

                    var $li = $('.nx li');

                    if ($li.length === 0) {


                        upCallback();
                    } else {
                        $li.each(function (i) {

                            if ($(this).find('img').attr('src') === '/m/img/ico_bus.png') {

                                up_seq.push(i * 1 + 1);
                            }
                        });

                        upCallback();
                    }

                } else {
                    throw error;
                }
            });
        },
        function(downCallback){
            if(descArr[1] === undefined ){
                downCallback();
            }else{
                requestData.route.brtNo = dbTemp[0].routenm;
                var stringArray = splitColon(descArr[1]);

                requestData.route.brtDirection = stringArray[0];
                requestData.route.brtClass = stringArray[1];

                requestData.route.brtId = dbTemp[0].routeid;

                var url = routeurl + "?brtNo=" + requestData.route.brtNo +
                    "&brtDirection=" + requestData.route.brtDirection +
                    "&brtClass=" + requestData.route.brtClass +
                    "&brtId=" + requestData.route.brtId;

                request(url, function (error, response, html) {
                    if (!error && response.statusCode == 200) {

                        var $ = cheerio.load(html);

                        var $li = $('.nx li');

                        if ($li.length === 0) {
                            // 잘못된 버스번호

                            downCallback();
                        } else {
                            $li.each(function (i) {

                                if ($(this).find('img').attr('src') === '/m/img/ico_bus.png') {

                                    down_seq.push(i * 1 + 1);
                                }
                            });

                            downCallback();
                        }

                    } else {
                        throw error;
                    }
                });
            }

        },
        function(resCallback){
            ulsan_bus_location_seq.push(up_seq);
            ulsan_bus_location_seq.push(down_seq);
            callback(ulsan_bus_location_seq);
            resCallback();
        }
    ]);

};

ulsanObject.urlStationRequest = function (dbObject, callback) {

    var ulsan_list = [];

    var dbTemp = dbObject[0];


    var start = 0;
    var end = dbTemp.length;

    (function loop() {
        if (start < end) {

            var descArr = dbTemp[start].routedesc.split('^');

            if (dbTemp[start].updownflag === '0') {

                //상행
                requestData.station.brtNo = dbTemp[start].routenm;
                var stringArray = splitColon(descArr[0]);
                requestData.station.brtDirection = stringArray[0];
                requestData.station.brtClass = stringArray[1];
                requestData.station.bnodeOldid = dbTemp[start].mobilestopid;
                requestData.station.stopServiceid = dbTemp[start].arsid;
                requestData.station.stopName = "";
                requestData.station.brtId = dbTemp[start].routeid;

                var url = stationurl + "?brtNo=" + requestData.station.brtNo +
                    "&brtDirection=" + requestData.station.brtDirection +
                    "&brtClass=" + requestData.station.brtClass +
                    "&bnodeOldid=" + requestData.station.bnodeOldid +
                    "&stopServiceid=" + requestData.station.stopServiceid +
                    "&stopName=" +
                    "&brtId=" + requestData.station.brtId;

                requestUlsan(dbTemp[start], url, function (tempData) {

                    ulsan_list.push(tempData);

                    start++;
                    loop();
                });

            } else {
                if(descArr[1] === undefined){
                    start++;
                    loop();

                }else{

                    requestData.station.brtNo = dbTemp[start].routenm;
                    var stringArray = splitColon(descArr[1]);
                    requestData.station.brtDirection = stringArray[0];
                    requestData.station.brtClass = stringArray[1];
                    requestData.station.bnodeOldid = dbTemp[start].mobilestopid;
                    requestData.station.stopServiceid = dbTemp[start].arsid;
                    requestData.station.stopName = "";
                    requestData.station.brtId = dbTemp[start].routeid;


                    var url = stationurl + "?brtNo=" + requestData.station.brtNo +
                        "&brtDirection=" + requestData.station.brtDirection +
                        "&brtClass=" + requestData.station.brtClass +
                        "&bnodeOldid=" + requestData.station.bnodeOldid +
                        "&stopServiceid=" + requestData.station.stopServiceid +
                        "&stopName=" +
                        "&brtId=" + requestData.station.brtId;

                    requestUlsan(dbTemp[start], url, function (tempData) {

                        ulsan_list.push(tempData);
                        start++;
                        loop();

                    });
                }
            }
        } else {
            callback(ulsan_list);
        }
    }());

};

function splitColon(beforeString) {
    var afterString = beforeString.split(":");
    return afterString;
}

function requestUlsan(dbObj, url, endCallback) {

    console.log(url);

    request(url, function (error, response, html) {
            if (!error && response.statusCode == 200) {
                var $ = cheerio.load(html);
                var arr_temp = [];
                var temp = {};

                var $dt = $(".strong");



                if($dt.length === 0){
                    arr_temp.push('');
                }else{
                    $dt.each(function (i) {

                        if(i == 0){
                            arr_temp.push($(this).text());
                        }else{
                            arr_temp.push('');
                        }
                    });
                }

                temp.routeid = dbObj.routeid;
                temp.routenm = dbObj.routenm;

                if (arr_temp[0] !== '') {
                    if(arr_temp[0] == '0분'){
                        temp.arrive_time = '';
                    }else{
                        temp.arrive_time = "약 " + arr_temp[0] + "후 도착";
                    }
                } else {
                    temp.arrive_time = '';
                }
                temp.cur_pos = '';
                endCallback(temp);

            } else {
                throw error;
            }
        }
    );
}

module.exports = ulsanObject;


