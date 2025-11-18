// Patient Dashboard Script
document.addEventListener('DOMContentLoaded', function() {
    console.log('Patient dashboard loaded successfully!');
    
    // Initialize dashboard
    initializeDashboard();
    
    // Load appointments data
    loadAppointments();
    
    // Load profile data
    loadProfileSection();
});

// Initialize dashboard functionality
function initializeDashboard() {
    console.log('Initializing patient dashboard...');
    
    // Load current patient data
    const currentPatient = JSON.parse(localStorage.getItem('currentPatient'));
    if (currentPatient) {
        console.log('Current patient data:', currentPatient);
        
        // Update header with patient name
        const headerUserName = document.getElementById('headerUserName');
        if (headerUserName) {
            headerUserName.textContent = currentPatient.fullName || 'Patient Name';
        }
        
        // Update profile section
        updateProfileDisplay(currentPatient);
    } else {
        console.log('No patient data found in localStorage');
    }
}

// Switch between sections
function switchSection(sectionId) {
    console.log('Switching to section:', sectionId);
    
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Add active class to clicked nav item
    const clickedNavItem = document.querySelector(`[onclick="switchSection('${sectionId}')"]`);
    if (clickedNavItem) {
        clickedNavItem.classList.add('active');
    }
    
    // Load section-specific data
    if (sectionId === 'overview') {
        loadAppointments();
    } else if (sectionId === 'profile') {
        loadProfileSection();
    }
}

// Toggle sidebar for mobile
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }
}

// Load appointments data
function loadAppointments() {
    console.log('Loading appointments data...');
    
    // Get current patient data
    const currentPatient = JSON.parse(localStorage.getItem('currentPatient'));
    if (!currentPatient) {
        console.log('No patient data found');
        return;
    }
    
    // Get appointments from localStorage
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    
    // Filter appointments for current patient
    const patientAppointments = appointments.filter(appointment => 
        appointment.email === currentPatient.email
    );
    
    console.log('Patient appointments:', patientAppointments);
    
    // Update appointment counts
    const pendingAppointments = patientAppointments.filter(app => app.status === 'pending');
    const approvedAppointments = patientAppointments.filter(app => app.status === 'approved');
    
    const pendingCount = document.getElementById('pendingCount');
    const approvedCount = document.getElementById('approvedCount');
    
    if (pendingCount) pendingCount.textContent = pendingAppointments.length;
    if (approvedCount) approvedCount.textContent = approvedAppointments.length;
    
    // Update appointment tables
    updateAppointmentTable('pendingTable', pendingAppointments, true);
    updateAppointmentTable('approvedTable', approvedAppointments, true);
    updateAppointmentTable('bookedTable', patientAppointments, false);
}

