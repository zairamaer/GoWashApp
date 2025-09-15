<template>
  <div>
    <!-- Logout Confirmation Modal -->
    <div v-if="showLogoutConfirm" class="modal-overlay" @click="closeLogoutModal">
      <div class="logout-modal" @click.stop>
        <div class="modal-header">
          <div class="modal-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16,17 21,12 16,7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </div>
          <h3>Confirm Logout</h3>
          <p>Are you sure you want to log out?</p>
        </div>
        <div class="modal-actions">
          <button @click="closeLogoutModal" class="btn-cancel">Cancel</button>
          <button @click="confirmLogout" class="btn-confirm">Logout</button>
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->
    <div v-if="showToast" :class="['toast', toastType || 'success']">
      <div class="toast-content">
        <div class="toast-icon">
          <svg v-if="(toastType || 'success') === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22,4 12,14.01 9,11.01"></polyline>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <div class="toast-message">
          <h4>{{ toastTitle || 'Success' }}</h4>
          <p>{{ toastMessage }}</p>
        </div>
        <button @click.stop.prevent="closeToast" class="toast-close" type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>

    <div class="admin-sidebar" :class="{ collapsed: isCollapsed }">
      <!-- Sidebar Header -->
      <div class="sidebar-header">
        <div class="logo">
          <div class="logo-icon">🚗</div>
          <span v-if="!isCollapsed" class="logo-text">GoWash</span>
        </div>
        <button @click="toggleSidebar" class="collapse-btn" v-if="!isMobile">
          <svg v-if="!isCollapsed" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <!-- Close button for mobile -->
        <button @click="closeMobileSidebar" class="mobile-close-btn" v-if="isMobile">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Navigation Menu -->
      <nav class="sidebar-nav">
        <ul class="nav-list">
          <li class="nav-item">
            <router-link to="/admin/dashboard" class="nav-link" :class="{ active: $route.path === '/admin/dashboard' }" @click="handleNavClick">
              <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              <span class="nav-text">Dashboard</span>
            </router-link>
          </li>

          <li class="nav-item">
            <router-link to="/admin/services" class="nav-link" :class="{ active: $route.path.startsWith('/admin/services') }" @click="handleNavClick">
              <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
              <span class="nav-text">Services</span>
            </router-link>
          </li>

          <li class="nav-item">
            <router-link to="/admin/appointments" class="nav-link" :class="{ active: $route.path.startsWith('/admin/appointments') }" @click="handleNavClick">
              <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span class="nav-text">Appointments</span>
            </router-link>
          </li>

          <li class="nav-item">
            <router-link to="/admin/upcoming-schedules" class="nav-link" :class="{ active: $route.path.startsWith('/admin/upcoming-schedules') }" @click="handleNavClick">
              <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
              <span class="nav-text">Upcoming Schedules</span>
            </router-link>
          </li>

          <li class="nav-item">
            <router-link to="/admin/customers" class="nav-link" :class="{ active: $route.path.startsWith('/admin/customers') }" @click="handleNavClick">
              <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span class="nav-text">Customers</span>
            </router-link>
          </li>

          <li class="nav-item">
            <router-link to="/admin/payments" class="nav-link" :class="{ active: $route.path.startsWith('/admin/payments') }" @click="handleNavClick">
              <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              <span class="nav-text">Payments</span>
            </router-link>
          </li>
        </ul>
      </nav>

      <!-- Sidebar Footer -->
      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div class="user-details" v-if="!isCollapsed || isMobile">
            <div class="user-name">{{ adminUser?.name || 'Admin' }}</div>
            <div class="user-role">Administrator</div>
          </div>
        </div>
        <button @click="showLogoutDialog" class="logout-btn" :title="isCollapsed && !isMobile ? 'Logout' : ''">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16,17 21,12 16,7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span v-if="!isCollapsed || isMobile" class="logout-text">Logout</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { adminAuthService } from '../services/api'

