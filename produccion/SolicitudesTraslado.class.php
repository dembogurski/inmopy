<?php

/**
 * Description of SolicitudesTraslado
 * @author Ing.Douglas
 * @date 16/12/2015
 */
require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");
require_once("../Config.class.php");

class SolicitudesTraslado {

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
        $suc_ = $_REQUEST['suc'];
        $mobile = $_REQUEST['mobile'];
        $tipo_filtro = $_REQUEST['tipo_filtro'];  
        
        //$tipo_busqueda = $_POST['tipo_busqueda'];
        $tipo_busqueda = "tejidos";
        $filtro_tipo = "AND p.tipo LIKE '$tipo_busqueda'";  // tejidos o insumos
        
        $t = new Y_Template("SolicitudesTraslado.html");
        $t->Show("header");
        $t->Set("destino", $suc_);


        $hoy = date("d-m-Y");
        $fecha_nota_antigua = date("d-m-Y");
        $date = new DateTime('-5 day');
        $fecha_ini = $date->format('d-m-Y');
        $t->Set("hoy", $hoy);
 
        
        // Sucursales
        $my = new My();


        $sql = "SELECT suc,nombre FROM sucursales WHERE tipo != 'Sub-Deposito' order by  suc asc";
        $my->Query($sql);


        while ($my->NextRecord()) {
            $suc = $my->Record['suc'];
            $nombre = $my->Record['nombre'];
            $sucs.="<option value=" . $suc . ">" . $suc . " - " . $nombre . "</option>";
        }
        $t->Set("sucurs", $sucs);


        $sql = "SELECT s.suc,nombre,count(d.id_det) as Items, DATE_FORMAT(fecha_cierre,'%d-%m-%Y') AS fecha,DATE_FORMAT(fecha_cierre,'%d/%m') AS fechacorta, "
                . "SUM(  IF(   (REPLACE(SUBSTRING(ubic,3,2),'-','') < 4) AND (REPLACE(SUBSTRING(ubic,3,2),'-','') <> '')  ,1,0))  AS Hombre, SUM(IF(REPLACE(SUBSTRING(ubic,3,2),'-', '') > 3,1,0)) AS Picker, SUM(IF(d.ubic IS NULL, 1,0)) AS Indef  "
                . "FROM sucursales s,pedido_traslado p, pedido_tras_det d where p.n_nro = d.n_nro and  s.suc = p.suc and   p.suc_d = '$suc_' and d.estado = 'Pendiente' and p.estado = 'Pendiente' $filtro_tipo GROUP BY s.suc order by  s.suc asc ";
        
        //echo $sql;
        $my->Query($sql);
        $sucs = "";
        while ($my->NextRecord()) {
            $suc = $my->Record['suc'];
            $nombre = $my->Record['nombre'];
            $items = $my->Record['Items'];
            $fecha = $my->Record['fecha'];
            $fechacorta = $my->Record['fechacorta'];
            $Hombre = $my->Record['Hombre'];
            $Picker = $my->Record['Picker'];
            $Indef = $my->Record['Indef'];


            $nom = 'Item';
            if ($items > 1) {
                $nom = 'Items';
            }
            if (strtotime($fecha) < strtotime($fecha_nota_antigua)) {
                $fecha_nota_antigua = $fecha;
                $fecha_ini = $fecha;
            }

            $sucs.="<option value=" . $suc . " style='letter-spacing:2;text-align: center'> $suc &nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;[$fechacorta]&nbsp;&nbsp;&nbsp;&nbsp; $Hombre &nbsp;&nbsp;|&nbsp;&nbsp; $Picker &nbsp;&nbsp;|&nbsp;&nbsp; $Indef</option>";
            /*if ($mobile != "true") {
                $sucs.="<option value=" . $suc . ">" . $suc . "&nbsp;- $nombre &nbsp;&nbsp;   $items $nom  &nbsp;&nbsp;  [$fecha]</option>";
            } else {
                $sucs.="<option value=" . $suc . " style='letter-spacing:2;text-align: center'> $suc.&nbsp;-&nbsp;[$fechacorta]&nbsp; $Hombre | $Picker | $Indef</option>";
            }*/
        }
        $t->Set("fecha_ini", $fecha_ini);
        $t->Set("sucursales", $sucs);

