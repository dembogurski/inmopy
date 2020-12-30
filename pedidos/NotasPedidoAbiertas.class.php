<?php

/**
 * Description of VentasAbiertas
 * @author Ing.Douglas A. Dembogurski Feix
 * @date 12/03/2015
 */
require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php"); 
require_once("../Functions.class.php");

class NotasPedidoAbiertas {

    function __construct() {
        //$session = $_POST['session'];
        $usuario = $_POST['usuario'];
        $suc = $_POST['suc'];
        $touch = $_POST['touch']; 

        $t = new Y_Template("NotasPedidoAbiertas.html");

        $ms = new My();
        $ms->Query("SELECT nombre_color AS COLOR FROM pantone ORDER BY nombre_color ASC ");
        $colores = "";
        //array_map('utf8_encode', $ms->Record);
        while ($ms->NextRecord()) {    
            $color = utf8_encode( $ms->Record['COLOR']);    
            $colores.="'$color',";
        }
        $colores = substr($colores, 0, -1);
        $t->Set("colores", "[" . $colores . "]");

        $t->Show("header");
        $t->Show("cabecera_nota_pedido");
        $t->Show("area_carga_cab");

        // Buscar mis notas Abiertas
        $nacionales = "SELECT n_nro as nro,usuario,DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha,suc,nac_int AS tipo,estado,obs FROM nota_pedido_compra WHERE usuario = '$usuario' AND estado = 'Abierta' AND nac_int = 'Nacional'";
        //echo $nacionales;
        $this->mostrarNotaPedido($nacionales, $t, "Nacionales", "gs",$usuario,$suc);


        //Buscar la nota Internacional Abierta no debe haber mas de Una
        $internacionales = "SELECT n_nro as nro,usuario,DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha,suc,nac_int AS tipo,estado,obs FROM nota_pedido_compra WHERE estado = 'Abierta' AND nac_int = 'Internacional'";
        $this->mostrarNotaPedido($internacionales, $t, "Internacionales", "Bandera_Internacional",$usuario,$suc);
        // Solo si es Toutch
        /*
        if($touch=="true"){
            require_once("../utils/NumPad.class.php");   
            require_once("../utils/Keyboard.class.php");            
            new NumPad();            
            $keyboard = new Keyboard();
            $keyboard->show();
        }*/
    }

    function mostrarNotaPedido($sql, $t, $tipo_nota, $flag,$usuario,$suc) {
        $db = new My();
        $fn = new Functions();
        
        $db->Query($sql);
        if ($db->NumRows() > 0) {
            $t->Set("bandera", $flag);
            $t->Set("tipo_nota", $tipo_nota);
                        
            if($tipo_nota == "Internacionales"){ 
                $trustee = $fn->chequearPermiso("1.5.3", $usuario); // Permiso para Cerrar una Nota de Pedido Internacional               
                
                if($trustee != '---'){
                   $t->Set("enviar_pedido","block");                
                   $t->Set("cargaExcel", "<input type='button'  value='Cargar desde planilla Excel' onclick='cargarDesdeExcel()'>");
                }else{
                   $t->Set("enviar_pedido","none");    
                }
                $t->Set("nombre_nota", "Internacional");                
                $t->Set("fondo", "#5900B3");
                $t->Set("color", "white");
            }else{
                $t->Set("nombre_nota", "Nacionales");
                $t->Set("cargaExcel", "");
                $t->Set("fondo", "#fffccc");
                $t->Set("color", "black");
            }
            $t->Show("notas_abiertas_cab");


            while ($db->NextRecord()) {
                $nro = $db->Record['nro'];
                $fecha = $db->Record['fecha'];
                $usuario = $db->Record['usuario'];
                $suc = $db->Record['suc'];
                $tipo = $db->Record['tipo'];
                $estado = $db->Record['estado'];
                $obs = $db->Record['obs'];

                $t->Set("nro", $nro);
                $t->Set("fecha", $fecha);
                $t->Set("usuario", $usuario);
                $t->Set("suc", $suc);
                $t->Set("tipo", $tipo);
                $t->Set("estado", $estado);
                $t->Set("obs", $obs);
                   
                $t->Show("notas_abiertas_data");
            }

            $t->Show("notas_abiertas_foot");
        } else {
             if($tipo_nota == 'Nacionales'){
                 $db->Query("INSERT INTO nota_pedido_compra(usuario, temporada, fecha, hora, suc, nac_int, estado, e_sap)
                 VALUES ('$usuario', '*', CURRENT_DATE, CURRENT_TIME, '$suc',   'Nacional', 'Abierta', '0');");
             }else{
                 $db->Query("INSERT INTO nota_pedido_compra(usuario, temporada, fecha, hora, suc, nac_int, estado, e_sap)
                 VALUES ('Sistema', '*', CURRENT_DATE, CURRENT_TIME, '$suc',   'Internacional', 'Abierta', '0');");
             }
             $this->mostrarNotaPedido($sql, $t, $tipo_nota, $flag,$usuario,$suc);
        }
    }

}

new NotasPedidoAbiertas();
?>