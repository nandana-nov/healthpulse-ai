const STORAGE_KEY = 'healthDB';
let database = {
  users: [],
  reports: []
};
let currentUser = null;
let healthChart = null;

const elements = {
  authContainer: document.getElementById('authContainer'),
  mainContainer: document.getElementById('mainContainer'),
  loginSection: document.getElementById('loginSection'),
  registerSection: document.getElementById('registerSection'),
  welcomeText: document.getElementById('welcomeText'),
  reportTable: document.getElementById('reportTable'),
  reportSearch: document.getElementById('reportSearch'),
  userFilterSelect: document.getElementById('userFilterSelect'),
  reportWeight: document.getElementById('reportWeight'),
  reportHeight: document.getElementById('reportHeight'),
  reportNote: document.getElementById('reportNote'),
  bmiResult: document.getElementById('bmiResult'),
  bmrResult: document.getElementById('bmrResult'),
  healthScore: document.getElementById('healthScore')
};

async function initApp() {
  attachListeners();
  loadStoredDatabase();
  await loadJsonDatabase();
  populateUserFilter();
  saveDatabase();
  loadReports();
}

function loadStoredDatabase() {
  const storedData = localStorage.getItem(STORAGE_KEY);
  if (!storedData) {
    database = { users: [], reports: [] };
    return;
  }

  try {
    const parsed = JSON.parse(storedData);
    database = {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      reports: Array.isArray(parsed.reports) ? parsed.reports : []
    };
  } catch (error) {
    console.warn('Invalid stored database, resetting app state.', error);
    database = { users: [], reports: [] };
  }
}

async function loadJsonDatabase() {
  try {
    let jsonData = window.databaseJson || null;

    if (!jsonData) {
      const response = await fetch('database.json');
      if (!response.ok) {
        throw new Error(`Failed to load JSON: ${response.status}`);
      }
      jsonData = await response.json();
    }

    if (jsonData) {
      if (Array.isArray(jsonData.users) && database.users.length === 0) {
        database.users = jsonData.users;
      }

      if (Array.isArray(jsonData.reports) && database.reports.length === 0) {
        database.reports = jsonData.reports;
      } else if (Array.isArray(jsonData.bmiRecords) && database.reports.length === 0) {
        database.reports = jsonData.bmiRecords.map(record => ({
          id: record.id || Date.now() + Math.random(),
          user: record.username || 'Unknown',
          bmi: Number(record.bmi).toFixed(2),
          category: record.category || 'Unknown',
          note: record.notes || '',
          timestamp: record.timestamp || new Date().toISOString()
        }));
      }
    }
  } catch (error) {
    console.warn('Unable to load database.json. Using local state only.', error);
  }
}

function attachListeners() {
  document.getElementById('showRegisterBtn').addEventListener('click', () => toggleSection('register'));
  document.getElementById('showLoginBtn').addEventListener('click', () => toggleSection('login'));
  document.getElementById('loginBtn').addEventListener('click', loginUser);
  document.getElementById('registerBtn').addEventListener('click', registerUser);
  document.getElementById('logoutBtn').addEventListener('click', logoutUser);
  document.getElementById('calculateBMI').addEventListener('click', calculateBMI);
  document.getElementById('calculateBMR').addEventListener('click', calculateBMR);
  document.getElementById('resetAnalytics').addEventListener('click', resetHealthScore);
  document.getElementById('addReportBtn').addEventListener('click', addSampleReport);
  document.getElementById('createReportBtn').addEventListener('click', createReport);
  document.getElementById('userFilterSelect').addEventListener('change', loadReports);
  document.getElementById('reportSearch').addEventListener('input', loadReports);
}

function toggleSection(section) {
  if (section === 'register') {
    elements.loginSection.classList.add('hidden');
    elements.registerSection.classList.remove('hidden');
  } else {
    elements.loginSection.classList.remove('hidden');
    elements.registerSection.classList.add('hidden');
  }
}

function registerUser() {
  const username = document.getElementById('registerUsername').value.trim();
  const password = document.getElementById('registerPassword').value.trim();

  if (!username || !password) {
    alert('Please enter a username and password.');
    return;
  }

  if (database.users.some(user => user.username === username)) {
    alert('User already exists. Choose another username.');
    return;
  }

  database.users.push({ username, password });
  saveDatabase();
  populateUserFilter();
  toggleSection('login');
  alert('Account created successfully. Please log in.');
}

function loginUser() {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (!username || !password) {
    alert('Please enter valid credentials.');
    return;
  }

  const user = database.users.find(
    user => user.username === username && user.password === password
  );

  if (!user) {
    alert('Invalid credentials.');
    return;
  }

  currentUser = user;
  elements.authContainer.classList.add('hidden');
  elements.mainContainer.classList.remove('hidden');
  elements.welcomeText.textContent = `Welcome back, ${currentUser.username}!`;
  if (elements.userFilterSelect) {
    elements.userFilterSelect.value = 'my';
  }
  loadReports();
  renderChart();
}

