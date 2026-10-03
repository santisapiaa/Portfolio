---
name: Santiago Sapia — Portfolio
description: Sitio oscuro de un desarrollador, con acento aguamarina y etiquetas monoespaciadas.
colors:
  aguamarina: "#5eead4"
  aguamarina-profunda: "#2dd4bf"
  aguamarina-velo: "rgba(94, 234, 212, 0.12)"
  miel: "#f5c451"
  tinta-sobre-acento: "#06110e"
  fondo: "#0b0f14"
  fondo-alt: "#0f151c"
  superficie: "#131a22"
  superficie-hover: "#17202b"
  borde: "#232d38"
  texto: "#e6edf3"
  texto-tenue: "#8b98a5"
  texto-apagado: "#5b6773"
  whatsapp: "#25d366"
  whatsapp-hover: "#1ebe5b"
  error: "#f87171"
  error-texto: "#fca5a5"
typography:
  display:
    fontFamily: "'Space Grotesk', sans-serif"
    fontSize: "clamp(2.2rem, 5vw, 3.4rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "'Space Grotesk', sans-serif"
    fontSize: "clamp(1.9rem, 6.5vw, 2.8rem)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.02em"
  title:
    fontFamily: "'Space Grotesk', sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: "'Space Grotesk', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "'JetBrains Mono', monospace"
    fontSize: "0.85rem"
    fontWeight: 400
    letterSpacing: "0.05em"
rounded:
  sm: "8px"
  md: "10px"
  lg: "12px"
  card: "14px"
  xl: "20px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "14px"
  md: "24px"
  lg: "48px"
  section: "90px"
components:
  button-primary:
    backgroundColor: "{colors.aguamarina}"
    textColor: "{colors.tinta-sobre-acento}"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.miel}"
    textColor: "{colors.tinta-sobre-acento}"
  button-ghost:
    textColor: "{colors.texto}"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
  button-ghost-hover:
    textColor: "{colors.aguamarina}"
  button-cv:
    textColor: "{colors.aguamarina}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  chip:
    backgroundColor: "{colors.fondo-alt}"
    textColor: "{colors.texto}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
  card:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.texto}"
    rounded: "{rounded.card}"
    padding: "28px"
  input:
    backgroundColor: "{colors.fondo-alt}"
    textColor: "{colors.texto}"
    rounded: "{rounded.md}"
    padding: "12px 14px"
  slot:
    backgroundColor: "{colors.fondo-alt}"
    textColor: "{colors.texto}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "11px 0"
  slot-selected:
    backgroundColor: "{colors.aguamarina}"
    textColor: "{colors.tinta-sobre-acento}"
---

# Design System: Santiago Sapia — Portfolio

## Overview

**Creative North Star: "La Terminal Encendida"**

Una pantalla de trabajo a oscuras donde lo único que brilla es lo que importa. El fondo es casi negro con un tinte azulado, las superficies apenas se separan de él, y la luz la ponen el cursor que parpadea, las etiquetas en monoespaciada y el acento aguamarina. Todo lo que es dato, estado o marca de sistema (numeración de secciones, fechas, horarios, tags, el logo) habla en mono; todo lo que es lectura habla en Space Grotesk.

Los componentes son táctiles y seguros: las tarjetas se levantan unos píxeles al pasar el cursor, los botones principales son píldoras llenas que cambian de aguamarina a miel, y cada estado seleccionado se pinta entero. La densidad es media: bloques amplios separados por una línea fina, con mucho aire vertical entre secciones.

El sistema rechaza tres cosas: la plantilla de agencia con ilustraciones de stock y bloques intercambiables, cualquier variante de tema claro, y la estética neón o cyberpunk de brillos saturados y varios colores compitiendo.

**Key Characteristics:**
- Tema oscuro único, con fondo azul-negro y superficies por capas tonales.
- Un acento frío (Aguamarina) y un acento cálido escaso (Miel).
- Monoespaciada para todo lo que es etiqueta, dato o estado.
- Píldoras para acciones y chips; esquinas suaves para tarjetas.
- Movimiento corto que responde a la interacción; con `prefers-reduced-motion` queda solo el cambio suave de color y opacidad.

## Colors

Una paleta nocturna de neutros azulados con dos luces: una fría que marca lo interactivo y una cálida que aparece poco.

