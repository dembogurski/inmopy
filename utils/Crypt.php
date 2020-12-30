<?php


$clave = sha1("chavo08");


echo  "Clave encripdada que conoce el Usuario    ". $clave."<br><br>";


$cadena_encriptada = sha1($clave);

echo "Cadena encriptada con    $clave =     $cadena_encriptada<br><br>";


$combinacion = substr($cadena_encriptada,-8);

echo "Combinacion para el Crasha:   usuario $combinacion";

 



?>