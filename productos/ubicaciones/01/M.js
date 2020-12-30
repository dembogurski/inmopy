var canvas; 
var colorFondo = '#95a5a6';
//var objetos =[];
 
$(function(){
    canvas = new fabric.Canvas('plano');
    EstanteBandejas3D( "M",5,18,50,20,50,120,canvas,"left",colorFondo );
});

