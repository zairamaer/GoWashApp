<template>
  <div class="customer-book">
    <div class="book-header">
      <h1>Book Your Car Wash</h1>
      <p>Select a service and schedule your appointment</p>
    </div>

    <div class="booking-container">
      <div class="booking-form">
        <h2>Service Selection</h2>
        
        <!-- Filters Section -->
        <div v-if="!loading && !error" class="filters-section">
          <div class="filter-group">
            <label class="filter-label">Filter by Vehicle Type:</label>
            <div class="vehicle-filters">
              <button 
                v-for="vehicleType in availableVehicleTypes" 
                :key="`vehicle-${vehicleType.code}`"
                @click="filterByVehicleType(vehicleType.code)"
                class="filter-btn"
                :class="{ active: activeVehicleFilter === vehicleType.code }"
              >
                {{ getVehicleDisplayName(vehicleType.description) }}
              </button>
            </div>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">Sort by:</label>
            <select v-model="sortBy" @change="sortServices" class="sort-select">
              <option value="name">Name (A-Z)</option>
              <option value="price-low">Price (Low to High)</option>
              <option value="price-high">Price (High to Low)</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">Price Range:</label>
            <div class="price-range">
              <input 
                type="range" 
                :min="minPrice" 
                :max="maxPrice" 
                v-model="priceFilter" 
                @input="filterByPrice"
                class="price-slider"
              />
              <div class="price-labels">
                <span>${{ minPrice }}</span>
                <span>${{ priceFilter }}</span>
                <span>${{ maxPrice }}</span>
              </div>
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
            <div class="vehicle-sizes" v-if="service.vehicleSizes.length > 1">
              <small v-if="getFilteredVehicleSizes(service).length > 0">
                Available for: {{ getFilteredVehicleSizes(service).map(vs => getVehicleDisplayName(vs.description)).join(', ') }}
              </small>
              <small v-else class="no-vehicles">
                Not available for selected vehicle type
              </small>
            </div>
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
                <select v-model="bookingData.time">
                  <option value="">Choose a time</option>
                  <option v-for="time in availableTimes" :key="time" :value="time">
                    {{ time }}
                  </option>
                </select>
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
                <span>{{ getVehicleDisplayName(selectedService.vehicleSizes.find(vs => vs.code === bookingData.vehicleType)?.description || '') }}</span>
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
import { ref, computed, onMounted } from 'vue'
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
const sortBy = ref('name')
const priceFilter = ref(0)
const minPrice = ref(0)
const maxPrice = ref(1000)
const availableVehicleTypes = ref([])

const availableTimes = ref([
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
  '05:00 PM', '06:00 PM'
])

const minDate = computed(() => {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
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
      description: `${selectedService.value.name} - ${getVehicleDisplayName(selectedService.value.vehicleSizes.find(vs => vs.code === bookingData.value.vehicleType)?.description || '')}`,
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
    
    // Set price range
    const prices = allServices.value.flatMap(service => service.vehicleSizes.map(vs => vs.price))
    minPrice.value = Math.min(...prices)
    maxPrice.value = Math.max(...prices)
    priceFilter.value = maxPrice.value
    
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
    return `$${service.minPrice.toFixed(2)}`
  }
  return `$${service.minPrice.toFixed(2)} - $${service.maxPrice.toFixed(2)}`
}

const getVehicleSizePrice = (service, vehicleType) => {
  const vehicleSize = service.vehicleSizes.find(vs => 
    vs.code.toLowerCase() === vehicleType.toLowerCase() ||
    vs.description.toLowerCase().includes(vehicleType.toLowerCase())
  )
  return vehicleSize ? vehicleSize.price : service.minPrice
}

