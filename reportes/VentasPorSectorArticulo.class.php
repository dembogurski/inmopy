<?PHP
require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");


class VentasPorSectorArticulos{
   private $t;
   private $desde;
   private $hasta;
   private $r_desde;
   private $r_hasta;
   private $suc;
   private $target_suc;
   private $usuario;   
   private $sector;   
   private $articulo;
   private $group_suc;
   private $group_art;
   private $group_color;
   private $group_by;
   private $categorias;
   private $vendedor;
   private $cliente;
   private $cant_cuotas;
        
    
   function __construct(){
      $link = new My();
      $filtro_articulos='';
      $this->t = new Y_Template("VentasPorSectorArticulo.html");
      $this->desde = $this->flipDate($_GET['desde'],'/');
      $this->hasta = $this->flipDate($_GET['hasta'],'/');
      $this->r_desde = $_GET['desde'];
      $this->r_hasta = $_GET['hasta'];
      $this->suc = $_GET['suc'];
      $this->target_suc = $_GET['select_suc'];
      $this->group_art = $_GET['group_art'];
      $this->usuario = $_GET['user'];
      $this->sector = $_GET['select_sector'];
      $this->articulo = $_GET['select_articulos'];
      $this->vendedor = $_GET['usuario'];
      $this->cant_cuotas = $_GET['cant_cuotas'];
      $this->cliente = ($_GET['cliente'] == 'todos')?'%':$_GET['cliente'];
      $cliNombre = '';
      
       
      $this->t->Set('cuotas',$this->cant_cuotas);
      $this->t->Set('cliente',$this->cliente);
      if($this->cliente !== '%'){
            $msc = new My();
            $msc->Query("SELECT nombre FROM clientes WHERE ci_ruc = '$this->cliente' ");
            if($msc->NextRecord()){
                $cliNombre = $msc->Record['nombre'];
            }
      }
      $this->t->Set('cliNombre',$cliNombre);

      foreach(range(1,7) as $cat){
            $this->categorias .= ($_GET["cat_$cat"] == 'true')?"$cat,":"";
      }
      $this->categorias = trim($this->categorias,',');

      $art_grp;
      $group_sum;
      $pri_order = "descrip ASC,";

      if($this->articulo === '%' ){
         // Extrae solo los codigos de articulos
         $art_grp = $this->getArticulosInGrupo($this->sector);
         
        // print_r($art_grp);
         
         //$filtro_articulos = "d.codigo in (".trim(implode(',',array_map(array($this,'comillas'),array_keys($art_grp['articulos']))),',').')';
         
         if($this->sector === '%'){
             $filtro_articulos = "d.codigo like '%'";
         }else{
             $filtro_articulos = "d.codigo in (".trim(implode(',',array_map(array($this,'comillas'),array_keys($art_grp['articulos']))),',').')';
         }             
      }else{
         $filtro_articulos = "d.codigo like '$this->articulo'";
      }
      //echo $this->group_art;
      if($this->sector === '%' && $this->group_art == 'false'){
            $this->t->Set('art_visibility',"style='display:none'");
            $pri_order = "";
      }
      if($_GET['group_suc'] == 'true'){
         $this->group_suc = ',suc';
      }else{
         $this->t->Set('suc_visibility',"style='display:none'");
      }
      if(!$this->verMargen($this->usuario) ||  $_GET['show_margen'] == 'false'){
            $this->t->Set('margen_visibility',"style='display:none'");
      }
      if($_GET['group_color'] == 'true'){
         $this->group_color = ',color';
      }else{
         $this->t->Set('color_visibility',"style='display:none'");
      }

      $this->t->Show('header');
      $this->t->Set('user',$this->usuario);
      $this->t->Set('time',date('d-m-Y H:i'));
      $this->t->Set('desde',$this->r_desde);
      $this->t->Set('hasta',$this->r_hasta);
      $this->t->Set('target_suc',$this->target_suc);
      $this->t->Set('vendedor',$this->vendedor);
      $this->t->Set('categorias',$this->categorias);
      
      $this->t->Show('general_head');
      $this->t->Show('table_suc_head');

      $porcentajes = $this->porcentajeFacturas($this->desde,$this->hasta,$this->target_suc,$filtro_articulos);
      //$query = "SELECT d.codigo,f.suc,TRIM(LEFT(d.descrip,LOCATE('-', d.descrip)-1)) AS artNombre,TRIM(SUBSTRING(d.descrip,LOCATE('-', d.descrip)+1)) AS color,sum(cantidad) as metros,sum(precio_costo*cantidad) as costo, sum(subtotal) as mov from fact_vent_det d inner join factura_venta f using(f_nro) where $filtro_articulos  AND f.estado='Cerrada' AND f.fecha_cierre BETWEEN '$this->desde' AND '$this->hasta' AND f.suc LIKE '$this->target_suc' AND f.usuario LIKE '$this->vendedor' AND f.cat in ($this->categorias) group by codigo $this->group_suc $this->group_color ORDER BY descrip ASC, suc*1 ASC,color ASC";
      
      $cuotas = $this->cant_cuotas;
      
      $query = "SELECT d.codigo,f.suc, TRIM( LEFT(d.descrip, LOCATE('-', d.descrip)-1)) AS artNombre, TRIM(SUBSTRING(d.descrip, LOCATE('-', d.descrip)+1)) AS color,  SUM(d.cantidad) AS metros, SUM(IF(ncr.f_nro IS NULL,0,ncr.cantidad)) as metrosDev, SUM((d.precio_costo*d.cantidad)) AS costo, SUM(IF(ncr.f_nro IS NULL,0,(ncr.cantidad*d.precio_costo))) as costoDev, SUM(d.subtotal) AS mov, SUM( IF(ncr.f_nro IS NULL,0,ncr.subtotal)) as movDev FROM fact_vent_det d inner join factura_venta f using(f_nro) LEFT JOIN (SELECT n.f_nro,nd.lote,nd.cantidad,nd.precio_unit,nd.subtotal FROM nota_credito_det nd INNER JOIN nota_credito n USING(n_nro) WHERE n.estado='Cerrada' AND n.e_sap = 1) AS ncr ON f.f_nro = ncr.f_nro and d.lote = ncr.lote where ruc_cli like '$this->cliente' AND $filtro_articulos  AND f.estado='Cerrada' AND f.fecha_cierre BETWEEN '$this->desde' AND '$this->hasta' AND f.suc LIKE '$this->target_suc' AND f.usuario LIKE '$this->vendedor' AND f.cat in ($this->categorias) and f.cant_cuotas $cuotas group by codigo $this->group_suc $this->group_color ORDER BY $pri_order suc*1 ASC,color ASC";
      // echo $query;
      $link->Query($query);

      if($link->NumRows()>0){
         $sumMts = 0;
         $sumMovs = 0;
         $margen = 0;
         $sumMargen = 0;

         $sumMtsDev = 0;
         $sumMovsDev = 0;
         $margenDev = 0;
         $sumMargenDev = 0;

         $current_item = '';
         $current_color = '';
         $suc_group = array();
        
         while($link->NextRecord()){
            if($current_item==='')$current_item =  $link->Record['codigo'];
            if($current_color==='')$current_color =  $link->Record['color'];
            $sumMts += (float)$link->Record['metros'];
            $sumMovs += (float)$link->Record['mov'];
            $sumMargen += (float)$link->Record['mov']-(float)$link->Record['costo'];
            $margen = (float)$link->Record['mov']-(float)$link->Record['costo'];
            
            $sumMtsDev += (float)$link->Record['metrosDev'];
            $sumMovsDev += (float)$link->Record['movDev'];
            $sumMargenDev += (float)$link->Record['movDev']-(float)$link->Record['costoDev'];
            $margenDev = (float)$link->Record['movDev']-(float)$link->Record['costoDev'];

            $this->t->Set('metros_p',number_format((((float)$link->Record['metros']*100)/$porcentajes['totalMts']), 3, ',', '.'));
            $this->t->Set('metrosDev_p',number_format((((float)$link->Record['metrosDev']*100)/$porcentajes['totalMts']), 3, ',', '.'));
            $this->t->Set('mov_p',number_format((((float)$link->Record['mov']*100)/$porcentajes['totalMov']), 3, ',', '.'));
            $this->t->Set('movDev_p',number_format((((float)$link->Record['movDev']*100)/$porcentajes['totalMov']), 3, ',', '.'));
            $this->t->Set('margen',number_format($margen, 2, ',', '.'));
            $this->t->Set('margenDev',number_format($margenDev, 2, ',', '.'));
            $this->t->Set('margen_p',number_format((($margen*100)/$porcentajes['totalCostos']), 3, ',', '.'));
            $this->t->Set('margenDev_p',number_format((($margenDev*100)/$porcentajes['totalCostos']), 3, ',', '.'));

            if($this->sector !== '%' || $this->group_art == 'true'){
               $this->t->Set('grupo',$art_grp['grupos'][$link->Record['codigo']]);
               foreach($link->Record as $key=>$value){
                     if(is_numeric($value)){
                           $this->t->Set($key,number_format($value, 2, ',', '.'));
                     }else{
                           $this->t->Set($key,$value);
                     }
                     /* if($key == 'metros' || $key == 'mov' || $key == 'metrosDev' || $key == 'movDev'){
                     }else{
                     } */
               }
               
               $this->t->Show('table_suc_data');
            }else if($this->sector == '%' || $this->group_art == 'false'){
               if($this->group_color != '' && $this->group_suc == ''){
                  $color = $link->Record['color'];
                  $index = $art_grp['grupos'][$link->Record['codigo']] . '_' . $color;

                  $group_sum[$index]['color'] = $color;
                  $group_sum[$index]['metros'] += (float)$link->Record['metros'];
                  $group_sum[$index]['metrosDev'] += (float)$link->Record['metrosDev'];
                  $group_sum[$index]['movs'] += (float)$link->Record['mov'];
                  $group_sum[$index]['movDev'] += (float)$link->Record['movDev'];
                  $group_sum[$index]['costos'] += (float)$link->Record['costo'];
                  $group_sum[$index]['margen'] += (float)$link->Record['mov']-(float)$link->Record['costo'];
                  $group_sum[$index]['margenDev'] += (float)$link->Record['movDev']-(float)$link->Record['costoDev'];
               }else if($this->group_color == '' && $this->group_suc != ''){
                  $suc = $link->Record['suc'];
                  $index = $art_grp['grupos'][$link->Record['codigo']] . '_' . $suc;

                  $group_sum[$index]['suc'] = $suc;
                  $group_sum[$index]['metros'] += (float)$link->Record['metros'];
                  $group_sum[$index]['metrosDev'] += (float)$link->Record['metrosDev'];
                  $group_sum[$index]['movs'] += (float)$link->Record['mov'];
                  $group_sum[$index]['movDev'] += (float)$link->Record['movDev'];
                  $group_sum[$index]['costos'] += (float)$link->Record['costo'];
                  $group_sum[$index]['margen'] += (float)$link->Record['mov']-(float)$link->Record['costo'];
                  $group_sum[$index]['margenDev'] += (float)$link->Record['movDev']-(float)$link->Record['costoDev'];
               }else if($this->group_color != '' && $this->group_suc != ''){
                  $suc = $link->Record['suc'];
                  $color = $link->Record['color'];
                  $index = $art_grp['grupos'][$link->Record['codigo']] . '_' . $suc . '_' . $color;

                  $group_sum[$index]['suc'] = $link->Record['suc'];
                  $group_sum[$index]['color'] += $link->Record['color'];
                  $group_sum[$index]['metros'] += (float)$link->Record['metros'];
                  $group_sum[$index]['metrosDev'] += (float)$link->Record['metrosDev'];
                  $group_sum[$index]['movs'] += (float)$link->Record['mov'];
                  $group_sum[$index]['movDev'] += (float)$link->Record['movDev'];
                  $group_sum[$index]['costos'] += (float)$link->Record['costo'];
                  $group_sum[$index]['margen'] += (float)$link->Record['mov']-(float)$link->Record['costo'];
                  $group_sum[$index]['margenDev'] += (float)$link->Record['movDev']-(float)$link->Record['costoDev'];
               }
            }else{
                  $group_sum[$art_grp['grupos'][$link->Record['codigo']]]['metros'] = (float)$link->Record['metros'];
                  $group_sum[$art_grp['grupos'][$link->Record['codigo']]]['metrosDev'] += (float)$link->Record['metrosDev'];
                  $group_sum[$art_grp['grupos'][$link->Record['codigo']]]['movs'] += (float)$link->Record['mov'];
                  $group_sum[$art_grp['grupos'][$link->Record['codigo']]]['movDev'] += (float)$link->Record['movDev'];
                  $group_sum[$art_grp['grupos'][$link->Record['codigo']]]['costos'] += (float)$link->Record['costo'];
                  $group_sum[$art_grp['grupos'][$link->Record['codigo']]]['margen'] += (float)$link->Record['mov']-(float)$link->Record['costo'];
                  $group_sum[$art_grp['grupos'][$link->Record['codigo']]]['margenDev'] += (float)$link->Record['movDev']-(float)$link->Record['costoDev'];
            }           
         }
      }
      //print_r($group_sum);
      if(count($group_sum) > 0){  
         //sort($group_sum);
         foreach($group_sum as $grupo=>$datos){
            $grp = explode('_',$grupo)[0];
            $this->t->Set('grupo',$grp);

            if($this->group_color != '' && $this->group_suc == ''){
               $this->t->Set('color',$datos['color']);
            }else if($this->group_color == '' && $this->group_suc != ''){
               $this->t->Set('suc',$datos['suc']);
            }else if($this->group_color != '' && $this->group_suc != ''){
               $this->t->Set('suc',$datos['suc']);
               $this->t->Set('color',$datos['color']);
            }
            $this->t->Set('metros',number_format($datos['metros'], 2, ',', '.'));
            $this->t->Set('metrosDev',number_format($datos['metrosDev'], 2, ',', '.'));
            $this->t->Set('metros_p',number_format((((float)$datos['metros']*100)/$sumMts), 3, ',', '.'));
            $this->t->Set('mov',number_format($datos['movs'], 2, ',', '.'));
            $this->t->Set('movDev',number_format($datos['movDev'], 2, ',', '.'));
            $this->t->Set('mov_p',number_format((($datos['movs']*100)/$sumMovs), 3, ',', '.'));
            $this->t->Set('margen',number_format($datos['margen'], 2, ',', '.'));
            $this->t->Set('margen_p',number_format((($datos['costos']*100)/$porcentajes['totalCostos']), 3, ',', '.'));
            $this->t->Set('margenDev',number_format($datos['margenDev'], 2, ',', '.'));
            $this->t->Set('margenDev_p',number_format((($datos['margenDev']*100)/$porcentajes['totalCostos']), 3, ',', '.'));
            $this->t->Show('table_suc_data');
         }
      }

      
      //print_r($this->porcentajeFacturas($this->desde,$this->hasta,$this->target_suc,$filtro_articulos));
      $this->t->Set('pTotalMetros',number_format($porcentajes['difCount'], 2, ',', '.'));
      $this->t->Set('pTotalMov',number_format($porcentajes['difSumFacts'], 2, ',', '.'));
      $this->t->Set('sumMts',number_format($sumMts, 2, ',', '.'));
      $this->t->Set('sumMovs',number_format($sumMovs, 2, ',', '.'));
      $this->t->Set('sumMagen',number_format($sumMargen, 2, ',', '.'));
      $this->t->Set('sumMtsDev',number_format($sumMtsDev, 2, ',', '.'));
      $this->t->Set('sumMovsDev',number_format($sumMovsDev, 2, ',', '.'));
      $this->t->Set('sumMagenDev',number_format($sumMargenDev, 2, ',', '.'));
      $this->t->Show('footer');
   }

