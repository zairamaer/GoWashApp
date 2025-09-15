<template>
  <div class="customer-book">
    <div class="book-header">
      <div class="header-content">
        <div class="title-section">
          <h1>Book Your Car Wash</h1>
          <p>Select a service and schedule your appointment</p>
        </div>
      </div>
    </div>

    <div class="booking-container">
      <div class="booking-form">
        
        <!-- Filters Section -->
        <div v-if="!loading && !error" class="filters-section">
          <div class="filter-group">
            <div class="vehicle-filters">
              <button 
                v-for="vehicleType in availableVehicleTypes" 
                :key="`vehicle-${vehicleType.code}`"
                @click="filterByVehicleType(vehicleType.code)"
                class="filter-btn"
                :class="{ active: activeVehicleFilter === vehicleType.code }"
              >
                {{ vehicleType.description }}
              </button>
            </div>
          </div>
          
          
        </div>
        
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading services...</p>
        </div>
        
        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <div class="error-icon">⚠️</div>
          <p>{{ error }}</p>
          <button @click="loadServices" class="retry-btn">Try Again</button>
        </div>
        
        <!-- Services Grid -->
        <div v-else class="services-grid">
          <div v-for="service in filteredServices" :key="service.id" 
               class="service-card" 
               :class="{ selected: selectedService?.id === service.id }"
               @click="selectService(service)">
            <div class="service-image" v-if="service.image">
              <img :src="service.image" :alt="service.name" />
            </div>
            <div class="service-icon" v-else>{{ service.icon }}</div>
            <h3>{{ service.name }}</h3>
            <p>{{ service.description }}</p>
            <div class="service-price">{{ getFilteredServicePrice(service) }}</div>
          </div>
        </div>

        <div v-if="selectedService" class="booking-details">
          <h3>Booking & Payment Details</h3>
          
          <!-- Service Summary -->
          <div class="selected-service-info">
            <h4>{{ selectedService.name }}</h4>
            <p>{{ selectedService.description }}</p>
            <div class="price-display">
              <span class="price-label">Price:</span>
              <span class="price-value" v-if="bookingData.vehicleType">
                ₱{{ getVehicleSizePrice(selectedService, bookingData.vehicleType).toFixed(2) }}
              </span>
              <span class="price-value" v-else>
                {{ getServicePrice(selectedService) }}
              </span>
            </div>
          </div>

          <!-- Booking Information -->
          <div class="booking-section">
            <h4>Appointment Details</h4>
            <div class="form-row">
              <div class="form-group">
                <label>Select Date</label>
                <input type="date" v-model="bookingData.date" :min="minDate" />
              </div>
              <div class="form-group">
                <label>Select Time</label>
                <select v-model="bookingData.time" :disabled="loadingBookedTimes">
                  <option value="">Choose a time</option>
                  <option v-for="time in availableTimes" :key="time" :value="time">
                    {{ time }}
                  </option>
                </select>
                <div v-if="loadingBookedTimes" class="loading-times">
                  <small>Loading available times...</small>
                </div>
                <div v-if="bookedTimes.length > 0" class="booked-times-info">
                  <small>⚠️ Some time slots are unavailable</small>
                </div>
              </div>
            </div>
            
            
            <div class="form-group">
              <label>Special Instructions (Optional)</label>
              <textarea v-model="bookingData.instructions" 
                        placeholder="Any special requests or notes..."></textarea>
            </div>
          </div>

          <!-- Payment Section -->
          <div class="payment-section" v-if="bookingData.vehicleType">
            <h4>Payment Information</h4>
            
            <!-- Payment Summary -->
            <div class="payment-summary">
              <div class="summary-row">
                <span>Service:</span>
                <span>{{ selectedService.name }}</span>
              </div>
              <div class="summary-row">
                <span>Vehicle Type:</span>
                <span>{{ selectedService.vehicleSizes.find(vs => vs.code === bookingData.vehicleType)?.description || '' }}</span>
              </div>
              <div class="summary-row">
                <span>Date & Time:</span>
                <span v-if="bookingData.date && bookingData.time">
                  {{ formatDate(bookingData.date) }} at {{ bookingData.time }}
                </span>
                <span v-else class="text-muted">Please select date and time</span>
              </div>
              <div class="summary-row total">
                <span>Total Amount:</span>
                <span>₱{{ getVehicleSizePrice(selectedService, bookingData.vehicleType).toFixed(2) }}</span>
              </div>
            </div>

            <!-- Payment Info -->
            <div class="payment-info">
              <p class="payment-description">
                <i class="payment-icon">🔒</i>
                Secure payment powered by PayMongo
              </p>
              <p class="payment-note">
                You'll be redirected to PayMongo's secure checkout page to complete your payment using GCash, GrabPay, PayMaya, or Credit/Debit Card.
              </p>
            </div>
          </div>

          <!-- Error Display -->
          <div v-if="error" class="error-message booking-error">
            {{ error }}
          </div>

          <!-- Book & Pay Button -->
          <button @click="bookAppointment" class="book-btn" :disabled="!canBook || loading">
            <span v-if="loading" class="spinner"></span>
            <span v-if="!loading">
              <i class="payment-icon">💳</i>
              Book & Pay Now - ₱{{ bookingData.vehicleType ? getVehicleSizePrice(selectedService, bookingData.vehicleType).toFixed(2) : selectedService.minPrice.toFixed(2) }}
            </span>
            <span v-else>Processing Payment...</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { serviceApi, appointmentApi, paymentApi } from '../services/api'

