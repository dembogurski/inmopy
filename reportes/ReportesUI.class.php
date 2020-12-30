<?php

/**
 * Description of Reportes
 * @author Ing.Douglas
 * @date 02/03/2017
 */

require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");


$proto = "http";
if(isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == "on") { 
    $proto = "https";
} 
 
define('path',"$proto://".$_SERVER['SERVER_NAME'].":".$_SERVER['SERVER_PORT']."/inmopy"); 
 

class ReportesUI {
    
   function __construct() {
        $action = $_REQUEST['action']; 
        if (function_exists($action)) {            
            call_user_func($action);
        } else {            
            $this->main();
        }
    }
    function main() {
        $t = new Y_Template("ReportesUI.html");
        $t->Show("header");
        $t->Show("filters");
         
        // Clases posibles:   ventas caja empaque funcionarios    gerencia rrhh stock administracion 
            
        //Ejemplo nomas borrar despues
        createReportButton("10.2", $t, "Controles Fuera Rango", "empaque gerencia administracion");

        // Reporte de Facturas Legales Star Soft
        createReportButton("10.1", $t, "Facturas Star Soft", "administracion");                
        createReportButton("10.3", $t, "Mis Ventas", "ventas");        
        createReportButton("10.4", $t, "Ventas de Vendedores", "ventas gerencia administracion");
        createReportButton("10.6", $t, "Ventas a Clientes", "ventas gerencia administracion");
        createReportButton("10.7", $t, "Documentos Contables", "gerencia administracion");
        createReportButton("10.8", $t, "Cheques Terceros", "gerencia administracion");
        createReportButton("10.36", $t, "Cheques Terceros Caja", "caja administracion");
        createReportButton("10.11", $t, "Saldos de Cajas Anteriores", "gerencia administracion");
        createReportButton("10.12", $t, "Calculo de Variable", "gerencia administracion rrhh");
        createReportButton("10.13", $t, "Movimientos De Cuenta Banco", "gerencia");
        createReportButton("10.14", $t, "Tracking de Pedidos", "ventas gerencia logistica");
        createReportButton("10.15", $t, "Remisiones", "empaque remision");
        createReportButton("10.16", $t, "Finalizaciones de Pieza", "rrhh gerencia");
        createReportButton("10.17", $t, "Ventas por Sector y Articulo", "venta");
        createReportButton("10.18", $t, "Stock por Sector y Articulo", "stock");
        createReportButton("10.19", $t, "Prorrateo de Gastos", "administracion");
        createReportButton("10.20", $t, "Planilla Ordenes de Compra", "administracion gerencia");
        createReportButton("10.21", $t, "Gestion de Cobranzas", "administracion gerencia");
        createReportButton("10.22", $t, "Reporte de Fraccionamiento", "administracion gerencia logistica");
        createReportButton("10.23", $t, "Reporte de Notas de Credito", "administracion gerencia nota credito ventas");
        createReportButton("10.24", $t, "Fabricacion de Productos Terminados", "logistica gerencia produccion");
        createReportButton("10.25", $t, "Comparativo de Ventas", "ventas gerencia administracion");         
        createReportButton("10.26", $t, "Stock actual y Movimiento", "ventas gerencia administracion"); 
        createReportButton("10.27", $t, "Historico de Stock y Ventas", "ventas gerencia administracion");  
        createReportButton("10.28", $t, "Ordenes de Fabricacion", "ventas gerencia administracion stock"); 
        createReportButton("10.29", $t, "Stock Proveedor", "stock logistica gerencia"); 
        createReportButton("10.30", $t, "Codificacion Pantone (En Deshuso)", "stock articulo color pantone");
        createReportButton("10.31", $t, "Reporte de Reposicion", "stock gerencia");
        createReportButton("10.32", $t, "Reporte de Logistica", "logistica stock");
        createReportButton("10.33", $t, "Panel de Turnos", "gerencia administracion");
        createReportButton("10.34", $t, "Fraccionamientos por Compra", "logistica gerencia");
        createReportButton("10.35", $t, "Inventario", "stock");
        
         
        $t->Show("footer");
    }
}
/** Macros */
function getResultArray($sql) {
    $db = new My();
    $array = array();
    $db->Query($sql);
    while ($db->NextRecord()) {
        array_push($array, $db->Record);
    }
    $db->Close();
    return $array;
}
 
function getUsuarios(){
    $suc = $_REQUEST['suc']; 
    $usuario = $_REQUEST['usuario']; 
    $my = new My();
    $sql = "SELECT usuario,nombre,apellido,tel,doc,imagen,suc FROM usuarios WHERE suc LIKE '$suc' AND (usuario LIKE '$usuario%' OR nombre LIKE '$usuario%')";         
    echo json_encode(getResultArray($sql));
}

function getCli(){
    $suc = $_REQUEST['suc']; 
    $search = $_REQUEST['search'];
    $filtroFecha = '';
    if(isset($_REQUEST["desde"]) && isset($_REQUEST["desde"])){
        $desde = $_REQUEST["desde"];
        $hasta = $_REQUEST["hasta"];
        $filtroFecha = " AND fecha_cierre BETWEEN '$desde' AND '$hasta'";
    }
    
    $my = new My();
    $sql = "SELECT f.cod_cli,f.tipo_doc,f.ruc_cli,f.cliente,cod_cli,cat from factura_venta f where f.estado ='Cerrada' and (ruc_cli ='$search' or cliente regexp '$search') $filtroFecha group by f.cod_cli";         
    echo json_encode(getResultArray($sql));
}

function getSucursales($filtro = "",$order_by = "suc asc",$include_all=false,$callback="",$id = 'select_suc'){
    $my = new My();
    $sql = "SELECT suc,nombre FROM sucursales $filtro order by  $order_by";
    $my->Query($sql);

    $sucs = "<select id='$id' $callback>";
    if($include_all){
       $sucs.="<option value='%'>* - Todas</option>"; 
    }
    while ($my->NextRecord()) {
        $suc = $my->Record['suc'];
        $nombre = $my->Record['nombre'];
        $sucs.="<option value=" . $suc . ">" . $suc . " - " . $nombre . "</option>";
    }
    $sucs.="</select>"; 
    return $sucs;
}
function getProveedores($order_by = "nombre ASC",$include_all=false,$callback=""){
    $db = new My();
    $sql = "SELECT cod_prov,nombre FROM proveedores ORDER BY  $order_by";
    $db->Query($sql);

    $proveedores  = "<select id='select_proveedor' $callback>";
    if($include_all){
       $proveedores .="<option value='%'>* - Todas</option>"; 
    }
    while ($db->NextRecord()) {
        $CardCode = $db->Record['cod_prov'];
        $CardName = utf8_encode($db->Record['nombre']);
        $proveedores .="<option value=" . $CardCode . ">$CardName</option>";
    }
    $proveedores .="</select>"; 
    return $proveedores ;
}
// Usuarios en que tienen notas de pedidos en estado Pendiente
function getUserNotaPedido($suc){
    $my = new My();
    $sql = "SELECT u.usuario, CONCAT(u.nombre,' - ',u.apellido) AS np FROM pedido_traslado p INNER JOIN usuarios u USING(usuario) WHERE p.estado = 'Pendiente' AND p.suc = '$suc' GROUP BY u.usuario ORDER BY np ASC";
    $my->Query($sql);

    $usuarios = "<select id='select_user'>";
    $usuarios.="<option value='%'>* - Todos</option>"; 
    
    while ($my->NextRecord()) {
        $usuario = $my->Record['usuario'];
        $np = $my->Record['np'];
        $usuarios.="<option value='$usuario'>$np</option>";
    }
    $usuarios.="</select>"; 
    $my->Close();
    return $usuarios;
}

function canModSuc($user){
    $my = new My();
    $my->Query("SELECT count(*) as permiso from usuarios u inner join usuarios_x_grupo g using(usuario) inner join permisos_x_grupo p using(id_grupo) where u.usuario = '$user' AND  p.id_permiso = '3.8.1'");
    $my->NextRecord();
    
    $permiso = $my->Record['permiso'];
    
    if( $permiso > 0){
        return true;
    }else{
        return false;
    }
    
}
function canModUser($user){
    $my = new My();
    $my->Query("SELECT count(*) as permiso from usuarios u inner join usuarios_x_grupo g using(usuario) inner join permisos_x_grupo p using(id_grupo) where u.usuario = '$user' AND  p.id_permiso = '10.0.1'");
    $my->NextRecord();
    if((int)$my->Record['permiso'] > 0){
        return true;
    }
    return false;
}
function verMargen($usuario){
    $link = new My();
    // 14 Administracion
    $link->Query("SELECT count(*) as ok FROM usuarios_x_grupo WHERE id_grupo=14 AND usuario = '$usuario'");
    $link->NextRecord();
    $ok = (int)$link->Record['ok'];
    $link->Close();

    if($ok>0){            
        return true;
    }else{
        return false;
    }
}
// Lista de Sectores
function getSectores($excludes='',$include_all=false){
    $db = new My();
    $ex ='';
    if(strlen(trim($excludes))>0){
        $ex = " WHERE descrip NOT IN($excludes)";
    }
    $sql = " SELECT cod_sector,descrip FROM sectores $ex ORDER BY descrip asc";
    $db->Query($sql);

    $sectores = "<select id='select_sector' onchange='getArticulos()' >";
    if($include_all){
       $sectores.="<option value='%'>* - Todas</option>"; 
    }
    while ($db->NextRecord()) {
        $cod_sector = $db->Record['cod_sector'];
        $descrip = $db->Record['descrip'];
        $sectores.="<option value= '$cod_sector'>$descrip</option>";
    }
    $sectores.="</select>"; 
    return $sectores;
}
// Lista de articulos por Sector
function getArticulos(){
    $codigo_grupo = $_REQUEST['codigo_grupo'];
    $db = new My();
    $articulos = array();
    $sql = "SELECT codigo,descrip FROM articulos WHERE cod_sector = $codigo_grupo AND estado = 'Activo' order by descrip asc";
    $db->Query($sql);

    while ($db->NextRecord()) {
        $articulos[$db->Record['codigo']]=utf8_encode($db->Record['descrip']);
    }
    echo json_encode($articulos);
}

