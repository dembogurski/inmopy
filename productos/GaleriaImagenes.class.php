<?php

require_once("../Y_Template.class.php");
require_once("../Config.class.php");
require_once("../Y_DB_MySQL.class.php");
require_once("../Functions.class.php");

/**
 * Description of Galeria
 *
 * @author Doglas
 */
class GaleriaImagenes {
   function __construct(){
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }         
   }
   function main(){
        $t = new Y_Template("GaleriaImagenes.html");        
         
        $c = new Config();
        $host = $c->getNasHost();
        $path = $c->getNasFolder();
        $images_url = "http://$host/$path";
        $t->Set("images_url", $images_url);
        
        $usuario = $_REQUEST['usuario'];
        
        $my = new My();
        $sql = "SELECT suc,nombre FROM sucursales WHERE estado  = 'Activo'  ORDER BY suc ASC";
        $my->Query($sql);
        $sucs = "";
        while ($my->NextRecord()) {
            $suc = $my->Record['suc'];
            $nombre = $my->Record['nombre'];
            $sucs.="<option value=" . $suc . ">" . $suc . "</option>";
        }
        $t->Set("sucursales", $sucs);
        
        $t->Show("headers");
        $t->Show("images_container_init");
        $t->Show("filtro_articulos");
        $t->Show("galeria");
   }    
}
 

function buscarEstadoVenta(){
    $codigo = $_REQUEST['codigo'];
    $term = $_REQUEST['term'];
    $cantidad = $_REQUEST['cantidad'];
    if($term == "%"){$term = "";}
    $f = new Functions();
    $sql = "SELECT DISTINCT estado_venta FROM stock s WHERE codigo = '$codigo' AND s.cantidad > $cantidad AND s.lote LIKE '%$term' ORDER BY estado_venta ASC";
    echo json_encode($f->getResultArray($sql));    
}

function buscarSucursales(){
    $codigo = $_REQUEST['codigo'];
    $term = $_REQUEST['term'];
    $cantidad = $_REQUEST['cantidad'];
    $estado_venta = $_REQUEST['estado_venta'];
    $filtro_estado = " and s.estado_venta like '$estado_venta'";
    if($estado_venta == "*-FP"){
        $filtro_estado = " and s.estado_venta <> 'FP'";
    } 
    if($term == "%"){$term = "";}
    $f = new Functions();
    $sql = "SELECT s.suc,COUNT(s.lote) AS piezas, SUM(cantidad) AS total  FROM lotes l, stock s WHERE l.codigo = s.codigo AND l.lote = s.lote AND l.codigo = '$codigo' AND s.cantidad > $cantidad AND l.lote LIKE '%$term' $filtro_estado GROUP BY suc ";
    echo json_encode($f->getResultArray($sql));    
}

