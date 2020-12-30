<?php

/**
 * Description of SolicitudTrasladoMobile
 * @author Ing.Douglas
 * @date 24/08/2017
 */
require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");
require_once("../Config.class.php");
require_once("../Functions.class.php");   
//require_once("../utils/NumPad.class.php");     

class SolicitudTrasladoMobile {
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
        $sucs = $this->getSucs($suc);
        $sucursales = '';
        foreach($sucs as $cod=>$descri){
            $selected = '';
            if($cod == '00'){
                $selected = 'selected';
            }
            $sucursales .= "<option value='$cod' $selected data-informacion='$descri'>$cod</option>";
        }
                       
        $t = new Y_Template("SolicitudTrasladoMobile.html");
        //echo $_SERVER['REMOTE_ADDR'];
        $c = new Config();
        $host = $c->getNasHost();
        $path = $c->getNasFolder();
        $images_url = "http://$host/$path";
        $t->Set("images_url",$images_url);
        $t->Set("sucursales",$sucursales);
        
        $db = new My();
        $db->Query("SELECT valor FROM parametros WHERE clave = 'porc_valor_minimo'");
        $db->NextRecord();      
        $porc_valor_minimo = $db->Get("valor");
        $t->Set("porc_valor_minimo",$porc_valor_minimo);
        
        
        $t->Show("headers");
        $t->Show("cabecera_nota_pedido"); 
        $t->Show("area_carga_cab"); 
        $t->Show("mensaje"); 
        $t->Show("solicitudes_abiertas_cab");
         
        $t->Show("solicitudes_abiertas_foot");
        $this->updateEstadoPedido();
        //new NumPad();
    }
    function getSucs($currenSuc){
        $db = new My();
        $db->Query("select suc, nombre from sucursales where tipo != 'Sub-Deposito' order by left(suc,2)/1 asc");
        $sucs = array();
        while($db->NextRecord()){
            $sucs[$db->Record['suc']]=$db->Record['nombre'];
        }
        return $sucs;
    }

    function updateEstadoPedido(){
        $db = new My();
        $db->Query("UPDATE pedido_traslado p inner join (select n_nro,sum(if(estado in ('En Proceso','Pendiente'),1,0)) as pendientes from pedido_tras_det group by n_nro having(pendientes=0)) e on p.n_nro=e.n_nro set p.estado='Cerrada' where p.estado in ('Pendiente','Abierta')");
        $db->Close();
    }
    
}

