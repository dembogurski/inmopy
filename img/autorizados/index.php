<?php
// error_reporting (E_ALL ^ E_NOTICE);
// gallery settings

if(isset($_REQUEST['action'])){
    $action =  $_REQUEST['action'];
    $name = $_REQUEST['name'];
    if($action == "rotate"){
       $source = imagecreatefromjpeg("Aaa.jpg");        
       $rotate = imagerotate($source, 90, 0);
       imagejpeg($rotate,"Aaa.jpg");
       
       $source2 = imagecreatefromjpeg("thumbs/Aaa.jpg");        
       $rotate2 = imagerotate($source2, 90, 0);
       imagejpeg($rotate2,"thumbs/Aaa.jpg");
       
    }else{
        $data = $_REQUEST['imagen'];
        
        file_put_contents($name.'.jpg', base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $data)));
        echo "Ok";
        die();
    }
}else{
      
$itemsPerPage = '30';         // number of images per page    
$thumb_width  = '220';        // width of thumbnails
$thumb_height = '120';         // height of thumbnails
$src_folder   = '.';             // current folder

$auth_path = 'img/autorizados/';

 

$src_files    = scandir($src_folder); // files in current folder
$extensions   = array(".jpg",".png",".gif",".JPG",".PNG",".GIF"); // allowed extensions in photo gallery

// create thumbnails from images
function make_thumb($folder,$src,$dest,$thumb_width) {

	$source_image = imagecreatefromjpeg($folder.'/'.$src);
	$width = imagesx($source_image);
	$height = imagesy($source_image);
	
	$thumb_height = floor($height*($thumb_width/$width));
	
	$virtual_image = imagecreatetruecolor($thumb_width,$thumb_height);
	
	imagecopyresampled($virtual_image,$source_image,0,0,0,0,$thumb_width,$thumb_height,$width,$height);
	
	imagejpeg($virtual_image,$dest,100);
	
}

// display pagination
function print_pagination($numPages,$currentPage) {
     
   echo 'Page '. $currentPage .' of '. $numPages;
   
   if ($numPages > 1) {
      
	   echo '&nbsp;&nbsp;';
   
       if ($currentPage > 1) {
	       $prevPage = $currentPage - 1;
	       echo '<a href="'. $_SERVER['PHP_SELF'] .'?p='. $prevPage.'">&laquo;&laquo;</a>';
	   }	   
	   
	   for( $e=0; $e < $numPages; $e++ ) {
           $p = $e + 1;
       
	       if ($p == $currentPage) {	    
		       $class = 'current-paginate';
	       } else {
	           $class = 'paginate';
	       } 
	       

		       echo '<a class="'. $class .'" href="'. $_SERVER['PHP_SELF'] .'?p='. $p .'">'. $p .'</a>';
		  	  
	   }
	   
	   if ($currentPage != $numPages) {
           $nextPage = $currentPage + 1;	
		   echo '<a href="'. $_SERVER['PHP_SELF'] .'?p='. $nextPage.'">&raquo;&raquo;</a>';
	   }	  	 
   
   }

}

}
?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Galeria de Autorizados Marijoa Tejidos</title>
<!--  <script type="text/javascript" src="../../js/jquery-1.11.2.min.js" ></script> -->
<style type="text/css">
body {
background:#d9d9d9;
margin:0;
padding:0;
font:12px arial, Helvetica, sans-serif;
color:#222;
}

.gallery {
position:relative;
overflow:hidden;
width:1020px;
margin:15px auto;
padding:50px;
background:#eee;
}

.gallery a:link,
.gallery a:active,
.gallery a:visited {
color:#555;
outline:0;
text-decoration:none;
}

/*.gallery a:hover {color:#fc0;} 
*/
.gallery img {border:0;}
.gallery .float-left {float:left;}
.gallery .float-right {float:right;}
.gallery .clear {clear:both;}
.gallery .clearb10 {padding-bottom:10px;clear:both;}

.gallery .titlebar {
height:24px;
line-height:24px;
margin:0 5px;
}

.gallery .title {
font-size:18px;
font-weight:400;
}

.gallery .thumb {
overflow:hidden;
float:left;
width:215px;
height:150px;
margin:5px;
border:5px solid #fff;
}

.gallery .thumb:hover {
/*width:215px;
height:150px;
border: orange 1px solid;*/
background-color: orange;
}

/***** pagination style *****/
.gallery .paginate-wrapper {
padding:10px 0;
font-size:11px;
}

.gallery a.paginate {
color:#555;
padding:0;
margin:0 2px;
text-decoration:none;
}

.gallery a.current-paginate, 
.gallery a.paginate:hover {
color:#333;
font-weight:700;
padding:0;
margin:0 2px;
text-decoration:none;
}

.gallery a.paginate-arrow {
text-decoration:none;
border:0;
}
 
</style>

