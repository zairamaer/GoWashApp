<template>
  <div class="service-management">
    <!-- Page Header -->
    <div class="page-header">
      <h1>Service Management</h1>
      <p>Manage your car wash services, rates, and vehicle categories.</p>
    </div>

    <!-- Toast Notifications -->
    <div v-if="toast.show" class="toast" :class="toast.type">
      <div class="toast-content">
        <svg v-if="toast.type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 12l2 2 4-4"/>
          <circle cx="12" cy="12" r="10"/>
        </svg>
        <svg v-if="toast.type === 'error'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        <span>{{ toast.message }}</span>
      </div>
      <button @click="hideToast" class="toast-close">&times;</button>
    </div>

    <!-- Service Rates Section -->
    <div class="management-section">
      <div class="section-header">
        <h2>Service Rates</h2>
        <button @click="showAddServiceRate = true" class="add-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          Add Service Rate
        </button>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="filter-group">
          <label>Service Type</label>
          <select v-model="filters.serviceType" @change="applyFilters">
            <option value="">All Service Types</option>
            <option v-for="type in serviceTypes" :key="type.serviceTypeID" :value="type.serviceTypeID">
              {{ type.serviceTypeName }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label>Vehicle Size</label>
          <select v-model="filters.vehicleSize" @change="applyFilters">
            <option value="">All Vehicle Sizes</option>
            <option v-for="size in vehicleSizes" :key="size.vehicleSizeCode" :value="size.vehicleSizeCode">
              {{ size.vehicleSizeDescription }}
            </option>
          </select>
        </div>
        <button @click="resetFilters" class="reset-filters-btn">Reset Filters</button>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Service Type</th>
              <th>Vehicle Size</th>
              <th>Price</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rate in paginatedServiceRates" :key="rate.serviceRateID">
              <td>
                <div class="service-info">
                  <div class="service-name">{{ rate.service_type?.serviceTypeName }}</div>
                  <div class="service-description">{{ rate.service_type?.serviceTypeDescription }}</div>
                </div>
              </td>
              <td>
                <div class="vehicle-info">
                  <div class="vehicle-code">{{ rate.vehicleSizeCode }}</div>
                  <div class="vehicle-description">{{ rate.vehicle_size?.vehicleSizeDescription }}</div>
                </div>
              </td>
              <td class="price-cell">₱{{ parseFloat(rate.price).toFixed(2) }}</td>
              <td>{{ formatDate(rate.updated_at) }}</td>
              <td>
                <div class="action-buttons">
                  <button @click="editServiceRate(rate)" class="edit-btn" title="Edit">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button @click="deleteServiceRate(rate.serviceRateID)" class="delete-btn" title="Delete">
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

        <!-- No Results Message -->
        <div v-if="filteredServiceRates.length === 0" class="no-results">
          <p>No service rates found matching your criteria.</p>
        </div>

        <!-- Improved Pagination -->
        <div v-if="isPaginationNeeded" class="pagination-container">
          <div class="pagination-info">
            {{ getPageItemsInfo() }}
          </div>
          <div class="pagination">
            <!-- First page button -->
            <button 
              @click="goToFirstPage" 
              :disabled="pagination.currentPage === 1"
              class="pagination-btn"
              title="First page"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="11,17 6,12 11,7"/>
                <polyline points="18,17 13,12 18,7"/>
              </svg>
            </button>
            
            <!-- Previous page button -->
            <button 
              @click="goToPreviousPage" 
              :disabled="pagination.currentPage === 1"
              class="pagination-btn"
              title="Previous page"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15,18 9,12 15,6"/>
              </svg>
            </button>
            
            <!-- Page numbers -->
            <template v-for="page in visiblePages" :key="page">
              <button 
                v-if="page !== '...'"
                @click="goToPage(page)" 
                :class="['pagination-btn', { active: page === pagination.currentPage }]"
                :title="`Go to page ${page}`"
              >
                {{ page }}
              </button>
              <span v-else class="pagination-ellipsis">...</span>
            </template>
            
            <!-- Next page button -->
            <button 
              @click="goToNextPage" 
              :disabled="pagination.currentPage === pagination.totalPages"
              class="pagination-btn"
              title="Next page"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9,18 15,12 9,6"/>
              </svg>
            </button>
            
            <!-- Last page button -->
            <button 
              @click="goToLastPage" 
              :disabled="pagination.currentPage === pagination.totalPages"
              class="pagination-btn"
              title="Last page"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="13,17 18,12 13,7"/>
                <polyline points="6,17 11,12 6,7"/>
              </svg>
            </button>
          </div>
          <div class="items-per-page">
            <label>Items per page:</label>
            <select :value="pagination.itemsPerPage" @change="handleItemsPerPageChange($event.target.value)">
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Service Types Section -->
    <div class="management-section">
      <div class="section-header">
        <h2>Service Types</h2>
        <button @click="showAddServiceType = true" class="add-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          Add Service Type
        </button>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Service Name</th>
              <th>Description</th>
              <th>Image</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="type in serviceTypes" :key="type.serviceTypeID">
              <td class="service-name-cell">{{ type.serviceTypeName }}</td>
              <td>{{ type.serviceTypeDescription }}</td>
              <td>
                <div v-if="type.serviceTypeImage" class="service-image">
                  <img 
                    :src="type.serviceTypeImage" 
                    :alt="type.serviceTypeName"
                    @error="handleImageError"
                    @load="handleImageLoad"
                  />
                  <div class="image-debug">
                    <small><strong>ID:</strong> {{ type.serviceTypeID }}</small>
                    <small><strong>URL:</strong> {{ type.serviceTypeImage }}</small>
                  </div>
                </div>
                <span v-else class="no-image">No image</span>
              </td>
              <td>{{ formatDate(type.updated_at || type.created_at) }}</td>
              <td>
                <div class="action-buttons">
                  <button @click="editServiceType(type)" class="edit-btn" title="Edit">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button @click="deleteServiceType(type.serviceTypeID)" class="delete-btn" title="Delete">
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
    </div>

    <!-- Vehicle Sizes Section -->
    <div class="management-section">
      <div class="section-header">
        <h2>Vehicle Sizes</h2>
        <button @click="showAddVehicleSize = true" class="add-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          Add Vehicle Size
        </button>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Size Code</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="size in vehicleSizes" :key="size.vehicleSizeCode">
              <td class="size-code-cell">{{ size.vehicleSizeCode }}</td>
              <td>{{ size.vehicleSizeDescription }}</td>
              <td>
                <div class="action-buttons">
                  <button @click="editVehicleSize(size)" class="edit-btn" title="Edit">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button @click="deleteVehicleSize(size.vehicleSizeCode)" class="delete-btn" title="Delete">
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
    </div>

    <!-- Add/Edit Service Rate Modal -->
    <div v-if="showAddServiceRate || editingServiceRate" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ editingServiceRate ? 'Edit Service Rate' : 'Add New Service Rate' }}</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <form @submit.prevent="saveServiceRate" class="modal-form">
          <div class="form-group">
            <label>Service Type</label>
            <select v-model="serviceRateForm.serviceTypeID" required>
              <option value="">Select Service Type</option>
              <option v-for="type in serviceTypes" :key="type.serviceTypeID" :value="type.serviceTypeID">
                {{ type.serviceTypeName }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Vehicle Size</label>
            <select v-model="serviceRateForm.vehicleSizeCode" required>
              <option value="">Select Vehicle Size</option>
              <option v-for="size in vehicleSizes" :key="size.vehicleSizeCode" :value="size.vehicleSizeCode">
                {{ size.vehicleSizeDescription }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Price (₱)</label>
            <input type="number" v-model="serviceRateForm.price" step="0.01" min="0" required />
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="cancel-btn">Cancel</button>
            <button type="submit" class="save-btn">Save</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add/Edit Service Type Modal -->
    <div v-if="showAddServiceType || editingServiceType" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ editingServiceType ? 'Edit Service Type' : 'Add New Service Type' }}</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <form @submit.prevent="saveServiceType" class="modal-form">
          <div class="form-group">
            <label>Service Name</label>
            <input type="text" v-model="serviceTypeForm.serviceTypeName" required />
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="serviceTypeForm.serviceTypeDescription" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>Service Image</label>
            <div class="image-upload-section">
              <div v-if="serviceTypeForm.serviceTypeImage && !imagePreview" class="current-image">
                <img :src="serviceTypeForm.serviceTypeImage" :alt="serviceTypeForm.serviceTypeName" />
                <button type="button" @click="removeImage" class="remove-image-btn">Remove</button>
              </div>
              <div v-if="imagePreview" class="image-preview">
                <img :src="imagePreview" :alt="'Preview of ' + serviceTypeForm.serviceTypeName" />
                <button type="button" @click="removeImagePreview" class="remove-preview-btn">Remove Preview</button>
              </div>
              <div class="file-upload-area" :class="{ 'dragover': isDragOver }" @drop="handleFileDrop" @dragover.prevent="isDragOver = true" @dragleave="isDragOver = false" @click="triggerFileInput">
                <input 
                  ref="fileInput"
                  type="file" 
                  @change="handleFileSelect"
                  accept="image/*"
                  style="display: none;"
                />
                <div class="upload-content">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17,8 12,3 7,8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <p class="upload-text">Click to upload or drag and drop</p>
                  <p class="upload-subtext">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
              <div v-if="uploadProgress > 0 && uploadProgress < 100" class="upload-progress">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
                </div>
                <span class="progress-text">{{ uploadProgress }}% uploaded</span>
              </div>
              <div v-if="uploadError" class="upload-error">
                <span>{{ uploadError }}</span>
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="cancel-btn">Cancel</button>
            <button type="submit" class="save-btn">Save</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add/Edit Vehicle Size Modal -->
    <div v-if="showAddVehicleSize || editingVehicleSize" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ editingVehicleSize ? 'Edit Vehicle Size' : 'Add New Vehicle Size' }}</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <form @submit.prevent="saveVehicleSize" class="modal-form">
          <div class="form-group">
            <label>Size Code</label>
            <input type="text" v-model="vehicleSizeForm.vehicleSizeCode" required />
          </div>
          <div class="form-group">
            <label>Description</label>
            <input type="text" v-model="vehicleSizeForm.vehicleSizeDescription" required />
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="cancel-btn">Cancel</button>
            <button type="submit" class="save-btn">Save</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Save Confirmation Modal for Service Rate -->
    <div v-if="showSaveConfirmation" class="modal-overlay">
      <div class="save-confirmation-modal">
        <div class="modal-header">
          <h3>Confirm Save</h3>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to save this service rate?</p>
          <div class="confirmation-details">
            <p><strong>Service Type:</strong> {{ getServiceTypeName(pendingSaveData?.serviceTypeID) }}</p>
            <p><strong>Vehicle Size:</strong> {{ getVehicleSizeName(pendingSaveData?.vehicleSizeCode) }}</p>
            <p><strong>Price:</strong> ₱{{ parseFloat(pendingSaveData?.price || 0).toFixed(2) }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-cancel" @click="closeSaveConfirmation">
            Cancel
          </button>
          <button type="button" class="btn-confirm" @click="confirmSave">
            Yes, Save
          </button>
        </div>
      </div>
    </div>

    <div v-if="showSaveServiceTypeConfirmation" class="modal-overlay">
      <div class="save-confirmation-modal service-type-confirmation">
        <div class="modal-header">
          <h3>{{ pendingSaveServiceTypeData?.isEditing ? 'Confirm Update' : 'Confirm Save' }}</h3>
        </div>
        <div class="modal-body">
          <p>{{ pendingSaveServiceTypeData?.isEditing ? 'Are you sure you want to update this service type?' : 'Are you sure you want to create this service type?' }}</p>
          <div class="confirmation-details">
            <p><strong>Service Name:</strong> {{ pendingSaveServiceTypeData?.serviceTypeName }}</p>
            <p><strong>Description:</strong> {{ pendingSaveServiceTypeData?.serviceTypeDescription || 'No description' }}</p>
            
            <!-- Image information -->
            <div class="image-info">
              <p><strong>Image:</strong></p>
              <div v-if="pendingSaveServiceTypeData?.hasNewImage" class="new-image-info">
                <span class="image-status new">New image selected: {{ pendingSaveServiceTypeData?.imageFile?.name }}</span>
              </div>
              <div v-else-if="pendingSaveServiceTypeData?.currentImage && pendingSaveServiceTypeData?.isEditing" class="current-image-info">
                <span class="image-status existing">Keep current image</span>
              </div>
              <div v-else class="no-image-info">
                <span class="image-status none">No image</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-cancel" @click="closeSaveServiceTypeConfirmation">
            Cancel
          </button>
          <button type="button" class="btn-confirm" @click="confirmSaveServiceType">
            {{ pendingSaveServiceTypeData?.isEditing ? 'Yes, Update' : 'Yes, Save' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Vehicle Size Save Confirmation Modal -->
    <div v-if="showSaveVehicleSizeConfirmation" class="modal-overlay">
      <div class="save-confirmation-modal">
        <div class="modal-header">
          <h3>{{ pendingSaveVehicleSizeData?.isEditing ? 'Confirm Update' : 'Confirm Save' }}</h3>
        </div>
        <div class="modal-body">
          <p>{{ pendingSaveVehicleSizeData?.isEditing ? 'Are you sure you want to update this vehicle size?' : 'Are you sure you want to create this vehicle size?' }}</p>
          <div class="confirmation-details">
            <p><strong>Vehicle Size Code:</strong> {{ pendingSaveVehicleSizeData?.vehicleSizeCode }}</p>
            <p><strong>Description:</strong> {{ pendingSaveVehicleSizeData?.vehicleSizeDescription || 'No description' }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-cancel" @click="closeSaveVehicleSizeConfirmation">
            Cancel
          </button>
          <button type="button" class="btn-confirm" @click="confirmSaveVehicleSize">
            {{ pendingSaveVehicleSizeData?.isEditing ? 'Yes, Update' : 'Yes, Save' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { serviceApi } from '../services/api'

// State
const serviceRates = ref([])
const serviceTypes = ref([])
const vehicleSizes = ref([])

// Modal states
const showAddServiceRate = ref(false)
const showAddServiceType = ref(false)
const showAddVehicleSize = ref(false)
const editingServiceRate = ref(null)
const editingServiceType = ref(null)
const editingVehicleSize = ref(null)

// Save confirmation states
const showSaveConfirmation = ref(false)
const pendingSaveData = ref(null)
const showSaveServiceTypeConfirmation = ref(false)
const pendingSaveServiceTypeData = ref(null)
const showSaveVehicleSizeConfirmation = ref(false)
const pendingSaveVehicleSizeData = ref(null)

// Toast state
const toast = reactive({
  show: false,
  type: 'success',
  message: ''
})

// Filter state
const filters = reactive({
  serviceType: '',
  vehicleSize: ''
})

// Improved Pagination State
const pagination = reactive({
  currentPage: 1,
  itemsPerPage: 10,
  totalItems: 0,
  totalPages: 0
})

// Form data
const serviceRateForm = reactive({
  serviceTypeID: '',
  vehicleSizeCode: '',
  price: ''
})

const serviceTypeForm = reactive({
  serviceTypeName: '',
  serviceTypeDescription: '',
  serviceTypeImage: ''
})

const vehicleSizeForm = reactive({
  vehicleSizeCode: '',
  vehicleSizeDescription: ''
})

// File upload state
const fileInput = ref(null)
const imagePreview = ref('')
const isDragOver = ref(false)
const uploadProgress = ref(0)
const uploadError = ref('')
const selectedFile = ref(null)

// Auto-sorting functions
const sortServiceTypes = (types) => {
  return [...types].sort((a, b) => {
    const nameA = (a.serviceTypeName || '').toLowerCase()
    const nameB = (b.serviceTypeName || '').toLowerCase()
    return nameA.localeCompare(nameB)
  })
}

const sortVehicleSizes = (sizes) => {
  return [...sizes].sort((a, b) => {
    const descA = (a.vehicleSizeDescription || '').toLowerCase()
    const descB = (b.vehicleSizeDescription || '').toLowerCase()
    return descA.localeCompare(descB)
  })
}

// Improved Computed properties
const filteredServiceRates = computed(() => {
  let filtered = [...serviceRates.value] // Create a copy

  // Apply service type filter
  if (filters.serviceType) {
    filtered = filtered.filter(rate => {
      return String(rate.serviceTypeID) === String(filters.serviceType)
    })
  }

  // Apply vehicle size filter
  if (filters.vehicleSize) {
    filtered = filtered.filter(rate => {
      return rate.vehicleSizeCode === filters.vehicleSize
    })
  }

  // Update pagination totals
  pagination.totalItems = filtered.length
  pagination.totalPages = Math.max(1, Math.ceil(filtered.length / pagination.itemsPerPage))
  
  // Keep current page valid but don't auto-reset to page 1
  // Only reset if current page is beyond the available pages
  if (pagination.currentPage > pagination.totalPages) {
    pagination.currentPage = Math.max(1, pagination.totalPages)
  }
  
  return filtered
})

const paginatedServiceRates = computed(() => {
  const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage
  const endIndex = startIndex + pagination.itemsPerPage
  return filteredServiceRates.value.slice(startIndex, endIndex)
})

const paginationInfo = computed(() => {
  const totalItems = pagination.totalItems
  
  if (totalItems === 0) {
    return { start: 0, end: 0, total: 0 }
  }
  
  const start = (pagination.currentPage - 1) * pagination.itemsPerPage + 1
  const end = Math.min(pagination.currentPage * pagination.itemsPerPage, totalItems)
  
  return { start, end, total: totalItems }
})

const visiblePages = computed(() => {
  const { currentPage, totalPages } = pagination
  const pages = []
  const maxVisiblePages = 7
  
  if (totalPages <= maxVisiblePages) {
    // Show all pages if total is less than max visible
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)
    
    if (currentPage <= 4) {
      // Near the beginning: 1 2 3 4 5 ... last
      for (let i = 2; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(totalPages)
    } else if (currentPage >= totalPages - 3) {
      // Near the end: 1 ... (last-4) (last-3) (last-2) (last-1) last
      pages.push('...')
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // In the middle: 1 ... (current-1) current (current+1) ... last
      pages.push('...')
      pages.push(currentPage - 1)
      pages.push(currentPage)
      pages.push(currentPage + 1)
      pages.push('...')
      pages.push(totalPages)
    }
  }
  
  return pages
})

// Helper computed property to check if pagination is needed
const isPaginationNeeded = computed(() => {
  // Always show pagination if there are any service rates (filtered or not)
  // This ensures pagination stays visible even with filters applied
  return serviceRates.value.length > 0
})

const isPaginationAlwaysVisible = computed(() => {
  // Always show pagination controls
  return true
})

// Toast methods
const showToast = (type, message) => {
  toast.show = true
  toast.type = type
  toast.message = message
  
  setTimeout(() => {
    hideToast()
  }, 5000)
}

const hideToast = () => {
  toast.show = false
}

// Improved Filter methods
const resetFilters = () => {
  const wasFiltered = filters.serviceType || filters.vehicleSize
  
  // Reset filter values
  filters.serviceType = ''
  filters.vehicleSize = ''
  
  // If we were previously filtered and now showing all data,
  // try to keep the user on a reasonable page
  if (wasFiltered) {
    // Calculate total pages for unfiltered data
    const totalPages = Math.ceil(serviceRates.value.length / pagination.itemsPerPage)
    
    // Keep current page if it's still valid, otherwise go to last page
    pagination.currentPage = Math.min(pagination.currentPage, totalPages)
  }
}

const applyFilters = () => {

}

// Improved Pagination methods
const goToPage = (page) => {
  if (typeof page === 'number' && page >= 1 && page <= pagination.totalPages) {
    pagination.currentPage = page
  }
}

const goToPreviousPage = () => {
  if (pagination.currentPage > 1) {
    pagination.currentPage--
  }
}

const goToNextPage = () => {
  if (pagination.currentPage < pagination.totalPages) {
    pagination.currentPage++
  }
}

const goToFirstPage = () => {
  pagination.currentPage = 1
}

const goToLastPage = () => {
  pagination.currentPage = pagination.totalPages
}

const handleItemsPerPageChange = (newItemsPerPage) => {
  // Calculate what item the user is currently viewing
  const currentFirstItem = (pagination.currentPage - 1) * pagination.itemsPerPage + 1
  
  // Update items per page
  pagination.itemsPerPage = parseInt(newItemsPerPage)
  
  // Calculate what page that item would be on with new page size
  const newPage = Math.ceil(currentFirstItem / pagination.itemsPerPage)
  
  // Set the new page (will be recalculated in the computed property)
  pagination.currentPage = Math.max(1, newPage)
}

// Method to get current page items info for screen readers
const getPageItemsInfo = () => {
  const info = paginationInfo.value
  return `Showing ${info.start} to ${info.end} of ${info.total} entries`
}

// Watch for filter changes to reset pagination
watch([() => filters.serviceType, () => filters.vehicleSize], () => {
  pagination.currentPage = 1
})

// Methods
const loadData = async () => {
  try {
    const [ratesData, typesData, sizesData] = await Promise.all([
      serviceApi.getServiceRates(),
      serviceApi.getServiceTypes(),
      serviceApi.getVehicleSizes()
    ])
    
    serviceRates.value = ratesData
    
    // Auto-sort service types and vehicle sizes
    serviceTypes.value = sortServiceTypes(typesData)
    vehicleSizes.value = sortVehicleSizes(sizesData)
    
  } catch (error) {
    console.error('Error loading data:', error)
    showToast('error', 'Failed to load data')
  }
}

// Helper methods for confirmation modals
const getServiceTypeName = (serviceTypeID) => {
  const serviceType = serviceTypes.value.find(type => type.serviceTypeID == serviceTypeID)
  return serviceType ? serviceType.serviceTypeName : 'Unknown Service Type'
}

const getVehicleSizeName = (vehicleSizeCode) => {
  const vehicleSize = vehicleSizes.value.find(size => size.vehicleSizeCode === vehicleSizeCode)
  return vehicleSize ? vehicleSize.vehicleSizeDescription : 'Unknown Vehicle Size'
}

// Service Rate methods
const editServiceRate = (rate) => {
  editingServiceRate.value = rate
  serviceRateForm.serviceTypeID = rate.serviceTypeID
  serviceRateForm.vehicleSizeCode = rate.vehicleSizeCode
  serviceRateForm.price = rate.price
}

// Modified saveServiceRate to show confirmation first
const saveServiceRate = async () => {
  // Store the current form data and show confirmation
  pendingSaveData.value = { ...serviceRateForm }
  showSaveConfirmation.value = true
}

// New method to handle the actual save after confirmation
const confirmSave = async () => {
  try {
    if (editingServiceRate.value) {
      await serviceApi.updateServiceRate(editingServiceRate.value.serviceRateID, pendingSaveData.value)
      showToast('success', 'Service rate updated successfully!')
    } else {
      await serviceApi.createServiceRate(pendingSaveData.value)
      showToast('success', 'Service rate created successfully!')
    }
    
    await loadData()
    closeModal()
    closeSaveConfirmation()
  } catch (error) {
    console.error('Error saving service rate:', error)
    showToast('error', 'Failed to save service rate: ' + (error.response?.data?.message || error.message))
    closeSaveConfirmation()
  }
}

// Method to close save confirmation modal
const closeSaveConfirmation = () => {
  showSaveConfirmation.value = false
  pendingSaveData.value = null
}

const deleteServiceRate = async (id) => {
  if (confirm('Are you sure you want to delete this service rate?')) {
    try {
      await serviceApi.deleteServiceRate(id)
      showToast('success', 'Service rate deleted successfully!')
      await loadData()
    } catch (error) {
      console.error('Error deleting service rate:', error)
      showToast('error', 'Failed to delete service rate: ' + (error.response?.data?.message || error.message))
    }
  }
}

// Service Type methods
const editServiceType = (type) => {
  console.log('Editing service type:', type)
  editingServiceType.value = type
  serviceTypeForm.serviceTypeName = type.serviceTypeName
  serviceTypeForm.serviceTypeDescription = type.serviceTypeDescription
  serviceTypeForm.serviceTypeImage = type.serviceTypeImage
  
  console.log('Form populated with:', {
    serviceTypeName: serviceTypeForm.serviceTypeName,
    serviceTypeDescription: serviceTypeForm.serviceTypeDescription,
    serviceTypeImage: serviceTypeForm.serviceTypeImage
  })
  
  // Reset file upload state when editing
  selectedFile.value = null
  imagePreview.value = ''
  uploadError.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Modified saveServiceType to show confirmation first
const saveServiceType = async () => {
  try {
    // Validate required fields first
    if (!serviceTypeForm.serviceTypeName.trim()) {
      uploadError.value = 'Service name is required'
      return
    }

    uploadError.value = ''

    // Prepare data for confirmation display
    pendingSaveServiceTypeData.value = {
      serviceTypeName: serviceTypeForm.serviceTypeName.trim(),
      serviceTypeDescription: serviceTypeForm.serviceTypeDescription.trim(),
      imageFile: selectedFile.value,
      hasNewImage: !!selectedFile.value,
      currentImage: serviceTypeForm.serviceTypeImage,
      isEditing: !!editingServiceType.value
    }

    showSaveServiceTypeConfirmation.value = true
  } catch (error) {
    console.error('Error preparing service type data:', error)
    uploadError.value = 'Error preparing data'
  }
}

// New method to handle the actual save after confirmation
const confirmSaveServiceType = async () => {
  try {
    console.log('=== SAVE SERVICE TYPE DEBUG ===')
    console.log('pendingSaveServiceTypeData:', pendingSaveServiceTypeData.value)

    // Prepare data object that matches your API service expectations
    const serviceTypeData = {
      serviceTypeName: pendingSaveServiceTypeData.value.serviceTypeName,
      serviceTypeDescription: pendingSaveServiceTypeData.value.serviceTypeDescription,
      imageFile: pendingSaveServiceTypeData.value.imageFile
    }

    console.log('Prepared serviceTypeData:', {
      serviceTypeName: serviceTypeData.serviceTypeName,
      serviceTypeDescription: serviceTypeData.serviceTypeDescription,
      hasImageFile: !!serviceTypeData.imageFile,
      imageFileName: serviceTypeData.imageFile?.name
    })

    let result
    if (editingServiceType.value) {
      console.log('Updating existing service type...', {
        id: editingServiceType.value.serviceTypeID
      })
      result = await serviceApi.updateServiceType(editingServiceType.value.serviceTypeID, serviceTypeData)
      console.log('Update result:', result)
      showToast('success', 'Service type updated successfully!')
    } else {
      console.log('Creating new service type...')
      result = await serviceApi.createServiceType(serviceTypeData)
      console.log('Create result:', result)
      showToast('success', 'Service type created successfully!')
    }

    await loadData() // This will auto-sort the updated data
    closeModal()
    closeSaveServiceTypeConfirmation()
    console.log('✅ Service type saved and data reloaded with sorting!')
  } catch (error) {
    console.error('❌ Error saving service type:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      errors: error.response?.data?.errors || null
    })

    // Display the first validation error if available
    if (error.response?.data?.errors) {
      const firstError = Object.values(error.response.data.errors)[0][0]
      uploadError.value = firstError
      showToast('error', firstError)
    } else {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save service type'
      uploadError.value = errorMessage
      showToast('error', errorMessage)
    }
    closeSaveServiceTypeConfirmation()
  }
}

// Method to close service type save confirmation modal
const closeSaveServiceTypeConfirmation = () => {
  showSaveServiceTypeConfirmation.value = false
  pendingSaveServiceTypeData.value = null
}

const deleteServiceType = async (id) => {
  // Find the service type to get its name
  const serviceType = serviceTypes.value.find(type => type.serviceTypeID === id)
  const serviceTypeName = serviceType ? serviceType.serviceTypeName : 'this service type'
  
  // Check if there are related service rates
  const relatedRates = serviceRates.value.filter(rate => rate.serviceTypeID === id)
  
  let confirmMessage = `Are you sure you want to delete "${serviceTypeName}"?`
  if (relatedRates.length > 0) {
    confirmMessage += `\n\nThis will also delete ${relatedRates.length} related service rate(s).`
  }
  
  if (confirm(confirmMessage)) {
    try {
      console.log('Deleting service type:', { id, name: serviceTypeName, relatedRates: relatedRates.length })
      await serviceApi.deleteServiceType(id)
      await loadData() // This will auto-sort the updated data
      console.log('Service type deleted successfully and data reloaded with sorting!')
      showToast('success', `"${serviceTypeName}" has been deleted successfully!`)
    } catch (error) {
      console.error('Error deleting service type:', error)
      const errorMessage = error.response?.data?.message || error.message
      showToast('error', 'Failed to delete service type: ' + errorMessage)
    }
  }
}

// Vehicle Size methods
const editVehicleSize = (size) => {
  editingVehicleSize.value = size
  vehicleSizeForm.vehicleSizeCode = size.vehicleSizeCode
  vehicleSizeForm.vehicleSizeDescription = size.vehicleSizeDescription
}

const saveVehicleSize = async () => {
  try {
    // Validate required fields first
    if (!vehicleSizeForm.vehicleSizeCode.trim()) {
      showToast('error', 'Vehicle size code is required')
      return
    }
    
    if (!vehicleSizeForm.vehicleSizeDescription.trim()) {
      showToast('error', 'Vehicle size description is required')
      return
    }

    // Prepare data for confirmation display
    pendingSaveVehicleSizeData.value = {
      vehicleSizeCode: vehicleSizeForm.vehicleSizeCode.trim(),
      vehicleSizeDescription: vehicleSizeForm.vehicleSizeDescription.trim(),
      isEditing: !!editingVehicleSize.value
    }

    showSaveVehicleSizeConfirmation.value = true
  } catch (error) {
    console.error('Error preparing vehicle size data:', error)
    showToast('error', 'Error preparing data')
  }
}

// Add this new method to handle the actual save after confirmation:
const confirmSaveVehicleSize = async () => {
  try {
    console.log('=== SAVE VEHICLE SIZE DEBUG ===')
    console.log('pendingSaveVehicleSizeData:', pendingSaveVehicleSizeData.value)

    // Prepare data object
    const vehicleSizeData = {
      vehicleSizeCode: pendingSaveVehicleSizeData.value.vehicleSizeCode,
      vehicleSizeDescription: pendingSaveVehicleSizeData.value.vehicleSizeDescription
    }

    console.log('Prepared vehicleSizeData:', vehicleSizeData)

    let result
    if (editingVehicleSize.value) {
      console.log('Updating existing vehicle size...', {
        code: editingVehicleSize.value.vehicleSizeCode
      })
      result = await serviceApi.updateVehicleSize(editingVehicleSize.value.vehicleSizeCode, vehicleSizeData)
      console.log('Update result:', result)
      showToast('success', 'Vehicle size updated successfully!')
    } else {
      console.log('Creating new vehicle size...')
      result = await serviceApi.createVehicleSize(vehicleSizeData)
      console.log('Create result:', result)
      showToast('success', 'Vehicle size created successfully!')
    }

    await loadData() // This will auto-sort the updated data
    closeModal()
    closeSaveVehicleSizeConfirmation()
    console.log('✅ Vehicle size saved and data reloaded with sorting!')
  } catch (error) {
    console.error('❌ Error saving vehicle size:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      errors: error.response?.data?.errors || null
    })

    // Display the first validation error if available
    if (error.response?.data?.errors) {
      const firstError = Object.values(error.response.data.errors)[0][0]
      showToast('error', firstError)
    } else {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save vehicle size'
      showToast('error', errorMessage)
    }
    closeSaveVehicleSizeConfirmation()
  }
}

const closeSaveVehicleSizeConfirmation = () => {
  showSaveVehicleSizeConfirmation.value = false
  pendingSaveVehicleSizeData.value = null
}

const deleteVehicleSize = async (code) => {
  if (confirm('Are you sure you want to delete this vehicle size?')) {
    try {
      await serviceApi.deleteVehicleSize(code)
      showToast('success', 'Vehicle size deleted successfully!')
      await loadData() // This will auto-sort the updated data
      console.log('✅ Vehicle size deleted and data reloaded with sorting!')
    } catch (error) {
      console.error('Error deleting vehicle size:', error)
      showToast('error', 'Failed to delete vehicle size: ' + (error.response?.data?.message || error.message))
    }
  }
}

const closeModal = () => {
  showAddServiceRate.value = false
  showAddServiceType.value = false
  showAddVehicleSize.value = false
  editingServiceRate.value = null
  editingServiceType.value = null
  editingVehicleSize.value = null
  
  // Reset forms
  Object.assign(serviceRateForm, { serviceTypeID: '', vehicleSizeCode: '', price: '' })
  Object.assign(serviceTypeForm, { serviceTypeName: '', serviceTypeDescription: '', serviceTypeImage: '' })
  Object.assign(vehicleSizeForm, { vehicleSizeCode: '', vehicleSizeDescription: '' })
  
  // Reset file upload state
  imagePreview.value = ''
  isDragOver.value = false
  uploadProgress.value = 0
  uploadError.value = ''
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

// Image handling methods
const handleImageError = (event) => {
  console.warn('Image failed to load:', event.target.src)
  // Don't hide the image, show error state instead
  event.target.style.border = '2px solid #e53e3e'
  event.target.style.backgroundColor = '#fed7d7'
  
  // Add error text
  const errorDiv = document.createElement('div')
  errorDiv.textContent = 'Failed to load'
  errorDiv.style.color = '#e53e3e'
  errorDiv.style.fontSize = '10px'
  errorDiv.style.textAlign = 'center'
  errorDiv.style.marginTop = '4px'
  
  if (!event.target.parentNode.querySelector('.image-error')) {
    errorDiv.className = 'image-error'
    event.target.parentNode.appendChild(errorDiv)
  }
}

const handleImageLoad = (event) => {
  console.log('Image loaded successfully:', event.target.src)
  event.target.style.border = '2px solid #38a169'
  event.target.style.backgroundColor = '#f0fff4'
  
  // Remove any existing error messages
  const errorDiv = event.target.parentNode.querySelector('.image-error')
  if (errorDiv) {
    errorDiv.remove()
  }
}

const removeImage = () => {
  serviceTypeForm.serviceTypeImage = ''
  // Also reset the file input if it exists
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  selectedFile.value = null
  imagePreview.value = ''
}

// File upload methods
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    processFile(file)
  }
}

const handleFileDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false
  
  const files = event.dataTransfer.files
  if (files.length > 0) {
    processFile(files[0])
  }
}

const processFile = (file) => {
  console.log('=== FILE PROCESSING DEBUG ===')
  console.log('Processing file:', {
    name: file.name,
    size: file.size,
    type: file.type
  })
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    uploadError.value = 'Please select a valid image file'
    console.log('❌ Invalid file type:', file.type)
    return
  }
  
  // Validate file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    uploadError.value = 'File size must be less than 10MB'
    console.log('❌ File too large:', file.size)
    return
  }
  
  // Clear previous errors
  uploadError.value = ''
  selectedFile.value = file
  
  console.log('✅ File selected successfully:', {
    name: selectedFile.value.name,
    size: selectedFile.value.size,
    type: selectedFile.value.type
  })
  
  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target.result
    console.log('✅ Image preview created')
  }
  reader.readAsDataURL(file)
}

