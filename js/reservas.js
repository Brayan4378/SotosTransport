document.addEventListener("DOMContentLoaded", () => {

    const formulario = document.getElementById("formReserva");
    const destinoSelect = document.getElementById("destino");
    const pasajerosInput = document.getElementById("pasajeros");

    // Crear elemento para mostrar precio dinámico
    const precioPreview = document.createElement("div");
    precioPreview.style.marginTop = "10px";
    precioPreview.style.fontWeight = "bold";
    formulario.appendChild(precioPreview);

    const precios = {
        bogota: 78700,
        medellin: 82400,
        cali: 84200
    };

    // 🔥 Evento cuando cambia destino
    destinoSelect.addEventListener("change", actualizarPrecio);

    // 🔥 Evento cuando cambia número de pasajeros
    pasajerosInput.addEventListener("input", actualizarPrecio);

    function actualizarPrecio() {
        const destino = destinoSelect.value;
        const pasajeros = parseInt(pasajerosInput.value);

        if (precios[destino] && pasajeros > 0) {
            const total = precios[destino] * pasajeros;
            precioPreview.innerText = "Total estimado: COP " + total.toLocaleString();
        } else {
            precioPreview.innerText = "";
        }
    }

    // 🔥 Evento submit
    formulario.addEventListener("submit", function (e) {
        e.preventDefault();

        const tipoViaje = document.querySelector("input[name='tipo_viaje']:checked").value;
        const origen = document.getElementById("origen").value;
        const destino = destinoSelect.value;
        const fecha = document.getElementById("fecha").value;
        const pasajeros = parseInt(pasajerosInput.value);

        if (!destino || !fecha || pasajeros <= 0) {
            mostrarMensaje("Completa todos los campos ❌", "red");
            return;
        }

        let precioTotal = precios[destino] * pasajeros;

        if (tipoViaje === "ida_vuelta") {
            precioTotal *= 2;
        }

        const nuevaReserva = {
            tipoViaje,
            origen,
            destino,
            fecha,
            pasajeros,
            precioTotal
        };

        const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
        reservas.push(nuevaReserva);
        localStorage.setItem("reservas", JSON.stringify(reservas));

        mostrarMensaje("Reserva realizada con éxito ✅", "limegreen");

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