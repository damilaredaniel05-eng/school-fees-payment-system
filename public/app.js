const API_URL = 'http://localhost:5000/api';
let currentUser = null;
let currentPage = 'dashboard';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
});

function checkAuth() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');
  
  if (!token) {
    showLoginPage();
  } else {
    currentUser = { token, role };
    if (role === 'admin') {
      showAdminDashboard();
    } else {
      showStudentDashboard();
    }
  }
}

// LOGIN PAGE
function showLoginPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark">
      <div class="container-fluid">
        <span class="navbar-brand">School Fees Portal</span>
      </div>
    </nav>
    <div class="auth-container">
      <div class="auth-form">
        <h2>Student Login</h2>
        <form id="loginForm">
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" id="loginEmail" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Password</label>
            <input type="password" class="form-control" id="loginPassword" required>
          </div>
          <button type="submit" class="btn btn-primary w-100 mb-3">Login</button>
        </form>
        <p class="text-center mb-0">Don't have an account? <a href="#" onclick="showRegisterPage()">Register</a></p>
      </div>
    </div>
  `;
  
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
}

function showRegisterPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark">
      <div class="container-fluid">
        <span class="navbar-brand">School Fees Portal</span>
      </div>
    </nav>
    <div class="auth-container">
      <div class="auth-form">
        <h2>Student Registration</h2>
        <form id="registerForm">
          <div class="mb-2">
            <label class="form-label">First Name</label>
            <input type="text" class="form-control" id="firstName" required>
          </div>
          <div class="mb-2">
            <label class="form-label">Last Name</label>
            <input type="text" class="form-control" id="lastName" required>
          </div>
          <div class="mb-2">
            <label class="form-label">Student ID</label>
            <input type="text" class="form-control" id="studentId" required>
          </div>
          <div class="mb-2">
            <label class="form-label">Class</label>
            <input type="text" class="form-control" id="classLevel" required>
          </div>
          <div class="mb-2">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" id="regEmail" required>
          </div>
          <div class="mb-2">
            <label class="form-label">Password</label>
            <input type="password" class="form-control" id="regPassword" required>
          </div>
          <div class="mb-2">
            <label class="form-label">Parent Email</label>
            <input type="email" class="form-control" id="parentEmail">
          </div>
          <div class="mb-3">
            <label class="form-label">Phone</label>
            <input type="tel" class="form-control" id="phone">
          </div>
          <button type="submit" class="btn btn-primary w-100 mb-3">Register</button>
        </form>
        <p class="text-center mb-0">Already have an account? <a href="#" onclick="showLoginPage()">Login</a></p>
      </div>
    </div>
  `;
  
  document.getElementById('registerForm').addEventListener('submit', handleRegister);
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('userRole', data.role);
      checkAuth();
    } else {
      alert(data.error);
    }
  } catch (error) {
    alert('Login failed: ' + error.message);
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const studentId = document.getElementById('studentId').value;
  const classLevel = document.getElementById('classLevel').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  const parentEmail = document.getElementById('parentEmail').value;
  const phone = document.getElementById('phone').value;
  
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, firstName, lastName, studentId, classLevel, parentEmail, phone })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert('Registration successful! Please login.');
      showLoginPage();
    } else {
      alert(data.error);
    }
  } catch (error) {
    alert('Registration failed: ' + error.message);
  }
}

