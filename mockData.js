export const categories = [
    { name: "Silk", image: "https://images.unsplash.com/photo-1610116664983-050ee631f4af?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
    { name: "Designer", image: "https://images.unsplash.com/photo-1583391733959-b1cadfcfa280?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
    { name: "Wedding", image: "https://images.unsplash.com/photo-1610189013444-2bd8e227add1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
    { name: "Cotton", image: "https://images.unsplash.com/photo-1596455607563-ad6193f76b11?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
    { name: "Casual", image: "https://images.unsplash.com/photo-1603525281489-3d07e60e0a58?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" }
];

export const mockSarees = [
    {
        id: "1",
        name: "Banarasi Golden Pure Silk",
        price: 24999,
        category: "Silk",
        image: "https://images.unsplash.com/photo-1610116664983-050ee631f4af?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        description: "Exquisite Banarasi silk saree perfect for grand occasions.",
        featured: true
    },
    {
        id: "2",
        name: "Kanchipuram Red Bridal",
        price: 45000,
        category: "Wedding",
        image: "https://images.unsplash.com/photo-1610189013444-2bd8e227add1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        description: "Traditional red bridal Kanchipuram silk with intricate gold zari.",
        featured: true
    },
    {
        id: "3",
        name: "Midnight Blue Sequined",
        price: 18500,
        category: "Designer",
        image: "https://images.unsplash.com/photo-1583391733959-b1cadfcfa280?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        description: "Modern designer saree with all-over sequin work for evening parties.",
        featured: true
    },
    {
        id: "4",
        name: "Handloom Yellow Cotton",
        price: 3500,
        category: "Cotton",
        image: "https://images.unsplash.com/photo-1596455607563-ad6193f76b11?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        description: "Breathable and comfortable handloom cotton saree for daily wear.",
        featured: false
    },
    {
        id: "5",
        name: "Pastel Pink Georgette",
        price: 12000,
        category: "Designer",
        image: "https://images.unsplash.com/photo-1603525281489-3d07e60e0a58?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        description: "Lightweight georgette saree in modern pastel shades.",
        featured: true
    },
    {
        id: "6",
        name: "Mysore Crepe Silk",
        price: 16800,
        category: "Silk",
        image: "https://images.unsplash.com/photo-1589156686161-073ba50c333a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        description: "Authentic Mysore crepe silk with contrast border.",
        featured: false
    }
];

// Helper to interact with LocalStorage as a mock DB until Firebase is hooked up
export const db = {
    getSarees: () => {
        const stored = localStorage.getItem('ratnam_sarees');
        if (!stored) {
            localStorage.setItem('ratnam_sarees', JSON.stringify(mockSarees));
            return mockSarees;
        }
        return JSON.parse(stored);
    },
    saveSaree: (saree) => {
        const sarees = db.getSarees();
        sarees.push(saree);
        localStorage.setItem('ratnam_sarees', JSON.stringify(sarees));
    },
    deleteSaree: (id) => {
        let sarees = db.getSarees();
        sarees = sarees.filter(s => s.id !== id);
        localStorage.setItem('ratnam_sarees', JSON.stringify(sarees));
    },
    getSettings: () => {
        const settings = localStorage.getItem('ratnam_settings');
        if (settings) {
            return JSON.parse(settings);
        }
        return {
            carousel1: [
                "https://images.unsplash.com/photo-1610189013444-2bd8e227add1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1596455607563-ad6193f76b11?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1610116664983-050ee631f4af?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            ],
            carousel2: [
                "https://images.unsplash.com/photo-1583391733959-b1cadfcfa280?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1603525281489-3d07e60e0a58?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1589156686161-073ba50c333a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            ]
        };
    },
    saveSettings: (settings) => {
        localStorage.setItem('ratnam_settings', JSON.stringify(settings));
    }
};
