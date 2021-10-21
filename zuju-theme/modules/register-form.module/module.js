let count = 0
const total = $('.hs_cos_wrapper_type_form').length

function validateEmail (email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
}

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

    // Birthday validation
    const BOD = $(`[name="birthday"]`)
    const inFuture = date => {
      return date.setHours(0, 0, 0, 0) > new Date().setHours(0, 0, 0, 0)
    }

    console.log(BOD)

    BOD.on('change', () => {
      console.log('changed')
      console.log(inFuture(new Date(BOD.val())))
    })

    // Mutation observer
    let observer = new MutationObserver(mutationRecords => {
      console.log(mutationRecords) // console.log(the changes)
    })

    // observe everything except attributes
    console.log('======== Mutation observer ======')
    observer.observe(BOD[0], {
      childList: true, // observe direct children
      subtree: true, // and lower descendants too
      characterDataOldValue: true // pass old data to callback
    })
  }
})
