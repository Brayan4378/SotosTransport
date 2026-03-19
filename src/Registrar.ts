document.addEventListener("DOMContentLoaded", () => {
  interface Usuario {
    usuario: string;
    documento: string;
    edad: string;
    email: string;
    password: string;
    validacion: boolean;
  }

  const formulario = document.getElementById("FormularioRegistro") as HTMLFormElement;

  const btnIniciarSesion = document.getElementById("btnRegistrar");
  if (!btnIniciarSesion) return; // Si el botón no existe, no hacemos nada

  btnIniciarSesion.addEventListener("click", () => {
    window.location.href = "iniciarSesion.html";
  });

  formulario.addEventListener("submit", (e: Event) => {
    e.preventDefault();

    const usuario = (document.getElementById("usuario") as HTMLInputElement).value.trim();
    const documento = (document.getElementById("documento") as HTMLInputElement).value.trim();
    const edad = (document.getElementById("edad") as HTMLInputElement).value;
    const email = (document.getElementById("email") as HTMLInputElement).value.trim();
    const password = (document.getElementById("password") as HTMLInputElement).value;
    const validacion = false;

    // Traer lista actual (o crear una vacía)
    const lista: Usuario[] = JSON.parse(localStorage.getItem("usuarios") || "[]");

    // Validar que no exista el usuario
    const documentoExiste = lista.some((u: Usuario) => u.documento === documento);
    const correoExiste = lista.some((u: Usuario) => u.email === email);

    if (correoExiste) {
      alert("Ese correo electrónico ya está en uso");
      return;
    }
    if(usuario === "" || documento === "" || edad === "" || email === "" || password === ""){
      alert("Por favor, complete todos los campos");
      return;
    }
    if(isNaN(Number(edad)) || Number(edad) <= 0){
      alert("Por favor, ingrese una edad válida");
      return;
    }
    if(password.length < 6){
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