// admin-products.js - Gestión de productos para admins
const API_BASE = 'http://localhost:3000/api';
let editingProductId = null;
let currentProductImage = '';

function formatearPrecioCOP(valor) {
    if (valor == null || valor === '') return '';
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(Number(valor));
}

document.addEventListener('DOMContentLoaded', async function() {
    // Verificar autenticación en el backend y actualizar datos del usuario
    if (!(await checkAdminUser())) {
        alert('Acceso denegado: Solo administradores');
        fadeAndNavigate('index.html');
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

    const cancelEditButton = document.getElementById('cancelEditButton');
    if (cancelEditButton) {
        cancelEditButton.addEventListener('click', resetProductForm);
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

async function parseResponse(response) {
    const text = await response.text();
    try {
        return { ok: response.ok, data: JSON.parse(text) };
    } catch {
        return { ok: response.ok, data: text };
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
                <p><strong>Precio:</strong> ${formatearPrecioCOP(p.price)}</p>
                <p><strong>Stock:</strong> ${p.stock} unidades</p>
                <p><strong>Descripción:</strong> ${p.description}</p>
            </div>
            <div class="producto-item-actions">
                <button class="btn-edit" onclick="editProduct(${p.id})">
                    Editar
                </button>
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
    if (!formData.name || !formData.category || !formData.price || !formData.description || (!editingProductId && !imageFile)) {
        messageDiv.className = 'message error';
        messageDiv.textContent = '✗ Todos los campos son requeridos';
        return;
    }

    try {
        if (editingProductId) {
            if (imageFile) {
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
            } else {
                formData.image = currentProductImage;
            }

            const response = await fetch(`${API_BASE}/products/${editingProductId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const result = await parseResponse(response);
            if (!response.ok) {
                const errorMessage = result.data?.error || result.data || 'Error actualizando producto';
                throw new Error(errorMessage);
            }

            messageDiv.className = 'message success';
            messageDiv.textContent = '✓ Producto actualizado correctamente';
        } else {
            if (!imageFile) {
                messageDiv.className = 'message error';
                messageDiv.textContent = '✗ La imagen es obligatoria al crear un producto';
                return;
            }

            const uploadData = new FormData();
            uploadData.append('image', imageFile);

            const uploadResponse = await fetch(`${API_BASE}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: uploadData
            });

            const uploadResult = await parseResponse(uploadResponse);
            if (!uploadResponse.ok) {
                const errorMessage = uploadResult.data?.error || uploadResult.data || 'Error subiendo la imagen';
                throw new Error(errorMessage);
            }

            formData.image = uploadResult.data.image;

            const response = await fetch(`${API_BASE}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const result = await parseResponse(response);
            if (!response.ok) {
                const errorMessage = result.data?.error || result.data || 'Error creando producto';
                throw new Error(errorMessage);
            }

            messageDiv.className = 'message success';
            messageDiv.textContent = '✓ Producto creado exitosamente!';
        }

        resetProductForm();
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

function editProduct(productId) {
    const messageDiv = document.getElementById('productMessage');
    messageDiv.className = 'message';
    messageDiv.textContent = '';

    fetch(`${API_BASE}/products/${productId}`)
        .then(response => {
            if (!response.ok) throw new Error('No se pudo cargar el producto');
            return response.json();
        })
        .then(product => {
            editingProductId = product.id;
            currentProductImage = product.image || '';

            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productStock').value = product.stock;
            document.getElementById('productDescription').value = product.description;
            document.getElementById('productImage').required = false;
            document.getElementById('submitProductButton').textContent = 'Guardar cambios';
            document.getElementById('cancelEditButton').style.display = 'block';
        })
        .catch(error => {
            messageDiv.className = 'message error';
            messageDiv.textContent = `✗ ${error.message}`;
        });
}

function resetProductForm() {
    editingProductId = null;
    currentProductImage = '';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('productImage').required = true;
    document.getElementById('submitProductButton').textContent = 'Crear Producto';
    document.getElementById('cancelEditButton').style.display = 'none';
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    fadeAndNavigate('auth.html');
}

function fadeAndNavigate(url) {
    document.body.classList.add('fade-page-out');
    setTimeout(() => window.location.href = url, 250);
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
