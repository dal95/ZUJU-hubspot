$(window).on('load', function () {
  console.log(contactUser)

  $('input[name="firstname"').attr('readonly', true)
  $('input[name="lastname"').attr('readonly', true)
  $('input[name="email"').attr('readonly', true)

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
  // $('input[type="tel"').attr('readonly', true)
  // $('[name="user_gender"]').attr('readonly', true)
  // $('[name="country_dropdown"]').attr('readonly', true)
  // $('[name="player_of_the_month___position"]').attr('readonly', true)

  if (contactUser != null) {
    fillFormWithTimeout(false)
  } else {
    $('input[name="firstname"').attr('readonly', false)
    $('input[name="lastname"').attr('readonly', false)
    $('input[name="email"').attr('readonly', false)
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
