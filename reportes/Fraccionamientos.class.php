<?PHP

/**
 * Check Ok on 17-12-2019
 */

require_once("../Y_DB_MySQL.class.php");
require_once("../utils/tbs_class.php");
require_once("../Functions.class.php");

if(isset($_REQUEST['action'])){
   call_user_func($_REQUEST['action']);
}else{
   $link = New My();
   $db =new My();
   $desde = isset($_GET['desde'])?flipDate($_GET['desde'],'/'):false;
   $hasta = isset($_GET['hasta'])?flipDate($_GET['hasta'],'/'):false;
   $usuario = $_GET['user'];
   $t_usuario = $_GET['usuario'];
   $suc = $_GET['select_suc'];
   $sector = $_GET['select_sector'];
   $articulo = $_GET['select_articulos'];
   $frac_pend = $_GET['frac_pend'];
   
    
   $frac_pend_agrup = $_GET['frac_pend_agrup'];   
   
   //$art = getArticulos();
   $reporte = array();     
   $sql_ok = true;
   
   if($articulo === '%' ){
      // Extrae solo los codigos de articulos
      $filtro_articulos = " a.cod_sector = '$sector' ";
   }else{
      $filtro_articulos = "codigo like '$articulo'";
   }
   $permiso_prioridad = "---";
   $permiso_asignar_operador = "---";
   $maquinistas = "";
   
   $TBS = new clsTinyButStrong;
   if($frac_pend == "true"){
     $estado = $_GET['estado'];
     $TBS->LoadTemplate('FraccionamientosPendientes.html');
     $fn = new Functions();
     $permiso_prioridad = $fn->chequearPermiso("7.3.1", $usuario); // Permiso para Cerrar una Nota de Pedido Internacional     
     $permiso_asignar_operador = $fn->chequearPermiso("7.3.2", $usuario); // Permiso para Asignar Operador en Orden de Procesamiento   
      
     
     if($permiso_asignar_operador == "vem"){
         $sql_maq = "SELECT u.usuario FROM  usuarios u, usuarios_x_grupo g WHERE u.usuario = g.usuario AND g.id_grupo = 3 AND u.estado = 'Activo' AND u.suc = '00' ORDER BY u.usuario ASC";
         $db->Query($sql_maq);
         while($db->NextRecord()){
             $maq = $db->Record['usuario']; 
             $maquinistas.= "<option value='$maq'>$maq</option>";
         }
     }
     $maquinistas .= "<option value=''>Quitar asignacion</option>";
   }else{
     $TBS->LoadTemplate('Fraccionamientos.html');  
   }
       
   $query = "SELECT usuario,fecha,suc,f.codigo,a.descrip,COUNT(DISTINCT padre) AS rollos ,count(*) as piezas, sum(cantidad) as metros,ROUND(SUM(cantidad) / COUNT(*),2)  AS media  FROM fraccionamientos f, articulos a WHERE a.codigo = f.codigo and f.suc ='$suc' AND fecha between '$desde' AND '$hasta' AND signo='+' AND usuario LIKE '$t_usuario' AND $filtro_articulos GROUP BY usuario,f.codigo, f.fecha ORDER By usuario asc, date(fecha) asc";
        
   
   if($frac_pend == "true"){ 
       
       $group_by = ' o.lote '; //o.codigo,prioridad,id_ent
       if($frac_pend_agrup == "true"){
           $group_by = ' o.codigo,prioridad,id_ent ';
       }
       
       $suc_filter = "  and o.suc not like '09' ";
       if($suc == '09'){
           $suc_filter = " and o.suc like '09' ";
       }
        
       $query = "SELECT m.id_ent, invoice,proveedor,DATE_FORMAT( m.fecha,'%d-%m-%Y') as fecha_ent, o.usuario,DATE_FORMAT(o.fecha,'%d-%m-%Y') AS fecha,o.suc AS destino,nro_pedido,cod_cli,o.codigo,lote,a.descrip,color,presentacion,cantidad AS metros,COUNT(*) AS piezas,prioridad,operador ,obs,IF(obs != '','obs','') AS class_obs  
       FROM orden_procesamiento o, entrada_merc m, articulos a WHERE o.codigo = a.codigo and  o.id_ent = m.id_ent  AND  o.fecha BETWEEN '$desde' AND '$hasta' $suc_filter  AND o.estado = '$estado' GROUP BY $group_by order by prioridad asc, codigo asc ";     
   }
   
   $link->Query($query);
   $lotes = '';
   $i = 0;
   
   $promedios = array();
   
   $operadores = array();
   
   while($link->NextRecord()){
      $fila = $link->Record;
      $codigo = $fila['codigo'];
      
      if($frac_pend == "true"){
          $prom = 440; // General
         if (array_key_exists($codigo, $promedios)) {
            $prom = $promedios[$codigo];
         }else{
              $db->Query("SELECT promedio_frac('$codigo') AS prom"); 
              if($db->NumRows()){
                 $db->NextRecord();
                 $prom = $db->Record['prom'];
                 $promedios[$codigo] = $prom;
              }
         } 
         $prom = round($prom / 60,2); // 60 Segundos
         $fila['prom'] = $prom;
         $fila['ubic'] = '';
         if($frac_pend_agrup == "true"){
            $fila['lote'] ='---'; 
            $lotes = ''; 
         }else{
            $lotes .= $fila['lote'].',';
         }
         $tiempo_proc = round($prom * $fila['piezas']);
         $fila['tiempo'] = $tiempo_proc;
         $fila['articulo'] = $fila['descrip'];
      }
      $fila['i'] = $i; 
      
      array_push($reporte,$fila);   
      $i++;
   }
   if($frac_pend == "true"){
      $ubicacion = getUbicacion(trim($lotes,','),$suc);
      foreach($reporte as $key=>$val){
         $reporte[$key]['ubic'] = $ubicacion[$reporte[$key]['lote']]['ubic'];
         $stock = $ubicacion[$reporte[$key]['lote']]['stock'];
         $reporte[$key]['metros'] = $stock;
         if($stock > 0){
              $reporte[$key]['en_transito'] = "";
         }else{
             $reporte[$key]['en_transito'] = "en_transito";
         }
      }
   }
   
  
   $TBS->MergeBlock('data','array',$reporte);
   $TBS->Show();
}


