document.addEventListener("DOMContentLoaded", () => {

    const btnRegistrar = document.getElementById("btnRegistrar");
    if(!btnRegistrar) return;

    btnRegistrar.addEventListener("click", () => {
        window.location.href = "registrarse.html";
    });

    const formulario = document.getElementById("FormularioLogin");
    formulario.addEventListener("submit", (e) => {
        e.preventDefault();

        const usuario = document.getElementById("usuario").value.trim();
        const password = document.getElementById("password").value;

    const lista = JSON.parse(localStorage.getItem("usuarios")) || [];

    const usuarioEncontrado = lista.find(function(u) {
        return u.email === usuario && u.password === password;
    })

    if(usuarioEncontrado) {
        alert("Inicio de sesión exitoso ✅");
        // const bienvenida = document.getElementById("bienvenida");
        // bienvenida.textContent = "Bienvenido " + usuarioEncontrado.nombre;
        window.location.href = "index.html";
    }else {
        alert("Usuario o contraseña incorrectos ❌");
        return;
    } 
    });
});
