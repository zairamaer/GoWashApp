<template>
  <div class="service-management">
    <!-- Page Header -->
    <div class="page-header">
      <h1>Service Management</h1>
      <p>Manage your car wash services, rates, and vehicle categories.</p>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
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
    
    // Debug: Log ALL service types data
    console.log('=== ALL SERVICE TYPES DEBUG ===')
    serviceTypes.value.forEach((type, index) => {
      console.log(`[${index}] ID: ${type.serviceTypeID}`)
      console.log(`[${index}] Name: ${type.serviceTypeName}`)
      console.log(`[${index}] Image: ${type.serviceTypeImage}`)
      console.log(`[${index}] Image Length: ${type.serviceTypeImage ? type.serviceTypeImage.length : 'null'}`)
      console.log('---')
    })
    
    // Debug: Log service types with images
    console.log('Service Types with Images:', serviceTypes.value.filter(type => type.serviceTypeImage))
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
    
    // Prepare data for API call - match the expected structure
    const serviceTypeData = {
      serviceTypeName: serviceTypeForm.serviceTypeName.trim(),
      serviceTypeDescription: serviceTypeForm.serviceTypeDescription.trim()
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
    }
    
    console.log('Final service type data being sent:', {
      serviceTypeName: serviceTypeData.serviceTypeName,
      serviceTypeDescription: serviceTypeData.serviceTypeDescription,
      hasImageFile: !!serviceTypeData.imageFile
    })
    
    let result
    if (editingServiceType.value) {
      console.log('Updating existing service type...', {
        id: editingServiceType.value.serviceTypeID,
        data: serviceTypeData
      })
      result = await serviceApi.updateServiceType(editingServiceType.value.serviceTypeID, serviceTypeData)
      console.log('Update result:', result)
    } else {
      console.log('Creating new service type...', serviceTypeData)
      result = await serviceApi.createServiceType(serviceTypeData)
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

// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<style scoped>
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
  backdrop-filter: blur(15px);
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  margin-bottom: 32px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.management-section:hover {
  transform: translateY(-4px);
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

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
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

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-50px) scale(0.95);
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
  transform: rotate(90deg);
}

.modal-form {
  padding: 32px;
}

.form-group {
  margin-bottom: 24px;
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
.form-group select,
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
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  background: rgba(255, 255, 255, 0.8);
  transform: translateY(-2px);
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
</style>
