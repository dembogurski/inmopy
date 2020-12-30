<?php

/**
 * Description of FabricacionManteles
 * @author Ing.Douglas
 * @date 09/04/2018
 */
require_once("../Y_DB_MySQL.class.php");
require_once("../Y_Template.class.php");


class FabricacionManteles {
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
        if($usuario == "null"){
            $usuario = "%";
        }
        $user = $_REQUEST['user'];
        $suc = $_REQUEST['select_suc'];

        $t = new Y_Template("FabricacionManteles.html");
        $t->Show("header");

        $t->Set("desde", $desde);
        $t->Set("hasta", $hasta);
        $t->Set("desde_eng", $desde_eng);
        $t->Set("hasta_eng", $hasta_eng);
        $t->Set("operario", $usuario);
        
        $t->Set("suc_d", $suc);
        $t->Set("user", $user);
        $t->Set("time", date("d-m-Y H:i"));
        
        $t->Show("head");
        $db = new My();
        $dbd = new My();
        $Qry = "SELECT id_reg,DATE_FORMAT(fecha_reg,'%d-%m-%Y %H:%i') AS fecha_reg ,usuario_reg,DATE_FORMAT(fecha_prod,'%d-%m-%Y') AS fecha_prod,usuario_prod,codigo,articulo,cant_prod,obs FROM reg_produccion WHERE fecha_prod BETWEEN '$desde_eng' AND '$hasta_eng' AND usuario_prod LIKE '$usuario'   ORDER BY id_reg ASC ";
       
        //echo $Qry;  die();
        $db->Query($Qry); 
        $t->Show("cabecera");
        
        $count = 0;
        
        $old_user = "";
        $old_date = "";
        
        $total = 0; 
        $total_gral = 0; 
        
        while($db->NextRecord()){ 
            $id_reg = $db->Record['id_reg'];
            $fecha_reg = $db->Record['fecha_reg'];            
            $usuario_reg= $db->Record['usuario_reg'];            
            $fecha_prod= $db->Record['fecha_prod'];    
            $usuario_prod = $db->Record['usuario_prod'];    
            $codigo = $db->Record['codigo'];            
            $articulo = $db->Record['articulo']; 
            $cant_prod= $db->Record['cant_prod'];
            $obs= $db->Record['obs'];
                        
            if((($old_user != $usuario_prod) && $old_date != $fecha_prod) && $old_user != "" && $old_date != ""){   
                $t->Set("total",$total); 
                $t->Show("corte");  
                $total = 0;
            }
            
            $total += 0+$cant_prod;
            $total_gral+= 0+$cant_prod;
            
            $t->Set("id",$id_reg);
            $t->Set("fecha_reg",$fecha_reg);            
            $t->Set("usuario_reg",$usuario_reg);
            $t->Set("fecha_prod",$fecha_prod);
            $t->Set("usuario_prod",$usuario_prod);
            $t->Set("codigo",$codigo);
            $t->Set("articulo",$articulo);
            $t->Set("cant_prod",$cant_prod);
            $t->Set("obs",$obs);
            
            $old_user = $usuario;
            $old_date = $fecha_prod;
            $t->Show("data");            
        }
        $t->Set("total_gral",$total_gral); 
      
        $t->Show("corte");  
        $t->Show("footer");               
    }
     
}
function getDescripProductoTerminado($codigo){
         
        $my = new My();
        $my->Query(" SELECT descrip FROM articulos WHERE codigo = '$codigo'");
        $my->NextRecord();
        $descrip = $my->Record['descrip'];
        return $descrip;
}
new FabricacionManteles();
?>
