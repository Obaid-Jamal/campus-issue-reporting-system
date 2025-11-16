// --- Global Client-Side Variables ---
let currentUser = null;
let currentLanguage = 'english';

// Caching variables for dashboard data to avoid constant fetching
let myFetchedIssues = [];    // For student dashboard
let allFetchedIssues = [];   // For admin dashboard
let allFetchedUsers = [];    // For admin dashboard

// --- NEW: Audio Recording Variables ---
let mediaRecorder;
let audioChunks = [];
let audioDataUrl = null; // This will hold the Base64 data

// Translation object (simplified)
const translations = {
  english: {
    portalTitle: 'Campus Issue Reporting Portal',
    citizenPortal: 'Campus Issue Reporting Portal',
    loginToPortal: 'Login to Portal',
    newUserRegistration: 'New Student Registration',
    keyFeatures: 'Key Features',
    reportProblems: 'Report Issues',
    trackProgress: 'Track Progress',
    viewMap: 'Campus Map',
    mobileFriendly: 'Mobile Friendly'
  }
};

// Create floating particles function
function createParticles() {
  const particles = document.getElementById('particles');
  if (!particles) return;

  particles.innerHTML = '';

  for (let i = 0; i < 50; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 6 + 's';
    particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
    particles.appendChild(particle);
  }
}

// Global click handler for closing navigation menu
document.addEventListener('click', function(event) {
  const menu = document.getElementById('navMenu');
  const toggle = document.getElementById('navMenuToggle');
  if (menu && toggle && !toggle.contains(event.target) && !menu.contains(event.target)) {
    menu.classList.remove('show');
  }
  
  const adminNotify = document.getElementById('admin-notifications');
  const studentNotify = document.getElementById('student-notifications');
  const notifyBell = event.target.closest('.notification-bell');
  
  if (adminNotify && !adminNotify.contains(event.target) && !notifyBell) {
      adminNotify.classList.remove('show');
  }
  if (studentNotify && !studentNotify.contains(event.target) && !notifyBell) {
      studentNotify.classList.remove('show');
  }
});

// Toast notification system
function showToast(message, type = 'success') {
  const toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
    ${message}
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 3000);
  }, 3000);
}

// Navigation menu toggle function (global)
function toggleNavigationMenu() {
  const menu = document.getElementById('navMenu');
  if (menu) {
    menu.classList.toggle('show');
  }
}

// Notification menu toggle function
function toggleNotificationMenu(menuId) {
    const menu = document.getElementById(menuId);
    if (menu) {
        menu.classList.toggle('show');
    }
}

// Logout functionality - NEW: Calls logout.php
async function logout() {
  try {
    // Tell the server to destroy the session
    await fetch('api/logout.php', { method: 'POST' });
  } catch (e) {
    console.error("Logout fetch failed:", e);
  }
  
  currentUser = null;
  localStorage.removeItem('currentUser');
  window.location.href = 'index.html';
}

// --- Password Validation Functions ---
function validatePassword(password) {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);

  if (password.length < minLength) {
    return { isValid: false, message: "Password must be at least 8 characters long." };
  }
  if (!hasUppercase) {
    return { isValid: false, message: "Password must contain at least one uppercase letter." };
  }
  if (!hasNumber) {
    return { isValid: false, message: "Password must contain at least one number." };
  }
  if (!hasSpecial) {
    return { isValid: false, message: "Password must contain at least one special character (!@#$%)." };
  }
  
  return { isValid: true, message: "Password is strong!" };
}

function validatePasswordRules(password, idPrefix = 'rule-') {
    const rules = {
        'length': password.length >= 8,
        'uppercase': /[A-Z]/.test(password),
        'number': /[0-9]/.test(password),
        'special': /[!@#$%]/.test(password)
    };

    for (const ruleKey in rules) {
        const ruleElement = document.getElementById(`${idPrefix}${ruleKey}`);
        if (ruleElement) {
            if (rules[ruleKey]) {
                ruleElement.classList.add('valid');
            } else {
                ruleElement.classList.remove('valid');
            }
        }
    }
}


// Helper functions for icons and formatting
function getStatusIcon(status) {
  const icons = {
    "Resolved": "✅",
    "In Progress": "⏳",
    "Submitted": "📩"
  };
  return icons[status] || "📋";
}

function getCategoryIcon(category) {
  const icons = {
    "classroom": "🏫",
    "fans": "🌀",
    "cleanliness": "🧹",
    "property": "🔧",
    "furniture": "🪑",
    "electrical": "💡",
    "plumbing": "🚰",
    "other": "📝"
  };
  return icons[category] || "📋";
}

function getCategoryName(category) {
  const names = {
    "classroom": "Classroom",
    "fans": "Fans & Ventilation",
    "cleanliness": "Cleanliness",
    "property": "Property Damage",
    "furniture": "Furniture",
    "electrical": "Electrical",
    "plumbing": "Plumbing & Water",
    "other": "Other"
  };
  return names[category] || "Unknown";
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function getDepartmentName(department) {
  const departmentNames = {
    "cse": "CSE (Computer Science)",
    "it": "IT (Information Tech)",
    "mechanical": "Mechanical Engineering",
    "ece": "ECE (Electronics & Comm.)",
    "electrical": "Electrical Engineering",
    "mtech": "M.Tech",
    "bpharma": "B.Pharma",
    "commerce": "Commerce",
    "other": "Other",
    "administration": "Administration",
    "computer-science": "Computer Science",
    "civil": "Civil Engineering",
    "arts": "Arts",
  };
  return departmentNames[department] || department;
}

// PAGE-SPECIFIC INITIALIZATION
document.addEventListener('DOMContentLoaded', function() {
  createParticles();

  // *** LOCALSTORAGE: Load ONLY the currentUser object ***
  const storedUser = localStorage.getItem('currentUser');
  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
    } catch (e) {
      console.error("Error parsing currentUser from localStorage:", e);
      currentUser = null;
      localStorage.removeItem('currentUser');
    }
  }

  // Initialize based on current page
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  // Initialize navigation if present
  const navTabs = document.querySelectorAll('[data-section]');
  if (navTabs.length > 0) {
    navTabs.forEach(tab => {
      tab.addEventListener('click', function(e) {
        e.preventDefault();
        const sectionId = this.getAttribute('data-section');
        switchSection(sectionId);
      });
    });
  }

  // Page-specific initialization
  if (currentPage === 'index.html' || currentPage === '') {
    initializeHomePage();
  } else if (currentPage === 'login.html') {
    initializeLoginPage();
  } else if (currentPage === 'signup.html') {
    initializeSignupPage();
  } else if (currentPage === 'student_dashboard.html') {
    initializeCitizenDashboard();
  } else if (currentPage === 'admin_dashboard.html') { 
    initializeAdminDashboard();
  }
});


