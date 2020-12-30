<?php

/**
 * Description of ReporteSolicitudesTactil
 * @author Ing.Douglas
 * @date 08/08/2017
 */
require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");
require_once("../Config.class.php");

class ReporteSolicitudesTactil {
    
    function __construct() {
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }

    function main() {
        $origen = $_REQUEST['origen'];
        $destino = $_REQUEST['destino'];
        $operario = $_REQUEST['usuario'];
        $desde = $_REQUEST['desde'];
        $hasta = $_REQUEST['hasta'];
        $hora = $_REQUEST['hora'];
        $tipo = $_REQUEST['tipo'];
        $urge = $_REQUEST['urge'];
        $nivel = $_REQUEST['nivel'];
        
        $touch="true";
        $tipo_busqueda = $_REQUEST['tipo_filtro'];
        
 
        if(!isset($_GET['urge'])){
            $urge = '%';
        }

        if(!isset($_GET['tipo'])){
            $tipo = '%';
        }

        $filtro_tipo = " AND p.tipo LIKE '$tipo_busqueda'";  // tejidos o insumos


        $estado = $_REQUEST['estado'];
        $paper_size = $_REQUEST['paper_size'];

        $t = new Y_Template("ReporteSolicitudesTactil.html");
        
        $db = new My();
        $db2 = new My();
        $dba= new My();
         
        $this->actualizarUbicacion($origen, $destino);
        
        $c = new Config();
        $host = $c->getNasHost();
        $path = $c->getNasFolder();
        $images_url = "http://$host/$path";
        $t->Set("images_url",$images_url);
         
       
        $t->Set("paper_size", $paper_size);

        $desde_lat = new DateTime($desde);
        $hasta_lat = new DateTime($hasta);
        $t->Set("desde", $desde_lat->format('d-m-Y'));
        $t->Set("hasta", $hasta_lat->format('d-m-Y'));

        $t->Set("suc", $origen);
        $t->Set("suc_d", $destino);
        $t->Set("tipo_busqueda", $tipo_busqueda);

        if ($tipo == "%") {
            $t->Set("tipo", "Mayorista y Minorista");
        } else {
            $t->Set("tipo", $tipo == 'Si' ? 'Mayorista' : 'Minorista');
        }
        $fila = " > 3";

        if ($nivel == "Hombre") {
            $fila = " REPLACE(SUBSTRING(ubic,3,2),'-', '')  < 4 AND (d.ubic IS NOT NULL AND d.ubic != '')";
        } else if ($nivel == "Picker") {
            $fila = " REPLACE(SUBSTRING(ubic,3,2),'-', '')  > 3 AND (d.ubic IS NOT NULL AND d.ubic != '')";
        }  else if($nivel == "Sin Ubic") {
            $fila = " (d.ubic = '' or d.ubic is null ) ";
        }else{
            $fila = " (d.ubic = '' or d.ubic is null   or  REPLACE(SUBSTRING(ubic,3,2),'-','') > 0  )";
        }

        if ($estado != 'Pendiente') { 
            $tipo = "%";
            $urge = "%";
            $t->Set("display_numpad","none");
        }else{
            $t->Set("display_numpad","inline");
        }


        $t->Set("operario", $operario);
        
        $db->Query('SELECT  DATE_FORMAT( CURRENT_TIMESTAMP,"%d%-%m-%Y %H:%i") AS fecha_hora');
                 
        $db->NextRecord();
        $fecha_hora = $db->Record['fecha_hora'];
        $t->Set("fecha_hora", $fecha_hora);
         
        
        $t->Set("fecha_hora", date("d-m-Y H:i"));
        $t->Set("nros", $pedidos);

        $t->Show("header");
        $t->Show("head");
        
        if ($fila != "Sin Ubic" && $origen == $destino && $destino == "00") { // Si son pedidos de vendedores mostrar todos
            //$fila = " > 0  AND (d.ubic IS NOT NULL AND d.ubic != '') ";
        }

        $sql = "SELECT p.n_nro as nro,usuario,cod_cli,cliente,cat,precio_venta, concat(date_format(fecha_cierre,'%d/%m/%y'),' ',date_format(time(hora_cierre),'%H:%i')) as cierre, p.suc_d as destino,usuario,d.codigo,d.lote,lote_rem,rem_stock,descrip,s.cantidad AS stock,d.cantidad,mayorista,urge,obs,d.ubic,d.nodo,prioridad,d.estado, LEFT(d.nodo,1) AS estante,REPLACE(SUBSTRING(ubic,3,2),'-', '')  AS fila,pallet,p.cod_cli,p.cliente,precio_venta,"
                . " l.ancho,l.gramaje,l.tara,d.um_prod AS um,d.color,CONCAT( cod_catalogo,'-', color_cod_fabric) AS fab_color_cod,l.img, p.moneda  "
                . "FROM pedido_traslado p INNER JOIN pedido_tras_det d on  p.n_nro = d.n_nro and  p.estado != 'Abierta' and d.estado = '$estado' and  STR_TO_DATE(CONCAT(fecha_cierre,' ',hora_cierre),'%Y-%m-%d %H:%i:%s') between '$desde 00:00:00' and '$hasta $hora' and mayorista like '$tipo' and urge like '$urge' and p.suc = '$origen' and p.suc_d = '$destino' 
            and  $fila  $filtro_tipo INNER JOIN lotes l ON d.codigo = l.codigo AND d.lote = l.lote "
                . " LEFT JOIN nodos n ON  d.nodo = n.nodo  INNER JOIN stock s ON l.codigo = s.codigo AND l.lote = s.lote AND s.suc = p.suc_d ORDER BY n.prioridad ASC , REPLACE(SUBSTRING(ubic,3,2),'-', '') ASC ";
 
        if ($fila == "Sin Ubic") {
            $sql = "SELECT p.n_nro as nro,usuario,cod_cli,cliente,precio_venta, concat(date_format(fecha_cierre,'%d/%m/%y'),' ',date_format(time(hora_cierre),'%H:%i')) as cierre, p.suc_d as destino,usuario,d.codigo,d.lote,lote_rem,rem_stock,descrip,s.cantidad AS stock,d.cantidad,mayorista,urge,obs,d.ubic,'' AS nodo,'' AS prioridad,d.estado, 
            '' AS estante,'' AS fila,'' as pallet, l.ancho,l.gramaje,l.tara,d.um_prod AS um,d.color,CONCAT( cod_catalogo,'-', color_cod_fabric) AS fab_color_cod,l.img, p.moneda  FROM pedido_traslado p  INNER JOIN pedido_tras_det d on  p.n_nro = d.n_nro and  p.estado != 'Abierta' and d.estado = '$estado' and  STR_TO_DATE(CONCAT(fecha_cierre,' ',hora_cierre),'%Y-%m-%d %H:%i:%s') between '$desde 00:00:00' and '$hasta $hora' and mayorista like '$tipo' and urge like '$urge' and p.suc = '$origen' and p.suc_d = '$destino' 
            AND (d.ubic IS NULL or d.ubic = '') $filtro_tipo  INNER JOIN lotes l ON d.codigo = l.codigo AND d.lote = l.lote INNER JOIN stock s ON l.codigo = s.codigo AND l.lote = s.lote AND s.suc = p.suc_d ORDER BY p.n_nro ASC,  descrip ASC ";
        }

        //echo $sql;
        
        $db->Query($sql);

        
    
        $this->extraerDatos($db, $t,$origen);
        

        $t->Show("foot");
         
        
        if ($estado == 'Suspendido' || $estado == 'Pendiente') {    
            $t->Show("procesador_pedidos");
        }
             
        if($touch=="true" && $estado == 'Pendiente'){      
               
            require_once("../utils/NumPad.class.php");                                   
            new NumPad(); 
        } 
    }

