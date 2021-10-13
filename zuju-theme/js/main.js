const triggerClose = $('.modal__overlay, [data-modal-close]')

$('[data-modal-target]').on('click', function () {
    // togggleBodyScroll(true)
    console.log('test')
  modalIn(`#${$(this).data('modal-target')}`)
})

triggerClose.on('click', function () {
  modalOut('.modal', () => {
    // togggleBodyScroll(false)
  })
})

function isModalActive (modalClass = '.modal') {
  return $(modalClass).hasClass('active')
}

// Toggle body scrollable
function togggleBodyScroll (cond) {
  $('html, body').css({
    overflow: cond ? 'hidden' : 'auto',
    height: cond ? '100%' : 'auto'
  })
}

/**
 * Animation / effect
 */
function modalIn (selector = '.modal', callback) {
  const overlay = $(selector).find('.modal__overlay')
  const main = $(selector).find('.modal__main')
  console.log(main)
  const tl = gsap.timeline({
    ease: Power2.easeInOut
  })

  return tl
    .to($(selector), {
      display: 'flex'
    })
    .fromTo(
      overlay,
      { display: 'none' },
      {
        duration: 0.5,
        display: 'block',
        autoAlpha: 1,
        ease: Power2.easeInOut
      },
      '-=.5'
    )
    .fromTo(
      main,
      { y: '-100vh', scale: 0.4 },
      {
        display: 'block',
        autoAlpha: 1,
        y: 0,
        duration: 0.5,
        scale: 1,
        skewX: 0,
        skewY: 0,
        perspective: 800,
        ease: Power2.easeInOut,
        onComplete: callback
      },
      '-=.5'
    )
    .from(
      '.anim img, .anim h3, .anim .highlight, .anim .button, .anim p, .anim .fields, .anim .field, .anim input',
      {
        duration: 0.3,
        stagger: 0.05,
        opacity: 0,
        ease: Linear.easeInOut
      }
    )
}

function modalOut (selector = '.modal', callback) {
  const overlay = $(selector).find('.modal__overlay')
  const main = $(selector).find('.modal__main')
  const tl = gsap.timeline({
    ease: Power2.easeOut
  })

  return tl
    .to(main, {
      y: '100vh',
      opacity: 0,
      duration: 0.3,
      scale: 0.4,
      clearProps: 'all'
    })
    .to(
      overlay,
      {
        display: 'none',
        autoAlpha: 1,
        duration: 0.3,
        ease: Linear
      },
      '-=.15'
    )
    .to($(selector), { display: 'none', onComplete: callback }, '-=.3')
}

$(window).on('load', function () {
  $('.card').css('height', function () {
    return this.scrollHeight
  })
})

$('#id-categories').on('change', function () {
  const url = new URL(window.location.href)
  url.searchParams.set('categories', $(this).val())
  console.log($(this).val())
  console.log(url.toString())

  window.location.href = url.toString()
})

$('#id-points').on('change', function () {
  const url = new URL(window.location.href)
  url.searchParams.set('points', $(this).val())

  window.location.href = url.toString()
})

// Off canvas
function offCanvasEffect (bool = false) {
  const tl = gsap.timeline({})
  return tl.to('.off-canvas', {
    duration: 0.5,
    ease: Power2.easeInOut,
    x: 0
  })
}

function offCanvasOut () {
  gsap.to('.off-canvas', {
    duration: 0.5,
    ease: Power2.easeInOut,
    x: '-100%'
  })
}

$('.burger-menu').on('click', e => {
  e.stopPropagation()
  offCanvasEffect()
})

$('.off-canvas')
  .find('svg')
  .on('click', () => offCanvasOut())

$('.has-dropdown svg').on('click', e => e.preventDefault())

document.addEventListener('click', function (event) {
  if (!event.target.closest('.off-canvas')) {
    offCanvasOut()
  }
})

/**
 *
 * @param {*} data Array of the history
 * @param {*} filter could be: 'debit' or 'credit'
 */
const renderHistoryTable = (data, filter = '') => {
  const table = $('.pnt-history .table')

  let html = ''

  table.find('tbody').empty()

  // Filter
  data.forEach(group => {
    html += `<tr class="table__row table__row--span"><td colspan="2">${group.date}</td></tr>`

    html += group.items
      .map(item => {
        const pointChanged = item.credit ? `+${item.credit}` : `-${item.debit}`
        return `<tr class="table__row">
            <td class="table__td-left">${item.description}</td>
            <td class="table__td-right">
              <div>Z Points <span class="debug">credit: ${item.credit} debit: ${item.debit}</span></div>
              <div class="clr-primary">${pointChanged}</div>
            </td>
          </tr>`
      })
      .join('')
  })

  if (!data.length) html = '<h4 class="text-center">No data</h4>'
  table.find('tbody').append(html)

  table.hide().fadeIn()
}

const mapToGroup = (data, filter = '') => {
  const mapped = []

  data
    .filter(item => (filter ? item[filter] : item))
    .forEach(item => {
      const indexExist = mapped.findIndex(
        m => formatDate(m.date) === formatDate(item.updated_at)
      )
      if (indexExist >= 0) {
        // item.credit = 0
        // item.debit = Math.floor(Math.random() * 20)
        mapped[indexExist].date = formatDate(item.created_at)
        mapped[indexExist].items.push(item)
      } else {
        mapped.push({ date: formatDate(item.created_at), items: [{ ...item }] })
      }
    })

  return mapped
}

