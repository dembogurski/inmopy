<?php

/**
 * Description of Invoice
 * @author Ing.Douglas
 * @date 18/04/2016
 */

require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");


class Invoice {
    function __construct() {         
        
        $t = new Y_Template("Invoice.html");
        //$usuario = $_POST['usuario']; 
        $invoice = $_GET['invoice']; 
        
        $date = date("d-M-Y");
        $t->Set("date",$date);
        $t->Set("invoice",$invoice);
        
        $db = new My();
        $db->Query("select n_nro,moneda,usuario,cod_prov,proveedor,date_format(fecha,'%d-%m-%Y') as fecha,obs,origen from invoice where invoice = '$invoice'");
        $db->NextRecord();
        $n_nro = $db->Record['n_nro'];
        $moneda = $db->Record['moneda'];
        $usuario = $db->Record['usuario'];
        $cod_prov = $db->Record['cod_prov'];
        $proveedor = $db->Record['proveedor'];
        
        if($moneda == "Y$"){
            $moneda = "RMB.";
        }else{
            $moneda = "USD.";
        }
        
        $t->Set("currency",$moneda);
        
        
        $ms = new My();
        $ms->Query("SELECT dir,ciudad,UPPER(pais) AS pais,tel,email FROM proveedores WHERE cod_prov ='$cod_prov'");
        $Address = "";
        $City = "";
        $Country = "";
        $Phone = "";
        $E_Mail = "";         
        if($ms->NumRows()>0){
            $ms->NextRecord();
            $Street = $ms->Record['dir'];
            $City = $ms->Record['ciudad'];
            $Country = $ms->Record['pais'];
            $Address = $Street.", ".$City." ".$Country;
            $Phone = $ms->Record['Phone1'];
            $E_Mail = $ms->Record['E_Mail'];         
        } 
              
            
        $t->Set("provider",$proveedor); 
        $t->Set("City",$City);
        $t->Set("Country",$Country);
        $t->Set("address",$Address);
        $t->Set("phone",$Phone);
        $t->Set("email",$E_Mail);
        $t->Show("header");
        $t->Show("head");
        
        
        
        $t->Show("table_header");
        $db->Query("SELECT COUNT(bale) AS BALES,cod_prov AS PROVIDER,CONCAT(codigo,'-',descrip) AS DESCRIPTION,SUM(cantidad) AS QTY,precio AS PRICE,um AS UM, SUM(subtotal) AS TOTAL_VALUE
        FROM packing_list WHERE invoice = '$invoice' GROUP BY cod_prov,descrip,um,price ORDER BY cod_prov ASC, descrip ASC");
        
        $total = 0;
        
        while($db->NextRecord()){
           $bales = $db->Record['BALES'];
           $provider = $db->Record['PROVIDER'];
           $descrip = $db->Record['DESCRIPTION'];
           $qty = $db->Record['QTY'];
           $um = $db->Record['UM'];
           $price = $db->Record['PRICE'];
           $subtotal = $db->Record['TOTAL_VALUE'];
           $t->Set("bales",$bales); 
           $t->Set("provider",$provider);  
           $t->Set("descrip",$descrip); 
           $t->Set("qty",number_format($qty,2,',','.'));   
           $t->Set("price",number_format($price,2,',','.')); 
           $t->Set("um",$um); 
           $t->Set("subtotal",number_format($subtotal,2,',','.')); 
           $t->Show("table_data");
           $total +=0+$subtotal;
        }
        $t->Set("title","SUBTOTAL :"); 
        $t->Set("total",number_format($total,2,',','.')); 
        $t->Show("table_totals");
        
        $TOTAL_INVOICE = $total;
        
        $db->Query("SELECT  nombre_gasto,valor FROM inv_gastos WHERE invoice = '$invoice'");
        while($db->NextRecord()){
           $nombre_gasto = $db->Record['nombre_gasto'];
           $valor = $db->Record['valor'];
           $TOTAL_INVOICE += 0 + $valor;
           $t->Set("title",$nombre_gasto); 
           $t->Set("total",number_format($valor,2,',','.')); 
           $t->Show("table_totals");
        } 
        
        $t->Set("title","TOTAL PAYMENT:"); 
        $t->Set("total",number_format($TOTAL_INVOICE,2,',','.')); 
        $t->Show("table_totals");
        
        $db->Query("SELECT  obs  FROM invoice WHERE invoice = '$invoice'");
        $db->NextRecord();
        $notes = $db->Record['obs'];
        $t->Set("notes",$notes); 
        $t->Show("table_footer");
    }
}
new Invoice();
?>
