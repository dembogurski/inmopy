<?php

/**
 * Description of VentasEnEmpaque
 * @author Ing.Douglas
 * @date 07/05/2015
 */

require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");
require_once("../Functions.class.php");
require_once("../clientes/Clientes.class.php");
 

class VentasEnEmpaque {
    function __construct() {
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }

    function main() {
     
        //$session = $_POST['session'];
        $usuario = $_POST['usuario'];
        $suc = $_POST['suc'];
        $c = new Clientes();
        $c->getABM();
        $e = new Y_Template("VentasEnEmpaque.html");
        
        $c = new Config();
        $host = $c->getNasHost();
        $path = $c->getNasFolder();
        $images_url = "http://$host/$path";
        $e->Set("images_url",$images_url);

        $db = new My();
         
        
        $e->Show("header");

        $e->Set("suc", $suc);
        $e->Set("usuario", $usuario);
        $db->Query("select valor from parametros where clave = 'margen_tol_empaque'");
        $db->NextRecord();
        $margen_tolerancia = $db->Record['valor'];        
        $e->Set("margen_tolerancia", $margen_tolerancia);
        
        
        // Lista de Balanzas Relacionadas
        
        $f = new Functions();
        $ip = $f->getIP();
        //echo $ip;
        $db->Query("SELECT ip_alt FROM pcs WHERE suc = '$suc' AND tipo_periferico = 'Balanza' AND `local` = 'No' and ip = '$ip' ");
       
        $alternativos = "";
        while($db->NextRecord()){
            $ip_alt = $db->Record['ip_alt'];
            $alternativos.="<option>$ip_alt</option>";
        }
        $e->Set("alternativos", $alternativos);

        $db->Query("SELECT f_nro as nro, DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha, cod_cli ,ruc_cli AS ruc, cliente, cat , total ,total_desc,total_bruto,empaque,f.usuario as vendedor, f.estado, u.doc, CONCAT(u.nombre, ' ',IF(u.apellido IS NULL,'', u.apellido)) as nombre, if(tel is null,'000-000000',tel) as tel FROM factura_venta f INNER JOIN usuarios u ON u.usuario = f.usuario WHERE  (f.estado='En_caja' or f.estado = 'Cerrada') and  empaque = 'No'  AND f.suc = '$suc'"); // En_caja o Cerrada por el Cajero

        $e->Show("ventas_empaque_cab");
        $j = 0;
        while ($db->NextRecord()) {
            $nro = $db->Record['nro'];
            $fecha = $db->Record['fecha'];
            $cod_cli = $db->Record['cod_cli'];
            $ruc = $db->Record['ruc'];
            $cat = $db->Record['cat'];
            $cliente = $db->Record['cliente']; 
            $total = $db->Record['total'];
            $total_desc = $db->Record['total_desc'];
            $total_bruto = $db->Record['total_bruto'];
            $vendedor = $db->Record['vendedor'];
            $nombre = $db->Record['nombre'];
            $doc = $db->Record['doc'];
            $tel = $db->Record['tel'];
            $estado = $db->Record['estado'];
            $empaque = $db->Record['empaque'];
 
            $e->Set("j", $j);
            $e->Set("nro", $nro);
            $e->Set("fecha", $fecha);
            $e->Set("cliente", $cliente);
            $e->Set("cod_cli", $cod_cli);
            $e->Set("cat", $cat);
            $e->Set("ruc", $ruc);
            $e->Set("vendedor", $vendedor);
            $e->Set("nombre", $nombre);
            $e->Set("doc", $doc);
            $e->Set("tel", $tel);
            $e->Set("ticket", $this->getFacturaAbierta($usuario,$doc));
            $e->Set("notacredito", $this->getNotaCredito($nro));
            $e->Set("total_neto", number_format($total, 0, ',', '.'));
            $e->Set("total_desc", number_format($total_desc, 0, ',', '.'));
            $e->Set("total_bruto", number_format($total_bruto, 0, ',', '.'));
            $e->Set("estado", $estado);
            $e->Set("empaque", $empaque); 
            $j++;
            $e->Show("ventas_empaque_data");
        }
        
        if($suc == "00"){
            $e->Set("transportadoras", $this->transportadoras());
        }
        
        $e->Set("cant_facturas", $j); 
        $e->Show("ventas_empaque_foot");
        $e->Show("control_popup");
        
   }
   function transportadoras() {
         
        $link = new My();
        $transportadoras = "";
        $link->Query("SELECT cod_prov,nombre,ci_ruc FROM proveedores WHERE ocupacion LIKE 'Transportadora' AND estado = 'Activo'");
        $transportadoras .= "<li data-ruc='80001404-9' onclick='seleccionarTransportadora($(this))'>MOVIL LOCAL</li>";
        while ($link->NextRecord()) {
            $transportadoras .= "<li data-ruc='" . $link->Record['ci_ruc'] . "'  onclick='seleccionarTransportadora($(this))'>" . utf8_encode($link->Record['nombre']) . "</li>";
        }
        return $transportadoras;
    }
    
   function getFacturaAbierta($empaquetador, $vendedorRUC){
       $link = new My();
       $ticket = 0;
       $link->Query("SELECT f_nro FROM factura_venta WHERE estado='Abierta' AND usuario = '$empaquetador' AND ruc_cli like '$vendedorRUC%'");
       if($link->NextRecord()){
           $ticket = (int)$link->Record['f_nro'];
       }
       return $ticket;
   }

   function getNotaCredito($f_nro){
       $link = new My();
       $n_nro = 0;
       $link->Query("SELECT n_nro FROM nota_credito WHERE f_nro=$f_nro and estado = 'Pendiente'");
       if($link->NextRecord()){
           $n_nro = (int)$link->Record['n_nro'];
       }
       return $n_nro;
   }
}

function getMaxPaquete(){
    $factura = $_POST['factura'];
    $db = new My();
    $db->Query("SELECT IF(MAX(paquete) IS NULL,0,MAX(paquete)) AS Maximo FROM fact_vent_det WHERE f_nro = $factura;");
    $db->NextRecord();
    $max = $db->Record['Maximo'];
    echo json_encode(array("max"=>$max));    
}

function guardarControlLaser() {
    $db = new My();
    $factura = $_REQUEST['factura'];
    $lote = $_REQUEST['lote'];
    $paquete = $_REQUEST['paquete'];
    $db->Query("update fact_vent_det set  control_laser = CURRENT_TIMESTAMP,paquete = $paquete where f_nro = $factura and lote = '$lote';");
    echo "Ok";
}

new VentasEnEmpaque();

?>