function getMonedas($filtro="",$include_all=true){
    $my = new My();
    $sql = "SELECT m_cod,m_descri FROM monedas $filtro";
    $my->Query($sql);

    $mon = "<select id='moneda'>";
    if($include_all){
       $mon.="<option value='%'>* - Todas</option>"; 
    }
    while ($my->NextRecord()) {
        $m_cod = $my->Record['m_cod'];
        $m_descri = $my->Record['m_descri'];
        $mon.="<option value=" . $m_cod . ">" . $m_cod . " - " . $m_descri . "</option>";
    }
    $mon.="</select>"; 
    return $mon;
}
// Bancos
function getBancos($attr=''){
    $my = new My();
    $sql = "SELECT id_banco,nombre from bancos order by nombre asc";
    $my->Query($sql);

    $bancos = "<select id='id_banco' $attr >";
    if($include_all){
       $bancos.="<option value='%'>* - Todas</option>"; 
    }
    while ($my->NextRecord()) {
        $id_banco = $my->Record['id_banco'];
        $nombre = $my->Record['nombre'];
        $bancos.="<option value=" . $id_banco . ">" . $id_banco . " - " . $nombre . "</option>";
    }
    $bancos.="</select>"; 
    return $bancos;
}
// Cuentas Bancarias
function getCtasBancarias(){
    $id_banco = $_REQUEST['id_banco']; 
    $my = new My();
    $sql = "select cuenta,m_cod,cta_cont from bcos_ctas where id_banco='$id_banco' order by cuenta*1 asc,m_cod asc";
    echo json_encode(getResultArray($sql));
}
// Usuarios que realizaron Inventario
function inventarioUsuarios(){
    $my = new My();
    $my->Query("SELECT DISTINCT(i.usuario), u.apellido,u.nombre FROM inventario i INNER JOIN usuarios u USING(usuario) ORDER BY u.usuario ASC");
    $usuarios = "<option value='%' style='text-align:center;'>Todos</option>";
    while($my->NextRecord()){
        $inv_usu = $my->Record['usuario'];
        $nombre = utf8_encode($my->Record['nombre']);
        $apellido = utf8_encode($my->Record['apellido']);
        $usuarios .= "<option value='$inv_usu'>$nombre - $apellido</option>";
    }
    return "<select id='inv_usu'>$usuarios</select>";
}
function showHtml($t,$html){
    $t->Set("html",$html);
    $t->Show("html");  
}
function text($id,$value="",$placeholder="",$size=10){
   return "<input  id='$id' type='text' value='$value' size='$size' placeholder='$placeholder'>";    
}
function createSelect($values,$id){
    $s = "<select id='$id' >";
    foreach ($values as $key => $value) {
       if(is_numeric($key)){ // Si no se envia key=>val  toma key como val
          $key = $value;
       }
       $s.="<option value='" . $key . "'>" . $value. "</option>";
    }    
    $s.="</select>"; 
    return $s;
}
function trFechaDesdeHasta($t,$incluir_boton_hoy=true){
   showHtml($t,"<tr>");   
   $t->Set("label_fecha","Desde");
   $t->Set("id_fecha","desde");
   $t->Show("fecha");  
   
   $t->Set("label_fecha","Hasta");
   $t->Set("id_fecha","hasta");
   if($incluir_boton_hoy){
       $t->Set("display_set_now","inline");
   }else{
       $t->Set("display_set_now","none");
   }
   $t->Show("fecha");  
   showHtml($t,"</tr>");
}

function botonGenerarReporte($t){
   showHtml($t,"<tr><td colspan='4' style='text-align:center'>");   
   $t->Set("call_func","sendForm()");
   $t->Set("value","Generar Reporte");
   $t->Show("button");   
   showHtml($t,"</td></tr>");
}
/**End Macros */ 

function createReportButton($perm_id, $template, $name, $clases){
    $usuario = $_POST['usuario'];  
    $db = new My();

    $sql_permiso = "SELECT u.nombre AS usu,ug.usuario,g.nombre,p.id_permiso AS id_permiso,descripcion,trustee 
        FROM  usuarios u,grupos g, usuarios_x_grupo ug, permisos_x_grupo p, permisos pr 
        WHERE u.usuario = ug.usuario AND ug.id_grupo = p.id_grupo AND g.id_grupo = ug.id_grupo AND p.id_permiso = pr.id_permiso  AND ug.usuario = '$usuario'
        AND  p.id_permiso = '$perm_id'";

    $db->Query($sql_permiso);

    if($db->NumRows() > 0){
        $template->Set("classes",$clases);
        $template->Set("nombre",$name);        
        $template->Show("button_factory");
    }        
}

function controles_fuera_rango(){
   $t = new Y_Template("ReportesUI.html");
   //$path = "http://".$_SERVER['SERVER_NAME'].":".$_SERVER['SERVER_PORT']."/inmopy";  
      
   $t->Set("titulo_filtro","Reporte de Controles fuera de Rango, Mal Corte, Falla o Fin de Pieza");
   $t->Set("action",path."/reportes/ControlesFueraRango.class.php"); 
   $t->Show("filter_header");  
    
   trFechaDesdeHasta($t);
      
   $sucursales = getSucursales();
    
   $tipo = createSelect(array("*","M.C.","D.FP.","D.F."),"tipo");
   showHtml($t,"<tr><td>Sucursales:</td><td>$sucursales</td> <td>Tipo:</td><td>$tipo</td></tr>");
   
   $fr = createSelect(array(" > 0 "," <= 0 "),"fuera_rango");
   showHtml($t,"<tr><td>Fuera Rango:</td><td>$fr</td>  </tr>");
   
   botonGenerarReporte($t);   
   
   $t->Show("filter_footer");  
}
function mis_ventas(){
   $t = new Y_Template("ReportesUI.html");
   $t->Set("titulo_filtro","Reporte de Mis Ventas");
   $t->Set("action",path."/reportes/VentasXVendedor.class.php"); 
   $t->Show("filter_header"); 
   $vendedor = $_REQUEST['usuario'];   
   //$suc = $_REQUEST['suc'];   
   showHtml($t,"<tr style='display:none'><td>Vendedor:</td><td><input type='hidden' id='usuario' value='$vendedor' ><input type='hidden' id='select_suc' value='%' ></td></tr>");
   trFechaDesdeHasta($t); 
   $estado = createSelect(array("Cerrada","Abierta"),"estado");
   showHtml($t,"<tr><td>Estado:</td><td>$estado</td>  </tr>");
   botonGenerarReporte($t);    
   $t->Show("filter_footer");      
}
function ventas_de_vendedores(){
   $t = new Y_Template("ReportesUI.html");
   $t->Set("titulo_filtro","Reporte de Ventas de Funcionarios");
   $t->Set("action",path."/reportes/VentasXVendedor.class.php"); 
   $t->Show("filter_header");   
   trFechaDesdeHasta($t);     
   $suc = $_REQUEST['suc'];
   showHtml($t,"<tr><td>Vendedor:</td><td><input type='text' id='buscar_usuario' value='' onchange=buscarUsuariosXSuc('select_suc') size='20'></td><td colspan='2'> <select id='usuario'><option value='%' data-img=''  >Todos</option></select><input type='hidden' id='suc' value='$suc' ></td></tr>");
   $estado = createSelect(array("Cerrada","Abierta"),"estado");
   $usuario = $_REQUEST['usuario'];
   if(canModSuc($usuario)){
        $sucursales = getSucursales(" where tipo != 'Sub-Deposito' ","suc asc",true);
        showHtml($t,"<tr><td>Sucursal:</td><td>$sucursales</td> <td>Estado:</td><td>$estado</td> </tr>");  
   }else{
        $sucursales = "<input type='text' disabled value='$suc' id='select_suc'>";
        showHtml($t,"<tr><td>Sucursal:</td><td>$sucursales</td> <td>Estado:</td><td>$estado</td>  </tr>");  
   } 
   showHtml($t,"<tr><td>Tipo:</td> <td> <label for='detallado'>Detallado </label><input type='radio' name='tipo_rep' id='detallado' checked='checked' >  <label for='agrupado'>Agrupado </label><input type='radio' name='tipo_rep' id='agrupado'>   </td>  </tr>");  

   showHtml($t,"<tr><td colspan='5'>Categorias: <div id='categorias'> <input id='cat_1' type='checkbox' checked/><label for='cat_1'>1</label> <input id='cat_2' type='checkbox' checked/><label for='cat_2'>2</label> <input id='cat_3' type='checkbox' checked/><label for='cat_3'>3</label> <input id='cat_4' type='checkbox' checked/><label for='cat_4'>4</label> <input id='cat_5' type='checkbox' checked/><label for='cat_5'>5</label> <input id='cat_6' type='checkbox' checked/><label for='cat_6'>6</label> <input id='cat_7' type='checkbox' checked/><label for='cat_7'>7</label> </div></td>  </tr>");  
   
   showHtml($t,"<style>div#categorias {display: inline-block;border: dotted 1px black;border-radius: 5px;padding: 2px;}div#categorias input[type='checkbox'] {display: none;}div#categorias input[type='checkbox'] + label {display: inline;background-color: lightblue;border-radius: 3px;padding: 1px 3px;margin: 0;background-color: gray;}div#categorias input[type='checkbox'] + label:hover {cursor: pointer;}div#categorias input[type='checkbox']:checked + label {background-color: green;color: lightblue;}</style>");
   botonGenerarReporte($t);    
   $t->Show("filter_footer");        
}