function comillas($st){
   return "'".$st."'";
}
/*
function getArticulosInGrupo($grupo){
   
    $ms = new My();
    $articulos = array();
    $sql = "SELECT codigo,descrip FROM articulos WHERE cod_sector like '$grupo' AND estado = 'Activo' order by descrip asc";
    $ms->Query($sql);

    while ($ms->NextRecord()) {
        $articulos[$ms->Record['codigo']]=utf8_encode($ms->Record['descrip']);
    }
   
   return $articulos;
}*/

function flipDate($date,$separator){
   $date = explode($separator,$date);
   return $date[2].'-'.$date[1].'-'.$date[0];
}

function getArticulos(){
   $ms_link = new My();
   $ms_link->Query("SELECT codigo,descrip FROM articulos where estado = 'Activo'");
   $articulos = array();
   while($ms_link->NextRecord()){
      $articulos[$ms_link->Record['codigo']] = $ms_link->Record['descrip'];
   }
   return $articulos;
}

function getUbicacion($lotes,$suc){
    
   $db = new My();
   $ms = new My();
   
   $ubics = array();
   if(strlen(trim($lotes)) > 0){
      $ms->Query("SELECT DistNumber,isnull(U_ubic,'') AS Ubic, CAST(ROUND(q.Quantity - ISNULL(q.CommitQty,0),2) AS NUMERIC(20,2)) AS Stock FROM OBTN o INNER JOIN OBTW w ON o.SysNumber=w.SysNumber AND o.ItemCode=w.ItemCode INNER JOIN OBTQ q ON o.SysNumber=q.SysNumber AND w.WhsCode=q.WhsCode AND q.ItemCode=w.ItemCode INNER JOIN OITM a ON o.ItemCode=a.ItemCode WHERE DistNumber in ($lotes) and w.WhsCode = '00'");
      while($ms->NextRecord()){
         $DistNumber = $ms->Record['DistNumber']; 
         $stock = $ms->Record['Stock'];
         $ubics[$DistNumber]['ubic'] = $ms->Record['Ubic'];
         $ubics[$ms->Record['DistNumber']]['stock'] = $stock;
         if($stock < 0.01){ 
             $sql = "UPDATE orden_procesamiento SET estado = 'Procesado' WHERE lote = '$DistNumber'";
             $db->Query($sql);
         }
      }
   }
   return $ubics;
}
function lotes(){
   $suc = $_REQUEST['suc'];
   $fecha = $_REQUEST['fecha'];
   $codigo = $_REQUEST['codigo'];
   $usuario = $_REQUEST['usuario'];
   $listaLotes = array();
   $tbs = new clsTinyButStrong;
   $tbs->VarRef['usuario'] = $usuario;
   $tbs->LoadTemplate('FraccionamientosLotes.html');
   $link = new My();
   $link->Query("SELECT lote, padre,tara,kg_desc,gramaje,ancho,cantidad,hora FROM fraccionamientos WHERE suc ='$suc' AND signo='+' AND fecha = '$fecha'  AND codigo = '$codigo' AND usuario = '$usuario' ORDER BY padre ASC, lote ASC");
   while($link->NextRecord()){
      array_push($listaLotes,$link->Record);
   }
   $tbs->MergeBlock('data','array',$listaLotes);
   $tbs->Show();
}

