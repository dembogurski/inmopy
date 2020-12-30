<?php

require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");

/**
 * Description of Audit
 *
 * @author Doglas
 */
class Proveedores {

    private $table = 'proveedores';
    private  $items = [array("column_name"=>"cod_prov","nullable"=>"NO","data_type"=>"varchar","max_length"=>"10","numeric_pres"=>"","dec"=>"","titulo_campo"=>"Cod Prov=>","titulo_listado"=>"Cod Prov","type"=>"text","required"=>"required","inline"=>"false","editable"=>"readonly","insert"=>"No","default"=>"","pk"=>"PRI","extra"=>""),array("column_name"=>"cta_cont","nullable"=>"NO","data_type"=>"varchar","max_length"=>"30","numeric_pres"=>"","dec"=>"","titulo_campo"=>"Cta Cont=>","titulo_listado"=>"","type"=>"db_select","required"=>"required","inline"=>"false","editable"=>"Yes","insert"=>"Yes","default"=>"plan_cuentas=>cuenta,nombre_cuenta","pk"=>"MUL","extra"=>""),array("column_name"=>"tipo_doc","nullable"=>"YES","data_type"=>"varchar","max_length"=>"30","numeric_pres"=>"","dec"=>"","titulo_campo"=>"Tipo Doc=>","titulo_listado"=>"Tipo Doc","type"=>"text","required"=>"","inline"=>"false","editable"=>"Yes","insert"=>"Yes","default"=>"","pk"=>"","extra"=>""),array("column_name"=>"ci_ruc","nullable"=>"YES","data_type"=>"varchar","max_length"=>"30","numeric_pres"=>"","dec"=>"","titulo_campo"=>"Ci Ruc=>","titulo_listado"=>"Ci Ruc","type"=>"text","required"=>"required","inline"=>"false","editable"=>"Yes","insert"=>"Yes","default"=>"","pk"=>"","extra"=>""),array("column_name"=>"nombre","nullable"=>"YES","data_type"=>"varchar","max_length"=>"60","numeric_pres"=>"","dec"=>"","titulo_campo"=>"Nombre=>","titulo_listado"=>"Nombre","type"=>"text","required"=>"required","inline"=>"false","editable"=>"Yes","insert"=>"Yes","default"=>"","pk"=>"","extra"=>""),array("column_name"=>"tel","nullable"=>"YES","data_type"=>"varchar","max_length"=>"30","numeric_pres"=>"","dec"=>"","titulo_campo"=>"Tel=>","titulo_listado"=>"Tel","type"=>"text","required"=>"","inline"=>"false","editable"=>"Yes","insert"=>"Yes","default"=>"","pk"=>"","extra"=>""),array("column_name"=>"email","nullable"=>"YES","data_type"=>"varchar","max_length"=>"40","numeric_pres"=>"","dec"=>"","titulo_campo"=>"Email=>","titulo_listado"=>"Email","type"=>"text","required"=>"","inline"=>"false","editable"=>"Yes","insert"=>"Yes","default"=>"","pk"=>"","extra"=>""),array("column_name"=>"fecha_nac","nullable"=>"YES","data_type"=>"date","max_length"=>"","numeric_pres"=>"","dec"=>"","titulo_campo"=>"Fecha Nac=>","titulo_listado"=>"Fecha Nac","type"=>"date","required"=>"","inline"=>"false","editable"=>"Yes","insert"=>"Yes","default"=>"","pk"=>"","extra"=>""),array("column_name"=>"pais","nullable"=>"YES","data_type"=>"varchar","max_length"=>"30","numeric_pres"=>"","dec"=>"","titulo_campo"=>"Pais=>","titulo_listado"=>"","type"=>"db_select","required"=>"","inline"=>"false","editable"=>"Yes","insert"=>"Yes","default"=>"paises=>codigo_pais,nombre","pk"=>"","extra"=>""),array("column_name"=>"ciudad","nullable"=>"YES","data_type"=>"varchar","max_length"=>"30","numeric_pres"=>"","dec"=>"","titulo_campo"=>"Ciudad=>","titulo_listado"=>"","type"=>"text","required"=>"","inline"=>"false","editable"=>"Yes","insert"=>"Yes","default"=>"","pk"=>"","extra"=>""),array("column_name"=>"dir","nullable"=>"YES","data_type"=>"varchar","max_length"=>"60","numeric_pres"=>"","dec"=>"","titulo_campo"=>"Dir=>","titulo_listado"=>"","type"=>"textarea","required"=>"","inline"=>"false","editable"=>"Yes","insert"=>"Yes","default"=>"","pk"=>"","extra"=>""),array("column_name"=>"ocupacion","nullable"=>"YES","data_type"=>"varchar","max_length"=>"30","numeric_pres"=>"","dec"=>"","titulo_campo"=>"Ocupacion=>","titulo_listado"=>"","type"=>"text","required"=>"","inline"=>"false","editable"=>"Yes","insert"=>"Yes","default"=>"","pk"=>"","extra"=>""),array("column_name"=>"situacion","nullable"=>"YES","data_type"=>"varchar","max_length"=>"30","numeric_pres"=>"","dec"=>"","titulo_campo"=>"Situacion=>","titulo_listado"=>"","type"=>"text","required"=>"","inline"=>"false","editable"=>"Yes","insert"=>"Yes","default"=>"","pk"=>"","extra"=>""),array("column_name"=>"tipo","nullable"=>"YES","data_type"=>"varchar","max_length"=>"16","numeric_pres"=>"","dec"=>"","titulo_campo"=>"Tipo=>","titulo_listado"=>"","type"=>"select","required"=>"","inline"=>"false","editable"=>"Yes","insert"=>"Yes","default"=>"Local=>Local,Extranjero=>Extranjero","pk"=>"","extra"=>""),array("column_name"=>"usuario","nullable"=>"NO","data_type"=>"varchar","max_length"=>"30","numeric_pres"=>"","dec"=>"","titulo_campo"=>"Usuario=>","titulo_listado"=>"","type"=>"text","required"=>"","inline"=>"false","editable"=>"Yes","insert"=>"Auto","default"=>"","pk"=>"MUL","extra"=>""),array("column_name"=>"fecha_reg","nullable"=>"YES","data_type"=>"date","max_length"=>"","numeric_pres"=>"","dec"=>"","titulo_campo"=>"Fecha Reg=>","titulo_listado"=>"Fecha Reg","type"=>"date","required"=>"","inline"=>"false","editable"=>"Yes","insert"=>"Auto","default"=>"","pk"=>"","extra"=>""),array("column_name"=>"estado","nullable"=>"YES","data_type"=>"varchar","max_length"=>"10","numeric_pres"=>"","dec"=>"","titulo_campo"=>"Estado=>","titulo_listado"=>"Estado","type"=>"select","required"=>"","inline"=>"false","editable"=>"Yes","insert"=>"Yes","default"=>"Activo=>Activo,Inactivo=>Inactivo","pk"=>"","extra"=>""),
        array("column_name" => "moneda", "nullable" => "NO", "data_type" => "varchar", "max_length" => "", "numeric_pres" => "", "dec" => "", "titulo_campo" => "Moneda=>", "titulo_listado" => "Moneda", "type" => "db_select", "required" => "", "inline" => "false", "editable" => "Yes", "insert" => "Yes", "default" => "monedas=>m_cod,m_descri", "pk" => "", "extra" => "")];    
    private $primary_key = 'cod_prov';
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
        foreach ($this->items as $array){ 
            $titulo_listado = $array['titulo_listado'];
            
            if($titulo_listado !== ''){ 
                $data_type =  $array['data_type'];
                if($data_type == "date"){
                    $colname = $array['column_name'];
                    $columns .= "DATE_FORMAT($colname,'%d-%m-%Y') as $colname,";
                }else{
                    $columns .= $array['column_name'].",";   
                }                
            }
        }
        
