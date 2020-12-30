<?php

/**
 * Description of Pagare
 * @author Ing.Douglas
 * @date 27/04/2015
 */
require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");
require_once("../Functions.class.php");

class Pagare {
    
   function __construct() {
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }   
   }
   function main(){
        $T = new Y_Template("Pagare.html");       

        $T->Set( 'time', date("d-m-Y h:i") );
        $T->Set( 'user', $_REQUEST['usuario'] );
        $T->Set( 'papar_size', $_REQUEST['papar_size'] );
        
        $REF = $_REQUEST['factura'];
        $SUC = $_REQUEST['suc'];
        
        $T->Set( 'factura', $REF );

        $PG_NRO = $_REQUEST['nro_pg'];
        $T->Set( 'pg_nro', $PG_NRO );

        $Q = new My(); 
        $Q->Query("SELECT count(id_cuota) as cant FROM cuotas c WHERE f_nro = $REF LIMIT 1");
        $Q->NextRecord();
        $BARRA = $Q->Record['cant'];
        $T->Set('barra',$BARRA);

        $Q0 = new My();
        $query0 = "SELECT f_nro AS REF,id_cuota AS NRO, monto AS MONTO, moneda AS MONEDA,m_descri as NOMBRE_MONEDA, DATE_FORMAT(vencimiento,'%d') AS DIA_VENC, DATE_FORMAT(vencimiento,'%m') AS MES_VENC,DATE_FORMAT(vencimiento,'%Y') AS ANIO_VENC "
                . "FROM cuotas c, monedas m WHERE c.moneda = m.m_cod AND f_nro = '$REF'  AND id_cuota = '$PG_NRO' ";

        $Q0->Query( $query0 );
        
        $T->Set( 'logo', 'logo_inmopy.png' ); 
        $T->Set( 'w', '280px' );      
        $T->Set( 'h', '80px' ); 
        
        if($SUC == "00"){
            $T->Set( 'logo', 'logotipo_corporacion.jpg' ); 
            $T->Set( 'w', '540px' ); 
            $T->Set( 'h', '70px' ); 
        }
        if($SUC == "30"){
            $T->Set( 'logo', 'LaRetaceriaLogoBN.png' ); 
            $T->Set( 'w', '283px' ); 
            $T->Set( 'h', '64px' ); 
        }

        // Starting a HTML
        $T->Show('general_header');			// Principal Header
        $T->Show('start_query0');			// Start a Table 
        $T->Show('header0');				// Show Header

        $dia_hoy = date("d");
        $este_mes = date("m");
        $este_anio = date("Y");
  

        $DENOMINACION = 'Corporaci&oacute;n Textil S.A.';


        $CI = $_REQUEST['ruc'];

        $ms = new My();

        $ms->Query(" SELECT cod_cli, dir,ciudad,pais,tel,ci_ruc,nombre,alias  FROM clientes  WHERE ci_ruc =  '$CI' ");
        $ms->NextRecord();
        $COD_CLI = $ms->Record['cod_cli'];
        $CLIENTE =  ($ms->Record['nombre']);
        $TEL = $ms->Record['tel'];
        
        $T->Set('cod_cli',$COD_CLI);
        
         
        $DIR = $ms->Record['dir'];
        $CIUDAD = $ms->Record['ciudad'];

        $doc =  str_replace("*","",$CI);	

        $T->Set('ci',$doc);
        $T->Set('cliente',   $CLIENTE );
        $T->Set('tel',$TEL);
        $T->Set('dir',$DIR);
        $T->Set('ciudad',$CIUDAD);

        $Q->Query("SELECT direccion, ciudad FROM sucursales WHERE suc = '$SUC' limit 1");
        $Q->NextRecord();
        $CIU = $Q->Record['ciudad'];
        //$EMP_DIR = htmlentities(utf8_decode($Q->Record['direccion']));
	$EMP_DIR = htmlentities(($Q->Record['direccion']));	
         
        /*      
        if($SUC == "00"){
            $Q->Query("SELECT direccion, ciudad FROM sucursales WHERE suc = '02' limit 1");
            $Q->NextRecord();
            $CIU = $Q->Record['ciudad'];
            $EMP_DIR = htmlentities(($Q->Record['direccion']));
        } */
        
        $ciu_denom = " ciudad de ";
        
        if($CIU == "Ciudad del Este"){
             $ciu_denom = ", ";
        }
                           

        //$CIU = "Encarnaci&oacute;n";
        $T->Set('emp_ciu',$CIU);
        $T->Set('ciu_denom',$ciu_denom);
        //$EMP_DIR = str_replace("�","&eacute;",$EMP_DIR);
        //$EMP_DIR = str_replace("�","&ntilde;",$EMP_DIR);

        $T->Set('emp_dir',$EMP_DIR);


        //echo "$dia_hoy    $este_mes    $este_anio";

        //Define a  variable
        $endConsult = false;
        //Define a Total Variables

        //Define a Subtotal Variables


        //Define a Old Values Variables
        $old['REF'] = '';
        $old['NRO'] = '';
        $old['MONTO'] = '';
        $old['DIA_VENC'] = '';
        $old['MES_VENC'] = '';
        $old['ANIO_VENC'] = '';
        $old['MONEDA'] = '';  
        $old['NOMBRE_MONEDA'] = '';
        // Making a rows of consult
        while( $Q0->NextRecord() ){

            // Define a elements
            $el['REF'] = $Q0->Record['REF'];
            $el['NRO'] = $Q0->Record['NRO'];
            $el['MONTO'] = $Q0->Record['MONTO'];
            $el['DIA_VENC'] = $Q0->Record['DIA_VENC'];
            $el['MES_VENC'] = $Q0->Record['MES_VENC'];
            $el['ANIO_VENC'] = $Q0->Record['ANIO_VENC'];
            $el['MONEDA'] = str_replace("$","s",$Q0->Record['MONEDA']); 
            $el['NOMBRE_MONEDA'] = $Q0->Record['NOMBRE_MONEDA'];
            
            // Preparing a template variables
            $T->Set('query0_REF', $el['REF']);
            $T->Set('query0_NRO', $el['NRO']);
            
            $T->Set('query0_DIA_VENC', $el['DIA_VENC']);
            $T->Set('query0_MES_VENC',$el['MES_VENC'] );
            $T->Set('query0_ANIO_VENC', $el['ANIO_VENC']);
            $T->Set('MONEDA', $el['MONEDA']);
            $T->Set('NOMBRE_MONEDA', $el['NOMBRE_MONEDA']);
            $type = 0;
            if($el['MONEDA']!="Gs"){
               $type = 1; 
               $T->Set('query0_MONTO', number_format($el['MONTO'],2,',','.'));
            }else{
               $T->Set('query0_MONTO', number_format($el['MONTO'],0,',','.'));
            }

            $meses = array("01"=>"Enero","02"=>"Febrero","03"=>"Marzo","04"=>"Abril","05"=>"Mayo","06"=>"Junio","07"=>"Julio",
                           "08"=>"Agosto","09"=>"Setiembre","10"=>"Octubre","11"=>"Noviembre","12"=>"Diciembre"); 

            $T->Set('query0_MES_VENC_LETRAS',$meses[$el['MES_VENC']]);
            $T->Set('dia_hoy',$dia_hoy);
            $T->Set('este_anio',$este_anio);
            $T->Set('este_mes',$meses[$este_mes]);
            $T->Set('denominacion',$DENOMINACION);
            
            $fn = new Functions();
           
            $monto_en_letras = $fn->extense($el['MONTO'],$el['NOMBRE_MONEDA'],$type);
            $T->Set('monto_en_letras',$monto_en_letras);

            $T->Show('query0_data_row');

            $old['REF'] = $el['REF'];
            $old['NRO'] = $el['NRO'];
            $old['MONTO'] = $el['MONTO'];
            $old['DIA_VENC'] = $el['DIA_VENC'];
            $old['MES_VENC'] = $el['MES_VENC'];
            $old['ANIO_VENC'] = $el['ANIO_VENC']; 
            $old['MONEDA'] = $el['MONEDA'];
            $old['NOMBRE_MONEDA'] = $el['NOMBRE_MONEDA'];
            $T->Show('query0_subtotal_row'); 
            $T->Show('query0_total_row'); 
            $T->Show('end_query0'); 
       } 
   }
}

function getAutorizado(){
    $id_auth = $_REQUEST['id_auth'];
    $CardCode = $_REQUEST['CardCode'];
    $ms = new My();
    $ms->Query("SELECT nombre,doc FROM contactos WHERE codigo_entidad = '$CardCode' AND id_contacto = 'Autorizado_$id_auth'");
    $auth = array();
    if($ms->NumRows()>0){
        $ms->NextRecord();
        $CI = $ms->Record['doc'];
        $Nombre = $ms->Record['nombre'];
        $auth['CI'] = $CI;
        $auth['Nombre'] = utf8_encode($Nombre);
    }else{
        $auth['CI'] = "";
        $auth['Nombre'] = "";
    }
    echo json_encode($auth);
}

new Pagare();
?>
