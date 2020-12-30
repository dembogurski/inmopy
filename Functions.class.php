<?php

/**
 * Description of Functions
 * @author Ing.Douglas
 * @date 27/04/2015
 */
class Functions {

    function __construct() {
        
    }

    /** 	extense		Return a extense of a number or a value
     * 	========================================================================
     * 	@author Sergio A. Pohlmann <sergio@Ycube.net>
     * 	@param	$value	A value to convert
     * 	@param	$type 	1 if is a monetary format / 0 if is a single number
     * 	@param	$upper 	1 to uppercase / 0 to lowercase
     *
     */
    function extense($value = 0, $moneda = "Guaranies", $type = 0, $upper = 1) {

        $value = strval($value);
        $value = str_replace(',', '', $value);

        if (strpos($value, ".") < 1) {
            $value .='.';
        }

        // If type is a single number
        if ($type == 0) {
            $pos = strpos($value, ".");
            $value = substr($value, 0, $pos);
            $sing = array("", "", "mil", "millon", "mil millon", "billon");
            $plural = array("", "", "mil", "millones", "mil", "billones");
        }
        // If type is a value number (monetary)
        else {
            $sing = array("centavo", "$moneda", "mil", "millon",
                "mil millon", "billon");
            $plural = array("centavos", "$moneda", "mil", "millones",
                "mil", "billones");
        }

        // Arrays to a number values
        // Hundreds
        $hund = array("", "cien", "doscientos", "trescientos", "cuatrocientos",
            "quinientos", "seiscientos", "setecientos", "ochocientos",
            "novecientos");
        // Decens
        $dec = array("", "diez", "veinte", "treinta", "cuarenta", "cincuenta",
            "sesenta", "setenta", "ochenta", "noventa");
        // Decens less than a twelve
        $dec2 = array("diez", "once", "doce", "trece", "catorce", "quince",
            "dieciseis", "diecisiete", "dieciocho", "diecinueve");
        // Units
        $units = array("", "uno", "dos", "tres", "cuatro", "cinco", "seis",
            "siete", "ocho", "nueve");

        $z = 0;
        $ret = '';

        // Separate in points format ###.###.###.##
        $value = number_format($value, 2, ".", ".");

        $int = explode(".", $value);
        for ($i = 0; $i < count($int); $i++) {
            for ($ii = strlen($int[$i]); $ii < 3; $ii++) {
                $int[$i] = "0" . $int[$i];
            }
        }

        $fim = count($int) - ($int[count($int) - 1] > 0 ? 1 : 2);
        for ($i = 0; $i < count($int); $i++) {
            $value = $int[$i];

            // Spanish Version
            $rc = (($value > 100) && ($value < 200)) ? "ciento" : $hund[$value[0]];
            $rd = ($value[1] < 2) ? "" : $dec[$value[1]];
            $ru = ($value > 0) ? (($value[1] == 1) ? $dec2[$value[2]] : $units[$value[2]]) : "";
            $r = $rc . (($rc && ($rd || $ru)) ? "  " : "") . $rd . (($rd &&
                    $ru) ? " y " : "") . $ru;
            $t = count($int) - 1 - $i;
            $r .= $r ? " " . ($value > 1 ? $plural[$t] : $sing[$t]) : "";
            if ($value == "000")
                $z++;
            elseif ($z > 0)
                $z--;
            if (($t == 1) && ($z > 0) && ($int[0] > 0))
                $r .= (($z > 1) ?
                                "" : "") . $plural[$t];
            //" de " : "").$plural[$t];
            if ($r)
                $ret = $ret . ((($i > 0) && ($i <= $fim) &&
                        ($int[0] > 0) && ($z < 1)) ? ( ($i < $fim) ? "  " : "  ") : " ") . $r;

            /* Portuguese Version
              $rc = (($value > 100) && ($value < 200)) ? "cento" : $hund[$value[0]];
              $rd = ($value[1] < 2) ? "" : $dec[$value[1]];
              $ru = ($value > 0) ? (($value[1] == 1) ? $dec2[$value[2]] : $units[$value[2]]) : "";
              $r = $rc.(($rc && ($rd || $ru)) ? " e " : "").$rd.(($rd &&
              $ru) ? " e " : "").$ru;
              $t = count($int)-1-$i;
              $r .= $r ? " ".($value > 1 ? $plural[$t] : $sing[$t]) : "";
              if ($value == "000")$z++; elseif ($z > 0) $z--;
              if (($t==1) && ($z>0) && ($int[0] > 0)) $r .= (($z>1) ?
              " de " : "").$plural[$t];
              if ($r) $ret = $ret . ((($i > 0) && ($i <= $fim) &&
              ($int[0] > 0) && ($z < 1)) ? ( ($i < $fim) ? " e " : " e ") : " ") . $r;
             */
        }

        // Replace UNO MIL

        $ret = str_replace("uno mil", "un mil", $ret);
        $ret = str_replace("uno millon", "un millon", $ret);
        $ret = str_replace("uno mil millon", "un mil", $ret);
        $ret = str_replace("uno mil", "un mil", $ret);

        if ($upper == 1) {
            $ret = strtoupper($ret);
        }


        return ($ret);
    }

// extense() -------------------------------------------------------------

