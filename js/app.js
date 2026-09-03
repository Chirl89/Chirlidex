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

  // Sincronización dinámica de versión
  function syncVersion() {
    const activeVersion = data.version || window.CHIRLGOLD_VERSION || "v0.5.0";
    document.querySelectorAll(".guide-version-tag").forEach(el => {
      el.textContent = activeVersion;
    });
    try {
      fetch("../version.json")
        .then(res => res.json())
        .then(cfg => {
          if (cfg && cfg.version) {
            document.querySelectorAll(".guide-version-tag").forEach(el => {
              el.textContent = cfg.version;
            });
          }
        })
        .catch(() => {});
    } catch (e) {}
  }
  syncVersion();

  // Elementos DOM principales
  const tabViews = document.querySelectorAll(".tab-view");
  const globalSearch = document.getElementById("global-search");
  const menuDropdownToggle = document.getElementById("menu-dropdown-toggle");
  const headerDropdownMenu = document.getElementById("header-dropdown-menu");
  const menuBackdrop = document.getElementById("menu-backdrop");
  const menuCloseBtn = document.getElementById("menu-close-btn");

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

  // Movimientos View
  const moveSearchInput = document.getElementById("move-search-input");
  const moveTypeFilter = document.getElementById("move-type-filter");
  const moveCatFilter = document.getElementById("move-cat-filter");
  const movesTableBody = document.getElementById("moves-table-body");
  const movesCount = document.getElementById("moves-count");

  // Modales
  const modalOverlay = document.getElementById("pokemon-modal");
  const modalClose = document.getElementById("modal-close");

  const itemModalOverlay = document.getElementById("item-modal");
  const itemModalClose = document.getElementById("item-modal-close");

  const moveModalOverlay = document.getElementById("move-modal");
  const moveModalClose = document.getElementById("move-modal-close");

  const abilityModalOverlay = document.getElementById("ability-modal");
  const abilityModalClose = document.getElementById("ability-modal-close");

  if (abilityModalClose) {
    abilityModalClose.addEventListener("click", () => {
      abilityModalOverlay.classList.remove("active");
    });
  }

  if (abilityModalOverlay) {
    abilityModalOverlay.addEventListener("click", (e) => {
      if (e.target === abilityModalOverlay) {
        abilityModalOverlay.classList.remove("active");
      }
    });
  }

  window.openAbilityModal = function(abilityName) {
    if (!data.abilities) return;
    const cleanName = abilityName.trim().toLowerCase();
    const ability = data.abilities.find(a => a.name.toLowerCase() === cleanName) ||
                    data.abilities.find(a => a.name.toLowerCase().includes(cleanName) || cleanName.includes(a.name.toLowerCase()));

    if (!ability) {
      alert(`Información de la habilidad "${abilityName}" no encontrada.`);
      return;
    }

    const modalContent = document.getElementById("ability-modal-content");
    const pkmList = ability.pokemon || [];

    const pkmGridHtml = pkmList.map(p => {
      const sprite = getSpriteUrl(p.pid, p.name, p.slug);
      const typeBadges = p.types.map(t => getTypeBadgeHtml(t, true)).join(" ");
      return `
        <div class="pokemon-card" style="padding: 8px; cursor: pointer; text-align: center;" onclick="window.openPokemonModal('${p.pid}')" title="Ver ficha de ${p.name}">
          <span class="card-id" style="font-size: 0.75rem;">#${p.pid}</span>
          <img class="card-sprite" src="${sprite}" alt="${p.name}" style="width: 52px; height: 52px; margin: 2px auto;" loading="lazy">
          <div class="card-name" style="font-size: 0.82rem; margin: 2px 0;">${p.name}</div>
          <div class="card-types" style="justify-content: center; gap: 3px;">${typeBadges}</div>
        </div>
      `;
    }).join("");

    modalContent.innerHTML = `
      <div class="modal-header" style="background: linear-gradient(135deg, rgba(212,175,55,0.25), rgba(15,23,42,0.95));">
        <div class="modal-title-info">
          <span class="modal-id">✨ Habilidad Especial · ChirlGold</span>
          <h2>${ability.name}</h2>
        </div>
      </div>
      <div class="modal-body">
        <div class="detail-section">
          <h3>📝 Efecto Oficial en Combate</h3>
          <p style="font-size: 1.05rem; line-height: 1.6; background: var(--bg-input); padding: 14px 18px; border-radius: 8px; border: 1px solid var(--border);">
            ${ability.desc || 'Habilidad táctica en combate.'}
          </p>
        </div>

        <div class="detail-section">
          <h3>🐾 Pokémon que poseen esta Habilidad (${pkmList.length})</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 8px; max-height: 380px; overflow-y: auto; padding: 4px;">
            ${pkmGridHtml || '<p style="color: var(--text-muted);">Ningún Pokémon registrado.</p>'}
          </div>
        </div>
      </div>
    `;

    abilityModalOverlay.classList.add("active");
  };

  let currentPokemonList = [...data.pokemon];

  // Modo Oscuro Permanente Exclusivo (WikiDex Dark)
  document.documentElement.setAttribute("data-theme", "dark");

  // Control del Menú Lateral / Drawer (Compatible 100% con iOS y sin desbordamientos)
  function openMenu() {
    if (headerDropdownMenu) headerDropdownMenu.classList.add("show");
    if (menuBackdrop) menuBackdrop.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    if (headerDropdownMenu) headerDropdownMenu.classList.remove("show");
    if (menuBackdrop) menuBackdrop.classList.remove("show");
    document.body.style.overflow = "";
  }

  if (menuDropdownToggle) {
    menuDropdownToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      openMenu();
    });
  }

  if (menuCloseBtn) {
    menuCloseBtn.addEventListener("click", closeMenu);
  }

  if (menuBackdrop) {
    menuBackdrop.addEventListener("click", closeMenu);
  }

  if (headerDropdownMenu) {
    headerDropdownMenu.querySelectorAll(".dropdown-item").forEach(item => {
      item.addEventListener("click", () => {
        const targetView = item.getAttribute("data-tab");
        window.switchTab(targetView);
        closeMenu();
      });
    });
  }

  window.switchTab = function(viewId) {
    if (headerDropdownMenu) {
      headerDropdownMenu.querySelectorAll(".dropdown-item").forEach(item => {
        item.classList.toggle("active", item.getAttribute("data-tab") === viewId);
      });
    }
    tabViews.forEach(v => v.classList.toggle("active", v.id === `view-${viewId}`));
    closeMenu();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  window.toggleChapter = function(headerEl) {
    const card = headerEl.closest(".chapter-card");
    if (card) {
      card.classList.toggle("active");
    }
  };

  // URL Hash Handler
  function handleHash() {
    const hash = window.location.hash.replace("#", "");
    if (hash.startsWith("pokemon/")) {
      const monId = hash.split("/")[1];
      openPokemonModal(monId);
    } else if (hash.startsWith("objeto/")) {
      const itemName = decodeURIComponent(hash.split("/")[1]);
      openItemModal(itemName);
    } else if (hash.startsWith("movimiento/")) {
      const moveId = parseInt(hash.split("/")[1]);
      openMoveModal(moveId);
    } else if (["pokedex", "rutas", "lideres", "objetos", "movimientos", "novedades", "no-incluidos"].includes(hash)) {
      switchTab(hash);
    }
  }
  window.addEventListener("hashchange", handleHash);

  // =========================================================================
  // ASSETS OFICIALES DE WIKIDEX (Tipos y Clases de Movimientos)
  // =========================================================================
  const WIKIDEX_TYPES = {
    "Normal": "https://images.wikidexcdn.net/mwuploads/wikidex/thumb/9/99/latest/20221208180705/Tipo_normal_EP.png/80px-Tipo_normal_EP.png",
    "Fuego": "https://images.wikidexcdn.net/mwuploads/wikidex/thumb/c/c0/latest/20221208180625/Tipo_fuego_EP.png/80px-Tipo_fuego_EP.png",
    "Agua": "https://images.wikidexcdn.net/mwuploads/wikidex/thumb/5/59/latest/20221208180426/Tipo_agua_EP.png/80px-Tipo_agua_EP.png",
    "Planta": "https://images.wikidexcdn.net/mwuploads/wikidex/thumb/a/a7/latest/20221208180710/Tipo_planta_EP.png/80px-Tipo_planta_EP.png",
    "Eléctrico": "https://images.wikidexcdn.net/mwuploads/wikidex/thumb/3/37/latest/20221208180447/Tipo_el%C3%A9ctrico_EP.png/80px-Tipo_el%C3%A9ctrico_EP.png",
    "Hielo": "https://images.wikidexcdn.net/mwuploads/wikidex/thumb/1/17/latest/20221208180641/Tipo_hielo_EP.png/80px-Tipo_hielo_EP.png",
    "Lucha": "https://images.wikidexcdn.net/mwuploads/wikidex/thumb/5/5f/latest/20221208180651/Tipo_lucha_EP.png/80px-Tipo_lucha_EP.png",
    "Veneno": "https://images.wikidexcdn.net/mwuploads/wikidex/thumb/1/11/latest/20221208180751/Tipo_veneno_EP.png/80px-Tipo_veneno_EP.png",
    "Tierra": "https://images.wikidexcdn.net/mwuploads/wikidex/thumb/c/c9/latest/20221208180742/Tipo_tierra_EP.png/80px-Tipo_tierra_EP.png",
    "Volador": "https://images.wikidexcdn.net/mwuploads/wikidex/thumb/9/9a/latest/20221208180800/Tipo_volador_EP.png/80px-Tipo_volador_EP.png",
    "Psíquico": "https://images.wikidexcdn.net/mwuploads/wikidex/thumb/1/16/latest/20221208180718/Tipo_ps%C3%ADquico_EP.png/80px-Tipo_ps%C3%ADquico_EP.png",
    "Bicho": "https://images.wikidexcdn.net/mwuploads/wikidex/thumb/5/5d/latest/20221208180434/Tipo_bicho_EP.png/80px-Tipo_bicho_EP.png",
    "Roca": "https://images.wikidexcdn.net/mwuploads/wikidex/thumb/8/88/latest/20221208180726/Tipo_roca_EP.png/80px-Tipo_roca_EP.png",
    "Fantasma": "https://images.wikidexcdn.net/mwuploads/wikidex/thumb/0/03/latest/20221208180503/Tipo_fantasma_EP.png/80px-Tipo_fantasma_EP.png",
    "Dragón": "https://images.wikidexcdn.net/mwuploads/wikidex/thumb/0/01/latest/20221208180455/Tipo_drag%C3%B3n_EP.png/80px-Tipo_drag%C3%B3n_EP.png",
    "Siniestro": "https://images.wikidexcdn.net/mwuploads/wikidex/thumb/d/de/latest/20221208180734/Tipo_siniestro_EP.png/80px-Tipo_siniestro_EP.png",
    "Acero": "https://images.wikidexcdn.net/mwuploads/wikidex/thumb/5/52/latest/20221208180543/Tipo_acero_EP.png/80px-Tipo_acero_EP.png",
    "Hada": "https://images.wikidexcdn.net/mwuploads/wikidex/thumb/9/97/latest/20221208180633/Tipo_hada_EP.png/80px-Tipo_hada_EP.png"
  };

  const WIKIDEX_CATEGORIES = {
    "Físico": "https://images.wikidexcdn.net/mwuploads/wikidex/thumb/5/55/latest/20251010111650/Clase_f%C3%ADsico_EP.png/24px-Clase_f%C3%ADsico_EP.png",
    "Especial": "https://images.wikidexcdn.net/mwuploads/wikidex/thumb/6/6e/latest/20251010111700/Clase_especial_EP.png/24px-Clase_especial_EP.png",
    "Estado": "https://images.wikidexcdn.net/mwuploads/wikidex/thumb/b/bc/latest/20251010111711/Clase_estado_EP.png/24px-Clase_estado_EP.png"
  };

  function getTypeBadgeHtml(type, isCompact = false) {
    const imgUrl = WIKIDEX_TYPES[type];
    if (imgUrl) {
      return `<img class="wikidex-type-img ${isCompact ? 'compact' : ''}" src="${imgUrl}" alt="${type}" title="Tipo ${type}" loading="lazy" onerror="this.outerHTML='<span class=\\'type-badge type-${type}\\'>${type}</span>'">`;
    }
    return `<span class="type-badge type-${type}">${type}</span>`;
  }

  function getCategoryBadgeHtml(cat) {
    const imgUrl = WIKIDEX_CATEGORIES[cat];
    if (imgUrl) {
      return `
        <span class="wikidex-cat-badge cat-${cat}" title="Clase ${cat}">
          <img src="${imgUrl}" alt="${cat}" width="18" height="18" loading="lazy">
        </span>
      `;
    }
    return `<span class="cat-badge cat-${cat}">${cat}</span>`;
  }

  // Helper canónico para Sprites (Gen 5 pixel-art oficial para todas las generaciones)
  const PARADOX_SLUGS = {
    "flamariete": "gougingfire",
    "electrofuria": "ragingbolt",
    "ferromole": "ironboulder",
    "ferrotesta": "ironcrown",
    "colmilargo": "greattusk",
    "colagrito": "screamtail",
    "furiasaltor": "brutebonnet",
    "melenaleteo": "fluttermane",
    "reptalada": "slitherwing",
    "pelarena": "sandyshocks",
    "ferrodada": "irontreads",
    "ferrosaco": "ironbundle",
    "ferropalmas": "ironhands",
    "ferrocuello": "ironjugulis",
    "ferropolilla": "ironmoth",
    "ferropuas": "ironthorns",
    "ferrovaliente": "ironvaliant",
    "bramaluna": "roaringmoon",
    "ondulagua": "walkingwake",
    "ferroverdor": "ironleaves"
  };

  function getSpriteUrl(monId, name, slug) {
    const clean = (name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const actualSlug = slug || PARADOX_SLUGS[clean] || clean;
    return `https://play.pokemonshowdown.com/sprites/gen5/${actualSlug}.png`;
  }

  // =========================================================================
  // 1. POKÉDEX GRID
  // =========================================================================
  function renderPokemonGrid() {
    pokemonGrid.innerHTML = "";
    resultsCount.textContent = `${currentPokemonList.length} Pokémon encontrados`;

    const fragment = document.createDocumentFragment();
    const displayList = currentPokemonList.slice(0, 120);

    displayList.forEach(mon => {
      const card = document.createElement("div");
      card.className = "pokemon-card";
      
      const typeBadges = mon.types
        .map(t => getTypeBadgeHtml(t, true))
        .join(" ");

      const spriteUrl = getSpriteUrl(mon.id, mon.name, mon.slug);
      const displayId = typeof mon.id === "number" ? `#${String(mon.id).padStart(3, "0")}` : "Forma";

      card.innerHTML = `
        <span class="card-id">${displayId}</span>
        <img class="card-sprite" src="${spriteUrl}" alt="${mon.name}" loading="lazy" onerror="this.style.display='none';">
        <span class="card-name">${mon.name}</span>
        <div class="card-types">${typeBadges}</div>
      `;

      card.addEventListener("click", () => {
        openPokemonModal(mon);
      });

      fragment.appendChild(card);
    });

    pokemonGrid.appendChild(fragment);

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
      const typeBadges = mon.types.map(t => getTypeBadgeHtml(t, true)).join(" ");
      const spriteUrl = getSpriteUrl(mon.id, mon.name, mon.slug);
      const displayId = typeof mon.id === "number" ? `#${String(mon.id).padStart(3, "0")}` : "Forma";

      card.innerHTML = `
        <span class="card-id">${displayId}</span>
        <img class="card-sprite" src="${spriteUrl}" alt="${mon.name}" loading="lazy" onerror="this.style.display='none';">
        <span class="card-name">${mon.name}</span>
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

  // Filtrado y búsqueda reactiva Pokédex
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

    if (sort === "id-asc") currentPokemonList.sort((a, b) => (typeof a.id === "number" ? a.id : 9999) - (typeof b.id === "number" ? b.id : 9999));
    else if (sort === "id-desc") currentPokemonList.sort((a, b) => (typeof b.id === "number" ? b.id : 9999) - (typeof a.id === "number" ? a.id : 9999));
    else if (sort === "name-asc") currentPokemonList.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "stat-desc") currentPokemonList.sort((a, b) => b.stats.total - a.stats.total);

    renderPokemonGrid();
  }

  globalSearch.addEventListener("input", () => {
    if (!document.getElementById("view-pokedex").classList.contains("active")) {
      switchTab("pokedex");
    }
    filterPokemon();
  });
  typeFilter.addEventListener("change", filterPokemon);
  sortFilter.addEventListener("change", filterPokemon);

  // =========================================================================
  // 2. MODAL DETALLADO DE POKÉMON & ÁRBOL EVOLUTIVO COMPLETO
  // =========================================================================
  function openPokemonModal(monOrId) {
    let mon = null;
    if (typeof monOrId === "object") {
      mon = monOrId;
    } else {
      mon = data.pokemon.find(p => String(p.id).toLowerCase() === String(monOrId).toLowerCase() || p.name.toLowerCase() === String(monOrId).toLowerCase());
    }

    if (!mon) {
      console.warn("Pokémon no encontrado:", monOrId);
      return;
    }

    const modalContent = document.getElementById("modal-content");
    const spriteUrl = getSpriteUrl(mon.id, mon.name, mon.slug);
    const displayId = typeof mon.id === "number" ? `#${String(mon.id).padStart(3, "0")}` : "Forma Especial";

    const typeBadges = mon.types
      .map(t => getTypeBadgeHtml(t))
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

    // Construcción del diagrama de flujo de evolución completo
    let evoHtml = renderEvolutionFlow(mon);

    // Encuentros interactivos que abren el mapa de la ruta
    let encHtml = `<p style="color: var(--text-muted);">No se conocen encuentros salvajes en Johto ni Kanto (o es inicial/evento).</p>`;
    if (mon.encounters && mon.encounters.length > 0) {
      encHtml = `<div class="encounters-list">` + 
        mon.encounters.map(e => `
          <div class="encounter-card encounter-clickable" onclick="window.openRouteModal('${e.route.replace(/'/g, "\\'")}')" title="Pulsar para ver la ubicación de ${e.route} en el mapa">
            <span class="encounter-route">
              <span>📍 ${e.route}</span>
              <span class="enc-map-pill">🗺️ Ver mapa</span>
            </span>
            <div class="encounter-details">
              <span>🕐 ${e.time}</span>
              <span style="font-weight: 700; color: var(--gold);">${e.rate} (${e.method})</span>
            </div>
          </div>
        `).join("") + 
        `</div>`;
    }

    // Ataques por nivel interactivos estilo WikiDex
    let learnsetHtml = `<p style="color: var(--text-muted);">Sin ataques por nivel registrados.</p>`;
    if (mon.learnset && mon.learnset.length > 0) {
      learnsetHtml = `
        <div class="learnset-table-wrapper">
          <table class="learnset-table">
            <thead>
              <tr>
                <th style="width: 28px;">Nv.</th>
                <th style="text-align: left;">Movimiento</th>
                <th style="width: 36px;">Tipo</th>
                <th style="width: 22px;">Cla.</th>
                <th style="width: 28px;">Pot.</th>
                <th style="width: 28px;">Pre.</th>
                <th style="width: 24px;">PP</th>
              </tr>
            </thead>
            <tbody>
              ${mon.learnset.map(m => `
                <tr>
                  <td class="col-lvl">${m.lvl === 0 ? "Evo" : m.lvl}</td>
                  <td class="col-name" style="text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    <a href="javascript:void(0)" class="link-move" onclick="window.openMoveModal(${m.id})">
                      ${m.name}
                    </a>
                  </td>
                  <td class="col-center">${getTypeBadgeHtml(m.type, true)}</td>
                  <td class="col-center">${getCategoryBadgeHtml(m.cat)}</td>
                  <td class="col-num">${m.power > 0 ? m.power : "—"}</td>
                  <td class="col-num">${m.acc > 0 ? m.acc : "—"}</td>
                  <td class="col-num">${m.pp}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `;
    }

    modalContent.innerHTML = `
      <div class="modal-header">
        <img class="modal-sprite" src="${spriteUrl}" alt="${mon.name}" onerror="this.onerror=null; this.src='https://play.pokemonshowdown.com/sprites/dex/${(mon.slug||mon.name||'').toLowerCase().replace(/[^a-z0-9\\-]/g, '')}.png';">
        <div class="modal-title-area">
          <span class="modal-id">${displayId}</span>
          <h2>${mon.name}</h2>
          <div style="margin-top: 6px; display:flex; gap:6px; flex-wrap:wrap;">${typeBadges}</div>
        </div>
      </div>
      <div class="modal-body">
        <!-- Habilidades -->
        <div class="detail-section">
          <h3>⚡ Habilidades en ChirlGold (Toca para ver descripción oficial y Pokémon)</h3>
          <p style="font-size: 1rem; font-weight: 600;">
            ${mon.abilities.map(a => `<a href="javascript:void(0)" class="ability-pill" onclick="window.openAbilityModal('${a.replace(/'/g, "\\'")}')" title="Ver descripción de ${a}">✨ ${a}</a>`).join(" ")}
          </p>
        </div>

        <!-- Estadísticas -->
        <div class="detail-section">
          <h3>📊 Estadísticas Base (Total: ${stats.total})</h3>
          <div class="stats-grid">${statRows}</div>
        </div>

        <!-- Línea Evolutiva Completa e Interactiva -->
        <div class="detail-section">
          <h3>🧬 Línea Evolutiva Completa (Haz clic en Pokémon, Objetos o Ataques)</h3>
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

  function renderEvolutionFlow(currentMon) {
    if (!currentMon.family_tree || currentMon.family_tree.length === 0) {
      return `<p style="color: var(--text-muted);">Este Pokémon no tiene evoluciones registradas en esta ROM.</p>`;
    }

    // Aplanar caminos evolutivos para visualizarlos claramente como cadenas conectadas
    let html = `<div class="evo-flow-container">`;

    currentMon.family_tree.forEach(root => {
      const paths = getTreePaths(root);
      paths.forEach(path => {
        html += `<div class="evo-chain">`;
        path.forEach((step, idx) => {
          if (idx > 0) {
            let reqText = step.method || "Evolución";
            reqText = reqText.replace(/Nivel\s*/gi, "Nv. ");
            if (reqText.includes("(sin Marcha Espectral)") || reqText.includes("(sin Tajo Metralla)") || reqText.includes("(sin Flechas Triples)")) {
              reqText = "Nv. 36";
            }
            if (step.item) {
              const cleanItem = step.item.replace(/Usar\s*/gi, "").trim();
              reqText = `<a href="javascript:void(0)" class="link-item" onclick="window.openItemModal('${step.item}')">${cleanItem} 🎒</a>`;
            } else if (step.move) {
              const moveObj = data.moves.find(m => m.name.toLowerCase() === step.move.toLowerCase());
              const moveParam = moveObj ? moveObj.id : `'${step.move}'`;
              reqText = `<a href="javascript:void(0)" class="link-move" onclick="window.openMoveModal(${moveParam})">${step.move} ⚔️</a>`;
            }

            html += `
              <div class="evo-arrow-box">
                <span class="evo-method-pill">${reqText}</span>
                <span class="evo-arrow-symbol">➔</span>
              </div>
            `;
          }

          const isCurrent = String(step.id).toLowerCase() === String(currentMon.id).toLowerCase() ||
                            step.name.toLowerCase() === currentMon.name.toLowerCase();
          const spriteUrl = getSpriteUrl(step.id, step.name, step.slug);
          const typeBadges = (step.types || [])
            .map(t => getTypeBadgeHtml(t, true))
            .join(" ");

          html += `
            <div class="evo-node ${isCurrent ? "current-mon" : ""}" onclick="window.openPokemonModal('${step.id}')">
              <img class="evo-node-sprite" src="${spriteUrl}" alt="${step.name}">
              <span class="evo-node-name">${step.name}</span>
              <div class="evo-types-row">${typeBadges}</div>
              ${isCurrent ? '<span class="evo-current-tag">Actual</span>' : ''}
            </div>
          `;
        });
        html += `</div>`;
      });
    });

    html += `</div>`;
    return html;
  }

  function getTreePaths(node) {
    const currentStep = {
      id: node.id,
      name: node.name,
      types: node.types,
      slug: node.slug,
      method: node.method,
      method_type: node.method_type,
      item: node.item,
      move: node.move
    };

    if (!node.evolves_to || node.evolves_to.length === 0) {
      return [[currentStep]];
    }

    const allPaths = [];
    node.evolves_to.forEach(child => {
      const childPaths = getTreePaths(child);
      childPaths.forEach(p => {
        allPaths.push([currentStep, ...p]);
      });
    });

    return allPaths;
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

  // =========================================================================
  // 3. MODAL DE OBJETO (DÓNDE SE CONSIGUE, DESCRIPCIÓN Y USOS EVOLUTIVOS)
  // =========================================================================
  function openItemModal(itemName) {
    const item = data.items.find(i => i.name.toLowerCase() === itemName.toLowerCase() || itemName.toLowerCase().includes(i.name.toLowerCase()));
    if (!item) {
      alert(`Información del objeto "${itemName}" disponible en Tiendas.`);
      return;
    }

    const content = document.getElementById("item-modal-content");
    let evolvesHtml = "";
    if (item.evolves && item.evolves.length > 0) {
      evolvesHtml = `
        <div class="detail-section">
          <h3>🧬 Pokémon que Evolucionan con este Objeto</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px;">Haz clic en cualquier Pokémon para saltar directamente a su ficha:</p>
          <div class="mini-pkm-list">
            ${item.evolves.map(e => `
              <div class="mini-pkm-pill" onclick="window.openPokemonModal('${e.from_id || e.from}')">
                <span>⭐ <b>${e.from}</b> ➔ <b>${e.to}</b></span>
                <span style="font-size: 0.75rem; color: var(--gold);">(${e.method})</span>
              </div>
            `).join("")}
          </div>
        </div>
      `;
    }

    content.innerHTML = `
      <div class="modal-header">
        <div>
          <span style="font-size: 0.85rem; color: var(--primary); font-weight: 700; text-transform: uppercase;">${item.category}</span>
          <h2 style="font-size: 1.6rem; font-weight: 800;">🎒 ${item.name}</h2>
        </div>
      </div>
      <div class="modal-body">
        <div class="detail-section">
          <h3>📍 Dónde y Cómo Conseguirlo en ChirlGold</h3>
          <p style="font-weight: 700; color: var(--gold); font-size: 1.05rem;">${item.location}</p>
        </div>
        <div class="detail-section">
          <h3>📝 Descripción Oficial</h3>
          <p style="font-size: 0.95rem; line-height: 1.6;">${item.desc}</p>
        </div>
        ${evolvesHtml}
      </div>
    `;

    itemModalOverlay.classList.add("active");
  }

  function closeItemModal() {
    itemModalOverlay.classList.remove("active");
  }
  itemModalClose.addEventListener("click", closeItemModal);
  itemModalOverlay.addEventListener("click", (e) => {
    if (e.target === itemModalOverlay) closeItemModal();
  });

  // =========================================================================
  // 4. MODAL DE MOVIMIENTO (CARACTERÍSTICAS, DESCRIPCIÓN Y QUIÉN LO APRENDE)
  // =========================================================================
  function openMoveModal(moveIdOrName) {
    let move = null;
    if (typeof moveIdOrName === "number") {
      move = data.moves.find(m => m.id === moveIdOrName);
    } else {
      move = data.moves.find(m => m.name.toLowerCase() === String(moveIdOrName).toLowerCase() || m.id === parseInt(moveIdOrName));
    }

    if (!move) {
      console.warn("Movimiento no encontrado:", moveIdOrName);
      return;
    }

    const content = document.getElementById("move-modal-content");
    let learnedHtml = "";
    if (move.learned_by && move.learned_by.length > 0) {
      learnedHtml = `
        <div class="detail-section">
          <h3>⚡ Pokémon que lo Aprenden por Nivel (${move.learned_by.length})</h3>
          <div class="mini-pkm-list">
            ${move.learned_by.map(p => `
              <div class="mini-pkm-pill" onclick="window.openPokemonModal('${p.pid}')">
                <span><b>${p.pokemon}</b></span>
                <span style="color: var(--gold);">Nv. ${p.lvl}</span>
              </div>
            `).join("")}
          </div>
        </div>
      `;
    }

    content.innerHTML = `
      <div class="modal-header">
        <div>
          <div style="display:flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            ${getTypeBadgeHtml(move.type)}
            ${getCategoryBadgeHtml(move.category)}
            <span style="font-size: 0.88rem; font-weight: 700; color: var(--text-muted); margin-left: 4px;">Clase ${move.category}</span>
          </div>
          <h2 style="font-size: 1.6rem; font-weight: 800;">⚔️ ${move.name}</h2>
        </div>
      </div>
      <div class="modal-body">
        <div class="detail-section">
          <h3>📊 Atributos de Combate</h3>
          <div class="stats-grid">
            <div><b>Potencia:</b> <span style="font-weight:700; color:var(--gold);">${move.power > 0 ? move.power : "—"}</span></div>
            <div><b>Precisión:</b> <span style="font-weight:700; color:var(--gold);">${move.accuracy > 0 ? move.accuracy + "%" : "—"}</span></div>
            <div><b>Puntos de Poder (PP):</b> <span style="font-weight:700; color:var(--gold);">${move.pp}</span></div>
            <div><b>Clase:</b> <span style="font-weight:700;">${move.category}</span></div>
          </div>
        </div>
        <div class="detail-section">
          <h3>📝 Descripción Oficial en la ROM</h3>
          <p style="font-size: 1rem; line-height: 1.6; font-style: italic;">"${move.desc}"</p>
        </div>
        ${learnedHtml}
      </div>
    `;

    moveModalOverlay.classList.add("active");
  }

  function closeMoveModal() {
    moveModalOverlay.classList.remove("active");
  }
  moveModalClose.addEventListener("click", closeMoveModal);
  moveModalOverlay.addEventListener("click", (e) => {
    if (e.target === moveModalOverlay) closeMoveModal();
  });

  // =========================================================================
  // 4. MODAL DE RUTA Y MAPA INTERACTIVO (HGSS / WIKIDEX)
  // =========================================================================
  const routeModalOverlay = document.getElementById("route-modal");
  const routeModalClose = document.getElementById("route-modal-close");
  const routeModalContent = document.getElementById("route-modal-content");

  let activeRouteForMap = null;
  let currentMapRegion = "Johto";

  function openRouteModal(routeName) {
    if (!routeName) return;
    const cleanTarget = routeName.trim().toLowerCase();
    
    // Buscar coincidencia exacta o por subcadena
    let route = data.routes.find(r => r.name.toLowerCase() === cleanTarget);
    if (!route) {
      route = data.routes.find(r => r.name.toLowerCase().includes(cleanTarget) || cleanTarget.includes(r.name.toLowerCase()));
    }
    
    if (!route) {
      route = {
        name: routeName,
        region: "Johto",
        x: 50,
        y: 50,
        desc: `Ubicación especial en Pokémon ChirlGold: ${routeName}.`,
        connections: [],
        encounters: []
      };
    }

    activeRouteForMap = route;
    currentMapRegion = route.region || "Johto";
    renderRouteModal();
    routeModalOverlay.classList.add("active");
  }

  function renderRouteModal() {
    if (!activeRouteForMap) return;
    const r = activeRouteForMap;
    const isShowingActiveRegion = (currentMapRegion === r.region);
    const mapSrc = (currentMapRegion === "Kanto") ? "img/mapa_kanto_esquematico.png" : "img/mapa_johto_esquematico.png";
    const regionBadgeClass = (r.region === "Kanto") ? "route-region-kanto" : "route-region-johto";

    let spawnsHtml = "";
    if (r.encounters && r.encounters.length > 0) {
      spawnsHtml = `
        <div class="route-spawns-section">
          <h3>🐾 Pokémon salvajes en esta zona (${r.encounters.length})</h3>
          <div class="route-spawns-grid">
            ${r.encounters.map(e => {
              const mon = data.pokemon.find(p => p.id === e.pid);
              const spriteUrl = getSpriteUrl(e.pid, e.pokemon, mon ? mon.slug : null);
              const typeBadges = mon ? mon.types.map(t => getTypeBadgeHtml(t, true)).join(" ") : "";
              return `
                <div class="route-spawn-card" onclick="window.openPokemonModal('${e.pid}')" title="Ver ficha de ${e.pokemon}">
                  <img src="${spriteUrl}" alt="${e.pokemon}" class="route-spawn-sprite" 
                       onerror="this.onerror=null; this.src='https://play.pokemonshowdown.com/sprites/dex/${(mon ? mon.slug || mon.name : e.pokemon).toLowerCase().replace(/[^a-z0-9\\-]/g, '')}.png';">
                  <div class="route-spawn-info">
                    <div class="route-spawn-name">${e.pokemon}</div>
                    <div class="route-spawn-types">${typeBadges}</div>
                    <div class="route-spawn-rate"><b>${e.rate}</b> · ${e.time} (${e.method})</div>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      `;
    }

    routeModalContent.innerHTML = `
      <div class="route-modal-header">
        <div class="route-modal-title">
          <span class="route-region-badge ${regionBadgeClass}">Región de ${r.region}</span>
          <h2 style="font-size: 1.6rem; font-weight: 800; margin: 0;">📍 ${r.name}</h2>
        </div>
      </div>

      <!-- Selector de Mapa Johto / Kanto (Vista esquemática de HGSS) -->
      <div class="map-controls-bar">
        <button class="map-switch-btn ${currentMapRegion === 'Johto' ? 'active' : ''}" onclick="window.switchMapRegion('Johto')">
          🎮 Mapa Esquemático de Johto
        </button>
        <button class="map-switch-btn ${currentMapRegion === 'Kanto' ? 'active' : ''}" onclick="window.switchMapRegion('Kanto')">
          🎮 Mapa Esquemático de Kanto
        </button>
      </div>

      <!-- Visor del Mapa con Pin Animado -->
      <div class="route-map-viewport">
        <img class="route-map-img" src="${mapSrc}" alt="Mapa de ${currentMapRegion}">
        ${isShowingActiveRegion ? `
          <div class="map-pin" style="left: ${r.x || 50}%; top: ${r.y || 50}%;">
            <div class="map-pin-pulse"></div>
            <div class="map-pin-reticle"></div>
            <div class="map-pin-beacon"></div>
          </div>
        ` : `
          <div style="position: absolute; top: 12px; left: 12px; background: rgba(15,23,42,0.92); color: #fff; padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; border: 1px solid var(--border);">
            ℹ️ ${r.name} pertenece a <b>${r.region}</b>. Pulsa el botón de arriba para ver su posición.
          </div>
        `}
      </div>

      <!-- Caja de Información Geográfica y Conexiones -->
      <div class="route-info-box">
        <p><b>🧭 Descripción:</b> ${r.desc || 'Ruta oficial de la región.'}</p>
        ${r.connections && r.connections.length > 0 ? `
          <div class="route-info-connections">
            <b>🔗 Conexiones directas:</b> ${r.connections.join(", ")}
          </div>
        ` : ''}
      </div>

      ${spawnsHtml}
    `;
  }

  function switchMapRegion(regionName) {
    currentMapRegion = regionName;
    renderRouteModal();
  }

  function closeRouteModal() {
    if (routeModalOverlay) routeModalOverlay.classList.remove("active");
  }

  if (routeModalClose) routeModalClose.addEventListener("click", closeRouteModal);
  if (routeModalOverlay) {
    routeModalOverlay.addEventListener("click", (e) => {
      if (e.target === routeModalOverlay) closeRouteModal();
    });
  }

  // Escape key closes open modals
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (routeModalOverlay && routeModalOverlay.classList.contains("active")) closeRouteModal();
      else if (moveModalOverlay.classList.contains("active")) closeMoveModal();
      else if (itemModalOverlay.classList.contains("active")) closeItemModal();
      else if (modalOverlay.classList.contains("active")) closeModal();
    }
  });

  // Exponer a nivel de ventana para llamadas onclick
  window.openPokemonModal = openPokemonModal;
  window.openItemModal = openItemModal;
  window.openMoveModal = openMoveModal;
  window.openRouteModal = openRouteModal;
  window.switchMapRegion = switchMapRegion;
  window.closeRouteModal = closeRouteModal;

  // =========================================================================
  // 5. VISTA DE MOVIMIENTOS COMPLETA
  // =========================================================================
  function renderMovesTable() {
    if (!movesTableBody) return;
    const query = (moveSearchInput ? moveSearchInput.value : "").trim().toLowerCase();
    const type = moveTypeFilter ? moveTypeFilter.value : "";
    const cat = moveCatFilter ? moveCatFilter.value : "";

    const filtered = data.moves.filter(m => {
      const matchQ = !query || m.name.toLowerCase().includes(query) || m.desc.toLowerCase().includes(query);
      const matchT = !type || m.type === type;
      const matchC = !cat || m.category === cat;
      return matchQ && matchT && matchC;
    });

    movesCount.textContent = `${filtered.length} movimientos encontrados`;

    // Renderizar primeros 100 con formato WikiDex
    movesTableBody.innerHTML = filtered.slice(0, 100).map(m => `
      <tr>
        <td class="col-name">
          <a href="javascript:void(0)" class="link-move" onclick="window.openMoveModal(${m.id})">
            <b>${m.name}</b>
          </a>
        </td>
        <td class="col-center">${getTypeBadgeHtml(m.type, true)}</td>
        <td class="col-center">${getCategoryBadgeHtml(m.category)}</td>
        <td class="col-num">${m.power > 0 ? m.power : "—"}</td>
        <td class="col-num">${m.accuracy > 0 ? m.accuracy + "%" : "—"}</td>
        <td class="col-num">${m.pp}</td>
        <td style="font-size:0.8rem; color:var(--text-muted); max-width:300px;">${m.desc}</td>
      </tr>
    `).join("");
  }

  if (moveSearchInput) moveSearchInput.addEventListener("input", renderMovesTable);
  if (moveTypeFilter) moveTypeFilter.addEventListener("change", renderMovesTable);
  if (moveCatFilter) moveCatFilter.addEventListener("change", renderMovesTable);

  // =========================================================================
  // 6. RUTAS VIEW LOGIC
  // =========================================================================
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
      <div style="border-bottom: 2px solid var(--border); padding-bottom: 14px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 12px;">
        <div>
          <span style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; color: var(--gold); font-weight: 700;">Región de ${route.region}</span>
          <h2 style="font-size: 1.6rem; font-weight: 800; margin: 4px 0;">📍 ${route.name}</h2>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin: 0;">${route.desc || 'Encuentros salvajes registrados con horarios y porcentajes exactos de aparición.'}</p>
        </div>
        <button class="select-filter" style="cursor: pointer; font-weight: 700; background: var(--primary); color: #fff; border: none; padding: 10px 18px; border-radius: 8px; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(230,57,70,0.4);" onclick="window.openRouteModal('${route.name.replace(/'/g, "\\'")}')">
          🗺️ Ver ubicación en el Mapa
        </button>
      </div>

      <div class="pokemon-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
        ${route.encounters.map(e => {
          const mon = data.pokemon.find(p => p.id === e.pid);
          const typeBadges = mon ? mon.types.map(t => getTypeBadgeHtml(t, true)).join(" ") : "";
          const spriteUrl = getSpriteUrl(e.pid, e.pokemon, mon ? mon.slug : null);

          return `
            <div class="pokemon-card" onclick="window.openPokemonModal('${e.pid}')">
              <span class="card-id">${e.rate}</span>
              <img class="card-sprite" src="${spriteUrl}" alt="${e.pokemon}" loading="lazy"
                   onerror="this.onerror=null; this.src='https://play.pokemonshowdown.com/sprites/dex/${(mon ? mon.slug || mon.name : e.pokemon).toLowerCase().replace(/[^a-z0-9\\-]/g, '')}.png';">
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

  // =========================================================================
  // 7. LÍDERES VIEW LOGIC
  // =========================================================================
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
                <span>⭐ <b>${m.pokemon}</b></span>
                <span style="color: var(--gold);">Nv. ${m.level}</span>
              </div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">
                Objeto: <a href="javascript:void(0)" class="link-item" onclick="window.openItemModal('${m.item}')">${m.item}</a>
              </div>
              <div class="member-moves">
                Ataques: ${m.moves.map(mv => `<a href="javascript:void(0)" class="link-move" onclick="window.openMoveModal('${mv}')">${mv}</a>`).join(", ")}
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `).join("");
  }

  // =========================================================================
  // 8. OBJETOS VIEW LOGIC
  // =========================================================================
  function initItemsView() {
    const itemsGrid = document.getElementById("items-grid");
    if (!itemsGrid) return;

    itemsGrid.innerHTML = data.items.map(item => `
      <div class="info-card" style="cursor: pointer;" onclick="window.openItemModal('${item.name}')">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <h3 style="margin-bottom: 4px;">🎒 ${item.name}</h3>
          <span style="font-size:0.75rem; background:var(--bg-input); padding:3px 8px; border-radius:6px; color:var(--primary); font-weight:700;">
            ${item.category}
          </span>
        </div>
        <p style="font-weight: 700; color: var(--gold); font-size: 0.9rem; margin-bottom: 6px;">📍 ${item.location}</p>
        <p style="font-size: 0.85rem; color: var(--text-muted);">${item.desc}</p>
        ${item.evolves && item.evolves.length > 0 ? `<p style="font-size:0.8rem; color:var(--accent); font-weight:700; margin-top:8px;">🧬 Hace evolucionar a ${item.evolves.length} Pokémon (Clic para ver)</p>` : ''}
      </div>
    `).join("");
  }

  // =========================================================================
  // 9. NOVEDADES & NO INCLUIDOS VIEW LOGIC
  // =========================================================================
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

  // =========================================================================
  // 7b. HABILIDADES VIEW LOGIC
  // =========================================================================
  function initAbilitiesView() {
    const grid = document.getElementById("abilities-grid");
    const countEl = document.getElementById("abilities-count");
    const searchInput = document.getElementById("ability-search-input");
    if (!grid || !data.abilities) return;

    function renderAbilities(list) {
      if (countEl) countEl.textContent = `${list.length} de ${data.abilities.length} habilidades`;
      grid.innerHTML = list.map(a => `
        <div class="ability-card" onclick="window.openAbilityModal('${a.name.replace(/'/g, "\\'")}')" title="Ver detalles y Pokémon con ${a.name}">
          <div class="ability-card-header">
            <h4 class="ability-card-name">✨ ${a.name}</h4>
            <span class="ability-card-count">${a.pokemon ? a.pokemon.length : 0} Pokémon</span>
          </div>
          <p class="ability-card-desc">${a.desc}</p>
        </div>
      `).join("");
    }

    renderAbilities(data.abilities);

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) {
          renderAbilities(data.abilities);
          return;
        }
        const filtered = data.abilities.filter(a =>
          a.name.toLowerCase().includes(query) ||
          (a.desc && a.desc.toLowerCase().includes(query))
        );
        renderAbilities(filtered);
      });
    }
  }

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

  // Inicializar vistas
  renderPokemonGrid();
  initRoutesView();
  initLeadersView();
  initItemsView();
  renderMovesTable();
  initFeaturesView();
  initNonIncludedView();
  initAbilitiesView();

  // Comprobar Hash inicial
  handleHash();
});
