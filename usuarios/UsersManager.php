<?php
session_start();
include_once '../Y_DB_MySQL.class.php';
include_once '../Y_Template.class.php';

class UserManager
{

    private $template;

    function __construct()
    {
    }

    // Main
    function start()
    {
        $template = new Y_Template("UsersManager.html");
        $userSucs = $this->getUserSucs();
        $sucOP = '';
        foreach ($userSucs as $key => $val) {
            $suc = $val['suc'];
            $sucOP .= "<option value='$suc'>$suc</option>";
        }

        $template->Set("user_list", json_encode($this->getUserData()));
        $template->Show("var_ini");
        $template->Show("head");
        $template->Set("users_sucs", $sucOP);
        
        $template->Show("users_list_h");
        $template->Show("users_list_f");
        $template->Show("footer");
    }

    function getUserData()
    {
        $my_link = new My();
        $usuarios = array();
        $my_link->query("SELECT suc,usuario, nombre, apellido,estado FROM usuarios order by usuario asc");
        while ($my_link->NextRecord()) {
            array_push($usuarios, $my_link->Record);
        }
        return $usuarios;
    }

    function getUserSucs()
    {
        $my_link = new My();
        $userSucs = array();
        $my_link->query("SELECT distinct(suc) FROM usuarios order by (suc/1) asc");
        while ($my_link->NextRecord()) {
            array_push($userSucs, $my_link->Record);
        }
        return $userSucs;
    }

    function miPerfil()
    {
        $t = new Y_Template("Perfil.html");
        $db = new My();
        $user = $_POST['usuario'];
        $t->Set("usuario", $user);
        $t->Show("head");
        $t->Show("users_list_h");
        
        $db->query("SELECT usuario, nombre, apellido FROM usuarios where usuario = '$user';");
        while ($db->NextRecord()) {
            $t->Set("user_nick", $db->Record['usuario']);
            $t->Set("user_apellido", ucwords(strtolower($db->Record['apellido'])));
            $t->Set("user_nombre", ucwords(strtolower($db->Record['nombre'])));
            $t->Show("urers_list");
        }
        $t->Show("users_list_f");
        $t->Show("footer");
    }

    //Obtiene los datos de un usuario
    function getUser()
    {
        $user = $_POST['user'];
        $db = new My();
        $index = 0;
        $t = new Y_Template("UsersManager.html");
        $t->Show("head");
        //Cabecera = contenido de los Labels html
        $cabecera = ["usuario"=>36,"documento"=>12,"nombre"=>36,"apellido"=>36,"telefono"=>36,"e-mail"=>36,"direccion"=>255,"fecha nacimiento"=>10,"fecha de contratacion"=>10,"limite de sesion"=>3,"sucursal"=>2,"estado"=>10,"vendedor tipo"=>6,"sueldo fijo"=>21,"sueldo contable"=>21];
        $max_input_size = 27;
        $indices = array_keys($cabecera);
            
        $db->query("SELECT usuario, doc,nombre, apellido, tel, email, dir, "
                . "fecha_nac, fecha_cont, limite_sesion, suc, "
                . "estado,id_tipo,sueldo_fijo,sueldo_contable FROM usuarios WHERE usuarios.usuario = '$user';");
        
        $db->NextRecord();
        $res = $db->Record;
        $t->Set("user", $res["usuario"]);
        
        if (file_exists("../img/usuarios/$user.jpg")) {
            $t->Set("foto", $user);
        } else {
             $t->Set("foto", "no_image");
        }
         
        
        
        $t->Show("r_table_h");
         
        foreach ($res as $key => $value) {
            if ($index != 0) {
                if ((int)$cabecera[$indices[$index]] < $max_input_size) {
                    $t->Set("max_l", $cabecera[$indices[$index]]);
                    $t->Set("max_s", $cabecera[$indices[$index]]);
                } else {
                    $t->Set("max_l", $cabecera[$indices[$index]]);
                    $t->Set("max_s", $max_input_size);
                }
                $t->Set("label", ucfirst($indices[$index]).":");
                if ($key === "fecha_nac" || $key === "fecha_cont") {
                    $t->Set("content", $this->flipDate($value, '-', '/'));
                } else {
                    $t->Set("content", $value);
                }
                $t->Set("id", $key);
                $t->Show("r_table_b");
            }
            $index ++;
        }
                

        $t->Show("r_table_f");
        $t->Show("footer");
        $db->Close();
    }

