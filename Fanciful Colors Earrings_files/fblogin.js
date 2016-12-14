$(document).ready(function(){
	(function(d){
    var js, id = 'facebook-jssdk'; if (d.getElementById(id)) {return;}
    js = d.createElement('script'); js.id = id; js.async = true;
    js.src = "//connect.facebook.net/en_US/all.js";
    d.getElementsByTagName('head')[0].appendChild(js);
  	}(document));
      
    window.fbAsyncInit = function() {
	   FB.init({
	        appId: fblogin_appid,
			status: true, 
 			cookie: true, 
 			xfbml: true,
 			oauth: true});
		return;
	};
});

function runloader(){
    $(".fbloader").fadeIn(500);    
}
function stoploader(){
    $(".fbloader").fadeOut(3500);    
}

function fblogin_mypresta(){
    runloader();
    FB.login(function(response) {
       if (response.authResponse) {
         FB.api('/me', function(response) {
            $.post(baseDir+"/modules/fblogin/ajax_fblogin.php", {resp: response}, function(data){
                stoploader();
                eval(data);
            }) 
         });
       } else {
         stoploader();
       }
     },{scope: 'email'});
}