<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta http-equiv="cache-control" content="max-age=0" /> 
    <meta http-equiv="cache-control" content="no-cache" />
    <meta http-equiv="expires" content="0" /> 
    <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT" />
    <meta http-equiv="pragma" content="no-cache" /> 
    <link rel="stylesheet" type="text/css" href="css/login.css?_=00000000000" /> 
    <link rel="icon" type="image/x-icon" href="img/fav_icon.ico">
    <link rel="shortcut icon" href="img/fav_icon.ico" type="image/x-icon">
    <link rel="shortcut icon" href="img/fav_icon.png" />
    <link rel="apple-touch-icon" href="img/fav_icon.png" />
    <?php
    if(!isset($_REQUEST['relogin'])){
        echo '<script type="text/javascript" src="js/jquery-2.1.3.min.js" > </script>';        
    }
    ?>
    <script type="text/javascript" src="js/login.js?_=000000000000000111111" > </script>
    <script type="text/javascript" src="js/jquery-ui/jquery-ui.min.js" > </script>
   
    <title>Iniciar Sesi&oacute;n</title> 
</head>

<body>
    <div> 
        <div style="text-align: center" > <img src="img/logo_small.jpg" width="424" height="140" alt="Gestiones Inmobiliarias"> </div>
           <h2 class="titulo_inicial">   Inicia sesi&oacute;n para acceder al Sistema    </h2> 
           <div name="login" class="login">
               <form method="post" name="loginform" action="Main.class.php">
                   <input type="text" name="usuario" id="login_usuario" placeholder="Usuario" maxlength="30" value="<?php  echo "".$_REQUEST['usuario'].""; ?>"  onkeypress="return validar(event);" onblur="userBlur()" <?php if(isset($_REQUEST['usuario'])){ echo 'disabled="disabled"';  } ?>     >  
                   <input type="password" id="login_password" placeholder="Contrase&ntilde;a" maxlength="26"  >  
                   <span class="eye_container"><img src="img/closed_eye.png" width="24px" class="eye" ><span><br> 
                   <?php
                        if(isset($_REQUEST['relogin'])){
                            echo '<input type="button" class="login_button" id="relogin_button" value="Restaurar Sesi&oacute;n" onclick="doRelogin()" >';                            
                        }else{
                            echo '<input type="button" class="login_button" id="login_button" value="Iniciar Sesi&oacute;n" onclick="dologin()" >';                                          
                        }
                        
                        function isMobile() {  
                           return preg_match("/(android|avantgo|blackberry|bolt|boost|cricket|docomo|fone|hiptop|mini|mobi|palm|phone|pie|tablet|up\.browser|up\.link|webos|wos)/i", $_SERVER["HTTP_USER_AGENT"]);
                        }
                        $https = false;
                        if(isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == "on") { 
                            $https = true;
                        }  
                   ?> 
                   <br>
                   <span id="msg_login" class="msg" style="height: 26px">&nbsp;</span> 
                   <input type="hidden" name="session" id="session" value="">
                   <input type="hidden" id="hash" value="">
                   <input type="hidden" id="sucursal" name="sucursal" value="">
               </form>
           </div>
    </div>
</body>

</html>
