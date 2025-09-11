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
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
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
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  padding: 32px;
  margin-bottom: 32px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.filters-row {
  display: flex;
  gap: 32px;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 240px;
}

.filter-group label {
  color: #475569;
  font-weight: 600;
  font-size: 15px;
  letter-spacing: 0.025em;
}

.filter-group input,
.filter-group select {
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s ease;
  background: white;
  font-weight: 500;
}

.filter-group input:focus,
.filter-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.table-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  overflow-x: auto;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px;
}

.data-table th {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  color: #334155;
  font-weight: 700;
  padding: 20px 24px;
  text-align: left;
  border-bottom: 2px solid #e2e8f0;
  font-size: 14px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.data-table td {
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  font-weight: 500;
}

.data-table tr:hover {
  background: linear-gradient(135deg, #f8fafc 0%, #f0f9ff 100%);
  transform: scale(1.001);
  transition: all 0.2s ease;
}

.customer-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.customer-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.customer-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.customer-name {
  font-weight: 700;
  color: #1e293b;
  font-size: 16px;
}

.customer-id {
  font-size: 13px;
  color: #94a3b8;
  font-weight: 500;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #475569;
  font-weight: 500;
}

.contact-item svg {
  color: #94a3b8;
}

.appointment-count {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.count-badge {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.count-label {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  text-transform: capitalize;
  display: inline-block;
  letter-spacing: 0.025em;
}

.status-badge.active {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.view-btn, .edit-btn {
  border: none;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.view-btn {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.view-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

.edit-btn {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.edit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(245, 158, 11, 0.4);
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
  animation: modalFadeIn 0.3s ease;
}

@keyframes modalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: modalSlideUp 0.3s ease;
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
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
  padding: 32px 32px 0;
  position: relative;
}

.modal-header::after {
  content: '';
  position: absolute;
  bottom: -16px;
  left: 32px;
  right: 32px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
}

.modal-header h3 {
  color: #1e293b;
  font-size: 24px;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-btn {
  background: rgba(148, 163, 184, 0.1);
  border: none;
  font-size: 20px;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  transform: scale(1.1);
}

.modal-content {
  padding: 32px;
}

.customer-profile {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 32px;
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f0f9ff 100%);
  border-radius: 20px;
  border: 1px solid rgba(59, 130, 246, 0.1);
}

.profile-avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 12px 24px rgba(102, 126, 234, 0.3);
}

.profile-info h4 {
  color: #1e293b;
  font-size: 24px;
  font-weight: 800;
  margin: 0 0 8px 0;
  letter-spacing: -0.25px;
}

.profile-info .customer-id {
  color: #64748b;
  font-size: 16px;
  margin: 0;
  font-weight: 600;
  opacity: 0.8;
}

.details-section {
  margin-bottom: 32px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.5);
}

.details-section h5 {
  color: #334155;
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: 0.025em;
}

.details-section h5::before {
  content: '';
  width: 4px;
  height: 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 2px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid rgba(241, 245, 249, 0.8);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item label {
  color: #64748b;
  font-weight: 600;
  font-size: 15px;
  letter-spacing: 0.025em;
}

.detail-item span {
  color: #1e293b;
  font-size: 15px;
  font-weight: 600;
  background: rgba(102, 126, 234, 0.08);
  padding: 8px 12px;
  border-radius: 8px;
}

.appointment-stats {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 32px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 20px;
  min-width: 120px;
  box-shadow: 0 12px 24px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.stat-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05));
  pointer-events: none;
}

.stat-number {
  font-size: 32px;
  font-weight: 900;
  color: white;
  position: relative;
  z-index: 1;
}

.stat-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 600;
  position: relative;
  z-index: 1;
}

.modal-form {
  padding: 32px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  color: #334155;
  font-weight: 700;
  margin-bottom: 8px;
  font-size: 15px;
  letter-spacing: 0.025em;
}

.form-group input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s ease;
  background: white;
  font-weight: 500;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;
}

.cancel-btn, .save-btn {
  padding: 14px 24px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 15px;
  letter-spacing: 0.025em;
}

.cancel-btn {
  background: rgba(148, 163, 184, 0.1);
  color: #64748b;
  border: 2px solid #e2e8f0;
}

.cancel-btn:hover {
  background: rgba(148, 163, 184, 0.2);
  transform: translateY(-1px);
}

.save-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.loading-spinner {
  width: 48px;
  height: 48px;
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
  color: #64748b;
  font-size: 18px;
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
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.empty-state svg {
  margin-bottom: 20px;
  opacity: 0.6;
  color: #cbd5e1;
}

.empty-state h3 {
  color: #475569;
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 800;
}

.empty-state p {
  margin: 0;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .customer-management {
    padding: 16px;
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
    padding: 16px 12px;
  }
  
  .customer-profile {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .modal {
    width: 95%;
    margin: 10px;
  }
  
  .modal-content,
  .modal-form {
    padding: 20px;
  }
  
  .appointment-stats {
    flex-direction: column;
    align-items: center;
  }
}
</style>


