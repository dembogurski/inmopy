<?php

/**
 * Description of GrafoNodos
 * @author Ing.Douglas
 * @date 19/10/2018
 */
require_once("../Y_Template.class.php");
require_once("../Config.class.php");
require_once("../Y_DB_MySQL.class.php");

class GrafoNodos {
  
    function __construct() {
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }

    function main() {

        $t = new Y_Template("GrafoNodos.html"); 
        $t->Set("images_url", $images_url);
        $suc = $_REQUEST['suc']; 
        $t->Set("suc",$suc);
        
        $t->Show("header");
        $t->Show("body"); 
    }

}
    
function getGrafo(){     
     
    /* 
    $db = new My();
      
     
    $x = 25;// V    
    $y = 0;
    for($i = 1;$i < 21; $i++){  
       $db->Query("UPDATE nodos SET y = $y,x = $x WHERE nodo like 'V$i';");
       if($i == 10){ $x+=50;  }   
       $x+=50;     
    }         
    
    $x = 0;// E
    $y = 30;
    for($i = 15;$i > 0; $i--){  
       $db->Query("UPDATE nodos SET y = $y,x = $x WHERE nodo like 'E$i';");
       $y+=55;       
    }  
    $x = 1100;// F
    $y = 30;
    for($i = 15;$i > 0; $i--){  
       $db->Query("UPDATE nodos SET y = $y,x = $x WHERE nodo like 'F$i';");
       $y+=55;  
    } 
    
    $x = 55;// U
    $y = 40;
    for($i = 1;$i < 15; $i++){  
       $db->Query("UPDATE nodos SET y = $y,x = $x WHERE nodo like 'U$i';");
       if($i == 7){ $x+=30;  }
       $x+=70;  
    }  
     
    $x = 55;// T     
    $y = 100;
    for($i = 1;$i < 15; $i++){  
       $db->Query("UPDATE nodos SET y = $y,x = $x WHERE nodo like 'T$i';");
       if($i == 7){ $x+=30;  }
       $x+=70;  
    }       
    
    $x = 55;// S    
    $y = 155;
    for($i = 1;$i < 15; $i++){  
       $db->Query("UPDATE nodos SET y = $y,x = $x WHERE nodo like 'S$i';");
       if($i == 7){ $x+=30;  }
       $x+=70;   
    }  
    
    $x = 55;// R
    $y = 240;
    for($i = 1;$i < 15; $i++){  
       $db->Query("UPDATE nodos SET y = $y,x = $x WHERE nodo like 'R$i';");
       if($i == 7){ $x+=30;  }
       $x+=70;  
    }       
    $x = 55;// Q
    $y = 320;
    for($i = 1;$i < 15; $i++){  
       $db->Query("UPDATE nodos SET y = $y,x = $x WHERE nodo like 'Q$i';");
       if($i == 7){ $x+=30;  }
       $x+=70;  
    }  
    
    $x = 55;// P
    $y = 405;   
    for($i = 1;$i < 15; $i++){  
       $db->Query("UPDATE nodos SET y = $y,x = $x WHERE nodo like 'P$i';");
       if($i == 7){ $x+=30;  }
       $x+=70;  
    }  
    
    $x = 60;// O
    $y = 470;   
    for($i = 1;$i < 17; $i++){  
       $db->Query("UPDATE nodos SET y = $y,x = $x WHERE nodo like 'O$i';");
       if($i == 8){ $x+=30;  }
       $x+=60;  
    }  
    $x = 60;// N
    $y = 520;   
    for($i = 1;$i < 17; $i++){  
       $db->Query("UPDATE nodos SET y = $y,x = $x WHERE nodo like 'N$i';");
       if($i == 8){ $x+=30;  }
       $x+=60;  
    }  
    
    $x = 60;// M
    $y = 600;   
    for($i = 1;$i < 17; $i++){  
       $db->Query("UPDATE nodos SET y = $y,x = $x WHERE nodo like 'M$i';");
       if($i == 8){ $x+=30;  }
       $x+=60;  
    }  
    
    $x = 60;// L
    $y = 610;   
    for($i = 1;$i < 17; $i++){  
       $db->Query("UPDATE nodos SET y = $y,x = $x WHERE nodo like 'L$i';");
       if($i == 8){ $x+=30;  }
       $x+=60;  
    } 
    $x = 60;// K
    $y = 700;   
    for($i = 1;$i < 17; $i++){  
       $db->Query("UPDATE nodos SET y = $y,x = $x WHERE nodo like 'K$i';");
       if($i == 8){ $x+=30;  }
       $x+=60;  
    } 
    $x = 60;// J
    $y = 720;   
    for($i = 1;$i < 17; $i++){  
       $db->Query("UPDATE nodos SET y = $y,x = $x WHERE nodo like 'J$i';");
       if($i == 8){ $x+=30;  }
       $x+=60;  
    } 
    $x = 60;// I
    $y = 800;   
    for($i = 1;$i < 17; $i++){  
       $db->Query("UPDATE nodos SET y = $y,x = $x WHERE nodo like 'I$i';");
       if($i == 8){ $x+=30;  }
       $x+=60;  
    } 
    
    $x = 60;// H
    $y = 820;   
    for($i = 1;$i < 17; $i++){  
       $db->Query("UPDATE nodos SET y = $y,x = $x WHERE nodo like 'H$i';");
       if($i == 8){ $x+=30;  }
       $x+=60;  
    } 
    $x = 60;// G
    $y = 900;   
    for($i = 1;$i < 17; $i++){  
       $db->Query("UPDATE nodos SET y = $y,x = $x WHERE nodo like 'G$i';");
       if($i == 8){ $x+=30;  }
       $x+=60;  
    }
    
    $x = 0;// D
    $y = 970;   
    for($i = 1;$i < 20; $i++){     
       $db->Query("UPDATE nodos SET y = $y,x = $x WHERE nodo like 'D$i';");     
       if($i == 10){ $x+=100;  }     
       if($i > 10){
           $x+=60;  
       }else{
           $x+=50;  
       }  
       
    }
    
    $x = 700;// 00
    $y = 1010;
    $db->Query("UPDATE nodos SET y = $y,x = $x WHERE nodo like '00';");
    
    $x = 160;// C   
    $y = 1060;   
    for($i = 1;$i < 20; $i++){     
       $db->Query("UPDATE nodos SET y = $y,x = $x WHERE nodo like 'C$i';");     
       if($i == 7){ $x+=70;  }
       $x+=50;        
    }
    
    $x = 0;// A
    $y = 1090;
    for($i = 8;$i > 0; $i--){  
       $db->Query("UPDATE nodos SET y = $y,x = $x WHERE nodo like 'A$i';");
       $y+=60;       
    }  
    $x = 1200;// B
    $y = 1090;
    for($i = 8;$i > 0; $i--){         
       $db->Query("UPDATE nodos SET y = $y,x = $x WHERE nodo like 'B$i';");
       $y+=60;       
    } 
    */
    
    $sql = "SELECT n.suc, n.nodo,prioridad,x,y, LEFT(n.nodo,1) AS letra, SUBSTR(n.nodo, 2, 2) AS numero,size FROM nodos n   WHERE LEFT(n.nodo,1) "
            . "IN ('V','U','E','F','T','S','T','R','Q','P','O','M','N','L','K','J','I','H','G','D','C','A','B','0') and x is not null and y is not null ORDER BY letra ASC, numero + 0 ASC ";
    echo json_encode( getResultArray($sql) );
     
}    

