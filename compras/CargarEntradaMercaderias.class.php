<?php

/**
 * Description of CargarEntradaMercaderias
 * @author Ing.Douglas
 * @date 04/05/2016
 */
  

require_once("../Y_DB_MySQL.class.php");
require_once("../Y_Template.class.php");                     
 

class CargarEntradaMercaderias {
 
    function __construct() {
        //$session = $_POST['session'];
        $usuario = $_POST['usuario']; 
        $id_ent = $_POST['id_ent']; 
        $nro_pedido = $_POST['nro_pedido']; 
         
        $t = new Y_Template("EntradaMercaderias.html");
        $ms = new My();
        $ms = new My();
        
        /*
        $ms->Query("SELECT pantone,nombre_color AS COLOR FROM pantone WHERE estado = 'Activo' ORDER BY nombre_color ASC");
        $colores = "";
        //array_map('utf8_encode', $ms->Record);
        while ($ms->NextRecord()) {    
            //$color = utf8_encode( $ms->Record['COLOR']);    
            $color = $ms->Record['COLOR'];    
            $colores.="'$color',";
        }
        $colores = substr($colores, 0, -1);
        $t->Set("colores", "[" . $colores . "]");
        */
         
        
        $monedas = "[";
        
        $ms->Query("SELECT m_cod AS moneda FROM monedas");
        while($ms->NextRecord()){
            $moneda = $ms->Get("moneda");
            $monedas.="'$moneda',";
        }
        $monedas = substr($monedas,0, -1)."]" ;
       
        $t->Set("gmonedas", $monedas);
                
        /*
        // Dise�os
        $ms->Query("SELECT design AS Carpeta,descrip AS Patron FROM designs WHERE  estado = 'Activo' order by design asc");
        $ms->NextRecord();
        $designs = "";
        while ($ms->NextRecord()) {    
            $design = utf8_encode( $ms->Record['Design']);    
            $designs.="'$design',";
        }
        $designs = substr($designs, 0, -1);
        $t->Set("designs", "[" . $designs . "]");
        */
        
        $t->Set("nro_ped", $nro_pedido);
        $t->Show("headers");
        $t->Show("script_entrada_merc");    
        $t->Show("titulo_entrada");
        
        $my = new My();
        
        
        $cab = "SELECT id_ent as ref,suc,invoice,tipo_doc_sap,cod_prov,proveedor,date_format(fecha_fact,'%d-%m-%Y') as fecha_fact,moneda,cotiz,porc_recargo, pais_origen,estado,coment,timbrado from  entrada_merc where id_ent = $id_ent";
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
        $timbrado = $my->Record['timbrado'];
        $porc_recargo = $my->Record['porc_recargo'];
        
        
        
        $t->Set("ref", $ref);
        $t->Set("invoice", $invoice);
        $t->Set("codigo_proveedor", $cod_prov);
        
        //$t->Set("porc_recargo", $porc_recargo);
        
        $t->Set("nombre_proveedor", $proveedor);
        $t->Set("cotiz", $cotiz);
        $t->Set("estado", $estado);
        $t->Set("fecha", $fecha);
        $t->Set("coment", $coment);
        $t->Set("moneda_compra", $moneda); 
        
        $t->Set("timbrado", $timbrado); 
        
        $ms = new My();
        $ms->Query("SELECT ci_ruc as RUC FROM  proveedores  WHERE cod_prov = '$cod_prov'");
        $ms->NextRecord();
        $ruc = $ms->Record['RUC'];
        $t->Set("ruc_proveedor", $ruc);    
            
        $sql = "SELECT suc,nombre FROM sucursales WHERE estado  = 'Activo' AND suc <> '13'  ORDER BY suc ASC";
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
        }else if($tipo_doc_sap == "OIGN"){
            $t->Set("tipo_doc_sap","<option value='OIGN'>Entrada Directa</option>");
        }else{
            $t->Set("tipo_doc_sap","<option value='OPCH'>Factura Proveedor</option>");
        }
                
         
        $ms->Query("select codigo_pais,nombre from paises order by hits + 0 desc, nombre asc");
        $paises = "";
        while ($ms->NextRecord()) {
            $Code = $ms->Record['codigo_pais'];
            $Name = utf8_decode($ms->Record['nombre']);
            $paises .="<option value='$Code'>$Name</option>";
        }
        $t->Set("paises", $paises);
        
        if($estado != "Abierta"){
           $t->Set("disabled",'disabled="disabled"');
        }         
        
        $t->Show("cabecera_entrada_existente");
         
        $t->Show("area_carga_cab");
        $t->Show("detalle"); 
        $t->Show("area_carga_foot");
        //echo $this->getColores();
        //$t->Set("colores", $this->getColores());        
        $t->Set("toolboxColores", $this->getColores());        
        $t->Show("toolbox");
    }
    private function getColores(){
        $link = new My();
        $link->Query("SELECT pantone ,nombre_color   FROM pantone where  estado = 'Activo' ORDER BY nombre_color ASC");
        $colores = array();
        while($link->NextRecord()){
            $Code = $link->Record['pantone'];
            $Name = utf8_encode($link->Record['nombre_color']);
            $colores[$Code] = $Name;
            //$colores .= "<option value='$Code'>$Name</option>";
        }
        $link->Close();
        return json_encode($colores);
    }
}

new CargarEntradaMercaderias();
?>




