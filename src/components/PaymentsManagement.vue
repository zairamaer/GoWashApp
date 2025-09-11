<template>
  <div class="payments-management">
    <!-- Page Header -->
    <div class="page-header">
      <h1>Payments Management</h1>
      <p>Track payments for completed appointments and manage payment status.</p>
    </div>

    <!-- Summary Cards -->
    <div class="summary-cards">
      <div class="summary-card">
        <div class="card-icon paid">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 12l2 2 4-4"/>
            <circle cx="12" cy="12" r="9"/>
          </svg>
        </div>
        <div class="card-content">
          <h3>₱{{ totalPaidAmount.toFixed(2) }}</h3>
          <p>Total Paid ({{ paidCount }} appointments)</p>
        </div>
      </div>
      
      <div class="summary-card">
        <div class="card-icon total">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <div class="card-content">
          <h3>₱{{ totalRevenue.toFixed(2) }}</h3>
          <p>Total Revenue ({{ completedAppointments.length }} appointments)</p>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="filters-section">
      <div class="filters-row">        
        <div class="filter-group">
          <label>Time Period:</label>
          <select v-model="timePeriod" @change="filterPayments">
            <option value="all">All Time</option>
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
            @input="filterPayments"
            placeholder="Search by customer name..."
          />
        </div>
        
        <div class="filter-group">
          <label>Sort by:</label>
          <select v-model="sortBy" @change="sortPayments">
            <option value="dateDesc">Date (Latest First)</option>
            <option value="date">Date (Oldest First)</option>
            <option value="customer">Customer Name</option>
            <option value="amount">Amount (Low to High)</option>
            <option value="amountDesc">Amount (High to Low)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Payments Table -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Service</th>
            <th>Appointment Date</th>
            <th>Amount</th>
            <th>Payment Status</th>
            <th>Payment Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="appointment in filteredPayments" :key="appointment.appointmentID">
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
                <div class="vehicle-size">{{ getVehicleSizeDescription(appointment.service_rate?.vehicleSizeCode) }}</div>
              </div>
            </td>
            <td>
              <div class="datetime-info">
                <div class="date">{{ formatDate(appointment.appointmentDateTime) }}</div>
                <div class="time">{{ formatTime(appointment.appointmentDateTime) }}</div>
              </div>
            </td>
            <td class="amount-cell">₱{{ parseFloat(appointment.service_rate?.price || 0).toFixed(2) }}</td>
            <td>
              <span class="payment-status-badge" :class="getPaymentStatus(appointment).toLowerCase()">
                {{ getPaymentStatus(appointment) }}
              </span>
            </td>
            <td>
              <div class="payment-date">
                <span v-if="getPaymentDate(appointment)">{{ formatDate(getPaymentDate(appointment)) }}</span>
                <span v-else class="no-payment">Not paid</span>
              </div>
            </td>
            <td>
              <div class="action-buttons">
                <button @click="viewDetails(appointment)" class="view-btn" title="View Details">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Payment Details Modal -->
    <div v-if="showDetailsModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Payment Details</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-content" v-if="selectedAppointment">
          <div class="detail-section">
            <h4>Customer Information</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Name:</label>
                <span>{{ selectedAppointment.customer?.name }}</span>
              </div>
              <div class="detail-item">
                <label>Email:</label>
                <span>{{ selectedAppointment.customer?.email }}</span>
              </div>
              <div class="detail-item">
                <label>Phone:</label>
                <span>{{ selectedAppointment.customer?.phone }}</span>
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h4>Service Information</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Service:</label>
                <span>{{ getServiceName(selectedAppointment.service_rate?.serviceTypeID) }}</span>
              </div>
              <div class="detail-item">
                <label>Vehicle Size:</label>
                <span>{{ getVehicleSizeDescription(selectedAppointment.service_rate?.vehicleSizeCode) }}</span>
              </div>
              <div class="detail-item">
                <label>Amount:</label>
                <span class="amount">₱{{ parseFloat(selectedAppointment.service_rate?.price || 0).toFixed(2) }}</span>
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h4>Appointment Information</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Date & Time:</label>
                <span>{{ formatDate(selectedAppointment.appointmentDateTime) }} at {{ formatTime(selectedAppointment.appointmentDateTime) }}</span>
              </div>
              <div class="detail-item">
                <label>Status:</label>
                <span class="status-badge completed">{{ selectedAppointment.status }}</span>
              </div>
              <div class="detail-item">
                <label>Notes:</label>
                <span>{{ selectedAppointment.notes || 'No notes' }}</span>
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h4>Payment Information</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Payment Status:</label>
                <span class="payment-status-badge" :class="getPaymentStatus(selectedAppointment).toLowerCase()">
                  {{ getPaymentStatus(selectedAppointment) }}
                </span>
              </div>
              <div class="detail-item">
                <label>Payment Date:</label>
                <span>{{ formatDate(getPaymentDate(selectedAppointment)) }}</span>
              </div>
              <div class="detail-item" v-if="selectedAppointment.payment">
                <label>Payment Method:</label>
                <span>{{ selectedAppointment.payment.paymentMethod || 'N/A' }}</span>
              </div>
              <div class="detail-item" v-if="selectedAppointment.payment">
                <label>Transaction ID:</label>
                <span>{{ selectedAppointment.payment.transactionID || 'N/A' }}</span>
              </div>
              <div class="detail-item" v-if="selectedAppointment.payment">
                <label>Payment Amount:</label>
                <span class="amount">₱{{ parseFloat(selectedAppointment.payment.amount || 0).toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading payment data...</p>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && filteredPayments.length === 0" class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
      <h3>No paid appointments found</h3>
      <p>No paid appointments match your current filters.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { appointmentApi, serviceApi, paymentApi } from '../services/api'

// State
const appointments = ref([])
const payments = ref([])
const serviceTypes = ref([])
const vehicleSizes = ref([])
const loading = ref(false)

// Filters
const timePeriod = ref('all')
const searchQuery = ref('')
const sortBy = ref('dateDesc')

// Modal state
const showDetailsModal = ref(false)
const selectedAppointment = ref(null)

// Computed properties
const completedAppointments = computed(() => {
  return appointments.value.filter(apt => apt.status === 'completed')
})

const appointmentsWithPaymentStatus = computed(() => {
  // Show all appointments, not just completed ones
  return appointments.value.map(appointment => {
    // Find payment record for this appointment
    const payment = payments.value.find(p => p.appointmentID === appointment.appointmentID)
    return {
      ...appointment,
      payment: payment || null
    }
  })
})

const filteredPayments = computed(() => {
  let filtered = appointmentsWithPaymentStatus.value

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
          weekStart.setDate(today.getDate() - today.getDay())
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekStart.getDate() + 6)
          return aptDateOnly >= weekStart && aptDateOnly <= weekEnd
        case 'month':
          return aptDate.getMonth() === now.getMonth() && aptDate.getFullYear() === now.getFullYear()
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
      return customerName.includes(query)
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
      case 'amount':
        return parseFloat(a.service_rate?.price || 0) - parseFloat(b.service_rate?.price || 0)
      case 'amountDesc':
        return parseFloat(b.service_rate?.price || 0) - parseFloat(a.service_rate?.price || 0)
      default:
        return 0
    }
  })

  return filtered
})

