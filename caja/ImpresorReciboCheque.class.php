<?php

/**
 * Description of ImpresorReciboCheque
 * @author Ing.Douglas
 * @date 14/09/2017
 */
  
  
require_once '../Y_Template.class.php';
require_once '../Y_DB_MySQL.class.php';
require_once '../Functions.class.php';
 

class ImpresorReciboCheque {
 
    function __construct() {
                
        $db = new My();
        $t = new Y_Template("ImpresorRecibo.html"); 
        
        $db->Query("SET lc_time_names = 'es_PY';");
        
        $nro_cheque = $_REQUEST['nro_cheque'];
        $factura_legal = $_REQUEST['factura_legal'];
        $ruc = $_REQUEST['ruc'];
        $cliente = $_REQUEST['cliente'];
        $usuario_caja = $_REQUEST['usuario'];
        $tipo_factura = $_REQUEST['tipo_factura']; // Manual Pre-Impresa
        $suc = $_REQUEST['suc'];
        $pdv = $_REQUEST['pdv']; 
        $intereses =  $_REQUEST['intereses'];
        $nro_factura_manual = $_REQUEST['factura_manual']; 
        $cancelacion = $_REQUEST['cancelacion'];
        $pago_cuenta = $_REQUEST['pago_cuenta'];

        $t->Set('cancelacion',($cancelacion == 'true')?'X':'');
        $t->Set('pago_cuenta',($pago_cuenta == 'true')?'X':'');
        
        $fecha = date("d-m-Y");
 
        $tipo_doc = "Recibo";
               
        
        $moneda = $_REQUEST['moneda'];  
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
        
         
        
        //Aqui dedocraticamente 7
        $limite_items_x_venta = 7;
        
         // En Español la Fecha
        
 
        $master = array();
        $cheques = array();
        
        $db->Query("SELECT  cod_cli,ruc_cli,cliente,valor as Total,fact_nro as Factura,date_format(fecha_cierre,'%d-%m-%Y') as FechaFactura FROM cheques_ter t, factura_venta f WHERE t.f_nro = f.f_nro AND nro_cheque = '$nro_cheque'");
        $i = 0;
        $Total_pagado = 0;
        while($db->NextRecord()){
            $ruc = $db->Record['ruc_cli'];
            $cliente = $db->Record['cliente']; 
            $Total_pagado += 0 + $db->Record['Total'];
            $Factura = $db->Record['Factura'];
            $Fecha = $db->Record['FechaFactura'];
            $Importe = $db->Record['Total'];                
            $master[$i] = array($Factura, $Fecha, $Importe);
            $i++;
        }
        $fn = new Functions();
        
                
        $redondeado = number_format($Total_pagado , $decimales, ',', '');                
        $monto_en_letras = $fn->extense($redondeado,'',$type);
        if($moneda != 'G$'){
           $redondeado = number_format($Total_pagado, $decimales, '.', ',');                
           $monto_en_letras = $fn->extense($redondeado,'',$type);
        }
        $t->Set("total",  number_format($Total_pagado, $decimales, ',', '.'));
        
        
        $t->Set('total_letras', $monto_en_letras);
        

        if($Factura == null){
           //echo "Error: ".__file__."  ".__line__."<br> $sql_det"; 
           echo "<span style='color:red' >Error:</span> <span style='background:yellow' >No se puede Imprimir Recibo Legal debido a que el Ticket de Venta no posee Factura Legal asociada.</span>";
           die();
           
        }

         
        
        $TOTAL_IMPORTE_PAGADO = 0;
       
        $db->Query("SELECT nombre AS Banco,nro_cheque AS Nro,DATE_FORMAT(fecha_emis,'%d-%m-%Y') AS Emision, DATE_FORMAT(fecha_pago,'%d-%m-%Y') AS Pago,valor AS Importe"
                . " FROM bancos b, cheques_ter t WHERE b.id_banco = t.id_banco AND t.nro_cheque = $nro_cheque");
        
        $i = 0;
        $t->Set('echq',"" );
        while ($db->NextRecord()) {
            $Banco = $db->Record['Banco'];
            $Nro = $db->Record['Nro'];
            $Emision = $db->Record['Emision'];
            $Pago = $db->Record['Pago']; 
            $Importe = $db->Record['Importe'];                 
            $cheques[$i] = array($Banco, $Nro,$Emision,$Pago,$Importe);
            $TOTAL_IMPORTE_PAGADO+= 0+$Importe;
            $i++;
            $t->Set('echq',"X" );
        }
          
        //Efectivo 
        
         
        $t->Set('efectivo', number_format(0, 0, ',', '.'));  
        $t->Set('eefec',"" );
         
        //Tarjetas
        
        $t->Set('tarjeta', number_format(0, 0, ',', '.'));
        $t->Set('etarj',"" );
         
        
        //Depositos
         
        
        $t->Set('deposito', number_format(0, 0, ',', '.')); 
        $t->Set('edep',"" );
       
        
        //$TOTAL_IMPORTE_PAGADO = $TOTAL_IMPORTE_PAGADO;
        
        $t->Set('total_importe', number_format($TOTAL_IMPORTE_PAGADO, 0, ',', '.')); 
        

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
                $$clave = $valor;
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
        
        $db->Query("UPDATE factura_cont SET estado =  'Cerrada' WHERE fact_nro = '$factura_legal' and pdv_cod = '$pdv' AND suc = '$suc' and tipo_doc = '$tipo_doc' and tipo_fact = '$tipo_factura' and moneda = '$moneda' ");
        //$db->Query("UPDATE pagos_recibidos SET folio_num = '$factura_legal', pdv_cod = '$pdv' WHERE id_pago = $nro_cobro");
        
              
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

new ImpresorReciboCheque();
?>