<?php

/**
 * Description of ChequesTerceros
 * @author Ing.Douglas
 * @date 21/04/2017
 */

require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php"); 
require_once("../Functions.class.php");

class ChequesTerceros {
    
    function __construct() {
        $action = $_REQUEST['action']; 
         
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }        
    }     
    function main(){
        $t = new Y_Template("ChequesTerceros.html");
        $t->Show("header");

        $desde = $_REQUEST['desde'];
        $hasta = $_REQUEST['hasta'];
        $moneda = $_REQUEST['moneda'];
        $suc = $_REQUEST['suc'];
        $nro_cheque = $_REQUEST['nro_cheque']; // O cliente
        $tipo_cheq = $_REQUEST['tipo'];
        $suc = $_REQUEST['select_suc'];
        $campo_fecha = $_REQUEST['campo_fecha'];
        $usuario = $_REQUEST['user'];
        $include_ger = $_REQUEST['include_ger'];
        $recibido_adm = $_REQUEST['recibido_adm'];
        //if($nro_cheque == ""){$nro_cheque="%";}     
        /*
        if(strlen($nro_cheque) > 2){
            $desde = '01-01-2001';
            $hasta = '31-12-2099';
        }*/

        $hoy = date("d/m/Y");

        $t->Set('time', date("d-m-Y h:i"));
        $t->Set('user', $usuario);
        $t->Set('papar_size', $_REQUEST['papar_size']);
        
        $fn = new Functions();
        $permiso = $fn->chequearPermiso("10.9", $usuario);    
        
        $t->Set('desde', $desde);
        $t->Set('hasta', $hasta);
        $t->Set('suc',$suc);
        
        $fdesde = $fn->invertirFechaLat($desde);
        $fhasta = $fn->invertirFechaLat($hasta);
        $t->Show("head");
        
        $filtro_gerencia = " and recibido_ger != 'Si'";
        if($include_ger== "true"){
            $filtro_gerencia = "";
        }
        if(strlen($nro_cheque) > 2){
            $filtro_gerencia = "";
            $recibido_adm = "%";
        }
       
        $my = new My();
        $sql = "SELECT nro_cheque, nombre AS banco,t.id_banco,cuenta,f_nro AS factura, DATE_FORMAT(fecha_ins,'%d-%m-%Y') AS fecha_ins,DATE_FORMAT(fecha_emis,'%d-%m-%Y') AS fecha_emis,
        DATE_FORMAT(fecha_pago,'%d-%m-%Y') AS fecha_pago,benef,suc,valor,m_cod AS moneda,cotiz,valor_ref,estado,tipo,e_sap,recibido_admin,recibido_ger,entrega
        FROM cheques_ter t, bancos b WHERE t.id_banco = b.id_banco AND suc like '$suc' AND  $campo_fecha BETWEEN '$fdesde' AND '$fhasta' and tipo like '$tipo_cheq' and m_cod like '$moneda' and ( nro_cheque like '%$nro_cheque%' or benef like '%$nro_cheque%' ) and estado != 'Anulado' $filtro_gerencia AND recibido_admin LIKE '$recibido_adm'  order by m_cod asc,fecha_ins,id_banco asc ";
        
        /*No concatenar algunos no tienen Librador solo modificar en la base de datos si es que piden*/
           
        //$sql = "SELECT nro_cheque, nombre AS banco,t.id_banco,cuenta,t.f_nro AS factura, DATE_FORMAT(fecha_ins,'%d-%m-%Y') AS fecha_ins, DATE_FORMAT(fecha_emis,'%d-%m-%Y') AS fecha_emis, DATE_FORMAT(fecha_pago,'%d-%m-%Y') AS fecha_pago,CONCAT(benef,', (',f.cliente,')') as benef,t.suc,valor,m_cod AS moneda,t.cotiz,valor_ref,t.estado,t.tipo,t.e_sap,recibido_admin,recibido_ger,entrega FROM cheques_ter t INNER JOIN bancos b ON t.id_banco = b.id_banco LEFT JOIN factura_venta f ON t.f_nro = f.f_nro and t.f_nro is not null WHERE t.suc like '$suc' AND  $campo_fecha BETWEEN '$fdesde' AND '$fhasta' and t.tipo like '$tipo_cheq' and m_cod like '$moneda' and nro_cheque like '%$nro_cheque%' and t.estado != 'Anulado' $filtro_gerencia AND recibido_admin LIKE '$recibido_adm'  order by m_cod asc,fecha_ins,id_banco asc ";
        
        //echo $sql;
        
        $my->Query($sql);
        
        $TOTAL = 0;
        $TOTAL_REF = 0;
         
        
        while($my->NextRecord()){
            $nro_cheque = $my->Record['nro_cheque'];
            $banco = $my->Record['banco'];
            $id_banco = $my->Record['id_banco'];
            $cuenta = $my->Record['cuenta'];
            $factura = $my->Record['factura'];
            $fecha_ins = $my->Record['fecha_ins'];
            $fecha_emis = $my->Record['fecha_emis'];
            $fecha_pago = $my->Record['fecha_pago']; 
            $benef = $my->Record['benef'];
            $valor = $my->Record['valor'];
            $moneda = $my->Record['moneda'];
            $cotiz = $my->Record['cotiz']; 
            $valor_ref = $my->Record['valor_ref'];
            $suc = $my->Record['suc'];   
            $estado = $my->Record['estado']; 
            $tipo = $my->Record['tipo'];
            $recibido_adm = $my->Record['recibido_admin'];
            $recibido_ger = $my->Record['recibido_ger'];
            $entrega = $my->Record['entrega'];
            
            $TOTAL  += 0 + $valor;
            $TOTAL_REF  += 0 + $valor_ref;
            
                        
            $t->Set("nro",$nro_cheque);
            $t->Set("banco",$banco);
            $t->Set("id_banco",$id_banco);
            $t->Set("factura",$factura);            
            $t->Set("cuenta",$cuenta);
            $t->Set("fecha_ins",$fecha_ins);
            $t->Set("fecha_emis",$fecha_emis);
            $t->Set("fecha_pago",$fecha_pago); 
            $t->Set("valor",number_format($valor,2,',','.')); 
            $t->Set("valor_ref",number_format($valor_ref,2,',','.')); 
            $t->Set("cotiz",$cotiz); 
            $t->Set("moneda",$moneda); 
            $t->Set("benef",$benef); 
            $t->Set("suc",$suc); 
            $t->Set("tipo",$tipo); 
            $t->Set("estado",$estado); 
            
            if($recibido_adm == "Si"){
                $t->Set("chek_adm","checked='checked'"); 
            }else{
                $t->Set("chek_adm",""); 
            }
            if($entrega == "Si"){
                $t->Set("chek_ent","checked='checked'"); 
            }else{
                $t->Set("chek_ent",""); 
            }
            if($recibido_ger == "Si"){
                $t->Set("chek_ger","checked='checked'"); 
                $t->Set("read_adm","disabled='disabled'"); 
                $t->Set("read_ent","disabled='disabled'"); 
            }else{
                $t->Set("chek_ger",""); 
                $t->Set("read_adm",""); 
                $t->Set("read_ent",""); 
            }
            
            if($permiso != "vem"){
               $t->Set("read_adm","disabled='disabled'");  
               $t->Set("read_ent","disabled='disabled'"); 
            } 
            
            $t->Set("read_ger","disabled='disabled'"); 
            $t->Show("data");
        }

        $t->Set("t_monto",number_format($TOTAL ,2,',','.'));
        $t->Set("t_monto_ref",number_format($TOTAL_REF ,2,',','.'));
         
        $t->Show("foot");
             
    }    
}
function recibidoAdmin(){
    $recibido = $_REQUEST['recibido'];
    $id_banco = $_REQUEST['id_banco'];
    $cheque  = $_REQUEST['cheque'];
    $usuario  = $_REQUEST['usuario'];
    set("recibido_admin",$id_banco,$cheque,$usuario,$recibido);
    echo "Ok";
}
function entregar(){
    $recibido = $_REQUEST['recibido'];
    $id_banco = $_REQUEST['id_banco'];
    $cheque  = $_REQUEST['cheque'];
    $usuario  = $_REQUEST['usuario'];
    set("entrega",$id_banco,$cheque,$usuario,$recibido);
    echo "Ok";
}

