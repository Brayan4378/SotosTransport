document.addEventListener("DOMContentLoaded", () => {
    const paginasPublicas = ["iniciarSesion.html", "registrarse.html"];
    const paginaActual = window.location.pathname.split("/").pop() || "index.html";
    const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
    const haySesionActiva = usuarios.some((usuario: any) => usuario.validacion === true);

    if (!haySesionActiva && paginasPublicas.indexOf(paginaActual) === -1) {
        window.location.href = "iniciarSesion.html";
        return;
    }

    if (haySesionActiva && paginasPublicas.indexOf(paginaActual) !== -1) {
        window.location.href = "index.html";
    }
});
