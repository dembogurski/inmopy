<?php

/**
 * Description of Clientes
 * @author Doglas A. Dembogurski
 * @date 24/02/2015
 */
class Clientes {

    function __construct() {
        
    }

    /*
     * Funcion para buscar Clientes 
     * @param $criterio  de busqueda,campo de la tabla
     */

    function buscarCliente($criterio, $campo, $limit) {
         
        $ms = new My();
        $filtro = "";
        if($campo == 'CardName'){
            //$criterios = array_map('trim',explode(' ',preg_replace('/\s{2,}/', ' ', $criterio)));
            //$filtro = implode("%' or nombre like '%", $criterios);
            $filtro = "nombre like '%$criterio%'";
        }else{
            $filtro = " ci_ruc like '$criterio%' ";
        } 
        $qry = "SELECT  cod_cli AS Codigo,nombre AS Cliente,ci_ruc AS RUC,cat AS Cat,IF(moneda IS NULL,'G$',moneda) AS Moneda,IF( tipo_doc IS NULL,'C.I.',tipo_doc) AS TipoDoc, ciudad AS Ciudad,tel AS Tel,dir AS Dir FROM clientes WHERE $filtro  LIMIT   $limit ";
        
        //echo $qry;
        
        $ms->Query($qry);
         
        $clientes = array();
        while ($ms->NextRecord()) { 
            array_push($clientes,  array_map('utf8_encode', $ms->Record)); 
        }
        echo json_encode($clientes);
    }

    function getABM() {
        require_once("../Y_Template.class.php");
        $t = new Y_Template("../clientes/Clientes.html"); 
        $t->Show("abm");
    }
     

    /**
     * 
     * @param type $usuario
     * @param type $ruc
     * @param type $nombre
     * @param type $tel
     * @param type $fecha_nac
     * @param type $pais
     * @param type $ciudad
     * @param type $dir
     * @param type $ocupacion
     * @param type $situacion
     * @todo Recibir tipo de cliente Local o Del Exterior
     */
    function registrarCliente($usuario, $ruc, $nombre, $tel, $fecha_nac, $pais, $ciudad, $dir, $ocupacion, $situacion, $tipo,$tipo_doc,$suc) {
        try{
            require_once("Y_DB_MySQL.class.php");
            $db = new My();

            $date =  str_replace("/","-", $fecha_nac);

            $date = new DateTime($date);
            $fecha_nac = $date->format('Y-m-d');
                        
            $ms = new My();
            $SQLCardCode = "SELECT CONCAT('C',LPAD((SUBSTRING(cod_cli,2) +1),6,'0')) as CardCode   FROM clientes ORDER BY cod_cli DESC LIMIT 1";
            $ms->Query($SQLCardCode);
            $ms->NextRecord();           
            $NewCardCode = $ms->Record['CardCode']; // Actual Max CardCode
            $cta_cont = '112201';
            $pais = strtoupper($pais);
            if($pais !== "PARAGUAY"){
               $cta_cont = '112202';
            }
                       
            $db->Query("INSERT INTO clientes (cod_cli, tipo_doc, ci_ruc, nombre, cat, suc, tel, email, fecha_nac, pais, estado, ciudad, dir, ocupacion, situacion,tipo,usuario, e_sap,fecha_reg,cta_cont)
            VALUES ('$NewCardCode', '$tipo_doc', '$ruc', upper('$nombre'), 1, '$suc', '$tel', '', '$fecha_nac', '$pais', '', '$ciudad', '$dir', '$ocupacion', '$situacion','$tipo','$usuario', 0,CURRENT_TIMESTAMP,'$cta_cont');");
                        
             echo json_encode(array("status"=>"Ok"));
         
            
        }catch(Exception $e){
            echo "Error al Registrar Cliente.  Trace: ".$e->getTraceAsString() ."   Message: ".$e->getMessage();
            echo "false";
        }
        
    }

}

?>
