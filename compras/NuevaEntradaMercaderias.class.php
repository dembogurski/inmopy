<?php

/**
 * check: ok
 * Description of NuevaEntradaMercaderias
 * @author Ing.Douglas
 * @date 28/04/2016
 */
 
require_once("../Y_DB_MySQL.class.php");
require_once("../Y_Template.class.php");
                   

class NuevaEntradaMercaderias {
 
    function __construct() {
        //$session = $_POST['session'];
        $usuario = $_POST['usuario']; 
        $touch = $_POST['touch']; 
         
        $t = new Y_Template("EntradaMercaderias.html");
        
        $ms = new My();
        $ms->Query("SELECT pantone,nombre_color AS COLOR FROM pantone WHERE estado = 'Activo' ORDER BY nombre_color ASC");
        $colores = "";
        //array_map('utf8_encode', $ms->Record);
        while ($ms->NextRecord()) {    
            $color = utf8_encode( $ms->Record['COLOR']);    
            $colores.="'$color',";
        }
        $colores = substr($colores, 0, -1);
        $t->Set("colores", "[" . $colores . "]");
         /**
         * Patrones de diseño         
         */
        $ms = new My();
        $ms->Query("SELECT design AS Carpeta,descrip AS Patron FROM designs WHERE  estado = 'Activo'  order by design asc");
        $patrones = "";
        $pattern_codes = "";
        //array_map('utf8_encode', $ms->Record);
        while ($ms->NextRecord()) {    
            $carpeta = utf8_encode( $ms->Record['Carpeta']); 
            $patron = utf8_encode( $ms->Record['Patron']);
            $patrones.="'$patron',";
            $pattern_codes.="'$carpeta',";
        }
        $patrones = substr($patrones, 0, -1);        
        $t->Set("designs", "[" . $patrones . "]");
        $t->Set("gmonedas", "[]");
        
        $t->Show("headers");    
       // $t->Show("script_entrada_merc");    
        $t->Show("titulo_entrada");
        
        $my = new My();
        
        $sql = "SELECT suc,nombre FROM sucursales WHERE estado  = 'Activo' AND suc <> '13'  ORDER BY suc ASC";
        //$sql = "SELECT suc,nombre FROM sucursales WHERE suc NOT LIKE '%.%'  ORDER BY suc ASC";
        $my->Query($sql);
        $sucs = "";
        while ($my->NextRecord()) {
            $suc = $my->Record['suc'];
            $nombre = $my->Record['nombre'];
            $sucs.="<option value=" . $suc . ">" . $nombre . "</option>";
        }
        $t->Set("sucursales", $sucs);
        
        // Buscar Lista de Monedas
        $my->Query("SELECT m_cod AS moneda, m_descri FROM monedas ");
 
        while ($my->NextRecord()) {
            $moneda = $my->Record['moneda'];
            $m_descri = $my->Record['m_descri'];
            $monedas .="<option value='$moneda'>$m_descri</option>";
        }
        $t->Set("monedas", $monedas);
        
        $ms = new My();
        $ms->Query("select codigo_pais,nombre from paises order by hits + 0 desc, nombre asc");
        $paises = "";
        while ($ms->NextRecord()) {
            $Code = $ms->Record['codigo_pais'];
            $Name = utf8_decode($ms->Record['nombre']);
            $paises .="<option value='$Code'>$Name</option>";
        }
        $t->Set("paises", $paises);
        $t->Set("estado", "Abierta");   
        
        $t->Show("cabecera_nueva_entrada");
         
        $t->Show("area_carga_cab");
        $t->Show("detalle"); 
        $t->Show("area_carga_foot");        
       
    }    
}

new NuevaEntradaMercaderias();
?>


