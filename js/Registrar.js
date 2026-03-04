document.addEventListener("DOMContentLoaded", () => {

  const formulario = document.getElementById("FormularioRegistro");
  const btnIniciarSesion = document.getElementById("btnRegistrar");

  // Botón ir a login
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

    const lista = JSON.parse(localStorage.getItem("usuarios")) || [];

    const documentoExiste = lista.some(u => u.documento === documento);
    const correoExiste = lista.some(u => u.email === email);

    if (correoExiste) {
      mostrarMensaje("Ese correo ya está registrado");
      return;
    }

    if (documentoExiste) {
      mostrarMensaje("Ese documento ya está registrado");
      return;
    }

    const nuevoUsuario = {
      usuario,
      documento,
      edad,
      email,
      password
    };

    lista.push(nuevoUsuario);

    localStorage.setItem("usuarios", JSON.stringify(lista));

    mostrarMensaje("Usuario registrado con éxito");

    formulario.reset();
  });


  function mostrarMensaje(texto, color) {

    const mensaje = document.getElementById("mensajeRegistro");

    mensaje.innerHTML = "<strong>" + texto + "</strong>"; 
    mensaje.style.color = color;

    setTimeout(() => {
      mensaje.textContent = ""; 
    }, 3000);
  }

});