$(window).on('load', function () {
  console.log(contactUser.firstname)
  function fillFormWithTimeout(isSubmit){
    console.log("refill form fields")
    setTimeout(function(){ 
      $('input[name="firstname"').val(contactUser.firstname).trigger('change')
      $('input[name="lastname"').val(contactUser.lastname).trigger('change')
      $('input[name="email"').val(contactUser.email).trigger('change')
      
//       if(isSubmit){
//         console.log("submit form...")
//         $("#campaign-upload-form-wrapper form").submit();
//       }
    }, 150);
  }
  
  $('input[name="firstname"').attr('readonly', true);
  $('input[name="lastname"').attr('readonly', true);
  $('input[name="email"').attr('readonly', true);
  
  if(contactUser != null){
    fillFormWithTimeout(false)
  }
  else{
    $('input[name="firstname"').attr('readonly', false);
    $('input[name="lastname"').attr('readonly', false);
    $('input[name="email"').attr('readonly', false); 
  }
  
  $("#campaign-upload-form-wrapper form").on('change', 'input', function(){
    if(contactUser != null){
      fillFormWithTimeout(false)
    }
  });
//   $("#campaign-upload-form-wrapper form").on("submit", function(e){
//     e.preventDefault()
//     console.log("prevent form submit at first")
//     if(contactUser != null){
//       fillFormWithTimeout(true)
//     }
//  })
});