let messages = transactions_locale

console.log(messages)
delete messages.type

function getMessage (key, messages) {
  key = 'fe_' + key.replaceAll('-', '_')
	console.log(key)

	if (!messages[key]) return `<div style="color: red">Undefined => ${key}<div>`
  return messages[key]
}

const renderHistoryTable = (data, filter = '') => {
  const table = $('.pnt-history .table')

  let html = ''

  table.find('tbody').empty()

  // Filter
  data.forEach(group => {
    html += `<tr class="table__row table__row--span"><td colspan="3">${group.date}</td></tr>`

    html += group.items
			.filter(item => {
				return item.fe_type !== 'non-rebate'
			})
      .map(item => {
        const pointChanged = item.credit ? `+${item.credit}` : `-${item.debit}`

        return `
          <tr class="table__row" style="vertical-align: baseline">
            <td class="table__td-left" style="padding-right: 2rem">
              <b>${getMessage(item.fe_type, messages)}</b> ${ item.fe_item ? ': ' + item.fe_item : ''}
						</td>
            <td class="table__cost" style="margin-left: 2rem">
              ${item.amount ? item.amount : ''}
            </td>
            <td class="table__td-right">
              <div class="clr-primary">${pointChanged}</div>
            </td>
          </tr>`
      })
      .join('')
  })

  if (!data.length) html = '<tr><td colspan="3"><h4 class="text-center">No data</h4></td></tr>'
  table.find('tbody').append(html)

  table.hide().fadeIn()
}

const mapToGroup = (data, filter = '') => {
  const mapped = []

  data
    .filter(item => (filter ? item[filter] : item))
    .filter(item => item.fe_type)
    .forEach(item => {
      const indexExist = mapped.findIndex(
        m => formatDate(m.date) === formatDate(item.updated_at)
      )
      if (indexExist >= 0) {
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

// uid
fetch(`${BASE_URL}/points-history?uid=${37851}`)
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