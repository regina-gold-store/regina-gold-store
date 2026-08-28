const $ = (selector) => document.querySelector(selector);
const money = (value) => new Intl.NumberFormat('ar-EG', {
  style: 'currency',
  currency: 'EGP',
  maximumFractionDigits: 0
}).format(Number(value || 0));

const DEFAULT_STORE = {
  storeName: 'Regina Gold',
  phone: '01070530886',
  address: 'مصر الجديدة - شارع التسعين - القاهرة',
  mapEmbed: 'https://www.google.com/maps?q=%D9%85%D8%B5%D8%B1%20%D8%A7%D9%84%D8%AC%D8%AF%D9%8A%D8%AF%D8%A9%20%D8%B4%D8%A7%D8%B1%D8%B9%20%D8%A7%D9%84%D8%AA%D8%B3%D8%B9%D9%8A%D9%86%20%D8%A7%D9%84%D8%AA%D8%B3%D8%B9%D9%8A%D9%86&output=embed',
  mapLink: 'https://maps.google.com/?q=%D9%85%D8%B5%D8%B1+%D8%A7%D9%84%D8%AC%D8%AF%D9%8A%D8%AF%D8%A9+%D8%B4%D8%A7%D8%B1%D8%B9+%D8%A7%D9%84%D8%AA%D8%B3%D8%B9%D9%8A%D9%86+%D8%A7%D9%84%D8%AA%D8%B3%D8%B9%D9%8A%D9%86'
};
const FALLBACK_IMAGE = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#f9f2df"/>
        <stop offset="100%" stop-color="#e2c77d"/>
      </linearGradient>
    </defs>
    <rect width="800" height="800" fill="#f8f3ea"/>
    <rect x="40" y="40" width="720" height="720" rx="40" fill="url(#g)" opacity="0.22"/>
    <circle cx="400" cy="310" r="120" fill="#d4af5d" opacity="0.22"/>
    <text x="50%" y="46%" text-anchor="middle" font-family="Tahoma, Arial, sans-serif" font-size="68" font-weight="700" fill="#7b5b1d">REGINA</text>
    <text x="50%" y="58%" text-anchor="middle" font-family="Tahoma, Arial, sans-serif" font-size="96" font-weight="700" fill="#a77b1d">GOLD</text>
    <text x="50%" y="74%" text-anchor="middle" font-family="Tahoma, Arial, sans-serif" font-size="28" letter-spacing="4" fill="#7b5b1d">الذهب الراقـي</text>
  </svg>
