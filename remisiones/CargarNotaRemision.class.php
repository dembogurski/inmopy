<?php

/**
 * Description of CargarRemision
 * @author Ing.Douglas
 * @date 04/01/2016
 */
require_once("../Y_DB_MySQL.class.php");
require_once("../Y_Template.class.php");
require_once("../Functions.class.php");

class CargarNotaRemision {

    function __construct() {
        //$session = $_POST['session'];
        if (isset($_POST['action'])) {
            call_user_func(array('CargarNotaRemision', $_POST['action']));
        } else {
            $ms = new My();

            $user = $_POST['usuario'];
            $nro_remito = $_POST['nro_remito'];

            $db = new My();
            $db->Query("SELECT DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha, usuario, suc, suc_d, obs, estado, transportadora,transp_ruc, nro_levante,cod_cli,chofer,ci_chofer,nro_chapa,rua FROM  nota_remision WHERE estado = 'Abierta' AND n_nro = $nro_remito;");
            $db->NextRecord();
            $fecha = $db->Record['fecha'];
            $usuario = $db->Record['usuario'];
            $destino = $db->Record['suc_d'];
            $suc_origen = $db->Record['suc'];
            $suc_destino = $db->Record['suc_d'];
            $transportadora = $db->Record['transportadora'];
            $transp_ruc = $db->Record['transp_ruc'];
            $chofer = $db->Record['chofer'];
            $ci_chofer = $db->Record['ci_chofer'];
            $nro_chapa = $db->Record['nro_chapa'];
            $rua = $db->Record['rua'];
            $nro_levante = $db->Record['nro_levante'];
            $cod_cli = $db->Record['cod_cli'];
            $obs = $db->Record['obs'];
            $estado = $db->Record['estado'];

            $db->Query("SELECT valor from parametros where clave = 'porc_tolerancia_remsiones'");
            $db->NextRecord();
            $porc_tolerancia_remsiones = $db->Record['valor'];

            $t = new Y_Template("NotaRemision.html");
            
            $t->Set("mobile_cr", "");
            if($this->isMobile()){
                $t->Set("mobile_cr", "<br>");
            }
            $t->Set("nro", $nro_remito);
            $t->Set("fecha", $fecha);
            $t->Set("usuario", $usuario);
            $t->Set("destino", $destino);
            $t->Set("obs", $obs);
            $t->Set("estado", $estado);
            $t->Set("transportadora", $transportadora);
            $t->Set("transp_ruc", $transp_ruc);
            $t->Set("chofer", $chofer);
            $t->Set("ci_chofer", $ci_chofer);
            $t->Set("nro_chapa", $nro_chapa);
            $t->Set("rua", $rua);
            $t->Set("nro_levante", $nro_levante);
            $t->Set("cod_cli", $cod_cli);
            $t->Set("estado", $estado);
            $t->Set("porc_tolerancia_remsiones", $porc_tolerancia_remsiones);


            $sql = "SELECT suc,nombre FROM sucursales where suc = '$destino' order by  nombre asc ";
            $db->Query($sql);
            $sucs = "";
            $db->NextRecord();
            $suc = $db->Record['suc'];
            $nombre = $db->Record['nombre'];
            $sucs.="<option value=" . $suc . ">" . $nombre . "</option>";

            $t->Set("destino", $sucs);
            $t->Set("_rem_origen", $suc_origen);
            $t->Set("_rem_destino", $suc_destino);

            $t->Show("header");

            $t->Show("remision_existente_cab");
            $t->Set("show_ubic", ($suc_origen !== '00') ? 'style="display:none"' : '');
            $t->Set("transportadoras", $this->transportadoras());
            $t->Show("area_carga_cab");

            $db->Query("SELECT id_det,codigo,lote,descrip,cantidad,cant_inicial,um_prod,kg_env,tara,gramaje,ancho,cant_calc_env, kg_desc, tipo_control,procesado as punteado FROM nota_rem_det WHERE n_nro = $nro_remito");

            while ($db->NextRecord()) {
                $actualizado = '';
                $id_det = $db->Record['id_det'];
                $codigo = $db->Record['codigo'];
                $lote = $db->Record['lote'];
                $tara = $db->Record['tara'];
                $gramaje = $db->Record['gramaje'];
                $ancho = $db->Record['ancho'];
                $descrip = $db->Record['descrip'];
                $cant_calc_env = $db->Record['cant_calc_env'];
                $um_prod = $db->Record['um_prod'];
                $cantidad = $db->Record['cantidad'];
                $cant_inicial = $db->Record['cant_inicial'];
                $kg_env = $db->Record['kg_env'];
                $kg_desc = $db->Record['kg_desc'];
                $tipo_control = $db->Record['tipo_control'];
                $punteado = $db->Record['punteado'];
                //Actualizar datos por si hay cambios en el proceso de carga
                $datosLote = $this->getDatosLotes($codigo, $lote, $suc_origen);            //    print_r($datosLote);
                $UM = $datosLote['UM'];
                $U_tara = $datosLote['U_tara'];
                $U_gramaje = number_format($datosLote['U_gramaje'], 2, '.', '');
                $U_ancho = number_format($datosLote['U_ancho'], 2, '.', '');
                $U_padre = $datosLote['U_padre'];
                $Quantity = $datosLote['Quantity'];
                $U_kg_desc = $datosLote['U_kg_desc'];

                $es_rollo = false;
                $padre = $datosLote['U_padre'];

                if ($padre === '' && $tipo_control == '') {
                    $es_rollo = $this->verifRollo($lote, $codigo);
                    $tipo_control_ch = ($es_rollo == true) ? 'Rollo' : 'Pieza';
                } else {
                    $tipo_control_ch = $tipo_control;
                }

                if ($tara == null) {
                    $tara = 0;
                }

                if ($um_prod == "Mts") {
                    if ($kg_env > 0) {
                        $mts_calc = (($kg_env - ($U_tara / 1000)) * 1000) / ($U_gramaje * $U_ancho);
                    } else {
                        $mts_calc = 0;
                    }
                } else {
                    $mts_calc = $cantidad;
                }

                $uc = new My();

                if ($um_prod !== $UM || round($tara, 3) != round($U_tara, 3) || $gramaje != $U_gramaje || $ancho != $U_ancho || round($cant_calc_env,2) != round($mts_calc,2) || round($kg_desc, 3) != round($U_kg_desc, 3)) {
                    /*
                    echo "Lote: $lote<br>  UM:  $um_prod -> $UM<br>";
                    echo "Tara:  $tara -> $U_tara<br>";
                    echo "Gramaje:  $gramaje -> $U_gramaje<br>";
                    echo "Ancho:  $ancho -> $U_ancho<br>";
                    echo "Cant Calc: $cant_calc_env  ".round($cant_calc_env,2)." -> ".round($mts_calc,2)."<br>";
                    echo "Kg Desc:  $kg_desc -> $U_kg_desc<br>";*/
                    if($U_tara != "Error"){
                        $uc->Query("UPDATE nota_rem_det SET um_prod = '$UM', tara = $U_tara,gramaje= $U_gramaje,ancho= $U_ancho, cant_calc_env = $mts_calc, kg_desc= $U_kg_desc WHERE codigo = '$codigo' and lote = '$lote' and n_nro = $nro_remito;");
                    }else{
                        echo "<b><span style='color:red;font-size:16px'>ERROR: Lote $lote Bloqueado o con Fin de Pieza!<span></b><br>";
                    }
                    $actualizado = 'actualizado';
                }
                // Actualizar KG Env para lotes con terminacion > 16 si el Origen es 00
                if ($suc_origen === '00' && $U_kg_desc != "Error") {
                    if ($tipo_control_ch === 'Pieza' ) {
                        $uc->Query("UPDATE nota_rem_det SET kg_env = (((gramaje * cantidad * ancho)/1000)+(tara/1000)),cant_calc_env = cantidad  WHERE n_nro = $nro_remito and lote = '$lote' AND RIGHT(lote,2) > 16 ");
                    } else {
                        $uc->Query("UPDATE nota_rem_det SET kg_env = $U_kg_desc WHERE n_nro = $nro_remito AND RIGHT(lote,2) > 16 and lote = '$lote'");
                    }
                }

                if ($tipo_control == '') {
                    $uc->Query("UPDATE nota_rem_det SET tipo_control='$tipo_control_ch' WHERE codigo = '$codigo' and lote = '$lote' and n_nro = $nro_remito and (tipo_control is null or tipo_control = '')");
                    if ($uc->AffectedRows() === 0) {
                        $uc->Query("SELECT tipo_control from nota_rem_det WHERE codigo = '$codigo' and lote = '$lote' and n_nro = $nro_remito");
                        $uc->NextRecord();
                        $tipo_control_ch = $uc->Record['tipo_control'];
                    }
                    $actualizado = 'actualizado';
                }

                if ($actualizado !== '')
                    $uc->Close();
                if ((round($cantidad, 2) != round($Quantity, 2)) || round($cantidad, 2) == 0)
                    $actualizado = 'stock';
                $cant_calc_env = $db->Record['cant_calc_env'];

                $t->Set("id_det", $id_det);
                $t->Set("codigo", $codigo);
                $t->Set("actualizado", ($actualizado !== '') ? "data-actualizado='$actualizado'" : '');
                $t->Set("kg_desc", $kg_desc);
                $t->Set("lote", $lote);
                $t->Set("es_rollo", $tipo_control_ch);
                $t->Set("descrip", $descrip);
                $t->Set("cant", number_format($cantidad, 2, ',', '.'));
                $t->Set("cant_inicial", $cant_inicial);
                $t->Set("um", $um_prod);
                $t->Set("tara", number_format($tara, 0, ',', '.'));
                $t->Set("gramaje", number_format($gramaje, 2, ',', '.'));
                $t->Set("ancho", number_format($ancho, 2, ',', '.'));
                $t->Set("kg_env", number_format($kg_env, 3, ',', '.'));
                $t->Set("cant_calc_env", number_format($cant_calc_env, 2, ',', '.'));
                $t->Set("punteado", $punteado);
                $t->Show("area_carga_data");
            }
            $db->Close();

            $fn = new Functions();
            $trustee = $fn->chequearPermiso("8.1.1", $user); // Permiso para Filtrar todos los Usuarios

            if ($trustee != '---') {
                $t->Set("codigo_finalizar_directo", '<input type="button" id="forzar_cambio_estado" onclick="forzarCambioEstado()" style="font-weight: bolder" value="Forzar cambio Estado"  >');
            } else {
                $t->Set("codigo_finalizar_directo", "");
            }

            $t->Show("area_carga_foot");

            $touch = $_POST['touch'];

            //if($touch == "true"){
            require_once("../utils/NumPad.class.php");
            new NumPad();
            //}
        }
    }

