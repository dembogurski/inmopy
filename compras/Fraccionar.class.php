<?php

/**
 * Description of Fraccionar
 * @author Ing.Douglas
 * @date 04/07/2016
 */
require_once("../Y_DB_MySQL.class.php"); 
require_once("../Y_Template.class.php");
require_once("../Functions.class.php");
require_once("../Config.class.php");

 

class Fraccionar {

    function __construct() {
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }

    function main() {

        $t = new Y_Template("Fraccionar.html");
        $t->Show("header");

        // Solo si es Toutch
        $suc = $_POST['suc'];
        
        $usuario = $_POST['usuario'];

        $db = new My();

        $f = new Functions();
        $ip = $f->getIP();
        //echo $ip;
        $db->Query("select ip_alt from pcs where suc = '$suc' and tipo_periferico = 'Balanza' and local = 'No' and ip = '$ip' ");
        
      
        $permiso = $f->chequearPermiso("9.14", $usuario);  // Aliminar una Falla
        if($permiso != "---"){
            $t->Set("del_falla","table-cell");
        }else{
            $t->Set("del_falla","none");
        }

        $alternativos = "";
        while ($db->NextRecord()) {
            $ip_alt = $db->Record['ip_alt'];
            $alternativos.="<option>$ip_alt</option>";
        }
        $t->Set("ips_balanzas_alternativas", $alternativos);

        // Metrador
        $db->Query("select ip_alt from pcs where suc = '$suc' and tipo_periferico = 'Metrador' and local = 'No' and ip = '$ip' ");

        $alternativos = "";
        while ($db->NextRecord()) {
            $ip_alt = $db->Record['ip_alt'];
            $alternativos.="<option>$ip_alt</option>";
        }
        $t->Set("ips_metradores_alternativos", $alternativos);

        $c = new Config();
        $host = $c->getNasHost();
        $path = $c->getNasFolder();
        $images_url = "http://$host/$path";
        $t->Set("images_url",$images_url);
        
        $t->Show("body");
        require_once("../utils/NumPad.class.php");
        new NumPad();
    }

}

function registrarInicioOperacion() {
    $codigo = $_POST['codigo'];
    $lote = $_POST['lote'];
    $suc = $_POST['suc'];    
    $operador = $_POST['operador']; 
    $db = new My();
     
    //Actualizo la hora de inicio de Fraccionamiento si aun no tiene fraccionamientos
    $db->Query("select count(*) as fracs from  fraccionamientos where codigo = '$codigo' AND padre = '$lote'");
    if($db->NumRows()>0){
        $db->NextRecord();
        $fracs = $db->Record['fracs'];
        if($fracs < 1){
            $db->Query("UPDATE orden_procesamiento SET fecha_inicio = CURRENT_TIMESTAMP, iniciado_por = '$operador' WHERE codigo = '$codigo' AND lote = '$lote'");
        }
    } 

    echo json_encode($arr);
}

/**
 * En Sap No existe el Fraccionamiento solo existe Salida y Entrada en Operaciones de Stock, por lo tanto se saca de un Lote en una Salida
 * y se da entrada con un nuevo Lote generando el Nro de Lote antes
 */
