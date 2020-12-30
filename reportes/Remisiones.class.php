<?PHP
require_once("../Y_DB_MySQL.class.php");
require_once("../Y_Template.class.php");

class Remisions{
   private $desde;
   private $hasta;
   private $r_desde;
   private $r_hasta;
   private $suc;
   private $usuario;
   private $estado;
   private $fecha_ref;
   private $direccion;
   private $t;
   private $n_nro;
   private $rn_nro;
   private $resumido;

   function __construct(){
      $this->t = new Y_Template("Remisiones.html");   
      if(isset($_REQUEST['rn_nro']) && strlen(trim($_REQUEST['rn_nro'])) > 0 || isset($_REQUEST['n_nro']) && strlen(trim($_REQUEST['n_nro'])) > 0){
        if(isset($_REQUEST['rn_nro'])){
            $this->start($_REQUEST['rn_nro']);
        }else{
            $this->start($_REQUEST['n_nro']);
        }
      }else{
        $this->r_desde = $_GET['desde'];
        $this->r_hasta = $_GET['hasta'];
        $this->desde = $this->flipDate($this->r_desde,'/');
        $this->hasta = $this->flipDate($this->r_hasta,'/');
        $this->estado = $_GET['tipo'];
        $this->fecha_ref = $_GET['fecha_ref'];
        $this->direccion = $_GET['direccion'];
        $this->rn_nro = trim($_GET['rn_nro']);
        $this->suc = $_GET['suc'];
        $this->usuario = $_GET['user']; 
        $this->resumido = isset($_GET['resumido'])?($_GET['resumido'] == 'true'):false;
        $this->sucsTodos = isset($_GET['sucsTodos'])?($_GET['sucsTodos'] == 'true'):false;
        $this->start();
        
      }   
      
   }

   function start($n_nro=false){
       $link = new My();
       $link2 = new My();
       $condicion = '';
       $this->t->Show('header');
       if($n_nro){
            $condicion = " r.n_nro = $n_nro ";
            $this->direccion = 'suc';
            $this->t->Set('style','style="display:none;"');
       }else{
           if($this->sucsTodos){
               //$condicion = " r.n_nro = $this->rn_nro and ( r.suc = '$this->suc' or r.suc_d = '$this->suc' ) ";
               $condicion = " r.estado like '$this->estado' and $this->fecha_ref BETWEEN '$this->desde' AND '$this->hasta' ";
           }else{
               $condicion = " r.$this->direccion = '$this->suc' and r.estado like '$this->estado' and $this->fecha_ref BETWEEN '$this->desde' AND '$this->hasta' ";
            }
            $this->t->Set('usuario',$this->usuario);
            $this->t->Set('suc',$this->suc);
            $this->t->Set('desde',$this->r_desde);
            $this->t->Set('hasta',$this->r_hasta);
                        
       }
       $this->t->Set('time',date('d-n-Y H:i'));
       $this->t->Show('sub_header');
       
       //$query = "SELECT r.n_nro,r.fecha,r.hora,r.usuario,r.recepcionista,r.suc,r.suc_d,r.fecha_cierre,r.hora_cierre,r.estado, transportadora, nro_levante from nota_remision r where  $condicion";
       $query = "SELECT r.n_nro,r.fecha,r.hora,r.usuario,r.recepcionista,r.suc,r.suc_d,r.fecha_cierre,r.hora_cierre,r.estado, transportadora, nro_levante, COUNT(DISTINCT d.paquete) AS bultos FROM nota_remision r LEFT JOIN nota_rem_det d USING(n_nro) WHERE $condicion GROUP BY r.n_nro ORDER BY r.$this->direccion ASC";
       //echo $query;
       $link->Query($query);
	   if($this->resumido){
		   $this->t->Show("header_rem");
	   }
       while($link->NextRecord()){
           if(!$this->resumido){
			   $this->t->Show("header_rem");
		   }
           $records = $link->Record;
           $records['bultos'] = ($records['bultos'] == 0)?'*':$records['bultos'];
           $n_nro = $records['n_nro'];
           $query2 = "SELECT codigo,lote,descrip,cantidad,gramaje,ancho,round(tara) as tara,kg_env,kg_rec,cant_calc_env,cant_calc_rec,estado from nota_rem_det where n_nro=$n_nro";
           foreach($records as $key=>$value){
               if(preg_match('/^fecha/',$key)){
                   $this->t->Set($key,$this->flipDate($value,'-'));
               }else{
                   $this->t->Set($key,$value);
               }
           }
           $this->t->Show("header_data_rem");
           if(!$this->resumido){
			   
			   $this->t->Show("data_rem_det_h");
			   $link2->Query($query2);
			   while($link2->NextRecord()){
				   $det_records = $link2->Record;
					foreach($det_records as $key=>$value){
						$this->t->Set($key,$value);
					}
					$this->t->Show("data_rem_det");
			   }
			   $this->t->Show("data_rem_footer");
           }
           
       }
       $this->t->Show("footer");
       
   }

   
    function flipDate($date,$separator){
    $date = explode($separator,$date);
    return $date[2].'-'.$date[1].'-'.$date[0];
    }
}

$remisiones = new Remisions();


?>