function cambiarPrioridad(){
    $codigo = $_REQUEST['codigo'];
    $lotes = json_decode( $_REQUEST['lotes'] );
    
    $prioridad = $_REQUEST['prioridad'];
    $id_ent = $_REQUEST['id_ent'];
    
    $db = new My();
    
    if($lotes[0]!=='---'){    
        foreach ($lotes as $lote) {
           $db->Query("update orden_procesamiento set prioridad = $prioridad where codigo = '$codigo' and lote = '$lote'; ");
        }
    }else{
        $db->Query("update orden_procesamiento set prioridad = $prioridad where codigo = '$codigo' and id_ent = '$id_ent' and estado ='Pendiente'; ");
    }
    echo json_encode(array("estado"=>"Ok"));
}
function cambiarEstado(){
    $codigo = $_REQUEST['codigo'];
    $lotes = json_decode( $_REQUEST['lotes'] );
    $estado = $_REQUEST['estado'];
    $id_ent = $_REQUEST['id_ent'];
    $usuario = $_REQUEST['usuario'];
    
    $db = new My();
    foreach ($lotes as $lote) {
       $fecha = date("d-m-Y H:i"); 
       $db->Query("update orden_procesamiento set estado = '$estado', obs = concat(obs,'<br>[$usuario] $fecha <br>Obs: Cambio a $estado') where codigo = '$codigo' and lote = '$lote'; ");
    }
    echo json_encode(array("estado"=>"Ok"));
}

function asignarOperador(){
    $codigo = $_REQUEST['codigo'];
    $lotes = json_decode( $_REQUEST['lotes'] );
    $operador = $_REQUEST['operador'];
    $id_ent = $_REQUEST['id_ent']; 
    
    $db = new My();
    if($lotes[0]!=='---'){    
        foreach ($lotes as $lote) {
           $db->Query("update orden_procesamiento set operador = '$operador' where codigo = '$codigo' and lote = '$lote'; ");
        }
    }else{
        $db->Query("update orden_procesamiento set operador = '$operador' where codigo = '$codigo' and id_ent = '$id_ent' and estado ='Pendiente'; ");
    }
    echo json_encode(array("estado"=>"Ok"));
}
function addObs(){
    $codigo = $_REQUEST['codigo'];
    $lotes = json_decode( $_REQUEST['lotes'] );
    $obs = trim($_REQUEST['obs']);
    $id_ent = $_REQUEST['id_ent']; 
    $usuario = $_REQUEST['usuario'];
    $fecha = date("m-d-Y H:i");
    $obs = "[$usuario]  $fecha<br>Obs: $obs";
    
    $db = new My();
    if($lotes[0]!=='---'){    
        foreach ($lotes as $lote) {
           $db->Query("update orden_procesamiento set obs = CONCAT(obs , '<br>$obs') where codigo = '$codigo' and lote = '$lote';");
        }
    }else{
        $db->Query("update orden_procesamiento set obs = CONCAT(obs , '<br>$obs')  where codigo = '$codigo' and id_ent = '$id_ent';");
    }
    echo json_encode(array("estado"=>"Ok"));
}
?>