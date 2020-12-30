<?php

/**
 * Description of Estantes
 * @author Ing.Douglas
 * @date 18/12/2018
 */
require_once("../../Y_Template.class.php");
require_once("../../Y_DB_MySQL.class.php");
require_once("../../Functions.class.php");

class Estantes {
   function __construct() {
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }

    function main() {
         
    }
}
function cargarEstante(){
    $usuario = $_REQUEST['usuario'];
    $f = new Functions();
    $permiso = $f->chequearPermiso("9.5.1", $usuario);
    
    $suc = $_REQUEST['suc'];
    $estante = $_REQUEST['estante'];   
    
    $t = new Y_Template("$suc/$estante.html");    
    $e = new Y_Template("Estantes.html"); 
    $e->Set("permiso_modificar","false");
    if($permiso == "vem"){
        $e->Set("permiso_modificar","true");
    } 
    $e->Set("suc",$suc);  
    $t->Set("suc",$suc);  
    $e->Set("usuario",$usuario);  
    $e->Set("estante",$estante);    
    $e->Show("header");
    $t->Show("header");
    $e->Show("temporadas"); 
    if($permiso == "vem"){
       $e->Show("add_remove_temporadas");  
    }
    $t->Show("container"); 
    //Cargar si tiene permiso
      
    $e->Show("toolbar");
}

function cargarCanasto(){
    $usuario = $_REQUEST['usuario'];
    $f = new Functions();
    $permiso = $f->chequearPermiso("9.5.1", $usuario);
    
    $suc = $_REQUEST['suc'];
    $estante = $_REQUEST['estante'];   
    
    $t = new Y_Template("$suc/Canasto.html");    
    $e = new Y_Template("Estantes.html"); 
    $e->Set("permiso_modificar","false");
    if($permiso == "vem"){
        $e->Set("permiso_modificar","true");
    } 
    $e->Set("suc",$suc);  
    $t->Set("suc",$suc);  
    $e->Set("usuario",$usuario);  
    $e->Set("estante",$estante);    
    $t->Set("estante",$estante);    
    $e->Show("header");
    $t->Show("header");
    $e->Show("temporadas"); 
    if($permiso == "vem"){
       $e->Show("add_remove_temporadas");  
    }
    $t->Show("container"); 
    //Cargar si tiene permiso
      
    $e->Show("toolbar");
}

