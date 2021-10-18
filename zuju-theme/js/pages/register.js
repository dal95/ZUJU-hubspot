window.addEventListener('message', event => {
  if (
    event.data.type === 'hsFormCallback' &&
    event.data.eventName === 'onFormReady'
  ) {
    const $referralInput = $('input[name="referral_code"]')

    $referralInput.attr('tabindex', -1)
    $referralInput.addClass('disabled').attr('dsiabled', true)
    $referralInput.closest('.input').addClass('disabled')

    $('.disabled')
      .closest('.field')
      .find('label')
      .on('click', e => e.preventDefault())

    $referralInput.val(referral_code).trigger('change')

    $('[name="username"]').on('focusout', function () {
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
          const parent = $(this).closest('.hs-username')
          const usernmeValidation = parent.find('.custom-validation')
          usernmeValidation.remove()

          const successMessage = $('.validate-message__success').text()
          const failedMessage = $('.validate-message__failed').text()

          if (res.found) {
            // alert('Username/Nickname is taken')
            parent.append(
              `<div class="custom-validation hs-error-msg">${failedMessage.replace(
                '{uname}',
                $(this).val()
              )}</div>`
            )

            $('#hs_form_target_register input[type="submit"]').attr(
              'disabled',
              true
            )
          } else {
            parent.append(
              `<div class="custom-validation success">${successMessage.replace(
                '{uname}',
                $(this).val()
              )}</div>`
            )
            $('#hs_form_target_register input[type="submit"]').attr(
              'disabled',
              false
            )
          }
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

// hbspt.forms.create({
//   portalId: '20618228',
//   formId: '13fb8953-fb28-43c9-a410-82efb99e6847',
//   target: '.form-embed-container',
//   cssClass: 'form-register',
//   translations: {
//     en: {
//       required: 'Please enter {{input.name}} field',
//       invalidDate: 'Please enter a real date',
//       submitText: 'Custom Submit Button Text',
//       fieldLabels: {
//         email: 'Electronic mail'
//       },
//       groupErrors: false
//     }
//   }
// })
