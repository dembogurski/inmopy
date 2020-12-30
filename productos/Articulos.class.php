<?php

require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");

/**
 * Description of Audit
 *
 * @author Doglas
 */
class Articulos {

    private $table = 'articulos';
    private $items = [
        array("column_name" => "codigo", "nullable" => "NO", "data_type" => "varchar", "max_length" => "30", "numeric_pres" => "", "dec" => "", "titulo_campo" => "Codigo=>", "titulo_listado" => "Codigo", "type" => "text", "required" => "required", "inline" => "false", "editable" => "readonly", "insert" => "Yes", "default" => "", "pk" => "PRI", "extra" => ""), 
        array("column_name" => "clase", "nullable" => "YES", "data_type" => "varchar", "max_length" => "16", "numeric_pres" => "", "dec" => "", "titulo_campo" => "Clase=>", "titulo_listado" => "Clase", "type" => "select", "required" => "required", "inline" => "false", "editable" => "Yes", "insert" => "Yes", "default" => "Articulo=>Articulo,Trabajo=>Trabajo,Viaje=>Viaje", "pk" => "", "extra" => ""), 
        array("column_name" => "descrip", "nullable" => "NO", "data_type" => "varchar", "max_length" => "100", "numeric_pres" => "", "dec" => "", "titulo_campo" => "Descrip=>", "titulo_listado" => "Descrip", "type" => "text", "required" => "required", "inline" => "false", "editable" => "Yes", "insert" => "Yes", "default" => "", "pk" => "", "extra" => ""), 
        array("column_name" => "cod_sector", "nullable" => "NO", "data_type" => "int", "max_length" => "", "numeric_pres" => "10", "dec" => "0", "titulo_campo" => "Cod Sector=>", "titulo_listado" => "Cod Sector", "type" => "db_select", "required" => "", "inline" => "false", "editable" => "Yes", "insert" => "Yes", "default" => "sectores=>cod_sector,descrip", "pk" => "MUL", "extra" => ""), 
        array("column_name" => "um", "nullable" => "NO", "data_type" => "varchar", "max_length" => "10", "numeric_pres" => "", "dec" => "", "titulo_campo" => "Um=>", "titulo_listado" => "Um", "type" => "db_select", "required" => "", "inline" => "false", "editable" => "readonly", "insert" => "Yes", "default" => "unidades_medida=>um_cod,um_descri", "pk" => "MUL", "extra" => ""), 
        array("column_name" => "costo_prom", "nullable" => "YES", "data_type" => "decimal", "max_length" => "", "numeric_pres" => "16", "dec" => "2", "titulo_campo" => "Costo Promedio=>", "titulo_listado" => "", "type" => "number", "required" => "", "inline" => "false", "editable" => "readonly", "insert" => "Yes", "default" => "", "pk" => "", "extra" => ""), 
        array("column_name" => "costo_cif",  "nullable" => "YES", "data_type" => "decimal", "max_length" => "", "numeric_pres" => "16", "dec" => "2", "titulo_campo" => "Costo CIF=>", "titulo_listado" => "", "type" => "number", "required" => "", "inline" => "false", "editable" => "readonly", "insert" => "Yes", "default" => "", "pk" => "", "extra" => ""), 
        array("column_name" => "art_venta", "nullable" => "YES", "data_type" => "varchar", "max_length" => "2", "numeric_pres" => "", "dec" => "", "titulo_campo" => "Art. Venta=>", "titulo_listado" => "", "type" => "checkbox", "required" => "", "inline" => "false", "editable" => "readonly", "insert" => "Yes", "default" => "Si=>Si,No=>NO", "pk" => "", "extra" => ""),
        array("column_name" => "art_inv", "nullable" => "YES", "data_type" => "varchar", "max_length" => "2", "numeric_pres" => "", "dec" => "", "titulo_campo" => "Art. Inv=>", "titulo_listado" => "", "type" => "checkbox", "required" => "", "inline" => "false", "editable" => "readonly", "insert" => "Yes", "default" => "Si=>Si,No=>NO", "pk" => "", "extra" => ""), 
        array("column_name" => "art_compra", "nullable" => "YES", "data_type" => "varchar", "max_length" => "2", "numeric_pres" => "", "dec" => "", "titulo_campo" => "Art. Compra=>", "titulo_listado" => "", "type" => "checkbox", "required" => "", "inline" => "false", "editable" => "readonly", "insert" => "Yes", "default" => "Si=>Si,No=>No", "pk" => "", "extra" => ""), 
        array("column_name" => "img", "nullable" => "YES", "data_type" => "varchar", "max_length" => "100", "numeric_pres" => "", "dec" => "", "titulo_campo" => "Img=>", "titulo_listado" => "", "type" => "text", "required" => "", "inline" => "false", "editable" => "Yes", "insert" => "Yes", "default" => "", "pk" => "", "extra" => ""), 
        array("column_name" => "estado_venta", "nullable" => "YES", "data_type" => "varchar", "max_length" => "30", "numeric_pres" => "", "dec" => "", "titulo_campo" => "Estado Venta=>", "titulo_listado" => "", "type" => "select", "required" => "", "inline" => "false", "editable" => "Yes", "insert" => "Yes", "default" => "Normal=>Normal,Oferta=>Oferta,Recuperado=>Recuperado,Promocion=>Promocion,Arribos=>Arribos", "pk" => "", "extra" => ""), array("column_name" => "composicion", "nullable" => "YES", "data_type" => "varchar", "max_length" => "30", "numeric_pres" => "", "dec" => "", "titulo_campo" => "Composicion=>", "titulo_listado" => "", "type" => "text", "required" => "", "inline" => "false", "editable" => "Yes", "insert" => "Yes", "default" => "", "pk" => "", "extra" => ""), array("column_name" => "temporada", "nullable" => "YES", "data_type" => "varchar", "max_length" => "30", "numeric_pres" => "", "dec" => "", "titulo_campo" => "Temporada=>", "titulo_listado" => "", "type" => "select", "required" => "", "inline" => "false", "editable" => "Yes", "insert" => "Yes", "default" => "Oto-Inv=>Otoño-Invierno,Pri-Ver=>Primavera-Verano,Perm=>Permanente ", "pk" => "", "extra" => ""), array("column_name" => "ligamento", "nullable" => "YES", "data_type" => "varchar", "max_length" => "30", "numeric_pres" => "", "dec" => "", "titulo_campo" => "Ligamento=>", "titulo_listado" => "", "type" => "text", "required" => "", "inline" => "false", "editable" => "Yes", "insert" => "Yes", "default" => "", "pk" => "", "extra" => ""), array("column_name" => "combinacion", "nullable" => "YES", "data_type" => "varchar", "max_length" => "30", "numeric_pres" => "", "dec" => "", "titulo_campo" => "Combinacion=>", "titulo_listado" => "", "type" => "text", "required" => "", "inline" => "false", "editable" => "Yes", "insert" => "Yes", "default" => "", "pk" => "", "extra" => ""), array("column_name" => "especificaciones", "nullable" => "YES", "data_type" => "varchar", "max_length" => "1024", "numeric_pres" => "", "dec" => "", "titulo_campo" => "Especificaciones=>", "titulo_listado" => "", "type" => "textarea", "required" => "", "inline" => "false", "editable" => "Yes", "insert" => "Yes", "default" => "", "pk" => "", "extra" => ""), array("column_name" => "acabado", "nullable" => "YES", "data_type" => "varchar", "max_length" => "30", "numeric_pres" => "", "dec" => "", "titulo_campo" => "Acabado=>", "titulo_listado" => "", "type" => "select", "required" => "", "inline" => "false", "editable" => "Yes", "insert" => "Yes", "default" => "Mate=>Mate,Brilloso=>Brilloso,Semi Brilloso=>Semi Brilloso,Semi Aspero=>Semi Aspero", "pk" => "", "extra" => ""), array("column_name" => "tipo", "nullable" => "YES", "data_type" => "varchar", "max_length" => "30", "numeric_pres" => "", "dec" => "", "titulo_campo" => "Tipo=>", "titulo_listado" => "", "type" => "select", "required" => "", "inline" => "false", "editable" => "Yes", "insert" => "Yes", "default" => "Punto=>Punto,Plano=>Plano,No Tejido=>No Tejido", "pk" => "", "extra" => ""), array("column_name" => "estetica", "nullable" => "YES", "data_type" => "varchar", "max_length" => "30", "numeric_pres" => "", "dec" => "", "titulo_campo" => "Estetica=>", "titulo_listado" => "", "type" => "select", "required" => "", "inline" => "false", "editable" => "Yes", "insert" => "Yes", "default" => "Liso=>Liso,Labrado=>Labrado,Estampado=>Estampado,Labrado-Estampado=>Labrado\/Estampado", "pk" => "", "extra" => ""), array("column_name" => "ancho", "nullable" => "YES", "data_type" => "decimal", "max_length" => "30", "numeric_pres" => "", "dec" => "0", "titulo_campo" => "Ancho=>", "titulo_listado" => "Ancho", "type" => "number", "required" => "", "inline" => "false", "editable" => "Yes", "insert" => "Yes", "default" => "", "pk" => "", "extra" => ""), array("column_name" => "espesor", "nullable" => "YES", "data_type" => "decimal", "max_length" => "", "numeric_pres" => "10", "dec" => "4", "titulo_campo" => "Espesor (mm)=>", "titulo_listado" => "", "type" => "number", "required" => "", "inline" => "false", "editable" => "Yes", "insert" => "Yes", "default" => "", "pk" => "", "extra" => ""), array("column_name" => "gramaje_prom", "nullable" => "YES", "data_type" => "decimal", "max_length" => "30", "numeric_pres" => "", "dec" => "0", "titulo_campo" => "Gramaje Promedio=>", "titulo_listado" => "", "type" => "number", "required" => "", "inline" => "false", "editable" => "Yes", "insert" => "Yes", "default" => "", "pk" => "", "extra" => ""), array("column_name" => "rendimiento", "nullable" => "YES", "data_type" => "decimal", "max_length" => "30", "numeric_pres" => "", "dec" => "2", "titulo_campo" => "Rendimiento (Mts x 1Kg)=>", "titulo_listado" => "", "type" => "number", "required" => "", "inline" => "false", "editable" => "Yes", "insert" => "Yes", "default" => "", "pk" => "", "extra" => ""), array("column_name" => "produc_ancho", "nullable" => "YES", "data_type" => "decimal", "max_length" => "", "numeric_pres" => "10", "dec" => "2", "titulo_campo" => "Ancho Produccion=>", "titulo_listado" => "", "type" => "number", "required" => "", "inline" => "false", "editable" => "Yes", "insert" => "Yes", "default" => "", "pk" => "", "extra" => ""), array("column_name" => "produc_largo", "nullable" => "YES", "data_type" => "decimal", "max_length" => "", "numeric_pres" => "10", "dec" => "2", "titulo_campo" => "Largo  Produccion=>", "titulo_listado" => "", "type" => "number", "required" => "", "inline" => "false", "editable" => "Yes", "insert" => "Yes", "default" => "", "pk" => "", "extra" => ""), array("column_name" => "produc_alto", "nullable" => "YES", "data_type" => "decimal", "max_length" => "", "numeric_pres" => "10", "dec" => "2", "titulo_campo" => "Alto  Produccion=>", "titulo_listado" => "", "type" => "number", "required" => "", "inline" => "false", "editable" => "Yes", "insert" => "Yes", "default" => "", "pk" => "", "extra" => ""), 
        array("column_name" => "mnj_x_lotes", "nullable" => "YES", "data_type" => "varchar", "max_length" => "2", "numeric_pres" => "", "dec" => "", "titulo_campo" => "Manejado Por Lotes=>", "titulo_listado" => "", "type" => "select", "required" => "", "inline" => "false", "editable" => "Yes", "insert" => "Yes", "default" => "Si=>Si,No=>No", "pk" => "", "extra" => ""),
        array("column_name" => "estado", "nullable" => "YES", "data_type" => "varchar", "max_length" => "12", "numeric_pres" => "", "dec" => "", "titulo_campo" => "Estado=>", "titulo_listado" => "", "type" => "select", "required" => "", "inline" => "false", "editable" => "Yes", "insert" => "Yes", "default" => "Activo=>Activo,Inactivo=>Inactivo", "pk" => "", "extra" => ""),
        array("column_name" => "cant_retazo", "nullable" => "YES", "data_type" => "decimal", "max_length" => "", "numeric_pres" => "10", "dec" => "2", "titulo_campo" => "Cant.Recuperado=>", "titulo_listado" => "", "type" => "number", "required" => "", "inline" => "false", "editable" => "Yes", "insert" => "Yes", "default" => "", "pk" => "", "extra" => ""),
        array("column_name" => "precio_retazo", "nullable" => "YES", "data_type" => "decimal", "max_length" => "", "numeric_pres" => "16", "dec" => "2", "titulo_campo" => "Precio Recuperado=>", "titulo_listado" => "", "type" => "number", "required" => "", "inline" => "false", "editable" => "Yes", "insert" => "Yes", "default" => "", "pk" => "", "extra" => "")];
    private $primary_key = 'codigo';
    private $limit = 2000;