    /**
     * @param int $lote 
     * @param String $codigo
     */
    function verifRollo($lote, $codigo) {
         
        $my_link = new My();
        $fracciones = 0;
        $ventas = 0;
        $esRollo = true;

        $my_link->Query("SELECT count(*) as fracciones from fraccionamientos o where codigo = '$codigo' and  padre =  '$lote'");
        $my_link->NextRecord();
        $fracciones = (int) $my_link->Record['fracciones'];
        

        if ($fracciones > 0) {
            $esRollo = false;
        } else {  // Si tiene Ventas ya no puede ser Rollo
            $my_link->Query("SELECT count(*) as ventas from factura_venta f inner join fact_vent_det d using(f_nro) where codigo = '$codigo' and lote =  '$lote' and f.estado='Cerrada'");
            $my_link->NextRecord();
            $ventas = (int) $my_link->Record['ventas'];
            $my_link->Close();

            if ($ventas > 0) {
                $esRollo = false;
            }
        }
        $my_link->Close();
        return $esRollo;
    }

    function getDatosLotes($codigo, $lote, $suc) {
        $datos = array();
        $ms = new My();
        $ms->Query("SELECT um, mnj_x_lotes FROM articulos WHERE codigo = '$codigo'  AND estado = 'Activo'");
        $ms->NextRecord();
        $um = $ms->Get("um");
        $mnj_x_lotes = $ms->Get("mnj_x_lotes");
        
        $Query = "SELECT tara AS U_tara,gramaje AS U_gramaje,l.ancho AS U_ancho,padre AS U_padre,s.kg_ent AS U_kg_desc, s.cantidad AS Quantity FROM stock s, articulos a , lotes l 
            WHERE a.codigo = l.codigo AND s.lote = l.lote  AND a.codigo = s.codigo AND  s.codigo = '$codigo' AND s.lote = '$lote' AND suc = '$suc' AND s.estado_venta NOT IN ('Bloqueado','FP')";
        
        if($mnj_x_lotes != "Si"){   
            $Query = "SELECT 0 AS U_tara,0 AS U_gramaje,a.ancho AS U_ancho,'' AS U_padre,s.kg_ent AS U_kg_desc, SUM(s.cantidad) AS Quantity  FROM stock s, articulos a 
            WHERE a.codigo = s.codigo AND  s.codigo = '$codigo' AND s.suc = '$suc'  AND s.estado_venta NOT IN ('Bloqueado','FP') GROUP BY s.codigo" ;                       
        }
        $ms->Query($Query);
         
          
        if($ms->NumRows() > 0){
            $ms->NextRecord();
            $datos = $ms->Record;
        }else{
            $datos['U_tara'] = "Error";
            $datos['U_gramaje'] = "Error";
            $datos['U_ancho'] = "Error";
            $datos['U_padre'] = "Error";
            $datos['U_kg_desc'] = "Error";
            $datos['Quantity'] = "Error";
            $datos['estado_venta'] = "Bloqueado";
        }   
            
        $datos['UM'] = $um;
        $datos['mnj_x_lotes'] = $mnj_x_lotes;
          
       
        $ms->Close();
        return $datos;
    }