function recibirGerencia(){
    $recibido = $_REQUEST['recibido'];
    $id_banco = $_REQUEST['id_banco'];
    $cheque  = $_REQUEST['cheque'];
    $usuario  = $_REQUEST['usuario'];
    set("recibido_ger",$id_banco,$cheque,$usuario,$recibido);
    echo "Ok";
}
function desmarcarTodos(){
    $my = new My();
    $sql = "UPDATE cheques_ter SET entrega = 'No'"; 
    $my->Query($sql);       
    $my->Query("INSERT INTO logs(usuario, fecha, hora, accion,tipo,doc_num, DATA) VALUES ('$usuario', current_date, current_time, 'Modificar','Cheques', 'Entrega = No', 'Modificio Campo entrega = No');");    
}
function set($campo,$id_banco,$cheque,$usuario,$recibido){
    $my = new My();
    $sql = "UPDATE cheques_ter SET $campo = '$recibido' WHERE nro_cheque = '$cheque' AND id_banco = '$id_banco'"; 
    //echo $sql;
    $my->Query($sql);       
    $my->Query("INSERT INTO logs(usuario, fecha, hora, accion,tipo,doc_num, DATA) VALUES ('$usuario', current_date, current_time, 'Modificar','Cheque', '$cheque/$id_banco', 'Modificio Campo $campo= $recibido Cheque: $cheque');");
}

