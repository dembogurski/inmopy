<?php

/**
 * 
 * Description of Descarga
 * @author Ing.Douglas
 * @date 18/12/2017
 * @update_date 05/12/2019
 */
require_once("../Y_DB_MySQL.class.php");
require_once("../Y_Template.class.php");
require_once("../Functions.class.php"); 
require_once("../Config.class.php");        

class Descarga {
    function __construct() {
        $action = $_REQUEST['action'];  
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }

    function main() {
       $usuario = $_POST['usuario'];       
       $suc = $_POST['suc'];       
       //$f = new Functions();   
       //$permiso = $f->chequearPermiso("7.10", $usuario); // Acceso al Menu Recepcion de Mercaderias Nuevo
       
       $t = new Y_Template("Descarga.html");
       $t->Show("headers");
       
       
        
        $t->Show("heada");
        
        $db = new My();   
        $sql = "SELECT id_ent,suc,usuario,cod_prov,proveedor,DATE_FORMAT(fecha,'%d-%m-%Y') as fecha,moneda,invoice,folio_num,n_nro,origen,pais_origen,sap_doc,estado from entrada_merc where estado = 'En_Transito' and suc = '$suc'";
        
        //echo $sql;
        
        $db->Query($sql);
        while($db->NextRecord()){
            $id = $db->Record['id_ent'];
            $suc = $db->Record['suc'];
            $usuario = $db->Record['usuario'];
            $cod_prov = $db->Record['cod_prov'];
            $proveedor = $db->Record['proveedor'];
            $fecha = $db->Record['fecha'];
            $moneda = $db->Record['moneda'];            
            $invoice = $db->Record['invoice'];
            $folio_num = $db->Record['folio_num'];
            $origen = $db->Record['origen'];
            $pais_origen = $db->Record['pais_origen'];
            $estado = $db->Record['estado']; 
            $sap_doc = $db->Record['sap_doc'];
            $n_nro = $db->Record['n_nro'];
            
            $t->Set("id",$id);
            $t->Set("invoice", $invoice);    
            $t->Set("suc",$suc);
            $t->Set("usuario",$usuario);
            $t->Set("cod_prov",$cod_prov); 
            $t->Set("proveedor",$proveedor);
            $t->Set("fecha",$fecha);
            $t->Set("moneda",$moneda);  
            $t->Set("origen",$origen);  
            $t->Set("pais_origen",$pais_origen);
            $t->Set("estado",  $estado);
            $t->Set("sap_doc",  $sap_doc);
            $t->Set("n_nro",  $n_nro);
            $t->Show("linea");
        } 
        $t->Show("foota");
              
    } 
   }
 function abrirCompra(){
        
        $nro_compra = $_POST['nro_compra'];         
        $t = new Y_Template("Descarga.html");
        
        
        $c = new Config();
        $host = $c->getNasHost();
        $path = $c->getNasFolder();
        $images_url = "http://$host/$path";
        $t->Set("images_url",$images_url);
        
        
        $db = new My();
        // Datos de la compra

        $db->Query("SELECT usuario,suc,invoice,folio_num,cod_prov,proveedor,estado,origen FROM entrada_merc WHERE id_ent = $nro_compra");
        $db->NextRecord();
        
        $CardName = $db->Record['proveedor'];
        $Invoice = $db->Record['invoice'];
        $U_estado = $db->Record['estado'];
        $origen = $db->Record['origen'];
        
        $t->Set("nro_compra", $nro_compra);
        $t->Set("invoice", $Invoice);
        $t->Set("cardname", $CardName);
        $t->Set("estado", $U_estado);
        $t->Set("origen", $origen);
        if ($U_estado == "En Transito") {
            $t->Set("color", "green");
        } else {
            $t->Set("color", "red");
        }

        // Articulos  Nombres Comerciales

        //$filtro_base_type = ' and (BaseType = 20 or BaseType = 18) ';

        //$db->Query("select distinct ItemCode,Dscription as U_NOMBRE_COM from PDN1 where DocEntry = $DocEntry ORDER BY  Dscription ASC");
        $db->Query("SELECT DISTINCT codigo AS ItemCode,descrip AS U_NOMBRE_COM FROM entrada_det WHERE id_ent = $nro_compra ORDER BY descrip ASC");
        $articulos = "";

        while ($db->NextRecord()) {
            $ItemCode = $db->Record['ItemCode'];
            $descrip = $db->Record['U_NOMBRE_COM'];
            $arr = explode("-", $descrip);
            $articulo = $arr[1];
            $articulos.="<option value='$ItemCode' class='touch_filter'>$articulo</option>";
        }

        $t->Set("option_articulos", $articulos);
  
         
          
        $t->Show("headers");

        $t->Show("search_bar");

        $t->Show("rolls");
        
        require_once("../utils/NumPad.class.php");            
        new NumPad();
    }         
function getResultArray($sql) {
    $db = new My();
    $array = array();
    $db->Query($sql);
    while ($db->NextRecord()) {
        array_push($array, $db->Record);
    }
    $db->Close();
    return $array;
}
 
function getMaxId($id_ent){
    $my = new My();
    $max = "SELECT   MAX(id_det) as max FROM entrada_det WHERE id_ent = $id_ent";
     
    $my->Query($max);
    $my->NextRecord();
    $maximo = $my->Record['max'];
    return $maximo;
}
 
