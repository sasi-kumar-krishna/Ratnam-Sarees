import { categories, db as mockDb } from './mockData.js';
import { USE_FIREBASE, fbDb } from './firebase.js';

// Safe Fetcher: Returns Firebase data if working & populated, else falls back to Mock DB seamlessly
const fetchSareesSafely = async () => {
    if (USE_FIREBASE) {
        try {
            const data = await fbDb.getSarees();
            if (data && data.length > 0) return data;
            console.warn("Firebase returned 0 items. Falling back to mock data.");
        } catch (err) {
            console.error("Firebase fetch failed, falling back to mock: ", err);
        }
    }
    return mockDb.getSarees();
};

// Format currency
const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(price);
};

// Generate WhatsApp Link
const getWhatsAppLink = (saree) => {
    const phoneNumber = "919032054112"; 
    const message = `Hi Ratnam Sarees, I am interested in purchasing the "${saree.name}" (ID: ${saree.id}) priced at ₹${saree.price}. Please provide more details.`;
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
};

// Render a single Saree Card
const createProductCard = (saree) => {
    return `
        <div class="product-card">
            <a href="product.html?id=${saree.id}" style="display:block; text-decoration:none; color:inherit; flex-grow:1;">
                <div class="product-img-wrapper" style="height: 360px;">
                    <span class="product-category-tag">${saree.category}</span>
                    <img src="${saree.image}" alt="${saree.name}" class="product-img" loading="lazy">
                </div>
                <div class="product-info" style="padding: 24px; display:flex; flex-direction:column; gap:8px;">
                    <h3 class="product-title">${saree.name}</h3>
                    <div class="product-price">${formatPrice(saree.price)}</div>
                </div>
            </a>
            <div class="product-actions" style="padding: 0 24px 24px;">
                <a href="${getWhatsAppLink(saree)}" target="_blank" class="btn-whatsapp">
                    <i class="fab fa-whatsapp"></i> Buy via WhatsApp
                </a>
            </div>
        </div>
    `;
};

// Render Category Preview (Home Page)
const renderCategories = () => {
    const container = document.getElementById('category-preview-grid');
    if (!container) return;

    container.innerHTML = categories.map(cat => `
        <div class="category-card" onclick="window.location.href='categories.html?category=${cat.name}'">
            <img src="${cat.image}" alt="${cat.name} Sarees" loading="lazy">
            <div class="category-overlay">
                <h3>${cat.name}</h3>
            </div>
        </div>
    `).join('');
};

// Render Featured Products (Home Page)
const renderFeaturedProducts = async () => {
    const container = document.getElementById('featured-grid');
    if (!container) return;

    const sarees = await fetchSareesSafely();

    const featured = sarees.filter(s => s.featured).slice(0, 4);

    if (featured.length === 0) {
        container.innerHTML = '<p style="text-align:center;width:100%;grid-column:1/-1;">No featured products at the moment.</p>';
        return;
    }

    container.innerHTML = featured.map(createProductCard).join('');
};

// Render Full Product Grid (Categories Page)
const renderFullGrid = async (filterCategory = 'All') => {
    const container = document.getElementById('full-product-grid');
    if (!container) return;

    const sarees = await fetchSareesSafely();
    const filtered = filterCategory === 'All' 
        ? sarees 
        : sarees.filter(s => s.category.toLowerCase() === filterCategory.toLowerCase());

    if (filtered.length === 0) {
        container.innerHTML = '<p style="text-align:center;width:100%;grid-column:1/-1;padding:40px 0;">No products found in this category.</p>';
        return;
    }

    container.innerHTML = filtered.map(createProductCard).join('');
};

// Handle Category Page Logic
const initCategoryPage = () => {
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (filterBtns.length === 0) return;

    // Check URL parameters for initial filter
    const urlParams = new URLSearchParams(window.location.search);
    const initialCategory = urlParams.get('category') || 'All';

    // Set initial active state
    filterBtns.forEach(btn => {
        if (btn.dataset.filter.toLowerCase() === initialCategory.toLowerCase()) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Render initially
    renderFullGrid(initialCategory);

    // Setup click listeners
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Update active class
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            // Re-render grid
            const selectedCategory = e.target.dataset.filter;
            renderFullGrid(selectedCategory);

            // Update URL without reloading
            const newUrl = selectedCategory === 'All' 
                ? window.location.pathname 
                : `${window.location.pathname}?category=${selectedCategory}`;
            window.history.pushState({path: newUrl}, '', newUrl);
        });
    });
};

// Initialize Carousels for Home Page Hero
const initHeroCarousels = () => {
    const startCarousel = (containerSelector, intervalMs) => {
        const container = document.querySelector(containerSelector);
        if (!container) return;
        const images = container.querySelectorAll('.hero-img');
        if (images.length <= 1) return;
        
        let currentIndex = 0;
        setInterval(() => {
            images[currentIndex].classList.remove('active');
            currentIndex = (currentIndex + 1) % images.length;
            images[currentIndex].classList.add('active');
        }, intervalMs);
    };

    // Stagger the intervals so they don't fade at the exact same moment
    startCarousel('.carousel-1', 4000);
    setTimeout(() => {
        startCarousel('.carousel-2', 4000);
    }, 1500);
};

// Render Product Details Page
const renderProductDetails = async () => {
    const container = document.getElementById('product-details-container');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        container.innerHTML = '<div style="text-align:center; padding:100px;"><h2>Product not found.</h2><a href="categories.html" class="btn-primary">Back to Shop</a></div>';
        return;
    }

    const sarees = await fetchSareesSafely();

    const saree = sarees.find(s => s.id === productId);

    if (!saree) {
        container.innerHTML = '<div style="text-align:center; padding:100px;"><h2>Product not found.</h2><a href="categories.html" class="btn-primary">Back to Shop</a></div>';
        return;
    }

    // Populate the details page
    document.title = `${saree.name} | Ratnam Sarees`;
    document.getElementById('pd-image').src = saree.image;
    document.getElementById('pd-title').textContent = saree.name;
    document.getElementById('pd-price').textContent = formatPrice(saree.price);
    document.getElementById('pd-desc').textContent = saree.description;
    document.getElementById('pd-category').textContent = saree.category;
    document.getElementById('pd-whatsapp').href = getWhatsAppLink(saree);

    // Render "You May Also Like" (Same category)
    const suggestedContainer = document.getElementById('suggested-grid');
    if (suggestedContainer) {
        const related = sarees.filter(s => s.category === saree.category && s.id !== saree.id).slice(0, 4);
        if (related.length === 0) {
            // Fallback to random if no related found
            const fallback = sarees.filter(s => s.id !== saree.id).slice(0, 4);
            suggestedContainer.innerHTML = fallback.map(createProductCard).join('');
        } else {
            suggestedContainer.innerHTML = related.map(createProductCard).join('');
        }
    }
};

// Initialize App Robustly
const initApp = () => {
    renderCategories();
    renderFeaturedProducts();
    initCategoryPage();
    initHeroCarousels();
    renderProductDetails();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
