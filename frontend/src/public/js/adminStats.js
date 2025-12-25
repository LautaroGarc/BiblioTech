let charts = {};

document.addEventListener('DOMContentLoaded', async () => {
    await loadStatistics();
    await loadTopBooks();
    await loadTopUsers();
    await checkSystemAlerts();
});

async function loadStatistics() {
    try {
        console.log('[LOAD STATS] Iniciando carga...');
        console.log('[LOAD STATS] Cookies:', document.cookie);
        
        // Cargar estadísticas generales
        const statsResponse = await fetch('/api/admin/statistics', {
            method: 'GET',
            credentials: 'include', // Envía cookies automáticamente
            headers: { 
                'Content-Type': 'application/json'
            }
        });

        console.log('[LOAD STATS] Stats response status:', statsResponse.status);

        if (!statsResponse.ok) {
            const errorText = await statsResponse.text();
            console.error('[LOAD STATS] Error en statistics:', statsResponse.status, errorText);
            if (statsResponse.status === 401 || statsResponse.status === 403) {
                window.location.href = '/login';
                return;
            }
            throw new Error(`Error al cargar estadísticas: ${statsResponse.status}`);
        }

        const statsData = await statsResponse.json();

        if (statsData.success) {
            const data = statsData.data;
            
            // Actualizar tarjetas de estadísticas
            updateStatCards(data);
            
            // Crear gráficos
            createLoansStateChart(data.loans);
            createLoansTypeChart();
            await createLoansTrendChart();
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

function updateStatCards(data) {
    // Usuarios
    document.getElementById('totalUsers').textContent = data.users.totalUsers || 0;
    document.getElementById('adminUsers').textContent = `${data.users.adminUsers || 0} administradores`;

    // Libros
    document.getElementById('totalBooks').textContent = data.books.totalBooks || 0;
    document.getElementById('bookCopies').textContent = `${data.books.totalCopies || 0} copias totales`;

    // Útiles
    document.getElementById('totalSupplies').textContent = data.supplies.totalSupplies || 0;
    document.getElementById('supplyCopies').textContent = `${data.supplies.totalSupplyCopies || 0} unidades totales`;

    // Préstamos
    document.getElementById('activeLoans').textContent = data.loans.activeLoans || 0;
    document.getElementById('totalLoans').textContent = `${data.loans.completedLoans || 0} completados`;
    document.getElementById('overdueLoans').textContent = data.loans.overdueLoans || 0;

    // Lecturas
    document.getElementById('totalReads').textContent = data.books.totalReads || 0;
    const avgRating = parseFloat(data.books.avgReview || 0).toFixed(1);
    document.getElementById('avgRating').textContent = `★ ${avgRating} promedio`;
}

function createLoansStateChart(loansData) {
    const ctx = document.getElementById('loansStateChart');
    
    if (charts.loansState) {
        charts.loansState.destroy();
    }

    charts.loansState = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Activos', 'Atrasados', 'Completados'],
            datasets: [{
                data: [
                    loansData.activeLoans || 0,
                    loansData.overdueLoans || 0,
                    loansData.completedLoans || 0
                ],
                backgroundColor: [
                    '#28a745',
                    '#dc3545',
                    '#6c757d'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 13
                        }
                    }
                }
            }
        }
    });
}

