<?php

/**
 * Description of OrdenFabric
 * @author Ing.Douglas
 * @date 21/09/2017
 */
require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");
require_once("../Config.class.php");     


require_once("../Functions.class.php");

class OrdenFabric {

    function __construct() {
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }

    function main() {
        $t = new Y_Template("OrdenFabric.html");
         
        $host = $_SERVER['HTTP_HOST'] != '190.128.150.70:8081'?'192.168.2.220':'190.128.150.70';       
        $url = "http://$host:8081";
        $t->Set("url",$url);
        
        $c = new Config();
        $host = $c->getNasHost();
        $path = $c->getNasFolder();
        $images_url = "http://$host/$path";
        $t->Set("images_url", $images_url);
        
        $t->Show("headers");
        $t->Show("cabecera_nota_pedido");
        $t->Show("solicitudes_abiertas");
    }

}

function listarPendientes() {
    $t = new Y_Template("OrdenFabric.html");
    $db = new My();
    $operarios = "SELECT u.usuario FROM  usuarios u, usuarios_x_grupo g WHERE  u.usuario = g.usuario AND g.id_grupo = 3 AND u.estado = 'Activo' ORDER BY u.usuario ASC";
    
    $db->Query($operarios);
    //$maq = "";
    while($db->NextRecord()){
        $oper = $db->Get("usuario");
        $maq.="'$oper',";
    }
    $maq = substr($maq,0,-1); 
    $t->Set("operarios", "[$maq]");
    
    
    $sql = "SELECT e.nro_orden,cod_cli,cliente,e.usuario,CONCAT( DATE_FORMAT(e.fecha,'%d-%m-%Y') ,'  ' ,e.hora) AS fecha,e.estado,IF(asignado_a IS NULL,'',asignado_a) AS asignado_a, nro_emis , e.suc, e.obs FROM orden_fabric e  LEFT JOIN "
            . "emis_produc p ON e.nro_orden = p.nro_orden  WHERE   e.estado = 'Pendiente'  ";
    

    $usuarios = "SELECT usuario FROM usuarios WHERE suc = '00' AND estado = 'Activo' ORDER BY usuario ASC";
    $db->Query($usuarios);

    $users = '';

    while ($db->NextRecord()) {
        $us = $db->Record['usuario'];
        $users.="<option value='$us'>$us</option>";
    }

    $c = new Config();
    $host = $c->getNasHost();
    $path = $c->getNasFolder();
    $images_url = "http://$host/$path";
    $t->Set("images_url", $images_url);

    $dbd = new My();
    $db->Query($sql);
    $t->Set("designs", "[]");
    $t->Show("headers");
    $t->Show("ordenes_pendientes_head");

     
    $f = new Functions();
    
    $usuario = $_REQUEST['usuario'];    
    $permiso = $f->chequearPermiso("4.3.1", $usuario);
    
    while ($db->NextRecord()) {
        $nro_orden = $db->Record['nro_orden'];
        $cliente = $db->Record['cliente'];
        $usuario = $db->Record['usuario'];
        $suc = $db->Record['suc'];
        $fecha = $db->Record['fecha'];
        $nro_emis = $db->Record['nro_emis'];
        $obs = $db->Record['obs'];
        $asignado_a = $db->Record['asignado_a'];
        
        $t->Set("display_no_panif", "none");
        $t->Set("obs", "$obs");
         
             
        
        
        if ($nro_emis == null) {
            $nro_emis = "";
            if($permiso !== "---"){
               $t->Set("display_planificar", "inline");
            }else{
               $t->Set("display_planificar", "none");
               $t->Set("display_no_panif", "inline");
            }
            $t->Set("display_proc", "none");
        }else{
            $t->Set("display_planificar", "none");
            $t->Set("display_proc", "inline");
        }
        $asign = "";
        
        if($asignado_a === ""){
            if($permiso !== "---"){
                $asign = '<img src="img/addperson.png" class="add_person" width="26" onclick="asignarOperario('.$nro_orden.')" >';
            } 
        }else{ 
            $ip = $_SERVER['SERVER_ADDR'];
            $foto = "../img/usuarios/$asignado_a.jpg";
            $foto_x = "inmopy/img/usuarios/$asignado_a.jpg";
            if (file_exists($foto)) {   
                 $asign =  "<span onclick='asignarOperario($nro_orden)'>$asignado_a</span> <span  class='avatar' style='background-image: url(http://$ip://$foto_x); display: inline-block;;margin-top:-10px' onclick='asignarOperario($nro_orden)'></span>";
            } else {  
                $asign = "<span onclick='asignarOperario($nro_orden)'>$asignado_a</span>";      
            }
                  
        }
        $t->Set("asign", $asign);

        $t->Set("nro_orden", $nro_orden);
        $t->Set("nro_emis", $nro_emis);
        $t->Set("cliente", $cliente);
        $t->Set("usuario", "$usuario ($suc)");
        $t->Set("fecha", $fecha);

        $t->Set("usuarios", $users);

        $t->Show("ordenes_pendientes_cab");

        $dbd->Query("SELECT codigo,descrip,design,cantidad,largo,e.nro_emis,id_det FROM orden_det od LEFT JOIN emis_produc e ON od.nro_orden = e.nro_orden WHERE od.nro_orden =  $nro_orden");
        while ($dbd->NextRecord()) {
            $codigo = $dbd->Record['codigo'];
            $descrip = $dbd->Record['descrip'];
            $design = $dbd->Record['design'];
            $cantidad = $dbd->Record['cantidad'];
            $largo = $dbd->Record['largo'];
            $id_det = $dbd->Record['id_det'];// Id del detalle de la Orden de Fabricacion
            $nro_emis = $dbd->Record['nro_emis'];
            $calc_mts = $cantidad * $largo;
            
     
            $img_path = "$images_url/$design.thum.jpg";
            $t->Set("codigo", $codigo);
            $t->Set("descrip", $descrip );
            $t->Set("design", $img_path);
            $t->Set("img", $design);
            $t->Set("cantidad", number_format($cantidad, 0, ',', '.'));
            $t->Set("medida", number_format($largo, 2, ',', '.'));
            $t->Set("mts", number_format($calc_mts, 0, ',', '.'));
            $t->Set("nro_emis", $nro_emis);            
            $t->Set("id_det", $id_det);
            
            if($nro_emis !== null){
                $t->Set("estado", "Ok");
            }else{
                $t->Set("estado", "Pendiente");
            }
             
            
            $t->Show("ordenes_pendientes_det");
        }

        $t->Show("ordenes_pendientes_foot");
    }

    $db->Close();

    require_once("../utils/NumPad.class.php");
    new NumPad();
}

