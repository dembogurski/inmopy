<?php

/**
 * Description of ImpresorNotaCredito
 * @author Ing.Douglas
 * @date 04/07/2015
 */
require_once '../Y_Template.class.php';
require_once '../Y_DB_MySQL.class.php';
require_once '../Functions.class.php';

class ImpresorNotaCredito {
   function __construct() {
        $nro_nota = $_REQUEST['nro_nota'];
        $factura = $_REQUEST['factura'];
        $nota_credito_contable = $_REQUEST['nota_credito_contable'];
        $ruc = $_REQUEST['ruc'];
        //$cliente = $_REQUEST['cliente'];
        $usuario_caja = $_REQUEST['usuario'];
        $tipo_factura = $_REQUEST['tipo_factura'];
        $suc = $_REQUEST['suc'];
        $pdv = $_REQUEST['pdv'];
        
        $man_pre = $_REQUEST['man_pre'];
   
        $tipo_doc = "Nota de Credito";
        
        $moneda = $_REQUEST['moneda'];
        $decimales = 0;
        if($moneda != "G$"){
            $decimales = 2;
        }
        
        
        $t = new Y_Template("ImpresorNotaCredito.html"); 
        
         
        $t->Set('usuario', $usuario_caja);
        
        $db = new My();
        
        // Buscar limite de items por Factura    
        $db->Query("SELECT valor AS limite_items_x_venta FROM parametros WHERE clave = 'vent_det_limit' AND usuario = '*'");
        $db->NextRecord();
        $limite_items_x_venta = $db->Record['limite_items_x_venta'];


        // En Español la Fecha
        $db->Query("SET lc_time_names = 'es_PY';");
        
        // Datos de la Cabecera de Factura y el Cliente
        $sql_cli ="SELECT  DATE_FORMAT(fecha,'%d de %M de %Y') AS fecha,cliente, suc,moneda ,clase  FROM nota_credito WHERE estado = 'Cerrada' AND n_nro = $nro_nota";
        $db->Query($sql_cli);
              

        if($db->NumRows()==0){
           echo "Error: ".__file__."  ".__line__."<br> $sql_cli"; die();
        }	
        $db->NextRecord();

        $fecha = $db->Record['fecha'];         
        $cliente = $db->Record['cliente'];
        $suc = $db->Record['suc'];       
        $clase = $db->Record['clase'];
        $moneda = $db->Record['moneda'];         
        
        $sql_factura_legal = "select establecimiento,f.pdv_cod, f.fact_nro from factura_venta f, factura_cont c where f.fact_nro = c.fact_nro and f_nro = $factura and c.tipo_doc = 'Factura'";
        $db->Query($sql_factura_legal);
        $comprobante = "";
        if($db->NumRows()>0){
           $db->NextRecord(); 
           $estab = $db->Record['establecimiento']; 
           $pdv_cod = $db->Record['pdv_cod']; 
           $fact_nro = str_pad($db->Record['fact_nro'],7,"0", STR_PAD_LEFT);
           $comprobante = $estab."-".$pdv_cod."-".$fact_nro;
           $t->Set('comprobante',$comprobante);
        }      
        
        
        
        $master = array();
        
        $mostrar = "lote";
        if($clase === "Servicio"){
            $mostrar = "codigo";
        }

        $sql_det = "select $mostrar as codigo,descrip,cantidad,um_prod, precio_unit,subtotal from nota_credito_det where n_nro = $nro_nota";
        $db->Query($sql_det);

        if($db->NumRows()==0){
           echo "Error: ".__file__."  ".__line__."<br> $sql_det"; die();
        }

        $i = 0;
        while ($db->NextRecord()) {
            $codigo = $db->Record['codigo'];
            $descri = $db->Record['descrip'];
            $cant_v = $db->Record['cantidad'];
                  
            $um = $db->Record['um_prod'];
            $precio_unit = $db->Record['precio_unit'];
            $sub_tot = $db->Record['subtotal'];            
            $master[$i] = array($codigo, $descri, $cant_v,$um,0, $precio_unit, $sub_tot);
            $i++;
        }


        $t->Show("general_header");

        $db->Query("SELECT clave,valor FROM parametros WHERE clave LIKE 'factura_margen%' and usuario = '$usuario_caja' ORDER BY descrip ASC");
        $margenes = '';
        if($db->NumRows() > 0){
            while ($db->NextRecord()) {
                $clave = $db->Record['clave'];
                $valor = $db->Record['valor'];
                $margenes.=" $valor" . "px";
            }
        }else{
            $margenes = "10px 10px 10px 10px";
        }
        $t->Set("margenes", $margenes);

        $t->Show("start_marco");

        $t->Set('cliente', $cliente);
        $t->Set('tipo_doc', $tipo_doc);
        $t->Set('ruc', $ruc);
        $t->Set('fecha', $fecha);
        $t->Set('ref', $nro_nota);
        $t->Set('vendedor', $usuario);
        

        $db->Query("SELECT valor as intervalo FROM parametros WHERE clave LIKE 'factura_interval_dup' and usuario = '$usuario_caja' ");
        $db->NextRecord(); 
        $intervalo = $db->Record['intervalo'];
        $t->Set('intervalo', $intervalo);

        $t->Set('id_nombre', "primer_nombre");  $t->Set('id_doc', "primer_ci");   
        $this->renderizar($t, $master, $limite_items_x_venta,$moneda,$decimales);
        $t->Show("intervalo");
        $t->Set('id_nombre', "segundo_nombre"); $t->Set('id_doc', "segundo_ci");  
        $this->renderizar($t, $master, $limite_items_x_venta,$moneda,$decimales);
  
        $t->Show("end_marco");

        $db->Query("update nota_credito set fact_nro = $nota_credito_contable,pdv_cod = '$pdv',tipo_fact = '$man_pre',tipo_doc = '$tipo_doc', suc ='$suc', moneda ='$moneda'  where n_nro = $nro_nota");
        $db->Query("UPDATE factura_cont SET estado =  'Cerrada' WHERE fact_nro = '$nota_credito_contable' and pdv_cod = '$pdv' and tipo_fact = '$man_pre' AND suc = '$suc' ");
        //echo "UPDATE fact_cont SET estado = 'Cerrada'  WHERE fact_nro = '$factura_legal' AND suc = '$suc' ";
                
    }
    function renderizar($t, $master, $limite_items_x_venta,$moneda,$decimales) {
                $t->Show("cabecera");
                $t->Show("cabecera_detalle");
                
                $nombre_moneda = 'Guaranies';
                $type = 0;
                 
                if($moneda != 'G$'){
                  $type = 1;
                  $nombre_moneda = 'Dolares';                  
                }
                $t->Set('moneda', str_replace("$","s", $moneda ));       
                
                $contador = 0;
                $TOTAL = 0;
                //array($codigo, $descri, $cant_v,$um,$descuento, $precio_venta, $sub_tot);
                foreach ($master as $arr) {
                    $codigo = $arr[0];
                    $descrip = $arr[1];
                    $cant = $arr[2];
                    $um = $arr[3];
                    $descuento = $arr[4];
                    $precio_venta = $arr[5];
                    $subtotal = $arr[6];

                    $t->Set('codigo', $codigo);
                    $t->Set('cantidad', $cant);
                    $t->Set('um', $um);
                    $t->Set('descrip', $descrip);
                    $t->Set('precio', number_format($precio_venta, $decimales, ',', '.'));
                    $t->Set('descuento', number_format($descuento, $decimales, ',', '.'));
                    $t->Set('subtotal', number_format($subtotal, $decimales, ',', '.'));
                    $TOTAL += 0 + $subtotal;
                    $t->Show("detalle");
                    $contador++;
                }

                for ($i = $contador; $i < $limite_items_x_venta; $i++) {
                    $t->Show("detalle_vacio");
                }
                $fn = new Functions(); 
                
                $redondeado = number_format($TOTAL, $decimales, ',', '');                
                $monto_en_letras = $fn->extense($redondeado,$nombre_moneda,$type);
                if($moneda != 'G$'){
                   $redondeado = number_format($TOTAL, $decimales, '.', ',');                
                   $monto_en_letras = $fn->extense($redondeado,$nombre_moneda,$type);
                } 
                
                
                $IVA = round($TOTAL / 11);
                $t->Set('iva_10', number_format($IVA, $decimales, ',', '.'));
                $t->Set('total_letras', $monto_en_letras);

                $t->Set('total', number_format($TOTAL, $decimales, ',', '.'));
                $t->Show("pie_detalle");
            }    
    }

new ImpresorNotaCredito();
?>