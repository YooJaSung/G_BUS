/**
 * Created by airnold on 15. 5. 12..
 */

var request = require('request');

var xml2jsparser = require('xml2json');
var iconv = require('iconv');
var commonBiz = require('../korea_common/common_biz.js');
var cheerio = require('cheerio');


var jeonjuObject = {};

var routeurl = "http://openapi.jeonju.go.kr/jeonjubus/openApi/traffic/bus_location_bus_position_common.do?ServiceKey=TFjQGXb5U7n3MCiAmknlU0DxTKQDSQfXvIekzMrkm9Q21VuwAuDAuhT9aVQarfGpnSfVVBhOhLSocLyAo%2BtXYg%3D%3D";

var stationurl = "http://www.jeonjuits.go.kr/main/bus/bus_locationpop_pop.jsp";


var requestData = {};
requestData.route = {};
requestData.route.lKey = "" ;
requestData.route.brtStdid = "";

requestData.station = {};
requestData.station.stop_stdid = "";

jeonjuObject.urlRouteRequest = function(dbObject , callback){

    var dbTemp = dbObject[0];


    requestData.route.brtStdid = dbTemp[0].routeid;

    var url = routeurl + "&brtStdid=" + requestData.route.brtStdid +
        "&lKey=" + requestData.route.lKey;

    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var jeonju_bus_location_seq = [];
            var up_seq = [];
            var xmldata = body;
            var options = {
                object: true,
                sanitize: false,
                arrayNotation: true
            };
            var parsed_data = xml2jsparser.toJson(xmldata, options);
            var routedata = parsed_data.RFC30[0].routeList[0].list;

            if(routedata === undefined){
                jeonju_bus_location_seq.push(up_seq);
                callback(jeonju_bus_location_seq);
            }else{
                for(var i in routedata){
                    var json_data = routedata[i].busNo[0];
                    if(json_data.$t !== undefined){
                        up_seq.push(i*1+1);
                    }
                }
                jeonju_bus_location_seq.push(up_seq);
                callback(jeonju_bus_location_seq);
            }


        }else{
            throw error;
        }
    });
};

jeonjuObject.urlStationRequest = function(dbObject, callback){

    var dbTemp = dbObject[0];

    requestData.station.stop_stdid = dbTemp[0].stopid;

    var url = stationurl + "?stop_stdid=" + requestData.station.stop_stdid;

    request.get({
            uri: url,
            encoding:null
        },
        function (error, response, html) {
            if (!error && response.statusCode == 200) {
                var ic = new iconv.Iconv('euc-kr', 'utf-8');
                var buf = ic.convert(html);
                var utf8String = buf.toString('utf-8');

                var $ = cheerio.load(utf8String);

                var $table = $('.table_list');
                var $tr = $table.find('tr');
                var jeonju_arrive_list = [];

                $tr.each(function(i) {
                    if(i !== 0) {
                        var temp = {};

                        temp.routenm = $(this).find('td:nth-child(2)').text();

                        if(temp.routenm === ""){
                        }
                        else{
                            temp.arrive_time = '약 ' + $(this).find('td:nth-child(4)').text() + ' 후 도착';

                            temp.cur_pos = $(this).find('td:nth-child(5)').text() + ' 구간 전';
                            temp.routeid =  commonBiz.findRouteid(dbTemp, temp.routenm);
                            jeonju_arrive_list.push(temp);
                        }
                    }
                });
                callback(jeonju_arrive_list);
            }else{
                throw error;
            }
        });
};

module.exports = jeonjuObject;