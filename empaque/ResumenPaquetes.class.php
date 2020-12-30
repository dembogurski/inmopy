<?php

/**
 * Description of ResumenPaquetes
 * @author Ing.Douglas
 * @date 03/08/2018
 */
require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");
 

class ResumenPaquetes {

    function __construct() {
        $t = new Y_Template("ResumenPaquetes.html");
        $t->Show("header");

        $factura = $_REQUEST['factura'];
        $user = $_REQUEST['usuario'];
        $t->Set("user", $user);
        $t->Set("time", date("m-d-Y H:i"));
        $db = new My();
        $db->Query("SELECT DATE_FORMAT(CURRENT_DATE,'%d-%m-%Y') AS fecha,suc,cat,tipo_doc_cli,ruc_cli,cliente,moneda  FROM factura_venta WHERE f_nro = $factura");
        if ($db->NumRows() > 0) {
            $db->NextRecord();
            $fecha = $db->Record['fecha'];
            $suc = $db->Record['suc'];
            $cat = $db->Record['cat'];
            $tipo_doc_cli = $db->Record['tipo_doc_cli'];
            $ruc_cli = $db->Record['ruc_cli'];
            $cliente = $db->Record['cliente'];
            $moneda = $db->Record['moneda'];
            $pos = strpos($ruc_cli, '-');

            $my = new My();

            $my->Query("SELECT dir,ciudad,pais,tel,ci_ruc,nombre,alias  FROM clientes  WHERE ci_ruc ='$ruc_cli'");

            $dir = "";
            if ($my->NumRows() > 0) {     
                $my->NextRecord();
                $Address = $my->Record['dir'];
                $City = $my->Record['ciudad'];
                $Country = $my->Record['pais'];
                $Phone1 = $my->Record['tel'];
                $dir = "$Address - $City - $Country";
            }
            $t->Set('Phone1', $Phone1);
            $t->Set('dir', $dir);

            if ($pos != false) {
                $tipo_doc_cli = "RUC";
            }
            $t->Set("factura", $factura);
            $t->Set("tipo_doc", $tipo_doc_cli);
            $t->Set("fecha", $fecha);
            $t->Set("suc", $suc);
            $t->Set("cat", $cat);
            $t->Set("cliente", $cliente);
            $t->Set("ruc", $ruc_cli);
            $t->Set("moneda", $moneda);
            $t->Show("head");
        }
        $det = "SELECT paquete,COUNT(*) as cant from fact_vent_det where f_nro = $factura GROUP BY paquete ORDER BY paquete ASC";
        $db->Query($det);
        $TOTAL = 0;

        while ($db->NextRecord()) {
            $paquete = $db->Record['paquete'];
            $cant = $db->Record['cant'];
            $TOTAL+=0 + $cant;
            $t->Set("paquete", $paquete);
            $t->Set("cant", $cant);


            $t->Show("data");
        }

        $t->Set("TOTAL", number_format($TOTAL, 0, ',', '.'));

        $t->Show("foot");
    }

}

new ResumenPaquetes();
?>
