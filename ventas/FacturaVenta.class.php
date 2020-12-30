<?php

/**
 * Description of CargarVenta
 * @author Ing.Douglas
 * @date 13/03/2015
 */

require_once("../Y_DB_MySQL.class.php");
require_once("../Y_Template.class.php");
require_once("../Config.class.php");
 

class FacturaVenta {
     function __construct() {
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }

    function main() {
        //$session = $_POST['session'];
        $usuario = $_POST['usuario']; 
        $factura = $_POST['factura']; 
        $touch = $_POST['touch']; 
        $suc = $_POST['suc'];
        
        
        $db = new My();
        $db2 = new My();
         $sql_permiso = "SELECT u.nombre AS usu,ug.usuario,g.nombre,p.id_permiso AS id_permiso,descripcion,trustee 
               FROM  usuarios u,grupos g, usuarios_x_grupo ug, permisos_x_grupo p, permisos pr 
               WHERE u.usuario = ug.usuario AND ug.id_grupo = p.id_grupo AND g.id_grupo = ug.id_grupo AND p.id_permiso = pr.id_permiso  AND ug.usuario = '$usuario'
               AND  p.id_permiso = '1.6.1'";
        
        $db->Query($sql_permiso);
        $puede_discriminar = false;
        if($db->NumRows() > 0){
            $db->NextRecord();
            $trustee = $db->Record['trustee'];
            if($trustee == "vem"){
               $puede_discriminar = true;
            }
        }    
        
        
        $db->Query("SELECT valor FROM parametros WHERE clave = 'vent_det_limit'");
        $db->NextRecord();
        $limite_detalles = $db->Record['valor'];
                
        $t = new Y_Template("FacturaVenta.html");
        $t->Set("limite_detalles",$limite_detalles);
        
        $db->Query("SELECT m_descri AS m, m_cod AS moneda FROM monedas WHERE m_ref <> 'Si';");
        //echo $db->NumRows();
        while ($db->NextRecord()) {
            $moneda = $db->Record['moneda'];
            $mon_replaced = strtolower(str_replace("$", "s", $moneda));
            $db2->Query("SELECT compra,venta FROM cotizaciones WHERE suc = '$suc' AND m_cod = '$moneda' and fecha <= current_date ORDER BY id_cotiz DESC LIMIT 1;");
            if ($db2->NumRows() > 0) {
                $db2->NextRecord();
                $compra = $db2->Record['compra'];
                $t->Set("cotiz_$mon_replaced", number_format($compra, 2, ',', '.'));
            } else {
                $t->Set("cotiz_$mon_replaced", 0);
            }
        } 
        
        
        
        if($touch=="true"){
           $t->Set("keypadtouch","inline"); 
        }else{
            $t->Set("keypadtouch","none");
        }
        
        
        
        
        $c = new Config();
        $host = $c->getNasHost();
        $path = $c->getNasFolder();
        $images_url = "http://$host/$path";
        $t->Set("images_url",$images_url);
        
         
        if($this->modPrecioBajoMinimo($usuario)){
            $t->Set("modPrecioBajoMinimo",'<label for="modPrecioBajoMinimo">Ignorar m&iacute;nimo:</label><input type="checkbox" id="modPrecioBajoMinimo"><br>');
        }
        $t->Show("header");
        $t->Show("titulo_factura");
        $t->Show("cotizaciones");
        $t->Set("factura",$factura);
        
        $decimales = 0;
                                                                                                                               // AND usuario = '$usuario'
        $db->Query("SELECT   cod_cli ,ruc_cli AS ruc,tipo_doc_cli, cliente, cat,moneda,cotiz,cod_desc,pref_pago,desc_sedeco,clase FROM factura_venta WHERE    f_nro  = '$factura'");
        if($db->NumRows()>0){
            $db->NextRecord();
            $cli_cod = $db->Record['cod_cli'];
            $ruc = $db->Record['ruc'];
            $tipo_doc_cli = $db->Record['tipo_doc_cli'];
            $cliente = $db->Record['cliente'];
            $cat = $db->Record['cat'];
            $moneda = $db->Record['moneda'];
            $cotiz = $db->Record['cotiz'];
            $cod_desc = $db->Record['cod_desc'];
            $pref_pago = $db->Record['pref_pago'];
            $desc_sedeco = round($db->Record['desc_sedeco'],0);
            
            $clase = $db->Record['clase'];
            
            $t->Set("cli_cod",$cli_cod);
            $t->Set("ruc",$ruc);
            $t->Set("cliente",$cliente);
            $t->Set("cat",$cat);
            $t->Set("moneda",$moneda);
            $t->Set("cotiz",$cotiz);
            $t->Set("cod_desc",$cod_desc);
            $t->Set("pref_pago",$pref_pago);
            $t->Set("desc_sedeco",$desc_sedeco);
            $t->Set("clase",$clase);
            
            if($moneda != 'G$'){
                $decimales = 2;
            }
            if($tipo_doc_cli != null){             
                $t->Set("tipo_doc",$tipo_doc_cli);
            }else{
                $t->Set("tipo_doc","C.I.");
            }
            $t->Show("cabecera_venta_existente");
                     
            $t->Show("area_carga_cab");
            $t->Set("finalizar_state","disabled"); 
            
            $db = new My();
            $db->Query("SELECT codigo,lote,descrip,um_cod,cantidad, precio_venta,descuento,subtotal,cod_falla,cant_falla,estado_venta from fact_vent_det where f_nro =  $factura");
            $TOTAL = 0;
            $TOTAL_DESCUENTO= 0;
            while($db->NextRecord()){
               $codigo = $db->Record['codigo']; 
               $lote = $db->Record['lote']; 
               $descrip = $db->Record['descrip']; 
               $um_cod = $db->Record['um_cod']; 
               $cantidad = $db->Record['cantidad']; 
               $precio_venta = $db->Record['precio_venta']; 
               $descuento = $db->Record['descuento']; 
               $subtotal = $db->Record['subtotal']; 
               $cod_falla = $db->Record['cod_falla']; 
               $cant_falla = $db->Record['cant_falla']; 
               $estado_venta = $db->Record['estado_venta']; 
               $falla = "";
               if($cod_falla != ""){
                  $falla = "$cant_falla/$cod_falla"; 
               }       
               $h = str_replace(".", "", $precio_venta);
               $hash = "".$codigo."_".$h;
               $t->Set("hash",$hash);
               $TOTAL+=0+$subtotal;
               $TOTAL_DESCUENTO+=0+$descuento;
               $t->Set("codigo",$codigo);
               $t->Set("lote",$lote);
               $t->Set("descrip",$descrip);
               $t->Set("um",$um_cod);
               $t->Set("falla",$falla);
               $t->Set("cant", number_format($cantidad,2,',','.'));   
               $t->Set("precio", number_format($precio_venta,$decimales,',','.')); 
               $t->Set("descuento", number_format($descuento,1,',','.'));   
               $t->Set("subtotal",number_format($subtotal,$decimales,',','.'));    
               $t->Set("estado_venta",$estado_venta);
               
               $t->Set("finalizar_state",""); 
               $t->Show("area_carga_data");
            } 
            $t->Set("TOTAL",number_format($TOTAL,$decimales,',','.'));
            if($puede_discriminar){
               $t->Set("codigo_venta_discriminada",'<input type="button" id="mayorista" onclick="ventaMayorista()"  style="font-weight: bolder" value=" Venta Mayorista " >  <input type="button" id="discriminar" onclick="discriminarPrecios()"  style="font-weight: bolder" value=" Discriminar Precios " > <input type="button" id="proforma" onclick="facturaProforma()"  style="font-weight: bolder" value=" Proforma " > <input type="button" id="imprimir_detalle" onclick="imprimirDetalle()"  style="font-weight: bolder" value=" Imprimir " >');  
            }else{
              $t->Set("codigo_venta_discriminada","");             
            }
            
            $t->Show("area_carga_foot");    
            $t->Show("config");
            // Solo si es Toutch
            if($touch=="true"){
                require_once("../utils/NumPad.class.php");               
                new NumPad();
            }
                        
        }else{
            echo "Ocurrio un Error con respecto a la Factura Nro: $factura, Contacte con el Administrador";
            die();
        }
        
    }
    // Permiso para modificar precio por debajo del  mimimo.
    function modPrecioBajoMinimo($user){
        $my = new My();
        $my->Query("SELECT count(*) as permiso from usuarios u inner join usuarios_x_grupo g using(usuario) inner join permisos_x_grupo p using(id_grupo) where u.usuario = '$user' AND  p.id_permiso = '1.6.2'");
        $my->NextRecord();
        if((int)$my->Record['permiso'] > 0){
            return true;
        }
        return false;
    }
}

function getFallas() {
    require_once("../Functions.class.php");
    $f = new Functions();
    $codigo = $_POST['codigo'];
    $lote = $_POST['lote'];
    $vender = $_POST['vender'];
    // Primero obtengo lo vendido
    $sql = "SELECT cant_ent - cantidad AS vendido,cantidad AS stock FROM stock WHERE codigo ='$codigo' and  lote = '$lote'";
    $vendido = $f->getResultArray($sql)[0]['vendido'];
     
    $rango_max =  $vendido + $vender;
    
    $fallas = "SELECT tipo_falla, mts_inv AS ubic_falla, mts_inv - $vendido as ubic_real,usuario,date_format(fecha,'%d-%m-%Y %h:%i') as fecha FROM fallas WHERE codigo ='$codigo' and  lote = '$lote' AND mts_inv BETWEEN $vendido AND $rango_max ORDER BY mts_inv ASC";
    //echo $fallas;
    echo json_encode($f->getResultArray($fallas));
}



new FacturaVenta();
?>