function logoutUser() {
  currentUser = null;
  elements.authContainer.classList.remove('hidden');
  elements.mainContainer.classList.add('hidden');
  elements.welcomeText.textContent = 'Please login to view your dashboard.';
  document.getElementById('loginUsername').value = '';
  document.getElementById('loginPassword').value = '';
}

function calculateBMI() {
  if (!currentUser) {
    alert('Please log in to calculate BMI.');
    return;
  }

  const weight = parseFloat(document.getElementById('weight').value);
  const height = parseFloat(document.getElementById('height').value);

  if (!weight || !height || weight <= 0 || height <= 0) {
    alert('Please enter valid weight and height values.');
    return;
  }

  const bmi = Number((weight / ((height / 100) ** 2)).toFixed(2));
  const result = getBmiResult(bmi);

  elements.bmiResult.innerHTML = `
    <h2 style="color:${result.color};">BMI: ${bmi}</h2>
    <h3>Status: ${result.category}</h3>
    <div class="status-bar">
      <p><strong>Recommendation:</strong> ${result.recommendation}</p>
    </div>
  `;

  saveReport({ bmi, category: result.category, note: result.recommendation });
  generateHealthScore(bmi);
  renderChart();
}

function calculateBMR() {
  if (!currentUser) {
    alert('Please log in to calculate metabolism.');
    return;
  }

  const weight = parseFloat(document.getElementById('weight').value);
  const height = parseFloat(document.getElementById('height').value);
  const age = parseInt(document.getElementById('age').value, 10);
  const gender = document.getElementById('gender').value;

  if (!weight || !height || !age || weight <= 0 || height <= 0 || age <= 0) {
    alert('Please enter valid age, weight, and height.');
    return;
  }

  const bmr = gender === 'male'
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;

  elements.bmrResult.innerHTML = `
    <h2>${Math.round(bmr)} kcal/day</h2>
    <p>Metabolic Rate: <strong>Normal</strong></p>
    <p>Daily calories for maintenance: <strong>${Math.round(bmr * 1.2)} kcal</strong></p>
  `;
}

function resetHealthScore() {
  elements.healthScore.innerHTML = '<p>Waiting for analysis...</p>';
}

function getBmiResult(bmi) {
  if (bmi < 18.5) {
    return {
      category: 'Underweight',
      color: '#facc15',
      recommendation: 'Increase healthy calorie intake and build muscle.'
    };
  }

  if (bmi < 25) {
    return {
      category: 'Normal',
      color: '#22c55e',
      recommendation: 'Keep your current routine and stay active.'
    };
  }

  if (bmi < 30) {
    return {
      category: 'Overweight',
      color: '#fb923c',
      recommendation: 'Add moderate exercise and reduce processed foods.'
    };
  }

  return {
    category: 'Obese',
    color: '#ef4444',
    recommendation: 'Consult a health professional for a plan.'
  };
}

function saveReport(reportData) {
  const report = {
    id: Date.now(),
    user: currentUser.username,
    bmi: Number(reportData.bmi).toFixed(2),
    category: reportData.category,
    note: reportData.note || '',
    timestamp: new Date().toISOString()
  };

  database.reports.unshift(report);
  saveDatabase();
  loadReports();
}

function createReport() {
  if (!currentUser) {
    alert('Login first to create reports.');
    return;
  }

  const weight = parseFloat(elements.reportWeight.value);
  const height = parseFloat(elements.reportHeight.value);
  const note = elements.reportNote.value.trim();

  if (!weight || !height || weight <= 0 || height <= 0) {
    alert('Enter valid weight and height values for report creation.');
    return;
  }

  const bmi = Number((weight / ((height / 100) ** 2)).toFixed(2));
  const result = getBmiResult(bmi);

  const report = {
    id: Date.now(),
    user: currentUser.username,
    bmi: bmi.toFixed(2),
    category: result.category,
    note,
    timestamp: new Date().toISOString()
  };

  database.reports.unshift(report);
  saveDatabase();
  loadReports();
  renderChart();

  elements.reportWeight.value = '';
  elements.reportHeight.value = '';
  elements.reportNote.value = '';
  alert('Report created successfully.');
}

function addSampleReport() {
  if (!currentUser) {
    alert('Login first to create reports.');
    return;
  }

  const sample = {
    id: Date.now() + 1,
    user: currentUser.username,
    bmi: (22 + Math.random() * 4).toFixed(2),
    category: 'Normal',
    note: 'Auto-generated sample report',
    timestamp: new Date().toISOString()
  };

  database.reports.unshift(sample);
  saveDatabase();
  loadReports();
  renderChart();
}

