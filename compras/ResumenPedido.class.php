<?php

/**
 * Description of ResumenPedido
 * @author Ing.Douglas
 * @date 04/12/2015
 */

require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");

class ResumenPedido {
    function __construct(){
        $t = new Y_Template("ResumenPedido.html");
        
        $nro = $_GET['nro']; 
        $usuario = $_GET['usuario'];
                        
        $t->Set("nro",$nro);
        $t->Set("usuario",$usuario);
        $t->Set("fecha",date("d-m-Y H:i"));
        
        
        $Qry = "SELECT id_res AS id,n_nro AS nro,codigo,descrip,color,um_prod AS um,cantidad_pond,cantidad,ventas,rango_ventas,precio_est, cantidad * precio_est AS valor_est "
                . "FROM nota_ped_resumen r WHERE n_nro = $nro ORDER BY codigo ASC ,descrip ASC,color ASC";
        
        $my = new My();
        $my->Query($Qry);
        
        $t->Show("headers");
        
        $t->Show("head");
        
        $VALOR_TOTAL_EST = 0;
         
        while($my->NextRecord()){
            $id = $my->Record['id'];
            $nro = $my->Record['nro'];
            $codigo = $my->Record['codigo'];
            $descrip = $my->Record['descrip'];
            $color = $my->Record['color'];
            $um = $my->Record['um'];
            $cantidad_pond = $my->Record['cantidad_pond'];
            $cantidad = $my->Record['cantidad'];
            $ventas = $my->Record['ventas'];
            $rango_ventas = $my->Record['rango_ventas'];
            $precio_est =  $my->Record['precio_est'];      
            $valor_est = $my->Record['valor_est'];
            
            $VALOR_TOTAL_EST += 0 + $valor_est;
            
            $t->Set("id",$id);
            $t->Set("nro",$nro);
            $t->Set("codigo",$codigo);
            $t->Set("descrip",$descrip);
            $t->Set("color",$color);
            $t->Set("um",$um);
            $t->Set("cantidad_pond",number_format($cantidad_pond,2,',','.'));   
            $t->Set("cantidad",number_format($cantidad,2,',','.')); 
            if($ventas != null){
              $t->Set("ventas",number_format($ventas,2,',','.')); 
            }else{
                $t->Set("ventas","--"); 
            }
            
            $t->Set("precio_est",number_format($precio_est,2,',','.'));   
            $t->Set("valor_est",number_format($valor_est,2,',','.'));   
            $t->Set("rango_ventas",$rango_ventas);
            
            $t->Show("line");
        }
        $t->Set("valor_total_est",number_format($VALOR_TOTAL_EST,2,',','.'));  
        $t->Show("foot");
    }
}
new ResumenPedido();
?>