    function makeLog($usuario, $accion, $data) {
        require_once("Y_DB_MySQL.class.php");
        $db = new My();
        $ip = $this->getIP();
        $db->Query("INSERT INTO logs(usuario, fecha, hora, accion, DATA,ip) VALUES ('$usuario', current_date, current_time, '$accion', '$data','$ip');");
        return true;
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

    function calcularDV($numero) {
        $basemax = 11;
        $codigo;
        $numero_al = "";
        $caracter; //extrae el caracter!!!		
        for ($i = 0; $i < strlen($numero); $i++) {
            //$caracter = numero.charAt(i);//se obtiene un caracter
            $caracter = $numero{$i};

            if (is_numeric($caracter)) {
                $numero_al = $numero_al . "" . $caracter;
            } else {
                //se debe allar el valor ascii de la letra
                $c = $caracter;
                //numero_al = numero_al + Integer.toString(c);
            }
        }
        ///////////CALCULO DEL DIGITO VERIFICADOR
        $k = 2;
        $v_total = 0;
        $aux;
        for ($i = strlen($numero_al) - 1; $i >= 0; $i--) {
            if ($k > $basemax) {
                $k = 2;
            }
            $aux = $numero_al{$i};
            $v_total = $v_total + ($aux * $k);
            $k = $k + 1;
        }
        $resto = $v_total % 11;
        $dv = 0;
        if ($resto > 1) {
            $dv = 11 - $resto;
        }
        return array("CI" => $numero_al, "DV" => $dv);
    }

    //Ejemplo de uso: obtener_dv("16557769") entrega "16557769-8".

    /**
     * 
     * @param type $fecha en formato Ingles '2017-10-04'  ->  '04-10-2017'
     * @return Fecha formato Latino Americano  
     */
    function invertirFecha($fecha) {
        $pos = strpos($fecha, "-");
        $char = '-';
        if ($pos === false) {
            $char = '-';
        } else {
            $char = '/';
        }
        $fecha_lat = substr($fecha, 8, 2) . $char . substr($fecha, 5, 2) . $char . substr($fecha, 0, 4);
        return $fecha_lat;
    }

    /**
     * 
     * @param type $fecha en formato Americano   '04-10-2017'  ->   '2017-10-04'
     * @return Fecha formato Latino Ingles
     */
    function invertirFechaLat($fecha) {

        $fecha_lat = substr($fecha, 6, 4) . '-' . substr($fecha, 3, 2) . '-' . substr($fecha, 0, 2);
        return $fecha_lat;
    }

    function chequearPermiso($id_permiso, $usuario) {
        $sql = "SELECT u.nombre AS nombre,ug.usuario,g.nombre,p.id_permiso AS id_permiso, g.descrip, descripcion,trustee 
        FROM  usuarios u,grupos g, usuarios_x_grupo ug, permisos_x_grupo p, permisos pr WHERE u.usuario = ug.usuario AND ug.id_grupo = p.id_grupo
        AND g.id_grupo = ug.id_grupo AND p.id_permiso = pr.id_permiso  AND ug.usuario = '$usuario' AND  p.id_permiso = '$id_permiso'";

        require_once("Y_DB_MySQL.class.php");
        $db = new My();
        $db->Query($sql);
        $permiso = array();
        if ($db->NumRows() > 0) {
            while ($db->NextRecord()) {
                $trustee = $db->Record['trustee'];
                if ($trustee != "---") {
                    return $trustee;
                }
            }
            return "---";
        } else {
            return "---";
        }
    }

    /**
     * Dado un valor devuelve otro en funcion del % 50 Ej.:  14521 --> 14500,  14532 --> 14550    
     * Resolucion 347 SEDECO
     * @param {type} valor
     * @returns {redondeo50.valor_redondeado}  
     */
    function redondeo50($valor) {
        $resto = fmod($valor, 50);
        $valor_redondear = 0;
        if ($resto >= 25) {
            $valor_redondear = 50 - $resto;
        } else {
            $valor_redondear = $resto * -1;
        }
        $valor_redondeado = $valor + $valor_redondear;
        return $valor_redondeado;
    }

    /**
     * Metodo generico para devolver un array en MySQL
     * @param type $sql
     * @return array
     */
    function getResultArray($sql) {
        require_once("Y_DB_MySQL.class.php");
        $db = new My();
        $array = array();
        $db->Query($sql);
         
        while ($db->NextRecord()) {
            array_push($array, $db->Record);
        }
        
        $db->Close();
        return $array;
    }

    function generarLote($codigo,$terminacion = null ) {        
        $ms = new My();
        //Verificar Primero si es manejado por lotes  o no
        $ms->Query("SELECT mnj_x_lotes FROM articulos WHERE codigo = '$codigo'");
        $ms->NextRecord();
        $mnj_x_lotes = $ms->Record['mnj_x_lotes'];
        if($mnj_x_lotes === "No"){
            return "";
        }else{   
            if (is_null($terminacion)){
                $terminacion = date("y");
            } 
            
            $ms->Query("SELECT CONCAT(serie,cod_serie) AS Lote FROM series_lotes WHERE cod_serie = '$terminacion';");
            $ms->NextRecord();
            $lote = $ms->Record['Lote'];
            $ms->Query("UPDATE series_lotes SET serie = serie  + 1 WHERE cod_serie = '$terminacion';");
            $ms->Close();
            return $lote;
        }
    }
    /**
     * Calcula el Precio Promedio Ponderado
     */
    function calcPPP($codigo,$id_compra){ 
        require_once("Y_DB_MySQL.class.php");
        $db = new My();
        
        
        
        // Datos del Stock Actual
        $db->Query("SELECT SUM(cantidad) AS stock_actual,a.costo_prom AS ppp,   SUM(cantidad) * a.costo_prom AS  valor_stock_actual FROM articulos a, stock s WHERE a.codigo = s.codigo AND s.codigo = '$codigo' AND tipo_ent = 'EM' AND nro_identif <> $id_compra AND s.estado_venta NOT IN( 'FP', 'Bloqueado') GROUP BY s.codigo");
        $stock_actual = 0;
        $precio_promedio_actual = 0;
        $valor_stock_actual = 0;
        
        if($db->NumRows()>0){
            $db->NextRecord();
            $stock_actual = $db->Get("stock_actual");
            $precio_promedio_actual = $db->Get("ppp");
            $valor_stock_actual = $db->Get("valor_stock_actual");
        }    
        
        // Datos de la compra actual + Gastos de la compra actual
        $db->Query("SELECT SUM(cant_calc) AS cant_compra, SUM(cant_calc *  precio_real)   AS  valor_stock_comprado,cotiz, sum(d.sobre_costo) as total_gastos ,e.origen, precio_real FROM articulos a, entrada_merc e, entrada_det d 
        WHERE  e.id_ent = d.id_ent AND a.codigo = d.codigo AND d.codigo = '$codigo'  AND e.id_ent = $id_compra and e.estado = 'Cerrada'  GROUP BY d.codigo ");
        $cant_compra = 0;
        $valor_stock_comprado = 0;
        $total_gastos = 0;
        $precio_cif = 0;
        $origen = "Internacional"; 
        if($db->NumRows()>0){
            $db->NextRecord();
            $cant_compra = $db->Get("cant_compra");
            $valor_stock_comprado = $db->Get("valor_stock_comprado");      
            $total_gastos = $db->Get("total_gastos");
            $origen = $db->Get("origen");
            $precio_cif = $db->Get("precio_real");
        }   
         
        
        $valor_stock_comprado += $total_gastos;
        
        $nuevo_ppp = ($valor_stock_actual + $valor_stock_comprado) / ($stock_actual + $cant_compra);
         
        $this->makeLog("Sistema", "Costo PPP", "Codigo: $codigo, Stock_Sctual:$stock_actual, Costo PPP Actual:$precio_promedio_actual, Valor Stock Actual: $valor_stock_actual, Cant.Compra Actual: $cant_compra, Valor Compra Actual: $valor_stock_comprado, Ref.: $id_compra");
        
        return array("PPP" =>$nuevo_ppp,"PrecioCIF"=>$precio_cif);
    } 
}

 
 
?>


