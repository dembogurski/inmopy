<?php

/**
 * Description of RemisionesEntrantes
 * @author Ing.Douglas
 * @date 14/01/2016
 */
 
require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");

class RemisionesEntrantes {
    function __construct(){
        $suc = $_REQUEST['suc'];
        $t = new Y_Template("RemisionesEntrantes.html"); 
        $t->Set("suc",$suc);
        
        $t->Show("header");
        
        $t->Show("remitos_abiertos_cab");
        
        $db = new My();
        $db->Query("SELECT r.n_nro, DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha, hora, usuario, suc, suc_d, obs,COUNT(d.lote) AS items, r.estado FROM  nota_remision r LEFT JOIN nota_rem_det d ON r.n_nro = d.n_nro 
        WHERE r.estado = 'En Proceso' AND suc_d = '$suc' GROUP BY r.n_nro");
        
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
            $t->Show("remitos_abiertos_data");
        }
        $t->Show("remitos_abiertos_foot");        
    }  
}
new RemisionesEntrantes();
?>
