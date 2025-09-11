<template>
  <div class="admin-dashboard">
    <!-- Page Header -->
    <div class="page-header">
      <h1>Dashboard Overview</h1>
      <p>Welcome back! Here's what's happening with your car wash business today.</p>
    </div>

    <!-- Quick Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <div class="stat-content">
          <h3>Total Appointments</h3>
          <p class="stat-number">{{ appointments.length }}</p>
          <span class="stat-change positive">+12% from last week</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
        </div>
        <div class="stat-content">
          <h3>Active Services</h3>
          <p class="stat-number">{{ serviceRates.length }}</p>
          <span class="stat-change positive">Available services</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <div class="stat-content">
          <h3>Today's Revenue</h3>
          <p class="stat-number">₱{{ todayRevenue.toFixed(2) }}</p>
          <span class="stat-change positive">+8% from yesterday</span>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions-section">
      <h2>Quick Actions</h2>
      <div class="quick-actions-grid">
        <router-link to="/admin/services" class="quick-action-card">
          <div class="action-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>
          <h3>Manage Services</h3>
          <p>Add, edit, or remove car wash services and rates</p>
        </router-link>
        
        <router-link to="/admin/appointments" class="quick-action-card">
          <div class="action-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <h3>View Appointments</h3>
          <p>Check and manage customer appointments</p>
        </router-link>
        
        <router-link to="/admin/customers" class="quick-action-card">
          <div class="action-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h3>Customer Management</h3>
          <p>View and manage customer information</p>
        </router-link>

        <router-link to="/admin/payments" class="quick-action-card">
          <div class="action-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <h3>Payment Tracking</h3>
          <p>Monitor payments and transactions</p>
        </router-link>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="recent-activity-section">
      <h2>Recent Appointments</h2>
      <div class="activity-list">
        <div v-for="appointment in recentAppointments" :key="appointment.appointmentID" class="activity-item">
          <div class="activity-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div class="activity-content">
            <div class="activity-title">{{ appointment.customer?.name }} - {{ getServiceName(appointment.service_rate?.serviceTypeID) }}</div>
            <div class="activity-meta">{{ formatDateTime(appointment.appointmentDateTime) }} • {{ appointment.status }}</div>
          </div>
          <div class="activity-status">
            <span :class="['status-badge', appointment.status]">{{ appointment.status }}</span>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { serviceApi, appointmentApi, getImageUrl } from '../services/api'

// State
const serviceRates = ref([])
const appointments = ref([])
const serviceTypes = ref([])

const todayRevenue = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return appointments.value
    .filter(apt => apt.appointmentDateTime?.startsWith(today))
    .reduce((sum, apt) => sum + parseFloat(apt.service_rate?.price || 0), 0)
})

const recentAppointments = computed(() => {
  return appointments.value
    .sort((a, b) => new Date(b.appointmentDateTime) - new Date(a.appointmentDateTime))
    .slice(0, 5)
})

// Methods
const loadData = async () => {
  try {
    const [ratesData, appointmentsData, typesData] = await Promise.all([
      serviceApi.getServiceRates(),
      appointmentApi.getAppointments(),
      serviceApi.getServiceTypes()
    ])
    
    serviceRates.value = ratesData
    appointments.value = appointmentsData
    serviceTypes.value = typesData
  } catch (error) {
    console.error('Error loading data:', error)
  }
}

const getServiceName = (serviceTypeID) => {
  const serviceType = serviceTypes.value.find(type => type.serviceTypeID === serviceTypeID)
  return serviceType?.serviceTypeName || 'Unknown Service'
}

// Using imported getImageUrl utility function

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return 'N/A'
  return new Date(dateTimeString).toLocaleString()
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.admin-dashboard {
  background: #f8fafc;
  min-height: calc(100vh - 64px);
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  color: #2d3748;
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.page-header p {
  color: #718096;
  font-size: 16px;
  margin: 0;
}

.dashboard-nav {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 24px;
}

.nav-tab {
  background: none;
  border: none;
  padding: 16px 24px;
  font-weight: 500;
  color: #718096;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.nav-tab:hover {
  color: #4a5568;
}

.nav-tab.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.content-header h2 {
  color: #2d3748;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.add-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.add-btn:hover {
  background: #5a67d8;
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: #f7fafc;
  color: #4a5568;
  font-weight: 600;
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  color: #2d3748;
}

.data-table tr:hover {
  background: #f8fafc;
}

.edit-btn, .delete-btn {
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  margin-right: 8px;
  transition: all 0.2s;
}

.edit-btn {
  background: #4299e1;
  color: white;
}

.edit-btn:hover {
  background: #3182ce;
}

.delete-btn {
  background: #e53e3e;
  color: white;
}

.delete-btn:hover {
  background: #c53030;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.status-badge.confirmed {
  background: #f0fff4;
  color: #38a169;
}

.status-badge.completed {
  background: #e6fffa;
  color: #319795;
}

.status-badge.cancelled {
  background: #fed7d7;
  color: #e53e3e;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-content h3 {
  color: #4a5568;
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 4px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-number {
  color: #2d3748;
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.stat-change {
  font-size: 12px;
  font-weight: 500;
}

.stat-change.positive {
  color: #38a169;
}

.stat-change.neutral {
  color: #718096;
}

.stat-change.negative {
  color: #e53e3e;
}

.quick-actions-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
}

.quick-actions-section h2 {
  color: #2d3748;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 20px 0;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.quick-action-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quick-action-card:hover {
  background: white;
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  transform: translateY(-2px);
}

.action-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.quick-action-card h3 {
  color: #2d3748;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.quick-action-card p {
  color: #718096;
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
}

.recent-activity-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.recent-activity-section h2 {
  color: #2d3748;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 20px 0;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.activity-item:hover {
  background: white;
  border-color: #cbd5e0;
}

.activity-icon {
  width: 32px;
  height: 32px;
  background: #e6fffa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #319795;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-title {
  color: #2d3748;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.activity-meta {
  color: #718096;
  font-size: 12px;
}

.activity-status {
  flex-shrink: 0;
}


@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    height: auto;
    padding: 16px 0;
    gap: 12px;
  }
  
  .dashboard-nav {
    padding: 0 16px;
  }
  
  .nav-tab {
    padding: 12px 16px;
  }
  
  .dashboard-content {
    padding: 16px;
  }
  
  .content-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .table-container {
    overflow-x: auto;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
