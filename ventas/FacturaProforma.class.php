<?php

/**
 * Description of FacturaProforma
 * @author Ing.Douglas
 * @date 02/06/2018
 */
 
require_once '../Y_Template.class.php';
require_once '../Y_DB_MySQL.class.php';
require_once '../Functions.class.php';
 

class FacturaProforma {
    
    function __construct() {
        $factura = $_REQUEST['factura'];         
        $ruc = $_REQUEST['ruc'];
        $cliente = utf8_decode($_REQUEST['cliente']);
        $usuario_caja = $_REQUEST['usuario'];
        $tipo_factura = $_REQUEST['tipo_factura'];
        $suc = $_REQUEST['suc'];        
        $moneda = $_REQUEST['moneda']; 
        $decimales = 0;
        if($moneda != 'G$'){
            $decimales = 2;
        } 
        
        $db = new My();
        
        $tipo_doc = "Factura";
        
        $t = new Y_Template("FacturaProforma.html"); 
        
        $db->Query("SELECT direccion,ciudad,pais,tel FROM sucursales WHERE suc = '$suc'");
        $db->NextRecord();
        $direccion = $db->Record['direccion'];
        $ciudad = $db->Record['ciudad'];
        $pais = $db->Record['pais'];
        $tel = $db->Record['tel'];
        
        $t->Set('emp_dir', "$direccion - $ciudad - $pais ");
        $t->Set('tel', $tel);
        
          
        $t->Set('usuario', $usuario_caja);
        
                
        $sql_tipo = "SELECT tipo_doc_cli,desc_sedeco FROM factura_venta WHERE f_nro = $factura";
        $db->Query($sql_tipo);
        $db->NextRecord();
        $tipo_doc_cli = $db->Record['tipo_doc_cli'];
        $desc_sedeco = $db->Record['desc_sedeco'];
        
        $ms = new My();
        
        $sql_addr ="SELECT ciudad ,dir, p.nombre AS pais FROM clientes c, paises p  WHERE ci_ruc = '$ruc' AND c.pais = p.codigo_pais";
        $ms->Query($sql_addr);
        $dir = "";
        if($ms->NumRows()>0){
            $ms->NextRecord();
            $Address = $ms->Record['dir'];
            $City = $ms->Record['ciudad'];
            $Country = $ms->Record['pais'];
            $dir = "$Address - $City - $Country"; 
        }
        $t->Set('dir', $dir);      
        // Buscar limite de items por Factura    
         
        $limite_items_x_venta = 55;


        // En Espa�ol la Fecha
        $db->Query("SET lc_time_names = 'es_PY';");
        
        // Datos de la Cabecera de Factura y el Cliente
        
        $sql_cli ="SELECT DATE_FORMAT(fecha_cierre,'%d de %M de %Y') AS fecha,usuario  FROM factura_venta f WHERE f_nro = $factura";
        $db->Query($sql_cli);

        if($db->NumRows()==0){
           echo "Error: ".__file__."  ".__line__."<br> $sql_cli"; die();
        }	
        $db->NextRecord();

        $fecha = $db->Record['fecha'];         
        $usuario = $db->Record['usuario'];
         
        $master = array();

        //$sql_det = "select lote as codigo,descrip,cantidad,um_cod, precio_venta,descuento,subtotal from fact_vent_det where f_nro = $factura";
        $sql_det = "select count(*) as articulos,codigo,descrip,SUM(cantidad) AS cantidad,um_cod, precio_venta  AS precio_venta,SUM(descuento) AS descuento,SUM(subtotal) AS subtotal from fact_vent_det where f_nro = $factura GROUP BY codigo,precio_venta ORDER BY codigo ASC,descrip ASC";
        $db->Query($sql_det);
        $cant = $db->NumRows();

        if($cant == 0){
           echo "Error: ".__file__."  ".__line__."<br> $sql_det"; die();
        }
        

        $i = 0;

        while ($db->NextRecord()) {
            $codigo = $db->Record['codigo'];
            $descri = $db->Record['descrip'];

            if($db->Record['articulos']>1){
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
                $$clave = $valor;
				if($clave !== 'factura_interval_dup'){
					$margenes.=" $valor" . "mm ";
				}
            }
        }
        
        $margenes = $factura_margen_sup . "mm " . $factura_margen_der . "mm " . $factura_margen_inf. "mm " . $factura_margen_izq . "mm " ;        
        
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
         
        $t->Set('ruc', $ruc);
        $t->Set('fecha', $fecha_ahora);
        $t->Set('ref', $factura);
        $t->Set('vendedor', $usuario);
        $t->Set('moneda', str_replace("$", "s", $moneda));        

        
        $t->Set('intervalo', $factura_interval_dup.'mm');

        $t->Set('id_nombre', "primer_nombre");  $t->Set('id_doc', "primer_ci");   
        $this->renderizar($t, $master, $limite_items_x_venta,$decimales,$moneda,$tipo_doc_cli,$factura,$desc_sedeco);
        $t->Show("intervalo");
         
        $t->Show("end_marco");

        if($cant > 30){
            $t->Show("no_imprimir");
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
                    $t->Set('descuento', number_format($descuento, 1, ',', '.'));
                    
                    
                    if($tipo_doc_cli == 'C.I. Diplomatica'){
                       $t->Set('excenta',  number_format($subtotal,$decimales, ',', '.'));
                       $t->Set('subtotal', "/");
                       $t->Set('aling_excenta', "right");
                       $t->Set('subtotal_excenta', "center");                     
                    }else{
                       $t->Set('excenta', "/&nbsp;&nbsp;");
                       $t->Set('subtotal', number_format($subtotal,$decimales, ',', '.'));
                       $t->Set('aling_excenta', "center");
                       $t->Set('subtotal_excenta', "right");  
                    }
                    
                    $TOTAL += 0 + $subtotal;
                    $t->Show("detalle");
                    $contador++;
                }
                $TOTAL = round($TOTAL) - $desc_sedeco;
                for ($i = $contador; $i < $limite_items_x_venta; $i++) {
                    $t->Show("detalle_vacio");
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
                $IVA = round($TOTAL / 11);
                
                $t->Set('total_letras', $monto_en_letras);

                
                if($tipo_doc_cli == 'C.I. Diplomatica'){
                    $t->Set('total', "");
                    $t->Set('total_excenta', number_format($TOTAL, $decimales, ',', '.'));
                    $t->Set('iva_10', "");
                }else{
                   $t->Set('total', number_format($TOTAL, $decimales, ',', '.'));
                   $t->Set('iva_10', number_format($IVA, 0, ',', '.'));
                   $t->Set('total_excenta', ""); 
                }
                $t->Set('total_factura', number_format($TOTAL, $decimales, ',', '.'));
                $t->Set('redondeo', ""); 
                if($desc_sedeco > 0){
                    $t->Set('redondeo', "Redondeo: -$desc_sedeco~~~~~~"); 
                }
                $t->Show("pie_detalle");
            }    

            /**
            * Parametros de impresion
            */
            function getParameters($user){
                $params = "<option value='default'> (*)- Default </option>";
                $link = new My();
                $link->Query("select u.usuario,u.suc from parametros p inner join usuarios u using(usuario) where estado = 'Activo' group by u.usuario order by  u.suc*1 asc, u.usuario asc");
                $params .= "< option > ( 2 )- Elegir</option>";
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

new FacturaProforma();
?>