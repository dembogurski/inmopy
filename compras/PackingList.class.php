<?php

/**
 * Description of PackingList
 * @author Ing.Douglas
 * @date 19/04/2016
 */
require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");


class PackingList {

    function __construct() {

        $t = new Y_Template("PackingList.html");
        //$usuario = $_POST['usuario']; 
        $invoice = $_GET['invoice'];
        $t->Set("invoice", $invoice);


        $db = new My();
        $db->Query("select n_nro,moneda,usuario,cod_prov,proveedor,date_format(fecha,'%d-%m-%Y') as fecha,obs,origen from invoice where invoice = '$invoice'");
        $db->NextRecord();
        $n_nro = $db->Record['n_nro'];
        $usuario = $db->Record['usuario'];
        $cod_prov = $db->Record['cod_prov'];
        $proveedor = $db->Record['proveedor'];



        $t->Set("currency", $moneda);

         $ms = new My();
        $ms->Query("SELECT dir,ciudad,UPPER(pais) AS pais,tel,email FROM proveedores WHERE cod_prov ='$cod_prov'");
        $Address = "";
        $City = "";
        $Country = "";
        $Phone = "";
        $E_Mail = "";         
        if($ms->NumRows()>0){
            $ms->NextRecord();
            $Street = $ms->Record['dir'];
            $City = $ms->Record['ciudad'];
            $Country = $ms->Record['pais'];
            $Address = $Street.", ".$City." ".$Country;
            $Phone = $ms->Record['Phone1'];
            $E_Mail = $ms->Record['E_Mail'];         
        } 
        
        $t->Set("provider", $proveedor);
        $t->Set("City", $City);
        $t->Set("Country", $Country);
        $t->Set("address", $Address);
        $t->Set("phone", $Phone);
        $t->Set("email", $E_Mail);
        $t->Show("header");
        $t->Show("head");

        /* #################################   Cabecera   ############################### */

        $dbd = new My();

        $db->Query("SELECT DISTINCT cod_prov FROM packing_list WHERE invoice  = '$invoice'  ORDER BY cod_prov ASC");
              
        while ($db->NextRecord()) {
            $cod_prov = $db->Record['cod_prov'];
            $t->Set("cod_prov", $cod_prov);
            $t->Show("detail_head");
            
            $dbd->Query("SELECT cod_prov,bale,piece,CONCAT(codigo,'-',descrip) AS descrip,color,CONCAT(cod_catalogo,'-',fab_color_cod) AS color_cod_fab, um,cantidad FROM packing_list 
            WHERE invoice  = '$invoice' AND cod_prov = '$cod_prov' ORDER BY cod_prov ASC,bale ASC,piece ASC");

            $Mts = 0;
            $Yds = 0;
            $Kg  = 0;
            $Unid = 0;

            while ($dbd->NextRecord()) {
                $provider_cod = $dbd->Record['cod_prov'];
                $bale = $dbd->Record['bale'];                
                $piece = $dbd->Record['piece'];
                $descrip = $dbd->Record['descrip'];
                $color = $dbd->Record['color'];
                $color_cod_fab = $dbd->Record['color_cod_fab'];
                $um = $dbd->Record['um'];
                $qty = $dbd->Record['cantidad'];
                
                 
                $t->Set("provider_cod", $provider_cod);
                $t->Set("bale", $bale);                 
                $t->Set("piece", $piece);
                $t->Set("descrip", utf8_decode($descrip));
                $t->Set("color", utf8_decode($color));
                $t->Set("color_cod", $color_cod_fab); 
                $t->Set("um", $um);
                $t->Set("cantidad", number_format($qty, 2, ',', '.'));
                
                $t->Set("md5_descrip",  md5($descrip));
                $t->Set("md5_color",     md5($descrip."-".$color));
                $t->Set("md5_color_cod_fab",     md5($descrip."-".$color."-".$color_cod_fab));
                $t->Set("md5_um",     md5($provider_cod."-".$bale."-".$descrip."-".$color."-".$color_cod_fab));
                
                $t->Show("detail_row");
                if($um == "Mts"){
                  $Mts +=0 + $qty;
                }else if($um == "Yds"){
                   $Yds +=0 + $qty;
                }else if($um == "Kg"){
                   $Kg +=0 + $qty; 
                }else{ // Unid
                    $Unid +=0 + $qty; 
                }
            }
            if($Mts > 0){
                $t->Set("Mts",number_format($Mts, 1, ',', '.'));
                $t->Set("display_Mts","table-cell");
            }else{ $t->Set("display_Mts","none"); }
            
            if($Yds > 0){
                $t->Set("Yds",number_format($Yds, 1, ',', '.')); 
                $t->Set("display_Yds","table-cell");
            }else{ $t->Set("display_Yds","none"); }
            
            if($Kg > 0){
                $t->Set("Kg",number_format($Kg, 1, ',', '.')); 
                $t->Set("display_Kg","table-cell");
            }else{ $t->Set("display_Kg","none"); }
            
            if($Unid > 0){
                $t->Set("Unid",number_format($Unid, 1, ',', '.')); 
                $t->Set("display_Unid","table-cell");
            }else{ $t->Set("display_Unid","none"); }
            
            $t->Show("detail_foot");
        }

 
    }

}

new PackingList();
?>