    function __construct() {
        $action = $_REQUEST['action'];
        if (isset($action)) {
            $this->{$action}();
        } else {
            $this->main();
        }
    }

    function main() {

        $columns = "";
        foreach ($this->items as $array) {
            $titulo_listado = $array['titulo_listado'];
            if ($titulo_listado !== '') {
                $columns .= $array['column_name'] . ",";
            }
        }

        $columns = substr($columns, 0, -1);


        $t = new Y_Template("Articulos.html");
        $t->Show("headers");
        $t->Show("insert_edit_form"); // Empty div to load here  formulary for edit or new register 	  
        $db = new My();
        $Qry = "SELECT  $columns FROM  $this->table a,sectores s WHERE a.cod_sector = s.cod_sector LIMIT $this->limit";

        $Qry = str_replace("descrip", "a.descrip", $Qry);
        $Qry = preg_replace('/cod_sector/', "s.descrip as cod_sector", $Qry, 1);

        //$Qry = str_replace("cod_sector", "s.descrip as cod_sector", $Qry);

        $db->Query($Qry);

        if ($db->NumRows() > 0) {
            $t->Show("data_header");
            while ($db->NextRecord()) {

                foreach ($this->items as $array) {
                    $column_name = $array['column_name'];
                    $dec = $array['dec'];

                    $value = $db->Record[$column_name];

                    if ($dec > 0) {
                        $t->Set($column_name, number_format($value, $dec, ',', '.'));
                    } else {
                        $t->Set($column_name, $value);
                    }
                }

                $t->Show("data_line");
            }
            $t->Show("data_foot");


            $t->Show("script");
        } else {
            $t->Show("headers");
            $t->Show("data_header");
            $t->Show("data_foot");
            $t->Show("script");
            $t->Show("no_result");
        }
    }