    function transportadoras() {
        $link = new My();
        $transportadoras = "";
        $link->Query("select cod_prov as CardCode,nombre as transportadora, ci_ruc as RUC  from proveedores WHERE ocupacion like 'Transportadora'");
        $transportadoras .= "<li data-ruc='80001404-9' onclick='seleccionarTransportadora($(this))'>MOVIL LOCAL</li>";
        while ($link->NextRecord()) {
            $transportadoras .= "<li data-ruc='" . $link->Record['RUC'] . "' onclick='seleccionarTransportadora($(this))'>" . utf8_encode($link->Record['transportadora']) . "</li>";
        }
        return $transportadoras;
    }

    public function guardarTransportadora() {
        $link = new My();
        $n_nro = $_POST['n_nro'];
        $transportadora = $_POST['transportadora'];
        $nro_levante = $_POST['nro_levante'];
        $cod_cli = $_POST['cod_cli'];
        $transp_ruc = $_POST['transp_ruc'];
        $chofer = $_POST['chofer'];
        $ci_chofer = $_POST['ci_chofer'];
        $rua = $_POST['rua'];
        $nro_chapa = $_POST['nro_chapa'];

        $link->Query("UPDATE nota_remision SET transportadora='$transportadora', nro_chapa= '$nro_chapa',rua='$rua', nro_levante='$nro_levante',cod_cli = '$cod_cli',chofer = '$chofer',ci_chofer = '$ci_chofer', transp_ruc = '$transp_ruc', hora_cierre = CURRENT_TIME WHERE n_nro=$n_nro");
        if ($link->AffectedRows() > 0) {
            echo '{"msj":"OK"}';
        } else {
            echo '{"error":"Error al actualizar datos de transportadora"}';
        }
    }