    function extraerDatos($db, $t,$origen) {
        while ($db->NextRecord()) {
            
            $nro = $db->Record['nro'];

            $destino = $db->Record['destino'];
            $usuario = $db->Record['usuario'];
            $codigo = $db->Record['codigo'];
            $cierre = $db->Record['cierre'];
            $lote = $db->Record['lote'];
            $lote_rem = $db->Record['lote_rem'];
            $rem_stock = $db->Record['rem_stock'];
            $descrip = $db->Record['descrip'];
             
            $cantidad = $db->Record['cantidad'];
            $stock = $db->Record['stock'];
            $mayorista = $db->Record['mayorista'];
            $urge = $db->Record['urge'];
            $obs = $db->Record['obs'];
            $ubic = $db->Record['ubic'];
            $estante = $db->Record['estante'];
            $estado = $db->Record['estado'];
            $filae = $db->Record['fila'];
            $nodo = $db->Record['nodo'];    
            $pallet = $db->Record['pallet'];    
            $cod_cli = $db->Record['cod_cli'];   
            $cliente = $db->Record['cliente'];
            $cat = $db->Record['cat'];
            $precio_venta = $db->Record['precio_venta'];
            $ancho = $db->Record['ancho'];            
            $gramaje = $db->Record['gramaje']; 
            $tara = $db->Record['tara'];
            $um_prod = $db->Record['um']; 
            $color = $db->Record['color'];
            $fab_color_cod = $db->Record['fab_color_cod'];
            $img = $db->Record['img']; 
            $moneda = $db->Record['moneda'];  
            
            $tachado = "";
            if($rem_stock <= 0){
                $rem_stock = "";
            }else{
                $tachado = " tachado";
            }
            
            if($pallet != ''){
                $pallet = ' P:'.$pallet;
            }
            $t->Set("nro", $nro);
            $t->Set("usuario", $usuario);
            //$t->Set("de_a",$origen."&rArr;".$destino);
            $t->Set("codigo", $codigo);
            $t->Set("cierre", $cierre);
            $t->Set("lote", $lote);
            $t->Set("lote_rem", $lote_rem);
            $t->Set("rem_stock", $rem_stock);
            $t->Set("descrip", ucwords(strtolower(utf8_decode($descrip))));
            $t->Set("cantidad", $cantidad);
            $t->Set("stock", $stock);
            $t->Set("mayorista", $mayorista);
            $t->Set("urge", $urge);
            $t->Set("estante", $estante);
            $t->Set("fila", $filae);
            $t->Set("ubic", $ubic."".$pallet);
            $t->Set("nodo", $nodo);
            $t->Set("estado", $estado);
            $t->Set("cod_cli", $cod_cli);
            $t->Set("cliente", $cliente);
            $t->Set("cat", $cat);
            $t->Set("precio_venta", $precio_venta);
            $t->Set("ancho", $ancho);
            $t->Set("gramaje", $gramaje);
            $t->Set("tara", $tara);
            $t->Set("um", $um_prod);
            $t->Set("moneda", $moneda);
            $t->Set("color", ucwords(strtolower(utf8_decode($color)))); 
            $t->Set("fab_color_cod", $fab_color_cod);
            $t->Set("img", $img);
            $t->Set("tachado", $tachado);
            
            $t->Set("diff_stock", ""); 
            $t->Set("diff_cant", ""); 
            $t->Set("diff_remp", ""); 
            if($rem_stock > 0){
                if($rem_stock != $cantidad){
                    $t->Set("diff_stock", ""); 
                    $t->Set("diff_cant", " diff_stock"); 
                    $t->Set("diff_remp", " diff_stock"); 
                } 
            }else{
                if($cantidad != $stock){
                   $t->Set("diff_stock", " diff_stock"); 
                   $t->Set("diff_cant", " diff_stock"); 
                   $t->Set("diff_remp", ""); 
                } 
            }
            
            if ($estado != 'Pendiente') {
                $t->Set("readonly", "readonly='readonly'");
            }
            if ($obs != '') {
                $setObs = "<div class='obs_div'><b>Obs: </b><span class='obs_".$nro."_".$lote."' style='font-size:12px;color:blue'>" . utf8_decode($obs) . "</span></div>";
            } else {
                $setObs = "";
            }
            if ($urge == "Si") {
                $class_urge = "urge";
            } else {
                $class_urge = "";
            }
            $t->Set("color_urge", $class_urge);
            $t->Set("obs", $setObs);
            $t->Set("estado", $estado);
            $t->Set("verificar", ($estado === 'Pendiente') ? 'si' : 'no');
            $t->Show("line");
        }
    }