function loadReports() {
  if (!elements.reportTable) return;

  const filterValue = elements.userFilterSelect ? elements.userFilterSelect.value : 'all';
  let reports = Array.from(database.reports);

  if (filterValue === 'my' && currentUser) {
    reports = reports.filter(report => report.user === currentUser.username);
  } else if (filterValue && filterValue !== 'all') {
    reports = reports.filter(report => report.user === filterValue);
  }

  const searchValue = elements.reportSearch ? elements.reportSearch.value.trim().toLowerCase() : '';
  if (searchValue) {
    reports = reports.filter(report => {
      const searchable = [
        report.user,
        report.category,
        report.bmi,
        report.note || ''
      ].join(' ').toLowerCase();
      return searchable.includes(searchValue);
    });
  }

  if (!reports.length) {
    elements.reportTable.innerHTML = '<tr><td colspan="6">No reports match this filter.</td></tr>';
    return;
  }

  elements.reportTable.innerHTML = reports.map(report => {
    const isOwner = currentUser && report.user === currentUser.username;
    const badgeClass = getBadgeClass(report.category);
    const timestamp = report.timestamp ? new Date(report.timestamp).toLocaleString() : '-';

    return `
      <tr>
        <td>${report.user}</td>
        <td>${report.bmi}</td>
        <td><span class="table-badge ${badgeClass}">${report.category}</span></td>
        <td>${report.note || '-'}</td>
        <td>${timestamp}</td>
        <td class="report-actions">
          <button ${isOwner ? '' : 'disabled'} onclick="updateReport('${report.id}')">Update</button>
          <button ${isOwner ? '' : 'disabled'} onclick="deleteReport('${report.id}')">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

function getBadgeClass(category) {
  switch (category.toLowerCase()) {
    case 'normal':
      return 'badge-normal';
    case 'overweight':
      return 'badge-overweight';
    case 'obese':
      return 'badge-obese';
    case 'underweight':
      return 'badge-underweight';
    default:
      return 'badge-normal';
  }
}

function updateReport(id) {
  if (!currentUser) {
    alert('Login first to update reports.');
    return;
  }

  const report = database.reports.find(r => String(r.id) === String(id));
  if (!report) {
    alert('Report not found.');
    return;
  }

  if (report.user !== currentUser.username) {
    alert('You can only update your own reports.');
    return;
  }

  const newBmi = prompt('Enter updated BMI for this report:', report.bmi);
  if (!newBmi) return;

  const parsedBmi = Number(newBmi);
  if (!parsedBmi || parsedBmi <= 0) {
    alert('Please enter a valid BMI number.');
    return;
  }

  report.bmi = parsedBmi.toFixed(2);
  report.category = getBmiResult(parsedBmi).category;
  report.timestamp = new Date().toISOString();
  saveDatabase();
  loadReports();
  renderChart();
  alert('Report updated successfully.');
}

function deleteReport(id) {
  if (!currentUser) {
    alert('Login first to delete reports.');
    return;
  }

  const reportIndex = database.reports.findIndex(r => String(r.id) === String(id));
  if (reportIndex === -1) {
    alert('Report not found.');
    return;
  }

  const report = database.reports[reportIndex];
  if (report.user !== currentUser.username) {
    alert('You can only delete your own reports.');
    return;
  }

  if (!confirm('Are you sure you want to delete this report?')) {
    return;
  }

  database.reports.splice(reportIndex, 1);
  saveDatabase();
  loadReports();
  renderChart();
  alert('Report deleted successfully.');
}

function populateUserFilter() {
  if (!elements.userFilterSelect) return;

  const currentValue = elements.userFilterSelect.value || 'all';
  const users = Array.from(new Set(database.users.map(user => user.username))).sort();

  elements.userFilterSelect.innerHTML = `
    <option value="all">All Users</option>
    <option value="my">My Reports</option>
  `;

  users.forEach(username => {
    elements.userFilterSelect.insertAdjacentHTML(
      'beforeend',
      `<option value="${username}">${username}</option>`
    );
  });

  if (currentValue === 'my' && currentUser) {
    elements.userFilterSelect.value = 'my';
  } else if (users.includes(currentValue)) {
    elements.userFilterSelect.value = currentValue;
  } else {
    elements.userFilterSelect.value = 'all';
  }
}

function saveDatabase() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
}

function renderChart() {
  if (!currentUser) return;

  const reports = database.reports
    .filter(report => report.user === currentUser.username)
    .slice(0, 10)
    .reverse();

  const labels = reports.map(report => new Date(report.timestamp).toLocaleDateString());
  const values = reports.map(report => Number(report.bmi));

  const config = {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'BMI Trend',
        data: values,
        fill: true,
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.18)',
        tension: 0.3,
        pointRadius: 5,
        pointBackgroundColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { color: '#cbd5e1' },
          grid: { color: 'rgba(148, 163, 184, 0.12)' }
        },
        y: {
          beginAtZero: false,
          ticks: { color: '#cbd5e1' },
          grid: { color: 'rgba(148, 163, 184, 0.15)' }
        }
      },
      plugins: {
        legend: {
          labels: { color: '#cbd5e1' }
        }
      }
    }
  };

  const canvas = document.getElementById('healthChart');
  if (healthChart) {
    healthChart.config = config;
    healthChart.data = config.data;
    healthChart.options = config.options;
    healthChart.update();
    return;
  }

  healthChart = new Chart(canvas, config);
}

document.addEventListener('DOMContentLoaded', initApp);