`);
const productsSyncChannelName = 'regina-products-sync';

let all = [];
let cart = [];
let storeConfig = { ...DEFAULT_STORE };
let currentCategories = [];

function normalizeCatalog(list) {
  const arr = Array.isArray(list) ? list : [];
  return arr.map(normalizeProduct).filter((product) => product && product.name);
}

function formatDisplayValue(raw, kind) {
  if (raw === null || raw === undefined || raw === '') return '';
  const text = String(raw).trim();
  if (!text) return '';
  if (/(عيار|غ|جرام|جم|gram|g|kg|كجم|متر|سم)/i.test(text)) return text;
  if (kind === 'carat' && /^\d+(\.\d+)?$/.test(text)) return `عيار ${text}`;
  if (kind === 'weight' && /^\d+(\.\d+)?$/.test(text)) return `وزن ${text} غ`;
  return text;
}

const DEFAULT_PRODUCTS = [
  {
    id: 'rings-101',
    name: 'خاتم ذهبي فاخر',
    category: 'rings',
    carat: 'عيار 21',
    price: 6400,
    salePrice: 5200,
    saleEnds: '2099-12-31',
    manufacturing: 2024,
    weight: '4.8 غ',
    availability: 'متوفر',
    shipping: 'متوفر شحن',
    pickup: 'استلام من الفرع',
    description: 'خاتم ذهبي أنيق مصمم بلمسة عصرية مع تفاصيل دقيقة وتجهيز ممتاز.',
    image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=900&q=80',
    images: ['https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=900&q=80']
  },
  {
    id: 'necklaces-202',
    name: 'سلسلة ذهبية كلاسيكية',
    category: 'necklaces',
    carat: 'عيار 18',
    price: 9200,
    salePrice: 7600,
    saleEnds: '2099-12-31',
    manufacturing: 2025,
    weight: '9.2 غ',
    availability: 'متوفر',
    shipping: 'متوفر شحن',
    pickup: 'استلام من الفرع',
    description: 'سلسلة ذهبية أنيقة مناسبة للملابس الرسمية والفساتين الراقية.',
    image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80',
    images: ['https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80']
  },
  {
    id: 'bracelets-303',
    name: 'إسورة ذهبية أنيقة',
    category: 'bracelets',
    carat: 'عيار 24',
    price: 7800,
    salePrice: 6500,
    saleEnds: '2099-12-31',
    manufacturing: 2024,
    weight: '7.1 غ',
    availability: 'متوفر',
    shipping: 'توصيل سريع',
    pickup: 'استلام من الفرع',
    description: 'إسورة ذهبية خفيفة ومريحة مع تصميم فخّم يناسب كل المناسبات.',
    image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=80',
    images: ['https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=80']
  }
];

function hasRemoteProductAssets(products) {
  if (!Array.isArray(products) || !products.length) return false;
  return products.some((product) => {
    const images = Array.isArray(product.images) ? product.images : [];
    const image = product.image || '';
    return [image, ...images].some((src) => typeof src === 'string' && /^https?:\/\//i.test(src));
  });
}

function normalizeProduct(product = {}) {
  return {
    ...product,
    name: product.name || 'منتج',
    carat: product.carat || 'عيار 24',
    price: Number(product.price || 0),
    salePrice: product.salePrice === '' || product.salePrice === null || typeof product.salePrice === 'undefined'
      ? ''
      : Number(product.salePrice),
    availability: product.availability || 'متوفر',
    shipping: product.shipping || 'متوفر شحن',
    pickup: product.pickup || 'استلام من الفرع',
    description: product.description || 'لا يوجد وصف مضاف لهذا المنتج بعد.'
  };
}

function loadSavedProducts() {
  return [];
}

function loadSavedCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem('reginaCart') || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

cart = loadSavedCart();

function saveCart() {
  localStorage.setItem('reginaCart', JSON.stringify(cart));
  const count = cart.reduce((sum, item) => sum + (Number(item.qty) || 1), 0);
  const cartCount = $('#cartCount');
  if (cartCount) cartCount.textContent = String(count);
}

function productImages(product) {
  const normalized = normalizeProduct(product);
  const sources = Array.isArray(normalized.images) && normalized.images.length
    ? normalized.images
    : [normalized.image].filter(Boolean);
  return sources.length ? sources.filter(Boolean) : [FALLBACK_IMAGE];
}

function salePrice(product) {
  const normalized = normalizeProduct(product);
  const price = Number(normalized.price || 0);
  const sale = Number(normalized.salePrice || 0);
  const active = !normalized.saleEnds || new Date(normalized.saleEnds) > new Date();
  return active && sale > 0 && sale < price ? sale : price;
}

function normalizeStoreConfig(data) {
  return { ...DEFAULT_STORE, ...(data || {}) };
}

function applyStoreConfig(data) {
  storeConfig = normalizeStoreConfig(data);
  const addressNode = $('#storeAddress');
  if (addressNode) addressNode.textContent = storeConfig.address;

  const mapEl = $('#storeMap');
  if (mapEl) {
    mapEl.src = storeConfig.mapEmbed || DEFAULT_STORE.mapEmbed;
  }
}

async function initStoreConfig() {
  try {
    const local = localStorage.getItem('reginaStoreConfig');
    if (local) {
      applyStoreConfig(JSON.parse(local));
    }
  } catch {
    // ignore invalid local config
  }

  try {
    const response = await fetch('assets/data/store-config.json', { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      applyStoreConfig(data);
      localStorage.setItem('reginaStoreConfig', JSON.stringify(data));
    }
  } catch {
    // fallback to local/default config
  }
}

function syncThemeButton() {
  const themeButton = $('#theme');
  if (!themeButton) return;
  const icon = themeButton.querySelector('i');
  if (!icon) return;
  icon.className = document.body.classList.contains('light') ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

function loadTheme() {
  const theme = localStorage.getItem('reginaTheme');
  const isLight = theme === 'light';
  document.body.classList.toggle('light', isLight);
  syncThemeButton();
}

function renderCategories(categories) {
  const container = $('#categories');
  if (!container) return;

  currentCategories = Array.isArray(categories) ? categories : [];
  const icons = ['fa-solid fa-ring', 'fa-solid fa-link', 'fa-solid fa-gem', 'fa-regular fa-gem', 'fa-solid fa-layer-group', 'fa-solid fa-star', 'fa-solid fa-bars-staggered', 'fa-solid fa-coins', 'fa-solid fa-heart', 'fa-regular fa-clock'];

  const populatedCategories = currentCategories.filter((category) => {
    return all.some((product) => product.category === category.id);
  });

  const newestCategoryOrder = [...new Set(all
    .slice()
    .reverse()
    .map((product) => product.category)
    .filter(Boolean))];

  populatedCategories.sort((a, b) => {
    const indexA = newestCategoryOrder.indexOf(a.id);
    const indexB = newestCategoryOrder.indexOf(b.id);
    return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
  });

  container.innerHTML = populatedCategories.map((category, index) => {
    const categoryProducts = all.filter((product) => product.category === category.id);
    const count = categoryProducts.length;
    const items = categoryProducts.slice(0, 6);

    return `
      <section class="category-section reveal" data-cat-block="${category.id}">
        <div class="category-header">
          <div class="category-title-wrap">
            <span class="icon"><i class="${icons[index] || 'fa-solid fa-gem'}"></i></span>
            <div>
              <h3>${category.name}</h3>
              <small>${count} قطعة</small>
            </div>
          </div>
          <button class="btn ghost small-btn" type="button" data-cat-more="${category.id}">عرض المزيد</button>
        </div>
        <div class="category-rail-wrap">
          <button class="rail-button" type="button" data-scroll-dir="left" data-cat-track="${category.id}" aria-label="السابق">‹</button>
          <div class="category-rail" data-rail="${category.id}">
            ${items.length ? items.map((product) => {
              const images = productImages(product);
              const price = salePrice(product);
              return `
                <article class="mini-product" data-detail="${product.id}" title="${product.name}">
                  <img src="${images[0] || FALLBACK_IMAGE}" alt="${product.name}" loading="lazy" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}';">
                  <div class="mini-product-body">
                    <h4>${product.name}</h4>
                    <p>${money(price)}</p>
                  </div>
                </article>
              `;
            }).join('') : '<div class="empty-mini">لا توجد منتجات حالياً</div>'}
          </div>
          <button class="rail-button" type="button" data-scroll-dir="right" data-cat-track="${category.id}" aria-label="التالي">›</button>
        </div>
      </section>
    `;
  }).join('');

  document.querySelectorAll('[data-cat-more]').forEach((button) => {
    button.onclick = () => {
      const categoryId = button.dataset.catMore;
      window.location.href = `category.html?cat=${encodeURIComponent(categoryId)}`;
    };
  });

  document.querySelectorAll('[data-scroll-dir]').forEach((button) => {
    button.onclick = () => {
      const rail = document.querySelector(`[data-rail="${button.dataset.catTrack}"]`);
      if (!rail) return;
      const dir = button.dataset.scrollDir === 'right' ? 1 : -1;
      rail.scrollBy({ left: dir * 260, behavior: 'smooth' });
    };
  });

  document.querySelectorAll('.mini-product').forEach((card) => {
    card.onclick = () => showDetail(all.find((product) => product.id === card.dataset.detail));
  });
}

function renderProducts(items) {
  const productsRoot = $('#products');
  if (!productsRoot) return;

  if (!items.length) {
    productsRoot.innerHTML = '<div class="empty">لا توجد قطع مطابقة للبحث.</div>';
    return;
  }

  productsRoot.innerHTML = items.map((product) => {
    const normalized = normalizeProduct(product);
    const images = productImages(normalized);
    const price = salePrice(normalized);
    const oldPrice = Number(normalized.price || 0) > Number(price || 0) ? money(normalized.price) : '';

    return `
      <article class="card reveal" data-detail="${normalized.id}">
        <img src="${images[0] || FALLBACK_IMAGE}" alt="${normalized.name}" loading="lazy" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}';">
        <div class="card-body">
          <div class="tags">
            <span class="tag">${formatDisplayValue(normalized.carat, 'carat') || 'عيار 24'}</span>
            <span class="tag">${normalized.availability || 'متوفر'}</span>
            <span class="tag">${normalized.shipping || 'متوفر شحن'}</span>
          </div>
          <h3>${normalized.name}</h3>
          <p class="desc">${normalized.description || 'لا يوجد وصف مضاف لهذا المنتج بعد.'}</p>
          <div class="price">
            ${money(price)}
            ${oldPrice ? `<span class="old-price">${oldPrice}</span>` : ''}
          </div>
          <div class="card-actions">
            <button class="btn add" data-id="${normalized.id}" type="button">أضف للسلة</button>
            <button class="btn ghost buy" data-id="${normalized.id}" type="button">شراء مباشر</button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  document.querySelectorAll('.add').forEach((button) => {
    button.onclick = (event) => {
      event.stopPropagation();
      addToCart(button.dataset.id);
    };
  });

  document.querySelectorAll('.buy').forEach((button) => {
    button.onclick = (event) => {
      event.stopPropagation();
      const product = all.find((item) => item.id === button.dataset.id);
      if (product) openOrder([product]);
    };
  });

  document.querySelectorAll('[data-detail]').forEach((card) => {
    card.onclick = () => showDetail(all.find((product) => product.id === card.dataset.detail));
  });
}

