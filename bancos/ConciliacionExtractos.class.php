<?php

/**
 * Description of ConciliacionExtractos
 * @author Ing.Douglas
 * @date 08/03/2017
 */
require_once("../Y_DB_MySQL.class.php");
require_once("../Y_Template.class.php");

class ConciliacionExtractos {

    function __construct() {
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }

    function main() {
        $t = new Y_Template("ConciliacionExtractos.html");
        $t->Show("header");
        $db = new My();

        $db->Query("SELECT distinct b.id_banco,b.nombre FROM bancos b, bcos_ctas c WHERE b.id_banco = c.id_banco AND (b.id_banco < 003)  ORDER BY b.nombre ASC");
        $bancos = "";
        while ($db->NextRecord()) {
            $id_banco = $db->Record['id_banco'];
            $nombre = $db->Record['nombre'];
            $bancos.="<option value='$id_banco' >$nombre</option>";
        }
        $t->Set("bancos", $bancos);

        $db->QUERY("SELECT  b.id_banco,b.nombre,cuenta,m_cod as moneda FROM bancos b, bcos_ctas c WHERE b.id_banco = c.id_banco AND (b.id_banco < 003)  ORDER BY b.nombre ASC");
        $cuentas = "";
        $i = 0;
        while ($db->NextRecord()) {
            $id_banco = $db->Record['id_banco'];
            $moneda = $db->Record['moneda'];
            $cuenta = $db->Record['cuenta'];
            $cuentas.="<option  class='cta_$id_banco' value='$cuenta' data-moneda='$moneda' >$cuenta - $moneda</option>";
            $i++;
        }
        $t->Set("cuentas", $cuentas);
        $t->Show("body");
        $t->Show("preview");
    }

}

function uploadFile() {
    $banco = $_REQUEST['banco'];
    $cuenta = $_REQUEST['cuenta_env'];
    if (isset($_FILES["FileInput"]) && $_FILES["FileInput"]["error"] == UPLOAD_ERR_OK) {
        ############ Edit settings ##############
        $UploadDirectory = 'extractos/'; //specify upload directory ends with / (slash)
        ##########################################

        /*
          Note : You will run into errors or blank page if "memory_limit" or "upload_max_filesize" is set to low in "php.ini".
          Open "php.ini" file, and search for "memory_limit" or "upload_max_filesize" limit
          and set them adequately, also check "post_max_size".
         */

        //check if this is an ajax request
        if (!isset($_SERVER['HTTP_X_REQUESTED_WITH'])) {
            die();
        }


        //Is file size is less than allowed size.
        if ($_FILES["FileInput"]["size"] > 5242880) {
            die("File size is too big!");
        }

        //allowed file type Server side check
        switch (strtolower($_FILES['FileInput']['type'])) {
            //allowed file types

            case 'text/plain':
            case 'application/vnd.ms-excel': //html file			
                break;
            default:
                die('Tipo de Archivo no soportado!'); //output error
        }

        $File_Name = strtolower($_FILES['FileInput']['name']);
        $File_Ext = substr($File_Name, strrpos($File_Name, '.')); //get file extention
        $hoy = date("d-m-Y_H_i");
        $File_Name = "Extracto_$hoy";
        $NewFileName = $File_Name . $File_Ext; //new file name
        $fullpath = $UploadDirectory.$NewFileName;

        if (move_uploaded_file($_FILES['FileInput']['tmp_name'], $UploadDirectory . $NewFileName)) { 
            parseFile($fullpath,$banco,$cuenta);
            die('Exito:'. $NewFileName.'');
        } else {
            die('Error al subir archivo!');
        }
    } else {
        die('Something wrong with upload! Is "upload_max_filesize" set correctly?');
    }
}

