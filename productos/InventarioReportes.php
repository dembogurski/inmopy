<?PHP
ini_set('max_execution_time', 0);
require_once("../Y_DB_MySQL.class.php");
require_once("../utils/tbs_class.php");       

if(!isset($_REQUEST['action'])){
   
    $db = new My();
    
      
   $fecha_limite = $_GET['fecha_limite'];
   $suc = $_GET['suc'];
   $TBS = new clsTinyButStrong;
   $TBS->LoadTemplate('InventarioReportes.html');
   
   $grupos_query = "SELECT cod_sector, descrip as sector   FROM sectores WHERE cod_sector NOT IN(107,109,110);";    
   $db->Query($grupos_query);
   $grupos = array();
   while($db->NextRecord()){
      $current = $db->Record;      
      array_push($grupos,array_map('utf8_encode',$current));
      
   }
   $TBS->MergeBlock('grupo',$grupos);

   $articulos_query = "SELECT cod_sector AS ItmsGrpCod, codigo AS ItemCode, descrip  AS ItemName  FROM articulos   WHERE cod_sector NOT IN(107,109,110) ORDER BY descrip ASC";
   
   $db->Query($articulos_query);
   $articulos = array();
   while($db->NextRecord()){
      $current = $db->Record;      
      array_push($articulos,array_map('utf8_encode',$current));
      
   }
   $TBS->MergeBlock('articulo',$articulos);


   $TBS->Show();
}else{
   $action = $_REQUEST['action'];
   switch($action){
      case 'lostesXSucXArticulo':
         $suc = $_REQUEST['suc'];
         $codigo = $_REQUEST['codigo'];
         $todos = ($_REQUEST['todos'] == 'true')?true:false;
         $fecha_limite = $_REQUEST['fecha_limite'];
         $filtro_stock = $_REQUEST['filtro_stock'];
         
         lostesXSucXArticulo($suc,$codigo,$fecha_limite,$todos,$filtro_stock);
      break;
      case 'avance':
         $suc = $_REQUEST['suc']; 
         $fecha_limite = $_REQUEST['fecha_limite'];        
         avance($suc,$fecha_limite );
      break;
      case 'codigosXCodXSuc':
         $suc = $_REQUEST['suc'];
         $codigo = $_REQUEST['articulo'];         
         codigosXCodXSuc($suc,$codigo);
      break;      
      case 'piezasInventariadasXRangoFecha':
         $user = $_REQUEST['user'];
         $suc = $_REQUEST['suc'];
         $desde = $_REQUEST['desde'];         
         $hasta = $_REQUEST['hasta'];         
         piezasInventariadasXRangoFecha($user,$suc,$desde,$hasta);
      break;
      case 'ponerNFDP':
         $suc = $_REQUEST['suc'];
         $user = $_REQUEST['user'];
         $lotes = json_decode($_REQUEST['lotes']);

         ponerNFDP($suc,$lotes,$user);
      break;
      case 'lotesPendientesDeInventario':
         $suc = $_REQUEST['suc'];
         $ItmsGrpCod = $_REQUEST['ItmsGrpCod'];
         $fecha_limite = $_REQUEST['fecha_limite'];
         lotesPendientesDeInventario($suc,$ItmsGrpCod,$fecha_limite);
      break;
      default:
         //echo json_encode(array("error"=>"No existe opcion $action"));
         echo "No existe opcion $action";
      break;
   }
}



function inventariadosXCod($codigo,$suc,$fecha_limite,$todos){
   $inv = 0;
   $link = new My();
   $filtro_todos = "";
   if(!$todos){
      $filtro_todos = " AND fecha > '$fecha_limite' ";
   }
   $link->Query("SELECT count(distinct lote) as inv from inventario where codigo = '$codigo' and suc = '$suc' $filtro_todos");
   $link->NextRecord();
   $inv = $link->Record['inv'];
   $link->Close();
   return $inv;
}

