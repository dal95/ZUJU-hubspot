window.addEventListener('message', event => {
  if (
    event.data.type === 'hsFormCallback' &&
    event.data.eventName === 'onFormReady'
  ) {
    if (event.data.id !== 'ff4fd248-ad02-4d39-9971-a8880316c297')  return

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

    $birthdayInput = $('input[name="birthday"]').closest('.input')
    $emailInput = $('#hs_form_target_profile input[name="email"]').closest('.input')

    $birthdayInput.addClass('disabled')
    $emailInput.addClass('disabled')

    $('.disabled').closest('.field').find('label').on('click', e => e.preventDefault())

    $('.hs-input').each(function () {
      const propName = $(this).attr('name')
      if (propName === 'custom_avatar') return

      if (propName === 'birthday') {
        const current = new Date(contact[propName])

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

          // this method of changing the value doesn't work.
          // hubspot internally use react to control / sync between the hidden input, the readonly input and the datepicker
          // To counter this we have to remove the data-reactid
          // console.log('original', contact[propName])
          // console.log(newDate, this)
          // const reactId = $(this)
          //   .prev()
          //   .data('react-id')

          // $(this)
          //   .prev()
          //   .removeAttr('readonly')
          // $(this)
          //   .prev()
          //   .removeAttr('data-reactid')
          // $(this)
          //   .prev()
          //   .val(contact[propName])
          //   .trigger('change')
          // $(this)
          //   .val(newDate)
          //   .trigger('change')

          // $(this)
          //   .prev()
          //   .data('react-id', reactId)
        }
      } else {
        $(this)
          .val(contact[propName])
          .trigger('change')
      }
    })
  }
})
