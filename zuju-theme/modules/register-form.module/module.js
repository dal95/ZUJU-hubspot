;(function () {
  const BASE_URL = 'https://www.zujugp.com/_hcms/api'
  let count = 0
  const total = $('.hs_cos_wrapper_type_form').length

  function validateEmail (email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(String(email).toLowerCase())
  }

  let hasErrors = []

  function asyncValidate (selector, callback) {
    const parent = $(selector).closest('.hs-form-field')
    const input = $(selector)
    const inputParent = $(selector).closest('.input')
    var messages = JSON.parse(validation_messages)

    const spinner = `<svg class="spinner" viewBox="0 0 50 50">
    <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
  </svg>`

    inputParent.append(spinner)
    const $spinner = parent.find('.spinner')
    // let prevValue = $(selector).val()

    $(selector).on('focusout', function () {
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

          // console.log({ messageType })
          if (messageType != 'success') {
            if (!hasErrors.find(item => item.message))
              hasErrors.push(res.message)
            // console.log(!hasErrors.find(item => message === res.message))
          } else {
            const index = hasErrors.findIndex(item =>
              item.includes(res.message.split('_')[0])
            )
            // console.log(res.message)
            // console.log(hasErrors)
            // console.log(index)
            if (index >= 0) hasErrors.splice(index, index + 1)
          }

          console.log(hasErrors.length)

          $('#hs_form_target_register .hs-button').attr(
            'disabled',
            !!hasErrors.length
          )
          parent.append(messageEl)
        })
        .catch(err => console.error(err))
    })

    $(selector).on('keyup', function () {
      if (parent.find('.custom-validation')) {
        parent.find('.custom-validation').remove()
      }
    })
  }

  window.addEventListener('message', event => {
    if (
      event.data.type === 'hsFormCallback' &&
      event.data.eventName === 'onFormReady'
    ) {
      count++
      if (count < total) return

      asyncValidate('#register-form [name="username"]', (value = '') => {
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

      asyncValidate('#register-form [name="email"]', (value = '') => {
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

      asyncValidate('#register-form [name="referral_code"]', (value = '') => {
        return fetch(`${BASE_URL}/check-refer-code`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            refer_code: value
          })
        })
      })

      const $referralInput = $('input[name="referral_code"]')

      $referralInput.attr('tabindex', -1)
      $referralInput.addClass('disabled').attr('dsiabled', true)
      $referralInput.closest('.input').addClass('disabled')

      $('.disabled')
        .closest('.field')
        .find('label')
        .on('click', e => e.preventDefault())

      $referralInput
        .val(referral_code)
        .trigger('change')
        .trigger('focusout')

      const $form = $(`[data-form-id="${event.data.id}"]`)
      const $submitBtn = $('#hs_cos_wrapper_register_form').find('.hs-button')
      $submitBtn.attr('disabled', true)

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
      console.log(maxDate)
      console.log(+new Date() > +new Date(maxDate))

      $('.birthday-custom').flatpickr({
        maxDate,
        onChange: function (selectedDates) {
          console.log(+new Date(selectedDates[0]) > +new Date(maxDate))
          $submitBtn.attr('disabled', !selectedDates.length)
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
