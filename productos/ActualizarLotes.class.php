<?php

/**
 * Description of ActualizarLotes
 * @author Ing.Douglas
 * @date 16/01/2017
 */
require_once("../Y_Template.class.php");
require_once("../Config.class.php");
require_once("../Y_DB_MySQL.class.php");
require_once("../Functions.class.php");
    

class ActualizarLotes {
  function __construct(){
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }         
   }
   function main(){
        $t = new Y_Template("ActualizarLotes.html");        
        $t->Show("header");
        $c = new Config();
        $host = $c->getNasHost();
        $path = $c->getNasFolder();
        $images_url = "http://$host/$path";
        $t->Set("images_url", $images_url);
        
        $usuario = $_REQUEST['usuario'];
        
        $f = new Functions();
        $permiso = $f->chequearPermiso("9.9", $usuario);      
        if($permiso != "---"){
           $t->Set("permisos_extras","style='display:table-cell'"); 
        }else{
           $t->Set("permisos_extras","style='display:none'");   
        }
        
        $modificar_kg = $f->chequearPermiso("9.9.1", $usuario);  
	if($modificar_kg != "---" ){
           $t->Set("view_only","");  
        }else{           
           $t->Set("view_only","readonly='readonly'");  				   
        } 
        
        $permiso_fallas = $f->chequearPermiso("9.13", $usuario);      
        if($permiso_fallas != "---"){
           $t->Set("permiso_fallas","true"); 
        }else{
           $t->Set("permiso_fallas","false");   
        }
        $t->Show("body"); 
        
        require_once("../utils/NumPad.class.php");            
        new NumPad();    
   }
}
function getStockDeOtraSucursal(){
    $suc = $_REQUEST['suc'];
    $codigo = $_REQUEST['codigo'];
    $lote = $_REQUEST['lote'];
     
    $sql = "select suc as Suc, cantidad as Stock from stock where lote = '$lote'  and suc != '$suc' and codigo = '$codigo' and cantidad > 0 and estado_venta <> 'FP'" ;
    $array = array();
    $db = new My();
    $db->Query($sql);
    while ($db->NextRecord()) {
        array_push($array, array_map('utf8_encode', $db->Record));
    }
    $db->Close();
    echo json_encode($array);
}
function actualizarLote(){
    try{
        $usuario = $_REQUEST['usuario'];
        $suc = $_REQUEST['suc'];
        $codigo = $_REQUEST['codigo'];
        $lote = $_REQUEST['lote'];
        $descrip = $_REQUEST['descrip'];
          
        $kg = $_REQUEST['kg'];
        $tara = $_REQUEST['tara'];
        $ancho = $_REQUEST['ancho'];
        $gramaje = $_REQUEST['gramaje'];
        
        $obs = $_REQUEST['obs'];
        
        if($ancho == ""){     $ancho = 'NULL';       }
        if($gramaje == ""){     $gramaje = 'NULL';       }
        
        $estado_venta = $_REQUEST['estado_venta'];
        
        $db = new My();
        $sql = "INSERT INTO edicion_lotes( usuario, codigo, lote, descrip, fecha, hora, suc, estado_venta,tara,ancho,gramaje,kg, obs)VALUES ( '$usuario', '$codigo', '$lote', '$descrip', CURRENT_DATE, CURRENT_TIME, '$suc', '$estado_venta',$tara,$ancho,$gramaje,$kg, '$obs');";         
        $db->Query($sql);
        
        $updates = array();
        
        $tara > 0 ? array_push($updates,"tara = $tara") : "";
        $ancho > 0 ? array_push($updates,"ancho = $ancho") : "";
        $gramaje > 0 ? array_push($updates,"gramaje = $gramaje") : "";
        
        $datos = "";
        
        foreach ($updates as $upd) {
            $datos .="$upd,";
        }
        $datos  = substr($datos, 0, -1); 
        
        $upd = "UPDATE lotes SET $datos WHERE codigo = '$codigo' AND lote = '$lote'";
        $db->Query($upd);
        
        $upd = "UPDATE stock SET estado_venta = '$estado_venta'  WHERE codigo = '$codigo' AND lote = '$lote' and suc ='$suc'";
        $db->Query($upd);
        
        actualizarPendienteControl($lote,$suc,$usuario);
        
        $desc = fopen("../logs/sql.log", "a");
        $datetime = date("d-m-Y H:i:s");
        $log = "[$datetime] $sql";
        fputs($desc, $log . "\n");
        fclose($desc);
        
        echo "Ok";
    }catch(Exception $e){
       echo $e->getTraceAsString()+" Archivo:".__FILE__." Linea: ".__LINE__;
    }
}

function registrarFalla(){
    require_once("../Functions.class.php");
    $f = new Functions();
    
    $usuario = $_REQUEST['usuario'];
    $suc = $_REQUEST['suc'];
    $codigo = $_REQUEST['codigo'];
    $lote = $_REQUEST['lote'];
    $padre = $_REQUEST['padre'];
    $tipo_falla = $_REQUEST['tipo_falla'];
    $mts = $_REQUEST['mts'];
    
    $sql = "SELECT cant_ent - cantidad AS vendido,cantidad AS stock FROM stock WHERE codigo ='$codigo' and  lote = '$lote'";
    $vendido = $f->getResultArray($sql)[0]['vendido'];
    $stock = $f->getResultArray($sql)[0]['stock'];
    
    $mts_inv = $mts + $vendido;
    
    $sql = "INSERT INTO fallas (  codigo, lote, padre, tipo_falla, usuario, fecha, mts, mts_inv,stock_actual)"
            . "VALUES ( '$codigo', '$lote', '$padre', '$tipo_falla', '$usuario', CURRENT_TIMESTAMP, NULL, $mts_inv,$stock);";
    $db = new My();
    $db->Query($sql);
     
    echo json_encode(array("mensaje"=>"Ok"));
}

/**
 * Actualizacion de estado Fuera de Rango en detalle de remision
 */
function actualizarPendienteControl($lote,$suc,$user){
    $verifDataRef = verificarPendienteControl($lote,$suc);
    if($verifDataRef){
        $link = new My();
        $rem = $verifDataRef['n_nro'];
        $link->Query("update nota_rem_det set estado='Pendiente' , verificado_por='$user' where lote = '$lote' and n_nro = $rem;");
        $link->Close();
        return true;
    }
    return false;
}

/**
 * Verifica si un lote esta pendiente de proceso por recepción fuera de rango 
*/
function verificarPendienteControl($lote,$suc){
    $link = new My();
    $data = array();
    $link->Query("select r.n_nro,r.suc as Origen,r.fecha_cierre, r.recepcionista from nota_rem_det d inner join nota_remision r using(n_nro) where d.estado='FR' and (d.verificado_por = '' or d.verificado_por is null) and r.suc_d='$suc' and d.lote = '$lote'");
   
    if($link->NumRows()>0){
        $link->NextRecord();
        $data = $link->Record;
    }
    $link->Close();
    return count($data)>0?$data:false;
}

new ActualizarLotes();
?>

 