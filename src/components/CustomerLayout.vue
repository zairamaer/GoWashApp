<template>
  <div class="customer-layout">
    <!-- Header -->
    <header class="customer-header">
      <div class="header-container">
        <div class="header-left">
          <!-- Mobile menu toggle -->
          <button class="mobile-menu-toggle" @click="toggleMobileMenu" :class="{ active: isMobileMenuOpen }">
            <span></span>
            <span></span>
            <span></span>
          </button>

          <router-link to="/customer/dashboard" class="logo">
            <img src="../assets/car.png" alt="GoWash Logo" class="logo-image">
            <h2>GoWash</h2>
          </router-link>
        </div>
        
        <!-- Navigation - Desktop and Mobile -->
        <nav class="header-nav" :class="{ 'mobile-open': isMobileMenuOpen }">
          <router-link 
            to="/customer/dashboard" 
            class="nav-link" 
            :class="{ active: $route.path === '/customer/dashboard' }"
            @click="closeMobileMenu"
          >
            <span class="nav-icon">🏠</span>
            Dashboard
          </router-link>
          <router-link 
            to="/customer/book" 
            class="nav-link" 
            :class="{ active: $route.path === '/customer/book' }"
            @click="closeMobileMenu"
          >
            <span class="nav-icon">📅</span>
            Book Service
          </router-link>
          <router-link 
            to="/customer/appointments" 
            class="nav-link" 
            :class="{ active: $route.path === '/customer/appointments' }"
            @click="closeMobileMenu"
          >
            <span class="nav-icon">📋</span>
            My Appointments
          </router-link>
        </nav>
        
        <div class="header-right">
          <div class="user-menu">
            <div class="user-info">
              <span class="user-name">{{ customer.name }}</span>
              <span class="user-email">{{ customer.email }}</span>
            </div>
            <div class="user-actions">
              <button @click="showLogoutDialog" class="logout-btn">
                <span class="logout-icon">→</span>
                <span class="logout-text">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Mobile overlay -->
    <div 
      v-if="isMobileMenuOpen" 
      class="mobile-overlay" 
      @click="closeMobileMenu"
    ></div>

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

    <!-- Main Content -->
    <main class="customer-main" :class="{ 'full-width': isFullWidthPage }">
      <div v-if="!isFullWidthPage" class="main-container">
        <router-view />
      </div>
      <router-view v-else />
    </main>

    <!-- Footer -->
    <footer v-if="!isFullWidthPage" class="customer-footer">
      <div class="footer-container">
        <p>&copy; 2024 GoWash. All rights reserved.</p>
        <div class="footer-links">
          <a href="/">Home</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { customerAuthService } from '../services/api'

const router = useRouter()
const route = useRoute()

const customer = ref({
  name: '',
  email: '',
  phone: ''
})

const isMobileMenuOpen = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const toastTitle = ref('')
const toastType = ref('success')
const showLogoutConfirm = ref(false)

// Check if current page should be full width
const isFullWidthPage = computed(() => {
  return route.path === '/customer/dashboard' || 
         route.path === '/customer/appointments' || 
         route.path === '/customer/book'
})

// Close mobile menu when route changes
watch(route, () => {
  isMobileMenuOpen.value = false
})

