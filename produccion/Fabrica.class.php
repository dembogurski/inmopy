<?php

/**
 * Description of EmisionProduccion
 * @author Ing.Douglas
 * @date 26/09/2017
 */
require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");


class Fabrica {

    function __construct() {
        $action = $_REQUEST['action'];

        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }

    function main() {

        $t = new Y_Template("Fabrica.html");

        $t->Show("headers");
        // Extrae los datos 
        $suc = $_REQUEST['suc'];

        $sql = "SELECT nro_emis, e.nro_orden,cod_cli,cliente,e.usuario,DATE_FORMAT(e.fecha,'%d-%m-%Y') AS fecha,obs,e.estado , e.asignado_a  FROM orden_fabric e  INNER JOIN emis_produc p ON e.nro_orden = p.nro_orden  WHERE   p.estado = 'En Proceso' and suc_d = '$suc'  ";
        $db = new My();

        
        $my = new My();

        $c = new Config();
        $host = $c->getNasHost();
        $path = $c->getNasFolder();
        $images_url = "http://$host/$path";
        $t->Set("images_url", $images_url);
        $t->Show("cabecera_emision");

        $dbd = new My();
        $db->Query($sql);

        while ($db->NextRecord()) {
            $nro_orden = $db->Record['nro_orden'];
            $cliente = $db->Record['cliente'];
            $usuario = $db->Record['usuario'];
            $fecha = $db->Record['fecha'];
            $nro_emis = $db->Record['nro_emis'];
            $obs = $db->Record['obs'];
            $asignado_a = $db->Record['asignado_a'];

            $asign = "";
            if ($asignado_a === "") {
                if ($permiso !== "---") {
                    $asign = '<img src="img/addperson.png" class="add_person" width="26" onclick="asignarOperario(' . $nro_orden . ')" >';
                }
            } else {
                $ip = $_SERVER['SERVER_ADDR'];
                $foto = "../img/usuarios/$asignado_a.jpg";
                $foto_x = "inmopy/img/usuarios/$asignado_a.jpg";
                if (file_exists($foto)) {
                    $asign = "<span>$asignado_a</span> <span  class='avatar' style='background-image: url(http://$ip://$foto_x); display: inline-block;;margin-top:-10px' onclick='asignarOperario($nro_orden)'></span>";
                } else {
                    $asign = "<span>$asignado_a</span>";
                }
            }
            

            if ($nro_emis == null) {
                $nro_emis = "";
            }
            $t->Set("nro_orden", $nro_orden);
            $t->Set("nro_emis", $nro_emis);
            $t->Set("cliente", $cliente);
            $t->Set("usuario", $usuario);
            $t->Set("fecha", $fecha);
            $t->Set("obs", $obs);
            $t->Set("usuarios", $users);
            
            $t->Show("area_emision");

            $t->Show("emision_cab");
            
            $t->Set("asign", $asign);   
            
            $dbd->Query("SELECT e.id_det, e.codigo,e.descrip,design,cantidad,largo, a.produc_ancho, a.produc_alto, a.produc_largo  FROM orden_det e, articulos a WHERE e.codigo = a.codigo AND  nro_orden = $nro_orden ");
            while ($dbd->NextRecord()) {
                $id_det = $dbd->Record['id_det'];
                $codigo = $dbd->Record['codigo'];
                $descrip = $dbd->Record['descrip'];
                $design = $dbd->Record['design'];
                $cantidad = $dbd->Record['cantidad'];
                //$largo = $dbd->Record['largo'];
                $produc_largo = $dbd->Record['produc_largo'];
                $produc_ancho = $dbd->Record['produc_ancho'];
                $produc_alto = $dbd->Record['produc_alto'];

                $medida = "$produc_largo x $produc_ancho x  $produc_alto";


                $img_path = "$images_url/$design.thum.jpg";

                $t->Set("id_det", $id_det);
                $t->Set("codigo", $codigo);
                $t->Set("descrip", $descrip);
                $t->Set("design", $img_path);
                $t->Set("img", $design);
                $t->Set("cantidad", number_format($cantidad, 0, ',', '.'));
                $t->Set("medida", $medida);

                $cantidad_requerida = 0;
                $rendimiento = 1;

                // Verifico si tiene asignado codigo de referencia de materia Prima
                $my->Query("SELECT articulo,cantidad as cantidad_requerida,rendimiento FROM lista_materiales WHERE codigo = '$codigo' AND ref = 'true' ");
                if ($my->NumRows() > 0) {
                    $my->NextRecord();
                    $cantidad_requerida = $my->Get('cantidad_requerida');
                    $rendimiento = $my->Get('rendimiento');

                    $t->Set("display", '');
                    $t->Set("mensaje", '');
                } else {
                    $t->Set("display", 'display:none');
                    $t->Set("mensaje", 'Codigo de Referencia de Mat. Prima no Asignado');
                }
                $calc_mts = $cantidad * $cantidad_requerida;

                $t->Set("mts", number_format($calc_mts, 0, ',', '.')); 
                
                $t->Set("tipo_design", $design);
 
                $t->Set("anchor", number_format($produc_ancho, 2, '.', ','));
                
                $t->Show("emision_det");
            }

            $t->Show("emision_foot");
        }
        

        $db->Close();
        require_once("../utils/NumPad.class.php");
        new NumPad();
    }

}

