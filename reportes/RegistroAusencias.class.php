<?php

/**
 * Description of RegistroAusencias
 * @author Ing.Douglas
 * @date 29/10/2018
 */
require_once("../Y_DB_MySQL.class.php");
require_once("../Y_Template.class.php");
require_once("../Functions.class.php");

class RegistroAusencias {
   function __construct() {
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }

    function main() {
        $t = new Y_Template("RegistroAusencias.html");    
        
        $t->Show("header"); 
         
        $f = new Functions();
        $desde = $_REQUEST['desde'];
        $hasta = $_REQUEST['hasta'];
        $user = $_REQUEST['usuario'];
        $suc = $_REQUEST['suc'];
        
        $t->Set("desde", $desde);
        $t->Set("hasta", $hasta);
        $t->Set("user",$user);
        $t->Set("suc",$suc);
        $t->Set("time",date("d-m-Y H:i"));
        
        $t->Show("head");
        
        $desde = $f->invertirFechaLat($desde);
        $hasta = $f->invertirFechaLat($hasta);
         
        
        $my = new My();
        $sql = "SELECT  id_aus, jefe, CONCAT(apellido,', ',nombre) AS usuario,DATE_FORMAT(fecha_reg,'%d-%m-%Y') AS fecha_reg ,DATE_FORMAT(fecha_desde,'%d-%m-%Y %H:%i') AS fecha_desde, DATE_FORMAT(fecha_hasta,'%d-%m-%Y %H:%i') AS fecha_hasta, DATE_FORMAT(fecha_retorno,'%d-%m-%Y %H:%i') AS fecha_retorno,
                motivo, tipo_lic, tipo_perm, valor_descuento, horas, r.suc  
        FROM    registro_ausencias r, usuarios u WHERE r.usuario = u.usuario AND fecha_reg BETWEEN '$desde' AND '$hasta' AND r.suc like '$suc' order by suc asc,fecha_reg asc"; 
        
        $my->Query($sql);
        
        while ($my->NextRecord()) {
           $array = $my->Record ;
           foreach ($array as $key => $value) {
              if($key == 'valor_descuento'){
                  $t->Set($key,number_format($value,0,',','.')); 
              }else{
                  $t->Set($key, $value ); 
              }
              
           }
           $t->Show("data");     
        } 
    }
}
new RegistroAusencias();
?>
