<?php
  
  
if(isset($_REQUEST['action'])){
	$function = $_REQUEST['action'];	
	call_user_func($function);
}else{
	if(isset($_REQUEST['file'])  &&  isset($_REQUEST['cam_name']) && strlen(trim($_REQUEST['file'])) > 0 && isset($_GET['mycallback'])){
            $callback = $_GET['mycallback'];
            $filename = "images/".$_REQUEST['file'] ;
            $camName = $_REQUEST['cam_name'];
            $array =array();
            
            $command = "/usr/local/bin/gphoto2 --camera '$camName' --capture-image-and-download  --force-overwrite --filename $filename.jpg";
            //$command = "/usr/local/bin/gphoto2 --camera '$camName' --capture-image-and-download  --force-overwrite --filename $filename_thum.jpg";
            //$command = "/usr/local/bin/gphoto2 --camera '$camName' --capture-image-and-download  --stdout | convert - -resize 50% -quality 95 $filename.jpg";

            exec($command,$salida);


            if( count($salida) > 3 || count($salida)==0){
                    //  Error de comunicación con la camara.                  
                    $array['msg']= "Error";
                    $array['error']=  json_encode($salida);
            }else{
                exec("convert $filename.jpg -resize 50% -quality 75 $filename.jpg");
                //Thumnail
                exec("convert $filename.jpg -resize 10% -quality 100 -strip $filename.thum.jpg");
                
                $array['msg']= "Ok";
                $array['img']= "photo/$filename.jpg";
                
                $imagedata = file_get_contents("$filename.jpg");
                $base64 = base64_encode($imagedata);
                
                $thumdata = file_get_contents("$filename.thum.jpg");
                $base64thum = base64_encode($thumdata);
                
                $array['base64']= $base64;
                $array['thumnail64']= $base64thum;
                //echo '{"msj":"OK","img":"'.$_SERVER['SERVER_ADDR']."/photo/$filename.jpg".'"}';
                echo $callback.'(' . json_encode($array) . ')';
            }		
	}else{
            $array['msg']= "Error";
            $array['error']=  "Paremetros incorrectos.";
            echo $callback.'(' . json_encode($array) . ')';        
        }
}

function camList(){
    $callback ='mycallback';
 
    if(isset($_GET['mycallback']))  {
        $callback = $_GET['mycallback'];
    }   
    $array =array();

    exec("/usr/local/bin/gphoto2 --auto-detect",$salida);
    $cam = preg_split('/\s{2,}+/', $salida[2]);
    if(count($cam)>1){
        //	echo '{"model":"'.$cam[0].'"}';
        $array['msg']= "Ok";
        $array['model']= $cam[0];
    }else{
        $array['msg']= "Error";
    }        
    echo $callback.'(' . json_encode($array) . ')';
}

?>