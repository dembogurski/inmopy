<?php

/**
 * Description of CalculoVariable
 * @author Ing.Douglas
 * @date 17/05/2017
 */
require_once("../Y_DB_MySQL.class.php");
require_once("../Y_Template.class.php");

class CalculoVariable {

    var $meta_base = 0;
    var $meta_minima = 0;
    var $variable = 0;
    var $ponderacion = 0;
    var $pond_neg = 0;
    var $DEV_TOTAL_NORMAL = 0;
    var $DEV_TOTAL_OFERTA = 0;
    var $DEV_TOTAL_NORMAL_Y_OFERTA = 0;
    var $ZDEV_Oferta1 = 0;
    var $ZDEV_Normal1 = 0;
    var $ZDEV_Oferta3 = 0;
    var $ZDEV_Normal3 = 0;
    var $ZDEV_OfertaM = 0;
    var $ZDEV_NormalM = 0;
    var $TOTAL_NORMAL = 0;
    var $TOTAL_OFERTA = 0;
    var $TOTAL_NORMAL_Y_OFERTA = 0;
    var $Z_Oferta1 = 0;
    var $Z_Normal1 = 0;
    var $Z_Oferta3 = 0;
    var $Z_Normal3 = 0;
    var $Z_OfertaM = 0;
    var $Z_NormalM = 0;
    var $master_devs = array();
    var $master = array();
    var $meta_normales = 0;
    var $meta_ofertas = 0;

    function __construct() {
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }

