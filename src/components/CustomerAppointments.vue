<template>
    <div class="customer-appointments">
        <div class="appointments-overview">
            <div class="professional-header">
                <div class="header-content">
                    <div class="title-section">
                        <h1>My Appointments</h1>
                        <p>Comprehensive dashboard for your car wash appointments</p>
                    </div>
                </div>
            </div>
            
            <div class="overview-cards">
                <div class="overview-card upcoming">
                    <div class="card-header">
                        <div class="card-icon">🗓️</div>
                        <div class="card-badge">Active</div>
                    </div>
                    <div class="card-content">
                        <h3>Upcoming</h3>
                        <span class="card-number">{{ upcomingCount }}</span>
                        <p>{{ nextAppointmentText }}</p>
                    </div>
                </div>
                
                <div class="overview-card total">
                    <div class="card-header">
                        <div class="card-icon">📊</div>
                        <div class="card-badge">Analytics</div>
                    </div>
                    <div class="card-content">
                        <h3>Total</h3>
                        <span class="card-number">{{ totalCount }}</span>
                        <p>All time appointments</p>
                    </div>
                </div>
                
                <div class="overview-card completed">
                    <div class="card-header">
                        <div class="card-icon">✅</div>
                        <div class="card-badge">Success</div>
                    </div>
                    <div class="card-content">
                        <h3>Completed</h3>
                        <span class="card-number">{{ completedCount }}</span>
                        <p>Successfully finished</p>
                    </div>
                </div>
            </div>
            
            <div class="view-toggle">
                <button class="toggle-btn" :class="{ active: activeView === 'schedules' }" @click="setActiveView('schedules')">
                    <span class="btn-icon">📅</span>
                    Schedules
                </button>
                <button class="toggle-btn" :class="{ active: activeView === 'history' }" @click="setActiveView('history')">
                    <span class="btn-icon">📜</span>
                    History
                </button>
            </div>
        </div>

        <div class="appointments-container">
            <div class="appointments-filters">
                <div class="filter-group">
                    <label>Filter by Status:</label>
                    <select v-model="statusFilter" @change="filterAppointments">
                        <option value="">All</option>
                        <option v-if="activeView === 'schedules'" value="confirmed">Confirmed</option>
                        <option v-if="activeView === 'schedules'" value="pending">Pending</option>
                        <option v-if="activeView === 'history'" value="completed">Completed</option>
                        <option v-if="activeView === 'history'" value="cancelled">Cancelled</option>
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
                     class="appointment-card" :class="[appointment.status]">
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
                        <button v-if="appointment.status === 'completed'" 
                                @click="bookAgain(appointment)" 
                                class="action-btn book-again-btn">
                            Book Again
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
                <h3>No {{ activeView === 'schedules' ? 'scheduled' : 'historical' }} appointments found</h3>
                <p>{{ getEmptyStateMessage() }}</p>
                <router-link v-if="activeView === 'schedules'" to="/customer/book" class="book-now-btn">Book Your First Appointment</router-link>
            </div>
        </div>

        <!-- Appointment Details Modal -->
        <div v-if="showDetailsModal" class="modal-overlay" @click="closeDetailsModal">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h2>Appointment Details</h2>
                </div>
                
                <div class="modal-body" v-if="selectedAppointment">
                    <div class="detail-card">
                        <div class="appointment-info">
                            <div class="appointment-number">
                                <span class="number-label">Appointment #</span>
                                <span class="number-value">{{ selectedAppointment.id }}</span>
                            </div>
                            <div class="status-badge" :class="selectedAppointment.status">
                                {{ selectedAppointment.status.replace('-', ' ').toUpperCase() }}
                            </div>
                        </div>
                        
                        <div class="details-grid">
                            <div class="detail-item">
                                <div class="detail-icon">📅</div>
                                <div class="detail-content">
                                    <h4>Date</h4>
                                    <p>{{ formatDate(selectedAppointment.appointmentDate) }}</p>
                                </div>
                            </div>
                            
                            <div class="detail-item">
                                <div class="detail-icon">🕐</div>
                                <div class="detail-content">
                                    <h4>Time</h4>
                                    <p>{{ selectedAppointment.appointmentTime }}</p>
                                </div>
                            </div>
                            
                            <div class="detail-item">
                                <div class="detail-icon">🚗</div>
                                <div class="detail-content">
                                    <h4>Vehicle</h4>
                                    <p>{{ selectedAppointment.vehicleType || 'Not specified' }}</p>
                                </div>
                            </div>
                            
                            <div class="detail-item">
                                <div class="detail-icon">🔧</div>
                                <div class="detail-content">
                                    <h4>Service</h4>
                                    <p>{{ selectedAppointment.serviceName || 'Service ID: ' + selectedAppointment.service_rate_id }}</p>
                                </div>
                            </div>
                            
                            <div class="detail-item">
                                <div class="detail-icon">💰</div>
                                <div class="detail-content">
                                    <h4>Price</h4>
                                    <p class="price">${{ selectedAppointment.price || '0.00' }}</p>
                                </div>
                            </div>
                            
                            <div v-if="selectedAppointment.instructions" class="detail-item full-width">
                                <div class="detail-icon">📝</div>
                                <div class="detail-content">
                                    <h4>Special Instructions</h4>
                                    <p>{{ selectedAppointment.instructions }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button v-if="selectedAppointment && selectedAppointment.status === 'completed'" 
                            @click="bookAgain(selectedAppointment)" 
                            class="modal-btn primary-btn">
                        Book Again
                    </button>
                    <button @click="closeDetailsModal" class="modal-btn secondary-btn">
                        Close
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { appointmentApi, paymentApi, customerApi } from '../services/api'

const router = useRouter()
const route = useRoute()

const statusFilter = ref('')
const sortBy = ref('date')
const appointments = ref([])
const loading = ref(false)
const error = ref('')
const activeView = ref('schedules') // 'schedules' or 'history'

// Modal state
const showDetailsModal = ref(false)
const selectedAppointment = ref(null)

// Computed properties for overview cards
const upcomingCount = computed(() => {
  return appointments.value.filter(app => 
    (app.status === 'confirmed' || app.status === 'pending') && 
    !isAppointmentInPast(app)
  ).length
})

const totalCount = computed(() => {
  return appointments.value.length
})

const completedCount = computed(() => {
  return appointments.value.filter(app => app.status === 'completed').length
})

const nextAppointmentText = computed(() => {
  const upcomingAppointments = appointments.value
    .filter(app => 
      (app.status === 'confirmed' || app.status === 'pending') && 
      !isAppointmentInPast(app)
    )
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
  
  if (upcomingAppointments.length > 0) {
    const next = upcomingAppointments[0]
    const appointmentDate = new Date(next.appointmentDate)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    
    if (appointmentDate.toDateString() === today.toDateString()) {
      return `Next: Today ${next.appointmentTime}`
    } else if (appointmentDate.toDateString() === tomorrow.toDateString()) {
      return `Next: Tomorrow ${next.appointmentTime}`
    } else {
      return `Next: ${formatDate(next.appointmentDate)} ${next.appointmentTime}`
    }
  }
  return 'No upcoming appointments'
})

// Filter appointments based on active view and status filter
const filteredAppointments = computed(() => {
  let filtered = [...appointments.value]
  
  console.log('All appointments:', appointments.value)
  
  // First filter by active view (schedules vs history)
  if (activeView.value === 'schedules') {
    // Schedules: confirmed and pending appointments
    filtered = filtered.filter(app => 
      app.status === 'confirmed' || app.status === 'pending'
    )
  } else if (activeView.value === 'history') {
    // History: completed and cancelled appointments
    filtered = filtered.filter(app => 
      app.status === 'completed' || app.status === 'cancelled'
    )
  }
  
  console.log(`After ${activeView.value} filter:`, filtered)
  
  // Then filter by specific status if selected
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
        return (a.serviceName || '').localeCompare(b.serviceName || '')
      case 'status':
        return a.status.localeCompare(b.status)
      default:
        return 0
    }
  })
  
  console.log('Final filtered appointments:', filtered)
  return filtered
})

