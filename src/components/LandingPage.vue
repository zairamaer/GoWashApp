<template>
  <div class="landing-page">
    <!-- Navigation -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-logo">
          <img src="../assets/car.png" alt="GoWash Logo" class="nav-logo-image">
          <span class="nav-logo-text">GoWash</span>
        </div>
        <div class="nav-menu">
          <a href="#home" class="nav-link">Home</a>
          <a href="#services" class="nav-link">Services</a>
          <a href="#about" class="nav-link">About</a>
          <a href="#contact" class="nav-link">Contact</a>
          <router-link to="/customer/login" class="nav-link">Login</router-link>
          <router-link to="/customer/register" class="nav-link btn">Get Started</router-link>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section id="home" class="hero">
      <div class="hero-container">
        <div class="hero-content">
          <h1 class="hero-title">Keep your Clean Cars Always</h1>
          <p class="hero-subtitle">Experience premium car wash services with professional care. Book your appointment online and enjoy spotless results every time.</p>
          <div class="hero-buttons">
            <router-link to="/customer/register" class="btn btn-primary">Book Now</router-link>
            <a href="#services" class="btn btn-outline" @click="scrollToServices">Our Services</a>
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
      <div class="container">
        <h2 class="section-title">Our Services</h2>
        <p class="section-subtitle">
          Professional car wash services tailored to your vehicle's needs
        </p>
        <div class="services-grid">
          <!-- Loading State -->
          <div v-if="loading" class="loading">
            <div class="spinner"></div>
            <p>Loading services...</p>
          </div>
          
          <!-- Error State -->
          <div v-else-if="error" class="error">
            <h3>Unable to load services</h3>
            <p>{{ error }}</p>
            <button @click="loadServices" class="btn btn-primary">Try Again</button>
          </div>
          
          <!-- Services Preview List -->
          <div v-else-if="previewServices.length > 0" class="services-container">
            <div v-for="service in previewServices" :key="service.serviceTypeID" class="service-card">
              <img 
                v-if="getImageUrl(service.serviceTypeImage)" 
                :src="getImageUrl(service.serviceTypeImage)" 
                :alt="service.serviceTypeName" 
                class="service-image"
                @error="handleImageError"
              >
              <div v-else class="service-icon">🚿</div>
              
              <h3>{{ service.serviceTypeName }}</h3>
              <p>{{ service.serviceTypeDescription || 'Professional car wash service tailored to your needs.' }}</p>
              <div class="service-price">
                Starting at ${{ getMinPrice(service.serviceTypeID) }}
              </div>
            </div>
          </div>
          
          <!-- No Services State -->
          <div v-else class="no-services">
            <h3>No services available</h3>
            <p>Please check back later.</p>
          </div>
        </div>
        
        <!-- Show "View All Services" button if there are more services -->
        <div v-if="services.length > maxPreviewServices" class="services-footer">
          <router-link to="/services" class="btn btn-outline">
            View All Services ({{ services.length }})
          </router-link>
        </div>
      </div>
    </section>

    <!-- Quality Section -->
    <section class="quality">
      <div class="container">
        <div class="quality-content">
          <h2>We're Providing Best Quality Service</h2>
          <p>Our experienced team uses premium products and advanced techniques to ensure your vehicle receives the finest care possible. We're committed to excellence in every wash.</p>
          <router-link to="/customer/register" class="btn btn-primary">Experience Quality</router-link>
        </div>
      </div>
    </section>

    <!-- Why Choose Us Section -->
    <section class="features">
      <div class="container">
        <h2 class="section-title">Why Choose Us?</h2>
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon">⚡</div>
            <h3>Express Service</h3>
            <p>Quick and efficient service that respects your valuable time</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🛡️</div>
            <h3>Quality Guarantee</h3>
            <p>100% satisfaction guaranteed with premium products and techniques</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">💰</div>
            <h3>Affordable Pricing</h3>
            <p>Competitive rates for professional-grade car wash services</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📱</div>
            <h3>Easy Booking</h3>
            <p>Book your appointment online in just a few simple clicks</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="container">
        <h2>Ready to Get Your Car Washed?</h2>
        <p>Join thousands of satisfied customers and book your appointment today!</p>
        <div class="cta-buttons">
          <router-link to="/customer/register" class="btn btn-primary">Book Appointment</router-link>
          <router-link to="/customer/login" class="btn btn-outline">Customer Login</router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, computed } from 'vue'
