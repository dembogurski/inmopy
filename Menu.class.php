<?php

require_once("Y_Template.class.php");

class Menu {

    function __construct($permisos) {
        $t = new Y_Template('Menu.html');
        $json_file = file_get_contents('json/menu.json');
        $json = json_decode($json_file);
        $t->Set('json_var', json_encode($this->getMenu($json, $permisos)));
        $t->Show('head');
        $t->Show('menu');
    }

    /**
     * 
     * @param Object json $obj plantilla de menu
     * @param Array $perm permisos
     * @return type
     */
    private function getMenu($obj, $perm) {
        $output = array();
        foreach ($obj as $key => $val) {
            if (gettype($val) === "object") {
                if (in_array((string)$val->id, $perm, true)) {
                    if ($this->hasChild($val)) {
                        $output[$key] = $this->getMenu($val, $perm);
                    } else {
                        $output[$key] = $val;
                    }
                }
            } else {
                $output[$key] = $val;
            }
        }
        return $output;
    }
    /**
     * Verifica si un array contine otro array en su estructura
     * @param Array $obj
     * @return boolean
     */
    private function hasChild($obj) {
        $child = false;
        foreach ($obj as $key => $val) {
            if (gettype($val) == "object") {
                $child = true;
            }
        }
        return $child;
    }

}
?>