// Summary computed properties
const paidCount = computed(() => {
  return appointmentsWithPaymentStatus.value.filter(apt => getPaymentStatus(apt) === 'Paid').length
})

const totalPaidAmount = computed(() => {
  return payments.value
    .filter(payment => payment.status === 'paid')
    .reduce((total, payment) => total + parseFloat(payment.amount || 0), 0)
})

const totalRevenue = computed(() => {
  return appointmentsWithPaymentStatus.value
    .reduce((total, apt) => total + parseFloat(apt.service_rate?.price || 0), 0)
})

// Methods
const loadData = async () => {
  loading.value = true
  try {
    const [appointmentsData, paymentsData, typesData, sizesData] = await Promise.all([
      appointmentApi.getAppointments(),
      paymentApi.getPayments().catch(() => []), // Handle if payments endpoint doesn't exist yet
      serviceApi.getServiceTypes(),
      serviceApi.getVehicleSizes()
    ])
    
    // Handle potential data wrapper structures
    appointments.value = appointmentsData?.data || appointmentsData || []
    payments.value = paymentsData?.data || paymentsData || []
    serviceTypes.value = typesData?.data || typesData || []
    vehicleSizes.value = sizesData?.data || sizesData || []
    
    console.log('Loaded data:', {
      appointments: appointments.value.length,
      payments: payments.value.length,
      serviceTypes: serviceTypes.value.length,
      vehicleSizes: vehicleSizes.value.length
    })
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    loading.value = false
  }
}

