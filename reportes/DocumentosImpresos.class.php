<?php
require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");
require_once '../utils/Excel.class.php';


class DocumentosImpresos {
    private $desde;
    private $hasta;
    private $template;
    private $data;
    private $toExcelFile;
    private $excel;
    
    function __construct() {       
        //ini_set('memory_limit', '2048M');
        $desde_r = $_GET['desde'];
        $hasta_r = $_GET['hasta'];       

        $this->desde = $this->flipDate($desde_r,'/');
        $this->hasta = $this->flipDate($hasta_r,'/');       
        $this->template = new Y_Template("DocumentosImpresos.class.html");
        $this->toExcelFile = array();
         
        $filename = 'startsoft/StarSoft_'.str_replace('/','-',$desde_r).'_'.str_replace('/','-',$hasta_r).'.xlsx';

        $this->template->Show("head");
         
        $this->facturaContado();
        $this->facturaCredito();
        $this->notasCredito();
        
        
        $this->template->Set("desde",$desde_r);
        $this->template->Set("hasta",$hasta_r);
        
        if(count($this->toExcelFile)>0){
            $headers  = array("ven_tipimp","ven_gra05","ven_iva05","ven_disg05","cta_iva05","ven_rubgra","ven_rubg05","ven_disexe","ven_numero","ven_imputa","ven_sucurs","generar","form_pag","ven_centro","ven_provee","ven_cuenta","ven_prvnom","ven_tipofa","ven_fecha","ven_totfac","ven_exenta","ven_gravad","ven_iva","ven_retenc","ven_aux","ven_ctrl","ven_con","ven_cuota","ven_fecven","cant_dias","origen","cambio","valor","moneda","exen_dolar","concepto","cta_iva","cta_caja","tkdesde","tkhasta","caja","ven_disgra","forma_devo","ven_cuense","anular","reproceso","cuenta_exe","usu_ide","rucvennrotim");
            ini_set('memory_limit', '2048M');
             
            $excel = new Excel();
            $excel->createExcel($this->toExcelFile, $headers  , $filename);

             
            $this->template->Set("archivo",$filename);
            $this->template->Set("descarga","$filename");
            $this->template->Show("link");
        }
        
        
        $this->template->Show("footer"); 
    }
    private function facturaContado(){
        $link = new My();
        $body = "SELECT 'I' AS ven_tipimp, '0' AS ven_gra05,'0' AS ven_iva05,'' AS ven_disg05,'' AS cta_iva05,'1' AS ven_rubgra,'0' AS ven_rubg05,'G' AS ven_disexe, CONCAT(c.establecimiento,'-',f.pdv_cod,'-', RIGHT(CONCAT('0000000',c.fact_nro),7)) AS ven_numero,'' AS ven_imputa,f.suc AS ven_sucurs,'0' AS generar, 'Contado' AS form_pag,'' AS ven_centro,f.ruc_cli AS ven_provee,'41111' AS ven_cuenta,UPPER(f.cliente) AS ven_prvnom,f.tipo_doc AS	ven_tipofa,DATE_FORMAT(f.fecha_cierre,'%d/%m/%Y') AS ven_fecha,ROUND(f.total+0.000001) AS ven_totfac, if(f.tipo_doc_cli = 'C.I. Diplomatica',ROUND(f.total+0.000001),'0') AS ven_exenta, if(f.tipo_doc_cli = 'C.I. Diplomatica','0',ROUND(ROUND(f.total+0.000001) / 1.1)) AS ven_gravad, if(f.tipo_doc_cli = 'C.I. Diplomatica','0',ROUND(ROUND(f.total+0.000001) / 11)) AS ven_iva, '0' AS ven_retenc,'0' AS ven_aux,'0' AS ven_ctrl,'Venta de Mercaderias' AS ven_con,'0' AS ven_cuota,'00/01/1900' AS ven_fecven,'0' AS cant_dias, 'LI' AS origen,'0' AS cambio,'0' AS valor,'' AS  moneda,'0' AS exen_dolar,'Venta de Mercaderias' AS concepto,'' AS cta_iva,'' AS cta_caja,'0' AS tkdesde,'0' AS tkhasta,'0' AS caja,'A' AS ven_disgra,'1' AS forma_devo,'' AS ven_cuense,'0' AS anular,'' AS reproceso,'' AS cuenta_exe,'0' AS usu_ide,c.timbrado as rucvennrotim ";
        $contado = "FROM factura_venta f INNER JOIN factura_cont c on f.fact_nro=c.fact_nro and f.tipo_fact=c.tipo_fact and f.tipo_doc=c.tipo_doc inner join sucursales s on f.suc = s.suc left join cheques_ter t using(f_nro) left join cuotas ct using(f_nro) WHERE f.suc=c.suc and  t.f_nro is null and ct.f_nro is null and f.fecha_cierre BETWEEN '$this->desde' AND '$this->hasta'  AND c.fecha_venc >= f.fecha_cierre AND f.estado = 'Cerrada' and c.estado='Cerrada' group by c.fact_nro,f.f_nro";
        $cheque_dia = "FROM factura_venta f INNER JOIN cheques_ter t using(f_nro)  INNER JOIN factura_cont c on f.fact_nro=c.fact_nro and f.tipo_fact=c.tipo_fact and f.tipo_doc=c.tipo_doc inner join sucursales s on f.suc = s.suc WHERE f.suc=c.suc and t.fecha_ins=t.fecha_pago AND f.fecha_cierre = t.fecha_ins and  f.fecha_cierre BETWEEN '$this->desde' AND '$this->hasta' AND c.fecha_venc >= f.fecha_cierre AND f.estado = 'Cerrada' and c.estado='Cerrada'";
        $link->Query($body.$contado." union ".$body.$cheque_dia."GROUP BY f.f_nro  ORDER BY ven_sucurs");
       
        
        
        //echo "En este momento se estan aplicando mejoras a este reporte.<br><br><br>";
        
         //echo $body.$contado." union ".$body.$cheque_dia."GROUP BY f.f_nro  ORDER BY ven_sucurs";
        //die();
        
        while($link->NextRecord()){
            array_push($this->toExcelFile,$link->Record);              
        }

        $link->Close();
    }


