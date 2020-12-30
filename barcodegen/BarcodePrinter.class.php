<?php

/**
 * Description of BarcodePrinter
 * @author Ing.Douglas
 * @date 08/10/2015
 */
require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");
require_once("../Functions.class.php");
require_once("../barcodegen/RadPlusBarcodeNoFont.php");     

class BarcodePrinter {

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
        
        $codes = $_REQUEST['codes'];   //$codes = "22222215,33333315,44444416,5555216,14562412";
        $usuario = $_REQUEST['usuario'];
        $printer = $_REQUEST['printer'];
        $silent_print = $_REQUEST['silent_print'];
        $auto_close_window = $_REQUEST['auto_close_window'];
        $buscar_destino = $_REQUEST['buscar_destino'];
        
        $moneda = $_REQUEST['moneda'];
        $um = $_REQUEST['um'];
        
        if(!isset($_REQUEST['moneda'])){
            $moneda = "G$";
        }
        
        
        $metros = $_REQUEST['metros']; // Solo para Imprimir codigos que de ante mano ya se sabe con cuantos va a quedar en Fabrica de Manteles (Retazos)
        
        $ip = $_SERVER['REMOTE_ADDR'];   
        $t->Set("ip", $ip);
        
        $etiqueta_cuidados = $_REQUEST['etiqueta_cuidados'];

        $margin = 'style="margin: 0;"';
        
        
        $t->Set("printer", $printer);
        $t->Set("silent_print", $silent_print);
        $t->Set("auto_close_window", $auto_close_window);
        $showFallas = false;
        $fallas = '';

        $etiqueta = "etiqueta_6x4";
        $tam = "6x4";
        if (isset($_REQUEST['etiqueta'])) {
            $etiqueta = $_REQUEST['etiqueta'];
            $tam = substr($etiqueta, 9, 30);
        }
        $t->Set("tam", $tam);
        
        $clave = $etiqueta."_".$ip;

        $margin = $this->getMargins($clave);
        $margen = "style='margin:$margin;'";
               

        $my = new My();
        $db = new My();
        
        $my->Query("SELECT suc FROM usuarios WHERE usuario = '$usuario'");
        $my->NextRecord();
        $suc = $my->Record['suc'];

        $t->Show("headers");


