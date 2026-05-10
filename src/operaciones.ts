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

    const destinoInput = document.getElementById("operacionDestino") as HTMLSelectElement | null;
    const horaInput = document.getElementById("operacionHora") as HTMLSelectElement | null;
    const fechaInput = document.getElementById("operacionFecha") as HTMLInputElement | null;
    const pasajerosInput = document.getElementById("operacionPasajeros") as HTMLInputElement | null;
    const contadorValor = document.getElementById("contadorValor") as HTMLParagraphElement | null;
    const resultadoPrecio = document.getElementById("resultadoPrecio") as HTMLParagraphElement | null;
    const resultadoCupos = document.getElementById("resultadoCupos") as HTMLParagraphElement | null;
    const resultadoOcupacion = document.getElementById("resultadoOcupacion") as HTMLParagraphElement | null;
    const resultadoPasajerosDia = document.getElementById("resultadoPasajerosDia") as HTMLParagraphElement | null;
    const ingresosDia = document.getElementById("ingresosDia") as HTMLSpanElement | null;
    const reservasDia = document.getElementById("reservasDia") as HTMLSpanElement | null;
    const rutaActiva = document.getElementById("rutaActiva") as HTMLSpanElement | null;
    const busActivo = document.getElementById("busActivo") as HTMLSpanElement | null;
    const estadoOperacion = document.getElementById("estadoOperacion") as HTMLSpanElement | null;
    const botonesOperacion = document.querySelectorAll<HTMLButtonElement>("[data-contexto]");
    const contadorBotones = document.querySelectorAll<HTMLButtonElement>("[data-contador]");

    if (
        !destinoInput || !horaInput || !fechaInput || !pasajerosInput || !contadorValor ||
        !resultadoPrecio || !resultadoCupos || !resultadoOcupacion || !resultadoPasajerosDia ||
        !ingresosDia || !reservasDia || !rutaActiva || !busActivo || !estadoOperacion || !window.ViajesUtils
    ) {
        return;
    }

    const utils = window.ViajesUtils;
    const destinoCampo = destinoInput;
    const horaCampo = horaInput;
    const fechaCampo = fechaInput;
    const pasajerosCampo = pasajerosInput;
    const contadorTexto = contadorValor;
    const salidaPrecio = resultadoPrecio;
    const salidaCupos = resultadoCupos;
    const salidaOcupacion = resultadoOcupacion;
    const salidaPasajerosDia = resultadoPasajerosDia;
    const ingresosTexto = ingresosDia;
    const reservasTexto = reservasDia;
    const rutaTexto = rutaActiva;
    const busTexto = busActivo;
    const estadoTexto = estadoOperacion;
    const precios: Record<Destino, number> = {
        bogota: 78700,
        medellin: 82400,
        cali: 84200
    };

    let contador = 1;
    fechaCampo.min = utils.obtenerFechaMinima();
    fechaCampo.value = utils.obtenerFechaMinima();
    pasajerosCampo.value = "1";

    function esContextoValido(): boolean {
        const pasajeros = Number(pasajerosCampo.value);
        const fecha = fechaCampo.value;
        const ruta = utils.obtenerRuta(destinoCampo.value as Destino, horaCampo.value);

        if (!fecha) {
            estadoTexto.textContent = "Debes seleccionar una fecha.";
            return false;
        }

        if (!Number.isInteger(pasajeros) || pasajeros < 1 || pasajeros > 50) {
            estadoTexto.textContent = "Los pasajeros deben estar entre 1 y 50.";
            return false;
        }

        if (!ruta) {
            estadoTexto.textContent = "El horario no coincide con el destino seleccionado.";
            return false;
        }

        estadoTexto.textContent = "Datos listos para operar";
        return true;
    }

    function obtenerContexto(): { destino: Destino; hora: string; fecha: string; pasajeros: number } | null {
        if (!esContextoValido()) {
            return null;
        }

        return {
            destino: destinoCampo.value as Destino,
            hora: horaCampo.value,
            fecha: fechaCampo.value,
            pasajeros: Math.max(Number(pasajerosCampo.value) || 1, 1)
        };
    }

    function obtenerReservasDelDia(fecha: string): Reserva[] {
        return (utils.obtenerReservas() as Reserva[]).filter((reserva) => reserva.fecha === fecha);
    }

    function actualizarResumen(): void {
        const contexto = obtenerContexto();
        const reservas = contexto ? obtenerReservasDelDia(contexto.fecha) : [];
        const totalIngresos = reservas.reduce((total, reserva) => total + reserva.precioTotal, 0);

        ingresosTexto.textContent = `COP ${totalIngresos.toLocaleString()}`;
        reservasTexto.textContent = `${reservas.length} reservas`;

        if (!contexto) {
            rutaTexto.textContent = "Sin ruta valida";
            busTexto.textContent = "Sin bus";
            return;
        }

        const ruta = utils.obtenerRuta(contexto.destino, contexto.hora);

        if (!ruta) {
            rutaTexto.textContent = "Sin ruta valida";
            busTexto.textContent = "Sin bus";
            return;
        }

        rutaTexto.textContent = `${ruta.origen} - ${ruta.destinoLabel} ${ruta.salidaLabel}`;
        busTexto.textContent = `${ruta.bus} (${ruta.capacidad} cupos)`;
    }

    function mostrarPrecio(): void {
        const contexto = obtenerContexto();

        if (!contexto) {
            salidaPrecio.textContent = "Corrige los datos antes de calcular el precio.";
            return;
        }

        const total = precios[contexto.destino] * contexto.pasajeros;
        salidaPrecio.textContent = `Total para ${contexto.pasajeros} pasajero(s): COP ${total.toLocaleString()}`;
    }

    function mostrarCupos(): void {
        const contexto = obtenerContexto();

        if (!contexto) {
            salidaCupos.textContent = "Corrige los datos antes de consultar los cupos.";
            return;
        }

        const ruta = utils.obtenerRuta(contexto.destino, contexto.hora);

        if (!ruta) {
            salidaCupos.textContent = "No hay un bus configurado para ese destino y horario.";
            return;
        }

        const disponibles = utils.calcularAsientosDisponibles(contexto.destino, contexto.hora, contexto.fecha);
        salidaCupos.textContent = `Bus ${ruta.bus}: ${disponibles} asientos disponibles para ${contexto.fecha}.`;
    }

    function mostrarOcupacion(): void {
        const contexto = obtenerContexto();

        if (!contexto) {
            salidaOcupacion.textContent = "Corrige los datos antes de calcular la ocupacion.";
            return;
        }

        const ruta = utils.obtenerRuta(contexto.destino, contexto.hora);

        if (!ruta) {
            salidaOcupacion.textContent = "No se puede calcular la ocupacion sin una ruta valida.";
            return;
        }

        const disponibles = utils.calcularAsientosDisponibles(contexto.destino, contexto.hora, contexto.fecha);
        const ocupados = ruta.capacidad - disponibles;
        const porcentaje = (ocupados / ruta.capacidad) * 100;
        salidaOcupacion.textContent = `Ocupacion actual: ${ocupados}/${ruta.capacidad} (${porcentaje.toFixed(1)}%).`;
    }

    function mostrarPasajerosDia(): void {
        const contexto = obtenerContexto();

        if (!contexto) {
            salidaPasajerosDia.textContent = "Corrige los datos antes de consultar pasajeros del dia.";
            return;
        }

        const reservas = obtenerReservasDelDia(contexto.fecha);
        const totalPasajeros = reservas.reduce((total, reserva) => total + reserva.pasajeros, 0);
        salidaPasajerosDia.textContent = `Pasajeros reservados el ${contexto.fecha}: ${totalPasajeros}.`;
    }

    function sincronizarContador(): void {
        contador = Math.max(Number(pasajerosCampo.value) || 1, 1);
        contadorTexto.textContent = String(contador);
        actualizarResumen();
    }

    botonesOperacion.forEach((boton) => {
        boton.addEventListener("click", () => {
            switch (boton.dataset.contexto) {
                case "precio":
                    mostrarPrecio();
                    break;
                case "cupos":
                    mostrarCupos();
                    break;
                case "ocupacion":
                    mostrarOcupacion();
                    break;
                case "pasajerosDia":
                    mostrarPasajerosDia();
                    break;
            }

            actualizarResumen();
        });
    });

    contadorBotones.forEach((boton) => {
        boton.addEventListener("click", () => {
            switch (boton.dataset.contador) {
                case "sumar":
                    contador = Math.min(contador + 1, 50);
                    break;
                case "restar":
                    contador = Math.max(contador - 1, 1);
                    break;
                case "reiniciar":
                    contador = 1;
                    break;
            }

            pasajerosCampo.value = String(contador);
            contadorTexto.textContent = String(contador);
            actualizarResumen();
        });
    });

    pasajerosCampo.addEventListener("input", sincronizarContador);
    destinoCampo.addEventListener("change", actualizarResumen);
    horaCampo.addEventListener("change", actualizarResumen);
    fechaCampo.addEventListener("change", actualizarResumen);
    window.addEventListener("storage", actualizarResumen);

    actualizarResumen();
    mostrarPrecio();
    mostrarCupos();
    mostrarOcupacion();
    mostrarPasajerosDia();
});