// Ventas Cliente
function ventas_a_clientes(){
   $t = new Y_Template("ReportesUI.html");
   $t->Set("titulo_filtro","Reporte de Ventas a Clientes");
   $t->Set("action",path."/reportes/VentasXClientes.class.php"); 
   $cats = "";
   for($i = 1; $i < 8; $i++ ){
       $cats .= "<label>$i</label><input id='cat$i' type='checkbox' checked='checked' >&nbsp;&nbsp;";
   }
   
   $t->Show("filter_header");   
   trFechaDesdeHasta($t);     
   $suc = $_REQUEST['suc'];
   $usuario = $_REQUEST['usuario'];
   
   showHtml($t,"<tr><td colspan='4'><div id='ventasCliDatosCli' Style='text-align:center;' ></div></td></tr>");
   if(canModSuc($usuario)){
        $sucursales = getSucursales(" where tipo != 'Sub-Deposito' ","suc asc",true);
        showHtml($t,"<tr><td>Sucursal:</td><td>$sucursales</td> <td>Estado:</td><td>$estado</td> </tr>");  
    }else{
        $sucursales = "<input type='text' disabled value='$suc' id='select_suc'>";
        showHtml($t,"<tr><td>Sucursal:</td><td>$sucursales</td> <td>Estado:</td><td>$estado</td>  </tr>");  
    } 
   showHtml($t,"<tr><td>Cliente:</td><td><input placeholder='RUC-CI-Nombre' type='text' id='buscar_cliente' value='' onchange=buscarCliente('ruc') size='20'></td><td colspan='2'> 
   <select id='cliente' onchange='updateCliData()' style='width: 250px;'><option value='todos' data-img=''  >--- Todos ---</option></select><input type='hidden' id='suc' value='$suc' ></td></tr>");
   showHtml($t,"<tr><td>Articulo:</td><td><input size='30' type='text' id='buscar' placeholder='Articulo' /></td><td>Color:</td><td> <input type='text' id='color' size='16' > </td></tr>");
   showHtml($t,"<tr><td>Categoria:</td><td> $cats </td><td>Reporte:</td><td><select id='tipoReporte'><option value='extendido'>Extendido</option><option value='agrupado'>Agrupado</option></select></td></tr>");
   showHtml($t,"<tr><td colspan='2'><p>Agrupar por:</p><p><input checked type='checkbox' id='gpr_suc'><label for='gpr_suc'>Suc</label><input checked type='checkbox' id='gpr_usuario'><label for='gpr_usuario'>Vendedor</label><input checked type='checkbox' id='gpr_cliente'><label for='gpr_cliente'>Cliente</label><input checked type='checkbox' id='gpr_cat'><label for='gpr_cat'>Cat</label><input checked type='checkbox' id='gpr_codigo'><label for='gpr_codigo'>Codigo</label><input checked type='checkbox' id='gpr_color'><label for='gpr_color'>Color</label></p></td></td><td>Vendedor(Usuario):</td><td><input type='text' size='11' id='vendedor'></td></tr>");
   showHtml($t,"<tr><td colspan='2'><div id='ventasCliMsg' Style='text-align:center;' ></div></tr>");
   showHtml($t,"<style>input[id^='gpr']{display:none;}p{margin: 2px;}input[id^='gpr'] ~ label{padding: 1px 7px;margin: 1px 1px;border: solid gray 1px;border-radius: 7px;}input[id^='gpr']:checked + label{color: blue;  background-color: green;}</style>");
   botonGenerarReporte($t);    
   $t->Show("filter_footer");        
}
   
function facturas_star_soft(){
   $t = new Y_Template("ReportesUI.html");          
   $t->Set("titulo_filtro","Reporte Documentos Impresos Star Soft");
   $t->Set("action",path."/reportes/DocumentosImpresos.class.php"); 
   $t->Show("filter_header");     
   trFechaDesdeHasta($t);      
   botonGenerarReporte($t);         
   $t->Show("filter_footer");  
}

function documentos_contables(){
   $t = new Y_Template("ReportesUI.html");         
   $usuario = $_POST['usuario']; 
   $suc = $_POST['suc']; 
   $sucursales = getSucursales();
   $t->Set("titulo_filtro","Reporte Facturas Contables");
   $t->Set("action",path."/reportes/FacturasContables.class.php");
   $t->Show("filter_header");
   trFechaDesdeHasta($t);  
   showHtml($t,"<tr><td colspan='4'><input type='hidden' id='suc' value='$suc' ><input type='hidden' id='usuario' value='$usuario' ></td></tr>");
   //$tipo = createSelect(array("*","M.C.","D.FP.","D.F."),"tipo");
   showHtml($t,"<tr><td>Sucursales:</td><td>$sucursales</td> <td></td><td></td></tr>");
   botonGenerarReporte($t);         
   $t->Show("filter_footer");  
}

function cheques_terceros(){
   $t = new Y_Template("ReportesUI.html");
   //$path = "http://".$_SERVER['SERVER_NAME'].":".$_SERVER['SERVER_PORT']."/inmopy";  
      
   $t->Set("titulo_filtro","Reporte de Cheques de Terceros");
   $t->Set("action",path."/reportes/ChequesTerceros.class.php"); 
   $t->Show("filter_header");  
    
   trFechaDesdeHasta($t);
      
   $sucursales = getSucursales(" where tipo != 'Sub-Deposito' ","suc asc",true);
    
   $tipo = createSelect(array("%"=>"*","Al_Dia","Diferido"),"tipo");
   
   showHtml($t,"<tr><td>Sucursales:</td><td>$sucursales</td> <td>Tipo:</td><td>$tipo</td></tr>");
   
   $text = text("nro_cheque","","Buscar por &deg;",16);
   $fv = createSelect(array("fecha_pago"=>"Vencimiento","fecha_emis"=>"Emision","fecha_ins"=>"Registro"),"campo_fecha");
   showHtml($t,"<tr><td>N&deg; Cheque / Cliente:</td><td>$text</td><td>Filtrar por:</td><td>$fv</td></tr>");
   $monedas = getMonedas($filtro="");
   showHtml($t,"<tr><td>Moneda:</td> <td>$monedas</td><td>   </td>   <td> <img src='img/printer-02_32x32.png' style='cursor:pointer' onclick='imprimirEntregaCheques()'> </td></tr>");
   showHtml($t,"<tr><td></td><td><input type='button' value='Desmarcar todos' onclick='desmarcarTodos()'> </td>  <td colspan='2'>Incluir Recibidos por Gerencia: &nbsp; <input type='checkbox' id='include_ger'  > Recibidos por Administracion: &nbsp; <select id='recibido_adm' ><option value='%'>Todos</option> <option value='Si'>Si</option> <option value='No'>No</option>    </select> </td></tr>");
         
   botonGenerarReporte($t);   
   
   showHtml($t,'<script> $("#desde").val("01-01-2010"); $("#hasta").val("31-12-2030");  </script>');
   
   $t->Show("filter_footer");  
}

function cheques_terceros_caja(){
   $t = new Y_Template("ReportesUI.html");
   //$path = "http://".$_SERVER['SERVER_NAME'].":".$_SERVER['SERVER_PORT']."/inmopy";  
      
   $t->Set("titulo_filtro","Reporte de Cheques de Terceros");
   $t->Set("action",path."/reportes/ChequesTercerosCaja.class.php"); 
   $t->Show("filter_header");  
    
   trFechaDesdeHasta($t);
      
   $sucursales = getSucursales(" where tipo != 'Sub-Deposito' ","suc asc",true);
    
   $tipo = createSelect(array("%"=>"*","Al_Dia","Diferido"),"tipo");
   
   showHtml($t,"<tr><td>Sucursales:</td><td>$sucursales</td> <td>Tipo:</td><td>$tipo</td></tr>");
   
   $text = text("nro_cheque","","Buscar por &deg;",16);
   $fv = createSelect(array("fecha_pago"=>"Vencimiento","fecha_emis"=>"Emision","fecha_ins"=>"Registro"),"campo_fecha");
   showHtml($t,"<tr><td>N&deg; Cheque / Cliente:</td><td>$text</td><td>Filtrar por:</td><td>$fv</td></tr>");
   $monedas = getMonedas($filtro="");
   showHtml($t,"<tr><td>Moneda:</td> <td>$monedas</td><td>   </td>   <td>  </td></tr>");
            
   botonGenerarReporte($t);   
   
   showHtml($t,'<script> $("#desde").val("01-01-2010"); $("#hasta").val("31-12-2030");  </script>');
   
   $t->Show("filter_footer");  
}

function saldos_de_cajas_anteriores(){
    $t = new Y_Template("ReportesUI.html");         
   $usuario = $_POST['usuario']; 
   $suc = $_POST['suc']; 
   $sucursales = getSucursales(" where tipo != 'Sub-Deposito' ","suc asc",true);
   $t->Set("titulo_filtro","Saldos de Cajas Anteriores");
   $t->Set("action",path."/reportes/SaldosCaja.class.php");
   $t->Show("filter_header");
   trFechaDesdeHasta($t);  
   showHtml($t,"<tr><td colspan='4'><input type='hidden' id='suc' value='$suc' ><input type='hidden' id='usuario' value='$usuario' ></td></tr>");
   //$tipo = createSelect(array("*","M.C.","D.FP.","D.F."),"tipo");
   showHtml($t,"<tr><td>Sucursales:</td><td>$sucursales</td> <td></td><td></td></tr>");
   botonGenerarReporte($t);         
   $t->Show("filter_footer"); 
}

function calculo_de_variable(){
    $usuario = $_POST['usuario'];
    $suc = $_POST['suc'];
   $t = new Y_Template("ReportesUI.html");
   $t->Set("titulo_filtro","Calculo de Variable por Ventas");
   $t->Set("action",path."/reportes/CalculoVariable.class.php"); 
   $t->Show("filter_header");   
   trFechaDesdeHasta($t);     
   
   if(canModSuc($usuario)){
        $sucursales = getSucursales(" where tipo != 'Sub-Deposito' ","suc asc",false);
        showHtml($t,"<tr><td>Sucursal:</td><td>$sucursales</td> </tr>");  
   }else{
        $sucursales = "<input type='text' disabled value='$suc' id='select_suc'>";
        showHtml($t,"<tr><td>Sucursal:</td><td>$sucursales</td></tr>");  
   } 
   $tipo = createSelect(array ("CalculoVariable.class.php"=>"Vendedor Interno",  "ComisionesMayoristas.class.php"=>"Vendedor Externo", "VariableGerentes.class.php"=>"Gerentes de Ventas"),"tipo"); 
   showHtml($t,"<tr><td>Empleado:</td><td><input type='text' id='buscar_usuario' value='' onchange=buscarUsuariosXSuc('select_suc') size='20'></td><td colspan='2'> <select id='usuario'></select></tr>");
   showHtml($t,"<tr><td>Tipo Reporte:</td> <td> $tipo </td><td>"); 
   
   showHtml($t,"<script>cambiarURL('".path."');</script>");     
   botonGenerarReporte($t);         
   $t->Show("filter_footer");        
}

function tracking_de_pedidos(){
    $t = new Y_Template("ReportesUI.html");
    $usuario = $_POST['usuario'];
    $t->Set("action",path."/reportes/TrackingPedidos.class.php"); 
    $t->Show("filter_header");   
    trFechaDesdeHasta($t);    
    $suc = $_POST['suc']; 
    if(canModUser($usuario)){
        $usuarios = getUserNotaPedido($suc);
        showHtml($t,"<tr><td>Usuario:</td><td>$usuarios</td></tr>");  
    }else{
        $usuarios = "<input type='text' disabled value='$usuario' id='select_user'>";
        showHtml($t,"<tr><td>Usuarios:</td><td>$usuarios</td></tr>");  
    }
    $sucursales = getSucursales(" where tipo != 'Sub-Deposito' ","suc asc",true);
    showHtml($t,"<tr><td>Articulos: </td><td> <input type='text' id='articulo' size='40' placeholder='Filtre aqui por Descripcion, Ej.: gasa' > </td><td>Destino: </td><td>$sucursales</td></tr>");
    showHtml($t,"<tr><td colspan='4'><input type='hidden' value='$suc' id='suc'></td></tr>");
    botonGenerarReporte($t);         
    $t->Show("filter_footer");    
}

function movimientos_de_cuenta_banco(){
	$t = new Y_Template("ReportesUI.html");   
    $t->Set("titulo_filtro","Reporte de Movimientos de Cuenta de Banco");
    $t->Set("action",path."/reportes/MovimientosCuenta.class.php"); 
    $t->Show("filter_header");   
    trFechaDesdeHasta($t);     
    $bancos = getBancos("onchange='getCtasBancarias()'");
     
    
    showHtml($t,"<tr><td>Bancos: </td><td>$bancos</td><td>Cuenta: </td><td><select id='cuentas'><option value='*'> * - Todos </option></select></td></tr>"); 
    
    $sucursales = getSucursales(" where tipo != 'Sub-Deposito' ","suc asc",true);
    showHtml($t,"<tr><td>Sucursal:</td><td>$sucursales</td></tr>");  
    
    botonGenerarReporte($t);         
    $t->Show("filter_footer"); 
}

function remisiones(){
    $t = new Y_Template("ReportesUI.html");   
    $t->Set("titulo_filtro","Reporte de Remisiones");
    $t->Set("action",path."/reportes/Remisiones.class.php"); 
    $t->Show("filter_header");   
    $suc = $_POST['suc'];
    $usuario = $_POST['usuario'];
    $todasLasSucs = "";
    if(canModUser($usuario)){
        $todasLasSucs = "<td align='right'><label for='sucsTodos'>Todas las Sucursales: </label></td><td><input type='checkbox' id='sucsTodos'> </td>";
    }
    trFechaDesdeHasta($t);     
    showHtml($t,"<tr><td >Buscar por fecha: </td><td><select id='fecha_ref'><option value='fecha'>Creacion</option><option value='fecha_cierre'>Cierre</option></select></td><td>Estado: </td><td><select id='tipo'><option value='%'> * - Todos </option><option>Cerrada</option><option>En Proceso</option></select></td></tr>");
    showHtml($t,"<tr><td >Direccion: </td><td><select id='direccion'><option value='suc_d'>Destino</option><option value='suc'>Origen</option></select></td><td>Rem Nro.: </td><td><input id='rn_nro' type='text' size='6' /></td></tr>");
    showHtml($t,"<tr><td align='right'><label for='resumido'>Resumido: </label></td><td><input type='checkbox' id='resumido'> </td>$todasLasSucs</tr>");
    showHtml($t,"<input type='hidden' value='$suc' id='suc'>");
    botonGenerarReporte($t);         
    $t->Show("filter_footer"); 
}

function finalizaciones_de_pieza(){
   $t = new Y_Template("ReportesUI.html");
   $usuario = $_POST['usuario'];
   $t->Set("titulo_filtro","Reporte de Finalizaciones de Pieza");
   $t->Set("action",path."/reportes/FinalizacionesPieza.class.php"); 
   $t->Show("filter_header");   
   trFechaDesdeHasta($t);
   $suc = $_POST['suc'];
   if(canModSuc($usuario)){
        $sucursales = getSucursales(" where tipo != 'Sub-Deposito' ","suc asc",true);
        showHtml($t,"<tr><td>Sucursal:</td><td>$sucursales</td></tr>");  
    }else{
        $sucursales = "<input type='text' disabled value='$suc' id='select_suc'>";
        showHtml($t,"<tr><td>Sucursal:</td><td>$sucursales</td></tr>");  
    }
   //$sucursales = getSucursales(" where tipo != 'Sub-Deposito' ","suc asc",false);
   //showHtml($t,"<tr><td>Sucursal:</td><td>$sucursales</td></tr>");   
   showHtml($t,"<tr><td>Vendedor:</td><td><input type='text' id='buscar_usuario' value='' onchange=buscarUsuariosXSuc('select_suc') size='20'></td><td colspan='2'> <select id='usuario'></select>&nbsp;&nbsp;Incluir Piezas dentro del Rango<select id='incluir_desc_0'><option value='false'>No</option><option value='true'>Si</option></select></tr>");
   botonGenerarReporte($t);         
   $t->Show("filter_footer");      
}

function ventas_por_sector_y_articulo(){
    $usuario = $_POST['usuario'];
    $suc = $_POST['suc'];
    $t = new Y_Template("ReportesUI.html");
    $t->Set("titulo_filtro","Reporte de Ventas por Sector, Articulo");
    $t->Set("action",path."/reportes/VentasPorSectorArticulo.class.php"); 
    $t->Show("filter_header");   
    trFechaDesdeHasta($t);     
    $sectores = getSectores("'ACTIVOS','INSUMOS'",true);
    $showMargen = "";

    if(verMargen($usuario)){
        $showMargen = "<input type='checkbox' id='show_margen'/><label for='show_margen'>Mostrar Margen</label>";
    }    

    if(canModSuc($usuario)){
        $cuotas = createSelect(array(">=0"=>"* - Todos"," >0 "=>" Al menos 1 "," =0 "=>" Ninguna "),"cant_cuotas");
        $sucursales = getSucursales(" where tipo != 'Sub-Deposito' ","suc asc",true);
        showHtml($t,"<tr><td>Sucursal:</td><td>$sucursales</td><td>Cuotas:</td><td>$cuotas</td></tr>");  
    }else{
        $cuotas = createSelect(array(">=0"=>"* - Todos"),"cant_cuotas");
	$sucursales = "<input type='text' disabled value='$suc' id='select_suc'>";
        showHtml($t,"<tr><td>Sucursal:</td><td>$sucursales</td><td style='display:none'>Cuotas:</td><td>$cuotas</td></tr>");  
    }   
       
    showHtml($t,"<tr><td>Sector: </td><td>$sectores</td><td>Articulo: </td><td> <select id='select_articulos'><option value='%'> * - Todos </option></select></td></tr>");
    showHtml($t,"<tr><td>Vendedor:</td><td><input type='text' id='buscar_usuario' value='' onchange=buscarUsuariosXSuc('select_suc') size='20'></td><td colspan='2'> <select id='usuario'><option value='%' data-img=''  >Todos</option></select><input type='hidden' id='suc' value='$suc' ></td></tr>");
    showHtml($t,"<tr><td>Cliente:</td><td><input placeholder='RUC-CI-Nombre' type='text' id='buscar_cliente' value='' onchange=buscarClienteXfecha('ruc') size='20'></td><td colspan='2'> 
    <select id='cliente' onchange='updateCliData()' style='width: 250px;'><option value='todos' data-img=''  >--- Todos ---</option></select><input type='hidden' id='suc' value='$suc' ></td></tr>");
    $estado = createSelect(array("Cerrada","Abierta"),"estado");
    showHtml($t,"<tr><td colspan='5'>Categorias: <div id='categorias'> <input id='cat_1' type='checkbox' checked/><label for='cat_1'>1</label> <input id='cat_2' type='checkbox' checked/><label for='cat_2'>2</label> <input id='cat_3' type='checkbox' checked/><label for='cat_3'>3</label> <input id='cat_4' type='checkbox' checked/><label for='cat_4'>4</label> <input id='cat_5' type='checkbox' checked/><label for='cat_5'>5</label> <input id='cat_6' type='checkbox' checked/><label for='cat_6'>6</label> <input id='cat_7' type='checkbox' checked/><label for='cat_7'>7</label> </div></td>  </tr>");  
    
    showHtml($t,"<style>div#categorias {display: inline-block;border: dotted 1px black;border-radius: 5px;padding: 2px;}div#categorias input[type='checkbox'] {display: none;}div#categorias input[type='checkbox'] + label {display: inline;background-color: lightblue;border-radius: 3px;padding: 1px 3px;margin: 0;background-color: gray;}div#categorias input[type='checkbox'] + label:hover {cursor: pointer;}div#categorias input[type='checkbox']:checked + label {background-color: green;color: lightblue;}</style>");
    showHtml($t,"<tr><td align='center'>$showMargen</td><td align='right'> Agrupar por:</td><td colspan='2'> <input type='checkbox' checked id='group_art'/><label for='group_art'>Articulo</label> <input type='checkbox' id='group_suc'/><label for='group_suc'>Sucursal</label> <input type='checkbox' id='group_color'/><label for='group_color'>Color</label></td></tr>");
    showHtml($t,"<script>getArticulos();</script>");
    botonGenerarReporte($t);         
    $t->Show("filter_footer");
}
function stock_por_sector_y_articulo(){
    $usuario = $_POST['usuario'];
    $suc = $_POST['suc'];
    $t = new Y_Template("ReportesUI.html");
    $t->Set("titulo_filtro","Reporte de Stock");
    $t->Set("action",path."/reportes/StockXSectorXArticulo.class.php"); 
    $t->Show("filter_header");   
    $sectores = getSectores("'ACTIVOS'",true);
    showHtml($t,"<style>div.selector {position:relative;}div.selector ul {display:none;position:absolute;top: 100%;left: 5%;background-color: wheat;}div.selector ul li {list-style: none;}div.selector ul li:hover {cursor: pointer;border: dotted 1px black;}div.selector ul li:before {content: '* -';color: red;}li.selected {background-color: lightcoral;}div.selector ul li.selected:before {content: '* -';color: green;}</style>");

    if( canModSuc($usuario) ){
        $sucursales = getSucursales(" where tipo != 'Sub-Deposito' ","suc asc",true);
        
    
        showHtml($t,"<tr><td>Sucursal:</td><td>$sucursales</td> </tr>");  
    }else{
        $sucursales = "<input type='text' disabled value='$suc' id='select_suc'>";
        
        showHtml($t,"<tr><td>Sucursal:</td><td>$sucursales</td>   </tr>");  
    }   
       
    showHtml($t,"<tr><td>Sector: </td><td>$sectores</td><td>Articulo: </td><td> <select id='select_articulos'><option value='%'> * - Todos </option></select></td></tr>");

    $f_metros01="<td>Metros x Rollos Col 1: </td><td><select id='stockCrit_01' onchange='verifCritTG($(this))' ><option>=</option><option selected>></option><option><</option><option>Entre</option></select><input id='val01_1' value='0' type='text' size='5' /><input id='val01_2' value='100' type='text' size='5' disabled /></td>";
    $f_metros02="<td>Metros x Rollos Col 2: </td><td><select id='stockCrit_02' onchange='verifCritTG($(this))' ><option>=</option><option selected>></option><option><</option><option>Entre</option></select><input id='val02_1' value='0' type='text' size='5' /><input id='val02_2' value='100' type='text' size='5' disabled /></td>";
    $f_terminacion_anio = "<td>Terminaci&oacute;n / A&ntilde;o: </td><td><input type='text' size='2' id='terminacion' value='%'/></td>";
    $f_FDP = "FDP: <select id='fin_pieza'><option value='%'>* - Todos</option><option>Si</option><option>No</option></select>";    
    $f_estado_venta = "<td>Estado de Venta:</td><td><div class='selector'><input type='button' class='select' value='Seleccionar' />  $f_FDP<UL class ='estado_venta'><LI>Normal</LI><LI>Oferta</LI><LI>Retazo</LI><LI>Promocion</LI></UL></div></td>";

    showHtml($t,"<tr>$f_metros01 $f_estado_venta</tr>");
    showHtml($t,"<tr>$f_metros02 $f_terminacion_anio</tr>");

    showHtml($t,"<input type='hidden' id='estado_venta' />");

    showHtml($t,"<tr><td colspan='2' align='right'> <b>Agrupar por:</b></td><td colspan='2' class='checkbox_group'> <input type='checkbox' id='group_suc'/><label for='group_suc'>Sucursal</label> <input type='checkbox' id='group_color'/><label for='group_color'>Color</label>  <input type='checkbox' id='group_design'/><label for='group_design'>Dise&ntilde;o</label> <input type='checkbox' id='mostrar_costo'> <label for='mostrar_costo'>Mostrar Costo</label></td></tr>");
    showHtml($t,"<script>getArticulos();</script>");
    botonGenerarReporte($t);         
    $t->Show("filter_footer");
    showHtml($t,"<script>iniRepStock()</script>");
    showHtml($t,"<style></style>");
}
function prorrateo_de_gastos(){
   $t = new Y_Template("ReportesUI.html");
   $t->Set("titulo_filtro","Reporte Prorrateo de Gastos");
   $t->Set("action",path."/reportes/ProrrateoGastos.class.php"); 
   $t->Show("filter_header");   
   trFechaDesdeHasta($t);       
   botonGenerarReporte($t);         
   $t->Show("filter_footer");       
}
function planilla_ordenes_de_compra(){
  
   $t = new Y_Template("ReportesUI.html");
   $t->Set("titulo_filtro","Planilla de Amortizacion de Ordenes de Compra");
   $t->Set("action",path."/reportes/OrdenesCompra.class.php"); 
   $t->Show("filter_header");   
   trFechaDesdeHasta($t);       
   
   $asoc = getResultArray("SELECT  cod_tarjeta AS CreditCard ,nombre as CardName FROM tarjetas  where tipo = 'Asociacion'");
   
   $select = "<select id='asoc'>";
   foreach ($asoc as $key => $arr) {        
       $CreditCard = $arr['CreditCard'];
       $CardName = $arr['CardName'];
       $select.="<option value='$CreditCard'>$CardName</option>";
   }  
     
   $select.="</select>";
   $anio = "<select id='anio'>"
           . "<option>2017</option>"
           . "<option>2018</option>"
           . "<option>2019</option>"
           . "<option>2020</option>"
           . "</select>";  
   $arrmeses = array("Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre");
   
   $meses = "<select id='mes'>";
   for($i = 0; $i <12;$i++ ){
       $month = $arrmeses[$i];
       $meses.="<option>$month</option>";
   }
   $meses.="</select>";
   
   showHtml($t,"<tr><td>Asociacion:</td><td  colspan='3'>$select &nbsp;&nbsp;Correspondiente a: $meses &nbsp;&nbsp; A&ntilde;o:$anio &nbsp;&nbsp; Vencimiento: <input id='venc' class='fecha' type='text' size='10' value=''></td> </tr>");
   botonGenerarReporte($t);         
   $t->Show("filter_footer");          
}

function gestion_de_cobranzas(){
   $usuario = $_POST['usuario'];
   $suc = $_POST['suc'];
   $t = new Y_Template("ReportesUI.html");
   $t->Set("titulo_filtro","Gestion de Cobranzas");
   $t->Set("action",path."/reportes/GestionCobranzas.class.php"); 
   $t->Show("filter_header");   
   trFechaDesdeHasta($t);     
   $tipo = "<td>Tipo:</td> <td> <select id='tipo'><option value='%'>Todos</option><option value='Regular'>Regular</option><option value='Vencido'>Vencido</option></select>  </td>";
   if(canModSuc($usuario)){
        $sucursales = getSucursales(" where tipo != 'Sub-Deposito' ","suc asc",false);
        showHtml($t,"<tr><td>Sucursal:</td><td>$sucursales</td> $tipo</tr>");  
   }else{
        $sucursales = "<input type='text' disabled value='$suc' id='select_suc'>";
        showHtml($t,"<tr><td>Sucursal:</td><td>$sucursales</td> $tipo </tr>");  
   } 
   //showHtml($t,"<tr><td>Sucursal:</td><td>$sucursales</td></tr>");
   showHtml($t,"<tr><td>Cliente:</td><td><input placeholder='RUC-CI-Nombre' type='text' id='buscar_cliente' value='' onchange=buscarCliente('codigo') size='20'></td><td colspan='2'> 
   <select id='cliente' style='width: 250px;'><option value='%' >Todos</option></select></td></tr>");
   showHtml($t,"<tr><td>Vendedor:</td><td><input type='text' id='buscar_usuario' value='' onchange=buscarUsuariosXSuc('select_suc') size='20'></td><td colspan='2'> <select id='usuario'><option value='%'>Todos</option></select></tr>");
   botonGenerarReporte($t);         
   $t->Show("filter_footer");
}


function reporte_de_fraccionamiento(){
    $usuario = $_POST['usuario'];
    $suc = $_POST['suc'];
    $t = new Y_Template("ReportesUI.html");
    $t->Set("titulo_filtro","Reporte de Fraccionamientos");
    $t->Set("action",path."/reportes/Fraccionamientos.class.php"); 
    $t->Show("filter_header");   
    trFechaDesdeHasta($t);     
    $sectores = getSectores("'ACTIVOS','INSUMOS'",true);
    
    if(canModSuc($usuario)){
        $sucursales = getSucursales(" where tipo != 'Sub-Deposito' ","suc asc",true,"onchange=buscarUsuariosXSuc($(this).attr('id'))");
        showHtml($t,"<tr><td>Sucursal:</td><td>$sucursales</td> $tipo</tr>");  
    }else{
         $sucursales = "<input type='text' disabled value='$suc' id='select_suc'>";
         showHtml($t,"<tr><td>Sucursal:</td><td>$sucursales</td> $tipo </tr>");           
    }
    $estado = createSelect(array("Pendiente","Vendido","Remitido","Procesado","Suspendido"),"estado");
    showHtml($t,"<tr><td>Fraccionamientos Pendientes:</td><td> <input type='checkbox' id='frac_pend'> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;<label class='pend' style='display:none'>Agrupado:</label> <input class='pend' type='checkbox' style='display:none' id='frac_pend_agrup'>  </td>  <td style='display:none' class='pend'>Estado:</td> "
            . "<td style='display:none' class='pend'> $estado </td>  </tr>"); 
    showHtml($t,"<tr class='rep_frac' ><td>Vendedor:</td><td><input type='text' id='buscar_usuario' value='%' onchange=buscarUsuariosXSuc('select_suc') size='20'></td><td colspan='2'> <select id='usuario'><option value='%'>Todos</option></select></tr>");
    showHtml($t,"<tr class='rep_frac' ><td>Sector: </td><td>$sectores</td><td>Articulo: </td><td> <select id='select_articulos'><option value='%'> * - Todos </option></select></td></tr>");
    showHtml($t,"<script>buscarUsuariosXSuc('select_suc');</script>");
    botonGenerarReporte($t);         
    showHtml($t,"<script>iniRepFraccionamiento()</script>");
    $t->Show("filter_footer");
}
function fraccionamientos_por_compra(){
    $usuario = $_POST['usuario'];
    $suc = $_POST['suc'];
    $t = new Y_Template("ReportesUI.html");
    $t->Set("titulo_filtro","Reporte de Fraccionamientos por Compra");
    $t->Set("action",path."/reportes/FraccionamientosXCompra.class.php"); 
    $t->Show("filter_header");   
    
    showHtml($t,"<tr><td>Lote:</td><td> <input   type='text' id='lote' size='14'> </td> <td>Nro Compra:</td><td> <input type='text' id='ref' size='6'> </td>     </tr>"); 
    showHtml($t,"<tr><td>Datos:</td><td colspan='3' ><div id='datos_compra' readonly='readonly'  style='width:100%;height:auto;background:white' ></div></td></tr>"); 
    botonGenerarReporte($t);         
    showHtml($t,"<script> initReporteFraccionamientoCompras()</script>");
    $t->Show("filter_footer");
    
}
    
function reporte_de_notas_de_credito(){
    $usuario = $_POST['usuario'];
    $suc = $_POST['suc'];
    $t = new Y_Template("ReportesUI.html");
    $t->Set("titulo_filtro","Reporte de Notas de Credito");
    $t->Set("action",path."/reportes/NotasCredito.class.php"); 
    $t->Show("filter_header");   
    trFechaDesdeHasta($t);     
    
    if(canModSuc($usuario)){
         $sucursales = getSucursales(" where tipo != 'Sub-Deposito' ","suc asc",false);
         showHtml($t,"<tr><td>Sucursal:</td><td>$sucursales</td></tr>");  
     }else{
         $sucursales = "<input type='text' disabled value='$suc' id='select_suc'>";
         showHtml($t,"<tr><td>Sucursal:</td><td>$sucursales</td></tr>");  
     }
    botonGenerarReporte($t);         
    $t->Show("filter_footer");
 }
 function comparativo_de_ventas(){
    $t = new Y_Template("ReportesUI.html");
    $t->Set("titulo_filtro","Reporte Comparativo de Ventas");
    $t->Set("action",path."/reportes/ComparativoVentas.php"); 
    $t->Show("filter_header");
    trFechaDesdeHasta($t);
    $sucursales = getSucursales(" where tipo != 'Sub-Deposito' ","suc asc",true);
    showHtml($t,"<tr><td>Sucursal:</td><td>$sucursales</td></tr>");
    $sectores = getSectores("'ACTIVOS','INSUMOS'",false);
    showHtml($t,"<style>div.selector {position:relative;}div.selector ul {display:none;position:absolute;top: 100%;left: 5%;background-color: wheat;}div.selector ul li {list-style: none;}div.selector ul li:hover {cursor: pointer;border: dotted 1px black;}div.selector ul li:before {content: '* -';color: red;}li.selected {background-color: lightcoral;}div.selector ul li.selected:before {content: '* -';color: green;}</style>");
       
    showHtml($t,"<tr><td>Sector: </td><td>$sectores</td><td>Articulo: </td><td> <select id='select_articulos'><option value='%'> * - Todos </option></select></td></tr>");
    showHtml($t,"<tr><td>Distinguir por Sucursal: </td><td> <input type='checkbox' id='agrup_suc'>  </td> </tr>");
    showHtml($t,"<input type='hidden' id='agrup_color' value='false'>");
    showHtml($t,"<script>getArticulos();</script>");
    botonGenerarReporte($t);         
    $t->Show("filter_footer");
}

function stock_actual_y_movimiento(){
    $usuario = $_POST['usuario'];
    /*
    if($usuario != "douglas"    ){
       
        echo "<h1 style='color:red;font-size:24px'><b><br><br><br>$usuario:   Informatica esta trabajando para mejorar este reporte en este momento, favor aguarde.</b></h1>";
        die();
    }*/
    
    $suc = $_POST['suc'];
    $t = new Y_Template("ReportesUI.html");
    $t->Set("titulo_filtro","Reporte de Stock actual y Movimiento de Productos");
    $t->Set("action",path."/reportes/StockYMovimientoArticulos.class.php"); 
    $t->Show("filter_header");   
    $sectores = getSectores("'ACTIVOS','INSUMOS'",false);
    showHtml($t,"<style>div.selector {position:relative;}div.selector ul {display:none;position:absolute;top: 100%;left: 5%;background-color: wheat;}div.selector ul li {list-style: none;}div.selector ul li:hover {cursor: pointer;border: dotted 1px black;}div.selector ul li:before {content: '* -';color: red;}li.selected {background-color: lightcoral;}div.selector ul li.selected:before {content: '* -';color: green;}</style>");

    trFechaDesdeHasta($t); 
    $clidata_code = "<td colspan='2'><div id='ventasCliDatosCli' Style='text-align:left;background:white;width:80%,min-width:80%' ></div></td>";
    if(canModSuc($usuario)){
        $sucursales = getSucursales(" where tipo != 'Sub-Deposito' ","suc asc",true);
        showHtml($t,"<tr><td>Sucursal:</td><td>$sucursales</td> $clidata_code</tr>");  
    }else{
        $sucursales = "<input type='text' disabled value='$suc' id='select_suc'>";
        showHtml($t,"<tr><td>Sucursal:</td><td>$sucursales</td> $clidata_code </tr>");  
    }   
     
    showHtml($t,"<tr><td>Cliente:</td><td><input placeholder='RUC-CI-Nombre' type='text' id='buscar_cliente' value='' onchange=buscarCliente('ruc') size='20'></td><td colspan='2'> 
    <select id='cliente' onchange='updateCliData()' style='width: 80%;'><option value='todos' data-img=''  >--- Todos ---</option></td></tr>");
    
    showHtml($t,"<tr><td>Sector: </td><td>$sectores</td><td>Articulo: </td><td> <select id='select_articulos'><option value='%'> * - Todos </option></select></td></tr>");
    
    //$array_cat = array("%"=>"* - Todas");
    /*
    $array_cat = array();
    foreach (range(1, 7) as $num) {
      array_push($array_cat,$num);    
    }
   
    $cat =createSelect($array_cat ,"categ"); */
    
    
    $f_metros="<td>Ventas: </td><td><select id='stockCrit' onchange='verifCrit()' ><option>></option ><option selected><=</option><option>Entre</option></select><input id='val1' value='5' type='text' size='5' /><input id='val2' value='100' type='text' size='5' disabled /></td>  ";
    
    showHtml($t,"<tr><td> Categorias: </td><td> <div id='categorias'> <input id='cat_1' type='checkbox' checked/><label for='cat_1'>1</label> <input id='cat_2' type='checkbox' checked/><label for='cat_2'>2</label> <input id='cat_3' type='checkbox' checked/><label for='cat_3'>3</label> <input id='cat_4' type='checkbox' checked/><label for='cat_4'>4</label> <input id='cat_5' type='checkbox' checked/><label for='cat_5'>5</label> <input id='cat_6' type='checkbox' checked/><label for='cat_6'>6</label> <input id='cat_7' type='checkbox' checked/><label for='cat_7'>7</label> </div></td> $f_metros </tr>");  
    showHtml($t,"<style>div#categorias {display: inline-block;border: dotted 1px black;border-radius: 5px;padding: 2px;}div#categorias input[type='checkbox'] {display: none;}div#categorias input[type='checkbox'] + label {display: inline;background-color: lightblue;border-radius: 3px;padding: 1px 3px;margin: 0;background-color: gray;}div#categorias input[type='checkbox'] + label:hover {cursor: pointer;}div#categorias input[type='checkbox']:checked + label {background-color: green;color: lightblue;}</style>");
    
    showHtml($t,"<td>   <label>Incluir Stock Actual:</label>  </td><td><input type='checkbox' id='include_stock'></td>");
    showHtml($t,"<input type='hidden' id='estado_venta' />");

    
    showHtml($t,"<script>getArticulos();</script>");
    botonGenerarReporte($t);         
    $t->Show("filter_footer");
     
}
function ordenes_de_fabricacion(){
    $t = new Y_Template("ReportesUI.html");
    $t->Set("titulo_filtro","Reporte de Ordenes de Fabricacion");
    $t->Set("action",path."/reportes/OrdenesFabricacion.class.php"); 
    $t->Show("filter_header");  
    trFechaDesdeHasta($t);
    $estado = createSelect(array("%","Pendiente","Cerrada","En Proceso"),"estado");
    showHtml($t,"<tr><td>Estado:</td><td>$estado</td>  </tr>");
    botonGenerarReporte($t);         
    $t->Show("filter_footer");
}

function historico_de_stock_y_ventas(){
    $usuario = $_POST['usuario'];
    $suc = $_POST['suc'];
    $t = new Y_Template("ReportesUI.html");
    $t->Set("titulo_filtro","Reporte Historico de Stock y Ventas");
    $t->Set("action",path."/reportes/historico_stock_ventas.php"); 
    $t->Show("filter_header");   
    $sectores = getSectores("'ACTIVOS','INSUMOS'",true);
    showHtml($t,"<style>div.selector {position:relative;}div.selector ul {display:none;position:absolute;top: 100%;left: 5%;background-color: wheat;}div.selector ul li {list-style: none;}div.selector ul li:hover {cursor: pointer;border: dotted 1px black;}div.selector ul li:before {content: '* -';color: red;}li.selected {background-color: lightcoral;}div.selector ul li.selected:before {content: '* -';color: green;}</style>");

    trFechaDesdeHasta($t); 
    
    if(canModSuc($usuario)){
        $sucursales = getSucursales(" where tipo != 'Sub-Deposito' ","suc asc",true);
        showHtml($t,"<tr><td>Sucursal:</td><td>$sucursales</td></tr>");
    }else{
        $sucursales = "<input type='text' disabled value='$suc' id='select_suc'>";
        showHtml($t,"<tr><td>Sucursal:</td><td>$sucursales</td></tr>");
    }   
       
    showHtml($t,"<tr><td>Sector: </td><td>$sectores</td><td>Articulo: </td><td> <select id='select_articulos'><option value='%'> * - Todos </option></select></td></tr>");

    showHtml($t,"<input type='hidden' id='estado_venta' />");

    showHtml($t,"<tr><td align='center' colspan='2'><label for='gpr_color'>Agrupar por color:</label><input type='checkbox' id='gpr_color'></td></tr>");
    showHtml($t,"<script>getArticulos();</script>");
    botonGenerarReporte($t);         
    $t->Show("filter_footer");
}
function fabricacion_de_productos_terminados(){
    $t = new Y_Template("ReportesUI.html");
    $t->Set("titulo_filtro","Reporte Fraccionamientos para Manteles y Fabrica");
    $t->Set("action",path."/reportes/FraccionadoresManteles.class.php"); 
    $t->Show("filter_header");   
      
    trFechaDesdeHasta($t); 
    showHtml($t,"<tr><td>Cortador:</td><td><input type='text' id='buscar_usuario' value='' onchange=buscarUsuariosXSuc('select_suc') size='20'></td><td colspan='2'> <select id='usuario'><option value='%' data-img=''  >Todos</option></select><input type='hidden' id='suc' value='$suc' ></td></tr>");
    
    $sucursales = "<input type='text' disabled value='00' id='select_suc'>";
    $tipo = createSelect(array ("FraccionadoresManteles.class.php"=>"Fraccionadores",  "FabricacionManteles.class.php"=>"Fabrica"),"tipo"); 
    
    showHtml($t,"<tr><td>Tipo Reporrte:</td><td>$tipo</td>  <td>Sucursal:</td><td>$sucursales</td>  </tr>");  
     
    botonGenerarReporte($t);  
    showHtml($t,"<script>cambiarURL('".path."');</script>");     
    $t->Show("filter_footer");    
}

function stock_proveedor(){
    $usuario = $_POST['usuario'];
    $suc = $_POST['suc'];
    $t = new Y_Template("ReportesUI.html");
    $t->Set("titulo_filtro","Reporte Stock por Proveedor");
    $t->Set("action",path."/reportes/stockXProveedor.php"); 
    $t->Show("filter_header");   
    showHtml($t,"<link rel='stylesheet' type='text/css' href='reportes/stockXProveedor.css' />");
    showHtml($t,"<script type='text/javascript'  src='reportes/stockXProveedor.js' ></script>");

    trFechaDesdeHasta($t);
    $sectores = getSectores("'ACTIVOS','INSUMOS'",true);
    //trFechaDesdeHasta($t); 
    $proveedores = getProveedores("CardName ASC",false,"onchange='listarCompras()'");
    //if(canModSuc($usuario)){
        $sucursales = getSucursales(" where tipo != 'Sub-Deposito' ","suc asc",true);
        showHtml($t,"<tr><td>Sucursal:</td><td>$sucursales</td><td>Porveedores:</td><td>$proveedores<img class='listarCompras' onclick='listarCompras()' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAm0lEQVQ4jdWQMarFUAhEx0CQVCHFTRGwSSsEs/9FzRJ8lY/bfCx+9QZOc8BBBf6biOD7vhkRBID7vvdyHRFBPM+TRRXMrgPuTndPd2dtNbkO/nXZL8XMaGZpZgSA4zj2yXUQ13VlUQWz68AYg+d55hjj+9FyHfPML0dVuW1bqmrds5frUFViXdcsqmB2HRARLsuSIvL9aLkOEeEHsk2jOSSyGTkAAAAASUVORK5CYII='></td></tr>");
    /* }else{
        $sucursales = "<input type='text' disabled value='$suc' id='select_suc'>";
        showHtml($t,"<tr><td>Sucursal:</td><td>$sucursales</td>td>Porveedor:</td><td>$proveedores</td></tr>");
    }  */  
       
    showHtml($t,"<tr><td>Sector: </td><td>$sectores</td><td>Articulo: </td><td> <select id='select_articulos' onchange='listarCompras()'><option value='%'> * - Todos </option></select></td></tr>");

    showHtml($t,"<input type='hidden' value='$suc' id='suc' />");
    showHtml($t,"<input type='hidden' value='$suc' id='select_docentry' />");
    
    showHtml($t,"<div class='listaDeCompras'></div><script>$('input[onclick^=sendForm]').prop('disabled',true);</script>");    
    botonGenerarReporte($t);         
    $t->Show("filter_footer");
}

function codificacion_pantone(){
    $usuario = $_POST['usuario'];
    $suc = $_POST['suc'];
    $t = new Y_Template("ReportesUI.html");
    $t->Set("titulo_filtro","Codificacion Pantone");
    $t->Set("action",path."/reportes/codificacion_pantone.php"); 
    $t->Show("filter_header");   
    $sectores = getSectores("'ACTIVOS','INSUMOS'",false);
    showHtml($t,"<style>div.selector {position:relative;}div.selector ul {display:none;position:absolute;top: 100%;left: 5%;background-color: wheat;}div.selector ul li {list-style: none;}div.selector ul li:hover {cursor: pointer;border: dotted 1px black;}div.selector ul li:before {content: '* -';color: red;}li.selected {background-color: lightcoral;}div.selector ul li.selected:before {content: '* -';color: green;}</style>");

    if(canModSuc($usuario)){
        $sucursales = getSucursales(" where tipo != 'Sub-Deposito' ","suc asc",true);
        showHtml($t,"<tr><td>Sucursal:</td><td>$sucursales</td></tr>");  
    }else{
        $sucursales = "<input type='text' disabled value='$suc' id='select_suc'>";
        showHtml($t,"<tr><td>Sucursal:</td><td>$sucursales</td></tr>");  
    }   
       
    showHtml($t,"<tr><td>Sector: </td><td>$sectores</td><td>Articulo: </td><td> <select id='select_articulos'></select></td></tr>");

    $f_metros01="<td>Stock Total: </td><td><select id='stock_total' onchange='verifCritTG($(this))'><option>=</option><option selected>></option><option><</option><option>Entre</option></select><input id='valtotal_1' value='0' type='text' size='5' /><input id='valtotal_2' value='100' type='text' size='5' disabled /></td>";
    $f_metros02="<td>Stock por lote: </td><td><select id='stock_Xlote' onchange='verifCritTG($(this))'><option>=</option><option selected>></option><option><</option><option>Entre</option></select><input id='valXlote_1' value='0' type='text' size='5' /><input id='valXlote_2' value='100' type='text' size='5' disabled /></td>";
    
    showHtml($t,"<tr>$f_metros01 $f_metros02</tr>");
    $porcentaje = "<td colspan='2' align='right'>Diferencia entre stock Total:</td><td><input size='3' value='10' type='text' id='stocDiff' />%</td>";
    $porcentaje .= "<td>Mts. Preferido de la muestra: <input size='3' value='1' type='text' id='mtsPrefMuestra' /></td>";
    showHtml($t,"<tr>$porcentaje</tr>");

    showHtml($t,"<tr><td><input type='checkbox' id='lotes_pedidos'/><label for='lotes_pedidos'>Listar solo pedidos</label/></td></tr>");
    showHtml($t,"<input type='hidden' id='estado_venta' />");

    showHtml($t,"<script>getArticulos();</script>");
    botonGenerarReporte($t);         
    $t->Show("filter_footer");
    showHtml($t,"<script>iniRepStock()</script>");
    showHtml($t,"<style></style>");
}
function reporte_de_reposicion(){
    $usuario = $_POST['usuario'];
    $suc = $_POST['suc'];
    $t = new Y_Template("ReportesUI.html");
    $t->Set("titulo_filtro","Reporte de Stock");
    $t->Set("action",path."/reportes/Reposicion.php");
    $t->Show("filter_header");   
    $sectores = getSectores("'ACTIVOS','INSUMOS','BASCULAS','SERVICIOS'",false);
    showHtml($t,"<input type='hidden' disabled value='$suc' id='suc'>");
    showHtml($t,"<tr><td>Sector: </td><td>$sectores</td><td>Articulo: </td><td> <select id='select_articulos'></select></td></tr>");
    $f_metros01="<td>Stock lote: </td><td><select id='stockCrit_01' onchange='verifCritTG($(this))' ><option>=</option><option selected>></option><option><</option><option>Entre</option></select><input id='val01_1' value='0' type='text' size='5' /><input id='val01_2' value='100' type='text' size='5' disabled /></td>";
    $agruparaXCodColorFab = "<td colspan='2'><label for='grpXCodColFab'>Agrupar por Codico Color de Fabrica:</label><input type='checkbox' id='grpXCodColFab' /></td>";
    showHtml($t,"<tr>$f_metros01 $agruparaXCodColorFab</tr>");
    showHtml($t,"<tr><td>Term. A&ntilde;o</td><td><input type='text' value='%' id='term' size='4'></td></tr>");
    showHtml($t,"<script>getArticulos();</script>");
    botonGenerarReporte($t);         
    $t->Show("filter_footer");
    showHtml($t,"<script>iniRepStock()</script>");
}
function reporte_de_logistica(){
    $t = new Y_Template("ReportesUI.html");
    $t->Set("titulo_filtro","Reporte de Logistica");
    
    $t->Set("action",path."/reportes/Logistica.class.php");
    $t->Show("filter_header");   
    trFechaDesdeHasta($t);
    $de = getSucursales(" where tipo != 'Sub-Deposito' ","suc asc",false,"","suc_de");
    $a = getSucursales(" where tipo != 'Sub-Deposito' ","suc asc",false,"","suc_a");
    showHtml($t,"<tr><td>De:</td><td>$de</td> <td>A:</td><td>$a</td></tr>"); 
    $tipo = createSelect(array("Remisiones","Pedidos"),"tipo_rep");
    showHtml($t,"<tr><td>Tipo Reporrte:</td><td>$tipo</td>  </tr>");
   
    botonGenerarReporte($t);         
    $t->Show("filter_footer");
    showHtml($t,'<script>  iniRepLogistica();  $("#suc_de").change(); </script>"');
      
}

// Reporte de panel de Turnos
function panel_de_turnos(){
    $usuario = $_POST['usuario'];
    $suc = $_POST['suc'];
    $t = new Y_Template("ReportesUI.html");
    $t->Set("titulo_filtro","Reporte de Paneles de Turnos");
    $t->Set("action",path."/reportes/ReportePanelTurnos.php"); 
    $t->Show("filter_header"); 
    trFechaDesdeHasta($t);
    $sucs = "<select id='selected_suc'><option value='02'>Avenida</option><option value='06'>CDE 3.5</option><option value='01'>Terminal</option></select>";
    showHtml($t,"<tr><td>Suc:</td><td>$sucs</td>  </tr>");
    botonGenerarReporte($t);         
    $t->Show("filter_footer");
}


// Reporte de Inventario de productos
function inventario(){
    $usuario = $_POST['usuario'];
    $suc = $_POST['suc'];
    $t = new Y_Template("ReportesUI.html");
    $t->Set("titulo_filtro","Reporte de Inventario");
    $t->Set("action",path."/reportes/Inventario.php"); 
    $t->Show("filter_header"); 
    showHtml($t,"<link rel='stylesheet' type='text/css' href='reportes/Inventario.css' />");
    showHtml($t,"<script type='text/javascript'  src='reportes/Inventario.js' ></script>");
    trFechaDesdeHasta($t);
    $sucursales = getSucursales(" where tipo != 'Sub-Deposito' ","suc asc",true,"onchange='periodos()'");
    $sectores = getSectores("'ACTIVOS','INSUMOS'",true);
    $inventarioUsuarios = inventarioUsuarios();
    showHtml($t,"<tr><td>Sucursal:</td><td>$sucursales</td><td>Usuario:</td><td>$inventarioUsuarios</td></tr>");
    showHtml($t,"<tr><td>Sector: </td><td>$sectores</td><td>Articulo: </td><td> <select id='select_articulos'><option value='%'> * - Todos </option></select></td></tr>");
    showHtml($t,"<tr><td colspan='2' style='text-align:center;'><input type='checkbox' id='ArtColor'><label for='ArtColor'>Mostrar Nombre de Articulo y Color</label></td><td>Tipo de Reporte:</td><td><select id='tipoReporte'><option value='inventario'>Inventario de Productos</option><option value='fdp'>Fin de Pieza por Inventario</option></select></td></tr>");
    showHtml($t,"<tr><td colspan='5'><div class='listaPeriodosInventario'><p>Seleccionar per&iacute;odo</p><table><thead><tr><th>Usuario</th><th>Suc</th><th>Inicio</th><th>Fin</th><th>Estado</th></tr></thead><tbody></tbody></table></div></td></tr>");
    botonGenerarReporte($t);         
    $t->Show("filter_footer");
}

new ReportesUI();
?>
   