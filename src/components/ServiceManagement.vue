<template>
  <div class="service-management">
    <!-- Page Header -->
    <div class="page-header">
      <h1>Service Management</h1>
      <p>Manage your car wash services, rates, and vehicle categories.</p>
      <div class="debug-actions">
        <button @click="testImageUrls" class="debug-btn">Test Image URLs</button>
      </div>
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
            <tr v-for="rate in serviceRates" :key="rate.serviceRateID">
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
                    :src="getImageUrl(type.serviceTypeImage)" 
                    :alt="type.serviceTypeName"
                    @error="handleImageError"
                    @load="handleImageLoad"
                  />
                  <div class="image-debug">
                    <small><strong>ID:</strong> {{ type.serviceTypeID }}</small>
                    <small><strong>Path:</strong> {{ type.serviceTypeImage }}</small>
                    <small><strong>URL:</strong> {{ getImageUrl(type.serviceTypeImage) }}</small>
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
              <div v-if="serviceTypeForm.serviceTypeImage" class="current-image">
                <img :src="getImageUrl(serviceTypeForm.serviceTypeImage)" :alt="serviceTypeForm.serviceTypeName" />
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { serviceApi, getImageUrl } from '../services/api'

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

// Methods
const loadData = async () => {
  try {
    const [ratesData, typesData, sizesData] = await Promise.all([
      serviceApi.getServiceRates(),
      serviceApi.getServiceTypes(),
      serviceApi.getVehicleSizes()
    ])
    
    serviceRates.value = ratesData
    serviceTypes.value = typesData
    vehicleSizes.value = sizesData
    
    // Debug: Log service types with images
    console.log('Service Types with Images:', serviceTypes.value.filter(type => type.serviceTypeImage))
    serviceTypes.value.forEach(type => {
      if (type.serviceTypeImage) {
        console.log(`ID: ${type.serviceTypeID} | Service: ${type.serviceTypeName} | Image: ${type.serviceTypeImage} | URL: ${getImageUrl(type.serviceTypeImage)}`)
      }
    })
  } catch (error) {
    console.error('Error loading data:', error)
  }
}

// Service Rate methods
const editServiceRate = (rate) => {
  editingServiceRate.value = rate
  serviceRateForm.serviceTypeID = rate.serviceTypeID
  serviceRateForm.vehicleSizeCode = rate.vehicleSizeCode
  serviceRateForm.price = rate.price
}

const saveServiceRate = async () => {
  try {
    if (editingServiceRate.value) {
      await serviceApi.updateServiceRate(editingServiceRate.value.serviceRateID, serviceRateForm)
    } else {
      await serviceApi.createServiceRate(serviceRateForm)
    }
    
    await loadData()
    closeModal()
  } catch (error) {
    console.error('Error saving service rate:', error)
  }
}

