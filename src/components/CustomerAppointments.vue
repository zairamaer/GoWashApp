<template>
  <div class="customer-appointments">
    <div class="appointments-header">
      <h1>My Appointments</h1>
      <p>View and manage your car wash appointments</p>
    </div>

    <div class="appointments-container">
      <div class="appointments-filters">
        <div class="filter-group">
          <label>Filter by Status:</label>
          <select v-model="statusFilter" @change="filterAppointments">
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Sort by:</label>
          <select v-model="sortBy" @change="sortAppointments">
            <option value="date">Date</option>
            <option value="service">Service</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading appointments...</p>
      </div>
      
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>Error Loading Appointments</h3>
        <p>{{ error }}</p>
        <button @click="loadAppointments" class="retry-btn">Try Again</button>
      </div>
      
      <div v-else-if="filteredAppointments.length > 0" class="appointments-list">
        <div v-for="appointment in filteredAppointments" :key="appointment.id" 
             class="appointment-card" :class="[appointment.status, { 'past-appointment': isAppointmentInPast(appointment) }]">
          <div class="appointment-header">
            <div class="appointment-id">
              <h3>Appointment #{{ appointment.id }}</h3>
            </div>
            <div class="appointment-status" :class="appointment.status">
              {{ appointment.status.replace('-', ' ').toUpperCase() }}
            </div>
          </div>
          
          <div class="appointment-details">
            <div class="detail-row">
              <span class="detail-label">📅 Date:</span>
              <span class="detail-value">{{ formatDate(appointment.appointmentDate) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">🕐 Time:</span>
              <span class="detail-value">{{ appointment.appointmentTime }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">🚗 Vehicle:</span>
              <span class="detail-value">{{ appointment.vehicleType || 'Not specified' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">🔧 Service:</span>
              <span class="detail-value">{{ appointment.serviceName || 'Service ID: ' + appointment.service_rate_id }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">💰 Price:</span>
              <span class="detail-value">${{ appointment.price || '0.00' }}</span>
            </div>
            <div v-if="appointment.instructions" class="detail-row">
              <span class="detail-label">📝 Instructions:</span>
              <span class="detail-value">{{ appointment.instructions }}</span>
            </div>
          </div>

          <div class="appointment-actions">
            <button v-if="canCancelAppointment(appointment)" 
                    @click="cancelAppointment(appointment.id)" 
                    class="action-btn cancel-btn">
              Cancel
            </button>
            <button v-if="!canCancelAppointment(appointment) && appointment.status === 'pending'" 
                    class="action-btn cancel-btn disabled" 
                    disabled
                    title="Cannot cancel past appointments">
              Cancel
            </button>
            <button v-if="appointment.status === 'completed'" 
                    @click="bookAgain(appointment)" 
                    class="action-btn book-again-btn">
              Book Again
            </button>
            <button v-if="canModifyAppointment(appointment)" 
                    @click="rescheduleAppointment(appointment)" 
                    class="action-btn reschedule-btn">
              Reschedule
            </button>
            <button v-if="!canModifyAppointment(appointment) && (appointment.status === 'pending' || appointment.status === 'confirmed')" 
                    class="action-btn reschedule-btn disabled" 
                    disabled
                    title="Cannot reschedule past appointments">
              Reschedule
            </button>
            <button @click="viewDetails(appointment)" 
                    class="action-btn details-btn">
              View Details
            </button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">📅</div>
        <h3>No appointments found</h3>
        <p>{{ statusFilter ? `No ${statusFilter} appointments` : 'You haven\'t booked any appointments yet' }}</p>
        <router-link to="/customer/book" class="book-now-btn">Book Your First Appointment</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { appointmentApi, paymentApi, customerApi } from '../services/api'

const router = useRouter()
const route = useRoute()

const statusFilter = ref('')
const sortBy = ref('date')
const appointments = ref([])
const loading = ref(false)
const error = ref('')

const filteredAppointments = computed(() => {
  let filtered = [...appointments.value]
  
  console.log('All appointments:', appointments.value)
  console.log('Filtered appointments before filtering:', filtered)
  
  // Filter by status
  if (statusFilter.value) {
    filtered = filtered.filter(app => app.status === statusFilter.value)
    console.log('After status filter:', filtered)
  }
  
  // Sort appointments
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'date':
        return new Date(a.appointmentDate) - new Date(b.appointmentDate)
      case 'service':
        return a.serviceName.localeCompare(b.serviceName)
      case 'status':
        return a.status.localeCompare(b.status)
      default:
        return 0
    }
  })
  
  console.log('Final filtered appointments:', filtered)
  return filtered
})

// Helper function to check if appointment is in the past
const isAppointmentInPast = (appointment) => {
  const appointmentDateTime = new Date(`${appointment.appointmentDate} ${appointment.appointmentTime}`)
  const now = new Date()
  return appointmentDateTime < now
}

// Helper function to check if appointment can be cancelled
const canCancelAppointment = (appointment) => {
  return appointment.status === 'pending' && !isAppointmentInPast(appointment)
}

// Helper function to check if appointment can be modified
const canModifyAppointment = (appointment) => {
  return (appointment.status === 'pending' || appointment.status === 'confirmed') && !isAppointmentInPast(appointment)
}

onMounted(async () => {
  // Check for payment success redirect
  if (route.query.payment === 'success' && route.query.appointment) {
    await handlePaymentSuccess(route.query.appointment)
  }
  
  await loadAppointments()
})

const handlePaymentSuccess = async (appointmentId) => {
  try {
    // Check appointment status first
    let appointment = await appointmentApi.getAppointment(appointmentId)
    
    // Update payment status to paid
    try {
      const payment = await paymentApi.getPaymentByAppointment(appointmentId)
      if (payment) {
        await paymentApi.markPaymentAsPaid(payment.paymentID)
        console.log('Payment status updated to paid')
      }
    } catch (paymentError) {
      console.error('Error updating payment status:', paymentError)
    }
    
    if (appointment && appointment.status === 'confirmed') {
      // Already confirmed by webhook
      alert('Payment successful! Your appointment has been confirmed.')
    } else if (appointment && appointment.status === 'pending') {
      // Webhook might not have processed yet, try to manually confirm
      try {
        // Update appointment status to confirmed
        await appointmentApi.updateAppointment(appointmentId, { status: 'confirmed' })
        alert('Payment successful! Your appointment has been confirmed.')
      } catch (updateError) {
        console.error('Error updating appointment status:', updateError)
        // Still show success message even if update fails
        alert('Payment successful! Your appointment is being processed and will be confirmed shortly.')
      }
    } else {
      // Show generic success message
      alert('Payment successful! Your appointment is being processed.')
    }
  } catch (error) {
    console.error('Error checking appointment status:', error)
    // Show success message even if there's an error checking status
    alert('Payment successful! Your appointment is being processed.')
  }
  
  // Clean up URL parameters
  router.replace({ path: '/customer/appointments' })
}

const loadAppointments = async () => {
  loading.value = true
  error.value = ''
  
  try {
    // Get current customer ID from localStorage
    const customerUser = JSON.parse(localStorage.getItem('customer_user') || '{}')
    const customerId = customerUser.customerID || customerUser.id
    
    console.log('Customer ID from localStorage:', customerId)
    console.log('Customer user data:', customerUser)
    
    if (!customerId) {
      throw new Error('Customer ID not found. Please log in again.')
    }
    
    // Use the individual customer endpoint directly
    console.log('Fetching customer with appointments...')
    const customerData = await customerApi.getCustomerWithAppointments(customerId)
    console.log('Customer data response:', customerData)
    
    // Get appointments for the current customer
    const customerAppointments = customerData.appointments || []
    console.log('Customer appointments:', customerAppointments)
    
    // Transform API response to match our component structure
    appointments.value = customerAppointments.map(appointment => {
      console.log('Processing appointment:', appointment)
      
      const transformedAppointment = {
        id: appointment.id,
        service_rate_id: appointment.service_rate_id,
        serviceName: appointment.service_rate?.service_type?.serviceTypeName || 'Unknown Service',
        price: parseFloat(appointment.service_rate?.price || 0),
        appointmentDate: appointment.datetime?.split(' ')[0] || '',
        appointmentTime: formatTime(appointment.datetime?.split(' ')[1] || ''),
        vehicleType: appointment.service_rate?.vehicle_size?.vehicleSizeDescription || 'Vehicle size not specified',
        instructions: appointment.instructions || '',
        status: appointment.status?.toLowerCase() || 'pending',
        service_rate: appointment.service_rate
      }
      
      console.log('Transformed appointment:', transformedAppointment)
      return transformedAppointment
    })
    
    console.log('Final transformed appointments:', appointments.value)
    console.log('Appointments length:', appointments.value.length)
    
  } catch (err) {
    console.error('Error loading appointments:', err)
    error.value = 'Failed to load appointments. Please try again.'
    appointments.value = []
  } finally {
    loading.value = false
  }
}

const formatTime = (timeString) => {
  if (!timeString) return ''
  
  try {
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours, 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    
    return `${displayHour}:${minutes} ${ampm}`
  } catch (error) {
    return timeString
  }
}

const filterAppointments = () => {
  // Filtering is handled by computed property
}

const sortAppointments = () => {
  // Sorting is handled by computed property
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const cancelAppointment = (appointmentId) => {
  const appointment = appointments.value.find(app => app.id === appointmentId)
  
  if (!appointment) {
    alert('Appointment not found')
    return
  }
  
  if (!canCancelAppointment(appointment)) {
    alert('This appointment cannot be cancelled')
    return
  }
  
  if (confirm('Are you sure you want to cancel this appointment?')) {
    // In real app, make API call to cancel appointment
    appointment.status = 'cancelled'
    alert('Appointment cancelled successfully')
  }
}

const rescheduleAppointment = (appointment) => {
  if (!canModifyAppointment(appointment)) {
    alert('This appointment cannot be rescheduled')
    return
  }
  
  // Navigate to booking page with pre-filled service for rescheduling
  router.push({
    path: '/customer/book',
    query: { 
      service: appointment.serviceName,
      reschedule: appointment.id,
      currentDate: appointment.appointmentDate,
      currentTime: appointment.appointmentTime
    }
  })
}

const bookAgain = (appointment) => {
  // Navigate to booking page with pre-filled service
  router.push({
    path: '/customer/book',
    query: { service: appointment.serviceName }
  })
}

const viewDetails = (appointment) => {
  // In real app, this might open a modal or navigate to details page
  alert(`Appointment Details:\n\nService: ${appointment.serviceName}\nDate: ${formatDate(appointment.appointmentDate)}\nTime: ${appointment.appointmentTime}\nVehicle: ${appointment.vehicleType}\nStatus: ${appointment.status}`)
}
</script>

<style scoped>
.customer-appointments {
  max-width: 1200px;
  margin: 0 auto;
}

.appointments-header {
  text-align: center;
  margin-bottom: 40px;
}

.appointments-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.appointments-header p {
  color: #6b7280;
  font-size: 1.1rem;
}

.appointments-container {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.appointments-filters {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
}

.filter-group select {
  padding: 8px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.9rem;
  background: white;
}

.filter-group select:focus {
  outline: none;
  border-color: #2563eb;
}

.appointments-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.appointment-card {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s ease;
}

.appointment-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.appointment-card.completed {
  border-left: 4px solid #10b981;
}

.appointment-card.pending {
  border-left: 4px solid #f59e0b;
}

.appointment-card.confirmed {
  border-left: 4px solid #3b82f6;
}

.appointment-card.cancelled {
  border-left: 4px solid #ef4444;
}

.appointment-card.past-appointment {
  opacity: 0.7;
  background: #f9fafb;
}

.appointment-card.past-appointment .appointment-header h3 {
  color: #6b7280;
}

.appointment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.service-info h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.service-price {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2563eb;
}

.appointment-status {
  padding: 6px 12px;
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

.appointment-status.confirmed {
  background: #dbeafe;
  color: #1e40af;
}

.appointment-status.cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.appointment-details {
  margin-bottom: 20px;
}

.detail-row {
  display: flex;
  margin-bottom: 8px;
}

.detail-label {
  font-weight: 500;
  color: #6b7280;
  min-width: 100px;
  margin-right: 10px;
}

.detail-value {
  color: #1f2937;
}

.appointment-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: #fee2e2;
  color: #991b1b;
}

.cancel-btn:hover {
  background: #fecaca;
}

.book-again-btn {
  background: #dcfce7;
  color: #166534;
}

.book-again-btn:hover {
  background: #bbf7d0;
}

.details-btn {
  background: #f3f4f6;
  color: #374151;
}

.details-btn:hover {
  background: #e5e7eb;
}

.reschedule-btn {
  background: #fef3c7;
  color: #92400e;
}

.reschedule-btn:hover {
  background: #fde68a;
}

.action-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f3f4f6 !important;
  color: #9ca3af !important;
}

.action-btn.disabled:hover {
  background: #f3f4f6 !important;
  color: #9ca3af !important;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  color: #6b7280;
  font-size: 1.1rem;
}

.error-state {
  text-align: center;
  padding: 60px 20px;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.error-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #dc2626;
  margin-bottom: 10px;
}

.error-state p {
  color: #6b7280;
  margin-bottom: 30px;
}

.retry-btn {
  background: #dc2626;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.retry-btn:hover {
  background: #b91c1c;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 10px;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 30px;
}

.book-now-btn {
  background: #2563eb;
  color: white;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.book-now-btn:hover {
  background: #1d4ed8;
}

/* Responsive Design */
@media (max-width: 768px) {
  .appointments-container {
    padding: 20px;
  }
  
  .appointments-filters {
    flex-direction: column;
    gap: 15px;
  }
  
  .appointment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .appointment-actions {
    justify-content: center;
  }
  
  .appointments-header h1 {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .appointment-actions {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
  }
}
</style>