const router = useRouter()
const isCollapsed = ref(false)
const isMobile = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const toastTitle = ref('')
const toastType = ref('success')
const showLogoutConfirm = ref(false)

// Inject the close function from parent
const closeMobileSidebar = inject('closeMobileSidebar', () => {})

const adminUser = computed(() => {
  const user = localStorage.getItem('admin_user')
  return user ? JSON.parse(user) : null
})

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
  // Reset collapsed state on mobile
  if (isMobile.value) {
    isCollapsed.value = false
  }
}

const toggleSidebar = () => {
  if (!isMobile.value) {
    isCollapsed.value = !isCollapsed.value
  }
}

const handleNavClick = () => {
  // Close mobile sidebar when nav item is clicked
  if (isMobile.value) {
    closeMobileSidebar()
  }
}

const showToastNotification = (message, title = 'Success', type = 'success') => {
  toastMessage.value = message
  toastTitle.value = title
  toastType.value = type
  showToast.value = true
  
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

const closeToast = () => {
  showToast.value = false
}

const showLogoutDialog = () => {
  showLogoutConfirm.value = true
}

const closeLogoutModal = () => {
  showLogoutConfirm.value = false
}

const confirmLogout = async () => {
  try {
    showLogoutConfirm.value = false
    showToastNotification('Logging out...', 'Please wait', 'success')
    
    await adminAuthService.logout()
    showToastNotification('Successfully logged out!', 'Goodbye', 'success')
    
    setTimeout(() => {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      router.push('/admin/login')
    }, 1500)
  } catch (error) {
    console.error('Logout error:', error)
    showToastNotification('Logout failed. Please try again.', 'Error', 'error')
  }
}

const handleLogout = async () => {
  // This is now replaced by showLogoutDialog
  showLogoutDialog()
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
/* Logout Confirmation Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  animation: fadeIn 0.2s ease-out;
}

.logout-modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  width: 90%;
  animation: modalSlideUp 0.3s ease-out;
}

.modal-header {
  text-align: center;
  padding: 32px 24px 24px;
}

.modal-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.modal-header h3 {
  margin: 0 0 8px 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.modal-header p {
  margin: 0;
  color: #6b7280;
  font-size: 0.95rem;
}

.modal-actions {
  padding: 0 24px 32px;
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-cancel, .btn-confirm {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-width: 100px;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-confirm {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.btn-confirm:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Toast Notifications */
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 2000;
  min-width: 320px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  animation: slideInRight 0.3s ease-out;
}

.toast.success {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.95) 0%, rgba(21, 128, 61, 0.95) 100%);
  color: white;
}

.toast.error {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(185, 28, 28, 0.95) 100%);
  color: white;
}

.toast-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
}

.toast-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

.toast-message {
  flex: 1;
}

.toast-message h4 {
  margin: 0 0 4px 0;
  font-size: 0.875rem;
  font-weight: 600;
}

.toast-message p {
  margin: 0;
  font-size: 0.8rem;
  opacity: 0.9;
}

.toast-close {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  flex-shrink: 0;
}

.toast-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.admin-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 260px;
  background: linear-gradient(180deg, #1a202c 0%, #2d3748 100%);
  color: white;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  z-index: 1000;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.admin-sidebar.collapsed {
  width: 70px;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: white;
  white-space: nowrap;
}

.collapse-btn,
.mobile-close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.collapse-btn:hover,
.mobile-close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
}

.nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  margin-bottom: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
  min-height: 44px; /* Ensure touch-friendly height */
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-link.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.nav-link.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #667eea;
}

.nav-icon {
  flex-shrink: 0;
  opacity: 0.8;
  width: 20px;
  height: 20px;
}

.nav-text {
  font-weight: 500;
  white-space: nowrap;
  font-size: 15px;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.7);
  flex-shrink: 0;
}

.user-details {
  flex: 1;
  min-width: 0; /* Prevent flex item from overflowing */
}

