
document.addEventListener("DOMContentLoaded", () => {
    const revenueChartCtx = document.getElementById('revenueChart').getContext('2d');
    const sourceChartCtx = document.getElementById('sourceChart').getContext('2d');

    const revenueChart = new Chart(revenueChartCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Revenue',
                data: [],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    const sourceChart = new Chart(sourceChartCtx, {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                label: 'Source',
                data: [],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
            }]
        },
        options: {
            responsive: true
        }
    });

    document.getElementById('processButton').addEventListener('click', () => {
        const fileInput = document.getElementById('fileInput');
        const tableBody = document.querySelector('#breakdownTable tbody');
        const file = fileInput.files[0];
        if (!file) {
            alert('Please select a file to process.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            // Process the first sheet
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(sheet);

            // Clear existing table rows
            tableBody.innerHTML = '';

            // Populate the table
            rows.forEach(row => {
                const tr = document.createElement('tr');
                const keys = ["Product Code", "Imprint Label", "Artist Name", "Product Name", "Track Name", "Track Artist", "ISRC", "UPC", "Revenue", "Source", "Unit"];
                keys.forEach(key => {
                    const td = document.createElement('td');
                    td.textContent = row[key] || '';
                    tr.appendChild(td);
                });
                tableBody.appendChild(tr);
            });

            // Update the charts
            const revenueData = rows.map(row => row["Revenue"] || 0);
            const sources = rows.map(row => row["Source"] || "Unknown");

            revenueChart.data.labels = sources;
            revenueChart.data.datasets[0].data = revenueData;
            revenueChart.update();

            const sourceCounts = sources.reduce((acc, source) => {
                acc[source] = (acc[source] || 0) + 1;
                return acc;
            }, {});

            sourceChart.data.labels = Object.keys(sourceCounts);
            sourceChart.data.datasets[0].data = Object.values(sourceCounts);
            sourceChart.update();
        };

        reader.readAsArrayBuffer(file);
    });
});
