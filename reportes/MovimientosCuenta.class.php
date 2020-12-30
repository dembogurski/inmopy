<?PHP
require_once("../Y_DB_MySQL.class.php");
require_once("../utils/tbs_class.php");

$link = New My();
$link->Connect();
$desde = isset($_GET['desde'])?flipDate($_GET['desde'],'/'):false;
$hasta = isset($_GET['hasta'])?flipDate($_GET['hasta'],'/'):false;
$id_banco = $_GET['id_banco'];
$cuenta = $_GET['cuentas']==='*'?'%':$_GET['cuentas'];
$usuario = $_GET['user'];
$suc = $_GET['select_suc'];
$banco = getBanco($id_banco);


$sql_ok = ( isset($link->Link_ID)) ? 1 : 0;
if ($sql_ok==0 || $desde==='01-01-1970' || $hasta==='01-01-1970') $link->Link_ID = 'clear';

$TBS = new clsTinyButStrong;
$TBS->LoadTemplate('MovimientosCuenta.html');    

$query = "SELECT b.fecha,b.hora,b.cuenta,b.nro_deposito, b.suc, e.fecha AS fecha_recaudacion, c.descrip AS concepto, b.entrada,b.salida FROM bcos_ctas_mov b  INNER JOIN conceptos c USING(id_concepto) 
LEFT JOIN efectivo e ON b.nro_deposito  = e.nro_deposito AND e.salida = b.entrada
WHERE b.id_banco='$id_banco' AND b.cuenta LIKE '$cuenta' AND b.fecha BETWEEN '$desde' AND '$hasta' AND b.suc like '$suc' ORDER BY DATE(b.fecha) ASC,b.nro_deposito ASC, b.cuenta ASC";
//$query = "SELECT b.fecha,b.cuenta,b.nro_deposito, b.suc, e.fecha as fecha_recaudacion, b.entrada,b.salida FROM bcos_ctas_mov b INNER JOIN efectivo e using(nro_deposito) WHERE b.id_banco='$id_banco' AND b.cuenta like '$cuenta' AND b.fecha between '$desde' AND '$hasta' and b.suc like '$suc' ORDER BY DATE(b.fecha) ASC,b.nro_deposito ASC, b.cuenta ASC";

$TBS->MergeBlock('data',$link->Link_ID,$query);

$TBS->Show();

function getBanco($id_banco){
   $link = New My();
   $link->Query("SELECT nombre from bancos WHERE id_banco='$id_banco'");
   $link->NextRecord();
   return $link->Record['nombre'];
}
function flipDate($date,$separator){
   $date = explode($separator,$date);
   return $date[2].'-'.$date[1].'-'.$date[0];
}     

?>