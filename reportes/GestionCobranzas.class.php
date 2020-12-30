<?php

/**
 * Description of GestionCobranzas
 * @author Ing.Douglas
 * @date 12/08/2017
 */
require_once("../Y_DB_MySQL.class.php");
require_once("../Y_Template.class.php");
require_once("../Functions.class.php");

class GestionCobranzas {

    function __construct() {
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }

    function main() {
        $TASA_INTERES_PUNITORIA = 27.6;
        $t = new Y_Template("GestionCobranzas.html");


        $desde = $_REQUEST['desde'];
        $hasta = $_REQUEST['hasta'];
        $moneda = $_REQUEST['moneda'];
        $CardCode = $_REQUEST['cliente'];
        $suc = $_REQUEST['select_suc'];
        $tipo = $_REQUEST['tipo'];
        $vendedor = $_REQUEST['usuario'];
                 
        
        if(strlen($desde) == 0){   
            $desde = "01/01/2010";
        }
        if(strlen($hasta) == 0){
            $hasta = "31/12/2030";
        }
        

        $t->Set("suc", $suc);
        $t->Set("desde", $desde);
        $t->Set("hasta", $hasta);
        $t->Set("vendedor", $vendedor);
        $t->Set("tipo", $tipo);

        $t->Show("header");
        $dias_calculo_interes_a_futuro = 0; // Por si las dudas quieren calcular a futuro los intereses 


        $campo_fecha = $_REQUEST['campo_fecha'];
        $usuario = $_REQUEST['user'];

        $hoy = date("d/m/Y");

        $t->Set('time', date("d-m-Y h:i"));
        $t->Set('user', $usuario);
 
        $cuotas = $this->getCuentas($CardCode, $suc, $desde, $hasta, $tipo, $vendedor, $dias_calculo_interes_a_futuro);
         
        $t->Show("head");

        $oldCardName = "";
        $TotalSaldoGeneral = 0;
        $TotalSaldoCliente = 0;
        $TotalInteresesCliente = 0;
        $TotalPagadoCliente = 0;
        
        $old_cli = "";
        //SELECT f.cod_cli,cliente, cli.tel  ,f.suc ,f.f_nro AS factura,f.fact_nro AS FolioNum, c.id_cuota,  fecha_factura, DATE_FORMAT(vencimiento,'%d-%m-%Y') AS vencimiento ,  fecha_ult_pago AS DiasAtraso,monto,c.moneda,monto_ref,saldo,monto - saldo AS pagado,c.cotiz
        foreach ($cuotas as $key => $arr) {
            $CardName = $arr['cliente'];
            $U_suc = $arr['suc'];
            $factura = $arr['factura'];
            $FolioNum = $arr['FolioNum'];
            
            $InstlmntID = $arr['id_cuota'];
            $DocDate = $arr['fecha_factura'];
            $DueDate = $arr['vencimiento'];
            $fecha_ult_pago = $arr['fecha_ult_pago'];
            $DiasAtraso = $arr['DiasAtraso'];
            $InsTotal = $arr['monto'];
             
            $Exonerada = $arr['Exonerada'];
            $pagado = $arr['Paid'];
            $U_vendedor = $arr['U_vendedor'];
            $Phone = $arr['Phone1'];
            $interes = 0;
            $saldo = 0;

            $saldo = $InsTotal - $pagado;
            if ($DiasAtraso > 0 && $Exonerada == "0") {
                $interes = ($saldo * $DiasAtraso * ($TASA_INTERES_PUNITORIA / 100) ) / 365;
            }
            $saldo += $interes;
            
            
            if ($oldCardName != $CardName && $oldCardName != "") {   
                $t->Set("t_intereses", number_format($TotalInteresesCliente, 0, ',', '.'));
                $t->Set("t_saldo", number_format($TotalSaldoCliente, 0, ',', '.'));
                $t->Set("t_pagado", number_format($TotalPagadoCliente, 0, ',', '.'));
                
                $t->Show("vacio");
                $TotalSaldoCliente = 0;
                $TotalInteresesCliente=0;
            }
            $TotalSaldoCliente += 0 + $saldo;
            $TotalInteresesCliente  +=0+ $interes;
            $TotalPagadoCliente  +=0+ $pagado;
            
            $TotalSaldoGeneral+= 0 + $saldo;
            
            $oldCardName = $CardName;



            if ($DiasAtraso > 0) {
                $t->Set("mora", "vencida");
            } else {
                $t->Set("mora", "");
            }
            if($old_cli != $CardName){
                $t->Set("identif_cli", "identif_cli"); 
            }else{
                $t->Set("identif_cli", ""); 
            }
                
            $t->Set("cliente", $CardName);
            $t->Set("phone", $Phone);
            $t->Set("factura", $factura);
            $t->Set("FolioNum", $FolioNum);
            $t->Set("cuota", $InstlmntID);
            $t->Set("suc", $U_suc);
            $t->Set("vendedor", $U_vendedor); 
            $t->Set("fecha", $DocDate);
            $t->Set("fecha_venc", $DueDate);
            $t->Set("dias_mora", $DiasAtraso);
            $t->Set("total_cuota", number_format($InsTotal, 0, ',', '.'));
            $t->Set("interes", number_format($interes, 0, ',', '.'));
            $t->Set("pagado", number_format($pagado, 0, ',', '.'));
            $t->Set("saldo", number_format($saldo, 0, ',', '.'));    
            $old_cli = $CardName;
            $t->Show("data");
        }
        $t->Set("t_intereses", number_format($TotalInteresesCliente, 0, ',', '.'));
                $t->Set("t_saldo", number_format($TotalSaldoCliente, 0, ',', '.'));
                $t->Set("t_pagado", number_format($TotalPagadoCliente, 0, ',', '.'));
        $t->Show("vacio");
        $t->Set("t_saldo_total", number_format($TotalSaldoGeneral, 0, ',', '.'));
        
        
        $t->Show("foot");
        
        $t->Show("historial");
    }

   