    //Obtiene los datos de un usuario
    function getPerfil()
    {   
        $user = $_POST['user'];
        $db = new My();
        $index = 0;
        $t = new Y_Template("Perfil.html");
        $t->Show("head");
        //Cabecera = contenido de los Labels html
        $cabecera = ["usuario"=>36,"documento"=>12,"nombre"=>36,"apellido"=>36,"telefono"=>36,"e-mail"=>36,"direccion"=>255,"fecha nacimiento"=>10,"fecha de contratacion"=>10,"limite de sesion"=>4,"sucursal"=>2,"estado"=>10,"vendedor tipo"=>6];
        $max_input_size = 27;
        $indices = array_keys($cabecera);
            
        $db->query("SELECT usuario, doc,nombre, apellido, tel, email, dir, "
                . "fecha_nac, fecha_cont, limite_sesion, suc, "
                . "estado,id_tipo FROM usuarios WHERE usuarios.usuario = '$user';");    
        
        $db->NextRecord();
        $res = $db->Record;
        $t->Set("user", $res["usuario"]);
        
        if (file_exists("../img/usuarios/$user.jpg")) {
            $t->Set("foto", $user);
        } else {
             $t->Set("foto", "no_image");
        }
        
        $t->Show("r_table_h");
        foreach ($res as $key => $value) {
            if ($index != 0) {
                if ((int)$cabecera[$indices[$index]] < $max_input_size) {
                    $t->Set("max_l", $cabecera[$indices[$index]]);
                    $t->Set("max_s", $cabecera[$indices[$index]]);
                } else {
                    $t->Set("max_l", $cabecera[$indices[$index]]);
                    $t->Set("max_s", $max_input_size);
                }
                $t->Set("label", ucfirst($indices[$index]).":");
                if ($key === "fecha_nac" || $key === "fecha_cont") {
                    $t->Set("content", $this->flipDate($value, '-', '/'));
                } else {
                    $t->Set("content", $value);
                }
                $t->Set("id", $key);
                $t->Show("r_table_b");
            }
            $index ++;
        }
                

        $t->Show("r_table_f");
        $t->Show("footer");
        $db->Close();
    }

