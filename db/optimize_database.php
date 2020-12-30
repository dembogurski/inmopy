<?php

require_once('../Y_DB_MySQL.class.php');

$my = new My();
$db = new My();

$my->Query("SHOW TABLES");
$my->NextRecord();
 
      
while ($my->NextRecord()){
    $tabla = $my->Record['Tables_in_inmopy'];
     echo " ".$tabla."<br>";
     //  mysql_query("OPTIMIZE TABLE '".$tablename."'")
      
    $db->Query("OPTIMIZE TABLE ".$tabla."");
    
}

?>