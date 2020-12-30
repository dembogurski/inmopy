<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


require_once("../Y_DB_MySQL.class.php"); 
require_once("../Y_Template.class.php");
 

class OrdenesFabricacion  {
    
    function __construct() {
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }

    function main() {
        
        
        $desde = $_REQUEST['desde'];
        $desde_eng = substr($desde, 6, 4) . '-' . substr($desde, 3, 2) . '-' . substr($desde, 0, 2);
        $hasta = $_REQUEST['hasta'];
        $hasta_eng = substr($hasta, 6, 4) . '-' . substr($hasta, 3, 2) . '-' . substr($hasta, 0, 2);
        $usuario = $_REQUEST['usuario'];
         
        $estado = $_REQUEST['estado'];
         
        $t = new Y_Template("OrdenesFabricacion.html");
        $t->Show("header");

        $t->Set("desde", $desde);
        $t->Set("hasta", $hasta);
        $t->Set("desde_eng", $desde_eng);
        $t->Set("hasta_eng", $hasta_eng);
        
        
        $t->Set("estado", $estado);
        $t->Set("user", $user);
        $t->Set("time", date("d-m-Y H:i"));
        
        $t->Show("head");
        $db = new My();
        
        
        $Qry = "SELECT o.nro_orden,  cliente,usuario,DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha,suc,estado,codigo,descrip,design,cantidad,largo AS medida,o.obs    
        FROM orden_fabric o INNER JOIN orden_det d ON o.nro_orden = d.nro_orden  WHERE o.fecha BETWEEN '$desde_eng' AND '$hasta_eng' AND estado like '$estado'"; 
        $db->Query($Qry); 
        $t->Show("cabecera");
        
        $count = 0;
        
        while($db->NextRecord()){
            
            $nro_orden = $db->Record['nro_orden'];
             
            $cliente= $db->Record['cliente'];
            $usuario= $db->Record['usuario'];
            $fecha= $db->Record['fecha'];
            $suc= $db->Record['suc'];
            $estado= $db->Record['estado'];
            $codigo= $db->Record['codigo'];            
            $descrip= $db->Record['descrip'];
            $design= $db->Record['design'];  
            $cantidad= $db->Record['cantidad'];  
            $medida= $db->Record['medida'];  
            $obs= $db->Record['obs'];  
             
            
            $t->Set("nro_orden",$nro_orden);
             
            $t->Set("cliente",$cliente);            
            $t->Set("usuario",$usuario);
            $t->Set("fecha",$fecha);
            $t->Set("suc",$suc);
            $t->Set("estado",$estado);
            $t->Set("codigo",$codigo);
            $t->Set("descrip",$descrip);
            $t->Set("design",$design);
            $t->Set("cantidad", number_format($cantidad,0,',','.'));  
            $t->Set("medida", number_format($medida,2,',','.'));  
            $t->Set("obs",$obs);
            $t->Show("data");          
            
        }   
        $t->Show("footer");               
        
    }   
}

 

function getEstado(){
    $nro_orden = $_REQUEST['nro_orden'];
    $estado = $_REQUEST['estado'];
    $requerido = $_REQUEST['requerido'];
    $db = new My();
    if($estado == "En Proceso"){
        $db->Query("SELECT COUNT(*) AS piezas, SUM(cant_lote) AS emitido FROM emis_det  WHERE nro_orden = $nro_orden");  
        if($db->NumRows()>0){
            $db->NextRecord();
            $piezas = $db->Record['piezas'];
            $emitido = $db->Record['emitido'];
            $porc = round(($emitido * 100) / $requerido,2);
            echo "<div><b>Mts Requeridos: </b> $requerido,            <b>Piezas Emitidas:</b> $piezas <b>Mts Emitidos:</b> $emitido            "
                    . "<div class='progreess_container'> <div class='progress' style='width:$porc%' >  $porc% </div> </div> </div><br>";
        }
        
        $qry = "SELECT f.cantidad AS pedido, sum(cant_frac) as cortes, f.largo as medida FROM emis_produc e, emis_det d, orden_fabric o , orden_det f  
        WHERE e.nro_orden = d.nro_orden AND e.nro_orden = o.nro_orden AND o.nro_orden = f.nro_orden AND  e.nro_orden = $nro_orden AND   cant_frac > 0 AND d.codigo_om IS NULL and f.largo = d.largo";
        
        $db->Query($qry);
        if($db->NumRows()>0){
             
            $db->NextRecord();
            $pedido = $db->Record['pedido'];    
            $cortes = $db->Record['cortes'];    
            //$medida = $db->Record['medida']; 
            $porcentaje =  0;
            if($cortes != null){
                $porcentaje =  round(($cortes  * 100 ) / $pedido,2);                 
            }else{
                $cortes = 0;
            } 
            
            echo "<div style='width:100%'> <div style='float:left;width:60%'> <b>Cantidad de Cortes hasta el momento: </b> $cortes,            <b>Porcentaje Producido:</b> $porcentaje %   </div> "
                    . "<div class='progreess_container_produccion'> <div class='progress_produccion' style='width:$porcentaje%' >  $porcentaje% </div> </div></div>";
        } 
        
    }else if($estado == "Cerrada"){
        $qry = "SELECT usuario,DATE_FORMAT(fecha,'%d/%m/%Y %h:%i') AS fecha, codigo,lote,descrip,color,design ,cant_frac AS unidades FROM prod_terminado WHERE nro_orden = $nro_orden";
        
        $db->Query($qry);
        
        $table = '<table border="1" class="tabla">';
        $table.='<tr><th>Usuario</th><th>Fecha</th><th>Codigo</th><th>Lote</th><th>Descrip</th><th>Color</th><th>Dise&ntilde;o</th><th>Unidades</th></tr>';
        while($db->NextRecord()){
            $usuario = $db->Record['usuario'];
            $fecha = $db->Record['fecha'];
            $codigo = $db->Record['codigo'];
            $lote = $db->Record['lote'];
            $descrip = $db->Record['descrip'];  
            $color = $db->Record['color'];
            $design =  $db->Record['design'] ; 
            $unidades = $db->Record['unidades'];
            $table.="<tr><td class='itemc'>$usuario</td><td  class='itemc'>$fecha</td><td  class='itemc'>$codigo</td><td  class='itemc'>$lote</td><td  class='item'>$descrip</td><td  class='item'>$color</td><td  class='item'>$design</td><td  class='num'>$unidades</td></tr>";
        }
        $table.='</table>';
        echo $table;
         
    }else{
        
    }
}
 

new OrdenesFabricacion();

?>