<?PHP
/**
* Datos del servidor MSSQL
* Nombre: SERVERSAP
* User: sa
* Pass: inmopy123.
*/

include_once ( "ConfigMS.class.php" );
class MS{

	//Constructor
	function MS(){
	$c = new ConfigMS();
        $this->Host     = $c->getDBHost();	 	//Hostname
        $this->Database = $c->getDBName();		//Database
        $this->User     = $c->getDBUser();		//User
        $this->Password = $c->getDBPassw();		//Passwd
        $this->GenData  = $c->getGenericDB();	//Generic Database ##### 14
        $this->Link_ID  = 0;				// Connect Status
        $this->ID_Query = 0; 				// Query Status
        $this->Record   = array();			// Query Result
        $this->Row = 0;					    // Row number
        $this->Status	 = "ER";			// Status of Query
        $this->Errno    = 0;				// Error number
        $this->Error    = "";				// Error name
        $this->MakeLog=false;
	}
	function Connect() {
         for( $conn=0; $conn<10; $conn++ ){
            $this->Link_ID = sqlsrv_connect( 
            $this->Host, ["Database"=>$this->Database,"UID"=>$this->User, "PWD"=>$this->Password] );
            if( $this->Link_ID ){
                break;
            }
            $this->Wait(10);
        }
        if( !$this->Link_ID ){
            $this->Halt( "Cannot connect".print_r( sqlsrv_errors(), true));
        }
        return;

    }
    /** 
     *  Wait - Waits for a number of cycles
     *  ===================================
     *
     */
    
    function Wait( $time ) {
        for( $i=0; $i<$time; $i++){
            $nn=$i*2;
        }
    }
	
	 /**
     *  Halt - Stop the system and print an error message
     *  =================================================
     *
     */
    function Halt( $msg ) {    
        global $Global;
        // New Error control        
        echo "`_RPC_error_`" . $this->Errno . "`" . $this->Error .
            "`" . $msg ;        
        $this->NoLog = 1;
        $Global['SQL_Status'] = "ER";
        $this->log( $Global['username'], 'SQL ' .
                    $this->Errno . " - " . $this->Error , $Global['SQL_Status'], $msg );       
    }
	
	/**
     *  Query - Makes a query with a $Qry string
     *  ========================================
     */

    function Query( $Qry ) {
        global $Global;
        if( !$this->Database ){
        	$this->Database = $Global['project'];
        }
        if ( !$this->Link_ID ) {
            $this->Connect();   // Makes a connection
        }
		/**
		* Parametros conexion, query, arreglo vacio correspondiente a datos del query 'no se usa'
		*  por ultimo parametro de opcion, se usa para que sqlsrv_num_rows funcione 
		*/
        $this->ID_Query=sqlsrv_query( $this->Link_ID, $Qry, array(), array("Scrollable"=>"keyset"));
        $this->Row = 0;
        $this->Error = sqlsrv_errors();

        if (!$this->ID_Query) {
            if( $this->NoLog == 0 ) {
                $this->Halt( "Invalid query: " . $Qry );
            }
            else{
                $this->NoLog = 0;
            }
        }
        else{
            //$Global['SQL_Status'] = "OK"; 
        }
        //$this->Log( $Qry."  ".$this->Errno."  ".$this->Error );
        return $this->ID_Query;
    }
	
	
	/**
     *  NextRecord - Next Record
     *  ========================
     */
    function NextRecord() {
        $this->Record=sqlsrv_fetch_array( $this->ID_Query, SQLSRV_FETCH_ASSOC);
        $this->Row +=1;
        $this->Error = sqlsrv_errors();
        $stat = is_array($this->Record);
        if (!$stat) {
            sqlsrv_free_stmt($this->ID_Query);
            $this->ID_Query=0;
        }
        return $stat;
    }
	
	/**
     *  AffectedRows - A number of affected rows
     *  ========================================
     */
    function AffectedRows() {
        return sqlsrv_rows_affected( $this->ID_Query );
    }
	
	/**
     *  NumRows - Return a number of rows of a query result
     *  ===================================================
     */
    function NumRows() {
        return sqlsrv_num_rows( $this->ID_Query );
    }
	
	/**
     *  Begin - Begins a transactional sequence
     *  =======================================
     */
    function Begin() {
		
        $this->Query("BIGIN TRAN;");
        return true;
    }
 



    /**
     *  Commit - Write a transactional sequence
     *  ========================================
     */
    function Commit() {
        $this->Query("COMMIT TRAN;");		
		return true;
    }


    /**
     *  Rollback - Cancel a transactional sequence
     *  ========================================
     */
    function Rollback() {
        $this->Query("ROLLBACK TRAN;");
		$this->Close();
        return true;
    }
	
	/**
     *  Close - Close a connection
     *  ==========================
     */
 
    function Close() {
        return sqlsrv_close( $this->Link_ID ) ;
    }
    
    function Log($Qry) {
        // ##### 16 - LOG Control
        if ($this->MakeLog) {
            $c = new Config();
            $desc = fopen($c->getSQLLogFile(), "a");
            fputs($desc, $Qry . "\n");
            fclose($desc);
        }
    }


}//Class



?>