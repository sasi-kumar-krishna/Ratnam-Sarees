import { categories, db as mockDb } from './mockData.js';
import { USE_FIREBASE, fbDb } from './firebase.js';

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
    const phoneNumber = "919876543210"; 
    const message = `Hi Ratnam Sarees, I am interested in purchasing the "${saree.name}" (ID: ${saree.id}) priced at ₹${saree.price}. Please provide more details.`;
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
};

// Render a single Saree Card
const createProductCard = (saree) => {
    return `
        <div class="product-card">
            <div class="product-img-wrapper">
                <span class="product-category-tag">${saree.category}</span>
                <img src="${saree.image}" alt="${saree.name}" class="product-img" loading="lazy">
            </div>
            <div class="product-info">
                <h3 class="product-title">${saree.name}</h3>
                <div class="product-price">${formatPrice(saree.price)}</div>
                <div class="product-actions">
                    <a href="${getWhatsAppLink(saree)}" target="_blank" class="btn-whatsapp">
                        <i class="fab fa-whatsapp"></i> Buy Now
                    </a>
                </div>
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

    let sarees = [];
    if (USE_FIREBASE) {
        sarees = await fbDb.getSarees();
    } else {
        sarees = mockDb.getSarees();
    }

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

    let sarees = [];
    if (USE_FIREBASE) {
        sarees = await fbDb.getSarees();
    } else {
        sarees = mockDb.getSarees();
    }
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

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    renderCategories();
    renderFeaturedProducts();
    initCategoryPage();
});
