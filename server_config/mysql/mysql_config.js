/**
 * Created by airnold on 15. 4. 22..
 */

var mysqlconfig = {};

// database setting

mysqlconfig.database = {};



/**
 *
 * connection setting
 */

mysqlconfig.g_busquery = {};


mysqlconfig.g_busquery.ROUTESEARCH =
    'call routeSearch(?,?);';     // citycds, routenm


mysqlconfig.g_busquery.ROUTEDETAIL =
    'call routeSearchDetail(?, ?);';  // citycd , rid


mysqlconfig.g_busquery.STATIONSEARCH =
    'call stationSearch(?,?);';   // citycds, stopnm


mysqlconfig.g_busquery.STATIONDETAIL =
    'call stationDetailSearch(?,?);'; // citycd , sid


mysqlconfig.g_busquery.AROUNDXY =
    ' call aroundStationSearch(?,?,?);'; // citycd, x,y



mysqlconfig.g_busquery.PLACESEARCH =
    " CALL SEARCHPATH( ?, ?, ? ,? ); ";


module.exports = mysqlconfig;