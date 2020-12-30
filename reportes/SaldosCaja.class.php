<?PHP
require_once("../Y_DB_MySQL.class.php");
require_once("../utils//tbs_class.php");         

$link = New My();
$link->Connect();
$desde = isset($_GET['desde'])?flipDate($_GET['desde'],'/'):false;
$hasta = isset($_GET['hasta'])?flipDate($_GET['hasta'],'/'):false;
$suc = $_GET['select_suc'];
$usuario = $_GET['user'];


$sql_ok = ( isset($link->Link_ID)) ? 1 : 0;
if ($sql_ok==0 || $desde==='01-01-1970' || $hasta==='01-01-1970') $link->Link_ID = 'clear';

$TBS = new clsTinyButStrong;
$TBS->LoadTemplate('SaldosCaja.html');

$query = "select suc,fecha,if(e.m_cod<>'U$','G$',e.m_cod) as moneda,sum(if(e.m_cod<>'U$',e.entrada_ref,e.entrada)) as entrada,sum(if(e.m_cod<>'U$',e.salida_ref,e.salida)) as salida,(sum(if(e.m_cod<>'U$',e.entrada_ref,e.entrada)) - sum(if(e.m_cod<>'U$',e.salida_ref,e.salida))) as diff from efectivo e where fecha between '$desde' and '$hasta' and suc like '$suc' group by suc, fecha,moneda having(if(moneda='U$',diff>0.50 or diff<-0.50,diff>100 or diff<-100)) order by suc*1 asc,fecha asc, moneda asc";
$TBS->MergeBlock('data',$link->Link_ID,$query);

$TBS->Show();

function flipDate($date,$separator){
   $date = explode($separator,$date);
   return $date[2].$separator.$date[1].$separator.$date[0];
}     

?>