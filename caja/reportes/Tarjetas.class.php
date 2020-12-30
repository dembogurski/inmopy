<?php

/**
 * Description of Tarjetas
 * @author Ing.Douglas
 * @date 16/06/2015
 */
require_once("../../Y_Template.class.php");
require_once("../../Y_DB_MySQL.class.php"); 
require_once("../../Functions.class.php");

class Tarjetas {
    function __construct() {
        $t = new Y_Template("Tarjetas.html");
        $t->Show("header");
        date_default_timezone_set('America/Asuncion');

        $desde = $_REQUEST['desde'];
        $hasta = $_REQUEST['hasta'];
        $moneda = $_REQUEST['moneda'];
        $suc = $_REQUEST['suc'];
        $tipo = $_REQUEST['tipo'];
        $convenios = $this->getConvenios($tipo);

        $hoy = date("d/m/Y");

        $t->Set('time', date("m-d-Y h:i"));
        $t->Set('user', $_REQUEST['usuario']);
        $t->Set('papar_size', $_REQUEST['papar_size']);
        
        $fn = new Functions();
        $t->Set('desde', $fn->invertirFecha($desde));
        $t->Set('hasta', $fn->invertirFecha($hasta));
        $t->Set('suc',$suc);
         
        $t->Show("head");

        //$user = $_REQUEST['user'];
        // Sucursales
        $my = new My();
        $sql = "SELECT descrip,f_nro AS Factura,nro_reserva AS Reserva,DATE_FORMAT(fecha,'%d-%m-%Y') AS Fecha,hora,
        nombre,voucher,monto, DATE_FORMAT(fecha_acred,'%d-%m-%Y') AS FechaAcred,suc,estado,e_sap
        FROM convenios e, conceptos c  WHERE c.id_concepto = e.id_concepto AND cod_conv in ($convenios) AND suc = '$suc' AND fecha BETWEEN '$desde' AND '$hasta'";
        $my->Query($sql);
        
        $TOTAL = 0;
         
        
        while($my->NextRecord()){
            $descrip = $my->Record['descrip'];
            $factura = $my->Record['Factura'];
            $reserva = $my->Record['Reserva'];
            $fecha = $my->Record['Fecha'];
            $hora = $my->Record['hora'];
            $nombre = $my->Record['nombre'];
            $voucher = $my->Record['voucher']; 
            $monto = $my->Record['monto'];
            $fechaAcred = $my->Record['FechaAcred'];
            $suc = $my->Record['suc'];   
            $estado = $my->Record['estado'];   
            
            $TOTAL  += 0 + $monto;
            
            
            $t->Set("descrip",$descrip);
            $t->Set("factura",$factura);
            $t->Set("reserva",$reserva);
            $t->Set("fecha",$fecha);
            $t->Set("hora",$hora);
            $t->Set("nombre",$nombre);
            $t->Set("voucher",$voucher); 
            $t->Set("monto",number_format($monto,2,',','.')); 
            $t->Set("fecha_acred",$fechaAcred); 
            $t->Set("suc",$suc); 
            $t->Set("estado",$estado); 
            $t->Show("data");
        }

        $t->Set("t_monto",number_format($TOTAL ,2,',','.'));
         
        $t->Show("foot");
    }
    function getConvenios($tipo){
        $db = new My();
        $convenios = array();
        $db->Query(" SELECT  cod_tarjeta AS CreditCard FROM tarjetas  WHERE tipo like '$tipo' ORDER BY nombre asc");
        while($db->NextRecord()){
            array_push($convenios, $db->Record['CreditCard']);
        }
        return implode(',',$convenios);
    }
}

new Tarjetas();
?>