// HOME PAGE FUNCTIONS
function initializeHomePage() {
  if (currentUser && currentUser.username) {
    const welcomeMessage = document.getElementById('welcomeMessage');
    if (welcomeMessage) {
      welcomeMessage.textContent = 'You are already logged in! Use the buttons below to access your dashboard.';
    }

    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');

    if (loginBtn && signupBtn) {
      if (currentUser.role === 'admin') {
        loginBtn.innerHTML = '<i class="fas fa-tachometer-alt"></i><span>Admin Dashboard</span>';
        loginBtn.onclick = () => window.location.href = 'admin_dashboard.html';
        signupBtn.style.display = 'none';
      } else {
        loginBtn.innerHTML = '<i class="fas fa-user"></i><span>Student Dashboard</span>';
        loginBtn.onclick = () => window.location.href = 'student_dashboard.html';
        signupBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i><span>Logout</span>';
        signupBtn.onclick = () => logout();
      }
    }
  }
}

function updateHomePageLanguage() {
  // Page is now English only, no updates needed
}

// LOGIN PAGE FUNCTIONS - UPDATED
function initializeLoginPage() {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      // CHANGED: Reading from 'loginId'
      const username = document.getElementById("loginId")?.value.trim();
      const password = document.getElementById("loginPassword")?.value;

      // CHANGED: Removed role check
      if (!username || !password) {
        showToast("Please fill all fields", "error");
        return;
      }
      
      const submitBtn = e.target.querySelector('button');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<div class="loading"></div> Signing in...';
      submitBtn.disabled = true;

      try {
        const response = await fetch('api/login.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // CHANGED: Only sending username and password
          body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (result.success) {
          localStorage.setItem('currentUser', JSON.stringify(result.user));
          
          if (result.user.role === "user") {
            window.location.href = 'student_dashboard.html';
          } else {
            window.location.href = 'admin_dashboard.html';
          }
        } else {
          showToast(result.message || "Invalid login.", "error");
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        }
      } catch (error) {
        console.error("Login Error:", error);
        showToast("A network error occurred. Please try again.", "error");
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  }
}

function updateLoginPageLanguage() {
  // Page is now English only, no updates needed
}

// SIGNUP PAGE FUNCTIONS
function initializeSignupPage() {
  const passwordInput = document.getElementById('signupPassword');
  if (passwordInput) {
    passwordInput.addEventListener('input', function() {
      validatePasswordRules(passwordInput.value, 'rule-');
    });
  }

  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      const firstName = document.getElementById("signupFirstName")?.value.trim();
      const lastName = document.getElementById("signupLastName")?.value.trim();
      const erp = document.getElementById("signupErp")?.value.trim();
      const password = document.getElementById("signupPassword")?.value;
      const confirmPassword = document.getElementById("signupConfirmPassword")?.value;
      const department = document.getElementById("signupDepartment")?.value;

      if (!firstName || !lastName || !erp || !password || !confirmPassword || !department) {
        showToast("Please fill all fields", "error");
        return;
      }
      
      if (password !== confirmPassword) {
          showToast("Passwords do not match.", "error");
          return;
      }

      const passwordCheck = validatePassword(password);
      if (!passwordCheck.isValid) {
          showToast(passwordCheck.message, "error");
          return;
      }

      const submitBtn = e.target.querySelector('button');
      submitBtn.innerHTML = '<div class="loading"></div> Registering...';
      submitBtn.disabled = true;

      try {
        const response = await fetch('api/register.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firstName, lastName, erp, password, department })
        });

        const result = await response.json();

        if (result.success) {
          showToast(`Registration successful! Welcome ${firstName}, you can now login`);
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 1500);
        } else {
          showToast(result.message || "Registration failed.", "error");
          submitBtn.innerHTML = '<span>Register Account</span>';
          submitBtn.disabled = false;
        }
      } catch (error) {
        console.error("Signup Error:", error);
        showToast("A network error occurred. Please try again.", "error");
        submitBtn.innerHTML = '<span>Register Account</span>';
        submitBtn.disabled = false;
      }
    });
  }

  // Auto-format first/last name
  const firstNameInput = document.getElementById('signupFirstName');
  if (firstNameInput) {
    firstNameInput.addEventListener('input', function(e) {
      e.target.value = e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1);
    });
  }

  const lastNameInput = document.getElementById('signupLastName');
  if (lastNameInput) {
    lastNameInput.addEventListener('input', function(e) {
      e.target.value = e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1);
    });
  }
}

function updateSignupPageLanguage() {
  // Page is now English only, no updates needed
}

// CITIZEN DASHBOARD FUNCTIONS
function initializeCitizenDashboard() {
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }
    
  initializeNavigation();
  initializeIssueForm();
  loadUserReports(); // This will fetch data and call updateStudentNotifications
  initializePasswordChangeForm();
}

