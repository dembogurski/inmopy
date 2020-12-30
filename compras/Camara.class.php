<?php

/**
 * Description of Camara
 * @author Ing.Douglas
 * @date 30/10/2015
 */


require_once("../Y_Template.class.php");

class Camara {
     function __construct(){

         $Lote = $_GET['lote'];
         $AbsEntry = $_GET['AbsEntry'];
         $AbsEntrys = $_GET['AbsEntrys'];   
         $replicar = $_GET['reply'];
         $t = new Y_Template("Camara.html");
         
         //$arr = split(",",$Lotes);
         
         $t->Set("lote",$Lote);
         $t->Set("AbsEntry",$AbsEntry);
         $t->Set("AbsEntrys",$AbsEntrys);
         $t->Set("replicar",$replicar);
         $t->Show("headers"); 
         $t->Show("lote");
         $t->Show("camara");
     }
}
new Camara();
?>