import { serviceApi, getImageUrl } from '../services/api'

// Reactive data
const services = ref([])
const serviceRates = ref([])
const loading = ref(true)
const error = ref(null)
const maxPreviewServices = ref(3) // Show only 3 services as preview

// Computed properties
const hasServices = computed(() => services.value.length > 0)
const previewServices = computed(() => {
  return services.value.slice(0, maxPreviewServices.value)
})

// Methods
const loadServices = async () => {
  loading.value = true
  error.value = null
  
  try {
    console.log('Fetching services from API...')
    
    // Fetch both service types and service rates
    const [serviceTypesResponse, serviceRatesResponse] = await Promise.all([
      serviceApi.getServiceTypes(),
      serviceApi.getServiceRates()
    ])
    
    console.log('Service Types Response:', serviceTypesResponse)
    console.log('Service Rates Response:', serviceRatesResponse)
    
    // Handle different response structures
    services.value = serviceTypesResponse.data || serviceTypesResponse || []
    serviceRates.value = serviceRatesResponse.data || serviceRatesResponse || []
    
    if (!Array.isArray(services.value)) {
      services.value = []
    }
    
    if (!Array.isArray(serviceRates.value)) {
      serviceRates.value = []
    }
    
    console.log('Processed Services:', services.value)
    console.log('Processed Service Rates:', serviceRates.value)
    
    if (services.value.length === 0) {
      error.value = 'No services available at the moment.'
    }
    
  } catch (err) {
    console.error('Error loading services:', err)
    error.value = err.response?.data?.message || 'Failed to load services. Please try again later.'
  } finally {
    loading.value = false
  }
}

const getMinPrice = (serviceTypeID) => {
  // Find all rates for this service type
  const serviceRatesForType = serviceRates.value.filter(rate => 
    rate.serviceTypeID == serviceTypeID
  )
  
  if (serviceRatesForType.length === 0) {
    return 'Contact Us'
  }
  
  // Get the minimum price
  const minPrice = Math.min(...serviceRatesForType.map(rate => 
    parseFloat(rate.price) || 0
  ))
  
  return minPrice > 0 ? minPrice.toFixed(2) : 'Contact Us'
}

const handleImageError = (event) => {
  // Hide the image and show the icon instead
  event.target.style.display = 'none'
  const serviceIcon = event.target.parentElement.querySelector('.service-icon')
  if (serviceIcon) {
    serviceIcon.style.display = 'block'
  }
}

const scrollToServices = (event) => {
  event.preventDefault()
  const servicesSection = document.getElementById('services')
  if (servicesSection) {
    servicesSection.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }
}

let scrollHandler

const setupScrollEffects = () => {
  // Navbar scroll effect
  scrollHandler = () => {
    const navbar = document.querySelector('.navbar')
    if (!navbar) return
    
    if (window.scrollY > 100) {
      navbar.style.background = 'rgba(255, 255, 255, 0.98)'
      navbar.style.backdropFilter = 'blur(15px)'
    } else {
      navbar.style.background = 'rgba(255, 255, 255, 0.95)'
      navbar.style.backdropFilter = 'blur(10px)'
    }
  }
  
  window.addEventListener('scroll', scrollHandler)
  
  // Smooth scrolling for anchor links
  const navLinks = document.querySelectorAll('a[href^="#"]')
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault()
      const targetId = link.getAttribute('href')
      const targetElement = document.querySelector(targetId)
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }
    })
  })
}

// Lifecycle hooks
onMounted(() => {
  loadServices()
  setupScrollEffects()
})

onBeforeUnmount(() => {
  // Clean up event listeners
  if (scrollHandler) {
    window.removeEventListener('scroll', scrollHandler)
  }
})

// Expose methods and data to template
defineExpose({
  loadServices,
  getImageUrl,
  getMinPrice,
  handleImageError,
  scrollToServices,
  services,
  serviceRates,
  loading,
  error,
  hasServices
})
</script>

<style scoped>
.landing-page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #333;
  overflow-x: hidden;
}

/* Navigation */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 20px rgba(0,0,0,0.1);
  z-index: 1000;
  transition: all 0.3s ease;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.8rem;
  font-weight: 700;
}

