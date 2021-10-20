let count = 0
const total = $('.hs_cos_wrapper_type_form').length

window.addEventListener('message', event => {
  if (
    event.data.type === 'hsFormCallback' &&
    event.data.eventName === 'onFormReady'
  ) {
    count++
    if (count < total) return
    const $referralInput = $('input[name="referral_code"]')

    $referralInput.attr('tabindex', -1)
    $referralInput.addClass('disabled').attr('dsiabled', true)
    $referralInput.closest('.input').addClass('disabled')

    $('.disabled')
      .closest('.field')
      .find('label')
      .on('click', e => e.preventDefault())

    $referralInput.val(referral_code).trigger('change')

    // $('[name="referral_code"]').on('focusout', function() {
    //   if (!$(this).val()) return

    //   fetch(`${BASE_URL}/check-refer-code`, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({
    //       refer_code: $(this).val()
    //     })
    //   })
    // })

    $('[name="username"]').on('focusout', function () {
      const parent = $(this).closest('.hs-username')

      if (!$(this).val()) return

      fetch(`${BASE_URL}/check-nickname`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: $(this).val()
        })
      })
        .then(res => res.json())
        .then(res => {
          const usernmeValidation = parent.find('.custom-validation')
          usernmeValidation.remove()
          
          const response = {
            found: true,
            msg: 'username_available'
          }
          
          
          parent.append($(`.${response.msg}`))
          
        })
        .catch(err => alert('Something went wrong, contact us!'))
    })

    $('[name="username"]').on('keyup', function () {
      const parent = $(this).closest('.hs-username')

      if (parent.find('.custom-validation')) {
        parent.find('.custom-validation').remove()
      }
    })
  }
})