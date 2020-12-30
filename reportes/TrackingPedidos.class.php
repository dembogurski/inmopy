<?php

/**
 * Description of TrackingPedidos
 * @author Ing.Douglas
 * @date 26/05/2017
 */
require_once("../Y_DB_MySQL.class.php");
require_once("../Y_Template.class.php");

class TrackingPedidos {

    function __construct() {
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }

    function main() {
        $t = new Y_Template("TrackingPedidos.html");

        $desde = $_GET['desde'];
        $hasta = $_GET['hasta'];
        
        $desde_eng = substr($desde, 6, 4) . '-' . substr($desde, 3, 2) . '-' . substr($desde, 0, 2);        
        $hasta_eng = substr($hasta, 6, 4) . '-' . substr($hasta, 3, 2) . '-' . substr($hasta, 0, 2);
                
        $suc = $_GET['suc'];
        $destino = $_GET['select_suc'];
        $select_user = $_GET['select_user'];
        $articulo = strtoupper( $_GET['articulo']);
 
        $t->Set("suc_d", $destino);
        $t->Set("articulo", $articulo);
                
        $t->Set("user", $_GET['user']);
        $t->Set("time", date('d-m-Y H:i'));
        $t->Set("desde", $_GET['desde']);
        $t->Set("hasta", $_GET['hasta']);
        $t->Show("header");
        
        $t->Show("head");

        $db = new My();
        $db->Query("SELECT p.n_nro AS nro,usuario,DATE_FORMAT(fecha_cierre,'%d-%m-%Y') AS fecha,fecha_cierre as fecha_ing,hora_cierre as hora,suc,suc_d,codigo,lote,lote_rem as remplazo,descrip,color,cantidad,mayorista,urge,d.estado,d.obs FROM pedido_traslado p, pedido_tras_det d WHERE p.n_nro = d.n_nro AND p.fecha_cierre BETWEEN '$desde_eng' and '$hasta_eng' and p.suc = '$suc' AND p.usuario LIKE '$select_user' and p.suc_d like '$destino'  AND (d.descrip LIKE '%$articulo%' or color LIKE '%$articulo%') ");
        $i = 0;
        $old_nro = 0;
        while($db->NextRecord()){
            $nro = $db->Record['nro'];
            if($old_nro != $nro){
                if($old_nro != 0){
                   $t->Show("foot");
                }
                $usuario = $db->Record['usuario'];
                $fecha = $db->Record['fecha'];
                $hora = $db->Record['hora'];
                $suc = $db->Record['suc'];
                $suc_d = $db->Record['suc_d'];
                
                $t->Set("nro", $nro);
                $t->Set("usuario", $usuario);
                $t->Set("fecha", $fecha);
                $t->Set("hora",$hora);  
                $t->Set("origen_destino",$suc." -> ".$suc_d); 
                
                $t->Show("cabecera");                 
            }
            $old_nro = $nro;
             
            $i++;
            $codigo = $db->Record['codigo'];
            $lote = $db->Record['lote'];
            $remplazo = $db->Record['remplazo'];
            $descrip = $db->Record['descrip'];
            $obs = $db->Record['obs'];
            $color = $db->Record['color'];
            if($articulo!= "%"){
                $descrip = str_ireplace($articulo,'<span class="resaltar">'.$articulo.'</span>', $descrip);                
            }
            
            $cantidad = $db->Record['cantidad'];
            $mayorista = $db->Record['mayorista'];
            $urge = $db->Record['urge'];
            $estado = $db->Record['estado'];
            $fecha_ing = $db->Record['fecha_ing'];

            $t->Set("codigo", $codigo);
            $t->Set("lote", $lote);
            $t->Set("remplazo", $remplazo);  
            $t->Set("fecha_ing", $fecha_ing);
            $t->Set("descrip", $descrip);
            $t->Set("obs", $obs);
            $t->Set("color", $color);        
            $t->Set("cantidad", $cantidad);        
            $t->Set("mayorista", $mayorista);        
            $t->Set("urge", $urge);        
            $t->Set("estado", $estado);  
            $t->Set("clase_estado", strtolower( str_replace(" ", "_",$estado)   )); 
            $t->Show("data");            
        }        
       
    }
}

function getHistorial(){
   $fecha = $_REQUEST['fecha'];   
   $lote = $_REQUEST['lote'];
   $remplazo = $_REQUEST['remplazo'];
   
   $db = new My();
   $Qry = "SELECT r.n_nro AS nro_rem, CONCAT(suc,'->',suc_d) AS origen_d,DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha,DATE_FORMAT(fecha_cierre,'%d-%m-%Y') AS fecha_cierre,hora_cierre,r.estado, codigo,lote,descrip,cantidad,transportadora,nro_levante
   FROM nota_remision r, nota_rem_det d WHERE r.n_nro = d.n_nro AND   (lote = '$lote' OR lote ='$remplazo')  AND fecha >= '$fecha'";
   $db->Query($Qry);
   $array = array();
     
   while ($db->NextRecord()) {
        array_push($array, $db->Record);
   }
   $db->Close();
   echo json_encode($array);
}


new TrackingPedidos();
?>
