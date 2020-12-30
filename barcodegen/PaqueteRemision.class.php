<?php

/**
 * Description of PaqueteRemision
 * @author Ing.Douglas
 * @date 19/04/2018
 */
require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");
require_once("../Functions.class.php");
require_once("../barcodegen/RadPlusBarcodeNoFont.php");

class PaqueteRemision {

    function __construct() {


        $nro_remito = $_REQUEST['nro_remito'];
        $paquete = $_REQUEST['paquete'];
        $usuario = $_REQUEST['usuario'];
  
        $t = new Y_Template("BarcodePrinter.html");
        $t->Set("usuario", $usuario);
        $t->Set("datetime", date("d-m-Y H:i"));
        
        $t->Set("nro_remito", $nro_remito);
        $etiqueta = "etiqueta_10x5";
        $tam = "10x5";

        $t->Set("tam", $tam);
        $t->Show("headers");
        
        $my = new My();
        $sql = "SELECT r.suc AS origen, s.suc AS destino,upper(nombre) as sucursal,s.direccion ,tel  FROM sucursales s, nota_remision r WHERE   r.suc_d = s.suc AND  r.n_nro = $nro_remito ";
   
        $my->Query($sql);
        $my->NextRecord();
                
        $origen = $my->Record['origen'];
        $destino = $my->Record['destino'];
        $sucursal=  $my->Record['sucursal'];
        $direccion =  $my->Record['direccion'] ;
        $tel = $my->Record['tel'];

        $printer = $_REQUEST['printer'];
        $silent_print = $_REQUEST['silent_print']; 
        
        if($usuario == "douglas"){
            $silent_print = "false";
        } 
        
        $t->Set("printer", $printer);
        $t->Set("silent_print", $silent_print);

        
        $t->Set("origen", $origen);
        $t->Set("destino",$destino);
        $t->Set("sucursal",$sucursal);
        $t->Set("destino",$destino);
        $t->Set("direccion",$direccion);
        $t->Set("tel",$tel);
        
        
        $t->Set("margin", "0px 1px 0px 0px");
        
        
        
        $cod_barras = $nro_remito."-".$paquete;
        
        $filename = new RadPlusBarcode();
        $barcode_image = $filename->parseCode($cod_barras, 6, 3);
        $t->Set("barcode_image", $barcode_image);
        
        $t->Set("paquete",$paquete);
        
        $db = new My();

        $db->Query("SELECT count(*) as cantidad from nota_rem_det where n_nro = $nro_remito and paquete = $paquete");

        if ($db->NumRows() > 0) {
            $db->NextRecord();
            $cantidad = $db->Record['cantidad'];
            $t->Set("cantidad", $cantidad);
            $t->Show("paquete_10x5");                 
        } else {
            echo "El paquete esta vacio...";
        }
    }

}

new PaqueteRemision();
?>
