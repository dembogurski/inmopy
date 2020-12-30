<?php

/**
 * Description of ImprimirFactura
 * @author Ing.Douglas
 * @date 02/08/2018
 */
require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");

class ImprimirFactura {
    function __construct() {
        $t =  new Y_Template("ImprimirFactura.html");
        $t->Show("header");
        
        $decimales = 0;
        
        $factura = $_REQUEST['factura'];
        $user = $_REQUEST['user'];
        $t->Set("user",$user);
        $t->Set("time",date("m-d-Y H:i"));
        $db = new My();
        $db->Query("SELECT DATE_FORMAT(CURRENT_DATE,'%d-%m-%Y') AS fecha,suc,cat,tipo_doc_cli,ruc_cli,cliente,moneda ,desc_sedeco FROM factura_venta WHERE f_nro = $factura");
        if($db->NumRows() > 0){
           $db->NextRecord();
           $fecha = $db->Record['fecha'];
           $suc = $db->Record['suc'];
           $cat = $db->Record['cat'];
           $tipo_doc_cli = $db->Record['tipo_doc_cli'];
           $ruc_cli = $db->Record['ruc_cli'];
           $cliente = $db->Record['cliente'];
           $moneda = $db->Record['moneda'];
           $desc_sedeco = $db->Record['desc_sedeco'];  
           $pos = strpos($ruc_cli,'-');
           
           if($moneda != "G$"){
               $decimales = 2;
           }
               
          
           
           if($pos != false){
               $tipo_doc_cli = "RUC";
           }
           $t->Set("factura",$factura); 
           $t->Set("tipo_doc",$tipo_doc_cli);
           $t->Set("fecha",$fecha);
           $t->Set("suc",$suc);
           $t->Set("cat",$cat);
           $t->Set("cliente",$cliente);
           $t->Set("ruc",$ruc_cli);
           $t->Set("moneda",$moneda);
           
           $t->Show("head");
        }
        $det = "SELECT codigo,lote,descrip,um_cod,cantidad,precio_venta,descuento, ((precio_venta*cantidad) - descuento) as subtotal from fact_vent_det where f_nro = $factura order by descrip asc";
        $db->Query($det);
        $TOTAL = 0;
        $DESC = 0;
        $i = 1;
        while($db->NextRecord()){
            $codigo = $db->Record['codigo'];
            $lote = $db->Record['lote'];
            $descrip = $db->Record['descrip'];
            //$um = $db->Record['um_cod'];
            $cantidad = $db->Record['cantidad'];
            $precio_venta = $db->Record['precio_venta'];
            $descuento = $db->Record['descuento'];
            $subtotal = $db->Record['subtotal'];
            $TOTAL +=0+$subtotal;
            $DESC+=0+$descuento;
            
            $t->Set("i",$i);
            $t->Set("codigo",$codigo);
            $t->Set("lote",$lote);
            $t->Set("descrip",$descrip);
            $t->Set("cantidad",number_format($cantidad,2,',','.'));    
            $t->Set("precio",number_format($precio_venta,2,',','.'));     
            $t->Set("descuento",number_format($descuento,0,',','.'));    
            $t->Set("subtotal",number_format($subtotal,$decimales,',','.'));     
            $t->Show("data");
            $i++;
        }
        $TOTAL -= $desc_sedeco;
        if($desc_sedeco > 0){
            $desc_sedeco = $desc_sedeco * -1;
            $t->Set("redondeo","Redondeo: ".number_format($desc_sedeco,2,',','.'));       
        }else{
            $t->Set("redondeo","");       
        }
        
        $t->Set("TOTAL",number_format($TOTAL,$decimales,',','.'));     
        $t->Set("DESC",number_format($DESC,$decimales,',','.'));     
        $t->Show("foot");
    }
    
}
new ImprimirFactura();
?>