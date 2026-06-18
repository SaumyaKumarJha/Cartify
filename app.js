const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
const icons = {
  search:
    '<svg class="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
  bag: '<svg class="icon" viewBox="0 0 24 24"><path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>',
  menu: '<svg class="icon" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  spark:
    '<svg class="icon" viewBox="0 0 24 24"><path d="m12 2 1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2Z"/></svg>',
  leaf: '<svg class="icon" viewBox="0 0 24 24"><path d="M19 4C9 4 5 9 5 15c4 1 11-1 14-11Z"/><path d="M5 20c1-6 5-9 10-12"/></svg>',
  box: '<svg class="icon" viewBox="0 0 24 24"><path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="M4 7v10l8 4 8-4V7M12 11v10"/></svg>',
  sliders:
    '<svg class="icon" viewBox="0 0 24 24"><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></svg>',
  truck:
    '<svg class="icon" viewBox="0 0 24 24"><path d="M3 6h12v11H3zM15 10h4l2 3v4h-6z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg>',
};
$$("[data-icon]").forEach((el) => (el.innerHTML = icons[el.dataset.icon]));

const fallback = [
  {
    id: 101,
    title: "Cloud Knit Sneaker",
    price: 89,
    rating: 4.8,
    category: "mens-shoes",
    thumbnail:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&auto=format&fit=crop",
  },
  {
    id: 102,
    title: "Studio Headphones",
    price: 74,
    rating: 4.6,
    category: "mobile-accessories",
    thumbnail:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&auto=format&fit=crop",
  },
  {
    id: 103,
    title: "Amber Eau de Parfum",
    price: 68,
    rating: 4.7,
    category: "fragrances",
    thumbnail:
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=700&auto=format&fit=crop",
  },
  {
    id: 104,
    title: "Easy Form Chair",
    price: 149,
    rating: 4.5,
    category: "furniture",
    thumbnail:
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=700&auto=format&fit=crop",
  },
  {
    id: 105,
    title: "Field Weekender",
    price: 95,
    rating: 4.9,
    category: "womens-bags",
    thumbnail:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700&auto=format&fit=crop",
  },
  {
    id: 106,
    title: "Drift Table Lamp",
    price: 58,
    rating: 4.4,
    category: "home-decoration",
    thumbnail:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=700&auto=format&fit=crop",
  },
];
let products = [],
  activeCategory = "all",
  visible = 9,
  cart = JSON.parse(localStorage.getItem("morrow-cart") || "[]");
const categoryMap = {
  all: "All",
  beauty: "Beauty",
  fragrances: "Fragrance",
  furniture: "Home",
  "home-decoration": "Objects",
  "kitchen-accessories": "Kitchen",
  laptops: "Tech",
  "mobile-accessories": "Tech",
  "mens-shirts": "Menswear",
  "mens-shoes": "Shoes",
  "womens-bags": "Bags",
  "womens-dresses": "Womenswear",
  "womens-jewellery": "Jewellery",
  "womens-shoes": "Shoes",
  "womens-watches": "Watches",
  "mens-watches": "Watches",
};

