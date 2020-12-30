<?php

/**
 * Description of ImpresorFactura
 * @author Ing.Douglas
 * @date 28/04/2015
 */

require_once '../Y_Template.class.php';
require_once '../Y_DB_MySQL.class.php';
require_once '../Functions.class.php';
 

class ImpresorFactura {
    
    function __construct() {
        $factura = $_REQUEST['factura'];
        $factura_legal = $_REQUEST['factura_legal'];
        $ruc = $_REQUEST['ruc'];
        $cliente = strtoupper(utf8_decode(urldecode($_REQUEST['cliente'])));
        $usuario_caja = $_REQUEST['usuario'];
        $tipo_factura = $_REQUEST['tipo_factura'];
        $suc = $_REQUEST['suc'];
        $pdv = $_REQUEST['pdv'];
        $moneda = $_REQUEST['moneda']; 
        $decimales = 0;
        if($moneda != 'G$'){
            $decimales = 2;
        } 
        
        $tipo_doc = "Factura";
        
        $man_pre = $_REQUEST['man_pre'];
        if($man_pre == "Pre"){
           $man_pre = "Pre-Impresa" ;
        }else{
            if($man_pre == "Conf"){  
               $tipo_doc = "Factura Conformada";     
            } 
            $man_pre = "Manual"; 
            
        }
         
        
        $t = new Y_Template("ImpresorFactura.html"); 
        
        if($tipo_factura == "Contado"){
            $t->Set('contado', '&nbsp;X&nbsp;');
            $t->Set('credito', '&nbsp;&nbsp;&nbsp;&nbsp;');
        }else{
            $t->Set('contado', '&nbsp;&nbsp;&nbsp;&nbsp;');
            $t->Set('credito', '&nbsp;X&nbsp;');
        }
          
        $t->Set('usuario', $usuario_caja);
        
        $db = new My();
        
        $sql_tipo = "SELECT tipo_doc_cli,clase,desc_sedeco FROM factura_venta WHERE f_nro = $factura";
        $db->Query($sql_tipo);
        $db->NextRecord();
        $tipo_doc_cli = $db->Record['tipo_doc_cli'];
        $clase = $db->Record['clase'];
        $desc_sedeco = $db->Record['desc_sedeco'];
                
        // Buscar limite de items por Factura    
        $db->Query("SELECT valor AS limite_items_x_venta FROM parametros WHERE clave = 'vent_det_limit' AND usuario = '*'");
        $db->NextRecord();
        $limite_items_x_venta = $db->Record['limite_items_x_venta'];


        // En Espa�ol la Fecha
        $db->Query("SET lc_time_names = 'es_PY';");
        
        // Datos de la Cabecera de Factura y el Cliente
        
        $sql_cli ="SELECT DATE_FORMAT(fecha_cierre,'%d de %M de %Y') AS fecha,usuario,cliente  FROM factura_venta f WHERE f_nro = $factura";
        $db->Query($sql_cli);

        if($db->NumRows()==0){
           echo "Error: ".__file__."  ".__line__."<br> $sql_cli"; die();
        }	
        $db->NextRecord();
        $cliente = strtoupper(utf8_decode($db->Record['cliente']));
        $fecha = $db->Record['fecha'];         
        $usuario = $db->Record['usuario'];
         
        $master = array();
        
        $descrip_agrup = "";
        if($clase === "Servicio"){
            $descrip_agrup = ",descrip";
        }

        //$sql_det = "select lote as codigo,descrip,cantidad,um_cod, precio_venta,descuento,subtotal from fact_vent_det where f_nro = $factura";
        $sql_det = "select count(*) as articulos,codigo,descrip,SUM(cantidad) AS cantidad,um_cod, precio_venta  AS precio_venta,SUM(descuento) AS descuento,SUM(subtotal) AS subtotal from fact_vent_det where f_nro = $factura GROUP BY codigo,precio_venta $descrip_agrup ORDER BY codigo ASC,descrip ASC";
        $db->Query($sql_det);
        $cant = $db->NumRows();

        if($cant == 0){
           echo "Error: ".__file__."  ".__line__."<br> $sql_det"; die();
        }
        
               

        $i = 0;

        while ($db->NextRecord()) {
            $codigo = $db->Record['codigo'];
            $descri = $db->Record['descrip'];

            if($db->Record['articulos']>1 && $clase === "Articulo"){  
                $f_descri = explode('-',$descri);
                array_pop($f_descri);
                $descri = implode('-',$f_descri);
            }

            $cant_v = $db->Record['cantidad'];
            $descuento = $db->Record['descuento'];            
            $um = $db->Record['um_cod'];
            $precio_venta = $db->Record['precio_venta'];
            $sub_tot = $db->Record['subtotal'];            
            $master[$i] = array($codigo, $descri, $cant_v,$um,$descuento, $precio_venta, $sub_tot);
            $i++;
        }


        //echo "SELECT clave,valor FROM parametros WHERE  (clave LIKE 'factura_margen%' or clave='factura_interval_dup') and usuario = '$usuario_caja' ORDER BY descrip ASC ";

        $db->Query("SELECT clave,valor FROM parametros WHERE  (clave LIKE 'factura_margen%' or clave='factura_interval_dup') and usuario = '$usuario_caja' ORDER BY descrip ASC ");
        $margenes = '';
        $factura_margen_sup=50;
        $factura_margen_inf=0;
        $factura_margen_izq=5;
        $factura_margen_der=5;
        $factura_interval_dup=54;

        if($db->NumRows() > 0){
            while ($db->NextRecord()) {
                $clave = $db->Record['clave'];
                $valor = $db->Record['valor'];
                
                $t->Set($clave, $valor);
                //$clave = $valor;
                //echo $clave."  -  $valor<br>";
                if($clave !== 'factura_interval_dup'){
                     $margenes.=" $valor" . "mm ";
                }else{
                    $factura_interval_dup = $valor;
                    $t->Set('intervalo', $factura_interval_dup.'mm');
                }
            }
        }
        //echo $margenes."<br>";
        //$margenes = $factura_margen_sup . "mm " . $factura_margen_der . "mm " . $factura_margen_inf. "mm " . $factura_margen_izq . "mm " ;   
        
         
        
        $t->Set("factura_margen_sup", $factura_margen_sup);
        $t->Set("factura_margen_inf", $factura_margen_inf);
        $t->Set("factura_margen_izq", $factura_margen_izq);
        $t->Set("factura_margen_der", $factura_margen_der);
        $t->Set("factura_interval_dup", $factura_interval_dup); 
        $t->Show("general_header");

        $t->Set("margenes", $margenes);
        $t->Set("usersConfig", $this->getParameters($usuario_caja));

        $t->Show("start_marco");

        $fecha_ahora = Date("d-m-Y");
        
        $t->Set('cliente', $cliente);
        $t->Set('tipo_doc', $tipo_doc);
        $t->Set('ruc', $ruc);
        $t->Set('fecha', $fecha_ahora);
        $t->Set('ref', $factura);
        $t->Set('vendedor', $usuario);
        $t->Set('moneda', str_replace("$", "s", $moneda));        

         
        

        $t->Set('id_nombre', "primer_nombre");  $t->Set('id_doc', "primer_ci");   
        $this->renderizar($t, $master, $limite_items_x_venta,$decimales,$moneda,$tipo_doc_cli,$factura,$desc_sedeco);
        $t->Show("intervalo");
        $t->Set('id_nombre', "segundo_nombre"); $t->Set('id_doc', "segundo_ci");  
        $this->renderizar($t, $master, $limite_items_x_venta,$decimales,$moneda,$tipo_doc_cli,$factura,$desc_sedeco);
  
        $t->Show("end_marco");

        if($cant > 15){
            $t->Show("no_imprimir");
        }else{
             
            $db->Query("UPDATE factura_venta SET fact_nro = $factura_legal,pdv_cod = '$pdv',tipo_fact = '$man_pre',tipo_doc = '$tipo_doc'  WHERE f_nro = $factura");
            $db->Query("UPDATE factura_cont SET estado =  'Cerrada', tipo = '$tipo_factura' WHERE fact_nro = '$factura_legal' and pdv_cod = '$pdv' AND suc = '$suc' and tipo_doc = '$tipo_doc' and tipo_fact = '$man_pre' and moneda = '$moneda'  ");
            //echo "UPDATE factura_cont SET estado =  'Cerrada' WHERE fact_nro = '$factura_legal' and pdv_cod = '$pdv' AND suc = '$suc' and tipo_doc = '$tipo_doc' and tipo_fact = '$man_pre' and moneda = '$moneda'  ";
        }
    }
    function renderizar($t, $master, $limite_items_x_venta,$decimales,$moneda,$tipo_doc_cli,$factura,$desc_sedeco) {
                $t->Show("cabecera");
                $t->Show("cabecera_detalle");
                $type = 0;
                $nombre_moneda = 'Guaranies';
                if($moneda != 'G$'){
                  $type = 1;
                  $nombre_moneda = 'Dolares';
                } 
                
                $medio_excentos = array(); //"S0263","S0264","TX113","TX114"
                
                $contador = 0;
                $TOTAL = 0;
                
                $TOTAL_IVA_10 = 0;
                $TOTAL_IVA_5  = 0;
                $TOTAL_EXCENTA = 0;
                
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
                    $t->Set('descuento', number_format($descuento, 1, ',', '.'));
                    
                    
                    if($tipo_doc_cli == 'C.I. Diplomatica'){
                       $t->Set('excenta',  number_format($subtotal,$decimales, ',', '.'));
                       $t->Set('linea_iva_10', "/");
                       $t->Set('aling_excenta', "right");
                       $t->Set('aling_iva_5', "center");
                       $t->Set('iva_5', "/"); 
                       $t->Set('align_iva_10', "center");  
                       
                    }else if(in_array($codigo, $medio_excentos)){ // Algunos codigos son excentos
                       $division =   ($subtotal / 2);
                         
                       $excenta =  $division;
                       
                       $TOTAL_EXCENTA  += 0 + $excenta;
                        
                       $t->Set('aling_iva_5', "right");
                         
                       $t->Set('aling_excenta', "right");
                       $t->Set('excenta',number_format( $excenta,$decimales, ',', '.'));
                       $t->Set('align_iva_10', "right");  
                       $t->Set('linea_iva_10', number_format($division,$decimales, ',', '.'));
                       $TOTAL_IVA_10 += 0 + $division; 
                       
                    }else{
                       
                       $t->Set('excenta', "/&nbsp;&nbsp;");
                       $t->Set('linea_iva_10', number_format($subtotal,$decimales, ',', '.'));
                       $t->Set('aling_excenta', "center");
                       $t->Set('aling_iva_5', "center");
                       $t->Set('iva_5', "/"); 
                       $t->Set('align_iva_10', "right");  
                       $TOTAL_IVA_10 += 0 + $subtotal; 
                    }
                    $TOTAL += 0 + $subtotal; 
                    
                    $t->Show("detalle");
                    $contador++;
                }
                
