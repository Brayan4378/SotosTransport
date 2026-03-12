document.addEventListener("DOMContentLoaded", () => {

    const formulario = document.getElementById("formReserva");
    const destinoSelect = document.getElementById("destino");
    const pasajerosInput = document.getElementById("pasajeros");
    const fechaInput = document.getElementById("fecha");
    const precioPreview = document.createElement("div");
    precioPreview.style.marginTop = "10px";
    precioPreview.style.fontWeight = "bold";
    formulario.appendChild(precioPreview);

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
    destinoSelect.addEventListener("change", actualizarPrecio);
    pasajerosInput.addEventListener("input", actualizarPrecio);
    function actualizarPrecio() {
        const destino = destinoSelect.value;
        const pasajeros = parseInt(pasajerosInput.value);
        if (precios[destino] && pasajeros > 0) {
            const total = precios[destino] * pasajeros;
            precioPreview.innerText =
                "Total estimado: COP " + total.toLocaleString();

        } else {
            precioPreview.innerText = "";
        }
    }

    formulario.addEventListener("submit", function (e) {
        e.preventDefault();
        const origen = document.getElementById("origen").value;
        const destino = destinoSelect.value;
        const hora = document.getElementById("hora").value;
        const fecha = fechaInput.value;
        const pasajeros = parseInt(pasajerosInput.value);
        const hoy = new Date();
        const fechaSeleccionada = new Date(fecha);
        hoy.setHours(0, 0, 0, 0);
        fechaSeleccionada.setHours(0, 0, 0, 0);

        if (!destino || !hora || !fecha || pasajeros <= 0) {
            mostrarMensaje("Completa todos los campos correctamente", "red");
            return;
        }
        if (fechaSeleccionada < hoy) {
            mostrarMensaje("No puedes seleccionar una fecha pasada", "red");
            return;
        }
        if (!horariosValidos[destino].includes(hora)) {
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

        const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
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