    function main() {
        $desde = $_REQUEST['desde'];
        $desde_eng = substr($desde, 6, 4) . '-' . substr($desde, 3, 2) . '-' . substr($desde, 0, 2);
        $hasta = $_REQUEST['hasta'];
        $hasta_eng = substr($hasta, 6, 4) . '-' . substr($hasta, 3, 2) . '-' . substr($hasta, 0, 2);
        $usuario = $_REQUEST['usuario'];
        $user = $_REQUEST['user'];

        $t = new Y_Template("CalculoVariable.html");
        $t->Show("header");

        $t->Set("desde", $desde);
        $t->Set("hasta", $hasta);
        $t->Set("desde_eng", $desde_eng);
        $t->Set("hasta_eng", $hasta_eng);
        $t->Set("vendedor", $usuario);
   
        $t->Set("user", $user);
        $t->Set("time", date("d-m-Y H:i"));

        $db = new My();
        
        
        
        
        $db->Query("SELECT doc,nombre,apellido,tel,date_format(fecha_cont,'%d-%m-%Y') as fecha_cont,imagen,id_tipo,sueldo_fijo,sueldo_contable,suc FROM usuarios WHERE usuario = '$usuario'");
        $db->NextRecord();
        $doc = $db->Record['doc'];
        $nombre = $db->Record['nombre'];
        $apellido = $db->Record['apellido'];
        $tel = $db->Record['tel'];
        $fecha_cont = $db->Record['fecha_cont'];
        $id_tipo = $db->Record['id_tipo'];
        $sueldo_fijo = $db->Record['sueldo_fijo'];
        $sueldo_contable = $db->Record['sueldo_contable'];
        if($sueldo_contable == null){
            echo "Error sueldo contable no definido para: $nombre $apellido";
            die();
        }
        
        $t->Set("nombre", $nombre . " " . $apellido);
        $t->Set("doc", $doc);
        $t->Set("fecha_cont", $fecha_cont);
        $t->Set("tipo_vend", $id_tipo);
        $t->Set("sueldo_fijo", number_format($db->Record['sueldo_fijo'], 0, ',', '.'));

        if ($id_tipo == "") {
            $t->Set("err_msg", "Tipo de Vendedor no asignado a este usuario!");
            $t->Show("alerta");
            die();
        }

        $this->getDevoluciones($desde_eng, $hasta_eng, $usuario,$id_tipo);
        $this->getVentas($desde_eng, $hasta_eng, $usuario,$id_tipo);
        
        //echo "Devoluciones " .$this->DEV_TOTAL_NORMAL_Y_OFERTA."<br";

        $this->getVariable($t, $this->TOTAL_NORMAL_Y_OFERTA, $usuario);


        $t->Set("meta", "<img src='../img/loading_fast.gif'>");
        $t->Set("variable", "<img src='../img/loading_fast.gif'>");
        $t->Set("meta_normal", "<img src='../img/loading_fast.gif'>");
        $t->Set("meta_ofertas", "<img src='../img/loading_fast.gif'>");

        $t->Show("user_data");
 
        if($id_tipo == "MY-4-7" || $id_tipo == "MY-3"){
           $t->Set("display","display:none");
        }
        // Logros
        $t->Show("logros_x_cat_h");


        for ($cat = 1; $cat < 8; $cat++) {
            $t->Set("cat", $cat);
            $arr = array();
            if (array_key_exists($cat, $this->master)) {
                $arr = $this->master[$cat];
            } else {
                $arr = array('Normal' => 0, 'Oferta' => 0);
            }
            $Normal = $arr['Normal'];
            $Oferta = $arr['Oferta'];
             
            $t->Set("normales", number_format($Normal, 0, ',', '.'));
            $t->Set("ofertas", number_format($Oferta, 0, ',', '.'));

            $arr_dev = array();
            if (array_key_exists($cat, $this->master_devs)) {
                $arr_dev = $this->master_devs[$cat];
            } else {
                $arr_dev = array('Normal' => 0, 'Oferta' => 0);
            }
            $DevNormal = $arr_dev['Normal'];
            $DevOferta = $arr_dev['Oferta'];

            $t->Set("dev_ofertas", number_format($DevOferta, 0, ',', '.'));
            $t->Set("dev_normales", number_format($DevNormal, 0, ',', '.'));



            if ($cat == 1) {
                $ZO1 = number_format($this->Z_Oferta1, 0, ',', '.');
                $ZN1 = number_format($this->Z_Normal1, 0, ',', '.');
                $ZT1 = number_format($this->Z_Oferta1 + $this->Z_Normal1, 0, ',', '.');
                $t->Set("agrup_cols", "<td class='num' rowspan='2'>$ZO1</td> <td class='num' rowspan='2'>$ZN1</td> <td class='num' rowspan='2'>$ZT1</td>");
            } else {
                $t->Set("agrup_cols", "");
            }
            if ($cat == 3) {
                $ZO3 = number_format($this->Z_Oferta3, 0, ',', '.');
                $ZN3 = number_format($this->Z_Normal3, 0, ',', '.');
                $ZT3 = number_format($this->Z_Oferta3 + $this->Z_Normal3, 0, ',', '.');
                $t->Set("agrup_cols", "<td class='num'>$ZO3</td> <td class='num'>$ZN3</td> <td class='num' >$ZT3</td>");
            }
            if ($cat == 4) {
                $ZOM = number_format($this->Z_OfertaM, 0, ',', '.');
                $ZNM = number_format($this->Z_NormalM, 0, ',', '.');
                $ZTM = number_format($this->Z_OfertaM + $this->Z_NormalM, 0, ',', '.');
                $t->Set("agrup_cols", "<td class='num' rowspan='4'>$ZOM</td> <td class='num' rowspan='4'>$ZNM</td> <td class='num' rowspan='4'>$ZTM</td>");
            }

            $t->Show("logros_x_cat_data");
        }
        $t->Set("tofertas", number_format($this->TOTAL_OFERTA, 0, ',', '.'));
        $t->Set("tnormales", number_format($this->TOTAL_NORMAL, 0, ',', '.'));
        $t->Set("tdev_ofertas", number_format($this->DEV_TOTAL_OFERTA, 0, ',', '.'));
        $t->Set("tdev_normales", number_format($this->DEV_TOTAL_NORMAL, 0, ',', '.'));

        $TOTAL_AGRUP_OFERTAS = $this->TOTAL_OFERTA - $this->DEV_TOTAL_OFERTA;
        $TOTAL_AGRUP_NORMALES = $this->TOTAL_NORMAL - $this->DEV_TOTAL_NORMAL;
        $TOTAL = $TOTAL_AGRUP_OFERTAS + $TOTAL_AGRUP_NORMALES;

        $t->Set("tagrup_ofertas", number_format($TOTAL_AGRUP_OFERTAS, 0, ',', '.'));
        $t->Set("tagrup_normales", number_format($TOTAL_AGRUP_NORMALES, 0, ',', '.'));
        $t->Set("total_agrup", number_format($TOTAL, 0, ',', '.'));

        $t->Show("logros_x_cat_f");

        $categoria_madre = "";

        $db->Query("SELECT nombre_agrup AS agrup,meta_base_coef FROM tipo_vendedor WHERE id_tipo = '$id_tipo'");
        
        
        $db->NextRecord();
        $agrup = $db->Record['agrup'];
        $agrup_usuario = $agrup;
        $categoria_madre = $agrup;
        $meta_base_coef_madre = $db->Record['meta_base_coef'];
        $coef = 1;
        $t->Show("cuadro_conv_h");
        $t->Set("agrup", $agrup);
        $t->Set("meta_conv", number_format($meta_base_coef_madre, 0, ',', '.'));
        $t->Set("coef", number_format($coef, 3, ',', '.'));

        $ofertas_conv = 0;
        $normales_conv = 0;
        $totales_conv = 0;

        $subtotal_ofertas = 0;
        $subtotal_normales = 0;

        if ($agrup == "Minorista") {
            $ofertas_conv = $this->Z_Oferta1 / $coef;
            $normales_conv = $this->Z_Normal1 / $coef;
        } elseif ($agrup == "Mayorista-3") {
            $ofertas_conv = $this->Z_Oferta3 / $coef;
            $normales_conv = $this->Z_Normal3 / $coef;
        } else {//Mayorista 4-7
            $ofertas_conv = $this->Z_OfertaM / $coef;
            $normales_conv = $this->Z_NormalM / $coef;
        }
        $totales_conv = $ofertas_conv + $normales_conv;
        $subtotal_ofertas +=0 + $ofertas_conv;
        $subtotal_normales+=0 + $normales_conv;

        $t->Set("ofertas_conv", number_format($ofertas_conv, 0, ',', '.'));
        $t->Set("normales_conv", number_format($normales_conv, 0, ',', '.'));
        $t->Set("totales_conv", number_format($totales_conv, 0, ',', '.'));

        $t->Show("cuadro_conv_data");

        $db->Query("SELECT DISTINCT nombre_agrup AS agrup,meta_base_coef FROM tipo_vendedor WHERE nombre_agrup <> '$agrup' AND nombre_agrup <> 'Gerente'");
        while ($db->NextRecord()) {
            $agrup = $db->Record['agrup'];
            $meta_base_coef = $db->Record['meta_base_coef'];
            $t->Set("agrup", $agrup);
            $t->Set("meta_conv", number_format($meta_base_coef, 0, ',', '.'));
                        
            if($usuario == "andreaM" || $agrup_usuario == "Minorista"){   
               $coef = $meta_base_coef / $meta_base_coef_madre;               
            }else{
               $coef =  1; 
            }

            $t->Set("coef", number_format($coef, 3, ',', '.'));
            if ($agrup == "Minorista") {
                $ofertas_conv = $this->Z_Oferta1 / $coef;
                $normales_conv = $this->Z_Normal1 / $coef;
            } elseif ($agrup == "Mayorista-3") {
                $ofertas_conv = $this->Z_Oferta3 / $coef;
                $normales_conv = $this->Z_Normal3 / $coef;
            } else {//Mayorista 4-7
                $ofertas_conv = $this->Z_OfertaM / $coef;
                $normales_conv = $this->Z_NormalM / $coef;
            }
            $totales_conv = $ofertas_conv + $normales_conv;
            $subtotal_ofertas +=0 + $ofertas_conv;
            $subtotal_normales+=0 + $normales_conv;

            $t->Set("ofertas_conv", number_format($ofertas_conv, 0, ',', '.'));
            $t->Set("normales_conv", number_format($normales_conv, 0, ',', '.'));
            $t->Set("totales_conv", number_format($totales_conv, 0, ',', '.'));
            $t->Show("cuadro_conv_data");
        }
        $SUBTOTAL_CONV_NORMAL_Y_OFERTA = $subtotal_ofertas + $subtotal_normales;


        $this->getVariable($t, $SUBTOTAL_CONV_NORMAL_Y_OFERTA, $usuario);

        /*
          echo "VARIABLE ".$this->variable."<br>";

          echo "META OFERTAS ".$this->meta_ofertas."<br>";
          echo "META NORMALES ".$this->meta_normales."<br>"; */

        $t->Set("meta_aux", number_format($this->meta_base, 0, ',', '.'));
        $t->Set("variable_aux", number_format($this->variable, 0, ',', '.'));
        $t->Set("meta_normal_aux", number_format($this->meta_normales, 0, ',', '.'));
        $t->Set("meta_ofertas_aux", number_format($this->meta_ofertas, 0, ',', '.'));
        $t->Show("data_aux");

        $t->Set("subtotal_ofertas", number_format($subtotal_ofertas, 0, ',', '.'));
        $t->Set("subtotal_normales", number_format($subtotal_normales, 0, ',', '.'));
        $t->Set("subtotal_oferta_y_normal", number_format($SUBTOTAL_CONV_NORMAL_Y_OFERTA, 0, ',', '.'));

        if ($this->meta_ofertas == 0) {
            $this->meta_ofertas = 1;
        }


        $porc_logro_ofertas = ($subtotal_ofertas / $this->meta_ofertas) * 100;
        $porc_logro_normales = ($subtotal_normales / $this->meta_normales) * 100;
        $porc_logro_total = ($SUBTOTAL_CONV_NORMAL_Y_OFERTA / $this->meta_base) * 100;

        // Determinar si cobra o no la Variable Si 
        $cobra_variable = false;
        if ($SUBTOTAL_CONV_NORMAL_Y_OFERTA >= $this->meta_minima) {
            $cobra_variable = true;
            $t->Set("cobra", "cobra");
        } else {
            $cobra_variable = false;
            $t->Set("cobra", "no-cobra");
        }
        //echo "($porc_logro_ofertas >= $pond_neg) && ($porc_logro_normales >= $ponderacion)  cobra_variable= $cobra_variable";

        

        $t->Set("logro_ofertas", number_format($porc_logro_ofertas, 2, ',', '.'));
        $t->Set("logro_normales", number_format($porc_logro_normales, 2, ',', '.'));
        $t->Set("logro_total", number_format($porc_logro_total, 2, ',', '.'));

        //echo "Variable:   $variable $pond_neg $ponderacion $logro_ofertas"; 
        $premio_ofertas = ((($this->variable * $this->pond_neg) / 100) * $porc_logro_ofertas) / 100;
        $premio_normales = ((($this->variable * $this->ponderacion) / 100) * $porc_logro_normales) / 100;
        $premio_total = $premio_ofertas + $premio_normales;

        $t->Set("premio_ofertas", number_format($premio_ofertas, 0, ',', '.'));
        $t->Set("premio_normales", number_format($premio_normales, 0, ',', '.'));
        $t->Set("premio_total", number_format($premio_total, 0, ',', '.'));

        $total_cobrar = $sueldo_fijo;
        if ($cobra_variable) {
            $total_cobrar = $sueldo_fijo + $premio_total;
        }

        $t->Set("sueldo_contable", number_format($sueldo_contable, 0, ',', '.'));

        $premio_acreditar = $total_cobrar - $sueldo_contable;
        $t->Set("premio_acreditar", number_format($premio_acreditar, 0, ',', '.'));

        $t->Set("total_cobrar", number_format($total_cobrar, 0, ',', '.'));
        $t->Show("cuadro_conv_f");
    }