function agregarCorteOtraMedida() {
    $codigo_ref = $_REQUEST['codigo_ref'];
    $nro_orden = $_REQUEST['nro_orden'];
    $nro_emision = $_REQUEST['nro_emision'];
    $id_det = $_REQUEST['id_det'];
    $codigo = $_REQUEST['codigo'];
    $lote = $_REQUEST['lote'];
    $usuario = $_REQUEST['usuario'];
    $largo = $_REQUEST['largo'];
    $suc = $_REQUEST['suc'];
    $medida_consumo = $_REQUEST['medida_consumo'];
    
    $db = new My();
    $my = new My();
     
    $db->Query("SELECT costo_prom FROM articulos WHERE codigo ='$codigo'");
    $db->NextRecord();
    $precio_costo = $db->Record['costo_prom'];
     
    $arr_datos = getAnchoGramajeTara($codigo, $lote,$suc);   
    $stock = $arr_datos['stock'];
    $gramaje = $arr_datos['gramaje'];
    $ancho = $arr_datos['ancho'];
    $tara = $arr_datos['tara'];             
    $tipo_ent = $arr_datos['tipo_ent'];
    $nro_identif = $arr_datos['nro_identif'];
    $linea = $arr_datos['linea']; 
    
    
    $db->Query("SELECT IF(MAX(linea) IS NULL,0,MAX(linea)) AS linea  FROM emis_det WHERE nro_emis  = $nro_emision");
    $db->NextRecord();
    $linea_emis = $db->Record['linea'];
    $linea_emis++;

    $db->Query("SELECT descrip,color,design,um  FROM emis_det WHERE nro_emis  = $nro_emision and codigo = '$codigo' and lote = '$lote'");
    $db->NextRecord();
    $descrip = $db->Record['descrip'];
    $color = $db->Record['color'];
    $design_emis = $db->Record['design'];
    $um = $db->Record['um'];
    
    

    // Disminuir el codigo padre o la materia prima primero
    $final = $stock  - $largo;
    $valor_fraccion = $precio_costo * $largo;
    
    $my->Query("insert into fraccionamientos( usuario, codigo, lote, tipo, signo, inicial, cantidad, final, um, p_costo, motivo, fecha, tara, kg_desc, gramaje, hora, estado, valor, suc,suc_destino,presentacion, padre,ancho, e_sap,cta_cont)
    values ('$usuario', '$codigo', '$lote', 'Salida', '-', $stock, $largo, $final, '$um', $precio_costo, 'Fracccionamiento en Fabrica Saldo Materia Prima', CURRENT_DATE, 0, null, $gramaje, CURRENT_TIME, 'Pendiente',$valor_fraccion, '$suc','$suc',null,null,$ancho, 0,'1.1.3.1.05');");

    $id_frac_neg = getIdFraccionamiento($codigo,$lote,$usuario);
  
    $my->Query("UPDATE stock SET cantidad = cantidad - $largo  WHERE  codigo ='$codigo' and lote ='$lote' and suc = '$suc' and nro_identif = $nro_identif; ");

    $my->Query("INSERT INTO historial( suc, codigo, lote, tipo_ent, nro_identif, linea, fecha_hora, usuario, direccion, cantidad,tipo_doc,nro_doc,ancho,gramaje,tara)
    VALUES (  '$suc', '$codigo', '$lote', '$tipo_ent', $nro_identif, $linea, current_timestamp, '$usuario', 'S', -$largo,'FR',$id_frac_neg,$ancho,$gramaje,$tara);");

        
    $fn = new Functions();
  
    $terminacion = substr($lote,-2,2);
    $nuevo_lote = $fn->generarLote($codigo,$terminacion);


    $ins = "INSERT INTO emis_det(nro_emis, nro_orden, id_det,linea, codigo_ref, codigo, lote, descrip, color, design, cant_lote, usuario, cant_frac, largo,   saldo,multiplicador,  fecha, hora, precio_costo, um,fila_orig,ref)
    VALUES ($nro_emision, $nro_orden ,$id_det, $linea_emis, '$codigo_ref', '$codigo', '$nuevo_lote', '$descrip', '$color', '$design_emis', 1, '$usuario',1, $largo,0,1,CURRENT_DATE, CURRENT_TIME,$precio_costo, '$um',0,'$lote');";
    $db->Query($ins);
      // Dar entrada a los nuevos lotes como materia prima
                
     
    $my->Query("insert into fraccionamientos( usuario, codigo, lote, tipo, signo, inicial, cantidad, final, um, p_costo, motivo, fecha, tara, kg_desc, gramaje, hora, estado, valor, suc,suc_destino,presentacion, padre,ancho, e_sap,cta_cont)
    values ('$usuario', '$codigo', '$nuevo_lote', 'Salida', '+', 0, $largo, $largo, '$um', $precio_costo, 'Fracccionamiento en Fabrica Saldo Materia Prima', CURRENT_DATE, 0, null, "
    . "$gramaje, CURRENT_TIME, 'Pendiente',$valor_fraccion, '$suc','$suc',null,null,$ancho, 0,'1.1.3.1.05');");

    $id_frac_pos = getIdFraccionamiento($codigo,$lote,$usuario);
    $cod_serie = substr($lote,-2);
    $kg_ent_calc = ($gramaje * $largo * $ancho) / 1000;

    $datos_padre = getDatosPadre($codigo,$lote);
    $pantone = $datos_padre['pantone'];
    $color_comb = $datos_padre['color_comb'];
    $color_cod_fabric = $datos_padre['color_cod_fabric'];
    $design = $datos_padre['design'];
    $img = $datos_padre['img']; 

    $my->Query("INSERT INTO lotes(codigo, lote, cod_serie, pantone, umc, um_prod, nro_lote_fab, store, bag, nro_pieza, ancho, gramaje, gramaje_m, tara, kg_desc, quty_ticket, quty_c_um, color_comb, color_cod_fabric, design, cod_catalogo, notas, img, padre, rec, fecha_creacion, id_ent, id_det, id_frac, id_prod_ter)
    VALUES ('$codigo', '$nuevo_lote', '$cod_serie', '$pantone', '$um', '$um', '0', '0', 0,  1 , $ancho, $gramaje, $gramaje, 0, $kg_ent_calc, $largo,  $largo, '$color_comb', '$color_cod_fabric', '$design', 'cod_catalogo', 'Fracccionamiento en Fabrica Saldo Materia Prima', '$img', '$lote', 'Si', current_timestamp, null, null, $id_frac_pos, null);");


    $my->Query("INSERT INTO stock(suc, codigo, lote, tipo_ent, nro_identif, linea, cant_ent, kg_ent, cantidad, ubicacion, estado_venta)
    VALUES ('$suc', '$codigo', '$nuevo_lote', 'FR', $id_frac_pos, 1, $largo, $kg_ent_calc, $largo, '', 'Normal');");

    $my->Query("INSERT INTO historial( suc, codigo, lote, tipo_ent, nro_identif, linea, fecha_hora, usuario, direccion, cantidad,tipo_doc,nro_doc,ancho,gramaje,tara)
    VALUES (  '$suc', '$codigo', '$nuevo_lote', 'FR', $id_frac_pos,1, current_timestamp, '$usuario', 'E',  $largo,'FR',$id_frac_pos,$ancho,$gramaje,$tara);");
    
     echo json_encode(array("mensaje"=>"Ok","nuevo_lote"=>$nuevo_lote));
}

 

function generarProductoTerminado(){
    require_once("../Functions.class.php");
    
    $nro_emision = $_REQUEST['nro_emision'];
    $nro_orden = $_REQUEST['nro_orden'];
    $id_det = $_REQUEST['id_det'];
    $suc = $_REQUEST['suc'];
    $codigo_ref = $_REQUEST['codigo_ref'];
    
    $det = "SELECT linea,d.codigo_ref,d.codigo,lote,cant_lote,usuario,d.ref,cant_frac,largo,descontar,saldo,precio_costo,d.um,d.ref, l.ref AS is_ref
    FROM lista_materiales l , emis_det d WHERE l.articulo = d.codigo AND d.nro_emis = $nro_emision   AND nro_orden = $nro_orden AND id_det = $id_det AND l.codigo = '$codigo_ref' AND d.ref IS NULL";
    $db = new My();
    $my = new My();
    $db->Query($det);
    
   
    $Z_prod_term = 0;
    if($db->NumRows()  >0){
        $pieza = 0; 
        while($db->NextRecord()){
            //$linea_orden = $db->Get("linea");
            $codigo_ref = $db->Get("codigo_ref");
            $codigo = $db->Get("codigo");
            $lote = $db->Get("lote");
             
            //$cant_lote = $db->Get("cant_lote");
            $usuario = $db->Get("usuario");
            $is_ref = $db->Get("is_ref");
            $cant_frac = $db->Get("cant_frac");
            $largo = $db->Get("largo");
            $descontar = $db->Get("descontar");
            $saldo = $db->Get("saldo");
            $precio_costo = $db->Get("precio_costo");
            $um = $db->Get("um");

            
            $arr_datos = getAnchoGramajeTara($codigo, $lote,$suc);
            $gramaje = $arr_datos['gramaje'];
            $ancho = $arr_datos['ancho'];
            $tara = $arr_datos['tara'];
            $stock = $arr_datos['stock'];
            $tipo_ent = $arr_datos['tipo_ent'];
            $nro_identif = $arr_datos['nro_identif'];
            $linea = $arr_datos['linea'];
               
          
  
                
            if($is_ref === "true"){ // Insumos no ajustar la diferencia

                $Z_prod_term += 0+$cant_frac; // Solo sumar si no es insumos

                if($saldo > 0){ // Ajuste negativo para que al final quede en 0
                    $signo = "-";
                    $valor_ajuste = $precio_costo * $saldo;
                    $final = $stock - $saldo;
                    $my->Query("INSERT INTO ajustes( usuario,f_nro, codigo, lote, tipo,signo, inicial, ajuste, final, motivo, fecha, hora, um, estado,suc,p_costo,valor_ajuste)
                    VALUES ('$usuario',0, '$codigo', '$lote', '$usuario','$signo',$stock,$saldo, $final, 'Diferencia en Fabrica', CURRENT_DATE, CURRENT_TIME, '$um', 'Pendiente','$suc',$precio_costo,$valor_ajuste);");
                    $id_ajuste = getIdajuste($usuario,$codigo,$lote)['id_ajuste'];

                    //echo "id ajuste = $id_ajuste"; die();
                    $my->Query("UPDATE stock SET cantidad = cantidad - $saldo WHERE codigo ='$codigo' AND lote = '$lote' AND   suc = '$suc'");                     
                    $my->Query("INSERT INTO historial( suc, codigo, lote, tipo_ent, nro_identif, linea, fecha_hora, usuario, direccion, cantidad,tipo_doc, nro_doc,gramaje,ancho,tara)                        
                    VALUES (  '$suc', '$codigo', '$lote', '$tipo_ent', $nro_identif,$linea, current_timestamp, '$usuario', 'S', $saldo,'AJ',$id_ajuste,$gramaje,$ancho,$tara);");
                }else if ($saldo < 0){ //Ajuste Positivo para que al final quede en 0
                    $signo = "+";
                    $saldo = $saldo * -1; 
                    $valor_ajuste = $precio_costo * $saldo;

                    $final = $stock + $saldo;

                    $my->Query("INSERT INTO ajustes( usuario,f_nro, codigo, lote, tipo,signo, inicial, ajuste, final, motivo, fecha, hora, um, estado,suc,p_costo,valor_ajuste)
                    VALUES ('$usuario',0, '$codigo', '$lote', '$usuario','$signo',$stock,$saldo, $final, 'Diferencia en Fabrica', CURRENT_DATE, CURRENT_TIME, '$um', 'Pendiente','$suc',$precio_costo,$valor_ajuste);");
                    $id_ajuste = getIdajuste($usuario,$codigo,$lote)['id_ajuste'];

                    //echo "id ajuste = $id_ajuste"; die();

                    $my->Query("UPDATE stock SET cantidad = cantidad + $saldo WHERE codigo ='$codigo' AND lote = '$lote' AND   suc = '$suc'");

                    $my->Query("INSERT INTO historial( suc, codigo, lote, tipo_ent, nro_identif, linea, fecha_hora, usuario, direccion, cantidad,tipo_doc, nro_doc,gramaje,ancho,tara)                        
                    VALUES (  '$suc', '$codigo', '$lote', '$tipo_ent', $nro_identif,$linea, current_timestamp, '$usuario', 'E', $saldo,'AJ',$id_ajuste,$gramaje,$ancho,$tara);");
                }   
            }
            // Desconar Materia Prima

            $arr_datos = getAnchoGramajeTara($codigo, $lote,$suc);  

            $stock = $arr_datos['stock'];
            /*$gramaje = $arr_datos['gramaje'];  
            $ancho = $arr_datos['ancho'];
            $tara = $arr_datos['tara'];             
            $tipo_ent = $arr_datos['tipo_ent'];
            $nro_identif = $arr_datos['nro_identif'];
            $linea = $arr_datos['linea'];*/

            $final = $stock - $descontar;
            $valor_fraccion = $precio_costo * $descontar;



            $my->Query("insert into fraccionamientos( usuario, codigo, lote, tipo, signo, inicial, cantidad, final, um, p_costo, motivo, fecha, tara, kg_desc, gramaje, hora, estado, valor, suc,suc_destino,presentacion, padre,ancho, e_sap,cta_cont)
            values ('$usuario', '$codigo', '$lote', 'Salida', '-', $stock, $descontar, $final, '$um', $precio_costo, 'Fracccionamiento en Fabrica', CURRENT_DATE, 0, null, "
            . "$gramaje, CURRENT_TIME, 'Pendiente',$valor_fraccion, '$suc','$suc',null,null,$ancho, 0,'1.1.3.1.05');");


            $id_frac_neg = getIdFraccionamiento($codigo,$lote,$usuario);

            $my->Query("UPDATE stock SET cantidad = cantidad - $descontar  WHERE  codigo ='$codigo' and lote ='$lote' and suc = '$suc' and nro_identif = $nro_identif; ");    

            $my->Query("INSERT INTO historial( suc, codigo, lote, tipo_ent, nro_identif, linea, fecha_hora, usuario, direccion, cantidad,tipo_doc,nro_doc,ancho,gramaje,tara)
            VALUES (  '$suc', '$codigo', '$lote', '$tipo_ent', $nro_identif,$linea, current_timestamp, '$usuario', 'S', -$descontar,'FR',$id_frac_neg,$ancho,$gramaje,$tara);");

            //$my->Commit();                

            
   
        }
        // Producto Terminado TXxx
        $fn = new Functions();
        $lote_prod_ter = $fn->generarLote($codigo_ref);
        
        //$db->autocommit(FALSE);
        //$db->Begin();
        
        $db->Query("INSERT INTO  prod_terminado(  nro_emis, nro_orden, id_det, codigo, lote, descrip, color, design, cant_frac, usuario, fecha)
                VALUES (  $nro_emision, $nro_orden, $id_det, '$codigo_ref', '$lote_prod_ter', '', '', '',  $Z_prod_term , '$usuario', current_date);");
        
        $db->Query("SELECT id_res FROM prod_terminado where codigo = '$codigo_ref' and lote = '$lote_prod_ter' and usuario = '$usuario' order by id_res desc limit 1;");
        $db->NextRecord();
        $id_prod_ter = $db->Get("id_res");
        
        $db->Query("update orden_det set id_prod_ter = $id_prod_ter where nro_orden = $nro_orden and id_det = $id_det;");
        
        
        $cod_serie = substr($lote_prod_ter,-2);
        
        $datos_art =  $fn->getResultArray("SELECT um,ancho,a.gramaje_prom AS gramaje,d.design FROM articulos a, orden_det d WHERE a.codigo = d.codigo AND  a.codigo = '$codigo_ref' AND d.nro_orden = $nro_orden AND d.id_det = $id_det")[0]; 
        $um = $datos_art['um'];
        $ancho = $datos_art['ancho'];
        $gramaje = $datos_art['gramaje'];
        $design = $datos_art['design'];
        
        
        $kg_desc = ($gramaje * $Z_prod_term *  $ancho) / 1000;
        $ins_lotes_sql = "INSERT IGNORE INTO lotes(codigo, lote, cod_serie, pantone, umc, um_prod, nro_lote_fab, store, bag, nro_pieza, ancho, gramaje, gramaje_m, tara, kg_desc, quty_ticket, quty_c_um, color_comb, color_cod_fabric, design, cod_catalogo, notas, img, padre, rec, fecha_creacion, id_ent, id_det, id_frac, id_prod_ter)
        VALUES ('$codigo_ref', '$lote_prod_ter', '$cod_serie', '00-0000', '$um', '$um', $id_prod_ter,1, 1, 1, $ancho ,  $gramaje ,  $gramaje ,  0 ,  $kg_desc ,  $Z_prod_term ,  $Z_prod_term , 'N/A', 'N/A', '$design', 'N/A', 'Fabrica Nro $id_prod_ter', '$design', '', 'Si', CURRENT_TIMESTAMP, null, null, null, $id_prod_ter);"; 
        $db->Query($ins_lotes_sql);
        $tara = 0;
        // Registrar Stock del Nuevo Lote
        $db->Query("INSERT INTO stock(suc, codigo, lote, tipo_ent, nro_identif, linea, cant_ent, kg_ent, cantidad, ubicacion, estado_venta)
        VALUES ('$suc', '$codigo_ref', '$lote_prod_ter', 'PT',  $id_prod_ter, 1, $Z_prod_term, null, $Z_prod_term, '', 'Normal');");

        $db->Query("INSERT INTO historial( suc, codigo, lote, tipo_ent, nro_identif, linea, fecha_hora, usuario, direccion, cantidad,tipo_doc,nro_doc,ancho,gramaje,tara)
        VALUES (  '$suc', '$codigo_ref', '$lote_prod_ter', 'PT', $id_prod_ter,1, current_timestamp, '$usuario', 'E', $Z_prod_term,'PT',$id_prod_ter,$ancho,$gramaje,$tara);");
    
        // Actualizar descrip, design, color en producto_terminado
        
        $db->Query("UPDATE prod_terminado p, articulos a, lotes l, pantone c SET p.descrip = a.descrip , p.design = l.img, p.color = c.nombre_color
        WHERE p.codigo = a.codigo AND l.lote = p.lote AND l.codigo = p.codigo AND l.pantone = c.pantone AND nro_orden = $nro_orden AND nro_emis = $nro_emision;");
        
        //$db->Commit();
        
        echo json_encode(array("estado"=>"Ok","mensaje"=>"Ok","id_prod_ter"=>$id_prod_ter));
    }else{
        echo json_encode(array("estado"=>"error","mensaje"=>"No hay registros"));
    }
    
}

function getSaldosYProductoTerminado(){
    $nro_emision = $_REQUEST['nro_emision'];
    require_once("../Functions.class.php");
    $fn = new Functions();   
    $sql = "SELECT  'PoductoTerminado' AS tipo, codigo,lote, cant_frac AS cant, '' AS lote_ref FROM prod_terminado WHERE nro_emis = $nro_emision UNION
    SELECT 'Saldo' AS tipo, codigo,lote, largo AS cant, ref AS lote_ref FROM emis_det WHERE nro_emis = $nro_emision AND ref IS NOT NULL";
    echo json_encode($fn->getResultArray($sql));
}

function getIdFraccionamiento($codigo,$lote,$usuario){
    require_once("../Functions.class.php");
    $fn = new Functions();    
    $sql = "SELECT id_frac FROM fraccionamientos where codigo = '$codigo' and lote = '$lote' and usuario = '$usuario' order by id_frac desc limit 1;";
    $arr = $fn->getResultArray($sql)[0];             
    $id_frac = $arr['id_frac'];
    return $id_frac;             
}

function getIdajuste($usuario,$codigo,$lote){
    require_once("../Functions.class.php");
    $fn = new Functions();    
    $sql = "SELECT id_ajuste FROM ajustes WHERE usuario = '$usuario' AND codigo = '$codigo' AND lote = '$lote' ORDER BY id_ajuste DESC LIMIT 1";
    return $fn->getResultArray($sql)[0];
}
function getAnchoGramajeTara($codigo, $lote,$suc) {
    require_once("../Functions.class.php");
    $fn = new Functions();        
    $sql = "SELECT gramaje, ancho,tara,s.cantidad AS stock, tipo_ent,nro_identif,linea  FROM lotes l, stock s WHERE l.codigo = s.codigo AND l.lote = s.lote AND    l.codigo ='$codigo' AND l.lote = '$lote' AND suc = '$suc' LIMIT 1";
    return $fn->getResultArray($sql)[0];
}
function getDatosPadre($codigo,$lote){
    require_once("../Functions.class.php");
    $fn = new Functions();        
    $sql = "SELECT pantone,design,img,cod_catalogo,color_cod_fabric,color_comb   FROM lotes l where codigo ='$codigo' AND l.lote = '$lote'  LIMIT 1";
    return $fn->getResultArray($sql)[0];
}

function agregarCortes() {
    require_once("../Functions.class.php");
    $fn = new Functions();    
    
    $nro_emision = $_REQUEST['nro_emision'];
    $nro_orden = $_REQUEST['nro_orden'];
    $id_det = $_REQUEST['id_det'];
    $codigo = $_REQUEST['codigo'];
    $lote = $_REQUEST['lote'];
    $usuario = $_REQUEST['usuario'];
    $cortes = $_REQUEST['cortes'];
    $cantidad_descontar = $_REQUEST['cantidad_descontar'];
    $medida = $_REQUEST['medida'];
    $is_ref  = $_REQUEST['is_ref'];
    
     
    $ajuste = $_REQUEST['ajuste'];
     
    $suc = $_REQUEST['suc'];
    $stock = $_REQUEST['stock'];
    $codigo_ref = $_REQUEST['codigo_ref'];
    $um = 'Mts'; //Siempre es metros
 
    
    $db = new My();
    $sql = "UPDATE emis_det SET cant_frac = $cortes, largo = $medida,usuario = '$usuario',fecha = CURRENT_DATE,hora = CURRENT_TIME ,saldo = $ajuste,descontar = $cantidad_descontar  WHERE  nro_emis = $nro_emision AND  lote = '$lote' and codigo_ref = '$codigo_ref' and fila_orig = 1;";
    $db->Query($sql);
 
    echo json_encode(array("estado" => "Ok"));
}

// Solo para Retazos menores a 3 metros
function setPrecioRetazo() {

}

function genAsiento($usuario, $cuenta1, $cuenta1SN, $cuenta2, $cuenta2SN, $valor, $descrip) {
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

function finalizarEmision() {
     
    $nro_emision = $_REQUEST['nro_emision'];
    $usuario = $_REQUEST['usuario'];
    $db = new My();
    $db->Query("update emis_produc set estado = 'Cerrada',fecha_cierre = current_date, hora_cierre = current_time  where nro_emis = $nro_emision;");
    echo json_encode(array("mensaje"=>"Ok")); 
}

function reciboProduccionUI() {
    $t = new Y_Template("Fabrica.html");
    $t->Show("headers");
    $t->Show("recibo_produccion_ui");
}

function buscarDatosDeOrden() {
    $nro_emision = $_REQUEST['nro_emision'];
    $sql = "SELECT o.nro_orden,cod_cli,cliente,o.usuario,DATE_FORMAT(o.fecha,'%d-%m-%Y') AS fecha FROM orden_fabric o, emis_produc p WHERE o.nro_orden = p.nro_orden AND p.nro_emis = $nro_emision";
    $db = new My();
    $db->Query($sql);
    $array = array();

    while ($db->NextRecord()) {
        array_push($array, $db->Record);
    }
    $db->Close();

    echo json_encode($array);
}

function planillaProduccion() {
    $nro_emision = $_REQUEST['nro_emision'];
    $sql = "SELECT id_res,codigo,lote,descrip,color,design,cant_frac AS unidades,usuario,DATE_FORMAT(fecha,'%d-%m-%Y %h:%i') AS fecha FROM prod_terminado WHERE nro_emis = $nro_emision";
    $db = new My();
    $db->Query($sql);
    $array = array();

    while ($db->NextRecord()) {
        array_push($array, $db->Record);
    }
    $db->Close();

    echo json_encode($array);
}

function imprimirCodigo() {
    $codigo = $_REQUEST['codigo'];
    $medida = $_REQUEST['metros'];
    $usuario = $_REQUEST['usuario'];
    $printer = $_REQUEST['printer'];
    $silent_print = $_REQUEST['silent_print'];
 
    $t = new Y_Template("Fabrica.html");
  
    $t->Set("codigo", $codigo);
    
    $t->Set("medidas", "" . $medida . "");
    $t->Set("usuario", $usuario);


     
    $marginTop = 0;
    $marginBottom = 0;
    $marginLeft = 0;
    $marginRight = 0;
    $scaling = 0;


    //$t->Set("printer",$printer);
    $t->Set("silent_print", false);
     

    $etiqueta = "etiqueta_6x4";
    $tam = "6x4";
    if (isset($_REQUEST['etiqueta'])) {
        $etiqueta = $_REQUEST['etiqueta'];
        $tam = substr($etiqueta, 9, 30);
    }
    $t->Set("tam", $tam);
    
    $ip = $_SERVER['REMOTE_ADDR'];   
    $t->Set("ip", $ip);
    
    $clave = "etiqueta_6x4_cuidados_$ip";
    $margin = getMargins($clave);
    $margen = "style='margin:$margin;'";
    $t->Set("margin", $margen);
     
    
    $t->Set("marginTop", $marginTop);
    $t->Set("marginBottom", $marginBottom);
    $t->Set("marginLeft", $marginLeft);
    $t->Set("marginRight", $marginRight);
    $t->Set("scaling", $scaling);

    /*
    $my = new My();
    $my->Query("SELECT suc FROM usuarios WHERE usuario = '$usuario'");
    $my->NextRecord();
    $suc_user = $my->Record['suc'];*/

    $t->Show("barcode_headers");
    $t->Show($etiqueta);
}

function getMargins($clave){
    $db = new My();
    $db->Query("select valor from parametros where clave = '$clave'");
    if($db->NumRows()>0){
        $db->NextRecord();
        return $db->Get("valor");
    }else{
        return "0";
    }
}

function makeLog($usuario, $accion, $data, $tipo, $doc_num) {
    $db = new My();
    $db->Query("INSERT INTO logs(usuario, fecha, hora, accion,tipo,doc_num, DATA) VALUES ('$usuario', current_date, current_time, '$accion','$tipo', '$doc_num', '$data');");
    return true;
}

function getOS() {
    $agent = $_SERVER['HTTP_USER_AGENT'];
    if (preg_match('/Linux/', $agent))
        $os = 'Linux';
    elseif (preg_match('/Win/', $agent))
        $os = 'Windows';
    elseif (preg_match('/Mac/', $agent))
        $os = 'Mac';
    else
        $os = 'UnKnown';
    return $os;
}

function corregirDescripcionesProdTerminado() {
    $db = new My();
    $dbd = new My();

    $db->Query("select distinct codigo,descrip from prod_terminado");
    while ($db->NextRecord()) {
        $c = $db->Record['codigo'];
        $d = $db->Record['descrip'];
        $nd = getDescripProductoTerminado($c);
        $sq = "UPDATE prod_terminado SET descrip = '$nd' WHERE  codigo = '$c'";
        $dbd->Query($sq);
        echo $c . " " . $d . "   --> $nd <br>";
    }
}

function buscarMedida() {
     
    $codigo_fabricar = $_REQUEST['articulo_fabricar'];
    $codigo_mat_prima = $_REQUEST['codigo_mat_prima'];
    $sql = "SELECT cantidad,rendimiento,um,ref FROM lista_materiales WHERE codigo = '$codigo_fabricar' AND articulo = '$codigo_mat_prima'";
    
    require_once("../Functions.class.php");
    $f = new Functions(); 
    echo json_encode($f->getResultArray($sql));
}


function buscarArticulosOtraMedida() {
    $codigo_mat_prima = $_POST['codigo_mat_prima'];   
    $articulo_fabricar  = $_POST['articulo_fabricar'];   
    require_once("../Functions.class.php");
    $fn = new Functions();
     
    $articulos = $fn->getResultArray("SELECT a.codigo, s.descrip AS sector, a.descrip  , a.produc_ancho, a.produc_alto, a.produc_largo , l.precio ,a.um, a.gramaje_prom , a.costo_prom AS precio_costo , a.composicion, a.especificaciones 
    FROM articulos a, sectores s,  lista_prec_x_art l  WHERE a.cod_sector = s.cod_sector AND a.codigo = l.codigo AND l.num = 1 AND l.moneda ='G$'  AND  clase = 'Fabricado'  AND a.estado = 'Activo' and a.codigo <> '$articulo_fabricar'
    AND EXISTS (SELECT * FROM lista_materiales lm WHERE a.codigo = lm.codigo AND lm.articulo = '$codigo_mat_prima' ) 
    ORDER BY a.descrip ASC LIMIT 30");   
    echo json_encode($articulos);
 
  
}

new Fabrica();
?>



