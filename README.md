# Parcial Línea 119 · Bomberos Cali — Código base

Proyecto inicial con React + Vite + React Router + Leaflet (mapa real) + React Three Fiber.

## integrantes

juan david solano

juan esteban castro

## Cómo correrlo

```bash
npm install
npm run dev
```

- `http://localhost:5173/operador` → mapa real de Cali con 9 reportes de prueba (zoom, arrastrar, cambiar a modo oscuro con el botón de capas).
- `http://localhost:5173/` → landing con una escena 3D de ejemplo.

El mapa usa **OpenStreetMap** a través de **Leaflet**: no necesita API key ni tarjeta de crédito, solo internet.

## link del sitio

https://parcial-119-base-virid.vercel.app/

## preguntas 
1. ¿Puede llegarle al radio operador un mapa con la ubicación exacta a partir de las coordenadas del ciudadano?

Sí El ciudadano puede marcar el punto exacto en un mini mapa dentro del formulario, y las coordenadas viajan dentro del reporte. al marcar un punto, además, se asigna automáticamente el barrio más cercano. En el tablero del operador, cada reporte aparece como un pin con el color de su grupo, con popup, el mapa vuela hasta él al seleccionarlo, y hay un enlace «Ver en Google Maps» con las coordenadas.

Faltaría para producción: Capturar la ubicación del dispositivo con GPS, mostrar el radio de precisión, geocodificación inversa para obtener la dirección y el barrio reales, y trazar la ruta desde la estación más cercana hasta el sitio.

2. ¿Puede el ciudadano recibir una respuesta automática para saber que su reporte fue recibido?

Sí Al enviar el ciudadano ve una pantalla de confirmación con el número de radicado, la hora de recepción y el estado («Recibido»). Que se actualizan cuando el operador valida, despacha o cierra el caso.

Faltaría para producción: Notificaciones fuera de la pantalla (SMS, WhatsApp o correo) y en tiempo real, sin necesidad de recargar. También un tiempo estimado de llegada y un mensaje claro de que el reporte no reemplaza la llamada al 119 en emergencias críticas.

3. ¿Qué pasa si hay una emergencia de gran magnitud y llegan reportes masivos?

Todos los reportes se guardan y se ven en la lista y en el mapa, ordenados del más reciente al más antiguo. Los casos «Recibido» pulsan para llamar la atención, los cerrados o descartados se apagan, y la leyenda del mapa cuenta los reportes por grupo.

Limitaciones reconocidas: Al no haber backend, los reportes se guardan en el navegador de quien los envía, así que el prototipo no puede recibir reportes masivos de personas distintas; solo se pueden simular desde un mismo navegador. Además, no hay filtros, ni priorización, ni detección de duplicados, y los pines del mismo barrio se apilan.

Faltaría para producción: Backend y base de datos reales, cola de mensajes y escalado automático para absorber picos, límite de reportes por teléfono para evitar abuso, deduplicación (cien reportes del mismo incendio se agrupan en un solo incidente con cien testigos), priorización automática por grupo y gravedad, filtros, agrupación de pines en el mapa y actualización en tiempo real. La línea telefónica 119 sigue siendo el canal principal.

4. ¿Puede el radio operador, si lo decide, hacer una videollamada al ciudadano?

No implementamos videollamada. Lo que sí hay es el teléfono del ciudadano visible en el detalle y un botón «Llamar» (tel:), para que el operador valide el caso por voz antes de despachar.

Faltaría para producción: Una videollamada iniciada solo por el operador, mediante WebRTC (con un servicio como Jitsi, Daily o Twilio). El sistema enviaría al ciudadano un enlace por SMS que se abre en el navegador, sin instalar nada, y que pide su consentimiento para usar la cámara. Debe tener plan de respaldo, no debe grabarse sin avisar y debe respetar la privacidad de las personas que aparezcan.

5. ¿Se pueden enviar varias fotos o videos, con recomendaciones de cómo tomarlos?

Se pueden adjuntar hasta 3 fotos con miniaturas y botón para quitarlas. El operador las ve en el detalle y puede ampliarlas. Las fotos se previsualizan con URL.createObjectURL y no se suben a ningún servidor.

Limitaciones reconocidas: No soportamos video (el campo solo acepta imágenes). Tampoco hay recomendaciones de cómo tomarlas: solo un texto breve que explica por qué ayudan. Y al no tener backend, las fotos no sobreviven a recargar la página.

Faltaría para producción: Aceptar video corto con límite de tamaño y compresión, almacenamiento real en un servidor, y mostrar recomendaciones antes de tomar la foto: tomarla desde un lugar seguro y sin ponerse en riesgo, en horizontal, mostrando el entorno y una referencia (letrero, fachada, número de calle), con buena luz y sin acercarse al fuego ni al humo.


## Qué viene hecho

| Archivo | Qué hace |
| --- | --- |
| `src/App.jsx` | Las tres rutas: `/`, `/reportar`, `/operador` |
| `src/data/grupos.js` | Grupos de emergencia 100–900 con su color y `colorDeGrupo(codigo)` |
| `src/data/barrios.js` | 19 barrios de Cali con coordenadas aproximadas |
| `src/mapa/MapaOperador.jsx` | Mapa real (calles u oscuro), un pin por reporte, popup, vuelo al reporte seleccionado y leyenda con conteo por grupo |
| `src/mapa/iconos.js` | `crearIcono(color, opciones)`: pin de color hecho con HTML/CSS |
| `src/mapa/mapa.css` | Estilos del pin, la leyenda y la animación de pulso (ya escrita) |
| `src/three/EscenaLanding.jsx` | Escena R3F mínima (una sirena que gira) para comprobar que React Three Fiber funciona |
| `src/pages/Operador.jsx` | Ejemplo de uso: mapa + lista; al hacer clic en la lista el mapa vuela al reporte |

## Qué debe hacer el equipo (busquen los `TODO` en el código)

1. **Estado global:** Context con la lista de reportes, guardado en `localStorage` y usado en las tres pantallas.
2. **Conectar el mapa:** en `Operador.jsx`, reemplazar `REPORTES_DEMO` por los reportes reales del ciudadano.
3. **Pines según el estado:** aplicar la clase `pin--pulso` a los reportes Recibido, y crear `pin--apagado` para Cerrado / Descartado.
4. **Popup:** nombre, qué ve y estado.
5. **Escena 3D de la landing:** reemplazar la sirena de ejemplo por su propia escena con React Three Fiber.
6. **Pantallas:** Landing, Reportar y el panel del operador (lista, detalle, llamar/validar y despacho).

Estados del reporte: `Recibido` → `Validado` → `Unidad despachada` → `Cerrado` (o `Descartado`).

Extras opcionales: ver la sección de extras del enunciado (emergencia masiva, mini mapa en `/reportar`, etc.).
