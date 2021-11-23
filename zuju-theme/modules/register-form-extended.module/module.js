;(function () {
  const BASE_URL = 'https://www.zujugp.com/_hcms/api'
  let count = 0
  const total = $('.hs_cos_wrapper_type_form').length

  let hasErrors = ['username', 'email', 'birthday']

  function asyncValidate (selector, callback, disable = true) {
    const parent = $(selector).closest('.hs-form-field')
    const input = $(selector)
    const inputParent = $(selector).closest('.input')
    var messages = JSON.parse(validation_messages)

    if (disable) {
      hasErrors = hasErrors.filter(item => item !== input.attr('name'))
    }

    const spinner = `<svg class="spinner" viewBox="0 0 50 50">
    <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
  </svg>`

    inputParent.append(spinner)
    const $spinner = parent.find('.spinner')
    // let prevValue = $(selector).val()

    $(selector).on('keyup', function () {
      if (disable) {
        $('#hs_form_target_register .hs-button').attr('disabled', true)
      }

      if (parent.find('.custom-validation')) {
        parent.find('.custom-validation').remove()
      }
    })

    $(selector).on(
      'keyup',
      debounce(function () {
        if (!$(this).val()) return

        if (input.attr('type') == 'email') {
          if (!validateEmail($(this).val())) return
        }

        $spinner[0].classList.add('active')

        callback($(this).val())
          .then(res => res.json())
          .then(res => {
            $spinner[0].classList.remove('active')
            const customValidation = parent.find('.custom-validation')
            customValidation.remove()

            const messageType = Object.keys(messages)
              .map(key => {
                if (messages[key][res.message]) {
                  return key
                } else {
                  return false
                }
              })
              .find(item => item != false)

            let message = Object.keys(messages)
              .map(key => messages[key][res.message])
              .find(item => item)

            if ($(this).attr('name') == 'username') {
              message = message.replace('(username)', $(this).val())
            }

            const messageEl = `
          <div class="custom-validation validate-message__${messageType}">
            ${message}
          </div>
          `

            if (messageType != 'success') {
              if (!hasErrors.find(item => item == res.message) && res.message !== "invalid_promo_code") {
                hasErrors.push(res.message)
              }
            } else {
              const index = hasErrors.findIndex(item =>
                item.includes(res.message.split('_')[0])
              )
              if (index >= 0) {
                hasErrors = hasErrors.filter(
                  item => !item.includes(res.message.split('_')[0])
                )
              }
            }

            console.log(hasErrors)

            $('#hs_form_target_register .hs-button').attr(
              'disabled',
              !!hasErrors.length
            )
            parent.append(messageEl)
          })
          .catch(err => console.error(err))
      }, 800)
    )
  }

  window.addEventListener('message', event => {
    if (
      event.data.type === 'hsFormCallback' &&
      event.data.eventName === 'onFormReady'
    ) {
      count++
      if (count < total) return

      const $promoCode = $('input[name="promo_code"]')
      const $username = $('input[name="username"]')
      const $email = $('.dnd-form input[name="email"]')
      const $submitBtn = $('#register-form').find('.hs-button')

      $submitBtn.attr('disabled', true)
      // if (!$.isEmptyObject(contact)) {
      // $username.val(contact.firstname).trigger('change')
      // $email.val(contact.email).trigger('change')

        // disableField([$username, $email])

      //   hasErrors = hasErrors.filter(
      //     item => item !== 'username' && item !== 'email'
      //   )
      // } else {
      asyncValidate('.dnd-form [name="username"]', (value = '') => {
        return fetch(`${BASE_URL}/check-nickname`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: value
          })
        })
      })

      asyncValidate('.dnd-form [name="email"]', (value = '') => {
        return fetch(`${BASE_URL}/check-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: value
          })
        })
      })
    // }

    asyncValidate('.dnd-form [name="promo_code"]', (value = '') => {
      return fetch(`${BASE_URL}/check-promo-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          promo_code: value
        })
      })
    }, false)

      // $promoCode.attr('tabindex', -1)
      // $promoCode.addClass('disabled').attr('disabled', true)
      // $promoCode.closest('.input').addClass('disabled')

      // $('.disabled')
      //   .closest('.field')
      //   .find('label')
      //   .on('click', e => e.preventDefault())

      // $promoCode
      //   .val(referral_code)
      //   .trigger('change')
      //   .trigger('keyup')

      const $form = $(`[data-form-id="${event.data.id}"]`)

      const $parent = $('[name="birthday"]').closest('.input')

      $('[name="birthday"]')
        .prev()
        .css('display', 'none')
      $('.hs-dateinput').css('display', 'none')
      $parent.append(
        `<input type="text" class="birthday-custom hs-input" placeholder="Select date" required />`
      )

      $('.birthday-custom').change(function () {
        $('[name="birthday"]')
          .val($(this).val())
          .trigger('change')
        $('[name="birthday"]').attr('required', true)
        $('[name="birthday"]')
          .prev()
          .val($(this).val())
          .trigger('change')
      })

      let maxDate = new Date(
        new Date().setFullYear(new Date().getFullYear() - 12)
      )

      $('.birthday-custom').flatpickr({
        maxDate,
        onChange: function (selectedDates) {
          if (selectedDates.length) {
            hasErrors = hasErrors.filter(item => item !== 'birthday')
          }

          console.log(hasErrors)

          if (hasErrors.length === 0 && selectedDates.length) {
            $submitBtn.attr('disabled', false)

            if (hasErrors.find(item => item === 'birthday')) {
              hasErrors = hasErrors.filter(item => item !== 'birthday')
            }
          } else {
            $submitBtn.attr('disabled', true)
            hasErrors = hasErrors.filter(item => item != 'birthday')
          }
        }
      })

      $('[name="country_dropdown"]').on('change', function () {
        $('.hs-input.hs-fieldtype-intl-phone')
          .find('select')
          .val($(this).val())
          .trigger('change')
      })
    }
  })
})()
