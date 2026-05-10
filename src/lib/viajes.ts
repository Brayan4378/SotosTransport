export type Destino = 'bogota' | 'medellin' | 'cali'

export type ReservaViaje = {
  origen: string
  destino: Destino
  hora: string
  fecha: string
  pasajeros: number
  precioTotal: number
}

export type RutaViaje = {
  origen: string
  destino: Destino
  destinoLabel: string
  hora: string
  salidaLabel: string
  llegadaLabel: string
  bus: string
  capacidad: number
}

export const STORAGE_KEY = 'reservas'

export const rutas: RutaViaje[] = [
  {
    origen: 'Armenia',
    destino: 'bogota',
    destinoLabel: 'Bogota',
    hora: '06:00',
    salidaLabel: '06:00 AM',
    llegadaLabel: '12:30 PM',
    bus: 'Bus 101',
    capacidad: 32,
  },
  {
    origen: 'Armenia',
    destino: 'bogota',
    destinoLabel: 'Bogota',
    hora: '14:00',
    salidaLabel: '02:00 PM',
    llegadaLabel: '08:30 PM',
    bus: 'Bus 205',
    capacidad: 28,
  },
  {
    origen: 'Armenia',
    destino: 'medellin',
    destinoLabel: 'Medellin',
    hora: '07:30',
    salidaLabel: '07:30 AM',
    llegadaLabel: '01:00 PM',
    bus: 'Bus 120',
    capacidad: 40,
  },
  {
    origen: 'Armenia',
    destino: 'medellin',
    destinoLabel: 'Medellin',
    hora: '16:00',
    salidaLabel: '04:00 PM',
    llegadaLabel: '09:30 PM',
    bus: 'Bus 145',
    capacidad: 35,
  },
  {
    origen: 'Armenia',
    destino: 'cali',
    destinoLabel: 'Cali',
    hora: '08:00',
    salidaLabel: '08:00 AM',
    llegadaLabel: '11:30 AM',
    bus: 'Bus 300',
    capacidad: 30,
  },
  {
    origen: 'Armenia',
    destino: 'cali',
    destinoLabel: 'Cali',
    hora: '17:00',
    salidaLabel: '05:00 PM',
    llegadaLabel: '08:30 PM',
    bus: 'Bus 310',
    capacidad: 25,
  },
]

export const preciosPorDestino: Record<Destino, number> = {
  bogota: 78700,
  medellin: 82400,
  cali: 84200,
}

export const destinosInfo = [
  {
    id: 'cali',
    titulo: 'Cali',
    imagen:
      'https://www.cali.gov.co/info/caligovco_se/media/pubInt/thumbs/thpubInt_700X400_186322.webp',
    descripcion:
      'Disfruta de la belleza de Cali, la capital de la salsa y la alegria. Conoce sus parques, su cultura vibrante y su gente calida.',
  },
  {
    id: 'bogota',
    titulo: 'Bogota',
    imagen: 'https://colombia.co/sites/default/files/articles/banner-bogota-colombia.webp',
    descripcion:
      'Descubre Bogota, una capital con historia, cultura y una oferta urbana ideal para viajes ejecutivos y escapadas de fin de semana.',
  },
  {
    id: 'medellin',
    titulo: 'Medellin',
    imagen:
      'https://cdnwordpresstest-f0ekdgevcngegudb.z01.azurefd.net/es/wp-content/uploads/2021/11/vista-de-la-comuna-13-en-medellin.jpg',
    descripcion:
      'Conecta con Medellin, una ciudad dinamica y amable, con rutas frecuentes, paisajes montanosos y una agenda cultural constante.',
  },
] as const

export const ofertasEspeciales = [
  {
    destino: 'Bogota',
    imagen:
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1b/4f/61/0b/caption.jpg?w=500&h=400&s=1',
    precio: 'COP 78.700',
  },
  {
    destino: 'Medellin',
    imagen:
      'https://www.semana.com/resizer/v2/TXYNYBTBSJFWJOKAWZ2FPSAKUM.jpg?smart=true&auth=a09223b46e0d3e9b00e655c7e827e7f335ff4ada894e213e6111763eb7e45998&width=1280&height=720',
    precio: 'COP 82.400',
  },
  {
    destino: 'Cali',
    imagen:
      'https://www.elpais.com.co/resizer/v2/MOXPBNBUVBH7DGLY4DNWWGAQHY.jpg?auth=bbd64fd937de75c36f9a591dc91404572b003031d70f6be5eb7609f7cabf2f95&smart=true&quality=75&width=1280&height=720',
    precio: 'COP 84.200',
  },
] as const

export const consejosViaje = [
  {
    titulo: 'Empaca ligero',
    imagen:
      'https://static.eldiario.es/clip/1ae799ae-0449-46bd-842c-8b9edf2b4f13_16-9-discover-aspect-ratio_default_0.jpg',
    descripcion:
      'Viaja con lo esencial para moverte con facilidad y evitar retrasos al abordar.',
  },
  {
    titulo: 'Llega temprano',
    imagen: 'https://cdn-icons-png.flaticon.com/512/17314/17314612.png',
    descripcion:
      'Presentate al menos 30 minutos antes de la salida para validar tu reserva sin afan.',
  },
  {
    titulo: 'Revisa tu boleto',
    imagen:
      'https://elcomercio.pe/resizer/v2/5O74MBLGH5AN5CMHJVGDHSZG4Y.jpg?auth=1abc90a16f55059e9eb420fab21a13e8999f2eddac94f029a995693eb6af6b20&width=2400&height=1620&quality=75&smart=true',
    descripcion:
      'Confirma fecha, horario y numero de pasajeros antes de desplazarte al punto de salida.',
  },
] as const

export function obtenerReservas(): ReservaViaje[] {
  const rawValue = localStorage.getItem(STORAGE_KEY)

  if (!rawValue) {
    return []
  }

  try {
    return JSON.parse(rawValue) as ReservaViaje[]
  } catch {
    return []
  }
}

export function guardarReservas(reservas: ReservaViaje[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reservas))
}

export function obtenerRuta(destino: Destino, hora: string): RutaViaje | undefined {
  return rutas.find((ruta) => ruta.destino === destino && ruta.hora === hora)
}

export function obtenerHorariosPorDestino(destino: Destino): RutaViaje[] {
  return rutas.filter((ruta) => ruta.destino === destino)
}

export function calcularAsientosDisponibles(destino: Destino, hora: string, fecha: string): number {
  const ruta = obtenerRuta(destino, hora)

  if (!ruta) {
    return 0
  }

  const pasajerosReservados = obtenerReservas()
    .filter((reserva) => reserva.destino === destino && reserva.hora === hora && reserva.fecha === fecha)
    .reduce((total, reserva) => total + reserva.pasajeros, 0)

  return Math.max(ruta.capacidad - pasajerosReservados, 0)
}

export function obtenerFechaMinima(): string {
  const hoy = new Date()
  const year = hoy.getFullYear()
  const month = completarConCero(hoy.getMonth() + 1)
  const day = completarConCero(hoy.getDate())
  return `${year}-${month}-${day}`
}

export function formatearPrecio(valor: number): string {
  return `COP ${valor.toLocaleString('es-CO')}`
}

function completarConCero(valor: number): string {
  return valor < 10 ? `0${valor}` : String(valor)
}