.user-name {
  font-weight: 600;
  color: white;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(229, 62, 62, 0.1);
  border: 1px solid rgba(229, 62, 62, 0.2);
  border-radius: 8px;
  color: #fc8181;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 14px;
  min-height: 44px; /* Touch-friendly height */
}

.logout-btn:hover {
  background: rgba(229, 62, 62, 0.2);
  border-color: rgba(229, 62, 62, 0.3);
  color: #f56565;
}

.logout-btn svg {
  flex-shrink: 0;
}

.logout-text {
  white-space: nowrap;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .admin-sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    width: 260px; /* Fixed width on mobile */
  }
  
  .admin-sidebar.mobile-open {
    transform: translateX(0);
  }
  
  /* Override collapsed state on mobile */
  .admin-sidebar.collapsed {
    width: 260px;
  }
  
  /* Ensure nav text is always visible on mobile */
  .admin-sidebar .nav-text {
    display: block !important;
    opacity: 1 !important;
    visibility: visible !important;
  }
  
  /* Ensure logo text is visible on mobile */
  .admin-sidebar .logo-text {
    display: block !important;
    opacity: 1 !important;
    visibility: visible !important;
  }
  
  /* Ensure user details are visible on mobile */
  .admin-sidebar .user-details {
    display: block !important;
    opacity: 1 !important;
    visibility: visible !important;
  }
  
  /* Ensure logout text is visible on mobile */
  .admin-sidebar .logout-text {
    display: block !important;
    opacity: 1 !important;
    visibility: visible !important;
  }
  
  .nav-link {
    padding: 16px 20px; /* More padding for better touch targets */
  }
  
  .sidebar-header {
    padding: 24px 20px;
  }
  
  .sidebar-footer {
    padding: 24px 20px;
  }
  
  .toast {
    top: 15px;
    right: 15px;
    left: 15px;
    max-width: none;
    min-width: auto;
  }
  
  .toast-content {
    padding: 14px 20px;
  }
  
  .toast-message h4 {
    font-size: 0.8rem;
  }
  
  .toast-message p {
    font-size: 0.75rem;
  }
  
  .logout-modal {
    margin: 20px;
    width: calc(100% - 40px);
  }
  
  .modal-header {
    padding: 24px 20px 20px;
  }
  
  .modal-icon {
    width: 50px;
    height: 50px;
    margin-bottom: 12px;
  }
  
  .modal-header h3 {
    font-size: 1.1rem;
  }
  
  .modal-actions {
    padding: 0 20px 24px;
    flex-direction: column;
  }
  
  .btn-cancel, .btn-confirm {
    width: 100%;
    min-width: auto;
  }
}

/* Collapsed state styles for desktop only */
@media (min-width: 769px) {
  .admin-sidebar.collapsed .nav-text,
  .admin-sidebar.collapsed .logo-text,
  .admin-sidebar.collapsed .user-details,
  .admin-sidebar.collapsed .logout-text {
    opacity: 0;
    visibility: hidden;
    width: 0;
    overflow: hidden;
    transition: opacity 0.2s ease, visibility 0.2s ease;
  }
  
  .admin-sidebar.collapsed .nav-link {
    justify-content: center;
    padding: 12px;
  }
  
  .admin-sidebar.collapsed .user-info {
    justify-content: center;
  }
  
  .admin-sidebar.collapsed .logout-btn {
    justify-content: center;
    padding: 12px;
  }
  
  .admin-sidebar.collapsed .sidebar-header {
    justify-content: center;
  }
  
  .admin-sidebar.collapsed .logo {
    justify-content: center;
  }
}

/* Scrollbar Styling */
.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.admin-sidebar::-webkit-scrollbar {
  width: 4px;
}

.admin-sidebar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.admin-sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.admin-sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Focus states for accessibility */
.nav-link:focus,
.logout-btn:focus,
.collapse-btn:focus,
.mobile-close-btn:focus,
.btn-cancel:focus,
.btn-confirm:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

/* Prevent horizontal scroll on mobile */
@media (max-width: 768px) {
  body {
    overflow-x: hidden;
  }
}

</style>