        if ($mobile != "true") {
            $t->Show("body");
        } else {
            $c = new Config();
            $host = $c->getNasHost();
            $path = $c->getNasFolder();
            $images_url = "http://$host/$path";
            $t->Set("images_url", $images_url);
            $t->Show("mobile");
        }
    } 
}

function getPedidosFiltrados(){
    $origen = $_POST['origen'];
    $destino = $_POST['destino'];
    $nivel = $_POST['nivel']; 
    $desde =$_POST['desde'];
    $hasta =$_POST['hasta'];
    $hora = $_REQUEST['hora'];
    $tipo_busqueda = $_POST['tipo_busqueda'];
    
    $urge =$_POST['urge'];
    $mayorista =$_POST['mayorista'];
    if(!isset($_POST['urge'])){
        $urge = '%';
    }
    
    if(!isset($_POST['mayorista'])){
        $mayorista = '%';
    }
    
    $filtro_tipo = "AND p.tipo LIKE '$tipo_busqueda'";  // tejidos o insumos
        
    $fila = " > 3";

    if ($nivel == "Hombre") {
        $fila = " REPLACE(SUBSTRING(ubic,3,2),'-','') < 4  AND ubic <> '' ";
    } else if ($nivel == "Picker") {
       $fila = " REPLACE(SUBSTRING(ubic,3,2),'-','') > 3 ";
    } else if($nivel == "Sin Ubic") {
        $fila = " (d.ubic = '' or d.ubic is null ) ";
    }else{
        $fila = " (d.ubic = '' or d.ubic is null   or  REPLACE(SUBSTRING(ubic,3,2),'-','') > 0  )";
    }
    
    
      
    $sql = "SELECT s.suc,nombre,COUNT(d.id_det) AS Items, DATE_FORMAT(fecha_cierre,'%d-%m-%Y') AS fecha   
                FROM sucursales s,pedido_traslado p, pedido_tras_det d WHERE p.n_nro = d.n_nro AND  s.suc = p.suc AND p.suc like '$origen' AND  p.suc_d = '$destino' AND d.estado = 'Pendiente' AND p.estado not in('Abierta','Req.Auth') and  d.estado = 'Pendiente' 
                AND $fila  AND STR_TO_DATE(CONCAT(p.fecha_cierre,' ',hora_cierre),'%Y-%m-%d %H:%i:%s') between '$desde 00:00:00' and '$hasta $hora'  AND mayorista LIKE '$mayorista' AND urge LIKE '$urge'  $filtro_tipo
                GROUP BY s.suc ORDER BY  s.suc ASC ";
    
    //echo $sql;          
    
    echo json_encode(getResultArray($sql));
}

 

function getResultArray($sql) {
    $db = new My();
    $array = array();
    $db->Query($sql);
    while ($db->NextRecord()) {
        array_push($array, $db->Record);
    }
    return $array;
}

function getRutaMasCorta() {
    
    require_once("../utils/Disjktra.class.php");

    $origen = $_POST['origen'];
    $destino = $_POST['destino'];

    $db = new My();
    $db->Query("SELECT nodo,adya,costo FROM lista_adyacencias WHERE suc = '00'");
    $graph_array = array();
    while ($db->NextRecord()) {
        $nodo = $db->Record['nodo'];
        $adya = $db->Record['adya'];
        $costo = $db->Record['costo'];
        $arr = array($nodo, $adya, $costo);
        array_push($graph_array, $arr);
    }

    $dj = new Disjktra();
    $path = $dj->dijkstra($graph_array, $origen, $destino);

    echo "Ruta: " . implode(", ", $path) . "\n";
    
}
  

