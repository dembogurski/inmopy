
var $write = $('#write'),
shift = false,
capslock = false,
callback = null;

$('#keyboard li').click(function () {
    var $this = $(this),
    character = $this.html(); // If it's a lowercase letter, nothing happens to this variable

    // Shift keys
    if ($this.hasClass('left-shift') || $this.hasClass('right-shift')) {
        $('.letter').toggleClass('uppercase');
        $('.symbol span').toggle();

        shift = (shift === true) ? false : true;
        capslock = false;
        return false;
    }

    // Caps lock
    if ($this.hasClass('capslock')) {
        $('.letter').toggleClass('uppercase');
        capslock = true;
        return false;
    }
      
    // Delete
    if ($this.hasClass('delete')) {
        var html = $write.val();
        $write.val(html.substr(0, html.length - 1));
        return false;
    }
     
    if ($this.hasClass('dragg')) {                  
        return false;
    }  
    
     
    // Special characters
    if ($this.hasClass('symbol'))
        character = $('span:visible', $this).html();
    if ($this.hasClass('space'))
        character = ' ';
    if ($this.hasClass('tab'))
        character = "\t";
    if ($this.hasClass('return') || $this.hasClass('accept')){
        character = "";        
        callback();
    }
    if ($this.hasClass('cancel')){
        character = "";
        hideKeyboard();       
    }

    // Uppercase letter
    if ($this.hasClass('uppercase'))
        character = character.toUpperCase();

    // Remove shift once a key is clicked.
    if (shift === true) {
        $('.symbol span').toggle();
        if (capslock === false)
            $('.letter').toggleClass('uppercase');

        shift = false;
    }

    // Add the character
    $write.val($write.val() + character);    
});

function showKeyboard(obj,callback_fn,x_pos,y_pos){
   var posx = x_pos || 0;
   var posy = y_pos || 0;
   $write = $(obj);    
   callback = callback_fn||function(){};
   $('.dragg').mousedown(function(){
        $("#virtual_keyboard").draggable();
        //setTimeout('$("#virtual_keyboard").draggable({ disabled: true });',5000);  
   });
    
      // $("#virtual_keyboard").draggable({ disabled: true }); 
    
       
   if( posx == 0){
        var window_width = $(document).width()  / 2;
        var keyboard_width = $("#virtual_keyboard").width()  / 2;        
        posx = (window_width - keyboard_width) ;        
        posx = posx+"px";        
   }
   if(posy == 0){
       var window_height = $(document).height() / 2;
       var keyboard_height = $("#virtual_keyboard").height() / 2;
       posy = (window_height - keyboard_height);
       posy = posy+"px";
   }
   $("#virtual_keyboard").css({left:posx,top:posy});   
   $("#virtual_keyboard").fadeIn();   
}
function hideKeyboard(){
   $("#virtual_keyboard").fadeOut();
}