function buscarLotes(){
     
    
    //107:ACTIVOS 109:VARIOS 110 SERVICIOS  
    $arr_filtro_sector = array(107,109,110);
    $filtro_sector = "";
    
    $codigo = trim($_POST['codigo']);
    $color = $_POST['color']; 
    $tipo_busqueda = $_POST['tipo_busqueda']; //articulo  o lote especifico
    //$tipo  = $_POST['tipo']; //articulos o insumos
    $mi_suc = $_POST['mi_suc'];
    $suc = $_POST['suc']; 
    $sucDestino = $_POST['sucDestino'];
    $disponibles = $_POST['disponibles']; 
    $cantidad = $_REQUEST['cantidad'];  
    $pantone = $_REQUEST['color'];
    $cat = 1; 
    $moneda = 'G$';
    $um = $_POST['um'];  
    $usuario = $_POST['usuario'];  
    $limit = $_REQUEST['limit'];
    
    if(!isset($_REQUEST['limit'])){
        $limit = 150;
    }
    
    $articulos_lote = $_POST['articulos_lote'];
    
     
   
    
    if(isset($_POST['cat'])){
        $cat = $_POST['cat'];
    } 
    if(isset($_POST['moneda'])){
        $moneda = $_POST['moneda'];
    } 
      
    if($tipo_busqueda === "insumos"){
        $filtro_sector =  " AND a.cod_sector in(106) ";
        $suc ='00';
        $color = "";
    }else{
        array_push($arr_filtro_sector,106);
        $filtro_sector =  " AND a.cod_sector not in(".implode(",",$arr_filtro_sector).") ";
    }        
     
    $f = new Functions();
    $sql = "SELECT a.codigo,l.lote, a.descrip,a.costo_prom,a.composicion, l.pantone,p.nombre_color AS color ,design,cod_catalogo, color_cod_fabric,s.suc,l.ancho,s.estado_venta,padre,l.img, cantidad,ubicacion,lpa.precio, dl.descuento
    FROM articulos a INNER JOIN lotes l 
    ON a.codigo = l.codigo    
    INNER JOIN stock s ON
    l.codigo = s.codigo AND l.lote = s.lote  
    INNER JOIN pantone p 
    ON l.pantone = p.pantone   
    INNER JOIN lista_prec_x_art lpa ON a.codigo = lpa.codigo AND lpa.num = $cat AND lpa.moneda = '$moneda' AND lpa.um ='$um'
    LEFT JOIN desc_lotes dl 
    ON l.codigo = dl.codigo AND l.lote = dl.lote AND dl.num = $cat
    WHERE l.pantone LIKE '$pantone' AND a.codigo = '$codigo'  $filtro_sector  AND s.cantidad > $cantidad AND s.suc LIKE '$suc'
    ORDER BY a.descrip ASC, color ASC, design ASC limit $limit";
      
    
     
    if($articulos_lote == "lote"){ // Agregar lotes con la misma imagen
        $sql = "SELECT a.codigo,l.lote, a.descrip,a.costo_prom,a.composicion, l.pantone,p.nombre_color AS color ,design,cod_catalogo, color_cod_fabric,s.suc,l.ancho,s.estado_venta,padre,l.img, cantidad,ubicacion,lpa.precio, dl.descuento
        FROM articulos a INNER JOIN lotes l 
        ON a.codigo = l.codigo    
        INNER JOIN stock s ON
        l.codigo = s.codigo AND l.lote = s.lote  
        INNER JOIN pantone p 
        ON l.pantone = p.pantone   
        INNER JOIN lista_prec_x_art lpa ON a.codigo = lpa.codigo AND lpa.num = $cat AND lpa.moneda = '$moneda'  
        LEFT JOIN desc_lotes dl 
        ON l.codigo = dl.codigo AND l.lote = dl.lote AND dl.num = $cat
        WHERE  l.lote = '$codigo'    AND s.cantidad > $cantidad AND s.suc LIKE '$suc'
        ORDER BY a.descrip, color ASC, design ASC  "; 
        
    }   
    
    $piezas = $f->getResultArray($sql);
    
    if($articulos_lote == "lote"){
      $img =   $piezas[0]['img'];  
      $sqli = "SELECT a.codigo,l.lote, a.descrip,a.costo_prom,a.composicion, l.pantone,p.nombre_color AS color ,design,cod_catalogo, color_cod_fabric,s.suc,l.ancho,s.estado_venta,padre,l.img, cantidad,ubicacion,lpa.precio, dl.descuento
        FROM articulos a INNER JOIN lotes l 
        ON a.codigo = l.codigo    
        INNER JOIN stock s ON
        l.codigo = s.codigo AND l.lote = s.lote  
        INNER JOIN pantone p 
        ON l.pantone = p.pantone   
        INNER JOIN lista_prec_x_art lpa ON a.codigo = lpa.codigo AND lpa.num = $cat AND lpa.moneda = '$moneda'  
        LEFT JOIN desc_lotes dl 
        ON l.codigo = dl.codigo AND l.lote = dl.lote AND dl.num = $cat
        WHERE  l.lote != '$codigo'    AND s.cantidad > $cantidad AND s.suc LIKE '$suc' AND l.img = '$img'
        ORDER BY a.descrip, color ASC, design ASC limit $limit "; 
        $identicos = $f->getResultArray($sqli);
        $piezas = array_merge($piezas,$identicos);
    }
    
    for($i = 0; $i < sizeof($piezas);$i++){
        $arr = $piezas[$i]; 
        $_lote = $arr['lote'];
        $_suc = $arr['suc'];
        $sub_query = "SELECT 'Factura' AS TipoDocumento ,f.f_nro AS Nro,usuario,DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha,suc,f.estado,cantidad FROM factura_venta f, fact_vent_det d WHERE f.f_nro = d.f_nro AND d.lote = '$_lote' AND f.suc = '$_suc' AND (f.estado <> 'Cerrada' OR empaque <> 'Si') UNION 
        SELECT 'Remedir' AS TipoDocumento, n.n_nro AS Nro, d.verificado_por AS usuario,DATE_FORMAT(n.fecha_cierre,'%d-%m-%Y') AS fecha,n.suc_d AS suc,d.estado,d.cantidad AS cantidad FROM nota_remision n INNER JOIN nota_rem_det d USING(n_nro) WHERE n.suc_d = '$_suc' AND d.lote = '$_lote' AND d.estado = 'FR' UNION  
        SELECT 'NotaRemision' AS TipoDocumento ,n.n_nro AS Nro,usuario,DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha,suc,n.estado,cantidad FROM nota_remision  n, nota_rem_det d WHERE n.n_nro = d.n_nro AND d.lote = '$_lote' AND n.suc = '$_suc' AND n.estado != 'Cerrada' UNION  
        SELECT 'Emision Produccion' AS TipoDocumento ,e.nro_emis AS Nro,e.usuario,DATE_FORMAT(e.fecha,'%d-%m-%Y') AS  fecha,suc,e.estado,cant_lote AS cantidad FROM emis_produc e, emis_det d  WHERE e.nro_emis = d.nro_emis AND d.lote = '$_lote' AND e.suc = '$_suc' AND estado <> 'Cerrada'    UNION
        SELECT 'Reserva' AS TipoDocumento ,r.nro_reserva AS Nro,usuario,DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha,suc,r.estado,cantidad FROM reservas r, reservas_det d WHERE r.nro_reserva = d.nro_reserva AND d.lote = '$_lote' AND r.suc = '$_suc' AND r.estado NOT IN ('Cerrada','Liberada','Vencida','Retirada') UNION "
                . "SELECT 'Pedido' AS TipoDocumento ,p.n_nro AS Nro,usuario,DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha,suc,p.estado,d.cantidad FROM pedido_traslado p, pedido_tras_det d WHERE p.n_nro = d.n_nro AND d.lote = '$_lote' AND p.suc_d = '$_suc' AND p.estado <> 'Cerrada'";
        $stock_comp  = $f->getResultArray($sub_query);
        $arr['doc'] = $stock_comp;
        $piezas[$i] = $arr;
    } 
    //print_r($piezas);
      
    echo json_encode($piezas);     
}
 
 
function eliminarNotaPedidoVacia(){
   $nro_nota = $_POST['nro_nota'];   
   $db = new My();
   $db->Query("DELETE FROM pedido_traslado WHERE n_nro = $nro_nota;");
   echo "Ok";
}

