<?php

/**
 * Description of Efectivo
 * @author Ing.Douglas
 * @date 16/06/2015
 */
require_once("../../Y_Template.class.php");
require_once("../../Y_DB_MySQL.class.php"); 
require_once("../../Functions.class.php");

class Efectivo {

    function __construct() {
		
        $action = trim($_REQUEST['action']);
        
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }  
     function main() {
        $verificables = array(10,11,13,14,15);  // Los ids de conceptos Verificables para generar Asientos Contables
        date_default_timezone_set('America/Asuncion');
        $t = new Y_Template("Efectivo.html");
        $t->Show("header");

        $desde = $_REQUEST['desde'];
        $hasta = $_REQUEST['hasta'];
        $moneda = $_REQUEST['moneda'];
        $suc = $_REQUEST['suc'];
        $usuario = $_REQUEST['usuario'];
        $hoy = date("d/m/Y");

        $t->Set('time', date("m-d-Y h:i"));
        $t->Set('user', $usuario);
        $t->Set('papar_size', $_REQUEST['papar_size']);
        
        $fn = new Functions();
        $t->Set('desde', $fn->invertirFecha($desde));
        $t->Set('hasta', $fn->invertirFecha($hasta));
        $t->Set('suc',$suc);
                        
        $puede_verificar = $this->verificarPermiso($usuario,'3.8.3');
	
        
         
        $t->Show("head");
				
        //$user = $_REQUEST['user'];
        // Sucursales
        $my = new My();
        /*
        $sql = "SELECT descrip,f_nro AS Factura,nro_reserva AS Reserva,DATE_FORMAT(fecha,'%d-%m-%Y') AS Fecha,hora,m_cod AS Moneda,entrada,salida,cotiz,entrada_ref,salida_ref,estado 
        FROM efectivo e, conceptos c WHERE c.id_concepto = e.id_concepto AND suc = '$suc' AND m_cod like '$moneda' AND fecha BETWEEN '$desde' AND '$hasta'";*/
        
        $sql = "SELECT e.id_pago as id,e.id_concepto,  descrip,e.f_nro AS Factura,e.nro_reserva AS Reserva,nota_credito,nro_deposito,trans_num,e.e_sap,id_pago, DATE_FORMAT(e.fecha,'%d-%m-%Y') AS Fecha,e.hora,m_cod AS Moneda,entrada,salida,e.cotiz,entrada_ref,salida_ref,e.estado FROM efectivo e inner join conceptos c using(id_concepto) inner join factura_venta f using(f_nro) where e.suc = '$suc' AND m_cod like '$moneda' AND e.fecha BETWEEN '$desde' AND '$hasta' and f.estado = 'Cerrada' union SELECT e.id_pago as id, e.id_concepto, descrip,e.f_nro AS Factura,e.nro_reserva AS Reserva,nota_credito,nro_deposito,trans_num,e.e_sap, id_pago,DATE_FORMAT(e.fecha,'%d-%m-%Y') AS Fecha,e.hora,m_cod AS Moneda,entrada,salida,e.cotiz,entrada_ref,salida_ref,e.estado FROM efectivo e inner join conceptos c using(id_concepto) where e.suc = '$suc' AND m_cod like '$moneda' AND e.fecha BETWEEN '$desde' AND '$hasta' and e.f_nro is null order by id";
        
        $my->Query($sql);
        
        $TOTAL_E_REF = 0;
        $TOTAL_S_REF = 0;
        $MONEDA_E = 0;
        $MONEDA_S = 0;
        
        while($my->NextRecord()){
            $descrip = $my->Record['descrip'];
            $factura = $my->Record['Factura'];
            $reserva = $my->Record['Reserva'];
            $nota_credito = $my->Record['nota_credito'];
            $nro_deposito = $my->Record['nro_deposito'];
            $fecha = $my->Record['Fecha'];
            $hora = $my->Record['hora'];
            $moneda = $my->Record['Moneda'];
            $entrada = $my->Record['entrada'];
            $salida = $my->Record['salida'];
            $cotiz = $my->Record['cotiz'];
            $entrada_ref = $my->Record['entrada_ref'];
            $salida_ref = $my->Record['salida_ref'];              
            $trans_num = $my->Record['trans_num'];
            $id_concepto = $my->Record['id_concepto'];
            $estado = $my->Record['estado'];
            $e_sap = $my->Record['e_sap'];
            $id_pago = $my->Record['id_pago'];
            $id = $my->Record['id'];
            
            $t->Set("id_pago",$id_pago);
            $t->Set("id",$id);
            $t->Set("eliminar",'');
            if(in_array($id_concepto, $verificables) && $puede_verificar){
                if($e_sap == "1"){
                   $t->Set("e_sap","<img src='../../img/ok.png'  >");
                }else{
                    if($estado == 'Pendiente'){
                        $t->Set("e_sap","<input type='checkbox' id='check_$id_pago' class='verif' onclick='check()' >");
                        $t->Set("eliminar",'<button class="eliminar_registro" onclick="editar($(this))">X</button>');
                    }else{
                        $t->Set("eliminar",'');
                        $t->Set("e_sap","<img src='../../img/Circle_Red.png' >");
                    }
                }
            }else{
                $t->Set("e_sap","");
            }

            $nro_doc = "";
            $tipo_doc = "Otro";
            if($factura != ""){
                $nro_doc = $factura;
                $tipo_doc = "FV";
            }else if($reserva != ""){
                $nro_doc = $reserva;
                $tipo_doc = "RS";
            }else if($nota_credito != ""){
                $nro_doc = $nota_credito;
                $tipo_doc = "NC";
            }else if($nro_deposito != ""){
                $nro_doc = $nro_deposito;
                $tipo_doc = "DP";
            }elseif($trans_num != ""){
                $nro_doc = $trans_num;
                $tipo_doc = "PR";
            }
            
            $MONEDA_E += (float)$entrada;
            $MONEDA_S += (float)$salida;
            $TOTAL_E_REF += 0 + $entrada_ref;
            $TOTAL_S_REF += 0 + $salida_ref;
            
            $t->Set("descrip",$descrip);
            $t->Set("nro_doc",$nro_doc);
            $t->Set("tipo_doc",$tipo_doc);
            $t->Set("fecha",$fecha);
            $t->Set("hora",$hora);
            $t->Set("moneda",$moneda);
            $t->Set("entrada",number_format($entrada,2,',','.')); 
            $t->Set("salida",number_format($salida,2,',','.')); 
            $t->Set("cotiz",number_format($cotiz,2,',','.')); 
            $t->Set("e_ref",number_format($entrada_ref,2,',','.')); 
            $t->Set("s_ref",number_format($salida_ref,2,',','.')); 
            $t->Set("estado",$estado);
            $t->Show("data");
        }

        $t->Set("moneda_e",number_format($MONEDA_E,2,',','.'));
        $t->Set("moneda_s",number_format($MONEDA_S,2,',','.'));
        $t->Set("te_ref",number_format($TOTAL_E_REF,2,',','.'));
        $t->Set("ts_ref",number_format($TOTAL_S_REF,2,',','.'));
        $t->Set("diff",number_format(($MONEDA_E-$MONEDA_S),2,',','.'));
        $t->Set("t_diff",number_format(($TOTAL_E_REF-$TOTAL_S_REF),2,',','.'));
        
        if($puede_verificar){
            $t->Set("displayberif","inline"); 
        }else{
            $t->Set("displayberif","none"); 
        }

        $t->Show("foot");

        // Depositos
        $dep_total=0.00;
        $link = new My();
        
        //$link->Query("SELECT nombre,cuenta,nro_deposito,DATE_FORMAT(e.fecha,'%d-%m-%Y') as fecha,e.salida,b.suc,e.m_cod,e.cotiz*e.salida as cambio from bcos_ctas_mov b inner join bancos using(id_banco) inner join efectivo e using(nro_deposito) where e.suc = '$suc' and e.fecha between '$desde' and '$hasta' and e.id_concepto=9 group by e.salida_ref,b.nro_deposito order by e.id_pago asc");
        $link->Query("SELECT bb.nombre,b.cuenta,e.nro_deposito,DATE_FORMAT(e.fecha,'%d-%m-%Y') as fecha,e.salida,b.suc,e.m_cod,e.cotiz*e.salida as cambio from bcos_ctas_mov b inner join bcos_ctas c on b.id_banco=c.id_banco and b.cuenta=c.cuenta inner join bancos bb on c.id_banco=bb.id_banco inner join efectivo e on b.nro_deposito=e.nro_deposito and b.fecha_reg = e.fecha_reg and b.suc = e.suc and e.salida=b.entrada where e.suc = '$suc' and e.fecha between '$desde' and '$hasta' and e.id_concepto=9 group by e.salida_ref,b.nro_deposito order by e.id_pago asc");

        $t->Show("deposito_h");
        while($link->NextRecord()){
            $t->Set('nombre',$link->Record['nombre']);
            $t->Set('cuenta', $link->Record['cuenta'] );
            $t->Set('nro_deposito',number_format($link->Record['nro_deposito'],0,',','.'));
            $t->Set("nro_deposito_ref",$link->Record['nro_deposito']);
            $t->Set('fecha',$link->Record['fecha']);
            $t->Set('salida',number_format($link->Record['salida'],2,',','.'));
            $t->Set('salida_data',$link->Record['salida']);
            $t->Set('suc',$link->Record['suc']);
            $t->Set('m_cod',$link->Record['m_cod']);
            $t->Set('cambio',number_format($link->Record['cambio'],2,',','.'));
    
            if($puede_verificar){
                $t->Set("eliminar","");
            }else{
                $t->Set("eliminar","disabled");
            }
            $t->Show("deposito_b");
        }
        $t->Set('sum',number_format($dep_total,2,',','.'));     
        $t->Show("deposito_f");
    }
    private function verificarPermiso($user,$permiso){
        $link = new My();
        $link->Query("SELECT u.nombre AS usu,ug.usuario,g.nombre,p.id_permiso AS id_permiso,descripcion,trustee FROM  usuarios u,grupos g, usuarios_x_grupo ug, permisos_x_grupo p, permisos pr WHERE u.usuario = ug.usuario AND ug.id_grupo = p.id_grupo AND g.id_grupo = ug.id_grupo AND p.id_permiso = pr.id_permiso  AND ug.usuario = '$user' AND  p.id_permiso = '$permiso'");
        if( $link->NextRecord() && $link->NumRows()>0 ){
                return true;
        }else{
                return false;
        }
    }
}