// Pasar lotes a Fin de Pieza
function ponerNFDP($suc,$lotes,$usuario){
    $db = new My();
    $my = new My();
      
    $respuesta = array();
    
    
      
    
    foreach ($lotes as $lote) {
        $sql = "SELECT tipo_ent ,  nro_identif, linea,a.codigo,a.descrip,a.costo_prom AS  precio_costo, s.cantidad AS stock,a.um,l.gramaje,l.tara,l.ancho   
        FROM articulos a INNER JOIN lotes l ON a.codigo = l.codigo INNER JOIN stock s ON l.codigo = s.codigo AND l.lote = s.lote   WHERE l.lote = '$lote' AND s.suc = '$suc' limit 1";
        //echo $sql."<br>";
        $db->Query($sql );
        
        
        
        if($db->NumRows()>0){
            $db->NextRecord();
            $tipo_ent = $db->Get('tipo_ent');
            $nro_identif = $db->Get('nro_identif');
            $linea = $db->Get('linea');
            $codigo = $db->Get('codigo');
            $descrip = $db->Get('descrip');
            $precio_costo = $db->Get('precio_costo');
            $stock = $db->Get('stock');
            $um = $db->Get('um');
            $gramaje = $db->Get('gramaje');
            $ancho = $db->Get('ancho');
            $tara = $db->Get('tara');
      
        
            $signo = "-";
            $valor_ajuste = $precio_costo * $stock;
            $final = 0;
            $my->Query("INSERT INTO ajustes( usuario,f_nro, codigo, lote, tipo,signo, inicial, ajuste, final, motivo, fecha, hora, um, estado,suc,p_costo,valor_ajuste)
            VALUES ('$usuario',0, '$codigo', '$lote', '$usuario','$signo',$stock,$stock, $final, 'Ajuste en Inventario', CURRENT_DATE, CURRENT_TIME, '$um', 'Pendiente','$suc',$precio_costo,$valor_ajuste);");
            $id_ajuste = getIdajuste($usuario,$codigo,$lote)['id_ajuste'];
            
            $my->Query("UPDATE stock SET cantidad = cantidad - $stock WHERE codigo ='$codigo' AND lote = '$lote' AND   suc = '$suc'");                     
            $my->Query("INSERT INTO historial( suc, codigo, lote, tipo_ent, nro_identif, linea, fecha_hora, usuario, direccion, cantidad,tipo_doc, nro_doc,gramaje,ancho,tara)  
                
            VALUES (  '$suc', '$codigo', '$lote', '$tipo_ent', $nro_identif,$linea, current_timestamp, '$usuario', 'S', -$stock,'AJ',$id_ajuste,$gramaje,$ancho,$tara);");
            
            $my_edicion = "INSERT INTO edicion_lotes (usuario, codigo, lote, descrip, fecha, hora, suc, estado_venta ) VALUES ('$usuario', '$codigo', '$lote', '$descrip', current_date, current_time, '$suc', 'FP' );";
    
            $my->Query($my_edicion); 
            
            array_push($respuesta, array("lote"=>$lote) );
        }
    }
      
    echo json_encode ($respuesta);
}

function getIdajuste($usuario,$codigo,$lote){
    require_once("../Functions.class.php");
    $fn = new Functions();    
    $sql = "SELECT id_ajuste FROM ajustes WHERE usuario = '$usuario' AND codigo = '$codigo' AND lote = '$lote' ORDER BY id_ajuste DESC LIMIT 1";
    return $fn->getResultArray($sql)[0];
}

function codigosXCodXSuc($suc,$codigo){
   $db = new My();   
   $suc = $_POST['suc'];
   $todos = ($_POST['todos'] == 'true')?true:false;
   $articulo = $_POST['articulo'];
   $fecha_limite = $_POST['fecha_limite'];
   $ItmsGrpCod = $_POST['ItmsGrpCod'];
   
   $articulosXSuc = "SELECT a.codigo AS ItemCode, a.descrip AS ItemName,COUNT(l.lote) AS lotes, sum(if(s.estado_venta = 'FP',1,0)) as fdb FROM articulos a INNER JOIN lotes l  ON a.codigo = l.codigo  INNER JOIN  stock s ON l.codigo = s.codigo AND l.lote = s.lote 
       INNER JOIN historial h ON l.codigo = h.codigo AND l.lote = h.lote   WHERE  s.cantidad > 0   AND s.suc = '$suc'   AND a.codigo = '$codigo'  AND h.fecha_hora < '$fecha_limite' ORDER BY descrip asc";
   
   //echo $articulosXSuc;
   $db->Query($articulosXSuc);
   $datos = array();
   while($db->NextRecord()){
      $current = $db->Record;
      $current['inv'] = inventariadosXCod($current['ItemCode'],$suc,$fecha_limite,$todos);
      array_push($datos,array_map("utf8_encode", $current));
      
   }
   echo json_encode($datos);
}

function lostesXSucXArticulo($suc,$codigo,$fecha_limite,$todos,$filtro_stock){
   $my = new My();
   $respuesta = array();   
   $invLotes = inventariadosXArticuloXsuc($suc,$codigo,$fecha_limite,$todos);
   
      
   
   $lotesEnListaDeAjuste = lotesEnListaDeAjuste($suc,$codigo);
   //$includeDistNumber = (count($invLotes) > 0)?" or o.DistNumber in (" . implode(',',$invLotes) . ")" : "";
   $includeDistNumber = (count($invLotes) > 0)?" or (s.cantidad > 0 and l.lote in (" . implode(',',$invLotes) . "))" : "";
   
   // Buscar Lotes Remitidos hacia la Sucursal posterior al Inicio del Inventario
   
   $remitidos = "''";
   if(!$todos){
        $rems = "SELECT GROUP_CONCAT(d.lote) AS remitidos FROM nota_remision r, nota_rem_det d WHERE  d.n_nro = r.n_nro AND suc_d = '$suc' and r.estado = 'Cerrada' and r.e_sap = 1 "
                . " AND CONCAT(fecha_cierre,' ',hora_cierre) > '$fecha_limite' AND codigo='$codigo' "; 
        $db = new My();
        $db->Query($rems);
        if($db->NumRows()>0){
           $db->NextRecord();
           $remitidos = $db->Record['remitidos'];      
           $remitidos = str_replace(",","','", $remitidos);
           $remitidos = "'$remitidos'";
        }
   }

   //$query = "SELECT o.DistNumber,o.ItemCode,m.ItemName,c.Name,mov.Stock,o.U_fin_pieza,o.U_img, o.U_estado_venta,U_ubic FROM OBTN o INNER JOIN (SELECT i.ItemCode,i1.SysNumber,i.LocCode,min(i.DocDate) as entDate,sum(i1.Quantity) as Stock FROM OITL i INNER JOIN ITL1 i1 ON i.LogEntry=i1.LogEntry group by i.ItemCode,i1.SysNumber,i.LocCode) as mov on o.ItemCode=mov.ItemCode and o.SysNumber = mov.Sysnumber INNER JOIN OITM m on o.ItemCode=m.ItemCode LEFT JOIN [@EXX_COLOR_COMERCIAL] c ON o.U_color_comercial = c.Code WHERE mov.LocCode like '$suc' AND ((Stock > $filtro_stock) $includeDistNumber ) and o.ItemCode='$codigo' and mov.entDate < CONVERT(DATETIME, '$fecha_limite', 111) and o.DistNumber not in($remitidos)";
   $query = "SELECT   a.codigo AS ItemCode, l.lote as DistNumber, a.descrip AS ItemName,p.nombre_color AS NAME,s.cantidad as Stock, s.estado_venta AS U_estado_venta,l.img as U_img, s.ubicacion AS U_ubic   FROM articulos a INNER JOIN lotes l  ON a.codigo = l.codigo  
   INNER JOIN  stock s ON l.codigo = s.codigo AND l.lote = s.lote 
   INNER JOIN pantone p ON l.pantone = p.pantone
   INNER JOIN historial h ON l.codigo = h.codigo AND l.lote = h.lote 
   WHERE  ((s.cantidad > $filtro_stock) $includeDistNumber )  AND s.suc = '$suc'   AND a.codigo = '$codigo'  AND h.fecha_hora < '$fecha_limite'   AND l.lote NOT  IN ($remitidos)";
   
   $my->Query($query);
      
   while($my->NextRecord()){
      $line = $my->Record;
      $line['inv'] = in_array($line['lote'],$invLotes)?'Si':'No';
      if($line['U_estado_venta'] == 'FP'){
         $line['U_estado_venta'] = in_array($line['lote'],$lotesEnListaDeAjuste)?'Si':'No';
      }
      $line = array_map("utf8_encode",$line);
      array_push($respuesta,$line);
   }
   
   
  // array_push($respuesta,array("query"=>$query));
   echo json_encode($respuesta);
}
function avance($suc,$fecha_limite){
   $my = new My();
   $db = new My();
   
   $grupos = [
       "A"=>array("grupo"=>"ACTIVOS","invent"=>"","total"=>""),
       "B"=>array("grupo"=>"BASICOS","invent"=>"","total"=>""),
       "C"=>array("grupo"=>"CRUCERO","invent"=>"","total"=>""),
       "H"=>array("grupo"=>"HOGAR","invent"=>"","total"=>""),
       "I"=>array("grupo"=>"INSUMOS","invent"=>"","total"=>""),
       "S"=>array("grupo"=>"SASTRERIA","invent"=>"","total"=>""),
       "T"=>array("grupo"=>"FABRICA","invent"=>"","total"=>"")
    ];   
      
      
   $mysql = "SELECT LEFT(codigo,1) AS grupo, COUNT(DISTINCT lote) AS invent FROM inventario WHERE  suc='$suc'  AND fecha > '$fecha_limite'  GROUP BY grupo";
   $db->Query($mysql);
   while($db->NextRecord()){
       $g = $db->Record['grupo'];
       $invent = $db->Record['invent'];       
       $grupos[$g]["invent"] = $invent;
   }
   
      /*
   $sql_server = "SELECT left(o.ItemCode,1) as grupo, COUNT(*) as lotes FROM OBTN o INNER JOIN (SELECT i.ItemCode,i1.SysNumber,i.LocCode,min(i.DocDate) as entDate,sum(i1.Quantity) as Stock 
   FROM OITL i INNER JOIN ITL1 i1 ON i.LogEntry=i1.LogEntry group by i.ItemCode,i1.SysNumber,i.LocCode) as mov on o.ItemCode=mov.ItemCode and o.SysNumber = mov.Sysnumber 
   INNER JOIN OITM m on o.ItemCode=m.ItemCode  
   WHERE mov.LocCode like '$suc' AND o.U_fin_pieza <> 'Si' and Stock > 0 
   and o.ItemCode like '%' and mov.entDate < CONVERT(DATETIME, '$fecha_limite', 111) group by left(o.ItemCode,1) ";*/
   $sql = "SELECT  left(a.codigo,1) as grupo,   COUNT(*) AS lotes  FROM articulos a INNER JOIN lotes l  ON a.codigo = l.codigo  
   INNER JOIN  stock s ON l.codigo = s.codigo AND l.lote = s.lote  
   INNER JOIN historial h ON l.codigo = h.codigo AND l.lote = h.lote 
   WHERE  s.cantidad > 0  AND s.suc = '$suc'   AND a.codigo like '%'  AND h.fecha_hora < '$fecha_limite'   GROUP BY LEFT(a.codigo,1)";
   
   
   $my->Query($sql);
   while($my->NextRecord()){  
      $g = $my->Record['grupo'];
      $lotes = $my->Record['lotes'];       
      $grupos[$g]["total"] = $lotes;
   }
      
   echo json_encode($grupos);
}
      
// Articulos por codigo de grupo
function listaArticulos($codGrupo){
   $db = new My();
   $articulos = array();
   $db->Query("SELECT codigo as ItemCode FROM articulos WHERE cod_sector = '$codGrupo'");
   while($db->NextRecord()){
      array_push($articulos, $db->Record['ItemCode']);
   }
   $articulos = array_map('comillas',$articulos);
   return implode(',',$articulos);
}
function comillas($text){
   return "'$text'";
}

//Lotes Inventariados
function lotesInvXFechaLim($suc,$articulos,$fecha_limite){
   $lotesInventariados = array();
   $my = new My();
   $my->Query("SELECT lote FROM inventario WHERE suc='$suc' AND codigo IN ($articulos) AND fecha >= '$fecha_limite'");
   
   while($my->NextRecord()){
      array_push($lotesInventariados,$my->Record['lote']);
   }
   return $lotesInventariados;
}

function inventariadosXArticuloXsuc($suc,$codigo,$fecha_limite,$todos){
   $link = new My();
   $lotes = array();
   $filtro_todos = "";
   if(!$todos){
      $filtro_todos = " AND fecha > '$fecha_limite' ";
   }
   $link->Query("SELECT distinct(lote) as lotes from inventario where codigo='$codigo' and suc='$suc' $filtro_todos");
   while($link->NextRecord()){
      array_push($lotes,$link->Record['lotes']);
   }
   return $lotes;
}
      
function piezasInventariadasXRangoFecha($user,$suc,$desde,$hasta){
   $link = new My();
   $datos = array();
   $link->Query("SELECT usuario,DATE_FORMAT(date(fecha),'%d-%m-%Y') as fecha,COUNT(*) as inv FROM inventario WHERE usuario='$user' AND suc='$suc' and date(fecha) between '$desde' AND '$hasta' group by suc,year(fecha), month(fecha),day(fecha),usuario");
   while($link->NextRecord()){
       array_push($datos,array_map("utf8_encode",$link->Record));
   }
   echo json_encode($datos);
}


function lotesEnListaDeAjuste($suc, $codigo){
   $link = new My();
   $lotes = array();
   $link->Query("SELECT lote FROM ajustes WHERE e_sap=0 AND f_nro = 0 AND motivo = 'Actualizacion de Inventario FDP' AND tipo = 'Correccion de Stock' AND codigo='$codigo' AND suc='$suc'");
   while($link->NextRecord()){
      array_push($lotes,$link->Record['lote']);
   }
   return $lotes;
}


?>