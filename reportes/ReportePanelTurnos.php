<?php

require_once("../utils/tbs_class.php");

// PANELES DE TURNOS
$sucs = array(
	'01'=>'192.168.6.6',
	'02'=>'192.168.7.170',
	'06'=>'192.168.5.50'
);
$suc = $_GET['selected_suc'];
$sucIP = $sucs[$suc];

$usuario = $_GET['user'];
$r_desde = $_GET['desde'];
$r_hasta = $_GET['hasta'];
$desde = flipDate($_GET['desde'],'/');
$hasta = flipDate($_GET['hasta'],'/');
$hasta5 = 0;
$entre5y10 = 0;
$entre10y15 = 0;
$mayora15 = 0;

$reporte = file_get_contents("http://$sucIP/get_data.php?action=getlogs&desde=$desde&hasta=$hasta");

$a=json_decode($reporte, true);
$tbs = new clsTinyButStrong;
$tbs->LoadTemplate('ReportePanelTurnos.html');
$tbs->MergeBlock('data','array',$a);

$moda = file_get_contents("http://$sucIP/get_data.php?action=getModa&desde=$desde&hasta=$hasta");
$modaA = json_decode($moda, true);
$modaAC = $modaA[0]['diff_ant'];
$tbs->MergeBlock('moda','array',$modaA);

foreach($a as $row){
   switch(true){
      case(intval($row['delay']) < 6):
      $hasta5++;
      break;
      case(intval($row['delay']) < 11 && intval($row['delay']) > 5):
      $entre5y10++;
      break;
      case(intval($row['delay']) < 16 && intval($row['delay']) > 9):
      $entre10y15++;
      break;
      case( intval($row['delay']) > 15):
      $mayora15++;
      break;

   }
}
$tbs->Show();
function flipDate($date,$separator){
   $date = explode($separator,$date);
   return $date[2].'-'.$date[1].'-'.$date[0];
}
?>