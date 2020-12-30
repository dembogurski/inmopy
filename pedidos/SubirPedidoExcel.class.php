<?PHP
require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");


class SubirPedidoExel{
    private $template;
    private $compraDet;

    function __construct() {               
    }
    public function start(){
        $this->template = new Y_Template("SubirPedidoExcel.html"); 
        $this->compraDet = $this->getCompraDet();
        $this->template->Show("header");
        foreach($this->compraDet as $key=>$value){
            $this->template->Set($key,$value);
        }
        $this->template->Show("pedData");
        $this->template->Show("footer");        
    }

    // Obtiene el detalle de la compra Internacional abierta 
    public function getCompraDet(){
        $link = new My();
        $link->Query("select n_nro,usuario, fecha, suc, nac_int as tipo, estado from nota_pedido_compra where estado = 'Abierta' and nac_int = 'Internacional' order by n_nro desc limit 1");
        if($link->NextRecord()){
            return $link->Record;
        }else{
            return false;
        }
    }
    // Verificador de Archivo Excel
    public function checkFile(){
        $this->start();
        require_once("../utils\PHPExcel\IOFactory.php");
        $target_dir = "archivos/";
        $target_name = basename($_FILES["fileToUpload"]["name"]);
        $target_file = $target_dir . $target_name;
        $uploadOk = 1;
        $fileType = pathinfo( $target_file, PATHINFO_EXTENSION );
        
        if(isset($_POST["submit"])) {
           $info = "<p class='info'>Archivo $target_name</p>";
        }
        $allowed = array(
            "xls" => array( "application/vnd.ms-excel" ),
            "xlsx" => array(
                "application/vnd.ms-excel",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )
        );

        if(file_exists($target_file) && $_POST['overwrite']) unlink($target_file);
        
        if ( array_key_exists( $fileType, $allowed ) ) {            
                if(file_exists($target_file)){
                    $info .= "<p class='info'>El archivo " . $_FILES["file"]["name"] . " ya Existe.</p>";
                } else{
                    if(move_uploaded_file($_FILES["fileToUpload"]["tmp_name"],  $target_file)){
                        $info .= "<p class='info'>El archivo se cargo correctamente.</p>";
                    }
                }
                 $this->template->Set('upploadInfo',$info);
                 $this->template->Show('upploadInfo');

                try{
                    $inputFileType = PHPExcel_IOFactory::identify($target_file);
                    $objReader = PHPExcel_IOFactory::createReader($inputFileType);
                    //echo $inputFileType;
                    $objPHPExcel = $objReader->load($target_file);
                } catch(Exception $e) {
                    die($e->getMessage());
                }

                //Get worksheet dimensions
                $sheet = $objPHPExcel->getSheet(0);
                $highestRow = $sheet->getHighestRow(); 
                $highestColumn = $sheet->getHighestColumn();

                $colores = $this->getColorList();
                $sucursales = $this->getSucursales();
                //$selec_sucs = call_user_func( function(){ $op = ''; foreach($sucursales as $key=>$value){ $op .= "<option value='$key'>$value</option>"; } return $op;});
                $jarr_colores = '';
                foreach($colores as $Code=>$Name){
                    $jarr_colores .= "'".$Name."',";
                }
                $header = true;
                
                if($highestRow>2){
                    $this->template->Set('sucursales',call_user_func( function() use (&$sucursales){ $op = ''; foreach($sucursales as $key=>$value){ $op .= "<option value='$key'>$value</option>"; } return $op;}));
                    $this->template->Set('colores','['.trim($jarr_colores,',').']');
                    //echo "<br> Error JSON: " . json_last_error () ."<br>";
                    $this->template->Show('dataHeader');
                    for ($row = 2; $row <= $highestRow; $row++){ 
                        $verif = 'file_ok';
                        //  Procesamiento por fila, en un array
                        $rowData = $sheet->rangeToArray('A' . $row . ':' . $highestColumn . $row, NULL, TRUE, FALSE);
                        $data = array_map("trim",$rowData[0]);
                        $codigo = $data[0];
                        $cantidad = 0.00; 
                        $precio = 0.00;
                        $color = '';
                        $suc = '';

                        if(is_numeric($data[1])){ 
                            $cantidad = $data[1]; 
                            $this->template->Set('cantEst','ok');
                        }else{ 
                            $cantidad = $data[1]; 
                            $this->template->Set('cantEst','error');
                            $verif = 'file_error'; 
                        }
                        if(is_numeric($data[2])){ 
                            $precio = $data[2]; 
                            $this->template->Set('precioEst','ok');
                        }else{ 
                            $precio = $data[2]; 
                            $this->template->Set('precioEst','error');
                            $verif = 'file_error'; 
                        }
                        if($colorCode = array_search($data[3],$colores)){ 
                            $color = $data[3]; 
                            $this->template->Set('colorEst','ok');
                        }else{
                            $colorCode = 'none';
                            $color =  $data[3];                         
                            $this->template->Set('colorEst','error');
                            $verif = 'file_error';
                        }
                        
                        if(array_key_exists($data[4],$sucursales)){
                            $suc = $data[4]; 
                            $this->template->Set('sucursal','ok');
                        }else{
                            $suc =  $data[4];
                            $this->template->Set('sucursal','error');
                            $verif = 'file_error';
                        }                    
                        if($codeCheck=$this->getItemData($codigo)){
                            $ItemCode = $codeCheck['ItemCode'];
                            $ItemName = $codeCheck['ItemName'];     
                            $this->template->Set('itemEst','ok');
                        }else{
                            $verif = 'file_error';
                            $this->template->Set('itemEst','error');
                            $ItemCode = $codigo;
                            $ItemName = 'Articulo no Encontrado';                        
                        }
                        $this->template->Set('check',($verif=='file_ok')?'&#9745;':'&#9746;');
                        $this->template->Set('class',$verif);
                        $this->template->Set('ItemCode',$ItemCode);
                        $this->template->Set('ItemName',$ItemName);
                        $this->template->Set('cantidad',$cantidad);
                        $this->template->Set('precio',$precio);
                        $this->template->Set('color',$color);
                        $this->template->Set('colorCode',$colorCode);
                        $this->template->Set('suc',$suc);
                        $this->template->Show('dataBody');
                    }
                    $this->template->Show('dataFooter');
                }
            }else{
                $permitidos = implode(', ',array_keys($allowed));                
                $info .= "<p class='fileError'>Formato '".$fileType."' no permitido, formatos Excel permitidos $permitidos</p>";

                $this->template->Set('upploadInfo',$info);
                $this->template->Show('upploadInfo');
                
            }

    }

