<?php

require_once("../../Y_Template.class.php");

/**
 * Description of ClockParser
 *
 * @author Doglas
 */
class ClockParser {

    function __construct() {
        $action = $_REQUEST['action'];
        if (isset($action)) {
            $this->{$action}();
        } else {
            $this->main();
        }
    }

    function main() {
        $t = new Y_Template("ClockParser.html");
        $t->Show("headers");
        $t->Show("body");
    }

    function procesar() {
        $data = $_REQUEST['data'];

        $master = array();
        $hours = array();

        $separator = "\r\n";

        $line = strtok($data, $separator);

        $old_id = "";
        $old_name = "";
        $old_date = "";
        $old_hour = "";

        $id_name = substr($line, 0, -16);

        $id = trim(substr($id_name, 0, strpos($id_name, "\t")));

        $nombre = trim(substr($id_name, strpos($id_name, "\t"), 200));

         //echo "$id --> $nombre    $line  <br>";

        $fecha_hora = substr($line, -16);
        $fecha = trim(substr($fecha_hora, 0, -5));
        $hora = substr($fecha_hora, -5);
        array_push($hours, $hora);


        while ($line !== false) {
            $line = strtok($separator);

            $id_name = substr($line, 0, -16);

            $id = trim(substr($id_name, 0, strpos($id_name, "\t")));

            $nombre = trim(substr($id_name, strpos($id_name, "\t"), 200));

            //echo "$id --> $nombre<br>";

            $fecha_hora = substr($line, -16);
            $fecha = trim(substr($fecha_hora, 0, -5));
            $hora = substr($fecha_hora, -5);

            //echo "$line  <br> $fecha --> $hora<br>";
           // echo "( old_id $old_id != '' && id $id != old_id $old_id ) || (fecha $fecha != oldfecha $old_date && oldfecha $old_date != ''<br>";
           
            $prueba = ($old_id != "" && $id != $old_id ) || ($fecha != $old_date && $old_date != "");
            
            if (($old_id != "" && $id != $old_id ) || ($fecha != $old_date && $old_date != "")) {  
                   
                    $person->id = $old_id;
                    $person->name = $old_name;
                    $person->date = $old_date;
                    $person->hours = $hours;
                    
                    $persona = array("id"=>$old_id,"name"=>$old_name,"date"=>$old_date,"hours"=>$hours);
 
              
                    //echo "cargando  $old_id   $old_name    $old_date<br>";
                     
                    array_push($master, $persona);

                    $hours = array();
                    array_push($hours, $hora);
                 
            } else {
                array_push($hours, $hora);
            }


            $old_id = $id;
            $old_date = $fecha;
            $old_name = $nombre;
        }

        //print_r($master);
        
        echo json_encode($master);
    }

}

new ClockParser();
?>