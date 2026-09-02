# Pokémon ChirlGold — WikiDex & Guía Maestra Oficial (v0.4.3)

Aplicación web interactiva y WikiDex oficial para **Pokémon ChirlGold**, desarrollada en HTML5, CSS3 y JavaScript moderno, 100% en castellano y adaptada para ordenadores y dispositivos móviles.

Todos los datos (ataques aprendidos por nivel, tipos, estadísticas, habilidades, evoluciones especiales y encuentros salvajes con franjas horarias y probabilidades) están extraídos directamente de los archivos binarios de la ROM.

---

## 🚀 Cómo usar en local (Sin instalar nada)

1. Abre el archivo `index.html` con cualquier navegador web (doble clic en Chrome, Edge, Firefox, Safari o Brave).
2. O si prefieres ejecutar un servidor local ligero:
   ```bash
   python -m http.server 8000
   ```
   Y accede en tu navegador a `http://localhost:8000`.

---

## 🌐 Cómo publicar gratis en GitHub Pages (Guía en 1 minuto)

Esta carpeta `guia_web/` es un repositorio Git completamente independiente de los archivos pesados de desarrollo y de la ROM. Para tener la guía online y accesible desde cualquier móvil o PC con una URL pública:

1. Crea un repositorio nuevo y vacío en tu cuenta de [GitHub](https://github.com/new) (por ejemplo llamado `chirlgold-dex` o `guia-chirlgold`).
2. Abre una terminal dentro de esta carpeta `guia_web/` y ejecuta:
   ```bash
   git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
   git branch -M main
   git push -u origin main
   ```
3. En la página de tu repositorio en GitHub, ve a **Settings** &rarr; **Pages**:
   - En **Source**, selecciona `Deploy from a branch`.
   - En **Branch**, selecciona `main` y la carpeta `/(root)`.
   - Haz clic en **Save**.
4. ¡Listo! En unos segundos tendrás tu web pública activa en `https://TU_USUARIO.github.io/TU_REPOSITORIO/`.

---

## ⚡ Características principales

- **Buscador Reactivo Universal**: Búsqueda instantánea en tiempo real por nombre, número de Pokédex, tipo, ataque, habilidad o ruta.
- **Ficha WikiDex Completa**:
  - Sprites oficiales de alta calidad.
  - Estadísticas base con barras de color proporcionales.
  - Tipos y habilidades reales implementadas en Pokémon ChirlGold.
  - **Learnset completo por nivel**: Nivel de aprendizaje, movimiento en castellano, categoría (Físico, Especial, Estado), tipo elemental, potencia, precisión y PP.
  - **Línea evolutiva adaptada**: Métodos evolutivos específicos (Cordón Unión, piedras, ataques clave como Marcha Espectral para Typhlosion de Hisui, etc.).
  - **Localización de captura**: Rutas exactas, momentos del día (Mañana, Día, Noche, Todo el día), tipo de encuentro (Hierba, Surf, Pesca, Inicial, Regalo) y probabilidad (%).
- **Explorador de Rutas y Zonas**: Todas las rutas de Johto y Kanto con filtrado por región y visualización de apariciones.
- **Líderes de Gimnasio y Level Caps**: Nivel máximo permitido por jefe para evitar sobreentrenamiento, con los equipos completos (Pokémon, niveles, objetos y ataques).
- **Catálogo de Tiendas y Objetos**: Los 56 objetos evolutivos y competitivos disponibles en los Grandes Almacenes de Trigal y Azulona.
- **Modo Oscuro / Modo Claro**: Conmutador con memoria en el almacenamiento local del navegador.
- **Cero Dependencias**: Funciona sin dependencias de Node.js, Webpack o backend.