    // Actualizar ubicacion
    function actualizarUbicacion($suc, $suc_d){
        /*
        $ms = new MS();
        $my = new My();
        $lotes = '';
        $ubics = array();
        $n_nros = array();

        $my->Query("SELECT d.n_nro,d.lote FROM pedido_traslado p INNER JOIN pedido_tras_det d USING(n_nro) WHERE p.suc = '$suc' AND p.suc_d = '$suc_d' AND  d.estado = 'Pendiente' AND p.estado = 'Pendiente'");
        while($my->NextRecord()){
            $lote = $my->Record['lote'];
            $n_nro = $my->Record['n_nro'];
            if(!in_array($n_nro,$n_nros)){
                array_push($n_nros,$n_nro);
            }
            $lotes .= (strlen($lotes)>0)?", $lote":$lote;
        }
        if(strlen($lotes)>0){
            $ms->Query("SELECT DistNumber,U_ubic, U_pallet_no FROM OBTN WHERE DistNumber in ($lotes)");
            while($ms->NextRecord()){
                $pallet = $ms->Record['U_pallet_no'];
                if($pallet != "" && $pallet != null){
                    $pallet = "-".$pallet;
                }else{
                   $pallet = ""; 
                } 
                $ubic = trim($ms->Record['U_ubic'].$pallet);
                $ubic = (strlen($ubic)>0)?$ubic:'x';
                
                $lte = $ms->Record['DistNumber'];
                if(!isset($ubics[$ubic])){
                    $ubics[$ubic] = array();
                }
                array_push($ubics[$ubic], $lte);
            }
            $ms->Close();
        }
        if(count($ubics)>0){
            $_n_nros = implode(',',$n_nros);
            foreach($ubics as $key=>$value){
                $ubc = ($key == 'x')?'':$key;
                $nodo = ($key == 'x')?'': explode('-',$ubc)[0] . explode('-',$ubc)[2];
                $pallet = ($key == 'x')?'': explode('-',$ubc)[3] ;
                $lts = implode(',',$value);
                 
                $my->Query("UPDATE pedido_tras_det SET ubic='$ubc', nodo='$nodo', pallet = '$pallet' WHERE estado='Pendiente' AND n_nro IN ($_n_nros) AND lote IN ($lts)");
            }
        }
        $my->Close(); */
    }
}