// USES FORMDATA and FETCH (with FINAL audio constraints)
function initializeIssueForm() {
  const issueForm = document.getElementById('issueForm');
  if (!issueForm) return;

  const photoInput = document.getElementById('issuePhoto');
  const filePreviewContainer = document.getElementById('filePreviewContainer');
  const recordButton = document.getElementById('recordButton');
  const audioPreviewContainer = document.getElementById('audioPreviewContainer');
  const audioPlayer = document.getElementById('audioPlayer');

  // --- Audio Recording Logic ---
  if (recordButton) {
      recordButton.addEventListener('click', async () => {
          if (!mediaRecorder || mediaRecorder.state === "inactive") {
              try {
                  // --- THIS IS THE CRITICAL FIX ---
                  // We are now asking for a raw, unprocessed audio stream.
                  const constraints = {
                      audio: {
                          echoCancellation: false,
                          noiseSuppression: false,
                          autoGainControl: false
                      }
                  };
                  const stream = await navigator.mediaDevices.getUserMedia(constraints);
                  // --- END OF CRITICAL FIX ---

                  const options = { mimeType: 'audio/webm;codecs=opus' };
                  if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                      console.warn(`${options.mimeType} is not supported, using default.`);
                      mediaRecorder = new MediaRecorder(stream);
                  } else {
                      mediaRecorder = new MediaRecorder(stream, options);
                  }

                  audioChunks = []; // Clear previous chunks
                  
                  mediaRecorder.ondataavailable = event => {
                      audioChunks.push(event.data);
                  };

                  mediaRecorder.onstop = () => {
                      if (audioChunks.length === 0 || audioChunks[0].size === 0) {
                          showToast("Recording failed: No audio data captured. Please check mic.", "error");
                          audioPreviewContainer.style.display = 'none';
                          audioDataUrl = null;
                          return;
                      }

                      const audioBlob = new Blob(audioChunks, { type: audioChunks[0].type });
                      
                      const reader = new FileReader();
                      reader.onloadend = () => {
                          audioDataUrl = reader.result;
                          audioPlayer.src = audioDataUrl;
                          audioPreviewContainer.style.display = 'block';
                          showToast("Recording saved!", "success");
                      };
                      reader.readAsDataURL(audioBlob);
                  };

                  mediaRecorder.start();
                  recordButton.innerHTML = '<i class="fas fa-stop-circle"></i> Stop Recording';
                  recordButton.classList.add('btn-danger');

              } catch (err) {
                  console.error("Error accessing microphone:", err);
                  showToast("Microphone access denied or not found.", "error");
              }
          } else {
              // Stop recording
              mediaRecorder.stop();
              recordButton.innerHTML = '<i class="fas fa-microphone"></i> Record Voice Note';
              recordButton.classList.remove('btn-danger');
          }
      });
  }

  // Add image preview functionality
  if (photoInput && filePreviewContainer) {
    photoInput.addEventListener('change', function(e) {
      const files = Array.from(e.target.files);
      filePreviewContainer.innerHTML = '';
      if (files.length === 0) return;
      files.forEach(file => {
          const fileItem = document.createElement('div');
          fileItem.className = 'file-preview-item';
          fileItem.textContent = `📄 ${file.name}`;
          filePreviewContainer.appendChild(fileItem);
      });
    });
  }

  // --- Form Submission (This part is unchanged and correct) ---
  issueForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const submitBtnText = document.getElementById('submitButtonText');
    const originalBtnText = submitBtnText.textContent;

    const description = document.getElementById('issueDescription')?.value.trim();
    const category = document.getElementById('issueCategory')?.value;
    const block = document.getElementById('issueBlock')?.value;
    const room = document.getElementById('issueRoom')?.value.trim();

    if (!description || !category || !block) {
      showToast("Please fill in all required fields", "error");
      return;
    }
    
    submitBtn.disabled = true;
    submitBtnText.innerHTML = `<span class="loading-spinner"></span> Submitting...`;

    const formData = new FormData();
    formData.append('description', description);
    formData.append('category', category);
    formData.append('block', block);
    formData.append('room', room);
    formData.append('audioDataUrl', audioDataUrl);

    const blockNames = {
      'block-a': 'Block A', 'block-b': 'Block B', 'block-c': 'Block C',
      'block-d': 'Block D', 'block-e': 'Block E', 'girls-hostel': 'Girls Hostel',
      'boys-hostel': 'Boys Hostel', 'library': 'Library'
    };
    const blockName = blockNames[block] || block;
    const locationStr = room ? `${blockName}, ${room}` : blockName;
    formData.append('location', locationStr);

    const files = photoInput ? Array.from(photoInput.files) : [];
    if (files.length > 0) {
      files.forEach((file) => {
        formData.append('issuePhoto[]', file);
      });
    }

    try {
      const response = await fetch('api/submit_issue.php', {
        method: 'POST',
        body: formData 
      });
      
      const result = await response.json();

      if (result.success) {
        showToast("Issue reported successfully!");
        issueForm.reset();
        if(filePreviewContainer) filePreviewContainer.innerHTML = '';
        if(audioPreviewContainer) audioPreviewContainer.style.display = 'none';
        if(audioPlayer) audioPlayer.src = '';
        audioDataUrl = null;
        
        loadUserReports();
        
        setTimeout(() => switchSection('track'), 1000);
      } else {
        showToast(result.message || "Submission failed.", "error");
      }
    } catch (error) {
      console.error("Submission Error:", error);
      showToast("A network error occurred. Please try again.", "error");
    } finally {
      submitBtn.disabled = false;
      if (submitBtnText) {
          submitBtnText.innerHTML = originalBtnText;
      }
    }
  });
}

// FETCHES user's reports (with NEW Delete button logic)
async function loadUserReports() {
  if (!currentUser) return;

  const tbody = document.getElementById('userReportsTable');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Loading...</td></tr>';

  try {
    // -----------------------------------------------------------------
    // --- THIS IS THE CACHE FIX ---
    const response = await fetch('api/get_data.php?action=getMyIssues', { cache: 'no-cache' });
    // -----------------------------------------------------------------
    const result = await response.json();

    if (!result.success) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">Error: ${result.message}</td></tr>`;
      return;
    }

    myFetchedIssues = result.data; // Cache the data
    tbody.innerHTML = "";
    
    if (myFetchedIssues.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: #718096;">You have not reported any issues yet.</td></tr>';
        updateStudentNotifications(myFetchedIssues); // Update bell
        return;
    }

    myFetchedIssues.forEach(report => {
      const row = document.createElement("tr");
      const statusClass = `status-${report.status.toLowerCase().replace(' ', '')}`;

      // --- NEW: Build the actions HTML with Delete button ---
      let actionsHtml = `<button class="btn btn-secondary" onclick='viewReportDetails(${JSON.stringify(report)})'>
                            <i class="fas fa-eye"></i> View
                         </button>`;
      
      // Add Delete button ONLY if status is "Submitted"
      if (report.status === 'Submitted') {
          actionsHtml += `
            <button class="btn btn-danger" onclick="confirmDeleteIssue(${report.id})" style="margin-left: 0.5rem;">
                <i class="fas fa-trash-alt"></i> Delete
            </button>`;
      }
      // --- END OF NEW PART ---

      row.innerHTML = `
        <td>
          <div style="font-weight: 500;">${report.description}</div>
          <small style="color: #718096;">📍 ${report.location}</small>
        </td>
        <td>
          <span style="display: flex; align-items: center; gap: 0.5rem;">
            ${getCategoryIcon(report.category)}
            ${getCategoryName(report.category)}
          </span>
        </td>
        <td>
          <span class="status-badge ${statusClass}">
            ${getStatusIcon(report.status)}
            ${report.status}
          </span>
        </td>
        <td>${formatDate(report.dateSubmitted)}</td>
        <td>
          ${actionsHtml} 
        </td>
      `;
      tbody.appendChild(row);
    });
    
    updateStudentNotifications(myFetchedIssues); // Update bell

  } catch (error) {
    console.error("Error loading user reports:", error);
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Could not load reports.</td></tr>';
  }
}