/*@todo:  filtrar por moneda*/
function getPrecioVentaAnterior(){ 
    $codigo = $_POST['codigo'];
    $cod_cli = $_POST['cod_cli'];
    
    $moneda = 'G$';
    if(isset($_POST['moneda'])){
        $moneda = $_POST['moneda'];
    }
     
    $dbd = new My();
     
    $array = array();
     
        
    $dbd->Query("SELECT d.precio_venta  FROM  factura_venta f,fact_vent_det  d WHERE f.f_nro = d.f_nro AND f.estado ='Cerrada'  AND f.cod_cli = '$cod_cli' AND codigo = '$codigo' and f.moneda = '$moneda' ORDER BY id_det DESC LIMIT 1");
    if($dbd->NumRows()>0){
        $dbd->NextRecord();
        $u_precio = $dbd->Record['precio_venta'];
        array_push($array,array('codigo'=>$codigo,'precio'=>number_format($u_precio, 0, ',', '.')));  
    }            
    
    echo json_encode($array);
}

function buscarSucursales(){
    $codigo = $_REQUEST['codigo']; 
    $cantidad = $_REQUEST['cantidad']; 
    $suc = $_REQUEST['suc_destino'];
      
    $f = new Functions();
    $sql = "SELECT s.suc,COUNT(s.lote) AS piezas, SUM(cantidad) AS total  FROM lotes l, stock s WHERE l.codigo = s.codigo AND l.lote = s.lote AND l.codigo = '$codigo' AND s.cantidad > $cantidad AND   s.suc like '$suc'  GROUP BY suc ";
    echo json_encode($f->getResultArray($sql));    
}
function buscarColores(){
    $codigo = $_REQUEST['codigo']; 
    $cantidad = $_REQUEST['cantidad'];
    $suc = $_REQUEST['suc']; 
     
    $f = new Functions();
    $sql = "SELECT l.pantone,p.nombre_color AS color ,COUNT(s.lote) AS piezas, SUM(cantidad) AS total  FROM lotes l, stock s, pantone p WHERE l.pantone = p.pantone AND
    l.codigo = s.codigo AND l.lote = s.lote AND l.codigo = '$codigo' AND s.cantidad > $cantidad   AND s.suc LIKE '$suc'   GROUP BY l.pantone ORDER BY color ASC ";
    echo json_encode($f->getResultArray($sql));    
}
function getSolicitudesAbiertasXMoneda(){
    $moneda = $_REQUEST['moneda']; 
    $usuario = $_REQUEST['usuario']; 
    $suc = $_REQUEST['suc'];
    $cod_cli = $_REQUEST['cod_cli']; 
    $tipo = $_REQUEST['tipo'];
    $f = new Functions();
    //SELECT n_nro AS Nro,usuario AS Usuario,DATE_FORMAT(fecha,'%d-%m-%Y') AS Fecha,cod_cli, cliente,estado AS Estado,suc AS Origen,suc_d AS Destino FROM pedido_traslado WHERE estado = 'Abierta' AND usuario = '$usuario' and suc = '$suc'
    $sql = "SELECT n_nro AS Nro,usuario AS Usuario,moneda,DATE_FORMAT(fecha,'%d-%m-%Y') AS Fecha,cod_cli, cliente,estado AS Estado,suc AS Origen,suc_d AS Destino,cat FROM pedido_traslado WHERE  suc= '$suc' AND cod_cli like '$cod_cli' AND moneda = '$moneda' AND usuario = '$usuario' and tipo = '$tipo' AND estado = 'Abierta'";
    echo json_encode($f->getResultArray($sql));    
}