        $columns = substr($columns,0, -1);
          
		
        $t = new Y_Template("Proveedores.html");
        $t->Show("headers");
	$t->Show("insert_edit_form");// Empty div to load here  formulary for edit or new register 	  
        $db = new My();     
        $Qry = "SELECT  $columns FROM  $this->table LIMIT $this->limit"; 
        $db->Query($Qry);

        if ($db->NumRows() > 0) {
            $t->Show("data_header");
            while ($db->NextRecord()) {
                
               foreach ($this->items as $array){
                  $column_name = $array['column_name'];
                  $dec = $array['dec'];
                  
                  $value = $db->Record[$column_name];
                  
                  if($dec > 0 ){
                      $t->Set($column_name, number_format($value, $dec, ',', '.'));
                  }else{
                     $t->Set($column_name, $value);             
                  }
               }                

               $t->Show("data_line");
            }
            $t->Show("data_foot");
		 
            
	    $t->Show("script");
        } else {
            $t->Show("script");
            $t->Show("no_result");
        }
    }
    
    function addUI(){
        $tmp_con = new My();
        $t = new Y_Template("Proveedores.html");
        $t->Show("add_form_cab");
         
           foreach ($this->items as $array => $arr) {           
             $column_name = $arr['column_name'];
             $insert = $arr['insert'];
             $type = $arr['type'];
             $dec = $arr['dec'];
             
             
             //echo "$column_name $insert<br>";
             
             if($insert === 'Yes'){
                  
                if($type == "db_select"){
                    $db_options = "\n";
                    $default = $arr['default'];
                    list($tablename,$columns) = explode("=>",$default);     
                    
                    $query = "SELECT $columns FROM $tablename"; 
                    if($column_name == "cta_cont"){
                       $query.=" WHERE cuenta in('21111','21112')"; 
                    }
                    $tmp_con->Query($query);
                    $col_array = explode(",",$columns);
                    while($tmp_con->NextRecord()){ 
                        $key = "";
                        $values = "";
                        for($i = 0; $i < sizeof($col_array); $i++){
                          if($i == 0){
                             $key = $tmp_con->Record[ $col_array[$i] ];
                          }else{ 
                              if($column_name == "cta_cont"){
                                 $values .= "$key - ". $tmp_con->Record[ $col_array[$i] ]." ";
                              }else{
                                 $values .= $tmp_con->Record[ $col_array[$i] ]." ";
                              }                              
                          } 
                        }
                        $values = trim($values);
                        
                        $db_options.='<option value="'.$key.'">'.$values.'</option>'."\n";
                    }                        
                    $t->Set("value_of_".$column_name,$db_options);
                }                
                
             }
           }
               
        $t->Show("add_form_data");
        $t->Show("add_form_foot");         
    }
    

    /**
     * Edit current line
     */
    function editUI(){
        $pk = $_REQUEST['pk'];
        
        $columns = "";
          
        foreach ($this->items as $array => $arr) {           
           $columns .= $arr['column_name'].",";          
        }        
        $columns = substr($columns,0, -1);
        
        $db = new My(); 
        $tmp_con = new My();
		  
        $t = new Y_Template("Proveedores.html");
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
             
             if($editable !== 'No'){
                $value = $db->Record[$column_name]; 
                 
                if($type == "db_select"){
                    $db_options = "\n";
                    $default = $arr['default'];
                    list($tablename,$columns) = explode("=>",$default);        
                    $query = "SELECT $columns FROM $tablename";   
                    if($column_name == "cta_cont"){
                       $query.=" WHERE cuenta in('21111','21112')"; 
                    }
                    $tmp_con->Query($query);
                    $col_array = explode(",",$columns);
                    while($tmp_con->NextRecord()){ 
                        $key = "";
                        $values = "";
                        $selected = "";
                        for($i = 0; $i < sizeof($col_array); $i++){
                          if($i == 0){
                             $key = $tmp_con->Record[ $col_array[$i] ];
                             if($key == $value){
                                  $selected = 'selected="selected"';
                             }
                                 
                          }else{  
                              if($column_name == "cta_cont"){
                                 $values .= "$key - ".$tmp_con->Record[ $col_array[$i] ]." ";
                              }else{
                                 $values .= $tmp_con->Record[ $col_array[$i] ]." ";
                              } 
                          } 
                        }
                        $values = trim($values);
                        $db_options.='<option value="'.$key.'"  '.$selected.'  >'.$values.'</option>'."\n";
                    }                        
                    $t->Set("value_of_".$column_name,$db_options);
                }else{
                   if($dec > 0){
                       $t->Set("value_of_".$column_name,number_format($value, $dec, ',', '.'));
                   }else{
                       $t->Set("value_of_".$column_name,$value);
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
              if($arr["column_name"] == $key){
                 if($this->isCharOrNumber( $arr["data_type"]) == "number" ){
                     if($value != ''){
                        $update .=" $key = $value,";       
                     }
                 }else{
                    $update .=" $key = '$value',";      
                 }
              }    
           }            
       }
       $update = substr($update, 0,-1);
       
       $where = " ";
       foreach ($primary_keys as $key => $value) {
           $where .=" $key = '$value' AND";       
       }
       $where = substr($where, 0,-4);
       
       $Qry = "UPDATE $table SET $update WHERE $where;";
       
       //echo $Qry;
       
       $my = new My();
       $my->Query($Qry);
       if($my->AffectedRows() > 0){
           echo json_encode(array("mensaje"=>"Ok"));
       }else{
           echo json_encode(array("mensaje"=>"Error","query"=>$Qry));
       }           
       $my->Close();      
       
    }
    
    function addData(){
       $master = $_REQUEST['master'];   
       $usuario = $_REQUEST['usuario'];    
       $table = $this->table;        
       
       $data = $master['data'];
       $colnames = "cod_prov,usuario,fecha_reg,";
       
       
       $my = new My();
       $SQLCardCode = "SELECT CONCAT('P',LPAD((SUBSTRING(cod_prov,2) +1),5,'0')) as CardCode   FROM proveedores ORDER BY cod_prov DESC LIMIT 1";
       $my->Query($SQLCardCode);
       
       if($my->NumRows() > 0){
           $my->NextRecord();           
           $NewCardCode = $my->Record['CardCode']; // Actual Max CardCode
           
       }else{
           $NewCardCode = 'P000001';
       }
        
       $insert_vlues = "'$NewCardCode','$usuario',current_date,";
        
       foreach ($data as $key => $value) {
           foreach ($this->items as $arr) {
              if($arr["column_name"] == $key){
                 $colnames .="$key,";   
                 if($this->isCharOrNumber( $arr["data_type"]) == "number" ){
                     if($value != ''){    
                        $insert_vlues .="$value,";  
                     }
                 }else{
                   $insert_vlues .="'$value',";  
                 }
              }    
           }            
       }
       $colnames = substr($colnames, 0,-1);
       $insert_vlues = substr($insert_vlues, 0,-1);
        
       
       $Qry = "INSERT INTO $table ($colnames) VALUES($insert_vlues);";
       $my->Query($Qry);
       //echo $Qry;
       
      
       if($my->AffectedRows() > 0){
           echo json_encode(array("mensaje"=>"Ok"));
       }           
       $my->Close();         
    }
    
    function isCharOrNumber($data_type){
        $numerics = array("int","decimal","double","float","smallint","tinyint","bigint");
        if (in_array($data_type, $numerics)) {
            return "number";
        }else{
            return "char";
        }        
    }
    
    function buscarProveedor(){
       require_once("../Functions.class.php");
       $criterio = $_POST['criterio'];
       $campo = $_POST['campo'];
       $limit = $_POST['limit'];
       $sql = "SELECT  cod_prov AS CardCode ,nombre AS CardName,ci_ruc AS RUC,moneda AS Currency, pais FROM proveedores WHERE $campo LIKE '$criterio'   ORDER BY nombre  ASC LIMIT $limit";
 
       $fn = new Functions();
       
       $proveedores = $fn->getResultArray($sql);
       echo json_encode($proveedores);        
    }
    
    function addContacto(){
       $id = $_POST['c_id'];
       $nombre = $_POST['nombre'];
       $doc = $_POST['doc']; 
       $tel = $_POST['tel']; 
       $cod_ent = $_POST['cod_ent']; 
       $my = new My();
       $my->Query("INSERT INTO  contactos(id_contacto, codigo_entidad, nombre, doc, tel)VALUES ('$id', '$cod_ent', '$nombre', '$doc', '$tel');");
       echo "Ok";
    }
    function getContactos(){
       require_once("../Functions.class.php");
       $cod_ent = $_POST['cod_ent'];
       $fn = new Functions();       
       $contacts = $fn->getResultArray("SELECT id_contacto AS id, nombre,doc,tel FROM contactos WHERE codigo_entidad = '$cod_ent' ORDER BY id_contacto ASC");
       echo json_encode($contacts);        
    }
    function delContacto(){
        $cod_ent = $_POST['cod_ent'];
        $id = $_POST['id'];
        $my = new My();
        $my->Query("delete from contactos where id_contacto = '$id' and codigo_entidad = '$cod_ent'");
        echo "Ok";
    }
    
    function addMovil(){
       $id = $_POST['c_id'];
       $rua = strtoupper( $_POST['rua']);
       $chapa = strtoupper( $_POST['chapa']); 
       $marca = strtoupper( $_POST['marca']); 
       $cod_ent = $_POST['cod_ent']; 
       $my = new My();
       $my->Query(" INSERT INTO moviles(id_movil, codigo_entidad, rua, chapa, marca)VALUES ('$id', '$cod_ent', '$rua', '$chapa', '$marca');");
       echo "Ok";
    }
    function getMoviles(){
       require_once("../Functions.class.php");
       $cod_ent = $_POST['cod_ent'];
       $fn = new Functions();       
       $contacts = $fn->getResultArray("SELECT id_movil as id, codigo_entidad, rua, chapa, marca FROM moviles WHERE codigo_entidad = '$cod_ent' ORDER BY id_movil ASC");
       echo json_encode($contacts);        
    }
    function delMovil(){
        $cod_ent = $_POST['cod_ent'];
        $id = $_POST['id'];
        $my = new My();
        $my->Query("delete from moviles where id_movil = '$id' and codigo_entidad = '$cod_ent'");
        echo "Ok";
    }
}


new Proveedores();
?>
