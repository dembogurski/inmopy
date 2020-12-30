<?php

/**
 * Description of ArqueoCaja
 * @author Ing.Douglas
 * @date 15/06/2015
 */
require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");


class ArqueoCaja {

    function __construct() {

        $usuario = $_POST['usuario'];
        $suc = $_POST['suc'];

        $a = new Y_Template("ArqueoCaja.html");
        $a->Show("header");

        $hoy = date("d/m/Y");
        $a->Set("hoy", $hoy);

        // Sucursales
        $my = new My();

        // Verifico 3.8.1 si el usuario tiene derecho a modificar la Sucursal sino pongo por defecto la de el

        $sql = "SELECT u.nombre AS usu,ug.usuario,g.nombre,p.id_permiso AS id_permiso,descripcion,trustee 
               FROM  usuarios u,grupos g, usuarios_x_grupo ug, permisos_x_grupo p, permisos pr 
               WHERE u.usuario = ug.usuario AND ug.id_grupo = p.id_grupo AND g.id_grupo = ug.id_grupo AND p.id_permiso = pr.id_permiso  AND ug.usuario = '$usuario'
               AND  p.id_permiso = '3.8.1'";

        $my->Query($sql);
        $filtro = "";        
        if ($my->NumRows() > 0) {
            $filtro = "where tipo != 'Sub-Deposito' and estado = 'Activo'";
            $a->Set("auditor","true");
            $a->Set("if_autitor","inline");
        }else{
            $filtro = " where suc = '$suc' and tipo != 'Sub-Deposito'  and estado = 'Activo'";     
            $a->Set("auditor","false");
            $a->Set("if_autitor","none");
        }
        
        $sql = "SELECT suc,nombre FROM sucursales $filtro order by  nombre";
       
        $my->Query($sql);
        $sucs = "";
        while ($my->NextRecord()) {
            $suc = $my->Record['suc'];
            $nombre = $my->Record['nombre'];
            $sucs.="<option value=" . $suc . ">" . $nombre . "</option>";
        }
        $a->Set("sucursales", $sucs);
        
        // Buscar Lista de Monedas
        $my->Query("SELECT m_cod AS moneda, m_descri FROM monedas ");

        $monedas = "<option value='%'>%</option>";
        while ($my->NextRecord()) {
            $moneda = $my->Record['moneda'];
            $m_descri = $my->Record['m_descri'];
            $monedas .="<option value='$moneda'>$m_descri</option>";
        }
        $a->Set("monedas", $monedas);
        $a->Set("tipos_convenios", $this->getTiposConvenios());

        $a->Show("body");
    }

    function getTiposConvenios(){
        $ms = new My();
        $tipos_conv = '';
        $ms->Query("SELECT DISTINCT tipo FROM tarjetas ORDER BY tipo ASC");
        while($ms->NextRecord()){
            $tipos_conv .= "<option>" . $ms->Record['tipo'] . "</option>";
        }
        return $tipos_conv;
    }

}

new ArqueoCaja();
?>