function chequesTercerosEntrega(){
        $t = new Y_Template("ChequesTerceros.html");
        $t->Show("header");

        $usuario = $_REQUEST['usuario'];
       
        $moneda = $_REQUEST['moneda'];   
          
        $hoy = date("d/m/Y");

        $t->Set('time', date("d-m-Y h:i"));
        $t->Set('user', $usuario);
        $t->Set('papar_size', $_REQUEST['papar_size']);
        
        $desde = $_REQUEST['desde'];
        $hasta = $_REQUEST['hasta'];
        $tipo_cheq  = $_REQUEST['tipo'];
        
        
        $fn = new Functions();
        $permiso = $fn->chequearPermiso("10.10", $usuario);    
   
        
        $t->Set('desde', $desde);
        $t->Set('hasta', $hasta);
        $t->Set('suc',$suc);
        
        $fdesde = $fn->invertirFechaLat($desde);
        $fhasta = $fn->invertirFechaLat($hasta);
        $t->Show("head_entrega");
         
        //$user = $_REQUEST['user'];
        // Sucursales
        $my = new My();
        $sql = "SELECT nro_cheque, nombre AS banco,t.id_banco,cuenta,f_nro AS factura, DATE_FORMAT(fecha_ins,'%d-%m-%Y') AS fecha_ins,DATE_FORMAT(fecha_emis,'%d-%m-%Y') AS fecha_emis, DATE_FORMAT(fecha_pago,'%d-%m-%Y') AS fecha_pago,benef,suc,SUM(valor) AS valor,m_cod AS moneda,cotiz,SUM(valor_ref) AS valor_ref,estado,tipo,e_sap,recibido_admin,recibido_ger,entrega FROM cheques_ter t, bancos b WHERE t.id_banco = b.id_banco AND entrega = 'Si'  and tipo like '$tipo_cheq' and estado != 'Anulado' GROUP BY nro_cheque order by DATE(fecha_pago) asc,m_cod asc,id_banco asc "; //and recibido_ger != 'Si'
                
        // echo $sql;
        
        $my->Query($sql);
        
        $TOTAL = 0;
        $TOTAL_REF = 0;
         
        
        while($my->NextRecord()){
            $nro_cheque = $my->Record['nro_cheque'];
            $banco = $my->Record['banco'];
            $id_banco = $my->Record['id_banco'];
            $cuenta = $my->Record['cuenta'];
            $factura = $my->Record['factura'];
            $fecha_ins = $my->Record['fecha_ins'];
            $fecha_emis = $my->Record['fecha_emis'];
            $fecha_pago = $my->Record['fecha_pago']; 
            $benef = $my->Record['benef'];
            $valor = $my->Record['valor'];
            $moneda = $my->Record['moneda'];
            $cotiz = $my->Record['cotiz']; 
            $valor_ref = $my->Record['valor_ref'];
            $suc = $my->Record['suc'];   
            $estado = $my->Record['estado']; 
            $tipo = $my->Record['tipo'];
            $recibido_adm = $my->Record['recibido_admin'];
            $recibido_ger = $my->Record['recibido_ger'];
            $entrega = $my->Record['entrega'];
            
            $TOTAL_GUARANIES  += $moneda=='G$'?(float)$valor:0;
            $TOTAL_DOLARES  += $moneda=='U$'?(float)$valor:0;;
            $TOTAL  += 0 + $valor;
            $TOTAL_REF  += 0 + $valor_ref;
            
                        
            $t->Set("nro",$nro_cheque);
            $t->Set("banco",$banco);
            $t->Set("id_banco",$id_banco);
            $t->Set("factura",$factura);            
            $t->Set("cuenta",$cuenta);
            $t->Set("fecha_ins",$fecha_ins);
            $t->Set("fecha_emis",$fecha_emis);
            $t->Set("fecha_pago",$fecha_pago); 
            $t->Set("valor",number_format($valor,2,',','.')); 
            $t->Set("valor_ref",number_format($valor_ref,2,',','.')); 
            $t->Set("cotiz",$cotiz); 
            $t->Set("moneda",$moneda); 
            $t->Set("benef",$benef); 
            $t->Set("suc",$suc); 
            $t->Set("tipo",$tipo); 
            $t->Set("estado",$estado); 
            
            if($permiso != "vem"){
               $t->Set("read_ger","disabled='disabled'");  
            }else{
               $t->Set("read_ger","");    
            } 
            if($recibido_ger == "Si"){
                $t->Set("chek_ger","checked='checked'");  
            }else{
                $t->Set("chek_ger","");  
            }
              
            $t->Show("data_entrega");
        }

        $t->Set("t_monto_gs",number_format($TOTAL_GUARANIES ,2,',','.'));
        $t->Set("t_monto_us",number_format($TOTAL_DOLARES ,2,',','.'));
        $t->Set("t_monto_ref",number_format($TOTAL_REF ,2,',','.'));
         
        $t->Show("foot_entrega");
}
 
