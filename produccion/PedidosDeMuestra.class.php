<?php

/**
 * Description of PedidosDeMuestra
 * @author Ing.Douglas
 * @date 09/05/2018
 */
require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");
require_once("../Config.class.php");

class PedidosDeMuestra {
   function __construct() {
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }

    function main() {

        $suc = $_REQUEST['suc'];
        $usuario = $_REQUEST['user'];
        $estado = $_REQUEST['estado'];
        
        $t = new Y_Template("PedidosDeMuestra.html");
        
        $t->Set("checked_$estado",'checked="checked"');
        
        $c = new Config();
        $host = $c->getNasHost();
        $path = $c->getNasFolder();
        $images_url = "http://$host/$path";
        $t->Set("images_url",$images_url);
        
        $t->Show("headers");
        
        $t->Set("display_nuevo","none");
        if($estado == "Abierto"){
           $t->Show("nuevo_catalogo"); 
           $t->Set("display_nuevo","inline");           
        }
        $t->Show("edicion_catalogo"); 
        
        
        $t->Show("body");
        
        $db = new My();
        $db->Query("SELECT nro,usuario,suc,DATE_FORMAT(fecha,'%d-%m-%Y %H:%i') AS fecha,DATE_FORMAT(fecha_entrega,'%d-%m-%Y %H:%i') AS fecha_entrega,cod_cli,cliente,codigo,articulo,medida,cantidad,DATE_FORMAT(fecha_inicio,'%d-%m-%Y') AS fecha_inicio,usuarios,DATE_FORMAT(fecha_cierre,'%d-%m-%Y') AS fecha_cierre,entregado_a,obs,ubic,estado FROM catalogo_muestras WHERE estado = '$estado'");
        
        while($db->NextRecord()){
           $t->Set("nro", $db->Record['nro']);    
           $t->Set("usuario" , $db->Record['usuario']);    
           $t->Set("suc"  , $db->Record['suc']);    
           $t->Set("fecha"  , $db->Record['fecha']);    
           $t->Set("cod_cli"  , $db->Record['cod_cli']);    
           $t->Set("cliente"  , $db->Record['cliente']);    
           $t->Set("codigo" , $db->Record['codigo']);   
           $t->Set("articulo" , $db->Record['articulo']);   
           $t->Set("medida"  , $db->Record['medida']);    
           $t->Set("cantidad"  , $db->Record['cantidad']);    
           $t->Set("inicio" , $db->Record['fecha_inicio']);   
           $t->Set("fecha_entrega" , $db->Record['fecha_entrega']);   
           $t->Set("usuarios" , str_replace(" ","",  $db->Record['usuarios']));      
           $t->Set("cierre" , $db->Record['fecha_cierre']);    
           $t->Set("entregado_a" , $db->Record['entregado_a']);         
           $t->Set("obs" , $db->Record['obs']);    
           $t->Set("ubic" , $db->Record['ubic']);    
           $t->Set("estado" , $db->Record['estado']);   
           $t->Show("line"); 
        }         
        $t->Show("foot");         
    }
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
function buscarCliente(){
    $criterio = $_REQUEST['criterio'];
 
    $sql = "SELECT cod_cli,nombre FROM clientes WHERE  o.nombre LIKE '%$criterio%' OR ci_ruc LIKE '$criterio%' order by nombre asc limit 50";
    echo json_encode(getResultArray($sql));
}

function buscarArticulo(){
    $criterio = $_REQUEST['criterio'];
     
    $sql = "SELECT codigo,descrip FROM articulos WHERE (codigo LIKE '$criterio%' OR descrip LIKE '%$criterio%') AND descrip NOT LIKE 'ACTIVOS%' order by descrip asc";
    echo json_encode(getResultArray($sql));
}

function crearPedidoCatalogo(){
    //cod_cli: cod_cli,cliente:cliente,codigo:codigo,articulo:articulo,medida:medida,cantidad:cantidad,fecha_ent:fecha_ent,hora_ent:hora_ent
    $cod_cli = $_REQUEST['cod_cli'];
    $cliente = $_REQUEST['cliente'];
    $usuario = $_REQUEST['usuario'];
    $suc = $_REQUEST['suc'];
    $cantidad = $_REQUEST['cantidad'];
    $codigo = $_REQUEST['codigo'];
    $articulo = $_REQUEST['articulo'];
    $medida = $_REQUEST['medida'];
    $fecha_ent = $_REQUEST['fecha_ent'];
    $hora_ent = $_REQUEST['hora_ent'];
    $obs = $_REQUEST['obs'];
    require_once("../Functions.class.php");
    $f = new Functions();
    
    $fecha_eng = $f->invertirFechaLat($fecha_ent);
    $fecha_entrega = "$fecha_eng $hora_ent";
        
    $Qry = "INSERT INTO catalogo_muestras( usuario, suc, fecha, cod_cli, cliente, cantidad, fecha_entrega, codigo, articulo, medida, fecha_inicio, usuarios, fecha_cierre, entregado_a, obs, ubic, estado)
    VALUES ( '$usuario', '$suc', CURRENT_TIMESTAMP, '$cod_cli', '$cliente', $cantidad ,'$fecha_entrega', '$codigo', '$articulo', '$medida', NULL, '', NULL, NULL, '$obs', NULL, 'Abierto');";
    
    
    //echo $Qry;
    
    $db = new My();
    $db->Query($Qry);
    echo json_encode(array("estado"=>"Ok"));
}
function getPersonalMuestras(){
    $excluir = $_REQUEST['excluir'];
    echo json_encode(getResultArray("SELECT DISTINCT u.usuario,CONCAT(nombre,' ',apellido) AS fullname FROM usuarios u, usuarios_x_grupo g WHERE u.usuario = g.usuario AND estado = 'Activo'  and g.id_grupo = 24 and u.usuario not in($excluir) "));//
}
function guardarPersonales(){
    $personales = str_replace(" ","",   $_REQUEST['personales']);
    $nro = $_REQUEST['nro'];
    $db = new My();
    $db->Query("UPDATE catalogo_muestras SET usuarios = '$personales' WHERE nro =  $nro");
    echo "Ok";
}

function getLotesDisponibles(){
    $ms = new MS();
    $msd = new MS();
    $nro = $_REQUEST['nro'];
    
    $priority_sucs = json_decode($_REQUEST['only_sucs']);    
    
    //$priority_sucs = array("03","00","02","01","04","05","06","10","24","25","30");
    
    
    
        
    $master = array();
    $codigo = $_REQUEST['codigo'];
    $lote_especifico = $_REQUEST['lote_especifico'];
    $minimo = $_REQUEST['minimo'];
    $design_filter = $_REQUEST['design_filter'];
    $color_cod_filter = $_REQUEST['color_cod_filter'];
    $filtro_codigo_color_fabrica = $_REQUEST['filtro_codigo_color_fabrica'];
    
    if($lote_especifico == ""){
        $lote_especifico = "%";
    }else{
        $minimo = 0;
    }
        
    if($design_filter == "true" && $lote_especifico == "%"){    
       $design_filter = " ,U_design ";
    }else{
        $design_filter = "";
    }
    if($color_cod_filter == "true"){
       $color_cod_filter = " ,U_color_cod_fabric ";
    }else{
        $color_cod_filter="";
    }
    
        
    $Qry = "select distinct ItemCode,U_color_comercial as Pantone,c.Name as Color $design_filter $color_cod_filter ,sum(Quantity) as Mts from oibt o, [@EXX_COLOR_COMERCIAL] c  where o.U_color_comercial = c.Code and ItemCode ='$codigo' and BatchNum like '$lote_especifico' and Quantity > 0.5 and WhsCode in('00','02','01','04','05','06','10','24','25','30')  and  U_color_cod_fabric like '$filtro_codigo_color_fabrica%'  group by ItemCode,U_color_comercial,Name $design_filter  $color_cod_filter  having sum(Quantity) > $minimo ";
    
    //  echo $Qry;  
    //die(); 
    
    $ms->Query($Qry);       
   
    
    while($ms->NextRecord()){
        $fila = array();
        
        $ItemCode = $ms->Record['ItemCode'];
        $Pantone = $ms->Record['Pantone'];
        $Color = $ms->Record['Color']; 
        $Mts = $ms->Record['Mts'];
        
        $fila['ItemCode']= $ItemCode;
        $fila['Pantone']= $Pantone;
        $fila['Color']= $Color;
        if($design_filter != ""){
            $Design = $ms->Record['U_design'];
            $fila['Design']= $Design;           
        }else{
            $fila['Design']= "-";           
        }
        if($color_cod_filter != ""){
            $FabColorCode = $ms->Record['U_color_cod_fabric'];
            $fila['FabColorCode']= $FabColorCode;
        }else{
            $fila['FabColorCode']= "-";
        }
        
        
        
        $fila['Mts']= round($Mts,2);
        
        foreach ($priority_sucs as $suc) {
            $filter_des = "";
            $filter_cod = "";
            if($design_filter == "true"){
                $filter_des = "and U_design = '$Design'";
            }
            if($color_cod_filter == "true"){
                $filter_cod = "and U_color_cod_fabric = '$FabColorCode'";
            }
            
            $msd->Query("select  BatchNum,WhsCode,Quantity,U_color_cod_fabric,U_img from oibt o  where o.U_color_comercial = '$Pantone' $filter_des $filter_cod and o.WhsCode = '$suc' and ItemCode ='$ItemCode' and o.BatchNum like '$lote_especifico' and Quantity > 0.1 order by Quantity desc");
            
           // echo "select  BatchNum,WhsCode,Quantity,U_color_cod_fabric,U_img from oibt o  where o.U_color_comercial = '$Pantone' $filter_des $filter_cod and o.WhsCode = '$suc' and ItemCode ='$ItemCode' and o.BatchNum like '$lote_especifico' and Quantity > 0.1 order by Quantity desc<br><br>";
            
            if($msd->NumRows() > 0){
                $msd->NextRecord();
                $BatchNum = $msd->Record['BatchNum'];                 
                $Quantity = $msd->Record['Quantity'];
                $Img = $msd->Record['U_img'];
                 
                $fila['BatchNum']= $BatchNum;
                $fila['WhsCode']= $suc;
                $fila['Quantity']= round($Quantity,2); 
                $fila['Image']= $Img;
                break;
            }
        } 
       
        array_push($master, array_map('utf8_encode', $fila));
       // array_push($master, $fila);        
    }  
    // var_dump($master);
    $sorted_master = array();
    foreach ($priority_sucs as $suc) {
        $index = 0;
        foreach ($master as $fila) {
            $suc_master = $fila['WhsCode'];
            if($suc_master == $suc){
               array_push($sorted_master,$fila);  
               unset($master[$index]);
            }
            $index++;
        }
    }
     
    echo json_encode($sorted_master);
    
}
function verLotesAsignados(){
    $nro = $_REQUEST['nro'];
    echo json_encode( getResultArray( "SELECT id_det, lote, cantidad, pantone, color,usuario, estado FROM det_catalogo WHERE nro = $nro order by id_det asc;"));
}

function getPedidosAbiertos(){
    $nro_catalogo = $_REQUEST['nro_catalogo'];
    echo json_encode( getResultArray( "SELECT n_nro AS nro,usuario, CONCAT(DATE_FORMAT(fecha,'%d-%m-%Y'),' ',LEFT(hora,5)) AS fecha,estado,suc_d AS destino FROM pedido_traslado WHERE  nro_catalogo_muestras = $nro_catalogo;"));
}
function getDetallePedido(){
    $nro = $_REQUEST['nro'];
    echo json_encode( getResultArray( "SELECT id_det,lote,lote_rem,color,estado  FROM pedido_tras_det WHERE n_nro = $nro;"));
}
function getUbic(){
    $codigo = $_REQUEST['codigo'];
    $lote = $_REQUEST['lote'];
    $suc = $_REQUEST['$suc'];
    $ub = "SELECT CONCAT(nombre,'-',fila,'-',col) AS U_ubic, CONCAT(nombre,col) AS Nodo  FROM  reg_ubic  WHERE   codigo = '$codigo' AND  lote = '$lote' AND  suc = '$suc';";
    echo json_encode(getResultArray($ub));
}

function asignarLotes(){
    $nro = $_REQUEST['nro'];
    $lote = $_REQUEST['lote'];
    $color = $_REQUEST['color'];
    $pantone = $_REQUEST['pantone'];
    $usuario = $_REQUEST['usuario'];     
    $encargado = $_REQUEST['encargado'];  
    //Hacer una consulta para no repetir colores
    if($lote != ""){
        $sql = "INSERT INTO det_catalogo(nro, lote, cantidad, pantone, color, fab_color_cod, img, usuario, estado,encargado)VALUES ($nro, '$lote', 1, '$pantone', '$color', NULL, NULL, '$usuario', 0,'$encargado');";
        $db = new My();
        $db->Query($sql); 
        $db->Query("UPDATE catalogo_muestras SET fecha_inicio = CURRENT_TIMESTAMP, estado = 'En_Proceso' WHERE nro = $nro AND fecha_inicio IS NULL"); 
        echo "Ok";
    }else{
        echo "Error";
    }
}
 
function insertarEnSolicitudTraslado() {
    $nro = $_POST['nro'];
    $suc = $_POST['suc'];
    $suc_d = $_POST['sucd'];
    $usuario = $_POST['usuario'];  
    $lote = $_POST['lote'];    
    $color = $_POST['color'];    
    $cant_pedir = $_POST['cant_pedir'];    
    $urge = $_POST['urge']; 
    
    $cat = 1;
    $NroPedido = 0;
    $my = new My();
    
    $ultima = "SELECT n_nro as Nro,usuario as Usuario,date_format(fecha,'%d-%m-%Y') as Fecha,cod_cli, cliente,estado as Estado,suc as Origen,suc_d as Destino FROM pedido_traslado where nro_catalogo_muestras = $nro and suc_d = '$suc_d' and estado = 'Abierta'";
     
    $my->Query($ultima);
    if($my->NumRows()>0){
        $my->NextRecord();
        $NroPedido = $my->Record['Nro']; 
    }else{    
        
        $sql = "INSERT INTO pedido_traslado(nro_catalogo_muestras,cod_cli, cliente, usuario, fecha, hora, total, estado, suc, suc_d, fecha_cierre, hora_cierre, e_sap,cat,tipo)
        VALUES ($nro, '80001404-9', 'CORPORACION TEXTIL S.A', '$usuario', CURRENT_DATE, CURRENT_TIME, 0, 'Abierta', '$suc', '$suc_d', NULL, NULL, 0,$cat,'Tejidos');";

        $my->Query($sql);
        $ultima = "SELECT n_nro as Nro,usuario as Usuario,date_format(fecha,'%d-%m-%Y') as Fecha,cod_cli, cliente,estado as Estado,suc as Origen,suc_d as Destino FROM pedido_traslado WHERE nro_catalogo_muestras = $nro and suc_d = '$suc_d' and estado = 'Abierta' and usuario = '$usuario'  ORDER BY n_nro DESC LIMIT 1";
        $arr = getResultArray($ultima);
         
        $NroPedido = $arr[0]['Nro'];
        
    }
    
    // Insertar en el detalle
    
    $ms = getResultArray("SELECT a.codigo,costo_prom AS PrecioCosto,descrip,um FROM articulos a INNER JOIN lotes l ON a.codigo = l.codigo WHERE lote =  '$lote';");
     
    
    $codigo = $ms[0]['ItemCode'];
    $PrecioCosto = $ms[0]['PrecioCosto'];
    $descrip = $ms[0]['ItemName'];
    $um_prod = $ms[0]['um_prod'];
    
    $msu = getResultArray("SELECT CONCAT(nombre,'-',fila,'-',col) AS U_ubic, CONCAT(nombre,col) AS Nodo  FROM  reg_ubic  WHERE   codigo = '$codigo' AND  lote = '$lote' AND  suc = '$suc_d';");
     
    
    $ubic = $msu[0]['U_ubic'];
    $nodo = $msu[0]['Nodo'];
    
    $det = "INSERT INTO pedido_tras_det(n_nro, codigo, lote, um_prod, descrip, cantidad, precio_venta, color, estado, mayorista, urge, obs, lote_rem, ubic, nodo, e_sap)
    VALUES ( $NroPedido, '$codigo', '$lote', '$um_prod', '$descrip - $color', $cant_pedir, '$PrecioCosto', '$color', 'Pendiente', 'No', '$urge', 'Para fabricaion de Muestras', '', '$ubic', '$nodo', 0);";
    
    $my->Query($det);
    echo "Ok";
    
}
function save(){
    $db = new My();
    $nro = $_POST['nro'];
    $obs = $_POST['obs'];
    $fecha = $_POST['fecha_entrega'];
    $entregado_a = $_POST['entregado_a'];
    
    $fecha_lat = substr($fecha,6,4).'-'.substr($fecha,3,2).'-'.substr($fecha,0,2).' '.substr($fecha,10,16).":00";
    
    //echo "UPDATE catalogo_muestras SET obs = '$obs',fecha_entrega = '$fecha_lat' WHERE nro = $nro;<br>";
    
    $db->Query("UPDATE catalogo_muestras SET obs = '$obs',fecha_entrega = '$fecha_lat',entregado_a = '$entregado_a' WHERE nro = $nro;");
    echo "Ok";
}
function cerrarCatalogo(){
    $db = new My();
    $nro = $_POST['nro'];
    $obs = $_POST['obs'];
    $entregado_a = $_POST['entregado_a'];
    $db->Query("UPDATE catalogo_muestras SET estado = 'Cerrado', fecha_cierre = CURRENT_TIMESTAMP,entregado_a= '$entregado_a' WHERE nro = $nro;");
    $db->Query("UPDATE det_catalogo SET fecha_hora_fin = current_time WHERE nro = $nro  ;");
    echo "Ok";
}
function enviarNotaPedidoTraslado(){
    $db = new My();
    $dba = new My();
    $nro = $_POST['nro'];
    $usuario = $_POST['usuario'];
    
    $db->Query("UPDATE pedido_traslado SET estado = 'Pendiente',fecha_cierre = current_date, hora_cierre = current_time WHERE n_nro = $nro");
    //makeLog($usuario, "MODIFICAR", 'Cambio estado de Solicitud a $estado', 'Solicitud Traslado', $nro);
    //makeLog($usuario, $accion, $data, $tipo, $doc_num)
    
     
    
    $link = new My();
    $db->Query("SELECT suc_d,codigo, lote  FROM pedido_traslado p, pedido_tras_det d WHERE p.n_nro = d.n_nro AND d.n_nro = $nro");
    while($db->NextRecord() ){
        $codigo = $db->Record['codigo'];
        $lote = $db->Record['lote'];
        $suc_d = $db->Record['suc_d'];            
        $ub = "SELECT CONCAT(nombre,'-',fila,'-',col) AS U_ubic, CONCAT(nombre,col) AS Nodo  FROM  reg_ubic  WHERE   codigo = '$codigo' AND  lote = '$lote' AND  suc = '$suc_d';";
        $link->Query($ub);
        if($link->NumRows()>0){
           $link->NextRecord();
           $ubic = $link->Record['U_ubic'];
           $nodo = $link->Record['Nodo'];
           $dba->Query("update pedido_tras_det set ubic = '$ubic',nodo = '$nodo' where n_nro = $nro and codigo = '$codigo' and lote = '$lote' ");
        }     
    } 
    
    echo "Ok";
    
}
function getPersonales(){
    $sql = "SELECT CONCAT( nombre,' ',apellido) AS user_fullname   FROM usuarios WHERE estado = 'Activo' AND usuario NOT IN('Sistema','FanYi','Zhu') ORDER BY user_fullname ASC";
    echo json_encode(getResultArray($sql));
}
 
function cambiarEstadoDetalle(){
    $nro = $_POST['nro'];
    $lotes = json_decode( $_POST['lotes'] );
    $valor = $_POST['valor'];
    $db = new My();
    
    foreach ($lotes as $lote) {
        $db->Query("UPDATE det_catalogo SET estado = $valor WHERE nro = $nro AND lote = '$lote';");
    }
    if($valor == 25){
        foreach ($lotes as $lote) {
            $db->Query("UPDATE det_catalogo SET fecha_hora_ini = current_time WHERE nro = $nro AND lote = '$lote' and fecha_hora_ini is not null;");
        }
    }
    echo "Ok";
}

function imprimirColor(){
    $nro = $_GET['nro'];
    $lotes =  $_GET['codes'];
     
    $t = new Y_Template("PedidosDeMuestra.html");
        
    $t->Set("margin",$margin);
        
    $t->Show("etiqueta_6x4_head");
    
    $db = new My();
     
    $lotes = substr($lotes,1,strlen($lotes) -2);
         
    $db->Query("SELECT lote, color FROM det_catalogo WHERE nro = $nro AND lote IN($lotes)");
    $t->Show("etiqueta_6x1_head");
    $i = 0;
    while($db->NextRecord()){
        $lote  = $db->Record['lote'];
        $color = $db->Record['color'];
        $t->Set("i",$i);
        $t->Set("lote",$lote);
        $t->Set("color",$color);
        $t->Show("etiqueta_6x1");
        $i++;
    }    
    $t->Show("etiqueta_6x1_foot");
} 
function imprimirCaratula(){
    $nro = $_GET['nro'];
    $codigo = $_GET['codigo'];
    $descrip =  $_GET['descrip'];
     
    $t = new Y_Template("PedidosDeMuestra.html");
    $t->Show("etiqueta_6x4_head");
    
    $t->Set("nro",$nro);
    $t->Set("codigo",$codigo);
    $t->Set("descrip",$descrip);
        
    $t->Show("caratula"); 
}
function imprimirContratapa(){
    $nro = $_GET['nro'];
    $codigo = $_GET['codigo'];
    $descrip =  $_GET['descrip'];
     
    $t = new Y_Template("PedidosDeMuestra.html");
    $t->Show("etiqueta_6x4_head");
        
    $t->Set("codigo",$codigo);
    $t->Set("descrip",$descrip);
    
    $datos =   getResultArray("SELECT   composicion,  gramaje_prom AS gramaje ,  ancho  FROM articulos WHERE codigo = '$codigo'");
    $t->Set("gramaje",number_format($datos[0]['gramaje'],0,',','.'));
    $t->Set("ancho",number_format($datos[0]['ancho'],2,',','.'));
    $t->Set("composicion", $datos[0]['composicion'] );
    $ms = new My();
    $ms->Query("SELECT cantidad AS Stock,   COUNT(*) AS Rollos FROM stock s, lotes l WHERE l.codigo = s.codigo AND l.lote = s.lote AND s.codigo = '$codigo' AND suc ='00' AND l.padre   ='' GROUP BY Stock ORDER BY COUNT(*) DESC, stock DESC");
    $rolls = "";
    $roll_title= "";
    while($ms->NextRecord()){
        $stock = $ms->Record['Stock'];
        $rollos = $ms->Record['Rollos'];
        $rolls.="[$rollos"."r$stock"."m]";
        $roll_title.="<b>$rollos</b> rollos de <b>$stock"."m</b><br>";
    }
        
    $t->Set("all_rolls", $roll_title );
    $t->Set("rollos", substr($rolls,0,24) );
     
    $ms->Query("SELECT cantidad AS Stock,   COUNT(*) AS Piezas FROM stock s, lotes l WHERE l.codigo = s.codigo AND l.lote = s.lote AND s.codigo = '$codigo' AND suc ='00' AND l.padre  !='' GROUP BY Stock ORDER BY COUNT(*) DESC, stock DESC");
    $pz = "";
    $pz_title = "";
    while($ms->NextRecord()){
        $stock = $ms->Record['Stock'];
        $piezas = $ms->Record['Piezas'];
        $pz.="[$piezas"."p$stock"."m]";
        $pz_title.="<b>$piezas</b> piezas de <b>$stock"."m</b><br>";
    }
    $t->Set("all_piezas", $pz_title );
    $t->Set("piezas",  substr($pz,0,24) );
    
    $t->Show("contratapa"); 
}


new PedidosDeMuestra();

?>