function skeletons() {
  $("#productGrid").innerHTML = Array(6)
    .fill(
      '<article class="skeleton-card"><div class="skeleton"></div><div class="skeleton"></div></article>',
    )
    .join("");
}
async function loadProducts() {
  skeletons();
  try {
    let r = await fetch("https://dummyjson.com/products?limit=100");
    if (!r.ok) throw Error();
    let data = await r.json();
    products = data.products.filter((p) => p.price <= 200);
    $("#apiStatus").textContent = "● Live catalog";
  } catch (e) {
    products = fallback;
    $("#apiStatus").textContent = "Curated offline catalog";
  }
  renderTabs();
  render();
}
function renderTabs() {
  let cats = ["all", ...new Set(products.map((p) => p.category))]
    .filter((c) => categoryMap[c])
    .slice(0, 8);
  $("#categoryTabs").innerHTML = cats
    .map(
      (c) =>
        `<button role="tab" aria-selected="${c === activeCategory}" class="${c === activeCategory ? "active" : ""}" data-category="${c}">${categoryMap[c] || c}</button>`,
    )
    .join("");
}
function filtered() {
  let q = $("#searchInput").value.toLowerCase().trim(),
    max = +$("#priceRange").value,
    rating = $("#ratingFilter").checked;
  let list = products.filter(
    (p) =>
      (activeCategory === "all" || p.category === activeCategory) &&
      p.price <= max &&
      (!rating || p.rating >= 4) &&
      (p.title.toLowerCase().includes(q) || p.category.includes(q)),
  );
  let sort = $("#sortSelect").value;
  if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
  if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
  return list;
}
function render() {
  let list = filtered(),
    shown = list.slice(0, visible);
  $("#resultsText").textContent =
    `${list.length} considered ${list.length === 1 ? "piece" : "pieces"}`;
  $("#loadMore").style.display = list.length > visible ? "block" : "none";
  if (!shown.length) {
    $("#productGrid").innerHTML =
      '<div class="empty"><h3>Nothing here — yet.</h3><p>Try loosening your filters or searching for something else.</p></div>';
    return;
  }
  $("#productGrid").innerHTML = shown
    .map(
      (p, i) =>
        `<article class="product-card"><div class="product-image"><img src="${p.thumbnail}" alt="${p.title}" loading="lazy"><span class="product-badge">${i < 2 ? "New" : "Morrow pick"}</span><button class="wish-button" aria-label="Save ${p.title}">♡</button><button class="quick-add" data-add="${p.id}">Quick add +</button></div><div class="product-info"><p class="product-category">${categoryMap[p.category] || p.category.replaceAll("-", " ")}</p><div class="product-title-row"><h3>${p.title}</h3><strong>$${p.price.toFixed(2)}</strong></div><p class="rating"><span>★</span> ${p.rating.toFixed(1)} · ${p.stock || 24} available</p></div></article>`,
    )
    .join("");
}
function updateFilterCount() {
  let n =
    ($("#searchInput").value ? 1 : 0) +
    ($("#priceRange").value < 200 ? 1 : 0) +
    ($("#ratingFilter").checked ? 1 : 0);
  $("#filterCount").textContent = n;
}
function saveCart() {
  localStorage.setItem("morrow-cart", JSON.stringify(cart));
  renderCart();
}
function addToCart(id) {
  let p =
    products.find((x) => x.id === id) || fallback.find((x) => x.id === id);
  if (!p) return;
  let item = cart.find((x) => x.id === id);
  item ? item.qty++ : cart.push({ ...p, qty: 1 });
  saveCart();
  $("#toastProduct").textContent = p.title;
  $("#toast").classList.add("show");
  setTimeout(() => $("#toast").classList.remove("show"), 2200);
}
function renderCart() {
  let count = cart.reduce((a, x) => a + x.qty, 0),
    total = cart.reduce((a, x) => a + x.price * x.qty, 0);
  $("#cartCount").textContent = count;
  $("#drawerCount").textContent = `(${count})`;
  $("#subtotal").textContent = `$${total.toFixed(2)}`;
  $("#shippingBar").style.width = `${Math.min(100, (total / 80) * 100)}%`;
  $("#shippingMessage").textContent =
    total >= 80
      ? "Free shipping unlocked — lovely."
      : `You're $${Math.max(0, 80 - total).toFixed(2)} away from free shipping`;
  $("#cartItems").innerHTML = cart.length
    ? cart
        .map(
          (x) =>
            `<article class="cart-item"><img src="${x.thumbnail}" alt="${x.title}"><div><small>${categoryMap[x.category] || x.category}</small><h4>${x.title}</h4><div class="quantity"><button data-qty="${x.id}" data-delta="-1">−</button><span>${x.qty}</span><button data-qty="${x.id}" data-delta="1">+</button></div></div><div><div class="item-price">$${(x.price * x.qty).toFixed(2)}</div><button class="remove-item" data-remove="${x.id}">Remove</button></div></article>`,
        )
        .join("")
    : '<div class="cart-empty"><span>◌</span><h3>Your bag is beautifully empty.</h3><p>Explore the edit and find something worth keeping.</p></div>';
  $("#cartFooter").style.display = cart.length ? "block" : "none";
}
function openCart() {
  closeFilters();
  $("#cartDrawer").classList.add("open");
  $("#overlay").classList.add("open");
  $("#cartDrawer").setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
}
function closeCart() {
  $("#cartDrawer").classList.remove("open");
  $("#overlay").classList.remove("open");
  $("#cartDrawer").setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
}
function openFilters() {
  $("#filters").classList.add("open");
  $("#overlay").classList.add("open");
  document.body.classList.add("no-scroll");
}
function closeFilters() {
  $("#filters").classList.remove("open");
  if (!$("#cartDrawer").classList.contains("open")) {
    $("#overlay").classList.remove("open");
    document.body.classList.remove("no-scroll");
  }
}
$("#categoryTabs").addEventListener("click", (e) => {
  let b = e.target.closest("[data-category]");
  if (!b) return;
  activeCategory = b.dataset.category;
  visible = 9;
  renderTabs();
  render();
});
$("#productGrid").addEventListener("click", (e) => {
  let add = e.target.closest("[data-add]"),
    wish = e.target.closest(".wish-button");
  if (add) addToCart(+add.dataset.add);
  if (wish) {
    wish.classList.toggle("active");
    wish.textContent = wish.classList.contains("active") ? "♥" : "♡";
  }
});
["input", "change"].forEach((evt) => {
  $("#searchInput").addEventListener(evt, () => {
    visible = 9;
    updateFilterCount();
    render();
  });
  $("#priceRange").addEventListener(evt, () => {
    $("#priceValue").textContent = `Up to $${$("#priceRange").value}`;
    visible = 9;
    updateFilterCount();
    render();
  });
});
$("#ratingFilter").addEventListener("change", () => {
  updateFilterCount();
  render();
});
$("#sortSelect").addEventListener("change", render);
$("#loadMore").onclick = () => {
  visible += 9;
  render();
};
$("#clearFilters").onclick = () => {
  $("#searchInput").value = "";
  $("#priceRange").value = 200;
  $("#priceValue").textContent = "Up to $200";
  $("#ratingFilter").checked = false;
  activeCategory = "all";
  updateFilterCount();
  renderTabs();
  render();
};
$(".cart-button").onclick = openCart;
$("#closeCart").onclick = closeCart;
$("#overlay").onclick = () => {
  closeCart();
  closeFilters();
};
$("#filterButton").onclick = openFilters;
$("#closeFilters").onclick = closeFilters;
$(".search-trigger").onclick = () => {
  $("#shop").scrollIntoView();
  setTimeout(() => $("#searchInput").focus(), 450);
};
$("#cartItems").addEventListener("click", (e) => {
  let q = e.target.closest("[data-qty]"),
    r = e.target.closest("[data-remove]");
  if (q) {
    let item = cart.find((x) => x.id === +q.dataset.qty);
    item.qty += +q.dataset.delta;
    if (item.qty < 1) cart = cart.filter((x) => x.id !== item.id);
    saveCart();
  }
  if (r) {
    cart = cart.filter((x) => x.id !== +r.dataset.remove);
    saveCart();
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeCart();
    closeFilters();
  }
});
renderCart();
loadProducts();
