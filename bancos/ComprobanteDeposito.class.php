<?php
 
/**
 * Description of Ticket
 * @author Ing.Douglas
 * @date 17/04/2015
 */

require_once("../Y_DB_MySQL.class.php");
require_once("../Y_Template.class.php");

class ComprobanteDeposito {
    
    function __construct(){
        date_default_timezone_set('America/Asuncion');
        
        $fecha = date("d-m-Y H:i:s");
        $usuario = $_REQUEST['usuario'];   
        $cuenta = $_REQUEST['cuenta'];
        $suc = $_REQUEST['suc'];
        
         
        
        $db = new My();
        $db->Query("SELECT id_mov, m.id_banco,b.nombre AS banco,m.cuenta,DATE_FORMAT(fecha_reg,'%d-%m-%Y') AS fecha_reg,DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha_dep,hora,entrada,salida,suc, REPLACE(c.m_cod,'$','s') AS moneda
        FROM bancos b, bcos_ctas_mov m, bcos_ctas c WHERE m.cuenta = c.cuenta AND b.id_banco = m.id_banco AND usuario = '$usuario' AND   suc = '$suc' and m.cuenta = '$cuenta'   ORDER BY id_mov DESC LIMIT 1");
        
        
        $db->NextRecord();
        $id_mov = $db->Record['id_mov'];
        $id_banco = $db->Record['id_banco'];
        $banco = $db->Record['banco'];
        $fecha_reg = $db->Record['fecha_reg'];
        $hora = $db->Record['hora'];
        $fecha_dep = $db->Record['fecha_dep']; 
        
        $moneda = $db->Record['moneda'];
        
        $decimales = 0;
        if($moneda == "Us"){
            $decimales = 2;
        }
        
        $entrada = number_format( $db->Record['entrada'],$decimales,',','.');    
        
        
        
        $add = $add."+------ Comprobante de Deposito -------+\n"; 
        $add = $add."\n"; 
        $add = $add."Nro de Deposito:  $id_mov\n"; 
        
        $add = $add."Fecha Imp: $fecha\n";
        
        $add = $add."Fecha Dep: $fecha_dep \n";
        $add = $add."Banco:  $banco\n"; 
        $add = $add."Cuenta:  $cuenta\n";  
        $add = $add."Monto: $entrada $moneda.~~~~\n"; 
          
      
        $t = new Y_Template("ComprobanteDeposito.html");
                
         
        
        $add = $add." \n";
        $add = $add." \n";
        $add = $add." \n";
        $add = $add."Firma ($usuario) ___________________\n";
        $add = $add." \n";
        $add = $add." \n";
        $add = $add." \n";
        $add = $add."Firma (Auditoria) __________________\n";
        $add = $add." \n";
        $add = $add." \n";
        $add = $add." \n";
        $add = $add."Firma (Tesoreria) __________________\n";
        $add = $add." \n";
        $add = $add." \n";
        $add = $add." \n";
        $add = $add." \n";
        
        $t->Set("content",$add);        
        $t->Set("contentbr", str_replace("\n", "<br>", $add) );   
        $t->Show("submit_form");
    }
    /**
     * 
     * @param type $string
     * @param type $int length
     * @param type $string (Left or Right) L or R
     * @return string
     */
    function str_fill($string, $m_len,$lr="R",$char=" "){  
       $tmp = $string;
       //$fill = $m_len-strlen($tmp);
       while(strlen($tmp)<$m_len){
          if($lr=="R"){ 
             $tmp .=$char;
          }else{
             $tmp =$char.$tmp; 
          } 
       }
       return $tmp;
    }    
}
new ComprobanteDeposito();
?>