// STUDENT DASHBOARD
function showStudentDashboard() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark">
      <div class="container-fluid">
        <span class="navbar-brand">School Fees Portal</span>
        <div>
          <button class="btn btn-outline-light me-2" onclick="loadStudentPage('dashboard')">Dashboard</button>
          <button class="btn btn-outline-light me-2" onclick="loadStudentPage('fees')">Payment History</button>
          <button class="btn btn-outline-light me-2" onclick="loadStudentPage('profile')">Profile</button>
          <button class="btn btn-outline-light" onclick="logout()">Logout</button>
        </div>
      </div>
    </nav>
    <div class="container-main">
      <div id="dashboard-content"></div>
    </div>
  `;
  
  loadStudentPage('dashboard');
}

async function loadStudentPage(page) {
  currentPage = page;
  const content = document.getElementById('dashboard-content');
  const token = localStorage.getItem('token');
  
  if (page === 'dashboard') {
    // Load fees summary
    try {
      const response = await fetch(`${API_URL}/fees/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const summary = await response.json();
      
      const feesResponse = await fetch(`${API_URL}/fees`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const fees = await feesResponse.json();
      
      content.innerHTML = `
        <div class="row mb-4">
          <div class="col-md-4">
            <div class="dashboard-card total-fees">
              <h5>Total Fees</h5>
              <h2>₦${(parseFloat(summary.total_unpaid || 0) + parseFloat(summary.total_paid || 0)).toLocaleString('en-NG', {minimumFractionDigits: 2})}</h2>
            </div>
          </div>
          <div class="col-md-4">
            <div class="dashboard-card paid-fees">
              <h5>Paid Fees</h5>
              <h2>₦${(summary.total_paid || 0).toLocaleString('en-NG', {minimumFractionDigits: 2})}</h2>
            </div>
          </div>
          <div class="col-md-4">
            <div class="dashboard-card unpaid-fees">
              <h5>Outstanding</h5>
              <h2>₦${(summary.total_unpaid || 0).toLocaleString('en-NG', {minimumFractionDigits: 2})}</h2>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Your Fees</h5>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${fees.map(fee => `
                    <tr>
                      <td>${fee.description || 'School Fee'}</td>
                      <td>₦${fee.amount.toLocaleString('en-NG', {minimumFractionDigits: 2})}</td>
                      <td>${new Date(fee.due_date).toLocaleDateString('en-NG')}</td>
                      <td><span class="badge badge-${fee.status}">${fee.status.toUpperCase()}</span></td>
                      <td>
                        ${fee.status === 'unpaid' ? `<button class="btn btn-sm btn-primary" onclick="initiateFeePayment(${fee.id}, ${fee.amount})">Pay</button>` : 'Paid'}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      content.innerHTML = `<div class="alert alert-danger">Error loading dashboard: ${error.message}</div>`;
    }
  } else if (page === 'fees') {
    // Load payment history
    try {
      const response = await fetch(`${API_URL}/payments/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const payments = await response.json();
      
      content.innerHTML = `
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Payment History</h5>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Receipt</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${payments.map(p => `
                    <tr>
                      <td>${new Date(p.created_at).toLocaleDateString('en-NG')}</td>
                      <td>₦${p.amount.toLocaleString('en-NG', {minimumFractionDigits: 2})}</td>
                      <td><span class="badge badge-${p.status}">${p.status.toUpperCase()}</span></td>
                      <td>${p.receipt_number || 'N/A'}</td>
                      <td>${p.status === 'completed' ? `<button class="btn btn-sm btn-info" onclick="downloadReceipt('${p.receipt_number}')">Download</button>` : ''}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      content.innerHTML = `<div class="alert alert-danger">Error loading payment history: ${error.message}</div>`;
    }
  } else if (page === 'profile') {
    // Load student profile
    try {
      const response = await fetch(`${API_URL}/students/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const profile = await response.json();
      
      content.innerHTML = `
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Student Profile</h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">First Name</label>
                  <input type="text" class="form-control" id="profileFirstName" value="${profile.first_name || ''}">
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">Last Name</label>
                  <input type="text" class="form-control" id="profileLastName" value="${profile.last_name || ''}">
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">Student ID</label>
                  <input type="text" class="form-control" value="${profile.student_id || ''}" disabled>
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">Class</label>
                  <input type="text" class="form-control" value="${profile.class || ''}" disabled>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">Parent Email</label>
                  <input type="email" class="form-control" id="profileParentEmail" value="${profile.parent_email || ''}">
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">Phone</label>
                  <input type="tel" class="form-control" id="profilePhone" value="${profile.phone || ''}">
                </div>
              </div>
            </div>
            <button class="btn btn-primary" onclick="updateProfile()">Update Profile</button>
          </div>
        </div>
      `;
    } catch (error) {
      content.innerHTML = `<div class="alert alert-danger">Error loading profile: ${error.message}</div>`;
    }
  }
}

async function initiateFeePayment(feeId, amount) {
  const token = localStorage.getItem('token');
  const email = prompt('Enter your email for payment:');
  
  if (!email) return;
  
  try {
    const response = await fetch(`${API_URL}/payments/initialize`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ feeId, amount, email })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Redirect to Paystack
      window.location.href = data.authorization_url;
    } else {
      alert('Payment initialization failed: ' + data.error);
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

async function updateProfile() {
  const token = localStorage.getItem('token');
  const firstName = document.getElementById('profileFirstName').value;
  const lastName = document.getElementById('profileLastName').value;
  const parentEmail = document.getElementById('profileParentEmail').value;
  const phone = document.getElementById('profilePhone').value;
  
  try {
    const response = await fetch(`${API_URL}/students/profile`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ firstName, lastName, parentEmail, phone })
    });
    
    if (response.ok) {
      alert('Profile updated successfully!');
      loadStudentPage('profile');
    } else {
      const error = await response.json();
      alert('Update failed: ' + error.error);
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

function downloadReceipt(receiptNumber) {
  const receiptContent = `
    <div class="receipt">
      <div class="receipt-header">
        <h2>Payment Receipt</h2>
        <p>Receipt #: ${receiptNumber}</p>
      </div>
      <div class="receipt-body">
        <div class="receipt-row">
          <span>Date:</span>
          <span>${new Date().toLocaleDateString('en-NG')}</span>
        </div>
        <div class="receipt-row total">
          <span>Amount Paid:</span>
          <span>₦0.00</span>
        </div>
      </div>
      <div class="receipt-footer">
        <p>Thank you for your payment!</p>
      </div>
    </div>
  `;
  
  const element = document.createElement('div');
  element.innerHTML = receiptContent;
  
  const opt = {
    margin: 10,
    filename: `receipt-${receiptNumber}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
  };
  
  html2pdf().set(opt).from(element).save();
}

// ADMIN DASHBOARD
function showAdminDashboard() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark">
      <div class="container-fluid">
        <span class="navbar-brand">School Fees Admin Panel</span>
        <div>
          <button class="btn btn-outline-light me-2" onclick="loadAdminPage('dashboard')">Dashboard</button>
          <button class="btn btn-outline-light me-2" onclick="loadAdminPage('students')">Students</button>
          <button class="btn btn-outline-light me-2" onclick="loadAdminPage('payments')">Payments</button>
          <button class="btn btn-outline-light" onclick="logout()">Logout</button>
        </div>
      </div>
    </nav>
    <div class="container-main">
      <div id="admin-content"></div>
    </div>
  `;
  
  loadAdminPage('dashboard');
}

async function loadAdminPage(page) {
  const content = document.getElementById('admin-content');
  const token = localStorage.getItem('token');
  
  if (page === 'dashboard') {
    try {
      const response = await fetch(`${API_URL}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const stats = await response.json();
      
      content.innerHTML = `
        <div class="row mb-4">
          <div class="col-md-4">
            <div class="dashboard-card total-fees">
              <h5>Total Students</h5>
              <h2>${stats.total_students}</h2>
            </div>
          </div>
          <div class="col-md-4">
            <div class="dashboard-card paid-fees">
              <h5>Total Paid</h5>
              <h2>₦${(stats.total_paid_fees || 0).toLocaleString('en-NG', {minimumFractionDigits: 2})}</h2>
            </div>
          </div>
          <div class="col-md-4">
            <div class="dashboard-card unpaid-fees">
              <h5>Total Unpaid</h5>
              <h2>₦${(stats.total_unpaid_fees || 0).toLocaleString('en-NG', {minimumFractionDigits: 2})}</h2>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      content.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    }
  } else if (page === 'students') {
    try {
      const response = await fetch(`${API_URL}/admin/students`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const students = await response.json();
      
      content.innerHTML = `
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">All Students</h5>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Class</th>
                    <th>Email</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  ${students.map(s => `
                    <tr>
                      <td>${s.student_id}</td>
                      <td>${s.first_name} ${s.last_name}</td>
                      <td>${s.class}</td>
                      <td>${s.parent_email || 'N/A'}</td>
                      <td>${s.phone || 'N/A'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      content.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    }
  } else if (page === 'payments') {
    try {
      const response = await fetch(`${API_URL}/admin/payments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const payments = await response.json();
      
      content.innerHTML = `
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">All Payments</h5>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Transaction Ref</th>
                  </tr>
                </thead>
                <tbody>
                  ${payments.map(p => `
                    <tr>
                      <td>${p.first_name} ${p.last_name}</td>
                      <td>₦${p.amount.toLocaleString('en-NG', {minimumFractionDigits: 2})}</td>
                      <td>${new Date(p.created_at).toLocaleDateString('en-NG')}</td>
                      <td><span class="badge badge-${p.status}">${p.status.toUpperCase()}</span></td>
                      <td>${p.transaction_ref || 'N/A'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      content.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    }
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('userRole');
  checkAuth();
}
