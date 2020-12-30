<?php

/**
 * Description of VentasDiscriminadas
 * @author Ing.Douglas
 * @date 22/11/2016
 */
require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");


class VentasDiscriminadas {
 
 
    function __construct() {
        //$session = $_POST['session'];
        $usuario = $_POST['usuario'];        
        $suc     = $_POST['suc'];
                
        $db = new My();
         
        
        $db->Query("SELECT f_nro as nro, DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha, cod_cli ,ruc_cli AS ruc, cliente, cat , total,total_desc,total_bruto, estado,usuario,clase    
        FROM factura_venta WHERE estado = 'Abierta'  AND suc = '$suc'");
        
        // $t = new Y_Template("FacturaVenta.html");
        
        
        $va = new Y_Template("VentasAbiertas.html");
        $va->Show("header");
        $va->Set("suc",$suc);
        $va->Set("usuario",$usuario);
            
        $va->Show("ventas_abiertas_cab");
        
        while($db->NextRecord()){
            $nro = $db->Record['nro'];   
            $fecha = $db->Record['fecha'];
            $cod_cli = $db->Record['cod_cli'];
            $ruc = $db->Record['ruc'];   
            $cliente = $db->Record['cliente'];   
            $cat = $db->Record['cat'];   
            $total = $db->Record['total'];   
            $total_desc = $db->Record['total_desc']; 
            $total_bruto = $db->Record['total_bruto']; 
            $estado = $db->Record['estado'];  
            $vendedor = $db->Record['usuario'];  
            $clase =   $db->Record['clase'];   
            
            $va->Set("nro",$nro);
            $va->Set("fecha",$fecha);
            $va->Set("cliente",$cliente);
            $va->Set("cod_cli",$cod_cli);
            $va->Set("cat",$cat);
            $va->Set("ruc",$ruc);             
            $va->Set("total_neto", number_format($total,0,',','.'));    
            $va->Set("total_desc", number_format($total_desc,0,',','.'));    
            $va->Set("total_bruto", number_format($total_bruto,0,',','.'));    
            $va->Set("estado",$estado);
            $va->Set("vendedor",$vendedor);   
            $va->Set("clase"," $clase");
            $va->Show("ventas_abiertas_data");
            
        }        
        
        $va->Show("ventas_abiertas_foot");  
    }
    
}

new VentasDiscriminadas();
?>