    /**
    * Verifica la existencia de un nombre de usuario
    * retorna un Objeto json con un elemento existe igual a la cantidad de ocurrencias encontradas
    */
    function checkUser()
    {
        $user = $_POST['usuario'];
        $db = new My();
        $db->Query("SELECT COUNT(*) as res FROM usuarios WHERE usuario = '$user';");
        $db->NextRecord();
        if ((int)$db->Record['res']>0) {
            echo '{"existe":true}';
            $db->Close();
            return true;
        } else {
            $db->Close();
            echo '{"existe":false}';
            return $existe;
        }
    }
    //Muestra el formulario para crear nuevo usuario
    function newUser()
    {
        $t = new Y_Template("UsersManager.html");
        //$t->Show("head");
        $t->Show("new_user");
    }
    //Genera un nuevo usuario
    function sigInUser()
    {
        $user =  $_POST['usuario'];
        $password =  $_POST['passw'];
        $clave = sha1($password);
        //echo  "Clave encripdada que conoce el Usuario    ". $clave."<br><br>";
        $cadena_encriptada = sha1($clave);
        //echo "Cadena encriptada con    $clave =     $cadena_encriptada<br><br>";
        $ultimos8= substr($cadena_encriptada, -8);
        
        $db = new My();
        $query = "INSERT INTO usuarios (usuario, passw, hash, fecha_nac, fecha_cont, limite_sesion, suc, estado) values ('$user', '$clave', '$ultimos8','0000-00-00','0000-00-00', '30', '00','Activo');";
        $db->Query($query);
        if ($db->Errno == 0) {
            echo'{"exito":true}';
        } else {
            echo'{"exito":false,"msj":'.$db->Err.'}';
        }
        $db->Close();
    }
    //Actualiza los datos de usuario
    function updateUser()
    {
        $data = $_POST['data'];
        $user = $_POST['user'];
        $db = new My();
        $query = "UPDATE usuarios SET $data WHERE usuario = '$user';";
        
        $db->Query($query);
        $db->Close();
    }
    // Muestra el Formulario para cambiar de contrase�a.
    function changePassword()
    {
        $usu = $_POST['usuario'];
        $usuario_pri = $_POST['usuario_pri'];

        $t = new Y_Template("UsersManager.html");
        //$t->Show("head");
        $resetearContrasenia = $this->verificarPermiso($usuario_pri,'5.1')?'':'style="display:none;"';
        
        $t->Set("usuario", $usu);
        $t->Set("visible", $resetearContrasenia);
        $t->Show("ch_passw_form");
        $t->Show("footer");
    }
    //Actualiza la contrase�a del usuario
    function updatePassword()
    {
        $user =  $_POST['usuario'];
        $password =  $_POST['passw'];
        $clave = sha1($password);
        //echo  "Clave encripdada que conoce el Usuario    ". $clave."<br><br>";
        $cadena_encriptada = sha1($clave);
        //echo "Cadena encriptada con    $clave =     $cadena_encriptada<br><br>";
        $ultimos8= substr($cadena_encriptada, -8);
        
        $db = new My();
        $db->Query("UPDATE usuarios SET passw='$clave', hash='$ultimos8' WHERE usuario = '$user';");
        if ($db->Errno == 0) {
            echo'{"exito":true}';
        } else {
            echo'{"exito":false,"msj":'.$db->Err.'}';
        }
        $db->Close();
    }
    //Verifica si que una contrase�a pertenezca a un usuario determinado
    function checkOldPassw()
    {
        $user =  $_POST['usuario'];
        $password =  $_POST['passw'];
        $crypt_pass = sha1($password);
        
        $db = new My();
        $db->Query("SELECT COUNT(*) AS res FROM  usuarios WHERE usuario = '$user' AND passw = '$crypt_pass';");
        $db->NextRecord();
        if ((int)$db->Record['res']===0||trim($user)==="") {
            echo'{"estado":false}';
        } else {
            echo'{"estado":true}';
        }
        $db->Close();
    }