function getListaAdyacencias(){
    $sql = "SELECT suc,nodo,adya FROM lista_adyacencias where LEFT( nodo,1) IN ('V','U','E','F','T','S','T','R','Q','P','O','M','N','L','K','J','I','H','G','D','C','A','B','0') ORDER BY LEFT( nodo,1) ASC LIMIT 50000";
    echo json_encode( getResultArray($sql) );     
}


function cambiarPosicionNodo(){
    $suc = $_REQUEST['suc'];
    $nodo = $_REQUEST['nodo'];
    $x = $_REQUEST['x'];
    $y = $_REQUEST['y'];
    $db = new My();
    $db->Query("update nodos set x = $x,y= $y where suc = '$suc' and nodo = '$nodo';");
    echo json_encode(array("estado"=>"Ok"));
}
function addListaAdyacencia(){
     $db = new My();
     $nodoA = $_REQUEST['nodoA'];
     $nodoB = $_REQUEST['nodoB'];
     //$db->Query("INSERT INTO lista_adyacencias(suc, nodo, adya, costo)VALUES ('00', '$nodoA', '$nodoB', 4);");
     //echo "Ok: $nodoA --> $nodoB ";
     echo "Lista de adyacencia desabilitada";
}

function getResultArray($sql) {
    $db = new My();
    $array = array();
    $db->Query($sql);
    while ($db->NextRecord()) {
        array_push($array, $db->Record);
    }
    $db->Close();
    return $array;
}

function verEstadisticas(){
    $desde = $_POST['desde'];
    $hasta = $_POST['hasta'];
    
    $sql = "SELECT  nodo , COUNT(d.nodo) AS pedidos FROM pedido_traslado p INNER JOIN pedido_tras_det d ON  p.n_nro = d.n_nro AND  p.estado != 'Abierta'
    WHERE p.fecha_cierre BETWEEN '$desde' AND '$hasta' AND nodo NOT IN ('','N/A')
    GROUP BY d.nodo  ORDER BY pedidos DESC ";
    echo json_encode( getResultArray($sql) );     
}

new GrafoNodos();
?>