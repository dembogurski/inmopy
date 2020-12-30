<?php
    $callback ='mycallback';
 
    if(isset($_GET['mycallback']))  {
        $callback = $_GET['mycallback'];
    }   
    $arr_peso =array();
    
	$arr_peso['estado']="estable";
	$arr_peso['peso']="1.260";
	echo $callback.'(' . json_encode($arr_peso) . ')';
	
 
?>