const selectedService = ref(null)
const loading = ref(false)
const error = ref('')
const bookingData = ref({
  date: '',
  time: '',
  vehicleType: '',
  instructions: ''
})

const availableServices = ref([])
const filteredServices = ref([])
const serviceRates = ref([])
const allServices = ref([])

// Filter states
const activeVehicleFilter = ref('all')
const availableVehicleTypes = ref([])

const allAvailableTimes = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
  '05:00 PM', '06:00 PM'
]

const bookedTimes = ref([])
const loadingBookedTimes = ref(false)

const minDate = computed(() => {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
})

const availableTimes = computed(() => {
  return allAvailableTimes.filter(time => !bookedTimes.value.includes(time))
})

const canBook = computed(() => {
  return selectedService.value && 
         bookingData.value.date && 
         bookingData.value.time && 
         bookingData.value.vehicleType
})

const selectService = (service) => {
  selectedService.value = service
  
  // Auto-set vehicle type based on active filter or first available vehicle size
  if (activeVehicleFilter.value !== 'all') {
    // Use the active vehicle filter
    const matchingVehicleSize = service.vehicleSizes.find(vs => vs.code === activeVehicleFilter.value)
    if (matchingVehicleSize) {
      bookingData.value.vehicleType = matchingVehicleSize.code
    }
  } else {
    // Use the first available vehicle size
    if (service.vehicleSizes.length > 0) {
      bookingData.value.vehicleType = service.vehicleSizes[0].code
    }
  }
}