function fraccionar() {
     
    $codigo = $_POST['codigo'];
    $lote = $_POST['lote'];
    $suc = $_POST['suc'];
    $fraccion = $_POST['fraccion'];
    $um = $_POST['um'];
    $tara = $_POST['tara'];
    $usuario = $_POST['usuario'];
    $kg = $_POST['kg'];
    $kg_desc = $_POST['kg_desc'];
    $ancho = $_POST['ancho']; 
    $gramaje_rollo = $_POST['gramaje_rollo'];
    $gramaje = $_POST['gramaje'];
    $destino = $_POST['destino'];
    $presentacion = $_POST['presentacion'];
    $total_fraccionado = $_POST['total_fraccionado'];
    $fp = $_POST['fp'];
    
    try {
       
        $ms = new My();
        $ms->Query("SELECT  costo_prom,descrip FROM articulos WHERE codigo = '$codigo'"); // En Productivo 
         
        
        $ms->NextRecord();
        $precio_costo = $ms->Record['costo_prom'];
        $descrip = $ms->Record['descrip'] ; 
        
        if($precio_costo == null || $precio_costo == 0){
            $precio_costo = 0;
            echo "Error Precio Costo no definido";
            die();
        }
        
         
         
        $fn = new Functions();     
        $terminacion = substr($lote,-2,2);
        $nuevo_lote = $fn->generarLote($codigo,$terminacion);
        
        if($nuevo_lote == "" || $nuevo_lote == null){
            echo "Error al crear el nuevo Lote";
            die;
        }

        $ms->Query("SELECT cantidad as stock FROM stock o where codigo = '$codigo' and o.lote = '$lote' and suc = '$suc' ;"); //Lote
        $ms->NextRecord();

        //$stock = $ms->Record['Stock'] - $total_fraccionado;
        
        $stock = $ms->Record['stock'] ;
        
        
        $final = $stock - $fraccion; 
        
        if($final < 0){           
           $final = 0;
           $fraccion = $stock;
        }
        $saldo = $stock - $fraccion; // 20 - 19.4 Saldo = 0.6 > 0        
        
        if($saldo > 0 && $fp == "true"){ // Si marco con Fin de Pieza 
            $final = 0;
            $fraccion = $stock;
        }
        $valor_salida = $fraccion * $precio_costo;
        
         // Extraer el Pais de Origen del Padre si no tiene por defecto queda China
        $PaisOrigen = 'China';
        $ms->Query("SELECT p.codigo_pais, p.nombre as PaisOrigen FROM entrada_merc e, entrada_det d, paises p WHERE   e.pais_origen = p.codigo_pais AND e.id_ent = d.id_ent AND d.codigo ='$codigo' and d.lote = '$lote'"); //Lote
        if($ms->NumRows() > 0){
           $ms->NextRecord();
           $PaisOrigen = $ms->Record['PaisOrigen'];
        } 
          
        $db = new My();
        // Salida
        $db->Query("insert into fraccionamientos( usuario, codigo, lote, tipo, signo, inicial, cantidad, final, um, p_costo, motivo, fecha, tara, kg_desc, gramaje, hora, estado, valor, suc,suc_destino,presentacion, padre,ancho, e_sap,cta_cont,pais_origen)
        values ('$usuario', '$codigo', '$lote', 'Salida', '-', $stock, $fraccion, $final, '$um', $precio_costo, 'Fracccionamiento Medicion de Entrada', CURRENT_DATE, 0, $kg_desc, "
                . "$gramaje_rollo, CURRENT_TIME, 'Pendiente',$valor_salida, '$suc','$destino','$presentacion',null,$ancho, 0,'1.1.3.1.05','$PaisOrigen');");

         
        $db->Query("SELECT id_frac FROM fraccionamientos where codigo = '$codigo' and lote = '$lote' and usuario = '$usuario' order by id_frac desc limit 1;");
        $db->NextRecord();
        $id_frac_neg = $db->Get("id_frac");
         
        //makeLog($usuario,"Fraccionar 1","Saldo:$saldo  FP: $fp Precio Costo: $precio_costo Fraccion: $fraccion", "","","");
        
        if($saldo > 0 && $fp == "true"){ // Faltante
            // Generar Asiento por Faltante
            $valor_faltante = $saldo * $precio_costo;
            if($valor_faltante > 0){ 
                //genAsiento($usuario,'6.1.4.1.17','Mermas en Stock','1.1.3.1.05','Fraccionamientos',$valor_faltante,"Faltante: $saldo, Valor: $valor_faltante PrecioCosto: $precio_costo");
            }
        }
        
        $fraccion = $_POST['fraccion']; // Aqui nuevamente para tomar la Fraccion real
        $valor_entrada = $fraccion * $precio_costo;
        $final = $fraccion;

       
        
        // Entrada
        
                 
        $db->Query("insert into fraccionamientos( usuario, codigo, lote, tipo, signo, inicial, cantidad, final, um, p_costo, motivo, fecha, tara, kg_desc, gramaje, hora, estado, valor, suc,suc_destino,presentacion, padre, ancho,e_sap,cta_cont,pais_origen)
        values ('$usuario', '$codigo', '$nuevo_lote', 'Entrada', '+', 0, $fraccion, $final, '$um', $precio_costo, 'Fracccionamiento Medicion de Entrada', CURRENT_DATE, $tara, $kg, "
                . "$gramaje, CURRENT_TIME, 'Pendiente',$valor_entrada, '$suc','$destino','$presentacion','$lote',$ancho, 0,'113105','$PaisOrigen');");
        
        
        $db->Query("SELECT id_frac FROM fraccionamientos where codigo = '$codigo' and lote = '$nuevo_lote' and usuario = '$usuario' order by id_frac desc limit 1;");
        $db->NextRecord();
        $id_frac_pos = $db->Get("id_frac");
        
        
        $saldo = $stock - $fraccion; // 20 - 21.5 =  -1.5
        
       
         
        if($saldo < 0){
            //makeLog($usuario,"Fraccionar 3", "Saldo:$saldo < 0  FP: $fp Stock: $stock  Fraccion: $fraccion", "","","");
             //Generar Asiento por Sobrante en Stock
            $valor_sobrante = ($saldo* $precio_costo) * -1; // Porque el Saldo es Negativo
            //makeLog($usuario,"Fraccionar 4", "Saldo:$saldo < 0   valor_sobrante : $valor_sobrante  precio_costo: $precio_costo", "","","");
            if($valor_sobrante > 0){
              // genAsiento($usuario,'1.1.3.1.05','Fraccionamientos','4.1.2.1.07','Sobrante en Stock',$valor_sobrante,"Sobrante: $saldo, Valor: $valor_sobrante PrecioCosto: $precio_costo");
            } 
        }    
        
        //Insertar en la Tabla Lotes y Generar Stock
      
        registrarLote($usuario,$id_frac_pos, $id_frac_neg,$codigo,$lote,$nuevo_lote,$suc,$fp);
                
        // Actualizar estado del lote en Orden de Procesamiento
        $db->Query("UPDATE orden_procesamiento SET estado = 'Procesado'  WHERE codigo = '$codigo' AND lote = '$lote'");
        
        // Actualizo las fallas asignando al nuevo hijo generado.
        $db->Query("UPDATE fallas SET lote = '$nuevo_lote',mts_inv =  $fraccion - mts,stock_actual = mts + mts_inv  WHERE codigo = '$codigo' AND lote = '$lote' and padre ='$lote';");
        
        //makeLog("$usuario", "Ajuste$signo", "$oper | $motivo",'Ajuste',0);
        echo $nuevo_lote;
        
    } catch (Exception $e) {
        echo  "Error ".$e->getMessage();
    }
    
}

function registrarLote($usuario,$id_frac_pos, $id_frac_neg,$codigo,$lote,$nuevo_lote,$suc,$fp){
    
    
    $db = new My();
    $db_frac = new My();
     
    
    $datos = "SELECT id_ent,id_det as linea, cod_serie, pantone, umc, um_prod, nro_lote_fab, store, bag, nro_pieza, ancho, gramaje, gramaje_m, tara, kg_desc, quty_ticket,quty_c_um, color_comb, color_cod_fabric, design, cod_catalogo, notas, img, padre, rec, fecha_creacion, id_ent, id_det, id_frac, id_prod_ter 
    FROM  lotes l  WHERE   l.codigo = '$codigo' AND l.lote = '$lote';";
    // Sacar de la Tabla Lotes directamente
    
    $db->Query($datos);
    
    $db->NextRecord();
    $ref = $db->Record['id_ent']; 
    
    $cod_serie = $db->Record['cod_serie']; 
    $pantone= $db->Record['pantone']; 
    $umc= $db->Record['umc'];
    $um_prod= $db->Record['um_prod'];
    $nro_lote_fab= $db->Record['nro_lote_fab']; 
    $store = $db->Record['store']; 
    $bag= $db->Record['bag'];  
    $nro_pieza= $db->Record['nro_pieza'];  
    $gramaje_m= $db->Record['gramaje_m']; 
    $quty_ticket= $db->Record['quty_ticket']; 
    //
    $color_comb= $db->Record['color_comb']; 
    $color_cod_fabric= $db->Record['color_cod_fabric'];
    $design= $db->Record['design'];    
    $cod_catalogo= $db->Record['cod_catalogo']; 
    $notas= $db->Record['notas'];     
    $img= $db->Record['img']; 
       
    //Datos del Fraccionamiento
    
    $db->Query("SELECT cantidad,ancho,tara,kg_desc,gramaje FROM fraccionamientos WHERE id_frac = $id_frac_pos");
    $db->NextRecord();
    
    $ancho= $db->Record['ancho']; 
    $gramaje= $db->Record['gramaje'];  
    $tara= $db->Record['tara']; 
    $kg_desc= $db->Record['kg_desc'];     
    $cantidad = $db->Record['cantidad']; 
     
         
    $ins_lotes_sql = "INSERT INTO lotes(codigo, lote, cod_serie, pantone, umc, um_prod, nro_lote_fab, store, bag, nro_pieza, ancho, gramaje, gramaje_m, tara, kg_desc, quty_ticket, quty_c_um, color_comb, color_cod_fabric, design, cod_catalogo, notas, img, padre, rec, fecha_creacion, id_ent, id_det, id_frac, id_prod_ter)
    VALUES ('$codigo', '$nuevo_lote', '$cod_serie', '$pantone', '$umc', '$um_prod', '$nro_lote_fab', '$store', '$bag', '$nro_pieza', $ancho ,  $gramaje ,  $gramaje_m ,  $tara ,  $kg_desc ,  $quty_ticket ,  $cantidad , '$color_comb', '$color_cod_fabric', '$design', '$cod_catalogo', '$notas', '$img', '$lote', 'Si', CURRENT_TIMESTAMP, $ref, null, $id_frac_pos, null);"; 
    $db->Query($ins_lotes_sql);
     
    // Registrar Stock del Nuevo Lote
    $db->Query("INSERT INTO stock(suc, codigo, lote, tipo_ent, nro_identif, linea, cant_ent, kg_ent, cantidad, ubicacion, estado_venta)
    VALUES ('$suc', '$codigo', '$nuevo_lote', 'FR', $id_frac_pos, 1, $cantidad, $kg_desc, $cantidad, '', 'Normal');");

    $db->Query("INSERT INTO historial( suc, codigo, lote, tipo_ent, nro_identif, linea, fecha_hora, usuario, direccion, cantidad,tipo_doc,nro_doc,ancho,gramaje,tara)
    VALUES (  '$suc', '$codigo', '$nuevo_lote', 'FR', $id_frac_pos,1, current_timestamp, '$usuario', 'E', $cantidad,'FR',$id_frac_pos,$ancho,$gramaje,$tara);");
    
    
    //Actualizar Stock del padre
    $db->Query("SELECT f.cantidad as cant_fraccionada,tipo_ent, nro_identif, linea FROM fraccionamientos f, stock l  WHERE  f.codigo = l.codigo and l.lote = f.lote and id_frac = $id_frac_neg");
    $db->NextRecord();
    
    $cant_fraccionada= $db->Record['cant_fraccionada']; 
    $tipo_ent= $db->Record['tipo_ent']; 
    $nro_identif= $db->Record['nro_identif']; 
    $linea= $db->Record['linea']; 
    
    $set_FP = "";
    if($fp == "true"){
        $set_FP = ", estado_venta = 'FP' ";
    }
    
    $db->Query("UPDATE stock SET cantidad = cantidad - $cant_fraccionada  $set_FP WHERE  codigo ='$codigo' and lote ='$lote' and suc = '$suc' and nro_identif = $nro_identif; ");    
    $db->Query("INSERT INTO historial( suc, codigo, lote, tipo_ent, nro_identif, linea, fecha_hora, usuario, direccion, cantidad,tipo_doc,nro_doc,ancho,gramaje,tara)
    VALUES (  '$suc', '$codigo', '$lote', '$tipo_ent', $nro_identif,$linea, current_timestamp, '$usuario', 'S', -$cant_fraccionada,'FR',$id_frac_neg,$ancho,$gramaje,$tara);");
    
}
 

function consultarExistenciaStock(){
    $codigo = $_POST['codigo'];
    $lote = $_POST['lote'];
}

function remitir(){
    $codigo = $_POST['codigo'];
    $lote = $_POST['lote'];
    $origen = $_POST['origen'];
    $destino = $_POST['destino'];
    $usuario = $_POST['usuario'];
    
    $descrip = $_POST['descrip'];
    $um = $_POST['um'];
    $cant = $_POST['cant'];
    $cant_compra = $_POST['cant_compra'];
    $gramaje = $_POST['gramaje'];
    $ancho = $_POST['ancho'];
    $tara = $_POST['tara'];
    $kg = $_POST['kg'];
    $kg_dec = $_POST['kg_desc'];
     
    $db = new My();    
    insertarEnRemisionAbierta($origen,$destino,$usuario,$codigo,$lote,$descrip,$um,$cant,$cant_compra,$gramaje,$ancho,$tara,$kg_dec);
     
}
function insertarEnRemisionAbierta($suc,$suc_d,$usuario,$codigo,$lote,$descrip,$um,$cant,$cant_compra,$gramaje,$ancho,$tara,$kg_dec){
    $nro = getRemisionAbierta($suc,$suc_d,$usuario);
    $db = new My();
    $db->Query("insert into nota_rem_det( n_nro, codigo, lote, um_prod, descrip, cantidad,cant_inicial,gramaje,ancho, kg_env, kg_rec, cant_calc_env, cant_calc_rec, tara, procesado, estado,tipo_control, kg_desc,e_sap, usuario_ins,fecha_ins)
    values ($nro, '$codigo', '$lote', '$um', '$descrip', $cant,$cant_compra,$gramaje,$ancho,0, 0, 0, 0, $tara,0, 'Pendiente','Pieza',$kg_dec, 0,'$usuario',CURRENT_TIMESTAMP );");
    echo "Ok";
}

function getRemisionAbierta($suc,$suc_d,$usuario){
    $db = new My();
    $db->Query("SELECT n_nro FROM nota_remision WHERE estado = 'Abierta' AND suc = '$suc' AND suc_d = '$suc_d' AND usuario IN('gustavo') ");
    if($db->NumRows() > 0){
        $db->NextRecord();
        $nro = $db->Record['n_nro'];
        return $nro;
    }else{
       $nro =  generarRemito($suc,$suc_d,'gustavo');
       return $nro;
    }
}

function generarRemito($suc,$suc_d,$usuario) { 
    $db = new My();
    $db->Query("INSERT INTO nota_remision( fecha, hora, usuario, recepcionista, suc, suc_d, fecha_cierre, hora_cierre, obs, estado, e_sap)
                VALUES ( CURRENT_DATE, CURRENT_TIME, '$usuario', '', '$suc', '$suc_d', null, null, '', 'Abierta', 0);");

    $db->Query("SELECT n_nro FROM nota_remision WHERE suc = '$suc' and suc_d = '$suc_d' and usuario = '$usuario' ORDER BY n_nro DESC limit 1");
    $db->NextRecord();
    $nro = $db->Record['n_nro'];
    return $nro;
}
 

function genAsiento($usuario,$cuenta1,$cuenta1SN,$cuenta2,$cuenta2SN,$valor,$descrip){
    $my = new My();
    $my->Query("select id_frac from fraccionamientos order by id_frac desc limit 1");
    $my->NextRecord();
    $id_frac = $my->Record['id_frac'];  
    $my->Query("INSERT INTO  asientos(fecha, usuario, id_frac,descrip)VALUES (CURRENT_DATE, '$usuario', $id_frac,'$descrip');");
    
    $my->Query("select id_asiento from asientos  where usuario = '$usuario' order by id_asiento desc limit 1");
    $my->NextRecord();
    $id_asiento = $my->Record['id_asiento'];   
    
    // Detalle
    $my->Query("INSERT INTO asientos_det(id_asiento,id_det,cuenta, nombre_cuenta, debe, haber)
    VALUES ($id_asiento,1,'$cuenta1','$cuenta1SN', $valor, 0);");
    
    $my->Query("INSERT INTO asientos_det(id_asiento,id_det,cuenta, nombre_cuenta, debe, haber)
    VALUES ($id_asiento,2,'$cuenta2', '$cuenta2SN',0, $valor);");   
}


function getResultArray($sql) {
    $db = new My();
    $array = array();
    $db->Query($sql);
    while ($db->NextRecord()) {
        array_push($array, $db->Record);
    }
    return $array;
}

function getFraccionados() {
    $lote = $_POST['lote'];
    $sql = "SELECT usuario,gramaje, lote,cantidad,suc_destino,presentacion FROM fraccionamientos WHERE padre = '$lote'";
    echo json_encode(getResultArray($sql));
}

 
function buscarStockComprometido() {
    $lote = $_POST['lote'];
    $suc = $_POST['suc'];
    $incluir_reservas = isset($_POST['incluir_reservas']);
    $query = '';
    //Ventas
    $query = "SELECT 'Factura' as TipoDocumento ,f.f_nro AS Nro,usuario,DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha,suc,f.estado,cantidad FROM factura_venta f, fact_vent_det d WHERE f.f_nro = d.f_nro AND d.lote = '$lote' and f.suc = '$suc' AND f.e_sap IS NULL union ";
    
    // Pendiente de remedicion
    $query = "select 'Remedir' as TipoDocumento, n.n_nro as Nro, d.verificado_por as usuario,DATE_FORMAT(n.fecha_cierre,'%d-%m-%Y') AS fecha,n.suc_d as suc,d.estado,d.cantidad as cantidad from nota_remision n inner join nota_rem_det d using(n_nro) where n.suc_d = '$suc' and d.lote = '$lote' and d.estado = 'FR' union ";
    
    //Agregar aqui los que estan en Remision Abierta o En Proceso 
    $query .= "SELECT 'NotaRemision' AS TipoDocumento ,n.n_nro AS Nro,usuario,DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha,suc,n.estado,cantidad FROM nota_remision  n, nota_rem_det d WHERE n.n_nro = d.n_nro AND d.lote = '$lote' AND n.suc = '$suc' AND n.estado != 'Cerrada'  ";
    
    if($incluir_reservas){
       $query .= "union SELECT 'Reserva' AS TipoDocumento ,r.nro_reserva AS Nro,usuario,DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha,suc,r.estado,cantidad FROM reservas r, reservas_det d WHERE r.nro_reserva = d.nro_reserva AND d.lote = '$lote' AND r.suc = '$suc' AND r.estado not in ('Cerrada','Liberada','Vencida','Retirada') ";
    }     
    echo json_encode(getResultArray($query));
}
function verPendientes(){
    $db = new My();
    $usuario = $_REQUEST['usuario'];
 
    $t = new Y_Template("Fraccionar.html");
     
 
    $db->Query("SELECT id_orden,o.codigo,a.descrip,o.lote,o.color,COUNT(lote) AS cortes,prioridad FROM orden_procesamiento o , articulos a WHERE a.codigo = o.codigo and o.estado = 'Pendiente' AND operador = '$usuario' GROUP BY codigo,lote ORDER BY prioridad ASC");

    $t->Show("pendientes_cab");
    while ($db->NextRecord()) {
        $id_orden = $db->Record['id_orden'];
        $codigo = $db->Record['codigo'];
        $descrip = $db->Record['descrip'];
        $lote = $db->Record['lote'];
        $color = $db->Record['color'];
        $cortes = $db->Record['cortes'];
        $prioridad = $db->Record['prioridad'];
            
        $t->Set("codigo", $codigo);
        $t->Set("lote", $lote);
        $t->Set("descrip", $descrip);
        $t->Set("color", $color);
        $t->Set("cortes", $cortes);
        $t->Set("prioridad", $prioridad);
        $t->Show("pendientes_data");        
    }
    $t->Show("pendientes_foot");        
}
 

function registrarFalla(){
    $usuario = $_REQUEST['usuario'];
    $codigo = $_REQUEST['codigo'];
    $padre = $_REQUEST['padre']; // Todavia no tengo al hijo al fraccinar se debe actualizar a todo lo que tenga en el campo lote como padre
    $tipo_falla = $_REQUEST['tipo_falla'];    
    $mts = $_REQUEST['mts'];
    
    $sql = "INSERT INTO  fallas(codigo, lote, padre, tipo_falla, usuario, fecha, mts, mts_inv) VALUES ('$codigo', '$padre', '$padre', '$tipo_falla', '$usuario',CURRENT_TIME, $mts, NULL);";
    $db = new My();
    $db->Query($sql);
        
    echo json_encode( array("mensaje"=>"Ok") );
}

function getFallas(){
    $usuario = $_REQUEST['usuario'];
    $codigo = $_REQUEST['codigo'];
    $lote = $_REQUEST['lote']; 
    $fn = new Functions();
    echo json_encode($fn->getResultArray(" SELECT nro_falla,usuario,tipo_falla,mts FROM fallas WHERE ((lote = '$lote' AND padre = '$lote' )  OR (lote = '$lote' AND padre <> lote) ) AND codigo = '$codigo'"));
}

function eliminarFalla(){
    $nro_falla = $_REQUEST['nro_falla']; 
    $usuario = $_REQUEST['usuario'];
    $codigo = $_REQUEST['codigo'];
    $lote = $_REQUEST['lote']; 
    $db = new My();
    $db->Query("DELETE FROM fallas WHERE nro_falla = $nro_falla;");
        
    echo json_encode( array("mensaje"=>"Ok") );
}

function makeLog($usuario, $accion, $data, $tipo, $doc_num) {
    $db = new My();
    $db->Query("INSERT INTO logs(usuario, fecha, hora, accion,tipo,doc_num, DATA) VALUES ('$usuario', current_date, current_time, '$accion','$tipo', '$doc_num', '$data');");
    return true;
}



new Fraccionar();
?>
