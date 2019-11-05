// Set the Access Token
var accessToken = '7ff7d97857361343a6ed1617ee9fb3b5349abd21dbb4452637702f30cb114cf8';

// Call Dribble v2 API
$.ajax({
    url: 'https://api.dribbble.com/v2/user/shots?per_page=20&access_token='+accessToken,
    dataType: 'json',
    type: 'GET',
    success: function(data) {
      if (data.length > 0) {
        $.each(data.reverse(), function(i, val) {
          $('#shots').prepend(
            '<a class="shot" target="_blank" href="'+ val.html_url +'"><img src="'+ val.images.hidpi +'"/></a>'
            )
        })
      }
      else {
        $('#shots').append('<p>No shots yet!</p>');
      }
    }
});