function renderCategoryPage() {
  const grid = $('#categoryProducts');
  const pageTitle = $('#categoryPageTitle');
  if (!grid || !pageTitle) return;

  const params = new URLSearchParams(window.location.search);
  const categoryId = params.get('cat') || '';
  const category = currentCategories.find((item) => item.id === categoryId) || { name: 'الفئة' };
  const items = all.filter((product) => product.category === categoryId);

  pageTitle.textContent = category.name;
  if (!items.length) {
    grid.innerHTML = '<div class="empty">لا توجد منتجات في هذه الفئة حالياً.</div>';
    return;
  }

  grid.innerHTML = items.map((product) => {
    const normalized = normalizeProduct(product);
    const images = productImages(normalized);
    const price = salePrice(normalized);
    const oldPrice = Number(normalized.price || 0) > Number(price || 0) ? money(normalized.price) : '';

    return `
      <article class="card reveal" data-detail="${normalized.id}">
        <img src="${images[0] || FALLBACK_IMAGE}" alt="${normalized.name}" loading="lazy" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}';">
        <div class="card-body">
          <div class="tags">
            <span class="tag">${formatDisplayValue(normalized.carat, 'carat') || 'عيار 24'}</span>
            <span class="tag">${normalized.availability || 'متوفر'}</span>
            <span class="tag">${normalized.shipping || 'متوفر شحن'}</span>
          </div>
          <h3>${normalized.name}</h3>
          <p class="desc">${normalized.description || 'لا يوجد وصف مضاف لهذا المنتج بعد.'}</p>
          <div class="price">
            ${money(price)}
            ${oldPrice ? `<span class="old-price">${oldPrice}</span>` : ''}
          </div>
          <div class="card-actions">
            <button class="btn add" data-id="${normalized.id}" type="button">أضف للسلة</button>
            <button class="btn ghost buy" data-id="${normalized.id}" type="button">شراء مباشر</button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  document.querySelectorAll('.add').forEach((button) => {
    button.onclick = (event) => {
      event.stopPropagation();
      addToCart(button.dataset.id);
    };
  });

  document.querySelectorAll('.buy').forEach((button) => {
    button.onclick = (event) => {
      event.stopPropagation();
      const product = all.find((item) => item.id === button.dataset.id);
      if (product) openOrder([product]);
    };
  });

  document.querySelectorAll('[data-detail]').forEach((card) => {
    card.onclick = () => showDetail(all.find((product) => product.id === card.dataset.detail));
  });
}

function updateSearchSuggestions() {
  const searchInput = $('#search');
  const suggestionsBox = $('#searchSuggestions');
  if (!searchInput || !suggestionsBox) return;

  const term = searchInput.value.trim().toLowerCase();
  if (!term) {
    suggestionsBox.innerHTML = '';
    suggestionsBox.classList.remove('show');
    return;
  }

  const matches = all.filter((product) => {
    const haystack = `${product.name || ''} ${product.description || ''}`.toLowerCase();
    return haystack.includes(term);
  }).slice(0, 6);

  if (!matches.length) {
    suggestionsBox.innerHTML = '<div class="suggestion-empty">لا توجد نتائج</div>';
    suggestionsBox.classList.add('show');
    return;
  }

  suggestionsBox.innerHTML = matches.map((product) => `
    <button type="button" class="search-suggestion" data-product-id="${product.id}">
      ${product.name}
    </button>
  `).join('');
  suggestionsBox.classList.add('show');

  suggestionsBox.querySelectorAll('.search-suggestion').forEach((button) => {
    button.onclick = () => {
      const selected = all.find((item) => item.id === button.dataset.productId);
      if (selected) {
        showDetail(selected);
        searchInput.value = selected.name;
        suggestionsBox.classList.remove('show');
      }
    };
  });
}

function filterProducts() {
  const search = $('#search')?.value.toLowerCase() || '';

  let filtered = all.filter((product) => {
    const text = `${product.name || ''} ${product.description || ''}`.toLowerCase();
    return text.includes(search);
  });

  const resultText = $('#resultText');
  if (resultText) resultText.textContent = `${filtered.length} قطعة متاحة`;

  if ($('#products')) {
    renderProducts(filtered);
  }
  updateSearchSuggestions();
}

function addToCart(id) {
  const product = all.find((item) => item.id === id);
  if (!product) return;

  const existing = cart.find((item) => item.id === id);
  if (existing) {
    existing.qty = (Number(existing.qty) || 1) + 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  renderCart();
}

function renderCart() {
  saveCart();
  const cartItems = $('#cartItems');
  const totalText = $('#total');

  if (!cartItems || !totalText) return;

  if (!cart.length) {
    cartItems.innerHTML = '<p>السلة فارغة.</p>';
    totalText.textContent = 'الإجمالي: 0 ج.م';
    return;
  }

  cartItems.innerHTML = cart.map((item) => `
    <div class="cart-row">
      <div>
        <strong>${item.name}</strong>
        <div class="cart-quantity">
          <button type="button" data-qty="${item.id}" data-delta="-1">−</button>
          <span>${item.qty || 1}</span>
          <button type="button" data-qty="${item.id}" data-delta="1">+</button>
        </div>
      </div>
      <span>${money((salePrice(item) || 0) * (item.qty || 1))}</span>
    </div>
  `).join('');

  const subtotal = cart.reduce((sum, item) => sum + (salePrice(item) * (item.qty || 1)), 0);
  totalText.textContent = `الإجمالي: ${money(subtotal)}`;

  document.querySelectorAll('[data-qty]').forEach((button) => {
    button.onclick = () => {
      const id = button.dataset.qty;
      const delta = Number(button.dataset.delta || 0);
      const target = cart.find((item) => item.id === id);
      if (!target) return;
      target.qty = (Number(target.qty) || 1) + delta;
      if (target.qty <= 0) {
        cart = cart.filter((item) => item.id !== id);
      }
      renderCart();
    };
  });
}

function showDetail(product) {
  if (!product) return;
  const normalized = normalizeProduct(product);
  const images = productImages(normalized);
  const detailImage = $('#detailImage');
  const detailGallery = $('#detailGallery');
  const detailTags = $('#detailTags');
  const detailDescription = $('#detailDescription');
  const detailPrice = $('#detailPrice');
  const detailStock = $('#detailStock');

  if (!detailImage || !detailGallery || !detailTags || !detailDescription || !detailPrice || !detailStock) return;

  detailImage.src = images[0] || FALLBACK_IMAGE;
  detailImage.onerror = () => { detailImage.src = FALLBACK_IMAGE; };
  detailGallery.innerHTML = images.map((src) => `<img src="${src}" alt="${normalized.name}" loading="lazy" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}';">`).join('');
  detailGallery.querySelectorAll('img').forEach((img) => {
    img.onclick = () => { detailImage.src = img.src; };
  });

  detailTags.innerHTML = `
    <span class="tag">${formatDisplayValue(normalized.carat, 'carat') || 'عيار 24'}</span>
    <span class="tag">${formatDisplayValue(normalized.weight, 'weight') || 'وزن غير محدد'}</span>
    <span class="tag">${normalized.availability || 'متوفر'}</span>
    <span class="tag">${normalized.shipping || 'متوفر شحن'}</span>
    <span class="tag">${normalized.pickup || 'استلام من الفرع'}</span>
  `;

  detailDescription.textContent = normalized.description || 'لا يوجد وصف مضاف لهذا المنتج بعد.';
  const currentPrice = salePrice(normalized);
  const old = Number(normalized.price || 0) > Number(currentPrice || 0) ? ` <span class="old-price">${money(normalized.price)}</span>` : '';
  detailPrice.innerHTML = `${money(currentPrice)}${old}`;
  detailStock.textContent = normalized.availability === 'غير متوفر الآن' ? 'غير متوفر الآن يمكنك الطلب المخصص.' : (normalized.shipping || 'متوفر شحن');

  const modal = $('#detailModal');
  if (modal) modal.classList.add('show');

  const addBtn = $('#detailAdd');
  const buyBtn = $('#detailBuy');
  if (addBtn) addBtn.onclick = () => { addToCart(product.id); modal.classList.remove('show'); };
  if (buyBtn) buyBtn.onclick = () => { modal.classList.remove('show'); openOrder([product]); };
}

function openOrder(items) {
  const modal = $('#orderModal');
  const intro = $('#orderIntro');
  if (!modal || !intro) return;

  const safeItems = items.filter(Boolean);
  intro.textContent = safeItems.map((item) => `${item.name}${item.qty ? ` × ${item.qty}` : ''}`).join(' ');
  modal.dataset.items = JSON.stringify(safeItems);
  modal.classList.add('show');
}

function getBotConfig() {
  const config = window.REGIA_CONFIG || {};
  const token = String(config.telegramBotToken || '').trim();
  const ids = Array.isArray(config.telegramChatIds) ? config.telegramChatIds.filter(Boolean).map(String) : [];
  return { token, ids };
}

function buildTelegramMessage(data) {
  const lines = ['👑 طلب شراء جديد - دار ريجينا جولد', '━━━━━━━━━━━━━━━━━━'];
  lines.push(`رقم الطلب: ${data.orderNumber}`);
  lines.push(`التاريخ والوقت: ${data.orderedAt}`);
  lines.push('', '👤 بيانات العميل:', `• الاسم: ${data.name || '—'}`, `• الهاتف: ${data.phone || '—'}`);
  lines.push(`• الهاتف الإضافي: ${data.secondaryPhone || '—'}`, `• البريد: ${data.email || 'غير مذكور'}`);
  lines.push(`• المحافظة: ${data.governorate || '—'}`, `• العنوان: ${data.address || '—'}`);
  lines.push(`• طريقة الدفع: ${data.payment || '—'}`, `• الملاحظات: ${data.notes || '—'}`, '', '💎 الطلب:');

  data.items.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.name} — ${money(salePrice(item))} × ${item.qty || 1}`);
  });

  lines.push('', '━━━━━━━━━━━━━━━━━━', `المجموع: ${money(data.total || 0)}`);
  return lines.join('\n');
}

async function sendOrderToTelegram(message) {
  const { token, ids } = getBotConfig();
  if (!token || !ids.length) return false;

  let success = false;
  for (const chatId of ids) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: String(chatId), text: message, disable_web_page_preview: true })
      });
      const payload = await response.json().catch(() => ({ ok: false }));
      success = success || Boolean(payload.ok);
    } catch {
      // ignore
    }
  }

  return success;
}

$('#orderForm').onsubmit = async (event) => {
  event.preventDefault();

  const modal = $('#orderModal');
  const items = JSON.parse(modal.dataset.items || '[]');
  const payload = {
    orderNumber: `REG-${Date.now().toString().slice(-6)}`,
    orderedAt: new Date().toLocaleString('ar-EG'),
    name: $('#customerName').value.trim(),
    phone: $('#phone').value.trim(),
    secondaryPhone: $('#secondaryPhone').value.trim(),
    email: $('#email').value.trim(),
    governorate: $('#governorate')?.value || '—',
    area: $('#area')?.value || '—',
    address: $('#address').value.trim(),
    payment: $('#payment').value,
    notes: $('#notes').value.trim(),
    items,
    total: items.reduce((sum, item) => sum + (salePrice(item) * (item.qty || 1)), 0)
  };

  const message = buildTelegramMessage(payload);
  await sendOrderToTelegram(message);
  cart = [];
  renderCart();
  modal.classList.remove('show');
  $('#orderForm').reset();
  alert('تم إرسال الطلب بنجاح وسنقوم بالتواصل معك في أقرب وقت.');
};

function reloadCatalogFromStorage() {
  fetch('assets/data/products.json', { cache: 'no-store' })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Products catalog not available');
      }
      return response.json();
    })
    .then((data) => {
      all = normalizeCatalog(data);
      if (currentCategories.length) {
        renderCategories(currentCategories);
      }
      filterProducts();
      renderCart();
    })
    .catch(() => {
      all = [];
      if (currentCategories.length) {
        renderCategories(currentCategories);
      }
      filterProducts();
      renderCart();
    });
}

async function init() {
  loadTheme();
  await initStoreConfig();

  const categoriesResponse = await fetch('assets/data/categories.json', { cache: 'no-store' });
  const productsResponse = await fetch('assets/data/products.json', { cache: 'no-store' });
  const categories = categoriesResponse.ok ? await categoriesResponse.json() : [];
  const fetchedProducts = productsResponse.ok ? await productsResponse.json() : [];

  all = normalizeCatalog(Array.isArray(fetchedProducts) ? fetchedProducts : []);
  currentCategories = Array.isArray(categories) ? categories : [];

  renderCategories(currentCategories);
  renderCategoryPage();
  filterProducts();
  renderCart();

  const searchInput = $('#search');
  if (searchInput) {
    searchInput.oninput = filterProducts;
    searchInput.onfocus = updateSearchSuggestions;
    document.addEventListener('click', (event) => {
      const suggestions = $('#searchSuggestions');
      if (!suggestions) return;
      if (!event.target.closest('.header-search-wrap') && !event.target.closest('.search-suggestion')) {
        suggestions.classList.remove('show');
      }
    });
  }

  const themeButton = $('#theme');
  if (themeButton) {
    themeButton.onclick = () => {
      const isLight = !document.body.classList.contains('light');
      document.body.classList.toggle('light', isLight);
      localStorage.setItem('reginaTheme', isLight ? 'light' : 'dark');
      syncThemeButton();
    };
  }

  const menu = $('#menu');
  const side = $('#side');
  if (menu && side) {
    menu.onclick = () => side.classList.add('open');
    document.querySelectorAll('[data-sideclose]').forEach((button) => {
      button.onclick = () => side.classList.remove('open');
    });
  }

  const closeButtons = document.querySelectorAll('[data-close]');
  closeButtons.forEach((button) => {
    button.onclick = () => button.closest('.overlay')?.classList.remove('show');
  });

  const cartButton = $('#cartButton');
  const cartModal = $('#cartModal');
  if (cartButton && cartModal) {
    cartButton.onclick = () => cartModal.classList.add('show');
  }

  const checkoutButton = $('#checkout');
  if (checkoutButton) {
    checkoutButton.onclick = () => {
      if (!cart.length) {
        alert('سلة المشتريات فارغة.');
        return;
      }
      cartModal.classList.remove('show');
      openOrder(cart);
    };
  }

  const revealItems = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.12 });

  revealItems.forEach((item) => observer.observe(item));

  window.addEventListener('regina-products-updated', () => {
    reloadCatalogFromStorage();
  });

  if ('BroadcastChannel' in window) {
    const channel = new BroadcastChannel(productsSyncChannelName);
    channel.onmessage = (event) => {
      if (event.data && event.data.key === 'reginaProductsList') {
        reloadCatalogFromStorage();
      }
    };
    window.__reginaProductsChannel = channel;
  }
}

window.addEventListener('load', init);