function getUbicacionXImagen(){
     
    $img = $_REQUEST['img'];
    $suc = $_REQUEST['suc'];
    //$codigo_fabricar = $_REQUEST['codigo_fab'];
    $ubics = "SELECT  s.ubicacion,s.cantidad AS metros,COUNT(*) AS piezas  FROM stock  s , lotes l WHERE  s.lote = l.lote AND s.codigo = l.codigo AND img = '$img' AND s.estado_venta NOT IN ('Bloqueado','Retazo','FP')    
    AND s.cantidad > 0  AND s.suc ='$suc' GROUP BY cantidad,ubicacion ORDER BY cantidad DESC";
    $f = new Functions();
    echo json_encode( $f->getResultArray($ubics) );
    
}

function misOrdenes() {
    $usuario = $_REQUEST['usuario'];
    $t = new Y_Template("OrdenFabric.html");
    $sql = "SELECT e.nro_orden,cod_cli,cliente,e.usuario,DATE_FORMAT(e.fecha,'%d-%m-%Y') AS fecha,e.estado,asignado_a, nro_emis FROM orden_fabric e  LEFT JOIN emis_produc p ON e.nro_orden = p.nro_orden  WHERE   e.estado != 'Abierta'    AND e.usuario = '$usuario'";
    $db = new My();
 
    $users = '';
 
    $c = new Config();
    $host = $c->getNasHost();
    $path = $c->getNasFolder();
    $images_url = "http://$host/$path";
    $t->Set("images_url", $images_url);

    $dbd = new My();
    $db->Query($sql);
     
    $t->Show("headers");
    $t->Show("mis_ordenes_titulo");

     
    
    while ($db->NextRecord()) {
        $nro_orden = $db->Record['nro_orden'];
        $cliente = $db->Record['cliente'];
        $usuario = $db->Record['usuario'];
        $fecha = $db->Record['fecha'];
        $nro_emis = $db->Record['nro_emis'];
        $estado = $db->Record['estado'];
        if ($nro_emis == null) {
            $nro_emis = "";
        }

        $t->Set("nro_orden", $nro_orden);
        $t->Set("nro_emis", $nro_emis);
        $t->Set("cliente", $cliente);
        $t->Set("usuario", $usuario);
        $t->Set("fecha", $fecha);
        $t->Set("estado", $estado);
        $t->Set("usuarios", $users);
        $fondo = 'orange';
        if($estado == "Pendiente"){
            $fondo = 'orange';
        }elseif($estado == "En Proceso"){
            $fondo = 'blue';
        }elseif($estado == "Cerrada"){
            $fondo = 'green';
        }else{
           $fondo = 'white'; 
        }
        $t->Set("fondo", $fondo);

        $t->Show("mis_ordenes_cab");

        $dbd->Query("SELECT codigo,descrip,design,cantidad,largo,sap_doc FROM orden_det WHERE nro_orden = $nro_orden");
        while ($dbd->NextRecord()) {
            $codigo = $dbd->Record['codigo'];
            $descrip = $dbd->Record['descrip'];
            $design = $dbd->Record['design'];
            $cantidad = $dbd->Record['cantidad'];
            $largo = $dbd->Record['largo'];
            $sap_doc = $dbd->Record['sap_doc'];
            $calc_mts = $cantidad * $largo;
            
            $img_path = "$images_url/$design.thum.jpg";

            $t->Set("codigo", $codigo);
            $t->Set("descrip", $descrip);
            $t->Set("design",$img_path );
            $t->Set("cantidad", number_format($cantidad, 0, ',', '.'));
            $t->Set("medida", number_format($largo, 2, ',', '.'));
            $t->Set("mts", number_format($calc_mts, 0, ',', '.'));
            $t->Set("sap_doc", $sap_doc);
            
            $asign = "";
             
            $t->Set("asign", $asign);
            
            
            $t->Show("mis_ordenes_det");
        }

        $t->Show("mis_ordenes_foot");
    }

    $db->Close();
    /*
    require_once("../utils/NumPad.class.php");
    new NumPad(); */
}