    function addUI() {
        $tmp_con = new My();
        $t = new Y_Template("Articulos.html");
        $t->Show("add_form_cab");

        foreach ($this->items as $array => $arr) {
            $column_name = $arr['column_name'];
            $insert = $arr['insert'];
            $type = $arr['type'];
            $dec = $arr['dec'];


            //echo "$column_name $insert<br>";

            if ($insert === 'Yes') {

                if ($type == "db_select") {
                    $db_options = "\n";
                    $default = $arr['default'];
                    list($tablename, $columns) = explode("=>", $default);
                    $query = "SELECT $columns FROM $tablename";  
                    if($tablename == "unidades_medida"){
                        $query.=" order by um_prior asc";
                    } //echo $query;
                    $tmp_con->Query($query);
                    $col_array = explode(",", $columns);
                    while ($tmp_con->NextRecord()) {
                        $key = "";
                        $values = "";
                        for ($i = 0; $i < sizeof($col_array); $i++) {
                            if ($i == 0) {
                                $key = $tmp_con->Record[$col_array[$i]];
                            } else {
                                $values .= $tmp_con->Record[$col_array[$i]] . " ";
                            }
                        }
                        $values = trim($values);
                        $db_options.='<option value="' . $key . '">' . $values . '</option>' . "\n";
                    }
                    $t->Set("value_of_" . $column_name, $db_options);
                }
            }
        }

        $t->Show("add_form_data");
        $t->Show("add_form_foot");
    }

