<?php

/**
 * Description of Logistica
 * @author Ing.Douglas
 * @date 20/07/2018
 */
require_once("../Y_DB_MySQL.class.php");
require_once("../Y_Template.class.php");

class Logistica {
   function __construct() {
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }

    function main() {
        $t = new Y_Template("Logistica.html");
        
        $tipo = $_REQUEST['tipo_rep'];
        $desde = $_REQUEST['desde'];
        $desde_eng = substr($desde, 6, 4) . '-' . substr($desde, 3, 2) . '-' . substr($desde, 0, 2);
        $hasta = $_REQUEST['hasta'];
        $hasta_eng = substr($hasta, 6, 4) . '-' . substr($hasta, 3, 2) . '-' . substr($hasta, 0, 2);
         
         
        $user = $_REQUEST['user'];
        $origen = $_REQUEST['suc_de'];
        $destino = $_REQUEST['suc_a'];
        
        $t->Set("suc_de", $origen);
        $t->Set("suc_a", $destino);
        
        $t->Set("desde", $desde);
        $t->Set("hasta", $hasta);
        $t->Set("desde_eng", $desde_eng);
        $t->Set("hasta_eng", $hasta_eng);
         
                
        $t->Set("user", $user);
        $t->Set("time", date("d-m-Y H:i"));    

        $t->Show("header");
         
        
        if($tipo == "Remisiones"){
            $t->Set("titulo", "Estadistico de Remisiones");
            $t->Show("head");
            remisiones($t,$desde_eng,$hasta_eng,$origen,$destino);
        }else if($tipo == "Pedidos"){
            $t->Set("titulo", "Estadistico de Pedidos");
            $t->Show("head");
            pedidos($t,$desde_eng,$hasta_eng,$origen,$destino);
        } 
    }

} 
function remisiones($t,$desde_eng,$hasta_eng,$origen,$destino){     
    $db = new My();
    $sql = "SELECT date_format(n.fecha_cierre,'%d-%m-%Y') as Fecha,n.suc AS Origen, n.suc_d AS Destino, COUNT(DISTINCT n.n_nro) AS CantRemisiones, COUNT(distinct d.paquete) AS Paquetes,   SUM(IF(d.tipo_control = 'Rollo', 1,0)) AS Rollos, SUM(IF(d.tipo_control = 'Pieza', 1,0)) AS Piezas, SUM(cantidad) AS SumaMetros, SUM(kg_env) AS SumaKGEnv
    FROM nota_remision n, nota_rem_det d WHERE n.n_nro = d.n_nro  AND n.suc = '$origen' AND n.suc_d = '$destino'  AND n.fecha_cierre BETWEEN '$desde_eng' AND '$hasta_eng'  AND n.estado ='Cerrada'  
    GROUP BY n.fecha_cierre, n.suc_d";   
      //  echo $sql;
    $db->Query($sql);
    $t->Show("cabecera_remisiones");
    $t_rem = 0;
    $t_paq =0;
    $t_roll =0;
    $t_pz =0;
    $t_mts = 0;
    $t_kg = 0;
    while($db->NextRecord()){
        $Fecha = $db->Record['Fecha'];
        $Origen = $db->Record['Origen'];
        $Destino = $db->Record['Destino'];
        $Remisiones = $db->Record['CantRemisiones'];
        $Paquetes = $db->Record['Paquetes'];
        $Rollos = $db->Record['Rollos'];
        $Piezas = $db->Record['Piezas'];
        $SumaMetros = $db->Record['SumaMetros'];
        $SumaKGEnv = $db->Record['SumaKGEnv'];
        
        $t_rem+=0+$Remisiones;
        $t_paq+=0+$Paquetes;
        $t_roll+=0+$Rollos;
        $t_pz+=0+$Piezas;
        $t_mts+=0+$SumaMetros;
        $t_kg+=0+$SumaKGEnv;
        
        $t->Set("fecha",$Fecha);
        $t->Set("origen",$Origen);
        $t->Set("destino",$Destino);
        $t->Set("remisiones",number_format($Remisiones, 0, ',', '.'));    
        $t->Set("paquetes",number_format($Paquetes, 0, ',', '.'));      
        $t->Set("rollos",number_format($Rollos, 0, ',', '.'));      
        $t->Set("piezas",number_format($Piezas, 0, ',', '.'));      
        $t->Set("metros",number_format($SumaMetros, 2, ',', '.'));       
        $t->Set("kilos",number_format($SumaKGEnv, 1, ',', '.'));        
        $t->Show("remisiones_data");   
    }
    $t->Set("t_remisiones",number_format($t_rem, 0, ',', '.'));   
    $t->Set("t_paquetes",number_format($t_paq, 0, ',', '.'));   
    $t->Set("t_rollos",number_format($t_roll, 0, ',', '.'));   
    $t->Set("t_piezas",number_format($t_pz, 0, ',', '.'));   
    $t->Set("t_metros",number_format($t_mts, 0, ',', '.'));   
    $t->Set("t_kilos",number_format($t_kg, 0, ',', '.'));   
    
    $t->Show("pie_remisiones");    
}    
function pedidos($t,$desde_eng,$hasta_eng,$origen,$destino){
    $db = new My();
    $sql = "SELECT  DATE_FORMAT(p.fecha_cierre,'%d-%m-%Y') AS Fecha,p.suc AS Origen, p.suc_d AS Destino, COUNT(DISTINCT p.n_nro) AS CantPedidos,COUNT(d.lote) AS Piezas,SUM(d.cantidad) AS SumaMetros  
    FROM pedido_traslado p, pedido_tras_det d WHERE p.n_nro = d.n_nro AND p.fecha_cierre BETWEEN '$desde_eng' AND '$hasta_eng' AND p.estado = 'Cerrada' AND p.suc = '$origen' AND p.suc_d = '$destino' GROUP BY p.fecha_cierre, p.suc_d";   
      //  echo $sql;
    $db->Query($sql);
    $t->Show("cabecera_pedidos");
    $t_rem = 0;
    $t_paq =0;
    $t_piez =0;
    $t_mts = 0;
    $t_kg = 0;
    while($db->NextRecord()){
        $Fecha = $db->Record['Fecha'];
        $Origen = $db->Record['Origen'];
        $Destino = $db->Record['Destino'];
        $Pedidos = $db->Record['CantPedidos'];          
        $Piezas = $db->Record['Piezas'];
        $SumaMetros = $db->Record['SumaMetros'];              
         
        
        $t_rem+=0+$Pedidos;
        
        $t_piez+=0+$Piezas;
        $t_mts+=0+$SumaMetros;
         
        
        $t->Set("fecha",$Fecha);
        $t->Set("origen",$Origen);
        $t->Set("destino",$Destino);
        $t->Set("pedidos",number_format($Pedidos, 0, ',', '.'));    
         
        $t->Set("piezas",number_format($Piezas, 0, ',', '.'));         
        $t->Set("metros",number_format($SumaMetros, 2, ',', '.'));       
        
        $t->Show("pedidos_data");   
    }
    $t->Set("t_pedidos",number_format($t_rem, 0, ',', '.'));  
     
    $t->Set("t_piezas",number_format($t_piez, 0, ',', '.'));   
    $t->Set("t_metros",number_format($t_mts, 0, ',', '.'));   
    
    
    $t->Show("pie_pedidos");        
}

new Logistica();
?>