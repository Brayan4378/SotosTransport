const STORAGE_KEY = "reservas";

const rutas: RutaViaje[] = [
    { origen: "Armenia", destino: "bogota", destinoLabel: "Bogota", hora: "06:00", salidaLabel: "06:00 AM", llegadaLabel: "12:30 PM", bus: "Bus 101", capacidad: 32 },
    { origen: "Armenia", destino: "bogota", destinoLabel: "Bogota", hora: "14:00", salidaLabel: "02:00 PM", llegadaLabel: "08:30 PM", bus: "Bus 205", capacidad: 28 },
    { origen: "Armenia", destino: "medellin", destinoLabel: "Medellin", hora: "07:30", salidaLabel: "07:30 AM", llegadaLabel: "01:00 PM", bus: "Bus 120", capacidad: 40 },
    { origen: "Armenia", destino: "medellin", destinoLabel: "Medellin", hora: "16:00", salidaLabel: "04:00 PM", llegadaLabel: "09:30 PM", bus: "Bus 145", capacidad: 35 },
    { origen: "Armenia", destino: "cali", destinoLabel: "Cali", hora: "08:00", salidaLabel: "08:00 AM", llegadaLabel: "11:30 AM", bus: "Bus 300", capacidad: 30 },
    { origen: "Armenia", destino: "cali", destinoLabel: "Cali", hora: "17:00", salidaLabel: "05:00 PM", llegadaLabel: "08:30 PM", bus: "Bus 310", capacidad: 25 }
];

function obtenerReservas(): ReservaViaje[] {
    const reservasGuardadas = localStorage.getItem(STORAGE_KEY);

    if (!reservasGuardadas) {
        return [];
    }

    try {
        return JSON.parse(reservasGuardadas) as ReservaViaje[];
    } catch {
        return [];
    }
}

function guardarReservas(reservas: ReservaViaje[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservas));
}

function obtenerRuta(destino: Destino, hora: string): RutaViaje | undefined {
    return rutas.find((ruta) => ruta.destino === destino && ruta.hora === hora);
}

function calcularAsientosDisponibles(destino: Destino, hora: string, fecha: string): number {
    const ruta = obtenerRuta(destino, hora);

    if (!ruta) {
        return 0;
    }

    const pasajerosReservados = obtenerReservas()
        .filter((reserva) => reserva.destino === destino && reserva.hora === hora && reserva.fecha === fecha)
        .reduce((total, reserva) => total + reserva.pasajeros, 0);

    return Math.max(ruta.capacidad - pasajerosReservados, 0);
}

function obtenerFechaMinima(): string {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = completarConCero(hoy.getMonth() + 1);
    const day = completarConCero(hoy.getDate());
    return `${year}-${month}-${day}`;
}

function completarConCero(valor: number): string {
    return valor < 10 ? `0${valor}` : String(valor);
}

window.ViajesUtils = {
    STORAGE_KEY,
    rutas,
    obtenerReservas,
    guardarReservas,
    obtenerRuta,
    calcularAsientosDisponibles,
    obtenerFechaMinima
};