    function buscarCliente() {
        $criterio = $_POST['criterio'];
        $ms = new My();
        $ms->Query("select cod_cli as CardCode,nombre as CardName  from clientes  WHERE  nombre like '$criterio%' limit 50");
        $arr = array();
        while ($ms->NextRecord()) {
            array_push($arr, array_map('utf8_encode', $ms->Record));
        }
        echo json_encode($arr);
    }

    function getTotalPaquetes() {
        $nro_remito = $_POST['nro_remito'];
        $db = new My();
        $db->Query("SELECT MAX(IF(paquete IS NOT NULL,paquete,1) ) AS Ultimo, COUNT(DISTINCT paquete) AS Paquetes , SUM(IF(procesado = 1,1,0)) AS Punteados, COUNT(*) AS Total  FROM nota_rem_det WHERE n_nro =  $nro_remito");
        $db->NextRecord();
        $Ultimo = $db->Record['Ultimo'];
        $Punteados = $db->Record['Punteados'];
        $Paquetes = $db->Record['Paquetes'];
        $Total = $db->Record['Total'];
        if ($Ultimo == null) {
            $Ultimo = 0;
        }
        if ($Punteados == null) {
            $Punteados = 0;
        }
        echo json_encode(array("Ultimo" => $Ultimo, "Punteados" => $Punteados, "Paquetes" => $Paquetes, "Total" => $Total));
    }

