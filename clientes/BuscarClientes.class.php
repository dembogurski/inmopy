<?PHP
require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");

class BuscarClientes{
   private $template;
   private $url;

   function __construct(){
      $this->template  = new Y_Template("BuscarClientes.html");
   }

   public function start(){
       $this->host = $_SERVER['HTTP_HOST'] != '190.128.150.70:8081'?'192.168.2.222':'190.128.150.70';
       $this->url = "http://$this->host:8081";
       $this->template->Set("url",$this->url);
       $this->template->Show("header");
       $this->template->Set("canModCat",$this->canModCat($_REQUEST['usuario'])?"":"disabled");       
       $this->template->Show("body");
   }

   public function buscar_clientes(){
      $hit = $_POST['hit'];
      $link = new My();
      $where = '';
      $resultado = array();
      if(preg_match_all('/[0-9]/',$hit)){
          $where = "( cod_cli like '%$hit%' OR  ci_ruc like '%$hit%') ";
      }else{
          $where = "nombre like '%$hit%'";
      }
      $query = "SELECT cod_cli ,nombre , dir, tel ,ci_ruc , cat , ciudad , pais , ocupacion, situacion, email, date_format(fecha_nac,'%d/%m/%Y') as fecha_nac,tipo_doc  ,geoloc,limite_credito,plazo_maximo,cant_cuotas,cuotas_atrasadas,porc_min_senia FROM clientes  WHERE $where limit 20";
      $link->Query($query);
      while($link->NextRecord()){
          array_push($resultado,array_map("utf8_encode",$link->Record));
      }
      $link->Close();      
      echo json_encode($resultado);
   }

   function quienRegistroA(){
       $CodCli = $_REQUEST['CodCli'];
       $my = new My();
       $regCli = array();
       $my->Query("SELECT c.usuario AS Usuario,c.suc AS Suc, date_format(fecha_reg,'%d/%m/%Y')  AS Fecha FROM clientes c LEFT JOIN usuarios u ON c.usuario = u.usuario WHERE cod_cli = '$CodCli'");
       if($my->NextRecord()){
           $regCli = array_map('utf8_encode',$my->Record);
       }
       echo json_encode($regCli);
   }

   function actualizarCliente(){
       $array = $_REQUEST;
       $url = $_REQUEST['url'];
       $Qry = "UPDATE clientes SET ";
       $where = "";
       
       //print_r($array);
       foreach ($array as $key => $value) {
           if($key != "cod_cli" && $key != "callback" && $key != "action" ){
               $val = trim(  str_replace("+"," ",$value) );
               $Qry.=" $key='$val',";
           } 
           if($key == "cod_cli"){
               $where = "    WHERE cod_cli = '$value';";
           }
       }
       $Qry = substr($Qry, 0,-1);
       
       $Qry.= $where;
        
       $db = new My();
        
       $db->Query($Qry);
        
       echo json_encode(array("status"=>"Ok"));
      
   }

    function checkearRUC() {
        require_once("../Functions.class.php");
        $ruc = explode("-",trim($_POST['ruc']));
        $tipo_doc = $_POST['tipo_doc'];
        $respuesta = array();
        $f = new Functions();

        $CI = $ruc[0];        
        $dv = $f->calcularDV($CI);
        $respuesta['DV'] = $dv['DV'];
        echo json_encode($respuesta);
    }

    public function actualizarTickets(){
        $link = new My();
        $datos = json_decode($_POST['datos'],true);
        $cod_cli = $datos['cod_cli'];
        $query = "UPDATE factura_venta SET ";
        $first = true;

        foreach($datos as $key=>$value){
            if($key != 'cod_cli'){
                $query .= ($first)? "$key = '$value'":",$key = '$value'";
                $first = false;
            }
        }

        $link->Query($query." WHERE estado <> 'Cerrada' AND cod_cli = '$cod_cli'");
        $cantidadActualizados = $link->AffectedRows();
        if($cantidadActualizados > 0){
            echo "$cantidadActualizados Tickets Actualizados";
        }else{
            echo "No se actualizaron Tickets";
        }
    }

    private function canModCat($user){
        $link = new My();
        $link->Query("SELECT trustee as permiso from usuarios u inner join usuarios_x_grupo g using(usuario) inner join permisos_x_grupo p using(id_grupo) where u.usuario = '$user' AND  p.id_permiso = '6.1.1'");
        $link->NextRecord();
        return ((int)$link->Record['permiso'] == "vem")?true:false;
    }
}

$BuscarClientes = new BuscarClientes();
if(isset($_REQUEST['action'])){   
   call_user_func_array(array($BuscarClientes,$_REQUEST['action']), explode(',', $_REQUEST['args']));
}else{
    $BuscarClientes->start();
}
?>