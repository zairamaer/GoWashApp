<template>
  <div class="customer-dashboard">
    <!-- Hero Section -->
    <section id="home" class="hero">
      <div class="hero-container">
        <div class="hero-content">
          <h1 class="hero-title">Welcome Back to GoWash</h1>
          <p class="hero-subtitle">Manage your car wash appointments, view service history, and book new services with ease.</p>
          <div class="hero-buttons">
            <router-link to="/customer/book" class="btn btn-primary">Book Now</router-link>
            <button @click="scrollToServices" class="btn btn-outline">View Services</button>
          </div>
        </div>
        <div class="hero-visual">
          <div class="car-container">
            <div class="car-main">🚗</div>
            <div class="wash-effects">
              <div class="bubble" style="width: 20px; height: 20px; left: 20%; animation-delay: 0s;"></div>
              <div class="bubble" style="width: 30px; height: 30px; left: 60%; animation-delay: 1s;"></div>
              <div class="bubble" style="width: 25px; height: 25px; left: 40%; animation-delay: 2s;"></div>
              <div class="bubble" style="width: 35px; height: 35px; left: 80%; animation-delay: 3s;"></div>
              <div class="water-drop" style="width: 8px; height: 12px; left: 30%; animation-delay: 0.5s;"></div>
              <div class="water-drop" style="width: 6px; height: 10px; left: 70%; animation-delay: 1.5s;"></div>
              <div class="water-drop" style="width: 10px; height: 14px; left: 50%; animation-delay: 2.5s;"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Section -->
    <section id="services" class="services">
      <div class="services-container">
        <h2 class="section-title">Our Services</h2>
        <p class="section-subtitle">Choose from our premium car wash services</p>
        
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading services...</p>
        </div>
        
        <div v-else-if="error" class="error-container">
          <p class="error-message">{{ error }}</p>
          <button @click="loadServices" class="btn btn-primary">Retry</button>
        </div>
        
        <div v-else class="services-grid">
          <div 
            v-for="service in limitedDisplayServices" 
            :key="service.serviceTypeID" 
            class="service-card"
          >
            <div class="service-image">
              <img 
                v-if="service.serviceTypeImage" 
                :src="service.serviceTypeImage" 
                :alt="service.serviceTypeName"
                @error="handleImageError"
              />
              <div v-else class="service-placeholder">
                <div class="service-icon">🚗</div>
              </div>
            </div>
            
            <div class="service-content">
              <h3 class="service-title">{{ service.serviceTypeName }}</h3>
              <p class="service-description">{{ service.serviceTypeDescription || 'Professional car wash service' }}</p>
              
              <div class="service-pricing">
                <div class="price-range">
                  <span class="price-from">Starting from</span>
                  <span class="price-amount">₱{{ service.minPrice }}</span>
                </div>
                <div v-if="service.maxPrice > service.minPrice" class="price-range-text">
                  Up to ₱{{ service.maxPrice }} for larger vehicles
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- View All Services Button -->
        <div v-if="displayServices.length > 6" class="view-all-container">
          <button @click="viewAllServices" class="btn btn-view-all">
            View All Services
          </button>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { serviceApi } from '../services/api'

// Router
const router = useRouter()

// Reactive state
const loading = ref(false)
const error = ref(null)
const serviceTypes = ref([])
const serviceRates = ref([])

// Computed property for processed services
const displayServices = computed(() => {
  return serviceTypes.value.map(serviceType => {
    // Find all rates for this service type
    const ratesForType = serviceRates.value.filter(
      rate => rate.serviceTypeID === serviceType.serviceTypeID
    )
    
    // Calculate price range
    let minPrice = 0
    let maxPrice = 0
    
    if (ratesForType.length > 0) {
      const prices = ratesForType.map(rate => parseFloat(rate.price))
      minPrice = Math.min(...prices)
      maxPrice = Math.max(...prices)
    }
    
    return {
      ...serviceType,
      minPrice: minPrice.toFixed(0),
      maxPrice: maxPrice.toFixed(0),
      rates: ratesForType
    }
  })
})

// Computed property for limited services (only first 6)
const limitedDisplayServices = computed(() => {
  return displayServices.value.slice(0, 6)
})

// Methods
const loadServices = async () => {
  loading.value = true
  error.value = null
  
  try {
    // Fetch both service types and service rates
    const [serviceTypesResponse, serviceRatesResponse] = await Promise.all([
      serviceApi.getServiceTypes(),
      serviceApi.getServiceRates()
    ])
    
    serviceTypes.value = serviceTypesResponse
    serviceRates.value = serviceRatesResponse
    
  } catch (err) {
    console.error('Error loading services:', err)
    error.value = 'Failed to load services. Please try again.'
  } finally {
    loading.value = false
  }
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}

const scrollToServices = () => {
  const servicesSection = document.getElementById('services')
  if (servicesSection) {
    servicesSection.scrollIntoView({ behavior: 'smooth' })
  }
}

const viewAllServices = () => {
  router.push('/customer/book')
}

// Lifecycle
onMounted(() => {
  loadServices()
})
</script>

