<template>
  <div class="customer-management">
    <!-- Page Header -->
    <div class="page-header">
      <h1>Customer Management</h1>
      <p>View and manage all registered customers.</p>
    </div>

    <!-- Filters and Search -->
    <div class="filters-section">
      <div class="filters-row">
        <div class="filter-group">
          <label>Search:</label>
          <input 
            type="text" 
            v-model="searchQuery" 
            @input="filterCustomers"
            placeholder="Search by name, email, or phone..."
          />
        </div>
        
        <div class="filter-group">
          <label>Sort by:</label>
          <select v-model="sortBy" @change="sortCustomers">
            <option value="name">Name (A-Z)</option>
            <option value="nameDesc">Name (Z-A)</option>
            <option value="email">Email (A-Z)</option>
            <option value="emailDesc">Email (Z-A)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Customers Table -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Contact Information</th>
            <th>Total Appointments</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="customer in filteredCustomers" :key="customer.id">
            <td>
              <div class="customer-info">
                <div class="customer-avatar">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div class="customer-details">
                  <div class="customer-name">{{ customer.name }}</div>
                  <div class="customer-id">ID: {{ customer.id }}</div>
                </div>
              </div>
            </td>
            <td>
              <div class="contact-info">
                <div class="contact-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <span>{{ customer.email }}</span>
                </div>
                <div class="contact-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  <span>{{ customer.phone }}</span>
                </div>
              </div>
            </td>
            <td>
              <div class="appointment-count">
                <span class="count-badge">{{ getCustomerAppointmentCount(customer.id) }}</span>
                <span class="count-label">appointments</span>
              </div>
            </td>
            <td>
              <span class="status-badge active">
                Active
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button @click="viewCustomerDetails(customer)" class="view-btn" title="View Details">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
                <button @click="editCustomer(customer)" class="edit-btn" title="Edit">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Customer Details Modal -->
    <div v-if="showDetailsModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Customer Details</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-content" v-if="selectedCustomer">
          <div class="customer-profile">
            <div class="profile-avatar">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div class="profile-info">
              <h4>{{ selectedCustomer.name }}</h4>
              <p class="customer-id">Customer ID: {{ selectedCustomer.id }}</p>
            </div>
          </div>
          
          <div class="details-section">
            <h5>Contact Information</h5>
            <div class="detail-item">
              <label>Email:</label>
              <span>{{ selectedCustomer.email }}</span>
            </div>
            <div class="detail-item">
              <label>Phone:</label>
              <span>{{ selectedCustomer.phone }}</span>
            </div>
          </div>

          <div class="details-section">
            <h5>Appointment History</h5>
            <div class="appointment-stats">
              <div class="stat-item">
                <span class="stat-number">{{ getCustomerAppointmentCount(selectedCustomer.id) }}</span>
                <span class="stat-label">Total Appointments</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="closeModal" class="close-modal-btn">Close</button>
        </div>
      </div>
    </div>

    <!-- Edit Customer Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Edit Customer</h3>
          <button @click="closeEditModal" class="close-btn">&times;</button>
        </div>
        <form @submit.prevent="saveCustomer" class="modal-form">
          <div class="form-group">
            <label>Name</label>
            <input type="text" v-model="customerForm.name" required />
          </div>
          
          <div class="form-group">
            <label>Email</label>
            <input type="email" v-model="customerForm.email" required />
          </div>
          
          <div class="form-group">
            <label>Phone</label>
            <input type="tel" v-model="customerForm.phone" required />
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="closeEditModal" class="cancel-btn">Cancel</button>
            <button type="submit" class="save-btn">Save Changes</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading customers...</p>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && filteredCustomers.length === 0" class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
      <h3>No customers found</h3>
      <p>No customers match your current search criteria.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { customerApi, appointmentApi } from '../services/api'

// State
const customers = ref([])
const appointments = ref([])
const loading = ref(false)

// Filters
const searchQuery = ref('')
const sortBy = ref('name')

// Modal state
const showDetailsModal = ref(false)
const showEditModal = ref(false)
const selectedCustomer = ref(null)

// Form data
const customerForm = reactive({
  name: '',
  email: '',
  phone: ''
})

