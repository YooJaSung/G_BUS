/**
 * Created by airnold on 15. 4. 29..
 */

/**
 * Created by airnold on 15. 4. 22..
 */

var express = require('express');
var regionRouter = express.Router();

regionRouter.get('/regionService', function(req,res, next){

    res.send([
        {
            "regionNm" : "서울",
            "regionCode" : "101",
            "regionEnNm" : "seoul"
        },
        {
            "regionNm" : "경기",
            "regionCode" : "102",
            "regionEnNm" : "gyunggi"
        },
        {
            "regionNm" : "인천",
            "regionCode" : "103",
            "regionEnNm" : "incheon"
        },
        {
            "regionNm" : "대구",
            "regionCode" : "403",
            "regionEnNm" : "daegu"
        },
        /*{
            "regionNm" : "대전",
            "regionCode" : "",
            "regionEnNm" : "DJB"
        },*/
        {
            "regionNm" : "울산",
            "regionCode" : "402",
            "regionEnNm" : "ulsan"
        },
        /*{
            "regionNm" : "제주",
            "regionCode" : "39",
            "regionEnNm" : "JEB"
        },*/
        {
            "regionNm" : "광주",
            "regionCode" : "505",
            "regionEnNm" : "gwangju"
        },
        {
            "regionNm" : "청주",
            "regionCode" : "303",
            "regionEnNm" : "chungju"
        },
        /*{
            "regionNm" : "포항",
            "regionCode" : "37010",
            "regionEnNm" : "PHB"
        },*/
        {
            "regionNm" : "원주",
            "regionCode" : "202",
            "regionEnNm" : "wonju"
        },
        {
            "regionNm" : "아산",
            "regionCode" : "301",
            "regionEnNm" : "asan"
        },
        {
            "regionNm" : "천안",
            "regionCode" : "302",
            "regionEnNm" : "cheonan"
        },
        {
            "regionNm" : "세종",
            "regionCode" : "305",
            "regionEnNm" : "sejong"
        },
        {
            "regionNm" : "부산",
            "regionCode" : "401",
            "regionEnNm" : "busan"
        },
        {
            "regionNm" : "창원",
            "regionCode" : "404",
            "regionEnNm" : "changwon"
        },
        {
            "regionNm" : "구미",
            "regionCode" : "406",
            "regionEnNm" : "gumi"
        },
        {
            "regionNm" : "통영",
            "regionCode" : "409",
            "regionEnNm" : "tongyeong"
        },
        {
            "regionNm" : "진주",
            "regionCode" : "412",
            "regionEnNm" : "jinju"
        },
        {
            "regionNm" : "광양",
            "regionCode" : "501",
            "regionEnNm" : "gwangyang"
        },
        {
            "regionNm" : "순천",
            "regionCode" : "502",
            "regionEnNm" : "sunchun"
        },
        {
            "regionNm" : "여수",
            "regionCode" : "503",
            "regionEnNm" : "yeosu"
        }/*,
        {
            "regionNm" : "나주",
            "regionCode" : "506",
            "regionEnNm" : "naju"
        }*/
        ,
        {
            "regionNm" : "목포",
            "regionCode" : "507",
            "regionEnNm" : "mokpo"
        },
        {
            "regionNm" : "화순",
            "regionCode" : "508",
            "regionEnNm" : "hwasoon"
        }

    ]);

});

module.exports = regionRouter;

