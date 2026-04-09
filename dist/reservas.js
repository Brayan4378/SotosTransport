document.addEventListener("DOMContentLoaded", () => {
    // Elementos del DOM
    const formulario = document.getElementById("formReserva");
    const destinoSelect = document.getElementById("destino");
    const pasajerosInput = document.getElementById("pasajeros");
    const fechaInput = document.getElementById("fecha");
    const origenInput = document.getElementById("origen");
    const horaInput = document.getElementById("hora");
    if (!formulario || !destinoSelect || !pasajerosInput || !fechaInput || !origenInput || !horaInput)
        return;
    // Preview del precio
    const precioPreview = document.createElement("div");
    precioPreview.style.marginTop = "10px";
    precioPreview.style.fontWeight = "bold";
    formulario.appendChild(precioPreview);
    // Objetos tipados correctamente
    const horariosValidos = {
        bogota: ["06:00", "14:00"],
        medellin: ["07:30", "16:00"],
        cali: ["08:00", "17:00"]
    };
    const precios = {
        bogota: 78700,
        medellin: 82400,
        cali: 84200
    };
    // Eventos
    destinoSelect.addEventListener("change", actualizarPrecio);
    pasajerosInput.addEventListener("input", actualizarPrecio);
    function actualizarPrecio() {
        const destino = destinoSelect.value;
        const pasajeros = Number(pasajerosInput.value);
        if (precios[destino] && pasajeros > 0) {
            const total = precios[destino] * pasajeros;
            precioPreview.innerText = "Total estimado: COP " + total.toLocaleString();
        }
        else {
            precioPreview.innerText = "";
        }
    }
    formulario.addEventListener("submit", (e) => {
        e.preventDefault();
        const origen = origenInput.value;
        const destino = destinoSelect.value;
        const hora = horaInput.value;
        const fecha = fechaInput.value;
        const pasajeros = Number(pasajerosInput.value);
        const hoy = new Date();
        const fechaSeleccionada = new Date(fecha);
        hoy.setHours(0, 0, 0, 0);
        fechaSeleccionada.setHours(0, 0, 0, 0);
        // Validaciones
        if (!destino || !hora || !fecha || pasajeros <= 0) {
            mostrarMensaje("Completa todos los campos correctamente", "red");
            return;
        }
        if (fechaSeleccionada < hoy) {
            mostrarMensaje("No puedes seleccionar una fecha pasada", "red");
            return;
        }
        if (horariosValidos[destino].indexOf(hora) === -1) {
            mostrarMensaje("Ese horario no está disponible para ese destino", "red");
            return;
        }
        const precioTotal = precios[destino] * pasajeros;
        const nuevaReserva = {
            origen,
            destino,
            hora,
            fecha,
            pasajeros,
            precioTotal
        };
        const reservas = JSON.parse(localStorage.getItem("reservas") || "[]");
        reservas.push(nuevaReserva);
        localStorage.setItem("reservas", JSON.stringify(reservas));
        mostrarMensaje("Reserva realizada con éxito", "limegreen");
        formulario.reset();
        precioPreview.innerText = "";
    });
    function mostrarMensaje(texto, color = "white") {
        let mensaje = document.getElementById("mensajeReserva");
        if (!mensaje) {
            mensaje = document.createElement("div");
            mensaje.id = "mensajeReserva";
            mensaje.style.marginTop = "15px";
            mensaje.style.fontWeight = "bold";
            formulario.appendChild(mensaje);
        }
        mensaje.innerText = texto;
        mensaje.style.color = color;
    }
});
export {};