    function getDevoluciones($desde_eng, $hasta_eng, $usuario,$tipo) {
        // Devoluciones
        $master_devs = array();
        $devs = "SELECT  CAT,SUM( IF( d.estado_venta  = 'Normal',d.subtotal,0) ) AS Normal, SUM(IF(d.estado_venta  != 'Normal',d.subtotal,0)) AS Oferta FROM nota_credito n, nota_credito_det d 
        WHERE n.n_nro = d.n_nro  AND n.fecha BETWEEN '$desde_eng' AND '$hasta_eng' AND n.vendedor = '$usuario'  AND n.estado = 'Cerrada' GROUP BY cat";
        if($tipo == "MY-4-7" || $tipo == "MY-3"){
               $devs = "SELECT  CAT,SUM(  d.subtotal  ) AS Normal, 0 AS Oferta FROM nota_credito n, nota_credito_det d 
               WHERE n.n_nro = d.n_nro  AND n.fecha BETWEEN '$desde_eng' AND '$hasta_eng' AND n.vendedor = '$usuario'  AND n.estado = 'Cerrada' GROUP BY cat";
            } 
        
        $db = new My();
        $db->Query($devs);
        while ($db->NextRecord()) {
            $cat = $db->Record['CAT'];
            $Normal = $db->Record['Normal'];
            $Oferta = $db->Record['Oferta'];
             
            $master_devs[$cat] = array('Normal' => $Normal, 'Oferta' => $Oferta);
            
            $this->DEV_TOTAL_NORMAL +=0 + $Normal;
            $this->DEV_TOTAL_OFERTA +=0 + $Oferta;
            if ($cat < 3) {
                $this->ZDEV_Oferta1+=0 + $Oferta;
                $this->ZDEV_Normal1+=0 + $Normal;
            } elseif ($cat == 3) {
                $this->ZDEV_Oferta3+=0 + $Oferta;
                $this->ZDEV_Normal3+=0 + $Normal;
            } else {
                $this->ZDEV_OfertaM+=0 + $Oferta;
                $this->ZDEV_NormalM+=0 + $Normal;
            }
        }
        $this->DEV_TOTAL_NORMAL_Y_OFERTA = $DEV_TOTAL_NORMAL + $DEV_TOTAL_OFERTA;
         
        $this->master_devs = $master_devs;
    }

