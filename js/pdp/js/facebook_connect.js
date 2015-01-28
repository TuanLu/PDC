window.fbAsyncInit = function() {
  FB.init({ appId: facebook_app_id, 
        status: true, 
        cookie: true,
        xfbml: true,
        oauth: true});
  function updateButton(response) {
    var button = document.getElementById('fb-auth');
        
    if (response.authResponse) {
      //user is already logged in and connected
      var userInfo = document.getElementById('user-info'),
          photos_album  = document.getElementById('photos_album');
      FB.api('/me', function(response) {
        //userInfo.innerHTML = '<img src="https://graph.facebook.com/' 
      //+ response.id + '/picture">' + response.name;
        button.innerHTML = 'Logout';
      });
      FB.api('/me/albums', function(response){
        var l=response.data.length,
            rs_all,
            all_img;
        if(l > 0){
            rs_all ='<select id="fb_album" onchange="get_all_photos(this.value)"><option value="0">-- Select your album --</option>';
            for (var i=0; i<l; i++){
                var album = response.data[i],
                    albumid = album.id;
                    rs_all += '<option value="'+album.id+'">'+album.name+'</option>';
            }
            rs_all += '</select>';
            userInfo.innerHTML = rs_all;
        }
        //
      });
      get_all_photos = function(id){
        if(id==0){
            photos_album.innerHTML = '';
            return;
        }
        FB.api("/"+id+"/photos",function(response){
            var photos = response["data"],
                pt_result = '<ul>';
            for(var pt=0;pt<photos.length;pt++) {
                //console.log(photos[pt].images[0].source);
                pt_result += '<li><img color="" src="'+photos[pt].images[0].source+'" /></li>';
            }
            photos_album.innerHTML = pt_result+'</ul>';
        });
      }
      button.onclick = function() {
        FB.logout(function(response) {
          var userInfo = document.getElementById('user-info');
          userInfo.innerHTML="";
    });
      };
    } else {
      //user is not connected to your app or logged out
      //button.innerHTML = 'Please Login Facebook';
      button.onclick = function() {
        FB.login(function(response) {
      if (response.authResponse) {
            FB.api('/me', function(response) {
          var userInfo = document.getElementById('user-info');
          //userInfo.innerHTML = 
           //     '<img src="https://graph.facebook.com/' 
            //+ response.id + '/picture" style="margin-right:5px"/>' 
           // + response.name;
        });    
          } else {
            //user cancelled login or did not grant authorization
          }
        }, {scope:'user_photos'});    
      }
    }
  }

  // run once with current status and whenever the status changes
  FB.getLoginStatus(updateButton);
  FB.Event.subscribe('auth.statusChange', updateButton);    
};