// NEW: Shows a confirmation modal before deleting
function confirmDeleteIssue(issueId) {
    const modalContent = `
        <div style="padding: 1.5rem; text-align: center;">
          <h3 style="color: #DC143C; margin-bottom: 1rem;">Confirm Deletion</h3>
          <p style="color: #4a5568; margin-bottom: 1.5rem;">
            Are you sure you want to delete this issue report? 
            <br>This action cannot be undone.
          </p>
          <div style="display: flex; gap: 1rem; justify-content: center;">
            <button class="btn btn-secondary" onclick="closeModal()">
              <i class="fas fa-times"></i> Cancel
            </button>
            <button class="btn btn-danger" onclick="deleteIssue(${issueId})">
              <i class="fas fa-trash-alt"></i> Delete Issue
            </button>
          </div>
        </div>
    `;
    showModal(modalContent);
}

// NEW: Calls the API to delete the issue
async function deleteIssue(issueId) {
    try {
      const response = await fetch('api/delete_issue.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueId: issueId })
      });
      const result = await response.json();
      
      if (result.success) {
          showToast(result.message, 'success');
          loadUserReports(); // Refresh the list
          closeModal();
      } else {
          showToast(result.message, 'error');
          closeModal();
      }
    } catch(e) {
      showToast('A network error occurred', 'error');
      closeModal();
    }
}


function updateCitizenDashboardLanguage() {
  // (No changes needed)
}

// ADMIN DASHBOARD FUNCTIONS
function initializeAdminDashboard() {
  if (!currentUser || currentUser.role !== 'admin') {
     window.location.href = 'login.html';
     return;
  }
    
  initializeNavigation();
  loadAllReports(); // This will fetch, render, and call analytics/notifications
  loadAllUsers(); // This will fetch and render
  initializeFilters();
  initializeAdminPasswordChangeForm();
}

function initializeFilters() {
  const statusFilter = document.getElementById('statusFilter');
  const categoryFilter = document.getElementById('categoryFilter');
  const userIssueFilter = document.getElementById('userIssueFilter');

  if (statusFilter) {
    statusFilter.addEventListener('change', function() {
      // Re-filter and render using cached data
      renderAllReports(this.value, categoryFilter.value);
    });
  }
  if (categoryFilter) {
    categoryFilter.addEventListener('change', function() {
      // Re-filter and render using cached data
      renderAllReports(statusFilter.value, this.value);
    });
  }
  if (userIssueFilter) {
    userIssueFilter.addEventListener('change', function() {
      renderAllUsers(this.value);
    });
  }
}

