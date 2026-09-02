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

  let currentPokemonList = [...data.pokemon];

  // Inicialización de Tema Claro/Oscuro
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

  // Helper para Sprites
  function getSpriteUrl(monId, name, slug) {
    if (slug) {
      return `https://play.pokemonshowdown.com/sprites/dex/${slug}.png`;
    }
    const numId = typeof monId === "number" ? monId : parseInt(monId);
    if (numId && numId <= 1025) {
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${numId}.png`;
    }
    const clean = (name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    return `https://play.pokemonshowdown.com/sprites/dex/${clean}.png`;
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
        .map(t => `<span class="type-badge type-${t}">${t}</span>`)
        .join("");

      const spriteUrl = getSpriteUrl(mon.id, mon.name, mon.slug);
      const displayId = typeof mon.id === "number" ? `#${String(mon.id).padStart(3, "0")}` : "Forma";

      card.innerHTML = `
        <span class="card-id">${displayId}</span>
        <img class="card-sprite" src="${spriteUrl}" alt="${mon.name}" loading="lazy" 
             onerror="this.onerror=null; this.src='https://play.pokemonshowdown.com/sprites/dex/${(mon.name||'').toLowerCase().replace(/[^a-z0-9]/g, '')}.png';">
        <div class="card-name">${mon.name}</div>
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
      const typeBadges = mon.types.map(t => `<span class="type-badge type-${t}">${t}</span>`).join("");
      const spriteUrl = getSpriteUrl(mon.id, mon.name, mon.slug);
      const displayId = typeof mon.id === "number" ? `#${String(mon.id).padStart(3, "0")}` : "Forma";

      card.innerHTML = `
        <span class="card-id">${displayId}</span>
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

    // Construcción del diagrama de flujo de evolución completo
    let evoHtml = renderEvolutionFlow(mon);

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

    // Ataques por nivel interactivos
    let learnsetHtml = `<p style="color: var(--text-muted);">Sin ataques por nivel registrados.</p>`;
    if (mon.learnset && mon.learnset.length > 0) {
      learnsetHtml = `
        <div class="learnset-table-wrapper">
          <table class="learnset-table">
            <thead>
              <tr>
                <th>Nivel</th>
                <th>Movimiento (Clic para info)</th>
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
                  <td>
                    <a href="javascript:void(0)" class="link-move" onclick="window.openMoveModal(${m.id})">
                      ${m.name} 🔍
                    </a>
                  </td>
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
          <span class="modal-id">${displayId}</span>
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
            if (step.item) {
              reqText = reqText.replace(
                step.item,
                `<a href="javascript:void(0)" class="link-item" onclick="window.openItemModal('${step.item}')">${step.item} 🎒</a>`
              );
            }
            if (step.move) {
              const moveObj = data.moves.find(m => m.name.toLowerCase() === step.move.toLowerCase());
              const moveParam = moveObj ? moveObj.id : `'${step.move}'`;
              reqText = reqText.replace(
                step.move,
                `<a href="javascript:void(0)" class="link-move" onclick="window.openMoveModal(${moveParam})">${step.move} ⚔️</a>`
              );
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
            .map(t => `<span class="type-badge type-${t}" style="font-size:0.65rem; padding:1px 6px;">${t}</span>`)
            .join(" ");

          html += `
            <div class="evo-node ${isCurrent ? "current-mon" : ""}" onclick="window.openPokemonModal('${step.id}')">
              <img class="evo-node-sprite" src="${spriteUrl}" alt="${step.name}">
              <span class="evo-node-name">${step.name}</span>
              <div style="margin-top: 4px;">${typeBadges}</div>
              ${isCurrent ? '<span style="font-size: 0.65rem; color: var(--gold); font-weight: 800; margin-top:2px;">(Actual)</span>' : ''}
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
          <div style="display:flex; gap: 8px; margin-bottom: 6px;">
            <span class="type-badge type-${move.type}">${move.type}</span>
            <span class="cat-badge cat-${move.category}">${move.category}</span>
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
            <div><b>Categoría:</b> <span style="font-weight:700;">${move.category}</span></div>
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

  // Escape key closes open modals
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (moveModalOverlay.classList.contains("active")) closeMoveModal();
      else if (itemModalOverlay.classList.contains("active")) closeItemModal();
      else if (modalOverlay.classList.contains("active")) closeModal();
    }
  });

  // Exponer a nivel de ventana para llamadas onclick
  window.openPokemonModal = openPokemonModal;
  window.openItemModal = openItemModal;
  window.openMoveModal = openMoveModal;

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

    // Renderizar primeros 100
    movesTableBody.innerHTML = filtered.slice(0, 100).map(m => `
      <tr>
        <td>
          <a href="javascript:void(0)" class="link-move" onclick="window.openMoveModal(${m.id})">
            <b>${m.name}</b> 🔍
          </a>
        </td>
        <td><span class="type-badge type-${m.type}">${m.type}</span></td>
        <td><span class="cat-badge cat-${m.category}">${m.category}</span></td>
        <td style="font-weight:700;">${m.power > 0 ? m.power : "—"}</td>
        <td>${m.accuracy > 0 ? m.accuracy + "%" : "—"}</td>
        <td>${m.pp}</td>
        <td style="font-size:0.85rem; color:var(--text-muted); max-width:300px;">${m.desc}</td>
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
      <div style="border-bottom: 2px solid var(--border); padding-bottom: 12px; margin-bottom: 20px;">
        <span style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; color: var(--gold); font-weight: 700;">${route.region}</span>
        <h2 style="font-size: 1.6rem; font-weight: 800;">📍 ${route.name}</h2>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Encuentros salvajes registrados con horarios y porcentajes exactos de aparición.</p>
      </div>

      <div class="pokemon-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
        ${route.encounters.map(e => {
          const mon = data.pokemon.find(p => p.id === e.pid);
          const typeBadges = mon ? mon.types.map(t => `<span class="type-badge type-${t}">${t}</span>`).join(" ") : "";
          const spriteUrl = getSpriteUrl(e.pid, e.pokemon, mon ? mon.slug : null);

          return `
            <div class="pokemon-card" onclick="window.openPokemonModal('${e.pid}')">
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

  // Comprobar Hash inicial
  handleHash();
});
