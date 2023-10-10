const openMenu = document.querySelector('.mobile');
const btnOpen = document.querySelector('.open');
const btnClose = document.querySelector('.close');

btnOpen.addEventListener('click', function() {
    openMenu.style.display = 'block';
})
btnClose.addEventListener('click', function() {
    openMenu.style.display = 'none';
})

// Função para definir um cookie
function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

// Função para obter o valor de um cookie
function getCookie(name) {
    const cookieArr = document.cookie.split(';');
    for (let i = 0; i < cookieArr.length; i++) {
        const cookiePair = cookieArr[i].split('=');
        if (cookiePair[0].trim() === name) {
            return decodeURIComponent(cookiePair[1]);
        }
    }
    return null;
}

const cookieBox = document.querySelector(".cookie-content");
const acceptBtn = cookieBox.querySelector(".button");

function setCookie(){
    document.cookie = "CookieBy=CasaDeAdoração; max-age=" + 60 * 60 * 24 * 30;
    if (document.cookie) {
        cookieBox.classList.add("hide");
    } else {
        alert("O cookie não pode ser definido! Por favor, desbloqueie este site da configuração de cookies do seu navegador.");
    }
}
acceptBtn.addEventListener("click", setCookie);
const checkCookie = document.cookie.indexOf("CookieBy=CasaDeAdoração");
checkCookie !== -1 ? cookieBox.classList.add("hide") : cookieBox.classList.remove("hide");

