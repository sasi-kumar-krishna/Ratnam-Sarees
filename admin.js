import { db as mockDb } from './mockData.js';
import { USE_FIREBASE, fbDb, fbAuth } from './firebase.js';

// Auth Protection
if (sessionStorage.getItem('isAdminLoggedIn') !== 'true') {
    window.location.href = 'admin.html';
}

// Format currency for table
const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(price);
};

// State
let editingId = null;

// DOM Elements
const adminTableBody = document.getElementById('adminTableBody');
const productFormSection = document.getElementById('productFormSection');
const productForm = document.getElementById('productForm');
const openAddModalBtn = document.getElementById('openAddModalBtn');
const cancelFormBtn = document.getElementById('cancelFormBtn');
const formTitle = document.getElementById('formTitle');
const logoutBtn = document.getElementById('logoutBtn');

// Form Inputs
const fId = document.getElementById('productId');
const fName = document.getElementById('pName');
const fPrice = document.getElementById('pPrice');
const fCategory = document.getElementById('pCategory');
const fImage = document.getElementById('pImage');
const fDesc = document.getElementById('pDesc');
const fFeatured = document.getElementById('pFeatured');

// Render Table
const renderTable = async () => {
    if (!adminTableBody) return;
    
    let sarees = [];
    if (USE_FIREBASE) {
        sarees = await fbDb.getSarees();
    } else {
        sarees = mockDb.getSarees();
    }
    
    if (sarees.length === 0) {
        adminTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No products found. Add one above!</td></tr>';
        return;
    }

    adminTableBody.innerHTML = sarees.map(saree => `
        <tr>
            <td><img src="${saree.image}" class="product-img-thumb" alt="${saree.name}"></td>
            <td style="font-weight: 500;">${saree.name}</td>
            <td><span class="product-category-tag" style="position:static;">${saree.category}</span></td>
            <td style="color: var(--primary-color); font-weight: 600;">${formatPrice(saree.price)}</td>
            <td>${saree.featured ? '<i class="fas fa-star" style="color:var(--secondary-color)"></i>' : '-'}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-icon btn-edit" title="Edit" data-id="${saree.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" title="Delete" data-id="${saree.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    // Attach Action Listeners
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => openEditForm(e.currentTarget.dataset.id));
    });
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => handleDelete(e.currentTarget.dataset.id));
    });
};

// Open Form for Adding
openAddModalBtn?.addEventListener('click', () => {
    editingId = null;
    formTitle.textContent = 'Add New Saree';
    productForm.reset();
    fId.value = '';
    productFormSection.style.display = 'block';
    productFormSection.scrollIntoView({ behavior: 'smooth' });
});

// Cancel Form
cancelFormBtn?.addEventListener('click', () => {
    productFormSection.style.display = 'none';
    productForm.reset();
    editingId = null;
});

// Open Form for Editing
window.openEditForm = async (id) => {
    let sarees = [];
    if (USE_FIREBASE) {
        sarees = await fbDb.getSarees();
    } else {
        sarees = mockDb.getSarees();
    }
    const saree = sarees.find(s => s.id === id);
    if (!saree) return;

    editingId = id;
    formTitle.textContent = 'Edit Saree';
    
    // Populate form
    fId.value = saree.id;
    fName.value = saree.name;
    fPrice.value = saree.price;
    fCategory.value = saree.category;
    fImage.value = saree.image;
    fDesc.value = saree.description;
    fFeatured.checked = saree.featured || false;

    productFormSection.style.display = 'block';
    productFormSection.scrollIntoView({ behavior: 'smooth' });
};

// Handle Submit (Add / Edit)
productForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const sareeData = {
        name: fName.value,
        price: parseFloat(fPrice.value),
        category: fCategory.value,
        image: fImage.value,
        description: fDesc.value,
        featured: fFeatured.checked
    };

    try {
        if (editingId) {
            // Edit existing
            if (USE_FIREBASE) {
                await fbDb.updateSaree(editingId, sareeData);
            } else {
                let sarees = mockDb.getSarees();
                sareeData.id = editingId;
                sarees = sarees.map(s => s.id === editingId ? sareeData : s);
                localStorage.setItem('ratnam_sarees', JSON.stringify(sarees));
            }
        } else {
            // Add new
            if (USE_FIREBASE) {
                await fbDb.saveSaree(sareeData);
            } else {
                sareeData.id = Date.now().toString();
                mockDb.saveSaree(sareeData);
            }
        }

        productFormSection.style.display = 'none';
        productForm.reset();
        editingId = null;
        await renderTable();
        alert('Product saved successfully!');
    } catch (error) {
        console.error("Error saving product: ", error);
        alert('Failed to save product! Firebase Error: ' + error.message + '\n\nMake sure your Firestore Database is created and Security Rules are set correctly.');
    }
});

// Handle Delete
window.handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this saree?')) {
        try {
            if (USE_FIREBASE) {
                await fbDb.deleteSaree(id);
            } else {
                mockDb.deleteSaree(id);
            }
            await renderTable();
        } catch (error) {
            console.error("Error deleting product: ", error);
            alert('Failed to delete product! Firebase Error: ' + error.message);
        }
    }
};

// Handle Logout
logoutBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    sessionStorage.removeItem('isAdminLoggedIn');
    window.location.href = 'admin.html';
});

// Init Dashboard
if (window.location.pathname.includes('admin-dashboard.html')) {
    document.addEventListener('DOMContentLoaded', renderTable);
}

// -----------------------------------------------------
// TABS & SETTINGS LOGIC
// -----------------------------------------------------
const tabProducts = document.getElementById('tabProducts');
const tabSettings = document.getElementById('tabSettings');
const viewProducts = document.getElementById('viewProducts');
const viewSettings = document.getElementById('viewSettings');

const settingsForm = document.getElementById('settingsForm');
const sCarousel1 = document.getElementById('sCarousel1');
const sCarousel2 = document.getElementById('sCarousel2');

window.switchTab = (tabName) => {
    if (!tabProducts) return;
    if (tabName === 'products') {
        tabProducts.classList.add('active');
        tabSettings.classList.remove('active');
        viewProducts.style.display = 'block';
        viewSettings.style.display = 'none';
        renderTable();
    } else if (tabName === 'settings') {
        tabSettings.classList.add('active');
        tabProducts.classList.remove('active');
        viewSettings.style.display = 'block';
        viewProducts.style.display = 'none';
        loadSettings();
    }
};

tabProducts?.addEventListener('click', (e) => { e.preventDefault(); switchTab('products'); });
tabSettings?.addEventListener('click', (e) => { e.preventDefault(); switchTab('settings'); });

const loadSettings = async () => {
    try {
        let settings = null;
        if (USE_FIREBASE) {
            settings = await fbDb.getSettings();
        } 
        if (!settings) {
            settings = mockDb.getSettings();
        }
        sCarousel1.value = settings.carousel1.join(',\n');
        sCarousel2.value = settings.carousel2.join(',\n');
    } catch (err) {
        console.error(err);
        alert('Failed to load settings. Error: ' + err.message);
    }
};

settingsForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const c1Text = sCarousel1.value;
    const c2Text = sCarousel2.value;
    
    // Parse comma separated values
    const settings = {
        carousel1: c1Text.split(',').map(s => s.trim()).filter(s => s),
        carousel2: c2Text.split(',').map(s => s.trim()).filter(s => s)
    };
    
    try {
        if (USE_FIREBASE) {
            await fbDb.saveSettings(settings);
        } else {
            mockDb.saveSettings(settings);
        }
        alert('Settings saved successfully!');
    } catch (err) {
        console.error(err);
        alert('Failed to save settings. Error: ' + err.message);
    }
});
