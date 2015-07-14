/**
 * Created by airnold on 15. 5. 28..
 */

var koreaCommonBiz = {};

koreaCommonBiz.findRouteid = function(dbObject, routenm){
    var temprouteid = "";
    for(var i in dbObject){
        if(dbObject[i].routenm === routenm){
            temprouteid = dbObject[i].routeid;
            break;
        }
    }

    return temprouteid;

};

koreaCommonBiz.splitSomething = function(beforeStr, division){
    var afterString = beforeStr.split(division);

    var finalString = removeSpace(afterString[0]);

    return finalString;
};

function removeSpace(str){

    return str.replace(/(^\s*)|(\s*$)/, '');

}

koreaCommonBiz.changeTomin = function(time){

    var min = parseInt( (time % 3600) / 60 );
    var sec = time % 60;
    var mintime = min+"분" + sec+ "초";
    return mintime;
};

koreaCommonBiz.removeChar = function(beforeStr){

    var afterString = beforeStr.replace(/[^0-9]/gi, "");

    var finalString = removeSpace(afterString);

    return finalString;
};

koreaCommonBiz.makeCacheName = function(cityCodeObj, id){
    var tempCacheName = "";

    for(var i in cityCodeObj){
        tempCacheName += cityCodeObj[i].cityCode;
    }
    tempCacheName += id;

    return tempCacheName;
};

koreaCommonBiz.makeTimeObject = function(dbObject){
    var dbTemp = dbObject[0];
    var temp = {};

    temp.dayedcon = dbTemp[0].dayedcon;
    temp.dayedstopfirsttm = dbTemp[0].dayedstopfirsttm;
    temp.dayedstoplasttm = dbTemp[0].dayedstoplasttm;

    temp.daystcon = dbTemp[0].daystcon;
    temp.dayststopfirsttm = dbTemp[0].dayststopfirsttm;
    temp.dayststoplasttm = dbTemp[0].dayststoplasttm;

    temp.satedcon = dbTemp[0].satedcon;
    temp.satedstopfirsttm = dbTemp[0].satedstopfirsttm;
    temp.satedstoplasttm = dbTemp[0].satedstoplasttm;

    temp.satstcon = dbTemp[0].satstcon;
    temp.satststopfirsttm = dbTemp[0].satststopfirsttm;
    temp.satststoplasttm = dbTemp[0].satststoplasttm;

    temp.sunedcon = dbTemp[0].sunedcon;
    temp.sunedstopfirsttm = dbTemp[0].sunedstopfirsttm;
    temp.sunedstoplasttm = dbTemp[0].sunedstoplasttm;

    temp.sunstcon = dbTemp[0].sunstcon;
    temp.sunststopfirsttm = dbTemp[0].sunststopfirsttm;
    temp.sunststoplasttm = dbTemp[0].sunststoplasttm;

    return temp;

};

module.exports = koreaCommonBiz;