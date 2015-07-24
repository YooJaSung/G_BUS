/**
 * Created by airnold on 15. 4. 22..
 */

var express = require('express');
var placeRouter = express.Router();

var koreaDB = require('../../server_biz/korea_common/korea_db.js');

placeRouter.post('/placeSearch', function(req,res,next){

    var getdata = req.body.data;

    var sx = getdata.sx;
    var sy = getdata.sy;

    var ex = getdata.ex;
    var ey = getdata.ey;

    var sname = getdata.sname;
    var ename = getdata.ename;

    koreaDB.placeSearch(sx,sy, ex, ey, sname, ename, function(placeData){
        res.send(placeData);
    })

});

module.exports = placeRouter;