                for ($i = $contador; $i < $limite_items_x_venta; $i++) {
                    $t->Show("detalle_vacio");
                }
                
                $TOTAL -= $desc_sedeco;
                
                if($desc_sedeco > 0){
                    $t->Set('desc_sedeco', "Redondeo: -$desc_sedeco Gs.");
                    
                }else{
                    $t->Set('desc_sedeco', ""); 
                }
                
                $fn = new Functions();
                $redondeado = number_format($TOTAL, $decimales, ',', '');     
                
                //$dbu = new My();
                // Actualizar el total de la Factura para que salga Redondeado
                //$update = "update factura_venta set total= $redondeado WHERE f_nro = $factura";
                // $dbu->Query($update);
                
                $monto_en_letras = $fn->extense($redondeado,$nombre_moneda,$type);
                if($moneda != 'G$'){
                   $redondeado = number_format($TOTAL, $decimales, '.', ',');                
                   $monto_en_letras = $fn->extense($redondeado,$nombre_moneda,$type);
                } 
                $IVA_10 =  $TOTAL_IVA_10 / 11 ;
                
                $t->Set('total_letras', $monto_en_letras);

                
                if($tipo_doc_cli == 'C.I. Diplomatica'){
                    $t->Set('total', "");
                    $t->Set('total_excenta', number_format($TOTAL, $decimales, ',', '.'));
                    $t->Set('total_iva_10', "");
                    $t->Set('total_iva_5', "");
                }else{
                   //$total_excenta =  $TOTAL 
                   $subtotal_iva_10 =  $TOTAL- $TOTAL_EXCENTA;
                   $t->Set('total', number_format($subtotal_iva_10, $decimales, ',', '.'));
                   $t->Set('total_excenta', number_format($TOTAL_EXCENTA, $decimales, ',', '.')); 
                   $t->Set('total_iva_10', number_format($IVA_10, $decimales, ',', '.'));
                   //$t->Set('total_iva_5', number_format($IVA, $decimales, ',', '.')); 
                }
                $t->Set('total_factura', number_format($TOTAL, $decimales, ',', '.'));
                
                $t->Show("pie_detalle");
            }    

            /**
            * Parametros de impresion
            */
            function getParameters($user){
                $params = "<option value='default'> (*)- Default </option>";
                $link = new My();
                $link->Query("select u.usuario,u.suc from parametros p inner join usuarios u using(usuario) where estado = 'Activo' group by u.usuario order by  u.suc*1 asc, u.usuario asc");
                $params .= "< option > ( 2 )- Hola</option>";
                while($link->NextRecord()){
                    $usuario = $link->Record['usuario'];
                    if($usuario == trim($user)){
                        $params .= "<option value='$usuario' selected> (" . $link->Record['suc'] .")- $usuario</option>";
                    }else{
                        $params .= "<option value='$usuario'> (" . $link->Record['suc'] .")- $usuario</option>";
                    }
                }
                $link->Close();
                return $params;
            }
    }

new ImpresorFactura();
?>