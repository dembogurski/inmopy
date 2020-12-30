<?php

/**
 * check: ok
 * Description of BarcodePrinterDescargaLoteVirtual
 * @author Ing.Douglas
 * @date 22/12/2017
 */
require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");
require_once("../Functions.class.php");
require_once("../barcodegen/RadPlusBarcodeNoFont.php");

class BarcodePrinterDescargaLoteVirtual {

    function __construct() {
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }

    function main() {
       
        $t = new Y_Template("BarcodePrinter.html");

        $id_ent = $_REQUEST['id_ent'];
        $AbsEntry = $_REQUEST['AbsEntry'];
        $lote = $_REQUEST['lote'];
        $usuario = $_REQUEST['usuario'];
        $motivo = $_REQUEST['motivo'];
        $codigo = $_REQUEST['codigo'];
        
        $ip = $_SERVER['REMOTE_ADDR'];   
        $t->Set("ip", $ip);

        if($lote == 'undefined'){
            $lote = '';
        }
        
        $umc = $_REQUEST['umc'];
        $cant_c = $_REQUEST['cant_c'];
        $etiqueta_cuidados = $_REQUEST['etiqueta_cuidados'];

        

        $etiqueta = "etiqueta_6x4";
        $tam = "6x4";
        if (isset($_REQUEST['etiqueta'])) {
            $etiqueta = $_REQUEST['etiqueta'];
            $tam = substr($etiqueta, 9, 30);  
        }
        $my_checkFrac = new My();
        $inOrdenFrac = "";
        $inOrdenFracDisplay = 'none';
        // Orden de fraccionamientos
        $my_checkFrac->Query("SELECT distinct(suc) AS suc,COUNT(*) AS cortes, presentacion FROM orden_procesamiento WHERE codigo ='$codigo' and lote='$lote' and estado = 'Pendiente'");
        $filas = $my_checkFrac->NumRows();
        
        
        if ($filas > 1) {
            $inOrdenFrac = ">Proc";
            $t->Set("sounds",'<audio class="beep sound" style="display:none" controls  autoplay  preload="auto"> <source src="../files/sounds/beep-04.wav" type="audio/wav"></audio>');
            $inOrdenFracDisplay = 'inline-block';
            while ($my_checkFrac->NextRecord()) {
                if ($my_checkFrac->Record['suc'] == '09') {
                    $inOrdenFrac = ">09";
                    $inOrdenFracDisplay = 'inline-block';
                }
            }
        }

        if ($filas == 1 ) {
            $my_checkFrac->NextRecord();
            $cortes = $my_checkFrac->Record['cortes'];
            $destino  = $my_checkFrac->Record['suc'];
            $presentacion  = $my_checkFrac->Record['presentacion'];
            
            if($cortes > 1){
                $inOrdenFrac = ">Proc";
                $t->Set("sounds",'<audio class="beep sound" style="display:none" controls  autoplay  preload="auto"> <source src="../files/sounds/beep-04.wav" type="audio/wav"></audio>');
            }else{
                
                if($destino == null){
                    $inOrdenFrac = ">00";
                }else{
                    $inOrdenFrac = ">Rem: [$destino]";
                    $t->Set("sounds",'<audio class="beep sound" style="display:none" controls  autoplay  preload="auto"> <source src="../files/sounds/beep-05.wav" type="audio/wav"></audio>');
                }                               
                
            }            
            
            $inOrdenFracDisplay = 'inline-block';
        }
        $t->Set("tam", $tam);

        $my = new My();
        $my->Query("SELECT suc FROM usuarios WHERE usuario = '$usuario'");
        $my->NextRecord();
        $suc_user = $my->Record['suc'];


        $printer = $_REQUEST['printer'];
        $silent_print = $_REQUEST['silent_print'];
        $auto_close_window = $_REQUEST['auto_close_window'];
        
        
        $clave = $etiqueta."_".$ip;

        $margin = $this->getMargins($clave);
        $margen = "style='margin:$margin;'";
        

        $t->Set("printer", $printer);
        $t->Set("silent_print", $silent_print);
        $t->Set("auto_close_window", $auto_close_window);

        $t->Show("headers");
        
        $filename = new RadPlusBarcode();
        

        $db = new My();

        $db->Query("SELECT id_ent as ref, d.codigo,lote,d.descrip,d.um,CONCAT(cod_catalogo,'-',fab_color_cod) as fab_color_cod,color,design,composicion,ancho_real,quty_ticket,kg_desc,cant_calc FROM entrada_det d, articulos a WHERE a.codigo = d.codigo and id_det = $AbsEntry and id_ent = $id_ent;");


       
        if ($db->NumRows() > 0) {
            $db->NextRecord();

            $ref = $db->Record['ref'];

            $articulo = $db->Record['codigo'];


            $descrip = $db->Record['descrip'] . "-" . $db->Record['color'] . "-" . $db->Record['design'];

            if ($etiqueta == "etiqueta_10x5") {
                $descrip .= "-" . $db->Record['fab_color_cod'];
            }

            $t->Set("user", $usuario);

            $t->Set("ref", $ref);
            $t->Set("composicion", ucwords(strtolower($db->Record['composicion'])));
            $t->Set("ancho", number_format($db->Record['ancho_real'], 2, ',', '.'));


            $t->Set("cant", number_format($cant_c, 2, ',', '.'));
            
            if($umc == "Kg"){ 
               $cant_calc = number_format($db->Record['cant_calc'], 2, ',', '.');
               $t->Set("cant_mts_x_kg", "$cant_calc <b>Mts</b>" );
            }

            $t->Set("descrip", ucwords(strtolower($descrip)));
            $preciox = $db->Record['Precio'];
            $fn = new Functions();
            $precio = $fn->redondeo50($preciox);
            $t->Set("precio", number_format($precio, 0, ',', '.'));

            $t->Set("articulo", $articulo);
            $t->Set("inOrdenFracDisplay", $inOrdenFracDisplay);
            $t->Set("inOrdenFrac", $inOrdenFrac);
            $t->Set("unid", $umc);
            
            $codigo_barras = $lote;
            $t->Set("lote", $lote);
            
            $t->Set("tipo", "Lote");
            if($lote == "undefined"){
                $codigo_barras = $articulo;
                $t->Set("lote", $articulo);
                $t->Set("tipo", "Codigo");
            }
            
            $barcode_image = $filename->parseCode($codigo_barras, 6, 3);


            $t->Set("barcode_image", $barcode_image);
            

            // Datos de la Cabecera

            $db->Query("SELECT suc,pais_origen as country_code FROM entrada_merc WHERE id_ent = $ref ");
            $db->NextRecord();
            $suc_lote = $db->Record['suc'];
            $country_code = $db->Record['country_code'];
            $t->Set("suc", $suc_lote);

            $ms = new My();
            $ms->Query("SELECT codigo_pais , nombre FROM paises WHERE codigo_pais = '$country_code' ");

            $ms->NextRecord();

            $PaisOrigen = utf8_decode($ms->Record['nombre']);

            $t->Set("origen", $PaisOrigen);
                        
            $t->Set("margin", $margen);

            $t->Show($etiqueta);


            $db->Query("UPDATE entrada_det SET printed = IF(printed IS NULL,1,printed + 1)    WHERE id_det = $AbsEntry and id_ent = $id_ent;");

            $reg_impresion = "INSERT INTO  reg_impresion(usuario,codigo, lote, suc_user, suc_lote,fecha, obs, motivo)
                VALUES ('$usuario','$articulo', '$lote', '$suc_user', '$suc_lote',current_timestamp, 'Impresion en Descarga','$motivo')";
            $my->Query($reg_impresion);


            if ($etiqueta_cuidados == "true") {
                $ms = new My();
                $sql0 = "SELECT  a.cod_prop, descrip, a.valor FROM art_propiedades p, prop_x_art a WHERE a.cod_prop = p.cod_prop AND    a.cod_prop <= 5 AND valor ='Si' AND a.codigo = '$articulo' ";
                $ms->Query($sql0);


                if ($ms->NumRows() > 0) {
                    $ms->NextRecord();

                    
                    $cod_prop = $ms->Record['cod_prop'];
                    $valor = $ms->Record['valor']; 


                    if ($cod_prop == '1') {
                        $t->Set("image", "../img/etiquetascuidados/1-ALG_POL_LAVADO_MAQUINA.jpg");
                    } elseif ($cod_prop == '2') {
                        $t->Set("image", "../img/etiquetascuidados/2-100_PORC_ALGODON_LAVADO_MAQUINA.jpg");
                    } elseif ($cod_prop == '3') {
                        $t->Set("image", "../img/etiquetascuidados/3-100_PORC_SINTETCO_LAVADO_MANUAL.jpg");
                    } elseif ($cod_prop == '4') {
                        $t->Set("image", "../img/etiquetascuidados/4-100_SINTETICO_LAVADO_MAQUINA.jpg");
                    } elseif ($cod_prop == '5') {
                        $t->Set("image", "../img/etiquetascuidados/5-100_SINTETICO_LAVADO_MANUAL_EN_SECO.jpg");
                    } else {
                        echo "Falta definir El tipo de Cuidado para este Articulo $articulo en Datos Maestros de Articulos";
                        echo "No se puede imprimir antes de que este definida El tipo de Cuidado, contacte con gerencia Comercial...";
                        die();
                    }

                    $t->Set("barcode_image", $barcode_image);
                    
                    $clave = $etiqueta."_cuidados_".$ip;

                    $margin = $this->getMargins($clave);
                    $margen_cuidados = "style='margin:$margin;'";

                     $t->Set("margin", $margen_cuidados);

                    $t->Show($etiqueta . "_cuidados");
                }
            }
            $t->Show("config_popup");
            
        } else {
            echo "Error Codigo de Lote: $lote no existe...";
        }
    }
    
    function getMargins($clave){
        $db = new My();
        $db->Query("select valor from parametros where clave = '$clave'");
        if($db->NumRows()>0){
            $db->NextRecord();
            return $db->Get("valor");
        }else{
            return "0";
        }
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

new BarcodePrinterDescargaLoteVirtual();
?>
