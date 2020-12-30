<?php

/**
 * Description of CargarReserva
 * @author Ing.Douglas
 * @date 04/05/2015
 */
require_once("../Y_DB_MySQL.class.php");
require_once("../Y_Template.class.php");

class CargarReserva {
    
    function __construct() {
        //$session = $_POST['session'];
        $usuario = $_POST['usuario']; 
        $reserva = $_POST['reserva']; 
        
        $db = new My();
  
        $t = new Y_Template("Reserva.html");
       
        
        $t->Show("header");
        $t->Show("titulo_reserva");
        $t->Set("reserva",$reserva);
        
        $db->Query("SELECT   cod_cli ,ruc_cli AS ruc, cliente ,cat FROM reservas WHERE  usuario = '$usuario' AND nro_reserva  = '$reserva'");
         
        if($db->NumRows()>0){
            $db->NextRecord();
            $cli_cod = $db->Record['cod_cli'];
            $ruc = $db->Record['ruc'];
            $cliente = $db->Record['cliente'];
            $cat = $db->Record['cat'];
            $t->Set("cli_cod",$cli_cod);
            $t->Set("ruc",$ruc);
            $t->Set("cliente",$cliente);
            $t->Set("cat",$cat);
            
            $t->Show("cabecera_reserva_existente");
            $t->Show("area_carga_cab");
            //$t->Set("finalizar_state","disabled"); 
            
            $db = new My();
            $db->Query("SELECT codigo,lote,descrip,um as um_cod ,cantidad,precio as precio_venta,subtotal from reservas_det where nro_reserva =  $reserva");
            $TOTAL = 0;
            $TOTAL_DESCUENTO= 0;
            while($db->NextRecord()){
               
               $codigo = $db->Record['codigo']; 
               $lote = $db->Record['lote']; 
               $descrip = $db->Record['descrip']; 
               $um_cod = $db->Record['um_cod']; 
               $cantidad = $db->Record['cantidad']; 
               $precio_venta = $db->Record['precio_venta']; 
                
               $subtotal = $db->Record['subtotal']; 
               $TOTAL+=0+$subtotal;
                
               $t->Set("codigo",$codigo);
               $t->Set("lote",$lote);
               $t->Set("descrip",$descrip);
               $t->Set("um",$um_cod);
               $t->Set("cant", number_format($cantidad,2,',','.'));   
               $t->Set("precio", number_format($precio_venta,0,',','.'));  
               $t->Set("subtotal",number_format($subtotal,0,',','.'));    
               $t->Set("finalizar_state",""); 
               $t->Show("area_carga_data");
            } 
            $t->Set("TOTAL",number_format($TOTAL,0,',','.'));
             
            $t->Show("area_carga_foot");    
                        
        }else{
            echo "Ocurrio un Error con respecto a la Factura Nro: $factura, Contacte con el Administrador";
            die();
        }
        
    } 
}
new CargarReserva();
?>