function fraccionar(){
    try{
        $id_ent = $_REQUEST['id_ent'];
        $id_det = $_REQUEST['id_det'];
        $cantidades = trim($_REQUEST['cantidades']);

        $db = new My();
        $sql1 = "SELECT codigo,  subtotal FROM entrada_det WHERE id_ent = $id_ent AND id_det = $id_det";
        $db->Query($sql1);
        $db->NextRecord();
        $codigo = $db->Record['codigo'];
        $subtotal = $db->Record['subtotal'];

        $array = explode("\n", $cantidades);

        $suma = array_sum($array);
        // Calculo el nuevo precio con el subtotal
        $precio = $subtotal / $suma;


        $last = 0;
        $sum = 0;
        $msj = array();
        //$msj['suma'] = $suma;
        //for($i = 0; $i < sizeof($array)-1 ; $i++ ){
        $fn = new Functions();
        
        foreach($array as $cantidad){

           //$cant = $array[$i]; 
           $cant = $cantidad; 
           $max = getMaxId($id_ent) + 1; 
           $n_subt = $cant * $precio ;

           $nuevo_lote = $fn->generarLote($codigo);
           //$query ="INSERT INTO  entrada_det (id_ent, id_det, nro_pedido, id_pack, store_no, bale, piece, codigo, lote, descrip, um, cod_catalogo, fab_color_cod, precio, cantidad, subtotal, color, color_comb, design, composicion, ancho, gramaje, obs, um_prod, cant_calc, cod_pantone, nro_lote_fab, quty_ticket, kg_desc, ancho_real, gramaje_m, equiv, recibido, printed, notas, fraccion_de,initial_id) SELECT $id_ent, $max, nro_pedido, id_pack, store_no, bale, piece, codigo, '$nuevo_lote', descrip, um, cod_catalogo, fab_color_cod, $precio, $cant, $n_subt, color, color_comb, design, composicion, ancho, gramaje, obs, um_prod, $cant, cod_pantone, nro_lote_fab, 0, 0, ancho_real, 0, equiv, recibido, printed, concat('Fraccionado de: ',lote,$id_det), lote,$id_det FROM entrada_det WHERE id_ent = $id_ent AND id_det = $id_det";
           $query ="INSERT INTO  entrada_det (id_ent, id_det, nro_pedido, id_pack, store_no, bale, piece, codigo, lote, descrip, um, cod_catalogo, fab_color_cod, precio, cantidad, subtotal, color, color_comb, design, ancho, gramaje, obs, um_prod, cant_calc, cod_pantone, nro_lote_fab, quty_ticket, kg_desc, ancho_real, gramaje_m, equiv, recibido, printed, notas, fraccion_de,initial_id,img) SELECT $id_ent, $max, nro_pedido, id_pack, store_no, bale, piece, codigo, '$nuevo_lote', descrip, um, cod_catalogo, fab_color_cod, precio, $cant, precio*$cant, color, color_comb, design, ancho, gramaje, obs, um_prod, $cant, cod_pantone, nro_lote_fab, 0, 0, ancho_real, 0, equiv, recibido, printed, concat('Fraccionado de: ',lote), lote,$id_det,img FROM entrada_det WHERE id_ent = $id_ent AND id_det = $id_det";

           //echo "Insertar en Tabla Lotes"   // Creo que no hace falta al actualizar generara los mismos;

           //$msj['query'] = $query;
           $db->Query($query); 
        }

        $ultima = $array[sizeof($array)-1];

        // $db->Query("update entrada_det set cantidad = $ultima,cant_calc = $ultima, /*precio = $precio ,*/ subtotal = precio * cantidad where id_ent = $id_ent and id_det = $id_det");
        $db->Query("update entrada_det set cantidad = cantidad-$suma,cant_calc =cantidad-$suma,   subtotal = precio * cantidad where id_ent = $id_ent and id_det = $id_det");
        //echo json_encode($msj);  
        echo json_encode(array("Estado"=>"Ok"));
    }catch(Exception  $e){
       echo json_encode(array("Estado"=>"Error"));
    }  
}
function registrarReimpresion(){
    $usuario = $_POST['usuario'];
    $lote = $_POST['lote'];
    $suc = $_POST['suc'];
    $motivo = $_POST['motivo'];
    $my = new My();
    $my->Query("INSERT INTO reg_impresion (usuario, lote, suc_user, suc_lote, fecha, obs, motivo) VALUES ('$usuario', '$lote', '$suc', '$suc', TIMESTAMP(NOW()), 'Impresion en Descarga','$motivo')");
    echo "OK";
}
function getDesigns(){
   $nro_compra = $_REQUEST['nro_compra'];
   $codigo = $_REQUEST['codigo']; 
   $sql = "SELECT DISTINCT design FROM entrada_det WHERE codigo like '$codigo' AND id_ent = $nro_compra ";
   echo json_encode(getResultArray($sql));
}
function getStoreNo(){
   $nro_compra = $_REQUEST['nro_compra'];
   $codigo = $_REQUEST['codigo']; 
   $design = $_REQUEST['design']; 
   $sql = "SELECT DISTINCT store_no FROM entrada_det WHERE    id_ent = $nro_compra and codigo like '$codigo' and design like '$design' ";
   echo json_encode(getResultArray($sql));
}

function getColorDesc(){
   $nro_compra = $_REQUEST['nro_compra'];
   $codigo = $_REQUEST['codigo']; 
   $design = $_REQUEST['design']; 
   $store_no = $_REQUEST['store_no']; 
   $sql = "SELECT DISTINCT concat(cod_catalogo,'-', fab_color_cod) as color_desc FROM entrada_det WHERE  id_ent = $nro_compra and codigo like '$codigo' and design like '$design' and store_no like '$store_no' ";
   echo json_encode(getResultArray($sql));
}
function getColorComercial(){
   $nro_compra = $_REQUEST['nro_compra'];
   $codigo = $_REQUEST['codigo']; 
   $design = $_REQUEST['design']; 
   $store_no = $_REQUEST['store_no'];
   $color_desc = $_REQUEST['color_desc']; 
   $filtroColorDesc = '';
   $cd = explode('-',$color_desc);
   if(count($cd) > 1){
       $cd = explode('-',$color_desc);
       $filtroColorDesc = " AND cod_catalogo = $cd[0] AND fab_color_cod = $cd[1] ";
   }
   $sql = "SELECT DISTINCT color FROM entrada_det WHERE  id_ent = $nro_compra and codigo like '$codigo' and design like '$design' and store_no like '$store_no' $filtroColorDesc ";
   echo json_encode(getResultArray($sql));
}