function getFacturasAbiertasDeCliente(){
    $cod_cli_ = $_POST['cod_cli'];
    $cliente_post = $_POST['cliente'];
    $vendedor = $_POST['vendedor'];
    $suc_  = $_POST['suc'];
    
    $sql = "SELECT f.f_nro,cliente,cod_cli,DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha, usuario AS vendedor, COUNT(d.codigo) AS Items ,notas, COUNT(DISTINCT CONCAT( d.codigo,precio_venta) ) AS Articulos
    FROM  factura_venta f LEFT JOIN fact_vent_det d ON f.f_nro = d.f_nro WHERE  usuario = '$vendedor' AND cod_cli = '$cod_cli_' AND f.suc = '$suc_'  AND f.estado='Abierta'  GROUP BY f.f_nro ";
    
  
    $db = new My();

    $db->Query($sql);

    echo"<table border='1' style='border:1px solid gray;border-collapse: collapse;background: white; width:auto'> 
        <tr><th colspan='7'>Facturas Abiertas</th></tr>
        <tr class='titulo'><th>N&deg;</th><th>Cliente</th><th>Fecha</th><th>Vendedor</th><th>Items</th><th>Notas</th><th>&nbsp;</th></tr>";

    while ($db->NextRecord()) {
        $nro = $db->Record['f_nro'];
        $cliente = $db->Record['cliente'];
        $cod_cli = $db->Record['cod_cli'];
        $fecha = $db->Record['fecha'];
        $usuario = $db->Record['vendedor'];
        $items = $db->Record['Items'];
        $notas = $db->Record['notas'];
        $articulos = $db->Record['Articulos'];
        if ($nro != null) {
            $onclick = "onclick='insertarEnFactura($nro)'";
            $button_val = "Insertar aqu&iacute;";
            if($articulos >= 15){
                $onclick = "";
                $button_val = "Factura llego al limite de 15 Articulos.";
            }
            echo "<tr><td class='itemc'>$nro</td><td  class='itemc'>$cliente</td><td  class='itemc'>$fecha</td><td  class='itemc'>$usuario</td><td class='itemc items_$nro'>$items / $articulos</td><td class='item'>$notas</td>"
            . "<td class='itemc btn_$nro'><input type='button' class='insertar' value='$button_val' $onclick style='height: 24px;font-size: 10px;font-weight: bold' ></td>"
            . "</tr>";
        } else {
            echo "<tr><td class='itemc' style='height:36px' colspan='7'>No hay Facturas Abiertas para $cliente_post</td></tr>";
        }
    }
    echo "<tr style='border-width:1 0 1 1'><td class='itemc' ><img src='../img/arrow-up.png' onclick='minimizar()' title='Minimizar' style='cursor:pointer'></td> "
    . " <td class='itemc' colspan='5'><input type='button' value='Generar Factura' onclick=generarFactura('$cod_cli_','$suc_','$vendedor')></td></tr>";

    echo "</table>";    
}
 
function cambiarEstadoPedido(){
    $lote = $_POST['lote']; 
    $codigo = $_POST['codigo'];
    $nro_pedido = $_POST['nro_pedido']; 
    $db = new My();
    $db->Query("UPDATE pedido_tras_det set estado = 'En Proceso' WHERE n_nro = $nro_pedido AND codigo = '$codigo' AND lote = '$lote'  ");
    echo "Ok";
}