function generarSolicitudTraslado() {
    $suc = $_POST['suc'];
    $sucd = $_POST['sucd'];
    $moneda = $_POST['moneda'];
    $usuario = $_POST['usuario'];
    $cat = 1;
    $cod_cli = '';
    $cliente = '';
    $tipo = ucfirst($_POST['tipo']);

    if (isset($_POST['cod_cli'])) {
        $cod_cli = $_POST['cod_cli'];
        $cliente = $_POST['cliente'];
    }
    if (isset($_POST['cat'])) {
        $cat = $_POST['cat'];
    }
    if (!isset($_POST['moneda'])){
        $moneda = 'G$';
    }

    $sql = "INSERT INTO pedido_traslado(cod_cli, cliente, usuario,moneda, fecha, hora, total, estado, suc, suc_d, fecha_cierre, hora_cierre, e_sap,cat,tipo)
    VALUES ( '$cod_cli', '$cliente', '$usuario','$moneda', CURRENT_DATE, CURRENT_TIME, 0, 'Abierta', '$suc', '$sucd', NULL, NULL, 0,$cat,'$tipo');";
    $my = new My();
    $my->Query($sql);
    $ultima = "SELECT n_nro as Nro,usuario as Usuario,date_format(fecha,'%d-%m-%Y') as Fecha,cod_cli, cliente,estado as Estado,suc as Origen,suc_d as Destino,moneda FROM pedido_traslado  WHERE usuario = '$usuario' and suc = '$suc' ORDER BY n_nro DESC LIMIT 1";
    $f = new Functions();        
    echo json_encode($f->getResultArray($ultima));
}
function getDetalleSolicitud(){
    $nro =  $_POST['nro'];
    $sql = "SELECT codigo,lote,descrip,cantidad,precio_cat,precio_venta,ROUND((cantidad*precio_venta),2) as subtotal,color,mayorista,urge,obs FROM pedido_tras_det WHERE n_nro = $nro";
    $f = new Functions();        
    echo json_encode($f->getResultArray($sql));
}