    //Utilidades
    function flipDate($date, $sp = '-', $spr = '-')
    {
        $flip = explode($sp, $date);
        
        return (String)$flip[2].$spr.(String)$flip[1].$spr.(String)$flip[0];
    }
    //Imprime los grupos a los que pertenece un usuario determinado.
    function getGroups()
    {
        $user = $_POST['usuario'];
    
        $grupos = $uxg = [];
        $t = new Y_Template("UsersManager.html");
        $db = new My();
        $db->Query("SELECT id_grupo, nombre FROM grupos;");
        while ($db->NextRecord()) {
            $grupos[$db->Record['id_grupo']] = $db->Record['nombre'];
        }
        
        $db->Query("SELECT g.id_grupo, g.nombre FROM grupos g INNER JOIN usuarios_x_grupo uxg ON g.id_grupo = uxg.id_grupo where uxg.usuario ='$user' ;");
        while ($db->NextRecord()) {
            $uxg[$db->Record['id_grupo']] = $db->Record['nombre'];
        }
        //$t->Show("head");
        $t->Set("user", $user);
        $t->Show("h_grupos");
        foreach ($grupos as $key => $val) {
            if (in_array($val, $uxg)) {
                $t->Set("checked", "checked");
            } else {
                $t->Set("checked", "");
            }
            $t->Set("grupo", $val);
            $t->Set("id", $key);
            $t->Show("grupos");
        }
        $t->Show("f_grupos");
        $db->Close();
    }
    //Actualiza a que grupos pertenese un usuario.
    function chGroup()
    {
        $user = $_POST['user'];
        $group = $_POST['group'];
        $op = $_POST['op'];
        $db = new My();
        
        if ($op === 'i') {
            $db->Query("INSERT INTO usuarios_x_grupo (usuario,id_grupo) VALUE ('$user',$group);");
        } elseif ($op === 'd') {
            $db->Query("DELETE FROM usuarios_x_grupo WHERE usuario = '$user' AND id_grupo = $group;");
        }
    }
    //Imprime las sucursales a la cual pertenese un determinado usuario.
    function getSucs()
    {
        $user = $_POST['usuario'];
        $def_suc = $_POST['def_suc'];
        $sucursales = $uxs = [];
        $t = new Y_Template("UsersManager.html");
        $db = new My();
        $db->Query("SELECT replace(suc,'.','-') as suc, nombre FROM sucursales WHERE estado = 'Activo'");
        while ($db->NextRecord()) {
            $sucursales[$db->Record['suc']] = $db->Record['nombre'];
        }
        $db->Query("INSERT IGNORE INTO usuarios_x_suc SET suc='$def_suc',usuario='$user'");
        // $db->Query("SELECT u.suc, s.nombre FROM usuarios_x_suc u inner join sucursales s on u.suc = s.suc and u.usuario = '$user';");
        $db->Query("SELECT u.suc, s.nombre FROM usuarios_x_suc u INNER JOIN sucursales s ON u.suc = s.suc WHERE u.usuario = '$user' AND s.estado = 'Activo'");
        while ($db->NextRecord()) {
            $uxs[$db->Record['suc']] = $db->Record['nombre'];
        }
        $t->Set("user", $user);
        $t->Show("h_sucs");
        foreach ($sucursales as $key => $val) {
            if (in_array($val, $uxs)||$def_suc===$key) {
                if ($def_suc===$key) {
                    $t->Set("checked", "checked disabled");
                } else {
                    $t->Set("checked", "checked");
                }
            } else {
                $t->Set("checked", "");
            }
            $t->Set("suc", $val);
            $t->Set("id", $key);
            $t->Show("sucs");
        }
        $t->Show("f_sucs");
        $db->Close();
    }
    //Obtiene todos los codigos y nombres de sucursales
    function getSucsAll()
    {
        $sucs = array();
        $db = new My();
        $db->Query("SELECT suc,nombre FROM sucursales order by nombre asc");
        while ($db->NextRecord()) {
            $sucs[$db->Record['nombre']] = $db->Record['suc'];
        }
        echo json_encode($sucs);
    }
    //Actualiza las sucursales a las que pertenese un usuario determinado.
    function chSuc()
    {
        $user = $_POST['user'];
        $suc = str_replace("-", ".", $_POST['suc']);
        $op = $_POST['op'];
        $db = new My();
        
        if ($op === 'i') {
            $db->Query("INSERT INTO usuarios_x_suc (suc,usuario) VALUE ('$suc','$user');");
        } elseif ($op === 'd') {
            $db->Query("DELETE FROM usuarios_x_suc WHERE usuario = '$user' AND suc = $suc;");
        }
    }
    function getMetas()
    {
        $t = new Y_Template("UsersManager.html");
        
        $usuario = $_POST['usuario'];
        $t->Set("usuario", $usuario);
        $db = new My();
        $db->Query("SELECT id_meta,meta_base,sueldo_base,meta_minima,ponderacion FROM metas WHERE usuario = '$usuario'");
        $t->Show("metas_head");
        
        while ($db->NextRecord()) {
            $id_meta = $db->Record['id_meta'];
            $meta_base = $db->Record['meta_base'];
            $sueldo_base = $db->Record['sueldo_base'];
            $meta_minima = $db->Record['meta_minima'];
            $ponderacion = $db->Record['ponderacion'];
           
            $t->Set("id_meta", $id_meta);
            $t->Set("meta_base", number_format($meta_base, 0, ',', '.'));
            $t->Set("sueldo_base", number_format($sueldo_base, 0, ',', '.'));
            $t->Set("meta_minima", number_format($meta_minima, 0, ',', '.'));
            $t->Set("ponderacion", $ponderacion);
            $t->Show("metas_data");
        }
        $t->Show("metas_footer");
    }
    function getTipoVendedor()
    {
        $tv = array();
        $db = new My();
        $db->Query("SELECT id_tipo,descrip FROM tipo_vendedor");
        while ($db->NextRecord()) {
            $tv[$db->Record['id_tipo']] = $db->Record['descrip'];
        }
        echo json_encode($tv);
    }
    
