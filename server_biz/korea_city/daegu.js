/**
 * Created by airnold on 15. 4. 24..
 */



var request = require('request');
var iconv = require('iconv');
var cheerio = require('cheerio');

var seoulObject = {};

var routeurl = "http://m.businfo.go.kr/bp/m/realTime.do";

var stationurl = "http://m.businfo.go.kr/bp/m/realTime.do";

/**
 *
 * request data format
 */

var requestData = {};
requestData.route = {};
requestData.route.act = "posInfo";
requestData.route.roId = "";
requestData.route.roNo = "";
requestData.route.moveDir = "1";


requestData.station = {};
requestData.station.act = "arrInfo";
requestData.station.bsId = "";
//bsNm 인코딩 필요함
requestData.station.bsNm = "";


seoulObject.urlRouteRequest = function (dbObject, callback) {

    /**
     * 1. routeUrl 포멧을 db에서 선택한 데이터를 가지고 맞춰준다
     * 2. post or get 방식에 따라 request 까지 해준다.
     */

    requestData.route.act = "posInfo";
    requestData.route.roId = dbObject[0].routeid;
    requestData.route.roNo = dbObject[0].routenm;
    requestData.route.moveDir = "1";

    var url = routeurl + "?act=" + requestData.route.act +
        "&roId=" + requestData.route.roId +
        "&roNo=" + requestData.route.roNo +
        "&moveDir=" + requestData.route.moveDir;

    request(url, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            var daegu_bus_location_seq1 = [];
            var daegu_bus_location_seq2 = [];
            var daegu_bus_location_seq = [];
            var $ = cheerio.load(html);

            //정방역방 없는것 -> 바로 검색 무조건 실행
            var $li = $('.bl li');
            $li.each(function (i) {
                if ($(this).attr('class') === 'bloc_b') {
                    console.log(i);
                    daegu_bus_location_seq1.push(i);
                }

            });
            daegu_bus_location_seq.push(daegu_bus_location_seq1);

            var flfind = $('.r');

            if (flfind.length !== 0) {

                requestData.route.moveDir = "0";

                url = routeurl + "?act=" + requestData.route.act +
                "&roId=" + requestData.route.roId +
                "&roNo=" + requestData.route.roNo +
                "&moveDir=" + requestData.route.moveDir;

                //정방역방 있는것 -> http://m.businfo.go.kr/bp/m/realTime.do?act=posInfo&roId=3000726000&roNo=726&moveDir=0 로 다시 요청
                request(url, function (error, response, html) {
                    if (!error && response.statusCode == 200) {
                        var $ = cheerio.load(html);
                        var $li = $('.bl li');
                        $li.each(function (i) {
                            if ($(this).attr('class') === 'bloc_b') {
                                console.log(i);
                                daegu_bus_location_seq2.push(i);
                            }

                        });
                        daegu_bus_location_seq.push(daegu_bus_location_seq2);

                    }

                })

            }
            callback(daegu_bus_location_seq);

        }else{
            throw error;
        }
    });

};
seoulObject.urlStationRequest = function (dbObject, callback) {


    requestData.station.act = "arrInfo";
    requestData.station.bsId = dbObject[0].stopid;
    requestData.station.bsNm = dbObject[0].stopnm;

    var url = stationurl + "?act=" + requestData.station.act +
            "&bsId=" + requestData.station.bsId +
            "&bsNm=" + requestData.station.bsNm;

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

                var $bl = $('.bl');
                var $st = $bl.find('li[class=st]');
                var $nm = $bl.find('li[class=nm]');

                var daegu_list = [];


                //대구 버스정보 시스템은 '전', '전전' 으로 예상도착시간을 표시함.
                $st.each(function () {
                    var temp = {};
                    temp.route_no = $(this).find('span[class=marquee]').text();
                    temp.arr_state = $(this).find('span[class=arr_state]').text();
                    temp.cur_pos = $(this).find('span[class=cur_pos]').text();

                    daegu_list.push(temp);
                });

                $nm.each(function () {
                    var temp = {};
                    temp.route_no = $(this).find('span[class=marquee]').text();
                    temp.arr_state = $(this).find('span[class=arr_state]').text();
                    temp.cur_pos = $(this).find('span[class=cur_pos]').text();

                    daegu_list.push(temp);
                });

                callback(daegu_list);
            }else{
                throw error;
            }
        }
    );


};


module.exports = seoulObject;