    /**
     * Edit current line
     */
    function editUI() {
        $pk = $_REQUEST['pk'];

        $columns = "";

        foreach ($this->items as $array => $arr) {
            $columns .= $arr['column_name'] . ",";
        }
        $columns = substr($columns, 0, -1);

        $db = new My();
        $tmp_con = new My();

        $t = new Y_Template("Articulos.html");
        //$t->Show("headers");        
        $Qry = "SELECT $columns FROM $this->table WHERE  $this->primary_key = '$pk'";
        $db->Query($Qry);

        $t->Show("edit_form_cab");
        while ($db->NextRecord()) {
            foreach ($this->items as $array => $arr) {
                $column_name = $arr['column_name'];
                $editable = $arr['editable'];
                $type = $arr['type'];
                $dec = $arr['dec'];
                //$sub_pk = $arr['pk'];

                if ($editable !== 'No') {
                    $value = $db->Record[$column_name];

                    if ($type == "db_select") {
                        $db_options = "\n";
                        $default = $arr['default'];
                        list($tablename, $columns) = explode("=>", $default);
                        $query = "SELECT $columns FROM $tablename";
                        $tmp_con->Query($query);
                        $col_array = explode(",", $columns);
                        while ($tmp_con->NextRecord()) {
                            $key = "";
                            $values = "";
                            $selected = "";
                            for ($i = 0; $i < sizeof($col_array); $i++) {
                                if ($i == 0) {
                                    $key = $tmp_con->Record[$col_array[$i]];
                                    if ($key == $value) {
                                        $selected = 'selected="selected"';
                                    }
                                } else {
                                    $values .= $tmp_con->Record[$col_array[$i]] . " ";
                                }
                            }
                            $values = trim($values);
                            $db_options.='<option value="' . $key . '"  ' . $selected . '  >' . $values . '</option>' . "\n";
                        }
                        $t->Set("value_of_" . $column_name, $db_options);
                    } else if ($type == "select") {
                        $value = $db->Record[$column_name];
                        $def_options = $arr['default'];
                        $items = explode(",", $def_options);
                        $options = "";

                        foreach ($items as $item) {
                            list($val, $opt) = explode("=>", $item);
                            $selected = "";
                            if ($val == $value) {
                                $selected = 'selected="selected"';
                            }
                            $options .= '<option value="' . $val . '" ' . $selected . ' >' . utf8_encode($opt) . '</option>';
                        }
                        $t->Set("value_of_" . $column_name, $options);
                    } else {
                        // echo "$column_name  $dec<br>";
                        if ($dec > 0) {
                            $t->Set("value_of_" . $column_name, number_format($value, $dec, '.', ''));
                            if($column_name == "costo_prom" || $column_name == "costo_cif" ){  
                               $t->Set("value_of_" . $column_name,  number_format($value, $dec, ',', '.'));
                            }                            
                        } else {
                            $chekboxes = array("art_venta", "art_inv", "art_compra");
                            if (in_array($column_name, $chekboxes)) {
                                if ($value == "true") {
                                    $t->Set("value_of_" . $column_name, 'checked="checked"');
                                } else {
                                    $t->Set("value_of_" . $column_name, "");
                                }
                            } else {
                                $t->Set("value_of_" . $column_name, $value);
                            }
                        }
                    }
                }
            }
        }

        $t->Show("edit_form_data");
        $t->Show("edit_form_foot");
    }

