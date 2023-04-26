window.addEventListener('scroll', function() {
    const parallax = document.querySelector('#texts');
    let scrollPosition = window.pageYOffset;
    parallax.style.transform = 'translateY(' + scrollPosition * 0.37 + 'px)';
});

var typed = new Typed(".typing", {
    strings: ["Palavra", "Louvor", "Dança", "Teatro"],
    typeSpeed: 60,
    backSpeed: 50,
    loop: true
});
var typed = new Typed(".typing-2", {
    strings: ["Adoração", "Comunhão", "Discipulado", "Serviço", "Evangelismo"],
    typeSpeed: 60,
    backSpeed: 50,
    loop: true
});

const openMenu = document.querySelector('.mobile');
const btnOpen = document.querySelector('.open');
const btnClose = document.querySelector('.close');

btnOpen.addEventListener('click', function() {
    openMenu.style.display = 'block';
})
btnClose.addEventListener('click', function() {
    openMenu.style.display = 'none';
})