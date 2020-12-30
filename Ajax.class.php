<?php

set_time_limit(0);

require_once("Y_DB_MySQL.class.php");

define('UMBRAL_VENTA_MINORISTA', 370000);

//setlocale(LC_ALL, "en_PY");7
//date_default_timezone_set('America/Asuncion');

class Ajax {

    function __construct() {
        if ($action = $_REQUEST['action']) {
            if (function_exists($action)) {
                call_user_func($action);
            } else {
                echo "Funcion $action no declarada...";
            }
        }
    }

}

function getIP() {
    if (isset($_SERVER)) {
        if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            return $_SERVER['HTTP_X_FORWARDED_FOR'];
        } else {
            return $_SERVER['REMOTE_ADDR'];
        }
    } else {
        if (isset($GLOBALS['HTTP_SERVER_VARS']['HTTP_X_FORWARDER_FOR'])) {
            return $GLOBALS['HTTP_SERVER_VARS']['HTTP_X_FORWARDED_FOR'];
        } else {
            return $GLOBALS['HTTP_SERVER_VARS']['REMOTE_ADDR'];
        }
    }
}

function login($_user = "", $_passw = "") {
    // Verificar si es login con lector de codigos o Usuario y contrase�a
    $user = isset($_REQUEST['usuario']) ? $_REQUEST['usuario'] : $_user;
    $passw = isset($_REQUEST['password']) ? $_REQUEST['password'] : $_passw;


    $user = str_replace(" ", "-", $user);
    $pos = strpos($user, "-");

    $db = new My();

    $campo = "passw";

    if ($pos === false) {
        $crypt_pass = sha1($passw);
    } else {
        $crypt_pass = substr($user, $pos + 1, 64);
        $user = substr($user, 0, $pos);
        $campo = "hash";
    }
    $db->Query("SELECT usuario, limite_sesion,suc FROM usuarios WHERE  usuario = '$user' AND $campo = '$crypt_pass' and estado = 'Activo'");
    //echo "SELECT usuario, limite_sesion,suc FROM usuarios WHERE  usuario = '$user' AND $campo = '$crypt_pass'";

    if ($db->NumRows() > 0) {
        $db->NextRecord();
        $usuario = $db->Record['usuario'];
        $limite_session = $db->Record['limite_sesion'];
        $suc = $db->Record['suc'];
        $ip = getIP();
        $GLOBALS['username'] = $usuario;
        $serial = addslashes(sha1($ip . microtime()));
        $db->Query("INSERT INTO sesiones(usuario,fecha,hora,ip,serial,limite_sesion,expira,estado)VALUES('$usuario', current_date, current_time,'$ip','$serial',$limite_session, NOW() + INTERVAL $limite_session MINUTE , 'Activa')");
        echo json_encode(array('estado' => 'Ok', 'usuario' => $usuario, 'serial' => $serial, 'expira' => $limite_session, 'suc' => $suc));
    } else {
        echo json_encode(array('estado' => 'Error', 'serial' => '*', 'expira' => 0, 'pos' => $pos, 'suc' => ''));
    }
}

//Actuliza la sesion si esa aún no caduco
function updateSession() {
    $usu = $_REQUEST['usuario'];
    $sess = $_REQUEST['session'];
    $expira = $_REQUEST['expira'];
    $db = new My();
    if ($db->Query("update sesiones s set expira = (SELECT NOW()+INTERVAL $expira MINUTE) WHERE  s.usuario = '$usu' AND s.serial = '$sess' AND s.estado = 'Activa';")) {
        echo '{"estado":"Exito"}';
    }
    $db->Close();
}

//Actualiza un sesion caducada del mismo dia
function reLogin() {
    $user = $_REQUEST['usuario'];
    $sess = $_REQUEST['session'];
    $passw = $_REQUEST['password'];
    $expira = $_REQUEST['expira'];

    $pos = strpos($user, "-");

    $db = new My();

    $campo = "passw";

    if ($pos === false) {
        $crypt_pass = sha1($passw);
    } else {
        $crypt_pass = substr($user, $pos + 1, 64);
        $user = substr($user, 0, $pos);
        $campo = "hash";
    }//SELECT usuario, limite_sesion,suc FROM usuarios WHERE  usuario = '$user' AND $campo = '$crypt_pass'
    $db->Query("SELECT COUNT(*) AS usu,usuario FROM usuarios WHERE  usuario = '$user' AND $campo = '$crypt_pass';"); // No puede con Binary por el codigo de Barras pone en Mayusculas
    if ($db->NumRows() > 0) {
        $db->NextRecord();
        if ((int) $db->Record['usu'] > 0) {
            $usuario = $db->Record['usuario'];

            $db->Query("SELECT COUNT(*) AS res FROM sesiones s WHERE s.fecha = CURRENT_DATE AND s.usuario = '$user' AND s.serial = '$sess';");
            if ($db->NumRows() > 0) {
                $db->NextRecord();
                if ((int) $db->Record['res'] > 0) {
                    $db->Query("UPDATE sesiones s SET expira = (CURRENT_TIMESTAMP + INTERVAL $expira minute), s.estado = 'Activa' WHERE s.usuario = '$user' AND s.serial = '$sess';");
                    echo json_encode(array('estado' => 'Ok', 'usuario' => $usuario));
                } else {
                    login($user, $passw);
                }
            } else {
                echo json_encode(array('estado' => 'Error', 'serial' => '*', 'expira' => 0, 'pos' => $pos, 'passw' => $crypt_pass));
            }
        } else {
            echo json_encode(array('estado' => 'error'));
        }
    }
}

function closeSession() {
    $usu = $_REQUEST['usuario'];
    $sess = $_REQUEST['session'];
    $db = new My();
    if ($db->Query("update sesiones s set estado = 'Inactiva' where s.usuario = '$usu' and s.serial = '$sess' and s.estado = 'Activa';")) {
        echo '{"estado":"Exito"}';
    }
    $db->Close();
}

function buscarClientes() {
    //echo getcwd();
    require_once("clientes/Clientes.class.php");
    $criterio = $_POST['criterio'];
    $campo = $_POST['campo'];
    $limit = $_POST['limite'];

    $c = new Clientes();
    $c->buscarCliente($criterio, $campo, $limit);
}

 

function nuevoCliente() {

    require_once("clientes/Clientes.class.php");
    $usuario = $_POST['usuario'];
    $ruc = $_POST['ruc'];
    $nombre = $_POST['nombre'];
    $tel = $_POST['tel'];
    $fecha_nac = $_POST['fecha_nac'];
    $pais = $_POST['pais'];
    $ciudad = $_POST['ciudad'];
    $dir = $_POST['dir'];
    $ocupacion = $_POST['ocupacion'];
    $situacion = $_POST['situacion'];
    $tipo = $_POST['tipo'];
    $tipo_doc = $_POST['tipo_doc'];
    $suc = $_POST['suc'];

    $c = new Clientes();
    $c->registrarCliente($usuario, $ruc, $nombre, $tel, $fecha_nac, $pais, $ciudad, $dir, $ocupacion, $situacion, $tipo, $tipo_doc, $suc);
    //echo $registro;
}

/**
 * Limite Real = Limite de Credito - (Cuotas Pendientes de Pago + Cheques Diferidos) + (Pagos pendientes de Procesamiento Efectivo o Cheque Al dia Solamente)
 * 5.000 - (1.000 + 500) + 1000 = 4.500
 */
function getLimiteCreditoCliente() {
    $CardCode = $_REQUEST['CardCode'];

    $ms = new My();

    $cuotas_y_plazo = getResultArray("SELECT limite_credito,plazo_maximo,cant_cuotas,cuotas_atrasadas FROM clientes WHERE cod_cli =   '$CardCode';");

    $CANTIDAD_CUOTAS = $cuotas_y_plazo[0]['cant_cuotas'];
    $PLAZO_MAXIMO = $cuotas_y_plazo[0]['plazo_maximo'];
    $LIMITE_CUOTAS_ATRASADAS = $cuotas_y_plazo[0]['cuotas_atrasadas'] +=0;
    $Limite = $cuotas_y_plazo[0]['limite_credito'];

    if ($CANTIDAD_CUOTAS == null) {
        $CANTIDAD_CUOTAS = 0;
    }
    if ($PLAZO_MAXIMO == null) {
        $PLAZO_MAXIMO = 0;
    }
    if ($LIMITE_CUOTAS_ATRASADAS == null) {
        $LIMITE_CUOTAS_ATRASADAS = 0;
    }
    if ($Limite == null) {
        $Limite = 0;
    }


    $Cuotas = 0;
    $ms->Query("SELECT IF(SUM(saldo) IS NULL,0,SUM(saldo)) AS Cuotas FROM factura_venta f,cuotas c WHERE  f.f_nro = c.f_nro AND f.cod_cli = '$CardCode' AND c.estado ='Pendiente'");
    if ($ms->NumRows() > 0) {
        $ms->NextRecord();
        $Cuotas = $ms->Record['Cuotas'];
    }

    // Cheques Diferidos
    $Cheques = 0;
    $ms->Query("SELECT IF(SUM(valor_ref) IS NULL,0,SUM(valor_ref)) AS VarlorCheque FROM factura_venta f,cheques_ter c WHERE  f.f_nro = c.f_nro AND f.cod_cli = '$CardCode' AND c.estado ='Pendiente'");
    if ($ms->NumRows() > 0) {
        $ms->NextRecord();
        $Cheques = $ms->Record['VarlorCheque'];
    }

    // Buscar Pagos Pendientes de Procesamiento en MySql
    //Efectivo
    $EfectivoNoProc = 0;
    $db = new My();
    $db->Query("SELECT  SUM(e.entrada_ref) AS EfectivoNoProcesado FROM pagos_recibidos p,  efectivo e  WHERE p.id_pago = e.trans_num  AND p.estado =  'Cerrado' AND p.e_sap IS NULL AND id_concepto = 7 AND p.cod_cli = '$CardCode'");
    if ($db->NumRows() > 0) {
        $db->NextRecord();
        $EfectivoNoProc = $db->Record['EfectivoNoProcesado'];
        if ($EfectivoNoProc == null) {
            $EfectivoNoProc = 0;
        }
    }
    $ChequesNoProcesados = 0;
    $db->Query("SELECT  SUM(valor) AS ChequesNoProcesados FROM pagos_recibidos p,  cheques_ter t  WHERE p.id_pago = t.trans_num  AND p.estado =  'Cerrado' AND p.e_sap IS NULL AND id_concepto = 8  AND tipo = 'Al_Dia'  AND p.cod_cli = '$CardCode'");
    if ($db->NumRows() > 0) {
        $db->NextRecord();
        $ChequesNoProcesados = $db->Record['ChequesNoProcesados'];
        if ($ChequesNoProcesados == null) {
            $ChequesNoProcesados = 0;
        }
    }
    // Cheques al dia No procesados
    // Ventas Abiertas o No enviadas a SAP
    $VentasNoProcesadas = 0;
    $db->Query("SELECT SUM(d.subtotal * cotiz) - f.desc_sedeco AS VentasNoProcesadas FROM fact_vent_det d INNER JOIN factura_venta f ON d.f_nro = f.f_nro WHERE f.cod_cli = '$CardCode' AND (f.e_sap <= 0 OR f.e_sap IS NULL)  AND f.estado <> 'Abierta'");
    if ($db->NumRows() > 0) {
        $db->NextRecord();
        $VentasNoProcesadas = $db->Record['VentasNoProcesadas'];
        if ($VentasNoProcesadas == null) {
            $VentasNoProcesadas = 0;
        }
    }


    $cuotas_atrasadas = "SELECT COUNT(*) AS cuotas_atrasadas FROM factura_venta f,cuotas c WHERE  f.f_nro = c.f_nro AND f.cod_cli = '$CardCode' AND c.estado ='Pendiente'  AND c.vencimiento < CURRENT_DATE ";
    $ms->Query($cuotas_atrasadas);

    $ms->NextRecord();
    $cuotas_atrasadas = $ms->Record['cuotas_atrasadas'];

    $ms->Close();
    $array = array("Limite" => $Limite, "Cuotas" => (float) $Cuotas, "Cheques" => (float) $Cheques, "EfectivoNoProc" => $EfectivoNoProc, "ChequesAlDiaNoProcesados" => $ChequesNoProcesados, "VentasNoProcesadas" => $VentasNoProcesadas, "CANTIDAD_CUOTAS" => (int) $CANTIDAD_CUOTAS, "PLAZO_MAXIMO" => (int) $PLAZO_MAXIMO, "CuotasAtrasadas" => (int) $cuotas_atrasadas, "LIMITE_CUOTAS_ATRASADAS" => $LIMITE_CUOTAS_ATRASADAS);

    echo json_encode($array);
}

function calcularDV() {
    $ci = $_POST['ci'];
    require_once("Functions.class.php");
    $f = new Functions();
    $dv = $f->calcularDV($ci);
    echo json_encode($dv);
}

function checkearRUC() {
    $ruc = $_POST['ruc'];
    $tipo_doc = $_POST['tipo_doc'];

    $ms = new My();
    $ms->Query("SELECT 'Ok' AS Status, nombre AS Cliente, ci_ruc AS RUC FROM clientes WHERE ci_ruc = '$ruc';");
    $arr = array();
    if ($ms->NumRows() > 0) {
        $ms->NextRecord();
        array_push($arr, $ms->Record);
    } else {
        if ($tipo_doc == 'C.I.') {
            $pos = strpos($ruc, "-");
            if ($pos !== false) {
                $tmp_ruc = substr($ruc, 0, $pos);  // abcd

                require_once("Functions.class.php");
                $f = new Functions();

                $dv = $f->calcularDV($tmp_ruc);
                $tmp_ruc = $dv['CI'] . "-" . $dv['DV'];
                if ($tmp_ruc != $ruc) {
                    $error = array("Status" => "Error", "dv" => $dv['DV']);
                    array_push($arr, $error);
                }
            }
        }
    }
    $ms->Close();
    echo json_encode($arr);
}

function siguienteNumeroDeDocumento() {
    $tipo_doc = $_POST['tipo_doc'];
    $tipo_fact = $_POST['tipo_fact'];
    $estab = $_POST['estab'];
    $moneda = $_POST['moneda'];
    $pe = $_POST['pe'];
    $db = new My();
    $sql = "SELECT  MAX(fact_nro + 1) as INICIAL FROM factura_cont WHERE establecimiento = '$estab' AND pdv_cod = '$pe' and tipo_fact = '$tipo_fact' and tipo_doc = '$tipo_doc' and moneda = '$moneda'  ";
    //echo $sql;
    $db->Query($sql);

    $db->NextRecord();
    $inicial = $db->Record['INICIAL'];
    if ($inicial == null) {
        echo "1";
    } else {
        echo $inicial;
    }
}

function generarPagoRecibido() {

    $datos = json_decode($_POST['datos']);

    $CardCode = $datos->CardCode;
    $ruc = $datos->RUC;
    $cliente = $datos->Cliente;
    $usuario = $datos->usuario;
    $suc = $datos->suc;
    $moneda = $datos->moneda;
    $cotiz = $datos->cotiz;
    $data = $datos->data;

    $pago = "INSERT  INTO pagos_recibidos(moneda,cotiz,fecha,hora,cod_cli,cliente,ruc_cli,usuario,suc,estado,e_sap)"
            . "VALUES('$moneda',$cotiz,CURRENT_DATE,CURRENT_TIME,'$CardCode','$cliente','$ruc','$usuario','$suc', 'Abierto',NULL)";

    $db = new My();
    $db->Query($pago);
    $ultimo_numero = "SELECT id_pago FROM pagos_recibidos WHERE usuario = '$usuario' and suc = '$suc' and estado = 'Abierto' ORDER BY id_pago DESC LIMIT 1";
    $db->Query($ultimo_numero);
    $db->NextRecord();
    $Nro = $db->Record['id_pago'];

    foreach ($data as $cuota) {
        $Factura = $cuota->Factura;
        $FolioNum = $cuota->FolioNum;
        $Cuota = $cuota->Cuota;
        $Total = $cuota->Total;
        $Pagado = $cuota->Pagado;
        $Monto = $cuota->Monto;
        $FechaFactura = $cuota->FechaFactura;
        $Tipo = $cuota->Tipo;
        $Interes = $cuota->Interes;
        $det = "INSERT INTO pago_rec_det (id_pago, factura, id_cuota, valor, pagado, entrega_actual, estado, e_sap,fecha_fac,folio_num,tipo,interes) VALUES ($Nro, '$Factura', '$Cuota', $Total, $Pagado, $Monto, 'Pendiente',null,'$FechaFactura','$FolioNum','$Tipo',$Interes);";
        $db->Query($det);
    }
    echo $Nro;
}

/* Borrar Efectivo
 * Borrar Tarjetas
 * Borrar Chques
 * Borrar Detalles de Pago Recibido
 * Borrar Pago Recibido
 */

function cancelarOperacionPorCobro() {
    $nro_cobro = $_POST['nro_cobro'];
    $db = new My();
    $db->Query("delete from efectivo where trans_num = $nro_cobro");
    $db->Query("delete from convenios where trans_num = $nro_cobro");
    $db->Query("delete from cheques_ter where trans_num = $nro_cobro");
    $db->Query("delete from pago_rec_det where id_pago = $nro_cobro");
    $db->Query("delete from pagos_recibidos where id_pago = $nro_cobro");
    echo "Ok";
}

function recuperarNroCobro() {
    $nro_cheque = $_POST['nro_cheque'];
    $sql = "SELECT id_concepto, nro_cheque,trans_num AS nro_cobro, cod_cli,ruc_cli,cliente, SUM(d.interes) AS intereses,SUM(t.valor) as valor FROM cheques_ter t, pagos_recibidos p,pago_rec_det d WHERE nro_cheque LIKE '$nro_cheque' AND t.trans_num = p.id_pago AND p.id_pago = d.id_pago
    GROUP BY d.id_pago"; echo $sql;
    $arr0 = getResultArray($sql);
    $tam = sizeof($arr0);
    if ($tam > 0) {
        echo json_encode($arr0);
    } else {
        $sql = "SELECT id_concepto, nro_cheque, cod_cli,ruc_cli,cliente,valor,total as TotalFactura FROM cheques_ter t, factura_venta f WHERE t.f_nro = f.f_nro AND nro_cheque = '$nro_cheque' ";
        $arr1 = getResultArray($sql);
        $tam = sizeof($arr1);
        if ($tam > 0) {
            echo json_encode($arr1);
        } else {
            echo json_encode(array());
        }
    }
}
function recuperarDatosDeCobro() {
    $nro_cobro = $_POST['nro_cobro'];
    $sql = "SELECT 8 AS id_concepto, id_pago AS nro_cobro, '' AS nro_cheque, 0 as valor, cod_cli,ruc_cli,cliente,0 AS TotalFactura  FROM pagos_recibidos where id_pago = '$nro_cobro'";
    $arr0 = getResultArray($sql);
    $tam = sizeof($arr0);
    if ($tam > 0) {
        echo json_encode($arr0);
    } else {
        echo json_encode(array()); 
    }
}

function guardarDatosConvenio() {
    $db = new My();
    $factura = $_POST['factura'];
    $orden_beneficiario = $_POST['orden_beneficiario'];
    $valor_orden = $_POST['valor_orden'];
    $nro_orden = $_POST['nro_orden'];

    if ($valor_orden == "") {
        $valor_orden = 0;
    }
    if ($nro_orden == "") {
        $nro_orden = 'NULL';
    } else {
        $nro_orden = "'$nro_orden'";
    }

    $db->Query("update factura_venta set nro_orden = $nro_orden,  orden_cli = '$orden_beneficiario', orden_valor = $valor_orden  WHERE f_nro = $factura");
    echo "Ok";
}

function getImagenCuidadoArticulo(){
    $codigo = $_POST['codigo'];
    echo json_encode(getResultArray("SELECT tipo as imagen FROM art_propiedades a, prop_x_art p WHERE a.cod_prop = p.cod_prop AND p.codigo = '$codigo' AND p.valor = 'Si'"));
}

function getDatosConvenioFactura() {
    $db = new My();
    $factura = $_POST['factura'];
    $db->Query("SELECT nro_orden,orden_cli,orden_valor FROM factura_venta WHERE f_nro = $factura");
    $db->NextRecord();
    $nro_orden = $db->Record['nro_orden'];
    $orden_cli = $db->Record['orden_cli'];
    $orden_valor = $db->Record['orden_valor'];
    $array = array("nro_orden" => $nro_orden, "orden_cli" => $orden_cli, "orden_valor" => $orden_valor);
    echo json_encode($array);
}

function agregarArticuloANotaDePedidoCompra() {
    $cod_cli = $_POST['cod_cli'];
    $cliente = $_POST['cliente'];
    $usuario = $_POST['usuario'];
    $suc = $_POST['suc'];
    $codigo = $_POST['codigo'];
    $lote = $_POST['lote'];
    $tipo = $_POST['nac_int'];
    $descrip = $_POST['descrip'];
    $precio_venta = $_POST['precio'];
    $cantidad = $_POST['cantidad'];
    $um = $_POST['um'];
    $mayorista = $_POST['mayorista'];
    $color = $_POST['color'];
    $obs = $_POST['obs'];
    $tipo = $_POST['tipo'];
    $urge = $_POST['urge'];
    $presentacion = $_POST['presentacion'];

    if ($mayorista == 'Mayorista') {
        $mayorista = 'Si';
    } else {
        $mayorista = 'No';
        $cliente = 'MINORISTA';
        $cod_cli = '0';
    }

    $db = new My();
    if ($tipo == 'Nacional') {
        $sql = "SELECT n_nro as NRO  FROM nota_pedido_compra WHERE usuario = '$usuario' AND estado = 'Abierta' AND nac_int = '$tipo' limit 1";
    } else {
        $sql = "SELECT n_nro as NRO FROM nota_pedido_compra WHERE  estado = 'Abierta' AND nac_int = '$tipo' limit 1";
    }
    $db->Query($sql);
    $nro = 0;
    if ($db->NumRows() > 0) {
        $db->NextRecord();
        $nro = $db->Record['NRO'];
        $db->Query("INSERT INTO nota_ped_comp_det( n_nro, usuario,suc, cod_cli, cliente, ponderacion, codigo, lote, um_prod, obs, cantidad, cantidad_pond, precio_venta, color, estado, mayorista,descrip,urge,presentacion)
        VALUES ($nro,'$usuario','$suc','$cod_cli', '$cliente',1,'$codigo','$lote','$um','$obs',$cantidad, $cantidad, $precio_venta, '$color', 'Pendiente', '$mayorista','$descrip','$urge','$presentacion');");
        echo $nro;
    } else {  // Si no Hay Genero una
        echo "Error";
    }
}

function getDetalleNotaPedido() {
    $nro = $_POST['nro'];
    $usuario = $_POST['usuario'];
    $sql = "SELECT  id_det, usuario, cod_cli, cliente, codigo,descrip, cantidad,um_prod, color,suc, mayorista,obs  FROM 
    nota_ped_comp_det WHERE n_nro = $nro and usuario = '$usuario'";
    echo json_encode(getResultArray($sql));
}

function getDetalleNotasPedidoNacionalCompras() {
    $suc = $_POST['suc'];
    $desde = $_POST['desde'];
    $hasta = $_POST['hasta'];
    $estado = $_POST['estado'];
    $usuario = $_POST['usuario'];
    $urge = isset($_POST['urge']) ? $_POST['urge'] : '%';
    $sql = "SELECT d.id_det AS id,p.obs as pobs,d.cliente ,p.n_nro,DATE_FORMAT( p.fecha_cierre ,'%d-%m-%Y') AS fecha,d.usuario,p.suc,codigo,lote,descrip,color,cantidad,um_prod,precio_venta,d.obs,mayorista,d.estado,urge,md5(concat(codigo,descrip,color)) as hash,if(d.c_prov is null,'',d.c_prov) as proveedor
    FROM nota_pedido_compra p INNER JOIN nota_ped_comp_det d ON (d.n_nro = p.n_nro or p.n_nro = d.c_ref_unif) 
    and d.estado like '$estado' and d.urge like '$urge' and d.usuario like '$usuario'
    WHERE p.estado != 'Abierta' AND fecha_cierre BETWEEN '$desde' AND '$hasta'
    AND nac_int = 'Nacional' AND p.suc like '$suc' ORDER BY codigo ASC,color ASC";

    //echo $sql;
    echo json_encode(getResultArray($sql));
}

function getArticulosNotaPedidoInternacionalCompras() {
    $nro = $_POST['nro'];
    //$sql = "SELECT distinct codigo,descrip FROM nota_ped_comp_det d, nota_pedido_compra p WHERE d.n_nro = p.n_nro AND p.n_nro = $nro ORDER BY codigo ASC,color ASC";
    $sql = "SELECT d.codigo,d.descrip,SUM(d.cantidad_pond) AS cant_pond,(SELECT SUM(r.cantidad)   FROM nota_ped_resumen r WHERE r.codigo = d.codigo AND r.n_nro = d.n_nro) AS pedido FROM nota_ped_comp_det d INNER JOIN nota_pedido_compra p ON   d.n_nro = p.n_nro AND p.n_nro = $nro GROUP BY d.codigo    ORDER BY d.codigo ASC,d.color ASC";
    echo json_encode(getResultArray($sql));
}

function getDetalleNotaPedidoInternacionalCompras() {
    $nro = $_POST['nro'];
    $codigo = $_POST['codigo'];
    $sql = "SELECT d.id_det AS id,d.n_nro,DATE_FORMAT( p.fecha ,'%d-%m-%Y') AS fecha,d.usuario,p.suc,codigo,lote,descrip,color,cantidad,um_prod,precio_venta,d.obs,mayorista,d.estado,urge,
    cliente,cod_cli,ponderacion,cantidad_pond,c_precio_compra as precio_estimado ,md5(concat(codigo,descrip,color)) as hash
    FROM nota_ped_comp_det d, nota_pedido_compra p WHERE d.n_nro = p.n_nro AND p.n_nro = $nro and codigo = '$codigo' ORDER BY codigo ASC,color ASC";
    echo json_encode(getResultArray($sql));
}

function cambiarEstadoNotaPedidoInternacional() {
    $nro = $_POST['nro'];
    $usuario = $_POST['usuario'];
    $estacion = $_POST['estacion'];
    $sql = "UPDATE nota_pedido_compra SET fecha_cierre = CURRENT_DATE, hora_cierre = CURRENT_TIME,usuario = '$usuario',obs = '$usuario de Pendiente a En Proceso ', estado = 'En Proceso',temporada = '$estacion' WHERE n_nro = $nro;";
    $db = new My();
    $db->Query($sql);
    echo "Ok";
}

function cerrarNotaPedidoCompra() {
    $nro = $_POST['nro'];
    $obs = $_POST['obs'];
    $usuario = $_POST['usuario'];
    $date = date("m-d-y H:i");
    $db = new My();
    $sql = "UPDATE nota_pedido_compra SET obs = concat(obs,'| $date  ($usuario) Cerro la Nota de Pedido Obs: $obs'), estado = 'Cerrada' WHERE n_nro = $nro;";
    $db->Query($sql);

    makeLog("$usuario", "Cerrar Nota Pedido", "Nro: $nro Obs: $obs", 'Update', $nro);
    echo "Ok";
}

function mostrarProveedoresCompra() {
    $nro = $_POST['nro'];
    $tipo_prov = $_POST['tipo_prov'];
    $sql = "select cod_prov,prioridad from compras where n_nro = $nro and cod_prov like '$tipo_prov%' order by cod_prov desc";
    echo json_encode(getResultArray($sql));
}

function getArticulosAComprar() {
    $nro = $_POST['nro'];
    $filtro = $_POST['filtro'];
    $sql = "SELECT DISTINCT  codigo,descrip  FROM nota_ped_resumen WHERE n_nro = $nro AND descrip LIKE '%$filtro%' ORDER BY descrip ASC ";
    echo json_encode(getResultArray($sql));
}

function getAtributosDeArticulo() {
    $arr = json_decode($_POST['codigos']);
    $codigos = "";
    foreach ($arr as $v) {
        $codigos .="'$v',";
    }
    $codigos = substr($codigos, 0, -1);
    $sql = "SELECT codigo, ligamento,estetica, tipo,acabado,combinacion,composicion,ancho,gramaje_prom, um FROM articulos WHERE codigo IN  ($codigos)";
    echo json_encode(getResultArray($sql));
}

function getColoresDeArticulosAComprar() {
    $nro = $_POST['nro'];
    $codigo = $_POST['codigo'];
    $sql = "SELECT id_res,codigo,color,cantidad,precio_est FROM nota_ped_resumen WHERE n_nro = $nro AND codigo = '$codigo' ORDER BY descrip ASC";
    echo json_encode(getResultArray($sql));
}

function getArticulosCompradosXCorp() {
    $nro = $_POST['nro'];
    $corp = $_POST['corp'];
    $sql = "SELECT distinct codigo,descrip  FROM compra_det WHERE n_nro = $nro AND cod_prov = '$corp' ORDER BY descrip ASC";
    echo json_encode(getResultArray($sql));
}

function getColoresCompradosXCorp() {
    $nro = $_POST['nro'];
    $codigo = $_POST['codigo'];
    $corp = $_POST['corp'];
    $sql = "SELECT id_det,codigo,descrip,cod_catalogo,fab_color_cod,color,color_comb,cantidad,precio,um,design,composicion,ancho,gramaje,unique_id FROM compra_det WHERE n_nro = $nro AND cod_prov = '$corp' AND codigo = '$codigo' ORDER BY color ASC";
    echo json_encode(getResultArray($sql));
}

function eliminarRegistroCompra() {
    $nro = $_POST['nro'];
    $id_det = $_POST['id_det'];
    $db = new My();
    $db->Query("DELETE FROM compra_det WHERE n_nro = $nro AND id_det = $id_det;");
    echo "Ok";
}

function getCantidadComprada() {
    $nro = $_POST['nro'];
    $id_res = $_POST['id_res'];
    $codigo = $_POST['codigo'];
    $color = $_POST['color'];
    $sql = "SELECT SUM(IF(id_res = $id_res,cantidad,0)) AS comprado_x_id,SUM(IF(color = '$color',cantidad,0)) AS comprado_x_color FROM compra_det where n_nro = $nro and codigo = '$codigo'";
    echo json_encode(getResultArray($sql));
}

function cambiarMonedaCorp() {
    $nro = $_POST['nro'];
    $moneda = $_POST['moneda'];
    $corp = $_POST['corp'];

    $db = new My();
    $db->Query("select venta from cotizaciones where m_cod = '$moneda' order by id_cotiz desc limit 1");
    $cotiz = 1;
    if ($db->NumRows() > 0) {
        $db->NextRecord();
        $cotiz = $db->Record['venta'];
    } else {
        $cotiz = 1;
    }

    $sql = "UPDATE compras SET moneda = '$moneda', cotiz = $cotiz WHERE n_nro = $nro AND cod_prov = '$corp'";
    $db->Query($sql);
    echo "Ok";
}

function nuevoProveedorDeCompra() {
    $nro = $_POST['nro'];
    $usuario = $_POST['usuario'];
    $type = $_POST['tipo_prov'];
    $to_usuario = "";

    if ($type == "CORP") {
        $to_usuario = "Zhu";
    } else if ($type == "FANYI") {
        $to_usuario = "FanYi";
    } else { // SR Global    
        $to_usuario = "Ravi";
    }

    $sql = 'SELECT CONCAT("' . $type . '",LEFT(temporada,1),DATE_FORMAT(CURRENT_DATE,"%y")) AS corp FROM nota_pedido_compra WHERE n_nro = ' . $nro . '';
    $db = new My();
    $db->Query($sql);
    $db->NextRecord();
    $corp = $db->Record['corp'];

    $sql2 = "select RIGHT( CONCAT('00', RIGHT(cod_prov,3) + 1),3)  as ultimo_corp from compras where n_nro = $nro and cod_prov like '$type%' order by cod_prov DESC LIMIT 1";
    $db->Query($sql2);
    if ($db->NumRows() > 0) {
        $db->NextRecord();
        $ultimo_corp = $db->Record['ultimo_corp'];
        $corp.=$ultimo_corp;
    } else {
        $corp.="001";
    }

    // Cotiz


    $db->Query("select venta from cotizaciones where m_cod = 'Y$' order by id_cotiz desc limit 1");
    $cotiz = 1;
    if ($db->NumRows() > 0) {
        $db->NextRecord();
        $cotiz = $db->Record['venta'];
    } else {
        $cotiz = 1;
    }

    $ins = "INSERT INTO compras(n_nro,cod_prov,fecha,moneda,usuario,to_usuario,prioridad,estado,cotiz)VALUES($nro,'$corp',CURRENT_DATE,'Y$','$usuario','$to_usuario',1,'Pendiente',$cotiz);";
    $db->Query($ins);
    echo $corp;
}

function cambiarPrioridadProveedor() {
    $nro = $_POST['nro'];
    $corp = $_POST['corp'];
    $prioridad = $_POST['prioridad'];
    $db = new My();
    $u = "UPDATE  compras SET prioridad = $prioridad WHERE n_nro =  $nro and cod_prov = '$corp';";
    $db->Query($u);
    echo "Ok";
}

function updateShipmentTable() {
    $nro = $_POST['nro'];
    $corp = $_POST['corp'];
    $delivery_date = $_POST['delivery_date'];
    if ($delivery_date == "") {
        $delivery_date = "00-00-0000";
    }
    $myDateTime = DateTime::createFromFormat('d-m-Y', $delivery_date);
    $newDateString = $myDateTime->format('Y-m-d');


    $volume = $_POST['volume'];
    if ($volume == 'NaN') {
        $volume = 0;
    }
    $db = new My();
    $u = "UPDATE  compras SET fecha_entrega = '$newDateString',volumen = $volume WHERE n_nro =  $nro and cod_prov = '$corp';";
    $db->Query($u);
    echo "Ok";
}

function getDetalleCompraForShipmentTable() {
    $nro = $_POST['nro'];
    $prov = $_POST['prov'];
    $pending = $_POST['pending'];
    $partial = $_POST['partial'];
    $na = $_POST['na'];
    $complete = $_POST['complete'];
    if ($pending == 'true') {
        $pending = "estado like 'Pending'";
    } else {
        $pending = "estado <> 'Pending'";
    }
    if ($partial == 'true') {
        $partial = "or estado like 'Partial'";
    } else {
        $partial = "";
    }
    if ($na == 'true') {
        $na = "or estado like 'N/A'";
    } else {
        $na = "";
    }
    if ($complete == 'true') {
        $complete = "or estado like 'Complete'";
    } else {
        $complete = "";
    }

    // Actualizar Quty Shipped
    $db = new My();
    $db->Query("UPDATE compra_det d, packing_list p SET d.cant_enviada =  (SELECT SUM(p.cantidad) FROM packing_list p WHERE p.id_det = d.id_det)  WHERE  p.id_det = d.id_det AND d.n_nro = $nro AND d.cod_prov = '$prov'");
    // Actualizar Estados
    $db->Query("UPDATE compra_det d SET d.estado = IF(cant_enviada >= cantidad, 'Complete', IF(cant_enviada BETWEEN  1 AND cantidad-1,'Partial', 'Pending')) WHERE   d.estado != 'N/A' AND d.n_nro = $nro AND d.cod_prov = '$prov'");

    $sql = "SELECT id_det,codigo,CONCAT(cod_catalogo,'-',fab_color_cod) AS ColorCod,descrip,color,precio,cantidad,um,subtotal,cant_enviada,estado FROM  compra_det "
            . "WHERE n_nro = $nro AND cod_prov = '$prov'  AND ($pending  $partial  $na  $complete) order by descrip asc,color asc,ColorCod asc";


    echo json_encode(getResultArray($sql));
}

function changePackingListDescription() {
    $id_pack = $_POST['id_pack'];
    $descrip = $_POST['descrip'];
    $usuario = $_POST['usuario'];
    $db = new My();
    $db->Query("UPDATE packing_list SET obs = CONCAT(obs,'-','($usuario)Description edited:  ',descrip, ' to:', '$descrip'), descrip = '$descrip',edited = '1' WHERE id_pack = $id_pack;");
    echo "Description changed...";
}

function getOpenInvoices() {
    $nro = $_POST['nro_pedido'];
    $currency = $_POST['currency'];
    $usuario = $_POST['usuario'];
    $sql = "SELECT invoice FROM invoice WHERE usuario = '$usuario' AND n_nro = $nro AND moneda = '$currency';";
    echo json_encode(getResultArray($sql));
}

function addProductsToInoice() {
    $invoice = $_POST['invoice'];
    $provider = $_POST['provider'];
    $ids = json_decode($_POST['ids']);
    $db = new My();
    $db2 = new My();
    $lista_is = "";
    foreach ($ids as $id) {

        $db->Query("SELECT n_nro, cod_prov, codigo, descrip, um, cod_catalogo, fab_color_cod, precio,(cantidad - cant_enviada) as restante, subtotal, color, color_comb, design, composicion, ancho, gramaje, cant_enviada, estado FROM  compra_det WHERE id_det = $id");
        $db->NextRecord();
        $n_nro = $db->Record['n_nro'];
        $cod_prov = $db->Record['cod_prov'];
        $codigo = $db->Record['codigo'];
        $descrip = $db->Record['descrip'];
        $um = $db->Record['um'];
        $cod_catalogo = $db->Record['cod_catalogo'];
        $fab_color_cod = $db->Record['fab_color_cod'];
        $precio = $db->Record['precio'];
        $cantidad = $db->Record['restante'];
        $subtotal = $db->Record['subtotal'];
        $color = $db->Record['color'];
        $color_comb = $db->Record['color_comb'];
        $design = $db->Record['design'];
        $composicion = $db->Record['composicion'];
        $ancho = $db->Record['ancho'];
        $gramaje = $db->Record['gramaje'];

        $sql = "INSERT into packing_list(invoice, n_nro, cod_prov,id_det, bale, piece, codigo, lote, descrip, um, cod_catalogo, fab_color_cod, precio, cantidad, subtotal, color, color_comb, design, composicion, ancho, gramaje,obs)
        VALUES ('$invoice', $n_nro, '$cod_prov',$id,NULL , NULL, '$codigo','', '$descrip', '$um', '$cod_catalogo', '$fab_color_cod', $precio, $cantidad ,$subtotal , '$color', '$color_comb', '$design', '$composicion', $ancho, $gramaje,'');";
        $db2->Query($sql);
        $lista_is.="$id,";
    }
    $lista_is = substr($lista_is, 0, -1);

    $consulta = "SELECT id_pack,id_det,n_nro, cod_prov, bale, piece, codigo, descrip, um, CONCAT(cod_catalogo,'-',fab_color_cod) AS color_cod_fab, precio, cantidad, subtotal, color 
        FROM packing_list WHERE id_det IN($lista_is) order by bale asc,piece asc, cod_prov asc,descrip asc,color asc";
    echo json_encode(getResultArray($consulta));
}

function dividePackingListPiece() {
    $packing_id = $_POST['packing_id'];
    $quantities = json_decode($_POST['quantities']);
    $bales = json_decode($_POST['bales']);
    $tipo_insersion = $_POST['tipo_insersion'];


    $db = new My();
    $db2 = new My();



    $db->Query("SELECT id_pack FROM packing_list ORDER BY id_pack DESC LIMIT 1");
    $db->NextRecord();
    $last_id = $db->Record['id_pack'];


    $db->Query("SELECT piece,invoice,cod_prov,n_nro,id_det,bale as bale_anterior, codigo, descrip, um, cod_catalogo, fab_color_cod, precio, cantidad, subtotal, color, color_comb, design, composicion, ancho, gramaje FROM packing_list where id_pack =  $packing_id;");
    $db->NextRecord();
    //$piece = $db->Record['piece']; 
    $invoice = $db->Record['invoice'];
    $bale_anterior = $db->Record['bale_anterior'];
    $cod_prov = $db->Record['cod_prov'];
    $n_nro = $db->Record['n_nro'];
    $id_det = $db->Record['id_det'];
    $codigo = $db->Record['codigo'];
    $descrip = $db->Record['descrip'];
    $um = $db->Record['um'];
    $cod_catalogo = $db->Record['cod_catalogo'];
    $fab_color_cod = $db->Record['fab_color_cod'];
    $precio = $db->Record['precio'];
    $color = $db->Record['color'];
    $color_comb = $db->Record['color_comb'];
    $design = $db->Record['design'];
    $composicion = $db->Record['composicion'];
    $ancho = $db->Record['ancho'];
    $gramaje = $db->Record['gramaje'];


    $i = 0;
    $bale_ant = 0;
    foreach ($quantities as $Qty) {
        //Actualizar con el Primero
        $bale = $bales[$i];
        if ($bale_ant != $bale && $bale != 0) {
            updateBalesPieceNumber($db, $db2, $bale_ant, $n_nro, $invoice, $cod_prov);
        }

        if ($Qty < 0) {
            $Qty = 0;
        }

        if ($i == 0) {
            $db2->Query("UPDATE packing_list SET bale = $bale,piece = 1, cantidad = $Qty, subtotal = precio * cantidad WHERE id_pack = $packing_id;");
        } else {
            $subtotal = $precio * $Qty;
            $sql = "INSERT into packing_list(invoice, n_nro, cod_prov,id_det, bale, piece, codigo, lote, descrip, um, cod_catalogo, fab_color_cod, precio, cantidad, subtotal, color, color_comb, design, composicion, ancho, gramaje,obs)
            VALUES ('$invoice', $n_nro, '$cod_prov',$id_det,$bale , 1, '$codigo','', '$descrip', '$um', '$cod_catalogo', '$fab_color_cod', $precio, $Qty ,$subtotal , '$color', '$color_comb', '$design', '$composicion', $ancho, $gramaje,'');";
            $db2->Query($sql);
        }
        $bale_ant = $bale;
        $i++;
    }
    updateBalesPieceNumber($db, $db2, $bale, $n_nro, $invoice, $cod_prov);


    if ($tipo_insersion == "update") { // Resetear los numeros anteriores
        updateBalesPieceNumber($db, $db2, $bale_anterior, $n_nro, $invoice, $cod_prov);
    }

    $consulta = "SELECT id_pack,id_det,n_nro, cod_prov, bale, piece, codigo, descrip, um, CONCAT(cod_catalogo,'-',fab_color_cod) AS color_cod_fab, precio, cantidad, subtotal, color 
        FROM packing_list WHERE id_pack > $last_id and invoice = '$invoice' and cod_prov = '$cod_prov' order by bale asc,piece asc, cod_prov asc,descrip asc,color asc";
    echo json_encode(getResultArray($consulta));
}

function updateBalesPieceNumber($db, $db2, $bale, $n_nro, $invoice, $cod_prov) {
    $c = 0;
    $db->Query("SELECT id_pack  FROM  packing_list WHERE bale = $bale AND n_nro = $n_nro AND invoice = '$invoice' AND cod_prov = '$cod_prov'  ORDER BY cod_prov asc, descrip  asc,color  asc,CONCAT(cod_catalogo,'-',fab_color_cod)  asc");
    while ($db->NextRecord()) {
        $c++;
        $id_pack = $db->Record['id_pack'];
        $db2->Query("UPDATE packing_list set piece = $c WHERE id_pack = $id_pack");
    }
}

function deletePackingRow() {
    $id_pack = $_POST['id_pack'];
    $db = new My();
    $db2 = new My();

    $db->Query("SELECT n_nro,invoice,cod_prov,n_nro,id_det,bale  FROM packing_list where id_pack =  $id_pack;");
    $db->NextRecord();
    $n_nro = $db->Record['n_nro'];
    $invoice = $db->Record['invoice'];
    $bale = $db->Record['bale'];
    $cod_prov = $db->Record['cod_prov'];

    $db2->Query("DELETE FROM packing_list where id_pack =  $id_pack;");

    updateBalesPieceNumber($db, $db2, $bale, $n_nro, $invoice, $cod_prov);
    echo "Ok";
}

function dropInvoice() {
    $db = new My();
    $invoice = $_POST['invoice'];
    $db->Query("SELECT COUNT(*) AS cant FROM packing_list WHERE invoice = '$invoice'");
    $db->NextRecord();
    $cant = $db->Record['cant'];
    if ($cant > 0) {
        echo "Error";
    } else {
        $db->Query("DELETE FROM inv_gastos WHERE invoice = '$invoice'");
        $db->Query("DELETE FROM invoice WHERE invoice = '$invoice'");
        echo "Ok";
    }
}

function closeInvoice() {
    $db = new My();
    $invoice = $_POST['invoice'];
    $db->Query("SELECT COUNT(*) AS cant FROM packing_list WHERE invoice = '$invoice'");
    $db->NextRecord();
    $cant = $db->Record['cant'];
    if ($cant < 1) {
        echo "Error";
    } else {
        $db->Query("UPDATE invoice SET estado = 'Cerrado' WHERE invoice = '$invoice'");
        echo "Ok";
    }
}

/**
 * Controla si esta factura ya ha sido cargada con antelacion
 */
function controlarEntradaMercaderias() {
    $db = new My();
    $invoice = $_POST['invoice'];
    $cod_prov = $_POST['cod_prov'];
    $db->Query("SELECT COUNT(*) AS cant FROM entrada_merc e WHERE invoice = '$invoice' and tipo_doc_sap != 'OIGN'");
    if ($db->NumRows() > 0) {
        $db->NextRecord();
        $cant = $db->Record['cant'];
        if ($cant < 1) {
             
            $my = new MY();
            $sql = " SELECT COUNT(*) AS prov FROM proveedores WHERE cod_prov = '$cod_prov'; ";
            $my->Query($sql);
            if ($my->NumRows() > 0) {
                echo "Ok";
            } else {
                echo "Error: Codigo '$cod_prov' de proveedor no existe.";
            }
        } else {
            echo "Error: Ya existe una entrada con esta Factura/Invoice: '$invoice'";
        }
    } else {
        echo "Ok";
    }
}

function crearPedidoDeCompra() {
    $usuario = $_POST['usuario'];
    $suc = $_POST['suc'];

    $db = new My();

    $db->Query("INSERT INTO nota_pedido_compra( usuario, temporada, fecha, hora, suc, fecha_cierre, hora_cierre, obs, nac_int, estado, e_sap)
        VALUES ('$usuario', '*', CURRENT_DATE, CURRENT_TIME, '$suc', CURRENT_DATE, CURRENT_TIME,'Creada x Sobrante de Mercaderias', 'Nacional', 'Cerrada', 0);");

    $db->Query("SELECT n_nro FROM nota_pedido_compra ORDER BY n_nro DESC LIMIT 1");
    $db->NextRecord();
    $nro_pedido = $db->Record['n_nro'];

    echo $nro_pedido;
}

function crearEntradaMercaderias() {
    $db = new My();
    $usuario = $_POST['usuario'];
    $invoice = strtoupper($_POST['invoice']);
    $pedidos = json_decode($_POST['pedidos']);
    $cod_prov = $_POST['cod_prov'];
    $suc = $_POST['suc'];
    $nombre_proveedor = $_POST['nombre'];
    $fecha_fact = $_POST['fecha'];
    $moneda = $_POST['moneda'];
    $cotiz = $_POST['cotiz'];
    $tipo = $_POST['tipo'];
    $pais_origen = $_POST['pais_origen'];
    $origen = 'Nacional';
    $timbrado = $_POST['timbrado'];
    if ($pais_origen != "PY") {
        $origen = 'Internacional';
    }
    if ($tipo != "OPCH") {
        $timbrado = '';
    }
    $primer_pedido = $pedidos[0];

    $sql = "insert into  entrada_merc(suc, usuario, invoice,tipo_doc_sap,n_nro,  folio_num, cod_prov, proveedor, fecha, fecha_fact, moneda, cotiz, total, origen, pais_origen, coment, estado,timbrado)
                         values ('$suc','$usuario','$invoice','$tipo',$primer_pedido,'$invoice','$cod_prov','$nombre_proveedor',current_date,'$fecha_fact','$moneda','$cotiz',0,'$origen','$pais_origen','','Abierta','$timbrado');";
    $db->Query($sql);
    $db->Query("select id_ent from entrada_merc order by id_ent desc limit 1");
    if ($db->NumRows() > 0) {
        $db->NextRecord();
        $nro = $db->Record['id_ent'];

        foreach ($pedidos as $nro_pedido) {
            try {
                // Borrar los pedidos de esta entrada con los mismos numeros de pedido
                $db->Query("delete from pedidos_x_entrada where  id_ent = $nro and  n_nro = $nro_pedido;");
                $db->Query("insert into pedidos_x_entrada (id_ent, n_nro) values ($nro, $nro_pedido);");
            } catch (Exception $e) {
                //No pasa nada si esta duplicado
            }
        }
        // Por cada Pedido insertar en pedidos_x_entrada id_ent,n_nro

        echo $nro;
    } else {
        echo "Error";
    }
}

function getDetalleEntradaMercaderias() {
    $id_ent = $_POST['id_ent'];
    $sql = "SELECT  id_ent, id_det, nro_pedido, id_pack,store_no, bale, piece, codigo, lote, descrip, um, cod_catalogo, fab_color_cod, precio, cantidad, subtotal, color, color_comb, design, ancho, gramaje,notas as obs,um_prod,cant_calc,nro_lote_fab,img FROM entrada_det WHERE id_ent = $id_ent ORDER BY store_no asc,bale asc,codigo asc,color asc;";
    echo json_encode(getResultArray($sql));
}

function getArticulosEntradaMercaderias() {
    $id_ent = $_POST['id_ent'];
    $sql = "SELECT distinct nro_pedido, codigo, descrip FROM entrada_det WHERE id_ent = $id_ent ORDER BY  codigo asc,descrip asc;";
    echo json_encode(getResultArray($sql));
}

function getPedidosDeCompraXCodigo() {
    $codigo = $_POST['codigo'];
    //echo $_POST['nros_de_pedido'];
    $nros_pedidos = json_decode($_POST['nros_de_pedido']);
    $nro_compra = $_POST['nro_compra'];
    $nros_in = "";
    foreach ($nros_pedidos as $nro) {
        $nros_in.=$nro . ",";
    }
    $nros_in.=-1;
    $sql = "select id_det,codigo,n_nro as nro_pedido,cod_cli,cliente,suc,color as Color,SUM(cantidad_pond) AS CantPedPond,Presentacion, '' as Politica from nota_ped_comp_det where n_nro in ($nros_in) and codigo = '$codigo' group by cod_cli,color,Presentacion,suc order by cod_cli asc,color asc;";
    //echo $sql;
    $array = getResultArray($sql);
    for ($i = 0; $i < sizeof($array); $i++) {
        $sub = $array[$i];
        $codigo = $sub['codigo'];
        $suc = $sub['suc'];
        $politica = getPoliticaCortes($codigo, $suc);
        $sub['Politica'] = $politica;
        $array[$i] = $sub;
    }

    $qlast = "SELECT n_nro FROM nota_pedido_compra n  WHERE   n.estado ='Cerrada' AND nac_int = 'Internacional'  LIMIT 1";
    $db = new My();
    $db->Query($qlast);
    
    if ($db->NumRows() == 0) {
        $db->Query("INSERT INTO  nota_pedido_compra (  usuario, temporada, fecha, hora, suc, fecha_cierre, hora_cierre, obs, nac_int, estado, e_sap)VALUES (  'Sistema', '*', CURRENT_DATE, CURRENT_TIME, '00', CURRENT_DATE,CURRENT_TIME, 'Creada automaticamente por el sistema', 'Internacional', 'Cerrada', 0);");
        $db->Query($qlast);
    }
    
    
    if ($db->NumRows() > 0) {
        $db->NextRecord();
        $n_nro = $db->Record['n_nro'];
        $sql_int = "SELECT id_det,codigo,d.n_nro AS nro_pedido,cod_cli,cliente,d.suc,color AS Color,SUM(cantidad_pond) AS CantPedPond,Presentacion, '' AS Politica   
        FROM nota_pedido_compra n, nota_ped_comp_det d WHERE n.n_nro = d.n_nro AND n.estado ='Cerrada' AND nac_int = 'Internacional'  AND codigo = '$codigo' 
        AND n.n_nro = $n_nro  GROUP BY cod_cli,color,Presentacion,d.suc ORDER BY cod_cli ASC,color ASC;";
        $array_int = getResultArray($sql_int);

        for ($i = 0; $i < sizeof($array_int); $i++) {
            $sub = $array_int[$i];
            $codigo = $sub['codigo'];
            $suc = $sub['suc'];
            $politica = getPoliticaCortes($codigo, $suc);
            $sub['Politica'] = $politica;
            $array_int[$i] = $sub;
        }
    }
    $resultado = array_merge($array, $array_int);
    echo json_encode($resultado);
}

function getPoliticaCortes($codigo, $suc) {

    $sql = "SELECT politica FROM politica_cortes WHERE codigo = '$codigo' AND suc = '$suc'";

    $ms = new My();
    $ms->Query($sql);
    if ($ms->NumRows() > 0) {
        $ms->NextRecord();
        $politica = $ms->Record['politica'];
        return $politica;
    } else {
        return 0;
    }
}
// Usar getPoliticaCortesXCodigo
function buscarPoliticaCodigoXSuc() {
    $codigo = $_POST['codigo'];
    $suc = $_POST['suc'];
    $politica = getPoliticaCortes($codigo, $suc);
    echo $politica;
}

function getPoliticaCortesXCodigo(){
   $codigo = $_POST['codigo'];
   $sql = "SELECT suc,politica FROM politica_cortes WHERE codigo = '$codigo'";
   echo json_encode(getResultArray($sql));
}

function getPoliticaDistribucion() {
    $lote = $_POST['lote'];
    echo json_encode(getResultArray("SELECT id_orden,cod_cli,codigo,lote,color,cantidad,presentacion,suc,obs  FROM orden_procesamiento WHERE lote = '$lote'"));
}

function addPedidoMinoristaProduccion() {
    $codigo = $_POST['codigo'];
    $nros_pedido = json_decode($_POST['nros_pedido']);
    $usuario = $_POST['usuario'];
    $suc = $_POST['suc'];
    $db = new My();
    $nros_in = "";
    foreach ($nros_pedido as $nro) {
        $nros_in.=$nro . ",";
    }
    $nros_in.=-1;

    $db->Query("select count(*) as cant from nota_ped_comp_det where codigo = '$codigo' and suc = '$suc' and cod_cli = '0' and n_nro in($nros_in);");
    $db->NextRecord();
    $cant = $db->Record['cant'];
    if ($cant < 1) {
         
        $my = new My();
        $my->Query(" SELECT descrip , um FROM articulos WHERE codigo = '$codigo'");
        $my->NextRecord();
        $um_prod = $my->Record['um'];
        $descrip = $my->Record['descrip'];

        foreach ($nros_pedido as $nro_pedido) {
            try {
                $check = "SELECT COUNT(*) AS cant FROM nota_ped_comp_det WHERE n_nro = $nro_pedido AND codigo = '$codigo'";
                $db->Query($check);
                $db->NextRecord();
                $cant = $db->Record['cant'];
                if ($cant < 1) {
                    $ins = "INSERT INTO nota_ped_comp_det( n_nro, usuario, suc, cod_cli, cliente, ponderacion, codigo, lote, um_prod, obs, cantidad, cantidad_pond, precio_venta, color, estado, mayorista, descrip, urge, presentacion, c_prov_cod, c_prov, c_precio_compra, c_fecha_compra, c_fecha_prev, c_lote, c_obs)
                    VALUES ( $nro_pedido, '$usuario', '00', '0', 'MINORISTA',1, '$codigo', '', '$um_prod', 'Agregado en Asignacion por Falta de Pedido', 0, 0,0,'*', 'Pendiente', 'No', '$descrip', 'No', 'Pieza', NULL, NULL, NULL, NULL, NULL, NULL, NULL);";
                    $db->Query($ins);
                    break;
                }
            } catch (Exception $e) {
                // Intentar nuevamente.
            }
        }
        echo "Ok";
    } else {
        echo "Error";
    }
}

function getLotesEntradaMercaderias() {
    $codigo = $_POST['codigo'];
    $BaseEntry = $_POST['sap_doc'];
    $id_entrada = $_POST['nro_compra'];
    $asignaciones = "select distinct lote from orden_procesamiento where id_ent = $id_entrada and codigo = '$codigo'";
    $db = new My();
    $db->Query($asignaciones);
    $lotes = "";
    while ($db->NextRecord()) {
        $lote = $db->Record['lote'];
        $lotes.="'$lote',";
    }
    $lotes = substr($lotes, 0, -1);

    $filtro_lotes = "";
    if ($lotes != "") {
        //$filtro_lotes = " and BatchNum not in ($lotes) ";  // Viejo
        $filtro_lotes = " and lote not in ($lotes) ";
    }

    //$sql = "select distinct BatchNum as Lote,WhsCode as Suc,Quantity as Stock,concat(Name,' | ',U_color_cod_fabric,' | ',U_design) as Color  from OITM o, OIBT i,[@EXX_COLOR_COMERCIAL] c where o.ItemCode = i.ItemCode and i.WhsCode = '00' and i.U_color_comercial = c.Code and i.ItemCode = '$codigo'   and BaseEntry = $BaseEntry  AND ( i.BaseType = 20 or i.BaseType = 18)  $filtro_lotes order by Color asc, Quantity ASC;";

    $sql = "SELECT codigo,lote AS Lote,suc AS Suc, cant_calc AS Stock,CONCAT(color,' | ',cod_catalogo,'-',fab_color_cod,' | ',design) AS Color 
    FROM entrada_merc m, entrada_det d  WHERE m.id_ent = d.id_ent AND d.id_ent = $id_entrada  AND codigo = '$codigo'  $filtro_lotes ORDER BY Color ASC, Stock ASC;";

    echo json_encode(getResultArray($sql));
}

function getLotesAsignadosACliente() {
    $cod_cli = $_POST['cod_cli'];
    $codigo = $_POST['codigo'];
    $id_entrada = $_POST['nro_compra'];
    $sql = "select id_orden,codigo,lote, cod_cli,suc,presentacion,cantidad,color from  orden_procesamiento where id_ent = $id_entrada and cod_cli = '$cod_cli' and codigo = '$codigo' order by codigo asc,lote asc,color asc";
    echo json_encode(getResultArray($sql));
}

function borrarLotesAsignados() {
    $ref = $_POST['ref'];
    $codigo = $_POST['codigo'];
    $lote = $_POST['lote'];
    $suc = $_POST['suc'];
    $db = new My();                                                 //and suc = '$suc'
    $db->Query("delete from orden_procesamiento where id_ent = $ref  and codigo = '$codigo' and lote = '$lote'");
    $db->Close();
    echo "Ok";
}

function cambiarSucursalAsignacion() {
    $id_orden = $_POST['id_orden'];
    $suc = $_POST['suc'];
    $db = new My();
    $db->Query("UPDATE orden_procesamiento SET suc = '$suc' WHERE id_orden = $id_orden;");
    echo "Ok";
}

function getSumaAsignadaAClienteXColor() {
    $cod_cli = $_POST['cod_cli'];
    $codigo = $_POST['codigo'];
    $id_entrada = $_POST['nro_compra'];
    $suc = $_POST['suc'];
    $color = $_POST['color'];
    if ($color == "*") {
        $color = "%";
    }
    $presentacion = $_POST['presentacion'];
    $sql = "select sum(cantidad) as Asign from orden_procesamiento where id_ent = $id_entrada and cod_cli = '$cod_cli' and codigo = '$codigo' and color like '$color%' and presentacion = '$presentacion' and suc = '$suc'";
    //echo $sql;
    echo json_encode(getResultArray($sql));
}

function designarOrdenProcesamiento() {
    $codigo = $_POST['codigo'];
    $nro_compra = $_POST['nro_compra'];
    $nro_pedido = $_POST['nro_pedido'];
    $cod_cli = $_POST['cod_cli'];
    $usuario = $_POST['usuario'];

    //$presentacion = $_POST['presentacion']; // ya no vigente solo para mayoristas
    $array_lotes = json_decode($_POST['array_lotes']);
    $array_colores = json_decode($_POST['array_colores']);
    $politica = json_decode($_POST['array_cortes']);
    $sucs = json_decode($_POST['sucs']);

    $presentaciones = array();

    $ms = new My();
    $ms->Query("SELECT  suc, politica, presentacion FROM  politica_cortes  WHERE   codigo = '$codigo' ");
    while ($ms->NextRecord()) {
        $U_suc = $ms->Record['suc'];
        $U_presentacion = $ms->Record['presentacion'];
        $presentaciones[$U_suc] = $U_presentacion;
    }

    $lotes = array();

    $db = new My();

    $db->Query("SELECT MAX(prioridad) AS prioridad FROM orden_procesamiento WHERE estado ='Pendiente'");
    $db->NextRecord();
    $prioridad = $db->Record["prioridad"];

    if (is_null($prioridad)) {
        $prioridad = 1;
    }

    for ($i = 0; $i < sizeof($array_lotes); $i++) {
        $lote = $array_lotes[$i];
        $color = $array_colores[$i];
        $pol = explode(",", $politica[$i]);
        $arr_sucs = explode(",", $sucs[$i]);
        $j = 0;
        foreach ($pol as $corte) {
            $suc = $arr_sucs[$j];
            $presentacion = $presentaciones[$suc];
            $db->Query("INSERT INTO orden_procesamiento(id_ent, id_det, usuario, suc, nro_pedido, cod_cli, codigo, lote, fecha,hora, presentacion, cantidad,color,estado,prioridad)
            VALUES ($nro_compra, NULL, '$usuario', '$suc', $nro_pedido, '$cod_cli', '$codigo', '$lote', CURRENT_DATE,CURRENT_TIME,'$presentacion',$corte,'$color','Pendiente',$prioridad);");
            $j++;
        }
        array_push($lotes, $lote);
    }
    echo json_encode($lotes);
}

function getInvoicesNoCargados() {
    echo json_encode(getResultArray("SELECT invoice,n_nro,cod_prov,ruc,proveedor,moneda,DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha,total,origen,obs as coment FROM invoice i WHERE estado = 'Cerrado' AND NOT EXISTS (SELECT * FROM entrada_merc e WHERE i.invoice = e.invoice)"));
}

function getPedidosNoCargados() {
    echo json_encode(getResultArray("SELECT n.n_nro,n.usuario,DATE_FORMAT(fecha_cierre,'%d-%m-%Y') AS fecha,n.suc,n.Estado, COUNT(d.n_nro) as Items,n.obs FROM nota_pedido_compra n,  nota_ped_comp_det d  WHERE n.n_nro = d.n_nro AND (d.estado = 'En Transito'  OR d.estado = 'En Deposito'  OR d.estado = 'Despachado'  and n.estado = 'Pendiente') AND nac_int = 'Nacional' AND d.c_estado IS NULL AND NOT EXISTS (SELECT * FROM entrada_merc e, entrada_det ed WHERE e.id_ent = ed.id_ent AND d.n_nro = e.n_nro AND ed.codigo = d.codigo AND d.c_color = ed.color )  GROUP BY n.n_nro ORDER BY n.n_nro DESC LIMIT 150; "));
    //  echo json_encode(getResultArray("SELECT n.n_nro,n.usuario,DATE_FORMAT(fecha_cierre,'%d-%m-%Y') AS fecha,n.suc,n.Estado, COUNT(d.n_nro) as Items,n.obs FROM nota_pedido_compra n,  nota_ped_comp_det d  WHERE n.n_nro = d.n_nro AND (d.estado = 'En Transito'  OR d.estado = 'En Deposito'  OR d.estado = 'Despachado'  and n.estado = 'Pendiente') AND nac_int = 'Nacional' AND  NOT EXISTS (SELECT * FROM   entrada_det ed WHERE   ed.codigo = d.codigo) GROUP BY n.n_nro"));
}

function cancelarDetallesDePedidoCompra() {
    $nro = $_POST['nro'];
    $obs = $_POST['obs'];
    $ids = json_decode($_POST['ids']);

    $db = new My();
    $arr = array();
    foreach ($ids as $id_det) {
        $db->Query("update nota_ped_comp_det set c_estado = 'Cencelado', c_obs = concat(if(c_obs is null,'',c_obs),'-','$obs') where id_det = $id_det;");
        array_push($arr, array('id_det' => $id_det));
    }
    echo json_encode($arr);
}

function getDetallePedidosComprados() {
    $nro = $_POST['nro'];
    echo json_encode(getResultArray("select id_det,usuario,suc,codigo,descrip,color,cantidad,obs,mayorista,urge,if(c_prov is null,'',c_prov) as c_prov ,IF( c_fecha_prev is null,'',date_format(c_fecha_prev,'%d-%m-%Y')) as previsto from nota_ped_comp_det d  WHERE n_nro = $nro and estado != 'Pendiente'  AND  d.c_estado IS NULL  AND  NOT EXISTS (SELECT * FROM entrada_merc e, entrada_det ed WHERE e.id_ent = ed.id_ent AND d.n_nro = e.n_nro AND ed.codigo = d.codigo AND  ed.codigo = d.codigo AND d.c_color = ed.color ) ;"));
}

function unificarPedidos() {
    $a = $_POST['a'];
    $b = $_POST['b'];
    $db = new My();

    // Mover el Tracking si es que tiene antes (PK)
    $db->Query("update nota_ped_tracking set obs = concat(obs,'-','Movido de Nro: $a'), n_nro = $b where n_nro = $a;");
    $db->Query("UPDATE nota_ped_comp_det SET  n_nro = $b, c_ref_unif = $a WHERE n_nro = $a;");

    $db->Query("UPDATE nota_pedido_compra SET obs = '' where obs is null");
    $db->Query("UPDATE nota_pedido_compra SET obs = CONCAT(obs,'-','Unificado a Nro: $b') where n_nro = $a");
    $db->Query("UPDATE nota_pedido_compra SET obs = CONCAT(obs,'-','Unificado con Nro: $a') where n_nro = $b");
    echo "Ok";
}

function getGastosEntradaMerc() {

    $db = new My();
    $db2 = new My();


    $id_ent = $_POST['ref'];
    $sql = "SELECT t.cod_gasto,descrip AS nombre_gasto,IF(valor IS NULL,0,valor) AS valor,IF(moneda IS NULL,'G$',moneda) AS moneda,
    IF(cotiz IS NULL,1,cotiz) AS cotiz,IF(valor_ref IS NULL,0,valor_ref ) AS valor_ref FROM tipos_gastos t LEFT JOIN ent_gastos e ON t.cod_gasto = e.cod_gasto AND e.id_ent = $id_ent ORDER BY cod_gasto ASC";
    $db->Query($sql);


    echo json_encode(getResultArray($sql));
}
 

function guardarGastoEntradaMerc() {
     
    $id_ent = $_POST['id_ent'];
    $cod_gasto = $_POST['cod_gasto'];
    $valor = $_POST['valor'];
    $cotiz = $_POST['cotiz'];
    $moneda = $_POST['moneda'];

    $valor_ref = $valor * $cotiz;

    $db = new My();
    $dbd = new My();
    $db_g = new My();

    $db->Query("INSERT INTO ent_gastos(id_ent, cod_gasto, valor, moneda, cotiz, valor_ref) VALUES ($id_ent, $cod_gasto, $valor, '$moneda', $cotiz, $valor_ref) ON DUPLICATE KEY UPDATE valor = $valor,moneda = '$moneda', cotiz = $cotiz,valor_ref = $valor_ref ;");

    $db->Query("SELECT SUM(subtotal) * cotiz AS total_factura,cotiz as cotiz_factura FROM entrada_merc e, entrada_det d WHERE e.id_ent = d.id_ent and d.id_ent = $id_ent;");
    if ($db->NumRows() > 0) {
        $db->NextRecord();
        $total_factura = $db->Get("total_factura");
        $cotiz_factura = $db->Get("cotiz_factura");

        $total_gastos = 0;
        $db->Query("SELECT SUM(valor_ref) AS total_gastos FROM ent_gastos WHERE id_ent =  $id_ent;");
        if ($db->NumRows() > 0) {
            $db->NextRecord();
            $total_gastos = $db->Get("total_gastos");
        }

        $porc_recargo = round(($total_gastos * 100) / $total_factura, 4);

        $dbd->Query("update entrada_merc set porc_recargo = $porc_recargo where id_ent = $id_ent;");
         
        $dbd->Query("update entrada_det set precio_ms = (precio * $cotiz_factura)  where id_ent = $id_ent;");
        
        // Se Quita el % de valor del gasto respecto al % de participacion del articulo y se distribuye para todos los lotes
        /* Ej.:  Total Factura 100.000 
         * Total Gastos 15.000
         * Codigo C0001  % de participacion de 30%  --> 4500
         * 4500 distribuir entre todos los lotes
         */
        $dbd->Query("SELECT codigo,  porc_particip , (porc_particip * $total_gastos) / 100 AS gasto_a_distribuir,sum(cant_calc) AS suma_cant_calc FROM   entrada_det d WHERE  id_ent = $id_ent GROUP BY codigo");
        while($dbd->NextRecord()){
            $codigo = $dbd->Get('codigo');            
            $gasto_a_distribuir = $dbd->Get('gasto_a_distribuir');
            $suma_cant_calc = $dbd->Get('suma_cant_calc');
            $sobre_costo =  round(($gasto_a_distribuir / $suma_cant_calc),2);
            $db_g->Query("update entrada_det set sobre_costo = $sobre_costo, precio_real = (precio * $cotiz_factura) + sobre_costo where codigo = '$codigo' and id_ent = $id_ent");
        }
          
    }
    echo "Ok";
}

function updateEntradaNotes() {
    $id_ent = $_POST['ref'];
    $notes = $_POST['notes'];
    $db = new My();
    $db->Query("update entrada_merc set coment = '$notes' where id_ent = $id_ent;");
    echo "Ok";
}
 
function filtroManejoLotes() {
    
    $codigo = $_POST['codigo'];
    $cod_prov = $_POST['cod_prov'];
    $estado_venta = $_POST['estado_venta'];
    
    $suc = $_POST['suc'];
    $um = $_POST['um'];
    $moneda = $_POST['moneda'];
    $stock_min = $_POST['stock_min'];
    $stock_max = $_POST['stock_max'];
     
    $filtroColor = (isset($_POST['ColorCod']) && trim($_POST['ColorCod']) !== '%') ? " and p.pantone like '" . trim($_POST['ColorCod']) . "' " : '';  
     

    $limite = 100000;
    if (isset($_POST['limite'])) {
        $limite = $_POST['limite'];
    }
    $filtro_terminacion = "";
    if (isset($_POST['terminacion'])) {
        $term = $_POST['terminacion'];
        $filtro_terminacion = " AND l.lote like '%$term'";
    }


    $filtro_terminacion_padre = "";
    if (isset($_POST['terminacion_padre']) && $_POST['terminacion_padre'] != "") {
        $term_padre = $_POST['terminacion_padre'];
        $filtro_terminacion_padre = " AND l.padre like '%$term_padre' ";
    }


    $lotes_especificos = trim($_POST['lotes']);
    $lotes_especificos = preg_replace('/\s+/', '', $lotes_especificos);
 
    $codigo_lotes_especificos = "";

    $filtro_estado_ventas = " AND s.estado_venta like '$estado_venta' ";

    if (strlen($lotes_especificos) > 0) { 
        $cod_prov = "%";
        $codigo = "%";
        $suc = "%";
        $stock_min = -1000;
        $stock_max = 9999999;
        
        $nlote = explode(",", $lotes_especificos);
        $specific_lotes = "";
        $filtroColor = "";
        foreach ($nlote as $value) {
            $specific_lotes .= "'$value',";
        } 
        $specific_lotes = substr($specific_lotes, 0, -1);
        $codigo_lotes_especificos = " AND l.lote in($specific_lotes) ";
        $filtro_terminacion = "";
        $filtro_terminacion_padre= "";
        $filtro_estado_ventas = "";
    }

    $sql = "SELECT   l.codigo,a.descrip, l.lote, a.costo_prom AS precio_costo, costo_prom + (costo_prom * 25 / 100) AS valor_minimo ,p.pantone,p.nombre_color as color,  um_prod AS um,  l.ancho, gramaje, gramaje_m, tara, kg_desc,color_cod_fabric, cod_catalogo, l.img, padre, s.cantidad AS stock,s.estado_venta, d.um,d.moneda,s.suc,
    SUM(CASE WHEN lp.num = 1 THEN precio ELSE 0 END)   AS precio_1,
    SUM(CASE WHEN lp.num = 2 THEN precio ELSE 0 END)   AS precio_2,
    SUM(CASE WHEN lp.num = 3 THEN precio ELSE 0 END)   AS precio_3,
    SUM(CASE WHEN lp.num = 4 THEN precio ELSE 0 END)   AS precio_4,
    SUM(CASE WHEN lp.num = 5 THEN precio ELSE 0 END)   AS precio_5,
    SUM(CASE WHEN lp.num = 6 THEN precio ELSE 0 END)   AS precio_6,
    SUM(CASE WHEN lp.num = 7 THEN precio ELSE 0 END)   AS precio_7,

    SUM(CASE WHEN d.num = 1 THEN descuento ELSE 0 END)   AS desc_1,
    SUM(CASE WHEN d.num = 2 THEN descuento ELSE 0 END)   AS desc_2, 
    SUM(CASE WHEN d.num = 3 THEN descuento ELSE 0 END)   AS desc_3, 
    SUM(CASE WHEN d.num = 4 THEN descuento ELSE 0 END)   AS desc_4, 
    SUM(CASE WHEN d.num = 5 THEN descuento ELSE 0 END)   AS desc_5, 
    SUM(CASE WHEN d.num = 6 THEN descuento ELSE 0 END)   AS desc_6, 
    SUM(CASE WHEN d.num = 7 THEN descuento ELSE 0 END)   AS desc_7  

    FROM lotes l INNER JOIN stock s  ON l.codigo = s.codigo AND s.lote = l.lote  
    INNER JOIN articulos a ON a.codigo = l.codigo  
    INNER JOIN lista_prec_x_art lp ON a.codigo = lp.codigo AND lp.um like '$um' AND lp.moneda like '$moneda' 
    INNER JOIN pantone p on l.pantone = p.pantone
    LEFT JOIN desc_lotes d   ON l.codigo = d.codigo AND lp.num = d.num AND l.lote = d.lote  
    AND d.um like '$um' AND d.moneda like '$moneda'  WHERE
    s.cantidad BETWEEN $stock_min AND $stock_max AND l.codigo like '$codigo' AND s.suc like '$suc' $filtroColor  $codigo_lotes_especificos  $filtro_terminacion  $filtro_terminacion_padre $filtro_estado_ventas GROUP BY l.codigo,l.lote limit $limite";
      
    echo json_encode(getResultArray($sql));
 
}

function getPrecioRetazo(){
    $codigo = $_REQUEST['codigo'];
    echo json_encode(getResultArray("SELECT cant_retazo, precio_retazo FROM articulos WHERE codigo = '$codigo'")[0]);
}
/**
 * 
 * @param type $lote
 * @return type
 * @deprecated Al parecer ya no se utiliza esta funcion, ex SQL Server modificado para que funcione con MySQL
 */
function proveedorXLote($lote) {
    $my = new My();
    $proveedor = '';
    $my->Query("select id_compra from lotes where lote = '$lote' limit 1");
    if($my->NumRows() > 0){
        $my->NextRecord();
        $id_compra = $my->Get('id_compra');
        $my->Query("SELECT cod_prov,proveedor FROM entrada_merc WHERE id_ent = $id_compra;");
         if($my->NumRows() > 0){
           $my->NextRecord();
          $proveedor = $my->Get('proveedor');
         }
    }
    return $proveedor;
}

/**
 * Llamada desde From ManejoLotes.js
 */

function actualizarDescuentosPorLote() {
     
    $usuario = $_POST['usuario'];
    $estado_venta = $_POST['estado_venta'];
    $um = $_POST['um'];
    $moneda = $_POST['moneda'];
    $data = json_decode($_POST['data']);
     
    $db = new My();
    
    $db_s = new My();
    
    $i = 0;
    foreach ($data as $a) {
        $codigo = $a[0];
        $lote = $a[1];
        $descrip = $a[2];
        $suc = $a[3];
         
        for($cat = 1;$cat <= 7; $cat++){
            
            ${"p$cat"} = $a[$cat + 3];             
            ${"desc$cat"} = $a[$cat + 10];             
            ${"pf$cat"} =  (${"p$cat"} - ${"desc$cat"});
             
            
            $get = "SELECT precio,descuento,precio - descuento AS precio_final FROM lista_prec_x_art l, desc_lotes d WHERE l.codigo = d.codigo AND l.num = d.num AND l.codigo = '$codigo' AND d.lote = '$lote' AND d.num = $cat AND d.moneda = '$moneda' AND d.um = '$um'";
            $db_s->Query($get);
            
            $precio_art_ant =0;
            $desc_ant = 0;
            $precio_final_ant = 0;
            
            if($db_s->NumRows()>0){
               $db_s->NextRecord(); 
               $precio_art_ant = $db_s->Get("precio");
               $desc_ant =   $db_s->Get("descuento");
               $precio_final_ant =  (float)$db_s->Get("precio_final"); 
            } 
      
            if(${"pf$cat"}  !=  $precio_final_ant){
                $upd = "INSERT INTO desc_lotes(codigo, lote, num, moneda, um, descuento)VALUES ('$codigo', '$lote',  $cat  , '$moneda', '$um', ${"desc$cat"}) ON DUPLICATE KEY UPDATE descuento = ${"desc$cat"};";

                $db->Query($upd);

                $hist = "INSERT INTO  hist_precios(usuario, fecha, hora, suc, codigo, lote, num, moneda, um, precio_art_ant, desc_ant, precio_final_ant, precio_art_actual, desc_actual, precio_final_actual, estado_venta, fecha_impresion, cant_impresiones)
                VALUES ('$usuario', CURRENT_DATE, CURRENT_TIME, '$suc', '$codigo', '$lote',  $cat , '$moneda', '$um', $precio_art_ant, $desc_ant, $precio_final_ant, ${"p$cat"}, ${"desc$cat"}, ${"pf$cat"}, '$estado_venta', NULL, 0);";

                $db->Query($hist); 
            }  
        }
        $estado = "UPDATE stock SET estado_venta = '$estado_venta' WHERE codigo ='$codigo' AND lote = '$lote' AND suc = '$suc';";
        $db->Query($estado); 
        $i++; 
    }
    echo json_encode(array('estado' => 'Ok', 'mensaje' => "Se han actualizado $i lotes..."));
}

//Ex controlarCotizacionEntradaMercaderias

function getCotizacionContable() {
     
    $moneda = $_POST['moneda'];
    $fecha = $_POST['fecha'];
    /*$suc = $_POST['suc'];
    AND suc = '$suc'  La sucursal ya no importa es una cotizacion contable para todas las sucursales */

    $db = new My();
    $db->Query("SELECT compra, venta,date_format(fecha,'%d-%m-%Y') as fecha FROM cotizaciones_contables WHERE m_cod = '$moneda'  and fecha = '$fecha' ORDER BY CONCAT(fecha,' ',hora) DESC LIMIT 1");
    if ($db->NumRows() > 0) {
        $db->NextRecord();
        $compra = $db->Get("compra");
        $venta = $db->Get("venta");
        $fecha = $db->Get("fecha");
        echo json_encode(array('estado' => 'Ok','mensaje'=>'Ok', 'compra' => $compra,"venta"=>$venta ,"fecha"=>$fecha));
         
    } else {
        echo json_encode(array('estado' => 'Error', 'mensaje' => "Debe establecer cotizacion de la moneda '$moneda' para la fecha: '$fecha' en , Menu:  Administracion --> Finanzas --> Cotizaciones Contables"));
    }
}

/**
 * @param type $color: name or code
 */
function verificarDatosEntradaMercaderia() {
    //$color_name_or_cod = trim( $_POST['color'] );  
    $id_ent = $_POST['id_ent'];

    $my = new My();
    $my2 = new My();
    $my->Query("select id_det,color,ancho,gramaje,color_comb,design,um,codigo from entrada_det where id_ent = $id_ent;");
    $array = array();
    while ($my->NextRecord()) {
        $color_name_or_cod = utf8_decode($my->Record['color']);
        $id_det = $my->Record['id_det'];
        $ancho = $my->Record['ancho'];
        $gramaje = $my->Record['gramaje'];
        $color_comb = $my->Record['color_comb'];
        $design = $my->Record['design'];
        $codigo = $my->Record['codigo'];

        $um = $my->Record['um'];

        $tmp = array();

        if ($um != 'Unid') {
            if ($ancho <= 0) {
                array_push($tmp, "ancho");  // Estas son las Clases ;)
            }
            if ($gramaje <= 0) {
                array_push($tmp, "gramaje");
            }

            if (strlen($color_comb) == 0) {
                array_push($tmp, "color_comb");
            }
            if (strlen($design) == 0) {
                array_push($tmp, "design");
            }
        }

        $db = new My();

        $sql = "SELECT pantone FROM pantone WHERE nombre_color = '$color_name_or_cod' AND estado = 'Activo' ";

        $db->Query($sql);
        if ($db->NumRows()) {
            $db->NextRecord();
            $pantone = $db->Record['pantone'];
            $my2->Query("update entrada_det set cod_pantone = '$pantone' where id_ent = $id_ent and id_det = $id_det;");
        } else {
            array_push($tmp, "color");
            $my2->Query("update entrada_det set cod_pantone = '' where id_ent = $id_ent and id_det = $id_det;");
        }
        if (sizeof($tmp) > 0) {
            $a = array('id_det' => $id_det, 'errores' => $tmp);
            array_push($array, $a);
        }
    }
    echo json_encode($array);

    
}

function getDesignsImages() {
    $db = new My();
    $designs = "SELECT design AS Folder, descrip AS Design FROM designs WHERE estado = 'Activo'";

    $array = array();
    $db->Query($designs);

    $exclude = array(".", "..", "photothumb.db");

    while ($db->NextRecord()) {
        $design_info = array();
        $folder = $db->Record['Folder'];
        $design = $db->Record['Design'];
        $thumnails = scandir("img/PATTERNS/$folder");

        $design_info['key'] = $folder;
        $design_info['name'] = utf8_encode($design);

        $t = array();
        foreach ($thumnails as $value) {
            if (!in_array($value, $exclude)) {
                array_push($t, $value);
            }
        }
        //print_r($t);
        $design_info['thumnails'] = $t;

        array_push($array, $design_info);
    }
    //print_r($array);

    echo json_encode($array);
}

function createDesignsThumnails() {
    $ficheros1 = scandir($directorio);
    $thumnail = imagescale($data, 150);
    file_put_contents($nombre_archivo . "_thums.jpg", $thumnail);
}

function cerrarEntradaMercaderias() {
    echo " Movideo a EntradaMercaderias ";
    /**
     * 
      $ref = $_POST['ref'];
      $usuario = $_POST['usuario'];

      $db = new My();

      $db->Query("SELECT origen FROM entrada_merc WHERE id_ent = $ref;");

      $db->NextRecord();

      $origen = $db->Record['origen'];
      if ($origen == "Nacional") {
      $db->Query("update entrada_merc set estado = 'Cerrada',usuario = '$usuario' where id_ent = $ref;");
      } else {
      $db->Query("update entrada_merc set estado = 'Cerrada',usuario = '$usuario',fecha_fact = current_date where id_ent = $ref;"); // Por pedido de Arnaldo Actualizar Fecha
      //  $db->Query("update entrada_merc set estado = 'Cerrada',usuario = '$usuario'  where id_ent = $ref;");
      }
      echo "Ok";
     * 
     */
}


function corregirCantidadCalculadaEntradaMerc($ref) {
    echo "Movido a Entrada de Mercaderias";
    /*
    $db = new My();
    // Calculo las cantidaddes para Unid y Mts
    $db->Query("UPDATE entrada_det SET cant_calc = cantidad   WHERE id_ent = $ref AND um = um_prod and (um = 'Unid' or um = 'Mts')");
    // Calculo las cantidaddes para Yardas
    $db->Query("UPDATE entrada_det SET cant_calc = cantidad * 0.9144   WHERE id_ent = $ref AND um = 'Yds' and um_prod = 'Mts'");

    //Calculo para pasar de Kgs a Metros

    $db->Query("UPDATE entrada_det SET cant_calc = (cantidad * 1000)/(gramaje * ancho)   WHERE id_ent = $ref AND  um = 'Kg' and um_prod = 'Mts'");

    // Tratamiento especial para ANTES (H0244) ahora IN030 Rendimiento de 8000 por cada Cono
    // Calculo las cantidaddes para Unid y Mts
    $db->Query("UPDATE entrada_det SET cant_calc = cantidad * 8000   WHERE id_ent = $ref AND um = um_prod and um = 'Unid' and codigo = 'IN030'");
    */
}

/* Deprecated se agrego en EntradaMercaderias.class.php */

function agregarDetalleEntrada() {
    echo "Movido a Entrada Mercaderias...";
    /*
      $ref = $_POST['ref'];
      $store_no = $_POST['store_no'];
      $codigo = $_POST['codigo'];
      $um_art = $_POST['um_art'];
      $descrip = $_POST['descrip'];
      $color = $_POST['color'];
      $catalogo = $_POST['catalogo'];
      $cod_color = $_POST['cod_color'];
      $color_comb = $_POST['corlo_comb'];
      $design = $_POST['design'];
      $composicion = $_POST['composicion'];
      $umc = $_POST['umc'];
      $ancho = $_POST['ancho'];
      $gramaje = $_POST['gramaje'];
      $nro_lote_fab = $_POST['nro_lot_fab'];
      $nro_pedido = $_POST['nro_pedido'];
      $cantidades = json_decode($_POST['cantidades']);
      $precio = $_POST['precio'];
      $bale_no = $_POST['bale_no'];
      $img = trim($_POST['img']);
      $correlativo = $_POST['correlativo'];

      if($img == "0/0"){
      $img= "'0/0'";
      }else if(strlen($img) > 3){
      $img= "'$img'";
      }else{
      $img = "NULL";
      }

      $desde_empaque = $_POST['desde_empaque'];
      $entrada_directa = $_POST['entrada_directa'];

      if (!isset($bale_no)) {
      $bale_no = 1;
      }


      $db = new My();
      $db->Query("SELECT  IF(MAX(id_det) IS NOT NULL,MAX(id_det),0)  AS maximo FROM entrada_det WHERE id_ent = $ref;");
      $db->NextRecord();
      $max = $db->Record['maximo'];
      //$db->Query("SET @row_number:=$max;");
      $maximo = $max;

      //

      for ($i = 0; $i < sizeof($cantidades); $i++) {

      $quty_ticket = 'null';
      $kg_desc = 'null';
      $ancho_real = 'null';
      $gramaje_m = 'null';
      $equiv = 'null';
      $recibido = null;
      $notas = "";
      $printed = 0;

      $max++;
      $cantidad = $cantidades[$i];
      $subtotal = $precio * $cantidad;


      if ($desde_empaque == "true" || $entrada_directa == "true") {
      $quty_ticket = $cantidad;
      $kg_desc = ($gramaje * $cantidad * $ancho ) / 1000;
      $ancho_real = $ancho;
      $gramaje_m = $gramaje;
      $equiv = $cantidad;
      $recibido = 'Si';
      $notas = "";
      $printed = 0;
      }


      $sql = "INSERT INTO entrada_det
      (id_ent, id_det, nro_pedido, id_pack,store_no, bale, piece, codigo, lote, descrip, um, cod_catalogo, fab_color_cod, precio, cantidad, subtotal, color, color_comb, design, composicion, ancho, gramaje,um_prod,obs,nro_lote_fab,  quty_ticket,kg_desc,ancho_real,gramaje_m,equiv,recibido,notas,printed,img)values
      ($ref,$max,$nro_pedido, 0,'$store_no',$bale_no, $max, '$codigo','', '$descrip','$umc', '$catalogo', '$cod_color', $precio, $cantidad, $subtotal, '$color',"
      . " '$color_comb', '$design', '$composicion', $ancho, $gramaje,'$um_art','','$nro_lote_fab', $quty_ticket,$kg_desc,$ancho_real,$gramaje_m,$equiv,'$recibido','$notas','$printed',$img);";
      $db->Query($sql);
      if ($correlativo == "true") {
      $bale_no++;
      }
      }


      // Actualizo las cantidades calculadas en base a la unidad de Media
      corregirCantidadCalculadaEntradaMerc($ref);

      $sql = "SELECT  id_ent, id_det, nro_pedido, id_pack,store_no, bale, piece, codigo, lote, descrip, um, cod_catalogo, fab_color_cod, precio, cantidad, subtotal, color, color_comb, design, composicion, ancho, gramaje,obs,um_prod,cant_calc,nro_lote_fab FROM entrada_det "
      . "WHERE id_ent = $ref and id_det > $maximo ORDER BY store_no asc,bale asc,codigo asc,color asc;";
      echo json_encode(getResultArray($sql));
     */
}

function modificarDetalleEntradaMercaderia() {
    echo "Movido a Entrada de Mercaderias";
    /*
    $ref = $_POST['ref'];
    $id_det = $_POST['id_det'];
    $store_no = $_POST['store_no'];
    $codigo = $_POST['codigo'];
    $um_art = $_POST['um_art'];
    $descrip = $_POST['descrip'];
    $color = $_POST['color'];
    $catalogo = $_POST['catalogo'];
    $cod_color = $_POST['cod_color'];
    $color_comb = $_POST['corlo_comb'];
    $design = $_POST['design'];
    $umc = $_POST['umc'];
    $ancho = $_POST['ancho'];
    $gramaje = $_POST['gramaje'];
    $nro_lote_fab = $_POST['nro_lot_fab'];
    $cantidad = $_POST['cantidad'];
    $precio = $_POST['precio'];
    $bale = $_POST['bale'];
    $subtotal = $precio * $cantidad;
    $img = $_POST['img'];
    if ($img != "") {
        $img = "'$img'";
    } else {
        $img = "NULL";
    }

    $db = new My();

    $pantone = getCodigoPantone($color);

    $sql = "UPDATE entrada_det set codigo = '$codigo',descrip = '$descrip',um = '$umc', cod_catalogo= '$catalogo', fab_color_cod= '$cod_color',nro_lote_fab = '$nro_lote_fab', precio = $precio, cantidad = $cantidad,
    subtotal = $subtotal, color=  '$color', color_comb= '$color_comb', design= '$design',   ancho= $ancho, gramaje=$gramaje,um_prod= '$um_art', cod_pantone = '$pantone',bale = $bale, img = $img WHERE id_ent = $ref and id_det = $id_det; ";
    $db->Query($sql);

    // Actualizo las cantidades calculadas en base a la unidad de Media
    corregirCantidadCalculadaEntradaMerc($ref);

    $sql = "SELECT  id_ent, id_det, nro_pedido, id_pack,store_no, bale, piece, codigo, lote, descrip, um, cod_catalogo, fab_color_cod, precio, cantidad, subtotal, color, color_comb, design,  ancho, gramaje,obs,um_prod,cant_calc,nro_lote_fab,img FROM entrada_det "
            . "WHERE id_ent = $ref and id_det = $id_det ORDER BY store_no asc,bale asc,codigo asc,color asc;";
    echo json_encode(getResultArray($sql));
    */
}

function getCodigoPantone($color) {
     
    $db = new My();
    $db->Query("SELECT pantone FROM pantone WHERE nombre_color = '$color' AND estado = 'Activo'");
    if ($db->NumRows() > 0) {
        $db->NextRecord();
        return $db->Record['pantone'];
    } else {
        return '';
    }
}

function borrarDetalleEntradaMercaderia() {
    $ref = $_POST['id_ent'];
    $id_det = $_POST['id_det'];
    $db = new My();
    $db->Query("delete from entrada_det where id_ent = $ref and id_det =  $id_det;");
    echo "Ok";
}

function eliminarEntradaMercaderia() {
    $ref = $_POST['ref'];
    $db = new My();
    $db->Query("delete from ent_gastos where id_ent = $ref;");
    $db->Query("delete from pedidos_x_entrada WHERE id_ent = $ref;");
    $db->Query("delete from entrada_det where id_ent = $ref;");    
    $db->Query("delete from entrada_merc WHERE id_ent = $ref;");
    echo "Ok";
}

function cambiarEstadoItemCompraInternacional() {
    $id = $_POST['id'];
    $estado = $_POST['estado'];
    $db = new My();
    $db->Query("UPDATE compra_det SET estado = '$estado' WHERE id_det = $id;");
    echo $estado;
}

function generateNewInvoice() {
    $nro = $_POST['nro_pedido'];
    $moneda = $_POST['moneda'];
    $usuario = $_POST['usuario'];
    $cod_prov = "";
    $proveedor = "";
    $ruc = "";
    $PREFIJO = "A";
    if ($usuario == "Zhu") {
        $cod_prov = "P000001";
        $ruc = "1860888";
        $proveedor = "RICHATEX LIMITED HONGKONG";
        $PREFIJO = "RI";
    } elseif ($usuario == "Ravi") {
        $cod_prov = "P000002";
        $ruc = "677";
        $proveedor = "SR GLOBAL TRADING CO. LTD";
        $PREFIJO = "SR";
    } elseif ($usuario == "FanYi") {
        $cod_prov = "P000203";
        $ruc = "1449";
        $proveedor = "FANYI TEXTILE CO.LTD";
        $PREFIJO = "FY";
    } else {
        $cod_prov = "";
        $provedor = "";
    }
    $db = new My();

    $db->Query("SELECT LEFT(temporada,1) AS temporada FROM nota_pedido_compra WHERE n_nro = $nro;");
    $temporada = "P";
    if ($db->NumRows() > 0) {
        $db->NextRecord();
        $temporada = $db->Record['temporada'];
    }

    $mes_anio = date("my");

    $db->Query("SELECT  RIGHT(CONCAT('0',RIGHT(invoice,2) + 1),2)  AS INV  FROM invoice WHERE invoice LIKE '$PREFIJO%'  AND YEAR(CURRENT_DATE) = YEAR(fecha)    ORDER BY fecha DESC, INV DESC LIMIT 1");
    $serial_number = "01";
    if ($db->NumRows() > 0) {
        $db->NextRecord();
        $serial_number = $db->Record['INV'];
    } else {
        $serial_number = "01";
    }
    $INVOICE_NO = $PREFIJO . "-" . $temporada . "" . $mes_anio . "-" . $serial_number;


    $db->Query("select venta from cotizaciones where m_cod = '$moneda' order by id_cotiz desc limit 1");
    $cotiz = 1;
    if ($db->NumRows() > 0) {
        $db->NextRecord();
        $cotiz = $db->Record['venta'];
    } else {
        $cotiz = 1;
    }
    $origen = 'Undefined';
    $db->Query("SELECT pais FROM usuarios WHERE usuario = '$usuario'");
    if ($db->NumRows() > 0) {
        $db->NextRecord();
        $origen = $db->Record['pais'];
    }
    $db->Query("INSERT INTO invoice(invoice, n_nro,ruc, moneda, usuario, cod_prov, proveedor, cotiz, total, fecha, obs, origen, estado)
    VALUES ('$INVOICE_NO', $nro,'$ruc', '$moneda', '$usuario', '$cod_prov', '$proveedor', '$cotiz',0,CURRENT_DATE, '', '$origen', 'Abierto');");
    echo $INVOICE_NO;
}

function getInvoiceExpenses() {
    $invoice = $_POST['invoice'];
    $nro_pedido = $_POST['n_nro'];
    $sql = "SELECT count(*) as cant FROM inv_gastos WHERE invoice = '$invoice' AND (cod_gasto = 8 OR cod_gasto = 10 OR cod_gasto = 12) ORDER BY nro_gasto ASC";
    $db = new My();
    $db->Query($sql);
    $db->NextRecord();

    $cant = $db->Record['cant'];

    if ($cant == 0) {
        $db->Query("INSERT INTO inv_gastos(invoice, n_nro, cod_gasto, nombre_gasto, valor)VALUES ('$invoice', $nro_pedido, 8, 'Port Expenses on Origin', 0);");
        $db->Query("INSERT INTO inv_gastos(invoice, n_nro, cod_gasto, nombre_gasto, valor)VALUES ('$invoice', $nro_pedido, 12, 'Consolidation Expenses on Origin', 0);");
        $db->Query("INSERT INTO inv_gastos(invoice, n_nro, cod_gasto, nombre_gasto, valor)VALUES ('$invoice', $nro_pedido, 10, 'Comission Forwarder', 0);");
    }
    $sql = "SELECT nro_gasto, cod_gasto,nombre_gasto,valor FROM inv_gastos WHERE invoice = '$invoice' AND (cod_gasto = 8 OR cod_gasto = 10 OR cod_gasto = 12) ORDER BY nro_gasto ASC";
    echo json_encode(getResultArray($sql));
}

function updateInvoiceExpenses() {
    $invoice = $_POST['invoice'];
    $id = $_POST['id'];
    $valor = $_POST['value'];
    $db = new My();
    $db->Query("update inv_gastos set valor = $valor where nro_gasto = $id;");
    $db->Query("select sum(subtotal) as subtotales from packing_list where invoice = '$invoice';");
    $db->NextRecord();
    $subtotales = $db->Record['subtotales'];
    $db->Query("select sum(valor) as gastos from inv_gastos where invoice  = '$invoice';");
    $db->NextRecord();
    $gastos = $db->Record['gastos'];
    $total = $subtotales + $gastos;
    $db->Query("update invoice set total = $total where invoice  = '$invoice';");
    echo "Ok";
}

function updateInvoiceNotes() {
    $invoice = $_POST['invoice'];
    $notes = $_POST['notes'];
    $db = new My();
    $db->Query("update invoice set obs = '$notes' where invoice  = '$invoice';");
    echo "Ok";
}

function getInvoiceNotes() {
    $invoice = $_POST['invoice'];
    $db = new My();
    $db->Query("select obs from invoice where invoice  = '$invoice';");
    $db->NextRecord();
    $obs = $db->Record['obs'];
    echo $obs;
}

function getPackingList() {
    $invoice = $_POST['invoice'];
    $sql = "SELECT id_pack,id_det, cod_prov, bale, piece, codigo, descrip,color, CONCAT(cod_catalogo,'-',fab_color_cod) AS color_cod_fab, precio, cantidad,um, subtotal 
    FROM packing_list WHERE invoice = '$invoice' order by cod_prov asc, bale asc, piece asc,descrip asc,color asc,color_cod_fab asc";
    echo json_encode(getResultArray($sql));
}

function guardarPrecioDetallePedidoInt() {
    $nro = $_POST['nro'];
    $id = $_POST['id'];
    $codigo = $_POST['codigo'];
    $precio_est = $_POST['precio_est'];
    $db = new My();

    $db->Query("SELECT color  FROM nota_ped_comp_det WHERE id_det = $id and n_nro = $nro");
    $db->NextRecord();
    $color = $db->Record['color'];
    $db->Query("UPDATE nota_ped_comp_det SET c_precio_compra = $precio_est  WHERE n_nro = $nro and codigo = '$codigo' and color = '$color'");
    echo "Ok";
}

function guardarDatosCompraPorCorp() {
    $unique_id = $_POST['id'];
    $nro = $_POST['nro'];
    $id_res = $_POST['id_pedido'];
    $corp = $_POST['corp'];
    $codigo = $_POST['codigo'];
    $um = $_POST['um'];
    $descrip = $_POST['descrip'];
    $catalogo = $_POST['catalogo'];
    $fab_color_cod = $_POST['fab_color_cod'];
    $color = $_POST['color'];
    $color_comb = strtoupper($_POST['color_comb']);
    $cantidad = $_POST['cantidad'];
    $precio = $_POST['precio'];
    $design = strtoupper($_POST['design']);
    $comp = strtoupper($_POST['comp']);
    $gramaje = $_POST['gramaje'];
    $ancho = $_POST['ancho'];
    $imagen = $_POST['imagen'];

    $moneda = $_POST['moneda'];

    $db = new My();
    $db->Query("select venta from cotizaciones where m_cod = '$moneda' order by id_cotiz desc limit 1");
    $cotiz = 1;
    if ($db->NumRows() > 0) {
        $db->NextRecord();
        $cotiz = $db->Record['venta'];
    } else {
        $cotiz = 1;
    }
    $sql = "UPDATE compras SET moneda = '$moneda', cotiz = $cotiz WHERE n_nro = $nro AND cod_prov = '$corp'";
    $db->Query($sql);

    if ($ancho == "") {
        $ancho = 0;
    }
    if ($gramaje == "") {
        $gramaje = 0;
    }
    $subtotal = $precio * $cantidad;

    $db->Query("DELETE FROM compra_det WHERE unique_id = '$unique_id'");

    $db->Query("insert into compra_det(n_nro, cod_prov, codigo, descrip, cod_catalogo, fab_color_cod, precio, cantidad, subtotal, color, color_comb, design, composicion, ancho, gramaje,um,cant_enviada,estado,id_res,unique_id)
    values ( $nro, '$corp', '$codigo', '$descrip', '$catalogo', '$fab_color_cod', $precio, $cantidad, $subtotal, '$color', '$color_comb', '$design', '$comp', $ancho, $gramaje,'$um',0,'Pending',$id_res,'$unique_id');");
    if ($imagen != "") {
        $db->Query("select id_det from compra_det where n_nro = $nro and cod_prov = '$corp' order by id_det desc limit 1");
        $db->NextRecord();
        $id_det = $db->Record['id_det'];

        $folder = 'files\compras\\' . $nro . '\\' . $corp;
        try {
            if (file_exists($folder)) {
                
            } else {
                mkdir('files\compras\\' . $nro . '\\' . $corp, 0777, true);
            }
        } catch (Exception $exc) {
            require_once("Log.class.php");
            $l = new Log();
            $l->error("Error en : " . __FILE__ . "  " . __LINE__ . "  " . $exc->getMessage());
        }
        $path = '' . $folder . '\\' . $id_det . '.jpg';
        file_put_contents($path, base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $imagen)));
    }
    $info = array("Status" => "Ok", "id_det" => $id_det);
    echo json_encode($info);
}

function saveImageBase64Test() {
    $data = $_POST['imagen'];
    file_put_contents('img.jpg', base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $data)));
    echo "Ok";
}

function guardarResumenPediddoInt() {
    $nro = $_POST['nro'];
    $id = $_POST['id'];
    $pedido = $_POST['pedido'];
    $total_ventas = $_POST['total_ventas'];
    $rango_ventas = $_POST['rango_ventas'];

    $db = new My();

    $db->Query("SELECT codigo,color,descrip  FROM nota_ped_comp_det WHERE id_det = $id and n_nro = $nro");
    $db->NextRecord();
    $codigo = $db->Record['codigo'];
    $color = $db->Record['color'];
    $descrip = $db->Record['descrip'];

    $db->Query("SELECT  SUM(cantidad_pond) as cant_pond, c_precio_compra as precio_est, um_prod  FROM nota_ped_comp_det WHERE codigo = '$codigo' AND COLOR = '$color' AND n_nro = '$nro' GROUP BY codigo");
    $db->NextRecord();
    $cant_pond = $db->Record['cant_pond'];
    $precio_est = $db->Record['precio_est'];
    $um_prod = $db->Record['um_prod'];


    // Borro si ya hay alguno
    $db->Query("DELETE FROM nota_ped_resumen  WHERE n_nro = $nro and codigo = '$codigo' and color = '$color'");

    // Inserto uno nuevo si es > 0
    if ($pedido > 0) {
        $db->Query("INSERT INTO nota_ped_resumen(id_det, n_nro, codigo,descrip, um_prod, obs, cantidad, cantidad_pond, color, precio_est, estado,ventas,rango_ventas)"
                . "VALUES ($id, $nro, '$codigo','$descrip', '$um_prod', '', $pedido, $cant_pond, '$color', '$precio_est', 'Pendiente',$total_ventas,'$rango_ventas'); ");
    }

    //Actualizo el Estado

    $db->Query("UPDATE nota_ped_comp_det SET estado = 'Procesado' WHERE n_nro = $nro and codigo = '$codigo' and color = '$color'");
    echo "Ok";
}

function getPrecioVentaAnterior() {
    $factura = $_POST['factura'];
    $cod_cli = $_POST['cod_cli'];
    $db = new My();
    $dbd = new My();
    $db->Query("SELECT DISTINCT codigo FROM fact_vent_det   WHERE f_nro = $factura");

    $array = array();

    while ($db->NextRecord()) {
        $codigo = $db->Record['codigo'];
        $dbd->Query("SELECT d.precio_venta  FROM  factura_venta f,fact_vent_det  d WHERE f.f_nro = d.f_nro AND f.estado ='Cerrada' AND  f.f_nro != $factura AND f.cod_cli = '$cod_cli' AND codigo = '$codigo' ORDER BY id_det DESC LIMIT 1");
        if ($dbd->NumRows() > 0) {
            $dbd->NextRecord();
            $u_precio = $dbd->Record['precio_venta'];
            array_push($array, array('codigo' => $codigo, 'precio' => number_format($u_precio, 0, ',', '.')));
        }
    }
    echo json_encode($array);
}

function getTotalPedidoIntXColor() {
    $nro = $_POST['nro'];
    $id = $_POST['id'];
    $db = new My();
    $db->Query("SELECT codigo,color  FROM nota_ped_comp_det WHERE id_det = $id and n_nro = $nro");
    $db->NextRecord();
    $codigo = $db->Record['codigo'];
    $color = $db->Record['color'];

    $db->Query("SELECT  SUM(cantidad) as pedido  FROM nota_ped_resumen WHERE codigo = '$codigo' AND COLOR = '$color' AND n_nro = $nro and id_det = $id; ");
    $db->NextRecord();
    $pedido = $db->Record['pedido'];
    echo $pedido;
}

function buscarStockXColorArticulo() {
    $codigo = $_POST['codigo'];
    $color = $_POST['color'];
    $sql = "SELECT SUM(s.cantidad) AS Stock  FROM articulos a INNER JOIN lotes l ON a.codigo = l.codigo INNER JOIN pantone p ON l.pantone = p.pantone INNER JOIN stock s ON s.codigo = l.codigo AND s.lote = l.lote AND s.cantidad > 0 AND s.estado_venta <> 'FP'
    AND a.codigo = '$codigo' AND p.nombre_color LIKE '$color' ORDER BY s.cantidad DESC";
    $stock = getResultArray($sql);
    echo json_encode($stock);
}

function guardarPonderacionCliente() {
    $id = $_POST['id'];
    $nro = $_POST['nro'];
    $cod_cli = $_POST['cod_cli'];
    $pond = $_POST['pond'];
    $precio_est = $_POST['precio_est'];
    $db = new My();
    $db->Query("UPDATE nota_ped_comp_det SET ponderacion = $pond, cantidad_pond = cantidad * $pond,c_precio_compra = $precio_est  WHERE n_nro = $nro and id_det = $id;");
    echo "Ok";
}

function finalizarNotaPedidoCompra() {
    $nro = $_POST['nro'];
    $db = new My();
    $db->Query("UPDATE nota_pedido_compra SET estado = 'Pendiente', fecha_cierre = current_date,hora_cierre = current_time  WHERE n_nro = $nro;");
}

function eliminarArticuloDetallePedido() {
    $id = $_POST['id'];
    $db = new My();
    $db->Query("DELETE FROM nota_ped_comp_det  WHERE id_det = $id;");
    echo "Ok";
}

function verificarEstadoNotaPedidoCompraNacional($nro_pedido) {
    $db = new My();
    $db->Query("SELECT COUNT(*) as CANT FROM nota_ped_comp_det WHERE estado = 'Pendiente' and n_nro = '$nro_pedido'");
    $db->NextRecord();
    $CANT = $db->Record['CANT'];
    if ($CANT == 0) {
        $db->Query("UPDATE nota_pedido_compra SET ESTADO = 'Cerrada' WHERE n_nro = $nro_pedido;");
    }
    return $CANT;
}

function pedidoComprado() {
    $id = $_POST['id'];
    $nro_pedido = $_POST['nro_pedido'];
    $usuario = $_POST['usuario'];
    $p_compra = $_POST['p_compra'];
    $cod_prov = $_POST['cod_prov'];
    $proveedor = $_POST['proveedor'];
    $fecha_prev = $_POST['fecha_prev'];
    $obs = $_POST['obs'];

    $codcat = $_POST['codcat'];
    $pantone = $_POST['pantone'];
    $colorCod = $_POST['colorCod'];
    $combinacion = $_POST['combinacion'];
    $unidadMedida = $_POST['unidadMedida'];
    $diseno = $_POST['diseno'];


    $db = new My();
    $query = "UPDATE nota_ped_comp_det SET c_prov_cod = '$cod_prov',c_prov = '$proveedor',c_precio_compra = $p_compra,c_fecha_compra = current_date,c_fecha_prev = '$fecha_prev',c_obs = '$obs',estado = 'Comprado', c_color = '$pantone', c_catalogo=$codcat, c_fab_color_cod = '$colorCod', c_color_comb = '$combinacion', c_um = '$unidadMedida', c_design='$diseno' WHERE n_nro = $nro_pedido and id_det = $id";
    $db->Query($query);

    $db->Query("INSERT INTO nota_ped_tracking(id_det,n_nro,usuario,fecha_hora,fecha_prev,estado,obs)values($id,$nro_pedido,'$usuario',current_timestamp,'$fecha_prev','Comprado','$obs')");

    // Verificar estado de Nota 
    verificarEstadoNotaPedidoCompraNacional($nro_pedido);
    echo "{'Ok':'$query'}";
}

function cambiarEstadoPedido() {
    $id = $_POST['id'];
    $nro_pedido = $_POST['nro_pedido'];
    $usuario = $_POST['usuario'];
    $estado = $_POST['estado'];
    $obs = $_POST['obs'];
    $fecha_prev = $_POST['fecha_prev'];
    $db = new My();
    $db->Query("UPDATE nota_ped_comp_det SET c_obs = '$obs',estado = '$estado' WHERE n_nro = $nro_pedido and id_det = $id;");

    $db->Query("INSERT INTO nota_ped_tracking(id_det,n_nro,usuario,fecha_hora,estado,obs,fecha_prev)values($id,$nro_pedido,'$usuario',current_timestamp,'$estado','$obs','$fecha_prev')");

    // Verificar estado de Nota 
    verificarEstadoNotaPedidoCompraNacional($nro_pedido);
    echo "Ok";
}

function crearReserva() {
    $cod_cli = $_POST['cod_cli'];
    $ruc = $_POST['ruc'];
    $cliente = $_POST['cliente'];
    $usuario = $_POST['usuario'];
    $suc = $_POST['suc'];
    $cat = $_POST['categoria'];

    $db = new My();
    $db->Query("INSERT INTO reservas(suc, usuario, fecha, vencimiento, cod_cli, ruc_cli, cliente,cat, valor_total_ref, minimo_senia_ref, senia_entrega_ref, estado)
    VALUES ( '$suc', '$usuario', current_date,DATE_ADD(current_date,INTERVAL 25 DAY)  , '$cod_cli', '$ruc', '$cliente',$cat,0,0,0, 'Abierta');");

    $db->Query("SELECT  nro_reserva AS NRO FROM reservas order by nro_reserva DESC LIMIT 1");
    $db->NextRecord();
    $nro = $db->Record['NRO'];
    echo $nro;
}

function liberarReserva() {
    $usuario = $_POST['usuario'];
    $nro_reserva = $_POST['nro_reserva'];


    $db = new My();
    $db->Query("UPDATE reservas SET estado = 'Liberada' WHERE nro_reserva = $nro_reserva");

    echo "Ok";
}

function buscarDatosDeCodigo() {
    require_once("Functions.class.php");
    $fn = new Functions();


    $code = trim($_POST['lote']);
    $suc = $_POST['suc'];
    $usuario = $_POST['usuario'];

    $cat = 1;
    $moneda = "G$";
    $um = "Mts";

    if (isset($_POST['categoria'])) {
        $cat = $_POST['categoria'];
    }
    if (isset($_POST['moneda'])) {
        $moneda = $_POST['moneda'];
    }


    $sql_lote = "SELECT l.codigo, b.barcode, l.lote,clase,descrip,um as um_prod,costo_prom, composicion,mnj_x_lotes,a.art_inv,gramaje,gramaje_m,l.ancho, tara,l.kg_desc, pantone, s.cantidad AS stock, s.cant_ent as cant_ini, l.img,s.suc,padre,s.ubicacion,CONCAT(l.cod_catalogo,'-',l.color_cod_fabric) AS color_cod_fabric,s.estado_venta   FROM articulos a INNER JOIN lotes l INNER JOIN stock s   
    ON a.codigo = l.codigo AND l.codigo = s.codigo AND l.lote = s.lote  LEFT  JOIN codigos_barras b ON a.codigo = b.codigo WHERE (a.codigo ='$code' OR b.barcode = '$code' OR  l.lote = '$code') AND suc like '$suc' LIMIT 1";
    $datos = $fn->getResultArray($sql_lote)[0];  // print_r($datos);
    $art_inv = 'true';
    if (!empty($datos)) {
        $pantone = $datos['pantone'];
        $sql_color = $fn->getResultArray("SELECT nombre_color AS color FROM pantone WHERE pantone = '$pantone' AND estado ='Activo'")[0];
        $color = $sql_color['color'];
        $datos['color'] = $color;
        $datos['existe'] = "true";
        $art_inv = $datos['art_inv'];
        $codigo = $datos['codigo'];
    } else { // No es manejado por lotes o no existe este lote buscar por Articulo y codigo de barras
        $sql_art = "SELECT a.codigo,clase,descrip,um,mnj_x_lotes, s.cantidad AS stock,a.art_inv, img,s.estado_venta,a.um AS um_prod,a.ancho,a.gramaje_prom AS gramaje,s.suc   FROM articulos a left JOIN stock s ON a.codigo = s.codigo  LEFT JOIN codigos_barras b ON a.codigo = b.codigo   WHERE (a.codigo ='$code' OR b.barcode = '$code') AND estado = 'Activo' LIMIT 1";
        $datos = $fn->getResultArray($sql_art)[0];
        //echo $sql_art;
        //print_r($datos);
        if (!empty($datos)) {
            $datos['existe'] = "true";
            $art_inv = $datos['art_inv'];
            $codigo = $datos['codigo'];
            if ($art_inv == 'false') {
                $datos['stock'] = 1000;
                $datos['estado_venta'] = "Normal";
            }
        } else {
            $datos['existe'] = "false";
        }
    }

    if ($datos['existe'] == "true") {

        $um_lista_precios = $fn->getResultArray("SELECT  DISTINCT um,precio FROM lista_prec_x_art WHERE codigo = '$codigo' AND moneda = '$moneda' and num = $cat");

        $um_prod = $datos['um_prod'];
        if (isset($_POST['um'])) {
            $um = $_POST['um'];
            if (!in_array($um, $um_lista_precios)) {
                $um = $um_prod;
            }
        } else {
            $um = $um_prod; //$um = Unidad de medida de Venta en este caso es igual a la del producto            
        }
        // Buscar Descuentos
        if ($datos['mnj_x_lotes'] === "Si") {
            $db = new My();
            $c = 0;
            foreach ($um_lista_precios as $arr) {
                $unidad_x = $arr['um'];
                $desc = "SELECT a.codigo,  IF( descuento IS NULL,0,descuento) AS descuento FROM articulos a LEFT JOIN desc_lotes d ON a.codigo = d.codigo    AND moneda = '$moneda' AND d.um = '$unidad_x' AND num = $cat AND lote = '$code' WHERE a.codigo = '$codigo'   ";
                $db->Query($desc);
                $db->NextRecord();
                $descuento = $db->Get('descuento');

                $arr['descuento'] = $descuento;
                $um_lista_precios[$c] = $arr;
                $c++;
            }
        }

        $datos['um_venta'] = $um;
        $datos['um_lista_precios'] = $um_lista_precios;  // Posibles unidades de medida para venta

        $sql_precios = "SELECT precio,IF(descuento IS NULL,0,descuento) AS descuento FROM lista_prec_x_art l  LEFT JOIN desc_lotes d ON l.codigo = d.codigo AND l.moneda = d.moneda AND l.um = d.um AND l.num = d.num and d.lote = '$code' WHERE l.codigo = '$codigo' AND l.num = $cat  AND l.moneda = '$moneda' AND l.um = '$um' ";
        if ($art_inv === "false" || $datos['mnj_x_lotes'] === "No") {
            $sql_precios = "SELECT precio,0 as descuento FROM lista_prec_x_art WHERE codigo = '$codigo' AND moneda = '$moneda' AND um = '$um' AND num = $cat;";
        }
        if($usuario == "douglas"){
          // echo $sql_precios;
        }

        $precios = $fn->getResultArray($sql_precios)[0];  //print_r($precios);
        if (sizeof($precios) > 0) {
            $datos['precio'] = $precios['precio'];
            $datos['descuento'] = $precios['descuento'];
        } else {
            $datos['precio'] = 0;
            $datos['descuento'] = 0;
        }

        echo json_encode($datos);
    } else {
        echo json_encode($datos);
    }
}

function buscarStockComprometido() {
    $lote = $_POST['lote'];
    $suc = $_POST['suc'];
    $incluir_reservas = "No"; // Reservas No por Defecto
    if(isset($_POST['incluir_reservas'])){
        $incluir_reservas = $_POST['incluir_reservas'];
    }
    $incluir_pedidos = "Si"; // Pedidos No por Defecto
    if(isset($_POST['incluir_pedidos'])){
        $incluir_pedidos = $_POST['incluir_pedidos'];
    }
    $incluir_orden_proc = "Si"; 
     if(isset($_POST['incluir_orden_proc'])){
        $incluir_orden_proc = $_POST['incluir_orden_proc'];
    }
    //Ventas
    $query = "SELECT 'Factura' as TipoDocumento ,f.f_nro AS Nro,usuario,DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha,suc,f.estado,cantidad FROM factura_venta f, fact_vent_det d WHERE f.f_nro = d.f_nro AND d.lote = '$lote' and f.suc = '$suc' AND f.estado <> 'Cerrada' union ";

    // Pendiente de remedicion
    $query .= "SELECT 'Remedir' as TipoDocumento, n.n_nro as Nro, d.verificado_por as usuario,DATE_FORMAT(n.fecha_cierre,'%d-%m-%Y') AS fecha,n.suc_d as suc,d.estado,d.cantidad as cantidad from nota_remision n inner join nota_rem_det d using(n_nro) where n.suc_d = '$suc' and d.lote = '$lote' and d.estado = 'FR' union ";

    //Agregar aqui los que estan en Remision Abierta o En Proceso 
    $query .= "SELECT 'NotaRemision' AS TipoDocumento ,n.n_nro AS Nro,usuario,DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha,suc,n.estado,cantidad FROM nota_remision  n, nota_rem_det d WHERE n.n_nro = d.n_nro AND d.lote = '$lote' AND n.suc = '$suc' AND n.estado != 'Cerrada' union ";

    $query .= "SELECT 'Emision Produccion' AS TipoDocumento ,e.nro_emis AS Nro,e.usuario,DATE_FORMAT(e.fecha,'%d-%m-%Y') AS  fecha,suc,e.estado,cant_lote AS cantidad FROM emis_produc e, emis_det d  WHERE e.nro_emis = d.nro_emis AND d.lote = '$lote' AND e.suc = '$suc' AND estado <> 'Cerrada'   ";
    
    if($incluir_pedidos == "Si"){
       $query .= "union SELECT 'Pedido' AS TipoDocumento ,p.n_nro AS Nro,usuario,DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha,suc,p.estado,d.cantidad FROM pedido_traslado p, pedido_tras_det d WHERE p.n_nro = d.n_nro AND d.lote = '$lote' AND p.suc_d = '$suc' AND p.estado <> 'Cerrada'";
    }
    
    if ($incluir_reservas == "Si") {
        $query .= "union SELECT 'Reserva' AS TipoDocumento ,r.nro_reserva AS Nro,usuario,DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha,suc,r.estado,cantidad FROM reservas r, reservas_det d WHERE r.nro_reserva = d.nro_reserva AND d.lote = '$lote' AND r.suc = '$suc' AND r.estado not in ('Cerrada','Liberada','Vencida','Retirada') ";
    }
    
    if ($incluir_orden_proc == "Si") {
        $query .= "union  SELECT 'Orden Procesamiento' AS TipoDocumento ,p.id_orden AS Nro,usuario,DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha,suc,p.estado,cantidad FROM orden_procesamiento p WHERE  p.lote = '$lote'  AND p.estado ='Pendiente' ";
    }
    
    echo json_encode(getResultArray($query));
}

/* @Deprecated cambiar por lo mismo en la Clase Articulos */

function buscarArticulos() {
    $articulo = $_POST['articulo'];
    $cat = $_POST['cat'];
    $limit = 20;
    if (isset($_POST['limit'])) {
        $limit = $_POST['limit'];
    } else {
        $limit = 20;
    }
    
    if (!isset($_POST['cat'])) {
        $cat = 1;
    }
    
    $filtro = "";
    if (isset($_POST['filtro'])) {
        $filtro = $_POST['filtro'];
    }
 
    $articulos = getResultArray("SELECT a.codigo  , a.descrip , s.descrip AS sector, a.um , costo_prom AS PrecioCosto, composicion, temporada, ligamento, combinacion, especificaciones, acabado, tipo, estetica, ancho , espesor, gramaje_prom , rendimiento, produc_ancho, produc_largo, produc_alto, produc_costo, mnj_x_lotes, estado,
    l.precio FROM articulos a INNER JOIN sectores s ON a.cod_sector = s.cod_sector LEFT JOIN lista_prec_x_art l ON a.codigo = l.codigo AND l.num = $cat AND l.moneda = 'G$' AND l.um = a.um
    WHERE art_venta = 'true' AND a.estado ='Activo' AND (a.codigo LIKE '$articulo%' OR a.descrip LIKE '$articulo%' ) $filtro LIMIT $limit");  // Agregar Estado
    echo json_encode($articulos);
}

function getPrecioPromedioCodigo() {
    $codigo = $_POST['codigo'];
    $AvgPrice = getResultArray("SELECT codigo AS ItemCode, costo_prom AS AvgPrice FROM articulos WHERE codigo = '$codigo' ");
    echo json_encode($AvgPrice);
}
 

function utf8_string($data) {
    if (gettype($data) === "string") {
        return utf8_encode($data);
    } else {
        return $data;
    }
}

function buscarLotesXColor() {
     
    $codigo = $_POST['codigo'];
    $color = $_POST['color'];
    $lotes = "SELECT l.lote,s.cantidad AS stock,s.estado_venta,s.suc FROM articulos a INNER JOIN lotes l ON a.codigo = l.codigo INNER JOIN pantone p ON l.pantone = p.pantone INNER JOIN stock s ON s.codigo = l.codigo AND s.lote = l.lote AND s.cantidad > 0 AND s.estado_venta <> 'FP'
    AND a.codigo = '$codigo' AND p.nombre_color LIKE '$color%' ORDER BY s.cantidad DESC";
    $db = new My();
    $db->Query($lotes);
    $hist = "<table border='1' style='border:1px solid gray;border-collapse: collapse;width:250px'>";
    $hist.="<tr class='titulo'><th>Lote</th><th>Stock</th><th>Estado Venta</th><th>Suc</th></tr>";
    while ($db->NextRecord()) {
        $Lote = $db->Record['lote'];
        $Stock = number_format($db->Record['stock'], 2, ',', '.');
        $Status = $db->Record['estado_venta'];
         
        $Suc = $db->Record['suc'];
        $hist.="<tr><td class='item'>$Lote</td><td class='num'>$Stock</td><td class='itemc'>$Status</td><td class='itemc'>$Suc</td></tr>";
    }
    $hist.="</table>";
    echo $hist;
}
/*
 * 
 */
function getHistorialPreciosArticulo() {

    $codigo = $_POST['codigo'];
    
    $sql = "SELECT  e.id_ent AS nro,proveedor, DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha,SUM(cantidad) AS cantidad,um,precio,moneda,cotiz   FROM entrada_merc e, entrada_det d WHERE e.id_ent = d.id_ent AND d.codigo = '$codigo' AND suc = '00' 
    AND cod_prov <> 'P000186' GROUP BY e.id_ent,codigo,precio,suc  ORDER BY nro DESC ";

    //echo "<1>".$sql."<br>";

    $db = new My();
    $db->Query($sql);
    $hist = "<table border='1' style='border:1px solid gray;border-collapse: collapse'>";
    $hist.="<tr><th colspan='8' style='color:red;font-weigth:bold'>Nota: Tener en cuenta que algunas entradas son por migracion de fracciones de compras reales </th></tr>";
    $hist.="<tr class='titulo'><th>N&deg;</th><th>Proveedor</th><th>Fecha</th><th title='Cantidad de Compra o Entrada directa'>Cantidad C./E.</th><th>UM</th><th>Precio</th><th>Moneda</th><th>Cotiz</th></tr>";
    while ($db->NextRecord()) {
        $DocEntry = $db->Record['nro'];
        $CardName = $db->Record['proveedor'];
        $DocDate = $db->Record['fecha'];
        $Quantity = number_format($db->Record['cantidad'], 2, ',', '.');
        $um = $db->Record['um'];
        $Price = number_format($db->Record['precio'], 2, ',', '.');
        $Currency = $db->Record['moneda'];
        $Rate = number_format($db->Record['cotiz'], 0, ',', '.');
        //$DocDate =  $ms->Record['DocDate']; 
        $hist.="<tr title='Entrada de Mercaderias'><td class='itemc'>$DocEntry</td><td class='item'>$CardName</td><td class='itemc'>$DocDate</td><td class='num'>$Quantity</td><td class='itemc'>$um</td><td class='num'>$Price</td><td class='itemc'>$Currency</td><td class='num'>$Rate</td></tr>";
    }
    
    $hist.="</table>";
    echo $hist;
}

function nuevoArticulo() {
    /*
    require_once("ConfigSAP.class.php");
    $c = new ConfigSAP();
    $vCmp = $c->connectToSAP();
    $oitm = $vCmp->GetBusinessObject(4);  // OITM 


    $oitm->ItemCode = "";
    $oitm->ItemName = "";
    // FechaNac
    $oitm->UserFields->Fields->Item("U_xxxxx")->Value = $fxxxxxx;

    $err = $vSN->add();

    if ($err == 0) {
        echo "true";
    } else {

        $lErrCode = 0;
        $sErrMsg = "";
        $vCmp->GetLastError($lErrCode, $sErrMsg);

        require_once("Log.class.php");
        $l = new Log();
        $l->error("Error al Registrar Cliente ErrCode: $lErrCode   ErrMsg: $sErrMsg");

        echo "false";
    }*/
}

function getHistorialTracking() {
    $id = $_POST['id'];
    $sql = "SELECT usuario, DATE_FORMAT( fecha_hora,'%d-%m-%Y %H:%i:%s')  AS fecha_hora, obs,DATE_FORMAT(fecha_prev,'%d-%m-%Y') AS fecha_prev,estado FROM nota_ped_tracking WHERE id_det = '$id'";
    $my = new My();
    $my->Query($sql);
    $hist = "<table border='1' style='border:1px solid gray;border-collapse: collapse;width:100%'>";
    if ($my->NumRows() > 0) {
        $hist.="<tr  style='font-size:11px;background-color: lightgray'><th colspan='6'> Historial de Modificaciones </th></tr>";
        $hist.="<tr class='titulo' style='font-size:11px'><th> * </th><th>Usuario</th><th>Fecha</th><th>Fecha Prevista</th><th>Obs</th><th>Estado</th></tr>";
        $i = 0;
        while ($my->NextRecord()) {
            $i++;
            $usuario = $my->Record['usuario'];
            $fecha_hora = $my->Record['fecha_hora'];
            $obs = $my->Record['obs'];
            $estado = $my->Record['estado'];
            $fecha_prev = $my->Record['fecha_prev'];
            $hist.="<tr><td class='itemc'>$i</td><td class='item'>$usuario</td><td class='itemc' style='width:140px'>$fecha_hora</td><td class='itemc'  style='width:110px'>$fecha_prev</td><td class='item'  style='width:300px'>$obs</td><td class='itemc'  style='width:140px'>$estado</td></tr>";
        }
    } else {
        $hist.="<tr  style='font-size:11px;background-color: white'><th colspan='6'>Sin historial</th></tr>";
    }
    $hist.="</table>";
    echo $hist;
}

function getAnchoGramajeTara($codigo, $lote) {
    $sql = "SELECT gramaje, ancho,tara  FROM lotes WHERE  codigo ='$codigo' AND lote = '$lote' limit 1 ";
    return getResultArray($sql)[0];
}

function registarAjuste() {
    $codigo = $_POST['codigo'];
    $lote = $_POST['lote'];
    $suc = $_POST['suc'];
    $stock = $_POST['stock'];
    $ajuste = $_POST['ajuste'];
    $final = $_POST['final'];
    $oper = $_POST['oper'];
    $signo = $_POST['signo'];
    $motivo = $_POST['motivo'];
    $um = $_POST['um'];
    $usuario = $_POST['usuario'];
    $e_sap = 0;
    if ($ajuste <= 0) {
        $e_sap = 1;
    }
    $db = new My();
    $db->Begin();
    try {

        $db->Query("SELECT  costo_prom, mnj_x_lotes,ancho,gramaje_prom FROM articulos WHERE codigo = '$codigo' ");

        $db->NextRecord();
        $precio_costo = $db->Record['costo_prom'];
        $mnj_x_lotes = $db->Record['mnj_x_lotes'];
        $gramaje = $db->Record['gramaje_prom'];
        $ancho = $db->Record['ancho'];
        $tara = 0;

        if ($precio_costo == null) {
            $precio_costo = 1;
        }

        $valor_ajuste = $ajuste * $precio_costo;

        $db->Query("SELECT d.n_nro FROM nota_remision r INNER JOIN nota_rem_det d USING(n_nro) where r.estado <> 'Cerrada' and d.lote = '$lote'");
        if ($db->NumRows() > 0) {
            $db->NextRecord();
            $array = Array('estado' => 'Error', 'info' => "No se puede ajustar, en remision Nro.: " . $db->Record['n_nro']);
        } else {

            if ($mnj_x_lotes === "Si") {
                $arr_datos = getAnchoGramajeTara($codigo, $lote);
                $gramaje = $arr_datos['gramaje'];
                $ancho = $arr_datos['ancho'];
                $tara = $arr_datos['tara'];
            }

            $db->Query("SELECT tipo_ent,nro_identif,linea  FROM stock WHERE  codigo ='$codigo' AND lote = '$lote' AND   suc = '$suc'");

            if ($db->NextRecord()) {
                $tipo_ent = $db->Record['tipo_ent'];
                $nro_identif = $db->Record['nro_identif'];
                $linea = $db->Record['linea'];

                $db->autocommit(FALSE);


                $db->Query("INSERT INTO ajustes( usuario,f_nro, codigo, lote, tipo,signo, inicial, ajuste, final, motivo, fecha, hora, um, estado,suc,p_costo,valor_ajuste, e_sap)
                        VALUES ('$usuario',0, '$codigo', '$lote', '$oper','$signo',$stock,$ajuste, $final, '$motivo', CURRENT_DATE, CURRENT_TIME, '$um', 'Pendiente','$suc',$precio_costo,$valor_ajuste,$e_sap);");

                $db->Query("SELECT id_ajuste FROM ajustes WHERE usuario = '$usuario' AND codigo = '$codigo' AND lote = '$lote' ORDER BY id_ajuste DESC LIMIT 1");
                $db->NextRecord();
                $id_ajuste = $db->Get("id_ajuste");

                if ($signo === "+") {
                    $db->Query("UPDATE stock SET cantidad = cantidad + $ajuste WHERE codigo ='$codigo' AND lote = '$lote' AND   suc = '$suc'");

                    $db->Query("INSERT INTO historial( suc, codigo, lote, tipo_ent, nro_identif, linea, fecha_hora, usuario, direccion, cantidad,tipo_doc, nro_doc,gramaje,ancho,tara)                        
                    VALUES (  '$suc', '$codigo', '$lote', '$tipo_ent', $nro_identif,$linea, current_timestamp, '$usuario', 'E', $ajuste,'AJ',$id_ajuste,$gramaje,$ancho,$tara);");
                } else {
                    $db->Query("UPDATE stock SET cantidad = cantidad - $ajuste WHERE codigo ='$codigo' AND lote = '$lote' AND   suc = '$suc'");
                    $salida = $ajuste * -1;
                    $db->Query("INSERT INTO historial( suc, codigo, lote, tipo_ent, nro_identif, linea, fecha_hora, usuario, direccion, cantidad,tipo_doc, nro_doc,gramaje,ancho,tara)                        
                    VALUES (  '$suc', '$codigo', '$lote', '$tipo_ent', $nro_identif,$linea, current_timestamp, '$usuario', 'S', $salida,'AJ',$id_ajuste,$gramaje,$ancho,$tara);");
                }
                $db->Commit();
                actualizarPendienteControl($codigo, $lote, $suc, $usuario);

                makeLog("$usuario", "Ajuste$signo", "$oper | $motivo", 'Ajuste', 0);
                $array = Array('estado' => 'Ok');
            } else {
                $array = Array('estado' => 'Error', 'info' => "No existe Codigo: $codigo, lote $lote");
            }
        }
    } catch (Exception $e) {
        $array = Array('estado' => 'Error', 'info' => $e->getMessage());
        $db->Rollback();
    }
    echo json_encode($array);
}

function generarSolicitudTraslado() {
     echo "Movido a SolicitudTrasladoMobile.class.php";
    die();
    $suc = $_POST['suc'];
    $sucd = $_POST['sucd'];
    $usuario = $_POST['usuario'];
    $cat = 1;
    $cod_cli = '';
    $cliente = '';
    $tipo = ucfirst($_POST['tipo']);

    if (isset($_POST['cod_cli'])) {
        $cod_cli = $_POST['cod_cli'];
        $cliente = $_POST['cliente'];
    }
    if (isset($_POST['cat'])) {
        $cat = $_POST['cat'];
    }

    $sql = "INSERT INTO pedido_traslado(cod_cli, cliente, usuario, fecha, hora, total, estado, suc, suc_d, fecha_cierre, hora_cierre, e_sap,cat,tipo)
    VALUES ( '$cod_cli', '$cliente', '$usuario', CURRENT_DATE, CURRENT_TIME, 0, 'Abierta', '$suc', '$sucd', NULL, NULL, 0,$cat,'$tipo');";
    $my = new My();
    $my->Query($sql);
    $ultima = "SELECT n_nro as Nro,usuario as Usuario,date_format(fecha,'%d-%m-%Y') as Fecha,cod_cli, cliente,estado as Estado,suc as Origen,suc_d as Destino FROM pedido_traslado  WHERE usuario = '$usuario' and suc = '$suc' ORDER BY n_nro DESC LIMIT 1";
    echo json_encode(getResultArray($ultima));
}

function addLoteSolicitudTraslado() {
    
    echo "Movido a SolicitudTrasladoMobile.class.php";
    die();
     
}

function borrarLoteDeSolicitudTraslado() {
    $db = new My();
    $nro = $_POST['nro_nota'];
    $lote = $_POST['lote'];
    $db->Query("DELETE FROM pedido_tras_det WHERE n_nro = $nro AND lote = '$lote'");
    echo "Ok";
}

function cambiarEstadoSolicitudTraslado() {
    
    $db = new My();
    $dba = new My();
    $nro = $_POST['nro'];
    $usuario = $_POST['usuario'];
    $estado = $_POST['estado'];
    $db->Query("UPDATE pedido_traslado SET estado = '$estado',fecha_cierre = current_date, hora_cierre = current_time WHERE n_nro = $nro");
    
    //makeLog($usuario, $accion, $data, $tipo, $doc_num)

    $db->Query("SELECT estado,suc_d FROM pedido_traslado WHERE n_nro = $nro");
    $db->NextRecord();
     
    $suc_d = $db->Get('suc_d');
    
    if ($estado == "Pendiente") { 
        $db->Query("UPDATE pedido_tras_det d, reg_ubic r  SET d.ubic = CONCAT(nombre,'-',fila,'-',col) ,d.nodo =  CONCAT(nombre,r.col), pallet = nro_pallet   WHERE d.codigo = r.codigo AND r.lote = d.lote AND r.suc = '$suc_d' AND  n_nro = $nro");         
    }
    makeLog($usuario, "MODIFICAR", "Cambio estado de Solicitud a $estado", 'Solicitud Traslado', $nro);
    
    echo "Ok";
}

/**
 * 
 * @todo: Verificar si el Lote de Remplazo no esta en alguna otra nota de Remision Abierta o en proceso de envio.
 */
function agregarCodigoRemplazoSolicitud() {
    $db = new My();
    $lote = $_POST['lote'];
    $lote_rem = $_POST['lote_rem'];
    $nro = $_POST['nro'];
    $usuario = $_POST['usuario'];
    $suc = $_POST['suc'];

    $result = array();
    
    if ($lote_rem == "") {
        $db->Query("UPDATE pedido_tras_det SET lote_rem = '$lote_rem',rem_stock = 0 WHERE n_nro = $nro AND lote = '$lote';");
        $result['estado'] = "Ok";  
        $result['fab_color_cod'] = "";  
        $result['stockRemp'] = ""; 
        echo json_encode($result);         
        return;
    }

    /**
     *  @todo: Verificar si el Lote de Remplazo no esta en alguna otra nota de Remision Abierta o en proceso de envio.
     */
    $lote_to_check = $lote;
    if ($lote_rem != "") {
        $lote_to_check = $lote_rem;
    }
    $rem = "SELECT r.n_nro AS nro, DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha, CONCAT( r.suc,'-->',r.suc_d) AS direccion, r.estado FROM nota_remision r, nota_rem_det d WHERE r.n_nro = d.n_nro AND lote = '$lote_to_check' AND r.estado <> 'Cerrada' ";
    $db->Query($rem);
    if ($db->NumRows() > 0) {
        $db->NextRecord();
        $nro = $db->Record['nro'];
        $fecha = $db->Record['fecha'];
        $direccion = $db->Record['direccion'];
        $estado = $db->Record['estado'];
        $result['estado'] = "Error: Lote en un Remision: $estado de:  $direccion   Fecha: $fecha";   
    } else { 
        // Controlar si el Lote es correcto 
        $my = new My();

        // Buscar Primero datos del Codigo de Remplazo
        $my->Query("SELECT a.codigo,a.descrip, l.pantone,CONCAT(l.cod_catalogo,'-',l.color_cod_fabric) AS fab_color_cod, s.cantidad AS stock  FROM  articulos a, lotes l, stock s 
        WHERE a.codigo = l.codigo AND l.codigo = s.codigo AND l.lote = s.lote AND l.lote ='$lote_rem'   AND s.suc = '$suc'");
        
        if ($my->NumRows() > 0) {
            $my->NextRecord();
            $codigoR = $my->Record['codigo']; 
            $descripR = $my->Record['descrip'];
            $pantoneR = $my->Record['pantone'];
            $fab_color_codR = $my->Record['fab_color_cod'];
            $stockR = $my->Record['stock'];

            $encontro = false;
            $my->Query("SELECT a.codigo,a.descrip, l.pantone,CONCAT(l.cod_catalogo,'-',l.color_cod_fabric) AS fab_color_cod, s.cantidad AS stock  FROM  articulos a, lotes l, stock s 
            WHERE a.codigo = l.codigo AND l.codigo = s.codigo AND l.lote = s.lote AND l.lote ='$lote'   AND s.suc = '$suc';");
            while ($my->NextRecord()) {
                $codigo = $my->Record['codigo']; 
                $descrip = $my->Record['descrip'];
                $pantone = $my->Record['pantone'];
                $fab_color_cod = $my->Record['fab_color_cod'];
                $stock = $my->Record['stock'];
                
                if ( $codigoR !=  $codigo) {
                    $result['estado'] = "Error: Articulos diferentes, Lote $lote: $descrip  Remplazo $lote_rem: $descripR";  
                    echo json_encode($result);
                } else {
                    if ($pantoneR != $pantone) { 
                        $result['estado'] = "Error: Colores no coinciden...";  
                        echo json_encode($result);
                    } else {
                        $db->Query("UPDATE pedido_tras_det SET lote_rem = '$lote_rem',rem_stock = $stockR WHERE n_nro = $nro AND lote = '$lote';");
                         
                        echo json_encode(array("estado"=>"Ok","fab_color_cod"=>$fab_color_codR,"stockRemp"=>$stockR)); 
                    }
                }
                
            }
        } else {
            echo json_encode(array("estado"=>"Error: Lote no existe...")); 
        }
    }
}

function getRemitosAbiertos() {
    $suc = $_POST['suc'];
    $suc_d = $_POST['suc_d'];
    $tipo = $_POST['tipo'];

    if (!isset($_POST['tipo'])) {
        $filtro_tipo = "";
    } else {
        if ($tipo == "tejidos") {
            $filtro_tipo = "HAVING tejidos > 0  OR items = 0 ";
        } else {
            $filtro_tipo = "HAVING insumos > 0  OR items = 0 ";
        }
    }

    $db = new My();

    $db->Query("SELECT n.n_nro,suc,suc_d,DATE_FORMAT(n.fecha,'%d-%m-%Y') AS fecha, usuario, COUNT(d.lote) AS items,  SUM(  IF(d.codigo   LIKE 'IN%',1,0)   ) AS insumos, SUM(IF(d.codigo NOT LIKE 'IN%',1,0)) AS tejidos, n.obs FROM nota_remision n left JOIN nota_rem_det d ON n.n_nro = d.n_nro  WHERE  suc = '$suc' and suc_d = '$suc_d' AND n.estado = 'Abierta'   GROUP BY n.n_nro $filtro_tipo");

    echo"<table border='1' style='border:1px solid gray;border-collapse: collapse;background: white; width:580px'> 
        <tr><th colspan='6'>Remisiones Abiertas</th></tr>
        <tr class='titulo'><th>N&deg;</th><th>Origen</th><th>Fecha</th><th>Usuario</th><th>Obs</th><th>Lotes</th><th>&nbsp;</th></tr>";

    while ($db->NextRecord()) {
        $nro = $db->Record['n_nro'];
        $origen = $db->Record['suc'];
        $destino = $db->Record['suc_d'];
        $fecha = $db->Record['fecha'];
        $usuario = $db->Record['usuario'];
        $items = $db->Record['items'];
        $obs = $db->Record['obs'];
        if ($nro != null) {
            echo "<tr><td class='itemc'>$nro</td><td  class='itemc'>$origen &rarr; $destino</td><td  class='itemc'>$fecha</td><td  class='itemc'>$usuario</td><td  class='item'>$obs</td><td class='itemc items_$nro'>$items</td>"
            . "<td class='itemc btn_$nro'><input type='button' class='insertar' value='Insertar aqu&iacute;' onclick='insertarAqui($nro)' style='height: 24px;font-size: 10px;font-weight: bold' ></td>"
            . "</tr>";
        } else {
            echo "<tr><td class='itemc' colspan='7'>No hay remisiones Abiertas a $suc_d</td></tr>";
        }
    }



    echo "<tr style='border-width:1 0 1 1'><td class='itemc' ><img src='../img/arrow-up.png' onclick='minimizar()' title='Minimizar' style='cursor:pointer'></td> "
    . " <td class='itemc' colspan='6'><label>Obs:</label> <input type='text' id='rem_obs' value='' size='30'> <input type='button' value='Generar Nota Remision de: $suc a $suc_d' onclick=generarRemito('$suc','$suc_d')></td></tr>";

    echo "</table>";
}

function getRemitosAbiertosJSON() {
    $suc = $_POST['suc'];
    $suc_d = $_POST['suc_d'];
    $n_nro = $_POST['n_nro'];
    $remisiones = array();
    $db = new My();

    $db->Query("SELECT n.n_nro,suc,suc_d,DATE_FORMAT(n.fecha,'%d-%m-%Y') AS fecha, usuario, COUNT(d.lote) AS items FROM nota_remision n left JOIN nota_rem_det d ON n.n_nro = d.n_nro  WHERE  suc = '$suc' and suc_d = '$suc_d' AND n.estado = 'Abierta' and n.n_nro <> '$n_nro'  AND d.codigo NOT LIKE 'IN%' GROUP BY n.n_nro");

    while ($db->NextRecord()) {
        array_push($remisiones, $db->Record);
    }
    echo json_encode($remisiones);
}

// Genra una nueva remision e inserta en ella los codigos no pesados
function insertarEnRemision() {
    $usuario = $_POST['usuario'];
    $suc = $_POST['suc'];
    $suc_d = $_POST['suc_d'];
    $n_nro_origen = $_POST['n_nro'];
    $respuesta = array();
    $db = new My();

    $db->Query("SELECT group_concat(lote) as lotes_cods, count(*) as lotes FROM nota_rem_det WHERE n_nro=$n_nro_origen and procesado = 0");
    $db->NextRecord();

    if ($nro = (int) $db->Record['lotes'] > 0) {// verificar piezas sin pesar
        $lotes = $db->Record['lotes_cods'];
        if (isset($_POST['generar'])) {// generar nueva remision e insertal los lotes no pesados
            // Generar
            $db->Query("INSERT INTO nota_remision( fecha, hora, usuario, recepcionista, suc, suc_d, fecha_cierre, hora_cierre, obs, estado, e_sap)
                        VALUES ( CURRENT_DATE, CURRENT_TIME, '$usuario', '', '$suc', '$suc_d', '', '', '', 'Abierta', 0);");
            if ($db->AffectedRows() > 0) {
                // Obtener nro
                $db->Query("SELECT n_nro FROM nota_remision WHERE suc = '$suc' and suc_d = '$suc_d' and usuario='$usuario' and estado='Abierta' ORDER BY n_nro DESC limit 1");
                if ($db->NumRows() > 0) {
                    $db->NextRecord();
                    $nro = $db->Record['n_nro'];
                    // Mover
                    $db->Query("UPDATE nota_rem_det set n_nro = $nro WHERE n_nro=$n_nro_origen and procesado = 0");
                    if ($db->AffectedRows() > 0) {
                        $respuesta['msj'] = "Se realizaron los cambios correctamente";
                        $respuesta['lotes'] = explode(',', trim($lotes, ','));
                        $respuesta['n_nro'] = $nro;
                        $db->Query("INSERT INTO logs(usuario, fecha, hora, accion,tipo,doc_num, DATA) VALUES ('$usuario', current_date, current_time, 'Mover lotes','Remision_det', '$n_nro_origen','suc:$suc suc_d:$suc_d Lotes: $lotes');");
                    } else {
                        $respuesta['error'] = "Fue imposible realizar los cambios, verifique que la remision tiene piezas no pesadas";
                    }
                } else {
                    $respuesta['error'] = "No se pudo obtener el nuevo nro de remision";
                }
            } else {
                $respuesta['error'] = "No se pudo generar una nueva remision";
            }
        } else {
            if ($nro = $_POST['rem_destino']) {
                // Mover
                $db->Query("UPDATE nota_rem_det set n_nro = $nro WHERE n_nro=$n_nro_origen and procesado = 0");
                if ($db->AffectedRows() > 0) {
                    $respuesta['msj'] = "Se realizaron los cambios correctamente";
                    $respuesta['lotes'] = explode(',', trim($lotes, ','));
                    $respuesta['n_nro'] = $nro;
                } else {
                    $respuesta['error'] = "Ocurrio un error, no se movieron las piezas";
                }
            } else {
                $respuesta['error'] = "No se recibio el numero de remision destino";
            }
        }
    } else {
        $respuesta['error'] = "No se encontraron piezas sin pesar en esta remision";
    }
    echo json_encode($respuesta);
}


function verificarLoteEnRemito($n_nro, $lote) {
    $db = new My();
    $db->Query("SELECT COUNT(*) AS cant FROM nota_rem_det WHERE n_nro = $n_nro AND lote = '$lote'");
    $db->NextRecord();
    $cant = $db->Record['cant'];
    return $cant;
}

 

function cancelarPagoFactura() {
    $factura = $_POST['factura'];
    $nro_pago = $_POST['nro_pago'];
    $usuario = $_POST['usuario'];
    $db = new My();
    $db->Query("select count(*) as cant from pagos_cancelados where id_pago = $nro_pago");
    $db->NextRecord();
    $cant = $db->Record['cant'];
    if ($cant < 1) {
        $ins = "INSERT INTO pagos_cancelados ( usuario, f_nro, id_pago, fecha_hora,e_sap)VALUES('$usuario', $factura, $nro_pago, CURRENT_TIMESTAMP,0);";

        $db->Query($ins);
    }
    echo "Ok";
}

/**
 * Nota de pedido de traslado
 */
function cambiarEstadoNotaPedido() {
    $targets = json_decode($_POST['targets'], true);
    $estado = $_POST['estado'];
    $razon = $_POST['razon'];
    $link = new My();
    foreach ($targets as $key => $value) {
        $link->Query("UPDATE pedido_tras_det set estado = '$estado', obs = CONCAT(obs,'$razon') WHERE n_nro=$key and lote=$value");
    }
    $link->Close();
    echo '{"msj":"Ok"}';
}

function agregarDetalleRemito() {
    $nro_remito = $_POST['nro_remito'];
    $codigo = $_POST['codigo'];
    $lote = $_POST['lote'];
    $um = $_POST['um'];
    $ancho = $_POST['ancho'];
    $gramaje = $_POST['gramaje'];
    $cantidad = $_POST['cantidad'];
    $cant_inicial = $_POST['cant_inicial'];
    $U_kg_desc = round($_POST['U_kg_desc'], 3);
    $usuario = $_REQUEST['usuario'];

    $descrip = $_POST['descrip'];
    $kg_env = $_POST['kg_env'];
    $tara = $_POST['tara'];
    $cant_calc = $_POST['cant_calc'];

    $tipo_control_ch = (verifRollo($lote, $codigo)) ? 'Rollo' : 'Pieza';

    $my = new My();
    $control = verificarLoteEnRemito($nro_remito, $lote);

    $datos = array();

    if ($control > 0) {
        $datos["Mensaje"] = "Codigo Duplicado";
    } else {
        $remEstado = remAbierta($nro_remito);
        if ($remEstado == 'Abierta') {
            $my->Query("insert into nota_rem_det( n_nro, codigo, lote, um_prod, descrip, cantidad,cant_inicial,gramaje,ancho, kg_env, kg_rec, cant_calc_env, cant_calc_rec, tara, procesado,tipo_control,kg_desc, estado, e_sap, usuario_ins,fecha_ins)
            values ($nro_remito, '$codigo', '$lote', '$um', '$descrip', $cantidad,$cant_inicial,$gramaje,$ancho,$kg_env, 0, $cant_calc, 0, $tara,0,'$tipo_control_ch',$U_kg_desc, 'Pendiente', 0,'$usuario',CURRENT_TIMESTAMP);");
            $last_id = mysqli_insert_id($my->Link_ID);
            $datos["Mensaje"] = "Ok";
            $datos["id_det"] = $last_id;
        } else {
            $datos["Mensaje"] = "Remision $nro_remito, esta $remEstado";
        }
    }
    echo json_encode($datos);
}
/**
 * @param int $lote 
 * @param String $codigo
 */
function verifRollo($lote, $codigo) {   
     
    $db = new My();
    $my = new My();
    $fracciones = 0;
    $ventas = 0;
    $esRollo = true;

    $db->Query("SELECT  padre,um_prod as UM from lotes where codigo  = '$codigo' and lote =  '$lote'");
    $db->NextRecord();
    if (trim($db->Record['padre']) !== '' || trim($db->Record['UM']) == 'Unid') {  
        $esRollo = false;
    } else {  
        $db->Query("SELECT count(*) as fracciones from fraccionamientos   where codigo = '$codigo' and  padre =  '$lote'");
        $db->NextRecord();
        $fracciones = (int) $db->Record['fracciones'];
        $db->Close();

        if ($fracciones > 0) {
            $esRollo = false;
        } else {
            $my->Query("SELECT count(*) as ventas from factura_venta f inner join fact_vent_det d using(f_nro) where codigo = '$codigo' and lote =  '$lote' and f.estado='Cerrada'");
            $my->NextRecord();
            $ventas = (int) $my->Record['ventas'];
            $my->Close();

            if ($ventas > 0) {
                $esRollo = false;
            }
        }
    }
    return $esRollo;
}
function remAbierta($n_nro) {
    $my = new My();
    $estado = '';
    $my->Query("SELECT estado FROM nota_remision WHERE n_nro = $n_nro");
    if ($my->NextRecord()) {
        $estado = $my->Record['estado'];
    }
    $my->Close();
    return $estado;
}

 
function controlarLotesEnRemitos() {
    $origen = $_REQUEST['origen'];
    $destino = $_REQUEST['destino'];
    $codigo = $_REQUEST['codigo'];
    $lote = $_REQUEST['lote'];
    $remplazo = $_REQUEST['remplazo'];
    $sql = "SELECT r.n_nro as nro,date_format(fecha,'%d-%m-%Y') as fecha, suc_d AS destino from nota_remision r, nota_rem_det d where r.n_nro = d.n_nro and r.estado != 'Cerrada' and r.suc = '$origen' and r.suc_d = '$destino' and d.codigo = '$codigo' and (lote = '$lote' or lote = '$remplazo')";

    $db = new My();
    $db->Query($sql);

    if ($db->NumRows() > 0) {
        $db->NextRecord();
        $nro = $db->Record['nro'];
        $fecha = $db->Record['fecha'];
        $destino = $db->Record['destino'];
        $array = Array('estado' => 'En Remision', 'info' => "En Remision Nro: $nro, Fecha: $fecha Destino: $destino");
    } else {

        $sql = "SELECT r.f_nro AS nro,DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha, suc AS destino FROM factura_venta r, fact_vent_det d 
        WHERE r.f_nro = d.f_nro AND r.estado != 'Cerrada' AND r.suc = '$origen' AND d.codigo = '$codigo' AND (lote = '$lote' OR lote = '$remplazo')";
        $db->Query($sql);
        if ($db->NumRows() > 0) {
            $db->NextRecord();
            $nro = $db->Record['nro'];
            $fecha = $db->Record['fecha'];
            $suc = $db->Record['suc'];
            $array = Array('estado' => 'En Factura', 'info' => "En Factura Nro: $nro, Fecha: $fecha Suc: $suc");
        } else {
            $sql = "SELECT COUNT(*) AS frac FROM orden_procesamiento WHERE estado = 'Pendiente' AND (lote = '$lote' OR lote = '$remplazo')";
            $db->Query($sql);
            $db->NextRecord();
            $frc = $db->Record['frac'];
            if ((int) $frc > 0) {
                $array = Array('estado' => 'En Reserva', 'info' => "");
            } else {
                $array = Array('estado' => 'Libre', 'info' => "$frc");
            }
        }
    }
    echo json_encode($array);
}

function generarRemito() {
    $usuario = $_POST['usuario'];
    $suc = $_POST['origen'];
    $suc_d = $_POST['destino'];
    $obs = $_POST['obs'];
    $db = new My();
    $db->Query("INSERT INTO nota_remision( fecha, hora, usuario, recepcionista, suc, suc_d, fecha_cierre, hora_cierre, obs, estado, e_sap)
                VALUES ( CURRENT_DATE, CURRENT_TIME, '$usuario', null, '$suc', '$suc_d', null, '', '$obs', 'Abierta', 0);");

    $db->Query("SELECT n_nro FROM nota_remision WHERE suc = '$suc' and suc_d = '$suc_d' and usuario = '$usuario' ORDER BY n_nro DESC limit 1");
    $db->NextRecord();
    $nro = $db->Record['n_nro'];
    echo $nro;
}

function borrarDetalleRemito() {
    require_once("Functions.class.php");
    $id_det = $_POST['id_det'];
    $usuario = $_POST['usuario'];
    $db = new My();
    //$db->Query("DELETE FROM nota_rem_det WHERE n_nro = $nro_remito AND codigo = '$codigo' AND lote = '$lote';");

    $check = " SELECT n_nro, IF(paquete IS NULL,0,1) as punteado, lote FROM nota_rem_det WHERE    id_det = $id_det ";
    $db->Query($check);
    $db->NextRecord();
    $punteado = $db->Record['punteado'];
    $lote = $db->Record['lote'];
    $nro_remito = $db->Record['n_nro'];
    $estado = "Ok";
    $mensaje = "";

    $f = new Functions();
    $permiso = $f->chequearPermiso("8.1.2", $usuario);

    if ($punteado < 1 || $permiso != "---") {
        $db->Query("DELETE FROM nota_rem_det WHERE id_det=$id_det");
        makeLog($usuario, "Eliminar", "Borrar lote $lote de detalle de Nota de Remision Nro: $nro_remito", "NotaRemision", $nro_remito);
    } else {
        $estado = "Error";
        $mensaje = "Este paquete ya ha sido punteado no se puede eliminar";
    }
    $array = Array('estado' => $estado, "mensaje" => $mensaje);
    echo json_encode($array);
}

function actualizarDatosDeRemision() {
    $usuario = $_POST['usuario'];
    $nro_remito = $_POST['nro_remito'];
    $codigo = $_POST['codigo'];
    $lote = $_POST['lote'];
    $cant_calc = $_POST['cant_calc'];
    $kg_env = $_POST['kg_env'];
    $tipo_control = $_POST['tipo'];
    $paquete = 1;
    if (isset($_POST['paquete'])) {
        $paquete = $_POST['paquete'];
    }
    $db = new My();
    $db->Query("UPDATE nota_rem_det SET  kg_env = $kg_env, cant_calc_env = $cant_calc, tipo_control='$tipo_control',paquete = $paquete , procesado = 1 WHERE n_nro = $nro_remito AND codigo = '$codigo' AND lote = '$lote';");

    makeLog($usuario, "Actualizar", "kg_env:$kg_env, cant_calc_env:$cant_calc, tipo_control:$tipo_control, Lote:$lote,  paquete:$paquete", "NotaRemision", $nro_remito);

    echo "Ok";
}

function actualizarKgDescRemision() {
    $usuario = $_POST['usuario'];
    $nro_remito = $_POST['nro_remito'];
    $codigo = $_POST['codigo'];
    $lote = $_POST['lote'];
    $kg = $_POST['kg_env'];
    $suc = $_POST['suc'];
    $db = new My();

    $sql = "INSERT INTO edicion_lotes( usuario, codigo, lote, descrip, fecha, hora, suc, kg, e_sap)VALUES ( '$usuario', '$codigo', '$lote', '$descrip', CURRENT_DATE, CURRENT_TIME, '$suc', $kg, 0);";
    $db->Query($sql);

    $db->Query("UPDATE nota_rem_det SET  kg_desc = $kg  WHERE n_nro = $nro_remito AND codigo = '$codigo' AND lote = '$lote';");

    
    echo "Ok";
}

function recibirLoteNotaRemision() {
    $usuario = $_POST['usuario'];
    $nro_remito = $_POST['nro_remito'];
    $codigo = $_POST['codigo'];
    $lote = $_POST['lote'];
    $cant_calc = $_POST['cant_calc'];
    $kg_env = $_POST['kg_env'];
    $db = new My();
    $db->Query("UPDATE nota_rem_det SET  kg_rec = $kg_env, cant_calc_rec = $cant_calc WHERE n_nro = $nro_remito AND codigo = '$codigo' AND lote = '$lote';");
    echo "Ok";
}

function guardarObservacionNotaRemision() {
    $nro_remito = $_POST['nro_remito'];
    $obs = $_POST['obs'];
    $db = new My();
    $db->Query("UPDATE nota_remision SET  obs = '$obs'  WHERE n_nro = $nro_remito ;");
    echo "Ok";
}

/* Ponde de Abierta a En Proceso para que se pueda Recibir Verifica si un codigo no esta en otro remito de esta sucursal */

function finalizarNotaRemision() {
    $nro_remito = $_POST['nro_remito'];
    $suc = $_POST['suc'];
    $usuario = $_POST['usuario'];
    $suc_d = "";
    $rem_errores = false;

    $db = new My();
    $db2 = new My();
    $db->Query("UPDATE nota_remision SET estado = 'Procesando'  WHERE n_nro = $nro_remito");
    $array = Array('estado' => 'Ok');

    $codigos_con_problemas = controlarStockXRemision($nro_remito);

    if ($codigos_con_problemas == "") { // No hay problema
        $db->Query("select codigo,lote,r.estado,suc_d from nota_remision r, nota_rem_det d where r.n_nro = d.n_nro and r.suc = '$suc' and r.n_nro = $nro_remito and r.estado != 'Cerrada'");
        while ($db->NextRecord()) {
            $codigo = $db->Record['codigo'];
            $lote = $db->Record['lote'];
            $suc_d = $db->Record['suc_d'];

            $db2->Query("SELECT  CONCAT('En remision Nro:',r.n_nro ,' Estado: ', r.estado,'  ',suc,'=>',suc_d) AS estado  FROM nota_remision r, nota_rem_det d WHERE r.n_nro = d.n_nro AND r.suc = '$suc' AND r.n_nro != $nro_remito AND r.estado != 'Cerrada' AND d.codigo = '$codigo' AND d.lote = '$lote'");
            if ($db2->NumRows() > 0) {
                $codigos_con_problemas.= $db2->Record['estado'];
            }
        }

        if ($codigos_con_problemas != "") {
            $array = Array('estado' => 'Problema', 'lotes' => $codigos_con_problemas);
        } else {
            $lotes == null;

            // No controlar para Origen 00 --> 03
            if ($suc == "00" && $suc_d == "03") {
                $porc_tolerancia_remsiones = 100;
            } else {
                $db->Query("select valor from parametros where clave = 'porc_tolerancia_remsiones'");
                $db->NextRecord();
                $porc_tolerancia_remsiones = $db->Record['valor'];
                $db->Query("SELECT GROUP_CONCAT(lote) AS lotes  FROM nota_rem_det WHERE (( cant_calc_env BETWEEN (cantidad - (cantidad * $porc_tolerancia_remsiones / 100)) AND (cantidad + (cantidad * $porc_tolerancia_remsiones / 100)) < 1 and tipo_control ='Pieza' ) OR (kg_desc BETWEEN (kg_env - (kg_env * $porc_tolerancia_remsiones / 100)) AND (kg_env + (kg_env * $porc_tolerancia_remsiones / 100)) < 1 AND  tipo_control ='Rollo')) AND  n_nro = $nro_remito");

                $db->NextRecord();
                $lotes = $db->Record['lotes'];
            }
            //$db->Query("SELECT GROUP_CONCAT(lote) AS lotes  FROM nota_rem_det WHERE   cant_calc_env BETWEEN (cantidad - (cantidad * $porc_tolerancia_remsiones / 100)) AND (cantidad + (cantidad * $porc_tolerancia_remsiones / 100)) < 1 AND  n_nro = $nro_remito");



            if ($lotes == null) {
                // Dejar registro de Fecha y hora de salida del cuadrante // Actualizar Ubicacion de estos Productos
                 
                $my = new My();
                $db2->Query("SELECT codigo,lote from  nota_rem_det where n_nro = $nro_remito");
                while ($db2->NextRecord()) {
                    $codigo = $db2->Record['codigo'];
                    $lote = $db2->Record['lote'];
                    $update = "UPDATE stock SET ubicacion = '' WHERE codigo = '$codigo' and lote = '$lote' and suc = '$suc'";
                    $my->Query($update);
                    $salida = "UPDATE  reg_ubic SET estado = 'Inactivo', fecha_salida = current_timestamp, usuario_salida = '$usuario' WHERE  codigo = '$codigo' and lote = '$lote' and suc = '$suc'";
                    $my->Query($salida);
                }

                $array = Array('estado' => 'Ok');
                $db->Query("UPDATE nota_remision SET estado = 'En Proceso'  WHERE n_nro = $nro_remito");

                if ($suc == '00') {
                    $db->Query("UPDATE nota_ped_comp_det n INNER JOIN nota_rem_det r ON n.lote=r.lote SET n.estado = 'Despachado' WHERE r.n_nro= $nro_remito");
                }
            } else {
                $array = Array('estado' => 'Error', 'lotes' => $lotes);
                $rem_errores = true;
            }
        }
    } else {
        $array = Array('estado' => 'Problema', 'lotes' => $codigos_con_problemas);
        $rem_errores = true;
    }
    if ($rem_errores) {
        $db->Query("UPDATE nota_remision SET estado = 'Abierta'  WHERE n_nro = $nro_remito");
    }
    echo json_encode($array);
}

function controlarStockXRemision($nro_remito) {
    $db = new My();
    $db->Query("select suc, suc_d from nota_remision where n_nro = $nro_remito");
    $db->NextRecord();
    $suc = $db->Record['suc'];
    $suc_d = $db->Record['suc_d'];



    $ms = new My();

    $lotes = "";
    $db->Query("SELECT codigo,lote,cantidad,kg_env, procesado  FROM nota_rem_det WHERE n_nro = $nro_remito");
    while ($db->NextRecord()) {
        $codigo = $db->Record['codigo'];
        $lote = $db->Record['lote'];
        $cantidad = $db->Record['cantidad'];
        $kg_env = $db->Record['kg_env'];
        $procesado = $db->Record['procesado'];
        $ms->Query("SELECT  mnj_x_lotes, SUM(cantidad) AS StockReal FROM articulos a , stock  s WHERE a.codigo = s.codigo AND   s.codigo = '$codigo'  AND s.lote =  '$lote' AND s.suc = '$suc'");
        $ms->NextRecord();
        $StockReal = $ms->Record['StockReal'];
        if ($cantidad < $StockReal || $cantidad > $StockReal) {
            $lotes.=" Stock Insuficiente: $lote [$cantidad  / $StockReal] ,";
        }
        if (!( $suc == "00" && $suc_d == "03")) {
            if ($kg_env == 0) {
                $lotes.=" Lote sin pesar: $lote [$cantidad] ,";
            }
            if ($procesado == 0) {
                $lotes.=" Lote sin Puntear: $lote [$cantidad] ,";
            }
        }
    }
    return $lotes;
}

/* Cambia de En Proceso a Cerrada */

function cerrarNotaRemision() {
    $nro_remito = $_POST['nro_remito'];
    $recepcionista = $_POST['recepcionista'];
    $usuario = $_POST['recepcionista'];

    $db = new My();
    $db_upd = new My();

    $db->Query("SELECT suc ,suc_d FROM nota_remision WHERE n_nro = $nro_remito");
    $db->NextRecord();
    $origen = $db->Get("suc");
    $destino = $db->Get("suc_d");

    $db->Query("select valor from parametros where clave = 'porc_tolerancia_remsiones'");
    $db->NextRecord();
    $porc_tolerancia_remsiones = $db->Record['valor'];


    // Control del Stock
    $lotes = controlarStockXRemision($nro_remito);

    if ($lotes == "") {

        // Control de Porcentaje de Tolerancia
        $db->Query("SELECT GROUP_CONCAT(lote) AS lotes  FROM nota_rem_det WHERE   cant_calc_rec BETWEEN (cantidad - (cantidad * $porc_tolerancia_remsiones / 100)) AND (cantidad + (cantidad * $porc_tolerancia_remsiones / 100)) < 1 AND  n_nro = $nro_remito");
        $db->NextRecord();
        $lotes = $db->Record['lotes'];

        // Realizar el cambio de Sucursal de los lotes y las cantidades de los articulos

        $db->Query("SELECT tipo_ent,nro_identif,linea, d.codigo,d.lote,d.cantidad,ancho,gramaje,tara FROM nota_rem_det d, stock s WHERE d.codigo = s.codigo AND d.lote = s.lote AND n_nro = $nro_remito");
        while ($db->NextRecord()) {
            $codigo = $db->Get("codigo");
            $lote = $db->Get("lote");
            $cantidad = $db->Get("cantidad");
            $ancho = $db->Get("ancho");
            $gramaje = $db->Get("gramaje");
            $tara = $db->Get("tara");

            $kg_ent = (($gramaje * $cantidad * $ancho) / 1000) + ($tara / 1000);

            $tipo_ent = $db->Get("tipo_ent");
            $nro_identif = $db->Get("nro_identif");
            $linea = $db->Get("linea");
            //Salida
            $db_upd->Query("UPDATE stock SET cantidad = cantidad - $cantidad  WHERE suc ='$origen' AND codigo = '$codigo' and lote ='$lote';");
            $db_upd->Query("INSERT INTO historial(suc, codigo, lote, tipo_ent, nro_identif, linea, tipo_doc, nro_doc, fecha_hora, usuario, direccion, cantidad, gramaje, tara, ancho)
            VALUES ('$origen', '$codigo', '$lote', '$tipo_ent', $nro_identif, $linea, 'RM', $nro_remito, CURRENT_TIMESTAMP, '$usuario', 'S', -$cantidad, $gramaje, $tara, $ancho);");
            //Entrada
            $db_upd->Query("SELECT count(*) as cant FROM stock WHERE suc ='$destino' AND codigo = '$codigo' and lote ='$lote';");
            $db_upd->NextRecord();
            $cant = $db_upd->Get("cant");
            if ($cant > 0) {
                $db_upd->Query("UPDATE stock SET cantidad = $cantidad  WHERE suc ='$destino' AND codigo = '$codigo' and lote ='$lote';");
                $db_upd->Query("UPDATE historial SET cantidad = $cantidad  WHERE suc ='$destino' AND codigo = '$codigo' and lote ='$lote';");
            } else {
                $db_upd->Query("INSERT INTO stock(suc, codigo, lote, tipo_ent, nro_identif, linea, cant_ent, kg_ent, cantidad, ubicacion, estado_venta)
                VALUES ('$destino','$codigo', '$lote', '$tipo_ent', $nro_identif, $linea, $cantidad, $kg_ent, $cantidad, '', 'Normal');");
                $db_upd->Query("INSERT INTO historial(suc, codigo, lote, tipo_ent, nro_identif, linea, tipo_doc, nro_doc, fecha_hora, usuario, direccion, cantidad, gramaje, tara, ancho)
                VALUES ('$destino', '$codigo', '$lote', '$tipo_ent', $nro_identif, $linea, 'RM', $nro_remito, CURRENT_TIMESTAMP, '$usuario', 'E', $cantidad, $gramaje, $tara, $ancho);");
            }
        }


        if ($lotes == null) {
            $array = Array('estado' => 'Ok');
            $db->Query("UPDATE nota_remision SET estado = 'Cerrada',fecha_cierre = current_date,hora_cierre = current_time,recepcionista = '$recepcionista'    WHERE n_nro = $nro_remito ;");
        } else {
            $array = Array('estado' => 'Ok');
            $db->Query("UPDATE nota_remision SET estado = 'Cerrada',fecha_cierre = current_date,hora_cierre = current_time,recepcionista = '$recepcionista'    WHERE n_nro = $nro_remito ;");
            $db->Query("update nota_rem_det set estado = 'FR' where n_nro='$nro_remito' and lote in ($lotes)");
        }

        /* else {
          $array = Array('estado' => 'Error', 'lotes' => $lotes);
          } */


        $db->Query("update pedido_tras_det p inner join pedido_traslado t on p.n_nro=t.n_nro inner join nota_remision n on t.suc=n.suc_d and t.suc_d=n.suc inner join nota_rem_det r on n.n_nro=r.n_nro and (p.lote = r.lote or p.lote_rem = r.lote) set p.estado = if(r.lote is not null,'Despachado',p.estado) where r.n_nro=$nro_remito");
        $db->Query("UPDATE  orden_procesamiento p ,  nota_rem_det d SET p.estado ='Remitido' WHERE d.lote = p.lote  AND d.n_nro = $nro_remito;");
    } else {
        $array = Array('estado' => 'Error', 'lotes' => $lotes);
    }
    echo json_encode($array);
}

function eliminarNotaRemision() {
    $nro_remito = $_POST['nro_remito'];
    $db = new My();
    $db->Query("SELECT count(*) as items  FROM nota_rem_det WHERE n_nro = $nro_remito");
    $db->NextRecord();
    $items = $db->Record['items'];
    if ($items < 1) {
        $db->Query("DELETE FROM nota_remision WHERE n_nro = $nro_remito");
        echo "Ok";
    } else {
        echo "Error";
    }
}

/**
 *  Funcion Generica para Buscar Articulos dado un Lote // Modificado para que busque todos los que tienen la misma imagen
 *  LLamado desde FacturaVenta.js
 */

function buscarArticulosSimilares() {
    $lote = $_POST['lote'];
    $suc = $_POST['suc'];

     
    $db = new My();
    $db->Query("SELECT img, padre FROM lotes l, stock s WHERE l.codigo = s.codigo AND l.lote = s.lote AND l.lote = '$lote' AND s.suc = '$suc'");
    $db->NextRecord();
    $img = $db->Record['img']; 
    $padre = $db->Record['padre'];
    
    $sql = "SELECT l.lote,s.suc,s.cantidad AS stock,img,id_compra,IF(padre = '$padre','Hijo','Hermano') AS Tipo FROM lotes l, stock s WHERE l.codigo = s.codigo AND l.lote = s.lote AND l.img = '$img' AND s.suc = '$suc' and l.lote <> '$lote'";
        
    echo json_encode(getResultArray($sql));
}

 
function actualizarCabeceraFactura($factura, $cod_desc, $tipo_doc = "C.I.") {

    aplicarDescuentoSEDECO($factura);
    //quitarDescuentosSEDECOYPromociones($factura);

    $my = new My();

    $my->Query("SELECT cat FROM factura_venta f WHERE f_nro = $factura");
    $my->NextRecord();
    $cat = $my->Record['cat'];
    // Corregir los Subtotales y los Precios Netos
    $divisor = 1;

    //if($cod_desc != 2) {//Venta discriminada

    $sql_subtotal = "update fact_vent_det set subtotal = round((((precio_venta * cantidad) - descuento ) / $divisor ),2) where f_nro = $factura;";

    if ($cat > 2 || $cod_desc == 2 || $cod_desc == 3) {// Mayorista o Discriminada        
        $sql_subtotal = "update fact_vent_det set descuento = 0, subtotal = round( (precio_venta * cantidad ) / $divisor,2) where f_nro = $factura;";
    }
    $my->Query($sql_subtotal);

    if ($tipo_doc === 'C.I. Diplomatica') {
        $divisor = 1.1;
        $sql_subtotal = "update fact_vent_det set descuento = 0, subtotal = round( (precio_venta * cantidad ) / $divisor,2) where f_nro = $factura;";
        $my->Query($sql_subtotal);
    }


    $sql_pn = "update fact_vent_det set precio_neto = round((subtotal - descuento) / cantidad,2) where f_nro = $factura;";
    $my->Query($sql_pn);

    $sql_total = "SELECT  SUM(subtotal) as Total,SUM(descuento) as Descuento FROM fact_vent_det WHERE f_nro = $factura GROUP BY f_nro  HAVING SUM(subtotal) >0";
    $my->Query($sql_total);
    if ($my->NumRows() > 0) {
        $my->NextRecord();
        $total = $my->Record['Total'];
        $descuento = $my->Record['Descuento'];
        $tiene_descuento = false;
        if ($descuento > 0) {
            $tiene_descuento = true;
        }

        aplicarDescuentoSEDECO($factura);
    } else {
        $total = 0;
        $total_sin_desc = 0;
        $descuento = 0;
        $cod_desc = 0;
        $sql_f = "update factura_venta set cod_desc = '$cod_desc', total=$total,total_desc = $descuento,total_bruto = $total_sin_desc ,desc_sedeco = 0 WHERE f_nro = $factura";
        $my->Query($sql_f);
    }
}

function discriminarPrecios() {

    $factura = $_POST['factura'];
    $usuario = $_POST['usuario'];
    $tipo_doc = $_POST['tipo_doc'];
    $suc = $_POST['suc'];
    
    $um = 'Mts'; // Solo para Mts y G$

    $estado = getEstadoFactura($factura);
    if ($estado['estado'] == "Abierta" && is_null($estado['e_sap'])) {
        $link = new My();
        $my = new My();
        $db = new My();
        $sql0 = "update factura_venta set cod_desc = 2  WHERE f_nro = $factura";
        $my->Query($sql0);
        $sql1 = "update fact_vent_det set descuento = 0 WHERE f_nro = $factura";
        $my->Query($sql1);

        $array = array();
         // Solo para Metros por ahora
        $my->Query("SELECT codigo,SUM(cantidad) AS Cantidad FROM fact_vent_det WHERE f_nro = $factura and estado_venta = 'Normal' and um_cod = '$um' GROUP BY codigo");
        while ($my->NextRecord()) {
            $codigo = $my->Record['codigo'];
            $Cantidad = $my->Record['Cantidad'];
            $array[$codigo] = $Cantidad;   
        }
        foreach ($array as $codigo => $cant) { 
            $precio_cat = 1;
            if ($cant < 5) {
                $precio_cat = 1;
            } else if ($cant >= 5 && $cant <= 9.999) {
                $precio_cat = 2;
            } else if ($cant >= 10 && $cant <= 29.999) {
                $precio_cat = 3;
            } else if ($cant >= 30 && $cant <= 99.999) {
                $precio_cat = 4;
            } else if ($cant >= 100) {
                $precio_cat = 5;
            } 

            $my->Query("SELECT lote FROM fact_vent_det WHERE f_nro = $factura  AND codigo = '$codigo'");
            while ($my->NextRecord()) {
                $lote = $my->Record['lote'];
                $Qry = "SELECT precio, IF(d.descuento IS NULL, 0,d.descuento) AS descuento FROM lista_prec_x_art l  LEFT JOIN desc_lotes d ON l.codigo = d.codigo AND d.lote = '$lote' WHERE l.codigo = '$codigo' AND l.um ='Mts' AND l.moneda = 'G$' AND l.num = d.num AND l.num = $precio_cat";
                $link->Query($Qry);
                //echo "$Qry<br>";

                if ($link->NumRows() > 0) {
                    $link->NextRecord();
                    $precio = $link->Record['precio'];
                    $descuento = $link->Record['descuento'];
                    
                    $f = new Functions();
                    
                    $PrecioCat =  $f->redondeo50($precio - $descuento); // solo para Sedeco
                    
                    if ($PrecioCat > 0) {
                        $db->Query("UPDATE fact_vent_det SET precio_venta = $PrecioCat, subtotal =  round( $PrecioCat * cantidad,0) WHERE f_nro = $factura AND codigo = '$codigo' AND lote = '$lote'");
                    } else {
                        echo "Error problemas con el precio establecido para $codigo...<br>";
                    }
                } else {
                    echo "Error Precio no establecido para $codigo...<br>";
                }
            }
        }

        actualizarCabeceraFactura($factura, 2, $tipo_doc);

        makeLog($usuario, "Modificar", "Venta Discriminada", "Cod. Desc = 2 ", $factura);
        echo "Ok";
    } else {
        echo "Error! estado de la factura es " . $estado['estado'] . (is_null($estado['e_sap']) ? '.' : ' y ya fue enviada a SAP');
    }
}

function actualizarPrecioMayorista() {
    $factura = $_POST['factura'];
    $usuario = $_POST['usuario'];

    if (!isset($_POST['usuario'])) {
        $usuario = 'Sistema';
    }

    $master = json_decode($_POST['master']);
    $my = new My();

    $my->Query("UPDATE factura_venta SET  cod_desc = 3 WHERE f_nro = $factura"); // Mayorista
    $my->Query("UPDATE fact_vent_det SET  descuento = 0 WHERE f_nro = $factura");
    // Verifico si no hay duplicados

    foreach ($master as $arr) {
        $codigo = $arr->codigo;
        $lote = $arr->lote;
        $precio = $arr->precio;
        $my->Query("UPDATE fact_vent_det SET precio_venta = $precio, subtotal = round(cantidad * precio_venta),descuento = 0 WHERE f_nro = $factura AND codigo = '$codigo' AND  lote = '$lote' ");
    }

    //quitarDescuentosSEDECOYPromociones($factura);

    aplicarDescuentoSEDECO($factura);

    // Agregado por el redondeo SEDECO
    $sql_total = "SELECT  SUM(subtotal) as Total FROM fact_vent_det WHERE f_nro = $factura";
    $my->Query($sql_total);
    $datos = array();


    $descuento_SEDECO = 0;
    if ($my->NumRows() > 0) {
        $my->NextRecord();
        $total = $my->Record['Total'];

        // Redondeo 
        $resto = fmod($total, 50);
        $new_total = $total - $resto;
        $descuento = $resto;
        $descuento_SEDECO = $resto;
        // echo "Resto $resto, total $total, new total $new_total, descuento $descuento<br>";


        $total_sin_desc = $total + $descuento;

        $sql_f = "update factura_venta set total=$new_total,total_desc = $descuento,total_bruto = $total_sin_desc WHERE f_nro = $factura";
        $my->Query($sql_f);
        $datos["DetalleDescuentos"] = getDescuentosYSubtotales($factura);
    }
    $datos["mensaje"] = "Ok";

    makeLog($usuario, "Modificar", "Venta Mayorista", "Cod. Desc = 3 ", $factura);
    echo json_encode($datos);
}

/**
 * Agrega un Detalle a una Factuara de Venta
 */
function agregarDetalleFactura() {
    $usuario = $_POST['usuario'];
    $factura = $_POST['factura'];
    $codigo = $_POST['codigo'];
    $lote = strtoupper(trim($_POST['lote']));
    $um = $_POST['um'];
    $ancho = $_POST['ancho'];
    $gramaje = $_POST['gramaje'];
    $tara = $_POST['tara'];  // Solo se registra la tara 
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
    $mnj_x_lotes = $_POST['mnj_x_lotes'];

    if (isset($_POST['estado_venta'])) {
        $estado_venta = $_POST['estado_venta'];
    }
    $kg_calc = 0; // Calculo en l

    $estado = getEstadoFactura($factura);

    if ($estado['estado'] == "Abierta" && is_null($estado['e_sap'])) {

        if ($cm_falla > 0) {
            $cm_falla = $cm_falla / 100;
            if ($fp == "true") {
                $cod_falla = "F";
                if ($cm_falla > 0.3) {
                    $cod_falla = "F+FP";
                }
            } else {
                $cod_falla = "F";
            }
        } else {
            $cod_falla = "";
            $cm_falla = 0;
        }
        $cod_falla_e = $cod_falla;

        if ($um === "Mts") {
            $kg_calc = (($gramaje * ($cantidad + $cm_falla) * $ancho) / 1000);  // No  se incluye la tara aqui
        } else if ($um === "Kg") {
            $kg_calc = $cantidad;
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
            if ($mnj_x_lotes === "No") {
                $lote = "";
            }
            $sql = "INSERT INTO fact_vent_det (f_nro, codigo, lote,um_prod, descrip, um_cod,cod_falla,cant_falla,cod_falla_e,falla_real, cantidad, precio_venta, descuento, precio_neto, subtotal, estado,gramaje,ancho,tara,kg_calc,cant_med,estado_venta)"
                    . "VALUES ($factura, '$codigo', '$lote','$um_prod', '$descrip', '$um','$cod_falla',$cm_falla,'$cod_falla_e',$cm_falla, $cantidad , $precio_venta, 0,$precio_neto, $subtotal, 'Pendiente',$gramaje,$ancho,$tara,$kg_calc, $cantidad,'$estado_venta');";

            $my->Query($sql);
            //$sql_total = "SELECT SUM(subtotal) AS Total,SUM(IF(estado_venta='Normal',subtotal,0)) AS TotalNormal, SUM(descuento) AS Descuento, SUM(IF(estado_venta='Normal',descuento,0)) AS DescuentoNormal FROM fact_vent_det WHERE f_nro =  $factura";
            $sql_total = "SELECT SUM(subtotal) AS Total,SUM(IF(estado_venta='Normal',subtotal,0)) AS TotalNormal, SUM(descuento) AS Descuento, SUM(IF(estado_venta='Normal',descuento,0)) AS DescuentoNormal, desc_sedeco FROM fact_vent_det d, factura_venta f WHERE f.f_nro = d.f_nro AND d.f_nro =  $factura";
            $my->Query($sql_total);
            $my->NextRecord();
            $total = $my->Record['Total'];
            $descuento = $my->Record['Descuento'];
            $DescuentoNormal = $my->Record['DescuentoNormal'];

            $total_sin_desc = $total + $descuento;
            //$datos["DescripHash"] = md5($descrip);
            $datos["Total"] = $total;
            $datos["Descuento"] = $descuento;
            $datos["Total_sin_desc"] = $total_sin_desc;

            $total_sin_desc = $total + $descuento;

            $set_desc = 5;  // Para Categoria 1 
            //Quitar todos los Descuentos Mercaderias en Promocion Mayoristas o Minoristas y quitar             
            quitarDescuentosSEDECOYPromociones($factura);

            if ($cat < 3) {
                if ($total_sin_desc >= UMBRAL_VENTA_MINORISTA) {
                    $datos["ES_CAT"] = $cat;
                    if ($cat == 2) {
                        $set_desc = 3;
                    }
                    $datos["DESC"] = $set_desc;
                    //Limpiar Descuentos SEDECO y Otros no Normal

                    $sql = "update fact_vent_det set descuento = ((cantidad * precio_venta * $set_desc) / 100),subtotal = round((cantidad * precio_venta)-((cantidad * precio_venta * $set_desc) / 100),2) WHERE f_nro = $factura and estado_venta = 'Normal'";

                    $my->Query($sql);
                    if ($my->AffectedRows() > 0) {
                        actualizarCabeceraFactura($factura, 1, $tipo_doc);
                    }
                    $datos["Porc_desc"] = $set_desc;
                } else { //Borrar  descuentos 
                    eliminarDescuentosFactura($factura, $tipo_doc);
                    $datos["Porc_desc"] = "0";
                }
            } else {
                eliminarDescuentosFactura($factura, $tipo_doc);
                $datos["Porc_desc"] = "0";
            }


            $sql_pn = "update fact_vent_det set precio_neto = round((subtotal - descuento) / cantidad,2) where f_nro = $factura;";
            $my->Query($sql_pn);

            $my->Query($sql_total);
            $my->NextRecord();
            $total = $my->Record['Total'];
            $descuento = $my->Record['Descuento'];
            $DescuentoNormal = $my->Record['DescuentoNormal'];
            $total_sin_desc = $total + $descuento;
            $desc_sedeco = $my->Record['desc_sedeco'];

            $datos["Mensaje"] = "Ok";
            $datos["Total"] = $total;
            $datos["Descuento"] = $descuento;
            $datos["DescuentoSEDECO"] = $desc_sedeco;
            $datos["DescuentoNormal"] = $DescuentoNormal;
            $datos["Total_sin_desc"] = $total_sin_desc;
            $datos["DetalleDescuentos"] = getDescuentosYSubtotales($factura);

            // Registrar Fin de Pieza
            if ($fp == "true") {
                $sql = "INSERT INTO edicion_lotes( usuario, codigo, lote, descrip, fecha, hora, suc, estado_venta)VALUES ( '$usuario', '$codigo', '$lote', '$descrip', CURRENT_DATE, CURRENT_TIME, '$suc', 'FP');";
                $my->Query($sql);
            }
        }
        echo json_encode($datos);
    } else {
        echo json_encode(array("Mensaje" => "Error! estado de la factura es " . $estado['estado'] . (is_null($estado['e_sap']) ? '.' : ' y ya fue enviada a SAP')));
    }
}

function quitarDescuentosSEDECOYPromociones($factura) {
    $my = new My();
    //Quitar todos los Descuentos Mercaderias en Promocion Mayoristas o Minoristas         
    $sql0 = "update fact_vent_det set descuento = 0,subtotal = round((cantidad * precio_venta),2) WHERE f_nro = $factura and estado_venta != 'Normal'";
    $my->Query($sql0);
}

function aplicarDescuentoSEDECO($factura) {
    $my = new My();
    $sql_total = " SELECT f.moneda, IF(SUM(subtotal) IS NULL,0,SUM(subtotal)) AS Total, IF(SUM(descuento) IS NULL,0,SUM(descuento)) AS total_descuento FROM fact_vent_det d, factura_venta f WHERE f.f_nro = d.f_nro AND f.f_nro = $factura;";
    $my->Query($sql_total);
    //$descuento_SEDECO = 0;
    $my->NextRecord();
    $moneda = $my->Record['moneda'];
    $total = $my->Record['Total'];
    $total_descuento = $my->Record['total_descuento'];

    if ($total > 0 && $moneda == "G$") {

        // Redondeo 
        $resto = fmod($total, 50);
        if ($resto < 0) {
            $resto = 0;
        }

        $new_total = $total - $resto;

        $descuento_SEDECO = $resto;
        // echo "Resto $resto, total $total, new total $new_total, descuento $descuento<br>";

        $sql_pn = "update factura_venta set total = $new_total, total_desc = $total_descuento, desc_sedeco =  $descuento_SEDECO, total_bruto = total + total_desc where f_nro = $factura";
        $my->Query($sql_pn);
    } else {
        if ($total > 0) {
            $sql_pn = "update factura_venta set total = $total, total_desc = $total_descuento, desc_sedeco =  0, total_bruto = total + total_desc where f_nro = $factura";
            $my->Query($sql_pn);
        } else {
            $sql_pn = "update factura_venta set total = 0, total_desc = $total_descuento, desc_sedeco =  0, total_bruto = total + total_desc where f_nro = $factura";
            $my->Query($sql_pn);
        }
    }
}

function borrarDetalleFactura() {
    $factura = $_POST['factura'];
    $codigo = $_POST['codigo'];
    $lote = $_POST['lote'];
    $cat = $_POST['categoria'];
    $tipo_doc = $_POST['tipo_doc'];
    $cod_desc = $_POST['cod_desc'];

    $estado = getEstadoFactura($factura);
    if ($estado['estado'] == "Abierta") {

        $my = new My();
        $sql = "delete FROM fact_vent_det WHERE f_nro = $factura and codigo = '$codigo' and lote = '$lote';";
        $my->Query($sql); // Verifico si no hay duplicados


        if ($cod_desc == 2 || $cod_desc == 3) { // Mayorista o Discriminada
            actualizarCabeceraFactura($factura, $cod_desc, $tipo_doc);
        }

        $datos = array();

        //$sql_total = "SELECT IF(SUM(subtotal) IS NULL,0,SUM(subtotal)) AS Total, IF( SUM(IF(estado_venta='Normal',subtotal,0)) IS NULL, 0,SUM(IF(estado_venta='Normal',subtotal,0)) ) AS TotalNormal,         IF( SUM(descuento) IS NULL,0,SUM(descuento) ) AS Descuento,         IF( SUM(IF(estado_venta='Normal',descuento,0)) IS NULL,0,SUM(IF(estado_venta='Normal',descuento,0)) ) AS DescuentoNormal         FROM fact_vent_det WHERE f_nro =  $factura";
        $sql_total = "SELECT SUM(subtotal) AS Total,SUM(IF(estado_venta='Normal',subtotal,0)) AS TotalNormal, SUM(descuento) AS Descuento, SUM(IF(estado_venta='Normal',descuento,0)) AS DescuentoNormal, desc_sedeco FROM fact_vent_det d, factura_venta f WHERE f.f_nro = d.f_nro AND d.f_nro =  $factura";

        $my->Query($sql_total);
        $my->NextRecord();
        $total = $my->Record['Total'];
        $descuento = $my->Record['Descuento'];
        $total_sin_desc = $total + $descuento;
        $DescuentoNormal = $my->Record['DescuentoNormal'];


        //Quitar todos los Descuentos Mercaderias en Promocion Mayoristas o Minoristas y quitar    
        if ($total > 0) {
            quitarDescuentosSEDECOYPromociones($factura);
        } else {
            $desc_sedeco = 0;
        }

        $set_desc = 5;  // Para Categoria 1 

        if ($cat < 3 && $cod_desc < 2) { // No Mayorista y No Discriminada
            if ($total_sin_desc >= UMBRAL_VENTA_MINORISTA) {
                if ($cat == 2) {
                    $set_desc = 3;
                }
                $sql = "UPDATE fact_vent_det set descuento = ((cantidad * precio_venta * $set_desc) / 100),subtotal = round((cantidad * precio_venta)-( ((cantidad * precio_venta) * $set_desc) / 100),2) WHERE f_nro = $factura and estado_venta = 'Normal'";
                $my->Query($sql);
                if ($my->AffectedRows() > 0) {
                    actualizarCabeceraFactura($factura, 1, $tipo_doc);
                }
                $datos["Porc_desc"] = $set_desc;
            } else { //Borrar  descuentos 
                eliminarDescuentosFactura($factura, $tipo_doc);
                $datos["Porc_desc"] = "0";
            }
        } else {
            eliminarDescuentosFactura($factura, $tipo_doc);
            $datos["Porc_desc"] = "0";
        }


        $my->Query($sql_total);
        $my->NextRecord();
        $total = $my->Record['Total'];
        $descuento = $my->Record['Descuento'];
        $total_sin_desc = $total + $descuento;

        $datos["Mensaje"] = "Ok";
        $datos["Total"] = $total;
        $datos["Descuento"] = $descuento;
        $datos["Total_sin_desc"] = $total_sin_desc;
        $datos["DescuentoNormal"] = $DescuentoNormal;
        $datos["DescuentoSEDECO"] = $desc_sedeco;
        $datos["DetalleDescuentos"] = getDescuentosYSubtotales($factura);

        echo json_encode($datos);
    } else {
        echo json_encode(array("Mensaje" => "Error Factura " . $estado['estado']));
    }
}

function establecerPrecioCat() {
    $factura = $_POST['factura'];
    $cat = $_POST['categoria'];
    $pref_pago = $_POST['pref_pago'];
    $tipo_doc = $_POST['tipo_doc']; // Para ver si es Diplomatico
    $cod_desc = $_POST['cod_desc'];


    $estado = getEstadoFactura($factura);
    if ($estado['estado'] == "Abierta" && is_null($estado['e_sap'])) {
        $db = new My();
        $db->Query("SELECT moneda  FROM factura_venta WHERE f_nro = $factura");
        $db->NextRecord();
        $moneda = $db->Record['moneda'];

        $fn = new Functions();

        $my = new My();
        $my2 = new My();
        $my->Query("update factura_venta set pref_pago = '$pref_pago',cod_desc = 0 where f_nro = $factura;");

        if ($pref_pago == "Otros" && $cat = "1") {
            $sql = "update fact_vent_det set descuento = 0  WHERE f_nro = $factura";
            $my2->Query($sql);
        }

        $my->Query("SELECT codigo,lote,cantidad, um_cod FROM fact_vent_det WHERE f_nro = $factura");
        while ($my->NextRecord()) {
            $codigo = $my->Record['codigo'];
            $lote = $my->Record['lote'];
            $cantidad = $my->Record['cantidad'];
            $um = $my->Record['um_cod'];

            
            $sql_precios = "SELECT precio,IF(descuento IS NULL,0,descuento) AS descuento FROM lista_prec_x_art l  LEFT JOIN desc_lotes d ON l.codigo = d.codigo AND l.moneda = d.moneda AND l.um = d.um AND l.num = d.num WHERE l.codigo = '$codigo' AND l.num = $cat  AND l.moneda = '$moneda' AND l.um = '$um' and d.lote = '$lote'";
            $precios = $fn->getResultArray($sql_precios)[0];  //print_r($precios);
            $precio = 0;
            $descuento = 0;
            if (sizeof($precios) > 0) {
                $precio = $precios['precio'];
                $descuento = $precios['descuento'];
            } else {
                echo "Error: No hay precio definido para esta moneda o unidad de medida";
            }

            $precio_cat = $precio - $descuento;
            if ($moneda == "G$") {
                $precio_cat = redondeo50($precio_cat);
            }

            $my2->Query("UPDATE fact_vent_det SET precio_venta = $precio_cat,precio_neto = $precio_cat, subtotal = round((cantidad * precio_venta),2) WHERE f_nro = $factura and codigo = '$codigo' and lote = '$lote'");
        }
        // Actualizar precio_venta y subtotal    
        actualizarCabeceraFactura($factura, $cod_desc, $tipo_doc);
        echo "Ok";
    } else {
        echo "Error! estado de la factura es " . $estado['estado'] . (is_null($estado['e_sap']) ? '.' : ' y ya fue enviada a SAP');
    }
}

function setPrefPago() {
    $factura = $_POST['factura'];
    $cat = $_POST['categoria'];
    $pref_pago = $_POST['pref_pago'];
    $tipo_doc = $_POST['tipo_doc']; // Para ver si es Diplomatico

    $my = new My();
    $datos = array();

    $tipo_desc = "select cod_desc,estado,e_sap from factura_venta where f_nro = $factura";
    $my->Query($tipo_desc);
    $my->NextRecord();
    $estado = $my->Record;
    if ($estado['estado'] == "Abierta" && is_null($estado['e_sap'])) {
        $cod_desc = $my->Record['cod_desc'];
        /*
          cod_desc	descrip
          0	Sin Descuento
          1	Descuento Categoria 1 y 2 x Valor > 330000
          2	Ventas Discriminadas
          3	Ventas Mayorista
         */

        //Quitar todos los Descuentos Mercaderias en Promocion Mayoristas o Minoristas y quitar             
        quitarDescuentosSEDECOYPromociones($factura);

        $sql_total = "SELECT SUM(subtotal) AS Total,SUM(IF(estado_venta='Normal',subtotal,0)) AS TotalNormal, SUM(descuento) AS Descuento, SUM(IF(estado_venta='Normal',descuento,0)) AS DescuentoNormal, desc_sedeco FROM fact_vent_det d, factura_venta f WHERE f.f_nro = d.f_nro AND d.f_nro =  $factura";


        $my->Query($sql_total);
        $my->NextRecord();
        $total = $my->Record['Total'];
        $TotalNormal = $my->Record['TotalNormal'];
        $descuento = $my->Record['Descuento'];
        $DescuentoNormal = $my->Record['DescuentoNormal'];
        $desc_sedeco = $my->Record['desc_sedeco'];
        /*
         * Si codigo descuento = 2 
         */

        $total_sin_desc = $total + $descuento;

        $divisor = 1;
        $set_desc = 5;  // Para Categoria 1 
        if ($tipo_doc == "C.I. Diplomatica") {
            $set_desc = 0;
            $divisor = 1.1;
        }
        if ($cod_desc == 2 || $cod_desc == 3) { // Mayorista o Discriminada
            $set_desc = 0;
        }

        if ($cat < 3 && $cod_desc != 2 && $cod_desc != 3) { // No puede ser Venta Discriminada
            if ($total_sin_desc >= UMBRAL_VENTA_MINORISTA) {
                if ($cat == 2) {
                    $set_desc = 3;
                }
                if ($pref_pago == "Contado") {
                    $sql = "update fact_vent_det set descuento = ((cantidad * precio_venta * $set_desc) / 100),subtotal = round((cantidad * precio_venta)-( ((cantidad * precio_venta) * $set_desc) / 100),0) WHERE f_nro = $factura and estado_venta = 'Normal'";
                    if ($tipo_doc == "C.I. Diplomatica") {
                        $sql = "update fact_vent_det set descuento = 0,subtotal = round(((cantidad * precio_venta) / $divisor),2) WHERE f_nro = $factura ";
                    }
                    $my->Query($sql);
                    actualizarCabeceraFactura($factura, 1, $tipo_doc);
                    $datos["Porc_desc"] = $set_desc;
                } else {
                    eliminarDescuentosFactura($factura, $tipo_doc);
                    //actualizarCabeceraFactura($factura, 0, $tipo_doc);
                    $datos["Porc_desc"] = 0;
                }
            } else { //Borrar  descuentos 
                eliminarDescuentosFactura($factura, $tipo_doc);
                $datos["Porc_desc"] = 0;
            }
        } else {
            if ($cod_desc != 2 && $cod_desc != 3) { // No hace falta actualizar los detalles para ventas discriminadas
                eliminarDescuentosFactura($factura, $tipo_doc);
            }
            $datos["Porc_desc"] = 0;
        }

        //Finalmente calcular descuento de SEDECO
        aplicarDescuentoSEDECO($factura);

        //echo $sql_total;

        $my->Query($sql_total);
        $my->NextRecord();
        $total = $my->Record['Total'];
        $descuento = $my->Record['Descuento'];
        $total_sin_desc = $total + $descuento;
        $desc_sedeco = $my->Record['desc_sedeco'];

        $datos["Mensaje"] = "Ok";
        $datos["Total"] = $total;
        $datos["Descuento"] = $descuento;
        $datos["DescuentoSEDECO"] = $desc_sedeco;
        $datos["DescuentoNormal"] = $DescuentoNormal;
        $datos["Total_sin_desc"] = $total_sin_desc;
        $datos["DetalleDescuentos"] = getDescuentosYSubtotales($factura);


        $my->Query("update factura_venta set pref_pago = '$pref_pago' where f_nro = $factura;");
        //$my->Query("UPDATE factura_venta SET cod_desc = 4  WHERE f_nro = $factura and cod_desc = 0 and total_desc BETWEEN 1 AND 99;");        Ya no hace falta ya hace en aplicarDescuentoSEDECO
    } else {
        $datos["Mensaje"] = "Error! estado de la factura es " . $estado['estado'] . (is_null($estado['e_sap']) ? '.' : ' y ya fue enviada a SAP');
    }

    echo json_encode($datos);
}

function getDescuentosYSubtotales($factura) {
    $sql = "SELECT codigo,lote,descuento,subtotal FROM fact_vent_det WHERE f_nro = $factura";
    return getResultArray($sql);
}

function setPrefPagoOnly() {
    $factura = $_POST['factura'];
    $pref_pago = $_POST['pref_pago'];

    $my = new My();
    $my->Query("update factura_venta set pref_pago = '$pref_pago' where f_nro = $factura;");
    echo "Ok";
}

function eliminarPagosAbiertos() {
    $usuario = $_POST['usuario'];
    $db = new My();
    $dbdet = new My();
    $db->Query("SELECT id_pago FROM    pagos_recibidos p  WHERE usuario = '$usuario' AND p.estado = 'Abierto' AND p.e_sap IS NULL  ");

    while ($db->NextRecord()) {
        $id_pago = $db->Record['id_pago'];
        $dbdet->Query("DELETE FROM efectivo WHERE trans_num = $id_pago;");
        $dbdet->Query("DELETE FROM convenios WHERE trans_num = $id_pago;");
        $dbdet->Query("DELETE FROM cheques_ter WHERE trans_num = $id_pago;");
        $dbdet->Query("DELETE FROM bcos_ctas_mov WHERE trans_num = $id_pago;");
        $dbdet->Query("DELETE FROM pago_rec_det WHERE id_pago = $id_pago;");
        $dbdet->Query("DELETE FROM pagos_recibidos WHERE id_pago = $id_pago;");
    }
    echo "Ok";
}

/**
 * Para uso local
 * @param type $factura
 */
function eliminarDescuentosFactura($factura, $tipo_doc = "C.I.") {
    $my = new My();
    $sql = "update fact_vent_det set descuento = 0,subtotal = round(cantidad * precio_venta,2) WHERE f_nro = $factura";
    $my->Query($sql);
    actualizarCabeceraFactura($factura, 0, $tipo_doc);
}

/**
 * Para uso con ajax
 */
function borrarDescuentoDeFactura() {
    $factura = $_POST['factura'];
    $tipo_doc = $_POST['tipo_doc'];
    $my = new My();
    $my->Query("update factura_venta set pref_pago = 'Otros' where f_nro = $factura;");
    eliminarDescuentosFactura($factura, $tipo_doc);
}

function controlarStockFactura($factura) {

    $usuario = $_REQUEST['usuario'];

    $link = new My();

    $db = new My();
    $db->Query("select suc,clase from factura_venta  where f_nro = $factura;");
    $db->NextRecord();
    $suc = $db->Record['suc'];
    $clase = $db->Record['clase'];

    $errores = "";

    if ($clase === "Articulo") {

        $db->Query("SELECT codigo,lote, cantidad FROM fact_vent_det  where f_nro = $factura;");

        while ($db->NextRecord()) {
            $codigo = $db->Record['codigo'];
            $lote = $db->Record['lote'];
            $cantidad = $db->Record['cantidad'];
            $link->Query("SELECT cantidad as Stock FROM stock where codigo = '$codigo' and lote = '$lote' and suc = '$suc';");
            $link->NextRecord();
            $stock = $link->Record['Stock'];
            if ($stock < $cantidad) {
                $errores.= " | Stock insuficiente Codigo: $codigo  Lote: $lote  ($stock < $cantidad) | ";
            }
        }
    }
    if ($errores != "") {

        makeLog($usuario, "Error Stock", $errores, "Stock insuficiente", $factura);

        return $errores;
    } else {
        return "Ok";
    }
}

function finalizarVenta() {

    $factura = $_POST['factura'];
    $pref_pago = $_POST['pref_pago'];
    $tipo_doc = $_POST['tipo_doc'];
    $my = new My();
    $db = new My();
    $link = new My();
    // Controlar Stock
    $control = controlarStockFactura($factura);
    if ($control == "Ok") {

        $my->Query("update factura_venta set pref_pago = '$pref_pago',estado= 'En_caja',empaque='No' where f_nro = $factura and estado ='Abierta';");

        // Actualizar Precios de Costo del Articulo
        if ($my->AffectedRows() > 0) {
            $codigos = "SELECT DISTINCT codigo FROM fact_vent_det WHERE f_nro = $factura";
            $my->Query($codigos);
            while ($my->NextRecord()) {
                $codigo = $my->Record['codigo'];
                $link->Query("select costo_prom from articulos where codigo = '$codigo'");
                $link->NextRecord();
                $p_costo = $link->Record['costo_prom'];
                $db->Query("update fact_vent_det set precio_costo = $p_costo where codigo = '$codigo' and f_nro = $factura;");
            }
            $sql_pn = "update fact_vent_det set precio_neto = round((subtotal - descuento) / cantidad,2) where f_nro = $factura;";
            $my->Query($sql_pn);
        }
        echo "Ok";
    } else {
        echo $control;
    }
}
 

function getEstadoFactura($factura) {
    $my = new My();
    $my->Query("SELECT estado, e_sap FROM factura_venta f WHERE f_nro = $factura");
    $my->NextRecord();
    $estado = $my->Record;
    return $estado;
}

function cambiarEstadoFactura() {
    $my = new My();
    $factura = $_POST['factura'];
    $estado = $_POST['estado'];
    $sql = "update factura_venta set estado = '$estado' WHERE f_nro = $factura";
    $my->Query($sql);
    echo "Ok";
}

function finalizarReserva() {
    $reserva = $_POST['reserva'];

    $usuario = $_REQUEST['usuario'];

    $link = new My();
    $db = new My();
    $db->Query("select suc from reservas where nro_reserva = $reserva");
    $db->NextRecord();
    $suc = $db->Record['suc'];
    $db->Query("SELECT d.codigo,d.lote, cantidad, mnj_x_lotes FROM reservas_det d, articulos a  WHERE d.codigo = a.codigo AND  nro_reserva =   $reserva");
    $errores = "";

    while ($db->NextRecord()) {
        $codigo = $db->Record['codigo'];
        $lote = $db->Record['lote'];
        $cantidad = $db->Record['cantidad'];
        $mnj_x_lotes = $db->Record['mnj_x_lotes'];
        if ($mnj_x_lotes === "No") {
            $lote = "";
        }

        $link->Query("SELECT cantidad AS stock FROM stock WHERE codigo = '$codigo' AND lote = '$lote' AND suc = '$suc';");
        $link->NextRecord();
        $stock = $link->Record['stock'];   // echo "SELECT cantidad AS stock FROM stock WHERE codigo = '$codigo' AND lote = '$lote' AND suc = '$suc';  <<<>>>> $cantidad";
        if ($stock < $cantidad) {
            $errores.= " | Stock insuficiente Codigo: $codigo  Lote: $lote  ($stock < $cantidad) | ";
        }
    }
    if ($errores != "") {
        makeLog($usuario, "Error Stock", $errores, "Stock insuficiente", $reserva);
        echo '{"error":"' . $errores . '"}';
    } else {
        //return "Ok";
        $my = new My();

        $porc_minimo_senia = 30;

        $sql_porc = "SELECT c.porc_min_senia FROM reservas r, clientes c WHERE r.cod_cli = c.cod_cli AND r.nro_reserva = $reserva";
        $my->Query($sql_porc);
        if ($my->NumRows() > 0) {
            $my->NextRecord();
            $porc_minimo_senia = $my->Get('porc_min_senia');
        }

        $sql_total = "SELECT SUM(subtotal) as Total  FROM reservas_det WHERE nro_reserva = $reserva";
        $my->Query($sql_total);
        $my->NextRecord();
        $total = $my->Record['Total'];
        $minimo_senha = ($total * $porc_minimo_senia) / 100;

        $my->Query("update reservas set estado= 'En_caja',valor_total_ref=$total,  minimo_senia_ref  = $minimo_senha where nro_reserva = $reserva;");
        echo '{"estado":"Ok"}';
    }
}

/**
 * Agrega un Detalle a una Factuara de Venta
 */
function agregarDetalleReserva() {
    $reserva = $_POST['reserva'];
    $codigo = $_POST['codigo'];
    $lote = $_POST['lote'];
    $um = $_POST['um'];
    $precio_venta = $_POST['precio_venta'];
    $cantidad = $_POST['cantidad'];
    $subtotal = $_POST['subtotal'];
    $descrip = $_POST['descrip'];
    $cat = $_POST['categoria'];

    $my = new My();
    $sql = "SELECT count(lote) as cant FROM reservas_det WHERE nro_reserva = $reserva and codigo = '$codigo' and lote = '$lote';";
    $my->Query($sql); // Verifico si no hay duplicados
    $my->NextRecord();
    $cant = $my->Record['cant'];

    $datos = array();
    $total = 0;
    if ($cant > 0) {
        $datos["Mensaje"] = "Codigo Duplicado";
    } else {
        $sql = "INSERT INTO reservas_det (nro_reserva, codigo, lote, descrip, um, cantidad, precio, subtotal)
        VALUES ($reserva, '$codigo', '$lote', '$descrip', '$um',$cantidad , $precio_venta,$subtotal);";
        $my->Query($sql);
        $sql_total = "SELECT SUM(subtotal) as Total  FROM reservas_det WHERE nro_reserva = $reserva";
        $my->Query($sql_total);
        $my->NextRecord();
        $total = $my->Record['Total'];
        $datos["Mensaje"] = "Ok";
        $datos["Total"] = $total;
    }
    $my->Query("update  reservas set valor_total_ref= $total where nro_reserva = $reserva;");
    echo json_encode($datos);
}

function borrarDetalleReserva() {
    $reserva = $_POST['reserva'];
    $codigo = $_POST['codigo'];
    $lote = $_POST['lote'];
    $datos = array();
    $my = new My();
    $sql = "delete FROM reservas_det WHERE nro_reserva = $reserva and codigo = '$codigo' and lote = '$lote';";
    $my->Query($sql);
    $sql_total = "SELECT SUM(subtotal) as Total  FROM reservas_det WHERE nro_reserva = $reserva";
    $my->Query($sql_total);
    $my->NextRecord();
    $total = $my->Record['Total'];
    $datos["Mensaje"] = "Ok";
    $datos["Total"] = $total;
    echo json_encode($datos);
}

/**
 * Gestion de Permisos por Grupo de Usuarios
 */
function getPermisosXGrupo() {
    $grupo = $_POST['grupo'];

    $my = new My();
    $my->Query("SELECT  p.id_permiso AS id,descripcion AS permiso, trustee  FROM permisos p LEFT JOIN permisos_x_grupo g ON p.id_permiso = g.id_permiso AND g.id_grupo = $grupo order by p.id_permiso + 0 asc");
    $arr = array();

    while ($my->NextRecord()) {
        array_push($arr, $my->Record);
    }
    echo json_encode($arr);
}

function checkTrustee() {
    $usuario = $_POST['usuario'];
    $id_permiso = $_POST['id_permiso'];
    require_once("Functions.class.php");
    $f = new Functions();
    $permiso = $f->chequearPermiso($id_permiso, $usuario);
    echo $permiso;
}

function getAvatar() {
    $usuario = $_POST['usuario'];
    if (file_exists("img/usuarios/$usuario.jpg")) {
        echo "true";
    } else {
        echo "false";
    }
}

function aplicarPermisoAGrupo() {
    $id_permiso = $_POST['id_permiso'];
    $grupo = $_POST['grupo'];
    $trustee = $_POST['trustee'];

    $my = new My();
    $my->Query("SELECT * FROM permisos_x_grupo g WHERE g.id_grupo = $grupo AND id_permiso = '$id_permiso'"); // Si no hay insertar
    if ($my->NumRows() > 0) { // Update         
        $my->Query("update permisos_x_grupo set trustee = '$trustee' where id_permiso = '$id_permiso' and id_grupo = $grupo;");
    } else {
        $my->Query("INSERT INTO permisos_x_grupo(id_permiso,id_grupo,trustee)VALUES('$id_permiso',$grupo,'$trustee')");
    }
    echo "Ok";
}

function generarFacturasContables() {
    $suc = $_POST['suc'];
    $pdv = $_POST['pdv'];
    $usuario = $_POST['usuario'];
    $inicial = $_POST['inicial'];
    $cantidad = $_POST['cantidad'];
    $fecha_venc = $_POST['fecha_venc'];
    $tipo = $_POST['tipo'];
    $tipo_doc = $_POST['tipo_doc'];
    $timbrado = $_POST['timbrado'];
    $estab = $_POST['estab'];
    $moneda = $_POST['moneda'];

    $final = $inicial + $cantidad;

    if ($tipo_doc === "Recibo") {
        $timbrado = 'null';
    }

    $my = new My();
    $my->Query("SELECT * FROM factura_cont WHERE fact_nro >= $inicial AND fact_nro <=$final AND establecimiento = '$estab' AND pdv_cod = '$pdv' and tipo_fact = '$tipo' and tipo_doc = '$tipo_doc' and moneda = '$moneda' AND suc = '$suc' ");

    if ($my->NumRows() > 0) {
        echo json_encode(array('estado' => 'Error', 'mensaje' => "Error existen " . $my->NumRows() . " facturas que se encuentran en este rango para esta Sucursal y este Punto de Expedici&oacute;n.<br>Corrija el Rango y vuelva a intentarlo, <br> No se han generado las facturas"));
    } else {
        for ($i = $inicial; $i <= $final; $i++) {
            try {
                $my->Query("INSERT INTO factura_cont(fact_nro,suc,pdv_cod,fecha_venc,usuario,estado,tipo_fact,timbrado,establecimiento,tipo_doc,moneda)VALUES('$i','$suc','$pdv','$fecha_venc','$usuario','Disponible','$tipo',$timbrado,'$estab','$tipo_doc','$moneda');");
            } catch (Exception $e) {
                echo json_encode(array('estado' => 'Error', 'mensaje' => "Ocurrio un Error al momento de Ejecutar la Consulta. Contacte con el Administrador."));
            }
        }
        echo json_encode(array('estado' => 'Ok', 'mensaje' => "Se han cargado con exito " . ($cantidad + 1) . " facturas..."));
    }
}

function buscarFacturasContables() {
    $pdv = $_POST['pdv'];
    $suc = $_POST['suc'];
    $fact_nro = $_POST['fact_nro'];
    $tipo = $_POST['tipo'];
    $tipo_doc = $_POST['tipo_doc'];
    $moneda = $_POST['moneda'];

    $link = new My();
    //$link->Query("SELECT fact_nro AS nro,suc,pdv_cod AS pdv,DATE_FORMAT(fecha_venc,'%d-%m-%Y') AS venc,usuario,estado,motivo_anul,tipo_fact FROM  factura_cont WHERE fact_nro like '$fact_nro' AND suc = '$suc' AND pdv_cod = '$pdv' and tipo_fact = '$tipo' and tipo_doc = '$tipo_doc' and moneda = '$moneda' order by fact_nro + 0 asc");
    $link->Query("SELECT v.f_nro as ticket,c.fact_nro AS nro,c.suc,c.pdv_cod AS pdv,DATE_FORMAT(fecha_venc,'%d-%m-%Y') AS venc,c.usuario,c.estado,motivo_anul,c.tipo_fact FROM  factura_cont c left join factura_venta v on c.suc=v.suc and c.fact_nro=v.fact_nro and c.pdv_cod=v.pdv_cod and c.tipo_fact=v.tipo_fact and c.tipo_doc=v.tipo_doc WHERE c.fact_nro like '$fact_nro' AND c.suc = '$suc' AND c.pdv_cod = '$pdv' and c.tipo_fact = '$tipo' and c.tipo_doc = '$tipo_doc' and c.moneda = '$moneda' order by c.fact_nro + 0 asc");

    $facturas = array();
    while ($link->NextRecord()) {
        array_push($facturas, $link->Record);
    }
    echo json_encode($facturas);
}

function cambiarEstadoFacturaContable() {
    $pdv = $_POST['pdv'];
    $suc = $_POST['suc'];
    $fact_nro = $_POST['fact_nro'];
    $estado = $_POST['estado'];
    $motivo = ($estado == 'Anulada') ? $_POST['motivo'] : '';
    $tipo = $_POST['tipo'];
    $tipo_doc = $_POST['tipo_doc'];
    $moneda = $_POST['moneda'];
    $f_nro = '';
    $get = '';

    $link = new My();
    $link->Query("SELECT f_nro FROM factura_venta WHERE fact_nro ='$fact_nro' and suc = '$suc'");
    if ($link->NextRecord()) {
        $f_nro = $link->Record['f_nro'];
    }
    $link->Query("update factura_cont set estado = '$estado', motivo_anul = '$motivo' where fact_nro =  '$fact_nro' and suc = '$suc' and  pdv_cod = '$pdv' and tipo_fact = '$tipo' and tipo_doc = '$tipo_doc' and moneda = '$moneda' ;");
    if ($estado !== 'Cerrada' && $estado !== 'Impresa') {
        $link->Query("update factura_venta set fact_nro='',tipo_fact='',tipo_doc='' where fact_nro ='$fact_nro' and suc = '$suc' ");
    }
    
    echo json_encode(array('estado' => 'Ok', 'mensaje' => "Se ha cambiado el estado de la factura Nro: $fact_nro", "SAPSync" => $get));
}

/**
 * Devuelve la ultima cotizacion de moneda discriminada por local,
 * parametro obligatorio suc
 * parametro opcional local
 * formato de devolucion JSON moneda.operacion
 */
function getCotiz() {
    $suc = $_POST['suc'];
    $moneda = '';
    if (isset($_POST['moneda']))
        $moneda = $_POST['moneda'];

    $db = new My();
    $db2 = new My();
    $moneda_filter = '';

    $cotizaciones = array();
    if ($moneda !== '') {
        $moneda_filter = " AND m_cod = '$moneda'";
    }
    $db->Query("SELECT m_descri AS m, m_cod AS c FROM monedas WHERE m_ref <> 'Si'$moneda_filter;");
    //echo $db->NumRows();
    while ($db->NextRecord()) {
        $n_monedas = $db->Record['m'];
        $query = "SELECT compra,venta FROM cotizaciones WHERE suc = '$suc' AND m_cod = '" . $db->Record['c'] . "' and fecha <= current_date ORDER BY id_cotiz DESC LIMIT 1;";

        $db2->Query($query);
        if ($db2->NumRows() > 0) {
            $db2->NextRecord();
            $cotizaciones[$n_monedas] = ["compra" => $db2->Record['compra'], "venta" => $db2->Record['venta']];
        } else {
            $cotizaciones[$n_monedas] = ["compra" => 0, "venta" => 0];
        }
    }

    echo json_encode($cotizaciones);
}

function getEfectivoFactura() {
    $factura = $_POST['factura'];
    $sql_where = " f_nro = $factura and id_concepto < 3 ";
    getEfectivo($sql_where);
}

function getEfectivoReserva() {
    $reserva = $_POST['reserva'];
    $sql_where = " nro_reserva = $reserva and id_concepto = 3 ";
    getEfectivo($sql_where);
}

function getEfectivo($sql_where) {
    $db = new My();
    $db2 = new My();
    $db->Query("SELECT  m_descri AS m, m_cod AS c FROM monedas where m_cod != 'Y$' ");
    $pagos = array();
    while ($db->NextRecord()) {
        $n_monedas = $db->Record['m'];
        $codigo = $db->Record['c'];
        $query = "SELECT  sum(entrada) as entrada,sum(salida) as salida FROM efectivo WHERE $sql_where and m_cod = '$codigo'; ";
        $db2->Query($query);
        if ($db2->NumRows() > 0) {
            $db2->NextRecord();
            $pagos[$n_monedas] = ["codigo" => $codigo, "entrada" => ($db2->Record['entrada'] == '') ? 0 : $db2->Record['entrada'], "salida" => ($db2->Record['salida'] == '') ? 0 : $db2->Record['salida']];
        } else {
            $pagos[$n_monedas] = ["codigo" => $codigo, "entrada" => 0];
        }
    }
    echo json_encode($pagos);
}

function getConvenios() {
    $campo = $_POST['campo'];
    $id_concepto = $_POST['id_concepto'];
    $nro_referencia = $_POST['nro_referencia'];

    $db = new My();
    $db->Query("SELECT cod_conv ,nombre,voucher,monto FROM convenios where $campo = $nro_referencia  and id_concepto = $id_concepto;");
    $convenios = array();
    while ($db->NextRecord()) {
        array_push($convenios, $db->Record);
    }
    echo json_encode($convenios);
}

function tiecketEstado($f_nro) {
    $my = new My();
    $ticket = array("estado" => "", "e_sap" => 0);
    $my->Query("SELECT estado,e_sap FROM factura_venta WHERE estado = 'En_caja' AND f_nro = $f_nro");
    if ($my->NextRecord()) {
        $ticket = $my->Record;
    }
    return $ticket;
}

/**
 * Funcion para guardar un cobro en Efectivo x una moneda
 * de una factura de venta,Reserva o de un Pago Recibido
 */
function agregarEfectivo() {
    $campo = $_POST['campo'];
    $id_concepto = $_POST['id_concepto'];
    $nro_referencia = $_POST['nro_referencia'];
    $moneda = $_POST['moneda'];
    $monto = $_POST['monto'];
    $cotiz = $_POST['cotiz'];
    $monto_ref = $_POST['monto_ref'];
    $suc = $_POST['suc'];
    $conceptos = ($id_concepto == '1') ? '1,2' : $id_concepto;

    $usuario = "Sistema";
    if (isset($_POST['usuario'])) {
        $usuario = $_POST['usuario'];
    }

    $moneda_vuelto = "";
    $vuelto = 0;
    $vuelto_ref = 0;
    if (isset($_POST['vuelto']) && $_POST['vuelto'] > 0) {
        $moneda_vuelto = $_POST['moneda_vuelto'];
        $vuelto = $_POST['vuelto'];
        $cotiz_vuelto = $_POST['cotiz_vuelto'];
        $vuelto_ref = $vuelto * $cotiz_vuelto;
    }

    $my = new My();
    $check = true;

    if ($campo == 'f_nro') {
        $ticket = tiecketEstado($nro_referencia);
        $check = ($ticket['estado'] == 'En_caja');
    }

    if ($check) {
        $sql = "select count(*) as cant from efectivo where m_cod = '$moneda' and $campo = $nro_referencia and id_concepto = 1";
        $my->Query($sql);
        $my->NextRecord();
        $cant = $my->Record['cant'];
        if ($cant > 0) {

            $proc = "delete from efectivo where  $campo = $nro_referencia and id_concepto = 2";
            $my->Query($proc);

            if ($monto_ref > 0) {
                $proc = "update efectivo set entrada = $monto,cotiz = $cotiz,entrada_ref = $monto_ref where m_cod = '$moneda' and $campo = $nro_referencia and id_concepto = 1;";
                $my->Query($proc);


                // Registrar el vuelto 

                if ($vuelto > 0) {
                    $proc = "insert into efectivo($campo,usuario,m_cod,salida,cotiz,salida_ref,fecha,hora,fecha_reg,id_concepto,suc,estado)values($nro_referencia,'$usuario','$moneda_vuelto',$vuelto,$cotiz_vuelto,$vuelto_ref,current_date,current_time,current_date,2,'$suc','Pendiente') ";
                    $my->Query($proc);
                }
            } else { // Se borra poque el cajero se arrepintio de lo que cargo o cargo en una moneda erronea
                $proc = "delete from efectivo where m_cod = '$moneda' and $campo = $nro_referencia and id_concepto = 1";
                $my->Query($proc);

                if ($vuelto > 0) {
                    $proc = "insert into efectivo($campo,usuario,m_cod,salida,cotiz,salida_ref,fecha,hora,fecha_reg,id_concepto,suc,estado)values($nro_referencia,'$usuario','$moneda_vuelto',$vuelto,$cotiz_vuelto,$vuelto_ref,current_date,current_time,current_date,2,'$suc','Pendiente') ";
                    $my->Query($proc);
                }
            }
        } else {
            if ($monto_ref > 0) {
                $proc = "insert into efectivo($campo,usuario,m_cod,entrada,cotiz,entrada_ref,fecha,hora,fecha_reg,id_concepto,suc,estado)values($nro_referencia,'$usuario','$moneda',$monto,$cotiz,$monto_ref,current_date,current_time,current_date,$id_concepto,'$suc','Pendiente') ";
                $my->Query($proc);
                // Registrar el vuelto 
                if ($vuelto > 0) {
                    $proc = "insert into efectivo($campo,usuario,m_cod,salida,cotiz,salida_ref,fecha,hora,fecha_reg,id_concepto,suc,estado)values($nro_referencia,'$usuario','$moneda_vuelto',$vuelto,$cotiz_vuelto,$vuelto_ref,current_date,current_time,current_date,2,'$suc','Pendiente') ";
                    $my->Query($proc);
                }
            } else {
                $proc = "delete from efectivo where  $campo = $nro_referencia ";
                $my->Query($proc);
            }
        }

        echo "Ok";
    } else {
        echo "Error el ticket no se encuentra En Caja";
    }
}

function actualizarVuelto() {
    $factura = $_POST['factura'];
    $moneda = $_POST['moneda'];
    $vuelto = $_POST['vuelto'];
    $cotiz = $_POST['cotiz_vuelto'];
    $salida_ref = $vuelto * $cotiz;
    $db = new My();
    $db->Query("update efectivo set salida = $vuelto, salida_ref = $salida_ref,m_cod = '$moneda',cotiz = $cotiz where f_nro = $factura and id_concepto = 2");
    echo "Ok";
}

/**
 * @todo Recibir tipo de convenio y monto con el descuento, el campo puede ser f_nro o nro_reserva por ahora, el 
 * id de concepto es obligatorio vease tabla de conceptos 
 */
function agregarConvenio() {
    $campo = $_POST['campo'];
    $id_concepto = $_POST['id_concepto'];
    $nro_referencia = $_POST['nro_referencia'];

    $monto = $_POST['monto_conv'];
    $conv_cod = $_POST['conv_cod'];
    $conv_nombre = $_POST['conv_nombre'];
    $voucher = $_POST['voucher'];
    $suc = $_POST['suc'];
    $fecha_ret = $_POST['fecha_ret'];
    $timbrado = $_POST['timbrado_ret'];

    $check = true;

    if ($campo == 'f_nro') {
        $ticket = tiecketEstado($nro_referencia);
        $check = ($ticket['estado'] == 'En_caja');
    }

    if ($check) { // Por ahora solo G$ 
        $sql = "INSERT INTO convenios($campo, cod_conv, nombre, tipo, voucher, monto, fecha_acred, neto, estado,fecha,hora,id_concepto,suc,timbrado_ret,fecha_ret,moneda,cotiz)
        VALUES ('$nro_referencia', '$conv_cod', '$conv_nombre', '', '$voucher', $monto, CURRENT_DATE, $monto, 'Pendiente',current_date,current_time,$id_concepto,'$suc','$timbrado','$fecha_ret','G$',1);";

        $my = new My();
        $my->Query($sql);

        $suma = "select sum(monto) total from convenios where $campo = $nro_referencia and id_concepto = $id_concepto;";
        $my->Query($suma);
        $my->NextRecord();
        $total = $my->Record['total'];
        echo $total;
    } else {
        echo "Error el ticket no se encuentra En Caja";
    }
}

function borrarConvenio() {

    $campo = $_POST['campo'];
    $id_concepto = $_POST['id_concepto'];
    $nro_referencia = $_POST['nro_referencia'];

    $conv_cod = $_POST['conv_cod'];
    $voucher = $_POST['voucher'];
    $sql = "delete from convenios where $campo = $nro_referencia and id_concepto = $id_concepto and cod_conv = '$conv_cod' and voucher = '$voucher';";
    $check = true;

    if ($campo == 'f_nro') {
        $ticket = tiecketEstado($nro_referencia);
        $check = ($ticket['estado'] == 'En_caja');
    }

    if ($check) {
        $my = new My();
        $my->Query($sql);
        $suma = "select sum(monto) total from convenios where $campo = $nro_referencia;";
        $my->Query($suma);
        $my->NextRecord();
        $total = $my->Record['total'];

        echo ($total != null) ? $total : "0";
    } else {
        echo "Error el ticket no se encuentra En Caja";
    }
}

function getFacturasContables() {
    $suc = $_POST['suc'];
    $tipo = $_POST['tipo_fact'];
    $tipo_doc = $_POST['tipo_doc'];
    $moneda = $_POST['moneda'];
    $pdv_cod = $_POST['exp'];

    $only_exp = "";
    if (isset($_POST['exp'])) {
        $only_exp = " and pdv_cod = '$pdv_cod' ";
    }

    if ($tipo == 'Pre' || $tipo == 'Pre-Impresa') {
        $tipo = "Pre-Impresa";
    } else {
        $tipo = "Manual";
    }

    if (!isset($_POST['moneda'])) {
        $moneda = "G$";
    }


    $my = new My();
    /* $my->Query("SELECT estab_cont FROM sucursales WHERE suc = '$suc'");
      $my->NextRecord();
      $estab = $my->Record['estab_cont']; */

    $f = "SELECT fact_nro,pdv_cod FROM factura_cont WHERE  suc = '$suc' AND estado = 'Disponible' and tipo_fact = '$tipo' and tipo_doc = '$tipo_doc' and moneda = '$moneda' $only_exp  ORDER BY fact_nro + 0 ASC LIMIT 10";
    //echo $f;
    $my->Query($f);
    $facts = array();
    while ($my->NextRecord()) {
        array_push($facts, $my->Record);
    }
    echo json_encode($facts);
}

function agregarDepositoPorCobroCuota() {

    $nro_cobro = $_POST['trans_num'];
    $cuenta = $_POST['cuenta'];
    $nro_dep = $_POST['nro_dep'];
    $id_banco = $_POST['banco'];
    $fecha_transf = $_POST['fecha_trasnf'];
    $suc = $_POST['suc'];
    $total = $_POST['total'];
    $db = new My();
    $sql = "DELETE FROM bcos_ctas_mov WHERE trans_num = $nro_cobro";
    $db->Query($sql);
    if ($total > 0) {
        $sqlins = "INSERT INTO bcos_ctas_mov(nro_deposito, trans_num, id_banco, cuenta, fecha, hora, entrada, salida, suc, estado, id_concepto)
        VALUES ('$nro_dep', '$nro_cobro', '$id_banco', '$cuenta',CURRENT_DATE, CURRENT_TIME, $total, 0, '$suc', 'Pendiente', 8 );";
        $db->Query($sqlins);
    }
    echo "Ok";
}

function finalizarCobroCuota() {
    $nro_cobro = $_POST['nro_cobro'];
    $db = new My();
    $sql = "UPDATE pagos_recibidos SET estado = 'Cerrado', fecha = current_date,hora = current_time WHERE id_pago = $nro_cobro";
    $db->Query($sql);
    //Actualizo el Estado de la Deuda al finalizar
    $db->Query("UPDATE cuotas c, pago_rec_det d SET c.estado ='Cancelada'  WHERE c.f_nro =  d.factura AND  d.id_cuota = c.id_cuota  AND c.saldo = 0 AND  id_pago = $nro_cobro;");

    echo "Ok";
}

function agregarCheque() {
    $nro_cheque = $_POST['nro_cheque'];
    $cuenta = $_POST['cuenta'];
    $id_banco = $_POST['banco'];
    $factura = $_POST['factura'];
    $fecha_emis = $_POST['emision'];
    $fecha_pago = $_POST['pago'];
    $benef = $_POST['benef'];
    $suc = $_POST['suc'];
    $valor = $_POST['valor'];
    $moneda = $_POST['moneda'];
    $cotiz = $_POST['cotiz'];
    $valor_ref = $_POST['valor_ref'];
    $concepto = $_POST['concepto'];
    $trans_num = $_POST['trans_num'];
    $campo = $_POST['campo'];
    $tipo = $_POST['tipo'];
    $my = new My();
    $sql = "INSERT INTO cheques_ter(nro_cheque, id_banco, f_nro, cuenta,fecha_ins, fecha_emis, fecha_pago, benef, suc, valor, cotiz, valor_ref, motivo_anul, estado, m_cod,id_concepto,trans_num,tipo)
    VALUES ('$nro_cheque', '$id_banco', '$factura', '$cuenta',current_date, '$fecha_emis', '$fecha_pago', '$benef', '$suc', '$valor', '$cotiz', '$valor_ref', '', 'Pendiente', '$moneda',$concepto,$trans_num,'$tipo');";

    $check = true;

    if (strlen($factura) > 1) {
        $ticket = tiecketEstado($factura);
        $check = ($ticket['estado'] == 'En_caja');
    }

    if ($check) {
        $my->Query($sql);
    }


    $my->Query("SELECT SUM(valor_ref) AS TOTAL_CHEQUES FROM cheques_ter WHERE $campo = $trans_num;");
    $my->NextRecord();
    $total = $my->Record['TOTAL_CHEQUES'];
    if ($total == null) {
        echo "0";
    } else {
        echo $total;
    }
}

function getChequesDeFactura() {
    $factura = $_POST['factura'];
    $db = new My();

    $db->Query("SELECT nro_cheque,b.nombre AS banco,cuenta,DATE_FORMAT(fecha_emis,'%d-%m-%Y') AS fecha_emis,DATE_FORMAT(fecha_pago,'%d-%m-%Y') AS fecha_pago,benef,valor,cotiz,valor_ref,m_cod AS moneda 
    FROM cheques_ter t, bancos b WHERE t.id_banco = b.id_banco AND f_nro = $factura;");
    $convenios = array();
    while ($db->NextRecord()) {
        array_push($convenios, $db->Record);
    }
    echo json_encode($convenios);
}

function borrarChequeDeFactura() {
    $factura = $_POST['factura'];
    $nro_cheque = $_POST['nro_cheque'];
    $my = new My();
    $my->Query("delete from cheques_ter where f_nro = '$factura' and nro_cheque = '$nro_cheque'");
    $my->Query("SELECT SUM(valor_ref) AS TOTAL_CHEQUES FROM cheques_ter WHERE f_nro = $factura;");
    $my->NextRecord();
    $total = $my->Record['TOTAL_CHEQUES'];
    echo ($total == null) ? "0" : $total;
}

function borrarChequeDeCobros() {
    $trans_num = $_POST['trans_num'];
    $nro_cheque = $_POST['nro_cheque'];
    $my = new My();
    $my->Query("delete from cheques_ter where trans_num = '$trans_num' and nro_cheque = '$nro_cheque'");
    $my->Query("SELECT SUM(valor_ref) AS TOTAL_CHEQUES FROM cheques_ter WHERE trans_num = $trans_num;");
    $my->NextRecord();
    $total = $my->Record['TOTAL_CHEQUES'];
    echo ($total == null) ? "0" : $total;
}

/**
 * Metodo generico para devolver un array en MySQL
 * @param type $sql
 * @return array
 */
function getResultArray($sql) {
    $db = new My();
    $array = array();
    $db->Query($sql);
    while ($db->NextRecord()) {
        array_push($array, $db->Record);
    }
    $db->Close();
    return $array;
}

function loadUrl(){
    $url = $_REQUEST['url'];    
    $path = "http://".$_SERVER['SERVER_NAME'].":".$_SERVER['SERVER_PORT']."/inmopy";  
    
    $full_path = "$path/$url"; 
    echo   file_get_contents($full_path); 
}
       

/**
 * @todo: Agregar Filtro del Estado de las Cuotas o si ya estan Pagadas filtrar
 */
function verCuentasCliente() {

    $usuario = $_POST['usuario'];
    $CardCode = $_POST['CardCode'];

    $fecha_cheque_diff = date("Y-m-d");

    $dias_intereses_cheque = 0;
    if (isset($_POST['fecha_cheque_diferido'])) {
        $fecha_cheque_diff = $_POST['fecha_cheque_diferido'];
        $my = new My();
        //echo "SELECT DATEDIFF('$fecha_cheque_diff',NOW()) as diff"; 
        $my->Query("SELECT DATEDIFF('$fecha_cheque_diff',NOW()) as diff  ");
        $my->NextRecord();
        $dias_intereses_cheque = $my->Record['diff'];
    }


    $db = new My();

    $sql = "SELECT 'FV' as Tipo ,f.suc ,f.f_nro AS factura,f.fact_nro AS FolioNum, c.id_cuota,DATE_FORMAT(IF(f.fecha_cierre IS NULL,f.fecha,fecha_cierre),'%d-%m-%Y') AS fecha_factura, DATE_FORMAT(vencimiento,'%d-%m-%Y') AS vencimiento ,DATE_FORMAT(fecha_ult_pago,'%d-%m-%Y') as fecha_ult_pago,DATEDIFF(  CURRENT_DATE,fecha_ult_pago ) + $dias_intereses_cheque AS DiasAtraso,monto,c.moneda,monto_ref,saldo,monto - saldo AS pagado,c.cotiz  
 
    FROM factura_venta f, cuotas c WHERE f.f_nro = c.f_nro AND c.estado ='Pendiente' AND cod_cli = '$CardCode' AND f.estado = 'Cerrada' "; // Solo Cerradas

    $cuotas = getResultArray($sql);

    //print_r($cuotas);


    $my = new My();

    for ($i = 0; $i < sizeof($cuotas); $i++) {
        $factura = $cuotas[$i]['factura'];    
        $id_cuota = $cuotas[$i]['id_cuota'];

        // Buscar pagos pendientes de sincronizacion

        $pend = "SELECT count(*) as PagosPendientes from pagos_recibidos p, pago_rec_det d where   p.id_pago = d.id_pago and d.factura = $factura and id_cuota = $id_cuota and p.estado = 'Cerrado' and p.control_caja is null  AND cod_cli = '$CardCode'";
        //echo $pend;
        $my->Query($pend);
        if ($my->NumRows() > 0) {
            $my->NextRecord();
            $pendientes = $my->Record['PagosPendientes'];
            $cuotas[$i]['PagosPendientes'] = $pendientes;
        } else {
            $cuotas[$i]['PagosPendientes'] = 0;
        }


        $my->Query("SELECT  exonerada  FROM exoneraciones WHERE DocNum = $factura AND InstallmentID = $id_cuota order by id_ex desc limit 1");
        if ($my->NumRows()) {
            $my->NextRecord();
            $exonerada = $my->Record['exonerada'];
            $cuotas[$i]['Exonerada'] = $exonerada;
        } else {
            $cuotas[$i]['Exonerada'] = "0";
        }
    }

    echo json_encode($cuotas);
}

function getNotasCreditoCliente(){
    $CardCode = $_POST['CardCode'];    
    echo json_encode( getResultArray("select 'NC' as tipo, n_nro,fact_nro,moneda,f_nro as ref,date_format(fecha,'%d-%m-%Y') as fecha,usuario,clase,if(notas is null,'',notas) as notas,total,saldo  from nota_credito where saldo > 0 and estado = 'Cerrada'  and cod_cli = '$CardCode'") );
}

function generarCuotas() {

    $factura = $_POST['factura'];
    $monto = $_POST['monto'];
    $moneda = $_POST['moneda'];

    $suc = $_POST['suc'];
    $cant_dias = $_POST['fecha_inicio'];
    $cuotas = $_POST['cuotas'];
    $valor_total = $monto * $cuotas;
    $valor_cuota_s_total = 0;

    $valor_total_tmp_st = $_POST['total_factura'];
    $total_restos = 0;


    $residuo = 50;

    if ($moneda == "U$") {
        $residuo = 1;
    }


    if ($monto == "NaN" || $monto == "Infinity") {
        $valor_cuota = 0;
    } else {
        $resto = fmod($valor_total / $cuotas, $residuo); // 50 gs si es G$
        $valor_cuota = ($valor_total / $cuotas) - $resto;
        $valor_cuota_s_total = ($valor_total_tmp_st / $cuotas) - $resto;
        $total_restos = $resto * $cuotas;
    }

    $valor_total_tmp = $valor_total;


    $fecha_inicio = "DATE_ADD(CURRENT_DATE,INTERVAL $cant_dias DAY)";

    if ($valor_cuota > 0) { // Solo si el monto es > 0
        $cotiz = $_POST['cotiz'];
        $tasa_interes = $_POST['tax'];
        $interes = $_POST['interes'];

        $my = new My();
        $my->Query("delete from cuotas where f_nro = $factura");

        for ($i = 0; $i < $cuotas; $i++) {

            //Sumar el Resto a la Ultima cuota
            if ($i == $cuotas - 1) {
                $valor_cuota +=0 + $total_restos;
                $valor_cuota_s_total +=0 + $total_restos;
            }
            $porc = ($valor_cuota * 100) / $valor_total;

            $monto_ref = $valor_cuota * $cotiz;

            $dias = $cant_dias + (30 * $i);

            $insert = "INSERT INTO cuotas(f_nro, id_cuota, moneda, monto, cotiz, tasa_interes, ret_iva, monto_ref, saldo,dias,porcentaje,vencimiento, estado,suc,fecha,hora, fecha_ult_pago)
            VALUES ($factura, $i+1, '$moneda',$valor_cuota, $cotiz,$tasa_interes, $interes,$monto_ref, $valor_cuota,$dias,$porc, DATE_ADD($fecha_inicio,INTERVAL 30 * $i DAY), 'Pendiente','$suc',current_date,current_time,DATE_ADD($fecha_inicio,INTERVAL 30 * $i DAY));";
            //echo $insert;
            $my->Query($insert);
            $valor_total_tmp -= $valor_cuota;
            $valor_total_tmp_st -= $valor_cuota_s_total;
        }
        $set_cuotas = "update factura_venta set cant_cuotas = $cuotas where f_nro = $factura;";
        $db = new My();
        $db->Query($set_cuotas);
        $sql = "select id_cuota, moneda, monto, cotiz, tasa_interes, ret_iva, monto_ref,monto as valor_total, date_format(vencimiento,'%d-%m-%Y') as vencimiento, estado from cuotas where f_nro = $factura;";

        echo json_encode(getResultArray($sql));
    } else {
        echo json_encode(array("mensaje" => "Error valor de cuota <= 0"));
    }
}

function getCuotasDeFactura() {
    $factura = $_POST['factura'];
    $db = new My();
    $sql = "select id_cuota, moneda, monto, cotiz, tasa_interes, ret_iva, monto_ref,monto as valor_total, date_format(vencimiento,'%d-%m-%Y') as vencimiento, estado from cuotas where f_nro = $factura;";
    echo json_encode(getResultArray($sql));
}

function eliminarCuotas() {
    $factura = $_POST['factura'];
    $my = new My();
    $my->Query("delete from cuotas where f_nro = $factura");
    $set_cuotas = "update factura_venta set cant_cuotas = 0 where f_nro = $factura;";
    $my->Query($set_cuotas);
    echo "Ok";
}

function exonerarIntereses() {
    $DocNum = $_POST['DocNum'];
    $InstlmntID = $_REQUEST['id_cuota'];
    $usuario = $_REQUEST['usuario'];
    $exonerar = $_POST['exonerar']; //1 exonerar o 0 no exonerar
    $my = new My();

    $my->Query("INSERT INTO exoneraciones(usuario, DocNum, InstallmentID, fecha,exonerada)VALUES ('$usuario', '$DocNum', '$InstlmntID',CURRENT_TIMESTAMP,$exonerar);");
    if ($exonerar == "1") {
        echo "Exonerada";
    } else {
        echo "No Exonerada";
    }
}

function saveMargins() {
    $db = new My();

    $key = $_REQUEST['key'];
    $value = $_REQUEST['value'];
    $usuario = $_REQUEST['usuario'];
    $descrip = "";
    if ($key == "factura_margen_sup") {
        $descrip = "1 Arriba";
    } elseif ($key == "factura_margen_der") {
        $descrip = "2 Derecha";
    } elseif ($key == "factura_margen_inf") {
        $descrip = "3 Inferior";
    } elseif ($key == "factura_margen_izq") {
        $descrip = "4 Izquierda";
    } else {
        $descrip = "5 Intervalo de Documento";
        $db->Query("UPDATE parametros SET valor = $value,descrip = '5 Intervalo de Documento' WHERE clave = 'factura_interval_dup' and usuario = '$usuario';"); // Siempre es 0
        if ($db->AffectedRows() < 1) {
            $db->Query("INSERT INTO parametros(clave,usuario,valor,descrip)VALUES('factura_interval_dup','$usuario',$value,'5 Intervalo de Documento');");
        }
    }

    $db->Query("UPDATE parametros SET valor = $value,descrip = '$descrip' WHERE clave = '$key' and usuario = '$usuario';");

    if ($db->AffectedRows() < 1) {
        $db->Query("INSERT INTO parametros(clave,usuario,valor,descrip)VALUES('$key','$usuario','$value','$descrip');");
    }
}

function getUsersParams() {

    $datos = array();
    $user = $_POST['user'];
    if ($user !== 'default') {
        $link = new My();
        $link->Query("select clave,valor from parametros where usuario='$user'");

        while ($link->NextRecord()) {
            $datos[$link->Record['clave']] = $link->Record['valor'];
        }

        $link->Close();
        echo json_encode($datos, JSON_FORCE_OBJECT);
    } else {
        echo '{"factura_interval_dup":"54","factura_margen_der":"5","factura_margen_inf":"0","factura_margen_izq":"5","factura_margen_sup":"50"}';
    }
}

function controlarPagosFactura($f_nro, $ticket_reserva) {
    $link = new My();
    $query = "SELECT SUM(IF(u.mov IS NULL,0,u.mov)) AS total, SUM(IF(u.total IS NULL, 0, u.total * u.cotiz)) AS fact FROM  
    (SELECT 'efectivo' AS tipo,SUM(entrada_ref - salida_ref) AS mov, '' AS total,cotiz FROM efectivo WHERE f_nro=$f_nro 
    UNION SELECT 'chq' AS tipo,SUM(valor_ref) AS mov, '' AS total,cotiz FROM cheques_ter WHERE f_nro=$f_nro 
    UNION SELECT 'cuota' AS tipo,SUM(monto_ref) AS mov, '' AS total,cotiz FROM cuotas WHERE f_nro=$f_nro 
    UNION SELECT 'conv' AS tipo,SUM(monto) AS mov, '' AS total,cotiz FROM convenios WHERE f_nro=$f_nro 
    UNION SELECT 'FV' AS tipo,'' AS mov,total,cotiz FROM factura_venta f WHERE f_nro =  $f_nro 
    UNION SELECT 'RES' AS tipo,SUM(senia_entrega_ref) AS mov, '' AS total, 1 AS cotiz FROM reservas WHERE nro_reserva='$ticket_reserva') AS u";
    $link->Query($query);
    if ($link->NextRecord()) {
        $sumMovs = (float) ($link->Record['total']);
        $totalFact = (float) ($link->Record['fact']);
        $total_diff = $sumMovs - $totalFact;
        if (round($total_diff) == 0) {
            return "Ok";
        } else {
            return "Total factura=" . $totalFact . ", Suma de Movimientos:" . $sumMovs;
        }
    }
}

function eliminarVenta() {
    $db = new My();
    $factura = $_REQUEST['factura'];
    $db->Query("SELECT COUNT(*) AS cant FROM fact_vent_det WHERE f_nro = $factura");
    $db->NextRecord();
    $cant = $db->Record['cant'];
    if ((int) $cant > 0) {
        echo "false";
    } else {
        $db->Query("DELETE FROM factura_venta WHERE f_nro =  $factura");
        echo "true";
    }
}

function cerrarReserva() {
    $db = new My();
    $reserva = $_REQUEST['reserva'];
    $usuario = $_REQUEST['usuario'];
    $suc = $_REQUEST['suc'];
    $moneda_vuelto = $_REQUEST['moneda_vuelto'];
    $vuelto = $_REQUEST['vuelto'];
    $cotiz = $_REQUEST['cotiz'];
    $vuelto_gs = $_REQUEST['vuelto_gs'];
    $valor_total_pagar_gs = $_REQUEST['valor_total_pagar_gs'];
    $total_entrega = $_REQUEST['total_entrega'];
    $senia_entrega_ref = $total_entrega - $vuelto_gs;

    $db->Query("UPDATE reservas SET senia_entrega_ref = $senia_entrega_ref,  estado = 'Pendiente', fecha_cierre = current_date, hora_cierre = current_time WHERE nro_reserva = $reserva;");
    if ($vuelto_gs > 0) {
        $db->Query("INSERT INTO efectivo(nro_reserva, m_cod, entrada,salida, cotiz,entrada_ref,salida_ref,fecha,hora,id_concepto,suc,estado)VALUES ('$reserva', '$moneda_vuelto',0, $vuelto, $cotiz,0,$vuelto_gs,current_date,current_time,4,'$suc','Pendiente');");
    }
    makeLog($usuario, "Cerrar Reserva", "Reserva Nro: $reserva", 'Reserva', $reserva);
    echo "Ok";
}

function getValorReserva() {
    $db = new My();
    $reserva = $_REQUEST['reserva'];
    $cod_cli = $_REQUEST['cod_cli'];

    $db->Query("SELECT senia_entrega_ref,estado,vencimiento,cod_cli,cliente FROM  reservas WHERE nro_reserva = $reserva");
    if ($db->NumRows() > 0) {
        $db->NextRecord();
        $estado = $db->Record['estado'];
        $valor = $db->Record['senia_entrega_ref'];
        $expira = $db->Record['vencimiento'];
        $cli_res = $db->Record['cod_cli'];
        $cliente = $db->Record['cliente'];
        if ($cli_res == $cod_cli) {
            echo json_encode(array('estado' => $estado, 'valor' => $valor, 'expira' => $expira, 'mensaje' => ''));
        } else {
            echo json_encode(array('estado' => 'Error', 'valor' => '0', 'expira' => '', 'mensaje' => "Esta reserva no le pertenece a este Cliente. Reservado a Nombre de: $cliente"));
        }
    } else {
        echo json_encode(array('estado' => 'Error', 'valor' => '0', 'expira' => '', 'mensaje' => 'No se encuentra el ticket de Reserva, verifique si el N&iacute;mero esta correcto.'));
    }
}

function detalleFacturaEmpaque() {
    $factura = $_REQUEST['factura'];
    $usuario = $_REQUEST['usuario'];
    $suc = $_REQUEST['suc'];

    $db = new My();
    $dbi = new My();

    $db->Query("select empaque from factura_venta WHERE f_nro =  $factura");
    $db->NextRecord();
    $estado = $db->Record['empaque'];
    if ($estado == 'No') {
        $db->Query("UPDATE factura_venta SET empaque = 'Pr',empaquetador = '$usuario' WHERE f_nro =  $factura");
        $sql = "SELECT d.codigo,lote,d.descrip,d.um_prod,um_cod AS um,cantidad,precio_venta,gramaje,d.ancho,d.tara,kg_calc,cod_falla,cod_falla_e,falla_real,sis_med,kg_med,cant_med,a.mnj_x_lotes,a.img FROM fact_vent_det d, articulos a WHERE a.codigo = d.codigo AND f_nro =$factura;";
        $datos = getResultArray($sql);

        for ($i = 0; $i < sizeof($datos); $i++) {
            $codigo = $datos[$i]['codigo'];
            $lote = $datos[$i]['lote'];
            $mnj_x_lotes = $datos[$i]['mnj_x_lotes'];

            //echo ">>>$codigo   $lote   $mnj_x_lotes <br>";

            if ($mnj_x_lotes == "Si") {
                $dbi->Query("SELECT l.img,a.cantidad AS stock_real FROM stock a, lotes l WHERE a.codigo = l.codigo AND a.lote = l.lote AND a.codigo = '$codigo' and a.lote = '$lote'  AND a.suc = '$suc'");
                $dbi->NextRecord();
                $img = $dbi->Get('img');
                $stock_real = $dbi->Get('stock_real');

                if (is_null($img) || $img == "") {
                    $img = "0/0";
                }
                $datos[$i]['img'] = $img;
                $datos[$i]['stock_real'] = $stock_real;
            }
        }
        echo json_encode($datos);
    } else {
        echo json_encode(array("Error" => "Factura en Edicion"));
    }
}

function cancelarControlEmpaque() {
    $factura = $_REQUEST['factura'];
    $usuario = $_REQUEST['usuario'];
    $db = new My();
    $db->Query("UPDATE factura_venta SET empaque = 'No'  WHERE f_nro =  $factura");
    makeLog($usuario, "Cancelo controlFactura: $factura", 'Empaque', 'Factura', $factura);
    echo "Ok";
}

function liberarVentasEnProceso() {
    $usuario = $_REQUEST['usuario'];
    $db = new My();
    $db->Query("UPDATE factura_venta SET empaque = 'No'  WHERE empaquetador =  '$usuario' and empaque = 'Pr'");
    echo "Ok";
}

function getVentasEnProcesoEmpaque() {
    $usuario = $_REQUEST['usuario'];
    $db = new My();
    $db->Query("select count(*) as procesando  from factura_venta  WHERE empaquetador =  '$usuario' and empaque = 'Pr'");
    $db->NextRecord();
    $procesando = $db->Record['procesando'];
    echo $procesando;
}

function getVentasEnProcesoEmpaqueTodos() {
    $suc = $_REQUEST['suc'];
    $db = new My();
    $pendientes = array();
    $db->Query("select empaquetador,date_format(fecha,'%d-%m-%Y') as fecha,count(*) as procesando  from factura_venta  WHERE empaque = 'Pr' and suc='$suc' group by empaquetador,fecha");
    while ($db->NextRecord()) {
        $pendientes[$db->Record['empaquetador']] = "Fecha: " . $db->Record['fecha'] . "    Procesando: " . $db->Record['procesando'];
    }
    echo json_encode($pendientes);
}

function getImagenLotes() {
    $lotes = json_decode($_REQUEST['lotes']);
    $suc = $_REQUEST['suc'];

    $grupo = "";
    foreach ($lotes as $lote) {
        $grupo.="'$lote',";
    }
    $grupo = substr($grupo, 0, -1);
    $sql = "SELECT l.lote AS Lote,l.img AS Img, SUM(s.cantidad) AS StockReal  FROM articulos a INNER JOIN lotes l ON a.codigo = l.codigo INNER JOIN pantone p ON l.pantone = p.pantone INNER JOIN stock s ON s.codigo = l.codigo AND s.lote = l.lote AND s.cantidad > 0 AND s.estado_venta <> 'FP'
    AND  s.suc = '$suc' AND l.lote IN($grupo)";

    echo json_encode(getResultArray($sql));
}

function cambiarCantidadVenta() {

    echo "Chequear " . __LINE__;
    $db = new My();
    $factura = $_REQUEST['factura'];
    $lote = $_REQUEST['codigo'];
    $cantidad = $_REQUEST['cantidad'];
    $old_cant = $_REQUEST['old_cant'];
    $usuario = $_REQUEST['usuario'];

    $db->Query("select cod_desc, tipo_doc_cli from factura_venta where f_nro = $factura");
    $db->NextRecord();
    $cod_desc = $db->Record['cod_desc'];
    $tipo_doc_cli = $db->Record['tipo_doc_cli'];

    $db->Query("select um_cod, precio_venta,descuento,subtotal,gramaje,ancho,falla_real from fact_vent_det where f_nro = $factura and lote = '$lote' limit 1;");
    $db->NextRecord();
    $um = $db->Record['um_cod'];
    $precio_venta = $db->Record['precio_venta'];
    $descuento = $db->Record['descuento'];
    $subtotal_ant = $db->Record['subtotal'];
    $gramaje = $db->Record['gramaje'];
    $ancho = $db->Record['ancho'];
    $falla = $db->Record['falla_real'];
    $subtotal = 0;
    $porc_desc = 1;

    $subtotal = $cantidad * $precio_venta;

    if ($descuento > 0) {
        $porc_desc = round(($descuento * 100) / ($descuento + $subtotal_ant ));
        $new_desc = ($cantidad * $precio_venta) * $porc_desc / 100;
        $subtotal = $subtotal - $new_desc;
    } else {
        $new_desc = 0;
    }
    $kg_calc = 0;
    if ($um == "Mts") {
        if ($gramaje > 0 && $ancho > 0) {
            $kg_calc = ($gramaje * $ancho * ($cantidad + $falla)) / 1000;
            $db->Query("update fact_vent_det set cantidad = $cantidad,kg_calc = $kg_calc, subtotal = round($subtotal,2), descuento = $new_desc   where f_nro = $factura and lote = '$lote'");
        } else {
            $db->Query("update fact_vent_det set cantidad = $cantidad,kg_calc = 0, subtotal = round($subtotal,2), descuento = $new_desc where f_nro = $factura and lote = '$lote'");
        }
    } else if ($um == "Kg") {
        $kg_falla = ($gramaje * $ancho * $falla) / 1000;
        $kg_calc = $cantidad + $kg_falla;
        $db->Query("update fact_vent_det set cantidad = $cantidad,kg_calc = $kg_calc, subtotal = round($subtotal,2), descuento = $new_desc where f_nro = $factura and lote = '$lote'");
    } else { // Unid
        $db->Query("update fact_vent_det set cantidad = $cantidad,kg_calc = 0, subtotal = round($subtotal,2), descuento = $new_desc where f_nro = $factura and lote = '$lote'");
    }
    actualizarCabeceraFactura($factura, $cod_desc, $tipo_doc_cli);
    makeLog($usuario, "Modificar", "Modifico cantidad de venta Factura: $factura Codigo: $codigo $old_cant x $cantidad  CodDesc:$cod_desc   DocCli:$tipo_doc_cli ", 'Factura', $factura);
    echo "Ok";
}

function cambiarCantidadFalla() {
    $db = new My();
    $factura = $_REQUEST['factura'];
    $lote = $_REQUEST['codigo'];
    $falla = $_REQUEST['falla'];
    $old_falla = $_REQUEST['old_falla'];
    $usuario = $_REQUEST['usuario'];

    $db->Query("select cod_desc from factura_venta where f_nro = $factura");
    $db->NextRecord();
    $cod_desc = $db->Record['cod_desc'];

    $db->Query("select um_cod, precio_venta,descuento,subtotal,gramaje,ancho,cantidad,cod_falla_e from fact_vent_det where f_nro = $factura and lote = '$lote' limit 1;");
    $db->NextRecord();
    $um = $db->Record['um_cod'];
    $precio_venta = $db->Record['precio_venta'];
    $descuento = $db->Record['descuento'];
    $subtotal_ant = $db->Record['subtotal'];
    $gramaje = $db->Record['gramaje'];
    $ancho = $db->Record['ancho'];
    $cod_falla_e = $db->Record['cod_falla_e'];
    $cantidad = $db->Record['cantidad'];
    $subtotal = 0;
    $porc_desc = 1;

    $subtotal = $cantidad * $precio_venta;

    if ($descuento > 0) {
        $porc_desc = round(($descuento * 100) / ($descuento + $subtotal_ant ));
        $new_desc = ($cantidad * $precio_venta) * $porc_desc / 100;
        $subtotal = $subtotal - $new_desc;
    } else {
        $new_desc = 0;
    }
    $kg_calc = 0;
    if ($um == "Mts") {
        if ($gramaje > 0 && $ancho > 0) {
            $kg_calc = ($gramaje * $ancho * ($cantidad + $falla)) / 1000;
            $db->Query("update fact_vent_det set falla_real = $falla,kg_calc = $kg_calc, subtotal = round($subtotal,2), descuento = $new_desc, cod_falla = cod_falla_e   where f_nro = $factura and lote = '$lote'");
        } else {
            $db->Query("update fact_vent_det set falla_real = $falla,kg_calc = 0, subtotal = round($subtotal,2), descuento = $new_desc , cod_falla = cod_falla_e where f_nro = $factura and lote = '$lote'");
        }
    } else if ($um == "Kg") {
        $kg_falla = ($gramaje * $ancho * $falla) / 1000;
        $kg_calc = $cantidad + $kg_falla;
        $db->Query("update fact_vent_det set falla_real = $falla,kg_calc = $kg_calc, subtotal = round($subtotal,2), descuento = $new_desc, cod_falla = cod_falla_e  where f_nro = $factura and lote = '$lote'");
    } else { // Unid
        $db->Query("update fact_vent_det set falla_real = $falla,kg_calc = 0, subtotal = round($subtotal,2), descuento = $new_desc, cod_falla = cod_falla_e  where f_nro = $factura and lote = '$lote'");
    }
    actualizarCabeceraFactura($factura, $cod_desc);
    makeLog($usuario, "Modificar", "Modifico Falla de venta Factura: $factura Codigo: $codigo $old_falla x $falla", 'Factura', $factura);
    echo "Ok";
}

function guardarControlEmpaque() {
    $db = new My();
    $factura = $_REQUEST['factura'];
    $lote = $_REQUEST['lote'];
    $verificador = $_REQUEST['verificador'];
    $medicion = $_REQUEST['medicion'];
    $sis_med = $_REQUEST['sis_med'];
    $calc = $_REQUEST['calc'];
    $diff = $_REQUEST['diff'];
    $fuera_rango = $_REQUEST['fuera_rango'];
    $ajuste = $_REQUEST['ajuste'];
    $falla = $_REQUEST['falla'];
    $um = $_REQUEST['um'];
    $db->Query("update fact_vent_det set kg_med = $medicion,sis_med = '$sis_med',cant_med = $calc, fuera_rango = $fuera_rango,dif = $diff,tipo_desc = '$ajuste', verificador = '$verificador' where f_nro = $factura and lote = '$lote';");
    echo "Ok";
}

function guardarControlLaser() {
    $db = new My();
    $factura = $_REQUEST['factura'];
    $lote = $_REQUEST['lote'];
    $db->Query("update fact_vent_det set  control_laser = CURRENT_TIMESTAMP where f_nro = $factura and lote = '$lote';");
    echo "Ok";
}

function verificarPunteoLector() {
    $factura = $_REQUEST['factura'];
    $sql = "SELECT fact_nro AS factura_legal,  GROUP_CONCAT(lote) AS faltantes FROM factura_venta f, fact_vent_det d WHERE f.f_nro = d.f_nro AND  f.f_nro = $factura AND control_laser IS NULL";
    echo json_encode(getResultArray($sql));
}

/* Empaquetadores Finalizan Control ya no envian a Caja */

function enviarFacturaCaja() {

    $factura = $_REQUEST['factura'];
    $usuario = $_REQUEST['usuario'];

    $my = new My();

    $tipo_doc_sql = "select tipo_doc_cli,suc from factura_venta where f_nro = $factura";
    $my->Query($tipo_doc_sql);
    $tipo_doc = "C.I.";
    $divisor = 1;
    if ($my->NumRows() > 0) {
        $my->NextRecord();
        $tipo_doc = $my->Record['tipo_doc_cli'];
    } else {
        $tipo_doc = "C.I.";
    }
    if ($tipo_doc === 'C.I. Diplomatica') {
        $divisor = 1.1;
    }

    $suc = $my->Record['suc'];


    $sql_total = "SELECT SUM(subtotal) as Total,SUM(descuento) as Descuento FROM fact_vent_det WHERE f_nro = $factura";
    $my->Query($sql_total);
    $my->NextRecord();
    $total = $my->Record['Total'];
    $descuento = $my->Record['Descuento'];
    $total_sin_desc = $total + $descuento;


    $link = new My();

    /*
      $link->Query("SELECT ItemCode,cast(round(Quantity - IsCommited,2) as numeric(20,2)) as Stock, U_gramaje,U_ancho,U_factor_precio,U_img,U_F1,U_F2,U_F3"
      . " FROM OIBT WHERE BatchNum = '$lote' ;"); //Lote
      $link->NextRecord();
      $codigo = $link->Record['ItemCode'];
      $stock = $link->Record['Stock'];
     */

    // Borro ajustes si existe y hago todo de nuevo
    $db = new My();
    $db->Query("delete from ajustes where f_nro = $factura");
    // Recorrer Factura y hacer ajustes necesarios 
    $db->Query("SELECT d.codigo,d.lote,d.um_prod,d.um_cod, d.cantidad,cod_falla_e,falla_real,fuera_rango,dif,tipo_desc,cant_med, s.tipo_ent, s.nro_identif,s.linea,a.mnj_x_lotes,l.gramaje,l.ancho,l.tara
    FROM fact_vent_det  d , stock s,articulos a, lotes l WHERE d.codigo = a.codigo AND f_nro = $factura AND um_cod != 'Unid' AND d.codigo = s.codigo AND d.lote = s.lote AND s.suc = '$suc' AND mnj_x_lotes = 'Si' AND s.codigo = l.codigo AND s.lote = l.lote");
    $i = 0;
    while ($db->NextRecord()) {

        $codigo = $db->Record['codigo'];
        $lote = $db->Record['lote'];
        $cod_falla_e = $db->Record['cod_falla_e'];
        $falla_real = $db->Record['falla_real'];
        $fuera_rango = $db->Record['fuera_rango'];
        $tipo_desc = $db->Record['tipo_desc'];
        $cant_med = $db->Record['cant_med'];
        $um = $db->Record['um_cod'];
        $diff = $db->Record['dif'];
        $tipo_ent = $db->Get('tipo_ent');
        $nro_identif = $db->Get('nro_identif');
        $linea = $db->Get('linea');
        $gramaje = $db->Get('gramaje');
        $ancho = $db->Get('ancho');
        $tara = $db->Get('tara');


        $link->Query("SELECT s.cantidad AS stock_real,a.costo_prom FROM stock s, articulos a WHERE a.codigo = s.codigo AND   s.codigo = '$codigo' AND s.lote = '$lote'    AND s.suc = '$suc'");
        $link->NextRecord();
        $precio_costo = $link->Record['costo_prom'];
        $StockReal = $link->Record['stock_real'];

        $my->Query("UPDATE fact_vent_det d SET precio_costo = $precio_costo WHERE f_nro = $factura AND precio_costo IS NULL AND codigo = '$codigo'");


        if ($cant_med > $StockReal) { // Ajustar para que Finalmente quede en 0
            $diferencia = $cant_med - $StockReal;
            $valor_dif = $precio_costo * $diferencia;
            $ajpos = "INSERT INTO ajustes( usuario,f_nro, codigo, lote, tipo,signo, inicial, ajuste, final, motivo, fecha, hora, um, estado,suc,p_costo,valor_ajuste, e_sap)
            VALUES ('Sistema',$factura, '$codigo', '$lote', 'Aumento x exedente','+',0,$diferencia, 0,'FP', CURRENT_DATE, CURRENT_TIME, 'Mts', 'Pendiente','$suc',$precio_costo,$valor_dif,0);";
            $my->Query($ajpos);
            //Historial

            $db->Query("select id_ajuste from ajustes where usuario = 'Sistema' and codigo = '$codigo' and lote = '$lote' and signo = '+' order by id_ajuste desc limit 1");
            $db->NextRecord();
            $id_ajuste = $db->Get('id_ajuste');

            $db->Query("INSERT INTO historial( suc, codigo, lote, tipo_ent, nro_identif, linea, tipo_doc, nro_doc, fecha_hora, usuario, direccion, cantidad, gramaje, tara, ancho)
            VALUES ( '$suc', '$codigo', '$lote', '$tipo_ent', $nro_identif, $linea, 'AJ', $id_ajuste, CURRENT_TIMESTAMP, '$usuario', 'E', $diferencia, $gramaje, $tara, $ancho);");
        }

        if ($diff != 0) {
            $tipo = "";
            $signo = "+";
            $_E_S = "E";

            if ($diff > 0) {
                $tipo = 'Disminucion en Salida';
                $signo = "-";
                $_E_S = "S";
            } else {
                $tipo = 'Aumento en Salida';
                $diff = $diff * -1;
            }

            $valor_ajuste = $precio_costo * $diff;

            $aj = "INSERT INTO ajustes( usuario,f_nro, codigo, lote, tipo,signo, inicial, ajuste, final, motivo, fecha, hora, um, estado,suc,p_costo,valor_ajuste, e_sap)
            VALUES ('$usuario',$factura, '$codigo', '$lote', '$tipo','$signo',0,$diff, 0,'$tipo_desc', CURRENT_DATE, CURRENT_TIME, 'Mts', 'Pendiente','$suc',$precio_costo,$valor_ajuste,0);";
            //echo $aj;
            $my->Query($aj);
            // Historial   
            $db->Query("select id_ajuste from ajustes where usuario = '$usuario' and codigo = '$codigo' and lote = '$lote' and signo = '$signo' order by id_ajuste desc limit 1");
            $db->NextRecord();
            $id_ajuste = $db->Get('id_ajuste');

            $db->Query("INSERT INTO historial( suc, codigo, lote, tipo_ent, nro_identif, linea, tipo_doc, nro_doc, fecha_hora, usuario, direccion, cantidad, gramaje, tara, ancho)
            VALUES ( '$suc', '$codigo', '$lote', '$tipo_ent', $nro_identif, $linea, 'AJ', $id_ajuste, CURRENT_TIMESTAMP, '$usuario', '$_E_S', $diff, $gramaje, $tara, $ancho);");
        }

        if ($falla_real > 0) {
            $tipo = "Descuento por Falla";
            $valor_ajuste = $precio_costo * $falla_real;
            $my->Query("INSERT INTO ajustes( usuario,f_nro, codigo, lote, tipo,signo, inicial, ajuste, final, motivo, fecha, hora, um, estado,suc,p_costo,valor_ajuste, e_sap)
            VALUES ('$usuario',$factura, '$codigo', '$lote', '$tipo-$cod_falla_e','-',0,$falla_real, 0, 'D.F.', CURRENT_DATE, CURRENT_TIME, 'Mts', 'Pendiente','$suc',$precio_costo,$valor_ajuste,0);");

            // Historial   
            $db->Query("select id_ajuste from ajustes where usuario = '$usuario' and codigo = '$codigo' and lote = '$lote' and signo = '-' order by id_ajuste desc limit 1");
            $db->NextRecord();
            $id_ajuste = $db->Get('id_ajuste');

            $db->Query("INSERT INTO historial( suc, codigo, lote, tipo_ent, nro_identif, linea, tipo_doc, nro_doc, fecha_hora, usuario, direccion, cantidad, gramaje, tara, ancho)
            VALUES ( '$suc', '$codigo', '$lote', '$tipo_ent', $nro_identif, $linea, 'AJ', $id_ajuste, CURRENT_TIMESTAMP, '$usuario', 'S', -$falla_real, $gramaje, $tara, $ancho);");
        }
    }

    //$my->Query("update factura_venta set estado= 'En_caja',empaque='Si',total=$total,total_desc= $descuento,total_bruto = $total_sin_desc where f_nro = $factura;");
    $my->Query("update factura_venta set empaque='Si'  where f_nro = $factura;");

    makeLog('Sistema', "Control Empaque", "Fin control factura $factura ", 'Factura', $factura);


    descontarStock($factura);

    echo "Ok";
}

function cerrarVenta() {
    $db = new My();
    $factura = $_REQUEST['factura'];
    $usuario = $_REQUEST['usuario'];
    $moneda_vuelto = $_REQUEST['moneda_vuelto'];
    $clase = $_REQUEST['clase'];

    $cotiz = $_REQUEST['cotiz'];
    $vuelto_gs = $_REQUEST['vuelto_gs'];  //$vuelto * $cotiz;    vuelto_gs
    $vuelto = round($vuelto_gs / $cotiz, 6);
    $ticket_reserva = $_REQUEST['ticket_reserva'];
    $suc = $_REQUEST['suc'];
    $tipo_pago = $_REQUEST['tipo_factura'];

    // Controlar Stock
    $control = controlarStockFactura($factura);
    if ($control == "Ok") {

        $controlPagos = controlarPagosFactura($factura, $ticket_reserva);
        if ($controlPagos == "Ok") {
            $set_reserva = "";
            if ($ticket_reserva != "") {
                $set_reserva = " ,nro_reserva = $ticket_reserva ";
                $db->Query("UPDATE factura_venta SET estado = 'Cerrada',tipo = '$tipo_pago', fecha_cierre = current_date, hora_cierre = current_time $set_reserva  WHERE f_nro = $factura;");
                $db->Query("UPDATE reservas set estado = 'Retirada' where nro_reserva = $ticket_reserva");
            } else {
                $db->Query("UPDATE factura_venta SET estado = 'Cerrada',tipo = '$tipo_pago', fecha_cierre = current_date, hora_cierre = current_time $set_reserva  WHERE f_nro = $factura;");
            }
            //echo "UPDATE factura_venta SET estado = 'Cerrada', fecha_cierre = current_date, hora_cierre = current_time $set_reserva  WHERE f_nro = $factura;";
            // Actualizo las Fechas de Efectivo etc
            $db->Query("UPDATE efectivo SET fecha = CURRENT_DATE, hora = CURRENT_TIME WHERE f_nro = $factura");

            $db->Query("UPDATE convenios SET fecha = CURRENT_DATE, hora = CURRENT_TIME WHERE f_nro = $factura");
            $db->Query("UPDATE cheques_ter SET fecha_ins = CURRENT_DATE   WHERE f_nro =  $factura");
            $db->Query("UPDATE cuotas SET fecha = CURRENT_DATE, hora = CURRENT_TIME WHERE f_nro = $factura");
            $db->Query("UPDATE orden_procesamiento p ,  fact_vent_det d SET p.estado = 'Vendido' WHERE d.lote = p.lote    AND d.f_nro =  $factura");

            if ($clase !== "Servicio") {
                descontarStock($factura);
            } else {
                actualizarFechaUltimoPagoCuotas($factura);
            }

            makeLog($usuario, "Cerrar Venta", "Factura Nro: $factura", 'Factura', $factura);

            echo "Ok";
        } else {
            echo $controlPagos;
        }
    } else {
        echo $control;
    }
}

function actualizarFechaUltimoPagoCuotas($factura) {
    $db = new My();
    $my = new My();
    $db->Query("SELECT ref_factura,ref_cuota FROM fact_vent_det WHERE f_nro = $factura and ref_factura is not null and ref_factura is not null;");
    while ($db->NextRecord()) {
        $ref = $db->Get('ref_factura');
        $cuota = $db->Get('ref_cuota');
        $my->Query("update cuotas set fecha_ult_pago = current_date where f_nro = $ref and id_cuota = $cuota;");
    }
}

function descontarStock($factura) {
    //Verificar si Caja = 'Cerrada' y Empaque = 'Si'
    $db = new My();
    $dbi = new My();
    $db_update = new My();

    $db->Query("SELECT IF(estado = 'Cerrada' AND empaque = 'Si','Si','No') AS ambos_estados,suc,usuario  FROM factura_venta where f_nro = $factura");
    $db->NextRecord();
    $estado = $db->Get("ambos_estados");
    $suc = $db->Get("suc");
    $usuario = $db->Get("usuario");

    if ($estado == "Si") {
        $dbi->Query("SELECT d.codigo,d.lote,d.cantidad, s.tipo_ent, s.nro_identif,s.linea,a.mnj_x_lotes,a.um,art_inv,um_cod as um_venta,d.gramaje,d.ancho,d.tara ,falla_real,dif,tipo_desc,precio_costo   FROM fact_vent_det d, stock s,articulos a WHERE d.codigo = a.codigo AND f_nro = $factura AND d.codigo = s.codigo AND d.lote = s.lote AND s.suc = '$suc'");
        //fuera_rango no es necesario descontar ya esta incluido en diff
        while ($dbi->NextRecord()) {

            $codigo = $dbi->Get('codigo');
            $lote = $dbi->Get('lote');
            $mnj_x_lotes = $dbi->Get('mnj_x_lotes');

            $tipo_ent = $dbi->Get('tipo_ent');
            $nro_identif = $dbi->Get('nro_identif');
            $linea = $dbi->Get('linea');
            $art_inv = $dbi->Get('art_inv');

            $um_inv = $dbi->Get('um');

            $gramaje_venta = $dbi->Get('gramaje');
            $ancho_venta = $dbi->Get('ancho');
            $tara = $dbi->Get('tara');  // Tara no tomar en cuenta
            $tara = 0;
            $um_venta = $dbi->Get('um_venta');
            $cantidad = $dbi->Get('cantidad');
            $falla_real = $dbi->Get('falla_real');
            $dif = $dbi->Get('dif');

            //precio_costo
            //Calcular aqui si la unidad de medida de venta es diferente a la de inventario

            $cant_descontar = ""; // Inducir al error temporalmente hasta que abarque todos los casos
            $cant_falla_descontar = "";
            $cant_diff_descontar = "";

            if (($um_inv === "Mts" || $um_inv === "Unid") && ($um_venta === "Mts" || $um_venta === "Unid")) {
                $cant_descontar = $cantidad;
                $cant_falla_descontar = $falla_real;
                $cant_diff_descontar = $dif;
            } else if ($um_inv === "Mts" && $um_venta === "Kg") {
                $cant_descontar = (($cantidad - ($tara / 1000)) * 1000) / ($gramaje_venta * $ancho_venta); //Mts
                $cant_falla_descontar = $falla_real;
                $cant_diff_descontar = $dif;
            } else if (($um_inv === "Kg") && ($um_venta === "Kg")) {
                $cant_descontar = $cantidad;
                $cant_falla_descontar = ($falla_real * $gramaje_venta * $ancho_venta ) / 1000;   // Convertido a Kg  
                $cant_diff_descontar = ($dif * $gramaje_venta * $ancho_venta ) / 1000;
                ;
            } else if (($um_inv === "Kg") && ($um_venta === "Mts")) {
                $cant_descontar = ($cantidad * $gramaje_venta * $ancho_venta) / 1000; //Kg
                $cant_falla_descontar = ($falla_real * $gramaje_venta * $ancho_venta ) / 1000;   // Convertido a Kg  
                $cant_diff_descontar = ($dif * $gramaje_venta * $ancho_venta ) / 1000; // Convertido a Kg  
            }

            // Descontar la cantidad por la Venta
            $db_update->Query("UPDATE stock SET cantidad = cantidad - $cant_descontar WHERE codigo = '$codigo' AND lote = '$lote' AND suc ='$suc' AND tipo_ent = '$tipo_ent' AND nro_identif = $nro_identif AND linea = $linea ");

            //Descontar la Falla 
            if ($cant_falla_descontar > 0) {
                $db_update->Query("UPDATE stock SET cantidad = cantidad - $cant_falla_descontar WHERE codigo = '$codigo' AND lote = '$lote' AND suc ='$suc' AND tipo_ent = '$tipo_ent' AND nro_identif = $nro_identif AND linea = $linea ");
            }
            // Descontar la Diferencia por el Mal corte
            if ($cant_diff_descontar > 0) {
                $db_update->Query("UPDATE stock SET cantidad = cantidad - $cant_diff_descontar WHERE codigo = '$codigo' AND lote = '$lote' AND suc ='$suc' AND tipo_ent = '$tipo_ent' AND nro_identif = $nro_identif AND linea = $linea ");
            }

            $gramaje = 0;
            $ancho = 0;
            $tara = 0;
            if ($mnj_x_lotes === "Si") {
                $db->Query("SELECT gramaje,ancho,tara FROM lotes WHERE codigo = '$codigo' AND lote = '$lote'");
                $db->NextRecord();
                $gramaje = $db->Get('gramaje');
                $ancho = $db->Get('ancho');
                $tara = $db->Get('tara');
            }
            $db->Query("INSERT INTO historial( suc, codigo, lote, tipo_ent, nro_identif, linea, tipo_doc, nro_doc, fecha_hora, usuario, direccion, cantidad, gramaje, tara, ancho)
            VALUES ( '$suc', '$codigo', '$lote', '$tipo_ent', $nro_identif, $linea, 'FV', $factura, CURRENT_TIMESTAMP, '$usuario', 'S', -$cant_descontar, $gramaje, $tara, $ancho);");
            // Historial de la falla
            if ($cant_falla_descontar > 0) {
                $db->Query("INSERT INTO historial( suc, codigo, lote, tipo_ent, nro_identif, linea, tipo_doc, nro_doc, fecha_hora, usuario, direccion, cantidad, gramaje, tara, ancho)
                VALUES ( '$suc', '$codigo', '$lote', '$tipo_ent', $nro_identif, $linea, 'FV+Fx', $factura, CURRENT_TIMESTAMP, '$usuario', 'S', -$cant_falla_descontar, $gramaje, $tara, $ancho);");
            }
            // Historial de la Diferencia o Mal corte
            if ($cant_diff_descontar > 0) {
                $db->Query("INSERT INTO historial( suc, codigo, lote, tipo_ent, nro_identif, linea, tipo_doc, nro_doc, fecha_hora, usuario, direccion, cantidad, gramaje, tara, ancho)
                VALUES ( '$suc', '$codigo', '$lote', '$tipo_ent', $nro_identif, $linea, 'FV+DE', $factura, CURRENT_TIMESTAMP, '$usuario', 'S', -$cant_diff_descontar, $gramaje, $tara, $ancho);");
            }
        }
    }
}

function contadoresDeBilletes() {
    $suc = $_REQUEST['suc'];
    $desde = $_REQUEST['desde'];
    $hasta = $_REQUEST['hasta'];
    $sql = "SELECT id_cont,suc,pdv_cod,DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha,tipo,auditor,audit_hora AS cierre,estado FROM cont_billetes WHERE suc = '$suc' and fecha between '$desde' and '$hasta';";
    echo json_encode(getResultArray($sql));
}

function getPDVs() {
    $suc = $_REQUEST['suc'];
    $moneda = $_REQUEST['moneda'];
    $tipo = $_REQUEST['tipo'];
    $pdv_ubic = $_REQUEST['tipo_doc'];
    $sql = "SELECT pdv_cod FROM pdvs WHERE suc='$suc' AND moneda = '$moneda'  AND tipo = '$tipo' AND pdv_ubic = '$pdv_ubic' ";
    echo json_encode(getResultArray($sql));
}
/*
 * Por defecto Matriz
 */
function verificarCotizMoneda() {
     
    $db = new My();
     
    $suc = '03';
    if(isset($_REQUEST['suc'])){
        $suc = $_REQUEST['suc'];
    }
         
    $sql = "SELECT compra   FROM cotizaciones_contables WHERE m_cod = 'U$'   AND suc = '$suc'   ORDER BY CONCAT(fecha,' ',hora) DESC LIMIT 1";
   
    $db->Query($sql);
    if ($db->NumRows() > 0) {
        $db->NextRecord();
        $Rate = $db->Record['compra'];
        echo $Rate;
    } else {
        echo 0;
    }
}

function generarContadorBilletes() {
    $suc = $_REQUEST['suc'];
    $cajero = $_REQUEST['cajero'];
    $tipo = $_REQUEST['tipo'];
    $pdv = $_REQUEST['pdv'];
    $fecha = $_REQUEST['fecha'];
    $db = new My();
    $db->Query("INSERT INTO cont_billetes( suc, pdv_cod, fecha, cajero, tipo, auditor, audit_hora, estado)VALUES ('$suc', '$pdv', '$fecha', '$cajero', '$tipo', '', null, 'Abierto');");
    echo "Ok";
}

function guardarMoneda() {
    $id = $_REQUEST['id'];
    $moneda = str_replace("s", "$", $_REQUEST['moneda']);
    $identif = $_REQUEST['identif'];
    $valor = $_REQUEST['valor'];
    $cant = $_REQUEST['cant'];
    $total = $cant * $valor;
    $db = new My();
    // Borro si ya hay uno
    $db->Query("DELETE FROM cont_bill_det WHERE id_cont = $id AND identif = '$identif' and m_cod = '$moneda';");
    $db->Query("INSERT INTO cont_bill_det(id_cont,m_cod,identif,cantidad,valor,total)VALUES($id,'$moneda','$identif',$cant,$valor,$total)");
    echo "Ok";
}

function guardarCotizControlBilletes() {
    $id = $_REQUEST['id'];
    $cotiz_x = $_REQUEST['cotiz_x'];
    $valor = $_REQUEST['valor'];
    $total = $_REQUEST['total'];
    $db = new My();
    if ($cotiz_x == "cotiz_gs") {
        $db->Query("UPDATE cont_billetes set  total = $total WHERE id_cont = $id;");
    } else {
        $db->Query("UPDATE cont_billetes set $cotiz_x = $valor,total = $total WHERE id_cont = $id;");
    }
}

function cerrarControlBilletes() {
    $id = $_REQUEST['id'];
    $db = new My();
    $db->Query("UPDATE cont_billetes set  estado = 'Cerrado' WHERE id_cont = $id;");
    echo "Cerrado";
}

function firmarControlBilletes() {
    $id = $_REQUEST['id'];
    $usuario = $_REQUEST['usuario'];
    $passw = $_REQUEST['passw'];
    $db = new My();
    $crypt_pass = sha1($passw);

    $db->Query("SELECT usuario, limite_sesion,suc FROM usuarios WHERE BINARY usuario = '$usuario' AND passw = '$crypt_pass'");
    if ($db->NumRows() > 0) {
        $db->Query("update cont_billetes set auditor = '$usuario', audit_hora = current_timestamp where id_cont = $id;");
        echo "Ok";
    } else {
        echo "Contrase&ntilde;a incorrecta!!!";
    }
}
function firmarArqueoCaja() {
     
    $usuario = $_REQUEST['usuario'];
    $passw = $_REQUEST['passw'];
    $db = new My();
    $crypt_pass = sha1($passw);

    $db->Query("SELECT usuario,concat(nombre,' ',apellido) as nombre_cajero, limite_sesion,suc FROM usuarios WHERE BINARY usuario = '$usuario' AND passw = '$crypt_pass'");
    if ($db->NumRows() > 0) { 
        $db->NextRecord();
        $nombre_cajero = $db->Get('nombre_cajero');
        $firma = 'img/firmas_digitales/'.$usuario.'.jpg';
     
        if (file_exists($firma)) {
           $firma = "$usuario";  
        } else {
            $firma = "sin_firma";  
        }
        echo json_encode(array("mensaje"=>"Ok","nombre_cajero"=>$nombre_cajero,"firma"=>$firma));
    } else {
        echo json_encode(array("mensaje"=>"Contrase&ntilde;a incorrecta!!!"));  
    }
}

function autorizarNotaCredito() {
    $nro_nota = $_REQUEST['nro_nota'];
    $usuario = $_REQUEST['usuario'];
    $passw = $_REQUEST['passw'];
    $db = new My();
    $crypt_pass = sha1($passw);

    $db->Query("SELECT usuario, limite_sesion,suc FROM usuarios WHERE BINARY usuario = '$usuario' AND passw = '$crypt_pass'");
    if ($db->NumRows() > 0) {
        $db->Query("update nota_credito set autorizado_por = '$usuario' where n_nro = $nro_nota;");
        echo "Ok";
    } else {
        echo "Contrase&ntilde;a incorrecta!!!";
    }
}

function eliminarNotaCredito() {
    $nro_nota = $_REQUEST['nro_nota'];
    $usuario = $_REQUEST['usuario'];

    $db = new My();

    $db->Query("SELECT  e_sap  FROM  nota_credito WHERE estado != 'Cerrada' AND e_sap IS NULL AND n_nro = $nro_nota");
    if ($db->NumRows() > 0) {
        $db->Query("DELETE FROM nota_credito_det WHERE n_nro =  $nro_nota;");
        $db->Query("DELETE FROM nota_credito  WHERE n_nro =  $nro_nota;");
        echo "Ok";
    } else {
        echo "Nota de Credito ya ha sido Cerrada o Eliminada";
    }
}

function checkPassword() {
    $usuario = $_REQUEST['usuario'];
    $passw = $_REQUEST['passw'];
    $db = new My();
    $crypt_pass = sha1($passw);

    $db->Query("SELECT usuario, limite_sesion,suc FROM usuarios WHERE BINARY usuario = '$usuario' AND passw = '$crypt_pass'");
    if ($db->NumRows() > 0) {
        echo "Ok";
    } else {
        echo "Contrase&ntilde;a incorrecta!!!";
    }
}

function checkPasswordAndTrustee() {

    $passw = $_REQUEST['passw'];
    $id_permiso = $_REQUEST['id_permiso'];
    $suc = $_REQUEST['suc'];

    $db = new My();
    $crypt_pass = sha1($passw);

    $sql = "SELECT u.nombre AS nombre,ug.usuario,g.nombre,p.id_permiso AS id_permiso, g.descrip, descripcion,trustee 
        FROM  usuarios u,grupos g, usuarios_x_grupo ug, permisos_x_grupo p, permisos pr WHERE u.usuario = ug.usuario AND ug.id_grupo = p.id_grupo
        AND g.id_grupo = ug.id_grupo AND p.id_permiso = pr.id_permiso  AND u.passw = '$crypt_pass' AND  p.id_permiso = '$id_permiso'";

    $db->Query($sql);

    if ($db->NumRows() > 0) {
        $db->NextRecord();
        $trustee = $db->Record['trustee'];
        echo "Ok";
    } else {
        echo "Permiso denegado";
    }
}

function buscarFacturasDeCliente() {
    $cli_cod = $_REQUEST['cod_cli'];
    $moneda = $_REQUEST['moneda'];
    $sql = "SELECT f_nro AS factura,DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha,fecha as fecha_ing,total,moneda,clase FROM factura_venta WHERE cod_cli LIKE '$cli_cod' and estado = 'Cerrada' and moneda = '$moneda' and control_caja ='Si' order by f_nro*1 desc limit 5000";
    //$sql = "SELECT f_nro AS factura,DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha,fecha as fecha_ing,total,moneda FROM factura_venta WHERE f_nro=260186";  
    echo json_encode(getResultArray($sql));
}

function buscarDetallesFacturaNotaCredito() {
    $factura = $_REQUEST['factura'];
    $nro_nota = $_REQUEST['nro_nota'];
    $clase = $_REQUEST['clase'];
    $sql = "";
    if ($clase === "Articulo") {
        $sql = "SELECT f.codigo,f.lote,f.um_prod,f.descrip,f.um_cod,f.cantidad AS cantidad,precio_venta,precio_neto,f.subtotal, $nro_nota AS n_nro, f.f_nro,  "
                . "SUM(IF(nc.n_nro IS NOT NULL AND nc.f_nro = f.f_nro AND nc.n_nro <> $nro_nota, nc.cantidad,0)) AS sum_cant_dev_ant,  "
                . "IF(nc.cantidad IS NULL,0,nc.cantidad) AS cant_dev,  IF(nc.f_nro=$factura AND nc.n_nro = $nro_nota,(f.subtotal / f.cantidad) * nc.cantidad,0) AS subtotal_dev FROM fact_vent_det f LEFT JOIN "
                . "( SELECT n.n_nro, n.f_nro, d.lote, d.cantidad,d.subtotal FROM nota_credito n INNER JOIN nota_credito_det d ON n.n_nro = d.n_nro WHERE n.f_nro=$factura and d.n_nro = $nro_nota) AS nc ON f.lote=nc.lote WHERE f.f_nro = $factura GROUP BY f.lote";
    } else {
        $sql = "SELECT id_det, n_nro, codigo, lote, um_prod, descrip, cantidad, precio_unit, subtotal, estado, estado_venta  FROM  nota_credito_det WHERE n_nro = $nro_nota";
    }

    echo json_encode(getResultArray($sql));
}

function generarNotaCredito() {

    $usuario = $_REQUEST['usuario'];
    $suc = $_REQUEST['suc'];
    $factura = $_REQUEST['factura'];
    $cod_cli = $_REQUEST['cod_cli'];
    $req_auth = $_REQUEST['req_auth'];
    $fuera_rango = $_REQUEST['fuera_rango'];
    $moneda = $_REQUEST['moneda'];
    $clase = $_REQUEST['clase'];
    $notas = $_REQUEST['notas'];

    $tipo = "Normal";
    if ($fuera_rango) {
        $tipo = "Excepcional";
    }

    $ms = new My();
    $ms->Query("SELECT nombre AS Cliente,ci_ruc AS RUC FROM clientes WHERE cod_cli =  '$cod_cli';");
    $ms->NextRecord();
    $ruc = $ms->Record['RUC'];
    $nombre = $ms->Record['Cliente'];
    $db = new My();

    $vendedor = "";
    $cat = 1;


    $db->Query("SELECT usuario,cat FROM factura_venta WHERE f_nro = $factura");
    if ($db->NumRows() > 0) {
        $db->NextRecord();
        $vendedor = $db->Record['usuario'];
        $cat = $db->Record['cat'];
    }


    $db->Query("INSERT INTO nota_credito(cod_cli,cliente,ruc_cli,usuario,f_nro,fecha,hora,fecha_creacion,suc,tipo,estado,moneda,fact_nro,pdv_cod,tipo_fact,autorizado_por,req_auth,vendedor,cat,clase,notas)"
            . "VALUES('$cod_cli','$nombre','$ruc','$usuario','$factura',current_date,current_time,current_date,'$suc','$tipo','Abierta','$moneda','','','','','$req_auth','$vendedor',$cat,'$clase','$notas')");
    $db->Query("select n_nro FROM nota_credito order by n_nro desc limit 1");
    $db->NextRecord();
    $nro_nota = $db->Record['n_nro'];
    echo $nro_nota;
}

function guardarDetalleNotaCredito() {

    $nro_nota = $_REQUEST['nro_nota'];
    $codigo = $_REQUEST['codigo'];
    $lote = $_REQUEST['lote'];
    $precio = $_REQUEST['precio'];
    $cant_dev = $_REQUEST['cant_dev'];
    $subtotal = $precio * $cant_dev;
    $um_prod = $_REQUEST['um_prod'];
    $descrip = $_REQUEST['descrip'];
    $db = new My();
    $db->Query("delete from nota_credito_det where n_nro = $nro_nota and lote = '$lote' and codigo = '$codigo';");
 
    if ($cant_dev > 0 && $db->AffectedRows() > -1) {                 
        $db->Query("INSERT INTO nota_credito_det(n_nro,codigo,lote,um_prod,descrip,cantidad,precio_unit,subtotal,estado,estado_venta) SELECT n.n_nro, fd.codigo, fd.lote, fd.um_prod, fd.descrip, $cant_dev, $precio, $subtotal,'',fd.estado_venta FROM fact_vent_det fd INNER JOIN nota_credito n on fd.f_nro=n.f_nro left join nota_credito_det d on n.n_nro=d.n_nro and fd.lote=d.lote WHERE fd.lote=$lote AND n.n_nro =  $nro_nota and d.lote is null");
    }
    $db->Query("select sum(subtotal) as total from nota_credito_det  where n_nro = $nro_nota");

    $db->NextRecord();
    $total = $db->Record['total'];
    $db->Query("UPDATE nota_credito SET total = $total, saldo = $total  WHERE n_nro = $nro_nota");
    echo "Ok";
}

function guardarDetalleNotaCreditoXServicio() {
    $nro_nota = $_REQUEST['nro_nota'];
    $codigo = $_REQUEST['codigo'];
    $cantidad = $_REQUEST['cant'];
    $precio = $_REQUEST['precio'];
    $um = $_REQUEST['um'];
    $subtotal = $_REQUEST['subtotal'];
    $descrip = strtoupper($_REQUEST['descrip']);

    $db = new My();
    $db->Query("INSERT INTO nota_credito_det(n_nro, codigo, lote, um_prod, descrip, cantidad, precio_unit, subtotal, estado, estado_venta, e_sap)
              VALUES ( $nro_nota, '$codigo', '', '$um', '$descrip', $cantidad, $precio, $subtotal, null, 'Normal', null);");
    
    $db->Query("select sum(subtotal) as total from nota_credito_det  where n_nro = $nro_nota");

    $db->NextRecord();
    $total = $db->Record['total'];
    $db->Query("UPDATE nota_credito SET total = $total, saldo = $total  WHERE n_nro = $nro_nota");

    echo json_encode(array("mensaje" => "Ok"));
}

function borrarDetalleNotaCredito() {
    $nro_nota = $_REQUEST['nro_nota'];
    $id_det = $_REQUEST['id_det'];
    $db = new My();
    $db->Query("delete from nota_credito_det where n_nro = $nro_nota and id_det = $id_det;");

    $db->Query("SELECT IF(subtotal IS NOT NULL,SUM(subtotal),0) AS sub FROM nota_credito_det WHERE n_nro = $nro_nota");
    $subtotal = 0;
    if ($db->NumRows() > 0) {
        $db->NextRecord();
        $subtotal = $db->Get('sub');
    }
    $db->Query("UPDATE nota_credito SET   total = $subtotal,saldo = $subtotal   WHERE n_nro = $nro_nota;");
    echo json_encode(array("mensaje" => "Ok"));
}

function actualizarCabeceraNotaCredito() {
    $nro_nota = $_REQUEST['nro_nota'];
    $req_auth = $_REQUEST['req_auth'];
    $estado = $_REQUEST['estado'];
    $usuario = $_REQUEST['usuario'];
    $suc = $_REQUEST['suc'];
    $genCajaMov = $_REQUEST['genCajaMov'];
    $clase = $_REQUEST['clase'];
    $ex_update = ($estado == 'Cerrada' ) ? ", fecha=date(now()), hora=time(now())" : "";

    $tipo = 'Normal';
    if ($req_auth) {
        $req_auth = '1';
        $tipo = 'Excepcional';
    } else {
        $req_auth = '';
    }
    $db = new My();
    $db->Query("SELECT SUM(subtotal) AS sub,n.estado as estado_nc FROM nota_credito n, nota_credito_det d WHERE n.n_nro = d.n_nro AND n.n_nro = $nro_nota");
    if ($db->NumRows() > 0) {
        $db->NextRecord();
        $subtotal = $db->Get('sub');
        $estado_nc = $_REQUEST['estado_nc'];
        if($estado_nc !== "Cerrada"){ // Verifico que alguien mas no haya cerrado antes
            $db->Query("UPDATE nota_credito SET   req_auth = '$req_auth',tipo = '$tipo', total = $subtotal,saldo = $subtotal $ex_update  WHERE n_nro = $nro_nota;");

            if ($estado == 'Cerrada' && $genCajaMov == 'Si') {
                $db->Query("insert into efectivo (id_concepto,nota_credito,m_cod,salida,cotiz,salida_ref,fecha,fecha_reg,hora,suc,estado) select 12,$nro_nota,moneda,total,1,total,date(now()),date(now()),time(now()),suc,estado from nota_credito where n_nro='$nro_nota'");
            }
            if ($estado == 'Cerrada' && $clase === "Articulo") {  // Aumentar Stock si es por Articulo            
                aumentarStockXNotaCredito($nro_nota,$genCajaMov);
            }
            if ($estado == 'Pendiente' && $clase === "Articulo") {  // Aumentar Stock si es por Articulo            
                $db->Query("UPDATE nota_credito SET estado = 'Pendiente', req_auth = '$req_auth',tipo = '$tipo', total = $subtotal,saldo = $subtotal   WHERE n_nro = $nro_nota;");
                echo json_encode(array("estado" => "Ok", "mensaje" => "Pendiente"));
            }
            if ($estado == 'Cerrada' && $clase === "Servicio") {
                $db->Query("UPDATE nota_credito SET estado = '$estado', req_auth = '$req_auth',tipo = '$tipo', total = $subtotal,saldo = $subtotal $ex_update WHERE n_nro = $nro_nota;");
                echo json_encode(array("estado" => "Ok", "mensaje" => "Cerrada"));
            }        
        }else{
            echo json_encode(array("estado" => "Error", "mensaje" => "La nota de credito ya ha sido cerrada  anteriormente..."));
        }
    } else {
        echo json_encode(array("estado" => "Error", "mensaje" => "La nota de credito esta vacia"));
    }
}

function aumentarStockXNotaCredito($nro_nota,$genCajaMov) {
   
    $db = new My();
    $dbi = new My();
    $dbi->Query("select n.usuario,f.suc,d.codigo,d.lote,d.cantidad,d.um_prod AS um_nc_det, s.nro_identif, tipo_ent,linea,a.mnj_x_lotes ,a.um AS um_inv from nota_credito n inner join factura_venta f on n.f_nro = f.f_nro inner join nota_credito_det d on n.n_nro = d.n_nro     inner join stock s on d.codigo = s.codigo AND d.lote = s.lote and s.suc = f.suc inner join articulos a on d.codigo = a.codigo where   n.n_nro = $nro_nota");


    if ($dbi->NumRows() > 0) {
        while ($dbi->NextRecord()) {
            $suc = $dbi->Get('suc');
            $codigo = $dbi->Get('codigo');
            $lote = $dbi->Get('lote');
            $mnj_x_lotes = $dbi->Get('mnj_x_lotes');
            $usuario = $dbi->Get('usuario');
  
            $tipo_ent = $dbi->Get('tipo_ent');
            $nro_identif = $dbi->Get('nro_identif');
            $linea = $dbi->Get('linea');
            $um_inv = $dbi->Get('um_inv');

            $um_venta = $dbi->Get('um_nc_det');
            $cantidad = $dbi->Get('cantidad');
            $gramaje = 0;
            $ancho = 0;
            $tara = 0;
            if ($mnj_x_lotes === "Si") {
                $db->Query("SELECT gramaje,ancho,tara FROM lotes WHERE codigo = '$codigo' AND lote = '$lote'");
                $db->NextRecord();
                $gramaje = $db->Get('gramaje');
                $ancho = $db->Get('ancho');
                $tara = $db->Get('tara');
            }

            $cant_aumentar = 0;

            if (($um_inv === "Mts" || $um_inv === "Unid") && ($um_venta === "Mts" || $um_venta === "Unid")) {     
                $cant_aumentar = $cantidad;
            } else if ($um_inv === "Mts" && $um_venta === "Kg") {
                $cant_aumentar = (($cantidad - ($tara / 1000)) * 1000) / ($gramaje * $ancho); //Mts             
            } else if (($um_inv === "Kg") && ($um_venta === "Kg")) {
                $cant_aumentar = $cantidad;
            } else if (($um_inv === "Kg") && ($um_venta === "Mts")) {
                $cant_aumentar = ($cantidad * $gramaje * $ancho) / 1000; //Kg             
            }
                       
            $db->Query("UPDATE stock SET cantidad = cantidad + $cant_aumentar WHERE codigo = '$codigo' AND lote = '$lote' AND suc ='$suc' AND tipo_ent = '$tipo_ent' AND nro_identif = $nro_identif AND linea = $linea;");

            $db->Query("INSERT INTO historial( suc, codigo, lote, tipo_ent, nro_identif, linea, tipo_doc, nro_doc, fecha_hora, usuario, direccion, cantidad, gramaje, tara, ancho)
            VALUES ( '$suc', '$codigo', '$lote', '$tipo_ent', $nro_identif, $linea, 'NC', $nro_nota, CURRENT_TIMESTAMP, '$usuario', 'E', $cant_aumentar, $gramaje, $tara, $ancho);");
              
        }
        if($genCajaMov === "Si"){
            $db->Query("UPDATE nota_credito SET estado = 'Reconciliada', saldo = 0  WHERE n_nro = $nro_nota;");
        }else{
            $db->Query("UPDATE nota_credito SET estado = 'Cerrada'  WHERE n_nro = $nro_nota;");            
        }
        echo json_encode(array('estado' => 'Ok', 'mensaje' => 'Cerrada'));
    } else {
        $db->Query("UPDATE nota_credito SET estado = 'Abierta'  WHERE n_nro = $nro_nota;");
        echo json_encode(array('estado' => 'Error', 'mensaje' => 'Numero de filas = 0'));
    }
}

function makeLog($usuario, $accion, $data, $tipo, $doc_num) {
    $db = new My();
    $db->Query("INSERT INTO logs(usuario, fecha, hora, accion,tipo,doc_num, DATA) VALUES ('$usuario', current_date, current_time, '$accion','$tipo', '$doc_num', '$data');");
    $db->Close();
    return true;
}

function logConectividad() {
    $usuario = $_REQUEST['usuario'];
    $init_time = $_REQUEST['init_time'];
    $end_time = $_REQUEST['end_time'];
    $accion = $_REQUEST['accion'];
    $tipo = $_REQUEST['tipo'];
    $doc_num = $_REQUEST['nro'];

    $t1 = gmdate("Y-m-d H:i:s", $init_time);
    $t2 = gmdate("Y-m-d H:i:s", $end_time);


    $datetime1 = new DateTime($t1);
    $datetime2 = new DateTime($t2);

    $interval = $datetime2->diff($datetime1);
    $leyenda = $interval->format("%H hours %i minutes %s seconds");

    $data = $t1 . ";" . $t2 . ";" . $leyenda;

    $db = new My();
    $db->Query("INSERT INTO logs(usuario, fecha, hora, accion,tipo,doc_num, DATA) VALUES ('$usuario', current_date, current_time, '$accion','$tipo', '$doc_num','$data');");
    echo $data;
}
 

function Thumbnail($url, $filename, $width = 150, $height = true) {

    // download and create gd image
    $image = ImageCreateFromString(file_get_contents($url));

    // calculate resized ratio
    // Note: if $height is set to TRUE then we automatically calculate the height based on the ratio
    $height = $height === true ? (ImageSY($image) * $width / ImageSX($image)) : $height;

    // create image 
    $output = ImageCreateTrueColor($width, $height);
    ImageCopyResampled($output, $image, 0, 0, 0, 0, $width, $height, ImageSX($image), ImageSY($image));

    // save image
    ImageJPEG($output, $filename, 95);

    // return resized image
    return $output; // if you need to use it
}
 

function actualizarEstadoPedido() {
    $pedido_nro = $_POST['ped_nro'];
    $pedido_lote = $_POST['lote'];
    $my = new My();
    $query = "update pedido_tras_det set estado ='En Proceso' where n_nro='$pedido_nro' and lote ='$pedido_lote'";
    $my->Query($query);
    if ($my->AffectedRows() > 0) {
        echo '{"msg":"Ok"}';
    } else {
        echo '{"msg":"Ocurrio un error al ejecutar la operacion codigo: ' . $query . '"}';
    }
}

/**
 * Actualizacion de estado Fuera de Rango en detalle de remision
 */
function actualizarPendienteControl($codigo, $lote, $suc, $user) {

    $verifDataRef = verificarPendienteControl($codigo, $lote, $suc);
    if ($verifDataRef) {
        $link = new My();
        $rem = $verifDataRef['n_nro'];
        $link->Query("update nota_rem_det set estado='Pendiente' , verificado_por='$user' where codigo = '$codigo' and lote = '$lote' and n_nro = '$rem'");
        $link->Close();
        return true;
    }
    return false;
}

/**
 * Verifica si un lote esta pendiente de proceso por recepción fuera de rango 
 */
function verificarPendienteControl($codigo, $lote, $suc) {
    $link = new My();
    $data = array();
    $link->Query("select r.n_nro,r.suc as Origen,r.fecha_cierre, r.recepcionista from nota_rem_det d inner join nota_remision r using(n_nro) where d.estado='FR' and (d.verificado_por = '' or d.verificado_por is null) and r.suc_d='$suc' and d.codigo = '$codigo' and d.lote = '$lote'");

    if ($link->NumRows() > 0) {
        $link->NextRecord();
        $data = $link->Record;
    }
    $link->Close();
    return count($data) > 0 ? $data : false;
}

/**
 *   Obtiene los datos de un cheque
 *
 */
function obtenerDatosCheque() {
    $link = new My();
    $chq_nro = $_POST['chq_nro'];
    $link->Query("select nro_cheque,cuenta,id_banco,tipo,benef,DATE_FORMAT(fecha_emis,'%d/%m/%Y') as fecha_emis,DATE_FORMAT(fecha_pago,'%d/%m/%Y') as fecha_pago,valor,m_cod from cheques_ter where nro_cheque = '$chq_nro'");
    $respuesta = ["error" => "$chq_nro"];
    if ($link->NextRecord()) {
        $respuesta = $link->Record;
    }
    echo json_encode($respuesta);
}

/**
 *  Obtiene colores por articulo
 */
function coloresXArticulo() {
    $codigo = $_POST['codigo'];
    $suc = $_POST['suc'];
    
    $Qry = "SELECT DISTINCT l.pantone, p.nombre_color AS color FROM lotes l, stock s, pantone p WHERE l.codigo = s.codigo AND s.lote = l.lote AND s.cantidad > 0 AND l.pantone = p.pantone 
    AND l.codigo = '$codigo' AND s.suc like '$suc' ORDER BY p.nombre_color ASC";
    echo json_encode(getResultArray($Qry));    
}

/**
 *   Verifica la existencia y estado de un ticket segun suc y nro de ticket
 */
function verificarTicket() {
    $suc = $_POST['suc'];
    $ticket = $_POST['ticket'];
    $link = new My();
    $data = array();
    $link->Query("select f_nro,ruc_cli,cliente,estado,fecha_cierre,total,suc,fact_nro,tipo_fact from factura_venta where f_nro='$ticket'");
    if ($link->NumRows() > 0) {
        $link->NextRecord();
        $data['data'] = $link->Record;
        if ($data['data']['suc'] !== $suc) {
            $data['error'] = "El ticket $ticket no corresponde a su Sucursal";
        } else if ($data['data']['estado'] !== 'Cerrada') {
            $data['error'] = "El ticket $ticket no esta Cerrado";
        }
    } else {
        $data['error'] = "No se encontro el ticket $ticket";
    }
    $link->Close();
    echo json_encode($data);
}

/**
 *   Asigna una ducumento contable a un ticket
 */
function asignarFacturaTicketFactura() {
    $suc = $_POST['suc'];
    $fact_nro = $_POST['fact_nro'];
    $ticket = $_POST['ticket'];
    $estado = $_POST['estado'];
    $moneda = $_POST['moneda'];
    $pdv = $_POST['pdv'];
    $tipo = $_POST['tipo'];
    $tipo_doc = $_POST['tipo_doc'];

    $link = new My();
    $data = array();
    //$link->Query("UPDATE factura_cont set estado = 'Anulada' where suc='$suc' and fact_nro=(select fact_nro from factura_venta  where f_nro=$ticket)");    
    $link->Query("UPDATE factura_cont c inner join factura_venta v on c.suc=v.suc and c.fact_nro=v.fact_nro and c.pdv_cod=v.pdv_cod and c.tipo_fact=v.tipo_fact and c.tipo_doc=v.tipo_doc set c.estado='Anulada' where c.suc='$suc' and v.f_nro=$ticket");

    $link->Query("UPDATE factura_venta v inner join factura_cont c on v.suc=c.suc and v.fact_nro=c.fact_nro and c.pdv_cod=v.pdv_cod and c.tipo_fact=v.tipo_fact and c.tipo_doc=v.tipo_doc set v.fact_nro='', v.tipo_fact='', v.tipo_doc='' where c.fact_nro=$fact_nro and c.tipo_doc = '$tipo_doc' and c.suc='$suc'");

    $link->Query("UPDATE factura_venta v inner join factura_cont c on v.suc=c.suc set v.fact_nro=c.fact_nro, v.tipo_fact=c.tipo_fact, v.tipo_doc=c.tipo_doc, v.pdv_cod=c.pdv_cod where v.f_nro=$ticket and c.fact_nro=$fact_nro and c.tipo_doc = '$tipo_doc' and c.tipo_fact='$tipo'");

    if ($link->AffectedRows() > 0) {
        //$link->Query("UPDATE factura_cont set estado = 'Cerrada' where tipo_fact='$tipo' AND suc='$suc' and fact_nro=$fact_nro");
        $link->Query("UPDATE factura_cont c inner join factura_venta v on c.suc=v.suc and c.fact_nro=v.fact_nro and c.pdv_cod=v.pdv_cod and c.tipo_fact=v.tipo_fact and c.tipo_doc=v.tipo_doc set c.tipo=v.tipo, c.estado='Cerrada' where c.tipo_fact='$tipo' AND c.suc='$suc' and c.fact_nro=$fact_nro and v.f_nro=$ticket");
        $data['ok'] = "Los cambios se realizaron Satisfactoriamente";
    } else {
        $data['error'] = "No se pudo asignar la fatura $fact_nro and ticket $ticket";
    }
    $data['SAPSync'] = json_decode(file_get_contents("http://192.168.2.220:8081/?action=modFacturaContable&f_nro=$ticket&fact_nro=$fact_nro"));
    $link->Close();
    echo json_encode($data);
}

/**
 * Eliminar codigos de entrada de mercaderia
 */
function eliminarSeleccionados() {
    $my_link = new My();
    $id_ent = $_REQUEST['id_ent'];
    $ids = trim(implode(',', json_decode($_REQUEST['ids'])), ',');
    $respuesta = array();

    $borrar = "DELETE FROM entrada_det WHERE trim(lote) = '' AND  id_ent=$id_ent AND id_det in ($ids)";
    $my_link->Query($borrar);
    $respuesta['eliminados'] = (int) $my_link->AffectedRows();
    $my_link->Close();
    echo json_encode($respuesta);
}
 

function getSumaVentasDeClienteXArticuloDescripcion() {
    $desde = $_POST['desde'];
    $hasta = $_POST['hasta'];
    $cod_cli = $_POST['cod_cli'];

    $codigo = $_POST['codigo'];
    $descrip = trim($_POST['descrip']);

    require_once('Functions.class.php');
    $fn = new Functions();
    $desde = $fn->invertirFechaLat($desde);
    $hasta = $fn->invertirFechaLat($hasta);
    $db = new My();
    $sql = "SELECT  f.cod_cli, SUM( IF( d.cantidad IS NULL,0,d.cantidad)) AS Mts,   SUM(IF(  nd.cantidad IS NULL,0,nd.cantidad))  AS Devs FROM factura_venta f 
    INNER JOIN  fact_vent_det d ON f.f_nro = d.f_nro LEFT JOIN nota_credito n ON f.f_nro = n.f_nro LEFT JOIN nota_credito_det nd ON n.n_nro = nd.n_nro AND   d.lote = nd.lote WHERE f.estado = 'Cerrada' 
    AND f.fecha_cierre BETWEEN '$desde' AND '$hasta' AND f.cod_cli = '$cod_cli' AND d.codigo = '$codigo' AND d.descrip = '$descrip'  GROUP BY f.cod_cli";

    // echo $sql."<br>";

    echo json_encode(getResultArray($sql));
}

/**
 * Cambiar Valores en Entrada de Mercaderias
 */
function cambiarValoresEntMercaderia() {

    $my_link = new My();
    $set_My = '';
    
    $entMercUpdate = json_decode($_REQUEST['entMercUpdate']);
    foreach ($entMercUpdate as $key => $value) {
        $set_My .= "$key = '$value', ";
    }
    $set_My = trim($set_My, ', ');
    $id_ent = $_REQUEST['id_ent'];
    $lotes = "";
    $respuesta = array();

    $ids = trim(implode(',', json_decode($_REQUEST['ids'])), ',');
    
    $my_update = "UPDATE entrada_det SET $set_My WHERE id_ent=$id_ent AND id_det in ($ids)";
     
    //echo $my_update."\r\n";
    $my_link->Query($my_update);

    if ($my_link->AffectedRows() > 0) {
      $respuesta['msj_det'] .= "Se actualizo el detelle de entrada";
    }else{
        $respuesta['msj_det'] .= "No hubo cambios";
    }
     
    echo json_encode($respuesta);
}

function existeLote($lote) {
    $ms_link = new My();
    $ms_link->Query("SELECT count(*) AS existe FROM lotes WHERE lote='$lote'");
    $ms_link->NextRecord();
    return ((int) $ms_link->Record['existe'] > 0) ? true : false;
}

function debug($text, $file = "Ajax_debug.log") {
    if (file_exists($file)) {
        file_put_contents($file, '[' . date("y-m-d h:i:s", time()) . '] ' . $text . "\r\n", FILE_APPEND);
    } else {
        $log = fopen($file, 'w') or die("Can't create file");
        if ($log) {
            fclose($log);
            file_put_contents($file, '[' . date("y-m-d h:i:s", time()) . '] ' . $text . "\r\n", FILE_APPEND);
        }
    }
}

/**
 * Dado un valor devuelve otro en funcion del % 50 Ej.:  14521 --> 14500,  14532 --> 14550    
 * Resolucion 347 SEDECO
 * @param {float} $valor
 * @returns {float}  Valor redondeado
 */
function redondeo50($valor) {
    $resto = fmod((float) $valor, 50);
    $valor_redondear = 0;
    if ($resto >= 25) {
        $valor_redondear = 50 - $resto;
    } else {
        $valor_redondear = -$resto;
    }
    $valor_redondeado = $valor + $valor_redondear;
    return $valor_redondeado;
}

new Ajax();
?>