function eliminarLote() {
    $nro_emision = $_POST['nro_emision'];
    $lote = $_POST['lote'];
    $codigo_ref = $_POST['codigo_ref'];
    $db = new My();
    $db->Query("DELETE FROM emis_det WHERE nro_emis = $nro_emision AND lote = '$lote' and codigo_ref = '$codigo_ref'");
    $db->Close();
    echo "Ok";
}

function ponerEnProduccion() {
    $nro_emision = $_POST['nro_emision'];
    $nro_orden = $_POST['nro_orden'];
    $usuario = $_POST['usuario'];
    $db = new My();

    $db->Query("UPDATE emis_produc SET fecha_proc = CURRENT_DATE, hora_proc = CURRENT_TIME, estado = 'En Proceso' WHERE nro_emis = $nro_emision");
    $db->Query("UPDATE orden_fabric SET  estado = 'En Proceso' WHERE nro_orden = $nro_orden");

    $db->Close();
    echo "Ok";
}
function ponerEnPendiente() {
    $nro_emision = $_POST['nro_emision'];
    $nro_orden = $_POST['nro_orden'];
    $usuario = $_POST['usuario'];
    $db = new My();

    $db->Query("UPDATE emis_produc SET fecha_proc = CURRENT_DATE, hora_proc = CURRENT_TIME, estado = 'Pendiente' WHERE nro_emis = $nro_emision");
    $db->Query("UPDATE orden_fabric SET  estado = 'Pendiente' WHERE nro_orden = $nro_orden");

    $db->Close();
    echo "Ok";
}

function emisionProduccion() {
    $usuario = $_POST['usuario'];
    $t = new Y_Template("OrdenFabric.html");
    $sql = "SELECT nro_orden,cod_cli,cliente,usuario,DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha,estado,asignado_a FROM orden_fabric WHERE   estado = 'En Proceso' and asignado_a = '$usuario'";
    $db = new My();


    $dbd = new My();
    $db->Query($sql);
    $t->Set("designs", "[]");
    $t->Show("headers");
    $t->Show("ordenes_asignadas_head");


    while ($db->NextRecord()) {
        $nro_orden = $db->Record['nro_orden'];
        $cliente = $db->Record['cliente'];
        $usuario = $db->Record['usuario'];
        $fecha = $db->Record['fecha'];

        $t->Set("nro_orden", $nro_orden);
        $t->Set("cliente", $cliente);
        $t->Set("usuario", $usuario);
        $t->Set("fecha", $fecha);

        $t->Show("ordenes_asignadas_cab");

        $dbd->Query("SELECT codigo,descrip,design,cantidad FROM orden_det WHERE nro_orden = $nro_orden");
        while ($dbd->NextRecord()) {
            $codigo = $dbd->Record['codigo'];
            $descrip = $dbd->Record['descrip'];
            $design = $dbd->Record['design'];
            $cantidad = $dbd->Record['cantidad'];
            $t->Set("codigo", $codigo);
            $t->Set("descrip", $descrip);
            $t->Set("design", $design);
            $t->Set("cantidad", number_format($cantidad, 0, ',', '.'));

            $t->Show("ordenes_asignadas_det");
        }

        $t->Show("ordenes_asignadas_foot");
    }

    $dbd->Close();
    $db->Close();
}

