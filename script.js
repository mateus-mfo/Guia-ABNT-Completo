/* Base de Conhecimento ABNT - script.js
   - Features:
     * Carrega data.json (MODEL 2)
     * Busca ao digitar
     * Filtro por select
     * Menu lateral funcional (filtro por universidade)
     * Responsivo (abre/fecha sidebar)
*/

/* --- CONFIG --- */
// Por padrão busca no arquivo relativo data.json (na mesma pasta).
// Se você quiser usar o arquivo que foi carregado no ambiente (path do upload),
// altere para: const DATA_URL = "/mnt/data/data.json";
const DATA_URL = "data.json";

/* DOM */
const searchBox = document.getElementById("searchBox");
const filterCategoria = document.getElementById("filterCategoria");
const cardsContainer = document.getElementById("cards-container");

let dados = [];  // carregados do JSON

// sidebar controls
const sidebar = document.getElementById("sidebar");
const main = document.getElementById("main");
const toggleSidebarBtn = document.getElementById("toggleSidebar");
const closeSidebarBtn = document.getElementById("closeSidebar");
const sidebarButtons = document.querySelectorAll(".sidebar-item");
const btnShowAll = document.getElementById("btn-show-all");

/* Fetch data e init */
async function init() {
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error("Falha ao carregar data.json — status " + res.status);
    dados = await res.json();
  } catch (err){
    console.error(err);
    cardsContainer.innerHTML = `<div class="col-12"><div class="alert alert-danger">Não foi possível carregar os dados. Verifique <code>${DATA_URL}</code></div></div>`;
    return;
  }

  populateCategoryFilter();
  renderCards(dados);
  attachEvents();
}

/* Popula select de categorias dinamicamente */
function populateCategoryFilter(){
  const cats = Array.from(new Set(dados.map(i => i.categoria))).sort();
  cats.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c.toUpperCase();
    filterCategoria.appendChild(opt);
  });
}

/* Render cards */
function renderCards(list){
  if(!Array.isArray(list)) list = [];
  if(list.length === 0){
    cardsContainer.innerHTML = `<div class="col-12"><div class="text-center text-muted py-5">Nenhum resultado.</div></div>`;
    return;
  }

  cardsContainer.innerHTML = list.map(item => {
    return `
      <div class="col-md-6 col-lg-4">
        <article class="card" role="article" tabindex="0" aria-label="${item.nome}">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <span class="badge bg-primary">${item.categoria.toUpperCase()}</span>
            <small class="text-muted">${item.data_criacao || ""}</small>
          </div>

          <h5 class="mb-2">${item.nome}</h5>
          <p class="text-muted mb-3">${item.descricao}</p>

          <div class="exemplo-box mb-3"><strong>Exemplo:</strong><br>${item.exemplo}</div>

          <div class="d-grid">
            <a class="btn btn-outline-primary" href="${item.link || "#"}" target="_blank" rel="noopener">Abrir referência</a>
          </div>
        </article>
      </div>
    `;
  }).join("\n");
}

/* Aplicar filtros (busca + categoria) */
function applyFilters(){
  const q = (searchBox.value || "").toLowerCase().trim();
  const cat = (filterCategoria.value || "").trim();

  const filtered = dados.filter(i => {
    const inText = (i.nome + " " + i.descricao + " " + (i.tags || []).join(" ")).toLowerCase();
    const matchesText = q === "" || inText.includes(q);
    const matchesCat = cat === "" || i.categoria === cat;
    return matchesText && matchesCat;
  });

  renderCards(filtered);
}

/* Sidebar filtering by data-filter attribute */
function sidebarFilter(category){
  // remove active state
  sidebarButtons.forEach(b => b.classList.remove("active"));
  // find clicked and activate
  const target = Array.from(sidebarButtons).find(b => b.getAttribute("data-filter") === category);
  if(target) target.classList.add("active");

  // set select to category (so select and sidebar are in sync)
  filterCategoria.value = category;

  // apply
  applyFilters();

  // close sidebar on mobile
  if(window.innerWidth <= 992){
    sidebar.classList.remove("open");
    main.classList.remove("shifted");
    sidebar.classList.add("closed");
  }
}

/* Event listeners */
function attachEvents(){
  // search & select
  searchBox.addEventListener("input", applyFilters);
  filterCategoria.addEventListener("change", applyFilters);

  // menu toggle
  toggleSidebarBtn.addEventListener("click", ()=>{
    sidebar.classList.toggle("open");
    sidebar.classList.toggle("closed");
  });
  closeSidebarBtn.addEventListener("click", ()=>{
    sidebar.classList.add("closed");
  });

  // sidebar filter buttons
  sidebarButtons.forEach(btn=>{
    btn.addEventListener("click", (e)=>{
      const cat = btn.getAttribute("data-filter");
      sidebarFilter(cat);
    });
  });

  // show all
  if(btnShowAll){
    btnShowAll.addEventListener("click", ()=>{
      filterCategoria.value = "";
      sidebarButtons.forEach(b => b.classList.remove("active"));
      renderCards(dados);
    });
  }

  // keyboard accessibility: enter on a card opens link
  cardsContainer.addEventListener("keydown", (e)=>{
    const card = e.target.closest("article");
    if(!card) return;
    if(e.key === "Enter"){
      const link = card.querySelector("a.btn");
      if(link) link.click();
    }
  });
}

/* Start */
init();
