<?php

/**
 * Description of RemisionLegal
 * @author Ing.Douglas
 * @date 07/11/2018
 */
require_once '../Y_Template.class.php';    
require_once '../Y_DB_MySQL.class.php';
require_once '../Functions.class.php';

class RemisionLegal {
    
    public $distancias = array(
            "00-01"=>14,            
            "00-02"=>14,            
            "00-04"=>28,            
            "00-05"=>222,
            "00-06"=>264,
            "00-10"=>266,
            "00-24"=>364,
            "00-25"=>376,
            "00-30"=>367
         );
    
    function __construct() {
        
        $limite_items_x_venta = 47;         
        
        $nro_remito = $_REQUEST['nro_remito'];         
        $transp_ruc = $_REQUEST['transp_ruc'];
        //$chofer = utf8_decode($_REQUEST['chofer']);
        $nro_chapa = $_REQUEST['nro_chapa'];
        $usuario = $_REQUEST['usuario'];
        $cod_cli = $_REQUEST['cod_cli'];
        $nota_rem_legal = $_REQUEST['nota_rem_legal'];         
        
         
        $suc = $_REQUEST['suc'];        
        //$moneda = $_REQUEST['moneda']; 
        
        $decimales = 0;
         
        $db = new My();
        $link = new My();
        
        $tipo_doc = "Nota de Remision";
        $tipo_factura = 'Pre-Impresa';
        
        $t = new Y_Template("RemisionLegal.html"); 
        
        $db->Query("SELECT direccion,ciudad,pais,departamento,tel,ci_chofer,chofer,rua,nro_levante FROM  nota_remision n, sucursales s WHERE n_nro = $nro_remito AND n.suc  = s.suc AND n.suc = '$suc'");
        $db->NextRecord();
        //$db->Record = utf8_encode($db->Record);
        $direccion = $db->Record['direccion'];
        $ciudad = $db->Record['ciudad'];
        $depar_orig = $db->Record['departamento'];
        $pais = $db->Record['pais'];
        $tel = $db->Record['tel'];
        $chofer =  $db->Record['chofer'];
        $ci_chofer = $db->Record['ci_chofer'];
        $rua = $db->Record['rua'];
        $nro_levante = $db->Record['nro_levante'];
        
        $t->Set('ciudad_ori', $ciudad);
        $t->Set('origen', "$direccion");
        $t->Set('depar_orig', $depar_orig);
        $t->Set('tel_o', $tel);
        $t->Set('nro_levante', $nro_levante);
        
        
        $fecha_ahora = Date("d-m-Y");
        $days = 86400 * 3;
        $fecha_fin_transp = date("d-m-Y", time() + $days);
        
        
        $sqlm = "SELECT marca FROM moviles WHERE chapa = '$nro_chapa'";
        $link->Query($sqlm);
        $marca_vehiculo = "";
        if($link->NumRows()>0){
            $link->NextRecord();
            $marca_vehiculo = $link->Record['marca'];
        }
         
         
        $t->Set('chofer', $chofer);
        $t->Set('ci_chofer', $ci_chofer);
        $t->Set('nro_chapa', $nro_chapa);
        $t->Set("rua",$rua);   
        $t->Set("nro_chapa",$nro_chapa);   
        $t->Set("marca",$marca_vehiculo); 
        
        
         
        $t->Set('transp_ruc', $transp_ruc);
        $t->Set('fecha', $fecha_ahora);
        $t->Set('fecha_fin_transp', $fecha_fin_transp);
        $t->Set('ref', $nro_remito);
        
        $t->Set('moneda', str_replace("$", "s", $moneda));        
          
        $t->Set('usuario', $usuario);
         
                 
        
        
        $sql_addr =" SELECT nombre, dir, ciudad, pais FROM proveedores WHERE ci_ruc =  '$transp_ruc'";
        $link->Query($sql_addr);
        $dir = "";
        if($link->NumRows() > 0){
            $link->NextRecord();
            $transportadora = $link->Record['nombre'];
            $Address = $link->Record['dir'];
            $City = $link->Record['ciudad'];
            $Country = $link->Record['pais'];
            $dir = "$Address - $City - $Country"; 
        }
        $t->Set('transportadora', $transportadora);
        $t->Set('dir', $dir);      
        // Buscar limite de items por Factura    
         
        // En Espa�ol la Fecha
        $db->Query("SET lc_time_names = 'es_PY';");
        
        // Datos de la Cabecera de Factura y el Cliente
        
        $sql_cli ="SELECT suc_d,direccion,ciudad,pais,tel,departamento FROM nota_remision n, sucursales s WHERE n_nro = $nro_remito AND n.suc_d = s.suc  ";
        $db->Query($sql_cli);

        if($db->NumRows()==0){
           echo "Error: ".__file__."  ".__line__."<br> $sql_cli"; die();
        }	
        $db->NextRecord();
        $direccion_d = $db->Record['direccion'];
        $ciudad_d = $db->Record['ciudad'];
        $depar_des = $db->Record['departamento'];
        $pais_d = $db->Record['pais'];
        $tel_d = $db->Record['tel'];
        $suc_d = $db->Record['suc_d'];
        
        $dist = $this->getDistancia($suc,$suc_d);
        $t->Set("km_rec",$dist);
        
        if($cod_cli != ""){
            $sql_cli =" SELECT c.nombre,ci_ruc, dir, ciudad, pais,tel  FROM clientes c   WHERE cod_cli = '$cod_cli'";
            $link->Query($sql_cli);
            $dir = "";
            if($link->NumRows() > 0){
                $link->NextRecord();
                $Cliente = $link->Record['nombre'];
                $RucCli = $link->Record['ci_ruc'];
                $Address = $link->Record['dir'];
                $ciudad_d = $link->Record['ciudad'];
                $Country = $link->Record['pais'];
                $tel_d = $link->Record['tel'];
                $direccion_d = "$ciudad_d - $Address";
                $t->Set("cliente",$Cliente);
                $t->Set("ruc_cli",$RucCli);
                //$t->Set("domicilio",$direccion_d);
            }  
            $t->Set("motivo","Venta");
        }else{
            $t->Set("cliente","Corporaci&oacute;n Textil S.A.");
            $t->Set("ruc_cli","80001404-9");   
             
            $t->Set("motivo","Traslado entre Sucursales");
             
            //$t->Set("domicilio",$direccion_d);
        }
        
          
        
        $t->Set('ciudad_des', $ciudad_d);
        $t->Set('depar_des', $depar_des);
        $t->Set('destino', " $direccion_d");
        //$t->Set('tel_d', $tel_d);
        $master = array();

        //$sql_det = "select lote as codigo,descrip,cantidad,um_cod, precio_venta,descuento,subtotal from fact_vent_det where f_nro = $factura";
        $sql_det = "select count(*) as articulos,codigo,upper(descrip) as descrip,SUM(cantidad) AS cantidad,um_prod from nota_rem_det where n_nro = $nro_remito GROUP BY codigo ORDER BY codigo ASC,descrip ASC";
        $db->Query($sql_det);
        $cant = $db->NumRows();

        if($cant == 0){
           echo "Error: ".__file__."  ".__line__."<br> $sql_det"; die();
        }
        

        $i = 0;

        while ($db->NextRecord()) {
            $codigo = $db->Record['codigo'];
            $descri = $db->Record['descrip'];
            $piezas  = $db->Record['articulos'];
            if($piezas > 1){
                $f_descri = explode('-',$descri);
                array_pop($f_descri);
                $descri = implode('-',$f_descri);
            }

            $cant_v = $db->Record['cantidad'];
             
            $um = $db->Record['um_prod'];
             
             
            $master[$i] = array($codigo, $descri, $cant_v,$um,$piezas );
            $i++;
        }


        $db->Query("SELECT clave,valor FROM parametros WHERE  (clave LIKE 'factura_margen%' or clave='factura_interval_dup') and usuario = '$usuario' ORDER BY descrip ASC ");
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
                $clave = $valor;
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
        $t->Set("factura_interval_dup",$factura_interval_dup);
        $t->Show("general_header");

        $t->Set("margenes", $margenes);
        $t->Set("usersConfig", $this->getParameters($usuario ));

        $t->Show("start_marco");
        
        //$t->Set('intervalo', $factura_interval_dup.'mm');

        $t->Set('id_nombre', "primer_nombre");  $t->Set('id_doc', "primer_ci");   
        $this->renderizar($t, $master, $limite_items_x_venta,$decimales,$moneda,$tipo_doc_cli,$factura,$nro_remito);
        //$t->Show("intervalo");
         
        $t->Show("end_marco");

        if($cant > $limite_items_x_venta){
            $t->Show("no_imprimir");
        }else{
            $upd = "UPDATE factura_cont SET estado ='Cerrada' WHERE tipo_fact = '$tipo_factura'  AND tipo_doc = '$tipo_doc' AND suc = '$suc' AND fact_nro = $nota_rem_legal";
             
            $db->Query($upd);
        }
    }
    function renderizar($t, $master, $limite_items_x_venta,$decimales,$moneda,$tipo_doc_cli,$factura,$nro_remito) {
                $t->Show("cabecera");
                $t->Show("cabecera_detalle");
                $type = 0;
                $nombre_moneda = 'Guaranies';
                if($moneda != 'G$'){
                  $type = 1;
                  $nombre_moneda = 'Dolares';
                } 

                $contador = 0;
                $TOTAL_CANT = 0;
                $TOTAL_PIEZAS = 0;
                //array($codigo, $descri, $cant_v,$um,$descuento, $precio_venta, $sub_tot);
                foreach ($master as $arr) {
                    $codigo = $arr[0];
                    $descrip = $arr[1];
                    $cant = $arr[2];
                    $um = $arr[3];
                    $piezas = $arr[4];
                    
                    $t->Set('codigo', $codigo);
                    $t->Set('cantidad', $cant);
                    $t->Set('um', $um);
                    $t->Set('descrip', $descrip);
                    $t->Set('piezas', $piezas);
                         
                    $TOTAL_CANT += 0+ $cant;
                    $TOTAL_PIEZAS+= 0+ $piezas;
                    $t->Show("detalle");
                    $contador++;
                }
                
                for ($i = $contador; $i < $limite_items_x_venta; $i++) {
                    $t->Show("detalle_vacio");
                }
                $db = new My();
                $db->Query("SELECT COUNT(DISTINCT paquete) AS paquetes FROM nota_rem_det WHERE n_nro = $nro_remito"); 
                if($db->NextRecord()){
                   $paquetes =  $db->Record['paquetes'];
                   $t->Set('paquetes', $paquetes);
                }
                 
                $t->Set('total_cant', number_format($TOTAL_CANT, 2, ',', '.'));
                $t->Set('total_piezas', number_format($TOTAL_PIEZAS, 0, ',', '.'));
                
                $t->Show("pie_detalle");
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
            function getDistancia($suc,$suc_d){ 
                $distancia = $this->distancias["$suc-$suc_d"];
                
                if( is_null($distancia)){
                    $distancia = $distancias["$suc_d-$suc"];
                }
                if( is_null($distancia)){
                    $distancia = "";
                }
                return $distancia;
            }
    }
 new RemisionLegal();
 
 ?>