    function updateData() {
        $master = $_REQUEST['master'];
        $table = $this->table;

        $primary_keys = $master['primary_keys'];
        $update_data = $master['update_data'];

        $update = "";

        foreach ($update_data as $key => $value) {
            foreach ($this->items as $arr) {
                if ($arr["column_name"] == $key) {
                    if ($this->isCharOrNumber($arr["data_type"]) == "number") {
                        if ($value != '') {
                            $value = str_replace(".","" , $value);
                            $value = str_replace(",","." , $value);
                            $update .=" $key = $value,";
                        }
                    } else {
                        $update .=" $key = '$value',";
                    }
                }
            }
        }
        $update = substr($update, 0, -1);

        $where = " ";
        foreach ($primary_keys as $key => $value) {
            $where .=" $key = '$value' AND";
        }
        $where = substr($where, 0, -4);

        $Qry = "UPDATE $table SET $update WHERE $where;";

        //echo $Qry;

        $my = new My();
        $my->Query($Qry);
        if ($my->AffectedRows() > 0) {
            echo json_encode(array("mensaje" => "Ok"));
        } else {
            echo json_encode(array("mensaje" => "Error", "query" => $Qry));
        }
        $my->Close();
    }

    function addData() {
        $master = $_REQUEST['master'];
        $table = $this->table;

        $data = $master['data'];
        $colnames = "";
        $insert_vlues = "";
        
        $cod_sector = $data["cod_sector"]; 
        $codigo = $this->getProximoCodigo($cod_sector);   
        
        $data["codigo"]  = $codigo;    
        
        foreach ($data as $key => $value) {
            foreach ($this->items as $arr) {
                if ($arr["column_name"] == $key) {
                    $colnames .="$key,";
                    if ($this->isCharOrNumber($arr["data_type"]) == "number") {
                        if ($value != '') {
                            $insert_vlues .="$value,";
                        }else{
                            $insert_vlues .="null,";
                        }
                    } else {
                        $insert_vlues .="'$value',";
                    }
                }
            }
        }
        $colnames = substr($colnames, 0, -1);
        $insert_vlues = substr($insert_vlues, 0, -1);


        $Qry = "INSERT INTO $table ($colnames) VALUES($insert_vlues);";

        //echo $Qry;

        $my = new My();
        $my->Query($Qry);
        if ($my->AffectedRows() > 0) {             
            $my->Query("update sectores set serie = serie + 1 where cod_sector = $cod_sector;");
            echo json_encode(array("mensaje" => "Ok","codigo"=>$codigo));
        }else{
            echo json_encode(array("mensaje" => "Error"));
        }
        $my->Close();
    }

