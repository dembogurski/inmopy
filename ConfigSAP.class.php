<?php



class ConfigSAP{

    const DbServerType = 7;
    const Server = "SERVER2"; // SERVER
    const CompanyDB = "MARIJOA_SAP"; //MARIJOA_SAP MARIJOASA_PRUEBA
    const username = "SapPHP"; // Develop Usuario con Licencia Indirecta
    const password = "rootdba";  // rootdba
    const DbUserName = "sa";
    const DbPassword = "Marijoa123.";  //Marijoa123.
    //const LicenceServer ="192.168.2.220:30000"; //Unused

    function getDBServerType(){
        return self::DbServerType;
    }
    function getServer(){
       return self::Server;   
    }
    function getCompanyDB(){
       return self::CompanyDB;   
    }
    function getUsername(){
       return self::username;   
    }
    function getPassword(){
       return self::password;   
    }
    function getDBUserName(){
       return self::DbUserName;   
    }
    function getDbPassword(){
       return self::DbPassword;   
    }
    function connectToSAP(){
       
        $lErrCode = 0;
        $sErrMsg = "";

        $vCmp = new COM("SAPbobsCOM.Company") or die ("No connection");
        $vCmp->DbServerType = $this->getDBServerType();
        $vCmp->Server = $this->getServer();
        $vCmp->CompanyDB = $this->getCompanyDB();
        $vCmp->username = $this->getUsername();
        $vCmp->password = $this->getPassword();
        $vCmp->DbUserName = $this->getDBUserName();
        $vCmp->DbPassword = $this->getDbPassword();
        //$vCmp->LicenceServer ="Serversap:30000";  
        
        $lRetCode = $vCmp->Connect();
        
        
        echo $lRetCode;
        if ($lRetCode != 0){
             $lErrCode=0;
             $sErrMsg="";
             $vCmp->GetLastError($lErrCode, $sErrMsg);
             require_once("Log.class.php");
             $l = new Log();
             $l->error("Error al Conectar con SAP ".__FILE__." ".__LINE__." ErrCode: $lErrCode   ErrMsg: $sErrMsg");     
             echo "ERROR: (".$lErrCode.") ".$sErrMsg;
        }else{
           return $vCmp;
        }  
        /**
         * Usage $vSN = $vCmp->GetBusinessObject(2);
                 $vSN->CardCode = "C01";
         *       $err = $vSN->add;  if ($err==0)  { ok  }
         */ 
 
         
    }

}
?>