function getCuadProperties(){
    $suc = $_REQUEST['suc'];
    $estante = $_REQUEST['estante']; 
    $fila = $_REQUEST['fila'];
    $col = $_REQUEST['col'];
    $db = new My();
    $db->Query("SELECT um,capacidad FROM cuadrantes WHERE suc = '$suc' AND estante = '$estante' AND fila = $fila AND col = $col");
    $um = "N/E";
    $capacidad = "N/E";
    if($db->NumRows()>0){    
        $db->NextRecord();
        $um = $db->Record['um'];
        $capacidad = $db->Record['capacidad'];
    }  
    echo json_encode(array("um"=>$um,"capacidad"=>$capacidad));
}
function getTemporadas(){
    $suc = $_REQUEST['suc'];
    $estante = $_REQUEST['estante']; 
     
    $db = new My();
    $db->Query("SELECT temporada, DATE_FORMAT(desde,'%d-%m-%Y') AS desde,DATE_FORMAT(hasta,'%d-%m-%Y') AS hasta, CURRENT_DATE  BETWEEN CONCAT(YEAR(CURRENT_DATE),DATE_FORMAT(desde,'-%m-%d')) AND CONCAT(YEAR(CURRENT_DATE),DATE_FORMAT(hasta,'-%m-%d')) as temporada_actual FROM temporadas WHERE suc = '$suc' AND estante = '$estante'  ");
    
    $master = array();
    while(  $db->NextRecord()){
        $temporada = $db->Record['temporada'];
        $desde = $db->Record['desde'];
        $hasta = $db->Record['hasta'];
        $temporada_actual = $db->Record['temporada_actual'];
         
        array_push($master,array("temporada"=>$temporada, "desde"=>$desde,"hasta"=>$hasta,"temporada_actual"=>$temporada_actual));
    }        
    echo json_encode($master);
}
function getCapacidadCuadrante(){
    $usuario = $_POST['usuario'];
    $suc = $_POST['suc'];
    $estante = $_POST['estante']; 
    $temporada = $_POST['temporada'];
    $fila = $_POST['fila'];
    $col = $_POST['col']; 
    $db = new My();
    $sql0 = "SELECT t.temporada,codigo,DATE_FORMAT(desde,'%d-%m') AS desde,DATE_FORMAT(hasta,'%d-%m') AS hasta,um,capacidad,piezas
    FROM  temporadas t, articulos_x_temp a WHERE t.suc = '$suc' AND t.estante = '$estante' AND fila = $fila AND col = $col AND t.temporada = $temporada AND t.temporada = a.temporada  AND a.estante = t.estante";
    
    //echo $sql0;
    
    $db->Query($sql0);
    $my = new My(); 
    $master = array();    
    
    if($db->NumRows() == 0){
        //$db->Query("INSERT INTO  articulos_x_temp(suc, estante, temporada, codigo, fila, col, um, capacidad, piezas, usuario, fecha)
        //VALUES ('$suc', '$estante', $temporada , '', '$fila', '$col', 'Mts', NULL, NULL, '$usuario', CURRENT_TIMESTAMP);");
        $sql0 = "SELECT t.temporada,DATE_FORMAT(desde,'%d-%m') AS desde,DATE_FORMAT(hasta,'%d-%m') AS hasta   
        FROM  temporadas t  WHERE t.suc = '$suc' AND t.estante = '$estante' AND t.temporada = $temporada  ";
        $db->Query($sql0);
        if($db->NumRows()>0){
            $db->NextRecord();
            $desde = $db->Record['desde'];
            $hasta = $db->Record['hasta'];
            array_push($master,array("codigo"=>"","descrip"=>"","desde"=>$desde,"hasta"=>$hasta,"um"=>"Mts","capacidad"=>"","piezas"=>""));
        }else{
            array_push($master,array("codigo"=>"Error:","descrip"=>"Definir Temporada primero","desde"=>"","hasta"=>"","um"=>"Mts","capacidad"=>"","piezas"=>""));
        } 
         
    }else{
        
        while($db->NextRecord()){
            $temporada = $db->Record['temporada'];
            $codigo = $db->Record['codigo'];
            $desde = $db->Record['desde'];
            $hasta = $db->Record['hasta'];
            $um = $db->Record['um'];
            $capacidad = $db->Record['capacidad'];
            $piezas = $db->Record['piezas'];
            if($codigo  != ""){
               $my->Query("select descrip from articulos where codigo ='$codigo'");
               $my->NextRecord();
               $descrip = $my->Record['descrip'];
            }else{
                $descrip = "Definir Articulo";
            }

            array_push($master,array("temporada"=>$temporada,"codigo"=>$codigo,"descrip"=>$descrip,"desde"=>$desde,"hasta"=>$hasta,"um"=>$um,"capacidad"=>$capacidad,"piezas"=>$piezas));
        }        
    }
    echo json_encode($master);
}

function verContenidoUbicacion(){
    
    $suc = $_POST['suc'];     
    $ubicacion = $_POST['estante'];
    $fila = $_POST['fila'];
    $col = $_POST['col']; 
    $pallet = $_POST['pallet'];
    if($pallet == ""){$pallet = "%";}
    
    //$sql = "select U_nro_pallet as Pallet, U_codigo as Codigo,U_lote as Lote,o.ItemName as Descrip,cast(round(Quantity - ISNULL(t.IsCommited,0),2) as numeric(20,2)) as Stock  from [@REG_UBIC] r,OITM o, OIBT T  where r.U_codigo = o.ItemCode  AND r.U_codigo = t.ItemCode and r.U_lote = t.BatchNum  and U_suc = '$suc' and t.WhsCode = '$suc' and U_nombre = '$ubicacion' and r.U_tipo = '$tipo' and U_fila = '$fila' and U_col = '$col' and U_nro_pallet like '$pallet' and Quantity > 0 order by U_nro_pallet asc ";
    $sql = "SELECT nro_pallet,r.codigo,r.lote, l.img ,  a.descrip,p.nombre_color AS color,s.cantidad AS stock, s.estado_venta 
    FROM articulos a INNER JOIN lotes l ON a.codigo = l.codigo INNER JOIN  pantone p ON l.pantone = p.pantone 
    INNER JOIN stock s ON l.codigo = s.codigo AND l.lote = s.lote INNER JOIN reg_ubic r ON l.codigo = r.codigo AND l.lote = r.lote AND s.suc = r.suc  WHERE s.suc ='$suc' AND nombre = '$ubicacion' AND fila = $fila AND col = $col AND nro_pallet LIKE '$pallet'
    AND s.cantidad > 0 AND s.estado_venta <> 'FP' order by  nro_pallet asc";
    
    $f = new Functions();
    
    $lotes = $f->getResultArray($sql);
    
    $sql_no_lotes = "SELECT nro_pallet,r.codigo,r.lote,'' AS img ,  a.descrip,''  AS color,s.cantidad AS stock, s.estado_venta 
    FROM articulos a  
    INNER JOIN stock s ON a.codigo = s.codigo  INNER JOIN reg_ubic r ON a.codigo = r.codigo AND  s.suc = r.suc  WHERE s.suc ='$suc' AND nombre = '$ubicacion' AND fila = $fila AND col = $col AND nro_pallet LIKE '$pallet'
    AND s.cantidad > 0 AND s.estado_venta <> 'FP' AND r.lote = '' "; 
    
    $no_lotes = $f->getResultArray($sql_no_lotes);
    $merge = array_merge($lotes, $no_lotes);
    echo json_encode($merge);
}

