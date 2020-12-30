<?php

/**
 * Description of Deudores
 * @author Ing.Douglas
 * @date 13/07/2017
 */    
require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php"); 
 

class Deudores {
    function __construct() {
        $action = $_REQUEST['action'];          
        if (function_exists($action)) {
            call_user_func($action);
        } else {   
            $this->main();
        }        
    }     
    function main(){
        $t = new Y_Template("Deudores.html");
        $t->Show("header");

        $t->Set("user", $_GET['user']);
        $t->Set("time",date('d-m-Y H:i'));
        
        
        $t->Show("head");

       
        $link = new My();
       
        $dia = date("d");
         
        $mess = $arrmeses[date("m")-1];
        $anio = date("Y");
        $fecha = "$dia de $mess del $anio";
        $t->Set("fecha",$fecha);
        $t->Show("cabecera");
        $t->Show("body");

      
        $codigo_cliente = $_REQUEST['codigo_cliente'];
        // echo $codigo_cliente;
        
        $Qry = "SELECT 'FV' as tipo, f.f_nro, cliente,ruc_cli as RUC,f.suc,c.id_cuota AS nro_cuota,DATE_FORMAT(f.fecha_cierre,'%d-%m-%Y') AS fecha_factura,DATE_FORMAT(c.vencimiento,'%d-%m-%Y') AS vencimiento,
        DATE_FORMAT(c.fecha_ult_pago,'%d-%m-%Y') AS fecha_ult_pago, DATEDIFF(CURRENT_DATE,vencimiento) AS dias_atraso, c.monto,(c.monto - c.saldo) AS pagado,f.fact_nro AS folio_num,f.moneda
        FROM factura_venta f INNER JOIN cuotas c ON f.f_nro = c.f_nro AND f.cod_cli LIKE '$codigo_cliente' AND c.estado LIKE 'Pendiente' ORDER BY dias_atraso ASC";
         
        // die();
        $link->Query($Qry);
        $t->Show("data_cab");
        $total = 0;
        while($link->NextRecord()){
            $Tipo =  $link->Record['tipo'];
            $Nombre =  $link->Record['cliente'];
            $RUC =  $link->Record['RUC']; 
            $Ticket = $link->Record['f_nro'];
            $Suc = $link->Record['suc'];
            $NroCuota =  $link->Record['nro_cuota'];
            $FechaFactura =  $link->Record['fecha_factura'];
            $Vencimiento =  $link->Record['vencimiento'];
            $DiasAtraso =  $link->Record['dias_atraso'];
            $TotalCuota =  $link->Record['valor_total'];
            $Pagado =  $link->Record['pagado'];
            $FolioNum =  $link->Record['folio_num'];
            $DocCur =  $link->Record['moneda'];
            $fecha_ult_pago =  $link->Record['fecha_ult_pago'];
            
            if($fecha_ult_pago == $Vencimiento){
                $fecha_ult_pago = "";
            }
           
            $t->Set("Tipo",$Tipo);
            $t->Set("Nombre",$Nombre);
            $t->Set("RUC",$RUC);   
 
            $t->Set("Ticket",number_format($Ticket,0, ',', '.'));
            $t->Set("Suc", $Suc);
            $t->Set("Suc", $Suc);
            $t->Set("NroCuota",$NroCuota);
            $t->Set("fecha",$FechaFactura);
            $t->Set("Vencimiento",$Vencimiento);
            $t->Set("DiasAtraso",$DiasAtraso);
            $t->Set("TotalCuota",number_format($TotalCuota,0, ',', '.'));
            $t->Set("Pagado",number_format($Pagado,0, ',', '.'));
            $t->Set("FolioNum",$FolioNum);
            $t->Set("DocCur",$DocCur);
            $t->Set("fecha_ult_pago",$fecha_ult_pago);
            $t->Set("Status",'Pendiente');

            $t->Show("data");
        }

        $t->Show("data_foot");
    }
}
 
new Deudores();
?>
