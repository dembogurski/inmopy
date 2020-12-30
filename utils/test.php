<?php

require_once '../Y_DB_MySQL.class.php';
require_once 'Excel.class.php';

$db =new My();

$master = array();
 
$db->Query("SELECT suc, nombre, direccion, tel, mail, web, ciudad, departamento, pais, tipo, estab_cont, estado FROM inmopy.sucursales ");
while($db->NextRecord()){
    $array = $db->Record;
    array_push($master, $array); 
}
 
 
$date = date("d-m-Y_H_i");
 
$file = "../reportes/startsoft/$date.xlsx";

$excel = new Excel();
$excel->createExcel($master, $headers  = array("Suc","Usuario"), "Test.xlsx");


?>