.nav-logo-image {
  width: 32px;
  height: 32px;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.nav-logo:hover .nav-logo-image {
  transform: scale(1.1) rotate(5deg);
}

.nav-logo-text {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 30px;
}

.nav-link {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
}

.nav-link:hover {
  color: #2563eb;
}

.nav-link.btn {
  padding: 8px 20px;
  border-radius: 25px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: white !important;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
  transform: translateY(0);
}

.nav-link.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
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
  font-size: 4rem;
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
  font-size: 12rem;
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
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-title {
  text-align: center;
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #1f2937, #4b5563);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-subtitle {
  text-align: center;
  color: #6b7280;
  font-size: 1.1rem;
  margin-bottom: 60px;
}

.services-grid {
  margin-top: 60px;
}

.services-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
}

.service-card {
  background: white;
  border-radius: 20px;
  padding: 40px 30px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0,0,0,0.08);
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.05);
}

.service-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  transform: scaleX(0);
  transition: transform 0.4s ease;
}

.service-card:hover::before {
  transform: scaleX(1);
}

.service-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 25px 60px rgba(0,0,0,0.15);
}

.service-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 15px;
  margin-bottom: 25px;
  transition: transform 0.4s ease;
}

.service-card:hover .service-image {
  transform: scale(1.05);
}

.service-icon {
  font-size: 3.5rem;
  margin-bottom: 25px;
  display: block;
}

.service-card h3 {
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 15px;
  color: #1f2937;
}

.service-card p {
  color: #6b7280;
  margin-bottom: 25px;
  line-height: 1.6;
  font-size: 1rem;
}

.service-price {
  font-size: 1.4rem;
  font-weight: 700;
  color: #2563eb;
  background: linear-gradient(135deg, #dbeafe, #e0e7ff);
  padding: 10px 20px;
  border-radius: 25px;
  display: inline-block;
}

/* Loading and Error States */
.loading {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
  grid-column: 1 / -1;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

.error {
  text-align: center;
  padding: 60px 20px;
  color: #dc2626;
  grid-column: 1 / -1;
}

.error h3 {
  margin-bottom: 10px;
  color: #dc2626;
}

.error button {
  margin-top: 20px;
}

.no-services {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
  grid-column: 1 / -1;
}

/* Quality Section */
.quality {
  padding: 100px 0;
  background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%);
  color: white;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.quality::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="40" r="1.5" fill="rgba(255,255,255,0.1)"/><circle cx="40" cy="80" r="1" fill="rgba(255,255,255,0.1)"/></svg>');
  animation: sparkle 15s linear infinite;
}

.quality-content {
  position: relative;
  z-index: 2;
}

.quality h2 {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 30px;
}

.quality p {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 40px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* Why Choose Us */
.features {
  padding: 100px 0;
  background: white;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 50px;
  margin-top: 60px;
}

.feature-item {
  text-align: center;
  padding: 30px 20px;
  border-radius: 15px;
  transition: transform 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 4rem;
  margin-bottom: 25px;
  display: block;
}

.feature-item h3 {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 15px;
  color: #1f2937;
}

.feature-item p {
  color: #6b7280;
  line-height: 1.6;
}

/* CTA Section */
.cta {
  padding: 100px 0;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  text-align: center;
}

.cta h2 {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 20px;
}

.cta p {
  font-size: 1.3rem;
  margin-bottom: 40px;
  opacity: 0.9;
}

.cta-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
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

@keyframes sparkle {
  0% { transform: translateY(0) rotate(0deg); }
  100% { transform: translateY(-100vh) rotate(360deg); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Services Footer */
.services-footer {
  text-align: center;
  margin-top: 40px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }
  
  .nav-logo-image {
    width: 28px;
    height: 28px;
  }
  
  .nav-logo {
    font-size: 1.6rem;
  }
  
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
  
  .services-container {
    grid-template-columns: 1fr;
  }
  
  .car-main {
    font-size: 8rem;
  }
  
  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .section-title {
    font-size: 2.2rem;
  }
  
  .quality h2 {
    font-size: 2.2rem;
  }
  
  .cta h2 {
    font-size: 2.2rem;
  }
}

@media (max-width: 480px) {
  .nav-logo-image {
    width: 24px;
    height: 24px;
  }
  
  .nav-logo {
    font-size: 1.4rem;
    gap: 8px;
  }
}
</style>