    function delMeta()
    {
        $usuario = $_POST['usuario'];
        $id_meta = $_POST['id_meta'];
        $db = new My();
        $db->Query("DELETE FROM metas WHERE usuario = '$usuario' and id_meta = $id_meta;");
        echo "Ok";
    }
    function addMeta()
    {
        $usuario = $_POST['usuario'];
        $id_meta = $_POST['id_meta'];
        $meta_base = $_POST['meta_base'];
        $sueldo_base = $_POST['sueldo_base'];
        $meta_minima = $_POST['meta_min'];
        $ponderacion = $_POST['pond'];
        $db = new My();
        $sql = "INSERT INTO metas(id_meta, usuario, meta_minima, meta_base, sueldo_base, ponderacion)VALUES ($id_meta, '$usuario', $meta_minima, $meta_base, $sueldo_base, $ponderacion);";
        
        $db->Query($sql);
        echo "Ok";
    }
    function saveMeta()
    {
        $usuario = $_POST['usuario'];
        $id_meta = $_POST['id_meta'];
        $meta_base = $_POST['meta_base'];
        $sueldo_base = $_POST['sueldo_base'];
        $meta_minima = $_POST['meta_min'];
        $ponderacion = $_POST['pond'];
        $db = new My();
        $db->Query("UPDATE metas set meta_minima = $meta_minima,meta_base = $meta_base, sueldo_base = $sueldo_base, ponderacion = $ponderacion where id_meta = $id_meta and usuario = '$usuario'");
        echo "Ok";
    }

    private function verificarPermiso($user, $permiso)
    {
        $link = new My();
        $link->Query("SELECT u.nombre AS usu,ug.usuario,g.nombre,p.id_permiso AS id_permiso,descripcion,trustee FROM  usuarios u,grupos g, usuarios_x_grupo ug, permisos_x_grupo p, permisos pr WHERE u.usuario = ug.usuario AND ug.id_grupo = p.id_grupo AND g.id_grupo = ug.id_grupo AND p.id_permiso = pr.id_permiso  AND ug.usuario = '$user' AND  p.id_permiso = '$permiso'");
        if ($link->NumRows()>0) {
            return true;
        } else {
            return false;
        }
    }
}
 

// Autostart
@session_destroy();
if (isset($_SESSION['UserManager'])) {
    $user_manager = unserialize($_SESSION['UserManager']);
    if (isset($_POST['action'])) {
        call_user_func_array(array($user_manager,$_POST['action']), explode(',', $_POST['args']));
    } else {
        $user_manager->start();
    }
} else {
    $_SESSION['UserManager'] = serialize(new UserManager());
    $user_manager = unserialize($_SESSION['UserManager']);
    if (isset($_POST['action'])) {
        call_user_func_array(array($user_manager,$_POST['action']), explode(',', $_POST['args']));
    } else {
        $user_manager->start();
    }
}
