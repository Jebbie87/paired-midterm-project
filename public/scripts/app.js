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


const loadMessage = function(){

}

const renderMessages = function(){
  let output = '';
}

$(document).ready(function() {

const loadMessage = function(){

}

  $.ajax({
    url: '/events/uniqueurl/json',
    method: 'GET'
  }).done(function(res){
    console.log(res.messages)
  })

  // $('form').on('submit', function(event) {
  //   event.preventDefault();



  //   $.ajax({
  //     url: '/events',
  //     method: "POST",
  //     data: $("form").serialize()
  //   })
  //   .done(function(res) {

  //     // console.log("ajax: ", JSON.stringify(res));
  //   });

  });

});