function verificarLoteEnRemito($n_nro, $lote) {
    $db = new My();
    $db->Query("SELECT COUNT(*) AS cant FROM nota_rem_det WHERE n_nro = $n_nro AND lote = '$lote'");
    $db->NextRecord();
    $cant = $db->Record['cant'];
    return $cant;
}

/** Desde una Pedido de Traslado */
function insertarLotesEnRemito() {
    //$time_start = microtime(true);
    $nro = $_REQUEST['nro'];
    $suc = $_REQUEST['suc'];
    $db = new My();
    $db->Query("SELECT estado   from nota_remision where n_nro=$nro");
    $db->NextRecord();
    $estado = $db->Record['estado'];

    $usuario = $_REQUEST['usuario'];  

    if ($estado == 'Abierta') {
        $lotes = json_decode($_REQUEST['lotes']);
        $insertados = array();
       
        $my = new My();

        // Buscar Primero datos del Codigo de Remplazo     
         

        foreach ($lotes as $key => $val) {

            $nro_pedido = $lotes[$key]->nro_pedido;
            $codigo = trim($lotes[$key]->codigo);
            $lote = $lotes[$key]->lote;
            $descrip = ucfirst(strtolower($lotes[$key]->descrip));            
            $cant_pedida = $lotes[$key]->cant;
            $um = $lotes[$key]->um;
            
            $is_lote_rem = $lotes[$key]->is_lote_rem;
            
            
            $control = verificarLoteEnRemito($nro, $lote);
            if ($control < 1) {
                
                $my->Query(" SELECT l.gramaje,l.ancho,l.tara,l.um_prod,s.cantidad AS stock  FROM lotes l, stock s  WHERE l.codigo = s.codigo AND l.lote = s.lote AND l.lote ='$lote' AND l.codigo = '$codigo' AND s.suc = '$suc'");
                $my->NextRecord();
                
                $tara = $my->Record['tara'];
                $gramaje = $my->Record['gramaje'];
                $ancho = $my->Record['ancho'];
                $cant = $my->Record['stock'];
                $um_prod = $my->Record['um_prod'];
                 
                
                $datos_ped = "SELECT usuario,fecha_cierre,hora_cierre FROM pedido_traslado WHERE n_nro = $nro_pedido"; 
                $db->Query($datos_ped); 
                $db->NextRecord();
                
                
                
                $ped_user = $db->Record['usuario'];   
                $ped_fecha = $db->Record['fecha_cierre'];
                $ped_hora = $db->Record['hora_cierre'];                       
                              
                
                /*                 
                if ($um == "Kg" && $um_prod == "Mts") { //Calcular cuantos kg tiene
                      
                }*/
                if ($tara == null) {
                    $tara = 0;
                }
 
                $cant_compra = 0; // No veo porque es necesario esto
                 
                if ((float) $cant > 0) {

                    $queryr = "SELECT 'Remedir' as TipoDocumento, n.n_nro as Nro, d.verificado_por as usuario,DATE_FORMAT(n.fecha_cierre,'%d-%m-%Y') AS fecha,n.suc_d as suc,d.estado,d.cantidad as cantidad from nota_remision n inner join nota_rem_det d using(n_nro) where n.suc_d = '$suc' and d.lote = '$lote' and d.estado = 'FR' ";
                    $db->Query($queryr);
                    if ($db->NumRows() > 0) {
                        $insertados['error'] = "Remedir: Fuera de Rango lote: $lote";
                    } else {
                        
                        $tipo_control_ch = (verifRollo($lote, $codigo)) ? 'Rollo' : 'Pieza';
                        $query = "INSERT INTO nota_rem_det( n_nro, codigo, lote, um_prod, descrip, cantidad,cant_inicial,gramaje,ancho, kg_env, kg_rec, cant_calc_env, cant_calc_rec, tara, procesado, estado,tipo_control, e_sap, usuario_ins,fecha_ins, ped_nro, ped_fecha, ped_hora, ped_user) "
                                . "VALUES ($nro, '$codigo', '$lote', '$um', '$descrip', $cant,$cant_compra,$gramaje,$ancho,0, 0, 0, 0, $tara,0, 'Pendiente','$tipo_control_ch', 0,'$usuario',current_timestamp, $nro_pedido, '$ped_fecha', '$ped_hora', '$ped_user')";

                         
                        $db->Query($query);
                        array_push($insertados, $lote);
                        if($is_lote_rem == "true"){
                            $db->Query("UPDATE pedido_tras_det set estado = 'En Proceso' WHERE n_nro = $nro_pedido AND codigo = '$codigo' AND  lote_rem = '$lote' ");
                        }else{
                            $db->Query("UPDATE pedido_tras_det set estado = 'En Proceso' WHERE n_nro = $nro_pedido AND codigo = '$codigo' AND  lote = '$lote'  ");
                        }
                        
                    }
                     
                } else {
                    $insertados['error'] = "Stock 0 lote:$lote";
                }
                
            } else {
                array_push($insertados, $lote);
                 
            }
        }

        echo json_encode($insertados);
    } else {
        echo '{"error":"La remision ' . $nro . ' esta ' . $estado . '"}';
    }
    //$time_end = microtime(true);
    //debug("Fin $nro, tiempo: ".(($time_end - $time_start)/60));
}