   function porcentajeFacturas($desde,$hasta,$suc,$filtro_articulos){
      $link = new My();
      $link1 = new My();
      $countFacts = 0;
      $sumFacts = 0;
      $dtCountFacts = 0;
      $dtSumFacts = 0;
      $data = array();

      $link->Query("SELECT sum(d.cantidad) sumMts,sum(d.subtotal) as sumFacts,sum(precio_costo*cantidad) as sumCostos from factura_venta f inner join fact_vent_det d using(f_nro) where f.estado='Cerrada' AND f.fecha_cierre BETWEEN '$desde' AND '$hasta' AND f.suc LIKE '$suc'");

      if($link->NumRows()>0){
         $link->NextRecord();
         $totalMts = (float)$link->Record['sumMts'];
         $totalMov = (float)$link->Record['sumFacts'];
         $totalCostos = (float)$link->Record['sumCostos'];
         $link->Close();
      }

      $link1->Query("SELECT sum(d.cantidad) sumMts,sum(d.subtotal) as sumFacts,sum(precio_costo*cantidad) as sumCostos from factura_venta f inner join fact_vent_det d using(f_nro)
      where $filtro_articulos AND f.estado='Cerrada' AND f.fecha_cierre BETWEEN '$desde' AND '$hasta' AND f.suc LIKE '$suc'");

      if($link1->NumRows()>0){
         $link1->NextRecord();
         $totalMtsFiltered = (float)$link1->Record['sumMts'];
         $totalMovFiltered = (float)$link1->Record['sumFacts'];
         $totalCostoFiltered = (float)$link->Record['sumCostos'];
         $link1->Close();
      }

      
      $difCount = ($totalMts > 0)?(($totalMtsFiltered*100)/$totalMts):0.00;
      $difSumFacts = ($totalMov > 0)?(($totalMovFiltered*100)/$totalMov):0.00;
      $difSumCostos = ($totalCostos > 0)?(($totalCostosFiltered*100)/$totalCostos):0.00;

      $data['totalMts'] = $totalMts;
      $data['totalMov'] = $totalMov;
      $data['totalCostos'] = $totalCostos;

      $data['difCount'] = $difCount;
      $data['difSumFacts'] = $difSumFacts;
      $data['difSumCostos'] = $difSumCostos;
      return $data;
   }

   function comillas($st){
      return "'".$st."'";
   }

   function getArticulosInGrupo($grupo){
      $link = new My();
      $articulos = array();
      $grupos = array();
      //echo "SELECT ItmsGrpCod,RTRIM(SUBSTRING(ItemName,1,CHARINDEX('-',ItemName)-1)) as grupo,ItemCode,LTRIM(SUBSTRING(ItemName,CHARINDEX('-',ItemName)+1,LEN(ItemName))) as ArticuloNombre FROM OITM where ItmsGrpCod like '$grupo' order by ArticuloNombre asc";
      $link->Query("SELECT s.cod_sector, s.descrip AS sector,codigo,a.descrip AS articulo FROM articulos a, sectores s WHERE a.cod_sector = s.cod_sector AND s.cod_sector = '$grupo' ORDER BY articulo ASC");
      while($link->NextRecord()){
         $articulos[$link->Record['codigo']] = $link->Record['articulo'];
         $grupos[$link->Record['codigo']] = $link->Record['sector']; 
      }
      return array('articulos'=>$articulos,'grupos'=>$grupos);
   }

   private function flipDate($date,$separator){
      $date = explode($separator,$date);
      return $date[2].'-'.$date[1].'-'.$date[0];
   }

   function verMargen($usuario){
         $link = new My();
         $link->Query("SELECT count(*) as ok FROM usuarios_x_grupo WHERE id_grupo= 14 AND usuario = '$usuario'");
         $link->NextRecord();
         $ok = (int)$link->Record['ok'];
         $link->Close();

         if($ok>0){            
            return true;
         }else{
            return false;
         }
   }
}

new VentasPorSectorArticulos();
?>