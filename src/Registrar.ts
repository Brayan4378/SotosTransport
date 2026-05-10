document.addEventListener("DOMContentLoaded", () => {
  interface Usuario {
    usuario: string;
    documento: string;
    edad: string;
    email: string;
    password: string;
    validacion: boolean;
  }

  const formulario = document.getElementById("FormularioRegistro") as HTMLFormElement | null;
  const btnIniciarSesion = document.getElementById("btnRegistrar");

  if (!formulario || !btnIniciarSesion) {
    return;
  }

  const mensaje = document.createElement("div");
  mensaje.id = "mensajeRegistro";
  mensaje.style.marginTop = "14px";
  mensaje.style.fontWeight = "bold";
  formulario.appendChild(mensaje);

  function mostrarMensaje(texto: string, color: string): void {
    mensaje.textContent = texto;
    mensaje.style.color = color;
    mensaje.className = color === "limegreen" ? "mensaje-positivo" : "mensaje-negativo";
  }

  btnIniciarSesion.addEventListener("click", () => {
    window.location.href = "iniciarSesion.html";
  });

  formulario.addEventListener("submit", (e: Event) => {
    e.preventDefault();

    const usuario = (document.getElementById("usuario") as HTMLInputElement).value.trim().replace(/\s+/g, " ");
    const documento = (document.getElementById("documento") as HTMLInputElement).value.trim();
    const edad = Number((document.getElementById("edad") as HTMLInputElement).value);
    const email = (document.getElementById("email") as HTMLInputElement).value.trim().toLowerCase();
    const password = (document.getElementById("password") as HTMLInputElement).value;
    const confirmPassword = (document.getElementById("confirmPassword") as HTMLInputElement).value;
    const validacion = false;

    const lista: Usuario[] = JSON.parse(localStorage.getItem("usuarios") || "[]");
    const documentoExiste = lista.some((u: Usuario) => u.documento === documento);
    const correoExiste = lista.some((u: Usuario) => u.email.toLowerCase() === email);
    const nombreValido = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{3,40}$/.test(usuario);
    const documentoValido = /^\d{6,12}$/.test(documento);
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
    const passwordValida = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s]).{8,24}$/.test(password);

    if (!usuario || !documento || Number.isNaN(edad) || !email || !password || !confirmPassword) {
      mostrarMensaje("Todos los campos son obligatorios.", "#ff8a8a");
      return;
    }

    if (!nombreValido) {
      mostrarMensaje("El nombre debe tener entre 3 y 40 letras y solo puede contener letras y espacios.", "#ff8a8a");
      return;
    }

    if (!documentoValido) {
      mostrarMensaje("El documento debe tener entre 6 y 12 digitos numericos.", "#ff8a8a");
      return;
    }

    if (!Number.isInteger(edad) || edad < 18 || edad > 100) {
      mostrarMensaje("La edad debe ser un numero entero entre 18 y 100 anos.", "#ff8a8a");
      return;
    }

    if (!emailValido) {
      mostrarMensaje("Ingresa un correo electronico valido.", "#ff8a8a");
      return;
    }

    if (!passwordValida) {
      mostrarMensaje("La contrasena debe tener 8 a 24 caracteres, mayuscula, minuscula, numero y simbolo.", "#ff8a8a");
      return;
    }

    if (password !== confirmPassword) {
      mostrarMensaje("La confirmacion de la contrasena no coincide.", "#ff8a8a");
      return;
    }

    if (correoExiste) {
      mostrarMensaje("Ese correo electronico ya esta en uso.", "#ff8a8a");
      return;
    }

    if (documentoExiste) {
      mostrarMensaje("Ese documento ya esta registrado.", "#ff8a8a");
      return;
    }

    lista.push({ usuario, documento, edad: String(edad), email, password, validacion });
    localStorage.setItem("usuarios", JSON.stringify(lista));
    mostrarMensaje("Usuario registrado correctamente.", "limegreen");
    formulario.reset();
  });
});