### Primary
- **Aguamarina** (`aguamarina`): el color de todo lo que se puede tocar o que está activo. Botón principal, links, etiquetas de sección, cursor, puntos de la línea de tiempo, foco de teclado y estados seleccionados.
- **Aguamarina Profunda** (`aguamarina-profunda`): el borde de un elemento en hover o destacado, y los subtítulos de la línea de tiempo.
- **Velo Aguamarina** (`aguamarina-velo`): fondo translúcido para cajas de ícono, el link activo de la navegación y el día elegido en la agenda.
- **Tinta sobre Acento** (`tinta-sobre-acento`): el texto que va encima de un relleno aguamarina o miel.

### Secondary
- **Miel** (`miel`): la luz cálida. Es el hover del botón principal, el tag de cada proyecto, las insignias de "destacado" y de precios de lanzamiento, y el final del degradado del nombre en el hero.

### Tertiary
- **Verde WhatsApp** (`whatsapp`, hover `whatsapp-hover`): exclusivo del botón flotante de WhatsApp y del indicador "en vivo" de la agenda en `/servicios`. No se usa en el portfolio.

### Neutral
- **Fondo** (`fondo`): el lienzo de toda la página y el `theme-color` del navegador.
- **Fondo Alterno** (`fondo-alt`): interior de chips, campos, horarios y bloques anidados dentro de una tarjeta.
- **Superficie** (`superficie`) y **Superficie Hover** (`superficie-hover`): tarjetas, menús y diálogos.
- **Borde** (`borde`): la línea de 1px que delimita todo, incluida la división entre secciones.
- **Texto** (`texto`), **Texto Tenue** (`texto-tenue`), **Texto Apagado** (`texto-apagado`): títulos y contenido principal, párrafos y descripciones, y metadatos o notas.
- **Error** (`error`, texto `error-texto`): borde de campo inválido y mensaje de error de la agenda.

### Named Rules
**Regla de la Luz Fría.** Aguamarina significa "esto responde". No se usa para decorar texto que no es interactivo ni indica estado, salvo las etiquetas de sección y los números destacados.

**Regla de la Miel Escasa.** Miel aparece en hover, en tags y en insignias, nunca como relleno de una superficie grande ni como color de un párrafo.

**Regla del Único Degradado.** El degradado de texto aguamarina a miel existe solo en el nombre del hero. No se repite en otros títulos.

## Typography

**Display Font:** Space Grotesk (con sans-serif de respaldo)
**Body Font:** Space Grotesk (con sans-serif de respaldo)
**Label/Mono Font:** JetBrains Mono (con monospace de respaldo)

**Character:** Una sola grotesca geométrica hace todo el trabajo de lectura, en pesos 400 a 700. La monoespaciada es la voz del sistema: aparece chica, a veces en mayúsculas con tracking, y convierte cualquier dato en algo que parece salido de una terminal.

### Hierarchy
- **Display** (700, `clamp(2.2rem, 5vw, 3.4rem)`, 1.15, tracking -0.02em): el título del hero. En `/servicios` sube el mínimo fluido a 7.5vw.
- **Headline** (700, `clamp(1.9rem, 6.5vw, 2.8rem)`, 1.12, tracking -0.02em): títulos de sección de `/servicios`, con un máximo de 22ch. El cierre del portfolio usa una versión más chica (`clamp(1.6rem, 4vw, 2.3rem)`).
- **Title** (700, 1.12rem a 1.5rem, 1.25): nombre de proyecto, de plan, de paso o de tarjeta.
- **Body** (400, 1rem, 1.6): párrafos en Texto Tenue, con largo máximo entre 46ch y 65ch. Los campos de formulario usan 1rem exacto para evitar el zoom en iPhone.
- **Label** (JetBrains Mono, 400 a 600, 0.72rem a 0.85rem, tracking 0.04em a 0.1em, mayúsculas en los metadatos): numeración de sección ("01 — Sobre mí"), fechas, tags, chips, horarios, logo y pie.

### Named Rules
**Regla de la Voz del Sistema.** Si es un dato, un estado o una etiqueta, va en JetBrains Mono. Si es una oración para leer, va en Space Grotesk. No se mezclan dentro de la misma línea salvo en precios.

## Layout

Una sola columna centrada con ancho máximo de 1080px y 24px de margen lateral (20px en `/servicios` en celular). Las páginas legales se angostan a 760px.

Las secciones se apilan separadas por una línea de 1px en Borde, con 90px de aire vertical en el portfolio y 96px a 128px en `/servicios`. Cada sección abre con una etiqueta mono numerada.

Las grillas son asimétricas cuando hay texto junto a una imagen (1.3fr / 0.9fr en el hero, 1.4fr / 1fr en "sobre mí", 1.1fr / 1fr en proyectos, alternando el lado de la imagen) y parejas cuando hay tarjetas iguales (2, 3 o 4 columnas). El espacio entre tarjetas va de 14px a 22px; entre columnas, de 36px a 48px.

