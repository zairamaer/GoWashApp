<template>
  <div class="appointments-management">
    <!-- Page Header -->
    <div class="page-header">
      <h1>Appointments Management</h1>
      <p>View and manage completed and cancelled customer appointments.</p>
    </div>

    <!-- Filters and Search -->
    <div class="filters-section">
      <div class="filters-row">
        <div class="filter-group">
          <label>Status:</label>
          <select v-model="statusFilter" @change="filterAppointments">
            <option value="all">All (Completed & Cancelled)</option>
            <option value="completed">Completed Only</option>
            <option value="cancelled">Cancelled Only</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Time Period:</label>
          <select v-model="timePeriod" @change="filterAppointments">
            <option value="all">All</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Search:</label>
          <input 
            type="text" 
            v-model="searchQuery" 
            @input="filterAppointments"
            placeholder="Search by customer name or service..."
          />
        </div>
        
        <div class="filter-group">
          <label>Sort by:</label>
          <select v-model="sortBy" @change="sortAppointments">
            <option value="date">Date (Nearest First)</option>
            <option value="dateDesc">Date (Latest First)</option>
            <option value="customer">Customer Name</option>
            <option value="service">Service Type</option>
            <option value="price">Price (Low to High)</option>
            <option value="priceDesc">Price (High to Low)</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Filter by Month:</label>
          <select v-model="monthFilter" @change="filterAppointments">
            <option value="">All Months</option>
            <option v-for="(month, index) in monthOptions" :key="index" :value="month.value">
              {{ month.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Appointments Table -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Service</th>
            <th>Vehicle Size</th>
            <th>Date & Time</th>
            <th>Status</th>
            <th>Price</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="appointment in filteredAppointments" :key="appointment.appointmentID">
            <td>
              <div class="customer-info">
                <div class="customer-name">{{ appointment.customer?.name }}</div>
                <div class="customer-contact">
                  <div>{{ appointment.customer?.email }}</div>
                  <div>{{ appointment.customer?.phone }}</div>
                </div>
              </div>
            </td>
            <td>
              <div class="service-info">
                <div class="service-name">{{ getServiceName(appointment.service_rate?.serviceTypeID) }}</div>
                <div class="service-description">{{ getServiceDescription(appointment.service_rate?.serviceTypeID) }}</div>
              </div>
            </td>
            <td>
              <span class="vehicle-size">{{ getVehicleSizeDescription(appointment.service_rate?.vehicleSizeCode) }}</span>
            </td>
            <td>
              <div class="datetime-info">
                <div class="date">{{ formatDate(appointment.appointmentDateTime) }}</div>
                <div class="time">{{ formatTime(appointment.appointmentDateTime) }}</div>
              </div>
            </td>
            <td>
              <span :class="['status-badge', appointment.status]">
                {{ appointment.status }}
              </span>
            </td>
            <td class="price-cell">₱{{ parseFloat(appointment.service_rate?.price || 0).toFixed(2) }}</td>
            <td>
              <div class="notes-cell">
                <span v-if="appointment.notes" class="has-notes" :title="appointment.notes">
                  {{ appointment.notes.length > 30 ? appointment.notes.substring(0, 30) + '...' : appointment.notes }}
                </span>
                <span v-else class="no-notes">No notes</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Edit Appointment Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Edit Appointment</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <form @submit.prevent="saveAppointment" class="modal-form">
          <div class="form-group">
            <label>Customer</label>
            <input type="text" :value="editingAppointment?.customer?.name" disabled />
          </div>
          
          <div class="form-group">
            <label>Service</label>
            <input type="text" :value="getServiceName(editingAppointment?.service_rate?.serviceTypeID)" disabled />
          </div>
          
          <div class="form-group">
            <label>Date & Time</label>
            <input 
              type="datetime-local" 
              v-model="appointmentForm.appointmentDateTime" 
              required 
            />
          </div>
          
          <div class="form-group">
            <label>Status</label>
            <span :class="['status-badge', appointmentForm.status]">
              {{ appointmentForm.status }}
            </span>
          </div>
          
          <div class="form-group">
            <label>Notes</label>
            <textarea v-model="appointmentForm.notes" rows="3" placeholder="Add any notes about this appointment..."></textarea>
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="cancel-btn">Cancel</button>
            <button type="submit" class="save-btn">Save Changes</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading appointments...</p>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && filteredAppointments.length === 0" class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      <h3>No appointments found</h3>
      <p>No appointments match your current filters.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { appointmentApi, serviceApi } from '../services/api'

// State
const appointments = ref([])
const serviceTypes = ref([])
const vehicleSizes = ref([])
const loading = ref(false)

// Filters
const statusFilter = ref('all') // New status filter
const timePeriod = ref('all')
const searchQuery = ref('')
const sortBy = ref('date')
const monthFilter = ref('')

// Modal state
const showEditModal = ref(false)
const editingAppointment = ref(null)

// Form data
const appointmentForm = reactive({
  appointmentDateTime: '',
  status: '',
  notes: ''
})

// Computed
const monthOptions = computed(() => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()
  const options = []
  
  // Add current year months
  for (let i = 0; i < 12; i++) {
    const monthIndex = (currentMonth - i + 12) % 12
    const year = currentMonth - i < 0 ? currentYear - 1 : currentYear
    options.push({
      value: `${year}-${monthIndex}`,
      label: `${months[monthIndex]} ${year}`
    })
  }
  
  // Add "This Year" option
  options.push({
    value: `year-${currentYear}`,
    label: `This Year (${currentYear})`
  })
  
  return options
})

const filteredAppointments = computed(() => {
  let filtered = appointments.value

  // Filter by status (completed and/or cancelled)
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(apt => apt.status === statusFilter.value)
  } else {
    // Show only completed and cancelled appointments when "all" is selected
    filtered = filtered.filter(apt => apt.status === 'completed' || apt.status === 'cancelled')
  }

  // Filter by time period
  if (timePeriod.value !== 'all') {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    filtered = filtered.filter(apt => {
      const aptDate = new Date(apt.appointmentDateTime)
      const aptDateOnly = new Date(aptDate.getFullYear(), aptDate.getMonth(), aptDate.getDate())
      
      switch (timePeriod.value) {
        case 'today':
          return aptDateOnly.getTime() === today.getTime()
        case 'week':
          const weekStart = new Date(today)
          weekStart.setDate(today.getDate() - today.getDay()) // Start of week (Sunday)
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekStart.getDate() + 6) // End of week (Saturday)
          return aptDateOnly >= weekStart && aptDateOnly <= weekEnd
        case 'month':
          return aptDate.getMonth() === now.getMonth() && aptDate.getFullYear() === now.getFullYear()
        default:
          return true
      }
    })
  }

  // Filter by month
  if (monthFilter.value) {
    filtered = filtered.filter(apt => {
      const aptDate = new Date(apt.appointmentDateTime)
      
      // Handle year filter (e.g., "year-2024")
      if (monthFilter.value.startsWith('year-')) {
        const year = parseInt(monthFilter.value.split('-')[1])
        return aptDate.getFullYear() === year
      }
      
      // Handle specific month filter (e.g., "2024-0" for January 2024)
      if (monthFilter.value.includes('-')) {
        const [year, month] = monthFilter.value.split('-').map(Number)
        return aptDate.getFullYear() === year && aptDate.getMonth() === month
      }
      
      return true
    })
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(apt => {
      const customerName = apt.customer?.name?.toLowerCase() || ''
      const serviceName = getServiceName(apt.service_rate?.serviceTypeID).toLowerCase()
      return customerName.includes(query) || serviceName.includes(query)
    })
  }

  // Sort appointments
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'date':
        return new Date(a.appointmentDateTime) - new Date(b.appointmentDateTime)
      case 'dateDesc':
        return new Date(b.appointmentDateTime) - new Date(a.appointmentDateTime)
      case 'customer':
        return (a.customer?.name || '').localeCompare(b.customer?.name || '')
      case 'service':
        return getServiceName(a.service_rate?.serviceTypeID).localeCompare(getServiceName(b.service_rate?.serviceTypeID))
      case 'price':
        return parseFloat(a.service_rate?.price || 0) - parseFloat(b.service_rate?.price || 0)
      case 'priceDesc':
        return parseFloat(b.service_rate?.price || 0) - parseFloat(a.service_rate?.price || 0)
      default:
        return 0
    }
  })

  return filtered
})

