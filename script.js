        // Clases principales
        class Libro {
            constructor(id, titulo, autor, categoria, disponibilidad = 'disponible') {
                this.id = id;
                this.titulo = titulo;
                this.autor = autor;
                this.categoria = categoria;
                this.disponibilidad = disponibilidad;
            }
        }

        class Reserva {
            constructor(id, usuario, libro, fechaRecogida, estado = 'pendiente') {
                this.id = id;
                this.usuario = usuario;
                this.libro = libro;
                this.fechaReserva = new Date();
                this.fechaRecogida = new Date(fechaRecogida);
                this.estado = estado;
            }
        }

        class Usuario {
            constructor(id, username, password, nombre, tipo) {
                this.id = id;
                this.username = username;
                this.password = password;
                this.nombre = nombre;
                this.tipo = tipo;
            }
        }

        // Estado del sistema
        let libros = [
            new Libro(1, "Cien Años de Soledad", "Gabriel García Márquez", "Ficción", "disponible"),
            new Libro(2, "El Quijote", "Miguel de Cervantes", "Ficción", "disponible"),
            new Libro(3, "Breve Historia del Tiempo", "Stephen Hawking", "Ciencia", "disponible"),
            new Libro(4, "Sapiens", "Yuval Noah Harari", "Historia", "disponible"),
            new Libro(5, "1984", "George Orwell", "Ficción", "disponible"),
            new Libro(6, "El Origen de las Especies", "Charles Darwin", "Ciencia", "disponible"),
            new Libro(7, "Historia del Arte", "E.H. Gombrich", "Arte", "disponible"),
            new Libro(8, "Clean Code", "Robert C. Martin", "Tecnología", "disponible"),
        ];

        let usuarios = [
            new Usuario(1, "estudiante1", "pass123", "Juan Pérez", "estudiante"),
            new Usuario(2, "profesor1", "pass123", "María González", "profesor"),
            new Usuario(3, "admin", "admin123", "Administrador", "administrador"),
        ];

        let reservas = [];
        let currentUser = null;
        let nextBookId = 9;
        let nextReservaId = 1;
        let selectedBookForReserve = null;

        // Funciones de Login
        function login() {
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;
            const loginAlert = document.getElementById('loginAlert');

            const user = usuarios.find(u => u.username === username && u.password === password);

            if (user) {
                currentUser = user;
                loginAlert.innerHTML = '';
                document.getElementById('loginUsername').value = '';
                document.getElementById('loginPassword').value = '';

                if (user.tipo === 'administrador') {
                    showScreen('adminScreen');
                    document.getElementById('adminUser').textContent = `${user.nombre} (${user.tipo})`;
                    loadAdminData();
                } else {
                    showScreen('userScreen');
                    document.getElementById('currentUser').textContent = `${user.nombre} (${user.tipo})`;
                    loadUserData();
                }
            } else {
                loginAlert.innerHTML = '<div class="alert error">Usuario o contraseña incorrectos</div>';
            }
        }

        function logout() {
            currentUser = null;
            showScreen('loginScreen');
        }

        function showScreen(screenId) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById(screenId).classList.add('active');
        }

        // Funciones de Usuario (Estudiante/Profesor)
        function loadUserData() {
            displayBooks();
            displayUserReservations();
        }

        function searchBooks() {
            displayBooks();
        }

        function displayBooks() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const category = document.getElementById('categoryFilter').value;

            let filteredBooks = libros.filter(libro => {
                const matchesSearch = libro.titulo.toLowerCase().includes(searchTerm) ||
                                    libro.autor.toLowerCase().includes(searchTerm) ||
                                    libro.categoria.toLowerCase().includes(searchTerm);
                const matchesCategory = !category || libro.categoria === category;
                return matchesSearch && matchesCategory;
            });

            const grid = document.getElementById('booksGrid');
            grid.innerHTML = '';

            filteredBooks.forEach(libro => {
                const card = document.createElement('div');
                card.className = 'book-card';
                card.innerHTML = `
                    <div class="book-title">${libro.titulo}</div>
                    <div class="book-info">Autor: ${libro.autor}</div>
                    <div class="book-info">Categoría: ${libro.categoria}</div>
                    <span class="book-status ${libro.disponibilidad}">${libro.disponibilidad.charAt(0).toUpperCase() + libro.disponibilidad.slice(1)}</span>
                    <div class="book-actions">
                        ${libro.disponibilidad === 'disponible' ? 
                            `<button onclick="openReserveModal(${libro.id})">Reservar</button>` : 
                            '<button disabled>No disponible</button>'}
                    </div>
                `;
                grid.appendChild(card);
            });
        }

        function openReserveModal(bookId) {
            const libro = libros.find(l => l.id === bookId);
            selectedBookForReserve = libro;
            document.getElementById('reserveBookInfo').textContent = `Reservar: ${libro.titulo} - ${libro.autor}`;
            
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            document.getElementById('pickupDate').min = tomorrow.toISOString().split('T')[0];
            document.getElementById('pickupDate').value = tomorrow.toISOString().split('T')[0];
            
            document.getElementById('reserveModal').classList.add('active');
        }

        function closeReserveModal() {
            document.getElementById('reserveModal').classList.remove('active');
            selectedBookForReserve = null;
        }

        function confirmReservation() {
            const pickupDate = document.getElementById('pickupDate').value;
            
            if (!pickupDate) {
                alert('Por favor seleccione una fecha de recogida');
                return;
            }

            const reserva = new Reserva(nextReservaId++, currentUser, selectedBookForReserve, pickupDate);
            reservas.push(reserva);
            selectedBookForReserve.disponibilidad = 'reservado';

            closeReserveModal();
            showUserAlert('Reserva creada exitosamente. Pendiente de aprobación.', 'success');
            loadUserData();
        }

        function displayUserReservations() {
            const table = document.getElementById('myReservationsTable');
            const userReservations = reservas.filter(r => r.usuario.id === currentUser.id);

            table.innerHTML = '';
            userReservations.forEach(reserva => {
                const row = table.insertRow();
                row.innerHTML = `
                    <td>${reserva.libro.titulo}</td>
                    <td>${reserva.fechaReserva.toLocaleDateString()}</td>
                    <td>${reserva.fechaRecogida.toLocaleDateString()}</td>
                    <td><span class="book-status ${reserva.estado === 'aprobada' ? 'disponible' : reserva.estado === 'rechazada' ? 'no-disponible' : 'reservado'}">${reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}</span></td>
                `;
            });
        }

        function switchUserTab(tab) {
            document.querySelectorAll('#userScreen .tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('#userScreen .tab-content').forEach(c => c.classList.remove('active'));

            if (tab === 'available') {
                document.querySelector('#userScreen .tab:nth-child(1)').classList.add('active');
                document.getElementById('availableTab').classList.add('active');
            } else {
                document.querySelector('#userScreen .tab:nth-child(2)').classList.add('active');
                document.getElementById('myReservationsTab').classList.add('active');
            }
        }

        function showUserAlert(message, type) {
            const alert = document.getElementById('userAlert');
            alert.innerHTML = `<div class="alert ${type}">${message}</div>`;
            setTimeout(() => { alert.innerHTML = ''; }, 3000);
        }

        // Funciones de Administrador
        function loadAdminData() {
            displayAdminBooks();
            displayAdminReservations();
            generateReports();
        }

        function switchAdminTab(tab) {
            document.querySelectorAll('#adminScreen .tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('#adminScreen .tab-content').forEach(c => c.classList.remove('active'));

            if (tab === 'books') {
                document.querySelector('#adminScreen .tab:nth-child(1)').classList.add('active');
                document.getElementById('booksTab').classList.add('active');
            } else if (tab === 'reservations') {
                document.querySelector('#adminScreen .tab:nth-child(2)').classList.add('active');
                document.getElementById('reservationsTab').classList.add('active');
            } else {
                document.querySelector('#adminScreen .tab:nth-child(3)').classList.add('active');
                document.getElementById('reportsTab').classList.add('active');
                generateReports();
            }
        }

        function displayAdminBooks() {
            const table = document.getElementById('adminBooksTable');
            table.innerHTML = '';

            libros.forEach(libro => {
                const row = table.insertRow();
                row.innerHTML = `
                    <td>${libro.titulo}</td>
                    <td>${libro.autor}</td>
                    <td>${libro.categoria}</td>
                    <td><span class="book-status ${libro.disponibilidad}">${libro.disponibilidad.charAt(0).toUpperCase() + libro.disponibilidad.slice(1)}</span></td>
                    <td>
                        <button class="danger" onclick="deleteBook(${libro.id})">Eliminar</button>
                    </td>
                `;
            });
        }

        function showAddBookModal() {
            document.getElementById('bookModalTitle').textContent = 'Agregar Nuevo Libro';
            document.getElementById('bookTitle').value = '';
            document.getElementById('bookAuthor').value = '';
            document.getElementById('bookCategory').value = 'Ficción';
            document.getElementById('bookModal').classList.add('active');
        }

        function closeBookModal() {
            document.getElementById('bookModal').classList.remove('active');
        }

        function saveBook() {
            const titulo = document.getElementById('bookTitle').value;
            const autor = document.getElementById('bookAuthor').value;
            const categoria = document.getElementById('bookCategory').value;

            if (!titulo || !autor) {
                alert('Por favor complete todos los campos');
                return;
            }

            const nuevoLibro = new Libro(nextBookId++, titulo, autor, categoria);
            libros.push(nuevoLibro);

            closeBookModal();
            showAdminAlert('Libro agregado exitosamente', 'success');
            displayAdminBooks();
            generateReports();
        }

        function deleteBook(bookId) {
            if (confirm('¿Está seguro de eliminar este libro?')) {
                const index = libros.findIndex(l => l.id === bookId);
                if (index !== -1) {
                    libros.splice(index, 1);
                    showAdminAlert('Libro eliminado exitosamente', 'success');
                    displayAdminBooks();
                    generateReports();
                }
            }
        }

        function displayAdminReservations() {
            const table = document.getElementById('adminReservationsTable');
            table.innerHTML = '';

            reservas.forEach(reserva => {
                const row = table.insertRow();
                row.innerHTML = `
                    <td>${reserva.usuario.nombre}</td>
                    <td>${reserva.usuario.tipo}</td>
                    <td>${reserva.libro.titulo}</td>
                    <td>${reserva.fechaRecogida.toLocaleDateString()}</td>
                    <td><span class="book-status ${reserva.estado === 'aprobada' ? 'disponible' : reserva.estado === 'rechazada' ? 'no-disponible' : 'reservado'}">${reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}</span></td>
                    <td>
                        ${reserva.estado === 'pendiente' ? `
                            <button class="success" onclick="approveReservation(${reserva.id})">Aprobar</button>
                            <button class="danger" onclick="rejectReservation(${reserva.id})">Rechazar</button>
                        ` : '-'}
                    </td>
                `;
            });
        }

        function approveReservation(reservaId) {
            const reserva = reservas.find(r => r.id === reservaId);
            if (reserva) {
                reserva.estado = 'aprobada';
                showAdminAlert('Reserva aprobada exitosamente', 'success');
                displayAdminReservations();
                generateReports();
            }
        }

        function rejectReservation(reservaId) {
            const reserva = reservas.find(r => r.id === reservaId);
            if (reserva) {
                reserva.estado = 'rechazada';
                reserva.libro.disponibilidad = 'disponible';
                showAdminAlert('Reserva rechazada', 'success');
                displayAdminReservations();
                displayAdminBooks();
                generateReports();
            }
        }

        function generateReports() {
            document.getElementById('totalBooks').textContent = libros.length;
            document.getElementById('availableBooks').textContent = libros.filter(l => l.disponibilidad === 'disponible').length;
            document.getElementById('totalReservations').textContent = reservas.length;
            document.getElementById('pendingReservations').textContent = reservas.filter(r => r.estado === 'pendiente').length;

            const categoryStats = {};
            libros.forEach(libro => {
                if (!categoryStats[libro.categoria]) {
                    categoryStats[libro.categoria] = { total: 0, disponibles: 0, reservados: 0 };
                }
                categoryStats[libro.categoria].total++;
                if (libro.disponibilidad === 'disponible') {
                    categoryStats[libro.categoria].disponibles++;
                } else {
                    categoryStats[libro.categoria].reservados++;
                }
            });

            const table = document.getElementById('categoryReportTable');
            table.innerHTML = '';
            Object.keys(categoryStats).forEach(categoria => {
                const row = table.insertRow();
                row.innerHTML = `
                    <td>${categoria}</td>
                    <td>${categoryStats[categoria].total}</td>
                    <td>${categoryStats[categoria].disponibles}</td>
                    <td>${categoryStats[categoria].reservados}</td>
                `;
            });
        }

        function showAdminAlert(message, type) {
            const alert = document.getElementById('adminAlert');
            alert.innerHTML = `<div class="alert ${type}">${message}</div>`;
            setTimeout(() => { alert.innerHTML = ''; }, 3000);
        }

        // Inicialización
        window.onload = function() {
            const today = new Date();
            document.getElementById('pickupDate').min = today.toISOString().split('T')[0];
        };