<?php

 

/**
 * Description of ComprobanteReconciliacion
 *
 * @author Doglas
 */
require_once("../Y_DB_MySQL.class.php");
require_once("../Y_Template.class.php");

class ComprobanteReconciliacion {
    function __construct() {
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }

    function main(){
        $t = new Y_Template("ComprobanteReconciliacion.html");
        $db = new My();
        $dbd = new My();
        $dbf = new My();
        $dbn = new My();
        
        $decimales = 0;
        
        $t->Show("header");
        $id_rec = $_REQUEST['nro_rec'];
        $t->Set("id_rec", $id_rec);
        
        
        $db->Query("SELECT r.usuario,c.ci_ruc AS ruc,c.nombre, DATE_FORMAT( fecha,'%d-%m-%Y') AS fecha,r.moneda,notas FROM reconciliaciones r, clientes c  WHERE r. cod_cli_prov = cod_cli  AND id_rec = $id_rec");
        if($db->NumRows()>0){
            $db->NextRecord();
            $user = $db->Get("usuario");
            $ruc = $db->Get("ruc");
            $nombre = $db->Get("nombre");
            $fecha = $db->Get("fecha");
            $moneda = $db->Get("moneda");
            $notas = $db->Get("notas");
            if($moneda == "U$"){
                $decimales = 2;
            }
            
            $t->Set("user", $user);
            $t->Set("time", date("d-m-Y H:i"));
            $t->Set("ruc",$ruc);
            $t->Set("cliente",$nombre);
            $t->Set("fecha",$fecha);
            $t->Set("moneda",$moneda);
            $t->Set("notas",$notas); 
            $t->Show("head");
            
            $show_fact_cab = false;
            $show_nc_cab = false;
            
            $dbd->Query("SELECT id_rec_det, tipo_doc,nro_doc,id_det,signo,valor AS aplicado   FROM recon_det WHERE id_rec = $id_rec;");
            while($dbd->NextRecord()){
                $id_rec_det = $dbd->Get("id_rec_det");
                $tipo_doc = $dbd->Get("tipo_doc");
                $nro_doc = $dbd->Get("nro_doc");
                $id_det = $dbd->Get("id_det");
                $signo = $dbd->Get("signo");
                $aplicado = $dbd->Get("aplicado");
                
                $t->Set("id",$id_rec_det);
                $t->Set("tipo_doc",$tipo_doc);
                $t->Set("nro_doc",$nro_doc);
                $t->Set("id_det",$id_det);
                $t->Set("aplicado", "$signo".number_format($aplicado, $decimales, ',', '.') );
                
                if($tipo_doc == "Factura"){
                    $dbf->Query("SELECT DATE_FORMAT( fecha_cierre,'%d-%m-%Y') AS fecha,f.total, DATE_FORMAT( vencimiento,'%d-%m-%Y') as vencimiento, monto as valor_cuota FROM factura_venta f , cuotas c WHERE f.f_nro = c.f_nro AND f.f_nro = $nro_doc AND id_cuota = $id_det");
                    $dbf->NextRecord();   
                    $fecha_fac = $dbf->Get("fecha");
                    $total_fac = $dbf->Get("total");
                    $vencimiento = $dbf->Get("vencimiento");
                    $valor_cuota = $dbf->Get("valor_cuota");
                    if(!$show_fact_cab){
                        $t->Show("factura_cab");
                        $show_fact_cab = true;
                    }
                    $t->Set("fecha_fac",$fecha_fac);
                    $t->Set("valor_factura",number_format($total_fac, $decimales, ',', '.'));   
                    $t->Set("vencimiento",$vencimiento);
                    $t->Set("valor_cuota",number_format($valor_cuota, $decimales, ',', '.'));  
                    
                    $t->Show("factura_data");
                }else{
                    $dbn->Query("SELECT DATE_FORMAT( fecha,'%d-%m-%Y') AS fecha, total,notas FROM nota_credito n  WHERE    n_nro = $nro_doc");
                    $dbn->NextRecord();
                    $fecha_nc = $dbn->Get("fecha");
                    $total_nc = $dbn->Get("total");
                    $notas = $dbn->Get("notas");
                     
                    if(!$show_nc_cab){
                        $t->Show("nc_cab");
                        $show_nc_cab = true;
                    }
                    $t->Set("fecha_nc",$fecha_nc);
                    $t->Set("valor_nc",number_format($total_nc, $decimales, ',', '.'));    
                    $t->Set("notas",$notas);
                    
                    $t->Show("nc_data");
                }
                 
            }
            $t->Show("foot");
            
        }else{
            echo "Error Nro de Reconciliacion no existe...";
        }
    }
}
new ComprobanteReconciliacion();
?>
