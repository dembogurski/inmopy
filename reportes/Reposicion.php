<?PHP
require_once("../Y_DB_MySQL.class.php"); 
require_once("../Y_Template.class.php");

if (isset($_POST['action'])) {
   call_user_func($_POST['action']); 
}else {
   $t = new Y_Template('Reposicion.html');
   $suc=$_GET['suc'];
   $select_sector=$_GET['select_sector'];
   $select_articulos=$_GET['select_articulos'];
   $stockCrit_01=$_GET['stockCrit_01'];
   $val01_1=$_GET['val01_1'];
   $val01_2=$_GET['val01_2'];
   $user=$_GET['user'];
   $emp=$_GET['emp'];
   $term=$_GET['term'];  
   if($term == "" || $term == "%"){
       $term = "%";
   }else{
       $term = "%$term";
   }
   $t->Set('term',$term);
   
   $fecha = date("d/m/Y");
   $grpXCodColFab = ($_GET['grpXCodColFab'] == 'true');
   $stockCrit="";
   $gprXCCF = "";
   $CCF = "";
   $pedidos = getPedidosAbiertos($suc,$user);
   $listaPedidos = '';
   $host = $_SERVER['HTTP_HOST'] != '190.128.150.70:2222'?'192.168.2.252':'190.128.150.70:2252';
   $images_url = "http://$host/prod_images/";
   

   $t->Set('select_articulos',$select_articulos);
   
   $datos_articulo = ItemName($select_articulos);
   
   $mnj_x_lotes = $datos_articulo["mnj_x_lotes"];
   
   $t->Set('ItemName',$datos_articulo["descrip"]);
   
   $t->Show("header");
   if($stockCrit_01 == 'Entre'){
      $stockCrit=" BETWEEN $val01_1 AND $val01_2";
   }else{
      $stockCrit=" $stockCrit_01 $val01_1";
   }

   if($grpXCodColFab){
      $CCF = "CONCAT(l.cod_catalogo,'-', l.color_cod_fabric) AS fab_color_cod, ";
      $gprXCCF = ',fab_color_cod';
   }else{
      $t->Set("showCCF","style='display:none;'");
   }

   foreach($pedidos as $pedido){
      $n_nro = $pedido['n_nro'];
      $suc_d = $pedido['suc_d'];
      $listaPedidos .= "<span id='id_pedido_$n_nro' onclick='pedidoDetListar($(this))' data-nro='$n_nro' data-suc='$suc_d' class='pedido_$suc_d'>$n_nro a ($suc_d)</span>";
   }

   $ms = New My(); 
   $link1 = New My(); 
   $datos = array();
   
   $t->Set('imgURI', $images_url);
   $t->Set('emp',$emp);
   $t->Set('stockCrit',$stockCrit);
   $t->Set('fecha',$fecha);
   $t->Set('user',$user);
   $t->Set('suc',$suc);
   $t->Set('listaPedidos',$listaPedidos);
   $t->Show("bodyTop");
   $sucs = getSucs();
   $sucs_list = '';
   $sucs_list_query = '';

   $sucs_in = '';   
   $sucs_pivot = '';
   
   foreach($sucs as $suc){     
      $sucs_list .= "<th>$suc</th>";
      $sucs_list_query .= (strlen($sucs_list_query)==0)?"[$suc]":",[$suc]";
      $sucs_in .= "'$suc',";
      $sucs_pivot .= "SUM(IF(s.suc = '$suc', cantidad,0)) AS '$suc'," ;
   }
   $sucs_in = substr($sucs_in,0, -1);
   $sucs_pivot = substr($sucs_pivot,0, -1);
   
   
   
   $t->Set('sucs',$sucs_list);
   
   $t->Show("dataHeader");
 
   
   $Qry = "SELECT p.pantone,p.nombre_color AS color, $CCF $sucs_pivot "
           . "FROM lotes l INNER JOIN stock s ON l.codigo = s.codigo AND l.lote = s.lote INNER JOIN pantone p ON l.pantone = p.pantone  WHERE l.codigo ='$select_articulos' AND suc IN ($sucs_in) "
           . "AND cantidad $stockCrit AND estado_venta <> 'FP'  AND s.lote LIKE '$term' "
           . "GROUP BY p.pantone $gprXCCF ORDER BY color ASC";
   
    //echo $Qry;
   
   $ms->Query($Qry);
   
   
   
   while($ms->NextRecord()){
      $Code = $ms->Record['pantone'];
      $Name = utf8_encode($ms->Record['color']);
      $U_color_cod_fabric = $ms->Record['fab_color_cod'];
      
      $t->Set("Code",$Code);
      $t->Set("Name",$Name);
      $t->Set("U_color_cod_fabric", utf8_encode( $U_color_cod_fabric));
      
      $stockXSuc = '';
      foreach($sucs as $suc){
         $stk = $ms->Record[$suc];
         $exClass = '';
         if($stk > 0){
            $exClass = 'lotes';
         }
         $stk =  number_format($stk, 2, ',', '.');
         $stockXSuc .= "<td class='stock $exClass num'>$stk</td>";
      }
      $t->Set("stockXSuc",$stockXSuc);
      $t->Show("dataBody");
   }
   $t->Show("EndReport");
}

