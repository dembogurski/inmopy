<?php

/**
 * Description of ResumenCompra
 * @author Ing.Douglas
 * @date 01/04/2016
 */
 
require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");
                  
class ResumenCompra {
    function __construct() {
       
       $nro = $_GET['nro']; 
       $tipo = $_GET['tipo_res']; 
       $usuario = $_GET['usuario'];
       
       $t = new Y_Template("ResumenCompra.html");
       
       $t->Show("headers");
       
       $t->Set("nro",$nro);
       $t->Set("usuario",$usuario);
       $t->Set("fecha",date("d-m-Y H:i"));
       
       $cab0 = ',descrip AS Articulo';
       $cab1 = ',Articulo';
       
       if($tipo == 'Resumido'){
           $cab0 = '';
           $cab1 = ''; 
           $t->Set("display","none");
       }else{
           $t->Set("display","compact");
       }      
       
       $db = new My();
       $db->Query("SELECT d.cod_prov AS Provedor $cab0,SUM(IF(um='Mts',cantidad,0)) AS Mts,SUM(IF(um='Yds',cantidad,0)) AS Yds, SUM(IF(um='Kg',cantidad,0)) AS Kg,SUM(IF(um='Unid',cantidad,0)) AS Unid,
       SUM(IF( c.moneda = 'Y$',subtotal,0)) AS Renminbi,
       SUM(IF( c.moneda = 'U$',subtotal,0)) AS Dolares 
       FROM compras c, compra_det d 
       WHERE  c.n_nro = d.n_nro AND c.cod_prov = d.cod_prov AND  d.n_nro = $nro    
       GROUP BY  d.cod_prov $cab1 ORDER BY d.cod_prov ASC $cab1");
       
       $t->Show("head");
       
       $TMts = 0;
       $TYds = 0;
       $TKg = 0;
       $TUnid = 0;
       $TRmb = 0;
       $TUsd = 0;
       
       while($db->NextRecord()){          
           $Provedor = $db->Record['Provedor']; 
           $Mts = $db->Record['Mts']; 
           $Yds = $db->Record['Yds']; 
           $Kg = $db->Record['Kg']; 
           $Unid = $db->Record['Unid']; 
           $Renminbi = $db->Record['Renminbi']; 
           $Dolares = $db->Record['Dolares'];
           
           $TMts += 0 + $Mts;
           $TYds += 0 + $Yds;
           $TKg += 0 + $Kg;
           $TUnid += 0 + $Unid;
           $TRmb += 0 + $Renminbi;
           $TUsd += 0 + $Dolares;
           
           if($tipo != 'Resumido'){
               $Articulo = $db->Record['Articulo']; 
               $t->Set("Articulo",$Articulo);
           }else{
               $t->Set("Articulo",''); 
           } 
           $t->Set("Provedor",$Provedor);
           $t->Set("Mts",number_format($Mts,0,',','.'));     
           $t->Set("Yds",number_format($Yds,0,',','.'));     
           $t->Set("Kg",number_format($Kg,0,',','.'));     
           $t->Set("Unid",number_format($Unid,0,',','.'));     
           $t->Set("Renminbi",number_format($Renminbi,1,',','.'));     
           $t->Set("Dolares",number_format($Dolares,1,',','.'));     
           $t->Show("line");
       }
       $t->Set("TMts", number_format($TMts,0,',','.'));     
       $t->Set("TYds",number_format($TYds,0,',','.'));     
       $t->Set("TKg",number_format($TKg,0,',','.'));     
       $t->Set("TUnid",number_format($TUnid,0,',','.'));     
       $t->Set("TRenminbi",number_format($TRmb,1,',','.'));     
       $t->Set("TDolares",number_format($TUsd,1,',','.'));     
       $t->Show("foot"); 
    }

}
new ResumenCompra();
?>