// Watch for active view changes and reset status filter
watch(activeView, () => {
  statusFilter.value = ''
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

// Set active view function
const setActiveView = (view) => {
  activeView.value = view
}

// Get empty state message based on active view
const getEmptyStateMessage = () => {
  if (activeView.value === 'schedules') {
    return statusFilter.value 
      ? `No ${statusFilter.value} appointments found`
      : "You don't have any scheduled appointments yet"
  } else {
    return statusFilter.value 
      ? `No ${statusFilter.value} appointments found`
      : "You don't have any appointment history yet"
  }
}

// Modal functions
const viewDetails = (appointment) => {
  selectedAppointment.value = appointment
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedAppointment.value = null
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
  // Close modal if it's open
  closeDetailsModal()
  
  // Navigate to booking page with pre-filled service
  router.push({
    path: '/customer/book',
    query: { service: appointment.serviceName }
  })
}
</script>

<style scoped>
/* Base styles for the appointments page */
.customer-appointments {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  min-height: 100vh;
  padding: 2rem 1rem;
}

/* Professional Overview Section Styles */
.appointments-overview {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 24px;
  padding: 0;
  margin: 2rem auto 3rem;
  max-width: 2000px;
  backdrop-filter: blur(20px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.3);
  overflow: hidden;
}

.professional-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 3rem 2.5rem;
  position: relative;
  overflow: hidden;
}

.professional-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><circle cx="200" cy="200" r="100" fill="rgba(255,255,255,0.1)"/><circle cx="800" cy="300" r="150" fill="rgba(255,255,255,0.05)"/><circle cx="600" cy="700" r="120" fill="rgba(255,255,255,0.08)"/></svg>');
  opacity: 0.3;
}

