document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.getElementById("FormularioRegistro");
    const btnIniciarSesion = document.getElementById("btnRegistrar");
    if (!btnIniciarSesion)
        return; // Si el botón no existe, no hacemos nada
    btnIniciarSesion.addEventListener("click", () => {
        window.location.href = "iniciarSesion.html";
    });
    formulario.addEventListener("submit", (e) => {
        e.preventDefault();
        const usuario = document.getElementById("usuario").value.trim();
        const documento = document.getElementById("documento").value.trim();
        const edad = document.getElementById("edad").value;
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const validacion = false;
        // Traer lista actual (o crear una vacía)
        const lista = JSON.parse(localStorage.getItem("usuarios") || "[]");
        // Validar que no exista el usuario
        const documentoExiste = lista.some((u) => u.documento === documento);
        const correoExiste = lista.some((u) => u.email === email);
        if (correoExiste) {
            alert("Ese correo electrónico ya está en uso");
            return;
        }
        if (usuario === "" || documento === "" || edad === "" || email === "" || password === "") {
            alert("Por favor, complete todos los campos");
            return;
        }
        if (isNaN(Number(edad)) || Number(edad) <= 0) {
            alert("Por favor, ingrese una edad válida");
            return;
        }
        if (password.length < 6) {
            alert("La contraseña debe tener al menos 6 caracteres");
            return;
        }
        if (!email.includes("@") || !email.includes(".")) {
            alert("Por favor, ingrese un correo electrónico válido");
            return;
        }
        if (documentoExiste) {
            alert("Ese documento ya está registrado");
            return;
        }
        // Agregar nuevo usuario
        lista.push({ usuario, documento, edad, email, password, validacion });
        // Guardar lista actualizada
        localStorage.setItem("usuarios", JSON.stringify(lista));
        alert("Usuario registrado");
        formulario.reset(); // limpia el formulario
    });
});
export {};
