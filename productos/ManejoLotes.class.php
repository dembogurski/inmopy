<?php

/**
 * Description of ManejoLotes
 * @author Ing.Douglas
 * @date 16/06/2016
 */

require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");   
require_once("../Functions.class.php");    

class ManejoLotes {
   function __construct(){ 
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }

    function main() {
           $t = new Y_Template("ManejoLotes.html");
           
           $my = new My();       
           $sql = "select valor as PORC_VAL_MIN from  parametros  where clave = 'porc_valor_minimo'";      
           $my->Query($sql);
           if($my->NumRows() > 0){
              $my->NextRecord();
              $PORC = number_format($my->Record['PORC_VAL_MIN'],2,'.',',');     
              $t->Set("porc_val_min", $PORC);
           }else{
               $t->Set("err_msg", "ATENCION! Porcentaje de Valor Minimo no Establecido, contacte con el Administrador"); 
               $t->Show("err_msg");
               die();
           }      
           
            
           $t->Show("headers");
           $hoy = date("d/m/Y");
           $t->Set("hoy", $hoy);
           //$t->Set("verValMinPrecMinVent", $verValMinPrecMinVent);
           
           $f = new Functions();
           $permiso = $f->chequearPermiso("9.2.1", $usuario);    
           if($permiso != "---"){
               $t->Set("permisos_extras",""); 
           }else{
               $t->Set("permisos_extras","style='display:none'");   
           }
           
           
           $sql = "SELECT suc,nombre FROM sucursales order by  suc asc";
           $my->Query($sql);
           $sucs = "";
           while ($my->NextRecord()) {
               $suc = $my->Record['suc'];
               $nombre = $my->Record['nombre'];
               $sucs.="<option value=" . $suc . ">" .$suc." - ".$nombre . "</option>";
           }
           $t->Set("sucursales", $sucs);
           
           
           $t->Show("filters");
           $t->Show("filters_result");       
   }
      
}

// Buscar Colores
 
   function buscarColores(){
       $search = $_POST['search'];
       $db = new My();
       $colores = array();
       $db->Query("SELECT pantone,nombre_color AS color FROM pantone WHERE estado ='Activo' AND nombre_color LIKE '$search%' ORDER BY nombre_color ASC");
       while($db->NextRecord()){
           $colores[$db->Record['pantone']] =  $db->Record['color'] ;
       }
       echo  json_encode($colores);
   } 
   // Actualizar Color
   function actualizarColor(){
        $msj = array();
        $db = new My();
        $pantone = $_POST['ColorCod']; //Pantone 
        $padreEHijos = $_POST['padreEHijos'];
          
        $lotes = implode("','",json_decode($_POST['lotes']));
         
        if($padreEHijos == 'true'){   
             $lotes =  lotesHYP(json_decode($_POST['lotes'])); 
        } 
         
        
        
        $db->Query("select nombre_color from pantone where pantone = '$pantone'");
        if($db->NumRows()>0){
            $db->NextRecord();
            $color = $db->Get("nombre_color");
            $db->Query("UPDATE lotes  set pantone = '$pantone' WHERE lote IN ('$lotes')");
            $updated = (float)$db->AffectedRows();
            logColor($lotes, $pantone, $color, $_POST['usuario']);            
            $msj['msj'] = "Operacion Exitosa !";
            $msj['rows_afected'] = $updated;
        }else{
            $msj['msj'] = "Error: Nombre de color o codigo pantone $pantone no existe";
            $msj['rows_afected'] = 0;
        }
        echo  json_encode($msj);
   }
   function getMonedaListaPrecios(){
       $codigo = $_REQUEST['codigo'];
       $f = new Functions();
       echo json_encode($f->getResultArray("SELECT DISTINCT moneda FROM lista_prec_x_art WHERE codigo = '$codigo'"));               
   }
   function getUmListaPrecios(){
       $codigo = $_REQUEST['codigo'];
       $moneda = $_REQUEST['moneda'];
       $f = new Functions();
       echo json_encode($f->getResultArray("SELECT DISTINCT um FROM lista_prec_x_art WHERE codigo = '$codigo' and moneda = '$moneda' order by um desc"));               
   }
   // Buscar hermanos y padre
   function lotesHYP($lts){
        
       $db = new My();    
       $t_lts = $lts;   
       $lotes = implode(',',$lts);
        
       $db->Query("SELECT padre FROM lotes WHERE lote  in($lotes)");
       while($db->NextRecord()){
           $l = $db->Record['padre'];
           if(!in_array($l,$t_lts)){
               array_push($t_lts,$db->Record['padre']);
           }
       }
       $padres = implode(',',$t_lts); 
       
       $db->Query("SELECT lote FROM lotes WHERE padre  in($padres)");
       while($db->NextRecord()){
           $l = $db->Record['padre'];
           if(!in_array($l,$t_lts)){
               array_push($t_lts,$db->Record['lote']);
           }
       }
       $unicos = implode("','",  array_unique( $t_lts ));
        
       return $unicos;
   } 
   function logColor($lotes,$pantone, $color, $usuario){
        
       $my = new My();
       $my->Query("SELECT lote,p.pantone,nombre_color FROM lotes l, pantone p WHERE l.pantone = p.pantone AND lote in ('$lotes')");
       while($my->NextRecord()){
           $lote = $my->Record['lote'];
           $old_pantone = $my->Record['pantone'];
           $old_color = $my->Record['nombre_color'];            
           $my->Query("INSERT INTO logs (usuario, fecha, hora, accion, tipo, doc_num, data) VALUES ('$usuario', date(now()), time(now()), 'Combio Color', 'Lote', '$lote', 'Cambio de color $old_color Pantone: $old_pantone a $color Pantone: $pantone')");
       }
   }
   
   function getHistorialPrecios(){
       $codigo = $_REQUEST['codigo'];
       $lote = $_REQUEST['lote'];
       $f = new Functions();
       echo json_encode($f->getResultArray("SELECT usuario, DATE_FORMAT(CONCAT(  fecha ,' ', hora), '%d-%m-%Y %h:%i') AS fecha, suc, codigo, lote, num AS cat, moneda, um, precio_art_ant, desc_ant, precio_final_ant, precio_art_actual, desc_actual, precio_final_actual, estado_venta 
       FROM hist_precios WHERE codigo = '$codigo' AND lote = '$lote' ORDER BY id_hist ASC"));     
   }
   
new ManejoLotes();
?>
