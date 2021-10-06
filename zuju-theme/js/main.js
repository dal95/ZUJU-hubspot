const modalTrigger = document.querySelector('[data-modal-target]')
const modalOverlay = document.querySelector('.modal__overlay')

modalTrigger &&
  modalTrigger.addEventListener('click', function () {
    // togggleBodyScroll(true)
    modalIn(`#${$(this).data('modal-target')}`)
    // document.querySelector('.modal').classList.add('active')
  })

modalTrigger &&
  modalOverlay.addEventListener('click', function () {
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
  console.log(selector)
  console.log($(selector))
  const overlay = $(selector).find('.modal__overlay')
  const main = $(selector).find('.modal__main')
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
    .from('.modal h3, .modal p, .fields, .field, input[type="submit"]', {
      duration: 0.5,
      stagger: 0.05,
      opacity: 0,
      ease: Linear.easeInOut
    })
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
  const url = new URLSearchParams(window.location.search)
  url.set('categories', $(this).val())

  window.location.href =
    window.location.origin + '/rewards/' + '?' + url.toString()
})

$('#id-points').on('change', function () {
  const url = new URLSearchParams(window.location.search)
  url.delete('lt')
  url.delete('gt')

  const v = $(this).val()
  if (v.includes('-')) {
    url.set('gt', v.split('-')[0])
    url.set('lt', v.split('-')[1])
  }
  if (v.includes('<')) url.set('lt', v.substr(1))
  if (v.includes('>')) url.set('gt', v.substr(1))

  window.location.href =
    window.location.origin + '/rewards/' + '?' + url.toString()
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
              <div>Zuju points <span class="debug">credit: ${item.credit} debit: ${item.debit}</span></div>
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

if (dashboardAllowedPages.includes(location.pathname)) {
  fetch(`${BASE_URL}/dashboard?uid=${uid}`)
    .then(res => res.json())
    .then(res => {
      // Membership page
      const { daily_task, kfd_game, refer } = res.data
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
            console.log(
              $(this)
                .find('.timeline__day')
                .text()
            )
            console.log($(this).find('.timeline__bar'))
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

      // Set Referral Link
      const ref = new URL(refer?.referral_link)

      if (ref) {
        $('#referral-id').val(ref.searchParams.get('refer'))
      }
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

  // modalIn('#modal-welcome')