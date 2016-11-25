// client side

const generateUniqueURL = function() {
  const alphaNumeric = '01234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let uniqueURL = '';

  for (var i = 0; i < 20; i++) {
    const randomNum = Math.floor((Math.random() * 63));
    uniqueURL += alphaNumeric.charAt(randomNum);
  };
   return uniqueURL;
};

$(document).ready(function() {

  $('#response').on('submit', function(event) {
  event.preventDefault();

    $.post('/events/:uniqueurl', function(data) {

      console.log(data);
    }

  });


});