// Methods
const loadData = async () => {
  loading.value = true
  try {
    const [appointmentsData, typesData, sizesData] = await Promise.all([
      appointmentApi.getAppointments(),
      serviceApi.getServiceTypes(),
      serviceApi.getVehicleSizes()
    ])
    
    appointments.value = appointmentsData
    serviceTypes.value = typesData
    vehicleSizes.value = sizesData
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    loading.value = false
  }
}

const filterAppointments = () => {
  // This is handled by the computed property
}

const sortAppointments = () => {
  // This is handled by the computed property
}

const getServiceName = (serviceTypeID) => {
  const serviceType = serviceTypes.value.find(type => type.serviceTypeID === serviceTypeID)
  return serviceType?.serviceTypeName || 'Unknown Service'
}

const getServiceDescription = (serviceTypeID) => {
  const serviceType = serviceTypes.value.find(type => type.serviceTypeID === serviceTypeID)
  return serviceType?.serviceTypeDescription || ''
}

const getVehicleSizeDescription = (vehicleSizeCode) => {
  const vehicleSize = vehicleSizes.value.find(size => size.vehicleSizeCode === vehicleSizeCode)
  return vehicleSize?.vehicleSizeDescription || vehicleSizeCode || 'Unknown'
}

const saveAppointment = async () => {
  try {
    await appointmentApi.updateAppointment(editingAppointment.value.appointmentID, appointmentForm)
    
    // Update local state
    const appointment = appointments.value.find(apt => apt.appointmentID === editingAppointment.value.appointmentID)
    if (appointment) {
      appointment.appointmentDateTime = appointmentForm.appointmentDateTime
      appointment.status = appointmentForm.status
      appointment.notes = appointmentForm.notes
    }
    
    closeModal()
  } catch (error) {
    console.error('Error saving appointment:', error)
    alert('Failed to save appointment changes')
  }
}

