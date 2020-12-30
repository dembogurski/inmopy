<?php

/**
 * Description of Cheques
 * @author Ing.Douglas
 * @date 17/06/2015
 */
require_once("../../Y_Template.class.php");
require_once("../../Y_DB_MySQL.class.php"); 
require_once("../../Functions.class.php");

class Cheques {
    function __construct() {
        date_default_timezone_set('America/Asuncion');
        $t = new Y_Template("Cheques.html");
        $t->Show("header");

        $desde = $_REQUEST['desde'];
        $hasta = $_REQUEST['hasta'];
        $moneda = $_REQUEST['moneda'];
        $suc = $_REQUEST['suc'];
        
        $tipo_cheq = $_REQUEST['tipo_cheq'];

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
        $sql = "SELECT nro_cheque, nombre AS banco,cuenta,f_nro AS ticket,(SELECT fact_nro FROM factura_venta f WHERE f.f_nro = t.f_nro)  AS fact_legal, DATE_FORMAT(fecha_ins,'%d-%m-%Y') AS fecha_ins,DATE_FORMAT(fecha_emis,'%d-%m-%Y') AS fecha_emis,
        DATE_FORMAT(fecha_pago,'%d-%m-%Y') AS fecha_pago,benef,suc,valor,m_cod AS moneda,cotiz,valor_ref,estado,tipo,e_sap
        FROM cheques_ter t, bancos b WHERE t.id_banco = b.id_banco AND suc = '$suc' AND  fecha_ins BETWEEN '$desde' AND '$hasta' and tipo like '$tipo_cheq'";
        $my->Query($sql);
        
        $TOTAL = 0;
        $TOTAL_REF = 0;
         
        
        while($my->NextRecord()){
            $nro_cheque = $my->Record['nro_cheque'];
            $banco = $my->Record['banco'];
            $cuenta = $my->Record['cuenta'];
            $ticket = $my->Record['ticket'];
            $fact_legal= $my->Record['fact_legal'];
            $fecha_ins = $my->Record['fecha_ins'];
            $fecha_emis = $my->Record['fecha_emis'];
            $fecha_pago = $my->Record['fecha_pago']; 
            $benef = $my->Record['benef'];
            $valor = $my->Record['valor'];
            $moneda = $my->Record['moneda'];
            $cotiz = $my->Record['cotiz']; 
            $valor_ref = $my->Record['valor_ref'];
            $suc = $my->Record['suc'];   
            $estado = $my->Record['estado']; 
            $tipo = $my->Record['tipo'];   
            
            $TOTAL  += 0 + $valor;
            $TOTAL_REF  += 0 + $valor_ref;
            
            
            $t->Set("nro",$nro_cheque);
            $t->Set("banco",$banco);
            $t->Set("factura",$ticket."/".$fact_legal);            
            $t->Set("cuenta",$cuenta);
            $t->Set("fecha_ins",$fecha_ins);
            $t->Set("fecha_emis",$fecha_emis);
            $t->Set("fecha_pago",$fecha_pago); 
            $t->Set("valor",number_format($valor,2,',','.')); 
            $t->Set("valor_ref",number_format($valor_ref,2,',','.')); 
            $t->Set("cotiz",$cotiz); 
            $t->Set("moneda",$moneda); 
            $t->Set("benef",$benef); 
            $t->Set("suc",$suc); 
            $t->Set("tipo",$tipo); 
            $t->Set("estado",$estado); 
            $t->Show("data");
        }

        $t->Set("t_monto",number_format($TOTAL ,2,',','.'));
        $t->Set("t_monto_ref",number_format($TOTAL_REF ,2,',','.'));
         
        $t->Show("foot");
    }

}

new Cheques();
?>