<?php

/**
 * Description of CambiosChacoParser
 * @author Ing.Douglas
 * @date 03/05/2019
 */
require_once '../../Y_Template.class.php';

class CambiosChacoParser {

    function __construct() {

        //echo getcwd();
         
        $t = new Y_Template("CambiosChaco.html");

        // Codigos de Sucursales de Cambios Chaco

        $array = array(
            "00" => "23",       
            "01" => "23",
            "02" => "23",   
            "04" => "23",
            "05" => "27",
            "06" => "10",
            "10" => "9",
            "24" => "6",
            "25" => "2",
            "30" => "8"
        );

        $imgs = array(
            "BRL" => "rs",
            "USD" => "us",
            "ARS" => "ps"
        );

        $fa = "";

        $suc = $_REQUEST['suc'];
        $code = $array[$suc];


        if ($code != "") {
              
            $json = file_get_contents("http://www.cambioschaco.com.py/api/branch_office/$code/exchange");

            $ext = json_decode($json);

            $items = array();

            foreach ($ext as $key => $value) {
                //echo "$key   :  $value <br>";
                if ($key == 'updateTs') {
                    $fa = $value;
                }
                if ($key == 'items') {
                    $items = stdToArray($value);
                }
            }
            
            $fecha_actualizacion = 
                    substr($fa, 8,2)."-".substr($fa, 5,2)."-". substr($fa, 0,4)." &nbsp;  ". substr($fa, 11,5);
            
            
            $t->Show("header");
            $t->Set("updated", $fecha_actualizacion);
            $t->Show("head");

            for ($i = 0; $i <= 2; $i++) {

                $moneda = $items[$i]['isoCode'];
                $compra = $items[$i]['purchasePrice'];
                $venta = $items[$i]['salePrice'];

                $estadoCompra = $items[$i]['purchaseTrend'];
                $estadoVenta = $items[$i]['saleTrend'];
                $img = $imgs[$moneda];

                

                $t->Set("moneda", $img);
                $t->Set("compra", number_format($compra,0,',','.'));  
                $t->Set("venta",  number_format($venta,0,',','.'));

                $t->Show("data");
            }
        } else {
            echo "Sucursal no definida contactar con informatica";
        }

        //var_dump($ar);
    }

}

function stdToArray($obj) {
    $reaged = (array) $obj;
    foreach ($reaged as $key => &$field) {
        if (is_object($field))
            $field = stdToArray($field);
    }
    return $reaged;
}

new CambiosChacoParser();
?>