// NEW: Fetches ALL reports
async function loadAllReports() {
  const tbody = document.getElementById('allReportsTable');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Loading...</td></tr>';

  try {
    // -----------------------------------------------------------------
    // --- THIS IS THE CACHE FIX ---
    const response = await fetch('api/get_data.php?action=getAllIssues', { cache: 'no-cache' });
    // -----------------------------------------------------------------
    const result = await response.json();

    if (!result.success) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Error: ${result.message}</td></tr>`;
      return;
    }
    
    allFetchedIssues = result.data; // Cache the data
    
    // Initial render
    renderAllReports('all', 'all');
    
    // Update other UI components
    updateAnalytics(allFetchedIssues);
    updateAdminNotifications(allFetchedIssues);

  } catch (error) {
    console.error("Error loading all reports:", error);
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Could not load reports.</td></tr>';
  }
}

// NEW: Renders reports from cached data
function renderAllReports(filter = 'all', categoryFilter = 'all') {
  const tbody = document.getElementById('allReportsTable');
  if (!tbody) return;

  tbody.innerHTML = "";

  // Apply filters to cached data
  let filteredReports = allFetchedIssues;
  if (filter !== 'all') {
    filteredReports = filteredReports.filter(report => 
      report.status.toLowerCase().replace(' ', '') === filter.toLowerCase().replace(' ', '')
    );
  }
  if (categoryFilter !== 'all') {
    filteredReports = filteredReports.filter(report => 
      report.category === categoryFilter
    );
  }
  
  if (filteredReports.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: #718096;">No reports found matching filters.</td></tr>';
      return;
  }

  filteredReports.forEach(report => {
    const row = document.createElement("tr");
    const statusClass = `status-${report.status.toLowerCase().replace(' ', '')}`;
    const reportJson = JSON.stringify(report); // Pass full object

    // Check for photos/audio
    let photoIcon = '';
    if (report.photo_paths && report.photo_paths.length > 2) { // 2 chars is '[]'
      try {
        photoIcon = `<br><small style="color: #FF8C00;">📷 ${JSON.parse(report.photo_paths).length} photo(s)</small>`;
      } catch(e){}
    }
    const audioIcon = report.audio_path ? '<br><small style="color: #667eea;">🎤 Audio Note</small>' : '';

    row.innerHTML = `
      <td><strong>#${report.id}</strong></td>
      <td>
        <div style="font-weight: 500; margin-bottom: 0.25rem;">${report.description}</div>
        <small style="color: #718096;">📍 ${report.location}</small>
        ${photoIcon}
        ${audioIcon}
      </td>
      <td>
        <span style="display: flex; align-items: center; gap: 0.5rem;">
          ${getCategoryIcon(report.category)}
          ${getCategoryName(report.category)}
        </span>
      </td>
      <td>
        <span class="status-badge ${statusClass}">
          ${getStatusIcon(report.status)}
          ${report.status}
        </span>
      </td>
      <td>${formatDate(report.dateSubmitted)}</td>
      <td>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button class="btn btn-secondary" onclick='viewReportDetailsAdmin(${reportJson})' style="font-size: 0.75rem;">
            <i class="fas fa-eye"></i> View
          </button>
          ${report.status !== "Resolved" ?
            `<button class="btn btn-secondary" onclick="updateIssueStatus(${report.id}, 'In Progress')" style="font-size: 0.75rem;">
              <i class="fas fa-play"></i> Start
            </button>
            <button class="btn btn-success" onclick="promptForResolution(${report.id})" style="font-size: 0.75rem;">
              <i class="fas fa-check"></i> Resolve
            </button>` :
            '<span style="color: #10b981; font-weight: 500;"><i class="fas fa-check-circle"></i> Complete</span>'
          }
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// NEW: Function to show resolution comment modal
function promptForResolution(issueId) {
    const modalContent = `
        <div style="padding: 1.5rem;">
          <h3 style="color: #DC143C; margin-bottom: 1rem;">Resolve Issue #${issueId}</h3>
          <p style="color: #4a5568; margin-bottom: 1.5rem;">
            Please add a comment for the student (e.g., "Fan replaced in Room 301").
          </p>
          <div class="form-group">
            <textarea class="form-textarea" id="adminCommentText" 
                      placeholder="Enter resolution comment..." style="min-height: 100px;"></textarea>
          </div>
          <div style="display: flex; gap: 1rem; justify-content: flex-end;">
            <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn btn-success" 
                    onclick="submitResolution(${issueId})">
              <i class="fas fa-check"></i> Confirm Resolution
            </button>
          </div>
        </div>
    `;
    showModal(modalContent);
}

// NEW: Function called by the resolution modal's "Confirm" button
async function submitResolution(issueId) {
    const comment = document.getElementById('adminCommentText').value.trim();
    if (!comment) {
        showToast("Please enter a comment before resolving.", "error");
        return;
    }
    
    // Call the existing updateIssueStatus function, but pass the comment
    await updateIssueStatus(issueId, 'Resolved', comment);
    closeModal();
}


function filterReports(status) {
  const category = document.getElementById('categoryFilter')?.value || 'all';
  renderAllReports(status, category);
}

function filterReportsByCategory(category) {
  const status = document.getElementById('statusFilter')?.value || 'all';
  renderAllReports(status, category);
}

// NEW: Shows report details from DB paths
function viewReportDetailsAdmin(report) {
  // Find the user name from our cached user list
  const user = allFetchedUsers.find(u => u.username === report.submittedBy);
  const userName = user ? `${user.firstName} ${user.lastName}` : (report.submittedBy === 'admin' ? 'Admin' : report.submittedBy);

  let photosHtml = '';
  if (report.photo_paths && report.photo_paths.length > 2) { // > '[]'
    try {
      const photoPaths = JSON.parse(report.photo_paths);
      if (photoPaths.length > 0) {
        photosHtml = '<div style="margin-top: 1rem;"><strong>Uploaded Photos:</strong><div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem; margin-top: 0.5rem;">';
        photoPaths.forEach((path, index) => {
          photosHtml += `<img src="${path}" alt="Issue Photo ${index + 1}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; border: 2px solid #e2e8f0;">`;
        });
        photosHtml += '</div></div>';
      }
    } catch (e) {}
  }

  let audioHtml = '';
  if (report.audio_path) {
      audioHtml = `
        <div style="margin-top: 1rem;">
          <strong>Audio Recording:</strong>
          <audio controls src="${report.audio_path}" style="width: 100%; margin-top: 0.5rem;"></audio>
        </div>`;
  }

  // NEW: HTML for displaying the admin comment
  const commentHtml = `
    ${report.admin_comment ? 
    `<div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e2e8f0;">
        <strong style="color: #10b981;"><i class="fas fa-comment-dots"></i> Admin Comment:</strong>
        <p style="margin-top: 0.5rem; background: #f0fff4; padding: 0.75rem; border-radius: 8px;">
            ${report.admin_comment}
        </p>
     </div>` : ''}
  `;

  const detailsHtml = `
    <div style="padding: 1.5rem;">
      <h3 style="color: #DC143C; margin-bottom: 1rem;">Issue #${report.id} Details</h3>
      <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
        <div style="margin-bottom: 0.5rem;"><strong>Description:</strong> ${report.description}</div>
        <div style="margin-bottom: 0.5rem;"><strong>Location:</strong> 📍 ${report.location}</div>
        <div style="margin-bottom: 0.5rem;"><strong>Category:</strong> ${getCategoryIcon(report.category)} ${getCategoryName(report.category)}</div>
        <div style="margin-bottom: 0.5rem;"><strong>Status:</strong> ${getStatusIcon(report.status)} ${report.status}</div>
        <div style="margin-bottom: 0.5rem;"><strong>Submitted By:</strong> ${userName}</div>
        <div style="margin-bottom: 0.5rem;"><strong>Date:</strong> ${formatDate(report.dateSubmitted)}</div>
        ${audioHtml}
        ${photosHtml}
        ${commentHtml} </div>
      <button class="btn-primary" onclick="closeModal()" style="width: 100%;">
        <i class="fas fa-times"></i> Close
      </button>
    </div>
  `;
  showModal(detailsHtml);
}

function showModal(content) {
  const modal = document.createElement('div');
  modal.id = 'detailsModal';
  modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000; padding: 1rem;';
  
  const modalContent = document.createElement('div');
  modalContent.style.cssText = 'background: white; border-radius: 12px; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto;';
  modalContent.innerHTML = content;
  
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });
}

function closeModal() {
  const modal = document.getElementById('detailsModal');
  if (modal) {
    modal.remove();
  }
}

