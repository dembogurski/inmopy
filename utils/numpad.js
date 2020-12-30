var destination_input_id = "";
callback_fn = "";
var enable_some_text = false;

function configNumpad(){
       
      $('.np_ok').click(function(){
          // Sacar el Valor y poner en el otro campo
          $("#"+destination_input_id).val($('#np_input').val());
           
          if (typeof callback_fn == 'function') { 
                 callback_fn(); 
          }
          $('#n_keypad').hide('fast');          
      });
      $('.np_numero').click(function(){
        if(enable_some_text){
            $('#np_input').val($('#np_input').val() + $(this).val());
        }else if (!isNaN($('#np_input').val() )) {
            
           if (isNaN($('#np_input').val()+ $(this).val())) {
             $('#np_input').val($('#np_input').val() );
           } else {
             $('#np_input').val($('#np_input').val() + $(this).val());
           }
        } 
        
      });
      $('.np_dec').click(function(){
          if ( !isNaN($('#np_input').val()) && $('#np_input').val().length > 0) {
            if (parseFloat($('#np_input').val()) > 0) {
              $('#np_input').val(parseFloat($('#np_input').val()) - 1);
            }
          }
      });
      $('.np_inc').click(function(){
          if (!isNaN($('#np_input').val()) && $('#np_input').val().length > 0) {
            $('#np_input').val(parseFloat($('#np_input').val()) + 1);
          }else{
              $('#np_input').val(0);
          }
      });
      $('.np_inc').keypress(function(){
          $('.np_inc').click(); 
      });
      $('.np_del').click(function(){
          $('#np_input').val($('#np_input').val().substring(0,$('#np_input').val().length - 1));
      });
      $('.np_cancel').click(function(){
          $('#n_keypad').hide('fast');  
      }); 
      $('.np_zero').click(function(){
        if (!isNaN($('#np_input').val() )) {
          if (parseFloat($('#np_input').val()) != 0 || enable_some_text) {
            $('#np_input').val($('#np_input').val() + $(this).val());
          }
        }
      });
}

function showNumpad(input_id,callback,text){
     
   if(text == true){
       enable_some_text = true;
   } 
   destination_input_id = input_id; 
   $('#np_input').val($("#"+destination_input_id).val());
   // Posicionar y mostrar
   var position = $( "#"+input_id ).position();
    
   $('#n_keypad').css({ 'top'  : position.top  ,'left' : position.left });
    
   //$('#n_keypad').fadeToggle('fast');
   $('#n_keypad').fadeIn('fast');
   $('#n_keypad').draggable(); 
   if(callback != null){
        callback_fn = function(){
            callback();
        }
   }
}

function showRelative(input_id,callback,text,pos){
    if(pos == undefined){
        pos = 0;
    } 
    if(text == true){
       enable_some_text = true;
    } 
    destination_input_id = input_id; 
    $('#np_input').val($("#"+destination_input_id).val());
   
    $('#n_keypad').css({ 'top'  :$('#'+input_id).offset().top +pos ,'left' : $('#'+input_id).offset().left});
    
    $('#n_keypad').fadeToggle('fast');
    $('#n_keypad').draggable(); 
    if(callback != null){
        callback_fn = function(){
            callback();
        }
    }
}
function hideNumpad(){
   $('#n_keypad').fadeOut("fast");
}