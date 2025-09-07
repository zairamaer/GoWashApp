import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'https://gowashapp.online/api',
  headers: {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  timeout: 30000, // 30 second timeout for file uploads
  withCredentials: false, // Disable credentials for CORS
  maxRedirects: 5,
  validateStatus: function (status) {
    return status >= 200 && status < 300; // default
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Check for admin token first, then customer token
    const adminToken = localStorage.getItem('admin_token')
    const customerToken = localStorage.getItem('customer_token')
    
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`
    } else if (customerToken) {
      config.headers.Authorization = `Bearer ${customerToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log('API Response:', response.config.url, response.status, response.data)
    return response
  },
  (error) => {
    // Log errors for debugging
    console.error('API Error:', error.config?.url, error.response?.status, error.response?.data)
    
    if (error.response?.status === 401) {
      // Clear both admin and customer tokens
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      localStorage.removeItem('customer_token')
      localStorage.removeItem('customer_user')
      
      // Redirect based on current route
      const currentPath = window.location.pathname
      if (currentPath.startsWith('/admin')) {
        window.location.href = '/admin/login'
      } else if (currentPath.startsWith('/customer')) {
        window.location.href = '/customer/login'
      }
    }
    return Promise.reject(error)
  }
)

// Admin Authentication Service
export const adminAuthService = {
  async login(email, password) {
    const response = await api.post('/admin/login', {
      email,
      password
    })
    return response
  },

  async register(adminData) {
    const response = await api.post('/admin/register', adminData)
    return response
  },

  async logout() {
    try {
      const response = await api.post('/logout')
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      return response
    } catch (error) {
      // Even if logout fails on server, clear local storage
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      throw error
    }
  }
}

// Customer Authentication Service
export const customerAuthService = {
  async login(email, password) {
    const response = await api.post('/login', {
      email,
      password
    })
    return response
  },

  async register(customerData) {
    const response = await api.post('/register', customerData)
    return response
  },

  async logout() {
    try {
      const response = await api.post('/logout')
      localStorage.removeItem('customer_token')
      localStorage.removeItem('customer_user')
      return response
    } catch (error) {
      // Even if logout fails on server, clear local storage
      localStorage.removeItem('customer_token')
      localStorage.removeItem('customer_user')
      throw error
    }
  }
}

// Helper function to create FormData for service operations
const createServiceFormData = (serviceTypeData, serviceRate = null) => {
  const formData = new FormData()
  
  // Add service type fields
  formData.append('serviceTypeName', serviceTypeData.serviceTypeName)
  formData.append('serviceTypeDescription', serviceTypeData.serviceTypeDescription || '')
  
  // Add service rate fields
  formData.append('vehicleSizeCode', serviceTypeData.vehicleSizeCode || serviceRate?.vehicleSizeCode || 'S')
  formData.append('serviceTypeID', serviceRate?.serviceTypeID || serviceTypeData.serviceTypeID || '0')
  formData.append('price', serviceTypeData.price || serviceRate?.price || '0')
  
  // Add image file if present
  if (serviceTypeData.imageFile) {
    formData.append('serviceTypeImage', serviceTypeData.imageFile)
  }
  
  return formData
}

// Service Management API
export const serviceApi = {
  // Service Rates
  async getServiceRates() {
    const response = await api.get('/service-rates')
    return response.data
  },

  async createServiceRate(serviceRateData) {
    const response = await api.post('/service-rates', serviceRateData)
    return response.data
  },

  async updateServiceRate(id, serviceRateData) {
    const response = await api.put(`/service-rates/${id}`, serviceRateData)
    return response.data
  },

  async deleteServiceRate(id) {
    const response = await api.delete(`/service-rates/${id}`)
    return response.data
  },

  // Service Types
  async getServiceTypes() {
    const response = await api.get('/service-types')
    return response.data
  },

  async createServiceType(serviceTypeData) {
    try {
      console.log('Creating service type with direct service-types endpoint:', serviceTypeData)
      
      const formData = new FormData()
      
      // Add service type fields
      formData.append('serviceTypeName', serviceTypeData.serviceTypeName)
      formData.append('serviceTypeDescription', serviceTypeData.serviceTypeDescription || '')
      
      // Add image file if present
      if (serviceTypeData.imageFile) {
        formData.append('serviceTypeImage', serviceTypeData.imageFile)
        console.log('Image file added to FormData:', serviceTypeData.imageFile.name)
      }
      
      console.log('FormData contents:', {
        serviceTypeName: serviceTypeData.serviceTypeName,
        serviceTypeDescription: serviceTypeData.serviceTypeDescription,
        hasImageFile: !!serviceTypeData.imageFile
      })
      
      // Create service type directly with image
      const response = await api.post('/service-types', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      console.log('Service type created successfully:', response.data)
      return response.data
    } catch (error) {
      console.error('Error creating service type:', error)
      throw error
    }
  },

  async updateServiceType(id, serviceTypeData) {
    try {
      console.log('Updating service type with direct service-types endpoint:', { id, serviceTypeData })
      
      // If there's an image file, use FormData
      if (serviceTypeData.imageFile) {
        console.log('Updating with image file using FormData')
        
        const formData = new FormData()
        formData.append('serviceTypeName', serviceTypeData.serviceTypeName)
        formData.append('serviceTypeDescription', serviceTypeData.serviceTypeDescription || '')
        formData.append('serviceTypeImage', serviceTypeData.imageFile)
        formData.append('_method', 'PUT')
        
        console.log('FormData contents for update with image:', {
          serviceTypeName: serviceTypeData.serviceTypeName,
          serviceTypeDescription: serviceTypeData.serviceTypeDescription,
          hasImageFile: true,
          imageFileName: serviceTypeData.imageFile.name
        })
        
        // Try POST with method spoofing first (common for file uploads in Laravel)
        let response
        try {
          response = await api.post(`/service-types/${id}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
          console.log('Update with image successful using POST method spoofing')
        } catch (postError) {
          console.log('POST method failed, trying PUT method:', postError.message)
          response = await api.put(`/service-types/${id}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
          console.log('Update with image successful using PUT method')
        }
        
        console.log('Service type updated successfully with image:', response.data)
        return response.data
      } else {
        // No image file, use regular JSON request
        console.log('Updating without image file using JSON')
        
        const updateData = {
          serviceTypeName: serviceTypeData.serviceTypeName,
          serviceTypeDescription: serviceTypeData.serviceTypeDescription || ''
        }
        
        console.log('JSON data for update without image:', updateData)
        
        const response = await api.put(`/service-types/${id}`, updateData)
        console.log('Service type updated successfully without image:', response.data)
        return response.data
      }
    } catch (error) {
      console.error('Error updating service type:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        hasImageFile: !!serviceTypeData.imageFile
      })
      throw error
    }
  },

  async deleteServiceType(id) {
    try {
      console.log('Deleting service type and related service rates:', id)
      
      // First, get all service rates for this service type
      const serviceRates = await this.getServiceRates()
      const relatedRates = serviceRates.filter(rate => rate.serviceTypeID == id)
      
      console.log('Found related service rates:', relatedRates.length)
      
      // Delete all related service rates first
      for (const rate of relatedRates) {
        console.log('Deleting service rate:', rate.serviceRateID)
        await api.delete(`/service-rates/${rate.serviceRateID}`)
      }
      
      // Then delete the service type
      const response = await api.delete(`/service-types/${id}`)
      console.log('Service type deleted successfully')
      return response.data
    } catch (error) {
      console.error('Error deleting service type:', error)
      throw error
    }
  },

  // Vehicle Sizes
  async getVehicleSizes() {
    const response = await api.get('/vehicle-sizes')
    return response.data
  },

  async createVehicleSize(vehicleSizeData) {
    const response = await api.post('/vehicle-sizes', vehicleSizeData)
    return response.data
  },

  async updateVehicleSize(id, vehicleSizeData) {
    const response = await api.put(`/vehicle-sizes/${id}`, vehicleSizeData)
    return response.data
  },

  async deleteVehicleSize(id) {
    const response = await api.delete(`/vehicle-sizes/${id}`)
    return response.data
  }
}

// Appointments API
export const appointmentApi = {
  async getAppointments() {
    const response = await api.get('/appointments')
    return response.data
  },

  async getAppointment(id) {
    const response = await api.get(`/appointments/${id}`)
    return response.data
  },

  async createAppointment(appointmentData) {
    const response = await api.post('/appointments', appointmentData)
    return response.data
  },

  async updateAppointment(id, appointmentData) {
    const response = await api.put(`/appointments/${id}`, appointmentData)
    return response.data
  },

  async deleteAppointment(id) {
    const response = await api.delete(`/appointments/${id}`)
    return response.data
  },

  async getCustomerAppointments() {
    const response = await api.get('/customer/appointments')
    return response.data
  }
}

// Payments API
export const paymentApi = {
  async getPayments() {
    const response = await api.get('/payments')
    return response.data
  },

  async getPayment(id) {
    const response = await api.get(`/payments/${id}`)
    return response.data
  },

  async updatePayment(id, paymentData) {
    const response = await api.put(`/payments/${id}`, paymentData)
    return response.data
  },

  async createCheckout(checkoutData) {
    const response = await api.post('/payments/create-checkout', checkoutData)
    return response.data
  },

  async checkPaymentStatus(paymentId) {
    const response = await api.get(`/payments/status/${paymentId}`)
    return response.data
  }
}

// Utility function for image URLs
export const getImageUrl = (imagePath) => {
  if (!imagePath) return ''
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath
  }
  
  // Remove any leading slashes
  const cleanPath = imagePath.replace(/^\/+/, '')
  
  // Handle different image path formats
  if (cleanPath.startsWith('storage/')) {
    // Already has storage prefix: storage/service_images/filename.jpg
    return `https://gowashapp.online/${cleanPath}`
  } else if (cleanPath.startsWith('service_images/')) {
    // Just service_images prefix: service_images/filename.jpg
    return `https://gowashapp.online/storage/${cleanPath}`
  } else if (cleanPath.startsWith('service-images/')) {
    // ServiceTypeController stores in service-images directory
    return `https://gowashapp.online/storage/${cleanPath}`
  } else if (cleanPath.startsWith('serviceTypeImages/')) {
    // serviceTypeImages prefix
    return `https://gowashapp.online/storage/${cleanPath}`
  } else if (cleanPath.startsWith('services-images/')) {
    // services-images prefix
    return `https://gowashapp.online/storage/${cleanPath}`
  } else {
    // Default case - assume it needs storage prefix
    return `https://gowashapp.online/storage/${cleanPath}`
  }
}

export default api
