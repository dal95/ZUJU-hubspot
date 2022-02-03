$(window).on('load', function () {
  console.log(contactUser)

  function fillFormWithTimeout (isSubmit) {
    console.log('refill for fields')
    setTimeout(function () {
      $('input[name="firstname"')
        .val(contactUser.firstname)
        .trigger('change')
      $('input[name="lastname"')
        .val(contactUser.lastname)
        .trigger('change')
      $('input[name="email"')
        .val(contactUser.email)
        .trigger('change')

      //       if(isSubmit){
      //         console.log("submit form...")
      //         $("#campaign-upload-form-wrapper form").submit();
      //       }
    }, 150)
  }

  $('input[name="firstname"').attr('disabled', true)
  $('input[name="lastname"').attr('disabled', true)
  $('input[name="email"').attr('disabled', true)
  $('input[type="tel"').attr('disabled', true)
  $('[name="user_gender"]').attr('disabled', true)
  $('[name="country_dropdown"]').attr('disabled', true)
  // $('[name="player_of_the_month___position"]').attr('disabled', true)

  if (contactUser != null) {
    fillFormWithTimeout(false)
  } else {
    $('input[name="firstname"').attr('disabled', false)
    $('input[name="lastname"').attr('disabled', false)
    $('input[name="email"').attr('disabled', false)
  }

  // $("#campaign-upload-form-wrapper form").on('change', 'input', function(){
  //   if(contactUser != null){
  //     fillFormWithTimeout(false)
  //   }
  // });
  $('#campaign-upload-form-wrapper form').on('submit', function (e) {
    e.preventDefault()
    console.log('prevent form submit at first')
    if (contactUser != null) {
      fillFormWithTimeout(true)
    }
  })

  var $fileUpload = $("input[type='file']")
  $fileUpload.on('change', function () {
    if (parseInt($fileUpload.get(0).files.length) > 5) {
      alert('You can only upload a maximum of 5 files')
      $fileUpload.val('')
      return
    }

    if (this.files[0].size > (5 * 200 * 1048576)) {
      alert('File is too big! Max size is 200MB')
      this.value = ''
    }
  })
})