onMounted(() => {
  // Load customer data from localStorage
  const customerData = localStorage.getItem('customer_user')
  if (customerData) {
    customer.value = JSON.parse(customerData)
  }
})

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
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
    
    await customerAuthService.logout()
    showToastNotification('Successfully logged out!', 'Goodbye', 'success')
    
    setTimeout(() => {
      localStorage.removeItem('customer_token')
      localStorage.removeItem('customer_user')
      router.push('/customer/login')
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
</script>

<style scoped>
.customer-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.customer-header {
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
  position: relative;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
  z-index: 1001;
}

.header-left .logo {
  text-decoration: none;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-left .logo .logo-image {
  width: 35px;
  height: 35px;
  object-fit: contain;
}

.header-left .logo h2 {
  font-size: 1.75rem;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

/* Mobile Menu Toggle */
.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 30px;
  height: 30px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1001;
}

.mobile-menu-toggle span {
  width: 25px;
  height: 3px;
  background: #374151;
  border-radius: 2px;
  transition: all 0.3s ease;
  transform-origin: center;
}

.mobile-menu-toggle.active span:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.mobile-menu-toggle.active span:nth-child(2) {
  opacity: 0;
}

.mobile-menu-toggle.active span:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

/* Navigation */
.header-nav {
  display: flex;
  gap: 30px;
}

.nav-link {
  text-decoration: none;
  color: #6b7280;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-link:hover {
  color: #2563eb;
  background: #f1f5f9;
}

.nav-link.active {
  color: #2563eb;
  background: #eff6ff;
}

.nav-icon {
  display: none;
}

.header-right {
  display: flex;
  align-items: center;
  z-index: 1001;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.user-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.9rem;
}

.user-email {
  color: #6b7280;
  font-size: 0.8rem;
}

.logout-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.logout-btn:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

.logout-icon {
  display: none;
}

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

/* Mobile Overlay */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: none;
}

/* Main Content */
.customer-main {
  flex: 1;
  background: #f8fafc;
}

.customer-main.full-width {
  background: transparent;
  padding: 0;
}

.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* Footer */
.customer-footer {
  background: #1f2937;
  color: white;
  padding: 30px 0;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-links {
  display: flex;
  gap: 20px;
}

.footer-links a {
  color: #d1d5db;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: #60a5fa;
}

/* Tablet Responsive */
@media (max-width: 1024px) {
  .header-container {
    padding: 0 15px;
  }
  
  .header-nav {
    gap: 20px;
  }
  
  .nav-link {
    padding: 6px 12px;
    font-size: 0.875rem;
  }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .mobile-menu-toggle {
    display: flex;
  }
  
  .header-nav {
    position: fixed;
    top: 70px;
    left: 0;
    right: 0;
    background: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    flex-direction: column;
    gap: 0;
    padding: 20px;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 1000;
  }
  
  .header-nav.mobile-open {
    transform: translateX(0);
  }
  
  .nav-link {
    width: 100%;
    padding: 15px 20px;
    border-radius: 8px;
    margin-bottom: 8px;
    font-size: 1rem;
    justify-content: flex-start;
  }
  
  .nav-icon {
    display: block;
    font-size: 1.2rem;
  }
  
  .mobile-overlay {
    display: block;
  }
  
  .user-info {
    display: none;
  }
  
  .logout-btn {
    padding: 10px;
    border-radius: 8px;
  }
  
  .logout-icon {
    display: block;
    font-size: 1.1rem;
  }
  
  .logout-text {
    display: none;
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
  
  .main-container {
    padding: 20px 15px;
  }
  
  .footer-container {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .footer-links {
    justify-content: center;
    flex-wrap: wrap;
  }
}

/* Small Mobile Responsive */
@media (max-width: 480px) {
  .header-container {
    height: 60px;
    padding: 0 10px;
  }
  
  .header-left .logo h2 {
    font-size: 1.5rem;
  }
  
  .header-left .logo .logo-image {
    width: 30px;
    height: 30px;
  }
  
  .header-nav {
    top: 60px;
    padding: 15px;
  }
  
  .nav-link {
    padding: 12px 15px;
    font-size: 0.95rem;
  }
  
  .user-name {
    display: none;
  }
  
  .user-email {
    display: none;
  }
  
  .logout-btn {
    width: 40px;
    height: 40px;
    padding: 0;
    border-radius: 50%;
    justify-content: center;
  }
  
  .main-container {
    padding: 15px 10px;
  }
  
  .footer-container {
    padding: 0 15px;
  }
  
  .footer-links {
    gap: 15px;
  }
  
  .footer-links a {
    font-size: 0.8rem;
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

/* Extra Small Devices */
@media (max-width: 320px) {
  .header-container {
    padding: 0 8px;
  }
  
  .header-left .logo h2 {
    font-size: 1.3rem;
  }
  
  .nav-link {
    font-size: 0.9rem;
    padding: 10px 12px;
  }
  
  .main-container {
    padding: 10px 8px;
  }
}

/* Special styling for full-width pages */
.customer-layout:has(.customer-main.full-width) .customer-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.customer-layout:has(.customer-main.full-width) .header-container {
  max-width: 1400px;
}

/* Smooth transitions for all interactive elements */
* {
  box-sizing: border-box;
}

button, a {
  transition: all 0.3s ease;
}

/* Focus states for accessibility */
.nav-link:focus,
.logout-btn:focus,
.mobile-menu-toggle:focus,
.btn-cancel:focus,
.btn-confirm:focus {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

/* Prevent horizontal scroll on mobile */
@media (max-width: 768px) {
  body {
    overflow-x: hidden;
  }
}
</style>