// Utility function to convert 12-hour time format to 24-hour format
const convertTo24Hour = (time12h) => {
  const [time, modifier] = time12h.split(' ')
  let [hours, minutes] = time.split(':')
  
  if (hours === '12') {
    hours = modifier === 'AM' ? '00' : '12'
  } else if (modifier === 'PM') {
    hours = parseInt(hours, 10) + 12
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes}`
}

const bookAppointment = async () => {
  if (!canBook.value) return
  
  loading.value = true
  error.value = ''
  
  try {
    // Get customer data from localStorage
    const customerData = JSON.parse(localStorage.getItem('customer_user') || '{}')
    const customerId = customerData.id
    
    if (!customerId) {
      error.value = 'Please log in to book an appointment'
      return
    }
    
    // Calculate the final price
    const finalPrice = getVehicleSizePrice(selectedService.value, bookingData.value.vehicleType)
    
    // Find the service rate ID for the selected service and vehicle type
    const selectedServiceRate = selectedService.value.rates.find(rate => 
      rate.vehicle_size.vehicleSizeCode === bookingData.value.vehicleType
    )
    
    if (!selectedServiceRate) {
      error.value = 'Selected vehicle type is not available for this service'
      return
    }
    
    // Create appointment first
    const appointmentData = {
      customerID: customerId,
      serviceRateID: selectedServiceRate.serviceRateID,
      appointmentDateTime: `${bookingData.value.date} ${convertTo24Hour(bookingData.value.time)}:00`,
      status: 'pending' // Will be updated to 'confirmed' after payment
    }
    
    console.log('Creating appointment:', appointmentData)
    const appointmentResponse = await appointmentApi.createAppointment(appointmentData)
    const appointmentId = appointmentResponse.appointmentID
    
    // Create PayMongo checkout session
    const checkoutData = {
      appointmentID: appointmentId,
      amount: finalPrice,
      description: `${selectedService.value.name} - ${selectedService.value.vehicleSizes.find(vs => vs.code === bookingData.value.vehicleType)?.description || ''}`,
      success_url: `${window.location.origin}/customer/appointments?payment=success&appointment=${appointmentId}`,
      cancel_url: `${window.location.origin}/customer/book?payment=cancelled&appointment=${appointmentId}`
    }
    
    console.log('Creating checkout session:', checkoutData)
    const checkoutResponse = await paymentApi.createCheckout(checkoutData)
    
    if (checkoutResponse.success && checkoutResponse.checkout_url) {
      // Redirect to PayMongo checkout
      window.location.href = checkoutResponse.checkout_url
    } else {
      throw new Error('Failed to create payment session')
    }
    
  } catch (err) {
    console.error('Error booking appointment:', err)
    error.value = err.response?.data?.message || 'Failed to book appointment. Please try again.'
  } finally {
    loading.value = false
  }
}

const loadServices = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await serviceApi.getServiceRates()
    serviceRates.value = response
    
    // Group services by service type and create unique services
    const servicesMap = new Map()
    
    response.forEach(rate => {
      const serviceType = rate.service_type
      const vehicleSize = rate.vehicle_size
      
      if (!servicesMap.has(serviceType.serviceTypeID)) {
        servicesMap.set(serviceType.serviceTypeID, {
          id: serviceType.serviceTypeID,
          name: serviceType.serviceTypeName,
          description: serviceType.serviceTypeDescription,
          image: serviceType.serviceTypeImage,
          icon: getServiceIcon(serviceType.serviceTypeName),
          minPrice: parseFloat(rate.price),
          maxPrice: parseFloat(rate.price),
          vehicleSizes: [],
          rates: []
        })
      }
      
      const service = servicesMap.get(serviceType.serviceTypeID)
      const price = parseFloat(rate.price)
      
      // Update min/max prices
      if (price < service.minPrice) service.minPrice = price
      if (price > service.maxPrice) service.maxPrice = price
      
      // Add vehicle size info
      service.vehicleSizes.push({
        code: vehicleSize.vehicleSizeCode,
        description: vehicleSize.vehicleSizeDescription,
        price: price
      })
      
      service.rates.push(rate)
    })
    
    // Convert map to array and sort by name
    allServices.value = Array.from(servicesMap.values()).sort((a, b) => a.name.localeCompare(b.name))
    availableServices.value = [...allServices.value]
    filteredServices.value = [...allServices.value]
    
    // Extract unique vehicle types
    const vehicleTypesMap = new Map()
    response.forEach(rate => {
      const vehicleSize = rate.vehicle_size
      if (!vehicleTypesMap.has(vehicleSize.vehicleSizeCode)) {
        vehicleTypesMap.set(vehicleSize.vehicleSizeCode, {
          code: vehicleSize.vehicleSizeCode,
          description: vehicleSize.vehicleSizeDescription
        })
      }
    })
    availableVehicleTypes.value = Array.from(vehicleTypesMap.values())
    
  } catch (err) {
    console.error('Error loading services:', err)
    error.value = 'Failed to load services. Please try again.'
  } finally {
    loading.value = false
  }
}

const getServiceIcon = (serviceName) => {
  const name = serviceName.toLowerCase()
  if (name.includes('wash')) return '🚿'
  if (name.includes('premium') || name.includes('deluxe')) return '✨'
  if (name.includes('basic')) return '🧽'
  if (name.includes('detail')) return '🏆'
  if (name.includes('wax')) return '✨'
  return '🚗'
}

const getServicePrice = (service) => {
  if (service.minPrice === service.maxPrice) {
    return `P${service.minPrice.toFixed(2)}`
  }
  return `P${service.minPrice.toFixed(2)} - P${service.maxPrice.toFixed(2)}`
}

const getVehicleSizePrice = (service, vehicleType) => {
  const vehicleSize = service.vehicleSizes.find(vs => 
    vs.code.toLowerCase() === vehicleType.toLowerCase() ||
    vs.description.toLowerCase().includes(vehicleType.toLowerCase())
  )
  return vehicleSize ? vehicleSize.price : service.minPrice
}


const getFilteredVehicleSizes = (service) => {
  // If no filter is active or "all" is selected, show all vehicle sizes
  if (activeVehicleFilter.value === 'all') {
    return service.vehicleSizes
  }
  
  // Filter vehicle sizes based on the active filter
  return service.vehicleSizes.filter(vs => vs.code === activeVehicleFilter.value)
}

const getFilteredServicePrice = (service) => {
  const filteredSizes = getFilteredVehicleSizes(service)
  
  if (filteredSizes.length === 0) {
    return getServicePrice(service)
  }
  
  const prices = filteredSizes.map(vs => vs.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  
  if (minPrice === maxPrice) {
    return `₱${minPrice.toFixed(2)}`
  }
  
  return `₱${minPrice.toFixed(2)} - ₱${maxPrice.toFixed(2)}`
}

// Filter functions
const filterByVehicleType = (vehicleCode) => {
  activeVehicleFilter.value = vehicleCode
  applyFilters()
}



const applyFilters = () => {
  // Get the base filtered services (after vehicle type filtering)
  if (activeVehicleFilter.value === 'all') {
    filteredServices.value = [...allServices.value]
  } else {
    filteredServices.value = allServices.value.filter(service => 
      service.vehicleSizes.some(vs => vs.code === activeVehicleFilter.value)
    )
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}


// Function to convert 24-hour time to 12-hour format
const convertTo12Hour = (time24h) => {
  const [hours, minutes] = time24h.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  
  // Format with leading zero to match dropdown format
  return `${displayHour.toString().padStart(2, '0')}:${minutes} ${ampm}`
}

// Function to fetch booked times for a specific date
const fetchBookedTimes = async (date) => {
  if (!date) {
    bookedTimes.value = []
    return
  }
  
  loadingBookedTimes.value = true
  
  try {
    const appointments = await appointmentApi.getAppointmentsByDate(date)
    
    // Filter confirmed appointments and extract times
    const confirmedAppointments = appointments.filter(app => app.status === 'confirmed')
    const bookedTimeSlots = confirmedAppointments.map(app => {
      // Extract time from appointmentDateTime (format: "2025-09-26 18:00:00")
      const time24h = app.appointmentDateTime.split(' ')[1].substring(0, 5) // Get "18:00"
      return convertTo12Hour(time24h)
    })
    
    bookedTimes.value = bookedTimeSlots
    
    // Clear selected time if it's now booked
    if (bookingData.value.time && bookedTimeSlots.includes(bookingData.value.time)) {
      bookingData.value.time = ''
    }
    
  } catch (err) {
    console.error('Error fetching booked times:', err)
    // Don't show error to user, just log it and continue
    bookedTimes.value = []
  } finally {
    loadingBookedTimes.value = false
  }
}

// Watch for date changes to fetch booked times
watch(() => bookingData.value.date, (newDate) => {
  fetchBookedTimes(newDate)
})

onMounted(() => {
  loadServices()
})
</script>

<style scoped>
.customer-book {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  min-height: 100vh;
  padding: 2rem 1rem;
}

.book-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 3rem 2.5rem;
  position: relative;
  overflow: hidden;
  text-align: center;
  margin-bottom: 3rem;
  border: 3px solid white;  
  border-radius: 1rem;      
}

.book-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
 background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><circle cx="200" cy="200" r="100" fill="rgba(255,255,255,0.1)"/><circle cx="800" cy="300" r="150" fill="rgba(255,255,255,0.05)"/><circle cx="600" cy="700" r="120" fill="rgba(255,255,255,0.08)"/></svg>');
  opacity: 0.3;
  border-radius: 1rem;
}

.book-header .header-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.book-header h1 {
  font-size: 3.5rem;
  font-weight: 900;
  color: white;
  margin: 0 0 0.75rem 0;
  text-shadow: 0 4px 20px rgba(0,0,0,0.3);
  letter-spacing: -0.02em;
}

.book-header p {
  color: rgba(255, 255, 255, 0.95);
  font-size: 1.3rem;
  font-weight: 400;
  margin: 0;
  opacity: 0.9;
}


.booking-container {
  max-width: 3000px;
  margin: 0 auto;
  background: white;
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
}

/* Modern Services Grid */
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.service-card {
  background: white;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
}

.service-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.service-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #667eea;
}

.service-card:hover::before {
  opacity: 1;
}

.service-card.selected {
  border-color: #667eea;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
}

.service-card.selected::before {
  opacity: 1;
}

/* Service Image - Perfect Integration */
.service-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  position: relative;
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
}

.service-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.service-card:hover .service-image img {
  transform: scale(1.05);
}

/* Service Icon - Clean & Modern */
.service-icon {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  color: #64748b;
  transition: all 0.3s ease;
}

.service-card:hover .service-icon {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.service-card.selected .service-icon {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

/* Card Content */
.service-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 1.5rem 1.5rem 0.75rem;
  line-height: 1.3;
}

.service-card p {
  color: #64748b;
  margin: 0 1.5rem 1rem;
  font-size: 0.95rem;
  line-height: 1.5;
}

.service-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
  margin: 0 1.5rem 1.5rem;
  display: block;
}

/* Improved Filters Section - Simple & Appealing */
.filters-section {
  background: linear-gradient(135deg, #ffffff, #f8fafc);
  padding: 2rem;
  border-radius: 16px;
  margin-bottom: 2.5rem;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.filter-group {
  text-align: center;
}

.filter-label {
  display: block;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1.5rem;
  font-size: 1.125rem;
  letter-spacing: -0.02em;
}

.vehicle-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  align-items: center;
}

.filter-btn {
  background: white;
  border: 2px solid #e2e8f0;
  color: #475569;
  padding: 0.875rem 1.75rem;
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  letter-spacing: 0.01em;
  min-width: 120px;
  text-align: center;
}

.filter-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  transition: left 0.5s ease;
}

.filter-btn:hover {
  border-color: #667eea;
  color: #667eea;
  background: #f8fafc;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.15);
}

.filter-btn:hover::before {
  left: 100%;
}

.filter-btn.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-color: #667eea;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.filter-btn.active::before {
  display: none;
}

/* Booking Details */
.booking-details {
  border-top: 1px solid #e2e8f0;
  padding-top: 2rem;
  margin-top: 2rem;
}

.booking-details h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1.5rem;
  text-align: center;
}

.selected-service-info {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  border-left: 4px solid #667eea;
}

.selected-service-info h4 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.selected-service-info p {
  color: #64748b;
  margin-bottom: 1rem;
}

.price-display {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.price-label {
  font-weight: 500;
  color: #475569;
}

.price-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
}

/* Form Sections */
.booking-section {
  background: #fafbfc;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  border: 1px solid #e2e8f0;
}

.booking-section h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  background: white;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

/* Payment Section */
.payment-section {
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  border: 1px solid #bae6fd;
}

.payment-section h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
}

.payment-summary {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-row.total {
  font-weight: 600;
  font-size: 1.125rem;
  color: #1e293b;
  border-top: 2px solid #e5e7eb;
  padding-top: 0.75rem;
  margin-top: 0.5rem;
}

.summary-row.total span:last-child {
  color: #059669;
  font-size: 1.25rem;
}

.text-muted {
  color: #9ca3af;
  font-style: italic;
}

.payment-info {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  text-align: center;
}

.payment-description {
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.payment-note {
  color: #6b7280;
  font-size: 0.8rem;
  margin: 0;
  line-height: 1.4;
}

/* Buttons */
.book-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.book-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.book-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.retry-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

/* Loading and Error States */
.loading-state, .error-state {
  text-align: center;
  padding: 3rem 1rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f1f5f9;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.book-btn .spinner {
  width: 20px;
  height: 20px;
  border-width: 2px;
}

.error-state .error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.loading-times {
  margin-top: 0.25rem;
  color: #6b7280;
  font-style: italic;
  font-size: 0.875rem;
}

.booked-times-info {
  margin-top: 0.25rem;
  color: #f59e0b;
  font-size: 0.8rem;
}

.booking-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.error-message {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.payment-icon {
  font-size: 1.2rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .customer-book {
    padding: 1rem 0.5rem;
  }

  .booking-container {
    padding: 1.5rem;
    border-radius: 16px;
  }
  
  .book-header h1 {
    font-size: 2.5rem;
  }
  
  .services-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .service-image,
  .service-icon {
    height: 160px;
  }
  
  .service-icon {
    font-size: 3rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  /* Improved Filters - Mobile */
  .filters-section {
    padding: 1.5rem;
  }
  
  .filter-label {
    font-size: 1rem;
    margin-bottom: 1.25rem;
  }
  
  .vehicle-filters {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
  }
  
  .filter-btn {
    padding: 1rem 1.5rem;
    min-width: auto;
    width: 100%;
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .book-header h1 {
    font-size: 2rem;
  }
  
  .book-header p {
    font-size: 1rem;
  }
  
  .booking-container {
    padding: 1rem;
  }
  
  .service-image,
  .service-icon {
    height: 140px;
  }
  
  .service-icon {
    font-size: 2.5rem;
  }
  
  .service-card h3 {
    font-size: 1.125rem;
    margin: 1rem 1rem 0.5rem;
  }
  
  .service-card p {
    font-size: 0.875rem;
    margin: 0 1rem 0.75rem;
  }
  
  .service-price {
    font-size: 1.375rem;
    margin: 0 1rem 1.25rem;
  }
  
  .filters-section {
    padding: 1.25rem;
  }
  
  .filter-label {
    font-size: 0.95rem;
    margin-bottom: 1rem;
  }
  
  .filter-btn {
    padding: 0.875rem 1.25rem;
    font-size: 0.875rem;
  }
}
</style>