// NEW: Fetches all users
async function loadAllUsers() {
  const tbody = document.getElementById('usersTable');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Loading...</td></tr>';

  try {
    // -----------------------------------------------------------------
    // --- THIS IS THE CACHE FIX ---
    const response = await fetch('api/get_data.php?action=getAllUsers', { cache: 'no-cache' });
    // -----------------------------------------------------------------
    const result = await response.json();

    if (!result.success) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">Error: ${result.message}</td></tr>`;
      return;
    }
    
    allFetchedUsers = result.data; // Cache users
    renderAllUsers('all'); // Initial render

  } catch (error) {
    console.error("Error loading all users:", error);
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Could not load users.</td></tr>';
  }
}

// NEW: Renders users from cached data
function renderAllUsers(filter = 'all') {
  const tbody = document.getElementById('usersTable');
  if (!tbody) return;

  tbody.innerHTML = "";

  // Filter cached users
  let filteredUsers = allFetchedUsers;
  if (filter === 'active') {
    filteredUsers = allFetchedUsers.filter(user => user.issueCount > 0);
  } else if (filter === 'inactive') {
    filteredUsers = allFetchedUsers.filter(user => user.issueCount == 0);
  }
  
  if (filteredUsers.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: #718096;">No users found.</td></tr>';
      return;
  }

  filteredUsers.forEach(user => {
    const issueCount = user.issueCount; // This now comes from the server
    const row = document.createElement("tr");
    
    row.innerHTML = `
      <td>
        <div style="font-weight: 500;">${user.firstName} ${user.lastName}</div>
        <small style="color: #718096;">ERP: ${user.username}</small>
      </td>
      <td>
        <span style="display: flex; align-items: center; gap: 0.5rem;">
          <div style="background: ${issueCount > 0 ? '#10b981' : '#f59e0b'}; color: white; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.75rem;">
            ${issueCount}
          </div>
          ${issueCount > 0 ? 'Active' : 'New User'}
        </span>
      </td>
      <td>
        <span style="display: flex; align-items: center; gap: 0.5rem;">
          🎓 ${getDepartmentName(user.department)}
        </span>
      </td>
      <td>${formatDate(user.registrationDate)}</td>
      <td>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button class="btn btn-secondary" onclick="viewUserDetails('${user.username}')" style="font-size: 0.75rem;">
            <i class="fas fa-eye"></i> View
          </button>
          <button class="btn btn-secondary" onclick="exportUserData('${user.username}')" style="font-size: 0.75rem;">
            <i class="fas fa-download"></i> Export
          </button>
          <button class="btn btn-danger" onclick="confirmDeleteUser('${user.username}')" style="font-size: 0.75rem;">
            <i class="fas fa-trash-alt"></i> Delete
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function filterUsersByIssueCount(filter) {
  renderAllUsers(filter);
}

// Shows confirmation modal
function confirmDeleteUser(username) {
    const user = allFetchedUsers.find(u => u.username === username);
    if (!user) return;
    
    const modalContent = `
        <div style="padding: 1.5rem; text-align: center;">
          <h3 style="color: #DC143C; margin-bottom: 1rem;">Confirm Deletion</h3>
          <p style="color: #4a5568; margin-bottom: 1.5rem;">
            Are you sure you want to delete <strong>${user.firstName} ${user.lastName} (ERP: ${user.username})</strong>? 
            <br>This action cannot be undone.
          </p>
          <div style="display: flex; gap: 1rem; justify-content: center;">
            <button class="btn btn-secondary" onclick="closeModal()">
              <i class="fas fa-times"></i> Cancel
            </button>
            <button class="btn btn-danger" onclick="deleteUser('${user.username}')">
              <i class="fas fa-trash-alt"></i> Delete User
            </button>
          </div>
        </div>
    `;
    showModal(modalContent);
}

// NEW: Deletes user via API
async function deleteUser(username) {
    try {
      const response = await fetch('api/delete_user.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const result = await response.json();
      
      if (result.success) {
          showToast('User deleted successfully', 'success');
          allFetchedUsers = []; // Clear cache
          loadAllUsers(); // Re-fetch and render
          closeModal();
      } else {
          showToast(result.message || 'Error deleting user', 'error');
      }
    } catch(e) {
      showToast('A network error occurred', 'error');
    }
}


// NEW: Updates status via API (and accepts comment)
async function updateIssueStatus(issueId, newStatus, comment = null) {
  try {
    const response = await fetch('api/update_status.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issueId, newStatus, comment }) // Send comment
    });
    const result = await response.json();
    
    if (result.success) {
      showToast(`Issue #${issueId} status updated to: ${newStatus}`, 'success');
      allFetchedIssues = []; // Clear cache
      loadAllReports(); // Re-fetch, re-render, re-calc analytics
      
      myFetchedIssues = []; // Clear student cache too, in case
    } else {
      showToast(result.message || 'Error updating status', 'error');
    }
  } catch(e) {
    showToast('A network error occurred', 'error');
  }
}

// NEW: Reads from passed-in data
function updateAnalytics(reports) {
  const totalReports = reports.length;
  const resolved = reports.filter(r => r.status === "Resolved").length;
  const inProgress = reports.filter(r => r.status === "In Progress").length;
  
  // -----------------------------------------------------------------
  // --- THIS IS THE TYPO FIX: ..length is now .length ---
  const pending = reports.filter(r => r.status === "Submitted").length;
  // -----------------------------------------------------------------

  animateNumber("totalReports", totalReports);
  animateNumber("resolvedReports", resolved);
  animateNumber("inProgressReports", inProgress);
  animateNumber("pendingReports", pending);
}

function animateNumber(elementId, targetNumber) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const currentNumber = parseInt(element.textContent) || 0;
  const increment = (targetNumber - currentNumber) / 20;
  let current = currentNumber;

  const timer = setInterval(() => {
    current += increment;
    if ((increment > 0 && current >= targetNumber) || (increment < 0 && current <= targetNumber)) {
      element.textContent = targetNumber;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current);
    }
  }, 50);
}

function updateAdminDashboardLanguage() {
  // (No changes needed)
}

