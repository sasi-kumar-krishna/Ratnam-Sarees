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
});

// Handle Delete
window.handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this saree?')) {
        if (USE_FIREBASE) {
            await fbDb.deleteSaree(id);
        } else {
            mockDb.deleteSaree(id);
        }
        await renderTable();
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
