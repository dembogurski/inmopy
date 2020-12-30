<?php

/**
 * Description of FabricacionManteles
 * @author Ing.Douglas
 * @date 09/04/2018
 */
require_once("../Y_DB_MySQL.class.php");
require_once("../Y_Template.class.php");


class FraccionadoresManteles {
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

        $t = new Y_Template("FraccionadoresManteles.html");
        $t->Show("header");

        $t->Set("desde", $desde);
        $t->Set("hasta", $hasta);
        $t->Set("desde_eng", $desde_eng);
        $t->Set("hasta_eng", $hasta_eng);
        $t->Set("vendedor", $usuario);
        
        $t->Set("suc_d", $suc);
        $t->Set("user", $user);
        $t->Set("time", date("d-m-Y H:i"));
        
        $t->Show("head");
        $db = new My();
        $dbd = new My();
        $Qry = "SELECT usuario,  DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha, IF(fila_orig = 0 AND codigo_om IS NOT NULL,codigo_om, codigo_ref) AS codigo_ref,IF(fila_orig = 1 ,e.descrip, '') AS descrip, e.tipo_saldo ,e.largo AS Medida, SUM(IF(tipo_saldo = 'Retazo',saldo,cant_frac)) AS Unidades
        FROM emis_det e, orden_det d WHERE  e.nro_orden = d.nro_orden AND fecha BETWEEN '$desde_eng' AND '$hasta_eng' AND usuario LIKE '$usuario'   GROUP BY fecha, codigo_ref,tipo_saldo,codigo_om  ORDER BY fecha,usuario, descrip DESC, tipo_saldo ASC ";
        //echo $Qry;  die();
        $db->Query($Qry); 
        $t->Show("cabecera");
        
        $count = 0;
        
        $old_user = "";
        $old_date = "";
        
        $totales = array();
        
        while($db->NextRecord()){ 
            $fecha = $db->Record['fecha'];
            $codigo_ref = $db->Record['codigo_ref'];
            $usuario= $db->Record['usuario'];
            $tipo_saldo= $db->Record['tipo_saldo'];
            $Medida = $db->Record['Medida'];
            //$descrip= $db->Record['descrip'];
            $descrip = getDescripProductoTerminado($codigo_ref);
            $Unidades= $db->Record['Unidades'];
            
            
            if((($old_user != $usuario) || $old_date != $fecha) && $old_user != ""){
                
                foreach ($totales as $key => $value) {
                    $t->Set($key,$value);
                }
                $t->Show("corte");  
                foreach ($totales as $key => $value) {
                    $totales[$key]= 0;
                }                  
            }
            $suma = $totales[$tipo_saldo];
            $suma += 0 + $Unidades;
            $totales[$tipo_saldo] = $suma;
            
            
            $t->Set("usuario",$usuario);
            $t->Set("codigo",$codigo_ref);
            $t->Set("tipo_saldo",$tipo_saldo);
            $t->Set("medida",$Medida);
            $t->Set("descrip",$descrip);
            $t->Set("fecha",$fecha);
            $t->Set("unidades",$Unidades);
            $old_user = $usuario;
            $old_date = $fecha;
            $t->Show("data");            
        }
        foreach ($totales as $key => $value) {
            $t->Set($key,$value);
        }
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
new FraccionadoresManteles();
?>
