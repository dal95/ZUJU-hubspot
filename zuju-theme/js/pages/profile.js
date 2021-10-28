let count = 0
const total = $('.hs_cos_wrapper_type_form').length

window.addEventListener('message', event => {
  if (
    event.data.type === 'hsFormCallback' &&
    event.data.eventName === 'onFormReady'
  ) {
    count++
    if (count < total) return

    $('[name="country_dropdown"]').on('change', function () {
      $('.hs-input.hs-fieldtype-intl-phone')
        .find('select')
        .val($(this).val())
        .trigger('change')
    })

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
      '.edit input[name="birthday"], .edit input[name="username"], .edit input[name="email"]'
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
  }
})
