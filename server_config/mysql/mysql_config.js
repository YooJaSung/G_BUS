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

mysqlconfig.g_busquery.temp = "";

/*
 #####################################################################
 ##	SERVICENAME : ROUTESEARCH										##
 ##	DESC ; 지역코드 검색 후, 노선명으로 해당 노선을 검색한다.                   ##
 ##		REQ : CITYCD, ROUTENM										##
 ##		RES : ROUTEID, ROUTENM, ROUTESUBN, STSTOP, EDSTOP 			##
 #####################################################################
 */
/*
 mysqlconfig.g_busquery.ROUTESEARCH =
 "SELECT R.citycd, R.rid, R.routeid, R.routenm, R.routesubnm " +
 " , ST.STOPNM AS ststopnm " +
 " , ED.STOPNM AS edstopnm " +
 " FROM ROUTES R " +
 " INNER JOIN STOPS ST  ON R.CITYCD = ST.CITYCD AND R.STSTOPSID = ST.SID " +
 " INNER JOIN STOPS ED  ON R.CITYCD = ED.CITYCD AND R.EDSTOPSID = ED.SID " +
 " WHERE R.CITYCD = ? " +
 " AND R.ROUTENM LIKE '?'; " ;
 */
mysqlconfig.g_busquery.ROUTESEARCH =
    "SELECT R.citycd, R.rid, R.routeid, R.routenm, R.routesubnm " +
    " , ST.STOPNM AS ststopnm " +
    " , ED.STOPNM AS edstopnm " +
    " FROM ROUTES R " +
    " LEFT OUTER JOIN STOPS ST  ON R.CITYCD = ST.CITYCD AND R.STSTOPSID = ST.SID " +
    " LEFT OUTER JOIN STOPS ED  ON R.CITYCD = ED.CITYCD AND R.EDSTOPSID = ED.SID " +
    " WHERE R.ROUTENM LIKE ? ";


/*
 #####################################################################
 ##	SERVICENAME : ROUTESEARCHDETAIL									##
 ##	DESC : 	ROUTESEARCH_SEVICE의 결과를 이용해 							##
 ##			노선이동 경로, 환승지 ID와 같은 노선의 상세정보를 리턴한다.			##
 ##	REQ :	CITYCD, RID												##
 ##	RES :	ROUTEID, ROUTEDESC, TRNSID, SID, STOPID, STOPNM	     	##
 ##		 															##
 ## 실시간 정보 요청에 의해 변동적인 값을 줄 수 있는 쿼리가 존재해야한다.			##
 #####################################################################
 */

mysqlconfig.g_busquery.ROUTEDETAIL =
    " SELECT RVS.citycd, RVS.seq " +
    " , R.rid,R.routeid, R.routenm, R.routedesc, R.trnsid " +
    " , S.sid, S.stopid, S.stopnm " +
    " FROM ROUTEVIASTOP RVS " +
    " INNER JOIN ROUTES R " +
    " ON RVS.CITYCD = R.CITYCD AND RVS.RID = R.RID " +
    " INNER JOIN STOPS S " +
    " ON RVS.CITYCD = S.CITYCD AND RVS.SID = S.SID " +
    " WHERE RVS.CITYCD = ? AND RVS.RID = ?; ";


/*
 ######################################################################
 ##	SERVICENAME : STATIONSEARCH										##
 ##	DESC : 	지역코드 선택 후, 지역의 해당 정류장을 검색 						##
 ##																	##
 ##	REQ :	CITYCD, STOPNM											##
 ##	RES :	CITYCD, SID, STOPNM, STOPID, ARSID						##
 ##		 															##
 ######################################################################
 */

mysqlconfig.g_busquery.STATIONSEARCH =
    " SELECT citycd, sid, stopnm, stopid, arsid " +
    " FROM STOPS " +
    " WHERE stopnm like ? ";


/*
 #####################################################################
 ##	SERVICENAME : STATIONDETAILSEARCH								##
 ##	DESC : 	해당 정류장을 지나는 노선 목록을 제공한다. 						##
 ##																	##
 ##	REQ :	CITYCD, SID												##
 ##	RES :	CITYCD, SEQ, RID, ROUTEID, ROUTEDESC, ROUTENM           ##
 ##        ROUTEBUSNM, STOPID, SID, STOPNM, STOPDESC                ##
 ##		 															##
 #####################################################################
 */

mysqlconfig.g_busquery.STATIONDETAIL =
    " SELECT distinct RVS.citycd, RVS.seq " +
    " , R.rid, R.routeid, R.routedesc, R.routenm, R.routesubnm " +
    " , RVS.sid, S.stopid, S.stopnm, S.arsid, S.stopdesc " +
    " FROM ROUTEVIASTOP RVS " +
    " INNER JOIN ROUTES R " +
    " ON RVS.CITYCD = R.CITYCD AND RVS.RID = R.RID " +
    " INNER JOIN STOPS S " +
    " ON RVS.CITYCD = S.CITYCD AND RVS.SID = S.SID " +
    " WHERE RVS.CITYCD = ? AND RVS.SID = ?";

/**
 *
 * database query setting
 */

module.exports = mysqlconfig;