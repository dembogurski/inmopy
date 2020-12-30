<?PHP
session_start();

require_once("../Config.class.php");
require_once("../Y_DB_MySQL.class.php");
require_once("../Y_Template.class.php");
require_once("../Ajax.class.php");
require_once("../Functions.class.php");

class InventarioProducto {
   function __construct(){         
        
   }
   public function start(){
      $t = new Y_Template("InventarioProducto.html");   
      $suc = $_REQUEST['suc'];
      $link = new My();
      //$link->Query("SELECT if(id is null,date(now()), min(fecha)) as fechaIni FROM inventario WHERE suc = '$suc'");
      $link->Query("SELECT id_inv,inicio as fechaIni, DATE_FORMAT(inicio,'%d/%m/%Y %H:%i:%s') AS fechaFormat FROM inventario_cab WHERE suc='$suc' AND estado='En_proceso'");
      $id_inv = '';
      $fechaIni = '';
      $fechaFormat = '';
      if($link->NextRecord()){
          $id_inv = $link->Record['id_inv'];
          $fechaIni = $link->Record['fechaIni'];
          $fechaFormat = $link->Record['fechaFormat'];
      }
      
      $c = new Config();
      $host = $c->getNasHost();
      $path = $c->getNasFolder();
      $images_url = "http://$host/$path/";
      
      $link->Close();
      $t->Set("id_inv", $id_inv);
      $t->Set("fechaIni", $fechaIni);
      $t->Set("fechaIni", $fechaIni);
      $t->Set("fechaFormat", $fechaFormat);
      $t->Set("images_url", $images_url);
      $t->Show("header");
      $t->Show("body");
       
      $t->Show("footer");
                
   }

                

   public function insertarRegistro(){
       $msj = array();
       $usuario = $_POST['usuario'];
       $id_inv = $_POST['id_inv'];
       $suc = $_POST['suc'];
       $um = $_POST['um'];
       $lote= trim($_POST['lote']);
       $codigo= $_POST['codigo'];
       $stock_ini= $_POST['stock_ini'];
       $gramaje_ini= $_POST['gramaje_ini'];
       $ancho_ini= $_POST['ancho_ini'];
       $tara_ini= (strlen(trim($_POST['tara_ini'])) == 0)?0:trim($_POST['tara_ini']);
       $kg_calc= $_POST['kg_calc'];
       $kg_desc_ini= $_POST['kg_desc_ini'];
       $tipo_ini= $_POST['tipo_ini'];
       $stock= $_POST['stock'];
       $gramaje= $_POST['gramaje'];
       $ancho= $_POST['ancho'];
       $tara= $_POST['tara'];
       $kg= $_POST['kg'];
       $kg_desc= $_POST['kg_desc'];
       $tipo= $_POST['tipo'];
       $actualizarKgDesc = ($_POST['actualizarKgDesc']=='false')?false:true;
       

       $link = new My();
       $link->Query("INSERT INTO inventario (id_inv,usuario, suc, um, lote, codigo, stock_ini, gramaje_ini, ancho_ini, tara_ini, kg_calc,kg_desc_ini, tipo_ini, stock, gramaje, ancho, tara, kg, kg_desc, tipo) VALUES ($id_inv,'$usuario', '$suc','$um', '$lote', '$codigo', $stock_ini, $gramaje_ini, $ancho_ini, $tara_ini, $kg_calc,$kg_desc_ini, '$tipo_ini', $stock, $gramaje, $ancho, $tara, $kg, $kg_desc, '$tipo')");
       if($link->AffectedRows()>0){
           array_push($msj,array("status" => "ok", "msj" => "Se realizo el registro de inventario correctamente"));
       }else{
           array_push($msj,array("status" => "error", "msj" => "No se pudo insertar el registro"));           
       }
       

       if($actualizarKgDesc){
                
           $link->Query("UPDATE lotes set kg_desc=$kg_desc WHERE codigo = '$codigo' and lote = $lote");
           if( $link->AffectedRows() > 0 ){
               array_push($msj,array("status" => "ok", "msj" => "Se actualizo el Kg de Descarga"));
           }else{
               array_push($msj,array("status" => "error", "msj" => "No se actualizo el Kg de Descarga"));
           }
                
       }
       $link->Close();
       echo json_encode($msj);
   }

   public function registrosAnteriores($lote,$suc){
       $link = new My();       
       $registros = array();
                
       $query = "SELECT id_inv, usuario,suc,um,stock,gramaje,ancho,tara,kg,date_format(date(fecha),'%d-%m-%Y') as fecha, time(fecha) as hora FROM inventario WHERE lote = '$lote' and suc like '$suc'";
       //echo $query;
       $link->Query($query);
       if($link->NumRows()>0){
           while($link->NextRecord()){
               array_push($registros,$link->Record);
           }           
       }
       $link->Close();  
       echo json_encode($registros);
       //echo json_encode(array("query"=>$query));
   }
                
