<?php

/**
 * Description of ImpresorReciboTermico
 * @author Ing.Douglas
 * @date 06/06/2018
 */
require_once '../Y_DB_MySQL.class.php';
require_once("../Y_Template.class.php");
require_once("../Functions.class.php");

class ImpresorReciboTermico {
    
    public $total_valores = 0;
    
    function __construct() {
        $db = new My();

        $db->Query("SET lc_time_names = 'es_PY';");

        $nro_cobro = $_REQUEST['nro_cobro'];
        $tipo = $_REQUEST['tipo'];
        
        $t = new Y_Template("ImpresorReciboTermico.html");
        
        
        $t->Show("header");
        $db->Query("select id_pago as Nro,suc, date_format(fecha,'%d-%m-%Y') as Fecha,DATE_FORMAT( CURRENT_TIME,'%H:%i') AS hora,cod_cli,ruc_cli,cliente,usuario from pagos_recibidos where id_pago = $nro_cobro;");

        $db->NextRecord();
        $Nro = $db->Record['Nro'];
        $suc = $db->Record['suc'];
        $Fecha = $db->Record['Fecha'];
        $Hora = $db->Record['hora'];
        $cod_cli = $db->Record['cod_cli'];
        $ruc_cli = $db->Record['ruc_cli'];
        $cliente = $db->Record['cliente'];
        $usuario = $db->Record['usuario'];
        $t->Set("nro", $Nro);
        $t->Set("suc", $suc);
        $t->Set("fecha", $Fecha);
        $t->Set("hora", $Hora);
        $t->Set("cod_cli", $cod_cli);
        $t->Set("ruc", $ruc_cli);
        $t->Set("cliente", $cliente);
        
        $r = "SELECT CONCAT(estab_cont,'-',p.pdv_cod,'-', LPAD( f.fact_nro,7,'0')) AS nro_recibo,f.fact_nro as rec_only FROM pdvs p, factura_cont f, sucursales s WHERE   p.suc = '$suc' AND p.suc = f.suc  AND p.suc = s.suc  AND  p.tipo = 'Termico' AND f.moneda = 'G$'    AND f.tipo_fact = p.tipo AND tipo_doc = 'Recibo Termico' AND f.estado = 'Disponible' ORDER BY f.fact_nro + 0 LIMIT 1";
        $db->Query( $r );            
        
        if($db->NumRows()>0){
            $db->NextRecord();
            $nro_rec = $db->Record['nro_recibo'];
            $rec_only = $db->Record['rec_only'];
            $t->Set("nro_rec", $nro_rec);
            $db->Query("UPDATE factura_cont SET estado = 'Cerrada', id_pago = $Nro,tipo = 'Contado' WHERE fact_nro = $rec_only  AND tipo_doc = 'Recibo Termico' AND tipo_fact ='Termico' AND  estado = 'Disponible' AND  moneda = 'G$' ");      
        }else{
            echo "Debe precargar recibos termicos para esta sucursal '$suc'";
            die();
        }
          
        $db->Query("SELECT CONCAT(nombre,' ',apellido) as nombre FROM usuarios WHERE usuario = '$usuario'");
        $db->NextRecord();
        $nombre = $db->Record['nombre'];
        $t->Set("cobrador", $nombre);

       
        $t->Show("rec_head"); 
        $this->getCash($t,$db,$nro_cobro);
        $this->getChecks($t,$db, $nro_cobro);
        $this->getTarjetasRetenciones($t,$db, $nro_cobro);
        $this->getInvoiceDetails($t,$db,$nro_cobro); 
        
        $t->Set("valores", number_format($this->total_valores , 0, ',', '.'));  
        
        
        
        $f = new Functions();
        $valores_en_letras = $f->extense($this->total_valores, "Guaranies");
        $t->Set("valores_en_letras",  $valores_en_letras  );  
        $t->Show("total_valores_recibidos");
        
        
        $t->Set("original_duplicado", "Original");         
        $t->Show("rec_foot");
        
         
    }
    function fill($len){
        $sp = "";
        for($i = 0; $i <$len; $i++){
            $sp.="_";//&nbsp;
        }
        return $sp;
    }    
    function calcFirstPos($string) { 
        return 12 - strlen($string);         
    }
    function calcScondPos($firstStr,$secondStr,$lastStr) { 
        $lastlength = strlen(number_format($lastStr, 0, ',', '.'));
        $calc = strlen($firstStr) + $this->calcFirstPos($firstStr) + strlen($secondStr) + $lastlength; 
        //echo 54 - $calc."<br>";
        return 46 - $calc;         
    }
    function getCash($t,$db,$nro_cobro){
        $db->Query("select sum(entrada_ref) as efectivo  from efectivo where trans_num = $nro_cobro;");
        $db->NextRecord();
        $efectivo = $db->Record['efectivo'];
        if ($efectivo != null) {            
            $t->Set("efectivo", number_format($efectivo, 0, ',', '.'));
            $f = new Functions();
            $efectivo_en_letras = $f->extense($efectivo, "Guaranies");
            $t->Set("efectivo_en_letras", $efectivo_en_letras);
            $t->Show("rec_efectivo");
            $this->total_valores += 0 + $efectivo;
        }        
    }
    
