/* ==========================================================================
   Pokémon ChirlGold - WikiDex & Guía Maestra Oficial
   Lógica JavaScript Interactiva (Vanilla ES6)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const data = window.CHIRLGOLD_DATA;
  if (!data) {
    console.error("No se encontraron los datos de CHIRLGOLD_DATA.");
    return;
  }

  // Elementos DOM principales
  const navTabs = document.querySelectorAll(".nav-tab");
  const tabViews = document.querySelectorAll(".tab-view");
  const globalSearch = document.getElementById("global-search");
  const themeToggle = document.getElementById("theme-toggle");

  // Pokédex View
  const pokemonGrid = document.getElementById("pokemon-grid");
  const typeFilter = document.getElementById("type-filter");
  const sortFilter = document.getElementById("sort-filter");
  const resultsCount = document.getElementById("results-count");

  // Rutas View
  const regionFilter = document.getElementById("region-filter");
  const routeList = document.getElementById("route-list");
  const routeDetail = document.getElementById("route-detail");

  // Líderes View
  const leadersGrid = document.getElementById("leaders-grid");

  // Modal
  const modalOverlay = document.getElementById("pokemon-modal");
  const modalClose = document.getElementById("modal-close");

  let currentPokemonList = [...data.pokemon];
  let selectedPokemon = null;

  // Inicialización de Tema
  const savedTheme = localStorage.getItem("chirlgold-theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
  themeToggle.textContent = savedTheme === "dark" ? "☀️" : "🌙";

  themeToggle.addEventListener("click", () => {
    const curTheme = document.documentElement.getAttribute("data-theme");
    const nextTheme = curTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("chirlgold-theme", nextTheme);
    themeToggle.textContent = nextTheme === "dark" ? "☀️" : "🌙";
  });

  // Navegación por pestañas
  navTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const targetView = tab.getAttribute("data-tab");
      switchTab(targetView);
    });
  });

  function switchTab(viewId) {
    navTabs.forEach(t => t.classList.toggle("active", t.getAttribute("data-tab") === viewId));
    tabViews.forEach(v => v.classList.toggle("active", v.id === `view-${viewId}`));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // URL hash navigation
  function handleHash() {
    const hash = window.location.hash.replace("#", "");
    if (hash.startsWith("pokemon/")) {
      const monId = parseInt(hash.split("/")[1]);
      const mon = data.pokemon.find(p => p.id === monId);
      if (mon) openPokemonModal(mon);
    } else if (["pokedex", "rutas", "lideres", "objetos", "novedades", "no-incluidos"].includes(hash)) {
      switchTab(hash);
    }
  }
  window.addEventListener("hashchange", handleHash);

  // Helper para Sprites
  function getSpriteUrl(monId, name) {
    // Showdown / PokeAPI animated / static
    if (monId <= 1025) {
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${monId}.png`;
    }
    const clean = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    return `https://play.pokemonshowdown.com/sprites/dex/${clean}.png`;
  }

  // Render Pokédex Grid
  function renderPokemonGrid() {
    pokemonGrid.innerHTML = "";
    resultsCount.textContent = `${currentPokemonList.length} Pokémon encontrados`;

    // Renderizado eficiente por fragmentos
    const fragment = document.createDocumentFragment();
    const displayList = currentPokemonList.slice(0, 120); // Renderizado inicial rápido

    displayList.forEach(mon => {
      const card = document.createElement("div");
      card.className = "pokemon-card";
      
      const typeBadges = mon.types
        .map(t => `<span class="type-badge type-${t}">${t}</span>`)
        .join("");

      const spriteUrl = getSpriteUrl(mon.id, mon.name);

      card.innerHTML = `
        <span class="card-id">#${String(mon.id).padStart(3, "0")}</span>
        <img class="card-sprite" src="${spriteUrl}" alt="${mon.name}" loading="lazy" 
             onerror="this.onerror=null; this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${mon.id}.png';">
        <div class="card-name">${mon.name}</div>
        <div class="card-types">${typeBadges}</div>
      `;

      card.addEventListener("click", () => {
        openPokemonModal(mon);
      });

      fragment.appendChild(card);
    });

    pokemonGrid.appendChild(fragment);

    // Carga diferida si hay más de 120 resultados
    if (currentPokemonList.length > 120) {
      const loadMoreBtn = document.createElement("button");
      loadMoreBtn.className = "select-filter";
      loadMoreBtn.style.gridColumn = "1 / -1";
      loadMoreBtn.style.margin = "20px auto";
      loadMoreBtn.style.padding = "12px 24px";
      loadMoreBtn.style.fontWeight = "700";
      loadMoreBtn.textContent = `Cargar los siguientes ${Math.min(120, currentPokemonList.length - 120)} Pokémon...`;
      loadMoreBtn.addEventListener("click", () => {
        loadMoreBtn.remove();
        renderNextBatch(120);
      });
      pokemonGrid.appendChild(loadMoreBtn);
    }
  }

  function renderNextBatch(startIndex) {
    const fragment = document.createDocumentFragment();
    const nextList = currentPokemonList.slice(startIndex, startIndex + 150);

    nextList.forEach(mon => {
      const card = document.createElement("div");
      card.className = "pokemon-card";
      const typeBadges = mon.types.map(t => `<span class="type-badge type-${t}">${t}</span>`).join("");
      const spriteUrl = getSpriteUrl(mon.id, mon.name);

      card.innerHTML = `
        <span class="card-id">#${String(mon.id).padStart(3, "0")}</span>
        <img class="card-sprite" src="${spriteUrl}" alt="${mon.name}" loading="lazy">
        <div class="card-name">${mon.name}</div>
        <div class="card-types">${typeBadges}</div>
      `;
      card.addEventListener("click", () => openPokemonModal(mon));
      fragment.appendChild(card);
    });

    pokemonGrid.appendChild(fragment);

    if (startIndex + 150 < currentPokemonList.length) {
      const loadMoreBtn = document.createElement("button");
      loadMoreBtn.className = "select-filter";
      loadMoreBtn.style.gridColumn = "1 / -1";
      loadMoreBtn.style.margin = "20px auto";
      loadMoreBtn.style.padding = "12px 24px";
      loadMoreBtn.style.fontWeight = "700";
      loadMoreBtn.textContent = `Cargar más Pokémon...`;
      loadMoreBtn.addEventListener("click", () => {
        loadMoreBtn.remove();
        renderNextBatch(startIndex + 150);
      });
      pokemonGrid.appendChild(loadMoreBtn);
    }
  }

  // Filtrado y búsqueda reactiva
  function filterPokemon() {
    const query = globalSearch.value.trim().toLowerCase();
    const type = typeFilter.value;
    const sort = sortFilter.value;

    currentPokemonList = data.pokemon.filter(mon => {
      const matchesQuery = !query || 
        mon.name.toLowerCase().includes(query) || 
        String(mon.id).includes(query) ||
        mon.types.some(t => t.toLowerCase().includes(query)) ||
        mon.abilities.some(a => a.toLowerCase().includes(query)) ||
        mon.encounters.some(e => e.route.toLowerCase().includes(query));

      const matchesType = !type || mon.types.includes(type);

      return matchesQuery && matchesType;
    });

    if (sort === "id-asc") currentPokemonList.sort((a, b) => a.id - b.id);
    else if (sort === "id-desc") currentPokemonList.sort((a, b) => b.id - a.id);
    else if (sort === "name-asc") currentPokemonList.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "stat-desc") currentPokemonList.sort((a, b) => b.stats.total - a.stats.total);

    renderPokemonGrid();
  }

  globalSearch.addEventListener("input", () => {
    // Si estamos en otra pestaña, cambiar a pokedex
    if (!document.getElementById("view-pokedex").classList.contains("active")) {
      switchTab("pokedex");
    }
    filterPokemon();
  });
  typeFilter.addEventListener("change", filterPokemon);
  sortFilter.addEventListener("change", filterPokemon);

  // Modal de Detalle de Pokémon
  function openPokemonModal(mon) {
    selectedPokemon = mon;
    const modalContent = document.getElementById("modal-content");
    const spriteUrl = getSpriteUrl(mon.id, mon.name);

    const typeBadges = mon.types
      .map(t => `<span class="type-badge type-${t}">${t}</span>`)
      .join(" ");

    const stats = mon.stats;
    const maxStat = 180;
    const statRows = [
      { name: "PS", val: stats.hp, color: "#ef4444" },
      { name: "Ataque", val: stats.atk, color: "#f97316" },
      { name: "Defensa", val: stats.def, color: "#eab308" },
      { name: "Velocidad", val: stats.spe, color: "#3b82f6" },
      { name: "At. Esp.", val: stats.spa, color: "#8b5cf6" },
      { name: "Def. Esp.", val: stats.spd, color: "#10b981" },
    ].map(s => `
      <div class="stat-row">
        <span class="stat-label">${s.name}</span>
        <span class="stat-val">${s.val}</span>
        <div class="stat-bar-bg">
          <div class="stat-bar-fill" style="width: ${Math.min(100, (s.val / maxStat) * 100)}%; background-color: ${s.color};"></div>
        </div>
      </div>
    `).join("");

    // Evoluciones
    let evoHtml = `<p style="color: var(--text-muted);">No tiene evoluciones registradas en esta ROM.</p>`;
    if (mon.evolutions && mon.evolutions.length > 0) {
      evoHtml = `<ul class="evo-list">` + 
        mon.evolutions.map(e => `<li class="evo-item">⚡ ${e}</li>`).join("") + 
        `</ul>`;
    }

    // Encuentros
    let encHtml = `<p style="color: var(--text-muted);">No se conocen encuentros salvajes en Johto ni Kanto (o es inicial/evento).</p>`;
    if (mon.encounters && mon.encounters.length > 0) {
      encHtml = `<div class="encounters-list">` + 
        mon.encounters.map(e => `
          <div class="encounter-card">
            <span class="encounter-route">📍 ${e.route}</span>
            <div class="encounter-details">
              <span>🕐 ${e.time}</span>
              <span style="font-weight: 700; color: var(--gold);">${e.rate} (${e.method})</span>
            </div>
          </div>
        `).join("") + 
        `</div>`;
    }

    // Ataques por nivel
    let learnsetHtml = `<p style="color: var(--text-muted);">Sin ataques por nivel registrados.</p>`;
    if (mon.learnset && mon.learnset.length > 0) {
      learnsetHtml = `
        <div class="learnset-table-wrapper">
          <table class="learnset-table">
            <thead>
              <tr>
                <th>Nivel</th>
                <th>Movimiento</th>
                <th>Tipo</th>
                <th>Categoría</th>
                <th>Potencia</th>
                <th>Precisión</th>
                <th>PP</th>
              </tr>
            </thead>
            <tbody>
              ${mon.learnset.map(m => `
                <tr>
                  <td style="font-weight: 700; color: var(--gold);">Nv. ${m.lvl}</td>
                  <td style="font-weight: 600;">${m.name}</td>
                  <td><span class="type-badge type-${m.type}">${m.type}</span></td>
                  <td><span class="cat-badge cat-${m.cat}">${m.cat}</span></td>
                  <td>${m.power > 0 ? m.power : "—"}</td>
                  <td>${m.acc > 0 ? m.acc + "%" : "—"}</td>
                  <td>${m.pp}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `;
    }

    modalContent.innerHTML = `
      <div class="modal-header">
        <img class="modal-sprite" src="${spriteUrl}" alt="${mon.name}">
        <div class="modal-title-area">
          <span class="modal-id">#${String(mon.id).padStart(3, "0")}</span>
          <h2>${mon.name}</h2>
          <div style="margin-top: 6px;">${typeBadges}</div>
        </div>
      </div>
      <div class="modal-body">
        <!-- Habilidades -->
        <div class="detail-section">
          <h3>⚡ Habilidades en ChirlGold</h3>
          <p style="font-size: 1rem; font-weight: 600;">
            ${mon.abilities.map(a => `<span style="background: var(--bg-input); padding: 4px 10px; border-radius: 6px; margin-right: 8px; border: 1px solid var(--border);">${a}</span>`).join(" ")}
          </p>
        </div>

        <!-- Estadísticas -->
        <div class="detail-section">
          <h3>📊 Estadísticas Base (Total: ${stats.total})</h3>
          <div class="stats-grid">${statRows}</div>
        </div>

        <!-- Evolución -->
        <div class="detail-section">
          <h3>🧬 Línea Evolutiva en esta ROM</h3>
          ${evoHtml}
        </div>

        <!-- Encuentros -->
        <div class="detail-section">
          <h3>🗺️ Dónde Capturarlo (Localizaciones)</h3>
          ${encHtml}
        </div>

        <!-- Ataques por nivel -->
        <div class="detail-section">
          <h3>⚔️ Ataques que Aprende por Nivel</h3>
          ${learnsetHtml}
        </div>
      </div>
    `;

    modalOverlay.classList.add("active");
    window.location.hash = `pokemon/${mon.id}`;
  }

  function closeModal() {
    modalOverlay.classList.remove("active");
    if (window.location.hash.startsWith("#pokemon/")) {
      history.pushState("", document.title, window.location.pathname + window.location.search);
    }
  }

  modalClose.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalOverlay.classList.contains("active")) closeModal();
  });

  // Rutas View Logic
  function initRoutesView() {
    routeList.innerHTML = "";
    const selectedRegion = regionFilter.value;
    const filteredRoutes = data.routes.filter(r => selectedRegion === "all" || r.region === selectedRegion);

    filteredRoutes.forEach((route, idx) => {
      const item = document.createElement("div");
      item.className = `route-nav-item ${idx === 0 ? "active" : ""}`;
      item.innerHTML = `
        <span>${route.name}</span>
        <span style="font-size: 0.8rem; color: var(--text-muted);">${route.encounters.length} esp.</span>
      `;
      item.addEventListener("click", () => {
        document.querySelectorAll(".route-nav-item").forEach(i => i.classList.remove("active"));
        item.classList.add("active");
        renderRouteDetail(route);
      });
      routeList.appendChild(item);
    });

    if (filteredRoutes.length > 0) {
      renderRouteDetail(filteredRoutes[0]);
    } else {
      routeDetail.innerHTML = "<p>No hay rutas disponibles.</p>";
    }
  }

  function renderRouteDetail(route) {
    routeDetail.innerHTML = `
      <div style="border-bottom: 2px solid var(--border); padding-bottom: 12px; margin-bottom: 20px;">
        <span style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; color: var(--gold); font-weight: 700;">${route.region}</span>
        <h2 style="font-size: 1.6rem; font-weight: 800;">📍 ${route.name}</h2>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Encuentros salvajes registrados con horarios y porcentajes exactos de aparición.</p>
      </div>

      <div class="pokemon-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
        ${route.encounters.map(e => {
          const mon = data.pokemon.find(p => p.id === e.pid);
          const typeBadges = mon ? mon.types.map(t => `<span class="type-badge type-${t}">${t}</span>`).join(" ") : "";
          const spriteUrl = getSpriteUrl(e.pid, e.pokemon);

          return `
            <div class="pokemon-card" onclick="window.openMonById(${e.pid})">
              <span class="card-id">${e.rate}</span>
              <img class="card-sprite" src="${spriteUrl}" alt="${e.pokemon}">
              <div class="card-name">${e.pokemon}</div>
              <div style="margin-bottom: 6px;">${typeBadges}</div>
              <span style="font-size: 0.75rem; background: var(--bg-input); padding: 3px 8px; border-radius: 6px; border: 1px solid var(--border);">
                🕒 ${e.time} (${e.method})
              </span>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  regionFilter.addEventListener("change", initRoutesView);
  window.openMonById = function(id) {
    const mon = data.pokemon.find(p => p.id === id);
    if (mon) openPokemonModal(mon);
  };

  // Líderes View Logic
  function initLeadersView() {
    leadersGrid.innerHTML = data.gym_leaders.map(l => `
      <div class="leader-card">
        <div class="leader-header">
          <div>
            <div class="leader-name">${l.name}</div>
            <div class="leader-city">${l.city} — <b>${l.badge}</b></div>
          </div>
          <span class="cap-badge">CAP: Nv. ${l.level_cap}</span>
        </div>
        <div class="leader-team">
          ${l.team.map(m => `
            <div class="team-member">
              <div class="member-top">
                <span>⭐ ${m.pokemon}</span>
                <span style="color: var(--gold);">Nv. ${m.level}</span>
              </div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Objeto: <b>${m.item}</b></div>
              <div class="member-moves">Ataques: ${m.moves.join(", ")}</div>
            </div>
          `).join("")}
        </div>
      </div>
    `).join("");
  }

  // Tiendas y Objetos View Logic
  function initItemsView() {
    const itemsGrid = document.getElementById("items-grid");
    if (!itemsGrid) return;

    itemsGrid.innerHTML = data.item_locations.map(item => `
      <div class="info-card">
        <h3>🎒 ${item.item}</h3>
        <p style="font-weight: 700; color: var(--primary); margin-bottom: 4px;">📍 Ubicación: ${item.loc}</p>
        <p style="font-size: 0.9rem; color: var(--text-muted);">${item.desc}</p>
      </div>
    `).join("");
  }

  // Novedades View Logic
  function initFeaturesView() {
    const qolList = document.getElementById("qol-list");
    const bugsList = document.getElementById("bugs-list");
    if (!qolList || !bugsList) return;

    qolList.innerHTML = data.features.qol.map(f => `
      <li style="margin-bottom: 10px; background: var(--bg-card); padding: 12px; border-radius: 8px; border-left: 3px solid var(--gold);">
        ${f}
      </li>
    `).join("");

    bugsList.innerHTML = data.features.bugs.map(b => `
      <div class="info-card" style="border-left: 3px solid var(--danger);">
        <h4 style="color: var(--danger); font-size: 1rem; margin-bottom: 4px;">⚠️ ${b.issue}</h4>
        <p style="font-size: 0.9rem; color: var(--text-muted);"><b>Solución:</b> ${b.fix}</p>
      </div>
    `).join("");
  }

  // No Incluidos View Logic
  function initNonIncludedView() {
    const nonIncGrid = document.getElementById("non-included-grid");
    if (!nonIncGrid) return;

    nonIncGrid.innerHTML = data.non_included.map(mon => `
      <div class="info-card" style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 700; font-size: 1.05rem;">❌ ${mon.name}</span>
        <span style="font-size: 0.85rem; color: var(--text-muted); background: var(--bg-input); padding: 4px 10px; border-radius: 6px;">
          ${mon.reason}
        </span>
      </div>
    `).join("");
  }

  // Inicializar todas las vistas
  renderPokemonGrid();
  initRoutesView();
  initLeadersView();
  initItemsView();
  initFeaturesView();
  initNonIncludedView();

  // Comprobar si hay hash al cargar
  handleHash();
});
