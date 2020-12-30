<?php

/**
 * Description of Extractos
 * @author Ing.Douglas
 * @date 09/02/2017
 */
require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");


class Extractos {

    function __construct() {
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }

    function main() {
        $t = new Y_Template("Extractos.html");
        $t->Show("header");


        $hoy = date("d-m-Y");
        $t->Set("hoy", $hoy);
        $t->Show("body");
    }

}

function verExtracto() {
    $usuario = $_GET['usuario'];
    $CardCode = $_GET['CardCode'];
    $Cliente = $_GET['cliente'];
    $ruc = $_GET['ruc_cliente'];
    $desde = $_GET['desde'];
    $hasta = $_GET['hasta'];
    $status = $_GET['estado'];
    $order = $_GET['order'];
    $vista_cliente = $_GET['vista_cliente'];

    $desde_unformat = DateTime::createFromFormat('d-m-Y', $desde);
    $desde_eng = $desde_unformat->format('Y-m-d');

    $hasta_unformat = DateTime::createFromFormat('d-m-Y', $hasta);
    $hasta_eng = $hasta_unformat->format('Y-m-d');


    $db = new My();
    $det = new My();
    $rec = new My();
    $sub = new My();

    $sql = "SELECT 'FV' AS Tipo, f.f_nro AS TicketInterno,c.id_cuota,f.fact_nro AS Factura, f.suc,DATE_FORMAT(c.vencimiento,'%d/%m/%Y') AS vencimiento,DATE_FORMAT(f.fecha_cierre,'%d/%m/%Y') AS fecha_fac,DATEDIFF(CURRENT_DATE,c.vencimiento) AS DiasAtraso,
    c.monto,c.moneda, c.cotiz,c.monto_ref,c.saldo,c.estado
    FROM factura_venta f, cuotas c WHERE f.f_nro = c.f_nro AND f.cod_cli = '$CardCode' AND c.estado LIKE '$status' AND c.vencimiento BETWEEN '$desde_eng' AND '$hasta_eng'";

    //echo $sql;
    $db->Query($sql);

    $t = new Y_Template("Extractos.html");
    //$t->Show("header");
    $t->Set("tipo_vista", "vista_normal");
    if ($vista_cliente == "true") {
        $t->Set("tipo_vista", "vista_cliente");
    }


    $t->Set("cliente", $Cliente);
    $t->Set("ruc", $ruc);
    $t->Set("desde", $desde);
    $t->Set("hasta", $hasta);


    $t->Set("usuario", $usuario);

    $ahora = date("d-m-Y H:i");
    $t->Set("hora", $ahora);

    $t->Show("extracto_cab");

    $TOTAL_CUOTAS = 0;
    $TOTAL_PAGADO = 0;
    $TOTAL_PAGADO_DET = 0;
    $TOTAL_SUM_APPL_DET = 0;


    $filas = $db->NumRows();

    //echo "Filas $filas<br>";


    while ($db->NextRecord()) {
        //$Tipo = $db->Record['Tipo']; 

        $TicketInterno = $db->Record['TicketInterno'];
        $Cuota = $db->Record['id_cuota'];
        $Fecha_Fac = $db->Record['fecha_fac'];
        $Vencimiento = $db->Record['vencimiento'];
        $DiasAtraso = $db->Record['DiasAtraso'];
        $Moneda = $db->Record['moneda'];
        $Monto = $db->Record['monto'];
        $Saldo = $db->Record['saldo'];
        $Estado = $db->Record['estado'];


        $Pagado = $Monto - $Saldo;

        $Factura = $db->Record['Factura'];
        $estado = $db->Record['estado'];
        $suc = $db->Record['suc'];
        if ($Estado == "Cancelada") {
            $DiasAtraso = 0;
        }
        if ($DiasAtraso > 0) {
            $t->Set("atrasado", "atrasado");
        } else {
            $t->Set("atrasado", "");
        }

        $TOTAL_CUOTAS += 0 + $Monto;
        $TOTAL_PAGADO += 0 + $Pagado;

        $t->Set("DocEntry", $TicketInterno);
        $t->Set("U_SUC", $suc);
        $t->Set("InstlmntID", $Cuota);
        $t->Set("FolioNum", $Factura);
        $t->Set("DocDate", $Fecha_Fac);
        $t->Set("DueDate", $Vencimiento);
        $t->Set("DiasAtraso", $DiasAtraso);
        $t->Set("DocCur", $Moneda);
        $t->Set("InsTotal", number_format($Monto, 0, ',', '.'));
        $t->Set("Paid", number_format($Pagado, 0, ',', '.'));
        $t->Set("Saldo", number_format($Saldo, 0, ',', '.'));
        $t->Set("Estado", $Estado);

        // Detalle de Pagos
        $TOTAL_SUM_APPL_DET = 0;
        $det->Query("SELECT p.id_pago,p.suc, DATE_FORMAT(p.fecha,'%d-%m-%Y') AS fecha,p.folio_num AS recibo, SUM(entrada-salida)  AS efectivo,  SUM(monto) AS tarjetas, SUM(t.valor) AS cheques,entrega_actual
        FROM pagos_recibidos p INNER JOIN pago_rec_det d ON p.id_pago = d.id_pago AND d.factura = $TicketInterno AND d.id_cuota = $Cuota 
        LEFT JOIN efectivo e ON e.trans_num = p.id_pago 
        LEFT JOIN convenios c ON c.trans_num = p.id_pago 
        LEFT JOIN cheques_ter t ON t.trans_num = p.id_pago GROUP BY p.id_pago ");
        
        $t->Set("visible", "");
        $t->Show("extracto_data");
      


        $fila = 0;
        while ($det->NextRecord()) {
            $PaimNum = $det->Record['id_pago'];
            $PaimDate = $det->Record['fecha'];
            $SucP = $det->Record['suc'];
            $CashSum = $det->Record['efectivo'];
            $CreditSum = $det->Record['tarjetas'];
            $CheckSum = $det->Record['cheques'];
            $TrsfrSum = 0;

            $DocTotal = $CashSum + $CreditSum + $CheckSum + $TrsfrSum;
            $SumApplied = $det->Record['entrega_actual'];
            $Recibo = $det->Record['Recibo'];

            $TOTAL_PAGADO_DET += 0 + $SumApplied;
  
            $t->Set("PaimNum", $PaimNum);
            $t->Set("suc", $SucP);
            $t->Set("Recibo", $Recibo);
            $t->Set("PaimDate", $PaimDate);
            $t->Set("CashSum", number_format($CashSum, 0, ',', '.'));
            $t->Set("CreditSum", number_format($CreditSum, 0, ',', '.'));
            $t->Set("CheckSum", number_format($CheckSum, 0, ',', '.'));
            $t->Set("TrsfrSum", number_format($TrsfrSum, 0, ',', '.'));
            $t->Set("DocTotal", number_format($DocTotal, 0, ',', '.'));
            $t->Set("SumApplied", number_format($SumApplied, 0, ',', '.'));
            if ($PaimNum != null) {
                $t->Show("extracto_det_pago");
            }
            $fila++;
        }


        //$rec_sql = "SELECT r.id_rec,valor FROM reconciliaciones r INNER JOIN recon_det d ON r.id_rec = d.id_rec AND d.nro_doc = $TicketInterno AND tipo_doc = 'Factura' AND id_det = $Cuota AND cod_tipo = 'C'";
        
        $rec_sql = "SELECT r.id_rec,DATE_FORMAT(r.fecha, '%d-%m-%Y') as fecha, r.notas,
        (SELECT SUM(valor) AS total_nc FROM recon_det WHERE id_rec = r.id_rec AND tipo_doc ='Nota Credito') as total_nc,valor
        FROM reconciliaciones r INNER JOIN recon_det d ON r.id_rec = d.id_rec AND d.nro_doc = $TicketInterno AND tipo_doc = 'Factura' AND id_det = $Cuota AND cod_tipo = 'C'";
 
        $rec->Query($rec_sql);
 
        if ($rec->NumRows() > 0) {
            $t->Show("extracto_data_nc");
            while ($rec->NextRecord()) {
                $id_rec = $rec->Record['id_rec']; 
                $ReconDate = $rec->Record['fecha'];
                $Total_NC = $rec->Record['total_nc'];
                $notas = $rec->Record['notas'];
                $valor_recon = $rec->Record['valor'];

                $t->Set("id_rec", $id_rec);
                $t->Set("recon_date", $ReconDate);
                $t->Set("total_nc", number_format($Total_NC, 0, ',', '.'));
                $t->Set("reconciliado", number_format($valor_recon, 0, ',', '.'));
                $t->Set("notas", $notas);
                $t->Show("nc_det_pago"); 
            }
        } 
        $t->Show("separador");
        }
        $t->Set("total_cuotas", number_format($TOTAL_CUOTAS, 0, ',', '.'));
        $t->Set("total_pagado", number_format($TOTAL_PAGADO, 0, ',', '.'));
        $t->Set("saldo", number_format($TOTAL_CUOTAS - $TOTAL_PAGADO, 0, ',', '.'));
        $t->Set("total_pagado_det", number_format($TOTAL_PAGADO_DET, 0, ',', '.'));
        $t->Show("totales");
        $t->Show("extracto_foot");
    
}

    new Extractos();
?>
