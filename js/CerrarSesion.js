
const btnCerrarSesion = document.getElementById("cerrarSesion");

if(btnCerrarSesion){
    btnCerrarSesion.addEventListener("click", cerrarSesion);
}
   
function cerrarSesion(){
    const lista = JSON.parse(localStorage.getItem("usuarios")) || [];

    const usuarioActivo = lista.find(u => u.validacion === true);

    if(usuarioActivo){
        usuarioActivo.validacion = false;
    }

    localStorage.setItem("usuarios", JSON.stringify(lista));

    window.location.href = "iniciarSesion.html";
}
