<?php

require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");
require_once("../barcodegen/RadPlusBarcodeNoFont.php");

class Credencial {

    function Credencial() {
        $t = new Y_Template("Credencial.html");
        $usuario = $_REQUEST['usuario'];
        $action = $_REQUEST['action'];
        
        
         
        $t->Set("usuario",$usuario); 
        
        if($action!="showform"){
            //$password = $_REQUEST['password'];
            
            //$p1 = substr($password, 40, 500);  
            //$p2 = substr($p1, 0, -32); 
                     
            //$clave = sha1($p2);
             
            $db = new My();
            $db->Query("select usuario,passw  from usuarios where usuario = '$usuario' ");
            // echo "select usuario  from usuarios where usuario = '$usuario' and passw = '$clave' ";
            if($db->NumRows()){  
                $db->NextRecord();
                $nombre =  $_REQUEST['nombre'];
                $cargo =  $_REQUEST['cargo']; 
                $passw =  $db->Record['passw']; 
                
                //echo  "Clave encripdada que conoce el Usuario    ". $clave."<br><br>";
                $cadena_encriptada = sha1($passw);
                 
                
                //echo "Cadena encriptada con    $clave =     $cadena_encriptada<br><br>";
                //$ultimos8= substr($cadena_encriptada,-8);
                $ultimos8= substr($cadena_encriptada,-8);
                 
                
                $clave_combinada = $usuario." ".$ultimos8; 
                //echo "Combinacion para el Crasha:   usuario $clave_combinada";
                
                $filename = new RadPlusBarcode();
                $code = $filename->parseCode($clave_combinada,1,20);  
                
                $t->Set("nombre",$nombre); 
                $t->Set("cargo",$cargo); 
                $t->Set("codigo_barras",$code); 
                 
                
                $t->Show("style"); 
                $t->Show("credencial"); 
                
            }else{
                $t->Show("style"); 
                $t->Show("error");
            }
        }else{
            $t->Set("sha",sha1($usuario));    
            $t->Set("md5",md5($usuario)); 
            $t->Show("script");
            $t->Show("form");
        }
    } 

}

new Credencial();
?>