function buscarArticulos(){   
   $articulo = $_REQUEST['articulo']; 
   $sql = "SELECT codigo AS ItemCode, descrip AS ItemName FROM articulos WHERE estado ='Activo' AND descrip LIKE '%$articulo%'";
   echo json_encode(getResultArray($sql));
}
function buscarColores(){   
   $color = $_REQUEST['color']; 
   $sql = "SELECT pantone AS Pantone,nombre_color AS Color FROM  pantone c WHERE  estado = 'Activo' AND nombre_color LIKE '$color%'  ";
   echo json_encode(getResultArray($sql));
}
function actualizarDatos(){
    
    $ids = json_decode( $_REQUEST['ids']); 
    $nro_compra = $_REQUEST['nro_compra']; 
    $usuario = $_REQUEST['usuario']; 
    $codigo = $_REQUEST['codigo']; 
    $descrip = $_REQUEST['descrip']; 
    $design = $_REQUEST['design']; 
    $color = $_REQUEST['color']; 
    $pantone = $_REQUEST['pantone']; 
    $color_comb = $_REQUEST['color_comb']; 
    $fab_color_cod = strtoupper(  $_REQUEST['fab_color_cod']); 
    $store_no = $_REQUEST['store_no']; 
    $bag = $_REQUEST['bag']; 
    $filtro_articulo   = $_REQUEST['filtro_articulo']; 
    
    $db = new My();
     
    $cons = " initial_id = id_det ";
    if($descrip != ""){
        $db->Query("SELECT s.descrip AS sector FROM articulos a, sectores s WHERE a.cod_sector = s.cod_sector AND codigo = '$codigo'");
        $db->NextRecord();
        $sector = $db->Get("sector");
        $cons.=", codigo = '$codigo', descrip = '$sector-$descrip' "; 
    }
    if($design != ""){
        $cons.=", design = '$design' "; 
    }
    if($color != ""){
        $cons.=", cod_pantone = '$pantone', color = '$color' "; 
    }
    if($color_comb != ""){
        $cons.=",  color_comb = '$color_comb' "; 
    }
    
    if($fab_color_cod != ""){
       $arr = explode("-",$fab_color_cod);
       $cod_catalogo = $arr[0];
       $fab_color_cod = $arr[1];      
       $cons.=", cod_catalogo = '$cod_catalogo',  fab_color_cod = '$fab_color_cod' "; 
       
       $get_img = "SELECT img  FROM entrada_det WHERE id_ent = $nro_compra  AND  codigo = '$filtro_articulo' AND cod_catalogo = '$cod_catalogo' AND  fab_color_cod = '$fab_color_cod' and color = '$color' and img is not null AND img <> ''  limit 1;";
      
       $db->Query($get_img); 
       if($db->NumRows() > 0){
           $db->NextRecord();
           $img = $db->Record['img'];
           $cons.=",  img = '$img'  "; 
       }
    }
    if($store_no != ""){
        $cons.=",  store_no = '$store_no'  "; 
    }
    if($bag != ""){
        $cons.=",  bale = '$bag'  "; 
    }
   
    
    
     
    foreach ($ids as $id ) {
       $sql = "update entrada_det set $cons where id_ent = $nro_compra and id_det = $id;";    
       $db->Query($sql);    
    }    
    echo "Ok";
}

function filtroEntradaMercaderias() {
    
    $nro_compra = $_REQUEST['nro_compra'];
    $articulo = $_REQUEST['articulo'];
    $design = $_REQUEST['design'];
    $mar = $_REQUEST['mar'];
    $color_desc = $_REQUEST['color_desc'];
    $color_com = $_REQUEST['color_com'];
    $solo_faltantes = $_REQUEST['solo_faltantes'];
    $deposito = $_REQUEST['suc'];

    $filtro_faltantes = "";
    if ($solo_faltantes == "Si") {
        $filtro_faltantes = " and (quty_ticket = 0 or quty_ticket is null)";
    }

    $filtro_articulo = "";   
    if ($articulo != "") {
        $filtro_articulo = "and d.codigo LIKE '$articulo%' ";
       // $filtro_articulo = "and it.U_NOMBRE_COM LIKE '$articulo%' ";
    }

    $filtro_design = "";
    if ($design != "") {
        $filtro_design = "and design LIKE '$design%' ";
    }
    $filtro_mar = "";
    if ($mar != "") {
        $filtro_mar = "and store_no LIKE '$mar%' ";
    }
    $filtro_color_desc = "";
    $cd = explode('-',$color_desc);
    if (count($cd)>1) {
        $cod_catalogo = $cd[0];
        $fab_color_cod = $cd[1];
        $filtro_color_desc = "and fab_color_cod = '$fab_color_cod' and  cod_catalogo = '$cod_catalogo'";
    }
    $filtro_color_com = "";
    if ($color_com != "") {
        $filtro_color_com = "and color LIKE '$color_com%' ";        
    }
   
    $sql = "SELECT id_det AS AbsEntry, d.codigo AS ItemCode, d.descrip AS ItemName,design AS U_design, MD5(CONCAT(d.codigo,design,store_no,cod_catalogo,fab_color_cod)) AS DesignHash, lote AS BatchNum,cantidad, cant_calc AS U_quty_c_um, notas AS U_notas,
    store_no AS U_prov_mar,bale AS U_bag,if(quty_ticket is null,0,quty_ticket) AS U_quty_ticket,gramaje AS U_gramaje,if(gramaje_m is null,0,gramaje_m) as gramaje_m,printed AS U_printed,d.ancho AS U_ancho,IF( ancho_real IS NULL,'', ancho_real) as U_ancho_real, IF( kg_desc IS NULL,0, kg_desc) AS U_kg_desc,color AS U_color_comercial,d.um AS U_umc,concat(cod_catalogo,'-', fab_color_cod) AS ColorDescription,
    precio AS Price,um_prod,fraccion_de,d.img,if(tara > 0,tara,'') as tara,mnj_x_lotes FROM entrada_det d, articulos a WHERE a.codigo = d.codigo and  id_ent = $nro_compra $filtro_articulo $filtro_design $filtro_mar $filtro_color_desc  $filtro_color_com $filtro_faltantes order by d.codigo ASC,bale asc, d.descrip asc, design asc, store_no asc , fab_color_cod asc , color asc";
    //echo $sql;
    $descarga = getResultArray($sql);
 
 
    echo json_encode($descarga);  
}

