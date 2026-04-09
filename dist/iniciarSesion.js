document.addEventListener("DOMContentLoaded", () => {
    const listalogeo = JSON.parse(localStorage.getItem("usuarios") || "[]");
    const pruebaLogueo = listalogeo.find(function (u) {
        return u.validacion === true;
    });
    const paginaActual = window.location.pathname.split("/").pop();
    if (!pruebaLogueo && paginaActual !== "iniciarSesion.html") {
        window.location.href = "iniciarSesion.html";
    }
    if (pruebaLogueo && paginaActual === "iniciarSesion.html") {
        window.location.href = "index.html";
    }
    const btnRegistrar = document.getElementById("btnRegistrar");
    if (!btnRegistrar)
        return;
    btnRegistrar.addEventListener("click", () => {
        window.location.href = "registrarse.html";
    });
    const formulario = document.getElementById("FormularioLogin");
    if (!formulario)
        return;
    formulario.addEventListener("submit", (e) => {
        e.preventDefault();
        const usuarioInput = document.getElementById("usuario");
        const passwordInput = document.getElementById("password");
        const usuario = usuarioInput.value.trim();
        const password = passwordInput.value;
        const lista = JSON.parse(localStorage.getItem("usuarios") || "[]");
        const usuarioEncontrado = lista.find(function (u) {
            return u.email === usuario && u.password === password;
        });
        const mensaje = document.getElementById("mensaje");
        setTimeout(() => {
            mensaje.innerHTML = "";
        }, 1500);
        if (usuarioEncontrado) {
            usuarioEncontrado.validacion = true;
            localStorage.setItem("usuarios", JSON.stringify(lista));
            mensaje.innerHTML =
                "Bienvenido " + usuarioEncontrado.usuario + " ✅";
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1400);
        }
        else {
            mensaje.innerHTML =
                "Correo o contraseña incorrectos ❌";
            return;
        }
    });
});
export {};
