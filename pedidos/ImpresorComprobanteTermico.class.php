<?php

/**
 * Description of ImpresorReciboTermico
 * @author Ing.Douglas
 * @date 06/06/2018
 */
require_once '../Y_DB_MySQL.class.php';
require_once("../Y_Template.class.php");
require_once("../Functions.class.php");

class ImpresorComprobanteTermico {
     
    function __construct() {
        $db = new My();

        $db->Query("SET lc_time_names = 'es_PY';");

        $Nro = $_REQUEST['nro'];
        $t = new Y_Template("ImpresorComprobanteTermico.html");


        $t->Show("header");
        $db->Query("SELECT  cod_cli  ,cliente,usuario  FROM pedido_traslado WHERE n_nro =  $Nro;");

        $db->NextRecord();
         
        $Fecha = date("d-m-Y");
        $Hora = date("H:i");
         
        $cod_cli = $db->Record['cod_cli'];
        $cliente = $db->Record['cliente'];
        $usuario = $db->Record['usuario'];
        $t->Set("nro", $Nro);
        
        $t->Set("fecha", $Fecha);
        $t->Set("hora", $Hora);
        
        
        $t->Set("cliente", $cliente);

        $db->Query("SELECT CONCAT(nombre,' ',apellido) as nombre FROM usuarios WHERE usuario = '$usuario'");
        $db->NextRecord();
        $nombre = $db->Record['nombre'];
        $t->Set("vendedor", $nombre);
        
        if($cod_cli != ''){
            $my = new My();
            $my->Query("SELECT ci_ruc FROM clientes WHERE cod_cli = '$cod_cli'");
            $my->NextRecord();
            $ruc_cli = $my->Record['ruc_cli'];         
            $t->Set("ruc", $ruc_cli);
        }
        $t->Show("rec_head");

       
        $db->Query(" SELECT codigo,descrip,SUM(cantidad) AS cantidad,um_prod AS um_cod, precio_venta AS precio_venta, SUM(precio_venta * cantidad) AS subtotal FROM pedido_tras_det WHERE n_nro = $Nro GROUP BY descrip,precio_venta ORDER BY  descrip ASC");
        $fill = "";
        if ($db->NumRows() > 0) {
            
            $total  = 0;
            while ($db->NextRecord()) {
                $a =  explode("-",$db->Record['descrip']);
                $descrip = $a[1]." ".$a[2];
                $cantidad = $db->Record['cantidad'];
                $pv = $db->Record['precio_venta']; 
                $precio_venta = number_format($pv,0,',','.');  
                $subtotal =   number_format($pv * $cantidad,0,',','.');  
                
                $total += 0+($pv * $cantidad);
                
                $t->Set("descrip", $descrip);
               
                $sp0 = $this->fill(10);
                $t->Set("cant", $cantidad);
                $len = 41-strlen($cantidad."$sp0".$precio_venta );
                
                $sp1 = $this->fill($len );
                $t->Set("sp0", $sp0); 
                $t->Set("sp1", $sp1); 
                $t->Set("precio", $precio_venta); 
                $t->Set("subtotal", $subtotal); 
                $t->Show("detalle"); 
            }      
        }
        $t->Set("total",  number_format($total,0,',','.'));
        $t->Set("sp_total", $this->fill(44 - strlen($total."Total"))); 
                        
        $t->Set("sp_facturas",$sp_fac);
        $t->Show("pie_detalle_facturas");

        //$db->Query("select nombre,voucher, monto from convenios where trans_num = $nro_cobro;");

        $t->Show("rec_foot");
    }
    function fill($len){
        $sp = "";
        for($i = 0; $i <$len; $i++){
            $sp.="_";//&nbsp;
        }
        return $sp;
    }    
    function calcFirstPos($string) { 
        return 30 - strlen($string);         
    }
    function calcScondPos($firstStr,$secondStr,$lastStr) { 
        $lastlength = strlen(number_format($lastStr, 0, ',', '.'));
        $calc = strlen($firstStr) + $this->calcFirstPos($firstStr) + strlen($secondStr) + $lastlength; 
        //echo 54 - $calc."<br>";
        return 62 - $calc;         
    }
}



new ImpresorComprobanteTermico();
?>