    // Obtiene lista de colores 
    private function getColorList(){
        $link = new My();
        $colores = array();
        $query = "SELECT pantone,nombre_color AS color FROM pantone WHERE estado='Activo'";
        $link->Query($query);
        
        while($link->NextRecord()){
            $colores[utf8_encode($link->Record['pantone'])] = utf8_encode($link->Record['color']);
            
        }
        $link->Close();
        return $colores;
    }

    // Obtiene lista de Sucursales
    private function getSucursales(){
        $link = new My();
        $sucs = array();
        $query = "SELECT suc, nombre FROM sucursales WHERE estado <> 'Inactivo' AND tipo IN ('Deposito','Agencia','Sucursal') ORDER BY suc*1 ASC";
        $link->Query($query);
        
        while($link->NextRecord()){
            $suc = $link->Record['suc'];
            $nombre = $link->Record['nombre'];
            $sucs[$suc] = utf8_encode($nombre);
        }
        $link->Close();
        return $sucs;
    }

    // Verifica la Existencia de un color
    public function getColor($color,$json = false){
        $link = new My();
        $link->Query("SELECT pantone,nombre_color AS color FROM pantone WHERE estado='Activo' and nombre_color = '$color'");
        if( $link->NumRows() > 0 ){
            $link->NextRecord();
            $data = $link->Record; 
            $link->Close();
            
        }else{
            $link->Close();
            $data = false;
        }
        if($json){echo json_encode($data?$data:["error"=>"No se encontro ese Color"]);}
        return $data;
    }

    // Obtiene los datos del Articulo
    public function getItemData($itemCode,$json = false){
        $link = new My();
        $link->Query("SELECT codigo , descrip ,um FROM articulos WHERE codigo ='$itemCode'");
        if( $link->NumRows() > 0 ){
            $link->NextRecord();
            $data = $link->Record; 
            $link->Close();
        }else{
            $link->Close();
            $data = false;
        }
        if($json){echo json_encode($data?$data:["error"=>"No se encontro el Articulo"]);}
        return $data;        
    }

    // Inserta los articulos en la nota de pedido Internacional
    public function procesar($filas){        
        $compraData = $this->getCompraDet();
        $n_nro = $compraData['n_nro'];
        $colores = $this->getColorList();
        $user = $_POST['user'];
        $link = new My();

        foreach($filas as $fila){
            $itemData = $this->getItemData($fila[0]);
            $cantidad = $fila[1];
            $precio = $fila[2];
            $color = $colores[$fila[3]];
            $suc = $fila[4];

            $query = "INSERT INTO nota_ped_comp_det (n_nro, usuario, suc, cod_cli, cliente, ponderacion, codigo, lote, um_prod, obs, cantidad, cantidad_pond, precio_venta, color, estado, mayorista, descrip, urge, presentacion) VALUES ( $n_nro, '$user', '$suc', '0', 'MINORISTA', 1.00, '".$itemData['ItemCode']."', '', '".$itemData['InvntryUom']."', '',$cantidad, $cantidad, $precio, '$color', 'Pendiente', 'No', '".$itemData['ItemName']."', 'No', 'Pieza')";
            $link->Query($query);            
        }
        echo '{"msj":"ok"}';
        $link->Close();
    }
}

$spe = new SubirPedidoExel();

if(isset($_REQUEST['action'])){
   if(isset($_REQUEST['args'])){
       call_user_func_array(array($spe,$_REQUEST['action']), explode(',', $_REQUEST['args']));
   }else{
       call_user_func_array(array($spe,$_REQUEST['action']), array(json_decode($_POST['filas'])));
   }
 }else{
     $spe->start();
 }
?>