El portfolio colapsa a una columna por debajo de 860px y el contacto pasa a una columna en 480px. `/servicios` está escrito mobile first: una columna de base, dos columnas desde 640px y la grilla completa desde 900px. El hero ocupa casi toda la pantalla (92vh en el portfolio, 100vh en `/servicios` en escritorio).

En celular, las áreas táctiles de íconos miden 44px.

## Elevation & Depth

Un sistema plano que separa capas por tono y borde. Fondo, Fondo Alterno y Superficie son tres escalones de luminosidad, y la línea de 1px en Borde hace el resto. Las tarjetas no tienen sombra en reposo.

La profundidad aparece en tres casos: lo que flota por encima de la página (menús, diálogo, navegación al bajar) lleva sombra negra amplia; lo que es protagonista (foto, agenda del hero, plan destacado) lleva un resplandor aguamarina debajo; y el fondo tiene dos halos radiales muy tenues, uno aguamarina y uno miel. La navegación usa desenfoque de fondo.

### Shadow Vocabulary
- **Flotante** (`box-shadow: 0 16px 40px -12px rgba(0,0,0,0.6)`): menú de idiomas y navegación en píldora al bajar.
- **Diálogo** (`box-shadow: 0 30px 80px rgba(0,0,0,0.6)`): confirmación de la agenda, sobre un fondo oscurecido y desenfocado.
- **Resplandor de protagonista** (`box-shadow: 0 30px 60px -30px rgba(94,234,212,0.25)`): foto del hero, agenda en vivo y plan destacado (este último con 0.45 de opacidad).
- **Resplandor de hover** (`box-shadow: 0 14px 30px -18px rgba(94,234,212,0.45)`): tarjetas de contacto de `/servicios` al pasar el cursor.

### Named Rules
**Regla del Plano en Reposo.** Una tarjeta quieta no tiene sombra. La sombra es respuesta a la interacción o señal de que algo flota.

**Regla del Resplandor Único.** Como mucho un elemento con resplandor aguamarina por pantalla. Si todo brilla, nada es protagonista.

## Shapes

Dos familias de forma conviven. Lo que se aprieta o etiqueta es una píldora (999px): botones, chips, selector de idioma, insignias, estados. Lo que contiene es un rectángulo de esquinas suaves: 14px para tarjetas, 10px a 12px para bloques anidados, campos y medios, 8px para los horarios de la agenda, y 20px para los dos elementos protagonistas (foto y agenda del hero).

Todo contenedor lleva borde de 1px. Los círculos se reservan para puntos de estado, números de paso, el avatar y el botón flotante de WhatsApp. Las capturas de proyectos van en 16:10 recortadas desde arriba; la foto, en 4:5.

Las notas y citas usan un borde izquierdo en Miel con las esquinas derechas redondeadas, y aparecen solo dentro de los casos de `/servicios`.

## Components

Táctiles y seguros: se levantan al pasar el cursor y los estados elegidos se pintan enteros.

### Buttons
- **Shape:** píldora (999px), peso 600, 0.95rem.
- **Primary:** relleno Aguamarina con Tinta sobre Acento, 12px 24px. En `/servicios` la variante de WhatsApp lleva ícono, peso 700 y hasta 17px 30px.
- **Hover / Focus:** el relleno pasa a Miel y el botón sube 2px, en 0.2s. El foco de teclado es un contorno de 2px en Aguamarina separado 3px.
- **Ghost:** borde de 1px en Borde y texto claro; en hover, borde y texto pasan a Aguamarina.
- **CV:** píldora chica con borde Aguamarina Profunda y texto mono; en hover se llena de Velo Aguamarina.

### Chips
- **Style:** píldora con fondo Fondo Alterno, borde de 1px y texto mono de 0.8rem. Sin estados: son etiquetas de tecnología, no filtros.
- **Insignias:** misma forma, en Miel con borde translúcido ("destacado") o rellenas de Aguamarina ("más elegido").

### Cards / Containers
- **Corner Style:** 14px.
- **Background:** Superficie. Los bloques anidados usan Fondo Alterno.
- **Shadow Strategy:** ninguna en reposo; ver Elevation & Depth.
- **Border:** 1px en Borde; pasa a Aguamarina Profunda en hover.
- **Internal Padding:** 22px a 28px (20px en celular).
- **Hover:** sube entre 3px y 4px en 0.2s a 0.25s. Las tarjetas de proyecto además amplían la captura al 103%.
- **Destacada:** borde Aguamarina y un degradado vertical muy tenue de aguamarina hacia Superficie.

