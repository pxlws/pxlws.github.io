// Set the Access Token
var accessToken = '7ff7d97857361343a6ed1617ee9fb3b5349abd21dbb4452637702f30cb114cf8';

// Call Dribble v2 API
$.ajax({
    url: 'https://api.dribbble.com/v2/user/shots?access_token='+accessToken,
    dataType: 'json',
    type: 'GET',
    success: function(data) {
      if (data.length > 0) {
        $.each(data.reverse(), function(i, val) {
          $('#shots').prepend(
            '<a class="shot" target="_blank" href="'+ val.html_url +'" title="' + val.title + '"><div class="title">' + val.title + '</div><img src="'+ val.images.hidpi +'"/></a>'
            )
        })
      }
      else {
        $('#shots').append('<p>No shots yet!</p>');
      }
    }
});

//Image width 800x600 (Animated)
val.images.hidpi
//Image width 400x300
val.images.normal
//Image width 200x150
val.images.teaser
//Title
val.title
//Description
val.description
//URL
val.html_url
