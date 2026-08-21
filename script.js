/* ========= Data =========
   Replace image filenames with your local images in /images/ or uploaded paths.
   I used the images that you might already have; change paths if needed.
========================== */
const products = [
  { id: 1, name: "Gulab Jamun", price: 120, img: "gulab.jpg", desc: "Soft, juicy gulab jamun soaked in saffron syrup." },
  { id: 2, name: "Barfi", price: 250, img: "barfi.jpg", desc: "Creamy barfi made with pure milk and ghee." },
  { id: 3, name: "Laddu", price: 180, img: "laddu.jpg", desc: "Traditional laddus made from premium besan and ghee." },
  { id: 4, name: "Kaju Katli", price: 400, img: "abc.jpg", desc: "Rich cashew fudge, thin and delightful." },
  { id: 5, name: "Peda", price: 160, img: "peda.jpg", desc: "Soft peda with cardamom fragrance." },
  { id: 6, name: "Soan Papdi", price: 140, img: "soan.jpg", desc: "Flaky melt-in-mouth soan papdi." }

  

  
];

// If you have uploaded images at /mnt/data, use those as fallbacks for hero or cards
const uploadedHero = "/mnt/data/reciepi 2.png";

/* ========= DOM Refs ========= */
const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const exploreBtn = document.getElementById("exploreBtn");
const cartBtn = document.getElementById("cartBtn");
const cartDrawer = document.getElementById("cartDrawer");
const closeCart = document.getElementById("closeCart");
const cartItemsEl = document.getElementById("cartItems");
const cartCountEl = document.getElementById("cart-count");
const cartTotalEl = document.getElementById("cartTotal");
const toastContainer = document.getElementById("toastContainer");
const themeToggle = document.getElementById("themeToggle");

/* ========= State ========= */
let cart = [];

/* ========= Utils ========= */
function money(x){ return `₹${x}`; }
function showToast(message){
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = message;
  toastContainer.appendChild(t);
  setTimeout(()=> t.remove(), 2200);
}