function addSubTemporada(){
    $suc = $_POST['suc'];     
    $usuario = $_POST['usuario'];
    $estante = $_POST['estante'];
    $temporada = $_POST['temporada'];
    $signo = $_POST['signo'];  
    
    $db = new My();
    if($signo == "+"){
        $temporada++;
        
        $inicio ='0000-00-00';
        $sql = "SELECT DATE_ADD(hasta, INTERVAL 1 DAY) AS inicio FROM  temporadas  WHERE suc = '$suc' AND estante = '$estante' AND temporada < $temporada order by temporada desc limit 1";
        //echo $sql;
        $db->Query($sql);
        if($db->NextRecord()){
            $inicio =$db->Record['inicio'];            
        }
        $db->Query("INSERT INTO  temporadas(suc, estante, temporada, usuario, desde, hasta) VALUES ('$suc', '$estante', $temporada, '$usuario', '$inicio', '0000-00-00');");
        echo "Ok";
    }else{
        try{
           $db->Query("DELETE FROM temporadas WHERE suc = '$suc' and estante = '$estante' and temporada = $temporada");
           echo "Ok";
        }catch(Exception $e){
            echo $e;
        }
    } 
}

function updateTempDate(){
    $suc = $_POST['suc'];     
    $usuario = $_POST['usuario'];
    $estante = $_POST['estante'];
    $temporada = $_POST['temporada'];
    $signo = $_POST['signo'];  
    $desde = explode("-", $_POST['desde']);  
    $hasta = explode("-",$_POST['hasta']);  
    $year = date("Y");
    $desde = $year."-".$desde[1]."-".$desde[0];
    $hasta = $year."-".$hasta[1]."-".$hasta[0];
    $db = new My();
    $sql = "UPDATE temporadas SET desde = '$desde',hasta = '$hasta', usuario = '$usuario', upt_date = current_time WHERE suc = '$suc' and estante = '$estante' and temporada = $temporada";
    //echo $sql;
    $db->Query($sql);
    echo "Ok";
}
 
