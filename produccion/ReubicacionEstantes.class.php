<?php

/**
 * Description of ReubicacionEstantes
 * @author Ing.Douglas
 * @date 07/07/2018
 */
require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");
 

class ReubicacionEstantes {
    //put your code here
 

    function __construct() {
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }

    function main() {

        $t = new Y_Template("ReubicacionEstantes.html");

        $t->Show("headers");
        // Extrae los datos 
        $suc = $_REQUEST['suc'];
        
        $t->Show("body");
         
    }       
}
function interpolarAyB(){
 
        
        /*echo "Cambiando de nombre de A --> AA <br>";
        $ms->Query("update [@reg_ubic] SET U_nombre = 'BB' where  U_nombre = 'B';");
        echo "Cambiando de nombre de B --> BB <br>";
        
        $ms->Query("update [@reg_ubic] SET U_nombre = 'B' where  U_nombre = 'AA';");
        echo "Cambiando de nombre de AA --> B <br>";
        $ms->Query("update [@reg_ubic] SET U_nombre = 'A' where  U_nombre = 'BB';");
        echo "Cambiando de nombre de BB --> A <br>"; */
        
        //corregirOBTN("A");
        //corregirOBTN("B");    
        /*
        echo "Corrigiendo Lista de Adyancencias <br>";
        $db->Query('DELETE FROM lista_adyacencias WHERE nodo LIKE "A%" OR nodo LIKE "B%" OR nodo LIKE "C%" OR nodo LIKE "D%"');
        
        $db->Query("DELETE FROM nodos WHERE suc = '00' AND nodo LIKE 'D%'");
        
         
        generarListaAdyacencias(1,8,'A',4);
        $db->Query("insert into lista_adyacencias (suc,nodo,adya,costo)values('00','A8','C1',12);");
         
        generarListaAdyacencias(1,19,'C',4);
        $db->Query("insert into lista_adyacencias (suc,nodo,adya,costo)values('00','C19','B8',4);");         */
        //generarListaAdyacencias(1,8,'B',4);
}
function procederEstanteD(){
     /*
	$ms->Query("UPDATE [@reg_ubic] SET U_col = 14  where  U_nombre = 'D' and U_col =16;");
	$ms->Query("UPDATE [@reg_ubic] SET U_col = 13  where  U_nombre = 'D' and U_col =17;");
	$ms->Query("UPDATE [@reg_ubic] SET U_col = 18  where  U_nombre = 'D' and U_col =12;");
	$ms->Query("UPDATE [@reg_ubic] SET U_col = 19  where  U_nombre = 'D' and U_col =11;");
	$ms->Query("UPDATE [@reg_ubic] SET U_col = 19  where  U_nombre = 'D' and U_col =18;");
	
	corregirOBTN("D"); 
   
    echo "UPDATE [@reg_ubic] SET U_col = U_col + 10  where  U_nombre = 'E';<br>";
    $ms->Query("UPDATE [@reg_ubic] SET U_col = U_col + 10  where  U_nombre = 'E';");
    echo "UPDATE [@reg_ubic] SET U_col = U_col + 9  where  U_nombre = 'F';<br>";
    $ms->Query("UPDATE [@reg_ubic] SET U_col = U_col + 9  where  U_nombre = 'F';");
    echo "FOR";
    $count = 1;
    for($i = 20;$i > 10; $i--){         
        $ms->Query("UPDATE [@reg_ubic] SET U_col = $count  where  U_nombre = 'E' and U_col = $i;");
        echo "UPDATE [@reg_ubic] SET U_col = $count  where  U_nombre = 'E' and U_col = $i;<br>";
        $count++;
    }
    
    for($i = 18;$i > 9; $i--){         
        $ms->Query("UPDATE [@reg_ubic] SET U_col = $count  where  U_nombre = 'F' and U_col = $i;");
        echo "UPDATE [@reg_ubic] SET U_col = $count  where  U_nombre = 'E' and U_col = $i;<br>";
        $count++;
    }
    $ms->Query("UPDATE [@reg_ubic] SET U_nombre = 'D'  where  U_nombre = 'E' ;");
    $ms->Query("UPDATE [@reg_ubic] SET U_nombre = 'D'  where  U_nombre = 'F' ;");
    echo "corregirOBTN D<br>";
    
      
    echo "Borrar Lista de Adyacencias<br>";
    $db->Query('DELETE FROM lista_adyacencias WHERE nodo LIKE "D%" ');
    */
    echo "Generar Lista de Adyacencias";
    //generarListaAdyacencias(1,19,'D',4);
     
   // $db->Query("insert into lista_adyacencias (suc,nodo,adya,costo)values('00','00','D10',10);");
   // $db->Query("insert into lista_adyacencias (suc,nodo,adya,costo)values('00','00','D11',8);");    
}
 

function generarListaAdyacencias($ini,$fin,$letra,$distancia){
    $db = new My();
    for($i = $ini;$i < $fin;$i++){
        $adya = $i + 1;
        $de = $letra."".$i;
        $a = $letra."".$adya;
        $ins = "insert into lista_adyacencias (suc,nodo,adya,costo)values('00','$de','$a',$distancia);";
        echo $ins."<br>";
        $db->Query($ins);
    }
}
  
new ReubicacionEstantes();

?>

        