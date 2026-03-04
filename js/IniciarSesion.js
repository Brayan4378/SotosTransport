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
    localStorage.setItem("usuarioActual", JSON.stringify(usuarioEncontrado));

    const mensaje = document.getElementById("mensaje");

    setTimeout(()=>{
        mensaje.innerHTML = "";
    },1500);

    if(usuarioEncontrado) {
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
