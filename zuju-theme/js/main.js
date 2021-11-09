const triggerClose = $('.modal__overlay, [data-modal-close]')

$(document).ready(function () {
  var lang = navigator.language
  var currURL = window.location.href
  var currPath = location.pathname

  //lang = "zh-cn";

  if (
    currPath == '/' &&
    currURL.toLowerCase().indexOf('/zh-cn') == -1 &&
    (lang.toLowerCase().indexOf('cn') !== -1 ||
      lang.toLowerCase().indexOf('zh') !== -1)
  ) {
    var redirectURL =
      location.protocol + '//' + window.location.hostname + '/zh-cn' + currPath
    //console.log(redirectURL);
    window.location.replace(redirectURL)
  } else {
    //console.log("currPath is EN homepage or lang is NOT zh-cn or already on /zh-cn, so do nothing");
  }
})

$('[data-modal-target]').on('click', function () {
  // togggleBodyScroll(true)
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
  const table = $('.hs-content-id-56472088979 .pnt-history .table')

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

  if (!data.length) html = '<tr><td><h4 class="text-center">No data</h4></td></tr>'
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

const BASE_URL = 'https://www.zujugp.com/_hcms/api'

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

    $('.hs-content-id-56472088979 .pnt-history .tabs__menu').on('click', function () {
      $('.hs-content-id-56472088979 .pnt-history .tabs__menu').removeClass('active')
      $(this).addClass('active')
      renderHistoryTable(mapToGroup(transactions, $(this).data('filter')))
    })
  })
  .catch(err => console.log(err))

const dashboardAllowedPages = ['/members-portal', '/membership']

if (
  dashboardAllowedPages.find(slug => window.location.href.indexOf(slug) != -1)
) {
  fetch(`${BASE_URL}/dashboard?uid=${uid}`)
    .then(res => res.json())
    .then(res => {
      // Membership page
      const {
        daily_task,
        kfd_game,
        refer,
        is_first_login,
        progress_bar
      } = res.data
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

      $('.cnt__item').each(function () {
        const day = kfd_game?.this_week_continuous_days
        if ($(this).data('day') <= day) {
          $(this).addClass('checked')
        }
      })

      setUpContinousSlide(kfd_game.continuous_day)

      if (progress_bar.target_to_points == 0) {
        $('.membership-tier-desc')
          .text('Congratulation you are an Ultimate Fan')
          .css('opacity', 1)
      } else {
        $('.membership-tier-points').text(progress_bar.target_to_points)
        $('.membership-tier-goal').text(progress_bar.goal_fan_status)
        $('.membership-tier-desc')
          .css('opacity', 1)
          .fadeIn()
      }

      // Set Referral Link
      const ref = new URL(refer?.referral_link)

      if (ref) {
        const refVal = `https://www.zujugp.com/${
          lang == 'en' ? '' : lang + '/'
        }registration?refer=${ref.searchParams.get('refer')}`
        $('#referral-id').val(refVal)

        const shareData = {
          title: 'Zuju Referral Program',
          text: 'Get more Z Points',
          url: refVal
        }

        const btn = document.querySelector('#share-referral')
        const resultPara = document.querySelector('.result')

        // Share must be triggered by "user activation"
        btn &&
          btn.addEventListener('click', async () => {
            try {
              await navigator.share(shareData)
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
        $(this).text('Copied!')
        setTimeout(() => $(this).text('Copy'), 1000)
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

function setUpContinousSlide (start) {
  // $('.continous').slick({
  //   slidesToShow: 7,
  //   slidesToScroll: 7,
  //   centerMode: false,
  //   arrows: true,
  //   infinite: false,
  //   initialSlide: start,
  //   prevArrow: `<div class="prev-arrow">${chevronLeft}</div>`,
  //   nextArrow: `<div class="next-arrow">${chevronRight}</div>`,
  //   responsive: [
  //     {
  //       breakpoint: 600,
  //       settings: {
  //         slidesToShow: 4,
  //         slidesToScroll: 4
  //       }
  //     }
  //   ]
  // })
  var Splide = window.Splide || ''
  if (!Splide) return

  new Splide('.splide', {
    perPage: 7,
    perMove: 7,
    pagination: false,
    start: start <= 1 ? 0 : start - 1,
    arrowPath:
      'M15.6624 13.9999L1.95962 0.335019C1.51067 -0.112433 0.783795 -0.111681 0.33559 0.337333C-0.112267 0.78629 -0.11111 1.51357 0.337905 1.96136L13.2251 14.813L0.337442 27.6645C-0.111515 28.1123 -0.112672 28.8392 0.335127 29.2882C0.559808 29.5133 0.854156 29.6258 1.1485 29.6258C1.4421 29.6258 1.73529 29.514 1.95956 29.2905L15.6624 15.6259C15.8787 15.4108 16 15.118 16 14.813C16 14.5079 15.8783 14.2155 15.6624 13.9999Z',
    breakpoints: {
      600: {
        perPage: 4
      }
    }
  }).mount()
}

// var lastScrollTop = 0;
// $(window).scroll(function(event){
//    var st = $(this).scrollTop();
//    if (st > lastScrollTop){
// 	   $('.nav-sticky').removeClass('is-sticky');
//    } else {
// 	   $('.nav-sticky').addClass('is-sticky');
//    }
//    lastScrollTop = st;
// });
