<?php

/**
 * Check: ok
 * Description of FotoStudio
 * @author Ing.Douglas
 * @date 28/09/2016
 */

ini_set('post_max_size', '12M');
ini_set('max_execution_time', '400');

require_once("../Y_DB_MySQL.class.php");
require_once("../Y_Template.class.php");
require_once("../Config.class.php");

class FotoStudio {

    function __construct() {
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }

    function main() {
        $t = new Y_Template("FotoStudio.html");
        $t->Show("header");
        
        $c = new Config();
        $host = $c->getNasHost();
        $path = $c->getNasFolder();
        $images_url = "http://$host/$path";
        $t->Set("images_url", $images_url);
        
        $t->Show("body");
        //$touch = $_POST['touch']; 

        require_once("../utils/NumPad.class.php");
        new NumPad();
    }

} 

// A partir de aqui es para la Entrada de Mercaderias puede usarse antes de que el lote exista

function getDatosLoteEntrada() {
    $lote = $_POST['lote'];
 
    $db = new My();
    $db->Query("SELECT  d.id_ent,id_det,suc,tipo_doc_sap, codigo,cant_calc, descrip,um,um_prod,ancho,ancho_real,gramaje,gramaje_m,img,color,design,kg_desc,precio FROM entrada_merc e, entrada_det d WHERE e.id_ent = d.id_ent  AND  lote =  '$lote';"); //Lote

    /**
     * Quantity = Cantidad Fisica
     * IsCommited = Comprometido en Orden de Venta
     */
    $arr = array();

    if ($db->NumRows() > 0) {
        $db->NextRecord();
        $codigo = $db->Record['codigo'];
        $id_det = $db->Record['id_det'];
        $stock = $db->Record['cant_calc'];
        $ancho = $db->Record['ancho_real'];
        $um = $db->Record['um'];
        $descrip = $db->Record['descrip']; 
        $gramaje = $db->Record['gramaje'];
        $gramaje_m = $db->Record['gramaje_m'];
        $color_comercial = utf8_decode($db->Record['color']);
         
        $Status = "0";
        $Suc = $db->Record['suc'];
        $Img = $db->Record['img'];
        $Tara = 0; // No importa
        $Descuento = 0; // No importa 
        $U_design = $db->Record['design'];
        $BaseType = $db->Record['tipo_doc_sap'];
        $BaseEntry = $db->Record['id_ent'];
        $BaseNum = $db->Record['id_ent'];
        $kg_desc = $db->Record['kg_desc'];
        $precio = $db->Record['precio'];
        
        if ($ancho == null) {
            $ancho = 0;
        }
        if ($gramaje == null) {
            $gramaje = 0;
        }
          

        $datos = array();
        $datos["Codigo"] = $codigo;
        $datos["id_det"] = $id_det;
        $datos["Stock"] = $stock;
        $datos["Descrip"] = strtoupper(utf8_decode($descrip));
        $datos["UM"] = $um;
        $datos["Ancho"] = $ancho;
        $datos["Gramaje"] = $gramaje;
        $datos["GramajeM"] = $gramaje_m; 
        $datos["TotalGlobal"] = 0; // No importa 
        $datos["Estado"] = $Status;
        $datos["Suc"] = $Suc;
        $datos["Img"] = $Img;
        $datos["Tara"] = $Tara;
        $datos["BaseType"] = $BaseType;
        $datos["BaseEntry"] = $BaseEntry;
        $datos["BaseNum"] = $BaseNum;
        $datos["Color"] = utf8_encode( $color_comercial);
        $datos["Design"] = utf8_encode( $U_design);
        $datos["kg_desc"] = $kg_desc; 
        $datos["Precio"] = $precio;
        $datos["Descuento"] = $Descuento;
        $datos["CantCompra"] = $stock;
       
        $datos["Mensaje"] = "Ok";
        array_push($arr, $datos);
    } else {
        $datos["Mensaje"] = "Codigo no encontrado...";
        array_push($arr, $datos);
    }

    echo json_encode($arr);
}


