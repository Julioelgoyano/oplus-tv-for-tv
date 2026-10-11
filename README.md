# O-PLUS TV · versión para proyector / Smart TV (HY300)

Es la misma app de O-PLUS TV, pero con interfaz de **Smart TV** y pensada para el **control remoto infrarrojo** del proyector.
El video ocupa siempre toda la pantalla y todo lo demás aparece encima solo cuando lo pides.

## Cómo obtener el APK
1. Crea un repositorio nuevo en GitHub y sube TODO el contenido de esta carpeta.
2. Entra a **Actions → Compilar APK (proyector / Smart TV) → Run workflow** (también corre solo al subir cambios).
3. Cuando termine, descarga el archivo **OPLUS-TV-proyector-apk** (adentro está `app-debug.apk`).

## Cómo instalarlo en el HY300
- Copia el APK a una memoria USB, conéctala al proyector y ábrelo con el administrador de archivos (si Android lo pide, permite «instalar apps desconocidas»), o
- por red con `adb install app-debug.apk` (depuración USB/inalámbrica activada en el proyector).

Se instala con otro nombre interno (`com.oplustv.tv`), así que **no reemplaza** la app del celular.

## Botones del control remoto
| Botón | Qué hace |
|---|---|
| **OK** o **←** | Abre la lista de canales y categorías |
| **↑ / ↓** | Canal anterior / siguiente |
| **→** | Menú rápido: favoritos, calidad, tamaño de imagen, sonido, reiniciar canal, ayuda |
| **INFO** o **≡** (las tres líneas / «hamburguesa») | Muestra / oculta la barra de información del canal |
| **Números** | Ir directo a un canal (por ejemplo `1` `2`) |
| **CH+ / CH−**, **GUÍA**, **PLAY/PAUSA**, botones de color | Si tu control los tiene: canal ±, guía, pausa, rojo = menú, verde = lista, amarillo = favorito, azul = guía |
| **ATRÁS** | Cierra el panel abierto; con la imagen limpia, dos veces seguidas = salir |
| **Volumen** | Lo maneja el propio proyector |

Dentro de la lista: **→** llega al corazón de favorito, **↑** sube a las categorías.
Los paneles se cierran solos a los 25 segundos sin tocar nada.

### ¿Un botón de tu control no hace nada?
Abre el menú → **Probar control remoto** y presiona ese botón: la pantalla muestra el nombre y el código que Android recibe.
Con ese dato se puede asignar a cualquier acción (archivo `native/MainActivity.java`, función `actionFor`).
Las flechas, OK, atrás, menú, volumen y números son teclas estándar de Android y deberían funcionar con cualquier control del proyector.

## Qué trae de especial para proyector
- Pantalla siempre horizontal y encendida mientras la app está abierta.
- Aparece en el inicio de Android TV (ícono + banner) además del menú normal de apps.
- Tamaño de imagen: Ajustar / Llenar / Estirar (menú → Imagen).
- Si el canal se queda cargando más de 20 s, reconecta solo (hasta 3 veces); al volver de segundo plano tras 45 s, también.
- La interfaz usa tamaños relativos: se ve igual en 540p, 720p (la resolución nativa del HY300) y 1080p.
- La guía (EPG) y los canales siguen viniendo de tu Firebase / archivo XMLTV, como en la app del celular.

## Notas
- El **keystone** (corrección trapezoidal), el enfoque y la imagen los maneja el sistema del proyector, no esta app.
- Si el proyector trae un WebView muy viejo y la app se ve rara, actualiza «Android System WebView» desde la tienda de apps del proyector.
