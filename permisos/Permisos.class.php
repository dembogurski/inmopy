<?php

/**
 * Description of Permisos
 * @author Ing.Douglas A. Dembogurski
 * @date 20/03/2015
 */

require_once("../Y_DB_MySQL.class.php");
require_once("../Y_Template.class.php");

class Permisos {
    
    function __construct() {
        $t = new Y_Template("Permisos.html");
        $db = new My();
        $db->Query("SELECT id_grupo,nombre,descrip FROM grupos order by modulo desc");
        
        $t->Show("header");
        $t->Show("grupos_cab");
        
        while($db->NextRecord()){
            $id_grupo = $db->Record['id_grupo']; 
            $nombre= $db->Record['nombre']; 
            $descrip = $db->Record['descrip']; 
            $t->Set("id",$id_grupo);
            $t->Set("nombre",$nombre);
            $t->Set("descrip",$descrip);
            $t->Show("grupos_data");
        }
        $t->Show("grupos_foot");
    }
}

new Permisos();

?>