function imprimirCheque(){    
    $id_banco = $_REQUEST['id_banco'];
    $cheque  = $_REQUEST['nro_cheque'];
    $usuario  = $_REQUEST['usuario'];  
    $t = new Y_Template("ChequesTerceros.html");
    
    $db = new My();
   // $sql = "SELECT nombre AS Banco,IF(f_nro!=0,CONCAT('FV:',f_nro),CONCAT('PR:',trans_num)) AS Ref,cuenta,DATE_FORMAT(fecha_ins,'%d-%m-%Y') AS fecha_ins,DATE_FORMAT(fecha_emis,'%d-%m-%Y') AS fecha_emis,DATE_FORMAT(fecha_pago,'%d-%m-%Y') AS fecha_pago, benef AS librador,suc, valor,m_cod AS moneda,t.tipo,c.descrip FROM cheques_ter t, bancos b ,conceptos c WHERE t.id_banco = b.id_banco AND  nro_cheque = '$cheque' AND t.id_banco = '$id_banco' AND t.id_concepto = c.id_concepto"; 

    $sql = "SELECT nombre AS Banco,IF(f_nro!=0,CONCAT('FV:',f_nro),CONCAT('PR:',trans_num)) AS Ref,cuenta,DATE_FORMAT(fecha_ins,'%d-%m-%Y') AS fecha_ins,DATE_FORMAT(fecha_emis,'%d-%m-%Y') AS fecha_emis,DATE_FORMAT(fecha_pago,'%d-%m-%Y') AS fecha_pago, benef AS librador,suc, SUM( valor ) AS valor,m_cod AS moneda,t.tipo,c.descrip FROM cheques_ter t, bancos b ,conceptos c WHERE t.id_banco = b.id_banco AND  nro_cheque = '$cheque' AND  t.id_banco = '$id_banco'  and estado != 'Anulado' AND t.id_concepto = c.id_concepto GROUP BY nro_cheque,t.id_banco"; 
    
    $db->Query($sql);
    
    $db->NextRecord();
    $banco = $db->Record['Banco'];
    $Ref = $db->Record['Ref'];
    $cuenta = $db->Record['cuenta'];
    $fecha_ins = $db->Record['fecha_ins'];
    $fecha_emis = $db->Record['fecha_emis'];
    $fecha_pago = $db->Record['fecha_pago'];
    $librador = $db->Record['librador'];
    $suc = $db->Record['suc'];
    $valor = $db->Record['valor'];
    $moneda = $db->Record['moneda'];
    $tipo = $db->Record['tipo'];
    $concepto = $db->Record['descrip'];
    $dec = 0;
    if($moneda != 'G$'){
        $dec = 2;
    }
    
    $t->Set('time', date("d-m-Y h:i"));
    $t->Set('user', $usuario);
    $t->Set("ref",$Ref); 
    $t->Set('concepto', $concepto); 
    $t->Set("banco",$banco);  
    $t->Set("cuenta",$cuenta);  
    $t->Set("nro_cheque",$cheque);  
    $t->Set("librador",$librador);  
    $t->Set("fecha_reg",$fecha_ins);  
    $t->Set("fecha_emis",$fecha_emis);  
    $t->Set("fecha_pago",$fecha_pago);  
    $t->Set("valor",number_format($valor ,$dec,',','.'));
    $t->Set('moneda', $moneda);
    $t->Set('suc', $suc); 
    $t->Set('tipo', $tipo); 
    $t->Show("datos_cheque");
}
new ChequesTerceros();
 
?>
