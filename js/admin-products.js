// admin-products.js - Gestión de productos para admins
const API_BASE = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', async function() {
    // Verificar autenticación en el backend y actualizar datos del usuario
    if (!(await checkAdminUser())) {
        alert('Acceso denegado: Solo administradores');
        window.location.href = 'index.html';
        return;
    }

    // Cargar datos del usuario
    const user = getUser();
    document.getElementById('userDisplay').textContent = `👤 ${user.name}`;

    // Cargar productos existentes
    loadProductos();

    // Manejar formulario
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', handleCreateProduct);
    }
});

async function checkAdminUser() {
    const token = getToken();
    if (!token) return false;

    try {
        const response = await fetch(`${API_BASE}/users/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) return false;

        const user = await response.json();
        if (user.role !== 'admin') return false;

        localStorage.setItem('user', JSON.stringify(user));
        return true;
    } catch (error) {
        return false;
    }
}

async function loadProductos() {
    try {
        const response = await fetch(`${API_BASE}/products`);
        if (!response.ok) throw new Error('Error cargando productos');
        
        const productos = await response.json();
        displayProductos(productos);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('productosList').innerHTML = `
            <div class="no-products">
                <p>Error cargando productos: ${error.message}</p>
            </div>
        `;
    }
}

function displayProductos(productos) {
    const container = document.getElementById('productosList');
    
    if (!productos || productos.length === 0) {
        container.innerHTML = `
            <div class="no-products">
                <p>No hay productos registrados aún</p>
            </div>
        `;
        return;
    }

    container.innerHTML = productos.map(p => `
        <div class="producto-item">
            ${p.image ? `<img class="product-image" src="${p.image}" alt="${p.name}">` : ''}
            <div class="producto-item-info">
                <h3>${p.name}</h3>
                <p><strong>Categoría:</strong> ${p.category}</p>
                <p><strong>Precio:</strong> $${p.price.toFixed(2)}</p>
                <p><strong>Stock:</strong> ${p.stock} unidades</p>
                <p><strong>Descripción:</strong> ${p.description}</p>
            </div>
            <div class="producto-item-actions">
                <button class="btn-delete" onclick="deleteProduct(${p.id})">
                    Eliminar
                </button>
            </div>
        </div>
    `).join('');
}

async function handleCreateProduct(e) {
    e.preventDefault();
    
    const token = getToken();
    const messageDiv = document.getElementById('productMessage');
    const imageFile = document.getElementById('productImage').files[0];

    const formData = {
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        image: '',
        description: document.getElementById('productDescription').value
    };

    // Validar
    if (!formData.name || !formData.category || !formData.price || !imageFile || !formData.description) {
        messageDiv.className = 'message error';
        messageDiv.textContent = '✗ Todos los campos son requeridos';
        return;
    }

    try {
        const uploadData = new FormData();
        uploadData.append('image', imageFile);

        const uploadResponse = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: uploadData
        });

        const uploadResult = await uploadResponse.json();
        if (!uploadResponse.ok) {
            throw new Error(uploadResult.error || 'Error subiendo la imagen');
        }

        formData.image = uploadResult.image;

        const response = await fetch(`${API_BASE}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error creando producto');
        }

        messageDiv.className = 'message success';
        messageDiv.textContent = '✓ Producto creado exitosamente!';

        // Limpiar formulario
        document.getElementById('productForm').reset();

        // Recargar productos
        setTimeout(() => {
            loadProductos();
            messageDiv.textContent = '';
        }, 1500);

    } catch (error) {
        messageDiv.className = 'message error';
        messageDiv.textContent = `✗ ${error.message}`;
    }
}

async function deleteProduct(productId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        return;
    }

    const token = getToken();
    const messageDiv = document.getElementById('productMessage');

    try {
        const response = await fetch(`${API_BASE}/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error eliminando producto');
        }

        messageDiv.className = 'message success';
        messageDiv.textContent = '✓ Producto eliminado';

        setTimeout(() => {
            loadProductos();
            messageDiv.textContent = '';
        }, 1000);

    } catch (error) {
        messageDiv.className = 'message error';
        messageDiv.textContent = `✗ ${error.message}`;
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'auth.html';
}

// Funciones de autenticación (desde auth.js)
function getToken() {
    return localStorage.getItem('token');
}

function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

function requireAdmin() {
    const user = getUser();
    if (!user || user.role !== 'admin') {
        alert('Acceso denegado: Solo administradores');
        window.location.href = 'index.html';
        return false;
    }
    return true;
}
