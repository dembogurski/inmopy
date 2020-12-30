<?php

 
/**
 * Description of GenericOpen
 *
 * @author Doglas
 */

require_once("Y_Template.class.php");

class GenericOpen {
    function __construct() {
        $url = $_REQUEST['url'];    
        $parameters = $_REQUEST['parameters'];//echo $parameters."<br>";
        
        $t = new Y_Template("GenericOpen.html");
        $t->Set("url",$url);
         $t->Set("parameters",$parameters);
        
        $t->Show("header");        
        $t->Show("view");
    }    
}
new GenericOpen();
?>