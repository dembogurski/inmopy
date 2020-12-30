<?php

/**
 * Description of Ticket
 * @author Ing.Douglas
 * @date 17/04/2015
 */

require_once("../Y_DB_MySQL.class.php");
require_once("../Y_Template.class.php");

class TicketVenta {
    
    function __construct(){
        date_default_timezone_set('America/Asuncion');
        $db = new My();
        
        $fecha = date("d-m-Y  H:i");
        $factura = $_REQUEST['factura']; 
        //$cliente = $_REQUEST['cliente'];   // Problemas de Impresion      
        //$ruc = $_REQUEST['ruc'];
        //$suc = $_REQUEST['suc'];
        $pref_pago = $_REQUEST['pref_pago'];
        
        $total_factura = ""; //$_REQUEST['total_factura'];
        $descuento = $_REQUEST['descuento'];
        $total_moneda_ext = ""; //$_REQUEST['total_moneda_ext'];
        
        $dec = 0;
        
        
        $db->Query("SELECT suc,pref_pago,total,desc_sedeco, total_desc - desc_sedeco as total_desc, total_bruto,moneda, usuario as vendedor,ruc_cli,cliente FROM factura_venta WHERE f_nro = $factura");
        
        $db->NextRecord();
        
        //print_r($db->Record);
        
        $suc =  $db->Record['suc']; 
        $moneda =  $db->Record['moneda'];         
        $pref_pago =  $db->Record['pref_pago']; 
        $total_neto =  $db->Record["total"];    
        $descuento =  $db->Record['total_desc']; 
        $desc_sedeco =  $db->Record['desc_sedeco']; 
        $total_bruto =  $db->Record['total_bruto'];
        
         
        
        if($moneda != "G$"){
            $dec = 2;
        }
        
        
        $bruto =  $this->str_fill(number_format($total_bruto, $dec, ',', '.'),19,"L","_");  ;       
        $redondeo_sedeco = $this->str_fill( number_format(-$desc_sedeco, $dec, ',', '.'),15,"L","_");  ;
        $descuento_format = $this->str_fill( number_format(-$descuento, $dec, ',', '.'),21,"L","_");  ;
        $total_factura =  $this->str_fill(number_format($total_neto, $dec, ',', '.'),17,"L","_");  ;
        
        $vendedor = ucfirst($db->Record['vendedor']);  
        $cliente = strtoupper($db->Record['cliente']);      
        $ruc = $db->Record['ruc_cli'];
          
        $moneda_ext = $_REQUEST['moneda_ext'];
         
        
        if($pref_pago == "Otros"){
            $pref_pago = "Tarjeta/Cheques Diferidos"; 
        }else{
            $pref_pago = "Contado: Efectivo/Cheque al Dia/Cuotas";
        }
         
                
        $t = new Y_Template("Ticket.html");   
         
        $add_moneda_ext = "" ;
        if($moneda_ext != ""){
            $lnk = new My();
            $moneda_ext = str_replace('s','$',$moneda_ext);
            $lnk->Query("select compra from cotizaciones where suc ='$suc' and m_cod='$moneda_ext' order by id_cotiz desc limit 1");
            $lnk->NextRecord();
            $cambio = (float)$lnk->Record['compra'];
            $total_moneda_ext = number_format(($total_neto/$cambio), 2, ',', '.');
            $lnk->Close();
            $add_moneda_ext = "TOTAL a PAGAR $moneda_ext: $total_moneda_ext ~~~~\n" ;
        }
        $agregar_descuento_sedeco = "";
        if($desc_sedeco > 0){
            $agregar_descuento_sedeco = "Redondeo SEDECO $moneda: $redondeo_sedeco ~~~~\n";
        }
        
        $add = $add."+---------- Tejidos -----------+\n";
        $add = $add. "Ticket Nro: $factura     \n";
        $add = $add."Cliente:  $cliente\n"; 
        $add = $add."RUC/Doc: $ruc\n"; 
        $add = $add."Vendedor: $vendedor\n"; 
        $add = $add." \n";        
        $add = $add."Metodo de Pago: $pref_pago\n";
        $add = $add." \n";
        $add = $add."TOTAL BRUTO $moneda: $bruto ~~~~\n"; 
        $add = $add."$agregar_descuento_sedeco"; 
        $add = $add."Descuento $moneda: $descuento_format ~~~~\n";
        $add = $add."TOTAL a PAGAR $moneda: $total_factura ~~~~\n" ;  
        
        $add = $add."$add_moneda_ext \n";
        $add = $add." \n";
        $add = $add."Espere a que su mercaderia sea controla-da para realizar el Pago! \n";
        $add = $add."Para devoluciones favor llamar antes de pasadas las 48 horas para registrar su solicitud.\n";
        $add = $add." \n";
        $add = $add."  (No valido para Credito Fiscal)  \n";
        $add = $add." \n";
        $add = $add."----------- $fecha ----------\n"; 
        
        /*
        //+----------------- Detalle --------------------+//
        $add = $add."#| Codigo |  Precio | Cant. | Subtotal |\n";

        $Nro = 0;
        $TOTAL = 0;        
        */
        $add = $add." \n";
        $add = $add." \n";
        $add = $add." \n";
        $add = $add." \n";
         
        
        $t->Set("content",$add);        
        $t->Show("submit_form");
    }
    /**
     * 
     * @param type $string
     * @param type $int length
     * @param type $string (Left or Right) L or R
     * @return string
     */
    function str_fill($string, $m_len,$lr="R",$char=" "){  
       $tmp = $string;
       //$fill = $m_len-strlen($tmp);
       while(strlen($tmp)<$m_len){
          if($lr=="R"){ 
             $tmp .=$char;
          }else{
             $tmp =$char.$tmp; 
          } 
       }
       return $tmp;
    }    
}
new TicketVenta();
?>