    private function facturaCredito(){
        $link = new My();
        $cuotas = "SELECT 'I' AS ven_tipimp, '0' AS ven_gra05,'0' AS ven_iva05,'' AS ven_disg05,'' AS cta_iva05,'1' AS ven_rubgra,'0' AS ven_rubg05,'G' AS ven_disexe, CONCAT(c.establecimiento,'-',f.pdv_cod,'-', RIGHT(CONCAT('0000000',c.fact_nro),7)) AS ven_numero,'' AS ven_imputa,f.suc AS ven_sucurs,'0' AS generar, 'Credito' AS form_pag,'' AS ven_centro,f.ruc_cli AS ven_provee,'41111' AS ven_cuenta,UPPER(f.cliente) AS ven_prvnom,f.tipo_doc AS	ven_tipofa,DATE_FORMAT(f.fecha_cierre,'%d/%m/%Y') AS ven_fecha,ROUND(f.total+0.000001) AS ven_totfac, if(f.tipo_doc_cli = 'C.I. Diplomatica',ROUND(f.total+0.000001),'0') AS ven_exenta, if(f.tipo_doc_cli = 'C.I. Diplomatica','0',ROUND(ROUND(f.total+0.000001) / 1.1)) AS ven_gravad, if(f.tipo_doc_cli = 'C.I. Diplomatica','0',ROUND(ROUND(f.total+0.000001) / 11)) AS ven_iva, '0' AS ven_retenc,'0' AS ven_aux,'0' AS ven_ctrl,'Venta de Mercaderias' AS ven_con,'0' AS ven_cuota,DATE_FORMAT(DATE_ADD(f.fecha_cierre, INTERVAL 30 DAY), '%d/%m/%Y') AS ven_fecven,'30' AS cant_dias, 'LI' AS origen,'0' AS cambio,'0' AS valor,'' AS  moneda,'0' AS exen_dolar,concat('Vta.Merc. a ',UPPER(f.cliente)) AS concepto,'' AS cta_iva,'' AS cta_caja,'0' AS tkdesde,'0' AS tkhasta,'0' AS caja,'A' AS ven_disgra,'1' AS forma_devo,'' AS ven_cuense,'0' AS anular,'' AS reproceso,'' AS cuenta_exe,'0' AS usu_ide,c.timbrado as rucvennrotim FROM factura_venta f INNER JOIN factura_cont c on f.fact_nro=c.fact_nro and f.tipo_fact=c.tipo_fact and f.tipo_doc=c.tipo_doc inner join sucursales s on f.suc = s.suc inner join cuotas ct on f.f_nro=ct.f_nro WHERE f.suc=c.suc and f.fecha_cierre BETWEEN '$this->desde' AND '$this->hasta' AND c.fecha_venc >= f.fecha_cierre and c.id_pago is null  AND f.estado = 'Cerrada' and c.estado='Cerrada' group by c.fact_nro,f.f_nro";
        
        $chq_diferidos ="SELECT 'I' AS ven_tipimp, '0' AS ven_gra05,'0' AS ven_iva05,'' AS ven_disg05,'' AS cta_iva05,'1' AS ven_rubgra,'0' AS ven_rubg05,'G' AS ven_disexe, CONCAT(c.establecimiento,'-',f.pdv_cod,'-', RIGHT(CONCAT('0000000',c.fact_nro),7)) AS ven_numero,'' AS ven_imputa,f.suc AS ven_sucurs,'0' AS generar, 'Credito' AS form_pag,'' AS ven_centro,f.ruc_cli AS ven_provee,'41111' AS ven_cuenta,UPPER(f.cliente) AS ven_prvnom,f.tipo_doc AS	ven_tipofa,DATE_FORMAT(f.fecha_cierre,'%d/%m/%Y') AS ven_fecha,ROUND(f.total+0.000001) AS ven_totfac, if(f.tipo_doc_cli = 'C.I. Diplomatica',ROUND(f.total+0.000001),'0') AS ven_exenta, if(f.tipo_doc_cli = 'C.I. Diplomatica','0',ROUND(ROUND(f.total+0.000001) / 1.1)) AS ven_gravad, if(f.tipo_doc_cli = 'C.I. Diplomatica','0',ROUND(ROUND(f.total+0.000001) / 11)) AS ven_iva, '0' AS ven_retenc,'0' AS ven_aux,'0' AS ven_ctrl,'Venta de Mercaderias' AS ven_con,'0' AS ven_cuota,/*DATE_FORMAT(t.fecha_pago,'%d/%m/%Y') '18/08/2017'*/DATE_FORMAT(DATE_ADD(f.fecha_cierre, INTERVAL 30 DAY),'%d/%m/%Y')  AS ven_fecven,'30' AS cant_dias, 'LI' AS origen,'0' AS cambio,'0' AS valor,'' AS  moneda,'0' AS exen_dolar,concat('Vta.Merc. a ',UPPER(f.cliente)) AS concepto,'' AS cta_iva,'' AS cta_caja,'0' AS tkdesde,'0' AS tkhasta,'0' AS caja,'A' AS ven_disgra,'1' AS forma_devo,'' AS ven_cuense,'0' AS anular,'' AS reproceso,'' AS cuenta_exe,'0' AS usu_ide,c.timbrado as rucvennrotim FROM factura_venta f INNER JOIN cheques_ter t using(f_nro)  INNER JOIN factura_cont c on f.fact_nro=c.fact_nro and f.tipo_fact=c.tipo_fact and f.tipo_doc=c.tipo_doc inner join sucursales s on f.suc = s.suc WHERE f.suc=c.suc and t.fecha_ins<t.fecha_pago AND f.fecha_cierre = t.fecha_ins and  f.fecha_cierre BETWEEN '$this->desde' AND '$this->hasta' AND c.fecha_venc >= f.fecha_cierre AND f.estado = 'Cerrada' and c.estado='Cerrada' and c.id_pago is null GROUP BY f.f_nro";

        $intereces_cobrados = "SELECT 'I' AS ven_tipimp, '0' AS ven_gra05,'0' AS ven_iva05,'' AS ven_disg05,'' AS cta_iva05,'1' AS ven_rubgra,'0' AS ven_rubg05,'G' AS ven_disexe, CONCAT(c.establecimiento,'-',f.pdv_cod,'-', RIGHT(CONCAT('0000000',c.fact_nro),7)) AS ven_numero,'' AS ven_imputa,f.suc AS ven_sucurs,'0' AS generar, 'Credito' AS form_pag,'' AS ven_centro,f.ruc_cli AS ven_provee,'41111' AS ven_cuenta,UPPER(f.cliente) AS ven_prvnom,f.tipo_doc AS	ven_tipofa,DATE_FORMAT(f.fecha_cierre,'%d/%m/%Y') AS ven_fecha,ROUND((sum(pd.interes))+0.000001) AS ven_totfac, if(f.tipo_doc_cli = 'C.I. Diplomatica',ROUND((sum(pd.interes))+0.000001),'0') AS ven_exenta, if(f.tipo_doc_cli = 'C.I. Diplomatica','0',ROUND(ROUND((sum(pd.interes))+0.000001) / 1.1)) AS ven_gravad, if(f.tipo_doc_cli = 'C.I. Diplomatica','0',ROUND(ROUND((sum(pd.interes))+0.000001) / 11)) AS ven_iva, '0' AS ven_retenc,'0' AS ven_aux,'0' AS ven_ctrl,'Venta de Mercaderias' AS ven_con,'0' AS ven_cuota,'00/01/1900' AS ven_fecven,'0' AS cant_dias, 'LI' AS origen,'0' AS cambio,'0' AS valor,'' AS  moneda,'0' AS exen_dolar,'Venta de Mercaderias' AS concepto,'' AS cta_iva,'' AS cta_caja,'0' AS tkdesde,'0' AS tkhasta,'0' AS caja,'A' AS ven_disgra,'1' AS forma_devo,'' AS ven_cuense,'0' AS anular,'' AS reproceso,'' AS cuenta_exe,'0' AS usu_ide,c.timbrado as rucvennrotim FROM factura_venta f inner join factura_cont c on f.fact_nro=c.fact_nro and f.tipo_fact=c.tipo_fact and f.tipo_doc=c.tipo_doc inner join pagos_recibidos p on c.id_pago=p.id_pago inner join pago_rec_det pd on pd.id_pago=p.id_pago inner join sucursales s on f.suc = s.suc WHERE f.suc=c.suc and c.id_pago is not null and p.fecha BETWEEN '$this->desde' AND '$this->hasta' and p.estado = 'Cerrado' and c.estado='Cerrada' GROUP BY f.f_nro";


        $link->Query($cuotas." union ".$chq_diferidos." union ". $intereces_cobrados." ORDER BY ven_sucurs");
       
        while($link->NextRecord()){ 
            array_push($this->toExcelFile,$link->Record);  
        }

        $link->Close();
    }