function getSucs(){
   $db = new My();
   $sucs = array();
   
   $db->Query("SELECT suc FROM sucursales WHERE estado ='Activo' AND suc <> '50'");
   while($db->NextRecord()){
      array_push($sucs,$db->Record['suc']);
   }
   return $sucs;
}

function listarLotes(){
   $ms = new My();
   $ItemCode = $_POST['ItemCode'];
   $suc = $_POST['suc'];
   $sucOrigen = $_POST['sucOrigen'];
   $color = $_POST['color'];
   $colorCodFab = $_POST['colorCodFab'];
   $stockCrit = $_POST['stockCrit'];
   $term = $_POST['term'];
 
   $lotes = array(); 
 
   $qry = "SELECT l.lote,padre,design,img, SUM(s.cantidad) AS stock FROM lotes l INNER JOIN stock s  ON l.codigo = s.codigo AND l.lote = s.lote INNER JOIN pantone p on l.pantone = p.pantone   WHERE l.codigo ='$ItemCode' AND s.suc = '$suc' AND 
   p.pantone = '$color' AND CONCAT(l.cod_catalogo,'-', l.color_cod_fabric) LIKE '$colorCodFab' AND s.estado_venta <> 'FP' AND s.cantidad $stockCrit AND s.lote LIKE '$term' group by lote";
     //echo $qry;
     
   $ms->Query($qry);
   
   while($ms->NextRecord()){
      $fila = array_map('utf8_encode',$ms->Record);
      $fila =  array_merge($fila, disponible($fila['lote'],$sucOrigen));
      $fila =  array_merge($fila, fallas($fila['lote']));
      $fila =  array_merge($fila, precio1($ItemCode,$fila['lote'])); 
      array_push($lotes, $fila);
   }
   //$lotes = array_map("utf8_encode", $lotes );
   echo json_encode(   $lotes  );
}

function disponible($lote,$suc){
   $my = new My();
   $estado = array("doc"=>'Libre',"n_nro"=>'',"suc"=>'');
      
   $pedido = "SELECT 'Pedido' as doc,p.n_nro,lote, suc from pedido_traslado p inner join pedido_tras_det d using(n_nro) where d.lote = '$lote' and(p.estado = 'Abierta' or d.estado='Pendiente')";
   $remision = "SELECT 'Remision',CONCAT(r.n_nro,', (',r.estado,'), '),lote,suc_d as suc from nota_remision r inner join nota_rem_det d using(n_nro) where d.lote = '$lote' and r.estado <> 'Cerrada'";
   $fraccionamiento = "SELECT 'Reserva' as doc,'',lote,suc from orden_procesamiento d where d.lote = '$lote' and suc not in  ('$suc', '00') and d.estado ='Pendiente'";

   $my->Query("$pedido union $remision  union $fraccionamiento ");

   if ($my->NextRecord()) {
      $estado = $my->Record;
   }
   return $estado;
}

function fallas($lote){
    $fallas = array("fallas"=>'');
    $my = new My();    
    $my->Query("SELECT GROUP_CONCAT(' ',mts_inv,'m[',tipo_falla,']') AS fallas FROM fallas WHERE lote = '$lote'");
    if($my->NumRows() > 0){
        $my->NextRecord();
        $fallas = array("fallas"=>$my->Record['fallas']);
    }
    return $fallas;       
}
function precio1($codigo,$lote){
     
    $my = new My();    
    $my->Query("SELECT  precio - IF(descuento IS NULL, 0, descuento) AS precio1, a.um 
    FROM lista_prec_x_art l INNER JOIN articulos a ON a.codigo = l.codigo AND a.um = l.um LEFT JOIN desc_lotes d ON l.codigo = d.codigo AND d.um = l.um AND d.moneda = l.moneda  AND d.num = l.num AND d.lote = '$lote' WHERE l.codigo = '$codigo' AND   l.num = 1 AND l.moneda = 'G$'");
    if($my->NumRows() > 0){
        $my->NextRecord();
        $fallas = array("precio_1"=>$my->Record['precio1'],"um"=>$my->Record['um']);
    }
    return $fallas;       
}

function getPedidosAbiertos($suc,$usuario){
   $my = new My();
   $my->Query("SELECT n_nro, suc_d FROM pedido_traslado WHERE suc = '$suc' AND usuario = '$usuario' AND estado = 'Abierta' and cod_cli = 'C000018'");
   $pedidos = array();
   while($my->NextRecord()){
      array_push($pedidos, $my->Record);
   }
   return $pedidos;
}

function getPedidosDetalle(){
   $my = new My();
   $n_nro = $_POST['n_nro'];
   $my->Query("SELECT id_det, lote, descrip, cantidad, mayorista, urge FROM pedido_tras_det d WHERE n_nro = $n_nro");
   $det = array();
   while($my->NextRecord()){
      array_push($det, $my->Record);
   }
   echo json_encode($det);
}

function ItemName($ItemCode){
   $db = new My();
   $db->Query("SELECT descrip,mnj_x_lotes FROM articulos WHERE codigo = '$ItemCode'");
   $db->NextRecord();
   $descrip = $db->Record['descrip'];
   $mnj_x_lotes = $db->Record['mnj_x_lotes'];
   $array = array("descrip"=>$descrip,"mnj_x_lotes"=>$mnj_x_lotes);
   return $array;
}