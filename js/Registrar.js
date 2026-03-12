document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.getElementById("FormularioRegistro");

  const btnIniciarSesion = document.getElementById("btnRegistrar");
  if(!btnIniciarSesion) return; // Si el botón no existe, no hacemos nada
  btnIniciarSesion.addEventListener("click",function(){
    window.location.href = "iniciarSesion.html";});

  formulario.addEventListener("submit", (e) => {
    e.preventDefault();

     const usuario = document.getElementById("usuario").value.trim();
    const documento = document.getElementById("documento").value.trim();
    const edad = document.getElementById("edad").value;
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const  validacion = false;


    // 1) Traer lista actual (o crear una vacía)
    const lista = JSON.parse(localStorage.getItem("usuarios")) || [];

    // 2) Validar que no exista el usuario (opcional pero recomendado)

  const documentoExiste = lista.some(u => u.documento === documento);
  const correoExiste = lista.some(u => u.email === email);

  if (correoExiste) {
    alert("Ese correo electrónico ya está en uso ❌");
    return;
  }

  if (documentoExiste) {
    alert("Ese documento ya está registrado ❌");
    return;
  }

    // 3) Agregar nuevo usuario
    lista.push({ usuario, documento, edad, email, password,validacion });

    // 4) Guardar lista actualizada
    localStorage.setItem("usuarios", JSON.stringify(lista));

    alert("Usuario registrado ✅");
    formulario.reset(); // limpia el formulario
  });
});