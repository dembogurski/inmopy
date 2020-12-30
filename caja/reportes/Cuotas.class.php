<?php

/**
 * Description of Cuotas
 * @author Ing.Douglas
 * @date 17/06/2015
 */
require_once("../../Y_Template.class.php");
require_once("../../Y_DB_MySQL.class.php"); 
require_once("../../Functions.class.php");

class Cuotas {
    function __construct() {
        date_default_timezone_set('America/Asuncion');
        $t = new Y_Template("Cuotas.html");
        $t->Show("header");

        $desde = $_REQUEST['desde'];
        $hasta = $_REQUEST['hasta'];
        $moneda = $_REQUEST['moneda'];
        $suc = $_REQUEST['suc'];

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
        $sql = "SELECT c.f_nro AS factura,id_cuota AS nro,DATE_FORMAT(c.fecha,'%d-%m-%Y') AS fecha,c.suc AS suc,ruc_cli,
        cliente,c.moneda,monto,c.cotiz,monto_ref,saldo,ret_iva,DATE_FORMAT(vencimiento,'%d-%m-%Y') AS venc,c.estado
        FROM cuotas c, factura_venta f WHERE c.f_nro = f.f_nro AND f.estado = 'Cerrada' AND  c.suc = '$suc' AND  c.fecha  BETWEEN '$desde' AND '$hasta'";
        $my->Query($sql);
        
        $TOTAL_MONTO = 0;
        $TOTAL_REF = 0;
        $TOTAL_VALOR = 0;
        
        while($my->NextRecord()){
            $nro = $my->Record['nro'];
            $factura = $my->Record['factura']; 
            $fecha = $my->Record['fecha'];
            $suc = $my->Record['suc'];
            $ruc_cli = $my->Record['ruc_cli'];
            $cliente = $my->Record['cliente'];
            $moneda = $my->Record['moneda'];            
            $monto = $my->Record['monto'];            
            $cotiz = $my->Record['cotiz'];            
            $monto_ref = $my->Record['monto_ref'];
            $ret_iva = $my->Record['ret_iva'];  
            $venc = $my->Record['venc'];
            $estado = $my->Record['estado'];
            
            $TOTAL_MONTO  += 0 + $monto;
            $TOTAL_REF += 0 + $monto_ref;
            $TOTAL_VALOR += 0 + $valor_total;
            
            $t->Set("nro",$nro);
            $t->Set("factura",$factura);
            $t->Set("fecha",$fecha);    
            $t->Set("ruc_cli",$ruc_cli); 
            $t->Set("cliente",$cliente); 
            $t->Set("suc",$suc);
            $t->Set("moneda",$moneda);
            $t->Set("monto",number_format($monto,2,',','.')); 
            $t->Set("monto_ref",number_format($monto_ref,2,',','.')); 
            $t->Set("cotiz",number_format($cotiz,2,',','.')); 
            $t->Set("ret_iva",number_format($ret_iva,2,',','.'));             
            $t->Set("venc",$venc);
            $t->Set("estado",$estado);
            $t->Show("data");
        }

        $t->Set("total_monto",number_format($TOTAL_MONTO,2,',','.'));
        $t->Set("total_ref",  number_format($TOTAL_REF,2,',','.'));
        $t->Set("total_valor",number_format($TOTAL_VALOR,2,',','.'));
        $t->Show("foot");
    }

}

new Cuotas();
?>
