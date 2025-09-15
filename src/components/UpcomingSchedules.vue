<template>
  <div class="upcoming-schedules">
    <!-- Page Header -->
    <div class="page-header">
      <h1>Upcoming Schedules</h1>
      <p>Manage confirmed appointments and update their status.</p>
    </div>

    <!-- Filters and Search -->
    <div class="filters-section">
      <div class="filters-row">
        <div class="filter-group">
          <label>Time Period:</label>
          <select v-model="timePeriod" @change="filterAppointments">
            <option value="all">All Upcoming</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="overdue">Overdue (Late)</option>
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
            <option value="customer">Customer Name</option>
            <option value="service">Service Type</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Upcoming Schedules List -->
    <div class="schedules-container">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading upcoming schedules...</p>
      </div>
      
      <div v-else-if="filteredAppointments.length === 0" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <h3>No upcoming schedules</h3>
        <p>No confirmed appointments found for the selected criteria.</p>
      </div>
      
      <div v-else class="schedules-list">
        <div 
          v-for="appointment in filteredAppointments" 
          :key="appointment.appointmentID"
          class="schedule-card"
          :class="{ 
            'past-appointment': isAppointmentInPast(appointment),
            'overdue-appointment': isAppointmentOverdue(appointment)
          }"
        >
          <div class="schedule-header">
            <div class="appointment-info">
              <div class="customer-info">
                <span class="customer-name">{{ appointment.customer?.name }}</span>
                <span class="customer-contact">{{ appointment.customer?.email }} • {{ appointment.customer?.phone }}</span>
              </div>
            </div>
            <div class="appointment-datetime">
              <div class="date">{{ formatDate(appointment.appointmentDateTime) }}</div>
              <div class="time">{{ formatTime(appointment.appointmentDateTime) }}</div>
              <div v-if="isAppointmentOverdue(appointment)" class="status-indicator">
                <span class="overdue-badge">OVERDUE</span>
              </div>
            </div>
          </div>
          
          <div class="schedule-details">
            <div class="service-info">
              <div class="service-name">{{ getServiceName(appointment.service_rate?.serviceTypeID) }}</div>
              <div class="service-description">{{ getServiceDescription(appointment.service_rate?.serviceTypeID) }}</div>
            </div>
            <div class="vehicle-info">
              <span class="vehicle-size">{{ getVehicleSizeDescription(appointment.service_rate?.vehicleSizeCode) }}</span>
            </div>
            <div class="price-info">
              <span class="price">₱{{ parseFloat(appointment.service_rate?.price || 0).toFixed(2) }}</span>
            </div>
          </div>
          
          <div v-if="appointment.notes" class="notes-section">
            <div class="notes-label">Notes:</div>
            <div class="notes-content">{{ appointment.notes }}</div>
          </div>
          
          <div class="schedule-actions">
            <div class="status-actions">
              <button 
                @click="updateAppointmentStatus(appointment.appointmentID, 'completed')"
                class="action-btn complete-btn"
                title="Mark as completed"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
                Mark Completed
              </button>
              <button 
                @click="updateAppointmentStatus(appointment.appointmentID, 'cancelled')"
                class="action-btn cancel-btn"
                title="Cancel appointment"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
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
const timePeriod = ref('all')
const searchQuery = ref('')
const sortBy = ref('date')

// Form data
const appointmentForm = reactive({
  appointmentDateTime: '',
  notes: ''
})

