<?php

require_once("Y_DB_MySQL.class.php");
require_once("Y_Template.class.php");
require_once("Menu.class.php");

class Main {

    function __construct() {
        $usuario = $_POST['usuario'];
        $session = $_POST['session'];
        $sucursal = $_POST['sucursal'];
        $permisos = array();
        $t = new Y_Template('Main.html');
        
        $t->Set("is_mobile",isMobile()==0?"false":"true");
        
        $suc_select = "";
        $db = new My();
        $db->Query("SELECT suc FROM usuarios_x_suc WHERE usuario = '$usuario';");
        $t->Set('suc', $sucursal);
        
        if ($db->NumRows() > 1) {
            while ($db->NextRecord()) {
                if ($db->Record['suc'] === $sucursal) {
                    $suc_select .="<option selected>" . $db->Record['suc'] . "</option>";
                } else {
                    $suc_select .="<option>" . $db->Record['suc'] . "</option>";
                }
            }
            $t->Set('sucursales', '<select id="sucursales">' . $suc_select . '</select>');
        }
        

        $t->Set('emp', 'Inmo-Py');
        
        $t->Set('sucursal', $sucursal);
        $db->Query("UPDATE sesiones SET estado = 'Inactiva' WHERE CURRENT_TIMESTAMP > expira");
        
        $db->Query("SELECT estado FROM sesiones WHERE  usuario = '$usuario' AND SERIAL = '$session'");

        if ($db->NumRows() > 0) {
            $db->NextRecord();
            $estado = $db->Record['estado'];
            if ($estado == 'Inactiva') {
                $t->Set('err_msg', 'Esta sesion ha caducado, favor intente loguearse nuevamente.  ');
                $t->Show("head");
                $t->Show("err_msg");
            } else {
                // Obtengo todos los Permisos de este usuario
                $t->Show("head");
                $db->Query("SELECT u.nombre as usu,ug.usuario,g.nombre,p.id_permiso AS id_permiso,descripcion,trustee 
                FROM  usuarios u,grupos g, usuarios_x_grupo ug, permisos_x_grupo p, permisos pr WHERE u.usuario = ug.usuario AND ug.id_grupo = p.id_grupo AND g.id_grupo = ug.id_grupo AND p.id_permiso = pr.id_permiso AND trustee != '---'  AND ug.usuario = '$usuario'");
                $first = TRUE;
                while ($db->NextRecord()) {
                    if ($first) {
                        $t->Set('usu_nombre', $db->Record['usu']);
                        $t->Set('usu_nick', $db->Record['usuario']);
                        $first = FALSE;
                    }
                    $id_permiso = $db->Record['id_permiso'];
                    array_push($permisos, $id_permiso);
                }
                $t->Show('header');
                $t->Show('conten_begin');
                new Menu($permisos);
                $t->Show('conten_end');
            }
        } else {
            $t->Set('err_msg', 'Esta tratando de acceder con una sesion inv&aacute;lida. favor intente nuevamente.');
            $t->Show("head");
            $t->Show("err_msg");
        }
        $t->Show("scripts");
    }
}

function isMobile() {  
   return preg_match("/(android|avantgo|blackberry|bolt|boost|cricket|docomo|fone|hiptop|mini|mobi|palm|phone|pie|tablet|up\.browser|up\.link|webos|wos)/i", $_SERVER["HTTP_USER_AGENT"]);
}

new Main();
?>