    function getVentas($desde_eng, $hasta_eng, $usuario,$tipo) {
 

        $ms = new My();
        $sql_my = "SELECT  cat AS CAT  ,SUM( IF( d.estado_venta  = 'Normal' OR d.estado_venta IS NULL,d.subtotal,0) ) AS Normal, SUM(IF(d.estado_venta  != 'Normal' AND d.estado_venta IS NOT NULL,d.subtotal,0)) AS Oferta 
        FROM factura_venta f, fact_vent_det d WHERE f.f_nro = d.f_nro  AND f.fecha_cierre BETWEEN   '$desde_eng' AND '$hasta_eng' AND f.usuario = '$usuario'  AND f.estado = 'Cerrada' GROUP BY cat";
       
         if($tipo == "MY-4-7" || $tipo == "MY-3"){
            $sql_my = "SELECT  cat AS CAT  ,SUM( d.subtotal  ) AS Normal,0 AS Oferta 
            FROM factura_venta f, fact_vent_det d WHERE f.f_nro = d.f_nro  AND f.fecha_cierre BETWEEN   '$desde_eng' AND '$hasta_eng' AND f.usuario = '$usuario'  AND f.estado = 'Cerrada' GROUP BY cat";
         } 
        
        $ms->Query($sql_my);

        //$master = array();


        while ($ms->NextRecord()) {
            $cat = $ms->Record['CAT'];
            $Normal = $ms->Record['Normal'];
            $Oferta = $ms->Record['Oferta'];
                   
            $this->TOTAL_NORMAL +=0 + $Normal;
            $this->TOTAL_OFERTA +=0 + $Oferta;
            $this->master[$cat] = array('Normal' => $Normal, 'Oferta' => $Oferta);
            

            if ($cat < 3) {
                $this->Z_Oferta1+=0 + $Oferta;
                $this->Z_Normal1+=0 + $Normal;
            } elseif ($cat == 3) {
                $this->Z_Oferta3+=0 + $Oferta;
                $this->Z_Normal3+=0 + $Normal;
            } else {
                $this->Z_OfertaM+=0 + $Oferta;
                $this->Z_NormalM+=0 + $Normal;
            }
        }
        $this->TOTAL_NORMAL_Y_OFERTA = ($this->TOTAL_NORMAL + $this->TOTAL_OFERTA) - $this->DEV_TOTAL_NORMAL_Y_OFERTA; // Restar Total Devoluciones


        $this->Z_Oferta1 = $this->Z_Oferta1 - $this->ZDEV_Oferta1;
        $this->Z_Normal1 = $this->Z_Normal1 - $this->ZDEV_Normal1;
        $this->Z_Oferta3 = $this->Z_Oferta3 - $this->ZDEV_Oferta3;
        $this->Z_Normal3 = $this->Z_Normal3 - $this->ZDEV_Normal3;
        $this->Z_OfertaM = $this->Z_OfertaM - $this->ZDEV_OfertaM;
        $this->Z_NormalM = $this->Z_NormalM - $this->ZDEV_NormalM;
    }