        $lotes = explode(",", $codes);
        foreach ($lotes as $lote) {

            /**
             * @todo split codes  
             */
            $filename = new RadPlusBarcode();
            $barcode_image = $filename->parseCode($lote);


            $ms = new My();            
            /*
            $sql0 = "SELECT e.id_ent as ref, l.codigo,a.composicion,l.ancho,a.descrip, a.mnj_x_lotes,a.um,p.nombre AS pais_origen, c.nombre_color AS color,design,color_cod_fabric FROM lotes l, articulos a, entrada_merc e, pantone c, paises p WHERE 
            l.codigo = a.codigo AND l.id_ent = e.id_ent AND  l.pantone = c.pantone AND e.pais_origen = p.codigo_pais AND l.lote = '$lote'";
            */
            $sql0 = "SELECT id_ent,id_frac,id_prod_ter,l.codigo,a.composicion,l.ancho,a.descrip, a.mnj_x_lotes,a.um, c.nombre_color AS color,design,color_cod_fabric FROM lotes l, articulos a,  pantone c  WHERE 
            l.codigo = a.codigo AND    l.pantone = c.pantone   AND l.lote = '$lote'  ";
            
            $ms->Query($sql0);
 
            if ($ms->NumRows() > 0) {
                $ms->NextRecord();
                if(!isset($_REQUEST['um'])){  // Sacar del Articulo
                    $um = $ms->Get("um");
                }
                 
                $codigo = $ms->Record['codigo'];
                
                $id_ent = $ms->Record['id_ent'];
                $id_frac = $ms->Record['id_frac'];
                $id_prod_ter = $ms->Record['id_prod_ter'];
                
                $ref = 0;
                $full_ref= 0;
                $origen = "China";
                
                if(!is_null($id_ent )){
                    $ref = $id_ent;
                    $full_ref = "EM-$ref";
                    $db->Query("SELECT p.nombre AS origen FROM entrada_merc e, paises p WHERE e.pais_origen = p.codigo_pais AND e.id_ent = $id_ent");
                    $db->NextRecord();
                    $origen = $db->Get("origen");
                }elseif(!is_null($id_frac )){
                    $ref = $id_frac;
                    $full_ref = "FR-$ref";
                }else{// Prod Ter
                    $ref = $id_prod_ter;
                    $full_ref = "PT-$ref";
                    $origen = "Paraguay";
                }
                 
                
                $composicion = $ms->Record['composicion'];
                
                $ancho = $ms->Record['ancho'];
                $descrip = $ms->Record['descrip'] . "-" . $ms->Record['color'] . "-" . $ms->Record['Design']; 
                
                 if ($etiqueta == "etiqueta_10x5") {
                    $descrip .= "-" . $ms->Record['color_cod_fabric'];
                }
                
                $db->Query("SELECT DISTINCT tipo_falla,COUNT(mts) AS cant FROM fallas WHERE lote = '$lote' GROUP BY tipo_falla ");
                
                $rF1 = 0;
                $rF2 = 0;
                $rF3 = 0;                
                while($db->NextRecord()){
                    $Fx = $db->Get("tipo_falla");
                    $cant = $db->Get("cant");
                    ${"r$Fx"} = $cant;
                }
                $f1 = $rF1 > 0 ? '<p>F1: ' . $rF1 . '</p>' : '';
                $f2 = $rF2 > 0 ? '<p>F2: ' . $rF2 . '</p>' : '';
                $f3 = $rF3 > 0 ? '<p>F3: ' . $rF3 . '</p>' : '';
                $fallas = $f1 . $f2 . $f3;
                
                $sql_precio = "SELECT precio,IF(descuento IS NULL,0,descuento) AS descuento , precio - IF(descuento IS NULL,0,descuento)  AS precio_neto FROM lista_prec_x_art a LEFT JOIN desc_lotes d ON a.codigo = d.codigo AND a.moneda = d.moneda 
                AND a.um = d.um AND a.num = d.num AND     d.lote = '$lote'  WHERE a.num = 1 AND a.codigo = '$codigo' AND a.moneda = '$moneda' AND a.um = '$um'";
                
 
                
                $db->Query($sql_precio);
                if($db->NumRows() == 0){
                    echo "Error no hay precio definido para Este articulo!";
                    die();
                }
                $db->NextRecord();
                
                $precio = $db->Record['precio'];
                $descuento = $db->Record['descuento']; 
                $precio_neto = round($db->Record['precio_neto']); 
 
                $fn = new Functions();
                $precio_final = $fn->redondeo50($precio_neto);
                
                $moneda_mostrar = str_replace("$", "s", $moneda);

                //$t->Set("antes","Antes");
                //$t->Set("precio_antes",number_format($precio,0,',','.')."Gs");
                //$t->Set("ahora","Ahora");
                $t->Set("ahora", "PRECIO");
                $t->Set("precio_ahora", number_format($precio_final, 0, ',', '.') . " $moneda_mostrar");
                 
                $db->Query("SELECT cantidad FROM stock WHERE codigo = '$codigo' AND lote = '$lote' AND suc = '$suc'");
                $db->NextRecord();
                
                $cant = $db->Get("cantidad");
                $t->Set("cant", number_format($cant, 2, ',', '.'));

                $t->Set("user", $usuario);
                $t->Set("origen", strtoupper($origen));
                $t->Set("ref", $full_ref);
                $t->Set("composicion", strtoupper($composicion));
                $t->Set("ancho", number_format($ancho, 2, ',', '.'));
                $t->Set("suc", $suc );

                if (isset($buscar_destino)) {
                    $my->Query("SELECT suc_destino FROM fraccionamientos WHERE lote = '$lote' ORDER BY id_frac DESC LIMIT 1");
                    if ($my->NumRows() > 0) {
                        $my->NextRecord();
                        $destino = $my->Record['suc_destino'];
                        $t->Set("suc", $destino);
                    }
                }

                

                if (isset($_REQUEST['metros'])) {
                    $t->Set("cant", number_format($metros, 2, ',', '.'));
                }
 

                $t->Set("descrip",  strtoupper($descrip) );


                $t->Set("articulo", $codigo);
                $t->Set("unid", $um);
 
                $t->Set("barcode_image", $barcode_image);
                $t->Set("lote", $lote);
                $t->Set("fallas", $fallas);
                $t->Set("margin", $margen);

                $t->Show($etiqueta);

                $reg_impresion = "INSERT INTO  reg_impresion(usuario, lote, suc_user, suc_lote,fecha, obs)
                VALUES ('$usuario', '$lote', '$suc', '$suc',current_timestamp, 'Impresion en Descarga');";
                $my->Query($reg_impresion);
            } else {
                $t->Set("lote", $lote);
                $t->Set("imprimir", "false");
                $t->Show("error");
                //echo "Error Codigo de Lote: $lote no existe...";
            }
        }
        if($etiqueta_cuidados == 'true'){
            $etiquetaCuidado = $this->getEtiquetaCuidado($codigo);
            if($etiquetaCuidado !== ''){
                $clave = "etiqueta_6x4_cuidados_$ip";
                $margin = $this->getMargins($clave);
                $margen = "style='margin:$margin;'";
                $t->Set("margin", $margen);
                $t->Set("image", $etiquetaCuidado);
                $t->Show("etiqueta_6x4_cuidados");
            }
        }
        $t->Show("config_popup");
        
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
 