.header-content {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section h1 {
  font-size: 3.5rem;
  font-weight: 900;
  color: white;
  margin: 0 0 0.75rem 0;
  text-shadow: 0 4px 20px rgba(0,0,0,0.3);
  letter-spacing: -0.02em;
}

.title-section p {
  color: rgba(255, 255, 255, 0.95);
  font-size: 1.3rem;
  font-weight: 400;
  margin: 0;
  opacity: 0.9;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin: 2.5rem 0;
  padding: 0 2.5rem;
}

.overview-card {
  background: white;
  border-radius: 16px;
  padding: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  position: relative;
}

.overview-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #e5e7eb, #e5e7eb);
  transition: all 0.3s ease;
}

.overview-card.upcoming::before {
  background: linear-gradient(90deg, #3b82f6, #1e40af);
}

.overview-card.total::before {
  background: linear-gradient(90deg, #0ea5e9, #0284c7);
}

.overview-card.completed::before {
  background: linear-gradient(90deg, #10b981, #059669);
}

.overview-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 0;
}

.card-icon {
  font-size: 2.5rem;
  filter: grayscale(0.2);
  transition: all 0.3s ease;
}

.overview-card:hover .card-icon {
  transform: scale(1.1);
  filter: grayscale(0);
}

.card-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.upcoming .card-badge {
  background: rgba(59, 130, 246, 0.1);
  color: #1e40af;
}

.total .card-badge {
  background: rgba(14, 165, 233, 0.1);
  color: #0284c7;
}

.completed .card-badge {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.card-content {
  padding: 0 1.5rem 1.5rem;
}

.card-content h3 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #6b7280;
  margin: 0.5rem 0 0.25rem 0;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.card-number {
  font-size: 3rem;
  font-weight: 900;
  color: #1f2937;
  display: block;
  margin: 0.5rem 0;
  line-height: 1;
  background: linear-gradient(135deg, #1f2937, #4b5563);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.card-content p {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0.75rem 0 0 0;
  font-weight: 500;
}

.view-toggle {
  display: flex;
  justify-content: center;
  gap: 0;
  background: #f8fafc;
  border-radius: 16px;
  padding: 0.75rem;
  max-width: 400px;
  margin: 0 auto 2.5rem;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
}

.toggle-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border: none;
  background: transparent;
  font-size: 1rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  position: relative;
}

.toggle-btn.active {
  background: white;
  color: #4f46e5;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.toggle-btn:hover:not(.active) {
  color: #475569;
  background: rgba(255, 255, 255, 0.7);
  transform: translateY(-1px);
}

.btn-icon {
  font-size: 1.1rem;
  transition: transform 0.3s ease;
}

.toggle-btn.active .btn-icon {
  transform: scale(1.1);
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2rem 0 2rem;
  border-bottom: 1px solid #f3f4f6;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #6b7280;
  transform: rotate(90deg);
}

.modal-body {
  padding: 0 2rem;
}

.detail-card {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
}

.appointment-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.appointment-number {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.number-label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.number-value {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1e293b;
  background: linear-gradient(135deg, #1e293b, #475569);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.status-badge {
  padding: 0.75rem 1.25rem;
  border-radius: 25px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.status-badge.completed {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.status-badge.pending {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.status-badge.confirmed {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.status-badge.cancelled {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.25rem;
}

.detail-item {
  background: white;
  border-radius: 10px;
  padding: 1.25rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
  transition: all 0.3s ease;
}

.detail-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-icon {
  font-size: 1.5rem;
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 2px solid #e2e8f0;
}

.detail-content {
  flex: 1;
}

.detail-content h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-content p {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  line-height: 1.4;
}

.detail-content p.price {
  font-size: 1.25rem;
  font-weight: 800;
  background: linear-gradient(135deg, #059669, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.modal-footer {
  padding: 1.5rem 2rem 2rem;
  border-top: 1px solid #f3f4f6;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.modal-btn {
  padding: 0.875rem 1.75rem;
  border: none;
  border-radius: 10px;
  font-size: 0.925rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.primary-btn {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);
}

.primary-btn:hover {
  background: linear-gradient(135deg, #4338ca, #6d28d9);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(79, 70, 229, 0.4);
}

.secondary-btn {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.secondary-btn:hover {
  background: #f1f5f9;
  color: #475569;
  border-color: #cbd5e1;
}

/* Responsive Design */
@media (max-width: 768px) {
  .professional-header {
    padding: 2rem 1.5rem;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
  
  .title-section h1 {
    font-size: 2.5rem;
  }
  
  .title-section p {
    font-size: 1.1rem;
  }
  
  .overview-cards {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 0 1.5rem;
    margin: 2rem 0;
  }
  
  .card-number {
    font-size: 2.5rem;
  }
  
  .card-icon {
    font-size: 2rem;
  }
  
  .view-toggle {
    max-width: 320px;
    margin: 0 auto 2rem;
  }
  
  .toggle-btn {
    padding: 0.875rem 1rem;
    font-size: 0.9rem;
  }
  
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
  
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
  
  .modal-header {
    padding: 1.5rem 1.5rem 0 1.5rem;
  }
  
  .modal-body {
    padding: 0 1.5rem;
  }
  
  .modal-footer {
    padding: 1.5rem 1.5rem 2rem;
    flex-direction: column;
  }
  
  .modal-btn {
    width: 100%;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .appointment-info {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .professional-header {
    padding: 1.5rem 1rem;
  }
  
  .title-section h1 {
    font-size: 2rem;
  }
  
  .overview-cards {
    padding: 0 1rem;
  }
  
  .card-header {
    padding: 1rem 1rem 0;
  }
  
  .card-content {
    padding: 0 1rem 1rem;
  }
  
  .view-toggle {
    max-width: 280px;
    padding: 0.5rem;
  }
  
  .toggle-btn {
    padding: 0.75rem 0.75rem;
    font-size: 0.85rem;
  }
  
  .btn-icon {
    font-size: 1rem;
  }
  
  .appointment-actions {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
  }
  
  .modal-header h2 {
    font-size: 1.5rem;
  }
  
  .number-value {
    font-size: 1.5rem;
  }
  
  .detail-item {
    padding: 1rem;
  }
  
  .detail-icon {
    width: 40px;
    height: 40px;
    font-size: 1.25rem;
  }
}
</style>