    function getPunteadosXNroPaquete() {
        $nro_remito = $_POST['nro_remito'];
        $paquete = $_POST['paquete'];
       
        $db = new My();
        $db->Query(" SELECT  SUM(IF(procesado = 1,1,0)) AS Punteados,( SELECT MAX(paquete)  FROM nota_rem_det WHERE n_nro =  $nro_remito  ) AS maximo   FROM nota_rem_det WHERE n_nro =  $nro_remito AND paquete = $paquete;");
        $db->NextRecord();
        $Punteados = $db->Record['Punteados'];
        if ($Punteados == null) {
            $Punteados = 0;
        }
        $Maximo = $db->Record['maximo'];
        if ($Maximo == null) {
            $Maximo = 0;
        }
        echo json_encode(array("Punteados" => $Punteados, "Maximo" => $Maximo));
    }

    function getDatosTransporte() {
        $transp_ruc = $_POST['transp_ruc'];
        $index = $_POST['index'];
        
        $sql = "SELECT rua AS RUA,chapa AS Chapa,marca AS Marca FROM moviles m, proveedores p WHERE p.cod_prov = m.codigo_entidad and id_movil = 'Movil_$index' AND p.ci_ruc  = '$transp_ruc'; ";
        
        $fn = new Functions(); 
        echo json_encode($fn->getResultArray($sql));
    }

    function getDatosChofer() {
        $transp_ruc = $_POST['transp_ruc'];
        $index = $_POST['index'];
        
        $sql = "SELECT c.nombre AS Chofer,doc AS CI FROM contactos c, proveedores p WHERE p.cod_prov = c.codigo_entidad and id_contacto = 'Chofer_$index' AND p.ci_ruc = '$transp_ruc'; ";
        $fn = new Functions(); 
        echo json_encode($fn->getResultArray($sql));
    }

    function isMobile() {
        return preg_match("/(android|avantgo|blackberry|bolt|boost|cricket|docomo|fone|hiptop|mini|mobi|palm|phone|pie|tablet|up\.browser|up\.link|webos|wos)/i", $_SERVER["HTTP_USER_AGENT"]);
    }

}

new CargarNotaRemision();