   public function esRollo($lote,$codigo){
                
       if($this->verifRollo($lote,$codigo)){
           echo '{"esRollo":1}';
       }else{
           echo '{"esRollo":0}';
       }       
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
   /*
   * Cantidad de lotes inventariados por dia en un rango de fecha
   */
   public function verifAvance($fechaIni,$suc,$codigo,$id_inv){
       $respuesta = array();
       $link = new My();
                
       $link->Query("SELECT COUNT(distinct lote) AS inv FROM inventario WHERE codigo = '$codigo' AND suc = '$suc' AND id_inv=$id_inv");
       $link->NextRecord();
       $respuesta['inventariados'] = $link->Record['inv'];
                
       
       $link->Query("SELECT COUNT(DISTINCT l.lote) AS lotes  FROM articulos a INNER JOIN lotes l  ON a.codigo = l.codigo  INNER JOIN  stock s ON l.codigo = s.codigo AND l.lote = s.lote 
       INNER JOIN historial h ON l.codigo = h.codigo AND l.lote = h.lote 
       WHERE  s.cantidad > 0   AND s.suc = '$suc'   AND a.codigo = '$codigo'  AND h.fecha_hora < '$fechaIni'     ");
       
       $link->NextRecord();
       $respuesta['lotes'] = $link->Record['lotes'];
       $link->Close();
              
       echo json_encode($respuesta);
   }

   /*
   * Busca los datos de lote 
   */
   public function buscarDatosDeCodigo($lote, $suc){
       $db = new My();
       $my = new My();
       $datos = array();
       $query = "SELECT   a.codigo AS Codigo,l.lote,CONCAT( a.descrip, '-', p.nombre_color) AS Descrip , s.suc, s.cantidad AS Stock, s.estado_venta,a.um AS UM,l.ancho AS Ancho,l.gramaje AS Gramaje,l.tara AS Tara,l.padre AS Padre,s.ubicacion AS U_ubic,
       l.img AS Img, l.kg_desc AS U_kg_desc,h.fecha_hora AS entDate

       FROM articulos a INNER JOIN lotes l  ON a.codigo = l.codigo  INNER JOIN  stock s ON l.codigo = s.codigo AND l.lote = s.lote 
       INNER JOIN pantone p ON  l.pantone = p.pantone INNER JOIN historial h ON l.codigo = h.codigo AND l.lote = h.lote
       WHERE  s.cantidad > 0   AND s.suc = '$suc'   AND l.lote ='$lote' GROUP BY lote ORDER BY h.fecha_hora ASC LIMIT 1";
       
       $my->Query($query);
       if($my->NextRecord()){
           $datos = $my->Record;
           if(count($datos)){
               $datos = array_map("utf8_encode",$datos);
              // print_r($datos);
                
               $rem = "SELECT CONCAT(fecha_cierre,' ',hora_cierre) AS fecha_ingreso FROM nota_remision n, nota_rem_det d WHERE n.n_nro = d.n_nro AND lote = '$lote' AND n.estado = 'Cerrada' AND n.suc_d = '$suc'";
                
               $db->Query($rem);
               if($db->NumRows() > 0){ 
                   $db->NextRecord();
                   $fecha_ingreso = $db->Record['fecha_ingreso'];
                   $datos['entDate'] = $fecha_ingreso;
               }
               // Buscar si esta en una Remision Abierta o En Proceso
               $rem2 = "SELECT n.n_nro, n.suc_d FROM nota_remision n, nota_rem_det d WHERE n.n_nro = d.n_nro AND lote = '$lote' AND n.estado != 'Cerrada' AND n.suc = '$suc'";
                
               $db->Query($rem2);
               if($db->NumRows() > 0){ 
                   $db->NextRecord();
                   $n_nro = $db->Record['n_nro'];
                   $destino = $db->Record['suc_d'];
                   $datos['NroRemision'] = $n_nro;
                   $datos['Destino'] = $destino;
                   $datos['Mensaje']="En Remision";
               }else{
                  $datos['Mensaje']="Ok"; 
               }
                
           }
            echo json_encode($datos);
       }else{
           echo '{"Mensaje":"Error: Codigo no encontrado!"}';
       }       
       $my->Close();
   }

   /*
   * Foto
   */
   public function lotesSimilares($lote){
       $db = new My();
       $db->Query("SELECT  l.img   FROM articulos a INNER JOIN lotes l  ON a.codigo = l.codigo  INNER JOIN  stock s ON l.codigo = s.codigo AND l.lote = s.lote WHERE  s.cantidad > 0  AND l.lote ='$lote'");
       if($db->NumRows() > 0){
           $db->NextRecord();
           $img = $db->Get('img');
           $f = new Functions();
           $lotes = $f->getResultArray("SELECT l.lote, l.img, s.suc FROM articulos a INNER JOIN lotes l  ON a.codigo = l.codigo  INNER JOIN  stock s ON l.codigo = s.codigo AND l.lote = s.lote WHERE  s.cantidad > 0  AND l.img = '$img' and l.img <> '' and l.img is not null ");           
           echo json_encode($lotes);
       }else{
           echo json_encode(array());
       }
       
   }

   public function guardarImagen(){
        require_once '../Config.class.php';
        require_once '../utils/NAS.class.php';
        $lote_principal = $_POST['lote'];
        $lotes = $_POST['lotes'];
        $my_link = new My();
        $file;
        $thumnail;
        $image_info;
        $width;
        $height;
        $type;
        $respuesta = array();

        if($_FILES['file']['error'] > 0) { echo 'Error during uploading, try again'; }        
        $extsAllowed = array( 'jpg', 'jpeg', 'png');
        // Extension
        $extUpload = strtolower( substr( strrchr($_FILES['file']['name'], '.') ,1) ) ;

        // Permitidos
        if (in_array($extUpload, $extsAllowed) ) {
            $name = "img/{$_FILES['file']['name']}";
            $tmp_file = $_FILES['file']['tmp_name'];
            $file = file_get_contents($tmp_file);
            $image_info = getimagesize($tmp_file);
            $width = $new_width = $image_info[0];
            $height = $new_height = $image_info[1];
            $type = $image_info[2];
            // Load the image
            switch ($extUpload)
            {
                case 'jpg':
                    $image = imagecreatefromjpeg($tmp_file);
                    break;
                case 'gif':
                    $image = imagecreatefromgif($tmp_file);
                    break;
                case 'png':
                    $image = imagecreatefrompng($tmp_file);
                    break;
                default:
                    die('Error loading '.$tmp_file.' - File type '.$extUpload.' not supported');
            }

            // Create a new, resized image
            $new_width = 150;
            $new_height = $height / ($width / $new_width);
            $new_image = imagecreatetruecolor($new_width, $new_height);
            imagecopyresampled($new_image, $image, 0, 0, 0, 0, $new_width, $new_height, $width, $height);
            
            // Save the new image over the top of the original photo
            ob_start(); 
            switch ($extUpload)
            {
                case 'jpg':
                    imagejpeg($new_image);
                    $thumnail = ob_get_clean();
                    break;
                case 'gif':
                    imagegif($new_image);         
                    $thumnail = ob_get_clean();
                    break;
                case 'png':
                    imagepng($new_image);
                    $thumnail = ob_get_clean();
                    break;
                default:
                    die('Error saving image: '.$tmp_file);
            }        
            ob_end_clean(); 

        }else{ 
            $respuesta['error'] = "Archivo invalido tipos permitidos ".$extsAllowed[0].", ".$extsAllowed[1].", o ".$extsAllowed[2]; 
        }
        
        $my_link->Query("SELECT id_ent FROM lotes WHERE lote = '$lote_principal'");
        if($my_link->NextRecord()){            
                
            $id_ent = $my_link->Record['id_ent'];
            try{
                $c = new Config();
                $username = $c->getNasUser();
                $password = $c->getNasPassw();
                $path = $c->getNasPath();
                $folder = $c->getNasFolder();
                $port = $c->getNasPort();
                $host = $c->getNasHost();

                $full_path = $path."/$folder/$id_ent";
                $filename = $full_path."/$lote_principal.jpg";
                $nas = new NAS($host,$port);
                //$nas = new NAS("192.168.2.252","22");
                $nas->login($username, $password);
                $nas->mkdir($full_path);
                $nas->setContent($file ,$filename);
                $thumname = $full_path."/$lote_principal.thum.jpg";
                $nas->setContent($thumnail,$thumname);
                $file_url = "http://$host/$folder/$id_ent/$lote_principal.jpg";        
                
                $lista_lotes = $this->buscarHijos($lotes);
                $my_link->Query("UPDATE lotes SET  img = '$id_ent/$lote_principal' WHERE lote in ($lista_lotes)");

                if($my_link->AffectedRows() >0 ){
                    $respuesta['msj']="Lote se actualizo";
                }else{
                    $respuesta['msj']="Error al actualizar lote";
                }
                
                $respuesta['url'] = $file_url;
                $respuesta['host'] = $_SERVER['REMOTE_ADDR'];
                
            }catch (Exception $e) {
                $respuesta['error'] = $e->getMessage();
            }
        }
        $this->imgLog($lotes,"Asignar $id_ent/$lote_principal");
        echo json_encode($respuesta);
   }

   public function asignarImagenExistente($ref,$lotes){
       $my_link = new My();
       $my_link->Query("SELECT img FROM lotes WHERE lote = '$ref'  LIMIT 1");

        if($my_link->NextRecord()){            
             
            $img = $my_link->Record['img'];            
            $my_link->Query("UPDATE lotes SET img = '$img' WHERE lote in ($lotes)");
            $my_link->Close();
            $this->imgLog($lotes,"Asignar $ref");
        }
        
        echo '{"data":"Ok"}';
    }

    public function imgLog($lotes,$accion){
        $link = new My();
        $link->Query("INSERT INTO logs (usuario, fecha, hora, accion, tipo, doc_num, data) VALUES ('Sistema', DATE(NOW()), TIME(NOW()), '$accion', 'Lote', '', '$lotes')");
        $link->Close();
    }

    /*
    * Busca Hijos y Nietos
    */
    public function buscarHijos($lote){
        $my_link = new My();
        $l_lotes = trim(implode(',',array_map(array($this,'comillas'),explode(',',$lote))),',');
        $lotes = $l_lotes;
        $seguir = true;
        $padre = $l_lotes;
        while($seguir){
            $my_link->Query("SELECT DISTINCT lote FROM lotes WHERE padre in ($padre)");
            if($my_link->NumRows() >0 ){
                $padre = '';
                while($my_link->NextRecord()){
                    $lotes .= ",'".$my_link->Record['DistNumber']."'";
                    $padre .= (strlen($padre)>0)?",'".$my_link->Record['lote']."'" : "'".$my_link->Record['lote']."'";
                }
            }else{
                $seguir = false;
            }
        }
        $my_link->Close();
        
        return $lotes;
    }
    // Agrega comillas
    function comillas($st){
        return "'".$st."'";
     }

    // Nuevo proceso de inventario
    public function nuevo_inventario($usuario,$suc){
        $respuesta = array();
        $my = new My();
        $my->Query("INSERT INTO inventario_cab (usuario, suc,inicio) VALUES ('$usuario', '$suc',CURRENT_TIMESTAMP)");
        if($my->AffectedRows()>0){
           $my->Query("SELECT id_inv,inicio, DATE_FORMAT(inicio,'%d/%m/%Y %H:%i:%s') AS fechaFormat FROM inventario_cab WHERE suc='$suc' AND estado='En_proceso' ORDER BY id_inv DESC LIMIT 1");
           if($my->NextRecord()){
              $respuesta['id_inv'] = $my->Record['id_inv'];
              $respuesta['fechaIni'] = $my->Record['inicio'];
              $respuesta['fechaFormat'] = $my->Record['fechaFormat'];
              $my->Close();
           }else{
               $respuesta['erro'] = 'No se pudo generar nuevo proceso de inventario!';
           }
        }
        echo json_encode($respuesta);
    }

    // Finalizar Inventario
    public function fin_inventario($id_inv, $usuario){
        $my = new My();
        $my->Query("UPDATE inventario_cab SET estado='Cerrada', fin=CURRENT_TIMESTAMP, cerrado_por = '$usuario' WHERE id_inv=$id_inv");
        if($my->AffectedRows()>0){
            $respuesta['estado'] = 'OK';
            $my->Close();
        }else{
            $respuesta['erro'] = 'No se pudo generar nuevo proceso de inventario!';
        }
        echo json_encode($respuesta);
    }
    
    function historial($lote,$suc){
                
        $sql = "SELECT  tipo_doc,nro_doc,date_format(fecha_hora,'%d-%m-%Y %H:%i') as fecha_hora,usuario,h.cantidad,h.gramaje,h.tara,h.ancho,a.costo_prom FROM articulos a INNER JOIN lotes l  ON a.codigo = l.codigo  
        INNER JOIN  stock s ON l.codigo = s.codigo AND l.lote = s.lote  
        INNER JOIN historial h ON l.codigo = h.codigo AND l.lote = h.lote 
        WHERE  s.suc = '$suc'   AND l.lote = '$lote' ";
                
        $f = new Functions(); 
        echo json_encode($f->getResultArray($sql));
    }
                
}

$inventario = new InventarioProducto();
if(isset($_POST['inv_action'])){
    call_user_func_array(array($inventario,$_POST['inv_action']), explode(',', $_POST['args']));
}else{
    $inventario->start();
}

?>