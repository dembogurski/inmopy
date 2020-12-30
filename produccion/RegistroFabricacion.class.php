<?php

/**
 * Description of RegistroFabricacion
 * @author Ing.Douglas
 * @date 21/08/2018
 */

require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");


class RegistroFabricacion {
    
    function __construct() {
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }

    function main() {

        $t = new Y_Template("RegistroFabricacion.html");
        $t->Show("header");
        $db = new My();
        $db->Query("SELECT u.usuario as usuario,concat(nombre,' ',apellido) as nombre  FROM usuarios u,  usuarios_x_grupo  g  where u.usuario = g.usuario and g.id_grupo = 23 and u.estado = 'Activo' order by u.usuario asc "); 
        $usuarios = '';
        
        while($db->NextRecord()){
            
            $user = $db->Record['usuario'];
            $name = $db->Record['nombre'];
            //echo $u." ".$n;
            $usuarios.="<option value='$user'>$user - $name</option>";
        }
         
        $t->Set("usuarios",$usuarios);
        
        
        $t->Show("form");
        $t->Show("registro");
        
    }
    
}
function getArticulos(){
    $link = new My();
    $criteria = $_POST['criteria'];
    $link->Query("SELECT codigo,descrip FROM articulos WHERE (codigo LIKE 'TX%' AND (codigo LIKE '$criteria%' OR descrip LIKE '$criteria%' ))   AND estado  = 'Activo'  ORDER BY codigo ASC;");
    $arr = array();    
    while($link->NextRecord()){         
        array_push($arr, $link->Record ) ;
    }
    echo json_encode($arr);
}
//user:getNick(),suc:getSuc(), fecha_prod: fecha,usuario:usuario,codigo:codigo,nombre:nombre,cant_prod:
function registrarProduccion(){
    $user = $_POST['user'];
    $suc = $_POST['suc'];
    $fecha_prod = $_POST['fecha_prod'];
    $usuario = $_POST['usuario'];
    $codigo = $_POST['codigo'];
    $nombre = $_POST['nombre'];
    $cant_prod = $_POST['cant_prod'];
    $obs = $_POST['obs'];
    $db = new My();
    $db->Query("INSERT INTO reg_produccion ( usuario_reg, fecha_prod, usuario_prod, suc, codigo, articulo, fecha_reg, cant_prod,obs)
                VALUES ( '$user', '$fecha_prod', '$usuario', '$suc', '$codigo', '$nombre', current_timestamp, $cant_prod,'$obs');");
    echo json_encode( array("estado"=>"Ok"));
}
function listarRegistroDelDia(){
    $fecha = $_POST['fecha_prod'];
    $db = new My();
    $db->Query("SELECT id_reg,DATE_FORMAT(fecha_reg,'%d-%m-%Y %H:%i') AS fecha_reg ,usuario_reg,DATE_FORMAT(fecha_prod,'%d-%m-%Y') AS fecha_prod,usuario_prod,codigo,articulo,cant_prod,obs FROM reg_produccion WHERE fecha_prod = '$fecha' ORDER BY id_reg ASC ");
   
    $arr = array();    
    while($db->NextRecord()){         
        array_push($arr, $db->Record ) ;
    }
    echo json_encode($arr);
}

new RegistroFabricacion();
?>
