
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">

<head>
    <title>Marijoa Tejidos</title>
    
    <div style="width: 100%;height: 70px"> 
    <div style="border: solid gray 0px;width: 79%;float: left;text-align: center ">  
        <h3 style="width: 100%">Marijoa Tejidos Galeria de Compras</h3> 
    </div>
    <div style="border: solid red 0px;width: 12%;float: right">
        <a href="./"><img src="../../img/u_arrow.png" height="22px" width="16" title="Subir un Nivel" style="text-decoration: none;margin: 2px" ></a>
    </div>
    </div>
    <link rel="stylesheet" type="text/css" href="../../lib/UberGallery/style.css" />
 
       

    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
 
</head>
    
</html>    

<?php

// Include the UberGallery class
include('../../lib/UberGallery/resources/UberGallery.php');

// Initialize the UberGallery object
$gallery = new UberGallery();

if (isset($_REQUEST['path'])) {
    $path = $_REQUEST['path'];

    // Initialize the gallery array
    $galleryArray = $gallery->readImageDirectory($path);

    // Define theme path
    if (!defined('THEMEPATH')) {
        define('THEMEPATH', $gallery->getThemePath());
    }

    // Set path to theme index
    $themeIndex = $gallery->getThemePath(true) . '/index.php';

    // Initialize the theme
    if (file_exists($themeIndex)) {
        include($themeIndex);
    } else {
        die('ERROR: Failed to initialize theme');
    }
} else {
    $path = getcwd(); 
    listar_directorios($path); 
}

function listar_directorios($ruta) {
    // abrir un directorio y listarlo recursivo 
    if (is_dir($ruta)) {   
        if ($dh = opendir($ruta)) {
            while (($file = readdir($dh)) !== false) { 
                //esta línea la utilizaríamos si queremos listar todo lo que hay en el directorio 
                //mostraría tanto archivos como directorios 
                //echo "<br>Nombre de archivo: $file : Es un: " . filetype($ruta . $file); 
                if (is_dir($file) && $file != "." && $file != "..") {
                    //solo si el archivo es un directorio, distinto que "." y ".." 
                    echo "<div class='compra'>Compra N&deg;:$file</div>";
                    listar_sub_directorios($ruta.'\\'.$file.'\\',$file);
                }
            }
            closedir($dh);
        }
    } else{
        echo "<br>No es ruta valida";
    }
}

function listar_sub_directorios($ruta,$carpeta) {
     
    if (is_dir($ruta)) {    
        if ($dh = opendir($ruta)) {
            while (($file = readdir($dh)) !== false) {  
                //esta línea la utilizaríamos si queremos listar todo lo que hay en el directorio 
                //mostraría tanto archivos como directorios 
                //echo "<br>Nombre de archivo: $file : Es un: " . is_dir( $ruta.$file ); 
                if (is_dir($ruta.$file) && $file != "." && $file != "..") {
                    //solo si el archivo es un directorio, distinto que "." y ".." 
                    $path = "$carpeta/$file";
                    echo "<div class='provider'><a href='index.php?path=$path&provider=$file'>      $file</a></div>";
                    
                }
            }
            closedir($dh);
        }
    } else{
        echo "<br>No es ruta valida";
    }
}
