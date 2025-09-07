<template>
  <div class="customer-dashboard">
    <div class="dashboard-header">
      <h1>Welcome back, {{ customer.name }}!</h1>
      <p>Manage your car wash appointments and services</p>
    </div>

    <div class="dashboard-grid">
      <!-- Quick Actions -->
      <div class="dashboard-card quick-actions">
        <h3>Quick Actions</h3>
        <div class="action-buttons">
          <router-link to="/customer/book" class="action-btn primary">
            <div class="btn-icon">📅</div>
            <div class="btn-content">
              <span class="btn-title">Book Appointment</span>
              <span class="btn-subtitle">Schedule a new car wash</span>
            </div>
          </router-link>
          <router-link to="/customer/appointments" class="action-btn secondary">
            <div class="btn-icon">📋</div>
            <div class="btn-content">
              <span class="btn-title">View Appointments</span>
              <span class="btn-subtitle">Check your bookings</span>
            </div>
          </router-link>
        </div>
      </div>

      <!-- Recent Appointments -->
      <div class="dashboard-card recent-appointments">
        <h3>Recent Appointments</h3>
        <div v-if="recentAppointments.length > 0" class="appointments-list">
          <div v-for="appointment in recentAppointments" :key="appointment.id" class="appointment-item">
            <div class="appointment-info">
              <div class="service-name">{{ appointment.serviceName }}</div>
              <div class="appointment-date">{{ formatDate(appointment.appointmentDate) }}</div>
              <div class="appointment-time">{{ appointment.appointmentTime }}</div>
            </div>
            <div class="appointment-status" :class="appointment.status">
              {{ appointment.status }}
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <div class="empty-icon">📅</div>
          <p>No appointments yet</p>
          <router-link to="/customer/book" class="empty-action">Book your first appointment</router-link>
        </div>
      </div>

      <!-- Services Overview -->
      <div class="dashboard-card services-overview">
        <h3>Available Services</h3>
        <div class="services-list">
          <div v-for="service in availableServices" :key="service.id" class="service-item">
            <div class="service-icon">{{ service.icon }}</div>
            <div class="service-details">
              <div class="service-name">{{ service.name }}</div>
              <div class="service-price">Starting at ${{ service.price }}</div>
            </div>
          </div>
        </div>
        <router-link to="/customer/book" class="view-all-services">View All Services →</router-link>
      </div>

      <!-- Account Info -->
      <div class="dashboard-card account-info">
        <h3>Account Information</h3>
        <div class="account-details">
          <div class="detail-item">
            <span class="detail-label">Name:</span>
            <span class="detail-value">{{ customer.name }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Email:</span>
            <span class="detail-value">{{ customer.email }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Phone:</span>
            <span class="detail-value">{{ customer.phone }}</span>
          </div>
        </div>
        <button class="edit-profile-btn">Edit Profile</button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <div class="stat-content">
            <div class="stat-number">{{ totalAppointments }}</div>
            <div class="stat-label">Total Appointments</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <div class="stat-number">{{ completedAppointments }}</div>
            <div class="stat-label">Completed</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⏳</div>
          <div class="stat-content">
            <div class="stat-number">{{ pendingAppointments }}</div>
            <div class="stat-label">Pending</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <div class="stat-number">${{ totalSpent }}</div>
            <div class="stat-label">Total Spent</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const customer = ref({
  name: '',
  email: '',
  phone: ''
})

const recentAppointments = ref([])
const availableServices = ref([
  { id: 1, name: 'Basic Wash', price: 15, icon: '🚿' },
  { id: 2, name: 'Premium Wash', price: 35, icon: '✨' },
  { id: 3, name: 'Deluxe Package', price: 55, icon: '🏆' }
])

const totalAppointments = ref(0)
const completedAppointments = ref(0)
const pendingAppointments = ref(0)
const totalSpent = ref(0)

onMounted(() => {
  // Load customer data from localStorage
  const customerData = localStorage.getItem('customer_user')
  if (customerData) {
    customer.value = JSON.parse(customerData)
  }
  
  // Load dashboard data
  loadDashboardData()
})

const loadDashboardData = () => {
  // This would typically load from API
  // For now, using mock data
  recentAppointments.value = [
    {
      id: 1,
      serviceName: 'Premium Wash',
      appointmentDate: '2024-01-15',
      appointmentTime: '10:00 AM',
      status: 'completed'
    },
    {
      id: 2,
      serviceName: 'Basic Wash',
      appointmentDate: '2024-01-20',
      appointmentTime: '2:00 PM',
      status: 'pending'
    }
  ]
  
  totalAppointments.value = 5
  completedAppointments.value = 3
  pendingAppointments.value = 2
  totalSpent.value = 150
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.customer-dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 40px;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.dashboard-header p {
  color: #6b7280;
  font-size: 1.1rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.dashboard-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  border: 1px solid #e5e7eb;
}

.dashboard-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20px;
}

/* Quick Actions */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.action-btn {
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.action-btn.primary {
  background: #eff6ff;
  border-color: #dbeafe;
  color: #1e40af;
}

.action-btn.primary:hover {
  background: #dbeafe;
  transform: translateY(-2px);
}

.action-btn.secondary {
  background: #f9fafb;
  border-color: #e5e7eb;
  color: #374151;
}

.action-btn.secondary:hover {
  background: #f3f4f6;
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 2rem;
  margin-right: 15px;
}

.btn-content {
  display: flex;
  flex-direction: column;
}

.btn-title {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 4px;
}

.btn-subtitle {
  font-size: 0.875rem;
  opacity: 0.8;
}

/* Recent Appointments */
.appointments-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.appointment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f9fafb;
  border-radius: 8px;
  border-left: 4px solid #2563eb;
}

.appointment-info {
  flex: 1;
}

.service-name {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.appointment-date,
.appointment-time {
  font-size: 0.875rem;
  color: #6b7280;
}

.appointment-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.appointment-status.completed {
  background: #dcfce7;
  color: #166534;
}

.appointment-status.pending {
  background: #fef3c7;
  color: #92400e;
}

.appointment-status.cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 15px;
}

.empty-action {
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
}

.empty-action:hover {
  text-decoration: underline;
}

/* Services Overview */
.services-list {
  margin-bottom: 20px;
}

.service-item {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #e5e7eb;
}

.service-item:last-child {
  border-bottom: none;
}

.service-icon {
  font-size: 1.5rem;
  margin-right: 15px;
}

.service-details {
  flex: 1;
}

.service-name {
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 4px;
}

.service-price {
  font-size: 0.875rem;
  color: #2563eb;
  font-weight: 600;
}

.view-all-services {
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
}

.view-all-services:hover {
  text-decoration: underline;
}

/* Account Info */
.account-details {
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f3f4f6;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 500;
  color: #6b7280;
}

.detail-value {
  color: #1f2937;
}

.edit-profile-btn {
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.edit-profile-btn:hover {
  background: #e5e7eb;
}

/* Stats Section */
.stats-section {
  margin-top: 40px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  font-size: 2.5rem;
  opacity: 0.8;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
}

.stat-label {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .action-buttons {
    gap: 10px;
  }
  
  .action-btn {
    padding: 15px;
  }
  
  .btn-icon {
    font-size: 1.5rem;
    margin-right: 10px;
  }
}

@media (max-width: 480px) {
  .dashboard-header h1 {
    font-size: 2rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 20px;
  }
  
  .appointment-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>