function buscarDesigns(){
    $codigo = $_REQUEST['codigo'];
    $term = $_REQUEST['term'];
    $cantidad = $_REQUEST['cantidad'];
    $suc = $_REQUEST['suc'];
    $estado_venta = $_REQUEST['estado_venta'];
    $filtro_estado = " and s.estado_venta like '$estado_venta'";
    if($estado_venta == "*-FP"){
        $filtro_estado = " and s.estado_venta <> 'FP'";     
    } 
    if($term == "%"){$term = "";}
    $f = new Functions();
    $sql = "SELECT DISTINCT l.design  FROM lotes l, stock s WHERE l.codigo = s.codigo AND l.lote = s.lote AND l.codigo = '$codigo' AND s.cantidad > $cantidad AND l.lote LIKE '%$term' AND s.suc LIKE '$suc' $filtro_estado ORDER BY l.design ASC ";
    echo json_encode($f->getResultArray($sql));    
}
function buscarColores(){
    $codigo = $_REQUEST['codigo'];
    $term = $_REQUEST['term'];
    $cantidad = $_REQUEST['cantidad'];
    $suc = $_REQUEST['suc'];
    $design = $_REQUEST['design'];
    $estado_venta = $_REQUEST['estado_venta'];
    $filtro_estado = " and s.estado_venta like '$estado_venta'";
    if($estado_venta == "*-FP"){
        $filtro_estado = " and s.estado_venta <> 'FP'";
    }
    if($term == "%"){$term = "";}
    $f = new Functions();
    $sql = "SELECT l.pantone,p.nombre_color AS color ,COUNT(s.lote) AS piezas, SUM(cantidad) AS total  FROM lotes l, stock s, pantone p WHERE l.pantone = p.pantone AND
    l.codigo = s.codigo AND l.lote = s.lote AND l.codigo = '$codigo' AND s.cantidad > $cantidad AND l.lote LIKE '%$term' AND l.design LIKE '$design' AND s.suc LIKE '$suc' $filtro_estado GROUP BY l.pantone ORDER BY color ASC ";
    echo json_encode($f->getResultArray($sql));    
}
function galeria(){
    $codigo = $_REQUEST['codigo'];
    $term = $_REQUEST['term'];
    $cantidad = $_REQUEST['cantidad'];
    $suc = $_REQUEST['suc'];
    $design = $_REQUEST['design'];
    $pantone = $_REQUEST['pantone'];
    $estado_venta = $_REQUEST['estado_venta'];
    $filtro_estado = " and s.estado_venta like '$estado_venta'";
    if($estado_venta == "*-FP"){
        $filtro_estado = " and s.estado_venta <> 'FP'";     
    } 
    if($term == "%"){$term = "";}
    $f = new Functions();
    $sql = "SELECT a.codigo,sec.descrip as sector,a.descrip, l.pantone,p.nombre_color AS color ,sum(if(padre <> '' ,1,0)) AS piezas,SUM(IF(padre = '' ,1,0)) AS rollos, SUM(cantidad) AS total, l.img FROM articulos a,sectores sec, lotes l, stock s, pantone p WHERE a.codigo = l.codigo and a.cod_sector = sec.cod_sector and l.pantone = p.pantone AND
    l.codigo = s.codigo AND l.lote = s.lote AND l.codigo = '$codigo' AND s.cantidad > $cantidad AND l.lote LIKE '%$term' AND l.design LIKE '$design' AND s.suc LIKE '$suc' and l.pantone like '$pantone'  $filtro_estado  group by l.img order by  color asc";
    //echo $sql;
    echo json_encode($f->getResultArray($sql));    
}
function buscarPiezas(){   
    $codigo = $_REQUEST['codigo'];
    $term = $_REQUEST['term'];
    $cantidad = $_REQUEST['cantidad'];
    $suc = $_REQUEST['suc'];
    $design = $_REQUEST['design'];
    $pantone = $_REQUEST['pantone'];
    $estado_venta = $_REQUEST['estado_venta'];
    $img = $_REQUEST['img'];
    $filtro_estado = " and s.estado_venta like '$estado_venta'";
    if($estado_venta == "*-FP"){
        $filtro_estado = " and s.estado_venta <> 'FP'";
    } 
    if($term == "%"){$term = "";}
    $f = new Functions();
    $sql = "SELECT a.codigo,l.lote,sec.descrip as sector,a.descrip,a.composicion, l.pantone,p.nombre_color AS color ,design,cod_catalogo, color_cod_fabric,s.suc,l.ancho,s.estado_venta,padre,gramaje, cantidad,ubicacion FROM articulos a,sectores sec, lotes l, stock s, pantone p WHERE a.codigo = l.codigo and a.cod_sector = sec.cod_sector and l.pantone = p.pantone AND
    l.codigo = s.codigo AND l.lote = s.lote AND l.codigo = '$codigo' AND s.cantidad > $cantidad AND l.lote LIKE '%$term' AND l.design LIKE '$design' AND s.suc LIKE '$suc' and l.pantone like '$pantone' and l.img = '$img'  $filtro_estado  group by l.lote  ";
    //echo $sql;
    echo json_encode($f->getResultArray($sql));        
}

