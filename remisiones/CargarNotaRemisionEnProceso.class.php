<?php

/**
 * Description of CargarNotaRemisionEnProceso
 * @author Ing.Douglas
 * @date 09/02/2016
 */
 

require_once("../Y_DB_MySQL.class.php");
require_once("../Y_Template.class.php");


class CargarNotaRemisionEnProceso {
    
   function __construct() {
        //$session = $_POST['session'];
        //$ms = new MS();
        
        $usuario = $_POST['usuario']; 
        $nro_remito = $_POST['nro_remito']; 
         
        
        $db = new My();
        $db->Query("SELECT DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha, usuario, suc, suc_d, obs, estado, transportadora, nro_levante FROM  nota_remision WHERE estado = 'En Proceso' AND n_nro = $nro_remito;");
        $db->NextRecord();
        $fecha = $db->Record['fecha'];
        $usuario = $db->Record['usuario'];
        $origen = $db->Record['suc'];
        $obs = explode('|',$db->Record['obs']);
        $estado = $db->Record['estado'];
        $transportadora = $db->Record['transportadora'];
        $nro_levante = $db->Record['nro_levante'];
        
        $db->Query("select valor from parametros where clave = 'porc_tolerancia_remsiones'");
        $db->NextRecord();
        $porc_tolerancia_remsiones = $db->Record['valor'];
         
        $t = new Y_Template("NotaRemisionEnProceso.html");
        $t->Set("nro",$nro_remito);
        $t->Set("fecha",$fecha);
        $t->Set("usuario",$usuario);
        $t->Set("destino",$destino);
        $t->Set("obs_env",trim($obs[0]));
        $t->Set("obs_rec",((count($obs)>1)?trim($obs[1]):''));
        $t->Set("estado",$estado);
        $t->Set("porc_tolerancia_remsiones",$porc_tolerancia_remsiones);
        $t->Set("transportadora",$transportadora);
        $t->Set("nro_levante",$nro_levante);
         
        $uc = new My();
        
        $sql = "SELECT suc,nombre FROM sucursales where suc = '$origen' order by  nombre asc ";
        $db->Query($sql);
        $sucs = "";
        $db->NextRecord();
        $suc = $db->Record['suc'];
        $nombre = $db->Record['nombre'];
         
         
        $t->Set("origen", $nombre);
        
        $t->Show("header");
        
        $t->Show("remision_existente_cab");
        $t->Show("area_carga_cab");
        
        //$db->Query("SELECT codigo,lote,descrip,cantidad,um_prod,kg_env,kg_rec,tara,gramaje,ancho,cant_calc_env,cant_inicial,procesado,tipo_control,kg_desc FROM nota_rem_det WHERE n_nro = $nro_remito");
        $db->Query("SELECT codigo,lote,descrip,cantidad,um_prod,kg_env,kg_rec,tara,gramaje,ancho,cant_calc_env,cant_inicial,procesado,tipo_control,kg_desc, if((cant_calc_rec = 0 or (cant_calc_rec BETWEEN (cantidad - (cantidad * $porc_tolerancia_remsiones / 100)) AND (cantidad + (cantidad * $porc_tolerancia_remsiones / 100)))),'OK','FR') as estado FROM nota_rem_det WHERE n_nro = $nro_remito");
            
        while($db->NextRecord()){

           $codigo = $db->Record['codigo']; 
           $lote = $db->Record['lote']; 
           $descrip = $db->Record['descrip']; 
           $um_prod = $db->Record['um_prod']; 
           $cantidad = $db->Record['cantidad'];
           $kg_env = $db->Record['kg_env']; 
           $kg_rec = $db->Record['kg_rec']; 
           $cant_inicial = $db->Record['cant_inicial']; 
           $es_rollo = $db->Record['tipo_control']; 
           $kg_desc = $db->Record['kg_desc']; 
           $estado = $db->Record['estado']; 
           $tara = $db->Record['tara']; 
           $gramaje = $db->Record['gramaje']; 
           $ancho =  $db->Record['ancho']; 
           
           
           $procesado = $db->Record['procesado'];
           //Actualizar datos por si hay cambios en el proceso de carga  // No deberia pasar mas esto
           /*
           $ms->Query("select top 1 InvntryUom as UM,U_tara as Tara,U_gramaje as Gramaje,o.U_ancho as Ancho  from OITM i, OIBT o WHERE i.ItemCode = o.ItemCode and i.ItemCode = '$codigo' and o.BatchNum =  '$lote'");
           $ms->NextRecord();
                       
           $tara =  $ms->Record['Tara']; 
           $gramaje =  number_format($ms->Record['Gramaje'],2,'.','');
           $ancho =  number_format($ms->Record['Ancho'],2,'.','');
           if($tara == null){ $tara = 0;}
           
           if($um_prod == "Mts"){
               if($kg_env > 0){
                 $mts_calc = (($kg_env - ($tara / 1000)) * 1000) / ($gramaje * $ancho);
               }else{
                 $mts_calc = 0;
               }
           }else{
               $mts_calc = $cantidad;
           }
           
           $uc->Query("UPDATE nota_rem_det SET tara = $tara,gramaje= $gramaje,ancho= $ancho, cant_calc_env = $mts_calc WHERE codigo = '$codigo' and lote = '$lote' and n_nro = $nro_remito;");
           */
           if($kg_rec > 0){
               $t->Set("encontrado","encontrado");
           }else{
               $t->Set("encontrado","");
           }
                      
           $cant_calc_env = $db->Record['cant_calc_env']; 
           $t->Set("codigo",$codigo);
           $t->Set("kg_desc",$kg_desc);
           $t->Set("es_rollo",$es_rollo);
           $t->Set("lote",$lote);
           $t->Set("descrip",$descrip);
           $t->Set("cant", number_format($cantidad,2,',','.'));
           $t->Set("um",$um_prod);
           $t->Set("estado",$estado);
           $t->Set("tara",number_format($tara,0,',','.'));
           $t->Set("gramaje",number_format($gramaje,2,',','.'));
           $t->Set("ancho",number_format($ancho,2,',','.'));
           $t->Set("kg_env", number_format($kg_env,3,',','.'));  
           $t->Set("kg_rec", number_format($kg_rec,3,',','.'));  
           $t->Set("cant_calc_env", number_format($cant_calc_env,2,',','.'));  
           $t->Set("cant_inicial", number_format($cant_inicial,2,',','.'));  
           $t->Show("area_carga_data");
        }
        
        
        $t->Show("area_carga_foot");
        
        // Solo si es Toutch
        $touch = $_POST['touch'];
        if($touch == "true"){
            require_once("../utils/NumPad.class.php");           
            new NumPad();
        }
   }
}

new CargarNotaRemisionEnProceso();
?>