### Inputs / Fields
- **Style:** fondo Fondo Alterno, borde de 1px, 10px de radio, 12px 14px de relleno, texto de 1rem.
- **Focus:** el borde pasa a Aguamarina, sin contorno ni resplandor.
- **Error / Disabled:** borde Error en el campo inválido y mensaje en Error Texto; el botón de envío deshabilitado baja a 60% de opacidad.

### Navigation
- **Portfolio:** barra fija arriba con fondo semitransparente, desenfoque de 12px y línea inferior. Logo en mono con un punto Aguamarina; links de 0.92rem en Texto Tenue que pasan a Aguamarina. Por debajo de 860px se abre un panel desplegable con botón de tres rayas.
- **/servicios:** barra transparente que al bajar se contrae en una píldora flotante de hasta 880px, con desenfoque y sombra. El link de la sección actual se marca con Velo Aguamarina. En celular abre un menú a pantalla completa con links grandes numerados en mono que entran escalonados.
- **Selector de idioma:** píldora con bandera y sigla en mono; despliega un menú flotante de 12px de radio.

### Desplegables
`details` nativos con un "+" en mono Aguamarina que pasa a "−" al abrir. Se usan para el detalle de cada proyecto y para las preguntas frecuentes, donde el borde pasa a Aguamarina Profunda al abrirse.

### Línea de tiempo
Una línea vertical de 1px con puntos Aguamarina de 9px rodeados por un anillo de Velo Aguamarina. Fecha en mono apagado, título, subtítulo en Aguamarina Profunda y párrafo tenue.

### Burbujas de mensaje
Preguntas de clientes en forma de chat, decorativas (`aria-hidden`), solo en el hero de `/servicios`. Fondo Superficie, borde de 1px, 16px de radio con la esquina inferior izquierda en 5px, texto de 0.82rem a 0.92rem y la hora en mono apagado. Cada una tiene una inclinación propia de 3° a 5°.

### Casos
Una tarjeta por caso, con una pestaña de carpeta en mono ("Caso 01") corrida a la derecha de la anterior para que se vean todas al apilarse. Las pestañas alternan Velo Aguamarina, un velo de Miel y Superficie Hover. Adentro: la captura de escritorio en un marco de navegador con la de celular superpuesta en la esquina, una insignia ("Caso real" o "Proyecto en equipo"), el rubro en Miel, el texto y tres chips con las funciones. Para sumar un caso se copia un bloque `article.case-card` en `servicios/index.html`.

### Agenda (signature)
La pieza distintiva de `/servicios`. Los días son tarjetas angostas en una fila que se desliza, con el día de la semana en mono y el número grande. Los horarios son una grilla de botones mono de 8px de radio. El día elegido toma borde Aguamarina y fondo de velo; el horario elegido se rellena entero de Aguamarina. Mientras carga muestra bloques que laten, y al confirmar abre un diálogo centrado con un ícono circular.

### Motion
Dos curvas, definidas como variables en `style.css`: `--ease-out` (`cubic-bezier(0.23, 1, 0.32, 1)`) para todo lo que entra, se levanta o se aprieta, y `--ease-in-out` (`cubic-bezier(0.77, 0, 0.175, 1)`) para lo que cambia de forma en pantalla, como la navegación de `/servicios`. Los cambios de color, borde y sombra usan `ease` en 0.2s.

