<?php
   // $callback ='mycallback';

    if(isset($_GET['mycallback']))  {
        $callback = $_GET['mycallback'];
    }

    $port = $_GET['port'];
    
    if(!isset($port)){
       $port = "ttyS0";
    }
  
    $arr_mts =array();


if (strtoupper(substr(PHP_OS, 0, 3)) === 'LIN') {
    $py = "import serial; ser = serial.Serial('/dev/$port',2400,timeout=2);v = ser.read(17);print v;ser.close();"; 
    $raw_res = shell_exec('python -c "'.$py.'"');
  
    //echo "Raw: ".$raw_res."<br><br>";

    $c = (float)str_replace(",",".",  substr($raw_res,1, strpos($raw_res,"T")-1));
    //echo "C: ". (float)$c."<br><br>";

    $t=  (float)str_replace(",",".", trim( substr($raw_res, strpos($raw_res,"T")+1)));
    //echo "T: |". $t."|<br><br>";

     
    $arr_mts['metros']=$c;
    $arr_mts['total']=$t;
    

    echo $callback.'('. json_encode($arr_mts).')';
} 

?>