function getLotesSimilaresEntrada() {
    $lote = $_POST['lote'];

    
    $my = new My();
    $my->Query("SELECT id_ent as BaseEntry,codigo as ItemCode,cod_pantone as U_color_comercial,design as U_design,nro_lote_fab as U_nro_lote_fab,fab_color_cod as U_color_cod_fabric, cod_catalogo,store_no as tienda FROM entrada_det o where o.lote = '$lote';"); //Lote
    $my->NextRecord();
    
    $codigo = $my->Record['ItemCode'];
     
    $BaseEntry = $my->Record['BaseEntry'];
    $U_color_comercial = $my->Record['U_color_comercial'];
    $U_design = $my->Record['U_design'];
    $U_nro_lote_fab = $my->Record['U_nro_lote_fab'];      
    
    $cod_catalogo = $my->Record['cod_catalogo'];
    $U_color_cod_fabric = $my->Record['U_color_cod_fabric'];
    $tienda = $my->Record['tienda'];
    
    
    $my->Query("SELECT nro_lote_fab as U_nro_lote_fab,lote as Lote,color as U_color_comercial,design as U_design,cant_calc as Stock,notas as Obs,img as U_img,fab_color_cod as ColorDesc "
            . "FROM entrada_det where codigo = '$codigo' and id_ent = $BaseEntry "
            . "and design = '$U_design' and cod_pantone = '$U_color_comercial' and nro_lote_fab = '$U_nro_lote_fab' and fab_color_cod = '$U_color_cod_fabric' and  cod_catalogo = '$cod_catalogo' and store_no = '$tienda';");
    
         
    $arr = array();

    while ($my->NextRecord() > 0) {
        $Lote = $my->Record['Lote'];
        $Stock = $my->Record['Stock'];
        $img = $my->Record['U_img'];
        $ColorDesc = $my->Record['ColorDesc'];
        $U_nro_lote_fab = $my->Record['U_nro_lote_fab'];
        if($Stock == ".00"){ $Stock = "0.00"; }
        $Obs = $my->Record['Obs'];
        $datos["Lote"] = $Lote;
        $datos["Img"] = $img;
        $datos["Stock"] = $Stock;
        $datos["U_nro_lote_fab"] = $U_nro_lote_fab; 
        $datos["ColorDesc"] = $cod_catalogo."-".$ColorDesc;
        $datos["Obs"] = strtoupper(utf8_encode($Obs));  
        array_push($arr, $datos);
    }
    echo json_encode($arr);
}

function actualizarLotesEntrada() {
    require_once '../Config.class.php';
    
    $lote_principal = $_POST['lote'];
    $BaseType = $_POST['BaseType'];
    $BaseEntry = $_POST['BaseEntry'];
     
    $lotes = json_decode($_POST['lotes']);
    $ancho = $_POST['ancho'];
    $gramaje_m = $_POST['gramaje_m'];
    $imagen = $_POST['imagen'];
    $thumnail = $_POST['thumnail'];
    $data = base64_decode($imagen); 
    $thumnail64 = base64_decode($thumnail); 
    
    $tam = sizeof($lotes);
     
   
    try {
         
        $my = new My();
        $c = new Config();
        
        $username = $c->getNasUser();
        $password = $c->getNasPassw();
        $path = $c->getNasPath();
        $folder = $c->getNasFolder();
        $port = $c->getNasPort();
        $host = $c->getNasHost();
        
        $full_path = $path."/$folder/".$BaseType."-".$BaseEntry;
        $filename = $full_path."/$lote_principal.jpg";
        
        
        require_once '../utils/NAS.class.php';
        $nas = new NAS($host,$port);
        $nas->login($username, $password);
        
        $nas->mkdir($full_path);
        
        $nas->setContent($data,$filename);
                       
        
        $thumname = $full_path."/$lote_principal.thum.jpg";
        $nas->setContent($thumnail64,$thumname);
             
        // End Thumnail
                       
        $file_url = "http://$host/$folder/$BaseType"."-"."$BaseEntry/$lote_principal.jpg";        
        
        // Actualizo los demas Lotes
        $U_img = $BaseType."-".$BaseEntry."/".$lote_principal;
        
        foreach ($lotes as $lote) {
            //$actualizar = buscarHijos($lote);// Hijos no debe tener
            $my->Query("UPDATE entrada_det SET img = '$U_img'  WHERE lote = '$lote';");
            //Actualizar tambien los Lotes ya metidos en el Stock 
            $my->Query("UPDATE lotes SET img = '$U_img'  WHERE lote = '$lote';");
        }
                
        $arr = array("mesaje"=>"Ok","url"=>$file_url,"Long: "=>$tam);
        
    } catch (Exception $e) {
        $arr = array("mesaje"=>$e->getMessage());        
    }
    echo json_encode($arr);
}

new FotoStudio();
?>
