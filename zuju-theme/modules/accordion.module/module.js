$('.accordion-title').on('click', function() {
    $(this).next().slideToggle('fast')
    $(this).parent().toggleClass('active')
})