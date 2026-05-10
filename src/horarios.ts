document.addEventListener("DOMContentLoaded", () => {
    const fechaFiltro = document.getElementById("fechaHorarios") as HTMLInputElement | null;
    const tablaBody = document.getElementById("tablaHorariosBody") as HTMLTableSectionElement | null;

    if (!fechaFiltro || !tablaBody || !window.ViajesUtils) {
        return;
    }

    const utils = window.ViajesUtils;
    const fechaInput = fechaFiltro;
    const tabla = tablaBody;
    const fechaMinima = utils.obtenerFechaMinima();
    fechaInput.min = fechaMinima;
    fechaInput.value = fechaMinima;

    function renderizarHorarios(): void {
        tabla.innerHTML = "";

        utils.rutas.forEach((ruta: RutaViaje) => {
            const asientosDisponibles = utils.calcularAsientosDisponibles(ruta.destino, ruta.hora, fechaInput.value);
            const fila = document.createElement("tr");

            fila.innerHTML = `
                <td>${ruta.origen}</td>
                <td>${ruta.destinoLabel}</td>
                <td>${ruta.salidaLabel}</td>
                <td>${ruta.llegadaLabel}</td>
                <td>${ruta.bus}</td>
                <td class="${asientosDisponibles === 0 ? "sin-cupos" : "con-cupos"}">
                    ${asientosDisponibles === 0 ? "Completo" : `${asientosDisponibles} disponibles`}
                </td>
            `;

            tabla.appendChild(fila);
        });
    }

    fechaInput.addEventListener("change", renderizarHorarios);
    window.addEventListener("storage", renderizarHorarios);
    renderizarHorarios();
});
