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
    url: '/events/uniqueurl',
    method: 'GET'
  }).done(function(res){
    console.log(res)
  })

  $('form').on('submit', function(event) {
    event.preventDefault();



    $.ajax({
      url: '/events/uniqueurl',
      method: "POST",
      data: $("form").serialize()
    })
    .done(function(res) {
      // console.log(res);
      // let response = `
      // ${user.first_name} ${user.last_name} will be attending ${user.title} on ${slicedDate} at ${user.times}
      // `
      // res.message.forEach(function(messages){
      //   $('body').append(messages);
      // })
    });

  });

});
