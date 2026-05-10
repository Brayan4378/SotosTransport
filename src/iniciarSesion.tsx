document.addEventListener("DOMContentLoaded", () => {
    const btnRegistrar = document.getElementById("btnRegistrar") as HTMLButtonElement | null;
    const formulario = document.getElementById("FormularioLogin") as HTMLFormElement | null;
    const mensaje = document.getElementById("mensaje") as HTMLElement | null;

    if (btnRegistrar) {
        btnRegistrar.addEventListener("click", () => {
            window.location.href = "registrarse.html";
        });
    }

    if (!formulario || !mensaje) {
        return;
    }

    formulario.addEventListener("submit", (e: Event) => {
        e.preventDefault();

        const usuarioInput = document.getElementById("usuario") as HTMLInputElement;
        const passwordInput = document.getElementById("password") as HTMLInputElement;
        const usuario = usuarioInput.value.trim().toLowerCase();
        const password = passwordInput.value;
        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(usuario);

        if (!usuario || !password) {
            mensaje.innerHTML = "Completa correo y contrasena.";
            mensaje.className = "mensaje-negativo";
            return;
        }

        if (!emailValido) {
            mensaje.innerHTML = "El correo electronico no tiene un formato valido.";
            mensaje.className = "mensaje-negativo";
            return;
        }

        if (password.length < 8 || password.length > 24) {
            mensaje.innerHTML = "La contrasena debe tener entre 8 y 24 caracteres.";
            mensaje.className = "mensaje-negativo";
            return;
        }

        const lista = JSON.parse(localStorage.getItem("usuarios") || "[]");
        const usuarioEncontrado = lista.find((u: any) => u.email.toLowerCase() === usuario && u.password === password);

        if (usuarioEncontrado) {
            lista.forEach((u: any) => {
                u.validacion = false;
            });

            usuarioEncontrado.validacion = true;
            localStorage.setItem("usuarios", JSON.stringify(lista));

            mensaje.innerHTML = `Bienvenido ${usuarioEncontrado.usuario} ✅`;
            mensaje.className = "mensaje-positivo";

            setTimeout(() => {
                window.location.href = "index.html";
            }, 1400);
            return;
        }

        mensaje.innerHTML = "Correo o contrasena incorrectos.";
        mensaje.className = "mensaje-negativo";
    });
});
