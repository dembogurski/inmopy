<?php

/**
 * Description of DeclaracionDocumentos
 * @author Ing.Douglas
 * @date 08/10/2018
 */
header('Access-Control-Allow-Origin: *');  
 
require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");

class DeclaracionDocumentos {

    function __construct() {
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }

    function main() {

        $t = new Y_Template("DeclaracionDocumentos.html");
        $t->Show("header");
        $user = $_POST['usuario'];  
        $t->Set("display","none");
        
        $t->Set("display","inline");
        
        $t->Show("form");
        $t->Show("registro");
    }

}

function levantarDocumento() {
    require_once '../Config.class.php';

    /* if ( 0 < $_FILES['file']['error'] ) {
        echo 'Error: ' . $_FILES['file']['error'] . '<br>';
    }else{
        move_uploaded_file($_FILES['file']['tmp_name'], 'files/' . $_FILES['file']['name']);
        echo "File uploaded successfully!!";
    } */
    $c = new Config();

    $suc = $_POST['suc'];
    $i = $_POST['i'];
    $fecha = $_POST['fecha'];
    $imagen = $_POST['imagen'];
    
    //$original_name = $string = preg_replace('/\s+/', '_', $_POST['filename']);   
    $original_name = $string = preg_replace('/\s+/', '_', preg_replace('/\\.[^.\\s]{3,4}$/', '', $_FILES['file']['name']));   
           
    $username = $c->getNasUser();
    $password = $c->getNasPassw();
    $path = $c->getNasPath();
    $folder = "cajas";
    $port = $c->getNasPort();
    //$host = $c->getNasHost();
    $host = "192.168.2.252";

    //$data = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $imagen));
    $data = file_get_contents($_FILES["file"]["tmp_name"]);
    //$data = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $imagen));
    
    $full_path = $path . "$folder/" . $suc . "/" . $fecha."";
    
    
    
    $real_name = date("H-i-s");
    $real_name = $original_name."_$real_name";
    $filename = $full_path . "/$real_name.jpg";

    require_once '../utils/NAS.class.php';
    $nas = new NAS($host, $port);
    $nas->login($username, $password);
    
    $flag =  $nas->mkdir( $path."$folder/$suc");  
    /*if(!$flag){
        $arr = array("mesaje" => "Error", "error" =>"No se pudo crear la carpeta '$suc'");
    }*/
    $flag =  $nas->mkdir($full_path);
    /* if(!$flag){
        $arr = array("mesaje" => "Error", "error" =>"No se pudo crear la carpeta '$full_path'");
    }else{ */

    $nas->setContent($data, $filename);
    $file_url = "http://$host/$folder/$suc/$fecha/$real_name.jpg";    
    $arr = array("mesaje" => "Ok", "url" => $file_url, "name" => $real_name . ".jpg","i"=>$i, "name2"=>$_FILES['file']['name']);
    
    echo json_encode($arr);
}

function listarDocumentos() {
    require_once '../Config.class.php';

    $c = new Config();

    $suc = $_POST['suc'];
    $fecha = $_POST['fecha'];

    $username = $c->getNasUser();
    $password = $c->getNasPassw();
    $path = $c->getNasPath();
    $folder = "cajas";
    $port = $c->getNasPort();
    $host = $c->getNasHost();
    //$host = "192.168.2.252";
    //$host = "190.128.150.70:2252";

       

    require_once '../utils/NAS.class.php';           
    $nas = new NAS($host, $port);
    $nas->login($username, $password);
    
    //echo " login = $login";
    
    //$full_path = $path . "$folder/" . $suc . "/" . $fecha. "/";
    
    $url = "http://$host/$folder/$suc/$fecha/";    
    
    $subject = file_get_contents($url) ;
    
    
    $lines = explode(PHP_EOL, $subject);
    $arr = array();
    foreach ($lines as $key => $value) {
        //echo "$key => $value <br>";
        if(strpos($value,'href=') !== FALSE   && ( strpos($value,'[PARENTDIR]') === FALSE) && ( strpos($value,'[ICO]') === FALSE)   ){
            $pos1 = strpos($value,'href='); 
            $parte1 = substr($value, $pos1+6);
            
            $pos2 = strpos($parte1,'">'); 
            $archivo = substr($parte1,0, $pos2); 
            array_push($arr, $archivo);
        } 
    }
        //print_r($arr);
         
    //$arr = $nas->readDirectory($full_path);  print_r($arr);
      
        //echo "Array xxxxxx $full_path  -->  $arr" ;
    
    $files = array();
    foreach ($arr as $file) {
        //$host = $c->getNasHost();
        $fullname = "http://$host/$folder/$suc/$fecha/$file";  
        
        //$arr2 = explode('/', $fullname );
         
       
         
        
          
        $thum =  str_replace(".jpg",".thum.jpg" , $file );
        $thum = "thums/".$thum;
        
        
        Thumbnail($fullname, $thum );
          
        $imageData = base64_encode(file_get_contents($thum));  
        $thumnail_src = 'data:image/jpeg;base64,'.$imageData;
        
        array_push($files, array("path"=>$fullname,"thumnail"=>$thumnail_src));
    }
    echo json_encode($files); 
}

function Thumbnail($url, $filename, $width = 150, $height = true) {

 // download and create gd image
 $image = ImageCreateFromString(file_get_contents($url));

 // calculate resized ratio
 // Note: if $height is set to TRUE then we automatically calculate the height based on the ratio
 $height = $height === true ? (ImageSY($image) * $width / ImageSX($image)) : $height;

 // create image 
 $output = ImageCreateTrueColor($width, $height);
 ImageCopyResampled($output, $image, 0, 0, 0, 0, $width, $height, ImageSX($image), ImageSY($image));

 // save image
 ImageJPEG($output, $filename, 95); 
//echo $filename;
 // return resized image
 return $output; // if you need to use it
}

function abrirDocumento(){    
    $url = $_GET['url'];
    $cursor = $_GET['cursor'];
    $files = json_decode($_GET['files']);
    
    echo "<script> "
    . "var archivos = [];";
    $i = 0;
    foreach ($files as $file) {
        echo "archivos[$i] = '$file';";
        $i++;
    } 
    echo "</script>";
    
    $t = new Y_Template("DeclaracionDocumentos.html"); 
    // Read image path, convert to base64 encoding
    $imageData = base64_encode(file_get_contents($url)); 
    // Format the image SRC:  data:{mime};base64,{data};
    $src = 'data:image/jpeg;base64,'.$imageData;
    $t->Set("cursor",$cursor);
    $t->Set("src",$src);
    $t->Show("edicion");
}
 


new DeclaracionDocumentos();
?>