    function getPropiedades() {
        $codigo = $_REQUEST['codigo'];         
        $sql = "SELECT a.cod_prop,a.descrip,valor_def,p.valor FROM art_propiedades a LEFT JOIN prop_x_art p ON  a.cod_prop = p.cod_prop AND p.codigo  = '$codigo' WHERE estado = 'Activo';";
        echo json_encode($this->getResultArray($sql));
    }
    function saveProp(){
        $db = new My();
        $codigo = $_REQUEST['codigo'];        
        $cod_prop = $_REQUEST['cod_prop'];
        $value = $_REQUEST['value'];   
        $db->Query("SELECT COUNT(*) AS cant FROM prop_x_art WHERE codigo = '$codigo' AND cod_prop = $cod_prop");
        $db->NextRecord();
        $cant = $db->Record['cant'];
        if($cant > 0){
            $db->Query("update prop_x_art set valor = '$value' where codigo = '$codigo' AND cod_prop = $cod_prop");
            echo "La propiedad ha sido actualizada con exito!";
        }else{
            $db->Query("insert into prop_x_art(codigo,cod_prop,valor)values('$codigo',$cod_prop,'$value')");
            echo "La propiedad se ha registrado con exito!";
        }
    }
    function getDatosInventario(){
        $codigo = $_REQUEST['codigo'];         
        $sql = "SELECT al.suc,al.nombre ,
        SUM(  IF(cantidad IS NOT NULL AND estado_venta = 'Normal',cantidad,0)) AS StockNormal,
        SUM(  IF(cantidad IS NOT NULL AND estado_venta = 'Oferta',cantidad,0)) AS StockOferta,
        SUM(  IF(cantidad IS NOT NULL AND estado_venta = 'Arribos',cantidad,0)) AS StockArribos,
        SUM(  IF(cantidad IS NOT NULL AND estado_venta = 'Recuperado',cantidad,0)) AS StockRecuperado,
        SUM(  IF(cantidad IS NOT NULL AND estado_venta = 'Promocion',cantidad,0)) AS StockPromocion,
        SUM(  IF(cantidad IS NOT NULL AND estado_venta = 'Bloqueado',cantidad,0)) AS StockBloqueado,
        SUM(  IF(cantidad IS NOT NULL AND estado_venta != 'FP',cantidad,0)) AS StockTotal  
        FROM sucursales al LEFT JOIN stock s 
                ON s.suc = al.suc AND s.codigo = '$codigo' AND estado_venta <> 'FP' WHERE al.estado = 'Activo' 
                GROUP BY suc,codigo  ORDER BY suc ASC;";
        echo json_encode($this->getResultArray($sql));
    }
    function getUsosNoAsignados(){
        $codigo = $_REQUEST['codigo'];         
        $sql = "SELECT cod_uso as ID,descrip FROM  usos u WHERE NOT EXISTS(SELECT * FROM art_x_uso a WHERE u.cod_uso = a.cod_uso AND a.codigo = '$codigo') ORDER BY descrip ASC;";
        echo json_encode($this->getResultArray($sql));
    }
    function getUsosAsignados(){
        $codigo = $_REQUEST['codigo'];         
        $sql = "SELECT a.cod_uso as ID,u.descrip FROM  art_x_uso a, usos u    WHERE  u.cod_uso = a.cod_uso AND a.codigo = '$codigo';";
        echo json_encode($this->getResultArray($sql));
    }
    
    function getMonedaFromListaPrecios(){
        $unidad_medida = $_REQUEST['um'];    
        $moneda = $_REQUEST['moneda'];    
        $um = '"Mts","Kg"';
        if($unidad_medida === "Unid" ){
            $um = '"Unid"';
        }          
        echo json_encode($this->getResultArray("SELECT DISTINCT moneda FROM lista_precios WHERE um IN ($um)")); 
    }
    function getUmFromListaPrecios(){         
        $moneda = $_REQUEST['moneda']; 
        $unidad_medida = $_REQUEST['um']; 
        $um = '"Mts","Kg"';
        if($unidad_medida === "Unid" ){
            $um = '"Unid"';
        } 
        echo json_encode($this->getResultArray("SELECT DISTINCT um FROM lista_precios WHERE   moneda = '$moneda' and um IN ($um) ORDER BY um DESC " ) ); 
    }
    
