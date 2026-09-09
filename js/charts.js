/**
 * Charts Configuration & Display
 * إدارة الرسوم البيانية والتصور البياني
 */

class Charts {
    static instances = {};

    static async initEmployeeChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (this.instances[canvasId]) {
            this.instances[canvasId].destroy();
        }

        this.instances[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.employee_name),
                datasets: [{
                    label: 'نسبة التسليم (%)',
                    data: data.map(d => d.delivery_percentage),
                    backgroundColor: data.map(d => this.getPerformanceColor(d.delivery_percentage)),
                    borderRadius: 5,
                    borderSkipped: false
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { color: '#2a2a2a' },
                        ticks: { color: '#b0b0b0' }
                    },
                    y: {
                        grid: { display: false },
                        ticks: { color: '#b0b0b0' }
                    }
                }
            }
        });
    }

    static async initStoreChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (this.instances[canvasId]) {
            this.instances[canvasId].destroy();
        }

        this.instances[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(d => d.store),
                datasets: [{
                    data: data.map(d => d.delivery_percentage),
                    backgroundColor: [
                        '#4caf50',
                        '#8bc34a',
                        '#ffc107',
                        '#ff9800',
                        '#f44336'
                    ],
                    borderColor: '#1a1a1a',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { color: '#b0b0b0' }
                    }
                }
            }
        });
    }

    static async initClientStatusChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (this.instances[canvasId]) {
            this.instances[canvasId].destroy();
        }

        this.instances[canvasId] = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: data.map(d => d.client_status),
                datasets: [{
                    label: 'نسبة التسليم',
                    data: data.map(d => d.delivery_percentage),
                    borderColor: '#2196f3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    pointBackgroundColor: '#2196f3',
                    pointBorderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#b0b0b0' }
                    }
                },
                scales: {
                    r: {
                        grid: { color: '#2a2a2a' },
                        ticks: { color: '#b0b0b0' }
                    }
                }
            }
        });
    }

    static async initTimeSeriesChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (this.instances[canvasId]) {
            this.instances[canvasId].destroy();
        }

        this.instances[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.date),
                datasets: [
                    {
                        label: 'إجمالي الطلبات',
                        data: data.map(d => d.total),
                        borderColor: '#2196f3',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        tension: 0.3
                    },
                    {
                        label: 'الطلبات المسلمة',
                        data: data.map(d => d.delivered),
                        borderColor: '#4caf50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        tension: 0.3
                    },
                    {
                        label: 'الطلبات غير المسلمة',
                        data: data.map(d => d.not_delivered),
                        borderColor: '#f44336',
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#b0b0b0' }
                    }
                },
                scales: {
                    x: {
                        grid: { color: '#2a2a2a' },
                        ticks: { color: '#b0b0b0' }
                    },
                    y: {
                        grid: { color: '#2a2a2a' },
                        ticks: { color: '#b0b0b0' }
                    }
                }
            }
        });
    }

    static async initCallAttemptsChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (this.instances[canvasId]) {
            this.instances[canvasId].destroy();
        }

        this.instances[canvasId] = new Chart(ctx, {
            type: 'bubble',
            data: {
                datasets: [{
                    label: 'محاولات الاتصال',
                    data: data.map(d => ({
                        x: d.under_5,
                        y: d.over_5,
                        r: d.average_attempts * 2
                    })),
                    backgroundColor: '#ff9800',
                    borderColor: '#f44336'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true }
                },
                scales: {
                    x: {
                        grid: { color: '#2a2a2a' },
                        ticks: { color: '#b0b0b0' }
                    },
                    y: {
                        grid: { color: '#2a2a2a' },
                        ticks: { color: '#b0b0b0' }
                    }
                }
            }
        });
    }

    static getPerformanceColor(percentage) {
        if (percentage >= 26) return '#4caf50'; // Excellent
        if (percentage >= 21) return '#8bc34a'; // Good
        if (percentage >= 16) return '#ffc107'; // Average
        if (percentage >= 11) return '#ff9800'; // Poor
        return '#f44336'; // Critical
    }

    static destroyAll() {
        Object.values(this.instances).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.instances = {};
    }
}
