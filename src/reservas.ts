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

    const formulario = document.getElementById("formReserva") as HTMLFormElement | null;
    const destinoCampo = document.getElementById("destino") as HTMLSelectElement | null;
    const pasajerosCampo = document.getElementById("pasajeros") as HTMLInputElement | null;
    const fechaCampo = document.getElementById("fecha") as HTMLInputElement | null;
    const origenCampo = document.getElementById("origen") as HTMLInputElement | null;
    const horaCampo = document.getElementById("hora") as HTMLInputElement | null;
    const disponibilidadTexto = document.getElementById("disponibilidadBus") as HTMLParagraphElement | null;

    if (!formulario || !destinoCampo || !pasajerosCampo || !fechaCampo || !origenCampo || !horaCampo || !window.ViajesUtils) {
        return;
    }

    const form = formulario;
    const destinoInput = destinoCampo;
    const pasajerosInput = pasajerosCampo;
    const fechaInput = fechaCampo;
    const origenInput = origenCampo;
    const horaInput = horaCampo;
    const utils = window.ViajesUtils;
    const precioPreview = document.createElement("div");
    precioPreview.style.marginTop = "10px";
    precioPreview.style.fontWeight = "bold";
    form.appendChild(precioPreview);
    fechaInput.min = utils.obtenerFechaMinima();

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

    destinoInput.addEventListener("change", actualizarPrecio);
    pasajerosInput.addEventListener("input", actualizarPrecio);
    destinoInput.addEventListener("change", actualizarDisponibilidad);
    horaInput.addEventListener("change", actualizarDisponibilidad);
    fechaInput.addEventListener("change", actualizarDisponibilidad);

    function actualizarPrecio(): void {
        const destino = destinoInput.value as Destino;
        const pasajeros = Number(pasajerosInput.value);

        if (precios[destino] && Number.isInteger(pasajeros) && pasajeros > 0 && pasajeros <= 50) {
            const total = precios[destino] * pasajeros;
            precioPreview.innerText = `Total estimado: COP ${total.toLocaleString()}`;
            return;
        }

        precioPreview.innerText = "";
    }

    function actualizarDisponibilidad(): void {
        if (!disponibilidadTexto) {
            return;
        }

        const destino = destinoInput.value as Destino;
        const hora = horaInput.value;
        const fecha = fechaInput.value;

        if (!destino || !hora || !fecha) {
            disponibilidadTexto.textContent = "Selecciona destino, horario y fecha para consultar los cupos del bus.";
            return;
        }

        const ruta = utils.obtenerRuta(destino, hora);

        if (!ruta) {
            disponibilidadTexto.textContent = "No hay un bus configurado para esa combinacion.";
            return;
        }

        const asientosDisponibles = utils.calcularAsientosDisponibles(destino, hora, fecha);
        disponibilidadTexto.textContent = `Bus ${ruta.bus}: ${asientosDisponibles} asientos disponibles para el ${fecha}.`;
    }

    formulario.addEventListener("submit", (evento: Event) => {
        evento.preventDefault();

        const origen = origenInput.value;
        const destino = destinoInput.value as Destino;
        const hora = horaInput.value;
        const fecha = fechaInput.value;
        const pasajeros = Number(pasajerosInput.value);

        const hoy = new Date();
        const fechaSeleccionada = new Date(fecha);
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() + 365);

        hoy.setHours(0, 0, 0, 0);
        fechaSeleccionada.setHours(0, 0, 0, 0);
        fechaLimite.setHours(0, 0, 0, 0);

        if (!origen || !destino || !hora || !fecha) {
            mostrarMensaje("Debes seleccionar origen, destino, horario y fecha.", "red");
            return;
        }

        if (!Number.isInteger(pasajeros) || pasajeros < 1 || pasajeros > 50) {
            mostrarMensaje("La cantidad de pasajeros debe ser un numero entero entre 1 y 50.", "red");
            return;
        }

        if (fechaSeleccionada < hoy) {
            mostrarMensaje("No puedes seleccionar una fecha pasada.", "red");
            return;
        }

        if (fechaSeleccionada > fechaLimite) {
            mostrarMensaje("Solo puedes reservar con maximo 365 dias de anticipacion.", "red");
            return;
        }

        if (horariosValidos[destino].indexOf(hora) === -1) {
            mostrarMensaje("Ese horario no esta disponible para ese destino.", "red");
            return;
        }

        const asientosDisponibles = utils.calcularAsientosDisponibles(destino, hora, fecha);

        if (pasajeros > asientosDisponibles) {
            mostrarMensaje(`Solo quedan ${asientosDisponibles} asientos para esa fecha y horario.`, "red");
            actualizarDisponibilidad();
            return;
        }

        const reservas = utils.obtenerReservas() as Reserva[];
        reservas.push({
            origen,
            destino,
            hora,
            fecha,
            pasajeros,
            precioTotal: precios[destino] * pasajeros
        });

        utils.guardarReservas(reservas);
        mostrarMensaje("Reserva realizada con exito.", "limegreen");
        form.reset();
        precioPreview.innerText = "";
        actualizarDisponibilidad();
    });

    function mostrarMensaje(texto: string, color = "white"): void {
        let mensaje = document.getElementById("mensajeReserva") as HTMLDivElement | null;

        if (!mensaje) {
            mensaje = document.createElement("div");
            mensaje.id = "mensajeReserva";
            mensaje.style.marginTop = "15px";
            mensaje.style.fontWeight = "bold";
            form.appendChild(mensaje);
        }

        mensaje.innerText = texto;
        mensaje.style.color = color;
        mensaje.className = color === "limegreen" ? "mensaje-positivo" : "mensaje-negativo";
    }

    actualizarDisponibilidad();
});
