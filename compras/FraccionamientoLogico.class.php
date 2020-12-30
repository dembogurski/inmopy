<?php

/** 
 * check: Ok
 * Description of FraccionamientoLogico
 * @author Ing.Douglas
 * @date 05/07/2016
 */


require_once("../Y_DB_MySQL.class.php");
require_once("../Y_Template.class.php");

class FraccionamientoLogico {
    function __construct(){
       $estado = $_POST['estado'];
       $accion = $_POST['accion'];  // Puede ser listar = listar o "" Vacio = listar o cargar = Cargar una Compra en especifico.
       $t = new Y_Template("FraccionamientoLogico.html");
       //$estado = 'Cerrada';
        
        $db = new My(); 
        
        $db->Query("SELECT suc  FROM sucursales");
        $sucs = "";
        while($db->NextRecord()){
           $s =  $db->Record['suc'];
           $sucs.="'$s',"; 
        }
        $sucs = substr($sucs,0,-1);
         
        $t->Set("sucs","[".$sucs."]");  
        
        $t->Set("checked_Abierta", "");
        $t->Set("checked_Cerrada", "");
        if (isset($_REQUEST['estado'])) {
            $estado = $_REQUEST['estado'];
            $t->Set("checked_$estado", "checked='checked'");
        } else {
            $estado = 'En_Transito';
            $t->Set("checked_Abierta", "checked='checked'");
        }
        
        $t->Show("headers");
        
        if($accion == "" || $accion == "Listar"){
        
            $t->Show("head");               
               
            $sql = "select id_ent,suc,usuario,cod_prov,proveedor,DATE_FORMAT(fecha,'%d-%m-%Y') as fecha,moneda,invoice,folio_num,origen,pais_origen,sap_doc,estado from entrada_merc where estado <> 'Abierta' order by id_ent desc limit 50 ";

            $db->Query($sql);
            while($db->NextRecord()){
                $id = $db->Record['id_ent'];
                $suc = $db->Record['suc'];
                $usuario = $db->Record['usuario'];
                $cod_prov = $db->Record['cod_prov'];
                $proveedor = $db->Record['proveedor'];
                $fecha = $db->Record['fecha'];
                $moneda = $db->Record['moneda'];            
                $invoice = $db->Record['invoice'];
                $folio_num = $db->Record['folio_num'];
                $origen = $db->Record['origen'];
                $pais_origen = $db->Record['pais_origen'];
                $estado = $db->Record['estado']; 
                $sap_doc = $db->Record['sap_doc'];

                $t->Set("id",$id);
                $t->Set("invoice", $invoice);    
                $t->Set("suc",$suc);
                $t->Set("usuario",$usuario);
                $t->Set("cod_prov",$cod_prov); 
                $t->Set("proveedor",$proveedor);
                $t->Set("fecha",$fecha);
                $t->Set("moneda",$moneda);  
                $t->Set("origen",$origen);  
                $t->Set("pais_origen",$pais_origen);
                $t->Set("estado",  $estado);
                $t->Set("sap_doc",  $sap_doc);
                $t->Show("line");
            } 
            $t->Show("foot"); 
    
        }else{
        $usuario = $_POST['usuario']; 
        $id_ent = $_POST['id_ent']; 
         
          
        $t->Show("headers");
        
        
        $my = new My();
        
        
        $cab = "select id_ent as ref,suc,invoice,tipo_doc_sap,cod_prov,proveedor,date_format(fecha_fact,'%d-%m-%Y') as fecha_fact,moneda,cotiz,pais_origen,estado,coment from  entrada_merc where id_ent = $id_ent";
        $my->Query($cab);
        $my->NextRecord();
        $ref = $my->Record['ref'];
        $suc = $my->Record['suc'];
        $invoice = $my->Record['invoice'];
        $tipo_doc_sap = $my->Record['tipo_doc_sap'];
        $cod_prov = $my->Record['cod_prov'];
        $proveedor = $my->Record['proveedor'];
        $fecha = $my->Record['fecha_fact'];
        $moneda = $my->Record['moneda'];
        $cotiz = $my->Record['cotiz'];
        $pais_origen = $my->Record['pais_origen'];
        $estado = $my->Record['estado'];
        $coment = $my->Record['coment'];
        
        $t->Set("ref", $ref);
        $t->Set("invoice", $invoice);
        $t->Set("codigo_proveedor", $cod_prov);
        
        $t->Set("nombre_proveedor", $proveedor);
        $t->Set("cotiz", $cotiz);
        $t->Set("estado", $estado);
        $t->Set("fecha", $fecha);
        $t->Set("coment", $coment);
        
         
        $ms = new My();
        $ms->Query("SELECT ci_ruc  FROM  proveedores  WHERE cod_prov = '$cod_prov'");
        $ms->NextRecord();
        $ruc = $ms->Record['ci_ruc'];
        $t->Set("ruc_proveedor", $ruc);    
            
        $sql = "SELECT suc,nombre FROM sucursales WHERE tipo = 'Deposito' and suc = '$suc' order by suc asc";
        $my->Query($sql);
        $sucs = "";
        while ($my->NextRecord()) {
            $suc = $my->Record['suc'];
            $nombre = $my->Record['nombre'];
            $sucs.="<option value=" . $suc . ">" . $nombre . "</option>";
        }
        $t->Set("sucursales", $sucs);
        
        // Buscar Lista de Monedas
        $my->Query("SELECT m_cod AS moneda, m_descri FROM monedas WHERE m_cod = '$moneda'");
 
        while ($my->NextRecord()) {
            $moneda = $my->Record['moneda'];
            $m_descri = $my->Record['m_descri'];
            $monedas .="<option value='$moneda'>$m_descri</option>";
        }
        $t->Set("monedas", $monedas);
        
        if($tipo_doc_sap == "OPDN"){
            $t->Set("tipo_doc_sap","<option value='OPDN'>Entrada Directa</option>");
        }else{
            $t->Set("tipo_doc_sap","<option value='OPCH'>Factura Proveedor</option>");
        }
        
         
        $ms->Query("SELECT codigo_pais, nombre FROM  paises WHERE codigo_pais = '$pais_origen'  ORDER BY hits  DESC, nombre ASC");
        $paises = "";
        while ($ms->NextRecord()) {
            $Code = $ms->Record['codigo_pais'];
            $Name = utf8_decode($ms->Record['nombre']);
            $paises .="<option value='$Code'>$Name</option>";
        }
        $t->Set("paises", $paises);
        $sap_doc = $_REQUEST['sap_doc'];
        $t->Set("sap_doc", $sap_doc); 
        
        $t->Show("cabecera_entrada_existente"); 
        $t->Show("detalle"); 
        $t->Show("area_carga_foot");        
        }  
    
    }   
  }   

new FraccionamientoLogico();

?>