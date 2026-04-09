document.addEventListener("DOMContentLoaded", () => {

    type Destino = "bogota" | "medellin" | "cali";

    interface Reserva {
        origen: string;
        destino: Destino;
        hora: string;
        fecha: string;
        pasajeros: number;
        precioTotal: number;
    }

    const formulario = document.getElementById("formReserva") as HTMLFormElement;
    const destinoSelect = document.getElementById("destino") as HTMLSelectElement;
    const pasajerosInput = document.getElementById("pasajeros") as HTMLInputElement;
    const fechaInput = document.getElementById("fecha") as HTMLInputElement;
    const origenInput = document.getElementById("origen") as HTMLInputElement;
    const horaInput = document.getElementById("hora") as HTMLInputElement;

    if (!formulario || !destinoSelect || !pasajerosInput || !fechaInput || !origenInput || !horaInput) return;

    const precioPreview = document.createElement("div");
    precioPreview.style.marginTop = "10px";
    precioPreview.style.fontWeight = "bold";
    formulario.appendChild(precioPreview);

    const horariosValidos: Record<Destino, string[]> = {
        bogota: ["06:00", "14:00"],
        medellin: ["07:30", "16:00"],
        cali: ["08:00", "17:00"]
    };

    const precios: Record<Destino, number> = {
        bogota: 78700,
        medellin: 82400,
        cali: 84200
    };

    destinoSelect.addEventListener("change", actualizarPrecio);
    pasajerosInput.addEventListener("input", actualizarPrecio);

    function actualizarPrecio(): void {
        const destino = destinoSelect.value as Destino;
        const pasajeros = Number(pasajerosInput.value);

        if (precios[destino] && pasajeros > 0) {
            const total = precios[destino] * pasajeros;
            precioPreview.innerText = "Total estimado: COP " + total.toLocaleString();
        } else {
            precioPreview.innerText = "";
        }
    }

    formulario.addEventListener("submit", (e: Event) => {
        e.preventDefault();

        const origen = origenInput.value;
        const destino = destinoSelect.value as Destino;
        const hora = horaInput.value;
        const fecha = fechaInput.value;
        const pasajeros = Number(pasajerosInput.value);

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

        if (horariosValidos[destino].indexOf(hora) === -1) {
            mostrarMensaje("Ese horario no está disponible para ese destino", "red");
            return;
        }

        const precioTotal = precios[destino] * pasajeros;

        const nuevaReserva: Reserva = {
            origen,
            destino,
            hora,
            fecha,
            pasajeros,
            precioTotal
        };

        const reservas: Reserva[] = JSON.parse(localStorage.getItem("reservas") || "[]");

        reservas.push(nuevaReserva);

        localStorage.setItem("reservas", JSON.stringify(reservas));

        mostrarMensaje("Reserva realizada con éxito", "limegreen");

        formulario.reset();
        precioPreview.innerText = "";
    });

    function mostrarMensaje(texto: string, color: string = "white"): void {
        let mensaje = document.getElementById("mensajeReserva") as HTMLDivElement | null;

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