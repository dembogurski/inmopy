<?php

/**
 * Description of EntradaDirecta
 * @author Ing.Douglas
 * @date 03/01/2017
 */
 
 
require_once("../Y_DB_MySQL.class.php");
require_once("../Y_Template.class.php");              
 

class EntradaDirecta {
 
    function __construct() {
        //$session = $_POST['session'];
        $usuario = $_POST['usuario']; 
        $touch = $_POST['touch']; 
        $suc = $_POST['suc']; 
        $hoy = date("d-m-Y");
        
        $t = new Y_Template("EntradaDirecta.html");
        
        $t->Set("hoy", $hoy);   
        
        
        $my = new My();
        $my->Query("SELECT nombre_color AS COLOR FROM pantone WHERE estado = 'Activo' ORDER BY nombre_color ASC");
        $colores = "";
        
        while ($my->NextRecord()) {    
            $color = utf8_encode( $my->Record['COLOR']);    
            $colores.="'$color',";
        }
        $colores = substr($colores, 0, -1);
        $t->Set("colores", "[" . $colores . "]");
         /**
         * Patrones de diseño         
         */
         
        $my->Query("select design as Carpeta,descrip as Patron from designs WHERE  estado = 'Activo'");
        $patrones = "";
        $pattern_codes = "";
        //array_map('utf8_encode', $my->Record);
        while ($my->NextRecord()) {    
            $carpeta = utf8_encode( $my->Record['Carpeta']); 
            $patron = utf8_encode( $my->Record['Patron']);
            $patrones.="'$patron',";
            $pattern_codes.="'$carpeta',";
        }
        $patrones = substr($patrones, 0, -1);        
        $t->Set("designs", "[" . $patrones . "]");
        
        $t->Show("headers");
        $t->Show("titulo_entrada");
        
        $my = new My();
        
        $sql = "SELECT suc,nombre FROM sucursales WHERE suc = '$suc' order by suc asc";
        //$sql = "SELECT suc,nombre FROM sucursales WHERE suc NOT LIKE '%.%'  ORDER BY suc ASC";
        $my->Query($sql);
        $sucs = "";
        while ($my->NextRecord()) {
            $suc = $my->Record['suc'];
            $nombre = $my->Record['nombre'];
            $sucs.="<option value=" . $suc . ">" . $nombre . "</option>";
        }
        $t->Set("sucursales", $sucs);
        
         
        $monedas .="<option value='G$'>Guaranies</option>";
        $t->Set("monedas", $monedas);
         
         
        $t->Set("estado", "Abierta");   
        
        $t->Show("cabecera_nueva_entrada");
         
        $t->Show("area_carga_cab");
        $t->Show("detalle"); 
        $t->Show("area_carga_foot");
        
              
          
        // Solo si es Toutch
        /*
        if($touch){
            require_once("../utils/NumPad.class.php");            
            new NumPad();
        }*/
    }    
}

new EntradaDirecta();
?>