const getVehicleDisplayName = (description) => {
  // Extract just the vehicle name from descriptions like "GL Grandla/Commuter/L300"
  // or "Sedan" or "SUV" etc.
  
  // If it's a simple name like "Sedan", "SUV", "Truck", return as is
  if (['Sedan', 'SUV', 'Truck', 'Van', 'Hatchback', 'Coupe', 'Convertible'].includes(description)) {
    return description
  }
  
  // If it contains multiple vehicle names separated by "/", take the first one
  if (description.includes('/')) {
    return description.split('/')[0].trim()
  }
  
  // If it contains vehicle size codes like "S", "M", "L", "XL", "XXL", extract the main vehicle type
  const sizeCodes = ['S', 'M', 'L', 'XL', 'XXL']
  const hasSizeCode = sizeCodes.some(code => description.includes(code))
  
  if (hasSizeCode) {
    // Try to extract the main vehicle type from the description
    const words = description.split(' ')
    const vehicleTypes = ['Sedan', 'SUV', 'Truck', 'Van', 'Hatchback', 'Coupe', 'Convertible', 'Grandla', 'Commuter', 'L300']
    
    for (const word of words) {
      if (vehicleTypes.some(type => word.includes(type))) {
        return word
      }
    }
    
    // If no specific vehicle type found, return the first word
    return words[0] || description
  }
  
  // Default: return the first word or the full description if it's short
  const words = description.split(' ')
  return words.length > 2 ? words[0] : description
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
    return `$${minPrice.toFixed(2)}`
  }
  
  return `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`
}

// Filter functions
const filterByVehicleType = (vehicleCode) => {
  activeVehicleFilter.value = vehicleCode
  
  if (vehicleCode === 'all') {
    filteredServices.value = [...allServices.value]
  } else {
    filteredServices.value = allServices.value.filter(service => 
      service.vehicleSizes.some(vs => vs.code === vehicleCode)
    )
  }
  
  applyFilters()
}

const filterByPrice = () => {
  applyFilters()
}

const sortServices = () => {
  applyFilters()
}

const applyFilters = () => {
  let filtered = [...filteredServices.value]
  
  // Apply price filter
  filtered = filtered.filter(service => {
    const minServicePrice = Math.min(...service.vehicleSizes.map(vs => vs.price))
    return minServicePrice <= priceFilter.value
  })
  
  // Apply sorting
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'price-low':
        return Math.min(...a.vehicleSizes.map(vs => vs.price)) - Math.min(...b.vehicleSizes.map(vs => vs.price))
      case 'price-high':
        return Math.min(...b.vehicleSizes.map(vs => vs.price)) - Math.min(...a.vehicleSizes.map(vs => vs.price))
      default:
        return 0
    }
  })
  
  filteredServices.value = filtered
}

// Payment-related functions
const updatePaymentDetails = () => {
  // This function is called when vehicle type changes to update payment details
  // The payment summary will automatically update due to reactive data
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

onMounted(() => {
  loadServices()
})
</script>

<style scoped>
.customer-book {
  max-width: 1200px;
  margin: 0 auto;
}

.book-header {
  text-align: center;
  margin-bottom: 40px;
}

.book-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.book-header p {
  color: #6b7280;
  font-size: 1.1rem;
}

.booking-container {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.booking-form h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 30px;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.service-card {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.service-card:hover {
  border-color: #2563eb;
  transform: translateY(-2px);
}

.service-card.selected {
  border-color: #2563eb;
  background: #eff6ff;
}

.service-icon {
  font-size: 2.5rem;
  margin-bottom: 15px;
}

.service-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 10px;
}

.service-card p {
  color: #6b7280;
  margin-bottom: 15px;
  font-size: 0.9rem;
}

.service-price {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2563eb;
}

.booking-details {
  border-top: 1px solid #e5e7eb;
  padding-top: 30px;
}

.booking-details h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #2563eb;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.book-btn {
  background: #2563eb;
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 100%;
}

.book-btn:hover:not(:disabled) {
  background: #1d4ed8;
}

.book-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.book-btn .spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

.booking-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 0.875rem;
}

.error-message {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 4px;
}

/* Filters Section */
.filters-section {
  background: #f8fafc;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 30px;
  border: 1px solid #e5e7eb;
}

.filter-group {
  margin-bottom: 20px;
}

.filter-group:last-child {
  margin-bottom: 0;
}

.filter-label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
  font-size: 0.9rem;
}

.vehicle-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-btn {
  background: white;
  border: 2px solid #e5e7eb;
  color: #6b7280;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.filter-btn:hover {
  border-color: #2563eb;
  color: #2563eb;
  background: #eff6ff;
}

