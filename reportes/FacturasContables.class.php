<?PHP
require_once("../Y_DB_MySQL.class.php");
require_once("../utils/tbs_class.php");

$link = New My();
$link->Connect();
$desde = isset($_GET['desde'])?flipDate($_GET['desde'],'/'):false;
$hasta = isset($_GET['hasta'])?flipDate($_GET['hasta'],'/'):false;
$suc = $_GET['select_suc'];
$usuario = $_GET['user'];
$downloadURL = "$_SERVER[REQUEST_URI]&descargarXML";

$sql_ok = ( isset($link->Link_ID)) ? 1 : 0;
if ($sql_ok==0 || $desde==='01-01-1970' || $hasta==='01-01-1970') $link->Link_ID = 'clear';

$TBS = new clsTinyButStrong;
$query = "SELECT v.suc,v.fact_nro,f_nro,v.fecha_cierre,v.total,v.ruc_cli,v.cliente,v.tipo_fact,v.tipo_doc,c.tipo FROM factura_venta v INNER JOIN factura_cont c ON v.fact_nro=c.fact_nro AND v.suc=c.suc AND v.tipo_fact = c.tipo_fact WHERE v.suc='$suc' AND v.fecha_cierre between '$desde' AND '$hasta' AND v.estado='Cerrada' AND c.estado='Cerrada' GROUP BY v.suc,v.fact_nro,f_nro,v.fecha_cierre,v.total,v.ruc_cli,v.cliente,v.tipo_fact,v.tipo_doc,c.tipo ORDER BY v.fact_nro,v.tipo_fact,v.tipo_doc";

// echo $query;

if(isset($_GET['descargarXML'])){   
   include('../utils/plugins/tbs_plugin_opentbs.php');   
   $TBS->Plugin(TBS_INSTALL, OPENTBS_PLUGIN);
   $TBS->LoadTemplate('FacturasContables.xlsx', OPENTBS_ALREADY_UTF8); 
   $TBS->MergeBlock('data',$link->Link_ID,$query); 
   $file_name = "facturas-$suc-$desde"."_"."$hasta";
   $TBS->Show(OPENTBS_DOWNLOAD, $file_name);
}else{
   $TBS->LoadTemplate('FacturasContables.html');
   $TBS->MergeBlock('data',$link->Link_ID,$query);
   $TBS->Show();
}


function flipDate($date,$separator){
   $date = explode($separator,$date);
   return $date[2].$separator.$date[1].$separator.$date[0];
}     

?>