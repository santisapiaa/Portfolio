# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

El sitio tiene dos públicos con el mismo peso; ninguno manda sobre el otro.

- **Reclutadores y equipos de desarrollo** (portfolio, `/`): evalúan a Santiago Sapia para un puesto full stack junior. Llegan desde LinkedIn, el CV o GitHub y necesitan ver rápido qué construyó, con qué stack y cómo contactarlo.
- **Dueños de comercios, profesionales y emprendimientos en Buenos Aires** (`/servicios`): no son técnicos. Reciben turnos y consultas por mensaje, dependen de Instagram o no aparecen en Google, y quieren saber qué les puede armar Santiago, cuánto sale y cómo empezar.

## Product Purpose

Sitio personal de Santiago Sapia (santiagosapia.dev), estudiante de la Tecnicatura en Desarrollo de Software (UADE).

- El portfolio existe para conseguir empleo: muestra proyectos, skills, experiencia y contacto. Éxito es que un reclutador lo contacte o descargue el CV.
- `/servicios` existe para conseguir clientes freelance: ofrece sitios web, turnos online con panel de gestión, y mantenimiento. Éxito es que alguien agende la charla sin cargo o escriba por WhatsApp.

## Positioning

- Como candidato: proyectos reales y funcionando, de punta a punta (frontend, backend, base de datos, mobile), no ejercicios de curso.
- Como freelance: ya construyó sistemas de turnos con horarios libres en tiempo real (Benedetto, Dentar), y la propia página agenda la charla contra su Google Calendar, así que el visitante usa lo mismo que se le ofrece.

## Operating Context

- El portfolio se abre desde links en LinkedIn y el CV; tiene etiquetas Open Graph para las vistas previas. `?lang=en` y `?lang=pt` abren directo en ese idioma, y el botón de CV descarga el PDF del idioma activo.
- `/servicios` recorre problema, servicios, casos, precios, proceso, agenda, preguntas frecuentes y contacto. La agenda crea un evento con link de Meet en el calendario de Santiago.
- Reglas de la agenda: lunes a viernes de 10 a 17 (martes de 14 a 17), turnos de 30 minutos, 24 h de anticipación, hasta 7 días adelante, sin feriados.
- Canales de contacto: email, LinkedIn, WhatsApp y redes (Instagram y TikTok).

## Capabilities and Constraints

- **Stack fijo:** HTML, CSS y JavaScript puro, sin frameworks ni build. Deploy en Vercel; la agenda usa funciones serverless en `api/` sin dependencias.
- **Idiomas:** el portfolio está en español, inglés y portugués; todo texto nuevo se traduce a los tres (`i18n.js`). `/servicios` es solo en español.
- **Páginas:** `/`, `/servicios`, `/privacidad`, `/terminos` y `404`. Las páginas legales existen porque las exige la pantalla de consentimiento de Google.
- **Precios:** `/servicios` muestra el nivel "Precios de lanzamiento" (desde USD 150 / 300 / 450; mantenimiento desde USD 20/mes, primer mes gratis). El dominio es del cliente, que lo paga; el mantenimiento cubre solo cambios menores.
- **Sincronía:** lo que se diga sobre dominio, hosting o mantenimiento tiene que coincidir entre `/servicios` y `/terminos`. El texto de preguntas frecuentes está duplicado en el JSON-LD.
- **CV:** los PDF son de una página y están al límite; lo que se agrega se compensa recortando.
- **Sin decidir:** mercado laboral al que apunta el portfolio (Argentina, remoto al exterior o ambos).

## Brand Commitments

- Nombre: Santiago Sapia. Dominio: santiagosapia.dev.
- Voz: primera persona, español rioplatense con voseo, directa y sin tecnicismos en `/servicios`.
- `/servicios` no se limita a rubros puntuales: habla de "comercios, profesionales y emprendimientos".
- Dentar Devoto y Benedetto Peluquería no se presentan como clientes. Dentar se describe como "un consultorio odontológico".
- HayEquipo figura como "Proyecto en equipo" y "todavía sin implementar en un club".

## Evidence on Hand

- Proyectos con capturas en `assets/projects/`: Dentar Devoto, ParriYa!, HayEquipo, OrientAI y Benedetto Peluquería. Cuatro tienen demo en vivo; Dentar tiene el código privado.
- Casos en `/servicios`: Benedetto, Dentar y HayEquipo.
- CV en tres idiomas (`Santiago_Sapia_CV*.pdf`), foto (`assets/photo-v2.jpg`) e imagen para compartir (`assets/og-image-v3.jpg`).
- **No hay** testimonios, clientes en producción ni métricas de resultados. No se inventan.

## Product Principles

1. Dos públicos, un sitio: cada página le habla a uno solo y no le pide al otro que la entienda.
2. Lo construido es la prueba: los proyectos y la agenda funcionando pesan más que cualquier afirmación.
3. Solo lo que es cierto hoy: sin clientes, testimonios ni resultados que no existan.
4. El sitio es parte del portfolio: hecho a mano, sin frameworks, y tiene que sostenerse como muestra de oficio.
5. El siguiente paso siempre a mano: contacto o CV para el reclutador, agendar o WhatsApp para el comercio.

## Accessibility & Inclusion

El sitio es responsive y respeta `prefers-reduced-motion`; el trabajo futuro mantiene ambas cosas. No hay un estándar formal establecido.