const removeImagePreview = () => {
  imagePreview.value = ''
  selectedFile.value = null
  uploadError.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Debug methods
const testImageUrls = () => {
  console.log('=== Testing Image URLs ===')
  serviceTypes.value.forEach(type => {
    if (type.serviceTypeImage) {
      console.log(`ID: ${type.serviceTypeID} | Service: ${type.serviceTypeName}`)
      console.log(`Image URL: ${type.serviceTypeImage}`)
      console.log('---')
    }
  })
}

// Manual sorting methods (optional - for testing or manual triggers)
const manualSortServiceTypes = () => {
  serviceTypes.value = sortServiceTypes(serviceTypes.value)
  console.log('✅ Service types manually sorted!')
}

const manualSortVehicleSizes = () => {
  vehicleSizes.value = sortVehicleSizes(vehicleSizes.value)
  console.log('✅ Vehicle sizes manually sorted!')
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* Toast Notifications */
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  min-width: 320px;
  max-width: 500px;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: space-between;
  animation: slideIn 0.3s ease-out;
  backdrop-filter: blur(10px);
}

.toast.success {
  background: linear-gradient(135deg, rgba(56, 161, 105, 0.95), rgba(72, 187, 120, 0.9));
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.toast.error {
  background: linear-gradient(135deg, rgba(229, 62, 62, 0.95), rgba(197, 48, 48, 0.9));
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toast-close {
  background: none;
  border: none;
  color: inherit;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  margin-left: 16px;
  opacity: 0.8;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.toast-close:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.2);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Confirmation Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.save-confirmation-modal {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-width: 450px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  animation: modalFadeIn 0.2s ease-out;
}

/* Service Type confirmation modal - larger width */
.service-type-confirmation {
  max-width: 500px;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  background-color: #f8f9fa;
  padding: 20px;
  border-bottom: 1px solid #dee2e6;
}

.modal-header h3 {
  margin: 0;
  color: #495057;
  font-size: 1.25rem;
  font-weight: 600;
}

.modal-body {
  padding: 25px 20px;
}

.modal-body p {
  margin: 0 0 15px 0;
  color: #6c757d;
  font-size: 1rem;
  line-height: 1.5;
}

.confirmation-details {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 15px;
  margin-top: 15px;
  border-left: 4px solid #007bff;
}

.confirmation-details p {
  margin: 8px 0;
  font-size: 0.9rem;
}

.confirmation-details strong {
  color: #495057;
  font-weight: 600;
}

/* Image info specific styles */
.image-info {
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid #e9ecef;
}

.image-info p {
  margin-bottom: 8px;
  font-weight: 600;
  color: #495057;
}

.image-status {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
  line-height: 1.4;
}

.image-status.new {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.image-status.existing {
  background-color: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.image-status.none {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.modal-footer {
  background-color: #f8f9fa;
  padding: 15px 20px;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel, .btn-confirm {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  min-width: 80px;
}

.btn-cancel {
  background-color: #6c757d;
  color: white;
}

.btn-cancel:hover {
  background-color: #545b62;
}

.btn-confirm {
  background-color: #28a745;
  color: white;
}

.btn-confirm:hover {
  background-color: #218838;
}

.btn-cancel:active, .btn-confirm:active {
  transform: translateY(1px);
}

/* Focus states for accessibility */
.btn-cancel:focus, .btn-confirm:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* Responsive styles */
@media (max-width: 576px) {
  .save-confirmation-modal {
    margin: 20px;
    width: calc(100% - 40px);
    max-width: none;
  }
  
  .service-type-confirmation {
    max-width: none;
  }
  
  .modal-body {
    padding: 20px 15px;
  }
  
  .modal-header {
    padding: 15px;
  }
  
  .modal-footer {
    flex-direction: column;
    padding: 15px;
  }
  
  .btn-cancel, .btn-confirm {
    width: 100%;
    margin-bottom: 8px;
  }
  
  .btn-confirm {
    margin-bottom: 0;
  }
  
  .image-status {
    display: block;
    text-align: center;
    margin-top: 8px;
  }
}

/* Filters Section */
.filters-section {
  display: flex;
  gap: 16px;
  align-items: end;
  margin-bottom: 24px;
  padding: 20px 24px;
  background: rgba(247, 250, 252, 0.8);
  backdrop-filter: blur(10px);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-weight: 600;
  color: #4a5568;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-group select {
  padding: 10px 14px;
  border: 1px solid rgba(203, 213, 224, 0.6);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  min-width: 180px;
  font-size: 14px;
  font-weight: 500;
  color: #2d3748;
  transition: all 0.2s ease;
  backdrop-filter: blur(5px);
}

.filter-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
}

.reset-filters-btn {
  padding: 10px 16px;
  background: rgba(113, 128, 150, 0.1);
  color: #4a5568;
  border: 1px solid rgba(203, 213, 224, 0.6);
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.reset-filters-btn:hover {
  background: rgba(113, 128, 150, 0.2);
  border-color: #718096;
  color: #2d3748;
}

/* No Results Message */
.no-results {
  text-align: center;
  padding: 40px;
  color: #718096;
  background: rgba(247, 250, 252, 0.5);
  border-radius: 12px;
  margin: 20px 0;
}

.no-results p {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding: 20px 0;
  border-top: 1px solid rgba(226, 232, 240, 0.3);
}

.pagination-info {
  color: #718096;
  font-size: 14px;
  font-weight: 500;
}

.pagination {
  display: flex;
  gap: 6px;
  align-items: center;
}

.pagination-btn {
  padding: 8px 12px;
  border: 1px solid rgba(203, 213, 224, 0.6);
  background: rgba(255, 255, 255, 0.9);
  color: #4a5568;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(5px);
}

.pagination-btn:hover:not(:disabled) {
  background: rgba(247, 250, 252, 0.9);
  border-color: #cbd5e0;
  color: #2d3748;
}

.pagination-btn.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.pagination-btn:disabled {
  background: rgba(247, 250, 252, 0.5);
  color: #a0aec0;
  cursor: not-allowed;
  border-color: rgba(203, 213, 224, 0.3);
}

.pagination-ellipsis {
  padding: 8px 6px;
  color: #a0aec0;
  font-weight: 500;
}

.items-per-page select {
  padding: 8px 12px;
  border: 1px solid rgba(203, 213, 224, 0.6);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  font-weight: 500;
  color: #4a5568;
  backdrop-filter: blur(5px);
  transition: all 0.2s ease;
}

.items-per-page select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
}

/* Main Container */  
.service-management {
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

.management-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  margin-bottom: 32px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-top: 8px; 
}

.management-section:hover {
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.15);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.3);
  background: linear-gradient(135deg, rgba(247, 250, 252, 0.8), rgba(237, 242, 247, 0.8));
  backdrop-filter: blur(10px);
}

.section-header h2 {
  color: #1a202c;
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-header h2::before {
  content: '';
  width: 4px;
  height: 24px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 2px;
}

.add-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, #5a67d8, #6b46c1);
}

.add-btn svg {
  transition: transform 0.3s ease;
}

.add-btn:hover svg {
  transform: rotate(90deg);
}

.table-container {
  overflow-x: auto;
  margin: 0;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table th {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  color: #2d3748;
  font-weight: 700;
  padding: 20px 24px;
  text-align: left;
  border-bottom: 2px solid rgba(102, 126, 234, 0.1);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 12px;
}

.data-table td {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.3);
  color: #2d3748;
  vertical-align: middle;
}

.data-table tr {
  transition: all 0.3s ease;
}

.data-table tr:hover {
  background: rgba(102, 126, 234, 0.05);
  transform: scale(1.01);
}

.service-info, .vehicle-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.service-name, .vehicle-code {
  font-weight: 700;
  color: #1a202c;
  font-size: 15px;
}

.service-description, .vehicle-description {
  font-size: 13px;
  color: #718096;
  font-weight: 500;
}

.price-cell {
  font-weight: 800;
  color: #38a169;
  font-size: 16px;
  background: rgba(56, 161, 105, 0.1);
  padding: 8px 16px !important;
  border-radius: 8px;
  display: inline-block;
}

.service-name-cell, .size-code-cell {
  font-weight: 700;
  color: #1a202c;
  font-size: 15px;
}

.service-image {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  overflow: hidden;
  border: 3px solid rgba(102, 126, 234, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f7fafc, #edf2f7);
  position: relative;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.service-image:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: rgba(102, 126, 234, 0.5);
}

.service-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.service-image img:hover {
  transform: scale(1.1);
}

.no-image {
  color: #a0aec0;
  font-style: italic;
  font-size: 12px;
  text-align: center;
  padding: 8px;
  font-weight: 500;
}

.image-upload-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.current-image {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(247, 250, 252, 0.8), rgba(237, 242, 247, 0.8));
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.current-image:hover {
  border-color: rgba(102, 126, 234, 0.4);
  transform: translateY(-2px);
}

.current-image img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.remove-image-btn {
  background: linear-gradient(135deg, #e53e3e, #c53030);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(229, 62, 62, 0.3);
}

.remove-image-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.4);
}

.image-input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.image-help-text {
  color: #718096;
  font-size: 12px;
  line-height: 1.5;
  font-weight: 500;
}

.file-upload-area {
  border: 3px dashed rgba(102, 126, 234, 0.3);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, rgba(247, 250, 252, 0.5), rgba(237, 242, 247, 0.5));
  margin: 16px 0;
}

.file-upload-area:hover {
  border-color: rgba(102, 126, 234, 0.6);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
  transform: translateY(-2px);
}

.file-upload-area.dragover {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  transform: scale(1.02);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.upload-content svg {
  color: rgba(102, 126, 234, 0.6);
  transition: all 0.3s ease;
}

.file-upload-area:hover .upload-content svg {
  color: #667eea;
  transform: translateY(-4px);
}

.upload-text {
  font-weight: 600;
  color: #2d3748;
  margin: 0;
  font-size: 16px;
}

.upload-subtext {
  font-size: 14px;
  color: #718096;
  margin: 0;
  font-weight: 500;
}

.image-preview {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(240, 255, 244, 0.8), rgba(154, 230, 180, 0.1));
  border: 2px solid rgba(154, 230, 180, 0.5);
  border-radius: 12px;
  margin: 16px 0;
  transition: all 0.3s ease;
}

.image-preview:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(154, 230, 180, 0.2);
}

.image-preview img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 12px;
  border: 2px solid rgba(154, 230, 180, 0.8);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.remove-preview-btn {
  background: linear-gradient(135deg, #e53e3e, #c53030);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(229, 62, 62, 0.3);
}

.remove-preview-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.4);
}

.upload-progress {
  margin: 16px 0;
  padding: 16px;
  background: rgba(247, 250, 252, 0.8);
  border-radius: 12px;
  border: 2px solid rgba(102, 126, 234, 0.2);
  backdrop-filter: blur(10px);
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: rgba(226, 232, 240, 0.5);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 12px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s ease;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.progress-text {
  font-size: 14px;
  color: #2d3748;
  font-weight: 600;
  text-align: center;
}

.upload-error {
  margin: 16px 0;
  padding: 16px;
  background: linear-gradient(135deg, rgba(254, 215, 215, 0.8), rgba(254, 178, 178, 0.3));
  border: 2px solid rgba(254, 178, 178, 0.8);
  border-radius: 12px;
  color: #c53030;
  font-size: 14px;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.image-debug {
  position: absolute;
  bottom: -40px;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 8px;
  font-size: 10px;
  border-radius: 8px;
  z-index: 10;
  display: none;
  backdrop-filter: blur(10px);
}

.service-image:hover .image-debug {
  display: block;
}

.image-debug small {
  display: block;
  margin: 2px 0;
  word-break: break-all;
}

.action-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}

.edit-btn, .delete-btn {
  border: none;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.edit-btn {
  background: linear-gradient(135deg, #4299e1, #3182ce);
  color: white;
}

.edit-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 15px rgba(66, 153, 225, 0.4);
}

.delete-btn {
  background: linear-gradient(135deg, #e53e3e, #c53030);
  color: white;
}

.delete-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 15px rgba(229, 62, 62, 0.4);
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

.modal {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: modalSlideIn 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px 32px 24px 32px;
  border-bottom: 2px solid rgba(102, 126, 234, 0.1);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
}

.modal-header h3 {
  color: #1a202c;
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-btn {
  background: rgba(113, 128, 150, 0.1);
  border: none;
  font-size: 24px;
  color: #718096;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(229, 62, 62, 0.1);
  color: #e53e3e;
}

.modal-form {
  padding: 32px;
}

.form-group {
  margin-bottom: 24px;
  position: relative;
}

.form-group label {
  display: block;
  color: #2d3748;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid rgba(226, 232, 240, 0.5);
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: rgba(247, 250, 252, 0.5);
  backdrop-filter: blur(10px);
  font-weight: 500;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  background: rgba(255, 255, 255, 0.8);
  transform: translateY(-2px);
}

/* Enhanced Select Styling */
.form-group select {
  width: 100%;
  padding: 14px 40px 14px 16px;
  border: 2px solid rgba(226, 232, 240, 0.5);
  border-radius: 12px;
  font-size: 16px;
  background: rgba(247, 250, 252, 0.5);
  backdrop-filter: blur(10px);
  color: #2d3748;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 20px;
}

.form-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  background: rgba(255, 255, 255, 0.8);
  transform: translateY(-2px);
}

.form-group select:hover {
  border-color: #cbd5e0;
  background: rgba(255, 255, 255, 0.7);
}

/* Option Styling */
.form-group select option {
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 500;
  background-color: white;
  color: #2d3748;
  line-height: 1.4;
  border: none;
}

.form-group select option:hover,
.form-group select option:focus {
  background-color: #f7fafc;
  color: #1a202c;
}

.form-group select option:checked {
  background-color: #667eea;
  color: white;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 2px solid rgba(102, 126, 234, 0.1);
}

.cancel-btn, .save-btn {
  padding: 14px 28px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cancel-btn {
  background: rgba(247, 250, 252, 0.8);
  color: #4a5568;
  border: 2px solid rgba(226, 232, 240, 0.5);
  backdrop-filter: blur(10px);
}

.cancel-btn:hover {
  background: rgba(237, 242, 247, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.save-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, #5a67d8, #6b46c1);
}

/* Responsive Design */
@media (max-width: 768px) {
  .service-management {
    padding: 16px;
  }
  
  .page-header {
    padding: 24px;
    margin-bottom: 24px;
  }
  
  .page-header h1 {
    font-size: 28px;
  }
  
  .page-header p {
    font-size: 16px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 24px;
  }
  
  .section-header h2 {
    font-size: 20px;
  }
  
  .table-container {
    font-size: 13px;
  }
  
  .data-table th,
  .data-table td {
    padding: 16px 12px;
  }
  
  .service-image {
    width: 60px;
    height: 60px;
  }
  
  .current-image img,
  .image-preview img {
    width: 60px;
    height: 60px;
  }
  
  .modal {
    width: 95%;
    margin: 16px;
  }
  
  .modal-header {
    padding: 24px 24px 20px 24px;
  }
  
  .modal-header h3 {
    font-size: 20px;
  }
  
  .modal-form {
    padding: 24px;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .cancel-btn, .save-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }
  
  .file-upload-area {
    padding: 24px 16px;
  }
  
  .upload-text {
    font-size: 14px;
  }
  
  .upload-subtext {
    font-size: 12px;
  }
}

/* Loading States */
.loading {
  opacity: 0.7;
  pointer-events: none;
  position: relative;
}

.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  border: 2px solid #667eea;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Success States */
.success-message {
  background: linear-gradient(135deg, rgba(72, 187, 120, 0.1), rgba(56, 161, 105, 0.05));
  color: #2f855a;
  padding: 16px 20px;
  border-radius: 12px;
  border: 2px solid rgba(72, 187, 120, 0.2);
  font-weight: 600;
  margin: 16px 0;
  backdrop-filter: blur(10px);
}

/* Enhanced Table Responsiveness */
@media (max-width: 1024px) {
  .data-table {
    font-size: 13px;
  }
  
  .service-image {
    width: 70px;
    height: 70px;
  }
}

/* Improved Focus States for Accessibility */
.add-btn:focus,
.edit-btn:focus,
.delete-btn:focus,
.save-btn:focus,
.cancel-btn:focus {
  outline: 3px solid rgba(102, 126, 234, 0.5);
  outline-offset: 2px;
}

/* Table Column Specific Alignments */
.data-table th:nth-child(3), /* Price/Image column */
.data-table td:nth-child(3) {
  text-align: center;
}

.data-table th:nth-child(4), /* Last Updated column */
.data-table td:nth-child(4) {
  text-align: center;
}

.data-table th:nth-child(5), /* Actions column */
.data-table td:nth-child(5) {
  text-align: center;
}

/* Ensure all table cells have consistent vertical alignment */
.data-table td {
  vertical-align: middle !important;
}
.management-section {
  position: relative;
  overflow: hidden;
}

.management-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.management-section:hover::before {
  left: 100%;
}

/* Responsive Design */

/* Large tablets and small desktops */
@media (max-width: 1200px) {
  .service-management {
    padding: 20px;
  }
  
  .page-header {
    padding: 40px 28px;
  }
  
  .page-header h1 {
    font-size: 36px;
  }
  
  .section-header {
    padding: 28px;
  }
  
  .data-table th,
  .data-table td {
    padding: 18px 20px;
  }
  
  .filters-section {
    gap: 12px;
    padding: 18px 20px;
  }
  
  .filter-group select {
    min-width: 160px;
  }
}

/* Tablets */
@media (max-width: 1024px) {
  .service-management {
    padding: 18px;
  }
  
  .page-header {
    padding: 36px 24px;
  }
  
  .page-header h1 {
    font-size: 32px;
  }
  
  .page-header p {
    font-size: 18px;
  }
  
  .data-table {
    font-size: 13px;
  }
  
  .data-table th,
  .data-table td {
    padding: 16px 18px;
  }
  
  .service-image {
    width: 70px;
    height: 70px;
  }
  
  .current-image img,
  .image-preview img {
    width: 70px;
    height: 70px;
  }
  
  .filters-section {
    flex-wrap: wrap;
    gap: 12px;
    padding: 16px 18px;
  }
  
  .filter-group {
    flex: 1;
    min-width: 140px;
  }
  
  .filter-group select {
    min-width: 140px;
  }
  
  .modal {
    width: 85%;
    max-width: 500px;
  }
  
  .modal-header {
    padding: 28px 28px 22px 28px;
  }
  
  .modal-form {
    padding: 28px;
  }
  
  .toast {
    min-width: 280px;
    max-width: 400px;
    right: 15px;
    top: 15px;
  }
}

/* Large mobile devices */
@media (max-width: 768px) {
  .service-management {
    padding: 16px;
  }
  
  .page-header {
    padding: 32px 20px;
    margin-bottom: 24px;
  }
  
  .page-header h1 {
    font-size: 28px;
    line-height: 1.2;
  }
  
  .page-header p {
    font-size: 16px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 24px 20px;
  }
  
  .section-header h2 {
    font-size: 20px;
  }
  
  .add-btn {
    width: 100%;
    justify-content: center;
    padding: 16px 24px;
  }
  
  .table-container {
    font-size: 13px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .data-table {
    min-width: 600px;
  }
  
  .data-table th,
  .data-table td {
    padding: 14px 12px;
    white-space: nowrap;
  }
  
  .service-image {
    width: 60px;
    height: 60px;
  }
  
  .current-image img,
  .image-preview img {
    width: 60px;
    height: 60px;
  }
  
  .filters-section {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    padding: 20px;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .filter-group select {
    width: 100%;
    min-width: auto;
  }
  
  .reset-filters-btn {
    width: 100%;
    padding: 12px 16px;
  }
  
  .modal {
    width: 95%;
    margin: 10px;
    max-height: 85vh;
  }
  
  .modal-header {
    padding: 24px 20px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .modal-header h3 {
    font-size: 20px;
  }
  
  .close-btn {
    position: absolute;
    top: 20px;
    right: 20px;
  }
  
  .modal-form {
    padding: 20px;
  }
  
  .form-group input,
  .form-group textarea {
    padding: 12px 14px;
    font-size: 16px;
  }
  
  .modal-actions {
    flex-direction: column;
    gap: 12px;
    margin-top: 24px;
  }
  
  .cancel-btn, .save-btn {
    width: 100%;
    padding: 16px 28px;
  }
  
  .pagination-container {
    flex-direction: column;
    gap: 16px;
    align-items: center;
    text-align: center;
  }
  
  .pagination {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .pagination-btn {
    padding: 10px 12px;
    font-size: 13px;
    min-width: 44px;
  }
  
  .items-per-page {
    order: -1;
  }
  
  .toast {
    min-width: 280px;
    max-width: calc(100vw - 32px);
    left: 16px;
    right: 16px;
    top: 10px;
  }
  
  .file-upload-area {
    padding: 24px 16px;
  }
  
  .upload-text {
    font-size: 14px;
  }
  
  .upload-subtext {
    font-size: 12px;
  }
  
  .service-info, .vehicle-info {
    gap: 4px;
  }
  
  .service-name, .vehicle-code {
    font-size: 14px;
  }
  
  .service-description, .vehicle-description {
    font-size: 12px;
  }
  
  .price-cell {
    font-size: 14px;
    padding: 6px 12px !important;
  }
}

/* Small mobile devices */
@media (max-width: 480px) {
  .service-management {
    padding: 12px;
  }
  
  .page-header {
    padding: 24px 16px;
  }
  
  .page-header h1 {
    font-size: 24px;
  }
  
  .page-header p {
    font-size: 14px;
  }
  
  .section-header {
    padding: 20px 16px;
  }
  
  .section-header h2 {
    font-size: 18px;
  }
  
  .add-btn {
    padding: 14px 20px;
    font-size: 13px;
  }
  
  .data-table {
    min-width: 500px;
  }
  
  .data-table th,
  .data-table td {
    padding: 12px 8px;
    font-size: 12px;
  }
  
  .service-image {
    width: 50px;
    height: 50px;
  }
  
  .current-image img,
  .image-preview img {
    width: 50px;
    height: 50px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 6px;
  }
  
  .edit-btn, .delete-btn {
    padding: 8px;
    width: 32px;
    height: 32px;
  }
  
  .filters-section {
    padding: 16px;
    gap: 12px;
  }
  
  .filter-group label {
    font-size: 12px;
  }
  
  .filter-group select {
    padding: 8px 32px 8px 12px;
    font-size: 13px;
    background-size: 16px;
    background-position: right 8px center;
  }
  
  .reset-filters-btn {
    padding: 10px 14px;
    font-size: 12px;
  }
  
  .modal {
    width: calc(100vw - 20px);
    margin: 10px;
    border-radius: 16px;
  }
  
  .modal-header {
    padding: 20px 16px;
  }
  
  .modal-header h3 {
    font-size: 18px;
  }
  
  .modal-form {
    padding: 16px;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-group label {
    font-size: 13px;
    margin-bottom: 6px;
  }
  
  .form-group input,
  .form-group textarea {
    padding: 10px 12px;
    font-size: 15px;
  }
  
  .modal-actions {
    margin-top: 20px;
    padding-top: 16px;
  }
  
  .cancel-btn, .save-btn {
    padding: 14px 24px;
    font-size: 13px;
  }
  
  .pagination-container {
    padding: 16px 0;
  }
  
  .pagination-info {
    font-size: 12px;
  }
  
  .pagination-btn {
    padding: 8px 10px;
    font-size: 12px;
    min-width: 36px;
  }
  
  .pagination-ellipsis {
    padding: 8px 4px;
    font-size: 12px;
  }
  
  .toast {
    min-width: 260px;
    padding: 12px;
    border-radius: 10px;
    font-size: 14px;
  }
  
  .file-upload-area {
    padding: 20px 12px;
  }
  
  .upload-content {
    gap: 8px;
  }
  
  .upload-text {
    font-size: 13px;
  }
  
  .upload-subtext {
    font-size: 11px;
  }
  
  .current-image,
  .image-preview {
    padding: 12px;
    gap: 12px;
  }
  
  .remove-image-btn,
  .remove-preview-btn {
    padding: 6px 12px;
    font-size: 11px;
  }
  
  .service-name-cell,
  .size-code-cell {
    font-size: 13px;
  }
  
  .price-cell {
    font-size: 13px;
    padding: 4px 8px !important;
  }
  
  .no-results {
    padding: 30px 20px;
  }
  
  .no-results p {
    font-size: 14px;
  }
}

/* Extra small devices */
@media (max-width: 360px) {
  .service-management {
    padding: 8px;
  }
  
  .page-header {
    padding: 20px 12px;
  }
  
  .page-header h1 {
    font-size: 22px;
  }
  
  .section-header {
    padding: 16px 12px;
  }
  
  .data-table {
    min-width: 450px;
  }
  
  .data-table th,
  .data-table td {
    padding: 10px 6px;
    font-size: 11px;
  }
  
  .service-image {
    width: 40px;
    height: 40px;
  }
  
  .current-image img,
  .image-preview img {
    width: 40px;
    height: 40px;
  }
  
  .filters-section {
    padding: 12px;
  }
  
  .modal {
    width: calc(100vw - 16px);
    margin: 8px;
  }
  
  .modal-header {
    padding: 16px 12px;
  }
  
  .modal-form {
    padding: 12px;
  }
  
  .form-group input,
  .form-group textarea {
    padding: 8px 10px;
  }
  
  .toast {
    min-width: 240px;
    left: 8px;
    right: 8px;
    top: 8px;
    font-size: 13px;
  }
  
  .pagination-btn {
    padding: 6px 8px;
    font-size: 11px;
    min-width: 32px;
  }
}

/* Landscape orientation adjustments for mobile */
@media (max-width: 768px) and (orientation: landscape) {
  .page-header {
    padding: 24px 20px;
  }
  
  .page-header h1 {
    font-size: 24px;
  }
  
  .page-header p {
    font-size: 14px;
  }
  
  .modal {
    max-height: 80vh;
  }
  
  .modal-header {
    padding: 20px 20px 16px 20px;
  }
  
  .modal-form {
    padding: 16px 20px;
  }
}

/* High DPI displays */
@media (min-resolution: 2dppx) {
  .service-image img,
  .current-image img,
  .image-preview img {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
}

/* Reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Print styles */
@media print {
  .toast,
  .modal-overlay,
  .action-buttons,
  .add-btn,
  .filters-section,
  .pagination-container {
    display: none !important;
  }
  
  .service-management {
    padding: 0;
  }
  
  .management-section {
    box-shadow: none;
    border: 1px solid #e2e8f0;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  
  .data-table {
    font-size: 12px;
  }
  
  .data-table th,
  .data-table td {
    padding: 8px;
  }
}
</style>
