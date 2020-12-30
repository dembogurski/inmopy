<?PHP
require_once("../Y_DB_MySQL.class.php");


if(isset($_REQUEST['action'])){
   call_user_func($_REQUEST['action']);
}
function facturar_vendedor(){
    $my_link = new My();
    $respuesta = array();
    $datos = json_decode($_POST['datos'],true); 
    $datos_insert = array();
    $datos_insert['factura']=$datos['ticketSalida'];
    $datos_insert['precio_venta']=$datos['precio_venta'];
    $datos_insert['cantidad']=$datos['cantidad'];
    $datos_insert['cod_falla']=$datos['cod_falla'];
    $datos_insert['cm_falla']=$datos['cm_falla'];
    $datos_insert['fp']=$datos['fp'];
    $datos_insert['suc']=$datos['suc'];
    $datos_insert['subtotal']=(float)$datos['precio_venta']*(float)$datos['cantidad'];

    $ticketEntrada = $datos['ticketEntrada'];
    $loteEntrada = $datos['loteEntrada'];
    $cantEntrada = $datos['cantEntrada'];  
    
    $ticketSalida = $datos['ticketSalida'];
    $loteSalida = $datos['loteSalida'];
    $cantSalida = $datos['cantSalida'];
    $usuario = $datos['usuario'];

    $insertarFactVendedor = "INSERT INTO fact_vent_det (f_nro,lote, codigo, um_prod, descrip, um_cod, cantidad, cod_falla, cant_falla, cod_falla_e, falla_real, precio_venta, descuento, precio_neto, subtotal, gramaje, ancho, kg_calc, kg_med, cant_med, sis_med, fuera_rango, dif, tipo_desc, precio_costo, estado, estado_venta)
    SELECT $ticketEntrada,lote,codigo, um_prod, descrip, um_cod, $cantSalida, cod_falla, cant_falla, cod_falla_e, falla_real, precio_venta, descuento, precio_neto, subtotal, gramaje, ancho, kg_calc, kg_med, cant_med, sis_med, fuera_rango, dif, tipo_desc, precio_costo, estado, estado_venta FROM fact_vent_det WHERE f_nro=$ticketSalida AND lote=$loteSalida";

    $my_link->Query($insertarFactVendedor);
    if($my_link->AffectedRows()>0){
        $respuesta["ok"]="Ok!";
        insertarLog($usuario, $ticketSalida, $ticketEntrada, $loteSalida, $cantSalida);
    }else{
        $respuesta["error"]="$insertarFactVendedor";
    }
    echo json_encode($respuesta,JSON_FORCE_OBJECT);
 
}

/**
 * Agrega un Detalle a una Factuara de Venta
 */