async function createLoansTypeChart() {
    try {
        const loansResponse = await fetch('/api/loans/all', {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        });

        const loansData = await loansResponse.json();

        if (loansData.success) {
            const books = loansData.data.filter(l => l.type === 'book').length;
            const supplies = loansData.data.filter(l => l.type === 'supply').length;

            const ctx = document.getElementById('loansTypeChart');
            
            if (charts.loansType) {
                charts.loansType.destroy();
            }

            charts.loansType = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Libros', 'Útiles'],
                    datasets: [{
                        data: [books, supplies],
                        backgroundColor: [
                            '#667eea',
                            '#17a2b8'
                        ],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 15,
                                font: {
                                    size: 13
                                }
                            }
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error creating loans type chart:', error);
    }
}

async function createLoansTrendChart() {
    try {
        const loansResponse = await fetch('/api/loans/all', {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        });

        const loansData = await loansResponse.json();

        if (loansData.success) {
            // Agrupar préstamos por fecha (últimos 30 días)
            const last30Days = [];
            const loansByDay = {};

            for (let i = 29; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                last30Days.push(dateStr);
                loansByDay[dateStr] = 0;
            }

            loansData.data.forEach(loan => {
                const loanDate = new Date(loan.dateIn).toISOString().split('T')[0];
                if (loansByDay.hasOwnProperty(loanDate)) {
                    loansByDay[loanDate]++;
                }
            });

            const counts = last30Days.map(date => loansByDay[date]);
            const labels = last30Days.map(date => {
                const d = new Date(date);
                return `${d.getDate()}/${d.getMonth() + 1}`;
            });

            const ctx = document.getElementById('loansTrendChart');
            
            if (charts.loansTrend) {
                charts.loansTrend.destroy();
            }

            charts.loansTrend = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Préstamos por día',
                        data: counts,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#667eea',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error creating loans trend chart:', error);
    }
}

async function loadTopBooks() {
    try {
        const container = document.getElementById('topBooks');
        
        container.innerHTML = '<div class="loading-small">Cargando...</div>';
        
        const booksResponse = await fetch('/api/books', {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        });

        const booksData = await booksResponse.json();

        console.log('Top books data:', booksData);

        if (booksData.success && Array.isArray(booksData.data)) {
            const topBooks = booksData.data
                .filter(book => book.timesReaded > 0)
                .sort((a, b) => (b.timesReaded || 0) - (a.timesReaded || 0))
                .slice(0, 10);
            
            if (topBooks.length === 0) {
                container.innerHTML = '<div class="loading-small">No hay libros con lecturas aún</div>';
                return;
            }

            container.innerHTML = topBooks.map((book, index) => {
                return `
                    <div class="list-item">
                        <div class="item-rank">#${index + 1}</div>
                        <div class="item-info">
                            <div class="item-name">${book.name}</div>
                            <div class="item-detail">${book.author || 'Autor desconocido'}</div>
                        </div>
                        <div class="item-stat">${book.timesReaded || 0} 📖</div>
                    </div>
                `;
            }).join('');
        } else {
            container.innerHTML = '<div class="loading-small">No hay datos disponibles</div>';
        }
    } catch (error) {
        console.error('Error loading top books:', error);
        const container = document.getElementById('topBooks');
        if (container) {
            container.innerHTML = '<div class="loading-small">⚠️ Error al cargar datos</div>';
        }
    }
}

async function loadTopUsers() {
    try {
        const container = document.getElementById('topUsers');
        
        container.innerHTML = '<div class="loading-small">Cargando...</div>';
        
        // Cargar usuarios y préstamos
        const [usersResponse, loansResponse] = await Promise.all([
            fetch('/api/admin/users', {
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            }),
            fetch('/api/loans/all', {
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            })
        ]);

        const usersData = await usersResponse.json();
        const loansData = await loansResponse.json();

        console.log('Users data:', usersData);
        console.log('Loans data:', loansData);

        if (usersData.success && Array.isArray(usersData.data) && 
            loansData.success && Array.isArray(loansData.data)) {
            // Contar préstamos por usuario
            const loansByUser = {};
            
            loansData.data.forEach(loan => {
                if (!loansByUser[loan.userId]) {
                    loansByUser[loan.userId] = 0;
                }
                loansByUser[loan.userId]++;
            });

            // Crear lista de usuarios con su conteo
            const usersWithLoans = usersData.data
                .filter(u => u.type !== 'admin')
                .map(user => ({
                    ...user,
                    loansCount: loansByUser[user.id] || 0
                }))
                .sort((a, b) => b.loansCount - a.loansCount)
                .slice(0, 10);

            const container = document.getElementById('topUsers');
            
            if (usersWithLoans.length === 0) {
                container.innerHTML = '<div class="no-data">No hay datos disponibles</div>';
                return;
            }

            container.innerHTML = usersWithLoans.map((user, index) => {
                const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
                const profileImg = user.profilepic || '/assets/profiles/default.png';
                return `
                    <div class="list-item">
                        <div class="list-item-rank ${rankClass}">#${index + 1}</div>
                        <img src="${profileImg}" alt="${user.name}" class="list-item-img">
                        <div class="list-item-info">
                            <div class="list-item-name">${user.name} ${user.lastName}</div>
                            <div class="list-item-meta">${user.email}</div>
                        </div>
                        <div class="list-item-stat">${user.loansCount} préstamos</div>
                    </div>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading top users:', error);
        document.getElementById('topUsers').innerHTML = '<div class="no-data">Error al cargar datos</div>';
    }
}

async function checkSystemAlerts() {
    try {
        const [statsResponse, loansResponse, booksResponse] = await Promise.all([
            fetch('/api/admin/statistics', {
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            }),
            fetch('/api/loans/all', {
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            }),
            fetch('/api/books', {
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            })
        ]);

        const statsData = await statsResponse.json();
        const loansData = await loansResponse.json();
        const booksData = await booksResponse.json();

        const alerts = [];

        if (statsData.success) {
            // Alerta de préstamos atrasados
            if (statsData.data.loans.overdueLoans > 0) {
                alerts.push({
                    type: 'danger',
                    icon: '⚠️',
                    title: 'Préstamos Atrasados',
                    message: `Hay ${statsData.data.loans.overdueLoans} préstamo(s) atrasado(s) que requieren atención.`
                });
            }

            // Alerta de solicitudes pendientes
            const pendingLoans = loansData.data.filter(l => l.state === 'no aprobado').length;
            if (pendingLoans > 0) {
                alerts.push({
                    type: 'warning',
                    icon: '📋',
                    title: 'Solicitudes Pendientes',
                    message: `Hay ${pendingLoans} solicitud(es) de préstamo esperando aprobación.`
                });
            }

            // Alerta de libros con bajo stock
            if (booksData.success) {
                const lowStockBooks = booksData.data.filter(b => b.quant <= 2 && b.quant > 0);
                if (lowStockBooks.length > 0) {
                    alerts.push({
                        type: 'info',
                        icon: '📚',
                        title: 'Stock Bajo',
                        message: `${lowStockBooks.length} libro(s) tienen stock bajo (2 o menos copias).`
                    });
                }
            }
        }

        // Si todo está bien
        if (alerts.length === 0) {
            alerts.push({
                type: 'success',
                icon: '✅',
                title: 'Sistema Normal',
                message: 'No hay alertas en este momento. El sistema funciona correctamente.'
            });
        }

        displayAlerts(alerts);
    } catch (error) {
        console.error('Error checking system alerts:', error);
        document.getElementById('systemAlerts').innerHTML = 
            '<div class="no-data">Error al verificar alertas del sistema</div>';
    }
}

function displayAlerts(alerts) {
    const container = document.getElementById('systemAlerts');
    
    container.innerHTML = alerts.map(alert => `
        <div class="alert-item ${alert.type}">
            <div class="alert-icon">${alert.icon}</div>
            <div class="alert-content">
                <div class="alert-title">${alert.title}</div>
                <div class="alert-message">${alert.message}</div>
            </div>
        </div>
    `).join('');
}
