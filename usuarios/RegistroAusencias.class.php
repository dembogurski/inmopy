<?php

/**
 * Description of RegistroAusencias
 * @author Ing.Douglas
 * @date 05/09/2018
 */
 setlocale(LC_TIME, 'es_PY');


require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");

 

class RegistroAusencias {
   
 
    function __construct() {
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }

    function main() {

        $t = new Y_Template("RegistroAusencias.html");
        $t->Show("header");
        $db = new My();
        
        $jefe = $_POST['usuario'];
        
        require_once("../Functions.class.php");
        $f = new Functions();
        $permiso = $f->chequearPermiso("6.5.1", $jefe);
        $t->Set("display","none");
        if($permiso == "vem"){
            $t->Set("display","inline");
            $t->Set("sucs",$this->sucsOption());
        }
        
        // Primera consulta para extraer los grupos al que pertenece el jefe
        $db->Query("SELECT GROUP_CONCAT(g.id_grupo) AS grupos,  u.suc  FROM usuarios u,  usuarios_x_grupo  g, grupos gr 
        WHERE u.usuario = g.usuario AND u.estado = 'Activo' AND g.id_grupo = gr.id_grupo AND u.usuario ='$jefe' ORDER BY u.usuario ASC ");
        $db->NextRecord();
        
        $grupos = $db->Record['grupos'];
        $suc = $db->Record['suc'];
        
        $db->Query("SELECT DISTINCT u.usuario AS usuario,CONCAT(nombre,' ',apellido) AS nombre  FROM usuarios u,  usuarios_x_grupo  g  WHERE u.usuario = g.usuario AND 
        g.id_grupo IN($grupos) AND  u.suc = '$suc' and u.usuario <> '$jefe' AND u.nombre IS NOT NULL AND
        u.estado = 'Activo' ORDER BY u.usuario ASC "); 
        $usuarios = '';
        
        while($db->NextRecord()){            
            $user = $db->Record['usuario'];
            $name = $db->Record['nombre'];             
            $usuarios.="<option value='$user'>$user - $name</option>";
        }
         
        $t->Set("usuarios",$usuarios);        
        
        $t->Show("form");
        $t->Show("registro");
        
    }
    function sucsOption(){
        $link = new My();
        $sucOptions = "";
        $link->Query("SELECT s.suc,s.nombre FROM sucursales s INNER JOIN registro_ausencias a USING(suc) WHERE estado = 'Activo' GROUP BY s.suc,s.nombre ORDER BY nombre asc");
        while($link->NextRecord()){
            $sucCod = $link->Record['suc'];
            $sucName = $link->Record['nombre'];
            $sucOptions .= "<option value='$sucCod'>$sucName</option>";
        }
        return $sucOptions;
    }    
}
 
//jefe:getNick(),func: func,motivo:motivo,desde:desde,hasta:hasta,fecha_ret:fecha_ret,tipo:tipo,horas:horas,valor_desc:valor_desc
function registrarPedidoAusencia(){
    $jefe = $_POST['jefe'];
    $suc = $_POST['suc'];
    $func = $_POST['func'];
    $motivo = $_POST['motivo'];
    $desde = parseDate($_POST['desde']);
    $hasta = parseDate($_POST['hasta']);;   
    $fecha_ret = parseDate($_POST['fecha_ret']); 
    $horas = $_POST['horas'];
    $tipo_lic = $_POST['tipo'];    
    $tipo_permiso = $_POST['tipo_permiso'];
    $valor_desc = $_POST['valor_desc'];
    
    $db = new My();
    $db->Query("INSERT INTO registro_ausencias(jefe, usuario, fecha_reg, fecha_desde, fecha_hasta, fecha_retorno, motivo, tipo_lic, tipo_perm, horas, valor_descuento, suc)
    VALUES ('$jefe', '$func', current_date, '$desde', '$hasta', '$fecha_ret', '$motivo', '$tipo_lic','$tipo_permiso',$horas,  $valor_desc , '$suc');");
    echo json_encode( array("estado"=>"Ok"));
}
function borrarRegistro(){
    $id = $_POST['id'];
    $db = new My();
    $db->Query("DELETE FROM registro_ausencias  WHERE id_aus =$id;");
    $db->Close();
    echo "Ok";
}

function parseDate($date){
    //echo $date."<br>";
    $dia = substr($date,0,2);
    $mes = substr($date,3,2);
    $anio = substr($date,6,4);
    $hora = substr($date,11,14);
    return "$anio-$mes-$dia $hora";
    //echo "$dia - $mes - $anio | $hora";
}
function getRegistrosXFejeXSuc(){
    $jefe = $_POST['jefe'];
    $suc = $_POST['suc'];
    $db = new My();
    $db->Query("SELECT id_aus,jefe,usuario,fecha_reg,fecha_desde,fecha_hasta,fecha_retorno,motivo,tipo_lic,tipo_perm,valor_descuento,suc,horas FROM  registro_ausencias WHERE jefe like '$jefe' AND suc = '$suc' order by id_aus asc");
   
    $arr = array();    
    while($db->NextRecord()){         
        array_push($arr, $db->Record ) ;
    }
    echo json_encode($arr);
}
function imprimir(){
    $id = $_REQUEST['id'];
    $user = $_REQUEST['user'];
    $t = new Y_Template("RegistroAusencias.html");
    $db = new My();
    $db->Query("SET lc_time_names = 'es_PY';");
    $db->Query("SELECT DATE_FORMAT(current_date,'%d-%m-%Y') as hoy");
  
    $db->NextRecord();
    $hoy = $db->Record['hoy'];
    
    $ahora = date("d-m-Y H:i");    
    $t->Set("time",$ahora);
    $t->Set("user",$user);
    
    $db->Query("SELECT id_aus,s.ciudad, jefe,r.usuario, concat(u.nombre,' ',u.apellido) as nombre,u.doc, fecha_reg,date_format(fecha_desde,'%d %M de %Y %H:%i') as fecha_desde,date_format(fecha_hasta,'%d %M de %Y %H:%i') as fecha_hasta,date_format(fecha_retorno,'%d %M de %Y a las %H:%i') as fecha_retorno, "
            . "motivo,r.tipo_lic,tipo_perm,valor_descuento,r.suc,horas "
            . "FROM  registro_ausencias r, usuarios u, sucursales s WHERE r.usuario = u.usuario and r.suc = s.suc and  r.id_aus = $id;");
    $db->NextRecord();
    
    $id_aus = $db->Record['id_aus'];
    $ciudad = $db->Record['ciudad'];
    $jefe = $db->Record['jefe'];
    $funcionario = $db->Record['nombre'];
    $fecha_desde = $db->Record['fecha_desde'];
    $fecha_hasta = $db->Record['fecha_hasta'];
    $fecha_retorno = $db->Record['fecha_retorno'];
    $motivo = $db->Record['motivo'];
    $doc = $db->Record['doc'];
    $tipo_lic = $db->Record['tipo_lic'];
    $tipo_perm = $db->Record['tipo_perm'];
    $horas = $db->Record['horas'];
    
    $dias_horas = "horas";
    $cant_horas_dias = 0;
    if($tipo_perm === "Dias de Ausencia"){
        $dias_horas = "dias";
        $cant_horas_dias = $horas / 8;
        $fecha_desde = substr($fecha_desde,0,-5);
        $fecha_hasta= substr($fecha_hasta,0,-5);
    }else{
        $dias_horas = "horas";
        $cant_horas_dias = $horas  ;
    }
    
    
    $t->Set("nro",$id_aus);
    $t->Set("ciudad",$ciudad);
    $t->Set("funcionario",$funcionario);
    $t->Set("doc",$doc);
    $t->Set("fecha",$hoy);
    $t->Set("desde",$fecha_desde);
    $t->Set("hasta",$fecha_hasta);
    $t->Set("fecha_ret",$fecha_retorno);
    $t->Set("motivo",$motivo);
    $t->Set("tipo_lic",$tipo_lic);
    $t->Set("tipo_perm",$tipo_perm);
    $t->Set("dias_horas",$dias_horas);
    $t->Set("cant_horas_dias",$cant_horas_dias);
    /*
    $db->Query("SELECT CONCAT(u.nombre,' ',u.apellido) AS jefe FROM usuarios u WHERE usuario = '$jefe' ");
    $db->NextRecord();
    $nombre_jefe = $db->Record['jefe'];
    $t->Set("jefe",$nombre_jefe);*/
    
    $t->Show("imprimir");
}

new RegistroAusencias();
?>