.filter-btn.active {
  background: #2563eb;
  border-color: #2563eb;
  color: white;
}

.sort-select {
  padding: 8px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  min-width: 200px;
}

.sort-select:focus {
  outline: none;
  border-color: #2563eb;
}

.price-range {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.price-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e5e7eb;
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
}

.price-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #2563eb;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.price-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #2563eb;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.price-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
}

.price-labels span:middle-child {
  color: #2563eb;
  font-weight: 600;
}

/* Loading and Error States */
.loading-state, .error-state {
  text-align: center;
  padding: 40px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state .error-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.retry-btn {
  background: #2563eb;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 15px;
}

.retry-btn:hover {
  background: #1d4ed8;
}

/* Service Image */
.service-image {
  width: 80px;
  height: 80px;
  margin: 0 auto 15px;
  border-radius: 8px;
  overflow: hidden;
}

.service-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.vehicle-sizes {
  margin-top: 10px;
  color: #6b7280;
  font-size: 0.8rem;
}

.vehicle-sizes .no-vehicles {
  color: #ef4444;
  font-style: italic;
}

/* Selected Service Info */
.selected-service-info {
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #2563eb;
}

.selected-service-info h4 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.selected-service-info p {
  color: #6b7280;
  margin-bottom: 15px;
}

.price-display {
  display: flex;
  align-items: center;
  gap: 10px;
}

.price-label {
  font-weight: 500;
  color: #374151;
}

.price-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2563eb;
}

/* New Payment Section Styles */
.booking-section {
  background: #f9fafb;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #e5e7eb;
}

.booking-section h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 15px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
}

.payment-section {
  background: #f0f9ff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #bae6fd;
}

.payment-section h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 15px;
}

.payment-summary {
  background: white;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
  border: 1px solid #e5e7eb;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-row.total {
  font-weight: 600;
  font-size: 1.1rem;
  color: #1f2937;
  border-top: 2px solid #e5e7eb;
  padding-top: 12px;
  margin-top: 8px;
}

.summary-row.total span:last-child {
  color: #059669;
  font-size: 1.2rem;
}

.text-muted {
  color: #9ca3af;
  font-style: italic;
}

.payment-info {
  background: white;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  text-align: center;
}

.payment-description {
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.payment-note {
  color: #6b7280;
  font-size: 0.8rem;
  margin: 0;
  line-height: 1.4;
}

.payment-icon {
  margin-right: 8px;
  font-size: 1.2rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .booking-container {
    padding: 20px;
  }
  
  .services-grid {
    grid-template-columns: 1fr;
  }
  
  .book-header h1 {
    font-size: 2rem;
  }
  
  .selected-service-info {
    padding: 15px;
  }
  
  .filters-section {
    padding: 20px;
  }
  
  .vehicle-filters {
    gap: 6px;
  }
  
  .filter-btn {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
  
  .sort-select {
    min-width: 150px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .booking-section {
    padding: 15px;
  }
  
  .payment-section {
    padding: 15px;
  }
  
  .payment-summary {
    padding: 12px;
  }
  
  .payment-logos {
    gap: 8px;
  }
  
  .payment-logo {
    height: 25px;
  }
}

@media (max-width: 480px) {
  .filters-section {
    padding: 15px;
  }
  
  .filter-group {
    margin-bottom: 15px;
  }
  
  .vehicle-filters {
    justify-content: center;
  }
  
  .filter-btn {
    padding: 6px 10px;
    font-size: 0.75rem;
  }
  
  .price-labels {
    font-size: 0.75rem;
  }
  
  .booking-section {
    padding: 12px;
  }
  
  .payment-section {
    padding: 12px;
  }
  
  .payment-summary {
    padding: 10px;
  }
  
  .summary-row {
    font-size: 0.875rem;
    padding: 6px 0;
  }
  
  .summary-row.total {
    font-size: 1rem;
  }
  
  .payment-logos {
    gap: 6px;
  }
  
  .payment-logo {
    height: 22px;
  }
  
  .payment-description {
    font-size: 0.8rem;
  }
}
</style>