function parseFile($filename,$banco,$cuenta) {            
   if(file_exists($filename)){
        $handle = fopen($filename, "r");
        $content = file_get_contents($filename);          
        
        $db = new My();
        $separator = ",";
        $ignore_lines = 0;
        if($banco == "001"){ // Continental
            $separator = ";";     
            
            // Si es de Continental debe contener las Palabras "Banco Continental S.A.E.C.A."
            $buscar = "Banco Continental S.A.E.C.A.";
            $pos = strpos($content, $buscar);
            if ($pos === false) {  
                die("<b style='color:red;font-size:14px'>Al parecer este archivo no corresponde a un Extracto del Banco Continental S.A.E.C.A.</b> <br> <div style='text-align:left;border:solid gray 1px'> $content </div>");
            }
            $handler = fopen($filename, "r");
            if ($handler) {
                while (($line = fgets($handler)) !== false) {
                    $ignore_lines++;
                    if (strpos($line, "Haber") !== false) { 
                        break;
                    }
                }            
            } 
            fclose($handler);
            
        }else{    // Regional
            $separator = ",";
            $ignore_lines = 2;
            // Si es de Regionar debe contener las Palabras "Saldo Anterior   :"
            $buscar = "Saldo Anterior   :";
            $pos = strpos($content, $buscar);
            if ($pos === false) {  
                die("<b style='color:red;font-size:14px' >Al parecer este archivo no corresponde a un Extracto del Banco Regional</b> <br>  <div style='text-align:left;border:solid gray 1px'> $content </div>");
            }
        }
            
        $i = 0;    
        if ($handle) {
            while (($line = fgets($handle)) !== false) {
                $i++;
                if($banco == "001"){
                    $pos = strpos($line, "Totales"); // Aca debe Terminar para Continental
                    if ($pos !== false) { 
                        die('Exito:'. $NewFileName.'');
                    }
                }
                if($i > $ignore_lines){
                    $arr = explode($separator, $line);
                    $date0 = DateTime::createFromFormat('d/m/Y',  $arr[0]); 
                    $fecha_reg =  $date0->format('Y-m-d');
                    
                    if($banco == "001"){ // Continental
                        $fecha_trans = $fecha_reg;
                    }else{
                        $date1 = DateTime::createFromFormat('d/m/Y',  $arr[1]); 
                        $fecha_trans = $date1->format('Y-m-d');
                    }
            
                   
                    if($banco == "001"){ // Continental
                       $cod_mov = trim($arr[6]);
                       $concepto = trim($arr[10]); 
                    }else{                        
                       $cod_mov = trim($arr[2]);
                       $concepto = trim($arr[3]);
                    }
                    
                    if($cod_mov == ""){
                        $cod_mov = '-';
                    }
                    if($concepto == ""){
                        $concepto = '-';
                    }
            
                    if($banco == "001"){ // Continental
                       if(trim($arr[18]) == ""){ $debe = 0; }else{ $debe = str_replace(".","",$arr[18]);  }                       
                       if(trim($arr[24]) == ""){ $haber = 0; }else{ $haber = str_replace(".","",$arr[24]);  }                       
             
                    }else{// 002 Regional
                        $debe = $arr[4];
                        $haber = $arr[5];
                    } 
                    // echo $line. "<br>";
                    
                    //print_r($arr);
                    //echo  "<br>";
                    
                    //echo "Fecha Reg:". $fecha_reg." FT: ".$fecha_trans." Cod: ".$cod_mov."  Concepto: ".$concepto." Debe: ".$debe."   Haber: ".$haber." <br>";
                    
                    try{                       
                        $db->Query("INSERT INTO extractos_ext( id_banco, cuenta, fecha_reg, fecha_trans, cod_mov, concepto, debe, haber, saldo, confirmado, e_sap)
                        VALUES ('$banco', '$cuenta', '$fecha_reg', '$fecha_trans', '$cod_mov', '$concepto', $debe, $haber,0, 'No', NULL);");
                       
                    }catch(Exception $e){                        
                        echo "Error en la Linea $i<br> Datos:  ". $arr[0]." | ".$arr[1]." | ".$arr[2]." | ".$arr[3]." | ".$arr[4]." | ".$arr[5]."<br>Informacion Tecnica: ".$e->getTraceAsString();
                    }
                    
                    // $arr[0]." | ".$arr[1]." | ".$arr[2]." | ".$arr[3]." | ".$arr[4]." | ".$arr[5]."<br>";   
                }   
                 
            } 
            fclose($handle);
        } else {
            die("Error al abrir el archivo $filename");
        }     
   }else{
       die('Error al crear el archivo, el archivo '. $filename.' no existe!');
   }            
}
            

function getExtractos(){
   $banco = $_REQUEST['banco'];
   $cuenta = $_REQUEST['cuenta']; 
   $desde = $_REQUEST['desde'];
   $hasta = $_REQUEST['hasta'];
   $db = new My();
   $sql = "SELECT id_ext, cuenta,date_format(fecha_reg,'%d-%m-%Y') as fecha_reg,date_format(fecha_trans,'%d-%m-%Y') as fecha_trans,cod_mov,concepto,debe,haber, confirmado ,if(e_sap is null,0,1) as e_sap FROM  extractos_ext e  "
           . "WHERE id_banco =  '$banco' AND e.cuenta = '$cuenta' AND fecha_reg BETWEEN '$desde' AND '$hasta'";
   $array = array();
   $db->Query($sql);
   while ($db->NextRecord()) {
       array_push($array, $db->Record);
   }
   $db->Close();
   echo json_encode($array);   
}
function confirmar(){
    $ids = json_decode($_REQUEST['ids']);
    $db = new My();
  
    foreach ($ids as $value) {
       $db->Query("update extractos_ext set confirmado = 'Si' where id_ext = $value;");        
    }
    echo "Ok";    
}
function eliminar(){
    $ids = json_decode($_REQUEST['ids']);
    $db = new My();
  
    foreach ($ids as $value) {
       $db->Query("delete from extractos_ext where id_ext = $value and e_sap is null;");        
    }
    echo "Ok";    
}
new ConciliacionExtractos();
?>