function getCuentaContable($cuenta,$suc, $moneda){
    $ms = new My();
    $sql = "SELECT cuenta,nombre_cuenta from plan_cuentas   WHERE cuenta like '$cuenta%' AND suc = '$suc' and    moneda = '$moneda'  ;";
    $ms->Query($sql);
    $arr = array();
    if($ms->NumRows() > 0){
        $ms->NextRecord();
        $AcctCode = $ms->Record['cuenta'];
        $AcctName = $ms->Record['nombre_cuenta'];
        $arr[0]=$AcctCode;
        $arr[1]=$AcctName;
    }else{
       $arr[0]=$cuenta;
       $arr[1]=$suc; 
    }    
    return $arr;
}

function generarAsientos(){
    $usuario = $_REQUEST['usuario'];
    $ids =  json_decode($_REQUEST['ids']);
    
    $my = new My();
    $db = new My();
    foreach ($ids as $id_pago) {
       $my->Query("update efectivo set estado = 'Verificado'  where id_pago = '$id_pago'"); 
    }
             
    $my->Query("SELECT id_pago,fecha_reg,e.id_concepto,suc,entrada_ref,salida_ref,c.descrip FROM efectivo e, conceptos c WHERE  e.id_concepto = c.id_concepto AND estado = 'Verificado' AND e_sap IS NULL");
    
        while($my->NextRecord()){
           $id_pago = $my->Record['id_pago'];  
           $descrip = $my->Record['descrip'];  
           $id_concepto = $my->Record['id_concepto'];  
           $suc = $my->Record['suc'];  
           $entrada_ref = $my->Record['entrada_ref'];  
           $salida_ref = $my->Record['salida_ref'];

           $descrip_as = "$descrip id_pago: $id_pago, Suc: $suc";

           $db->Query("INSERT INTO  asientos(fecha, usuario, id_frac,descrip)VALUES (CURRENT_DATE, '$usuario', $id_pago,'$descrip_as');");    

           $db->Query("select id_asiento from asientos order by id_asiento desc limit 1");
           $db->NextRecord();
           $id_asiento = $db->Record['id_asiento'];   

           try{

           if($id_concepto == 13){ //Sobrante en Caja Sencillo

               $array = getCuentaContable("1112",$suc, "G$");      // Recaudaciones 
               $cuenta1 = $array[0];
               $cuenta1SN = $array[1];

               $valor = $entrada_ref;

               $db->Query("INSERT INTO asientos_det(id_asiento,id_det,cuenta, nombre_cuenta, debe, haber)
               VALUES ($id_asiento,1,'$cuenta1','$cuenta1SN', $valor, 0);");

               $cuenta2 = "4.1.2.1.08";
               $cuenta2SN = "Sobrante en Caja";

               $db->Query("INSERT INTO asientos_det(id_asiento,id_det,cuenta, nombre_cuenta, debe, haber)
               VALUES ($id_asiento,2,'$cuenta2', '$cuenta2SN',0, $valor);");  

           }else if($id_concepto == 14 || $id_concepto == 10){ // Entrada por Diferencia de Cambio
               $array = getCuentaContable("1112",$suc, "G$");      // Recaudaciones 
               $cuenta1 = $array[0];
               $cuenta1SN = $array[1];

               $valor = $entrada_ref;

               $db->Query("INSERT INTO asientos_det(id_asiento,id_det,cuenta, nombre_cuenta, debe, haber)
               VALUES ($id_asiento,1,'$cuenta1','$cuenta1SN', $valor, 0);");

               $cuenta2 = "4.1.2.1.10";
               $cuenta2SN = "Diferencia de Cambio - Ventas";

               $db->Query("INSERT INTO asientos_det(id_asiento,id_det,cuenta, nombre_cuenta, debe, haber)
               VALUES ($id_asiento,2,'$cuenta2', '$cuenta2SN',0, $valor);");  

           }else if($id_concepto == 15 || $id_concepto == 11){ // Salida por Diferencia de Cambio
               $cuenta1 = "6.1.1.1.32";
               $cuenta1SN = "Diferencia de Cambio - Ventas";          

               $valor = $salida_ref;           

               $db->Query("INSERT INTO asientos_det(id_asiento,id_det,cuenta, nombre_cuenta, debe, haber)
               VALUES ($id_asiento,1,'$cuenta1','$cuenta1SN', $valor, 0);");     


               $array = getCuentaContable("1112",$suc, "G$");      // Recaudaciones 
               $cuenta2 = $array[0];
               $cuenta2SN = $array[1]; 

               $db->Query("INSERT INTO asientos_det(id_asiento,id_det,cuenta, nombre_cuenta, debe, haber)
               VALUES ($id_asiento,2,'$cuenta2', '$cuenta2SN',0, $valor);");   
           }

           $db->Query("update efectivo set e_sap = 1 where id_pago = $id_pago;");
       }catch(Exception $e){
           echo $e->getMessage();
       }
       
    }
}
// Elimina deposito
function eliminarDeposito(){
    $link = new My();
    $usuario = $_POST['usuario'];
    $nro_deposito = $_POST['nro_deposito'];
    $observacion = $_POST['motivo'];
    $monto = $_POST['monto'];
    

    $respuesta = array();
    $link->Query("INSERT into logs (usuario,fecha,hora,accion,tipo,doc_num,data) VALUES ('$usuario',DATE(NOW()),TIME(NOW()),'Eliminar','Deposito','$nro_deposito',CONCAT('$observacion - ',(select concat('usu:',usuario,', suc:',suc,', ent:',entrada,', idBco:',id_banco,', cta:',cuenta,', ent:',entrada,',fReg:',fecha_reg,',hReg:',hora,',idCto:',id_concepto) from bcos_ctas_mov where nro_deposito=$nro_deposito and entrada=$monto)))");

    $link->Query("DELETE from bcos_ctas_mov WHERE nro_deposito = $nro_deposito and entrada=$monto");
    if($link->AffectedRows()>0){
        $respuesta['deposito']="Deposito Nro. $nro_deposito de $monto fue Eliminado";
        $link->Query("DELETE from efectivo WHERE nro_deposito = $nro_deposito and salida=$monto");
        if($link->AffectedRows()>0){
            $respuesta['efectivo']="Movimiento de efectivo de $monto fue Eliminado";
            $respuesta['ok']="Ok!";
        }else{
            $respuesta['efectivo']="No se pudo eliminar el Movimiento";            
        }
    }else{
        $respuesta['deposito']="No se pudo eliminar el Deposito Nro. $nro_deposito";
    }
    echo json_encode($respuesta);
}

function eliminarRegistro(){
    $id = $_POST['id_mov'];
    $lnk = new My();
    $q ="DELETE FROM efectivo WHERE id_pago = $id";
    $lnk->Query($q);
    if($lnk->AffectedRows()>0){
        echo "Ok";
    }else{
        echo "error";
    }
    $lnk->Close();
}

new Efectivo();
?>
