const openMenu = document.querySelector('.mobile');
const btnOpen = document.querySelector('.open');
const btnClose = document.querySelector('.close');

btnOpen.addEventListener('click', function() {
    openMenu.style.display = 'block';
})
btnClose.addEventListener('click', function() {
    openMenu.style.display = 'none';
})