const formatDate = date => {
  return new Date(date).toLocaleDateString('en-SG', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const BASE_URL = 'https://dev.zujugp.com/_hcms/api'

const uid = user_vid

fetch(`${BASE_URL}/daily-login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
    // 'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: JSON.stringify({
    uid: uid
  })
})
  .then(res => res.json())
  .then(res => console.log(res.message))

fetch(`${BASE_URL}/points-history?uid=${uid}`)
  .then(res => res.json())
  .then(res => {
    const transactions = res.data

    // Render
    renderHistoryTable(mapToGroup(transactions))

    $('.pnt-history .tabs__menu').on('click', function () {
      $('.pnt-history .tabs__menu').removeClass('active')
      $(this).addClass('active')
      renderHistoryTable(mapToGroup(transactions, $(this).data('filter')))
    })
  })
  .catch(err => console.log(err))

const dashboardAllowedPages = ['/members-portal', '/membership']

if (dashboardAllowedPages.find(slug => window.location.href.indexOf(slug) != -1)) {
  fetch(`${BASE_URL}/dashboard?uid=${uid}`)
    .then(res => res.json())
    .then(res => {
      // Membership page
      const { daily_task, kfd_game, refer, is_first_login, progress_bar } = res.data
      const tasksNames = Object.keys(daily_task)
      const mapped = tasksNames.map(i => res.data.daily_task[i])

      const completedProgress = mapped.filter(item => item.completed).length
      const goalProgress = tasksNames.length

      $('.progress-indicator__cn').text(completedProgress)
      $('.progress-indicator__tg').text(goalProgress)

      // Disabled due to requirement change
      // $('.progress__bar-inner').css(
      //   'width',
      //   (checkedLength / checkedTarget) * 100 + '%'
      // )

      // Check the completed item
      $('.list input[type="checkbox"]').each(function (index) {
        const val = res.data.daily_task[$(this).attr('name')]
        $(this).attr('checked', !!val?.completed)
      })

      $('.task-easter-egg .pg__achieved').text(
        daily_task?.find_easter_egg?.value?.achieved_times
      )
      $('.task-easter-egg .pg__max').text(
        daily_task?.find_easter_egg?.value?.max_times_per_day
      )

      $('.task-comments .pg__achieved').text(
        daily_task?.comments?.value?.achieved_times
      )

      $('.task-comments .pg__max').text(
        daily_task?.comments?.value?.max_times_per_day
      )

      $('.timeline__point').each(function () {
        const day = kfd_game?.this_week_continuous_days
        if ($(this).data('day') <= day) {
          $(this).addClass('checked')

          if ($(this).data('day') <= day - 1) {
            $(this)
              .find('.timeline__bar')
              .addClass('active')
          }
        }
      })

      $('.continous__item').each(function () {
        if ($(this).data('day') <= kfd_game.continuous_day) {
          $(this).addClass('checked')
        }
      })

      $('.membership-tier-points').text(progress_bar.target_to_points)

      // Set Referral Link
      const ref = new URL(refer?.referral_link)

      if (ref) {
        $('#referral-id').val(ref.searchParams.get('refer'))

        const shareData = {
          title: 'Zuju Referral Program',
          text: 'Get more Z Points',
          url: refer?.referral_link
        }

        const btn = document.querySelector('#share-referral')
        const resultPara = document.querySelector('.result')

        // Share must be triggered by "user activation"
        btn.addEventListener('click', async () => {
          try {
            await navigator.share(shareData)
            // resultPara.textContent = 'MDN shared successfully'
            console.log('successfully share')
          } catch (err) {
            // resultPara.textContent = 'Error: ' + err
          }
        })
      }

      if (is_first_login) return modalIn('#modal-welcome')
      //  modalIn('#modal-welcome')
    })
    .catch(err => console.log(err))
}

$('.tab-content.active').fadeIn()
$('.tabs__menu').on('click', function () {
  const target = $(this).data('tab')

  $('.tabs__menu').removeClass('active')
  $(this).addClass('active')

  $('.tab-content').fadeOut(function () {
    $(`#${target}`).fadeIn()
  })
})

$('.list input[type="checkbox"]').on('click', e => e.preventDefault())

$('.copy')
  .find('.button')
  .on('click', function () {
    $('.copy input[type="text"]').select()

    navigator.clipboard
      .writeText($('.copy input[type="text"]').val())
      .then(() => {
        // Success!
        $(this).text('Copied')
      })
      .catch(err => {
        console.log('Something went wrong', err)
      })
  })

function setCookie (name, value, days) {
  var expires = ''
  if (days) {
    var date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    expires = '; expires=' + date.toUTCString()
  }
  document.cookie = name + '=' + (value || '') + expires + '; path=/'
}

function getCookie (name) {
  var nameEQ = name + '='
  var ca = document.cookie.split(';')
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i]
    while (c.charAt(0) == ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

window.getCookie = getCookie

function eraseCookie (name) {
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
}

$('#modal-birthday .button').on('click', function () {
  setCookie('birthday-give-claimed', +new Date(), 365)
})