    function getVariable($t, $VALOR_LOGRADO, $usuario) {
         
        $db = new My();
        $sql = "SELECT id_meta,meta_base,meta_minima,sueldo_base AS variable,ponderacion FROM metas WHERE usuario = '$usuario' AND meta_minima < $VALOR_LOGRADO and meta_minima > 0 ORDER BY variable DESC LIMIT 1";
        $db->Query($sql);

        if ($db->NumRows() < 1) {
            
            /*
            $sql = "SELECT id_meta,meta_base,meta_minima,sueldo_base AS variable,ponderacion FROM metas WHERE usuario = '$usuario' and meta_minima > 0";
            $db->Query($sql);
            if ($db->NumRows() == 0) {
                $t->Set("err_msg", "Error Meta no defina para el usuario '$usuario'");
                $t->Show("alerta");
                die();
            }
            */
            $sql = "SELECT id_meta,meta_base,meta_minima,sueldo_base AS variable,ponderacion FROM metas WHERE usuario = '$usuario' and meta_minima > 0 limit 1";
            $db->Query($sql);
            if ($db->NumRows() == 0) {
                $t->Set("err_msg", "Error Meta no defina para el usuario '$usuario'");
                $t->Show("alerta");
                die();
            }else{
                $db->NextRecord();
                $this->id_meta = $db->Record['id_meta'];
                $this->meta_base = $db->Record['meta_base'];
                $this->meta_minima = $db->Record['meta_minima'];
                $this->variable = 0;
                $this->ponderacion = $db->Record['ponderacion'];
            } 
        }else{
            while ($db->NextRecord()) {
                $this->id_meta = $db->Record['id_meta'];
                $this->meta_base = $db->Record['meta_base'];
                $this->meta_minima = $db->Record['meta_minima'];
                $this->variable = $db->Record['variable'];
                $this->ponderacion = $db->Record['ponderacion'];
            }        
        }

        $this->pond_neg = 100 - $this->ponderacion;

        if ($this->ponderacion == 100) {  
            $this->pond_neg = 1;
        }
        $this->meta_normales = ($this->meta_base * $this->ponderacion) / 100;
        $this->meta_ofertas = ($this->meta_base * $this->pond_neg) / 100;
    }

}

