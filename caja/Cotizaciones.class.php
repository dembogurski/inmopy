<?php

/**
 * Description of Cotizaciones
 * @author Ing.Douglas
 * @date 31/03/2015
 */

require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");

class Cotizaciones {
   
    function __construct() {
        $action = $_REQUEST['action']; 
        if (function_exists($action)) {            
            call_user_func($action);
        } else {            
            $this->main();
        }
    }
    function main() {
         $t = new Y_Template("Cotizaciones.html");
         $usuario = $_POST['usuario'];
         $suc = $_POST['suc'];
         $t->Set("suc",$suc);
         $t->Set("usuario",$usuario);
          
         $desde = $_POST['desde'];
         $hasta = $_POST['hasta'];
          
         /**
          * Si no esta seteada la fecha busca de los ultimos 10 dias
          */
         if(!isset($_POST['desde'])){
            $ten_days_ago =date('Y-m-d', strtotime("-10 days")); 
            $ten_days_agolat =date('d/m/Y', strtotime("-10 days"));
            $today =date('Y-m-d');
            $todaylat =date('d/m/Y');
         }else{
             $ten_days_ago =$_POST['desde']; 
             $ten_days_agolat =substr($desde,8,2).'/'.substr($desde,5,2).'/'.substr($desde,0,4);
             $today =$_POST['hasta'];
             $todaylat =substr($hasta,8,2).'/'.substr($hasta,5,2).'/'.substr($hasta,0,4); 
         }
         $t->Set("desde",$ten_days_agolat);
         $t->Set("hasta",$todaylat);
             
         
         $t->Show("header");
         
         $sql = "SELECT id_cotiz ,m_cod,DATE_FORMAT(fecha,'%d-%m-%Y') AS fechac,compra,venta FROM cotizaciones WHERE suc = '$suc' and fecha between '$ten_days_ago' and '$today'";
         
         
         $db = new My();
         $db->Query($sql);
         $t->Show("cotiz_cab");
         while($db->NextRecord()){
             $id = $db->Record['id_cotiz'];
             $moneda = $db->Record['m_cod'];
             $mon = strtolower( str_replace("$","s",$moneda) );
             $fecha = $db->Record['fechac'];
             $compra = $db->Record['compra'];
             $venta = $db->Record['venta'];
             $t->Set("id",$id);
             $t->Set("mon",$mon);
             $t->Set("fecha",$fecha);
             $t->Set("moneda",$moneda);
             $t->Set("compra",number_format($compra, 2, ',', '.'));   
             $t->Set("venta", number_format($venta, 2, ',', '.'));      
             $t->Show("cotiz_data");
         } 
         
         
         $sm = "SELECT m_cod AS moneda,m_descri AS descrip FROM monedas WHERE m_ref != 'Si'";
         $db->Query($sm);
         
         $monedas = "";
         while($db->NextRecord()){
             $descrip= $db->Record['descrip'];
             $moneda = $db->Record['moneda'];
             $monedas.="<option value='$moneda'>$moneda-$descrip</option>";
         }
         $t->Set("options",$monedas);
         $db->Query("select DATE_FORMAT(current_date(),'%d/%m/%Y') as fecha");
         $db->NextRecord();
         $t->Set("_fecha_",$db->Record['fecha']);
         $t->Show("cotiz_foot");
    }
    
} 
function registrarCotizacion() {
    $suc = $_POST['suc'];
    $compra = $_POST['compra'];
    $venta = $_POST['venta'];
    $moneda = $_POST['moneda'];
    $fecha = $_POST['fecha'];
    $fecha_hoy = date("Y-m-d");
    $hora = "";
    if ($fecha_hoy === $fecha) {
        $hora = "current_time";
    } else {
        $hora = "'00:00:00'";
    }
    $sql = "insert into cotizaciones(suc,m_cod,fecha,hora,compra,venta,ref)values('$suc','$moneda','$fecha',$hora,$compra,$venta,'G$')";
    $my = new My();
    $my->Query($sql);
}
new Cotizaciones();
?>
