<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <AdminSidebar 
      :class="{ 'mobile-open': isMobileSidebarOpen }" 
      :is-mobile-open="isMobileSidebarOpen"
    />
    
    <!-- Main Content Area -->
    <div class="main-content">
      <!-- Top Header -->
      <header class="top-header">
        <div class="header-left">
          <button @click="toggleMobileSidebar" class="mobile-menu-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div class="breadcrumb">
            <span class="breadcrumb-item">{{ currentPageTitle }}</span>
          </div>
        </div>
        
        <div class="header-right">
          <div class="header-actions">
            <!-- Notifications -->
            <button class="action-btn notification-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span class="notification-badge">3</span>
            </button>
            
            <!-- Quick Actions -->
            <div class="quick-actions">
              <button class="action-btn" title="Add Service">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="16"/>
                  <line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <!-- Page Content -->
      <main class="page-content">
        <router-view />
      </main>
    </div>
    
    <!-- Mobile Sidebar Overlay -->
    <div 
      v-if="isMobileSidebarOpen" 
      class="mobile-overlay" 
      @click="closeMobileSidebar"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, provide, watch } from 'vue'
import { useRoute } from 'vue-router'
import AdminSidebar from './AdminSidebar.vue'

const route = useRoute()
const isMobileSidebarOpen = ref(false)

const currentPageTitle = computed(() => {
  const routeNames = {
    '/admin/dashboard': 'Dashboard',
    '/admin/services': 'Services',
    '/admin/appointments': 'Appointments',
    '/admin/upcoming-schedules': 'Upcoming Schedules',
    '/admin/customers': 'Customers',
    '/admin/payments': 'Payments',
    '/admin/analytics': 'Analytics',
    '/admin/settings': 'Settings'
  }
  
  return routeNames[route.path] || 'Admin Panel'
})

const toggleMobileSidebar = () => {
  isMobileSidebarOpen.value = !isMobileSidebarOpen.value
  // Prevent body scroll when sidebar is open
  if (isMobileSidebarOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = 'auto'
  }
}

const closeMobileSidebar = () => {
  isMobileSidebarOpen.value = false
  document.body.style.overflow = 'auto'
}

// Provide the close function to child components
provide('closeMobileSidebar', closeMobileSidebar)

// Handle window resize
const handleResize = () => {
  if (window.innerWidth > 768) {
    closeMobileSidebar()
  }
}

// Close sidebar when route changes (mobile navigation)
const handleRouteChange = () => {
  if (window.innerWidth <= 768) {
    closeMobileSidebar()
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  // Clean up body overflow on unmount
  document.body.style.overflow = 'auto'
})

// Watch for route changes to close mobile sidebar
watch(() => route.path, handleRouteChange)
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
  position: relative;
}

.main-content {
  flex: 1;
  margin-left: 260px;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease;
}

.top-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  color: #4a5568;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.mobile-menu-btn:hover {
  background: #f7fafc;
  color: #2d3748;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
}

.breadcrumb-item {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
}

.header-right {
  display: flex;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-btn {
  position: relative;
  background: none;
  border: none;
  color: #4a5568;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #f7fafc;
  color: #2d3748;
}

.notification-btn {
  position: relative;
}

.notification-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #e53e3e;
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quick-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
  display: none;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .mobile-overlay {
    display: block;
  }
  
  .top-header {
    padding: 0 16px;
    z-index: 101;
  }
  
  .page-content {
    padding: 16px;
  }
  
  .breadcrumb-item {
    font-size: 16px;
  }
}

/* Sidebar collapsed state for desktop */
.admin-layout:has(.admin-sidebar.collapsed) .main-content {
  margin-left: 70px;
}

@media (max-width: 768px) {
  .admin-layout:has(.admin-sidebar.collapsed) .main-content {
    margin-left: 0;
  }
}

/* Mobile sidebar styles - these will be applied to the AdminSidebar component */
@media (max-width: 768px) {
  .admin-layout :deep(.admin-sidebar) {
    position: fixed;
    top: 0;
    left: -260px;
    z-index: 999;
    transition: left 0.3s ease;
    height: 100vh;
    overflow-y: auto;
  }
  
  .admin-layout :deep(.admin-sidebar.mobile-open) {
    left: 0;
  }
  
  /* Ensure sidebar has proper background and shadow on mobile */
  .admin-layout :deep(.admin-sidebar) {
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  }
}

/* Smooth transitions */
* {
  transition: transform 0.3s ease, left 0.3s ease;
}
</style>