    function getListaPrecios(){
        $usuario = $_REQUEST['usuario']; 
        $codigo = $_REQUEST['codigo']; 
        $moneda = $_REQUEST['moneda']; 
        $um = $_REQUEST['um']; 
        $db = new My();
        $dbi = new My();
        
        $Qry = "SELECT lpa.codigo, lp.num as num, lp.moneda, lp.descrip,factor,precio FROM lista_precios lp LEFT JOIN lista_prec_x_art lpa ON lp.num =lpa.num AND lp.moneda = lpa.moneda AND lp.um = lpa.um  AND lpa.codigo   = '$codigo' WHERE  lp.moneda ='$moneda' AND lp.um = '$um'  ";  
        $db->Query($Qry);
        while($db->NextRecord()){
            $lpacodigo  = $db->Get("codigo");
            $num  = $db->Get("num"); 
             
            if(is_null($lpacodigo)){
                $dbi->Query("INSERT INTO  lista_prec_x_art(num, moneda, um, codigo, precio, usuario, fecha)VALUES ($num, '$moneda', '$um', '$codigo', 0 , '$usuario',current_date);");
            }
        }
        $lista = "SELECT  lp.num, lp.moneda,lp.um, lp.descrip, REPLACE(CONCAT(ref_num,'-',ref_moneda,'-',ref_um),'$','s') AS ref,factor,precio, lp.regla_redondeo FROM lista_precios lp LEFT JOIN lista_prec_x_art lpa ON lp.num =lpa.num AND lp.moneda = lpa.moneda AND lp.um = lpa.um  AND
        lpa.codigo   = '$codigo' WHERE  lp.moneda ='$moneda' AND lp.um = '$um' ";
        //echo $lista;
        echo json_encode( $this->getResultArray($lista));         
    }    
    
    function guardarListaPrecios(){
        $usuario = $_REQUEST['usuario']; 
        $codigo = $_REQUEST['codigo']; 
        $num = $_REQUEST['num']; 
        $moneda = $_REQUEST['moneda']; 
        $um = $_REQUEST['um']; 
        $precio = $_REQUEST['precio'];         
        $db = new My();
        $db->Query("UPDATE lista_prec_x_art SET  precio = $precio, usuario = '$usuario', fecha = CURRENT_TIME  WHERE num = '$num'  AND moneda = '$moneda' AND um = '$um'  AND codigo = '$codigo';");
        echo $num;
    }
     
    function getListaMateriales(){
        $codigo = $_REQUEST['codigo'];         
        $sql = "SELECT   articulo, ref, descrip, um, cantidad, rendimiento, precio_unit, sub_total FROM inmopy.lista_materiales WHERE codigo ='$codigo';";
        echo json_encode($this->getResultArray($sql));
    }
    function asignar(){
        $db = new My();
        $codigo = $_REQUEST['codigo'];         
        $ids = json_decode($_REQUEST['ids']);         
        foreach ($ids as $cod_uso) {
            $db->Query("INSERT INTO  art_x_uso(cod_uso, codigo)VALUES ($cod_uso, '$codigo');");
        }
        echo json_encode(array("mensaje"=>"Ok"));
    }
    function desasignar(){
        $db = new My();
        $codigo = $_REQUEST['codigo'];         
        $ids = json_decode($_REQUEST['ids']);         
        foreach ($ids as $cod_uso) {
            $db->Query("delete from  art_x_uso where codigo = '$codigo' and cod_uso = $cod_uso;"); 
        }
        echo json_encode(array("mensaje"=>"Ok"));
    }
    
    function generarCodigo(){
        $cod_sector = $_REQUEST['cod_sector'];    
        $sql = "SELECT CONCAT(prefijo, LPAD(serie + 1,longitud,'0')) AS codigo FROM sectores WHERE cod_sector = $cod_sector";  
        echo json_encode($this->getResultArray($sql));
    }
    function getProximoCodigo($cod_sector){
       $sql = "SELECT CONCAT(prefijo, LPAD(serie + 1,longitud,'0')) AS codigo, serie FROM sectores WHERE cod_sector = $cod_sector";   
       return $this->getResultArray($sql)[0]['codigo'];
    }

