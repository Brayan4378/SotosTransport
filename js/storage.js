document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.getElementById("FormularioLogin");

  const btnIniciarSesion = document.getElementById("btnIniciarSesion");
  if(!btnIniciarSesion) return; // Si el botón no existe, no hacemos nada
  btnIniciarSesion.addEventListener("click",function(){
    window.location.href = "iniciarSesion.html";});

  formulario.addEventListener("submit", (e) => {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value.trim();
    const password = document.getElementById("password").value;
    const correo = document.getElementById("correoelectronico").value.trim();
    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const edad = document.getElementById("edad").value;

    // 1) Traer lista actual (o crear una vacía)
    const lista = JSON.parse(localStorage.getItem("usuarios")) || [];

    // 2) Validar que no exista el usuario (opcional pero recomendado)
    const existe = lista.some(u => u.usuario === usuario);
    if (existe) {
      alert("Ese usuario ya existe ❌");
      return;
    }

    // 3) Agregar nuevo usuario
    lista.push({ usuario, password, correo, nombre, apellido, edad });

    // 4) Guardar lista actualizada
    localStorage.setItem("usuarios", JSON.stringify(lista));

    alert("Usuario registrado ✅");
    formulario.reset(); // limpia el formulario
  });
});