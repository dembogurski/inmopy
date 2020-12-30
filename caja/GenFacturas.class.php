<?php

/**
 * Description of GenFacturas
 * @author Ing.Douglas A. Dembogurski Feix
 * @date 30/03/2015
 */

require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");
class GenFacturas {
    function __construct() {
         $t = new Y_Template("GenFacturas.html");
         $usuario = $_POST['usuario'];
         $suc = $_POST['suc'];
         
         $t->Set("usuario",$usuario);
         $t->Set("suc",$suc);
         
         $db = new My();
         
         // Buscar Lista de Monedas
        $db->Query("SELECT m_cod AS moneda, m_descri FROM monedas WHERE m_cod != 'P$' and  m_cod != 'R$' and m_cod != 'Y$' ");
        $monedas = "";
        
        while ($db->NextRecord()) {
            $moneda = $db->Record['moneda'];
            $m_descri = $db->Record['m_descri'];
            $monedas.="<option value='$moneda'>$m_descri</option>";
             
        }
        $t->Set("monedas", $monedas);
         
         
         
         
         $db->Query(" SELECT estab_cont FROM sucursales WHERE suc = '$suc'");
         $db->NextRecord();
         $estab = $db->Record['estab_cont'];
         $t->Set("estab",$estab);
         
         $db->Query("SELECT pdv_cod FROM pdvs WHERE suc = '$suc'");
         $pdvs = '';
         $first_pdv = '';
         $k = 0;
         while ($db->NextRecord()){
             $pdv = $db->Record['pdv_cod'];
             if($k==0){
                 $first_pdv = $pdv;$k++;
             }
             $pdvs.="<option value='$pdv'>$pdv</option>";
         }
         /*
         $db->Query("SELECT MAX(fact_nro + 1) as INICIAL FROM factura_cont WHERE suc = '$suc' AND pdv_cod = '$first_pdv' and  ");
         $db->NextRecord();
         $inicial = $db->Record['INICIAL'];
         $t->Set("inicial",$inicial);    */
         $t->Set("pdvs",$pdvs);
         $t->Show("header");
         $t->Show("body");
    }
}
new GenFacturas();

?>
