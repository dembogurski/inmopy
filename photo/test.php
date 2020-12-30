<html>
<head>
<script>
function openImg(element){
	var myWindow = window.open(element.getAttribute("alt"),"_blank");
	myWindow.document.write("<div id='image'></div>");
	var img = document.createElement("img");
	img.src=element.src;
	myWindow.document.getElementById("image").appendChild(img);
}
</script>
</head>
<body>
<?php
//exec ("gphoto2 --auto-detect", $output);
if($filename = $_GET['file']){
	exec("/usr/local/bin/gphoto2 --capture-image-and-download  --force-overwrite --filename $filename.jpg",$salida);
}

if(count($salida)>3){
	$error = json_encode($salida);
	echo "Ocurrio un Error $error";
}else{
	echo "ok";
}
$archivos = scandir('.');
//print_r($salida);
?>
<form action="test.php">
<input name="file" id="file" type="text" />
<input  type="submit" value="Captura" />
</form>
<?php 
foreach($archivos as $file) {
	$path = pathinfo($file);
	if(strtolower($path['extension'])=='jpg'){	
		$filename = $path['filename'];

?>
<img heigth="640" width="480" onclick="openImg(this)" src="<?php echo $file; ?>" alt="<?php echo $filename ?>" />
<?php 
	}
}
 ?>

</body>
</html>