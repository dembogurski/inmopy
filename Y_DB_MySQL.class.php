<?php
 
 
/* require_once("Config.class.php"); */
/*
  ---------------------------------------------------------
  | Y_DB_MySQL.class.php    Abstration for MySQL engine     |
  |---------------------------------------------------------|
  | @author   Sergio A. Pohlmann <spohlmann@softhome.net>   |
  | @date     february, 26 of 2003                          |
  |---------------------------------------------------------|
  | Instance variables:                                     |
  | -------------------                                     |
  | $this->Host         is a Hostname to connect            |
  | $this->Database     a Database name                     |
  | $this->User         user name                           |
  | $this->Password     a user password                     |
  | $this->Link_ID      Connection Status                   |
  | $this->ID_Query     Query Status                        |
  | $this->Record       Query Result                        |
  | $this->Row          Row number                          |
  | $this->Errno        Error number                        |
  | $this->Error        Error name                          |
  |                                                         |
  | Instance Methods:                                       |
  | -----------------                                       |
  | Connect()     Makes a connection with the database      |
  |                                                         |
  | Database()    Returns a Database Name                   |
  |                                                         |
  | Query( string sql)                                      |
  |               Makes a query with a sql string           |
  |                                                         |
  | Halt ( string message )                                 |
  |               Halt the system and print a message       |
  |                                                         |
  | NextRecord()  Returns a next record                     |
  |                                                         |
  | Seek( string var )                                      |
  |               Makes a seek search with a var            |
  |                                                         |
  | AffectedRows()                                          |
  |               Returns a number of query affected rows   |
  |                                                         |
  | NumRows()     Returns a number os query rows            |
  |                                                         |
  | Begin()       Start a transactional sequence            |
  |                                                         |
  | Commit()      Ends a transactional sequence and save    |
  |                                                         |
  | Rollback()    Ends a transactional without save         |
  |                                                         |
  | Close()       Close a connection                        |
  |                                                         |
  | Internal Methods:                                       |
  | -----------------                                       |
  | none                                                    |
  ---------------------------------------------------------

  ---------------------------------------------------------
  | Note:                                                   |
  |       - This file is extended for a "Y_DB" class        |
  |                                                         |
  ---------------------------------------------------------

  CHANGELOG

  2003 Abr 19 - Inserted a Close() method
  2003 Feb 26 - Complete and tested a fisrt version
  2005 Dic 04 - Inserted a Rollback() method
  2015 Feb 05 - Changes for Only MySQL Conexion Include Config.class.php By Doglas A. Dembogurski
  
 */

require_once("Config.class.php");

class My {

    /**
     *  Constructor
     *  ===========
     */
    function __construct() {
        $c = new Config();
 
        $this->Host = $c->getDBHost();  // Hostname
        $this->Database = $c->getDBName();  // Database
        $this->User = $c->getDBUser();  // User
        $this->Password = $c->getDBPassw();  // Passwd
        $this->Link_ID = 0;               // Connect Status
        $this->ID_Query = 0;               // Query Status
        $this->Record = array();         // Query Result
        $this->Status = "ER";   // Status of Query
        $this->Row = 0;                        // Row number
        $this->Errno = 0;               // Error number
        $this->Error = "";              // Error name
        $this->NoLog = 0;               // No log a ROLLBACK
        $this->MakeLog = true;
    }

    /**
     *  Connect - Make a main connection
     *  ================================
     */
    function Connect() {

        for ($conn = 0; $conn < 10; $conn++) {
            $this->Link_ID = @mysqli_connect($this->Host, $this->User, $this->Password, $this->Database);
            if ($this->Link_ID) {
                break;
            }
            $this->Wait(10);
        }
        if (!$this->Link_ID) {
            $this->Halt("Cannot connect");
        }
        if (mysqli_connect_errno()) {
            $this->Halt("Failed to connect to MySQL: " . mysqli_connect_error());
        }
        
		 $this->Link_ID->set_charset("utf8");
        return;
      }

    /** 
     *  Wait - Waits for a number of cycles
     *  ===================================
     *
     */
    function Wait($time) {
        for ($i = 0; $i < $time; $i++) {
            $nn = $i * 2;
        }
    }

// Wait() ------------------------------------------------------------

    /**
     *  Halt - Stop the system and print an error message
     *  =================================================
     *
     */
    function Halt($msg) {   

        global $Global;
        // New Error control
        
        
        echo "{'estado':'error','tipo':'MySQL','mensaje':'" . $this->Errno . " <br>" . $this->Error." $msg '}" ;
        // # 162       $this->Query("ROLLBACK;");
            
//      alert( "ERROR: " . $this->Error . "(" . $this->Errno .")" );    
 // # 162       $this->Query("ROLLBACK;");
        $this->NoLog = 1;

        $Global['SQL_Status'] = "ER";
        $this->log($Global['username'], 'SQL ' . $this->Errno . " - " . $this->Error, $Global['SQL_Status'], $msg);
        die();
    }

