<template>
  <div class="appointments-management">
    <!-- Page Header -->
    <div class="page-header">
      <h1>Appointments Management</h1>
      <p>View and manage customer appointments and bookings.</p>
    </div>

    <!-- Filters and Search -->
    <div class="filters-section">
      <div class="filters-row">
        <div class="filter-group">
          <label>Status Filter:</label>
          <select v-model="statusFilter" @change="filterAppointments">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Date Range:</label>
          <input type="date" v-model="dateFilter" @change="filterAppointments" />
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
            <th>Actions</th>
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
              <select 
                :value="appointment.status" 
                @change="updateAppointmentStatus(appointment.appointmentID, $event.target.value)"
                :class="['status-select', appointment.status]"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
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
            <td>
              <div class="action-buttons">
                <button @click="editAppointment(appointment)" class="edit-btn" title="Edit">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button @click="deleteAppointment(appointment.appointmentID)" class="delete-btn" title="Delete">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3,6 5,6 21,6"/>
                    <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                  </svg>
                </button>
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
            <select v-model="appointmentForm.status" required>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
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
      <p>Try adjusting your filters or check back later.</p>
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
const statusFilter = ref('')
const dateFilter = ref('')
const searchQuery = ref('')

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
const filteredAppointments = computed(() => {
  let filtered = appointments.value

  // Filter by status
  if (statusFilter.value) {
    filtered = filtered.filter(apt => apt.status === statusFilter.value)
  }

  // Filter by date
  if (dateFilter.value) {
    filtered = filtered.filter(apt => {
      const aptDate = new Date(apt.appointmentDateTime).toISOString().split('T')[0]
      return aptDate === dateFilter.value
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

const updateAppointmentStatus = async (appointmentID, newStatus) => {
  try {
    await appointmentApi.updateAppointment(appointmentID, { status: newStatus })
    // Update local state
    const appointment = appointments.value.find(apt => apt.appointmentID === appointmentID)
    if (appointment) {
      appointment.status = newStatus
    }
  } catch (error) {
    console.error('Error updating appointment status:', error)
    alert('Failed to update appointment status')
  }
}

const editAppointment = (appointment) => {
  editingAppointment.value = appointment
  appointmentForm.appointmentDateTime = formatDateTimeForInput(appointment.appointmentDateTime)
  appointmentForm.status = appointment.status
  appointmentForm.notes = appointment.notes || ''
  showEditModal.value = true
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

const deleteAppointment = async (id) => {
  if (confirm('Are you sure you want to delete this appointment?')) {
    try {
      await appointmentApi.deleteAppointment(id)
      appointments.value = appointments.value.filter(apt => apt.appointmentID !== id)
    } catch (error) {
      console.error('Error deleting appointment:', error)
      alert('Failed to delete appointment')
    }
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

.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1200px;
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

.customer-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.customer-name {
  font-weight: 600;
  color: #2d3748;
}

.customer-contact {
  font-size: 12px;
  color: #718096;
}

.service-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.service-name {
  font-weight: 600;
  color: #2d3748;
}

.service-description {
  font-size: 12px;
  color: #718096;
}

.vehicle-size {
  background: #e6fffa;
  color: #319795;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.datetime-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.date {
  font-weight: 600;
  color: #2d3748;
}

.time {
  font-size: 12px;
  color: #718096;
}

.status-select {
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.status-select.pending {
  background: #fef5e7;
  color: #d69e2e;
  border-color: #f6e05e;
}

.status-select.confirmed {
  background: #f0fff4;
  color: #38a169;
  border-color: #68d391;
}

.status-select.completed {
  background: #e6fffa;
  color: #319795;
  border-color: #4fd1c7;
}

.status-select.cancelled {
  background: #fed7d7;
  color: #e53e3e;
  border-color: #fc8181;
}

.price-cell {
  font-weight: 600;
  color: #38a169;
}

.notes-cell {
  max-width: 200px;
}

.has-notes {
  color: #4a5568;
  font-size: 12px;
}

.no-notes {
  color: #a0aec0;
  font-style: italic;
  font-size: 12px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.edit-btn, .delete-btn {
  border: none;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
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
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
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

.cancel-btn, .save-btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.cancel-btn:hover {
  background: #edf2f7;
}

.save-btn {
  background: #667eea;
  color: white;
  border: none;
}

.save-btn:hover {
  background: #5a67d8;
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

@media (max-width: 768px) {
  .filters-row {
    flex-direction: column;
    gap: 16px;
  }
  
  .filter-group {
    min-width: auto;
  }
  
  .data-table {
    font-size: 14px;
  }
  
  .data-table th,
  .data-table td {
    padding: 8px 12px;
  }
}
</style>