function addLoteSolicitudTraslado() {
    $db = new My();
    $nro = $_REQUEST['nro_nota'];
    $codigo = $_REQUEST['codigo'];
    $lote = $_REQUEST['lote'];
    $descrip = $_REQUEST['descrip'];
    $cantidad = $_REQUEST['cantidad'];
    $color = $_REQUEST['color'];
    $mayorista = $_REQUEST['mayorista'];
    $urge = $_REQUEST['urge'];
    $obs = $_REQUEST['obs'];
    $destino = $_REQUEST['destino'];
    $um = $_REQUEST['um'];

    $precio_cat  = $_REQUEST['precio_cat'];
    
    $precio_venta = 0;
    if (isset($_REQUEST['precio_venta'])) {
        $precio_venta = $_REQUEST['precio_venta'];
    }
    $respuesta = array();
    
    $db->Query("INSERT INTO pedido_tras_det(n_nro, codigo, lote, um_prod, descrip, cantidad,precio_cat, precio_venta, color, estado, mayorista, urge, obs, lote_rem, e_sap) "
            . "VALUES ($nro, '$codigo', '$lote', '$um', '$descrip', '$cantidad',$precio_cat, $precio_venta, '$color', 'Pendiente', '$mayorista', '$urge', '$obs','', 0);");
    $respuesta['estado'] = 'Ok';
    $respuesta['mensaje'] = "Articulo cargado...";
     
    echo json_encode($respuesta);
}


function cambiarEstadoSolicitudTraslado() {
    $db = new My();
    $dba = new My();
    $nro = $_POST['nro'];
    $usuario = $_POST['usuario'];
    $estado = $_POST['estado'];
    $db->Query("SELECT estado,suc_d FROM pedido_traslado WHERE n_nro = $nro");
    $db->NextRecord();
    $estado_actual = $db->Get('estado');
    $suc_d = $db->Get('suc_d');
    if($estado_actual == "Req.Auth"){
        $db->Query("UPDATE pedido_traslado SET estado = '$estado',fecha_cierre = current_date, hora_cierre = current_time,auth_por = '$usuario'  WHERE n_nro = $nro");
        makeLog($usuario, "MODIFICAR", "Autorizo precio mas bajo de la categoria", 'Solicitud Traslado', $nro);
    }else{
        $db->Query("UPDATE pedido_traslado SET estado = '$estado',fecha_cierre = current_date, hora_cierre = current_time WHERE n_nro = $nro");
        makeLog($usuario, "MODIFICAR", "Cambio estado de Solicitud a $estado", 'Solicitud Traslado', $nro);
    } 
    
    //makeLog($usuario, $accion, $data, $tipo, $doc_num)

    if ($estado == "Pendiente") { 
        $db->Query("UPDATE pedido_tras_det d, reg_ubic r  SET d.ubic = CONCAT(nombre,'-',fila,'-',col) ,d.nodo =  CONCAT(nombre,r.col), pallet = nro_pallet   WHERE d.codigo = r.codigo AND r.lote = d.lote AND r.suc = '$suc_d' AND  n_nro = $nro");         
    }
     

    echo "Ok";
}
function makeLog($usuario, $accion, $data, $tipo, $doc_num) {
    $db = new My();
    $db->Query("INSERT INTO logs(usuario, fecha, hora, accion,tipo,doc_num, DATA) VALUES ('$usuario', current_date, current_time, '$accion','$tipo', '$doc_num', '$data');");
    $db->Close();
    return true;
}

function borrarLoteDeSolicitudTraslado() {
    $db = new My();
    $nro = $_POST['nro_nota'];
    $lote = $_POST['lote'];
    $db->Query("DELETE FROM pedido_tras_det WHERE n_nro = $nro AND lote = '$lote'");
    echo "Ok";
}



function ping(){
   $pong = time();
   echo $pong; // The pong is a unix time_stamp
}

new SolicitudTrasladoMobile();
?>

