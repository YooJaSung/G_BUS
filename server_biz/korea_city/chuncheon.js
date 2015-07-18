/**
 * Created by airnold on 15. 4. 24..
 */

var request = require('request');
var cheerio = require('cheerio');
var iconv = require('iconv');

var commonBiz = require('../korea_common/common_biz.js');


var chuncheonObject = {};

var routeurl = "http://www.chbis.kr/serviceRoute.do";

var stationurl = "http://www.chbis.kr/stationInfo.do";




/**
 *
 * request data format
 */
var requestData = {};
requestData.route = {};
requestData.route.prmOperation = "getServiceRoute" ;
requestData.route.prmRouteName = "" ;
requestData.route.prmRouteID = "" ;


requestData.station = {};
requestData.station.prmOperation = "getStationInfo";
requestData.station.prmStationName = "";
requestData.station.prmStationID = "";


chuncheonObject.urlRouteRequest = function(dbObject, callback){


    var dbTemp = dbObject[0];
    requestData.route.prmRouteName = dbTemp[0].routenm;
    requestData.route.prmRouteID = dbTemp[0].routeid;

    var formdata = 'prmOperation='+requestData.route.prmOperation +'&prmRouteName='+requestData.route.prmRouteName+'&prmRouteID='+requestData.route.prmRouteID;

    request.post({
        url :routeurl,
        form: formdata
    }, function (error, response, html) {
        if (!error && response.statusCode == 200) {

            var chuncheon_bus_location_temp = [];
            var chuncheon_bus_location_seq = [];
            var up_seq = [];
            var down_seq = [];
            var $ = cheerio.load(html);
            var $td = $('td[class=routeLineH]');
            var $tdname = $('td[class=name]');
            var trnseq = dbTemp[0].trnseq;

            $td.each(function(i){
                if($(this).find('img').attr('src') === '../images/bus/icon_bus2.gif' || $(this).find('img').attr('src') === '../images/bus/icon_bus1.gif' ){
                    chuncheon_bus_location_temp.push(i);
                }
            });

            for(var i in chuncheon_bus_location_temp){
                console.log(chuncheon_bus_location_temp[i]);

                $tdname.each(function(j){
                    if(chuncheon_bus_location_temp[i] === j+1){
                        if(commonBiz.splitSomething($(this).text(), ' ')*1 <= trnseq){
                            up_seq.push(commonBiz.splitSomething($(this).text(), ' ') * 1);
                        }else{
                            down_seq.push(commonBiz.splitSomething($(this).text(), ' ') * 1 - trnseq);
                        }

                        return false;
                    }
                })
            }

            chuncheon_bus_location_seq.push(up_seq);
            chuncheon_bus_location_seq.push(down_seq);

            callback(chuncheon_bus_location_seq);



        }else{

            throw error;
        }
    })

};
chuncheonObject.urlStationRequest = function(dbObject, callback){


    var dbTemp = dbObject[0];
    requestData.station.prmStationName = dbTemp[0].stopnm;
    requestData.station.prmStationID = dbTemp[0].stopid;

    request.post({
        uri: stationurl,
        encoding: null,
        form: {
            prmOperation: requestData.station.prmOperation,
            prmStationName: requestData.station.prmStationName,
            prmStationID: requestData.station.prmStationID
        }
    }, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            var ic = new iconv.Iconv('euc-kr', 'utf-8');
            var buf = ic.convert(html);
            var utf8String = buf.toString('utf-8');

            var $ = cheerio.load(utf8String);
            var $tr = $('tr');

            var chuncheon_list = [];

            $tr.each(function () {

                if ($(this).find('td').attr('class') == 'text_12_08 padding_6_0_6_0' && $(this).find('td').attr('width') == '90') {
                    var temp = {};

                    temp.routenm = $(this).find('td[width=90]').text();

                    if($(this).find('td:nth-child(3)').text() === '-'){
                        temp.arrive_time = '잠시 후 도착';
                        temp.cur_pos = '';
                    }else{
                        temp.arrive_time = '약 ' + $(this).find('td:nth-child(3)').text() + ' 후 도착';
                        temp.cur_pos = $(this).find('td[width=107]').text();
                    }

                    temp.routeid = commonBiz.findRouteid(dbTemp, temp.routenm);

                    chuncheon_list.push(temp);
                }
            });

            callback(chuncheon_list)
        }
    });
};


module.exports = chuncheonObject;