// Computed
const filteredCustomers = computed(() => {
  let filtered = customers.value

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(customer => {
      const name = customer.name?.toLowerCase() || ''
      const email = customer.email?.toLowerCase() || ''
      const phone = customer.phone?.toLowerCase() || ''
      return name.includes(query) || email.includes(query) || phone.includes(query)
    })
  }

  // Sort customers
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return (a.name || '').localeCompare(b.name || '')
      case 'nameDesc':
        return (b.name || '').localeCompare(a.name || '')
      case 'email':
        return (a.email || '').localeCompare(b.email || '')
      case 'emailDesc':
        return (b.email || '').localeCompare(a.email || '')
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
    const [customersData, appointmentsData] = await Promise.all([
      customerApi.getCustomers(),
      appointmentApi.getAppointments()
    ])
    
    customers.value = customersData
    appointments.value = appointmentsData
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    loading.value = false
  }
}

const filterCustomers = () => {
  // This is handled by the computed property
}

const sortCustomers = () => {
  // This is handled by the computed property
}

const getCustomerAppointmentCount = (customerId) => {
  return appointments.value.filter(apt => apt.customerID == customerId).length
}

const viewCustomerDetails = (customer) => {
  selectedCustomer.value = customer
  showDetailsModal.value = true
}

const editCustomer = (customer) => {
  selectedCustomer.value = customer
  customerForm.name = customer.name
  customerForm.email = customer.email
  customerForm.phone = customer.phone
  showEditModal.value = true
}

const saveCustomer = async () => {
  try {
    await customerApi.updateCustomer(selectedCustomer.value.id, customerForm)
    
    // Update local state
    const customer = customers.value.find(c => c.id === selectedCustomer.value.id)
    if (customer) {
      customer.name = customerForm.name
      customer.email = customerForm.email
      customer.phone = customerForm.phone
    }
    
    closeEditModal()
  } catch (error) {
    console.error('Error saving customer:', error)
    alert('Failed to save customer changes')
  }
}

const closeModal = () => {
  showDetailsModal.value = false
  selectedCustomer.value = null
}

const closeEditModal = () => {
  showEditModal.value = false
  selectedCustomer.value = null
  Object.assign(customerForm, {
    name: '',
    email: '',
    phone: ''
  })
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleDateString()
  } catch (error) {
    return 'N/A'
  }
}

const formatTime = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch (error) {
    return 'N/A'
  }
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.customer-management {
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
  min-width: 1000px;
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
  align-items: center;
  gap: 12px;
}

.customer-avatar {
  width: 40px;
  height: 40px;
  background: #e6fffa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #319795;
}

.customer-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.customer-name {
  font-weight: 600;
  color: #2d3748;
}

.customer-id {
  font-size: 12px;
  color: #718096;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #4a5568;
}

.contact-item svg {
  color: #718096;
}

.date-info {
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

.appointment-count {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.count-badge {
  background: #667eea;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.count-label {
  font-size: 11px;
  color: #718096;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
  display: inline-block;
}

.status-badge.active {
  background: #f0fff4;
  color: #38a169;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.view-btn, .edit-btn {
  border: none;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-btn {
  background: #4299e1;
  color: white;
}

.view-btn:hover {
  background: #3182ce;
}

.edit-btn {
  background: #ed8936;
  color: white;
}

.edit-btn:hover {
  background: #dd6b20;
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

.modal-content {
  padding: 24px;
}

.customer-profile {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.profile-avatar {
  width: 60px;
  height: 60px;
  background: #e6fffa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #319795;
}

.profile-info h4 {
  color: #2d3748;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.profile-info .customer-id {
  color: #718096;
  font-size: 14px;
  margin: 0;
}

.details-section {
  margin-bottom: 24px;
}

.details-section h5 {
  color: #4a5568;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item label {
  color: #718096;
  font-weight: 500;
  font-size: 14px;
}

.detail-item span {
  color: #2d3748;
  font-size: 14px;
}

.appointment-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: #f7fafc;
  border-radius: 8px;
  min-width: 100px;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
}

.stat-label {
  font-size: 12px;
  color: #718096;
  text-align: center;
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

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.cancel-btn, .save-btn, .close-modal-btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn, .close-modal-btn {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.cancel-btn:hover, .close-modal-btn:hover {
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