const closeModal = () => {
  showEditModal.value = false
  editingAppointment.value = null
  Object.assign(appointmentForm, {
    appointmentDateTime: '',
    status: '',
    notes: ''
  })
}

const formatDate = (dateTimeString) => {
  if (!dateTimeString) return 'N/A'
  return new Date(dateTimeString).toLocaleDateString()
}

const formatTime = (dateTimeString) => {
  if (!dateTimeString) return 'N/A'
  return new Date(dateTimeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const formatDateTimeForInput = (dateTimeString) => {
  if (!dateTimeString) return ''
  const date = new Date(dateTimeString)
  return date.toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:MM
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.appointments-management {
  min-height: calc(100vh - 64px);
  padding: 24px;
}

.page-header {
  margin-bottom: 32px;
  text-align: center;
  padding: 48px 32px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
}

.page-header h1 {
  color: #1a202c;
  font-size: 42px;
  font-weight: 900;
  margin: 0 0 16px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

.page-header p {
  color: #64748b;
  font-size: 20px;
  margin: 0;
  font-weight: 400;
  opacity: 0.9;
}

.filters-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 32px;
  margin-bottom: 32px;
}

.filters-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter-group label {
  color: #1a202c;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-group input,
.filter-group select {
  padding: 14px 18px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  background: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.filter-group input:focus,
.filter-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15);
  transform: translateY(-1px);
}

.filter-group input::placeholder {
  color: #a0aec0;
  font-weight: 400;
}

.table-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1200px;
}

.data-table th {
  background: linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%);
  color: #2d3748;
  font-weight: 700;
  padding: 18px 20px;
  text-align: left;
  border-bottom: 2px solid #e2e8f0;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.data-table td {
  padding: 18px 20px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
  color: #2d3748;
  font-weight: 500;
}

.data-table tr {
  transition: all 0.2s ease;
}

.data-table tr:hover {
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  transform: scale(1.001);
}

.customer-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.customer-name {
  font-weight: 700;
  color: #1a202c;
  font-size: 15px;
}

.customer-contact {
  font-size: 13px;
  color: #718096;
  font-weight: 500;
}

.service-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.service-name {
  font-weight: 700;
  color: #1a202c;
  font-size: 15px;
}

.service-description {
  font-size: 13px;
  color: #718096;
  font-weight: 500;
}

.vehicle-size {
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(66, 153, 225, 0.3);
}

.datetime-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date {
  font-weight: 700;
  color: #1a202c;
  font-size: 15px;
}

.time {
  font-size: 13px;
  color: #718096;
  font-weight: 500;
}

.status-badge {
  padding: 10px 18px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-block;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-badge.cancelled {
  background-color: #fee;
  color: #c53030;
  border: 1px solid #fed7d7;
}

.status-badge.confirmed {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
}

.status-badge.completed {
  background: linear-gradient(135deg, #4fd1c7 0%, #319795 100%);
  color: white;
}

.price-cell {
  font-weight: 700;
  color: #38a169;
  font-size: 16px;
}

.notes-cell {
  max-width: 200px;
}

.has-notes {
  color: #4a5568;
  font-size: 13px;
  font-weight: 500;
}

.no-notes {
  color: #cbd5e0;
  font-style: italic;
  font-size: 13px;
  font-weight: 500;
}



.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 24px;
  width: 90%;
  max-width: 550px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28px 32px;
  border-bottom: 2px solid #f1f5f9;
  background: linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%);
  border-radius: 24px 24px 0 0;
}

.modal-header h3 {
  color: #1a202c;
  font-size: 24px;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.5px;
}

.close-btn {
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 20px;
  color: #718096;
  cursor: pointer;
  padding: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #edf2f7;
  color: #4a5568;
  transform: scale(1.05);
}

.modal-form {
  padding: 32px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: #4a5568;
  font-weight: 500;
  margin-bottom: 6px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input:disabled {
  background: #f7fafc;
  color: #718096;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 2px solid #f1f5f9;
}

.cancel-btn, .save-btn {
  padding: 14px 28px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cancel-btn {
  background: #f7fafc;
  color: #4a5568;
  border: 2px solid #e2e8f0;
}

.cancel-btn:hover {
  background: #edf2f7;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.save-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.save-btn:hover {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(102, 126, 234, 0.2);
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  color: #4a5568;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  color: #718096;
}

.empty-state svg {
  margin-bottom: 20px;
  opacity: 0.6;
  stroke: #cbd5e0;
}

.empty-state h3 {
  color: #2d3748;
  margin: 0 0 12px 0;
  font-size: 20px;
  font-weight: 700;
}

.empty-state p {
  margin: 0;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
}

/* Progressive Responsive Design - Mobile First Approach with Fluid Scaling */

/* Base styles (Mobile First - 320px+) */
.appointments-management {
  padding: clamp(8px, 3vw, 12px);
  min-height: calc(100vh - 64px);
}

.page-header {
  padding: clamp(16px, 4vw, 24px) clamp(12px, 3vw, 16px);
  margin-bottom: clamp(12px, 3vw, 20px);
  border-radius: clamp(12px, 2vw, 16px);
}

.page-header h1 {
  font-size: clamp(20px, 6vw, 28px);
  line-height: 1.2;
  margin-bottom: clamp(6px, 2vw, 12px);
}

.page-header p {
  font-size: clamp(13px, 4vw, 16px);
}

.filters-section {
  padding: clamp(14px, 4vw, 20px);
  border-radius: clamp(12px, 2vw, 16px);
  margin-bottom: clamp(12px, 3vw, 20px);
}

.filters-row {
  display: flex;
  flex-direction: column;
  gap: clamp(10px, 3vw, 16px);
}

.filter-group label {
  font-size: clamp(12px, 3vw, 14px);
}

.filter-group input,
.filter-group select {
  padding: clamp(10px, 3vw, 12px) clamp(12px, 3vw, 14px);
  font-size: clamp(13px, 4vw, 15px);
  border-radius: clamp(8px, 2vw, 12px);
}

.table-container {
  border-radius: clamp(12px, 2vw, 16px);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin: 0 clamp(-12px, -3vw, 0px);
}

.data-table {
  min-width: 600px;
  font-size: clamp(12px, 3vw, 14px);
}

.data-table th,
.data-table td {
  padding: clamp(8px, 2vw, 12px) clamp(10px, 2vw, 14px);
}

.customer-name,
.service-name,
.date {
  font-size: clamp(12px, 3vw, 14px);
}

.customer-contact,
.service-description,
.time {
  font-size: clamp(11px, 3vw, 13px);
}

.status-badge,
.vehicle-size {
  padding: clamp(4px, 1vw, 6px) clamp(8px, 2vw, 12px);
  font-size: clamp(9px, 2vw, 11px);
}

.price-cell {
  font-size: clamp(13px, 4vw, 16px);
}

.modal {
  margin: clamp(8px, 2vw, 16px);
  width: calc(100% - clamp(16px, 4vw, 32px));
  border-radius: clamp(12px, 2vw, 16px);
  max-height: calc(100vh - clamp(16px, 4vw, 32px));
}

.modal-header,
.modal-form {
  padding: clamp(16px, 4vw, 24px);
}

.modal-header h3 {
  font-size: clamp(18px, 5vw, 24px);
}

.modal-actions {
  flex-direction: column;
  gap: clamp(8px, 2vw, 12px);
}

/* Small Mobile Enhanced - 375px+ */
@media (min-width: 375px) {
  .appointments-management {
    padding: clamp(12px, 3vw, 16px);
  }
  
  .page-header {
    padding: clamp(20px, 5vw, 28px) clamp(16px, 4vw, 20px);
    margin-bottom: clamp(16px, 4vw, 24px);
    border-radius: clamp(14px, 2vw, 18px);
  }
  
  .page-header h1 {
    font-size: clamp(24px, 6vw, 32px);
    margin-bottom: clamp(8px, 2vw, 14px);
  }
  
  .page-header p {
    font-size: clamp(14px, 4vw, 18px);
  }
  
  .filters-section {
    padding: clamp(16px, 4vw, 24px);
    border-radius: clamp(14px, 2vw, 18px);
    margin-bottom: clamp(16px, 4vw, 24px);
  }
  
  .filters-row {
    gap: clamp(12px, 3vw, 18px);
  }
  
  .data-table {
    min-width: 650px;
    font-size: clamp(13px, 3vw, 15px);
  }
  
  .data-table th,
  .data-table td {
    padding: clamp(10px, 2vw, 14px) clamp(12px, 3vw, 16px);
  }
  
  .customer-name,
  .service-name,
  .date {
    font-size: clamp(13px, 3vw, 15px);
  }
  
  .customer-contact,
  .service-description,
  .time {
    font-size: clamp(12px, 3vw, 14px);
  }
  
  .status-badge,
  .vehicle-size {
    padding: clamp(5px, 1vw, 7px) clamp(10px, 2vw, 14px);
    font-size: clamp(10px, 2vw, 12px);
  }
}

/* Large Mobile / Small Tablet - 480px+ */
@media (min-width: 480px) {
  .filters-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: clamp(14px, 3vw, 20px);
  }
  
  .data-table {
    min-width: 750px;
  }
  
  .modal-actions {
    flex-direction: row;
    justify-content: flex-end;
    gap: clamp(10px, 2vw, 16px);
  }
  
  .cancel-btn,
  .save-btn {
    flex: 0 0 auto;
    min-width: 120px;
  }
}

/* Portrait Tablet - 600px+ */
@media (min-width: 600px) {
  .appointments-management {
    padding: clamp(16px, 3vw, 24px);
  }
  
  .page-header {
    padding: clamp(32px, 6vw, 40px) clamp(24px, 4vw, 32px);
    margin-bottom: clamp(24px, 4vw, 32px);
    border-radius: clamp(16px, 2vw, 20px);
  }
  
  .page-header h1 {
    font-size: clamp(28px, 6vw, 36px);
    margin-bottom: clamp(12px, 2vw, 16px);
  }
  
  .page-header p {
    font-size: clamp(16px, 3vw, 20px);
  }
  
  .filters-section {
    padding: clamp(20px, 4vw, 28px);
    border-radius: clamp(16px, 2vw, 20px);
    margin-bottom: clamp(20px, 4vw, 28px);
  }
  
  .filters-row {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: clamp(16px, 3vw, 24px);
  }
  
  .table-container {
    border-radius: clamp(16px, 2vw, 20px);
    margin: 0;
  }
  
  .data-table {
    min-width: 900px;
    font-size: clamp(14px, 2vw, 16px);
  }
  
  .data-table th,
  .data-table td {
    padding: clamp(14px, 2vw, 18px) clamp(16px, 3vw, 20px);
  }
  
  .modal {
    max-width: clamp(400px, 60vw, 520px);
    margin: clamp(20px, 4vw, 32px) auto;
    width: 90%;
  }
}

/* Standard Tablet - 768px+ */
@media (min-width: 768px) {
  .appointments-management {
    padding: clamp(20px, 3vw, 28px);
  }
  
  .page-header {
    padding: clamp(36px, 6vw, 48px) clamp(28px, 4vw, 36px);
    margin-bottom: clamp(28px, 4vw, 36px);
    border-radius: clamp(18px, 2vw, 22px);
  }
  
  .page-header h1 {
    font-size: clamp(32px, 5vw, 42px);
  }
  
  .page-header p {
    font-size: clamp(17px, 3vw, 22px);
  }
  
  .filters-section {
    padding: clamp(24px, 4vw, 32px);
    border-radius: clamp(18px, 2vw, 22px);
    margin-bottom: clamp(24px, 4vw, 32px);
  }
  
  .filters-row {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: clamp(18px, 3vw, 26px);
  }
  
  .data-table {
    min-width: 1000px;
    font-size: clamp(14px, 2vw, 16px);
  }
  
  .data-table th,
  .data-table td {
    padding: clamp(15px, 2vw, 20px) clamp(18px, 3vw, 24px);
  }
  
  .status-badge {
    padding: clamp(7px, 1vw, 10px) clamp(14px, 2vw, 18px);
    font-size: clamp(11px, 2vw, 13px);
  }
  
  .vehicle-size {
    padding: clamp(6px, 1vw, 9px) clamp(13px, 2vw, 17px);
    font-size: clamp(11px, 2vw, 13px);
  }
  
  .modal {
    max-width: clamp(480px, 65vw, 580px);
  }
}

/* Large Tablet / Small Desktop - 1024px+ */
@media (min-width: 1024px) {
  .appointments-management {
    padding: clamp(24px, 3vw, 32px);
  }
  
  .page-header {
    padding: clamp(42px, 6vw, 56px) clamp(32px, 4vw, 44px);
    margin-bottom: clamp(32px, 4vw, 44px);
    border-radius: clamp(20px, 2vw, 24px);
  }
  
  .page-header h1 {
    font-size: clamp(36px, 4vw, 48px);
    margin-bottom: clamp(14px, 2vw, 18px);
  }
  
  .page-header p {
    font-size: clamp(18px, 2vw, 24px);
  }
  
  .filters-section {
    padding: clamp(28px, 4vw, 36px);
    border-radius: clamp(20px, 2vw, 24px);
    margin-bottom: clamp(28px, 4vw, 36px);
  }
  
  .filters-row {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: clamp(20px, 3vw, 28px);
  }
  
  .filter-group input,
  .filter-group select {
    padding: clamp(13px, 2vw, 16px) clamp(16px, 2vw, 20px);
    font-size: clamp(14px, 1vw, 16px);
  }
  
  .table-container {
    border-radius: clamp(20px, 2vw, 24px);
  }
  
  .data-table {
    min-width: 1200px;
    font-size: clamp(14px, 1vw, 16px);
  }
  
  .data-table th,
  .data-table td {
    padding: clamp(16px, 2vw, 22px) clamp(20px, 2vw, 26px);
  }
  
  .customer-name,
  .service-name,
  .date {
    font-size: clamp(14px, 1vw, 16px);
  }
  
  .customer-contact,
  .service-description,
  .time {
    font-size: clamp(13px, 1vw, 15px);
  }
  
  .status-badge {
    padding: clamp(8px, 1vw, 12px) clamp(16px, 2vw, 20px);
    font-size: clamp(11px, 1vw, 13px);
  }
  
  .vehicle-size {
    padding: clamp(7px, 1vw, 10px) clamp(14px, 2vw, 18px);
    font-size: clamp(11px, 1vw, 13px);
  }
  
  .modal {
    max-width: clamp(520px, 60vw, 680px);
  }
  
  .modal-header,
  .modal-form {
    padding: clamp(24px, 3vw, 36px);
  }
  
  .modal-header h3 {
    font-size: clamp(20px, 2vw, 28px);
  }
}

/* Standard Desktop - 1200px+ */
@media (min-width: 1200px) {
  .appointments-management {
    padding: clamp(28px, 3vw, 40px) clamp(32px, 4vw, 48px);
  }
  
  .page-header {
    padding: clamp(48px, 5vw, 64px) clamp(36px, 4vw, 48px);
    margin-bottom: clamp(36px, 4vw, 48px);
    border-radius: clamp(22px, 2vw, 28px);
  }
  
  .page-header h1 {
    font-size: clamp(40px, 3vw, 52px);
    margin-bottom: clamp(16px, 2vw, 20px);
  }
  
  .page-header p {
    font-size: clamp(19px, 2vw, 26px);
  }
  
  .filters-section {
    padding: clamp(32px, 3vw, 44px);
    border-radius: clamp(22px, 2vw, 28px);
    margin-bottom: clamp(32px, 4vw, 44px);
  }
  
  .filters-row {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: clamp(24px, 3vw, 32px);
  }
  
  .data-table {
    min-width: 1300px;
  }
  
  .data-table th,
  .data-table td {
    padding: clamp(18px, 2vw, 24px) clamp(22px, 2vw, 28px);
  }
  
  .status-badge {
    padding: clamp(9px, 1vw, 13px) clamp(17px, 2vw, 22px);
    font-size: clamp(12px, 1vw, 14px);
  }
  
  .vehicle-size {
    padding: clamp(8px, 1vw, 11px) clamp(15px, 2vw, 20px);
    font-size: clamp(12px, 1vw, 14px);
  }
  
  .modal {
    max-width: clamp(580px, 55vw, 720px);
  }
}

/* Large Desktop - 1440px+ */
@media (min-width: 1440px) {
  .appointments-management {
    padding: clamp(32px, 3vw, 48px) clamp(40px, 4vw, 64px);
  }
  
  .page-header {
    padding: clamp(56px, 5vw, 72px) clamp(44px, 4vw, 56px);
    margin-bottom: clamp(40px, 4vw, 56px);
    border-radius: clamp(24px, 2vw, 32px);
  }
  
  .page-header h1 {
    font-size: clamp(44px, 3vw, 60px);
  }
  
  .page-header p {
    font-size: clamp(21px, 2vw, 30px);
  }
  
  .filters-section {
    padding: clamp(36px, 3vw, 48px);
    border-radius: clamp(24px, 2vw, 32px);
    margin-bottom: clamp(36px, 4vw, 48px);
  }
  
  .filters-row {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: clamp(28px, 3vw, 36px);
  }
  
  .data-table {
    min-width: 1400px;
  }
  
  .data-table th,
  .data-table td {
    padding: clamp(20px, 2vw, 28px) clamp(24px, 2vw, 32px);
  }
  
  .modal {
    max-width: clamp(620px, 50vw, 800px);
  }
  
  .modal-header,
  .modal-form {
    padding: clamp(32px, 3vw, 44px);
  }
  
  .modal-header h3 {
    font-size: clamp(24px, 2vw, 32px);
  }
}

/* Ultra-wide Desktop - 1920px+ */
@media (min-width: 1920px) {
  .appointments-management {
    max-width: 1800px;
    margin: 0 auto;
    padding: clamp(40px, 2vw, 56px) clamp(48px, 3vw, 80px);
  }
  
  .page-header h1 {
    font-size: clamp(52px, 3vw, 68px);
  }
  
  .page-header p {
    font-size: clamp(24px, 1vw, 32px);
  }
  
  .data-table {
    min-width: 1600px;
  }
  
  .modal {
    max-width: clamp(680px, 45vw, 900px);
  }
}

/* Extra Ultra-wide - 2560px+ */
@media (min-width: 2560px) {
  .appointments-management {
    max-width: 2200px;
    padding: clamp(48px, 2vw, 64px) clamp(64px, 3vw, 100px);
  }
  
  .page-header h1 {
    font-size: clamp(60px, 2vw, 76px);
  }
  
  .page-header p {
    font-size: clamp(28px, 1vw, 36px);
  }
  
  .data-table {
    min-width: 1800px;
  }
  
  .modal {
    max-width: clamp(760px, 40vw, 1000px);
  }
}

/* Device-specific optimizations */

/* iPhone SE and similar compact devices */
@media (max-width: 375px) and (max-height: 667px) {
  .page-header h1 {
    font-size: clamp(18px, 5vw, 22px);
  }
  
  .data-table {
    min-width: 580px;
    font-size: 11px;
  }
  
  .modal {
    margin: 4px;
    width: calc(100% - 8px);
  }
}

/* iPad Mini portrait */
@media (min-width: 744px) and (max-width: 834px) and (orientation: portrait) {
  .filters-row {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .data-table {
    min-width: 850px;
  }
}

/* iPad Pro and large tablets */
@media (min-width: 1024px) and (max-width: 1366px) {
  .filters-row {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .data-table {
    min-width: 1150px;
  }
}

/* Landscape mobile optimizations */
@media (max-height: 500px) and (orientation: landscape) {
  .page-header {
    padding: clamp(12px, 3vw, 20px) clamp(16px, 4vw, 24px);
    margin-bottom: clamp(8px, 2vw, 16px);
  }
  
  .page-header h1 {
    font-size: clamp(20px, 5vw, 28px);
    margin-bottom: clamp(4px, 1vw, 8px);
  }
  
  .page-header p {
    font-size: clamp(12px, 3vw, 16px);
  }
  
  .filters-section {
    padding: clamp(12px, 3vw, 20px);
  }
  
  .modal {
    max-height: 90vh;
  }
  
  .modal-header,
  .modal-form {
    padding: clamp(12px, 3vw, 20px);
  }
}

/* High DPI / Retina displays */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .data-table th,
  .data-table td {
    border-width: 0.5px;
  }
  
  .status-badge,
  .vehicle-size {
    border-width: 0.5px;
  }
  
  .filter-group input,
  .filter-group select,
  .form-group input,
  .form-group textarea,
  .form-group select {
    border-width: 1px;
  }
}

/* Reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  .data-table tr,
  .filter-group input,
  .filter-group select,
  .cancel-btn,
  .save-btn,
  .modal {
    transition: none;
  }
  
  .data-table tr:hover {
    transform: none;
  }
  
  .loading-spinner {
    animation: none;
    border: 4px solid #667eea;
  }
}

/* Print styles */
@media print {
  .appointments-management {
    padding: 0 !important;
    background: white !important;
  }
  
  .page-header,
  .filters-section,
  .table-container {
    background: white !important;
    box-shadow: none !important;
    border: 1px solid #000 !important;
    page-break-inside: avoid;
  }
  
  .modal-overlay {
    display: none !important;
  }
  
  .data-table {
    min-width: 100% !important;
    font-size: 10px !important;
  }
  
  .data-table th,
  .data-table td {
    padding: 4px 6px !important;
    border: 1px solid #000 !important;
  }
  
  .data-table tr:hover {
    background: transparent !important;
    transform: none !important;
  }
  
  .status-badge,
  .vehicle-size {
    background: white !important;
    color: black !important;
    border: 1px solid #000 !important;
    font-size: 8px !important;
    padding: 2px 4px !important;
  }
  
  .page-header h1 {
    font-size: 24px !important;
    color: black !important;
  }
  
  .page-header p {
    font-size: 14px !important;
    color: black !important;
  }
}
</style>
