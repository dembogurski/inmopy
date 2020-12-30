<?php

/**
 * Description of ImpresorRecibo
 * @author Ing.Douglas
 * @date 17/08/2015
 */
 
  
require_once '../Y_Template.class.php';
require_once '../Y_DB_MySQL.class.php';
require_once '../Functions.class.php';
 

class ImpresorReciboCaja {
 
    function __construct() {        
        
        $db = new My();
        $t = new Y_Template("ImpresorRecibo.html"); 
        
        $db->Query("SET lc_time_names = 'es_PY';");
        
        $factura = $_REQUEST['factura'];
        $nro_recibo = $_REQUEST['nro_recibo'];
        $pdv = $_REQUEST['pdv_cod'];
        
        $db->Query("SELECT cod_cli,cliente,ruc_cli,moneda,suc,fact_nro, DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha,total FROM factura_venta WHERE f_nro = $factura;");
        $db->NextRecord();
        
        
        $factura_legal = $db->Record['fact_nro'];
        $ruc = $db->Record['ruc_cli'];
        $cliente = $db->Record['cliente'];
        $usuario_caja = $db->Record['usuario'];
        
        $suc = $db->Record['suc']; 
        $moneda = $db->Record['moneda']; 
        
        $intereses =  0;
        $interesCobra = !($intereses > 0);
        
        $nro_factura_manual = ''; 
        $cancelacion = 'false';
        $pago_cuenta = 'true';

        $t->Set('cancelacion',($cancelacion == 'true')?'X':'');
        $t->Set('pago_cuenta',($pago_cuenta == 'true')?'X':'');
        
        $fecha = date("d-m-Y");
 
        $tipo_doc = "Recibo";               
        $tipo_factura = 'Pre-Impresa';  
         
        $decimales = 0;
        $nombre_moneda = 'Guaranies';
        $type = 0;
        if($moneda != 'G$'){
            $decimales = 2;
            $t->Set('moneda_letras',"DOLARES");
            $nombre_moneda = 'Dolares';
            $type = 1;
        }else{
            $t->Set('moneda_letras',"GUARAN&Iacute;ES");
        } 
        
        
          
        $t->Set('usuario', $usuario_caja);
        $t->Set("suc", $suc);
        $t->Set("fecha", $fecha);
        
        if($suc == "30"){
           $t->Set('firma',"none");   
        }else{
           $t->Set('firma',"table-block");   
        }
        
        
        // Buscar limite de items por Factura    
        //$db->Query("SELECT valor AS limite_items_x_venta FROM parametros WHERE clave = 'vent_det_limit' AND usuario = '*'");
        //$db->NextRecord();
        //$limite_items_x_venta = $db->Record['limite_items_x_venta'];
        //Aqui dedocraticamente 7
        $limite_items_x_venta = 7;
        
         // En Español la Fecha
        
 
        $master = array();
        $cheques = array();
         
 
        $Fecha = $db->Record['fecha'];
        $TotalFactura= $db->Record['total'];     // No Importa siempre debe ir lo que pago actualmente            
        
             
         
        
        $TOTAL_IMPORTE_PAGADO = 0;

        //Efectivo 
        $db->Query("SELECT SUM(entrada_ref) / cotiz as efectivo FROM efectivo WHERE f_nro = $factura");         
        $db->NextRecord();
        $efectivo = $db->Record['efectivo'];
        if($efectivo > 0  && !$interesCobra){
            $efectivo = $efectivo - $intereses;
            $interesCobra = true;
        }
        
        if($efectivo != null && (float)$efectivo > 0){            
            $TOTAL_IMPORTE_PAGADO+= 0+$efectivo;
            $t->Set('efectivo', number_format($efectivo, 0, ',', '.'));  
            $t->Set('eefec',"X" );
        }else{
            $t->Set('efectivo', number_format(0, 0, ',', '.'));  
            $t->Set('eefec',"" );
        }
        // Cheque       
        $db->Query("SELECT nombre AS Banco,nro_cheque AS Nro,DATE_FORMAT(fecha_emis,'%d-%m-%Y') AS Emision, DATE_FORMAT(fecha_pago,'%d-%m-%Y') AS Pago,valor  AS Importe"
                . " FROM bancos b, cheques_ter t WHERE b.id_banco = t.id_banco AND t.f_nro = $factura");
        
        $i = 0;
        $t->Set('echq',"" );
        while ($db->NextRecord()) {
            $Banco = $db->Record['Banco'];
            $Nro = $db->Record['Nro'];
            $Emision = $db->Record['Emision'];
            $Pago = $db->Record['Pago']; 
            $Importe = $db->Record['Importe'];
            if($i == 0){
                if($Importe > $intereses && !$interesCobra){
                    $Importe = $Importe - $intereses;
                    $interesCobra = true;
                }
            } 
            $cheques[$i] = array($Banco, $Nro,$Emision,$Pago,$Importe);
            $TOTAL_IMPORTE_PAGADO+= 0+$Importe;
            $i++;
            $t->Set('echq',"X" );
        }
        //Tarjetas
        $db->Query("SELECT nombre,SUM(monto) as tarjeta FROM convenios WHERE f_nro = $factura");
        $db->NextRecord();
        $tarjeta = $db->Record['tarjeta'];
        $tipo_tarjeta = $db->Record['nombre'];
        
        $tipo_tarjeta_ret = "Tarjeta";
        $TIPO_TARJETA_RETENCION = "TARJETAS";
        if($tipo_tarjeta == "RETENCION"){
            $tipo_tarjeta_ret = "Retencion";
            $TIPO_TARJETA_RETENCION = "RETENCION";
        }
        $t->Set('TIPO_TARJETA_RETENCION', $TIPO_TARJETA_RETENCION );
        $t->Set('tipo_tarjeta_ret', $tipo_tarjeta );
        
        
        if($tarjeta > $intereses && !$interesCobra){
            $tarjeta -= $intereses;
            $interesCobra = true;
        } 
            
        if($tarjeta < 0){
            $tarjeta = 0;
        }
        if($tarjeta != null){            
            $TOTAL_IMPORTE_PAGADO+= 0+$tarjeta;
            $t->Set('tarjeta', number_format($tarjeta, 0, ',', '.')); 
            $t->Set('etarj',"X" );
        }else{
            $t->Set('tarjeta', number_format(0, 0, ',', '.'));
            $t->Set('etarj',"" );
        }
        
        //Depositos nada por ahora
        /* 
        $db->Query("SELECT SUM(entrada) AS deposito FROM bcos_ctas_mov WHERE trans_num = $nro_cobro");
        $db->NextRecord();  
        $deposito = $db->Record['deposito'];  
        if($deposito != null){           
            $TOTAL_IMPORTE_PAGADO+= 0+$deposito;
            $t->Set('deposito', number_format($deposito, 0, ',', '.'));  
            $t->Set('edep',"X" );
        }else{
            $t->Set('deposito', number_format(0, 0, ',', '.')); 
            $t->Set('edep',"" );
        }*/
        
        $t->Set('deposito', number_format(0, 0, ',', '.')); 
        $t->Set('edep',"" );
        
        //$TOTAL_IMPORTE_PAGADO = $TOTAL_IMPORTE_PAGADO + 0;
        
        $t->Set('total_importe', number_format($TOTAL_IMPORTE_PAGADO, 0, ',', '.')); 
        
        
    
        $Total_pagado = $TOTAL_IMPORTE_PAGADO   ;
        $fn = new Functions();
        
                
        $redondeado = number_format($Total_pagado , $decimales, ',', '');                
        $monto_en_letras = $fn->extense($redondeado,'',$type);
        if($moneda != 'G$'){
           $redondeado = number_format($Total_pagado, $decimales, '.', ',');                
           $monto_en_letras = $fn->extense($redondeado,'',$type);
        }
        $t->Set("total",  number_format($Total_pagado, $decimales, ',', '.'));  
        $t->Set('total_letras', $monto_en_letras);
        
        
        $master[0] = array($factura_legal, $Fecha, $Total_pagado);
        

        $db->Query("SELECT clave,valor FROM parametros WHERE (clave LIKE 'factura_margen%' or clave='factura_interval_dup') and usuario = '$usuario_caja' ORDER BY descrip ASC ");
        //echo "SELECT clave,valor FROM parametros WHERE clave LIKE 'factura_margen%' and usuario = '$usuario_caja'";
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
                //$clave = $valor;
                if($clave !== 'factura_interval_dup'){
                        $margenes.=" $valor" . "mm ";
                }                
            }
        }

        $margenes = $factura_margen_sup . "mm " . $factura_margen_der . "mm ". $factura_margen_inf. "mm " . $factura_margen_izq . "mm " ;
                
        $t->Set("factura_margen_sup", $factura_margen_sup);
        $t->Set("factura_margen_inf", $factura_margen_inf);
        $t->Set("factura_margen_izq", $factura_margen_izq);
        $t->Set("factura_margen_der", $factura_margen_der);
        $t->Set("factura_interval_dup", $factura_interval_dup);
        $t->Show("general_header"); 

        $t->Set("margenes", $margenes);
        $t->Set("usersConfig", $this->getParameters($usuario_caja));

        $t->Show("start_marco");

        $t->Set('cliente', utf8_decode($cliente));
        $t->Set('tipo_doc', $tipo_doc);
        $t->Set('ruc', $ruc);
        $t->Set('fecha_cab', $fecha);
        $t->Set('ref', $nro_cobro);
        
        $t->Set('intervalo', $factura_interval_dup.'mm');

        $t->Set('id_nombre', "primer_nombre");  $t->Set('id_doc', "primer_ci");   
        $this->renderizar($t, $master,$cheques, $limite_items_x_venta,$moneda,$decimales,0);
        $t->Show("intervalo");
        $t->Set('id_nombre', "segundo_nombre"); $t->Set('id_doc', "segundo_ci");  
        $this->renderizar($t, $master,$cheques, $limite_items_x_venta,$moneda,$decimales,1); 
  
        $t->Show("end_marco");
        
        $db->Query("UPDATE factura_cont SET estado =  'Cerrada'   WHERE fact_nro = '$nro_recibo'   and pdv_cod = '$pdv' AND suc = '$suc' and tipo_doc = '$tipo_doc' and tipo_fact = '$tipo_factura' and moneda = '$moneda' ");
         
         
        //echo "UPDATE fact_cont SET estado = 'Cerrada'  WHERE fact_nro = '$factura_legal' AND suc = '$suc' ";
                
    }
     
    function renderizar($t, $master,$cheques, $limite_items_x_venta,$moneda,$decimales,$cont) {
                $t->Set('moneda', str_replace("$", "s", $moneda));
                $t->Show("cabecera");
                $t->Show("cabecera_detalle");

                $contador = 0;
                $TOTAL = 0;
                //array($codigo, $descri, $cant_v,$um,$descuento, $precio_venta, $sub_tot);
                foreach ($master as $arr) {
                    $Factura = $arr[0];
                    $Fecha = $arr[1];
                    $Importe = $arr[2];                    

                    $t->Set('factura', $Factura);
                    $t->Set('fecha', $Fecha);                    
                    $t->Set('importe', number_format($Importe, $decimales, ',', '.'));
                    
                    if($Factura == "Interes"){
                       $t->Set('contenteditable', "contenteditable");   
                       $t->Set('factura', "");
                       $t->Set('factura_legal', "factura_legal_$cont");
                       
                    }else{
                       $t->Set('contenteditable', "contenteditable");  
                       $t->Set('factura_legal', "");
                    }
                    
                    $TOTAL += 0 + $Importe;
                    $t->Show("detalle");
                    $contador++;
                }
                $cont++;

                for ($i = $contador; $i < $limite_items_x_venta; $i++) {
                    $t->Show("detalle_vacio");
                }               

                $t->Set('total_factura', number_format(round($TOTAL), $decimales, ',', '.'));
                $t->Show("pie_detalle");
                
                // Aqui detalles de Cheques
                $contador = 0;
                $TOTAL_CHEQUES = 0;
                foreach ($cheques as $arr) {
                    $Banco = $arr[0];
                    $NroCheque = $arr[1];
                    $Emision = $arr[2];
                    $Pago = $arr[3];
                    $Importe = $arr[4];
                    $TOTAL_CHEQUES += 0 + $Importe;
                    $t->Set('banco', $Banco);
                    $t->Set('nro_cheque', $NroCheque);                    
                    $t->Set('emision', $Emision);
                    $t->Set('pago', $Pago);                    
                    $t->Set('importe', number_format($Importe, $decimales, ',', '.'));  
                    $t->Show("datos_cheques");
                    $contador++;
                }
                $t->Set('total_cheques', number_format($TOTAL_CHEQUES, $decimales, ',', '.'));
                
                for ($i = $contador; $i < $limite_items_x_venta-4; $i++) {
                    $t->Show("datos_cheques_vacio");
                }                
                $t->Show("pie");
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

new ImpresorReciboCaja();
?>