function getComisionPorUnidad() {
    $usuario = $_REQUEST['usuario'];
    $desde = $_REQUEST['desde'];
    $hasta = $_REQUEST['hasta'];
    $arr = array();
    $arr[0] = array('comis' => 4000, 'codigos' => "'H0153','H0156','H0155','H0150','H0152','H0151','H0239','H0154'", "cat" => " < 5 ", 'descrip' => 'SABANAS 300 HILOS SATINADA');
    $arr[1] = array('comis' => 1500, 'codigos' => "'H0146','H0156','H0155','H0150','H0152','H0151','H0239','H0154'", "cat" => " > 4 ", 'descrip' => 'SABANAS 300 HILOS SATINADA');
    $arr[2] = array('comis' => 1500, 'codigos' => "'H0146'", "cat" => " < 5 ", 'descrip' => 'TOALLAS PARA EL CUERPO');
    $arr[3] = array('comis' => 750, 'codigos' => "'H0146'", "cat" => " > 4 ", 'descrip' => 'TOALLAS PARA EL CUERPO');
    $arr[4] = array('comis' => 2500, 'codigos' => "'H0159','H0158','H0157'", "cat" => " < 5 ", 'descrip' => 'EDREDONES');
    $arr[5] = array('comis' => 1250, 'codigos' => "'H0159','H0158','H0157'", "cat" => " > 4 ", 'descrip' => 'EDREDONES');

    //'2500'=>"'H0159','H0158','H0157'",

    $db = new My();
    $comisiones = array();

    foreach ($arr as $key => $array) {
        $comis = $array['comis'];
        $codigos = $array['codigos'];
        $cat = $array['cat'];
        $descrip = $array['descrip'];
        $db->Query("SELECT COUNT(*) AS cant,'$descrip' as descrip, $comis AS comision  FROM factura_venta f, fact_vent_det d WHERE 
             d.codigo IN($codigos) and cat $cat  AND f.f_nro = d.f_nro  AND f.fecha_cierre BETWEEN '$desde' AND '$hasta' AND f.usuario = '$usuario'  AND f.estado = 'Cerrada' ");

        if ($db->NumRows() > 0) {
            $db->NextRecord();
            $cant = (int)$db->Record['cant'];
            $descrip = $db->Record['descrip'];
            $comision = (int)$db->Record['comision'];
            array_push($comisiones, array('descrip' => $descrip, 'cant' => $cant, 'comision' => $comision, 'cat' => trim($cat)));
        }
    }
    echo json_encode($comisiones);
}

new CalculoVariable();
?>