/* ========= Render Products ========= */
function renderProducts(list){
  productGrid.innerHTML = "";
  list.forEach(p=>{
    const card = document.createElement("div");
    card.className = "card item";
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src='images/placeholder.jpg'">
      <h3>${p.name}</h3>
      <p>${p.desc}</p>
      <div class="card-actions">
        <button class="btn-small view-btn" data-id="${p.id}">Details</button>
        <button class="btn-small add-btn" data-id="${p.id}">Add • ${money(p.price)}</button>
      </div>
    `;
    productGrid.appendChild(card);
  });

  // Attach actions
  document.querySelectorAll(".add-btn").forEach(b=>{
    b.addEventListener("click", (e)=>{
      const id = +e.currentTarget.dataset.id;
      const prod = products.find(x=>x.id===id);
      addToCart(prod);
    });
  });

  document.querySelectorAll(".view-btn").forEach(b=>{
    b.addEventListener("click", (e)=>{
      const id = +e.currentTarget.dataset.id;
      const prod = products.find(x=>x.id===id);
      openModal(prod);
    });
  });

  // reveal animation
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{
      if(en.isIntersecting) en.target.classList.add("show");
    });
  }, {threshold:0.12});
  document.querySelectorAll(".item").forEach(i=> obs.observe(i));
}

/* ========= Search ========= */
searchInput?.addEventListener("input", e=>{
  const q = e.target.value.toLowerCase().trim();
  const filtered = products.filter(p => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
  renderProducts(filtered);
});

/* ========= Explore button ========= */
exploreBtn?.addEventListener("click", ()=> {
  document.querySelector(".products-section").scrollIntoView({behavior:"smooth"});
});

/* ========= Cart ========= */
function addToCart(product){
  const existing = cart.find(i=>i.id===product.id);
  if(existing) existing.qty++;
  else cart.push({ ...product, qty: 1 });
  updateCartUI();
  showToast(`${product.name} added to cart`);
}

function removeFromCart(id){
  cart = cart.filter(i=>i.id !== id);
  updateCartUI();
}

function changeQty(id, delta){
  const it = cart.find(i=>i.id===id);
  if(!it) return;
  it.qty += delta;
  if(it.qty <= 0) removeFromCart(id);
  updateCartUI();
}

function updateCartUI(){
  cartItemsEl.innerHTML = "";
  let total = 0;
  cart.forEach(i=>{
    total += i.qty * i.price;
    const node = document.createElement("div");
    node.className = "cart-item";
    node.innerHTML = `
      <img src="${i.img}" alt="${i.name}" onerror="this.onerror=null;this.src='images/placeholder.jpg'">
      <div style="flex:1;">
        <strong>${i.name}</strong>
        <div style="color:var(--muted); font-size:13px; margin-top:6px;">${money(i.price)} × ${i.qty}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end;">
        <button class="small" data-id="${i.id}" data-op="inc">+</button>
        <button class="small" data-id="${i.id}" data-op="dec">−</button>
        <button class="small remove" data-id="${i.id}">Remove</button>
      </div>
    `;
    cartItemsEl.appendChild(node);
  });

  cartCountEl.innerText = cart.reduce((s,i)=>s+i.qty,0);
  cartTotalEl.innerText = money(total);

  // attach cart buttons
  cartItemsEl.querySelectorAll(".small").forEach(btn=>{
    btn.addEventListener("click", (e)=>{
      const id = +e.currentTarget.dataset.id;
      const op = e.currentTarget.dataset.op;
      if(op === "inc") changeQty(id, 1);
      else if(op === "dec") changeQty(id, -1);
    });
  });
  cartItemsEl.querySelectorAll(".remove").forEach(btn=>{
    btn.addEventListener("click", (e)=> removeFromCart(+e.currentTarget.dataset.id));
  });
}

/* open/close drawer */
cartBtn?.addEventListener("click", ()=> {
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
});
closeCart?.addEventListener("click", ()=> {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
});

/* Checkout */
document.getElementById("checkoutBtn")?.addEventListener("click", ()=>{
  if(cart.length === 0) { showToast("Cart is empty"); return; }
  showToast("Checkout not implemented in prototype");
});

/* ========= Modal (product details) ========= */
const modal = document.getElementById("productModal");
const modalImg = document.getElementById("modalImg");
const modalName = document.getElementById("modalName");
const modalDesc = document.getElementById("modalDesc");
const modalAdd = document.getElementById("modalAdd");
let modalCurrent = null;

function openModal(prod){
  modalCurrent = prod;
  modalImg.src = prod.img || uploadedHero;
  modalName.textContent = prod.name;
  modalDesc.textContent = prod.desc + ` • Price: ${money(prod.price)}`;
  modal.classList.add("show");
  modal.setAttribute("aria-hidden","false");
}

document.getElementById("closeModal")?.addEventListener("click", ()=> {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden","true");
});
window.addEventListener("click", (e)=>{
  if(e.target === modal) {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden","true");
  }
});
modalAdd?.addEventListener("click", ()=> {
  if(modalCurrent) addToCart(modalCurrent);
  modal.classList.remove("show");
});

/* ========= Theme Toggle ========= */
themeToggle?.addEventListener("click", ()=>{
  document.documentElement.classList.toggle("dark");
  const isDark = document.documentElement.classList.contains("dark");
  themeToggle.textContent = isDark ? "☀️" : "🌙";
  // simple dark theme override
  if(isDark) {
    document.documentElement.style.setProperty('--bg','#0f1724');
    document.documentElement.style.setProperty('--card','#071122');
    document.documentElement.style.setProperty('--muted','rgba(255,255,255,0.7)');
  } else {
    document.documentElement.style.removeProperty('--bg');
    document.documentElement.style.removeProperty('--card');
    document.documentElement.style.removeProperty('--muted');
  }
});

/* ========= Keep recipe toggle working (original content) ========= */
document.querySelectorAll(".toggle-details").forEach(btn=>{
  btn.addEventListener("click", (e)=>{
    const art = e.currentTarget.closest(".recipe");
    art.classList.toggle("open");
    e.currentTarget.textContent = art.classList.contains("open") ? "Hide" : "Show";
  });
});

/* ========= Init ========= */
renderProducts(products);
updateCartUI();


