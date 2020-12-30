<?php
  
/**
 * Description of SolicitudesPendientesAutorizacion
 *
 * @author Doglas
 */

require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");
require_once("../Config.class.php");
require_once("../Functions.class.php");   

class SolicitudesPendientesAutorizacion {
     function __construct() {
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }

    function main() {       
        $usuario = $_POST['usuario'];  
        $t = new Y_Template("SolicitudesPendientesAutorizacion.html");
         
        $c = new Config();
        $host = $c->getNasHost();
        $path = $c->getNasFolder();
        $images_url = "http://$host/$path";
        $t->Set("images_url",$images_url);
        $t->Set("sucursales",$sucursales);
         
        $db = new My();
        $db->Query("SELECT valor FROM parametros WHERE clave = 'porc_valor_minimo'");
        $db->NextRecord();      
        $porc_valor_minimo = $db->Get("valor");
        
        $t->Show("headers");
         
        
         
        $t->Show("solicitudes_abiertas_cab");
        
        
         
        $db->Query("SELECT n_nro AS Nro,usuario AS Usuario,DATE_FORMAT(fecha,'%d-%m-%Y') AS Fecha,cod_cli, cliente,estado AS Estado,suc AS Origen,suc_d AS Destino, moneda FROM pedido_traslado WHERE estado = 'Req.Auth'  ");
        
        $dbd = new My();
        
        while($db->NextRecord()){
            $Nro = $db->Record['Nro'];
            $Usuario = $db->Record['Usuario'];
            $Fecha = $db->Record['Fecha'];
            $Cod_cli = $db->Record['cod_cli'];
            $Cliente = $db->Record['cliente'];
            $Estado = $db->Record['Estado'];
            $Origen = $db->Record['Origen'];
            $Destino = $db->Record['Destino'];
            $Moneda = $db->Record['moneda'];
            $t->Set("nro",$Nro); 
            $t->Set("usuario",$Usuario); 
            $t->Set("fecha",$Fecha); 
            $t->Set("origen",$Origen); 
            $t->Set("destino",$Destino); 
            $t->Set("cod_cli",$Cod_cli); 
            $t->Set("cliente",$Cliente); 
            $t->Set("estado",$Estado); 
            $t->Set("moneda", str_replace("$","s",$Moneda)); 
            
            $dec = 0;
            if($Moneda != "G$"){
                $dec = 2;
            }
            
            
            $t->Show("solicitudes_abiertas_data");
            $dbd->Query("SELECT d.lote,d.descrip,cantidad,precio_cat,a.costo_prom,precio_venta,ROUND((cantidad*precio_venta),2) AS subtotal,color,l.img FROM pedido_tras_det d, lotes l, articulos a WHERE a.codigo = l.codigo    AND d.lote = l.lote AND  n_nro =  $Nro");
          
            $TotalFactura = 0;
            $TotalFacturaCat = 0;
            
            while($dbd->NextRecord()){
              
                $lote = $dbd->Record['lote'];
                $descrip = $dbd->Record['descrip'];
                $color = $dbd->Record['color'];
                $cantidad = $dbd->Record['cantidad'];
                $mayorista = $dbd->Record['mayorista'];
                $urgente = $dbd->Record['urgente'];
                $precio_cat = $dbd->Record['precio_cat'];
                $costo_prom = $dbd->Record['costo_prom'];
                $precio_venta = $dbd->Record['precio_venta'];
                $subtotal = $dbd->Record['subtotal'];
                $obs = $dbd->Record['obs'];
                $img = $dbd->Record['img'];
                
                $subtotal_cat = $cantidad * $precio_cat;
                
                $TotalFactura +=0+$subtotal;
                $TotalFacturaCat +=0+$subtotal_cat;
                
                $src = "$images_url/$img.thum.jpg";              
                
                $p_valmin = $costo_prom + (($costo_prom * $porc_valor_minimo) / 100);
                
                $t->Set("lote",$lote);
                $t->Set("descrip",$descrip);
                $t->Set("color",$color);
                $t->Set("cantidad",number_format($cantidad, 2, ',', '.'));  
                $t->Set("subtotal",number_format($subtotal, $dec, ',', '.'));  
                $t->Set("mayorista",$mayorista);
                $t->Set("urgente",$urgente);
                $t->Set("precio_cat",number_format($precio_cat, $dec, ',', '.'));
                $t->Set("p_valmin",number_format($p_valmin, $dec, ',', '.'));  
                $t->Set("precio",number_format($precio_venta, $dec, ',', '.'));  
                $t->Set("obs",$obs);
                $t->Set("img",$src);
                $t->Set("display_obs","none"); 
                if($obs != ""){
                   $t->Set("display_obs","table-cell"); 
                }
                $t->Show("solicitudes_abiertas_detalle"); 
            }
            $Diff = $TotalFactura - $TotalFacturaCat ;
            
            $t->Set("subtotal",number_format($TotalFactura, $dec, ',', '.'));  
            $t->Set("diff",number_format($Diff, $dec, ',', '.'));  
            $t->Show("solicitudes_abiertas_fin_data"); 
            
        }
         
        $t->Show("solicitudes_abiertas_foot"); 
        
    }
    
}

function aprobarSoliciutd(){
    $nro = $_REQUEST['nro'];
    $usuario = $_REQUEST['usuario'];
    $db = new My();
    $db->Query("SELECT suc_d FROM pedido_traslado WHERE n_nro = $nro");
    $db->NextRecord();
    $suc_d = $db->Get('suc_d');
    
    $db->Query("UPDATE pedido_traslado SET estado = 'Pendiente', auth_por = '$usuario' WHERE n_nro = $nro");
    $db->Query("UPDATE pedido_tras_det d, reg_ubic r  SET d.ubic = CONCAT(nombre,'-',fila,'-',col) ,d.nodo =  r.col, pallet = nro_pallet   WHERE d.codigo = r.codigo AND r.lote = d.lote AND r.suc = '$suc_d' AND  n_nro = $nro");
    echo json_encode(array("estado"=>"Ok"));
}
function rechazarSoliciutd(){
    $nro = $_REQUEST['nro'];
    $usuario = $_REQUEST['usuario'];
    $db = new My();
    $db->Query("UPDATE pedido_traslado SET estado = 'Abierta', auth_por = '$usuario' WHERE n_nro = $nro");
    echo json_encode(array("estado"=>"Ok"));
}

new SolicitudesPendientesAutorizacion();

?>