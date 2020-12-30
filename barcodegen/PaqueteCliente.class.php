<?php

/**
 * Description of PaqueteCliente
 * @author Ing.Douglas
 * @date 10/07/2018
 */
 

 
require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");
require_once("../Functions.class.php");
require_once("../barcodegen/RadPlusBarcodeNoFont.php");

class PaqueteCliente {

    function __construct() {


        $tipo = $_REQUEST['tipo']; // factura o remision
        
        $factura = $_REQUEST['factura'];
        $nro_remito = $_REQUEST['nro_remito'];
        
        $paquete = $_REQUEST['paquete'];
        $usuario = $_REQUEST['usuario'];
        $auto_close_window = $_REQUEST['auto_close_window'];
        
  
        $t = new Y_Template("BarcodePrinter.html");
        $t->Set("usuario", $usuario);
        $t->Set("datetime", date("d-m-Y H:i"));
        
        $t->Set("auto_close_window", $auto_close_window);
        
        $t->Set("margin", "-20px 1px 0px 0px");
        
        $t->Set("doc", $factura);
        if($tipo == "remision"){
            $t->Set("doc", $nro_remito);
        }
        $etiqueta = "etiqueta_10x5";
        $tam = "10x5";

        $t->Set("tam", $tam);
        $t->Show("headers");
        
        $my = new My();
        $sql = "SELECT r.suc AS origen,  UPPER(nombre) AS sucursal,s.direccion ,tel ,cod_cli FROM sucursales s, factura_venta r WHERE r.suc = s.suc AND  r.f_nro = $factura; ";
        if($tipo == "remision"){
            $sql = "SELECT r.suc AS origen,  UPPER(nombre) AS sucursal,s.direccion ,tel ,cod_cli FROM sucursales s, nota_remision r WHERE r.suc = s.suc AND  r.n_nro = $nro_remito; ";
        }
        
        $my->Query($sql);
        $my->NextRecord();
                
        $origen = $my->Record['origen'];
        //$destino = $my->Record['destino'];
        $sucursal=  $my->Record['sucursal'];
        //$direccion =  $my->Record['direccion'] ;
        $tel = $my->Record['tel'];
        
        $direccion = "Ruta VI Km 11.5 Itap&uacute;a - PY ";
        
        $cod_cli = $my->Record['cod_cli'];
       
         
        
        $my = new My();
        $my->Query("SELECT dir,ciudad,pais,tel,ci_ruc,nombre,alias  FROM clientes  WHERE cod_cli ='$cod_cli'");
        $my->NextRecord();
        $DirCli = $my->Record['dir']; 
        $CiudadCli = $my->Record['ciudad']; 
        $PaisCli = $my->Record['pais']; 
        $PhoneCli = $my->Record['tel']; 
        $ruc_cli = $my->Record['ci_ruc'];
        $cliente = $my->Record['nombre'];
        $Alias = $my->Record['alias'];
        
        $fullname = $cliente;
        
        if(!is_null($Alias)){
            $fullname = "$Alias - $cliente";
        }

        $printer = $_REQUEST['printer'];
        $silent_print = $_REQUEST['silent_print']; 
        $t->Set("printer", $printer);
        $t->Set("silent_print", $silent_print);
        
        $t->Set("origen", $origen);
        //$t->Set("destino",$destino);
        $t->Set("sucursal",$sucursal);
         
        $t->Set("direccion",$direccion);
        $t->Set("tel",$tel);
        
        $t->Set("cod_cli",$cod_cli);
        $t->Set("ruc_cli",$ruc_cli);
        $t->Set("cliente",$fullname);
        $t->Set("cli_tel",$PhoneCli);
        $t->Set("cli_dir",$DirCli);
        $t->Set("cli_ciu","$CiudadCli");
        
        
        
        $cod_barras = $factura."-".$paquete;
        
        $filename = new RadPlusBarcode();
        $barcode_image = $filename->parseCode($cod_barras, 6, 3);
        $t->Set("barcode_image", $barcode_image);
        
        $t->Set("paquete",$paquete);
        
        $db = new My();
        $Qry = "SELECT count(*) as cantidad from fact_vent_det where f_nro = $factura and paquete = $paquete";
        if($tipo == "remision"){
            $Qry = "SELECT count(*) as cantidad from nota_rem_det where n_nro = $nro_remito and paquete = $paquete";
        }
        $db->Query($Qry);

        if ($db->NumRows() > 0) {
            $db->NextRecord();
            $cantidad = $db->Record['cantidad'];
            $t->Set("cantidad", $cantidad);
            $t->Show("paquete_10x5_cliente");                 
        } else {
            echo "El paquete esta vacio...";
        }
    }

}

new PaqueteCliente();
?>
