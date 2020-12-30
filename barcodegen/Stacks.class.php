<?php

/**
 * Description of Stacks
 * @author Ing.Douglas
 * @date 16/07/2018
 */
require_once("../Y_Template.class.php");
require_once("../barcodegen/RadPlusBarcodeNoFont.php");

class Stacks {    
    function __construct() {
        $inicio = $_REQUEST['inicio'];  
        $fin = $_REQUEST['fin'];  
        $t = new Y_Template("Stacks.html");
        $filename = new RadPlusBarcode();
        $margin = 'style="margin: 0 0 0 1mm;"';    
        $t->Show("head");    
        $t->Set("margin", $margin);
        for($i = $inicio;$i <= $fin; $i++ ){             
             $barcode_image = $filename->parseCode($i);
             $t->Set("barcode_image", $barcode_image);     
             $t->Set("nro", $i);
             $t->Show("stack");   
        }
        
        
    }
}
new Stacks();
?>