<style scoped>
.customer-dashboard {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #333;
  overflow-x: hidden;
}

/* Hero Section */
.hero {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><circle cx="200" cy="200" r="100" fill="rgba(255,255,255,0.1)"/><circle cx="800" cy="300" r="150" fill="rgba(255,255,255,0.05)"/><circle cx="600" cy="700" r="120" fill="rgba(255,255,255,0.08)"/></svg>');
  animation: float 20s ease-in-out infinite;
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
  z-index: 2;
  position: relative;
}

.hero-content {
  color: white;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 20px;
  line-height: 1.1;
  background: linear-gradient(135deg, #ffffff, #e0e7ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.3rem;
  margin-bottom: 40px;
  opacity: 0.9;
  line-height: 1.6;
}

.hero-buttons {
  display: flex;
  gap: 20px;
  margin-bottom: 40px;
}

.btn {
  display: inline-block;
  padding: 15px 30px;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  background: none;
  font-size: 1rem;
}

.btn-primary {
  background: white;
  color: #2563eb;
  box-shadow: 0 8px 25px rgba(0,0,0,0.2);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 35px rgba(0,0,0,0.3);
}

.btn-outline {
  background: transparent;
  color: white;
  border-color: white;
}

.btn-outline:hover {
  background: white;
  color: #2563eb;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 0.9rem;
}

/* View All Services Button */
.btn-view-all {
  background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
  color: white;
  border: none;
  padding: 18px 40px;
  font-size: 1.1rem;
  font-weight: 700;
  border-radius: 50px;
  box-shadow: 0 10px 30px rgba(37, 99, 235, 0.3);
  position: relative;
  overflow: hidden;
}

.btn-view-all::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s ease;
}

.btn-view-all:hover::before {
  left: 100%;
}

.btn-view-all:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 40px rgba(37, 99, 235, 0.4);
}

.service-count {
  font-size: 0.9rem;
  opacity: 0.9;
  margin-left: 8px;
  font-weight: 500;
}

.view-all-container {
  text-align: center;
  margin-top: 60px;
  padding-top: 40px;
  border-top: 2px solid #e2e8f0;
}

/* Car Animation */
.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.car-container {
  position: relative;
  width: 400px;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.car-main {
  font-size: 10rem;
  animation: carFloat 3s ease-in-out infinite;
  filter: drop-shadow(0 20px 40px rgba(0,0,0,0.3));
}

.wash-effects {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.bubble {
  position: absolute;
  background: rgba(255,255,255,0.7);
  border-radius: 50%;
  animation: bubbleFloat 4s infinite;
}

.water-drop {
  position: absolute;
  background: rgba(135,206,250,0.8);
  border-radius: 50%;
  animation: dropFall 3s infinite;
}

/* Services Section */
.services {
  padding: 100px 0;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.services-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-title {
  font-size: 3rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-subtitle {
  font-size: 1.2rem;
  text-align: center;
  color: #64748b;
  margin-bottom: 60px;
}

.loading-container,
.error-container {
  text-align: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-left: 4px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

.error-message {
  color: #ef4444;
  font-size: 1.1rem;
  margin-bottom: 20px;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
  margin-top: 40px;
}

.service-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.service-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 50px rgba(0,0,0,0.15);
}

.service-image {
  height: 200px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.service-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.service-icon {
  font-size: 4rem;
  opacity: 0.8;
}

.service-content {
  padding: 30px;
}

.service-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
}

.service-description {
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 20px;
  font-size: 0.95rem;
}

.service-pricing {
  margin-bottom: 25px;
  padding: 15px;
  background: #f8fafc;
  border-radius: 12px;
}

.price-range {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 5px;
}

.price-from {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
}

.price-amount {
  font-size: 1.8rem;
  font-weight: 800;
  color: #2563eb;
}

.price-range-text {
  font-size: 0.85rem;
  color: #64748b;
  font-style: italic;
}

/* Animations */
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

@keyframes carFloat {
  0%, 100% { transform: translateY(0px) rotateY(0deg); }
  50% { transform: translateY(-15px) rotateY(5deg); }
}

@keyframes bubbleFloat {
  0% {
    bottom: -20px;
    opacity: 0;
    transform: translateX(0) scale(0);
  }
  10% {
    opacity: 1;
    transform: scale(1);
  }
  90% {
    opacity: 1;
  }
  100% {
    bottom: 100%;
    opacity: 0;
    transform: translateX(20px) scale(0.5);
  }
}

@keyframes dropFall {
  0% {
    top: -10px;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    top: 100%;
    opacity: 0;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-container {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .services-grid {
    grid-template-columns: 1fr;
  }
  
  .car-main {
    font-size: 8rem;
  }
  
  .section-title {
    font-size: 2.2rem;
  }
  
  .btn-view-all {
    padding: 15px 30px;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .car-main {
    font-size: 6rem;
  }
  
  .section-title {
    font-size: 1.8rem;
  }
  
  .services-grid {
    grid-template-columns: 1fr;
  }
  
  .view-all-container {
    margin-top: 40px;
    padding-top: 30px;
  }
}
</style>