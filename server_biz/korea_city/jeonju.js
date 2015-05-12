/**
 * Created by airnold on 15. 5. 12..
 */

var request = require('request');

var xml2jsparser = require('xml2json');
var iconv = require('iconv');
var errorHaldling = require('../../utility/errorHandling.js');


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

    requestData.route.brtStdid = dbObject[0].routeid;

    var url = routeurl + "&brtStdid=" + requestData.route.brtStdid +
        "&lKey=" + requestData.route.lKey;

    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var jeonju_bus_location_seq = [];
            var xmldata = body;
            var options = {
                object: true,
                sanitize: false,
                arrayNotation: true
            };
            var parsed_data = xml2jsparser.toJson(xmldata, options);
            var routedata = parsed_data.RFC30[0].routeList[0].list;

            for(var i in routedata){
                var json_data = routedata[i].busNo[0];
                if(json_data.$t !== undefined){
                    jeonju_bus_location_seq.push(i);
                }

            }
            callback(jeonju_bus_location_seq);
        }else{
            errorHaldling.throw(5001, 'Route URL Request Error');
        }
    });

};

jeonjuObject.urlStationRequest = function(dbObject, callback){

    requestData.station.stop_stdid = dbObject[0].stopid;

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
                var jeonju_list = [];

                $tr.each(function(i) {
                    if(i !== 0) {
                        var temp = {};

                        temp.low_value = $(this).find('td:nth-child(1)').text();
                        temp.route_name = $(this).find('td:nth-child(2)').text();
                        temp.arrivetime = $(this).find('td:nth-child(4)').text();
                        temp.remain_bstop = $(this).find('td:nth-child(5)').text();
                        temp.curr_pos = $(this).find('td:nth-child(6)').text();
                        temp.route_dir = $(this).children().last().text();

                        jeonju_list.push(temp);
                    }
                });
                callback(jeonju_list);
            }else{
                errorHaldling.throw(5002, 'Station URL Request Error');
            }
        });
};

module.exports = jeonjuObject;