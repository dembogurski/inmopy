<?php

/**
 * Description of RemisionesAbiertas
 * @author Ing.Douglas
 * @date 04/01/2016
 */
require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");

class RemisionesAbiertas {
     function __construct() {
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }

    function main() {
    
        $suc = $_REQUEST['suc'];
        $tipo = $_REQUEST['tipo'];
        $t = new Y_Template("RemisionesAbiertas.html"); 
        $t->Set("suc",$suc);
         
        
        if($tipo == "Tejidos" || $tipo == ""  ){
            $t->Set("TejidosChequed","checked='checked'");
            $t->Set("InsumosChequed","");
            $tipo =  "Tejidos";
        }else{
            $t->Set("InsumosChequed","checked='checked'");
            $t->Set("TejidosChequed","");
        } 
        
        $t->Show("header");
        
        $t->Show("remitos_abiertos_cab");
        
        
        
        
        $db = new My();
        $db->Query("SELECT r.n_nro, DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha, hora, usuario, suc, suc_d, obs,COUNT(d.lote) AS items, r.estado,
            SUM( IF(d.codigo LIKE 'IN%',1,0) ) AS Insumos, SUM( IF(d.codigo LIKE 'IN%',0,1) ) AS Tejidos  
            FROM  nota_remision r LEFT JOIN nota_rem_det d ON r.n_nro = d.n_nro  WHERE r.estado = 'Abierta' AND suc = '$suc' GROUP BY r.n_nro HAVING  $tipo > 0");
        
        while($db->NextRecord()){
            $nro = $db->Record['n_nro'];
            $fecha = $db->Record['fecha'];
            $hora = $db->Record['hora'];
            $usuario = $db->Record['usuario'];
            $suc = $db->Record['suc'];
            $suc_d = $db->Record['suc_d'];
            $items = $db->Record['items'];
            $obs = $db->Record['obs'];
            $estado = $db->Record['estado']; 
            $t->Set("nro",$nro);
            $t->Set("fecha",$fecha);
            $t->Set("hora",$hora);
            $t->Set("usuario",$usuario);
            $t->Set("suc",$suc);
            $t->Set("suc_d",$suc_d);
            $t->Set("items",$items);
            $t->Set("obs",$obs);
            $t->Set("estado",$estado);
            if($items < 1){
              $t->Set("eliminar",'<img class="del_det trash" onclick="delRemito('.$nro.');" src="img/trash_mini.png" style="cursor:pointer" title="Borrar Esta Remision">');
            }else{
                $t->Set("eliminar","<label title='Entrar en la Remision y Vaciar para Eliminarla'>---</label>"); 
            } 
            $t->Show("remitos_abiertos_data");
        }
        $t->Show("remitos_abiertos_foot");        
    }  
}
function forzarCambioEstado(){ // Solo con permiso especial para enviar directo
    $nro_remito = $_REQUEST['nro_remito'];
    $estado = $_REQUEST['estado'];
    $usuario = $_REQUEST['usuario'];
    $db = new My();
    $db->Query("update nota_remision set estado = '$estado', obs = concat(obs,' Puesta $estado directamente por $usuario')  where n_nro = $nro_remito and e_sap = 0;");
    echo json_encode(array("estado"=>"Ok"));
}
 
new RemisionesAbiertas();
?>