    private function notasCredito(){
        $link = new My();
        $n_credito = "SELECT 'I' AS ven_tipimp, '0' AS ven_gra05,'0' AS ven_iva05,'' AS ven_disg05,'' AS cta_iva05,'1' AS ven_rubgra,'0' AS ven_rubg05,'G' AS ven_disexe, CONCAT(c.establecimiento,'-',f.pdv_cod,'-', RIGHT(CONCAT('0000000',c.fact_nro),7)) AS ven_numero,'' AS ven_imputa,f.suc AS ven_sucurs,'0' AS generar, 'Credito' AS form_pag,'' AS ven_centro,f.ruc_cli AS ven_provee,'41111' AS ven_cuenta,UPPER(f.cliente) AS ven_prvnom,f.tipo_doc AS	ven_tipofa,DATE_FORMAT(f.fecha_cierre,'%d/%m/%Y') AS ven_fecha,ROUND((sum(n.total))+0.000001)*-1 AS ven_totfac, if(f.tipo_doc_cli = 'C.I. Diplomatica',ROUND((sum(n.total))+0.000001)*-1,'0') AS ven_exenta, if(f.tipo_doc_cli = 'C.I. Diplomatica','0',ROUND(ROUND((sum(n.total))+0.000001) / 1.1)*-1) AS ven_gravad, 
		  if(f.tipo_doc_cli = 'C.I. Diplomatica','0',ROUND(ROUND((sum(n.total))+0.000001) / 11)*-1) AS ven_iva, '0' AS ven_retenc,'0' AS ven_aux,'0' AS ven_ctrl,'Nota de Credito' AS ven_con,'0' AS ven_cuota,'00/01/1900' AS ven_fecven,'0' AS cant_dias, 'LI' AS origen,'0' AS cambio,'0' AS valor,'' AS  moneda,'0' AS exen_dolar,'Nota de Credito' AS concepto,'' AS cta_iva,'' AS cta_caja,'0' AS tkdesde,'0' AS tkhasta,'0' AS caja,'A' AS ven_disgra,'1' AS forma_devo,'' AS ven_cuense,'0' AS anular,'' AS reproceso,'' AS cuenta_exe,'0' AS usu_ide,c.timbrado as rucvennrotim FROM nota_credito n inner join factura_venta f using(f_nro) inner join factura_cont c  on n.fact_nro=c.fact_nro and n.tipo_fact=c.tipo_fact and n.tipo_doc=c.tipo_doc and c.suc=n.suc inner join sucursales s on f.suc = s.suc WHERE c.tipo_doc='Nota de Credito' and n.estado='Cerrada' and c.estado='Cerrada' and f.estado='Cerrada' and n.fecha BETWEEN '$this->desde' AND '$this->hasta' GROUP BY f.f_nro  ORDER BY ven_sucurs";


        $link->Query($n_credito);
       
        while($link->NextRecord()){ 
            array_push($this->toExcelFile,$link->Record); 
        }

        $link->Close();
    }


    private function flipDate($date,$separator){
        $date = explode($separator,$date);
        return $date[2].$separator.$date[1].$separator.$date[0];
    }
    
}

new DocumentosImpresos();
?>