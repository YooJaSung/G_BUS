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
    'call globus_v2.routeSearch(?,?);';     // citycds, routenm



mysqlconfig.g_busquery.ROUTEDETAIL =
    'call globus_v2.routeSearchDetail(?, ?);';  // citycd , rid




mysqlconfig.g_busquery.STATIONSEARCH =
    'call globus_v2.stationSearch(?,?);';   // citycds, stopnm


mysqlconfig.g_busquery.STATIONDETAIL =
    'call globus_v2.stationDetailSearch(?,?);'; // citycd , sid


mysqlconfig.g_busquery.AROUNDXY =
    ' call globus_v2.aroundStationSearch(?,?,?);'; // citycd, x,y



mysqlconfig.g_busquery.PLACESEARCH =
    " CALL SEARCHPATH( ?, ?, ? ,? ); ";


module.exports = mysqlconfig;