function generarOrdenProcesamiento(){
    $usuario = $_REQUEST['usuario'];
    $codigo = $_REQUEST['codigo'];
    $lote = $_REQUEST['lote'];
    $lote_ref = $_REQUEST['lote_ref'];
    $suc = $_REQUEST['suc'];
    $cant_frac = $_REQUEST['cant_frac'];
    $presentacion = $_REQUEST['presentacion'];
    $obs = $_REQUEST['obs'];
    
    $db = new My();
    $db->Query("SELECT IF (id_ent IS NULL,id_compra,id_ent) AS id_ent,CONCAT(p.nombre_color,' | ',l.cod_catalogo,'-',l.color_cod_fabric,' | ',l.design) AS color FROM lotes l, pantone p WHERE l.pantone = p.pantone AND lote = '$lote' AND codigo = '$codigo'");
    
    $db->NextRecord();
    $id_ent = $db->Get('id_ent');
    $color = $db->Get('color');
    $db->Query("INSERT INTO  orden_procesamiento(  id_ent, usuario, suc, nro_pedido, cod_cli, codigo, lote, color, fecha, hora, presentacion, cantidad, prioridad, operador, fecha_inicio, iniciado_por, estado, tipo_proc, obs, lote_ref)
    VALUES ( '$id_ent', '$usuario', '$suc', NULL, 0, '$codigo', '$lote', '$color', CURRENT_DATE, CURRENT_TIME, '$presentacion', $cant_frac, 1,NULL, NULL, NULL, 'Pendiente', NULL, '$obs', '$lote_ref');");
    
    if($db->AffectedRows() > 0){
        echo json_encode(array("estado"=>"Ok","lote"=>$lote));
    }else{
        echo json_encode(array("estado"=>"Error"));
    } 
}

function getOrdenProcesamientoLoteRef(){
    require_once("../Functions.class.php");
    $lote_ref = $_POST['lote_ref'];
    $f = new Functions();
    echo json_encode($f->getResultArray("SELECT id_orden,usuario,date_format(fecha,'%d-%m-%Y') as fecha,estado, codigo,lote,color,cantidad,presentacion,suc,obs  FROM orden_procesamiento WHERE lote_ref = '$lote_ref'"));
}

 

/**
 * @param int $lote 
 * @param String $codigo
 */
function verifRollo($lote, $codigo) {   
     
    $db = new My();
    $my = new My();
    $fracciones = 0;
    $ventas = 0;
    $esRollo = true;

    $db->Query("SELECT  padre,um_prod as UM from lotes where codigo  = '$codigo' and lote =  '$lote'");
    $db->NextRecord();
    if (trim($db->Record['padre']) !== '' || trim($db->Record['UM']) == 'Unid') {  
        $esRollo = false;
    } else {  
        $db->Query("SELECT count(*) as fracciones from fraccionamientos   where codigo = '$codigo' and  padre =  '$lote'");
        $db->NextRecord();
        $fracciones = (int) $db->Record['fracciones'];
        $db->Close();

        if ($fracciones > 0) {
            $esRollo = false;
        } else {
            $my->Query("SELECT count(*) as ventas from factura_venta f inner join fact_vent_det d using(f_nro) where codigo = '$codigo' and lote =  '$lote' and f.estado='Cerrada'");
            $my->NextRecord();
            $ventas = (int) $my->Record['ventas'];
            $my->Close();

            if ($ventas > 0) {
                $esRollo = false;
            }
        }
    }
    return $esRollo;
}

new ReporteSolicitudesTactil();
?>