const getPaymentStatus = (appointment) => {
  // Check if there's a payment record
  const payment = payments.value.find(p => p.appointmentID === appointment.appointmentID)
  
  if (payment && payment.status === 'paid') {
    return 'Paid'
  }
  
  // Default to unpaid
  return 'Unpaid'
}

const getPaymentDate = (appointment) => {
  const payment = payments.value.find(p => p.appointmentID === appointment.appointmentID)
  // Use paymentDateTime from your JSON structure, fallback to updated_at
  return payment?.paymentDateTime || payment?.updated_at || null
}

const markAsPaid = async (appointment) => {
  try {
    // Check if payment record exists
    let payment = payments.value.find(p => p.appointmentID === appointment.appointmentID)
    
    if (payment) {
      // Update existing payment
      const updatedPayment = await paymentApi.updatePayment(payment.paymentID, {
        status: 'paid',
        paid_at: new Date().toISOString()
      })
      
      // Update local state
      const index = payments.value.findIndex(p => p.paymentID === payment.paymentID)
      if (index !== -1) {
        payments.value[index] = updatedPayment
      }
    } else {
      // Create new payment record (this would need to be implemented in the API)
      const newPayment = {
        appointmentID: appointment.appointmentID,
        amount: appointment.service_rate?.price || 0,
        status: 'paid',
        paid_at: new Date().toISOString()
      }
      
      // For now, just add to local state since we don't have create payment endpoint
      payments.value.push({
        paymentID: Date.now(), // Temporary ID
        ...newPayment
      })
    }
  } catch (error) {
    console.error('Error marking payment as paid:', error)
    alert('Failed to update payment status')
  }
}



const viewDetails = (appointment) => {
  selectedAppointment.value = appointment
  showDetailsModal.value = true
}

const closeModal = () => {
  showDetailsModal.value = false
  selectedAppointment.value = null
}

const filterPayments = () => {
  // This is handled by the computed property
}

const sortPayments = () => {
  // This is handled by the computed property
}

const getServiceName = (serviceTypeID) => {
  const serviceType = serviceTypes.value.find(type => type.serviceTypeID === serviceTypeID)
  return serviceType?.serviceTypeName || 'Unknown Service'
}

const getVehicleSizeDescription = (vehicleSizeCode) => {
  const vehicleSize = vehicleSizes.value.find(size => size.vehicleSizeCode === vehicleSizeCode)
  return vehicleSize?.vehicleSizeDescription || vehicleSizeCode || 'Unknown'
}

const formatDate = (dateTimeString) => {
  if (!dateTimeString) return 'N/A'
  return new Date(dateTimeString).toLocaleDateString()
}