function agregarDetalleFactura() {
   $usuario = $_POST['usuario'];
   $factura = $_POST['factura'];
   $codigo = $_POST['codigo'];
   $lote = $_POST['lote'];
   $um = $_POST['um'];
   $ancho = $_POST['ancho'];
   $gramaje = $_POST['gramaje'];
   $precio_venta = $_POST['precio_venta'];
   $cantidad = $_POST['cantidad'];
   $subtotal = $_POST['subtotal'];
   $descrip = $_POST['descrip'];
   $cat = $_POST['cat'];
   $cod_falla = $_POST['cod_falla'];
   $cm_falla = $_POST['cm_falla'];
   $fp = $_POST['fp'];
   $um_prod = $_POST['um_prod'];
   $cod_falla_e = $cod_falla;
   $tipo_doc = $_POST['tipo_doc'];
   $suc = $_POST['suc'];    
   $estado_venta = "Normal";

   if(isset($_POST['estado_venta'])){
       $estado_venta = $_POST['estado_venta'];
   }
   $kg_calc = 0;
   
   if ($cm_falla == "0") {
       if ($fp == "true") {
           $cod_falla = "FP";
       } else {
           $cod_falla = "";
       }
   } else {
       $cm_falla = $cm_falla / 100;
   }

   if ($um === "Mts") {
       $kg_calc = ($gramaje * ($cantidad + $cm_falla) * $ancho) / 1000;
   } else if ($um === "Kg") {
       $kg_calc = $cantidad;
       if (($gramaje && $ancho) != null) {
           // Denunciar Error en Gramaje o Ancho
       }
   }

   $my = new My();
   $sql = "SELECT count(lote) as cant FROM fact_vent_det WHERE f_nro = $factura and codigo = '$codigo' and lote = '$lote';";
   $my->Query($sql); // Verifico si no hay duplicados
   $my->NextRecord();
   $cant = $my->Record['cant'];

   $datos = array();

   if ($cant > 0) {
       $datos["Mensaje"] = "Codigo Duplicado";
   } else {
       $precio_neto = $subtotal / $cantidad;
       $sql = "INSERT INTO fact_vent_det (f_nro, codigo, lote,um_prod, descrip, um_cod,cod_falla,cant_falla,cod_falla_e,falla_real, cantidad, precio_venta, descuento, precio_neto, subtotal, estado,gramaje,ancho,kg_calc,cant_med,estado_venta)
       VALUES ($factura, '$codigo', '$lote','$um_prod', '$descrip', '$um','$cod_falla',$cm_falla,'$cod_falla_e',$cm_falla, $cantidad , $precio_venta, 0,$precio_neto, $subtotal, 'Pendiente',$gramaje,$ancho,$kg_calc, $cantidad,'$estado_venta');";

       $my->Query($sql);
       $sql_total = "SELECT SUM(subtotal) as Total,SUM(descuento) as Descuento FROM fact_vent_det WHERE f_nro = $factura";
       $my->Query($sql_total);
       $my->NextRecord();
       $total = $my->Record['Total'];
       $descuento = $my->Record['Descuento'];
       $total_sin_desc = $total + $descuento;
       $datos["Mensaje"] = "Ok";
       $datos["Total"] = $total;
       $datos["Descuento"] = $descuento;
       $datos["Total_sin_desc"] = $total_sin_desc;
       $total_sin_desc = $total + $descuento;

       $set_desc = 5;  // Para Categoria 1 

       if ($cat < 3) {
           if ($total_sin_desc >= UMBRAL_VENTA_MINORISTA) {
               $datos["ES_CAT"] = $cat;
               if ($cat == 2) {
                   $set_desc = 3;                    
               }
               $datos["DESC"] = $set_desc;
               $sql = "UPDATE fact_vent_det set descuento = ((cantidad * precio_venta * $set_desc) / 100),subtotal = round((cantidad * precio_venta)-((cantidad * precio_venta * $set_desc) / 100),0) WHERE f_nro = $factura";

               $my->Query($sql);
               actualizarCabeceraFactura($factura, 1, $tipo_doc);
               $datos["Porc_desc"] = $set_desc;
           } else { //Borrar  descuentos 
               eliminarDescuentosFactura($factura, $tipo_doc);
               $datos["Porc_desc"] = "0";
           }
       } else {
           eliminarDescuentosFactura($factura, $tipo_doc);
           $datos["Porc_desc"] = "0";
       }
       $sql_pn = "UPDATE fact_vent_det set precio_neto = round((subtotal - descuento) / cantidad,2) where f_nro = $factura;";
       $my->Query($sql_pn);
       
       $my->Query($sql_total);
       $my->NextRecord();
       $total = $my->Record['Total'];
       $descuento = $my->Record['Descuento'];
       $total_sin_desc = $total + $descuento;

       $datos["Mensaje"] = "Ok";
       $datos["Total"] = $total;
       $datos["Descuento"] = $descuento;
       $datos["Total_sin_desc"] = $total_sin_desc;

       // Registrar Fin de Pieza
       if ($fp == "true") {
           $sql = "INSERT INTO edicion_lotes( usuario, codigo, lote, descrip, fecha, hora, suc, FP, e_sap)VALUES ( '$usuario', '$codigo', '$lote', '$descrip', CURRENT_DATE, CURRENT_TIME, '$suc', 'Si', 0);";
           $my->Query($sql);
       }
   }
   echo json_encode($datos);

}

