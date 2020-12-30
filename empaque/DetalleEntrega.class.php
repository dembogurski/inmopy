<?php

/**
 * Description of DetalleEntrega
 * @author Ing.Douglas
 * @date 22/03/2018
 */
require_once("../Y_DB_MySQL.class.php");
require_once("../Y_Template.class.php");

class DetalleEntrega {
     function __construct() {
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }

    function main() {        
        $t = new Y_Template("DetalleEntrega.html");
        $usuario = $_REQUEST['usuario'];
        $factura = $_REQUEST['factura'];
        $db = new My();
        $db->Query("SELECT ruc_cli,cliente  FROM factura_venta WHERE f_nro =$factura;");
        $db->NextRecord();
        $ruc = $db->Record['ruc_cli'];
        $cliente = $db->Record['cliente'];
        $t->Set("cliente", $cliente);
        $t->Set("ruc", $ruc);
        $t->Set("fecha", date("d-m-Y"));
        
        $t->Set("user", $usuario);
        $t->Set("time", date("d-m-Y H:i"));
        $t->Set("factura", $factura);
        
        $t->Show("header");
        $t->Show("head");
        // Detalle
        $sqld = "SELECT codigo,lote,descrip,um_cod,cantidad,ROUND(subtotal / cantidad) AS precio,subtotal FROM fact_vent_det WHERE f_nro =$factura";
        $db->Query($sqld);
        $TOTAL = 0;
        $c = 0;
        while($db->NextRecord()){
            $codigo = $db->Record['codigo'];
            $lote = $db->Record['lote'];
            $descrip = $db->Record['descrip'];
            $um_cod = $db->Record['um_cod'];
            $cantidad = $db->Record['cantidad'];
            $precio = $db->Record['precio'];
            $subtotal = $db->Record['subtotal'];
            $TOTAL+=0+$subtotal;
            $c++;
            $t->Set("codigo", $codigo);
            $t->Set("lote", $lote);
            $t->Set("descrip", $descrip);
            $t->Set("um", $um_cod);
            $t->Set("cantidad", number_format($cantidad, 0, ',', '.'));  
            $t->Set("precio",number_format($precio, 0, ',', '.'));   
            $t->Set("subtotal",number_format($subtotal, 0, ',', '.'));  
            $t->Show("data");
        }
        $t->Set("total",number_format($TOTAL, 0, ',', '.'));  
        $t->Set("cant",$c);  
        $t->Show("foot");
    }
}
new DetalleEntrega();
?>