const formatTime = (dateTimeString) => {
  if (!dateTimeString) return 'N/A'
  return new Date(dateTimeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.payments-management {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: calc(100vh - 64px);
  padding: 32px;
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

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 32px;
  margin-bottom: 40px;
}

.summary-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  padding: 32px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.summary-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.summary-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  border-radius: 20px 20px 0 0;
}

.summary-card:nth-child(1)::before {
  background: linear-gradient(135deg, #10b981, #34d399);
}

.summary-card:nth-child(2)::before {
  background: linear-gradient(135deg, #8b5cf6, #a78bfa);
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;
}

.card-icon.paid {
  background: linear-gradient(135deg, #10b981, #34d399);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
}

.card-icon.total {
  background: linear-gradient(135deg, #8b5cf6, #a78bfa);
  box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
}

.card-content h3 {
  color: #1e293b;
  font-size: 28px;
  font-weight: 800;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.card-content p {
  color: #64748b;
  font-size: 15px;
  margin: 0;
  font-weight: 500;
}

.filters-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  padding: 32px;
  margin-bottom: 32px;
}

.filters-row {
  display: flex;
  gap: 32px;
  align-items: end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 220px;
  flex: 1;
}

.filter-group label {
  color: #374151;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-group input,
.filter-group select {
  padding: 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s ease;
  background: white;
}

.filter-group input:focus,
.filter-group select:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
  transform: translateY(-2px);
}

.table-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1200px;
}

.data-table th {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  color: #374151;
  font-weight: 700;
  padding: 20px 24px;
  text-align: left;
  border-bottom: 2px solid #e5e7eb;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.data-table td {
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
  font-weight: 500;
}

.data-table tr {
  transition: all 0.2s ease;
}

.data-table tr:hover {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  transform: scale(1.005);
}

.customer-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.customer-name {
  font-weight: 700;
  color: #1e293b;
  font-size: 16px;
}

.customer-contact {
  font-size: 13px;
  color: #64748b;
  line-height: 1.4;
}

.service-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.service-name {
  font-weight: 700;
  color: #1e293b;
  font-size: 15px;
}

.vehicle-size {
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  color: #059669;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid #a7f3d0;
}

.datetime-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date {
  font-weight: 700;
  color: #1e293b;
  font-size: 15px;
}

.time {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.amount-cell {
  font-weight: 800;
  color: #059669;
  font-size: 18px;
  letter-spacing: -0.5px;
}

.payment-status-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-block;
  border: 2px solid transparent;
}

.payment-status-badge.paid {
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  color: #059669;
  border-color: #a7f3d0;
}

.payment-date {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.no-payment {
  color: #9ca3af;
  font-style: italic;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}

.view-btn {
  border: none;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.view-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
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
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal {
  background: white;
  border-radius: 24px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px;
  border-bottom: 2px solid #f1f5f9;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 24px 24px 0 0;
}

.modal-header h3 {
  color: #1e293b;
  font-size: 24px;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.5px;
}

.close-btn {
  background: #ef4444;
  border: none;
  font-size: 20px;
  color: white;
  cursor: pointer;
  padding: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.modal-content {
  padding: 32px;
}

.detail-section {
  margin-bottom: 32px;
}

.detail-section h4 {
  color: #1e293b;
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-grid {
  display: grid;
  gap: 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.detail-item label {
  color: #374151;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-item span {
  color: #1e293b;
  font-size: 15px;
  font-weight: 600;
}

.detail-item .amount {
  font-weight: 800;
  color: #059669;
  font-size: 16px;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.completed {
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  color: #059669;
  border: 1px solid #a7f3d0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #8b5cf6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 24px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  color: #64748b;
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
  backdrop-filter: blur(10px);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  color: #64748b;
}

.empty-state svg {
  margin-bottom: 24px;
  opacity: 0.6;
  color: #9ca3af;
}

.empty-state h3 {
  color: #374151;
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

@media (max-width: 768px) {
  .payments-management {
    padding: 20px;
  }
  
  .summary-cards {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .filters-row {
    flex-direction: column;
    gap: 20px;
  }
  
  .filter-group {
    min-width: auto;
  }
  
  .data-table {
    font-size: 14px;
  }
  
  .data-table th,
  .data-table td {
    padding: 12px 16px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }
  
  .modal {
    width: 95%;
    margin: 20px;
  }
  
  .modal-header,
  .modal-content {
    padding: 20px;
  }
  
  .page-header h1 {
    font-size: 28px;
  }
  
  .card-content h3 {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .summary-card {
    padding: 24px;
    flex-direction: column;
    text-align: center;
  }
  
  .card-icon {
    width: 50px;
    height: 50px;
  }
  
  .filters-section {
    padding: 20px;
  }
  
  .data-table th,
  .data-table td {
    padding: 8px 12px;
  }
}
</style>
