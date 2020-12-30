<?PHP
require_once("../Y_DB_MySQL.class.php");
require_once("../utils//tbs_class.php");

$link0 = New My();
$link1 = New My();
$datos = array();
$desde = isset($_GET['desde'])?flipDate($_GET['desde'],'/'):false;
$hasta = isset($_GET['hasta'])?flipDate($_GET['hasta'],'/'):false;
$usuario = $_GET['user'];
$suc = $_GET['select_suc'];


$sql_ok = true;

$TBS = new clsTinyButStrong;
$TBS->LoadTemplate('notas_credito.html');

$query = "SELECT n_nro,n.usuario,n.f_nro,n.vendedor,concat(u.nombre,' ',u.apellido) as nombre,f_nro,fecha,vendedor,total from nota_credito n inner join usuarios u on n.vendedor=u.usuario WHERE n.suc = '$suc' AND date(n.fecha_creacion) BETWEEN '$desde' AND '$hasta' AND n.estado='Cerrada'";

$link0->Query($query);

while($link0->NextRecord()){
   $n_nro = $link0->Record['n_nro'];
   $fila = $link0->Record;
   $fila['detalle'] = array();
   $link1->Query("SELECT d.codigo,d.lote,d.um_prod,d.descrip,d.cantidad as cant_nt,df.cantidad as cant_vnt FROM nota_credito n inner join nota_credito_det d using(n_nro) inner join fact_vent_det df on n.f_nro=df.f_nro and d.lote=df.lote inner join factura_venta f on df.f_nro=f.f_nro WHERE n_nro=$n_nro");
   while($link1->NextRecord()){
      array_push($fila['detalle'],$link1->Record);
   }
   array_push($datos,$fila);
}
//print_r($reporte);

$TBS->MergeBlock('data',$datos);
$TBS->Show();


function flipDate($date,$separator){
   $date = explode($separator,$date);
   return $date[2].'-'.$date[1].'-'.$date[0];
}
?>