// Computed
const filteredAppointments = computed(() => {
  let filtered = appointments.value

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
        case 'overdue':
          return isAppointmentOverdue({ appointmentDateTime: apt.appointmentDateTime })
        case 'expired':
          // Since expired appointments are auto-cancelled, this will show empty results
          // but kept for consistency in case you want to show recently auto-cancelled ones
          return false
        default:
          return true
      }
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
      case 'customer':
        return (a.customer?.name || '').localeCompare(b.customer?.name || '')
      case 'service':
        return getServiceName(a.service_rate?.serviceTypeID).localeCompare(getServiceName(b.service_rate?.serviceTypeID))
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
      appointmentApi.getConfirmedAppointments(),
      serviceApi.getServiceTypes(),
      serviceApi.getVehicleSizes()
    ])
    
    // Auto-cancel expired appointments
    const expiredAppointments = appointmentsData.filter(apt => isAppointmentExpired(apt))
    
    // Process auto-cancellations
    if (expiredAppointments.length > 0) {
      console.log(`Auto-cancelling ${expiredAppointments.length} expired appointments`)
      
      for (const appointment of expiredAppointments) {
        try {
          await appointmentApi.updateAppointment(appointment.appointmentID, { 
            status: 'cancelled',
            notes: (appointment.notes || '') + '\n[Auto-cancelled: 30+ minutes past scheduled time]'
          })
        } catch (error) {
          console.error(`Failed to auto-cancel appointment ${appointment.appointmentID}:`, error)
        }
      }
      
      // Remove auto-cancelled appointments from the list
      appointments.value = appointmentsData.filter(apt => !isAppointmentExpired(apt))
    } else {
      appointments.value = appointmentsData
    }
    
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

// Helper method to check if appointment is overdue (past scheduled time but still within grace period)
const isAppointmentOverdue = (appointment) => {
  const appointmentDate = new Date(appointment.appointmentDateTime)
  const now = new Date()
  return now > appointmentDate
}

// Updated method with 30-minute grace period
const isAppointmentExpired = (appointment) => {
  const appointmentDate = new Date(appointment.appointmentDateTime)
  const now = new Date()
  
  // Add 30 minutes (30 * 60 * 1000 milliseconds) grace period
  const gracePeriod = 30 * 60 * 1000
  const appointmentWithGrace = new Date(appointmentDate.getTime() + gracePeriod)
  
  return now > appointmentWithGrace
}

// Helper method to provide appropriate tooltip for the complete button
const getCompleteButtonTooltip = (appointment) => {
  return 'Mark as completed'
}

// Keep the old method for visual styling purposes (past appointments)
const isAppointmentInPast = (appointment) => {
  const appointmentDate = new Date(appointment.appointmentDateTime)
  const now = new Date()
  return appointmentDate < now
}

const updateAppointmentStatus = async (appointmentID, newStatus) => {
  const statusText = newStatus === 'completed' ? 'completed' : 'cancelled'
  const confirmMessage = newStatus === 'completed' 
    ? 'Are you sure you want to mark this appointment as completed?' 
    : 'Are you sure you want to cancel this appointment?'
  
  if (confirm(confirmMessage)) {
    try {
      await appointmentApi.updateAppointment(appointmentID, { status: newStatus })
      
      // Remove from the list since it's no longer confirmed
      appointments.value = appointments.value.filter(apt => apt.appointmentID !== appointmentID)
      
      alert(`Appointment ${statusText} successfully!`)
    } catch (error) {
      console.error('Error updating appointment status:', error)
      alert(`Failed to ${statusText} appointment`)
    }
  }
}

const saveAppointment = async () => {
  try {
    await appointmentApi.updateAppointment(editingAppointment.value.appointmentID, appointmentForm)
    
    // Update local state
    const appointment = appointments.value.find(apt => apt.appointmentID === editingAppointment.value.appointmentID)
    if (appointment) {
      appointment.appointmentDateTime = appointmentForm.appointmentDateTime
      appointment.notes = appointmentForm.notes
    }
    
    closeModal()
    alert('Appointment updated successfully!')
  } catch (error) {
    console.error('Error saving appointment:', error)
    alert('Failed to save appointment changes')
  }
}