// --- Notification Functions (Now read from passed-in data) ---
function updateAdminNotifications(reports) {
    const countEl = document.getElementById('admin-notification-count');
    const listEl = document.getElementById('admin-notification-list');
    if (!countEl || !listEl) return;
    
    const pendingIssues = reports.filter(r => r.status === "Submitted");
    
    if (pendingIssues.length > 0) {
        countEl.textContent = pendingIssues.length;
        countEl.classList.add('show');
        listEl.innerHTML = '';
        
        pendingIssues.forEach(issue => {
            const item = document.createElement('div');
            item.className = 'notification-item';
            item.textContent = `New: "${issue.description.substring(0, 30)}..."`;
            item.onclick = () => {
                viewReportDetailsAdmin(issue);
                toggleNotificationMenu('admin-notifications');
            };
            listEl.appendChild(item);
        });
    } else {
        countEl.textContent = '0';
        countEl.classList.remove('show');
        listEl.innerHTML = '<div class="notification-item">No new issues.</div>';
    }
}

function updateStudentNotifications(reports) {
    const countEl = document.getElementById('student-notification-count');
    const listEl = document.getElementById('student-notification-list');
    if (!countEl || !listEl || !currentUser) return;
    
    // Note: This filters the student's reports that were passed in
    const updatedIssues = reports.filter(r => 
        r.submittedBy === currentUser.username && 
        (r.status === "In Progress" || r.status === "Resolved")
    );
    
    if (updatedIssues.length > 0) {
        countEl.textContent = updatedIssues.length;
        countEl.classList.add('show');
        listEl.innerHTML = '';
        
        updatedIssues.forEach(issue => {
            const item = document.createElement('div');
            item.className = 'notification-item';
            item.innerHTML = `${getStatusIcon(issue.status)} ${issue.status}: "${issue.description.substring(0, 30)}..."`;
            item.onclick = () => {
                viewReportDetails(issue);
                toggleNotificationMenu('student-notifications');
            };
            listEl.appendChild(item);
        });
    } else {
        countEl.textContent = '0';
        countEl.classList.remove('show');
        listEl.innerHTML = '<div class="notification-item">No new updates.</div>';
    }
}

// --- Password Change Functions (NEW: Use API) ---
function initializePasswordChangeForm() {
    const passwordForm = document.getElementById('passwordChangeForm');
    const newPasswordInput = document.getElementById('newPassword');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', () => {
            validatePasswordRules(newPasswordInput.value, 'account-rule-');
        });
    }
    if (passwordForm) {
        passwordForm.addEventListener('submit', handleChangePassword);
    }
}

// THIS IS THE FIXED FUNCTION
async function handleChangePassword(e) {
    e.preventDefault();
    
    let oldPassword, newPassword, confirmNewPassword;
    let formId = e.target.id;
    let rulePrefix = '';

    // Check which form was submitted and get the correct element IDs
    if (formId === 'passwordChangeForm') { // Student form
        oldPassword = document.getElementById('oldPassword').value;
        newPassword = document.getElementById('newPassword').value;
        confirmNewPassword = document.getElementById('confirmNewPassword').value;
        rulePrefix = 'account-rule-';
    } else if (formId === 'adminPasswordChangeForm') { // Admin form
        oldPassword = document.getElementById('adminOldPassword').value;
        newPassword = document.getElementById('adminNewPassword').value;
        confirmNewPassword = document.getElementById('adminConfirmNewPassword').value;
        rulePrefix = 'admin-rule-';
    } else {
        showToast("An unknown form error occurred.", "error");
        return;
    }

    // Check 1: Are fields empty?
    if (!oldPassword || !newPassword || !confirmNewPassword) {
        showToast("Please fill all fields", "error");
        return;
    }
    // Check 2: Do new passwords match?
    if (newPassword !== confirmNewPassword) {
        showToast("New passwords do not match.", "error");
        return;
    }
    // Check 3: Is the new password strong enough?
    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.isValid) {
        showToast(passwordCheck.message, "error");
        return;
    }

    // --- Call API ---
    try {
      const response = await fetch('api/change_password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const result = await response.json();

      if (result.success) {
          showToast("Password updated successfully!", "success");
          e.target.reset(); // This is fine
          
          validatePasswordRules('', rulePrefix);
          
          const mainTab = e.target.id.includes('admin') ? 'allReports' : 'report';
          setTimeout(() => switchSection(mainTab), 1500);
      } else {
          // This is where you see "Old password is not correct."
          showToast(result.message, "error");
      }
    } catch (error) {
      showToast("A network error occurred.", "error");
    }
}

function initializeAdminPasswordChangeForm() {
    const passwordForm = document.getElementById('adminPasswordChangeForm');
    const newPasswordInput = document.getElementById('adminNewPassword');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', () => {
            validatePasswordRules(newPasswordInput.value, 'admin-rule-');
        });
    }
    if (passwordForm) {
        passwordForm.addEventListener('submit', handleAdminChangePassword);
    }
}

// Admin form just calls the same universal function
function handleAdminChangePassword(e) {
    handleChangePassword(e);
}


// SHARED NAVIGATION FUNCTIONS
function initializeNavigation() {
  document.querySelectorAll('.nav-tab, .dropdown-nav-item').forEach(tab => {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      const sectionId = this.getAttribute('data-section');
      switchSection(sectionId);
      
      // Close dropdown menu on click
      const menu = document.getElementById('navMenu');
      if (menu) {
          menu.classList.remove('show');
      }
    });
  });
  
  // Set initial active tab
  const activeSection = document.querySelector('.section.active');
  if (activeSection) {
      // Check if a sectionId is valid, otherwise default
      const sectionId = activeSection.id || 'allReports'; // Default to 'allReports' or 'report'
      switchSection(sectionId);
  } else {
      // Default to the first tab if no section is active
      const firstTab = document.querySelector('.nav-tab, .dropdown-nav-item');
      if (firstTab) {
          switchSection(firstTab.getAttribute('data-section'));
      }
  }
}


function switchSection(sectionId) {
    if (!sectionId) {
        console.error("switchSection called with null or undefined sectionId");
        return;
    }
    
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });

  document.querySelectorAll('.nav-tab, .dropdown-nav-item').forEach(tab => {
    tab.classList.remove('active');
  });

  const targetSection = document.getElementById(sectionId);
  const targetTabs = document.querySelectorAll(`[data-section="${sectionId}"]`);

  if (targetSection) {
    targetSection.classList.add('active');
  }
  if (targetTabs) {
      targetTabs.forEach(tab => tab.classList.add('active'));
  }
}

