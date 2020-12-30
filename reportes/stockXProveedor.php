<?PHP
 
require_once("../utils//tbs_class.php");


echo "En desarrollo consultar con informatica";

if(isset($_REQUEST['action'])){
   call_user_func($_REQUEST['action']);
}else{
  $suc = $_GET['suc'];
  $emp = $_GET['emp'];
  $usuario = $_GET['user'];
  $desde = flipDate($_GET['desde'],'/');
  $hasta =flipDate($_GET['hasta'],'/');
  $target_suc = $_GET['select_suc'];
  $sector = $_GET['select_sector'];
  $articulo = $_GET['select_articulos'];
  $codProveedor = $_GET['select_proveedor'];
  $agrupadoCodigo = $_GET['agrupadoCodigo'];
  $agrupadoSuc = $_GET['agrupadoSuc'];
  $agrupadoColor = $_GET['agrupadoColor'];
  $select_docentry = $_GET['select_docentry'];
  $proveedorNombre = nombreProveedor($codProveedor);
  $compras = comprasByDocEntry($select_docentry);
   
}
 
?>