    function getEtiquetaCuidado($codigo){
        $ms = new My();
        
        $sql0 = "SELECT  a.cod_prop, descrip, a.valor FROM art_propiedades p, prop_x_art a WHERE a.cod_prop = p.cod_prop AND    a.cod_prop <= 5 AND valor ='Si' AND a.codigo = '$codigo' ";
        $ms->Query($sql0);
        $etiqueta = 'xx';
            
        if($ms->NumRows() > 0){
            $ms->NextRecord();
            
            $cod_prop = $ms->Record['cod_prop'];
            $valor = $ms->Record['valor'];  
        
            if($cod_prop == '1'){
                $etiqueta = "../img/etiquetascuidados/1-ALG_POL_LAVADO_MAQUINA.jpg";
            }elseif($cod_prop == '2'){
                $etiqueta = "../img/etiquetascuidados/2-100_PORC_ALGODON_LAVADO_MAQUINA.jpg";
            }elseif($cod_prop == '3'){
                $etiqueta = "../img/etiquetascuidados/3-100_PORC_SINTETCO_LAVADO_MANUAL.jpg";
            }elseif($cod_prop == '4'){
                $etiqueta = "../img/etiquetascuidados/4-100_SINTETICO_LAVADO_MAQUINA.jpg";
            }elseif($cod_prop == '5'){
                $etiqueta = "../img/etiquetascuidados/5-100_SINTETICO_LAVADO_MANUAL_EN_SECO.jpg";
            }
            return $etiqueta;
        }else{
            echo "Falta definir El tipo de Cuidado para este Articulo $codigo en Datos Maestros de Articulos";
            echo "No se puede imprimir antes de que este definida El tipo de Cuidado, contacte con gerencia Comercial...";
            die();
        }
        
    }
}

function saveMargins(){
     $db = new My();
     $key = $_REQUEST['clave'];
     $margins = $_REQUEST['margins'];
     $db->Query("select count(*) as cant from parametros where clave = '$key'");
     $db->NextRecord();
     $cant = $db->Get("cant");  //echo "select count(*) as cant from parametros where clave = '$key'";
     if($cant > 0){
         $db->Query("UPDATE parametros SET valor = '$margins' WHERE  clave ='$key';");
     }else{ //echo "INSERT INTO  parametros(clave, usuario, valor, descrip)VALUES ('$key', 'sistema', '$margins', 'Margenes de Etiquetas');";
         $db->Query("INSERT INTO  parametros(clave, usuario, valor, descrip)VALUES ('$key', 'sistema', '$margins', 'Margenes de Etiquetas');");
     }
     echo "Ok";
}


new BarcodePrinter();
?>