// UTILITY FUNCTIONS
// NEW: Shows report details from DB paths
function viewReportDetails(report) {
  let photosHtml = '';
  if (report.photo_paths && report.photo_paths.length > 2) {
    try {
      const photoPaths = JSON.parse(report.photo_paths);
      if (photoPaths.length > 0) {
        photosHtml = '<div style="margin-top: 1rem;"><strong>Uploaded Photos:</strong><div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem; margin-top: 0.5rem;">';
        photoPaths.forEach((path, index) => {
          photosHtml += `<img src="${path}" alt="Issue Photo ${index + 1}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; border: 2px solid #e2e8f0;">`;
        });
        photosHtml += '</div></div>';
      }
    } catch (e) {}
  }

  let audioHtml = '';
  if (report.audio_path) {
      audioHtml = `
        <div style="margin-top: 1rem;">
          <strong>Audio Recording:</strong>
          <audio controls src="${report.audio_path}" style="width: 100%; margin-top: 0.5rem;"></audio>
        </div>`;
  }

  // NEW: HTML for displaying the admin comment
  const commentHtml = `
    ${report.admin_comment ? 
    `<div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e2e8f0;">
        <strong style="color: #10b981;"><i class="fas fa-comment-dots"></i> Admin Comment:</strong>
        <p style="margin-top: 0.5rem; background: #f0fff4; padding: 0.75rem; border-radius: 8px;">
            ${report.admin_comment}
        </p>
     </div>` : ''}
  `;

  const detailsHtml = `
    <div style="padding: 1.5rem;">
      <h3 style="color: #DC143C; margin-bottom: 1rem;">Issue #${report.id} Details</h3>
      <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
        <div style="margin-bottom: 0.5rem;"><strong>Description:</strong> ${report.description}</div>
        <div style="margin-bottom: 0.5rem;"><strong>Location:</strong> 📍 ${report.location}</div>
        <div style="margin-bottom: 0.5rem;"><strong>Category:</strong> ${getCategoryIcon(report.category)} ${getCategoryName(report.category)}</div>
        <div style="margin-bottom: 0.5rem;"><strong>Status:</strong> ${getStatusIcon(report.status)} ${report.status}</div>
        <div style="margin-bottom: 0.5rem;"><strong>Date:</strong> ${formatDate(report.dateSubmitted)}</div>
        ${audioHtml}
        ${photosHtml}
        ${commentHtml} </div>
      <button class="btn-primary" onclick="closeModal()" style="width: 100%;">
        <i class="fas fa-times"></i> Close
      </button>
    </div>
  `;
  showModal(detailsHtml);
}

// UPDATED: Now shows a full modal with user info
function viewUserDetails(username) {
  // Find the user from our cached list
  const user = allFetchedUsers.find(u => u.username === username);
  if (!user) {
    showToast("Error: Could not find user details.", "error");
    return;
  }

  // Find the user's issues from our cached list
  const userIssues = allFetchedIssues.filter(r => r.submittedBy === user.username);
  const resolvedCount = userIssues.filter(r => r.status === 'Resolved').length;

  const detailsHtml = `
    <div style="padding: 1.5rem;">
      <h3 style="color: #DC143C; margin-bottom: 1rem;">
        <i class="fas fa-user-circle"></i> User Profile
      </h3>
      <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
        
        <div style="margin-bottom: 0.5rem;">
          <strong>Name:</strong> ${user.firstName} ${user.lastName}
        </div>
        <div style="margin-bottom: 0.5rem;">
          <strong>ID/ERP:</strong> ${user.username}
        </div>
        <div style="margin-bottom: 0.5rem;">
          <strong>Department:</strong> 🎓 ${getDepartmentName(user.department)}
        </div>
        <div style="margin-bottom: 0.5rem;">
          <strong>Registered On:</strong> ${formatDate(user.registrationDate)}
        </div>
        <div style="margin-bottom: 0.5rem;">
          <strong>Total Reports:</strong> ${user.issueCount}
        </div>
        <div style="margin-bottom: 0.5rem;">
          <strong style="color: #10b981;">Resolved Reports:</strong> ${resolvedCount}
        </div>

      </div>
      <button class="btn-primary" onclick="closeModal()" style="width: 100%;">
        <i class="fas fa-times"></i> Close
      </button>
    </div>
  `;

  showModal(detailsHtml);
}

// NEW: Builds CSV from cached data
function exportUserData(username) {
  const user = allFetchedUsers.find(u => u.username === username);
  if (!user) return;

  // Filter the cached issues
  const userIssues = allFetchedIssues.filter(r => r.submittedBy === username);

  const csvContent = "data:text/csv;charset=utf-8," +
    "User Information\n" +
    `Name,${user.firstName} ${user.lastName}\n` +
    `ERP,${user.username}\n` +
    `Department,${getDepartmentName(user.department)}\n` +
    `Registration Date,${user.registrationDate}\n\n` +
    "User Issues\n" +
    "ID,Description,Category,Status,Date\n" +
    userIssues.map(issue =>
      `${issue.id},"${issue.description}","${getCategoryName(issue.category)}",${issue.status},${issue.dateSubmitted}`
    ).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `user_${username}_data.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// NEW: Builds CSV from cached data
function exportReports() {
  if (allFetchedIssues.length === 0) {
    showToast('No reports to export', 'error');
    return;
  }

  // Create a map of usernames to full names
  const userMap = new Map(allFetchedUsers.map(u => [u.username, `${u.firstName} ${u.lastName}`]));
  userMap.set('admin', 'Admin'); // Add admin

  const csvContent = "data:text/csv;charset=utf-8," +
    "ID,Description,Location,Category,Status,Date,Submitted By\n" +
    allFetchedIssues.map(issue => {
      const userName = userMap.get(issue.submittedBy) || issue.submittedBy;
      return `${issue.id},"${issue.description}","${issue.location}","${getCategoryName(issue.category)}",${issue.status},${issue.dateSubmitted},"${userName}"`;
    }).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `all_reports_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}