<?php


/**
 * Description of Ticket
 * @author Ing.Douglas
 * @date 17/04/2015
 */

require_once("../Y_DB_MySQL.class.php");
require_once("../Y_Template.class.php");

class TicketCaja {
    
    function __construct(){
		date_default_timezone_set('America/Asuncion');
        
        $fecha = date("d-m-Y H:i:s");
        $factura = $_REQUEST['factura']; 
        $cliente = strtoupper($_REQUEST['cliente']);
        $ruc = $_REQUEST['ruc'];
        $suc = $_REQUEST['suc'];
        $moneda = $_REQUEST['moneda'];
        
        
        
        $db = new My();
        $db->Query("SELECT tel FROM sucursales WHERE suc = '$suc'");
        $db->NextRecord();
        $tel = $db->Record['tel'];
        
        $add = $add."+-------------- Tejidos ---------------+\n";
        $add = $add. "Nro: $factura    Fecha: $fecha\n";
        $add = $add."Cliente:  $cliente\n"; 
        $add = $add."C.I./RUC: $ruc\n"; 
        $add = $add."Tel:  $tel \n";
        $add = $add."  (No valido para Credito Fiscal)  \n";
        $add = $add."------------------------------------\n"; 
        //+----------------- Detalle --------------------+//
        $add = $add."#| Codigo |  Precio | Cant. | Subtotal |\n";

        $Nro = 0;
        $TOTAL = 0;        
        $TOTAL_DESCUENTO= 0;
        $TOTAL_BRUTO = 0;
        $desc_sedeco = 0;
        
        $t = new Y_Template("../ventas/Ticket.html");
                
        $db->Query("SELECT total,total_desc - desc_sedeco as total_desc,desc_sedeco,total_bruto, moneda FROM factura_venta where f_nro = $factura");
        $db->NextRecord();
        $TOTAL = $db->Record['total'];
        $TOTAL_DESCUENTO = $db->Record['total_desc'];
        $TOTAL_BRUTO = $db->Record['total_bruto'];
        $desc_sedeco = $db->Record['desc_sedeco'];
        $moneda = $db->Record['moneda'];
        $moneda = str_replace("$", "s", $moneda); 
        $decimales =0;
        if($moneda !== "Gs"){
            $decimales = 2;
        }
        
        $db->Query("SELECT codigo,lote,descrip,um_cod,cantidad,precio_venta,descuento, subtotal from fact_vent_det where f_nro = $factura");
        
        
        while($db->NextRecord()){
           $Nro++;
           //$codigo = $db->Record['codigo']; 
           $lote = $this->str_fill($db->Record['lote'],9); 
           $descrip = ucfirst( strtolower($db->Record['descrip'])) ; 
           //$um_cod = $db->Record['um_cod']; 
           $cantidad = $this->str_fill($db->Record['cantidad'],7,"L"); 
           $pv = $db->Record['precio_venta'];
           $tab_precio = 6;
           if($pv > 99999){   $tab_precio = 5;   } 
            
           $precio_venta = $this->str_fill(number_format($pv, $decimales, ',', '.'), $tab_precio, "L");
           
           $descuento = $db->Record['descuento']; 
           
           $subtotal_venta = $db->Record['subtotal'];
           $tab_subt = 12;
           //if($subtotal_venta > 99999){   $tab_subt = 10;   }if($subtotal_venta > 999999){   $tab_subt = 9;   }
           if($Nro > 9){$tab_subt--;}
           $subtotal = $this->str_fill(  number_format($subtotal_venta,$decimales,',','.')  ,$tab_subt,"L");   
           
         

           $add = $add."$Nro- $lote $precio_venta $cantidad $subtotal\n";
           $add = $add."".$descrip."\n";
        } 
        $add = $add." \n";
        $TOTAL_FACTURA = $this->str_fill(number_format(($TOTAL),$decimales,',','.'),11,"L","_");  
       
        
        $TOTAL_BRUTO= $this->str_fill(number_format($TOTAL_BRUTO,$decimales,',','.'),30,"L","_");  
        
        $add = $add."TOTAL.".$TOTAL_BRUTO." $moneda.\n";
         
        $DESC_SEDECO = "";
        if($desc_sedeco > 0){
            $DESC_SEDECO = $this->str_fill(number_format(-$desc_sedeco,0,',','.'),19,"L","_");  
        }
            
        
        if($TOTAL_DESCUENTO > 0){
            $TOTAL_DESCUENTO = $this->str_fill(number_format(-$TOTAL_DESCUENTO,$decimales,',','.'),8,"L","_");  
            $add = $add."AJUSTE REDONDEO  $DESC_SEDECO $moneda.\n";
            $add = $add."DESCUENTO (Pago en Efectivo)".$TOTAL_DESCUENTO." $moneda.\n";            
            $add = $add."TOTAL (Pago en Efectivo).".$TOTAL_FACTURA." $moneda.\n";
        }
               
        
        $add = $add." \n";
        $add = $add."Para devoluciones favor llamar antes de pasadas las 48 horas para registrar su solicitud.\n";
        $add = $add."     Gracias por su preferencia!    \n";
        $add = $add." \n";
        $add = $add." \n";
        $add = $add." \n";
        $add = $add." \n";
        //echo $add;
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
new TicketCaja();
?>