- **Presión:** todo lo que se aprieta se achica al tocarlo. Botones a `scale(0.97)` en 160ms; días, horarios y el botón de copiar a `scale(0.96)` en 140ms; el botón flotante de WhatsApp a `scale(0.95)`. El botón principal además baja de su elevación.
- **Hover:** las tarjetas suben entre 3px y 4px y los botones 2px, en 200ms y 160ms. La elevación solo existe con mouse (`hover: hover` y `pointer: fine`); en pantallas táctiles queda el cambio de color y borde.
- **Menús y diálogo:** el menú de idiomas crece desde su botón (`scale(0.97)`, 150ms) y el menú móvil del portfolio baja 8px en 200ms. El diálogo de la agenda entra desde `scale(0.94)` en 220ms y sale más rápido, en 150ms. Las preguntas frecuentes despliegan su altura en 250ms donde el navegador lo soporta.
- **Entradas:** las secciones suben 16px en 500ms al hacer scroll. El menú móvil de `/servicios` entra escalonado cada 40ms, en 300ms.
- **Hero de `/servicios`:** todo queda a la vista en menos de 1s. El título entra palabra por palabra (sube 12px, 450ms, una cada 40ms), el resto del texto escalonado en 500ms y la agenda sube en 750ms. Las luces de fondo son tres gradientes quietos, sin desenfoque ni animación.
- **Mensajes del hero:** burbujas de chat que entran con un pop (`scale(0.7)` a 1, 500ms, una cada 70ms) y flotan en loop con `@keyframes` (5 a 8px y 3 a 5° sobre su inclinación base), cada una con su duración (6 a 9s) y un delay negativo para que nunca se muevan a la par. Con mouse se arrastran: la flotación se pausa, crecen a `scale(1.05)` y al soltarlas vuelven a flotar donde quedaron. En celular son tres, flotan igual y no se arrastran: una arriba junto al menú, una sobre la esquina de la agenda y una al pie del hero. La capa va por debajo del texto y de la agenda, y la flotación se pausa cuando el hero sale de pantalla o la pestaña se oculta.
- **Casos apilados:** cada tarjeta queda fija arriba (`position: sticky`) y la siguiente sube y la tapa. La tapada baja a `scale(0.94)` y un velo en color Fondo sube a 0.6 de opacidad, en proporción al scroll. El estado de cada tarjeta sale solo de dónde están las tarjetas en pantalla en ese cuadro: nunca de la dirección del scroll, de posiciones guardadas ni del alto de la ventana, que en celular cambia cuando el navegador muestra u oculta sus barras. Si una tarjeta es más alta que la pantalla, se fija más arriba, con el borde de abajo a la vista (medido contra `100svh`).
- **Navegación de `/servicios`:** se contrae en píldora en 300ms; el título rotativo cambia en 0.45s.
- **Constantes:** el cursor y los puntos de estado parpadean.

**Regla del Movimiento Liviano.** Lo que se mueve solo cambia `transform` y `opacity`. Nada que flote, se arrastre o se apile lleva `filter`, `backdrop-filter` ni sombras grandes: si hace falta una sombra, va en una capa quieta. `will-change` se pone únicamente en el elemento que se mueve. Lo que depende del scroll se escribe dentro de `requestAnimationFrame`, desde un listener pasivo, directo sobre el elemento (sin variables heredadas que obliguen a recalcular a los hijos) y con las posiciones medidas una sola vez. Los loops se pausan fuera de pantalla.

**Regla del Movimiento Reducido.** Con `prefers-reduced-motion` no se mueve nada: sin animaciones, sin elevación, sin presión y sin entradas. Se conservan las transiciones de color, borde, sombra y opacidad, porque ayudan a entender el cambio de estado.

## Do's and Don'ts

### Do:
- **Do** usar las variables de `style.css` para cualquier color, radio o fuente nueva; `/servicios` y las páginas legales heredan de ahí.
- **Do** poner en JetBrains Mono toda etiqueta, fecha, horario, tag o estado.
- **Do** dar a cada contenedor un borde de 1px en Borde y dejarlo sin sombra en reposo.
- **Do** hacer píldora (999px) todo lo que se aprieta o etiqueta, y usar 14px para tarjetas.
- **Do** pintar entero el estado seleccionado: relleno Aguamarina con Tinta sobre Acento.
- **Do** mantener el foco de teclado visible: contorno de 2px en Aguamarina a 3px.
- **Do** dar a todo lo que se aprieta un estado de presión (`scale(0.97)`, 160ms) y usar `--ease-out` para cualquier movimiento nuevo.
- **Do** poner las elevaciones de hover dentro de `@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)`.
- **Do** animar solo `transform` y `opacity`, y medir con un trace antes de sumar movimiento nuevo a `/servicios`.
- **Do** respetar `prefers-reduced-motion` en cualquier animación nueva (sin movimiento, solo color y opacidad) y mantener 44px de área táctil en íconos.

### Don't:
- **Don't** agregar un tema claro ni superficies blancas.
- **Don't** poner `filter`, `backdrop-filter` ni sombras grandes en elementos que se mueven, ni animar las luces de fondo.
- **Don't** sumar colores de acento: son Aguamarina y Miel, y el verde es solo de WhatsApp.
- **Don't** llevar el sitio hacia neón o cyberpunk: nada de brillos saturados, bordes luminosos en todo ni varios resplandores a la vez.
- **Don't** usar ilustraciones de stock ni bloques genéricos de plantilla de agencia; las imágenes son capturas reales de los proyectos y la foto.
- **Don't** repetir el degradado de texto fuera del nombre en el hero.
- **Don't** usar Miel como relleno de superficies grandes ni como color de párrafo.
- **Don't** usar el Verde WhatsApp en el portfolio ni para otra cosa que WhatsApp y el indicador "en vivo".