    function getChecks($t,$db,$nro_cobro){
        $db->Query("select nro_cheque,b.nombre as banco, valor from cheques_ter t, bancos b where t.id_banco = b.id_banco and trans_num = $nro_cobro;");
        $fill = "";
        if ($db->NumRows() > 0) {
            $t->Show("cab_cheques");
            $total_cheques = 0;
            while ($db->NextRecord()) {
                $nro_cheque = $db->Record['nro_cheque'];
                $banco = $db->Record['banco'];
                $valor = $db->Record['valor'];
                $total_cheques +=0+$valor;
                $sp0 = $this->fill( $this->calcFirstPos($nro_cheque));
                
                $t->Set("nro_cheque", $nro_cheque);
                $t->Set("sp0", $sp0);
                $t->Set("banco", $banco);
                 
                $sp1 = $this->fill($this->calcScondPos($nro_cheque,$banco,$valor));
                $t->Set("sp1", $sp1);
                $t->Set("valor", $fill."".number_format($valor , 0, ',', '.'));

                $t->Show("det_cheques");
                $t->Set("total_cheques", number_format($total_cheques , 0, ',', '.'));  
                
            }
            $this->total_valores += 0 + $total_cheques;
            $l_chq = 48 - ((strlen( number_format($total_cheques , 0, ',', '.'))) + 14);
           
            $sp_chq = $this->fill($l_chq);
             
            $t->Set("sp_cheques",$sp_chq);
            
            $t->Show("pie_cheques");
        }        
    }
    
    function getTarjetasRetenciones($t,$db,$nro_cobro){
        $db->Query("SELECT nombre,monto as valor  FROM convenios WHERE trans_num  = $nro_cobro;");
        $fill = "";
        if ($db->NumRows() > 0) {
            $t->Show("cab_tarjetas");
            $total_tarjetas = 0;
            while ($db->NextRecord()) {
                $nombre = $db->Record['nombre'];
                 
                $valor = $db->Record['valor'];
                $total_tarjetas +=0+$valor;
                $sp0 = $this->fill( $this->calcFirstPos($nombre));
                
                $t->Set("nombre_tarjeta", $nombre);
                $t->Set("sp0", $sp0);
                 
                 
                $sp1 = $this->fill($this->calcScondPos($nombre,"",$valor));
                $t->Set("sp1", $sp1);
                $t->Set("valor", $fill."".number_format($valor , 0, ',', '.'));

                $t->Show("det_tarjetas");
                $t->Set("total_tarjetas", number_format($total_tarjetas , 0, ',', '.'));  
            }
            $this->total_valores += 0 + $total_tarjetas;
            $l_tar = 48 - ((strlen( number_format($total_tarjetas , 0, ',', '.'))) + 14);
           
            $sp_tar = $this->fill($l_tar);
             
            $t->Set("sp_tarjetas",$sp_tar);
            
            $t->Show("pie_tarjetas");
        }                
    }
    
    function getInvoiceDetails($t,$db,$nro_cobro){
        $db->Query("select sap_doc as Ref,folio_num as Factura,id_cuota as Cuota, date_format(fecha_fac,'%d-%m-%Y') as FechaFac, valor, entrega_actual from pago_rec_det where id_pago = $nro_cobro;");

        $t->Show("cab_detalle_facturas");
        $total_facturas = 0;
        while ($db->NextRecord()) {
            $Ref = $db->Record['Ref'];
            $Factura = $db->Record['Factura'];
            $Cuota = $db->Record['Cuota'];
            $FechaFac = $db->Record['FechaFac'];
            $entrega_actual = $db->Record['entrega_actual'];
            $total_facturas += $entrega_actual;
            
            $sp0 = $this->fill( $this->calcFirstPos($Factura . "/" . $Cuota));
            $t->Set("ref", $Factura . "/" . $Cuota);            
            $t->Set("sp0", $sp0);
            $t->Set("FechaFac", $FechaFac);
            $sp1 = $this->fill($this->calcScondPos($Factura . "/" . $Cuota,$FechaFac,$entrega_actual));
            $t->Set("sp1", $sp1);
                
            $t->Set("entrega", number_format($entrega_actual, 0, ',', '.'));

            $t->Show("detalle_facturas");
            $t->Set("total_facturas", number_format($total_facturas , 0, ',', '.'));  
        }
        $l_fac = 48 - ((strlen( number_format($total_facturas , 0, ',', '.'))) + 16);
           
        $sp_fac = $this->fill($l_fac);             
        $t->Set("sp_facturas",$sp_fac);  
        $t->Show("pie_detalle_facturas"); 
        
         
    }
}



new ImpresorReciboTermico();
?>