function getRemitosAbiertos() {
    $suc = $_REQUEST['suc'];
    $suc_d = $_REQUEST['suc_d'];
    $db = new My();

    $db->Query("SELECT n.n_nro,suc,suc_d,DATE_FORMAT(n.fecha,'%d-%m-%Y') AS fecha, usuario, COUNT(d.lote) AS items FROM nota_remision n left JOIN nota_rem_det d ON n.n_nro = d.n_nro  WHERE  suc = '$suc' and suc_d = '$suc_d' AND n.estado = 'Abierta' and d.codigo not like 'IN%' GROUP BY n.n_nro limit 5");

    echo"<table border='1' id='tabla_remisiones' style='border:1px solid gray;border-collapse: collapse;background: white; width:98%;margin:10% auto'> 
         <tr><th colspan='6' style='text-align: center;background-color: #2c3e50;color:white;height: 26px;letter-spacing:2px;font-size: 16px'>Remisiones Abiertas</th></tr>
         <tr class='titulo'><th>N&deg;</th><th>Usuario</th><th>Lotes</th><th>&nbsp;</th></tr>";

    while ($db->NextRecord()) {
        $nro = $db->Record['n_nro'];
        $origen = $db->Record['suc'];
        $destino = $db->Record['suc_d'];
        $fecha = $db->Record['fecha'];
        $usuario = $db->Record['usuario'];
        $items = $db->Record['items'];
        if ($nro != null) {
            echo "<tr><td class='itemc' style='height:42px' >$nro</td><td  class='itemc'>$usuario</td><td class='itemc items_$nro'>$items</td>"
            . "<td class='itemc btn_$nro'><input type='button' class='insertar' value='Insertar aqu&iacute;' onclick='insertarAqui($nro)' style='height: 24px;font-size: 10px;font-weight: bold' ></td>"
            . "</tr>";
        } else {
            echo "<tr><td class='itemc' colspan='4'>No hay remisiones Abiertas a $suc_d</td></tr>";
        }
    }
    echo "<tr style='border-width:1 0 1 1'><td class='itemc' ><img src='img/arrow-up.png' onclick='minimizar()' title='Minimizar' style='cursor:pointer'></td> "
    . " <td class='itemc' colspan='3'><input type='button' value='Generar Nota Remision de: $suc a $suc_d' onclick=generarRemito('$suc','$suc_d')></td></tr>";

    echo "</table>";
}

function generarRemito() {
    $usuario = $_POST['usuario'];
    $suc = $_POST['origen'];
    $suc_d = $_POST['destino'];
    $db = new My();
    $db->Query("INSERT INTO nota_remision( fecha, hora, usuario, recepcionista, suc, suc_d, fecha_cierre, hora_cierre, obs, estado, e_sap)
                VALUES ( CURRENT_DATE, CURRENT_TIME, '$usuario', '', '$suc', '$suc_d', '', '', '', 'Abierta', 0);");

    $db->Query("SELECT n_nro FROM nota_remision WHERE suc = '$suc' and suc_d = '$suc_d' ORDER BY n_nro DESC limit 1");
    $db->NextRecord();
    $nro = $db->Record['n_nro'];
    echo $nro;
}
 
function verificarLoteEnRemito($n_nro, $lote) {
    $db = new My();
    $db->Query("SELECT COUNT(*) AS cant FROM nota_rem_det WHERE n_nro = $n_nro AND lote = '$lote'");
    $db->NextRecord();
    $cant = $db->Record['cant'];
    return $cant;
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

function getHorasCierrePedidos(){
    $suc = $_REQUEST['suc'];
    require_once("../Functions.class.php");
    $f = new Functions();
    echo json_encode($f->getResultArray("SELECT identif,hora FROM cierre_pedidos WHERE suc = '$suc' order by hora asc"));
}

new SolicitudesTraslado();
?>