function showImageData(){
    $t = new Y_Template("GaleriaImagenes.html");        
    //$t->Show("headers");
    $c = new Config();
    $host = $c->getNasHost();
    $path = $c->getNasFolder();
    $images_url = "http://$host/$path";
    $t->Set("images_url", $images_url);

    $usuario = $_REQUEST['usuario'];
    $codigo = $_REQUEST['codigo'];
    $term = $_REQUEST['term'];
    $cantidad = $_REQUEST['cantidad'];
    $suc = $_REQUEST['suc'];
    $design = $_REQUEST['design'];
    $estado_venta = $_REQUEST['estado_venta'];
    $pantone = $_REQUEST['pantone'];
    $img = $_REQUEST['img'];
    $img_width = $_REQUEST['img_width'];
    
    $t->Set("usuario",$usuario);  
    
    $img_url = "$images_url/$img.jpg";
    $t->Set("img",$img);
    $t->Set("img_url",$img_url); 
    $t->Set("img_width",$img_width); 
    
    $t->Show("image_data_header");  
    
    $t->Set("codigo",$codigo);
    
    $filtro_estado = " and s.estado_venta like '$estado_venta'";
    if($estado_venta == "*-FP"){
        $filtro_estado = " and s.estado_venta <> 'FP'";
    } 

    $my = new My();
    $sql = "SELECT a.codigo,l.lote,sec.descrip as sector,a.descrip,a.composicion, l.pantone,p.nombre_color AS color ,design,cod_catalogo, color_cod_fabric,s.suc,l.ancho,s.estado_venta,padre,gramaje, cantidad,ubicacion FROM articulos a,sectores sec, lotes l, stock s, pantone p WHERE a.codigo = l.codigo and a.cod_sector = sec.cod_sector and l.pantone = p.pantone AND
    l.codigo = s.codigo AND l.lote = s.lote AND l.codigo = '$codigo' AND s.cantidad > $cantidad AND l.lote LIKE '%$term' AND l.design LIKE '$design' AND s.suc LIKE '$suc' and l.pantone like '$pantone' and l.img = '$img'  $filtro_estado  group by l.lote  ";
    $my->Query($sql);
    $sucs = "";
    
    $row = 0;
    while ($my->NextRecord()) {
        
        $lote = $my->Record['lote'];
        $sector = $my->Record['sector'];
        $composicion = $my->Record['composicion'];
        $descrip = $my->Record['descrip'];
        $color = $my->Record['color'];
        $cod_catalogo = $my->Record['cod_catalogo'];
        $color_cod_fabric = $my->Record['color_cod_fabric'];
        $ancho = $my->Record['ancho'];
        $padre = $my->Record['padre'];
        $estado_venta = $my->Record['estado_venta'];
        $suc = $my->Record['suc'];
        $stock = $my->Record['cantidad'];
        $pantone = $my->Record['pantone'];
        $ubicacion = $my->Record['ubicacion'];
        $t->Set("sector",$sector);
        $t->Set("descrip",$descrip);
        $t->Set("composicion",$composicion);    
        $t->Set("lote",$lote);
        $t->Set("color",$color);
        $t->Set("pantone",$pantone);
        $t->Set("fab_color_cod",$cod_catalogo."-".$color_cod_fabric);
        $t->Set("ancho",number_format($ancho,2,',','.'));      
        $t->Set("padre",$padre);
        $t->Set("estado_venta",$estado_venta);
        $t->Set("suc",$suc);
        $t->Set("ubicacion",$ubicacion);
        $t->Set("stock",number_format($stock,2,',','.'));     
        if($row == 0){
            $t->Show("image_data_cab");  
        } 
        $row++; 
        
        $t->Show("image_data_data");  
    }
    $t->Show("image_data_foot");  
}

function getPrecio1(){
    $codigo = $_REQUEST['codigo'];
    $lote = $_REQUEST['lote'];
    $f = new Functions();       
    $sql = " SELECT precio, IF( descuento IS NULL,0,descuento) AS descuento, precio - IF( descuento IS NULL,0,descuento) AS precio_final
    FROM lista_prec_x_art lp  LEFT JOIN desc_lotes d  ON lp.codigo = d.codigo  AND lp.num = d.num  AND  d.lote = '$lote' WHERE lp.moneda LIKE 'G$' AND lp.codigo = '$codigo' AND lp.num = 1";        
    echo json_encode($f->getResultArray($sql));        
}

function enReservaJSON(){
    $codigo = $_REQUEST['codigo'];
    $lote = $_REQUEST['lote'];
    $f = new Functions();       
    $sql = "SELECT suc,cod_cli, cantidad,fecha,usuario, estado,obs FROM orden_procesamiento WHERE codigo = '$codigo' and lote = '$lote' ";        
    echo json_encode($f->getResultArray($sql));
}

new GaleriaImagenes();
?>