function guardarArticuloEntemporada(){
    $suc = $_POST['suc'];     
    $usuario = $_POST['usuario'];
    $estante = $_POST['estante'];
    $temporada = $_POST['temporada'];
    $codigo = $_POST['codigo'];  
    $fila = $_POST['fila'];
    $col = $_POST['col']; 
    $capacidad= $_POST['capacidad'];
    $piezas = $_POST['piezas'];
    $um = $_POST['um'];
    $db = new My();
    $del = "DELETE FROM articulos_x_temp WHERE suc = '$suc' AND estante ='$estante' AND temporada = '$temporada' AND fila = $fila AND col = $col and codigo = '$codigo'";
    $db->Query($del);
    $ins = "INSERT INTO articulos_x_temp(suc, estante, temporada, codigo, fila, col, um, capacidad, piezas, usuario, fecha)
    VALUES ('$suc', '$estante', '$temporada', '$codigo', $fila , $col , '$um', $capacidad, $piezas , '$usuario', CURRENT_TIMESTAMP);";
    $db->Query($ins);
    echo "Ok";    
}
function quitarArticulo(){
    $suc = $_POST['suc'];     
    $usuario = $_POST['usuario'];
    $estante = $_POST['estante'];
    $temporada = $_POST['temporada'];
    $codigo = $_POST['codigo'];  
    $fila = $_POST['fila'];
    $col = $_POST['col']; 
    $db = new My();
    $del = "DELETE FROM articulos_x_temp WHERE suc = '$suc' AND estante ='$estante' AND temporada = '$temporada' AND fila = $fila AND col = $col and codigo = '$codigo'";
    $db->Query($del);
    echo "Ok";
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

function getResumenArticulosXEstante(){
    $suc = $_POST['suc'];     
    $estante = $_POST['estante'];     
    $sql = "SELECT a.codigo,a.descrip,SUM(s.cantidad) AS stock, a.um,COUNT(*) AS Piezas FROM articulos a, reg_ubic r, stock s 
    WHERE a.codigo = r.codigo AND r.codigo = s.codigo AND r.suc = s.suc AND r.codigo = a.codigo AND s.suc = '$suc' AND r.nombre ='$estante' GROUP BY a.codigo ORDER BY descrip ASC, s.cantidad DESC, a.um";
    echo json_encode(getResultArray($sql));
}

function getResumenXTemporadaYEstante(){
    $suc = $_POST['suc'];     
    $estante = $_POST['estante'];
    $temporada = $_POST['temporada'];     
    $sql = "SELECT DISTINCT(codigo) as ItemCode,SUM(capacidad) AS Mts,SUM(piezas) AS Piezas FROM temporadas p, articulos_x_temp t WHERE p.suc = t.suc AND p.temporada = t.temporada AND  t.estante = p.estante AND t.suc = '$suc' AND p.estante = '$estante' AND t.temporada = $temporada GROUP BY codigo";
    $arr = getResultArray($sql);
    echo json_encode($arr);
}
function getCuadrantesOcupadosXCodigo(){
    $suc = $_POST['suc'];     
    $estante = $_POST['estante'];
    $codigo = $_POST['codigo'];  
    $sql = "SELECT DISTINCT CONCAT( nombre,'_',  fila,'_', col) AS Cuadrante FROM reg_ubic WHERE nombre = '$estante' AND suc = '$suc' AND codigo = '$codigo'";
    echo json_encode(getResultArray($sql));
}

function getCuadrantesOcupadosXCodigoYtemporada(){
    $suc = $_POST['suc'];     
    $estante = $_POST['estante'];
    $codigo = $_POST['codigo'];  
    $temporada = $_POST['temporada'];     
    $sql = "SELECT CONCAT(t.estante,'_',t.fila,'_',t.col) AS Cuadrante FROM temporadas p, articulos_x_temp t 
    WHERE p.suc = t.suc AND p.temporada = t.temporada AND  t.estante = p.estante AND t.suc = '$suc' AND p.estante = '$estante' AND t.temporada = $temporada AND codigo = '$codigo'";
    echo json_encode(getResultArray($sql));
}
function definicionesPendientes(){
    $suc = $_POST['suc'];     
    $estante = $_POST['estante'];
    $codigo = $_POST['codigo'];  
    $temporada = $_POST['temporada'];     
    $sql = "SELECT CONCAT(t.estante,'_',t.fila,'_',t.col) AS Cuadrante FROM temporadas p, articulos_x_temp t 
    WHERE p.suc = t.suc AND p.temporada = t.temporada AND  t.estante = p.estante AND t.suc = '$suc' AND p.estante = '$estante' AND t.temporada = $temporada AND capacidad > 0 ";
    echo json_encode(getResultArray($sql));
}

function getNombresDeArticulos(){
    $codigos = $_POST['codigos'];   
    echo json_encode(getResultArray("SELECT codigo,descrip FROM articulos WHERE codigo in($codigos)"));
}

function getArticulosDisponiblesDeposito(){
    $codigo = $_POST['codigo'];  
    $suc = $_POST['suc'];  
    // Buscar politica
    $f = new Functions();
    $pol = $f->getResultArray("SELECT  politica FROM  politica_cortes  WHERE  suc = '$suc' AND  codigo ='$codigo'");
    
    $politica = $pol[0]['politica'];
    if($politica == ""){
        $politica = 20;
    }
      
    $sql = "SELECT l.lote,p.nombre_color AS color,l.design, s.cantidad AS stock,l.img, $politica AS pol FROM articulos a INNER JOIN lotes l ON a.codigo = l.codigo INNER JOIN  pantone p ON l.pantone = p.pantone 
    INNER JOIN stock s ON l.codigo = s.codigo AND l.lote = s.lote AND s.suc ='$suc' AND a.codigo ='$codigo' AND s.cantidad > 5 AND s.estado_venta <> 'FP' ORDER BY stock DESC limit 100";
    
    
    $array = $f->getResultArray( $sql );
    $aux = array();
    $lotes = "";
    foreach ($array as $key => $value) {
        $lote = $value['Lote'];        
        $lotes.="'$lote',";
        
        //echo $key."<br>";
    }
    $lotes = substr($lotes,0, -1);
    
      
    if(sizeof($array) > 1){
      
    
    $criterio = "d. lote in($lotes)";
    
    $pedido = "SELECT 'Pedido' AS doc,p.n_nro,lote, suc, CONCAT('Cant.: ',d.cantidad,' ', d.obs) AS obs FROM pedido_traslado p INNER JOIN pedido_tras_det d USING(n_nro) WHERE $criterio  AND(p.estado = 'Abierta' OR d.estado='Pendiente')"; 
    $remision = "SELECT 'Remision' AS doc,r.n_nro,lote,suc_d AS suc, r.obs AS obs FROM nota_remision r INNER JOIN nota_rem_det d USING(n_nro) WHERE $criterio AND r.estado <> 'Cerrada'";    
    $ventas = "SELECT 'Venta' AS doc,f.f_nro AS n_nro,lote,suc,'' AS obs  FROM factura_venta f INNER JOIN fact_vent_det d USING(f_nro) WHERE  $criterio AND f.estado <> 'Cerrada'";
    
    $db = new My();    
    $db->Query("$pedido union $remision union $ventas");
    
   // echo "$pedido union $remision union $ventas";  die();
     
    while($db->NextRecord()){
        $doc = $db->Record['doc'];    
        $n_nro = $db->Record['n_nro'];  
        $lote_in_doc = $db->Record['lote']; 
        $suc_ = $db->Record['suc'];  
        foreach ($array as $key => $value) {
           $lote = $value['Lote'];
           
           if($lote == $lote_in_doc){ // echo $lote;
               $arr =$array[$key]; 
                
               $arr['doc'] = $doc;
               $arr['nro_doc'] = $n_nro;
               $arr['suc'] = $suc_;
               $array[$key] = $arr;
           }
        }
    }    
    } 
      echo json_encode($array); 
}

function remitir(){
    $codigo = $_POST['codigo'];  
    $suc = $_POST['suc'];  
    $cantidad = $_POST['cantidad'];  
    // Buscar politica
    $f = new Functions();
    
    $sql = "SELECT l.lote,p.nombre_color AS color,l.design, s.cantidad AS stock,l.img, $politica AS pol FROM articulos a INNER JOIN lotes l ON a.codigo = l.codigo INNER JOIN  pantone p ON l.pantone = p.pantone 
    INNER JOIN stock s ON l.codigo = s.codigo AND l.lote = s.lote AND s.suc ='$suc' AND a.codigo ='$codigo' AND s.cantidad > 2 AND s.estado_venta <> 'FP' ORDER BY color asc, stock DESC limit 100";
    
    $array = $f->getResultArray( $sql );
    $aux = array();
    $lotes = "";
    foreach ($array as $key => $value) {
        $lote = $value['Lote'];        
        $lotes.="'$lote',";
        
        //echo $key."<br>";
    }
    $lotes = substr($lotes,0, -1);
    
    $criterio = "d. lote in($lotes)";
    
    $pedido = "SELECT 'Pedido' AS doc,p.n_nro,lote, suc, CONCAT('Cant.: ',d.cantidad,' ', d.obs) AS obs FROM pedido_traslado p INNER JOIN pedido_tras_det d USING(n_nro) WHERE $criterio  AND(p.estado = 'Abierta' OR d.estado='Pendiente')"; 
    $remision = "SELECT 'Remision' AS doc,r.n_nro,lote,suc_d AS suc, r.obs AS obs FROM nota_remision r INNER JOIN nota_rem_det d USING(n_nro) WHERE $criterio AND r.estado <> 'Cerrada'";    
    $ventas = "SELECT 'Venta' AS doc,f.f_nro AS n_nro,lote,suc,'' AS obs  FROM factura_venta f INNER JOIN fact_vent_det d USING(f_nro) WHERE  $criterio AND f.estado <> 'Cerrada'";
    
    $db = new My();    
    $db->Query("$pedido union $remision union $ventas");
    
    
    
    while($db->NextRecord()){
        $doc = $db->Record['doc'];    
        $n_nro = $db->Record['n_nro'];  
        $lote_in_doc = $db->Record['lote']; 
        $suc_ = $db->Record['suc'];  
        foreach ($array as $key => $value) {
           $lote = $value['Lote'];
           
           if($lote == $lote_in_doc){   echo $lote;
               $arr =$array[$key]; 
                
               $arr['doc'] = $doc;
               $arr['nro_doc'] = $n_nro;
               $arr['suc'] = $suc_;
               $array[$key] = $arr;
           }
        }
    } 
    
    echo json_encode($array); 
}

function remitirLotes(){
    $db = new My();
    $codigo = $_POST['codigo'];  
    $lotes = json_decode($_POST['lotes']);  
    $suc = $_POST['suc'];     
    $usuario = $_POST['usuario']; 
    $suc_d = $_POST['destino'];
    
    $sql = "SELECT n_nro FROM nota_remision WHERE suc = '$suc' and suc_d = '$suc_d' and usuario = '$usuario' ORDER BY n_nro DESC limit 1";
    
    $db->Query($sql);
    $nro_remito = 0;
    if($db->NumRows() > 0){
        $db->NextRecord();
        $nro_remito = $db->Record['n_nro'];
    }else{
        $db->Query("INSERT INTO nota_remision( fecha, hora, usuario, recepcionista, suc, suc_d, fecha_cierre, hora_cierre, obs, estado, e_sap)
        VALUES ( CURRENT_DATE, CURRENT_TIME, '$usuario', '', '$suc', '$suc_d', '', '', 'Sobrante por cambio de temporada', 'Abierta', 0);");
        
        $db->Query($sql);
        $db->NextRecord();
        $nro_remito = $db->Record['n_nro'];
    }
    $link = new My();
    
    $estado = getEstadoLotes($lotes);
      
    foreach ($lotes as $lote) {
         
        $link->Query("SELECT a.um,l.tara,l.gramaje,l.ancho,  s.cantidad AS stock,l.img ,CONCAT( a.descrip,'-',p.nombre_color) AS descrip 
        FROM articulos a INNER JOIN lotes l ON a.codigo = l.codigo INNER JOIN  pantone p ON l.pantone = p.pantone 
        INNER JOIN stock s ON l.codigo = s.codigo AND l.lote = s.lote AND s.suc ='$suc' AND a.codigo ='$codigo' AND s.cantidad > 0 AND s.estado_venta <> 'FP' AND l.lote = '$lote'");
        
        $link->NextRecord();
        $um = $link->Record['um'];
        
        $tara = $link->Record['tara'];
        $gramaje = $link->Record['gramaje'];
        $ancho = $link->Record['ancho'];
        $cantidad = $link->Record['stock'];
        $descrip = ucfirst(strtolower($link->Record['descrip']));
        $kg_env = (($gramaje * $cantidad * $ancho  ) / 1000) + ($tara / 1000); // Kg Bruto
        $cant_calc = $cantidad;
        if ($um == "") {
            $um = "Mts";
        }
        if ($tara == null) {
            $tara = 0;
        }
        
        $Kg_desc = $link->Record['Kg_desc'];
        
        // Buscar Cantidad Inicial Requerida para Porcentaje de Tolerancia en Remisiones
        //$link->Query("select top 1 Quantity as CantCompra from IBT1 where ItemCode = '$codigo' and BatchNum = '$lote'  and (BaseType = '20' or BaseType = '59') AND WhsCode = '$suc' order by DocDate asc"); // 20 Entrada de Mercaderias, 59 Entrada Ajuste + o Fraccionamiento 
        $link->Query("SELECT cantidad AS CantCompra,ROUND(((gramaje * cantidad * ancho  ) / 1000) + (tara / 1000),3) AS kg_ent FROM historial WHERE  codigo = '$codigo' AND lote = '$lote' AND suc = '$suc' LIMIT 1");  
        $cant_compra = 0;
        if ($link->NumRows() > 0) {
            $link->NextRecord();
            $cant_compra = (strlen(trim($link->Record['CantCompra'])) > 0) ? $link->Record['CantCompra'] : 0;
            $Kg_desc = $link->Record['Kg_desc'];
        } 
        
        if(!in_array($lote,$estado) ){
           $db->Query("insert into nota_rem_det( n_nro, codigo, lote, um_prod, descrip, cantidad,cant_inicial,gramaje,ancho, kg_env, kg_rec, cant_calc_env, cant_calc_rec, tara, procesado,tipo_control,kg_desc, estado, e_sap, usuario_ins,fecha_ins)
           values ($nro_remito, '$codigo', '$lote', '$um', '$descrip', $cantidad,$cant_compra,$gramaje,$ancho,$kg_env, 0, $cant_calc, 0, $tara,0,'Pieza',$Kg_desc, 'Pendiente', 0,'$usuario',CURRENT_TIMESTAMP);");  
        }        
    }
    echo json_encode($estado); // Lotes no insertados
}

function generarPedidoLotes(){
    $db = new My();
    $my = new My();
    $codigo = $_POST['codigo'];  
    $lotes = json_decode($_POST['lotes']);  
    $cantidades = json_decode($_POST['cant_pedir']);  
    $suc = $_POST['suc'];     
    $usuario = $_POST['usuario']; 
    $suc_d = $_POST['destino'];
    
    $f = new Functions(); 
    
     
    $cat = 1;
    $NroPedido = 0;
    $my = new My();
    
    $ultima = "SELECT n_nro as Nro,usuario as Usuario,date_format(fecha,'%d-%m-%Y') as Fecha,cod_cli, cliente,estado as Estado,suc as Origen,suc_d as Destino FROM pedido_traslado where usuario = '$usuario' and suc = '$suc' and suc_d = '$suc_d' and estado = 'Abierta' order by n_nro desc limit 1";
     
    $my->Query($ultima);
    if($my->NumRows()>0){
        $my->NextRecord();
        $NroPedido = $my->Record['Nro']; 
    }else{    
        $sql = "INSERT INTO pedido_traslado(cod_cli, cliente, usuario, fecha, hora, total, estado, suc, suc_d, fecha_cierre, hora_cierre, e_sap,cat,tipo)
        VALUES ( '80001404-9', 'CORPORACION TEXTIL S.A', '$usuario', CURRENT_DATE, CURRENT_TIME, 0, 'Abierta', '$suc', '$suc_d', NULL, NULL, 0,$cat,'Tejidos');";

        $my->Query($sql);
        
        $my->Query($ultima);
        $my->NextRecord();
        $NroPedido = $my->Record['Nro'];         
    }
    
    // Verifico si no esta en Pedidos Remisiones o Ventas
    $estado = getEstadoLotes($lotes);
    
    $i = 0;
    foreach ($lotes as $lote) {
       $cant_pedir = $cantidades[$i];
       if(!in_array($lote,$estado) ){
           
           $arr = $f->getResultArray("SELECT a.costo_prom, a.um,l.tara,l.gramaje,l.ancho,  s.cantidad AS stock,l.img ,  a.descrip p.nombre_color as color
           FROM articulos a INNER JOIN lotes l ON a.codigo = l.codigo INNER JOIN  pantone p ON l.pantone = p.pantone 
           INNER JOIN stock s ON l.codigo = s.codigo AND l.lote = s.lote AND s.suc ='$suc_d' AND a.codigo ='$codigo' AND s.cantidad > 0 AND s.estado_venta <> 'FP' AND l.lote = '$lote';");

          
           $PrecioCosto = $arr[0]['costo_prom'];
           $descrip = $arr[0]['descrip'];
           $um_prod = $arr[0]['um'];
           $color = $arr[0]['color'];

           $msu = $f->getResultArray(" SELECT CONCAT( nombre,'-', fila,'-', col) AS U_ubic, CONCAT( nombre, col) AS Nodo  FROM   reg_ubic  WHERE   codigo = '$codigo' AND  lote = '$lote' AND  suc = '$suc_d';");


           $ubic = $msu[0]['U_ubic'];
           $nodo = $msu[0]['Nodo'];

           $det = "INSERT INTO pedido_tras_det(n_nro, codigo, lote, um_prod, descrip, cantidad, precio_venta, color, estado, mayorista, urge, obs, lote_rem, ubic, nodo, e_sap)
           VALUES ( $NroPedido, '$codigo', '$lote', '$um_prod', '$descrip - $color', $cant_pedir, '$PrecioCosto', '$color', 'Pendiente', 'No', 'No', 'Reposicion por Cambio de Temporada', '', '$ubic', '$nodo', 0);";

           $db->Query($det);               
       }
       $i++;
    }       
    echo json_encode($estado); // Lotes no insertados
}

function getEstadoLotes($array){
    $db = new My();   
    
    $lotes = "";
    foreach ($array as $key => $value) {
        $lote = $value;        
        $lotes.="'$lote',";     
    }
    $lotes = substr($lotes,0, -1);
    
    $criterio = "d. lote in($lotes)";
            
    $pedido = "SELECT 'Pedido' AS doc,p.n_nro,lote, suc, CONCAT('Cant.: ',d.cantidad,' ', d.obs) AS obs FROM pedido_traslado p INNER JOIN pedido_tras_det d USING(n_nro) WHERE $criterio  AND(p.estado = 'Abierta' OR d.estado='Pendiente')"; 
    $remision = "SELECT 'Remision' AS doc,r.n_nro,lote,suc_d AS suc, r.obs AS obs FROM nota_remision r INNER JOIN nota_rem_det d USING(n_nro) WHERE $criterio AND r.estado <> 'Cerrada'";    
    $ventas = "SELECT 'Venta' AS doc,f.f_nro AS n_nro,lote,suc,'' AS obs  FROM factura_venta f INNER JOIN fact_vent_det d USING(f_nro) WHERE  $criterio AND f.estado <> 'Cerrada'";
     
     
    $db->Query("$pedido union $remision union $ventas");
    $aux = array();
    while($db->NextRecord()){
        /*$doc = $db->Record['doc'];    
         $n_nro = $db->Record['n_nro'];  
         * $suc_ = $db->Record['suc']; 
         */
        $lote_in_doc = $db->Record['lote'];         
        array_push($aux, $lote_in_doc);
    }     
    return $aux;
}

function clonarTemporada(){
    $db = new My(); 
    $db2 = new My(); 
    $suc = $_POST['suc'];
    $usuario = $_POST['usuario']; 
    $ids = json_decode($_POST['cuadrantes']);  
    $temp_de = $_POST['temp_de'];
    $temp_a = $_POST['temp_a'];
    
    $result = array();
    
    foreach ($ids as $id) {
        $a = explode("_",$id);
        $estante = $a[0];
        $fila =  $a[1];
        $col =  $a[2];
        
        //echo "Cuadrante: $estante $fila $col<br>";
        
        // Primero obtengo la definicion del cuadrante actual de la temporada de
        $getDef = "SELECT codigo,um,piezas,capacidad FROM articulos_x_temp WHERE suc = '$suc' AND estante = '$estante' AND fila = $fila AND col = $col AND temporada = $temp_de; ";
        //echo $getDef."<br>";
        
        $db->Query($getDef);
        if($db->NumRows() > 0){
            while($db->NextRecord()){
                $codigo = $db->Record['codigo'];
                $um = $db->Record['um'];
                $piezas = $db->Record['piezas'];
                $capacidad = $db->Record['capacidad'];

                //echo "Codigo : $codigo $piezas $capacidad<br>";
                
                // Ver si el cuadrante a copiar ya contiene
                $cons = "SELECT COUNT(*) as def FROM articulos_x_temp WHERE suc = '$suc' AND estante = '$estante' AND fila = $fila AND col = $col and codigo = '$codigo' AND temporada = $temp_a;";
                $db2->Query($cons);
                $db2->NextRecord();
                $def = $db2->Record['def'];
                if($def > 0){    // Update
                    $upd = "UPDATE articulos_x_temp SET codigo = '$codigo', capacidad = $capacidad, um = '$um', piezas = $piezas WHERE  suc = '$suc' AND estante = '$estante' AND fila = $fila AND col = $col and codigo = '$codigo' AND temporada = $temp_a";
                    $db2->Query($upd);
                    array_push($result,array("cuadrante"=>"$estante.$fila.$col","estado"=>"Definicion Actualizada"));
                }else{// Insert
                    $ins = "INSERT INTO  articulos_x_temp(suc, estante, temporada, codigo, fila, col, um, capacidad, piezas, usuario, fecha)
                    VALUES ('$suc', '$estante', '$temp_a', '$codigo', $fila, $col, '$um', $capacidad, $piezas, '$usuario', CURRENT_TIMESTAMP );";
                    $db2->Query($ins);
                    array_push($result,array("cuadrante"=>"$estante.$fila.$col","estado"=>"Definicion Copiada"));
                }            
            }
        }else{
            array_push($result,array("cuadrante"=>"$estante.$fila.$col","estado"=>"No hay definiciones para copiar"));
        }
    }
    echo json_encode($result);
}


new Estantes();
 

?>