const deleteServiceRate = async (id) => {
  if (confirm('Are you sure you want to delete this service rate?')) {
    try {
      await serviceApi.deleteServiceRate(id)
      await loadData()
    } catch (error) {
      console.error('Error deleting service rate:', error)
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

const saveServiceType = async () => {
  try {
    console.log('=== SAVE SERVICE TYPE DEBUG ===')
    console.log('selectedFile.value:', selectedFile.value)
    console.log('imagePreview.value:', imagePreview.value)
    console.log('editingServiceType.value:', editingServiceType.value)
    
    // Validate required fields
    if (!serviceTypeForm.serviceTypeName.trim()) {
      uploadError.value = 'Service name is required'
      return
    }
    
    // Clear any previous errors
    uploadError.value = ''
    
    // Prepare data for API call
    const serviceTypeData = {
      serviceTypeName: serviceTypeForm.serviceTypeName.trim(),
      serviceTypeDescription: serviceTypeForm.serviceTypeDescription.trim(),
      serviceTypeImage: serviceTypeForm.serviceTypeImage // Keep existing image path
    }
    
    // Add image file if a new one is selected
    if (selectedFile.value) {
      serviceTypeData.imageFile = selectedFile.value
      console.log('✅ NEW FILE SELECTED - Adding to request:', {
        name: selectedFile.value.name,
        size: selectedFile.value.size,
        type: selectedFile.value.type
      })
    } else {
      console.log('❌ NO NEW FILE SELECTED - Using existing image:', serviceTypeForm.serviceTypeImage)
      // Don't include imageFile in the data if no new file is selected
      delete serviceTypeData.imageFile
    }
    
    console.log('Final service type data being sent:', serviceTypeData)
    
    if (editingServiceType.value) {
      console.log('Updating existing service type...', {
        id: editingServiceType.value.serviceTypeID,
        data: serviceTypeData
      })
      const result = await serviceApi.updateServiceType(editingServiceType.value.serviceTypeID, serviceTypeData)
      console.log('Update result:', result)
    } else {
      console.log('Creating new service type...', serviceTypeData)
      const result = await serviceApi.createServiceType(serviceTypeData)
      console.log('Create result:', result)
    }
    
    await loadData()
    closeModal()
    
    // Show success message
    console.log('Service type saved successfully!')
  } catch (error) {
    console.error('Error saving service type:', error)
    uploadError.value = error.response?.data?.message || error.message || 'Failed to save service type'
  }
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
      await loadData()
      console.log('Service type deleted successfully!')
      alert(`"${serviceTypeName}" has been deleted successfully!`)
    } catch (error) {
      console.error('Error deleting service type:', error)
      alert('Failed to delete service type: ' + (error.response?.data?.message || error.message))
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
    if (editingVehicleSize.value) {
      await serviceApi.updateVehicleSize(editingVehicleSize.value.vehicleSizeCode, vehicleSizeForm)
    } else {
      await serviceApi.createVehicleSize(vehicleSizeForm)
    }
    
    await loadData()
    closeModal()
  } catch (error) {
    console.error('Error saving vehicle size:', error)
  }
}

const deleteVehicleSize = async (code) => {
  if (confirm('Are you sure you want to delete this vehicle size?')) {
    try {
      await serviceApi.deleteVehicleSize(code)
      await loadData()
    } catch (error) {
      console.error('Error deleting vehicle size:', error)
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

// Image handling methods (using imported utility function)

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
  
  event.target.parentNode.appendChild(errorDiv)
}

const handleImageLoad = (event) => {
  console.log('Image loaded successfully:', event.target.src)
  event.target.style.border = '2px solid #38a169'
  event.target.style.backgroundColor = '#f0fff4'
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

// Removed uploadImage method - now handled directly in saveServiceType

// Debug methods
const testImageUrls = () => {
  console.log('=== Testing Image URLs ===')
  serviceTypes.value.forEach(type => {
    if (type.serviceTypeImage) {
      const url = getImageUrl(type.serviceTypeImage)
      console.log(`ID: ${type.serviceTypeID} | Service: ${type.serviceTypeName}`)
      console.log(`Original Path: ${type.serviceTypeImage}`)
      console.log(`Generated URL: ${url}`)
      console.log('---')
    }
  })
}


// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.service-management {
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
  margin: 0 0 16px 0;
}

.debug-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.debug-btn {
  background: #4299e1;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.debug-btn:hover {
  background: #3182ce;
}

.management-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  background: #f7fafc;
}

.section-header h2 {
  color: #2d3748;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.add-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.add-btn:hover {
  background: #5a67d8;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
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

.service-info, .vehicle-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.service-name, .vehicle-code {
  font-weight: 600;
  color: #2d3748;
}

.service-description, .vehicle-description {
  font-size: 12px;
  color: #718096;
}

.price-cell {
  font-weight: 600;
  color: #38a169;
}

.service-name-cell, .size-code-cell {
  font-weight: 600;
  color: #2d3748;
}

.service-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f7fafc;
  position: relative;
}

.service-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease;
}

.service-image img:hover {
  transform: scale(1.05);
}

.no-image {
  color: #a0aec0;
  font-style: italic;
  font-size: 12px;
  text-align: center;
  padding: 8px;
}

.image-upload-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.current-image {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.current-image img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.remove-image-btn {
  background: #e53e3e;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.remove-image-btn:hover {
  background: #c53030;
}

.image-input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.image-help-text {
  color: #718096;
  font-size: 12px;
  line-height: 1.4;
}

/* File Upload Styles */
.file-upload-area {
  border: 2px dashed #cbd5e0;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f7fafc;
  margin: 12px 0;
}

.file-upload-area:hover {
  border-color: #667eea;
  background: #edf2f7;
}

.file-upload-area.dragover {
  border-color: #667eea;
  background: #e6fffa;
  transform: scale(1.02);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.upload-content svg {
  color: #a0aec0;
  transition: color 0.2s ease;
}

.file-upload-area:hover .upload-content svg {
  color: #667eea;
}

.upload-text {
  font-weight: 500;
  color: #4a5568;
  margin: 0;
}

.upload-subtext {
  font-size: 12px;
  color: #718096;
  margin: 0;
}

.image-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f0fff4;
  border: 1px solid #9ae6b4;
  border-radius: 8px;
  margin: 12px 0;
}

.image-preview img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #9ae6b4;
}

.remove-preview-btn {
  background: #e53e3e;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.remove-preview-btn:hover {
  background: #c53030;
}

.upload-progress {
  margin: 12px 0;
  padding: 12px;
  background: #f7fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #4a5568;
  font-weight: 500;
}

.upload-error {
  margin: 12px 0;
  padding: 12px;
  background: #fed7d7;
  border: 1px solid #feb2b2;
  border-radius: 8px;
  color: #c53030;
  font-size: 14px;
  font-weight: 500;
}

.image-debug {
  position: absolute;
  bottom: -30px;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px;
  font-size: 8px;
  border-radius: 4px;
  z-index: 10;
  display: none;
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

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .table-container {
    font-size: 14px;
  }
  
  .data-table th,
  .data-table td {
    padding: 8px 12px;
  }
}
</style>