function listarOrdenes() {
    $usuario = $_POST['usuario'];
    $cod_cli = $_POST['cod_cli'];
    $sql = "SELECT nro_orden,cod_cli,cliente,usuario,DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha,estado FROM orden_fabric WHERE cod_cli = '$cod_cli' and usuario = '$usuario' and estado = 'Abierta'";
    $db = new My();
    $db->Query($sql);

    $array = array();
    while ($db->NextRecord()) {
        array_push($array, $db->Record);
    }
    $db->Close();
    echo json_encode($array);
}

function generarOrden() {
    $usuario = $_POST['usuario'];
    $cod_cli = $_POST['cod_cli'];
    $suc = $_POST['suc'];
    $cliente = $_POST['cliente'];

    $sql = "INSERT INTO orden_fabric (cod_cli, cliente, usuario, fecha, hora, suc, suc_d, estado, e_sap)
    VALUES ('$cod_cli', '$cliente', '$usuario', CURRENT_DATE, CURRENT_TIME, '$suc', '00', 'Abierta', 0);";

    $db = new My();
    $db->Query($sql);
    echo "Ok";
}
 
function buscarArticulos() {
    $articulo = $_POST['articulo'];
    if(isset($_POST['disenho'])){
        $articulo = ($_POST['disenho'] != '%LISO')?'%ESTAMPADO':'%LISO';   
        $corte = substr($_POST['disenho'],0, -3);
         
        if($corte  === '%NAVIDE' ){
            $articulo = '%NAVID';
        }
    }
   
    $cat = $_POST['cat'];
    
    $filtro_anchor = "";
    $limit = 30;
    if (isset($_POST['limit'])) {     
        $limit = $_POST['limit'];
    } else {
        $limit = 30;
    }
    if (isset($_POST['anchor'])) {
        $anchor = $_POST['anchor'];
        $filtro_anchor = " and BWidth1 = $anchor"; 
    } else {
        $filtro_anchor = "";
    }
    
     
    
    $fn = new Functions();
     
    $articulos = $fn->getResultArray(" SELECT a.codigo, s.descrip AS sector, a.descrip  , a.produc_ancho, a.produc_alto, a.produc_largo , l.precio ,a.um, a.gramaje_prom , a.costo_prom AS precio_costo , a.composicion, a.especificaciones FROM articulos a, sectores s,  lista_prec_x_art l "
            . "WHERE a.cod_sector = s.cod_sector AND a.codigo = l.codigo AND l.num = $cat AND l.moneda ='G$'    
    AND clase = 'Fabricado'  AND a.estado = 'Activo' and (a.descrip   like '$articulo%' or a.codigo  like '$articulo%' )  ORDER BY a.descrip ASC limit $limit ");   
    echo json_encode($articulos);
 
  
}

function insertarEnOrdenFabric() {
    $nro_orden = $_POST['nro_orden'];
    $codigo = $_POST['codigo'];
    $descrip = $_POST['descrip'];
    $cantidad = $_POST['cantidad'];
    $design = $_POST['design'];
    $largo = $_POST['largo'];
     
    $cons = "SELECT IF(id_det IS NOT NULL,MAX( id_det),0) AS maximo FROM orden_det WHERE nro_orden = $nro_orden";

    $db = new My();
    $db->Query($cons);
    $db->NextRecord();
    $id = $db->Record['maximo'];
     
    $id++; 
     
    $sql = "INSERT INTO orden_det(nro_orden, id_det, codigo, descrip, cantidad, design,largo, obs)VALUES ($nro_orden, $id, '$codigo', '$descrip', $cantidad, '$design',$largo, '');";
    $db->Query($sql);
     
    echo "Ok";
}

function getDetalleOrden() {
    $nro_orden = $_POST['nro_orden'];
    $db = new My();
    $array = array();
    $sql = "SELECT  id_det, codigo, descrip, cantidad, design  FROM orden_det WHERE nro_orden = $nro_orden";
    $db->Query($sql);
    while ($db->NextRecord()) {
        array_push($array, $db->Record);
    }
    $db->Close();
    echo json_encode($array);
}

function eliminarOrden() {
    $nro_orden = $_POST['nro_orden'];
    $db = new My();
    $db->Query("DELETE FROM orden_det WHERE nro_orden = $nro_orden;");
    $db->Query("DELETE FROM orden_fabric WHERE nro_orden = $nro_orden;");
    echo "Ok";
}

function cambiarEstadoOrden() {
    $nro_orden = $_POST['nro_orden'];
    $estado = $_POST['estado'];
    $obs = $_POST['obs'];
    $db = new My();
    if ($estado == "Pendiente") {
        $db->Query("update orden_fabric set estado = '$estado' ,fecha = current_date,hora = current_time, obs = '$obs' WHERE nro_orden = $nro_orden;");
    } else {
        $db->Query("update orden_fabric set estado = '$estado' WHERE nro_orden = $nro_orden;");
    }
    echo "Ok";
}

function asignarAOrdenFabricacionAOperador(){
    $nro_orden = $_POST['nro_orden'];
    $usuario = $_POST['usuario'];
    $operador= $_POST['operador'];
    $db = new My();
    $db->Query("UPDATE orden_fabric SET asignado_a = '$operador', fecha_asign = CURRENT_DATE, hora_asig = CURRENT_TIME WHERE nro_orden = $nro_orden");
    echo "Ok";
}

function generarEmision() {
    $nro_orden = $_POST['nro_orden'];
    $usuario = $_POST['usuario'];
    $suc = $_POST['suc'];

    $db = new My();
    $db->Query("SELECT nro_emis FROM emis_produc WHERE nro_orden = $nro_orden");
    $nro_emision = 0;
    if ($db->NumRows() > 0) {
        $db->NextRecord();
        $nro_emision = $db->Record['nro_emis'];
    } else {
        $db->Query("INSERT INTO  emis_produc ( nro_orden, suc, usuario, fecha, hora,estado, e_sap)VALUES ($nro_orden, '$suc', '$usuario',CURRENT_DATE,CURRENT_TIME,'Abierta', 0);");
        $db->Query("SELECT nro_emis FROM emis_produc WHERE nro_orden = $nro_orden");
        $db->NextRecord();
        $nro_emision = $db->Record['nro_emis'];
    }
    echo $nro_emision;
}

function getImagesLotesXMateriaPrima(){
    $cantidad_fabricar = $_POST['cantidad'];
    $suc = $_POST['suc'];
    $codigo = $_POST['codigo'];
    $Qry = "SELECT articulo AS codigo_mat_pri, cantidad FROM lista_materiales l  WHERE    l.codigo = '$codigo'  AND ref = 'true'";
    $db = new My();
    $db->Query($Qry);
    
    if($db->NumRows()> 0){
        $db->NextRecord();
        $codigo_mat_pri = $db->Get("codigo_mat_pri");
        $cantidad_consume = $db->Get("cantidad");
        
        //$cantidad_requerida = $cantidad_consume * $cantidad_fabricar;
        // Buscar en el Stock de 00
        
         
        $f = new Functions();
        
        echo json_encode(  $f->getResultArray(" SELECT img AS design, COUNT(s.lote) AS piezas,SUM(s.cantidad) AS metros ,   FLOOR(SUM(s.cantidad) / $cantidad_consume)  AS prod_ter 
        FROM stock s, lotes l  WHERE  l.codigo = s.codigo AND s.codigo = '$codigo_mat_pri' AND s.lote = l.lote AND s.cantidad > $cantidad_consume AND s.suc = '00'        
        GROUP BY l.img  HAVING prod_ter >= $cantidad_fabricar"));
        
    }else{
        echo json_encode(array());
    }
}


function asignarLote() {
    $nro_orden = $_POST['nro_orden'];
    $nro_emision = $_POST['nro_emision'];
    $nro_orden_id_det = $_POST['nro_orden_id_det'];
    $usuario = $_POST['usuario'];
    $suc = $_POST['suc'];
    $codigo = $_POST['codigo'];
    $codigo_ref = $_POST['codigo_ref'];
    $lote = $_POST['lote'];
    $descrip = $_POST['descrip'];
    $color = $_POST['color'];
    $design = $_POST['design'];
    $cant_lote =  floatval( $_POST['cantidad']);  
    $multiplicador = $_POST['multiplicador'];
    if(!isset($_POST['multiplicador'])){
        $multiplicador = 1;
    }
    
    
    
    $ms = new My();
    $qp = "SELECT costo_prom  FROM  articulos WHERE codigo =   '$codigo_ref'";  
    $ms->Query($qp);
    $ms->NextRecord();
    $AvgPriceRef = $ms->Record['costo_prom'];
    
    $qp = "SELECT costo_prom, um  FROM  articulos WHERE codigo ='$codigo'";  
    $ms->Query($qp);
    $ms->NextRecord();
    $AvgPrice = $ms->Record['costo_prom'];
    $InvntryUom = $ms->Record['um'];
    
    $db = new My();
    $db->Query("SELECT IF(MAX(linea) IS NULL,0,MAX(linea)) AS maxid  FROM emis_det WHERE nro_emis  = $nro_emision");
    $db->NextRecord();
    $linea = $db->Record['maxid'];
    $linea++;
     
    if($AvgPriceRef > 0 ){
        $sql = "INSERT INTO emis_det (nro_emis, nro_orden, id_det,linea,codigo_ref, codigo, lote, descrip, color, design, cant_lote, usuario, cant_frac, fecha, hora,precio_costo,um,fila_orig,multiplicador)
        VALUES ( $nro_emision , $nro_orden , $nro_orden_id_det ,$linea,'$codigo_ref', '$codigo', '$lote', '$descrip', '$color', '$design', $cant_lote, '$usuario', 0, NULL, NULL,$AvgPrice,'$InvntryUom',1,$multiplicador);";
        $db->Query($sql);
        
        // Parche para 'NAVIDE?O'
       // $db->Query("UPDATE emis_det SET design = 'NAVIDEÑO' WHERE design LIKE 'NAVIDE?O'");
        
        echo json_encode(array("Estado" => "Ok"));
    }else{
        echo json_encode(array("Estado" => "Error","Mensaje"=>"Codigo $codigo_ref Precio Costo = $AvgPriceRef"));
    }
}
 /*
function buscarResumenAsignados() { // LLamado desde Fabrica
    $nro_emision = $_POST['nro_emision'];
    $id_orden_det = $_POST['id_orden_det'];
    $codigo = $_POST['codigo'];
    //$sql = "SELECT  IF( SUM(cant_lote) IS NULL,0,SUM(cant_lote * multiplicador)) AS asignado  FROM emis_det WHERE codigo_ref = '$codigo' AND nro_emis = $nro_emision";
    $sql = "SELECT sum(cant_lote) AS asignado  FROM emis_det WHERE codigo_ref = '$codigo' AND nro_emis = $nro_emision";
    $db = new My();
    $db->Query($sql);
    $db->NextRecord();
    $asignado = $db->Record['asignado'];
    echo json_encode(array("asignado" => $asignado));
} */

function listarLotesAsignados() {
    $nro_emision = $_POST['nro_emision'];
    $codigo = $_POST['codigo'];
    $nro_orden_id_det = $_POST['nro_orden_id_det'];
    //$sql = "SELECT  codigo,lote,descrip,cant_lote,color,design,cant_frac as cortes,tipo_saldo,codigo_om,saldo,diff,largo,fila_orig FROM emis_det WHERE codigo_ref = '$codigo' AND nro_emis = $nro_emision  and id_det = $nro_orden_id_det order by lote asc,fila_orig DESC";
    $sql = "SELECT  e.codigo,e.lote,descrip,cant_lote,color,e.design,cant_frac AS cortes,saldo,largo,fila_orig , l.img
    FROM emis_det e, lotes l WHERE  e.codigo = l.codigo AND e.lote = l.lote AND  codigo_ref = '$codigo' AND nro_emis = $nro_emision  AND e.id_det = $nro_orden_id_det ORDER BY lote ASC,fila_orig DESC"; 
    $f = new Functions();
    echo json_encode($f->getResultArray($sql));
}
 
function getArticulosPermitidos(){
    $ItemCodePadre = $_POST['ItemCodePadre'];
     
    $f = new Functions();
    $array = $f->getResultArray("SELECT articulo,descrip,cantidad,rendimiento,um,ref FROM lista_materiales WHERE codigo = '$ItemCodePadre'");
    echo json_encode($array);
}
function getPorcentajeAsingnacionXLinea(){
    $codigo_fab = $_POST['codigo_fab'];
    $nro_emis = $_POST['nro_emis'];
    $id_det = $_POST['id_det'];
    $cantidad_fab = $_POST['cantidad_fab'];
    $mat = "SELECT  articulo,cantidad,rendimiento,ref FROM lista_materiales WHERE codigo = '$codigo_fab' ";
    $db = new My();
    $dba = new My();
    $db->Query($mat);
    
    $master = array();
    
    
    
    while($db->NextRecord()){
       $articulo = $db->Get("articulo");
       $cantidad_req  = $db->Get("cantidad");
       $rendimiento = $db->Get("rendimiento");
       $ref = $db->Get("ref");
       $mult = $cantidad_req * $rendimiento;
       
       
       $dba->Query("SELECT IF(SUM(cant_lote) IS NULL,0,SUM(cant_lote)) AS asignado, d.id_prod_ter FROM orden_det d, emis_produc e, emis_det ed , articulos a "
       . "WHERE d.nro_orden = e.nro_orden AND e.nro_emis = ed.nro_emis AND ed.id_det = d.id_det AND e.nro_emis = $nro_emis AND d.codigo = '$codigo_fab' AND ed.id_det = $id_det AND ed.codigo = '$articulo' AND ed.codigo = a.codigo AND a.clase <> 'Trabajo'");
       
       $dba->NextRecord();
       $asignado = $dba->Get("asignado") / $mult;
       $porc_asig = round(($asignado * 100 ) /  $cantidad_fab,1);       
       $id_prod_ter = $dba->Get("id_prod_ter");
       $arr = array("MateriaPrima"=>$articulo,"Asignado"=>$asignado,"PorcAsignado"=>$porc_asig,"ref"=>$ref,"id_prod_ter"=>$id_prod_ter); 
       
       array_push($master, $arr);
       
    }
    
    echo json_encode($master);
}

function getImg($lote){
    $ms = new MS();
    $ms->Query("SELECT U_img FROM OBTN WHERE DistNumber = $lote");
    $ms->NextRecord();
    return $ms->Record['U_img'];
}
 
function buscarDatosDeCodigo() {
    $producto_final  = $_POST['producto_final']; 
      
    $fn = new Functions();


    $code = trim($_POST['lote']);
    $suc = $_POST['suc'];

    $cat = 1;
    $moneda = "G$";
    $um = "Mts";

    if (isset($_POST['categoria'])) {
        $cat = $_POST['categoria'];
    }
    if (isset($_POST['moneda'])) {
        $moneda = $_POST['moneda'];
    }


    $sql_lote = "SELECT l.codigo, b.barcode, l.lote,clase,descrip,um as um_prod,costo_prom, composicion,mnj_x_lotes,a.art_inv,gramaje,gramaje_m,l.ancho, tara,l.kg_desc, pantone, s.cantidad AS stock, s.cant_ent as cant_ini, l.img,s.suc,padre,s.ubicacion,color_cod_fabric,design,s.estado_venta   FROM articulos a INNER JOIN lotes l INNER JOIN stock s   
    ON a.codigo = l.codigo AND l.codigo = s.codigo AND l.lote = s.lote  LEFT  JOIN codigos_barras b ON a.codigo = b.codigo WHERE (a.codigo ='$code' OR b.barcode = '$code' OR  l.lote = '$code') AND suc = '$suc' LIMIT 1";
    $datos = $fn->getResultArray($sql_lote)[0];  // print_r($datos);
    $art_inv = 'true';
    if (sizeof($datos) > 0) {
        $pantone = $datos['pantone'];
         
        $sql_color = $fn->getResultArray("SELECT nombre_color AS color FROM pantone WHERE pantone = '$pantone' AND estado ='Activo'")[0];
        $color = $sql_color['color'];
        $datos['color'] = $color;
        $datos['existe'] = "true";
        $art_inv = $datos['art_inv'];
        $codigo = $datos['codigo'];
    } else { // No es manejado por lotes o no existe este lote buscar por Articulo y codigo de barras
        $sql_art = "SELECT a.codigo,clase,descrip,um,mnj_x_lotes, s.cantidad AS stock,a.art_inv, img,s.estado_venta,a.um AS um_prod,a.ancho,a.gramaje_prom AS gramaje,s.suc   FROM articulos a left JOIN stock s ON a.codigo = s.codigo  LEFT JOIN codigos_barras b ON a.codigo = b.codigo   WHERE (a.codigo ='$code' OR b.barcode = '$code') AND estado = 'Activo' LIMIT 1";
        $datos = $fn->getResultArray($sql_art)[0];
        //echo $sql_art;
        //print_r($datos);
        if (sizeof($datos) > 0) {
            $datos['existe'] = "true";
            $art_inv = $datos['art_inv'];
            $codigo = $datos['codigo'];
            if ($art_inv == 'false') {
                $datos['stock'] = 1000;
                $datos['estado_venta'] = "Normal";
            }
        } else {
            $datos['existe'] = "false";
        }
    }

    if ($datos['existe'] == "true") {

        $um_lista_precios = $fn->getResultArray("SELECT  DISTINCT um,precio FROM lista_prec_x_art WHERE codigo = '$codigo' AND moneda = '$moneda' and num = $cat");

        $um_prod = $datos['um_prod'];
        if (isset($_POST['um'])) {
            $um = $_POST['um'];
            if (!in_array($um, $um_lista_precios)) {
                $um = $um_prod;
            }
        } else {
            $um = $um_prod; //$um = Unidad de medida de Venta en este caso es igual a la del producto            
        }
        // Buscar Descuentos
        if ($datos['mnj_x_lotes'] === "Si") {
            $db = new My();
            $c = 0;
            foreach ($um_lista_precios as $arr) {
                $unidad_x = $arr['um'];
                $desc = "SELECT a.codigo,  IF( descuento IS NULL,0,descuento) AS descuento FROM articulos a LEFT JOIN desc_lotes d ON a.codigo = d.codigo    AND moneda = '$moneda' AND d.um = '$unidad_x' AND num = $cat AND lote = '$code' WHERE a.codigo = '$codigo'   ";
                $db->Query($desc);
                $db->NextRecord();
                $descuento = $db->Get('descuento');

                $arr['descuento'] = $descuento;
                $um_lista_precios[$c] = $arr;
                $c++;
            }
        }

        $datos['um_venta'] = $um;
        $datos['um_lista_precios'] = $um_lista_precios;  // Posibles unidades de medida para venta

        //$sql_precios = "SELECT precio,IF(descuento IS NULL,0,descuento) AS descuento FROM lista_prec_x_art l  LEFT JOIN desc_lotes d ON l.codigo = d.codigo AND l.moneda = d.moneda AND l.um = d.um AND l.num = d.num WHERE l.codigo = '$codigo' AND l.num = $cat  AND l.moneda = '$moneda' AND l.um = '$um' and ls.lote = '$code'";
        $sql_precios = "SELECT precio,IF(descuento IS NULL,0,descuento) AS descuento FROM lista_prec_x_art l  LEFT JOIN desc_lotes d ON l.codigo = d.codigo AND l.moneda = d.moneda AND l.um = d.um AND l.num = d.num WHERE l.codigo = '$codigo' AND l.num = $cat  AND l.moneda = '$moneda' AND l.um = '$um' and d.lote = '$code'";
        if ($art_inv === "false" || $datos['mnj_x_lotes'] === "No") {
            $sql_precios = "SELECT precio,0 as descuento FROM lista_prec_x_art WHERE codigo = '$codigo' AND moneda = '$moneda' AND um = '$um' AND num = $cat;";
        }
        // echo $sql_precios;

        $precios = $fn->getResultArray($sql_precios)[0];  //print_r($precios);
        if (sizeof($precios) > 0) {
            $datos['precio'] = $precios['precio'];
            $datos['descuento'] = $precios['descuento'];
        } else {
            $datos['precio'] = 0;
            $datos['descuento'] = 0;
        }
         
        $mat_pri = $fn->getResultArray("SELECT  cantidad * rendimiento AS MateriaPrima,ref as MatPriRef FROM lista_materiales WHERE codigo = '$producto_final' AND articulo = '$codigo'")[0];
        if (sizeof($mat_pri) > 0) {
           $datos['MateriaPrima'] = $mat_pri['MateriaPrima'];
           $datos['MatPriRef'] = $mat_pri['MatPriRef'];
        }else{
            $datos['MateriaPrima'] = 0;
            $datos['MatPriRef'] = "true";
        }
        echo json_encode(  $datos) ;
    } else {
        echo json_encode(  $datos );
    }
}

 

new OrdenFabric();
?>