// Update appointment table
function updateAppointmentTable(tableId, appointments, showActions) {
    const tableBody = document.getElementById(tableId);
    if (!tableBody) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    if (appointments.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="empty-state">No appointments found</td></tr>';
        return;
    }
    
    // Add appointment rows
    appointments.forEach(appointment => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${formatDate(appointment.appointmentDate)}</td>
            <td>${appointment.reason}</td>
            <td>${appointment.firstName}</td>
            <td>${appointment.contactNo}</td>
            <td>${appointment.email}</td>
            <td>${appointment.age}</td>
            <td>${formatDate(appointment.dateOfBirth)}</td>
            ${showActions ? `
                <td class="action-buttons">
                    <button class="btn-action btn-reschedule" onclick="rescheduleAppointment('${appointment.id}')" title="Reschedule">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                    <button class="btn-action btn-cancel" onclick="cancelAppointment('${appointment.id}')" title="Cancel">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </td>
            ` : '<td>-</td>'}
        `;
        
        tableBody.appendChild(row);
    });
}

// Handle booking form submission
function handleBooking(event) {
    event.preventDefault();
    console.log('Handling booking form submission...');
    
    // Get form values
    const firstName = document.getElementById('firstName').value;
    const contactNo = document.getElementById('contactNo').value;
    const email = document.getElementById('email').value;
    const age = document.getElementById('age').value;
    const dateOfBirth = document.getElementById('dateOfBirth').value;
    const appointmentDate = document.getElementById('appointmentDate').value;
    const reason = document.getElementById('reason').value;
    
    // Basic validation
    if (!firstName || !contactNo || !email || !age || !dateOfBirth || !appointmentDate || !reason) {
        alert('Please fill in all fields');
        return;
    }
    
    // Create appointment object
    const appointment = {
        id: generateId(),
        firstName: firstName,
        contactNo: contactNo,
        email: email,
        age: parseInt(age),
        dateOfBirth: dateOfBirth,
        appointmentDate: appointmentDate,
        reason: reason,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    console.log('New appointment:', appointment);
    
    // Save to localStorage
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    appointments.push(appointment);
    localStorage.setItem('appointments', JSON.stringify(appointments));
    
    // Show success message
    alert(`Appointment booked successfully!\\n\\nDate: ${formatDate(appointmentDate)}\\nReason: ${reason}\\n\\nStatus: Pending Approval`);
    
    // Reset form
    document.getElementById('bookingForm').reset();
    
    // Reload appointments
    loadAppointments();
}

// Load profile section
function loadProfileSection() {
    console.log('Loading profile section...');
    
    const currentPatient = JSON.parse(localStorage.getItem('currentPatient'));
    if (currentPatient) {
        updateProfileDisplay(currentPatient);
    }
}

// Update profile display
function updateProfileDisplay(patientData) {
    console.log('Updating profile display with:', patientData);
    
    // Update profile header
    const profileFullName = document.getElementById('profileFullName');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileContact = document.getElementById('profileContact');
    const profileGender = document.getElementById('profileGender');
    const profileAddress = document.getElementById('profileAddress');
    const profileDOB = document.getElementById('profileDOB');
    
    if (profileFullName) profileFullName.textContent = patientData.fullName || 'Patient Name';
    if (profileName) profileName.textContent = patientData.fullName || 'Patient Name';
    if (profileEmail) profileEmail.textContent = patientData.email || 'Not provided';
    if (profileContact) profileContact.textContent = patientData.contactNo || 'Not provided';
    if (profileGender) profileGender.textContent = patientData.gender || 'Not provided';
    if (profileAddress) profileAddress.textContent = patientData.address || 'Not provided';
    if (profileDOB) profileDOB.textContent = formatDate(patientData.dateOfBirth) || 'Not provided';
    
    // Update avatar initials
    updateAvatarInitials(patientData.fullName);
}

// Edit profile functionality
function editProfile() {
    console.log('Entering edit profile mode...');
    
    const currentPatient = JSON.parse(localStorage.getItem('currentPatient'));
    if (!currentPatient) {
        alert('No patient data found');
        return;
    }
    
    const profileCard = document.querySelector('.profile-card');
    if (!profileCard) return;
    
    // Create edit form HTML
    profileCard.innerHTML = `
        <div class="edit-profile-form">
            <h3>Edit Profile</h3>
            <form id="profileForm" onsubmit="handleProfileUpdate(event)">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Full Name *</label>
                        <input type="text" class="form-input" id="editFullName" value="${currentPatient.fullName || ''}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Email *</label>
                        <input type="email" class="form-input" id="editEmail" value="${currentPatient.email || ''}" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Contact No. *</label>
                        <input type="tel" class="form-input" id="editContact" value="${currentPatient.contactNo || ''}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Gender *</label>
                        <select class="form-select" id="editGender" required>
                            <option value="">Select gender</option>
                            <option value="Male" ${currentPatient.gender === 'Male' ? 'selected' : ''}>Male</option>
                            <option value="Female" ${currentPatient.gender === 'Female' ? 'selected' : ''}>Female</option>
                            <option value="Other" ${currentPatient.gender === 'Other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Date of Birth *</label>
                        <input type="date" class="form-input" id="editDOB" value="${currentPatient.dateOfBirth || ''}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Address *</label>
                        <input type="text" class="form-input" id="editAddress" value="${currentPatient.address || ''}" required>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="cancelEditProfile()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    `;
}

// Handle profile update
function handleProfileUpdate(event) {
    event.preventDefault();
    console.log('Handling profile update...');
    
    // Get form values
    const fullName = document.getElementById('editFullName').value;
    const email = document.getElementById('editEmail').value;
    const contactNo = document.getElementById('editContact').value;
    const gender = document.getElementById('editGender').value;
    const dateOfBirth = document.getElementById('editDOB').value;
    const address = document.getElementById('editAddress').value;
    
    // Basic validation
    if (!fullName || !email || !contactNo || !gender || !dateOfBirth || !address) {
        alert('Please fill in all fields');
        return;
    }
    
    // Email validation
    if (!isValidEmail(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Update patient data
    const updatedPatient = {
        fullName: fullName,
        email: email,
        contactNo: contactNo,
        gender: gender,
        dateOfBirth: dateOfBirth,
        address: address,
        userType: 'patient'
    };
    
    // Save to localStorage
    localStorage.setItem('currentPatient', JSON.stringify(updatedPatient));
    
    console.log('Profile updated:', updatedPatient);
    
    // Show success message
    alert('Profile updated successfully!');
    
    // Reload profile section
    loadProfileSection();
}

// Cancel edit profile
function cancelEditProfile() {
    console.log('Canceling profile edit...');
    loadProfileSection();
}

// Update avatar initials
function updateAvatarInitials(fullName) {
    const avatars = document.querySelectorAll('.avatar, .profile-avatar');
    const initials = getInitials(fullName);
    
    avatars.forEach(avatar => {
        avatar.textContent = initials;
    });
}

// Get initials from full name
function getInitials(fullName) {
    if (!fullName) return 'PN';
    
    const names = fullName.split(' ');
    if (names.length === 1) {
        return names[0].charAt(0).toUpperCase();
    } else {
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    }
}

// Email validation helper function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return 'Not provided';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Generate unique ID
function generateId() {
    return 'appt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Appointment actions
function rescheduleAppointment(appointmentId) {
    console.log('Rescheduling appointment:', appointmentId);
    alert('Reschedule functionality will be implemented in the next version.');
}

function cancelAppointment(appointmentId) {
    console.log('Canceling appointment:', appointmentId);
    
    if (confirm('Are you sure you want to cancel this appointment?')) {
        const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
        const updatedAppointments = appointments.filter(app => app.id !== appointmentId);
        localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
        
        alert('Appointment cancelled successfully!');
        loadAppointments();
    }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear current session data if needed
        // localStorage.removeItem('currentPatient');
        
        // Redirect to login page
        window.location.href = 'login.html';
    }
}