    function isCharOrNumber($data_type) {
        $numerics = array("int", "decimal", "double", "float", "smallint", "tinyint", "bigint");
        if (in_array($data_type, $numerics)) {
            return "number";
        } else {
            return "char";
        }
    }
    function buscarArticulos(){
        $db = new My();
        $t = new Y_Template("Articulos.html");
        $filtro = $_REQUEST['filtro'];
        if(isset($_REQUEST['filtro'])){
           $filtro = " AND ". $filtro." ";
        }
        $sql = "SELECT codigo, clase, a.descrip, s.descrip AS sector, um,  ancho,costo_prom as precio_costo FROM  articulos a, sectores s WHERE a.cod_sector = s.cod_sector $filtro order by codigo asc";
        $db->Query($sql);
        $t->Show("search_ui_header");
        while($db->NextRecord()){
            $codigo = $db->Record['codigo'];
            $clase = $db->Record['clase'];
            $descrip = $db->Record['descrip'];
            $sector = $db->Record['sector'];
            $um = $db->Record['um'];
            $ancho = $db->Record['ancho'];
            $precio_costo = $db->Record['precio_costo'];
            $t->Set("codigo",$codigo);
            $t->Set("clase",$clase);
            $t->Set("descrip",$descrip);
            $t->Set("sector",$sector);
            $t->Set("um",$um);
            $t->Set("ancho", number_format($ancho, 2, ',', '.'));
            $t->Set("precio_costo",$precio_costo);
            $t->Show("search_ui_line");
        }
        $t->Show("search_ui_foot");
    }
    
    function addToListaMat(){
         $db = new My();  
         $codigo = $_REQUEST['codigo'];
         $articulo = $_REQUEST['articulo'];
         $cantidad = $_REQUEST['cantidad'];
         $mtr = $_REQUEST['mtr'];
         $rend = $_REQUEST['rend'];
         $p_costo = $_REQUEST['p_costo'];
         
         $sub_total = $cantidad *  $p_costo;
         
         $Qry = "SELECT  descrip, um FROM articulos WHERE codigo ='$articulo'";
         $db->Query($Qry);
         $db->NextRecord();
         $descrip = $db->Record['descrip'];
         $um = $db->Record['um'];
         
         $db->Query("select count(*) as cant from lista_materiales where codigo = '$codigo' and articulo ='$articulo'");
         $db->NextRecord();
         $cant = $db->Record['cant'];
         
         if($cant > 0){
             $upd = "update lista_materiales set cantidad = $cantidad, rendimiento = $rend, precio_unit = $p_costo ,sub_total = $sub_total where codigo = '$codigo' and articulo ='$articulo'";
             $db->Query($upd);
         }else{
             $ins = " INSERT INTO lista_materiales(codigo, articulo, ref, descrip, um, cantidad, rendimiento, precio_unit, sub_total)
             VALUES ('$codigo', '$articulo', '$mtr', '$descrip', '$um', $cantidad, $rend, $p_costo,  $sub_total );"; 
             $db->Query($ins);
         }
          
         echo json_encode(array("mensaje"=>"Ok"));
    }
    function deleteFromListaMat(){
        $db = new My();  
        $codigo = $_REQUEST['codigo'];
        $articulo = $_REQUEST['articulo'];
        $db->Query("delete from lista_materiales where codigo = '$codigo' and articulo ='$articulo'");
        echo "Ok";
    }
    function addBarcode(){
        $db = new My();  
        $codigo = $_REQUEST['codigo'];
        $barcode = $_REQUEST['barcode'];
        $db->Query("INSERT INTO codigos_barras(codigo, barcode)VALUES ('$codigo', '$barcode');");
        $affected_rows = $db->AffectedRows();
        echo json_encode(array("resultado"=>$affected_rows)); 
    }
    function getCodigoBarras(){
        $codigo = $_REQUEST['codigo'];
        echo json_encode($this->getResultArray("SELECT barcode FROM codigos_barras WHERE codigo = '$codigo'")); 
    }
    function deleteBarcode(){
       $db = new My();  
       $codigo = $_REQUEST['codigo'];
       $barcode = $_REQUEST['barcode'];
       $db->Query("DELETE FROM codigos_barras WHERE codigo = '$codigo'  AND barcode = '$barcode' ;");
       $affected_rows = $db->AffectedRows();
       echo json_encode(array("resultado"=>$affected_rows)); 
    }
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
    function checkPreciosXMoneda(){
       $db = new My();  
       $codigo = $_REQUEST['codigo'];
       $moneda = $_REQUEST['moneda'];
       $um = $_REQUEST['um'];
       $array = $this->getResultArray("SELECT num AS cat,precio FROM lista_prec_x_art WHERE codigo = '$codigo' AND um = '$um' AND moneda = '$moneda'");
       //print_r($array);
       $precios = array();
       foreach ($array as $arr_cat) {
           $cat = $arr_cat['cat'];            
           $precios["precio_$cat"] = floatval($arr_cat['precio']);
       }
       echo json_encode($precios);  
    }

}

new Articulos();
?>
