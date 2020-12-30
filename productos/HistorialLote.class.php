<?php

require_once("../Y_Template.class.php");
require_once("../Config.class.php");
require_once("../Functions.class.php");

class HistorialLote {

    function __construct() {
        if (isset($_POST['action'])) {
            call_user_func_array(array(&$this, $_POST['action']), array());
        } else {
            $t = new Y_Template("HistorialLote.html");

            $t->Show("header");
            $c = new Config();
            $host = $c->getNasHost();
            $path = $c->getNasFolder();
            $images_url = "http://$host/$path";
            $suc = $_REQUEST['suc'];
            $t->Set("images_url", $images_url);
            $usuario = $_REQUEST['usuario'];
            
            $fn = new Functions();
            
            $trustee = $fn->chequearPermiso("6.6", $usuario); // Permiso para Cerrar una Nota de Pedido Internacional               
                
            $t->Set("display_audit","none");   
            if($trustee != '---'){
               $t->Set("display_audit","inline");   
            } 

            $t->Show("body");

            require_once("../utils/NumPad.class.php");
            new NumPad();
        }
    }
  
    function fracciones() {
        require_once("../Y_DB_MySQL.class.php");
        $lote = $_POST['lote'];

        $array = array();

        $db = new My();
        $sql = "SELECT usuario,DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha,hora, codigo,lote,cantidad,um,motivo,tara,gramaje,ancho ,kg_desc FROM fraccionamientos WHERE padre = '$lote'";

        $db->Query($sql);
        while ($db->NextRecord()) {
            array_push($array, $db->Record);
        }        
        $db->Close();        
        echo json_encode($array);
    }

}

new HistorialLote();
?>