const formatDate = (dateTimeString) => {
  if (!dateTimeString) return 'N/A'
  return new Date(dateTimeString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
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
.upcoming-schedules {
  background: #f8fafc;
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
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
}

.filters-row {
  display: flex;
  gap: 24px;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 200px;
}

.filter-group label {
  color: #4a5568;
  font-weight: 500;
  font-size: 14px;
}

.filter-group input,
.filter-group select {
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.filter-group input:focus,
.filter-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.schedules-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.schedules-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
}

.schedule-card {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;
  background: white;
}

.schedule-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.schedule-card.past-appointment {
  opacity: 0.7;
  background: #f9fafb;
  border-color: #d1d5db;
}

/* Status-specific card styling */
.schedule-card.overdue-appointment {
  border-color: #f6ad55;
  background: #fffbeb;
}

.schedule-card.overdue-appointment:hover {
  border-color: #ed8936;
  box-shadow: 0 4px 12px rgba(246, 173, 85, 0.25);
}

.schedule-card.expired-appointment {
  border-color: #fc8181;
  background: #fef5f5;
}

.schedule-card.expired-appointment:hover {
  border-color: #e53e3e;
  box-shadow: 0 4px 12px rgba(252, 129, 129, 0.25);
}

.schedule-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.appointment-info h3 {
  color: #2d3748;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.customer-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.customer-name {
  font-weight: 600;
  color: #2d3748;
  font-size: 16px;
}

.customer-contact {
  color: #718096;
  font-size: 14px;
}

.appointment-datetime {
  text-align: right;
}

.appointment-datetime .date {
  font-weight: 600;
  color: #2d3748;
  font-size: 16px;
}

.appointment-datetime .time {
  color: #667eea;
  font-size: 14px;
  font-weight: 500;
}

/* Status indicator styles */
.status-indicator {
  margin-top: 8px;
}

.overdue-badge, .expired-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-block;
}

.overdue-badge {
  background: #fed7aa;
  color: #c2410c;
  border: 1px solid #fb923c;
}

.expired-badge {
  background: #fecaca;
  color: #dc2626;
  border: 1px solid #f87171;
}

.schedule-details {
  display: flex;
  gap: 24px;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.service-info {
  flex: 1;
  min-width: 200px;
}

.service-name {
  font-weight: 600;
  color: #2d3748;
  font-size: 16px;
  margin-bottom: 4px;
}

.service-description {
  color: #718096;
  font-size: 14px;
}

.vehicle-info {
  min-width: 120px;
}

.vehicle-size {
  background: #e6fffa;
  color: #319795;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  display: inline-block;
}

.price-info {
  min-width: 100px;
  text-align: right;
}

.price {
  font-weight: 700;
  color: #38a169;
  font-size: 18px;
}

.notes-section {
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.notes-label {
  font-weight: 500;
  color: #4a5568;
  font-size: 14px;
  margin-bottom: 4px;
}

.notes-content {
  color: #2d3748;
  font-size: 14px;
}

.schedule-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.status-actions {
  display: flex;
  gap: 12px;
}

.edit-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.complete-btn {
  background: #f0fff4;
  color: #38a169;
  border: 1px solid #68d391;
}

.complete-btn:hover:not(:disabled) {
  background: #dcfce7;
  border-color: #4ade80;
}

.complete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f7fafc;
  color: #a0aec0;
  border-color: #e2e8f0;
}

.complete-btn:disabled:hover {
  background: #f7fafc;
  border-color: #e2e8f0;
}

.cancel-btn {
  background: #fed7d7;
  color: #e53e3e;
  border: 1px solid #fc8181;
}

.cancel-btn:hover {
  background: #fecaca;
  border-color: #f87171;
}

.edit-btn {
  background: #e6f3ff;
  color: #2563eb;
  border: 1px solid #93c5fd;
}

.edit-btn:hover {
  background: #dbeafe;
  border-color: #60a5fa;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  color: #718096;
}

.empty-state svg {
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h3 {
  color: #4a5568;
  margin: 0 0 8px 0;
}

.empty-state p {
  margin: 0;
  text-align: center;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  color: #2d3748;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #718096;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-form {
  padding: 24px;
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
  gap: 12px;
  margin-top: 24px;
}

.modal-actions .cancel-btn, 
.modal-actions .save-btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-actions .cancel-btn {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.modal-actions .cancel-btn:hover {
  background: #edf2f7;
}

.modal-actions .save-btn {
  background: #667eea;
  color: white;
  border: none;
}

.modal-actions .save-btn:hover {
  background: #5a67d8;
}

/* Enhanced Responsive Media Queries for Upcoming Schedules */

/* Extra Large Screens (Desktops 1400px+) */
@media (min-width: 1400px) {
  .upcoming-schedules {
    padding: 32px 48px;
  }
  
  .page-header {
    padding: 64px 48px;
    margin-bottom: 48px;
  }
  
  .page-header h1 {
    font-size: 52px;
  }
  
  .page-header p {
    font-size: 24px;
  }
  
  .filters-section {
    padding: 32px;
    margin-bottom: 32px;
  }
  
  .filters-row {
    gap: 32px;
  }
  
  .filter-group {
    min-width: 240px;
  }
  
  .schedules-list {
    padding: 32px;
    gap: 24px;
  }
  
  .schedule-card {
    padding: 32px;
  }
  
  .schedule-details {
    gap: 32px;
  }
}

/* Large Screens (Desktops 1024px - 1399px) */
@media (min-width: 1024px) and (max-width: 1399px) {
  .upcoming-schedules {
    padding: 28px 32px;
  }
  
  .page-header h1 {
    font-size: 46px;
  }
  
  .page-header p {
    font-size: 22px;
  }
  
  .filters-section {
    padding: 28px;
  }
  
  .schedules-list {
    padding: 28px;
    gap: 20px;
  }
  
  .schedule-card {
    padding: 28px;
  }
}

/* Medium Screens (Tablets 768px - 1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
  .upcoming-schedules {
    padding: 20px;
  }
  
  .page-header {
    padding: 40px 28px;
    margin-bottom: 28px;
  }
  
  .page-header h1 {
    font-size: 36px;
  }
  
  .page-header p {
    font-size: 18px;
  }
  
  .filters-section {
    padding: 24px;
    margin-bottom: 24px;
  }
  
  .filters-row {
    flex-wrap: wrap;
    gap: 20px;
  }
  
  .filter-group {
    min-width: 180px;
    flex: 1;
  }
  
  .schedules-list {
    padding: 24px;
    gap: 18px;
  }
  
  .schedule-card {
    padding: 24px;
  }
  
  .schedule-header {
    margin-bottom: 16px;
  }
  
  .appointment-info h3 {
    font-size: 17px;
  }
  
  .customer-name,
  .appointment-datetime .date {
    font-size: 15px;
  }
  
  .schedule-details {
    gap: 20px;
  }
  
  .service-info {
    min-width: 160px;
  }
  
  .vehicle-info {
    min-width: 100px;
  }
  
  .price-info {
    min-width: 80px;
  }
  
  .price {
    font-size: 17px;
  }
  
  .action-btn {
    padding: 9px 14px;
    font-size: 13px;
  }
}

/* Small Screens (Mobile Landscape/Small Tablets 481px - 767px) */
@media (min-width: 481px) and (max-width: 767px) {
  .upcoming-schedules {
    padding: 16px;
  }
  
  .page-header {
    padding: 32px 20px;
    margin-bottom: 24px;
  }
  
  .page-header h1 {
    font-size: 32px;
  }
  
  .page-header p {
    font-size: 16px;
  }
  
  .filters-section {
    padding: 20px;
    margin-bottom: 20px;
  }
  
  .filters-row {
    flex-direction: column;
    gap: 16px;
  }
  
  .filter-group {
    min-width: auto;
  }
  
  .filter-group input,
  .filter-group select {
    padding: 12px 14px;
    font-size: 15px;
  }
  
  .schedules-list {
    padding: 20px;
    gap: 16px;
  }
  
  .schedule-card {
    padding: 20px;
  }
  
  .schedule-header {
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
  }
  
  .appointment-datetime {
    text-align: left;
  }
  
  .appointment-info h3 {
    font-size: 16px;
    margin-bottom: 6px;
  }
  
  .customer-name {
    font-size: 15px;
  }
  
  .customer-contact {
    font-size: 13px;
  }
  
  .appointment-datetime .date {
    font-size: 15px;
  }
  
  .appointment-datetime .time {
    font-size: 13px;
  }
  
  .schedule-details {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 16px;
  }
  
  .service-info {
    min-width: auto;
    width: 100%;
  }
  
  .service-name {
    font-size: 15px;
  }
  
  .service-description {
    font-size: 13px;
  }
  
  .vehicle-info,
  .price-info {
    min-width: auto;
    width: 100%;
    text-align: left;
  }
  
  .price {
    font-size: 16px;
  }
  
  .notes-section {
    padding: 16px;
    margin-bottom: 16px;
  }
  
  .notes-label {
    font-size: 13px;
  }
  
  .notes-content {
    font-size: 13px;
  }
  
  .schedule-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .status-actions,
  .edit-actions {
    justify-content: center;
    gap: 10px;
  }
  
  .action-btn {
    flex: 1;
    justify-content: center;
    padding: 12px 16px;
    font-size: 14px;
  }
  
  .modal {
    max-width: 450px;
    margin: 20px;
    width: calc(100% - 40px);
  }
  
  .modal-header {
    padding: 18px 20px;
  }
  
  .modal-form {
    padding: 20px;
  }
  
  .form-group {
    margin-bottom: 18px;
  }
  
  .form-group input,
  .form-group textarea {
    padding: 12px 14px;
    font-size: 15px;
  }
  
  .modal-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .modal-actions .cancel-btn,
  .modal-actions .save-btn {
    width: 100%;
    padding: 12px 16px;
    text-align: center;
  }
}

/* Extra Small Screens (Mobile Portrait 320px - 480px) */
@media (max-width: 480px) {
  .upcoming-schedules {
    padding: 12px;
  }
  
  .page-header {
    padding: 24px 16px;
    margin-bottom: 20px;
    border-radius: 16px;
  }
  
  .page-header h1 {
    font-size: 28px;
    line-height: 1.2;
    margin-bottom: 12px;
  }
  
  .page-header p {
    font-size: 15px;
  }
  
  .filters-section {
    padding: 16px;
    margin-bottom: 16px;
    border-radius: 10px;
  }
  
  .filters-row {
    gap: 14px;
  }
  
  .filter-group label {
    font-size: 13px;
  }
  
  .filter-group input,
  .filter-group select {
    padding: 10px 12px;
    font-size: 14px;
    border-radius: 8px;
  }
  
  .schedules-container {
    border-radius: 10px;
  }
  
  .schedules-list {
    padding: 16px;
    gap: 14px;
  }
  
  .schedule-card {
    padding: 16px;
    border-radius: 10px;
  }
  
  .schedule-header {
    gap: 10px;
    margin-bottom: 14px;
  }
  
  .appointment-info h3 {
    font-size: 15px;
    margin-bottom: 6px;
  }
  
  .customer-name {
    font-size: 14px;
  }
  
  .customer-contact {
    font-size: 12px;
  }
  
  .appointment-datetime .date {
    font-size: 14px;
  }
  
  .appointment-datetime .time {
    font-size: 12px;
  }
  
  .overdue-badge,
  .expired-badge {
    font-size: 10px;
    padding: 3px 6px;
    border-radius: 6px;
  }
  
  .schedule-details {
    gap: 10px;
    margin-bottom: 14px;
  }
  
  .service-name {
    font-size: 14px;
    margin-bottom: 3px;
  }
  
  .service-description {
    font-size: 12px;
  }
  
  .vehicle-size {
    padding: 5px 10px;
    font-size: 12px;
    border-radius: 8px;
  }
  
  .price {
    font-size: 15px;
  }
  
  .notes-section {
    padding: 12px;
    margin-bottom: 14px;
    border-radius: 6px;
  }
  
  .notes-label {
    font-size: 12px;
    margin-bottom: 3px;
  }
  
  .notes-content {
    font-size: 12px;
  }
  
  .schedule-actions {
    gap: 10px;
  }
  
  .status-actions,
  .edit-actions {
    gap: 8px;
  }
  
  .action-btn {
    padding: 10px 12px;
    font-size: 13px;
    border-radius: 6px;
    gap: 6px;
  }
  
  .loading-state,
  .empty-state {
    padding: 40px 16px;
    border-radius: 10px;
  }
  
  .loading-spinner {
    width: 32px;
    height: 32px;
    margin-bottom: 12px;
  }
  
  .empty-state h3 {
    font-size: 16px;
    margin-bottom: 6px;
  }
  
  .empty-state p {
    font-size: 14px;
  }
  
  .modal {
    margin: 12px;
    width: calc(100% - 24px);
    border-radius: 12px;
    max-height: calc(100vh - 24px);
  }
  
  .modal-header {
    padding: 16px;
    border-radius: 12px 12px 0 0;
  }
  
  .modal-header h3 {
    font-size: 16px;
  }
  
  .close-btn {
    width: 28px;
    height: 28px;
    font-size: 20px;
  }
  
  .modal-form {
    padding: 16px;
  }
  
  .form-group {
    margin-bottom: 16px;
  }
  
  .form-group label {
    font-size: 13px;
    margin-bottom: 5px;
  }
  
  .form-group input,
  .form-group textarea {
    padding: 10px 12px;
    font-size: 14px;
    border-radius: 8px;
  }
  
  .modal-actions {
    gap: 8px;
    margin-top: 20px;
  }
  
  .modal-actions .cancel-btn,
  .modal-actions .save-btn {
    padding: 12px 16px;
    font-size: 14px;
    border-radius: 8px;
  }
}

/* Very Small Screens (320px and below) */
@media (max-width: 320px) {
  .page-header h1 {
    font-size: 24px;
  }
  
  .page-header p {
    font-size: 14px;
  }
  
  .filters-section {
    padding: 12px;
  }
  
  .schedules-list {
    padding: 12px;
    gap: 12px;
  }
  
  .schedule-card {
    padding: 12px;
  }
  
  .appointment-info h3 {
    font-size: 14px;
  }
  
  .customer-name,
  .appointment-datetime .date {
    font-size: 13px;
  }
  
  .service-name {
    font-size: 13px;
  }
  
  .price {
    font-size: 14px;
  }
  
  .action-btn {
    padding: 8px 10px;
    font-size: 12px;
  }
  
  .modal-header h3 {
    font-size: 15px;
  }
  
  .form-group input,
  .form-group textarea {
    font-size: 13px;
    padding: 9px 10px;
  }
}

/* Landscape orientation adjustments for mobile */
@media (max-height: 500px) and (orientation: landscape) {
  .page-header {
    padding: 20px 16px;
    margin-bottom: 16px;
  }
  
  .page-header h1 {
    font-size: 24px;
    margin-bottom: 8px;
  }
  
  .page-header p {
    font-size: 14px;
  }
  
  .filters-section {
    padding: 12px;
    margin-bottom: 12px;
  }
  
  .schedules-list {
    padding: 12px;
    gap: 10px;
  }
  
  .schedule-card {
    padding: 12px;
  }
  
  .schedule-header {
    margin-bottom: 10px;
  }
  
  .schedule-details {
    margin-bottom: 10px;
  }
  
  .notes-section {
    padding: 8px;
    margin-bottom: 10px;
  }
  
  .modal {
    max-height: 95vh;
  }
  
  .modal-header {
    padding: 12px 16px;
  }
  
  .modal-form {
    padding: 12px 16px;
  }
}

/* High DPI / Retina Display adjustments */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .schedule-card {
    border-width: 1px;
  }
  
  .filter-group input,
  .filter-group select,
  .form-group input,
  .form-group textarea {
    border-width: 1px;
  }
  
  .overdue-badge,
  .expired-badge {
    border-width: 1px;
  }
}

/* Print styles */
@media print {
  .upcoming-schedules {
    padding: 0;
    background: white !important;
  }
  
  .page-header,
  .filters-section,
  .schedules-container {
    background: white !important;
    box-shadow: none !important;
    border: 1px solid #ccc !important;
  }
  
  .filters-section {
    display: none !important;
  }
  
  .modal-overlay {
    display: none !important;
  }
  
  .schedule-card {
    break-inside: avoid;
    page-break-inside: avoid;
    border: 1px solid #ccc !important;
    box-shadow: none !important;
  }
  
  .schedule-card:hover {
    border-color: #ccc !important;
    box-shadow: none !important;
    transform: none !important;
  }
  
  .schedule-actions {
    display: none !important;
  }
  
  .overdue-badge,
  .expired-badge,
  .vehicle-size {
    background: white !important;
    color: black !important;
    border: 1px solid #ccc !important;
  }
  
  .action-btn {
    display: none !important;
  }
}

/* Accessibility - Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .schedule-card,
  .action-btn,
  .filter-group input,
  .filter-group select,
  .form-group input,
  .form-group textarea,
  .modal-actions .cancel-btn,
  .modal-actions .save-btn {
    transition: none;
  }
  
  .loading-spinner {
    animation: none;
  }
  
  .schedule-card:hover {
    transform: none;
  }
}
</style>
