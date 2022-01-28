let count = 0
const total = $('.hs_cos_wrapper_type_form').length

let hasErrors = ['username', 'email', 'birthday']

function asyncValidate (selector, callback, disable = true) {
  const parent = $(selector).closest('.hs-form-field')
  const input = $(selector)
  const inputParent = $(selector).closest('.input')
  var messages = {
    success: {
      username_valid: '(username) is available'
    },
    error: {
      username_taken: 'Nickname is taken',
      username_invalid_character: 'Special character not allowed',
      username_minmax: 'Nickname must be between 3-25 characters'
    }
  }

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

      if (
        $(this)
          .val()
          .trim() == contact.username
      )
        return

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
            if (
              !hasErrors.find(item => item == res.message) &&
              res.message !== 'invalid_promo_code'
            ) {
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

    asyncValidate('.edit [name="username"]', (value = '') => {
      return fetch(`${BASE_URL}/check-nickname`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: value.trim()
        })
      })
    })

    let countryCode = ''
    $("[name='country_dropdown']")
      .find('option')
      .each(function () {
        if ($(this).text() == contact.country_dropdown) {
          countryCode = $(this).val()
        }
      })

    setTimeout(() => {
      $("[name='country_dropdown']")
        .val(countryCode)
        .trigger('change')
    }, 250)

    setTimeout(() => {
      $('.hs-input.hs-fieldtype-intl-phone')
        .find('select')
        .val(contact.hs_calculated_phone_number_country_code)
        .trigger('change')

      const trimmed = contact.phone.split('+')

      $('.hs-input[name="phone"]')
        .val(contact.hs_searchable_calculated_phone_number)
        .trigger('change')
    }, 1)

    $('[name="custom_avatar"]').each(function () {
      const avatarWrap = document.createElement('div')
      avatarWrap.classList.add('avatar-wrap')
      const img = new Image()
      img.src = $(this).val()

      $(avatarWrap).append(img)
      $(this)
        .closest('.hs-form-radio-display')
        .append(avatarWrap)
    })

    $('[name="custom_avatar"]').on('change', function () {
      $('.avatar-edit img').attr('src', $(this).val())
    })
    // - end of avatar

    // Disable fields
    $disabledElement = $(
      '.edit input[name="birthday"], .edit input[name="email"]'
    )

    $disabledElement.attr('tabindex', -1)
    $disabledInput = $disabledElement.closest('.input')
    $disabledInput.each(function () {
      const propName = $(this)
        .find('.hs-input')
        .attr('name')
      if (propName == 'birthday' || !propName) return

      $(this).css('position', 'relative')
      $(this).append(`<div class="mask-input">${contact[propName] || ''}</div>`)
      $(this)
        .find('.hs-input')
        .css('display', 'none')
    })

    $disabledInput.addClass('disabled')

    $('.disabled')
      .closest('.field')
      .find('label')
      .on('click', e => e.preventDefault())

    $('.hs-input').each(function () {
      const propName = $(this).attr('name')
      if (propName === 'custom_avatar') return

      // if ($(this).closest('#hs_cos_wrapper_delete_form')) return
      if (propName === 'birthday') {
        const current = new Date(contact[propName])

        $(this)
          .closest('.input')
          .append(`<div class="mask-input">${contact[propName]}</div>`)
        $(this)
          .closest('.hs-dateinput')
          .css('display', 'none')

        if (current) {
          function pad (n) {
            return (n < 10 ? '0' : '') + n
          }

          const newDate =
            current.getFullYear() +
            '-' +
            (current.getMonth() + 1) +
            '-' +
            pad(current.getDate())
          $(this)
            .prev()
            .attr('tabindex', -1)
        }
      } else {
        $(this)
          .val(contact[propName])
          .trigger('change')
      }
    })

    // Delete form
    const deleteForm = $('#hs_form_target_delete_form')
    const submitBtn = deleteForm.find('[type="submit"]').addClass('disabled')
    deleteForm.find('[type="submit"]').attr('disabled', true)

    const inputEl = deleteForm.find('[type="email"]')

    inputEl.on('keyup', e => {
      const value = e.target.value

      if (value.trim() == contact.email) {
        console.log('enabled')
        submitBtn.attr('disabled', false)
        $('.custom-validation').remove()
      } else {
        if (!$('.custom-validation').length) {
          inputEl.parent().append(`
          <div class="custom-validation validate-message__error">You have keyed in an incorrect email</div>
        `)
        }
        submitBtn.attr('disabled', true)
      }
    })

    // inputEl.trigger('keyup')
  }
})