    function getCuentas($CardCode, $suc, $desde, $hasta, $tipo, $vendedor, $dias_calculo_interes_a_futuro) {
        $f = new Functions();
        
        $date0 = DateTime::createFromFormat('d/m/Y',  $desde); 
        $desde =  $date0->format('Y-m-d');
        $date1 = DateTime::createFromFormat('d/m/Y',  $hasta); 
        $hasta =  $date1->format('Y-m-d');

        $codigo_vigente = "";
        if ($tipo == "Vencido") {
            $codigo_vigente = " and (DATEDIFF(CURRENT_DATE,vencimiento) + $dias_calculo_interes_a_futuro) > 0 ";
        } else if ($tipo == "Regular") {
            $codigo_vigente = " and (DATEDIFF(CURRENT_DATE,vencimiento) + $dias_calculo_interes_a_futuro) <= 0 ";
        } else {
            $codigo_vigente = "";
        }
 

        $sql = "SELECT f.cod_cli,cliente, cli.tel  ,f.suc ,f.f_nro AS factura,f.fact_nro AS FolioNum, c.id_cuota,DATE_FORMAT(IF(f.fecha_cierre IS NULL,f.fecha,fecha_cierre),'%d-%m-%Y') AS fecha_factura, DATE_FORMAT(vencimiento,'%d-%m-%Y') AS vencimiento ,DATE_FORMAT(fecha_ult_pago,'%d-%m-%Y') as fecha_ult_pago,DATEDIFF(  CURRENT_DATE,fecha_ult_pago ) + 0 AS DiasAtraso,monto,c.moneda,monto_ref,saldo,monto - saldo AS pagado,c.cotiz  
        FROM factura_venta f, cuotas c, clientes cli WHERE f.f_nro = c.f_nro  and f.cod_cli = cli.cod_cli  AND c.estado ='Pendiente' AND f.cod_cli like '$CardCode' AND f.estado = 'Cerrada' and f.suc = '$suc'
        and vencimiento between '$desde' and '$hasta' $codigo_vigente "; // Solo Credito
          
         //echo $sql;
        
        $cuotas = $f->getResultArray($sql);
        
        //print_r($cuotas);

        $my = new My();

        for ($i = 0; $i < sizeof($cuotas); $i++) {
            $factura = $cuotas[$i]['factura'];
            $cuota = $cuotas[$i]['id_cuota'];

            
           // var_dump($cuotas[$i]);
           // echo "<br>---------------<br>";
            
            // Buscar pagos pendientes de control

            $pend = "SELECT count(*) as PagosPendientes from pagos_recibidos p, pago_rec_det d where   p.id_pago = d.id_pago and d.factura = $factura and id_cuota = $cuota and p.control_caja = 'No'";
            
            $my->Query($pend);
            if ($my->NumRows() > 0) {
                $my->NextRecord();
                $pendientes = $my->Record['PagosPendientes'];
                $cuotas[$i]['PagosPendientes'] = $pendientes;
            } else {
                $cuotas[$i]['PagosPendientes'] = 0;
            }


            $my->Query("SELECT COUNT(*) AS Cant FROM exoneraciones WHERE DocNum = $factura AND InstallmentID = $cuota");
            $my->NextRecord();
            $cant = $my->Record['Cant'];
            if ($cant > 0) {
                $cuotas[$i]['Exonerada'] = "1";
            } else {
                $cuotas[$i]['Exonerada'] = "0";
            }
            
            // Si tiene un Pago mas Reciente ese deber� ser el Ultimo Pago
  
        }
  
        return $cuotas;
    }
  
}
 function getHistorial() {
    $factura = $_REQUEST['factura'];
    $cuota = $_REQUEST['cuota'];
    $sql = "SELECT id_hist,sap_doc,id_cuota,usuario,DATE_FORMAT(fecha ,'%d/%m/%y %h:%i') AS fecha,tipo_com,notas,estado FROM historial_seg WHERE f_nro = $factura AND id_cuota = $cuota ORDER BY id_hist ASC";
    $db = new My();
    $array = array();
    $db->Query($sql);
    while ($db->NextRecord()) {
        array_push($array, $db->Record);
    }
    $db->Close();
    echo json_encode($array);
}
 function getHistorialNumber(){
    $factura = $_REQUEST['factura'];
    $cuota = $_REQUEST['cuota'];
    $sql = "SELECT  count(*) as cant FROM historial_seg WHERE f_nro = $factura AND id_cuota = $cuota ORDER BY id_hist ASC";
    $db = new My();        
    $db->Query($sql);
    $db->NextRecord();
    $cant = $db->Record['cant'];
    echo $cant;    
 } 
 function guardarSeguimiento(){
     $factura = $_REQUEST['factura'];
     $cuota = $_REQUEST['cuota'];
     $tipo = $_REQUEST['tipo'];
     $usuario = $_REQUEST['usuario'];
     $nota = $_REQUEST['nota'];
     
     $db = new My();
     $sql = "INSERT INTO  historial_seg(f_nro, id_cuota, usuario, fecha, tipo_com, notas, estado)
     VALUES ($factura ,$cuota, '$usuario', CURRENT_TIMESTAMP, '$tipo', '$nota', 'Abierto');";    
     $db->Query($sql);
     echo "Ok";
 }
new GestionCobranzas();
?>