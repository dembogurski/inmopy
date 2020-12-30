<?php

/**
 * Description of VentasEnCaja
 * @author Ing.Douglas
 * @date 16/03/2015
 */
require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");


class VentasEnCaja {

    function __construct() {
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }

    function main() {
        //$session = $_POST['session'];
        $usuario = $_POST['usuario'];
        $suc = $_POST['suc'];

        $db = new My();
        $db2 = new My();

        $va = new Y_Template("VentasEnCaja.html");

        $date = date_create(date("Y-m-d"));
        date_add($date, date_interval_create_from_date_string("30 days"));
        $treinta_dias = date_format($date, "d-m-Y");

        $va->Set("inicio_cuota", $treinta_dias);

        $va->Set("fecha_hoy", date("d/m/Y"));

        $va->Show("header");

        $va->Set("suc", $suc);
        $va->Set("usuario", $usuario);


        // Obtengo las Cotizaciones del dia

        $db->Query("SELECT m_descri AS m, m_cod AS moneda FROM monedas WHERE m_ref <> 'Si' and m_cod != 'Y$';");
        //echo $db->NumRows();
        while ($db->NextRecord()) {
            $moneda = $db->Record['moneda'];
            $mon_replaced = strtolower(str_replace("$", "s", $moneda));
            $db2->Query("SELECT compra,venta FROM cotizaciones WHERE suc = '$suc' AND m_cod = '$moneda' and fecha <= current_date ORDER BY id_cotiz DESC LIMIT 1;");
            if ($db2->NumRows() > 0) {
                $db2->NextRecord();
                $compra = $db2->Record['compra'];
                $va->Set("cotiz_$mon_replaced", number_format($compra, 2, ',', '.'));
            } else {
                $va->Set("cotiz_$mon_replaced", 0);
            }
        }

        $va->Show("cotizaciones");

        //$db->Query("SELECT f_nro as nro, DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha, cod_cli ,ruc_cli AS ruc,tipo_doc_cli, cliente, cat , total ,total_desc,total_bruto,empaque,pref_pago, usuario as vendedor, estado,moneda FROM factura_venta WHERE estado = 'En_caja' AND suc = '$suc'");
        $db->Query("SELECT f.f_nro as nro, DATE_FORMAT(f.fecha,'%d-%m-%Y') AS fecha, f.cod_cli ,f.ruc_cli AS ruc,f.tipo_doc_cli, cliente, cat ,   total ,  total_desc,cod_desc,   total_bruto,desc_sedeco, empaque,pref_pago, usuario as vendedor, f.estado,moneda,clase FROM factura_venta f  WHERE f.estado = 'En_caja' AND suc = '$suc'  ");

        $va->Show("ventas_encaja_cab");

        while ($db->NextRecord()) {
            $nro = $db->Record['nro'];
            $fecha = $db->Record['fecha'];
            $cod_cli = $db->Record['cod_cli'];
            $ruc = $db->Record['ruc'];
            $tipo_doc_cli = $db->Record['tipo_doc_cli'];
            $cliente = $db->Record['cliente'];
            $cat = $db->Record['cat'];
            $total = $db->Record['total'];
            $total_desc = $db->Record['total_desc'];
            $desc_sedeco = $db->Record['desc_sedeco'];
            $cod_desc = $db->Record['cod_desc'];
            $total_bruto = $db->Record['total_bruto'];
            $vendedor = $db->Record['vendedor'];
            $estado = $db->Record['estado'];
            $empaque = $db->Record['empaque'];
            $moneda_factura = $db->Record['moneda'];
            $clase = $db->Record['clase'];
            
            $decimales = 0;
            if ($moneda_factura != 'G$') {
                $decimales = 2;
            }
            $pref_pago = $db->Record['pref_pago'];

            $pp = "Contado";
            if ($pref_pago != "Contado") {
                $pp = "Otros";
            }
            if ($pref_pago == "Contado" && $total_desc > 0 && $cat < 3) {
                if ($cod_desc == 4) {
                    $va->Set("alert_desc", "&nbsp;<img src='img/info.png'  width='14px' height='14px' title='Descuento Resolucion 347-SEDECO!'>");
                } else {
                    $va->Set("alert_desc", "&nbsp;<img src='img/warning_yellow_16.png'  width='14px' height='14px' title='Cuidado! No se permiten descuentos para pagos en Tarjetas p/Cat $cat'>");
                }
            } else {
                if ($total_desc > 0 && $cod_desc > 2) {
                    $va->Set("alert_desc", "&nbsp;<img src='img/info.png'  width='14px' height='14px' title='Descuento Resolucion 347-SEDECO!'>");
                } else {
                    $va->Set("alert_desc", "");
                }
            }
            if ($total_desc > 0 && $cod_desc < 3) { //4 Codigo de descuento SEDECO
                $va->Set("trash_desc", "inline");
            } else {
                $va->Set("trash_desc", "none");
            }

            $va->Set("nro", $nro);
            $va->Set("fecha", $fecha);
            $va->Set("cliente", $cliente);
            $va->Set("cod_cli", $cod_cli);
            $va->Set("tipo_doc_cli", $tipo_doc_cli);
            $va->Set("cat", $cat);
            $va->Set("ruc", $ruc);
            $va->Set("vendedor", $vendedor);
            $va->Set("total_neto", number_format($total, $decimales, ',', '.'));
            $va->Set("total_desc", number_format($total_desc, 1, ',', '.'));
            $va->Set("cod_desc", $cod_desc);
            $va->Set("desc_sedeco", number_format(-$desc_sedeco, 0, ',', '.'));
            $va->Set("total_bruto", number_format($total_bruto, $decimales, ',', '.'));
            $va->Set("estado", $estado);
            $va->Set("moneda", $moneda_factura);
            $va->Set("empaque", $empaque);
            $va->Set("pref_pago", $pp);
            $va->Set("clase", " $clase");
 
            $va->Set("data_efectivo", 0);
            $va->Set("data_tarjetas", 0);
            $va->Set("data_cheques", 0);
            $va->Set("data_credito", 0);
            $va->Show("ventas_encaja_data");
        }

        $va->Show("ventas_encaja_foot");


        // Buscar Tarjetas
        $ms = new My();
        $ms->Query("SELECT cod_tarjeta AS CreditCard,nombre AS CardName,tipo AS Tipo FROM tarjetas  WHERE tipo != 'Asociacion' ORDER BY CardName ASC");
        $tarjetas = "";
        while ($ms->NextRecord()) {
            $conv_cod = $ms->Record['CreditCard'];
            $conv_nombre = $ms->Record['CardName'];
            $tipo = $ms->Record['Tipo'];
            $tarjetas.="<option value='$conv_cod' data-tipo='$tipo' >$conv_nombre</option>";
        }
        $va->Set("tarjetas", $tarjetas);

        // Buscar Lista de Bancos
        $db->Query("SELECT id_banco,nombre FROM bancos order by nombre asc");
        $bancos = "";
        while ($db->NextRecord()) {
            $id_banco = $db->Record['id_banco'];
            $nombre = $db->Record['nombre'];
            $bancos.="<option value='$id_banco'>$nombre</option>";
        }
        $va->Set("bancos", $bancos);

        // Buscar Lista de Monedas
        $db->Query("SELECT m_cod AS moneda, m_descri FROM monedas where m_cod != 'Y$' ");
        $monedas = "";
        $monedas_cod = "";
        while ($db->NextRecord()) {
            $moneda = $db->Record['moneda'];
            $m_descri = $db->Record['m_descri'];
            if (($moneda != 'P$' && $moneda != 'R$')) {
                $monedas.="<option value='$moneda'>$m_descri</option>";
            }
            $monedas_cod.="<option value='$moneda'>$moneda</option>";
        }
        $va->Set("monedas", $monedas);
        $va->Set("monedas_cod", $monedas_cod);
        $ncuotas = "";
        for ($i = 1; $i <= 60; $i++) {
            $ncuotas .= "<option class='n_cuota_$i cuota_x' >$i</option>";
        }
        $va->Set("n_cuotas", $ncuotas);

        $va->Show("ui_factura");
    } 

}

