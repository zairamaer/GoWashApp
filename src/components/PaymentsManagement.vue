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
        <div class="card-icon pending">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
        </div>
        <div class="card-content">
          <h3>₱{{ totalPendingAmount.toFixed(2) }}</h3>
          <p>Pending Payment ({{ pendingCount }} appointments)</p>
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
          <label>Payment Status:</label>
          <select v-model="paymentStatusFilter" @change="filterPayments">
            <option value="all">All Payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        
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
            <option value="status">Payment Status</option>
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
                <button 
                  v-if="getPaymentStatus(appointment) === 'Pending'"
                  @click="markAsPaid(appointment)" 
                  class="mark-paid-btn" 
                  title="Mark as Paid"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 12l2 2 4-4"/>
                    <circle cx="12" cy="12" r="9"/>
                  </svg>
                  Mark Paid
                </button>
                <button 
                  v-if="getPaymentStatus(appointment) === 'Paid'"
                  @click="markAsPending(appointment)" 
                  class="mark-pending-btn" 
                  title="Mark as Pending"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                  Mark Pending
                </button>
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
                <span>{{ getPaymentDate(selectedAppointment) ? formatDate(getPaymentDate(selectedAppointment)) : 'Not paid' }}</span>
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
      <h3>No payment records found</h3>
      <p>No completed appointments match your current filters.</p>
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
const paymentStatusFilter = ref('all')
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
  return completedAppointments.value.map(appointment => {
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

  // Filter by payment status
  if (paymentStatusFilter.value !== 'all') {
    filtered = filtered.filter(apt => {
      const status = getPaymentStatus(apt)
      return status.toLowerCase() === paymentStatusFilter.value
    })
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
      case 'status':
        return getPaymentStatus(a).localeCompare(getPaymentStatus(b))
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

const pendingCount = computed(() => {
  return appointmentsWithPaymentStatus.value.filter(apt => getPaymentStatus(apt) === 'Pending').length
})

const totalPaidAmount = computed(() => {
  return appointmentsWithPaymentStatus.value
    .filter(apt => getPaymentStatus(apt) === 'Paid')
    .reduce((total, apt) => total + parseFloat(apt.service_rate?.price || 0), 0)
})

const totalPendingAmount = computed(() => {
  return appointmentsWithPaymentStatus.value
    .filter(apt => getPaymentStatus(apt) === 'Pending')
    .reduce((total, apt) => total + parseFloat(apt.service_rate?.price || 0), 0)
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
    
    appointments.value = appointmentsData
    payments.value = paymentsData
    serviceTypes.value = typesData
    vehicleSizes.value = sizesData
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
  
  // Default to pending for completed appointments
  return 'Pending'
}

const getPaymentDate = (appointment) => {
  const payment = payments.value.find(p => p.appointmentID === appointment.appointmentID)
  return payment?.paid_at || payment?.updated_at || null
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

const markAsPending = async (appointment) => {
  try {
    const payment = payments.value.find(p => p.appointmentID === appointment.appointmentID)
    
    if (payment) {
      const updatedPayment = await paymentApi.updatePayment(payment.paymentID, {
        status: 'pending',
        paid_at: null
      })
      
      // Update local state
      const index = payments.value.findIndex(p => p.paymentID === payment.paymentID)
      if (index !== -1) {
        payments.value[index] = updatedPayment
      }
    }
  } catch (error) {
    console.error('Error marking payment as pending:', error)
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
  background: #f8fafc;
  min-height: calc(100vh - 64px);
  padding: 24px;
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

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.summary-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.card-icon.paid {
  background: linear-gradient(135deg, #38a169, #48bb78);
}

.card-icon.pending {
  background: linear-gradient(135deg, #ed8936, #f6ad55);
}

.card-icon.total {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.card-content h3 {
  color: #2d3748;
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.card-content p {
  color: #718096;
  font-size: 14px;
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
  gap: 4px;
}

.service-name {
  font-weight: 600;
  color: #2d3748;
}

.vehicle-size {
  background: #e6fffa;
  color: #319795;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 500;
  display: inline-block;
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

.amount-cell {
  font-weight: 700;
  color: #38a169;
  font-size: 16px;
}

.payment-status-badge {
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
  display: inline-block;
}

.payment-status-badge.paid {
  background: #f0fff4;
  color: #38a169;
}

.payment-status-badge.pending {
  background: #fffbeb;
  color: #ed8936;
}

.payment-date {
  font-size: 14px;
}

.no-payment {
  color: #a0aec0;
  font-style: italic;
}

.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.mark-paid-btn, .mark-pending-btn, .view-btn {
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
}

.mark-paid-btn {
  background: #38a169;
  color: white;
}

.mark-paid-btn:hover {
  background: #2f855a;
}

.mark-pending-btn {
  background: #ed8936;
  color: white;
}

.mark-pending-btn:hover {
  background: #dd6b20;
}

.view-btn {
  background: #4299e1;
  color: white;
  padding: 8px;
}

.view-btn:hover {
  background: #3182ce;
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
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  color: #2d3748;
  font-size: 20px;
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

.modal-content {
  padding: 24px;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h4 {
  color: #2d3748;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
}

.detail-grid {
  display: grid;
  gap: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.detail-item label {
  color: #4a5568;
  font-weight: 500;
  font-size: 14px;
}

.detail-item span {
  color: #2d3748;
  font-size: 14px;
}

.detail-item .amount {
  font-weight: 700;
  color: #38a169;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.status-badge.completed {
  background: #e6fffa;
  color: #319795;
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
  .summary-cards {
    grid-template-columns: 1fr;
  }
  
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
  
  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }
  
  .mark-paid-btn, .mark-pending-btn {
    font-size: 11px;
    padding: 4px 8px;
  }
}
</style>
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

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.summary-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.card-icon.paid {
  background: linear-gradient(135deg, #38a169, #48bb78);
}

.card-icon.pending {
  background: linear-gradient(135deg, #ed8936, #f6ad55);
}

.card-icon.total {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.card-content h3 {
  color: #2d3748;
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.card-content p {
  color: #718096;
  font-size: 14px;
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
  gap: 4px;
}

.service-name {
  font-weight: 600;
  color: #2d3748;
}

.vehicle-size {
  background: #e6fffa;
  color: #319795;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 500;
  display: inline-block;
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

.amount-cell {
  font-weight: 700;
  color: #38a169;
  font-size: 16px;
}

.payment-status-badge {
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
  display: inline-block;
}

.payment-status-badge.paid {
  background: #f0fff4;
  color: #38a169;
}

.payment-status-badge.pending {
  background: #fffbeb;
  color: #ed8936;
}

.payment-date {
  font-size: 14px;
}

.no-payment {
  color: #a0aec0;
  font-style: italic;
}

.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.mark-paid-btn, .mark-pending-btn, .view-btn {
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
}

.mark-paid-btn {
  background: #38a169;
  color: white;
}

.mark-paid-btn:hover {
  background: #2f855a;
}

.mark-pending-btn {
  background: #ed8936;
  color: white;
}

.mark-pending-btn:hover {
  background: #dd6b20;
}

.view-btn {
  background: #4299e1;
  color: white;
  padding: 8px;
}

.view-btn:hover {
  background: #3182ce;
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
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  color: #2d3748;
  font-size: 20px;
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

.modal-content {
  padding: 24px;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h4 {
  color: #2d3748;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
}

.detail-grid {
  display: grid;
  gap: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.detail-item label {
  color: #4a5568;
  font-weight: 500;
  font-size: 14px;
}

.detail-item span {
  color: #2d3748;
  font-size: 14px;
}

.detail-item .amount {
  font-weight: 700;
  color: #38a169;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.status-badge.completed {
  background: #e6fffa;
  color: #319795;
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
  .summary-cards {
    grid-template-columns: 1fr;
  }
  
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
  
  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }
  
  .mark-paid-btn, .mark-pending-btn {
    font-size: 11px;
    padding: 4px 8px;
  }
}

