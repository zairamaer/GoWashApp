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

// Response interceptor - FIXED VERSION
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, response.status, response.data)
    return response
  },
  (error) => {
    console.error('API Error:', error.config?.url, error.response?.status, error.response?.data)
    
    if (error.response?.status === 401) {
      // Check if this is a login attempt (don't redirect on login failures)
      const isLoginAttempt = error.config?.url?.includes('/login')
      
      if (!isLoginAttempt) {
        // Only redirect if NOT a login attempt (i.e., authenticated user's token expired)
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
        localStorage.removeItem('customer_token')
        localStorage.removeItem('customer_user')
        
        // Use Vue Router instead of window.location to prevent refresh
        const currentPath = window.location.pathname
        if (currentPath.startsWith('/admin')) {
          // Import router dynamically to avoid circular dependencies
          import('../router').then(({ default: router }) => {
            router.push('/admin/login')
          })
        } else if (currentPath.startsWith('/customer')) {
          import('../router').then(({ default: router }) => {
            router.push('/customer/login')
          })
        }
      }
      // For login attempts, just let the error pass through to the component
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

// Customer API
export const customerApi = {
  // Get all customers
  async getCustomers() {
    const response = await api.get('/customers')
    // Handle the data wrapper - the API returns { data: [...] }
    return response.data.data || response.data
  },

  // Get a specific customer by ID
  async getCustomer(id) {
    const response = await api.get(`/customers/${id}`)
    return response.data
  },

  // Update customer information
  async updateCustomer(id, customerData) {
    const response = await api.put(`/customers/${id}`, customerData)
    return response.data
  },

  // Get customer with appointments by customer ID
  async getCustomerWithAppointments(customerId) {
    // First try the individual customer endpoint
    try {
      const response = await api.get(`/customers/${customerId}`)
      console.log('Individual customer API response:', response.data)
      // Handle the data wrapper if it exists
      return response.data.data || response.data
    } catch (error) {
      // If individual endpoint fails, get all customers and filter
      console.log('Individual customer endpoint failed, using all customers endpoint')
      const allCustomers = await this.getCustomers()
      const customer = allCustomers.find(c => c.id == customerId)
      if (!customer) {
        throw new Error('Customer not found')
      }
      return customer
    }
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
  },

  async getAppointmentsByDate(date) {
    // Since there's no specific date endpoint, get all appointments and filter on frontend
    const response = await api.get('/appointments')
    const allAppointments = response.data
    
    // Filter appointments for the specific date
    const appointmentsForDate = allAppointments.filter(appointment => {
      const appointmentDate = appointment.appointmentDateTime.split(' ')[0] // Get date part
      return appointmentDate === date
    })
    
    return appointmentsForDate
  },

  async getAppointmentsGroupedByCustomer() {
    const response = await api.get('/appointments')
    const allAppointments = response.data
    
    // Group appointments by customer
    const groupedByCustomer = {}
    
    allAppointments.forEach(appointment => {
      const customerId = appointment.customerID
      const customer = appointment.customer
      
      if (!groupedByCustomer[customerId]) {
        groupedByCustomer[customerId] = {
          customer: customer,
          appointments: [],
          nearestAppointment: null,
          appointmentCount: 0
        }
      }
      
      // Only include confirmed and completed appointments
      if (appointment.status === 'confirmed' || appointment.status === 'completed') {
        groupedByCustomer[customerId].appointments.push(appointment)
        groupedByCustomer[customerId].appointmentCount++
        
        // Find nearest appointment
        const appointmentDate = new Date(appointment.appointmentDateTime)
        if (!groupedByCustomer[customerId].nearestAppointment || 
            appointmentDate < new Date(groupedByCustomer[customerId].nearestAppointment.appointmentDateTime)) {
          groupedByCustomer[customerId].nearestAppointment = appointment
        }
      }
    })
    
    // Convert to array and sort by nearest appointment date
    const customersWithAppointments = Object.values(groupedByCustomer)
      .filter(customerGroup => customerGroup.appointmentCount > 0)
      .sort((a, b) => {
        if (!a.nearestAppointment && !b.nearestAppointment) return 0
        if (!a.nearestAppointment) return 1
        if (!b.nearestAppointment) return -1
        return new Date(a.nearestAppointment.appointmentDateTime) - new Date(b.nearestAppointment.appointmentDateTime)
      })
    
    return customersWithAppointments
  },

  async getConfirmedAppointments() {
    const response = await api.get('/appointments')
    const allAppointments = response.data
    
    // Filter to only confirmed appointments and sort by date
    const confirmedAppointments = allAppointments
      .filter(appointment => appointment.status === 'confirmed')
      .sort((a, b) => new Date(a.appointmentDateTime) - new Date(b.appointmentDateTime))
    
    return confirmedAppointments
  }
}

// Payments API - Enhanced with status updates
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
  },

  // Get payment by appointment ID using existing payments endpoint
  async getPaymentByAppointment(appointmentId) {
    try {
      const response = await api.get('/payments')
      const allPayments = response.data.data || response.data
      const payment = allPayments.find(p => p.appointmentID == appointmentId)
      return payment || null
    } catch (error) {
      console.error('Error fetching payment by appointment:', error)
      return null
    }
  },

  // Update payment status to paid (called by webhook or success handler)
  async markPaymentAsPaid(paymentId, transactionData = {}) {
    const paymentData = {
      status: 'paid',
      paymentDateTime: new Date().toISOString(),
      ...transactionData
    }
    
    try {
      const response = await api.put(`/payments/${paymentId}`, paymentData)
      console.log('Payment marked as paid:', response.data)
      return response.data
    } catch (error) {
      console.error('Error marking payment as paid:', error)
      throw error
    }
  },

  // Update payment status to failed
  async markPaymentAsFailed(paymentId, errorReason = '') {
    const paymentData = {
      status: 'failed',
      error_reason: errorReason,
      paymentDateTime: new Date().toISOString()
    }
    
    try {
      const response = await api.put(`/payments/${paymentId}`, paymentData)
      console.log('Payment marked as failed:', response.data)
      return response.data
    } catch (error) {
      console.error('Error marking payment as failed:', error)
      throw error
    }
  },

  // Get payment status for appointment
  async getAppointmentPaymentStatus(appointmentId) {
    try {
      const payment = await this.getPaymentByAppointment(appointmentId)
      return payment ? payment.status : 'pending'
    } catch (error) {
      console.error('Error getting payment status for appointment:', error)
      return 'pending'
    }
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