function buscarTicket(){
    $ticket = $_POST['ticket'];
    $suc = $_POST['suc'];
    $db = new My();
    $Qry = "SELECT cod_cli,ruc_cli,cliente,cat,cod_desc,DATE_FORMAT(fecha_cierre,'%d-%m-%Y') AS fecha,moneda, total,total_desc ,fact_nro,clase FROM factura_venta WHERE f_nro = $ticket AND estado = 'Cerrada' AND suc ='$suc'";
    $db->Query($Qry);
    $array = array();
    if($db->NumRows()>0){
        $db->NextRecord();
        $array = $db->Record;
    }
    echo json_encode($array);
}

function checkearEntregaParcial(){
    $factura = $_POST['factura'];
    $sql = "SELECT  'Efectivo' AS Tipo, IF(entrada_ref IS NULL,0, SUM(entrada_ref)) AS entrega FROM efectivo WHERE f_nro = $factura UNION  SELECT  'Cheques' , IF( valor_ref IS NULL,0,SUM(  valor_ref )) AS entrega FROM cheques_ter  WHERE f_nro = $factura; ";
    $db = new My();
    $db->Query($sql);
    $entrega = 0;
    while($db->NextRecord()){
        $ent = $db->Get('entrega');
        $entrega +=0+$ent;
    }
    echo json_encode(array("entrega"=>$entrega));
}



new VentasEnCaja();
?>