function actualizarLote() {
 
    try {
        $id_ent = $_POST['id_ent']; 
        $AbsEntry = $_POST['AbsEntry'];
        $qty_ticket = $_POST['qty_ticket'];
        $kg_desc = $_POST['kg_desc'];
        $ancho = $_POST['ancho'];
        $ancho_real = $_POST['ancho_real'];
        $gramaje = $_POST['gramaje'];
        $gramaje_muestra = $_POST['gramaje_muestra'];
        $tara = $_REQUEST['tara'];
        $obs = $_POST['obs'];
        $printed = $_POST['printed'];
        $um_prod = $_REQUEST['um_prod'];
        $umc = $_REQUEST['umc'];
        $codigo = $_REQUEST['codigo'];
        $lote = $_REQUEST['lote'];
        $suc = $_REQUEST['suc'];
        $usuario = $_REQUEST['usuario'];
        $recibido = $_REQUEST['recibido'];
        
        $kg_neto = $kg_desc  ;
        if($tara == ""){
            $tara = 0;
            $kg_neto = $kg_desc  ;
        }else{
            $kg_neto = $kg_desc - ($tara / 1000);
        }
        
            
        $db = new My();        

        $cant_calc = $qty_ticket;
        if ($um_prod == $umc && ($umc == 'Unid' || $umc == 'Mts')) {
            $cant_calc = $qty_ticket;
        } else if ($um_prod == 'Mts' && $umc == 'Yds') {
            $cant_calc = $qty_ticket * 0.9144;
        } else if ($um_prod == 'Mts' && $umc == 'Kg') {
            //$cant_calc = ($kg_neto * 1000) / ($gramaje * $ancho);
            $cant_calc = ($kg_neto * 1000) / ($gramaje_muestra * $ancho_real);
        }else{
            echo "Error: Unidad de medida no esta definida para el Lote $lote ";
        }
        if (is_infinite($cant_calc)) {
            $cant_calc = 0;
            $gramaje_muestra = "";     
            $ancho_real = "";
            $kg_neto = "";
            $qty_ticket = "";
            $tara =  0;
            $obs = "Error Cantidad calculada infinita";
        }
        if ($recibido == "No") {
            $q = "SELECT cantidad,cant_calc,gramaje,ancho FROM entrada_det WHERE  id_det = $AbsEntry and id_ent = $id_ent;";
            $db->Query($q);
            $db->NextRecord();
            $cant_ = $db->Record['cantidad'];
            $cant_calc = $db->Record['cant_calc'];
            $gramaje_muestra = $db->Record['gramaje']; 
            $ancho = $db->Record['ancho'];
            $ancho_real = $db->Record['ancho'];
            if($umc == "Kg"){ // Calculo cuanto deberia tener
                $kg_neto = $cant_;
            }elseif ($um_prod == 'Mts'){
                $kg_neto = ($cant_ * $ancho * $gramaje) / 1000;
            }
            
            $qty_ticket = $cant_;
            $obs = "Rollo no recibido";
        }
         
        
        $db->Query("update entrada_det set quty_ticket = $qty_ticket, kg_desc = $kg_neto,gramaje = $gramaje_muestra,gramaje_m = $gramaje_muestra,ancho_real = $ancho_real, cant_calc = $cant_calc, notas = '$obs', recibido = '$recibido',printed = '$printed', tara = $tara where id_det = $AbsEntry and id_ent = $id_ent;");

        $db->Query("UPDATE entrada_det SET cant_calc = cantidad , precio = subtotal / cant_calc   WHERE um = um_prod and (um = 'Unid' or um = 'Mts' or um = 'Kg') AND id_det = $AbsEntry AND id_ent = $id_ent");
        $db->Query("UPDATE entrada_det SET cant_calc = cantidad * 0.9144 , precio = subtotal / cant_calc   WHERE um = 'Yds' AND um_prod = 'Mts' AND id_det = $AbsEntry AND id_ent = $id_ent");
        
        // Para controlar error de Gramaje
               
        $rango_bajo =  $gramaje - (($gramaje * 10) / 100);
        $rango_alto =  $gramaje + (($gramaje * 10) / 100);
        
        if( $umc == 'Kg'){
            if(($gramaje_muestra >= $rango_bajo && $gramaje_muestra <= $rango_alto)  ){        
             $db->Query("UPDATE entrada_det SET cant_calc = ((kg_desc*1000)/(gramaje_m*ancho_real)), precio = subtotal / cant_calc WHERE um = 'Kg' and um_prod = 'Mts' AND id_det = $AbsEntry AND id_ent = $id_ent");              
           }else{
             $db->Query("UPDATE entrada_det SET notas = 'Gramaje fuera del Rango GrM: $gramaje_muestra GSM: $gramaje', cant_calc = ((kg_desc*1000)/(gramaje_m*ancho_real)), precio = subtotal / cant_calc WHERE um = 'Kg' and um_prod = 'Mts' AND id_det = $AbsEntry AND id_ent = $id_ent");              
           }
        }  
        generarOActualizarStock($id_ent,$AbsEntry);
         
    } catch (Exception $e) {
        echo "0";
    }
}
function generarOActualizarStock($id_ent,$id_det){
    $db = new My();
    $db_l = new My();
    $datos = "SELECT d.id_ent, id_det, nro_pedido, id_pack, store_no, bale, piece, d.codigo, lote, d.descrip, d.um, cod_catalogo, fab_color_cod, precio, cantidad, subtotal, color, color_comb, design,   d.ancho, gramaje, obs, um_prod, cant_calc, cod_pantone, nro_lote_fab, quty_ticket, kg_desc, ancho_real, gramaje_m, tara,recibido, printed, notas, fraccion_de, d.img, initial_id,mnj_x_lotes,suc, usuario
    FROM  entrada_merc e, entrada_det d, articulos a WHERE e.id_ent = d.id_ent and d.codigo = a.codigo AND d.id_ent = $id_ent AND id_det = $id_det;";
    $db->Query($datos);
    
    $db->NextRecord();
    $usuario= $db->Record['usuario']; 
    $suc= $db->Record['suc']; 
    $nro_pedido= $db->Record['nro_pedido']; 
    $id_pack= $db->Record['id_pack']; 
    $store_no= $db->Record['store_no']; 
    $bale= $db->Record['bale']; 
    $piece= $db->Record['piece']; 
    $codigo= $db->Record['codigo']; 
    $lote= $db->Record['lote']; 
    $descrip= $db->Record['descrip']; 
    $umc= $db->Record['um']; 
    $cod_catalogo= $db->Record['cod_catalogo']; 
    $fab_color_cod= $db->Record['fab_color_cod']; 
    $precio= $db->Record['precio']; 
    $cantidad= $db->Record['cantidad']; 
    $subtotal= $db->Record['subtotal']; 
    $color= $db->Record['color']; 
    $color_comb= $db->Record['color_comb']; 
    $design= $db->Record['design'];  
    $ancho= $db->Record['ancho']; 
    $ancho_real= $db->Record['ancho_real']; 
    $gramaje= $db->Record['gramaje']; 
    $obs= $db->Record['obs']; 
    $um_prod= $db->Record['um_prod']; 
    $cant_calc= $db->Record['cant_calc']; 
    $pantone= $db->Record['cod_pantone']; 
    $nro_lote_fab= $db->Record['nro_lote_fab']; 
    $quty_ticket= $db->Record['quty_ticket']; 
    $kg_desc= $db->Record['kg_desc'];     
    $gramaje_m= $db->Record['gramaje_m']; 
    $tara= $db->Record['tara']; 
     
    $quty_c_um= $db->Record['cant_calc']; 
    $recibido= $db->Record['recibido']; 
    $printed= $db->Record['printed']; 
    $notas= $db->Record['notas']; 
    $fraccion_de= $db->Record['fraccion_de']; 
    $img= $db->Record['img']; 
    $initial_id= $db->Record['initial_id']; 
    $mnj_x_lotes = $db->Record['mnj_x_lotes']; 
    $cod_serie = substr($lote, -2);    
     
    if($mnj_x_lotes == "Si"){
        $db_l->Query("SELECT count(*) as cant FROM lotes WHERE codigo = '$codigo' and lote ='$lote'  ");   
        $db_l->NextRecord();
        $cant = $db_l->Record['cant'];
        if($cant > 0){ //Actualizar  // Se
            $upd_lotes_sql = "update lotes set  quty_ticket = $quty_ticket,quty_c_um = $cant_calc,  kg_desc = $kg_desc, ancho= $ancho_real, gramaje  = $gramaje_m, tara = $tara, notas = '$obs'  where id_ent = $id_ent AND id_det = $id_det and codigo = '$codigo' and lote = '$lote';";
            $db_l->Query($upd_lotes_sql);
        }else{ // Insertar
            $ins_lotes_sql = "INSERT INTO lotes
            (codigo, lote, cod_serie, pantone, umc, um_prod, nro_lote_fab, store, bag, nro_pieza, ancho, gramaje, gramaje_m, tara, kg_desc, quty_ticket, quty_c_um, color_comb, color_cod_fabric,design, cod_catalogo, notas, img, padre, rec, fecha_creacion, id_ent, id_det, id_frac, id_prod_ter)
            VALUES ('$codigo', '$lote', '$cod_serie', '$pantone', '$umc', '$um_prod', '$nro_lote_fab', '$store_no', '$bale', '$piece', $ancho_real, $gramaje_m, $gramaje_m, $tara, $kg_desc, $quty_ticket,"
                    . "  $quty_c_um , '$color_comb', '$fab_color_cod','$design', '$cod_catalogo', '$notas', '', '','$recibido', current_time, $id_ent, $id_det, null, null);"; 
            
            $db_l->Query($ins_lotes_sql);
            
        }
        verificarStock($suc,$id_ent,$id_det,$codigo,$lote,$quty_c_um,$kg_desc,$usuario,$ancho_real,$gramaje,$tara);
    }else{
        // Verificar Stock Crear una funcion
        verificarStock($suc,$id_ent,$id_det,$codigo,$lote,$quty_c_um,$kg_desc,$usuario,$ancho_real,$gramaje,$tara);
    }  
}
function verificarStock($suc,$id_ent,$linea,$codigo,$lote,$cant_calc,$kg_desc,$usuario,$ancho_real,$gramaje,$tara){
    $db = new My();
    $db->Query("SELECT suc, codigo, lote,cant_ent,kg_ent,cantidad,ubicacion,estado_venta  from stock WHERE tipo_ent = 'EM' and nro_identif = $id_ent and linea = $linea");
    if($db->NumRows()>0){
        $suc_ = $db->Get('suc');
        $codigo = $db->Get('codigo');
        $lote = $db->Get('lote');
        $db->Query("UPDATE stock SET cant_ent = $cant_calc,kg_ent = $kg_desc, cantidad = $cant_calc, ubicacion = '',estado_venta = 'Bloqueado' WHERE tipo_ent ='EM' and nro_identif = $id_ent and linea = $linea and codigo ='$codigo' and lote ='$lote' and suc = '$suc_';");
        $db->Query("UPDATE historial SET direccion = 'Entrada', cantidad = $cant_calc, usuario = '$usuario', fecha_hora = current_time , tipo_doc = 'EM', nro_doc = $id_ent, ancho = $ancho_real,gramaje = $gramaje,tara = $tara WHERE tipo_ent ='EM' and nro_identif = $id_ent and linea = $linea and codigo ='$codigo' and lote ='$lote' and suc = '$suc';");
    }else{
        $db->Query("INSERT INTO stock(suc, codigo, lote, tipo_ent, nro_identif, linea, cant_ent, kg_ent, cantidad, ubicacion, estado_venta)
        VALUES ('$suc', '$codigo', '$lote', 'EM', $id_ent, $linea, $cant_calc, $kg_desc, $cant_calc, '', 'Bloqueado');");
        $db->Query("INSERT INTO historial( suc, codigo, lote, tipo_ent, nro_identif, linea, fecha_hora, usuario, direccion, cantidad,tipo_doc,nro_doc,ancho,gramaje,tara)
        VALUES (  '$suc', '$codigo', '$lote', 'EM', $id_ent,$linea, current_timestamp, '$usuario', 'E', $cant_calc,'EM',$id_ent,$ancho_real,$gramaje,$tara);");
    }
    echo "1";
}

function cambiarEstado(){
    $nro_compra = $_REQUEST['nro_compra']; 
    $estado = $_REQUEST['estado']; 
    $usuario = $_REQUEST['usuario']; 
    $db = new My();
    
    if($estado == 'Recibida'){
        $db->Query("SELECT COUNT(*) AS no_img FROM entrada_det WHERE id_ent = $nro_compra AND img IS NULL and lote <> ''");
        $db->NextRecord();
        $no_img = $db->Record['no_img'];
        if($no_img > 0){           
            echo "Error Lotes sin Imagen"; 
        }else{
           $db->Query("SELECT COUNT(CONCAT(d.codigo,d.lote)) AS generados ,COUNT(CONCAT( s.codigo , s.lote)) AS recibidos
           FROM entrada_det d LEFT JOIN stock s ON d.codigo = s.codigo AND d.lote = s.lote AND d.id_ent = s.nro_identif AND s.tipo_ent ='EM' WHERE d.id_ent = $nro_compra  GROUP BY id_ent"); 
           $db->NextRecord();
           $generados = $db->Get("generados");
           $recibidos = $db->Get("recibidos");
           if($generados > $recibidos){
               echo "Solo se ha recibido $recibidos Piezas de $generados, debe recibir completamente para cerrar"; 
           }else{
               $db->Query("update entrada_merc set estado = '$estado'  where id_ent = $nro_compra;");
               echo "Ok";     
           } 
        }        
    }else{
       $db->Query("update entrada_merc set estado = '$estado'  where id_ent = $nro_compra;");
       echo "Ok";   
    }
}

function lotesSinFotos(){
    $nro_compra = $_REQUEST['nro_compra']; 
    $db = new My();
    
        $lotes_sin_color = array();
        $db->Query("SELECT lote,descrip,color, color_comb, design FROM entrada_det WHERE id_ent = $nro_compra AND img IS NULL ORDER BY descrip ASC");
        while($db->NextRecord()){
            $fila = array_map("utf8_encode",$db->Record);
            array_push($lotes_sin_color,$fila);
        }
        echo json_encode($lotes_sin_color);
}

function controlarEntradaMercaderiasNoDescargadas() {
   $ref = $_REQUEST['nro_compra'];
   $db = new My();
   $db2 = new My();
    // Actualiza precio Gs
   $db->Query("UPDATE  entrada_merc e, entrada_det d SET precio_ms = precio * cotiz  WHERE e.id_ent = d.id_ent AND e.id_ent = $ref;");
   
   // Calcula el % de participacion de cada Articulo  // , SUM(d.subtotal * cotiz) AS total_ms   
   $db->Query("SELECT cotiz, SUM(subtotal) AS total FROM  entrada_merc e, entrada_det d WHERE e.id_ent = d.id_ent AND e.id_ent = $ref;");
   $db->NextRecord();
   $total = $db->Get('total');
    
   $db->Query("update entrada_merc set total = $total WHERE  id_ent = $ref;");
   
   $db->Query("SELECT codigo,total,SUM(subtotal) AS subtotal,(SUM(subtotal) * 100  ) / total AS porc_particip FROM  entrada_merc e, entrada_det d WHERE e.id_ent = d.id_ent AND e.id_ent = $ref GROUP BY codigo");
   while($db->NextRecord()){
      $codigo = $db->Get('codigo');
      $porc_particip = $db->Get('porc_particip');       
      $db2->Query("update entrada_det set porc_particip = $porc_particip where id_ent = $ref and codigo = '$codigo'");
   }
    
    
    $sql = "SELECT SUM(IF(recibido <> 'Si',1,0) ) AS no_procesados, SUM(IF(recibido = 'Si',1,0)) AS recibidos,   SUM( IF(recibido <> 'Si' OR recibido IS NULL,1,0 )) AS no_recibidos, SUM(IF(img IS NULL,1,0)) AS sin_imagen , COUNT(*) AS total,
    COUNT(CONCAT( s.codigo , s.lote)) AS en_stock   FROM entrada_det d LEFT JOIN stock s ON d.codigo = s.codigo AND d.lote = s.lote AND d.id_ent = s.nro_identif AND s.tipo_ent ='EM' WHERE d.id_ent = $ref;";
    echo json_encode(getResultArray($sql));
}
// Busca el promedio de los anchos de producto segun Codigo, Proveedor

function promedioAnchosGramajes(/* $codProv,$articulo */){
    $codProv = $_POST['id_ent'];
    $my = new My();
    $promedios = array();
    $my->Query("SELECT cod_prov,codigo FROM entrada_merc INNER JOIN entrada_det USING(id_ent) WHERE id_ent = $codProv GROUP BY cod_prov,codigo");
    while($my->NextRecord()){
        $codigo = $my->Record['codigo'];
        $prov = $my->Record['cod_prov'];
        $promedios[$codigo] = array("anchos"=>promedioAnchos($prov,$codigo),"gramajes"=>promedioGramajes($prov,$codigo));
    }

    echo json_encode($promedios);
}
function sincronizarImagenesFaltantes(){
    $db = new My();
    $ids = $_REQUEST['ids'];
    $nro_compra = $_REQUEST['nro_compra'];
    $ids = str_replace("[", "", $ids); 
    $ids = str_replace("]", "", $ids); 
    $sql = "select id_det as id, img from entrada_det  where id_ent = $nro_compra and id_det in($ids) and img is not null; ";  
    $db->Query($sql);    
    $arr = array();
    while($db->NextRecord()){ 
        $id = $db->Record['id'];
        $img = $db->Record['img'];
        array_push($arr,array("id"=>$id,"img"=>$img));
    }
    echo json_encode($arr); 
}
function promedioAnchos($codProv,$articulo){
    $my = new My();
    $porcentajeDiferencia = 100;// Porcentaje de diferencia entre ancho real y ancho
    $promedioUp = array();
    $promedioDown = array();
    $lotesPorcentajeUps = array();
    $lotesPorcentajeDown = array();
    $promedioDown['ancho_real'] = 0; 
    $promedioDown['ancho'] = 0; 
    $promedioDown['lotes'] = 0;
    $promedioDown['rango'] = 0;
    $promedioUp['ancho_real'] = 0; 
    $promedioUp['ancho'] = 0; 
    $promedioUp['lotes'] = 0;
    $promedioUp['rango'] = 0;

    $queryAncho = "SELECT cod_prov,proveedor,codigo,ancho_real, ancho, ((ancho_real-ancho)/ancho)*100 AS porcDif,  SUM(if(((ancho_real-ancho)/ancho)*100 >= $porcentajeDiferencia,1,0)) AS ltsUP,SUM(if(((ancho_real-ancho)/ancho)*100 <= $porcentajeDiferencia,1,0)) AS ltsDwn FROM entrada_merc INNER JOIN  entrada_det USING(id_ent)  WHERE cod_prov='$codProv' AND codigo = '$articulo' /* AND estado='Cerrada' */ AND ancho_real IS NOT NULL GROUP BY cod_prov,proveedor,codigo,ancho_real, ancho, ((ancho_real-ancho)/ancho)*100 ORDER BY cod_prov asc,proveedor asc,codigo asc";
    
    $my->Query($queryAncho);
    while($my->NextRecord()){
        $f = $my->Record;
        if((int)$f['ltsUP'] > 0){
            array_push($lotesPorcentajeUps, array(
                "ancho"=>$f["ancho"],
                "ancho_real"=>$f["ancho_real"],
                "ltsUP"=>$f["ltsUP"]
            ));
        }else{
            array_push($lotesPorcentajeDown, array(
                "ancho"=>$f["ancho"],
                "ancho_real"=>$f["ancho_real"],
                "ltsDwn"=>$f["ltsDwn"]
            ));
        }
    }
    $lotesDown = 0;
    if(count($lotesPorcentajeDown)>0){
        $anchos = 0;
        $anchos_reales = 0;
        $moda = 0;

        foreach($lotesPorcentajeDown AS $lts){
            $lotesDown += (float)$lts['ltsDwn'];
            $anchos += ((float)$lts['ancho'] * (float)$lts['ltsDwn']);
            $anchos_reales += ((float)$lts['ancho_real'] * (float)$lts['ltsDwn']);
            
        }
        $promedioDown['ancho_real'] = $anchos_reales / $lotesDown; 
        $promedioDown['ancho'] = $anchos / $lotesDown; 
        $promedioDown['lotes'] = $lotesDown;
        $promedioDown['rango'] = (float)$lotesPorcentajeDown[count($lotesPorcentajeDown)-1]['ancho_real'] - (float)$lotesPorcentajeDown[0]['ancho_real'];
        $promedioDown['rango'] = ($promedioDown['rango']<0)?($promedioDown['rango']*-1):$promedioDown['rango'];
    }
    $lotesUp = 0;
    if(count($lotesPorcentajeUps)>0){
        $anchos = 0;
        $anchos_reales = 0;
        foreach($lotesPorcentajeUps AS $lts){
            $lotesUp += (float)$lts['ltsUP'];
            $anchos += ((float)$lts['ancho'] * (float)$lts['ltsUP']);
            $anchos_reales += ((float)$lts['ancho_real'] * (float)$lts['ltsUP']);
            
        }
        $promedioUp['ancho_real'] = $anchos_reales / $lotesUp; 
        $promedioUp['ancho'] = $anchos / $lotesUp; 
        $promedioUp['lotes'] = $lotesUp;
        $promedioUp['rango'] = (float)$lotesPorcentajeUps[count($lotesPorcentajeUps)-1]['ancho_real'] - (float)$lotesPorcentajeUps[0]['ancho_real'];
        $promedioUp['rango'] = ($promedioUp['rango']<0)?($promedioUp['rango']*-1):$promedioUp['rango'];
    }
    $promedios =  array("promedioUp"=>$promedioUp,"promedioDown"=>$promedioDown);
    return $promedios;
}
// Busca el promedio de los gramajes de producto segun Codigo, Proveedor
function promedioGramajes($codProv,$articulo){
    $my = new My();
    $porcentajeDiferencia = 100;// Porcentaje de diferencia entre gramaje medido y gramaje
    $promedioUp = array();
    $promedioDown = array();
    $lotesPorcentajeUps = array();
    $lotesPorcentajeDown = array();
    $promedioDown['gramaje_m'] = 0;
    $promedioDown['gramaje'] = 0;
    $promedioDown['lotes'] = 0;
    $promedioDown['rango'] = 0;
    $promedioUp['gramaje_m'] = 0;
    $promedioUp['gramaje'] = 0;
    $promedioUp['lotes'] = 0;
    $promedioUp['rango'] = 0;
   
    $queryGramaje = "SELECT cod_prov,proveedor,codigo,gramaje_m, gramaje, ((gramaje_m-gramaje)/gramaje)*100 AS porcDif,  SUM(if(((gramaje_m-gramaje)/gramaje)*100 >= $porcentajeDiferencia,1,0)) AS ltsUP,SUM(if(((gramaje_m-gramaje)/gramaje)*100 <= $porcentajeDiferencia,1,0)) AS ltsDwn FROM entrada_merc INNER JOIN  entrada_det USING(id_ent)  WHERE cod_prov='$codProv' AND codigo = '$articulo' /* AND estado='Cerrada' */ AND gramaje_m IS NOT NULL GROUP BY cod_prov,proveedor,codigo,gramaje_m, gramaje, ((gramaje_m-gramaje)/ancho)*100 ORDER BY cod_prov asc,proveedor asc,codigo asc";
    
    $my->Query($queryGramaje);
    while($my->NextRecord()){
        $f = $my->Record;
        if((int)$f['ltsUP'] > 0){
            array_push($lotesPorcentajeUps, array(
                "gramaje"=>$f["gramaje"],
                "gramaje_m"=>$f["gramaje_m"],
                "ltsUP"=>$f["ltsUP"]
            ));
        }else{
            array_push($lotesPorcentajeDown, array(
                "gramaje"=>$f["gramaje"],
                "gramaje_m"=>$f["gramaje_m"],
                "ltsDwn"=>$f["ltsDwn"]
            ));
        }
    }
    $lotesDown = 0;
    if(count($lotesPorcentajeDown)>0){
        $gramajes = 0;
        $gramajes_medidos = 0;
        $moda = 0;

        foreach($lotesPorcentajeDown AS $lts){
            $lotesDown += (float)$lts['ltsDwn'];
            $gramajes += ((float)$lts['gramaje'] * (float)$lts['ltsDwn']);
            $gramajes_medidos += ((float)$lts['gramaje_m'] * (float)$lts['ltsDwn']);
            
        }
        $promedioDown['gramaje_m'] = $gramajes_medidos / $lotesDown; 
        $promedioDown['gramaje'] = $gramajes / $lotesDown; 
        $promedioDown['lotes'] = $lotesDown;
        $promedioDown['rango'] = (float)$lotesPorcentajeDown[count($lotesPorcentajeDown)-1]['gramaje_m'] - (float)$lotesPorcentajeDown[0]['gramaje_m'];
        $promedioDown['rango'] = ($promedioDown['rango']<0)?($promedioDown['rango']*-1):$promedioDown['rango'];
    }
    $lotesUp = 0;
    if(count($lotesPorcentajeUps)>0){
        $gramajes = 0;
        $gramajes_medidos = 0;
        foreach($lotesPorcentajeUps AS $lts){
            $lotesUp += (float)$lts['ltsUP'];
            $gramajes += ((float)$lts['gramaje'] * (float)$lts['ltsUP']);
            $gramajes_medidos += ((float)$lts['gramaje_m'] * (float)$lts['ltsUP']);
            
        }
        $promedioUp['gramaje_m'] = $gramajes_medidos / $lotesUp; 
        $promedioUp['gramaje'] = $gramajes / $lotesUp; 
        $promedioUp['lotes'] = $lotesUp;
        $promedioUp['rango'] = (float)$lotesPorcentajeUps[count($lotesPorcentajeUps)-1]['gramaje_m'] - (float)$lotesPorcentajeUps[0]['gramaje_m'];
        $promedioUp['rango'] = ($promedioUp['rango']<0)?($promedioUp['rango']*-1):$promedioUp['rango'];
    }
    $promedios =  array("promedioUp"=>$promedioUp,"promedioDown"=>$promedioDown);
    return $promedios;
}
function clasificarPiezas(){
    $db = new My(); 
    $lotes =  $_POST['lotes'] ;  
    
    $lotes = str_replace("[","",$lotes );
    $lotes = str_replace("]","",$lotes );
    
    
    $sql = "SELECT DISTINCT lote,presentacion,suc,COUNT(*) AS ordenes FROM orden_procesamiento WHERE lote IN($lotes) GROUP BY lote";
     
    echo json_encode(getResultArray($sql));
    
}
function verificarOrdenProcesamiento(){
    $db = new My(); 
    $lote =  $_POST['lote'] ;  
    $sql =  "SELECT COUNT(*) AS cant FROM orden_procesamiento WHERE lote = '$lote'"  ;
    echo json_encode(getResultArray($sql));
}
new Descarga()

?>