<?PHP
require_once("../utils\\tbs_class.php");
include('../utils\plugins\\tbs_plugin_opentbs.php'); 
$TBS = new clsTinyButStrong;
$TBS->Plugin(TBS_INSTALL, OPENTBS_PLUGIN);
$TBS->VarRef = json_decode($_GET['datos'],true);
//var_dump(json_decode($_POST['datos'],true));
$TBS->LoadTemplate('pagare_a_la_orden.docx', OPENTBS_ALREADY_UTF8);
$TBS->Show(OPENTBS_DOWNLOAD, $file_name);

?>