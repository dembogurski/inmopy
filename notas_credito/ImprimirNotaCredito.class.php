<?php

/**
 * Description of ImprimirNotaCredito
 * @author Ing.Douglas
 * @date 01/07/2015
 */

require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php"); 
require_once("../Functions.class.php");
class ImprimirNotaCredito {
 
    function __construct() {
        $t = new Y_Template("ImprimirNotaCredito.html");
        $t->Show("header");
        $my = new My();
        date_default_timezone_set('UTC');
        $factura = $_REQUEST['factura'];
        $nro_nota = $_REQUEST['nro_nota'];
        $usuario = $_REQUEST['usuario'];
        $suc = $_REQUEST['suc'];
        $moneda = $_REQUEST['moneda'];
        $decimales = 0;
         
        $type = 0;
        $nombre_moneda = 'Guaranies';
        if($moneda != 'G$'){
          $type = 1;
          $nombre_moneda = 'Dolares';
          $decimales = 2;
        } 

        $hoy = date("d/m/Y");
        
        $t->Set('suc', $suc);
        $t->Set('time', date("m-d-Y H:i"));
        $t->Set('user', $_REQUEST['usuario']);
        $t->Set('papar_size', $_REQUEST['papar_size']);
        
        $my->Query("SELECT cliente,ruc_cli AS ruc,DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha, total,clase FROM nota_credito  WHERE n_nro = $nro_nota;");
        $my->NextRecord();
                 
        
        $cliente = $my->Record['cliente'];
        $ruc = $my->Record['ruc'];
        $fecha = $my->Record['fecha'];
        $clase = $my->Record['clase'];
        $TOTAL = $my->Record['total'];
        
         
        $fn = new Functions();
        
        $redondeado = number_format($TOTAL, $decimales, ',', '');
        
        $monto_en_letras = $fn->extense($TOTAL,$nombre_moneda,$type);   
        if($moneda != 'G$'){
           $redondeado = number_format($TOTAL, $decimales, ',', '.');                
           $monto_en_letras = $fn->extense($TOTAL,$nombre_moneda,$type);
        } 
        
        
        $t->Set('nro_nota',$nro_nota);        
        $t->Set('factura',$factura);
        $t->Set('ruc',$ruc);
        $t->Set('cliente',$cliente);
        $t->Set('fecha',$fecha);
        $t->Set('factura',$factura);
        
        $t->Set('moneda', str_replace("$","s", $moneda ));       
         
        $t->Show("head");
        
        $mostrar = "concat(codigo,'-',lote) as codigo";
        if($clase === "Servicio"){
            $mostrar = "codigo";
        }
        
        $sql = "SELECT $mostrar,descrip,um_prod,cantidad,precio_unit, subtotal FROM nota_credito_det d WHERE n_nro = $nro_nota";
        $my->Query($sql);
        
         
        $TOTAL_REF = 0;
         
        
        while($my->NextRecord()){
            $codigo = $my->Record['codigo'];
            $descrip = $my->Record['descrip'];
            $um_prod = $my->Record['um_prod'];
            $cantidad = $my->Record['cantidad'];
            $precio_unit = $my->Record['precio_unit'];
            $subtotal = $my->Record['subtotal']; 
            if($um_prod == "null"){
                $um_prod = "-";
            }
             
            
            $t->Set("codigo",$codigo);
            $t->Set("descrip",$descrip);
            $t->Set("um_prod",$um_prod);  
            $t->Set("cantidad",number_format($cantidad,2,',','.')); 
            $t->Set("precio_unit",number_format($precio_unit,2,',','.')); 
            $t->Set("subtotal",number_format($subtotal,2,',','.')); 
            
            $t->Show("data");
        }
        $t->Set('letras',$monto_en_letras);
        $t->Set('total',number_format($redondeado,$decimales,',','.')); 
         
        
         
        $t->Show("foot");
    }

}

new ImprimirNotaCredito();
?>