// Generar Nota de Credito
function generarNotaCredito(){
    $f_nro = $_POST['f_nro'];
    $usuario = $_POST['usuario'];
    $link = new My();
    $respuesta = array();
    
    $link->Query("INSERT INTO nota_credito(cod_cli,cliente,ruc_cli,usuario,f_nro,fecha,hora,suc,tipo,estado,moneda,req_auth,vendedor,cat) SELECT f.cod_cli,f.cliente,f.ruc_cli,'$usuario',f_nro, date(now()), time(now()),suc,IF(datediff(date(now()),date(fecha_cierre))>0,'Excepcional','Normal'),'Pendiente','G$',IF(datediff(date(now()),date(fecha_cierre))>0,1,0), f.usuario,cat FROM factura_venta f where f_nro=$f_nro");

    if($link->AffectedRows() > 0){
        $link->Query("SELECT n_nro FROM nota_credito WHERE f_nro=$f_nro and usuario ='$usuario' and estado = 'Pendiente'");
        if($link->NextRecord()){
            $respuesta['n_nro'] = $link->Record['n_nro'];
        }else{
            $respuesta['error'] = 'No se obtuvo el numero de Nota de Credito';
        }
    }else{
        $respuesta['error'] = 'No se pudo crear la Nota de Credito';
    }

    echo json_encode($respuesta);
}

// Insertar articulo en Nota de credito
function insertarLoteNotaCredito(){
    $link = new My();
    $respuesta = array();
    $f_nro = $_POST['f_nro'];
    $n_nro = $_POST['n_nro'];
    $lote = $_POST['lote'];
    $ticketSalida = $_POST['ticketSalida'];
    $ticketEntrada = $_POST['ticketEntrada'];
    $loteSalida = $_POST['loteSalida'];
    $cantSalida = $_POST['cantSalida'];

    $link->Query("INSERT INTO nota_credito_det (n_nro, codigo, lote, um_prod, descrip, cantidad, precio_unit, subtotal, estado_venta) SELECT $n_nro,d.codigo,d.lote,d.um_prod, d.descrip, d.cantidad, d.subtotal/d.cantidad,d.subtotal,d.estado_venta from fact_vent_det d left join nota_credito_det n on d.lote = n.lote left join nota_credito nn on n.n_nro=nn.n_nro and d.f_nro=nn.f_nro where d.f_nro = $f_nro and d.lote=$lote and n.lote is null");
    
    if($link->AffectedRows() > 0){
        $link->Query("UPDATE nota_credito as n INNER JOIN (SELECT n_nro,sum(subtotal) as suma from nota_credito_det group by n_nro) as d on n.n_nro=d.n_nro
        SET n.total=d.suma, n.saldo=d.suma where n.n_nro = $n_nro");

        $insertarFactVendedor = "INSERT INTO fact_vent_det (f_nro, codigo, um_prod, descrip, um_cod, cantidad, cod_falla, cant_falla, cod_falla_e, falla_real, precio_venta, descuento, precio_neto, subtotal, gramaje, ancho, kg_calc, kg_med, cant_med, sis_med, fuera_rango, dif, tipo_desc, precio_costo, estado, estado_venta)
        SELECT $ticketEntrada,codigo, um_prod, descrip, um_cod, $cantSalida, cod_falla, cant_falla, cod_falla_e, falla_real, precio_venta, descuento, precio_neto, subtotal, gramaje, ancho, kg_calc, kg_med, cant_med, sis_med, fuera_rango, dif, tipo_desc, precio_costo, estado, estado_venta FROM fact_vent_det WHERE f_nro=$ticketSalida AND lote=$loteSalida";

        $respuesta['ok'] = "Se inserto el lote $lote, en la Nota de Credito $n_nro";
    }else{
        $respuesta['error'] = "No se pudo insertar el lote $lote, en la Nota de Credito $n_nro";
    }

    echo json_encode($respuesta,JSON_FORCE_OBJECT);
}

function insertarLog($usuario, $fact_cliente, $fact_vendedor, $lote, $cantidad){
    $link = new My();
    $query = "INSERT INTO logs (usuario, fecha, hora, accion, tipo, doc_num, data) VALUES ('$usuario', date(now()), time(now()), 'Facturar Vendedor', 'Factura', '$fact_cliente', 'Fact Vendedor $fact_vendedor, lote:$lote, cantidad:$cantidad')";
    $link->Query($query);
}

function verifDev(){
    $link = new My();
    $f_nro = $_POST['f_nro'];
    $lotes = array();
    $link->Query("SELECT fd.lote FROM fact_vent_det fd INNER JOIN nota_credito n USING(f_nro) INNER JOIN nota_credito_det d ON fd.lote = d.lote AND n.n_nro=d.n_nro WHERE fd.f_nro = $f_nro");
    while($link->NextRecord()){
        array_push($lotes,$link->Record['lote']);
    }
    echo json_encode($lotes);
}
?>