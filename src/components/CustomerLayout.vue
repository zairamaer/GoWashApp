<template>
  <div class="customer-layout">
    <!-- Header -->
    <header class="customer-header">
      <div class="header-container">
        <div class="header-left">
          <router-link to="/customer/dashboard" class="logo">
            <h2>GoWash</h2>
          </router-link>
        </div>
        
        <nav class="header-nav">
          <router-link to="/customer/dashboard" class="nav-link" :class="{ active: $route.path === '/customer/dashboard' }">
            Dashboard
          </router-link>
          <router-link to="/customer/book" class="nav-link" :class="{ active: $route.path === '/customer/book' }">
            Book Service
          </router-link>
          <router-link to="/customer/appointments" class="nav-link" :class="{ active: $route.path === '/customer/appointments' }">
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
              <button @click="handleLogout" class="logout-btn">Logout</button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content - Remove container constraints for dashboard and booking -->
    <main class="customer-main" :class="{ 'full-width': isFullWidthPage }">
      <div v-if="!isFullWidthPage" class="main-container">
        <router-view />
      </div>
      <router-view v-else />
    </main>

    <!-- Footer - Only show on non-full-width pages -->
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
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { customerAuthService } from '../services/api'

const router = useRouter()
const route = useRoute()

const customer = ref({
  name: '',
  email: '',
  phone: ''
})

// Check if current page should be full width (dashboard and booking)
const isFullWidthPage = computed(() => {
  return route.path === '/customer/dashboard' || 
         route.path === '/customer/appointments' || 
         route.path === '/customer/book'
})

onMounted(() => {
  // Load customer data from localStorage
  const customerData = localStorage.getItem('customer_user')
  if (customerData) {
    customer.value = JSON.parse(customerData)
  }
})

const handleLogout = async () => {
  try {
    await customerAuthService.logout()
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    // Clear local storage and redirect to login
    localStorage.removeItem('customer_token')
    localStorage.removeItem('customer_user')
    router.push('/customer/login')
  }
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
  z-index: 100;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}

.header-left .logo {
  text-decoration: none;
  color: #2563eb;
}

.header-left .logo h2 {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
}

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
}

.nav-link:hover {
  color: #2563eb;
  background: #f1f5f9;
}

.nav-link.active {
  color: #2563eb;
  background: #eff6ff;
}

.header-right {
  display: flex;
  align-items: center;
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
  transition: background-color 0.3s ease;
}

.logout-btn:hover {
  background: #dc2626;
}

/* Main Content Styles */
.customer-main {
  flex: 1;
  background: #f8fafc;
}

/* Full width for dashboard and booking pages */
.customer-main.full-width {
  background: transparent;
  padding: 0;
}

/* Container for other pages */
.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

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

/* Responsive Design */
@media (max-width: 768px) {
  .header-container {
    flex-direction: column;
    height: auto;
    padding: 15px 20px;
    gap: 15px;
  }
  
  .header-nav {
    gap: 15px;
    order: 3;
    width: 100%;
    justify-content: center;
  }
  
  .nav-link {
    padding: 6px 12px;
    font-size: 0.875rem;
  }
  
  .user-info {
    align-items: center;
  }
  
  .user-menu {
    order: 2;
  }
  
  .footer-container {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .footer-links {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .header-nav {
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }
  
  .nav-link {
    font-size: 0.8rem;
    padding: 4px 8px;
  }
  
  .user-menu {
    flex-direction: column;
    gap: 10px;
  }

  .header-container {
    padding: 10px 15px;
  }

  .main-container {
    padding: 20px 15px;
  }
}

/* Special styling for full-width pages header */
.customer-layout:has(.customer-main.full-width) .customer-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.customer-layout:has(.customer-main.full-width) .header-container {
  max-width: 1400px;
}

.customer-layout:has(.customer-main.full-width) .logo h2 {
  color: #667eea;
}
</style>