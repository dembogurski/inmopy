<?php

/**
 * Description of nota_creditoAbiertas
 * @author Ing.Douglas
 * @date 30/06/2015
 */
 

require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");


class NotasCreditoAbiertas {
 
    function __construct() {
        //$session = $_POST['session'];
        $usuario = $_POST['usuario'];        
        $suc     = $_POST['suc'];
                
        $db = new My();
        // Chequear Permiso para Autorizar
        $sql = "SELECT u.nombre AS usu,ug.usuario,g.nombre,p.id_permiso AS id_permiso,descripcion,trustee 
               FROM  usuarios u,grupos g, usuarios_x_grupo ug, permisos_x_grupo p, permisos pr 
               WHERE u.usuario = ug.usuario AND ug.id_grupo = p.id_grupo AND g.id_grupo = ug.id_grupo AND p.id_permiso = pr.id_permiso  AND ug.usuario = '$usuario'
               AND  p.id_permiso = '3.11'";

        $db->Query($sql);
        $autorizar = false;        
        if ($db->NumRows() > 0) {
            $autorizar = true; 
        } 
        
        
        
        $db->Query("SELECT n_nro AS nro,cod_cli,ruc_cli,cliente,usuario,req_auth,autorizado_por,f_nro AS factura,DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha,suc,tipo,total,estado,moneda,clase
        FROM nota_credito WHERE suc = '$suc' AND (estado = 'Abierta' OR estado = 'Pendiente')");
       
                
        $va = new Y_Template("NotasCreditoAbiertas.html");
        $va->Show("header");
        
        $va->Set("suc",$suc);
        $va->Set("usuario",$usuario);
            
        $va->Show("nota_credito_cab");
        
                
        while($db->NextRecord()){
            $nro = $db->Record['nro'];   
            $fecha = $db->Record['fecha'];
            $cod_cli = $db->Record['cod_cli'];
            $ruc = $db->Record['ruc_cli'];   
            $cliente = $db->Record['cliente'];   
            $usuario = $db->Record['usuario'];  
            $moneda = $db->Record['moneda'];  
            $req_auth = $db->Record['req_auth']; 
            $autorizado_por = $db->Record['autorizado_por']; 
            $clase = $db->Record['clase'];
            
            $factura = $db->Record['factura']; 
            $suc = $db->Record['suc']; 
            $tipo = $db->Record['tipo']; 
            $total = $db->Record['total'];   
            $estado = $db->Record['estado'];  
            
            if($req_auth == "1"){
                $auth = "";
                if($autorizar  && $autorizado_por == ""){
                    $auth = "<input type='button' id='auth_$nro' onclick=getPassword('$nro') value='Autorizar'>";
                }
                $req_auth = "Si  $auth";
            }else{
                $req_auth = "No";
            }
            $color = "white";
            if($estado == "Pendiente"){
                $color = "orange";
            }  
            $img_ok = ""; 
            if($autorizado_por != ""){
                $img_ok = "<img src='img/ok.png' width='18px' height='18px' >";
            }            
             
            $va->Set("nro",$nro);
            $va->Set("fecha",$fecha);
            $va->Set("cod_cli",$cod_cli);
            $va->Set("cliente",$cliente); 
            $va->Set("ruc",$ruc);  
            $va->Set("usuario",$usuario);
            $va->Set("req_auth",$req_auth);
            $va->Set("usuario",$usuario);
            $va->Set("factura",$factura);  
            $va->Set("autorizado_por",$autorizado_por."  ".$img_ok);  
            $va->Set("color",$color);
            $va->Set("total", number_format($total,0,',','.'));    
            $va->Set("suc", $suc);    
            $va->Set("tipo", $tipo);    
            $va->Set("estado",$estado);
            $va->Set("moneda",$moneda);
            $va->Set("clase"," $clase");
                        
            $va->Show("nota_credito_data");
        }        
        
        $va->Show("nota_credito_foot");  
    }    
}

new NotasCreditoAbiertas();
?>