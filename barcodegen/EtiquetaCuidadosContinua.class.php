<?php

/**
 * Description of EtiquetaCuidadosContinua
 * @author Ing.Douglas
 * @date 21/02/2019
 */
require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");
require_once("../barcodegen/RadPlusBarcodeNoFont.php");

class EtiquetaCuidadosContinua {

    function __construct() {

         
        $usuario = $_REQUEST['usuario'];
        $printer = $_REQUEST['printer'];
        $silent_print = $_REQUEST['silent_print'];
        $tipo = $_REQUEST['tipo'];
        $medidas = $_REQUEST['medidas'];
         

        $auto_close_window = $_REQUEST['auto_close_window'];

        $margin = 'Style="margin: 0;"';
        $marginTop = 0;
        $marginBottom = 0;
        $marginLeft = 0;
        $marginRight = 0;
        $scaling = 0;



        $t = new Y_Template("EtiquetaCuidados.html");
        $t->Set("printer", $printer);
        $t->Set("silent_print", $silent_print);
        $t->Set("auto_close_window", $auto_close_window);
        $t->Set("tipo", $tipo);
         
          

         
        $tam = "continua";
          
        
        $t->Set("tam", $tam);

        $etiqueta_cuidados_continua_3cm = "etiqueta_cuidados_continua_3cm";

        if ($_SERVER['REMOTE_ADDR'] === '192.168.3.25' || $_SERVER['REMOTE_ADDR'] === '177.222.15.163') {
            $margin = 'Style="margin: 0 0 0 1%;"';
        }

        if ($_SERVER['REMOTE_ADDR'] === '192.168.3.38' || $_SERVER['REMOTE_ADDR'] === '192.168.3.37' || $_SERVER['REMOTE_ADDR'] === '127.0.0.1' || $_SERVER['REMOTE_ADDR'] === '192.168.2.19') {
            $etiqueta_cuidados_continua_3cm = "etiqueta_cuidados_continua_3cm";
        }
        if ($_SERVER['REMOTE_ADDR'] === '192.168.4.17') {
            $margin = 'Style="margin: 5% 0 -1% 26%;"';
        }
        if ($_SERVER['REMOTE_ADDR'] === '192.168.3.26') {
            $margin = 'Style="margin: 0 0 0 8%;"';
        }
        $t->Set("etiqueta_cuidados_continua_3cm", $etiqueta_cuidados_continua_3cm);    
        $t->Set("marginTop", $marginTop);
        $t->Set("marginBottom", $marginBottom);
        $t->Set("marginLeft", $marginLeft);
        $t->Set("marginRight", $marginRight);
        $t->Set("scaling", $scaling);
 

        $t->Show("headers");
        
        
        $t->Set("medidas",$medidas);
        
        $url = "Poliamida_".str_replace("% ","Porc",$tipo);
         
        
        $t->Set("image", "../img/etiquetascuidados/$url.png");   
         
           
  
       // $t->Set("image", "../img/etiquetascuidados/EtiquetaPoliamidaContinua.png");   
  
        $t->Set("margin", $margin);

        $t->Show("etiqueta_poliamida_continua_4cm");
    }

    function getOS() {
        $agent = $_SERVER['HTTP_USER_AGENT'];
        if (preg_match('/Linux/', $agent))
            $os = 'Linux';
        elseif (preg_match('/Win/', $agent))
            $os = 'Windows';
        elseif (preg_match('/Mac/', $agent))
            $os = 'Mac';
        else
            $os = 'UnKnown';
        return $os;
    }

}

new EtiquetaCuidadosContinua();
?>