    /**
     *  Query - Makes a query with a $Qry string
     *  ========================================
     */
    function Query($Qry){
        global $Global;
        if (!$this->Database) {
            $this->Database = $Global['project'];
        }
        if (!$this->Link_ID) {
            $this->Connect();   // Makes a connection
        }
        
//      $Global['SQL_Status'] = "ER"; 
        $this->ID_Query = mysqli_query($this->Link_ID, $Qry);
        $this->Row = 0;
        /* $this->Errno = mysqli_errno(0);
          $this->Error = mysqli_error(0); */


        if (!$this->ID_Query) {
            if ($this->NoLog == 0) {
                 $this->Halt("Invalid query: " . $Qry);
                 
                //  throw new  Exception( $Qry,$this->Error, $this->Errno);
                $this->Errno = $this->Error;
            } else {
                $this->NoLog = 0;
            }
        } else {
            //$Global['SQL_Status'] = "OK"; 
        }
        $this->Log($Qry . "  " . $this->Errno . "  " . $this->Error);
        return $this->ID_Query;
    }

    /**
     *  Log - Makes a log of a query string
     *  ========================================
     */
    function Log($Qry) {  
        
      // ##### 16 - LOG Control
        if ($this->MakeLog) {
            require_once("Functions.class.php");
            $fn = new Functions();
            $ip = $fn->getIP();
            $user = "";
            if( isset($_REQUEST['usuario']) ){
                $user = $_REQUEST['usuario'];
            }else{
                $user = $GLOBALS['username'].">>";
            }
            
            $c = new Config();            
            $desc = fopen($c->getSQLLogFile(), "a+");
            $datetime = date("d-m-Y H:i:s");
            $log = "($user)[$datetime],[$ip] $Qry";
            fputs($desc, $log . "\n");
             
            fclose($desc);
        }
    }
    
    /**
     *  NextRecord - Next Record
     *  ========================
     */
    function NextRecord() {
        $this->Record = mysqli_fetch_assoc($this->ID_Query);
        $this->Row +=1;
        /* $this->Errno = mysqli_errno(0);
          $this->Error = mysqli_error(0); */
        $stat = is_array($this->Record);
        if (!$stat) {
            mysqli_free_result($this->ID_Query);
            $this->ID_Query = 0;
        }
        return $stat;
    }

    /**
     *  Seek - return a row to a $pos data
     *  ==================================
     */
    function Seek($pos) {
        $status = mysqli_data_seek($this->ID_Query, $pos);
        if ($status) {
            $this->Row = $pos;
        }
        return;
    }

    /**
     *  AffectedRows - A number of affected rows
     *  ========================================
     */
    function AffectedRows() {
        return mysqli_affected_rows($this->Link_ID);
    }

    /**
     *  NumRows - Return a number of rows of a query result
     *  ===================================================
     */
    function NumRows() {
        return mysqli_num_rows($this->ID_Query);
    }

    /**
     *  Begin - Begins a transactional sequence
     *  =======================================
     */
    function Begin() {	
        mysqli_begin_transaction($this->Link_ID,MYSQLI_TRANS_START_READ_WRITE);
        //$this->Query("START TRANSACTION;");
        return true;
    }
    function autocommit($bool){
        mysqli_autocommit($this->Link_ID, $bool);
    }
 
    /**
     *  Commit - Write a transactional sequence
     *  ========================================
     */
    function Commit() {
        //$this->Query("COMMIT;");
 	if (!mysqli_commit($this->Link_ID)) {
           return false;  
        }else{
           return true;
        }
    }

    /**
     *  Rollback - Cancel a transactional sequence
     *  ========================================
     */
    function Rollback() {
        //$this->Query("ROLLBACK;");
        mysqli_rollback($this->Link_ID);
        $this->Close();
        return true;
    }


    /**
     *  Close - Close a connection
     *  ==========================
     */
    function Close() {
//        $this->Query("COMMIT;");
// # 167		
//        $this->Query("SET AUTOCOMMIT=1;");	
        return mysqli_close($this->Link_ID);
    }
    /**
     * 
     * @param type $var
     * Get - Similar to $db->Record['var'] 
     * Use - Get('var')
     */
    function Get($var){
       return $this->Record[$var];
    }
    function getErrno(){
        return $this->Errno;
    }
    
    function ExecuteQueries($array){
        global $Global;
        if (!$this->Database) {
           $this->Database = $Global['project'];
        }
        if (!$this->Link_ID) {
            $this->Connect();   // Makes a connection            
        } 
        mysqli_begin_transaction($this->Link_ID,MYSQLI_TRANS_START_READ_WRITE);	
        foreach ($array as $Qry) {
           mysqli_query($this->Link_ID, $Qry);
        }
        mysqli_commit($this->Link_ID);  
        mysqli_close($this->Link_ID);
    }

}

?>