<script>


    function loadImageFileAsURL(){ 
    
     
    $("#guardar").attr("disabled",true);
    var filesSelected = document.getElementById("image-picker").files;
    
    if (filesSelected.length > 0)  {
        var fileToLoad = filesSelected[0];  
        var fileReader = new FileReader(); 
        fileReader.onload = function(fileLoadedEvent){           
            //var textAreaFileContents = document.getElementById("textAreaFileContents");     
            //textAreaFileContents.innerHTML = fileLoadedEvent.target.result;
            $("#textAreaFileContents").val(fileLoadedEvent.target.result);
            
        };        
        fileReader.readAsDataURL(fileToLoad);    
        $("#guardar").removeAttr("disabled");
    }else{
        alert("No se ha tomado ninguna imagen");
    }
    
    $("#msg_form").html("");
}


function subirImagen(){
    var imagen = $("#textAreaFileContents").val();
    var nro_cedula = $("#nro_cedula").val();
    if(imagen != "" && nro_cedula != "" ){
         
    $.ajax({
        type: "POST",
        url: "img/autorizados/index.php",
        data: {"action": "saveImageBase64Test", "imagen": imagen,name:nro_cedula},
        async: true,
        dataType: "html",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading.gif' width='22px' height='22px' >");                      
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText);        
                if(result=="Ok"){
                    $("#msg").html(result+"<img src='img/ok.png' width='22px' height='22px' >");       
                }else{
                    alert("Ocurrio un error en la comunicacion con el Servidor...");
                }
            }
        },
        error: function () {
            $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    });   
    }else{
       alert("Tome una foto e ingrese un Numero de documento");
    }
}
function reload(){
   genericLoad("img/autorizados/index.php");
}
function showImg(url){
    window.open(url);
}
</script>
</head>
<body>

 
    <div style="text-align:center">
        <div style="text-align:center;margin-top:4px;background-color: lightskyblue;font-size: 18px;font-weight: bolder">   Galeria de Autorizados Marijoa Tejidos  </div> 
        <input type="file" id="image-picker" accept="image/*" id="capture" capture="camera" onchange="loadImageFileAsURL()" >
        
        <label><b>Nro Documento:</b></label>    
        <input type="text" id="nro_cedula" value="" size="16">    
        <input type="button"  value="Subir" onclick="subirImagen()" id="guardar" disabled="disabled">    
        
            <span id="msg"></span>   
            <img src="img/refresh-32.png" style="cursor:pointer;margin-left: 30px;margin-bottom: -8px" onclick="reload()" > 
        <input type="hidden" id="textAreaFileContents" value="">
    </div>
    
    
    
<div class="gallery">  
<?php 
 
if(!isset($_REQUEST['action'])){

    //chdir("inmopy/img/autorizados")
    
     

$files = array();
foreach($src_files as $file) {
        
	$ext = strrchr($file, '.');
    if(in_array($ext, $extensions)) {
          
       array_push( $files, $file );
		  
		   
       if (!is_dir($src_folder.'/thumbs')) {
          mkdir($src_folder.'/thumbs');
          chmod($src_folder.'/thumbs', 0777);
          //chown($src_folder.'/thumbs', 'apache'); 
       }
		   
	   $thumb = $src_folder.'/thumbs/'.$file;
       if (!file_exists($thumb)) {
          make_thumb($src_folder,$file,$thumb,$thumb_width); 
          
	   }
        
	}
      
}
 

if ( count($files) == 0 ) {

    echo 'There are no photos in this album!';
   
} else {
   
    $numPages = ceil( count($files) / $itemsPerPage );

    if(isset($_GET['p'])) {
      
       $currentPage = $_GET['p'];
       if($currentPage > $numPages) {
           $currentPage = $numPages;
       }

    } else {
       $currentPage=1;
    } 

    $start = ( $currentPage * $itemsPerPage ) - $itemsPerPage;

    for( $i=$start; $i<$start + $itemsPerPage; $i++ ) {
		  
	   if( isset($files[$i]) && is_file( $src_folder .'/'. $files[$i] ) ) { 
	      $ci = substr($files[$i],0,-4); 
	      echo '<div class="thumb" title="'.$ci.'">
	            <a href="#" onclick=showImg("'.$auth_path.''. $files[$i] .'") class="albumpix" rel="albumpix">
			       <img src="'. $auth_path .'thumbs/'. $files[$i] .'" width="'.$thumb_width.'" height="'.$thumb_height.'" alt="" />
				</a>
                    <div style="text-align:center"><b>Doc.: '.$ci.'</b></div>            
		    </div>'; 
       
	    } else {
		  
		  if( isset($files[$i]) ) {
		    echo $files[$i];
		  }
		  
		}
     
    }
	   

     echo '<div class="clear"></div>';
  
     echo '<div class="p5-sides">
	         <div class="float-left">'.count($files).' images</div>
	 
	         <div class="float-right" class="paginate-wrapper">';
        	 
              print_pagination($numPages,$currentPage);
  
       echo '</div>
	 
	         <div class="clearb10">
		   </div>';

}
}
?>
  
</div>   

</body>
</html>