<?php

/**
 * Description of NotaRemisionPrint
 * @author Ing.Douglas
 * @date 13/01/2016
 */
 
require_once("../Y_DB_MySQL.class.php");
require_once("../Y_Template.class.php");


class NotaRemisionPrint {
   function __construct() {
         
        
        $usuario = $_GET['usuario']; 
        $nro_remito = $_GET['nro_remito']; 
        $emp = $_GET['emp'];
        $fecha_hora = date("d-m-Y H:i:s");
        
        $db = new My();
        $db->Query("SELECT DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha, usuario, suc, suc_d, obs, estado FROM  nota_remision WHERE  n_nro = $nro_remito;");
        $db->NextRecord();
        $fecha = $db->Record['fecha'];
        $usuario = $db->Record['usuario'];
        $origen = $db->Record['suc'];
        $destino = $db->Record['suc_d'];
        $obs = $db->Record['obs'];
        $estado = $db->Record['estado'];
         
        $t = new Y_Template("NotaRemisionPrint.html");
        $t->Set("nro",$nro_remito);
        $t->Set("fecha",$fecha);
        $t->Set("usuario",$usuario);
        $t->Set("origen",$origen);
        $t->Set("destino",$destino);
        $t->Set("obs",$obs);
        $t->Set("estado",$estado);
        $t->Set("fecha_hora",$fecha_hora);
		$t->Set("emp",$emp);
         
        
        $t->Show("header");
        $t->Show("head");
         
        
        $db->Query("SELECT paquete,IF(paquete IS NULL,10000,paquete) AS orden,codigo,lote,descrip,cantidad,um_prod,kg_env,tara,gramaje,ancho,cant_calc_env FROM nota_rem_det WHERE n_nro = $nro_remito order by orden   asc;");
        $i = 0;    
        $first = "";
        $old_paquete = 0;
        while($db->NextRecord()){
           $i++; 
           $codigo = $db->Record['codigo']; 
           $paquete = $db->Record['paquete']; 
           $lote = $db->Record['lote']; 
           $descrip = ucwords( strtolower( $db->Record['descrip'])); 
           $um_prod = $db->Record['um_prod']; 
           $cantidad = $db->Record['cantidad'];
           $kg_env = $db->Record['kg_env'];  
           $tara =  $db->Record['tara']; 
           $gramaje =  number_format($db->Record['gramaje'],2,'.','');
           $ancho =  number_format($db->Record['ancho'],2,'.','');
           $cant_calc_env =  number_format($db->Record['cant_calc_env'],2,'.','');
           if($tara == null){ $tara = 0;}
            
           $t->Set("paquete",$paquete);
           $t->Set("codigo",$codigo);
           $t->Set("lote",$lote);
           $t->Set("descrip",$descrip);
           $t->Set("cant", number_format($cantidad,2,',','.'));
           $t->Set("um",$um_prod);
           $t->Set("tara",number_format($tara,0,',','.'));
           $t->Set("gramaje",number_format($gramaje,2,',','.'));
           $t->Set("ancho",number_format($ancho,2,',','.'));
           $t->Set("kg_env", number_format($kg_env,3,',','.'));  
           $t->Set("cant_calc_env", number_format($cant_calc_env,2,',','.'));  
           
           if($paquete != $old_paquete){
             $t->Set("is_first","first");  
           }else{
              $t->Set("is_first","no_first");   
           }
           
           if($paquete==null){
              $t->Set("class_paquete","sin_paquete");  
           }else{
               $t->Set("class_paquete","");  
           }
           $old_paquete = $paquete;    
           $t->Show("data");
        }
        $t->Set("cant",$i);
        $t->Show("foot");
        
        $db->Query("SELECT CONCAT(nombre,' ',apellido) AS chofer FROM usuarios u, usuarios_x_grupo g WHERE    u.usuario = g.usuario AND g.id_grupo = 8 AND u.suc = '$origen'");
        while($db->NextRecord()){
            $chofer = $db->Record['chofer'];
            $t->Set("chofer",$chofer);
            $t->Show("choferes");
        }
         
        $t->Show("fin"); 
        
   }
}

new NotaRemisionPrint();
?>
