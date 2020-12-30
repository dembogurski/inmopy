<?php

/**
 * Description of PoliticaCortes
 * @author Ing.Douglas
 * @date 26/07/2016
 */

require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");
   


class PoliticaCortes {    
    private $template;
    function __construct(){                
        $this->template = new Y_Template("PoliticaCortes.html");
    }
    
    public function start(){           
        $this->template->Show("header");
    }
    
    public function getSucs(){    
        $my = new My();
        $t = $this->template;
        $ms = new My();
        $my->Query("select suc, nombre from sucursales where estado ='Activo' ");
        if($my->NumRows()>0){
            $t->Show("suc_head");
            while($my->NextRecord()){
                $t->Set("suc",$my->Record['suc']);
                $t->Set("nombre",$my->Record['nombre']);
                $t->Show("suc_body");
            }
            
        }
        $pol_ref_suc = '';
        $ms->Query("SELECT DISTINCT suc AS U_suc FROM politica_cortes");
        if($ms->NumRows()>0){
            while ($ms->NextRecord()){
                $suc_ref = $ms->Record['U_suc'];
                $pol_ref_suc .= "<option value='$suc_ref'>$suc_ref</option>";
            }            
        }
        $t->Set('pol_ref_suc',$pol_ref_suc);
        $t->Show("suc_footer");       
        $t->Show("data_head"); 
        $ms->Query(" SELECT DISTINCT codigo  ,descrip  , um  FROM articulos o WHERE estado ='Activo' AND o.codigo NOT LIKE 'TX%' AND o.codigo NOT LIKE 'AC%'");
        while ($ms->NextRecord()){
            $t->Set('ItemCode',$ms->Record['codigo']);
            $t->Set('ItemName', htmlentities(utf8_encode($ms->Record['descrip'])));
            $t->Set('InvntryUom',$ms->Record['um']);            
            $t->Show("data_body");              
        }
        $t->Show("data_footer");
    }
    
    public function get_table_data($suc){
        $ms = new My();
        $response = array();
        $sql0 = "SELECT codigo AS U_codigo,politica AS U_politica,presentacion AS U_presentacion FROM politica_cortes WHERE suc =  '$suc'";                
        
        $ms->Query($sql0);        
        
        if($ms->NumRows() > 0){
           while($ms->NextRecord()){
               array_push($response,$ms->Record);
           }           
        }else{
            echo '{"error":"Error! No se encontraron registros"}';
            die();
        }        
        echo json_encode($response);        
    }
    // Copia todas las politicas de una sucurzal a otra
    public function copyAll($from,$to){        
        $ms = new My();
        $query = "SELECT codigo AS U_codigo,politica AS U_politica FROM politica_cortes WHERE  suc = '$from'";
        $proc_cods = array();
        $ms->Query($query);
        
        while($ms->NextRecord()){
            $cod = $ms->Record['U_codigo'];
            $this->save_pol($cod, $ms->Record['U_politica'], $to,false);
            array_push($proc_cods, $cod);
        }
        echo '{"msj":"Ok se copio con exito las politicas de '.$from.' a '.$to.'.","cods":'.json_encode($proc_cods).'}';
    }
    // Actualiza o inserta una nueva politica dependiendo de su existencia en la base de datos
    public function save_pol($cod_ref,$pol,$suc,$echo=TRUE){
        $ms = new My();
        $verif = $this->check($cod_ref, $suc);
        $query = '';
         
        if($verif > 0){
            $query = "update politica_cortes set  politica=$pol where  suc='$suc' and  codigo='$cod_ref'";            
        }else{
            $query = "insert into politica_cortes (codigo,suc,politica,estado) values ('$cod_ref','$suc','$pol','Activo')";
        }
        $ms->Query($query);
        if($echo){
            echo '{"msj":"Ok _ '.$cod_ref.' _ '.$pol.' _ '.$suc.'"}';
        }
    }
    
    // Guarda la Presentacion de cada pieza por codigo
    function save_press($suc,$codigo,$presentacion){
        $query = "update politica_cortes set  presentacion='$presentacion' where  suc='$suc' and  codigo='$codigo'"; 
        $ms = new My();
        $ms->Query($query);
        echo '{"msj":"Ok _ '.$codigo.' _ '.$presentacion.' _ '.$suc.'"}';
    }
    
    /**
     * Verifica si el registro ya existe y devulve el valor del ultimo codigo
     * 
     */
    private function check($cod,$suc){
        $ms = new My();
        $responce = array();
        $ms->Query("SELECT COUNT(*) AS cant FROM politica_cortes WHERE codigo = '$cod' AND suc = '$suc'");        
        $ms->NextRecord();         
        return $ms->Record['cant'] ; 
    }
}
$pol = new PoliticaCortes();

 if(isset($_POST['action'])){
     call_user_func_array(array($pol,$_POST['action']), explode(',', $_POST['args']));
 }else{
     $pol->start();
     $pol->getSucs();
 }

?>
