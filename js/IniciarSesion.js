document.addEventListener("DOMContentLoaded", () => {

const listalogeo = JSON.parse(localStorage.getItem("usuarios")) || [];

const pruebaLogueo = listalogeo.find(function(u) {
    return u.validacion === true;
});

const paginaActual = window.location.pathname.split("/").pop();

if (!pruebaLogueo && paginaActual !== "iniciarSesion.html") {
    window.location.href = "iniciarSesion.html";
}

if (pruebaLogueo && paginaActual === "iniciarSesion.html") {
    window.location.href = "index.html";
}


    // botin cambio de pagina a registrarse
    const btnRegistrar = document.getElementById("btnRegistrar");
    if (!btnRegistrar) return;

    btnRegistrar.addEventListener("click", () => {
        window.location.href = "registrarse.html";
    });

    // logica de inicio de sesion
    const formulario = document.getElementById("FormularioLogin");
    formulario.addEventListener("submit", (e) => {
        e.preventDefault();

        const usuario = document.getElementById("usuario").value.trim();
        const password = document.getElementById("password").value;

    // uso de localstorage para traer lista
    const lista = JSON.parse(localStorage.getItem("usuarios")) || [];
    
    const usuarioEncontrado = lista.find(function(u) {
        return u.email === usuario && u.password === password;
    })
    

        // timer para mensaje de bienvenida o error
        const mensaje = document.getElementById("mensaje");

        setTimeout(() => {
            mensaje.innerHTML = "";
        }, 1500);

    // condicion inicio y manipulación del DOM para mensaje de bienvenida o error
    if(usuarioEncontrado) {
        usuarioEncontrado.validacion = true;
        localStorage.setItem("usuarios", JSON.stringify(lista));
        document.getElementById("mensaje").innerHTML =
        "Bienvenido " + usuarioEncontrado.usuario + " ✅";     
        setTimeout(() => {
        window.location.href = "index.html";
     }, 1400);
        
    }else {
        document.getElementById("mensaje").innerHTML =
      "Correo o contraseña incorrectos ❌";
        return;
    } 
    });
});