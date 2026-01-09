<template>
  <div class="customer-register">
    <!-- Toast Notifications -->
    <div v-if="toast.show" :class="['toast', toast.type]">
      <div class="toast-content">
        <div class="toast-icon">
          <svg v-if="toast.type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22,4 12,14.01 9,11.01"></polyline>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <div class="toast-message">
          <h4>{{ toast.title }}</h4>
          <p>{{ toast.message }}</p>
        </div>
        <button @click.stop.prevent="closeToast" class="toast-close" type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>

    <div class="register-wrapper">
      <!-- Left Side - Branding -->
      <div class="brand-section">
        <div class="brand-content">
          <div class="logo-container">
            <div class="logo">
              <img src="../assets/car.png" alt="GoWash Logo" class="logo-image">
              <h1 class="brand-name">GoWash</h1>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side - Register Form -->
      <div class="form-section">
        <div class="form-container">
          <div class="form-header">
            <h1>Create Account</h1>
            <p>Join GoWash and start booking your car wash appointments</p>
          </div>
          
          <!-- Remove form tag and use div instead -->
          <div class="register-form">
            <div class="form-group">
              <label for="name">Full Name</label>
              <div class="input-wrapper">
                <input
                  type="text"
                  id="name"
                  v-model="form.name"
                  :class="{ 'error': errors.name }"
                  placeholder="Enter your full name"
                  @keydown.enter.prevent.stop="handleRegister"
                />
                <div class="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
              </div>
              <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
            </div>
            
            <div class="form-group">
              <label for="email">Email Address</label>
              <div class="input-wrapper">
                <input
                  type="email"
                  id="email"
                  v-model="form.email"
                  :class="{ 'error': errors.email }"
                  placeholder="Enter your email"
                  @keydown.enter.prevent.stop="handleRegister"
                />
                <div class="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
              </div>
              <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
            </div>
            
            <div class="form-group">
              <label for="phone">Phone Number</label>
              <div class="input-wrapper">
                <input
                  type="tel"
                  id="phone"
                  v-model="form.phone"
                  :class="{ 'error': errors.phone }"
                  placeholder="Enter your phone number"
                  @keydown.enter.prevent.stop="handleRegister"
                />
                <div class="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
              </div>
              <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
            </div>
            
            <div class="form-group">
              <label for="password">Password</label>
              <div class="input-wrapper">
                <input
                  :type="showPassword ? 'text' : 'password'"
                  id="password"
                  v-model="form.password"
                  :class="{ 'error': errors.password }"
                  placeholder="Create a password"
                  @keydown.enter.prevent.stop="handleRegister"
                />
                <div class="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <circle cx="12" cy="16" r="1"></circle>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <button
                  type="button"
                  @click.stop.prevent="togglePassword"
                  class="password-toggle"
                >
                  <svg v-if="!showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                </button>
              </div>
              <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
            </div>
            
            <div class="form-group">
              <label for="confirmPassword">Confirm Password</label>
              <div class="input-wrapper">
                <input
                  :type="showConfirmPassword ? 'text' : 'password'"
                  id="confirmPassword"
                  v-model="form.confirmPassword"
                  :class="{ 'error': errors.confirmPassword }"
                  placeholder="Confirm your password"
                  @keydown.enter.prevent.stop="handleRegister"
                />
                <div class="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <button
                  type="button"
                  @click.stop.prevent="toggleConfirmPassword"
                  class="password-toggle"
                >
                  <svg v-if="!showConfirmPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                </button>
              </div>
              <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
            </div>
            
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="form.agreeToTerms">
                <span class="checkmark"></span>
                I agree to the <a href="#" class="terms-link" @click.prevent.stop="">Terms of Service</a> and <a href="#" class="terms-link" @click.prevent.stop="">Privacy Policy</a>
              </label>
              <span v-if="errors.agreeToTerms" class="error-message">{{ errors.agreeToTerms }}</span>
            </div>
            
            <button 
              type="button" 
              @click.stop.prevent="handleRegister" 
              class="register-btn" 
              :disabled="loading"
            >
              <span v-if="loading" class="spinner"></span>
              <span>{{ loading ? 'Creating Account...' : 'Create Account' }}</span>
            </button>
            
            <!-- General Error Message -->
            <div v-if="errors.general" class="general-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
              {{ errors.general }}
            </div>
          </div>
          
          <div class="form-footer">
            <p>Already have an account? <router-link to="/customer/login" class="signin-link">Sign in here</router-link></p>
            <router-link to="/" class="back-home">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back to Home
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { customerAuthService } from '../services/api'

const router = useRouter()

const form = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: false
})

const errors = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: '',
  general: ''
})

const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Toast notification system
const toast = reactive({
  show: false,
  type: 'success', // 'success' or 'error'
  title: '',
  message: ''
})

const showToast = (type, title, message) => {
  toast.type = type
  toast.title = title
  toast.message = message
  toast.show = true
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    toast.show = false
  }, 5000)
}

const closeToast = () => {
  toast.show = false
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

const clearErrors = () => {
  errors.name = ''
  errors.email = ''
  errors.phone = ''
  errors.password = ''
  errors.confirmPassword = ''
  errors.agreeToTerms = ''
  errors.general = ''
}

const validateForm = () => {
  clearErrors()
  
  let isValid = true
  
  // Name validation
  if (!form.name?.trim()) {
    errors.name = 'Full name is required'
    isValid = false
  } else if (form.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters'
    isValid = false
  }
  
  // Email validation
  if (!form.email?.trim()) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!form.email.includes('@') || !form.email.includes('.')) {
    errors.email = 'Please enter a valid email address'
    isValid = false
  }
  
  // Phone validation
  if (!form.phone?.trim()) {
    errors.phone = 'Phone number is required'
    isValid = false
  } else if (!/^\d{11}$/.test(form.phone)) {
    errors.phone = 'Phone number must be exactly 11 digits'
    isValid = false
  } else if (!form.phone.startsWith('09')) {
    errors.phone = 'Phone number must start with 09'
    isValid = false
  }
  
  // Password validation
  if (!form.password) {
    errors.password = 'Password is required'
    isValid = false
  } else if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
    isValid = false
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
    errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    isValid = false
  }
  
  // Confirm password validation
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
    isValid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    isValid = false
  }
  
  // Terms agreement validation
  if (!form.agreeToTerms) {
    errors.agreeToTerms = 'You must agree to the terms and conditions'
    isValid = false
  }
  
  return isValid
}

// Updated handleRegister function para sa Vue component
const handleRegister = async () => {
  if (!validateForm()) return
  
  loading.value = true
  clearErrors()
  
  // Backup form data in case of error
  const formBackup = { ...form }
  
  try {
    const response = await customerAuthService.register({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
      password_confirmation: form.confirmPassword
    })
    
    // Store customer data and token - ensure customer ID is included
    localStorage.setItem('customer_token', response.data.access_token)
    
    // Make sure the customer data includes the ID field
    const customerData = {
      ...response.data.data,
      id: response.data.data.id || response.data.data.customerID
    }
    localStorage.setItem('customer_user', JSON.stringify(customerData))
    
    // Show success toast
    showToast('success', 'Account Created!', 'Welcome to GoWash! Redirecting to your dashboard...')
    
    // Redirect to customer dashboard after delay
    setTimeout(() => {
      router.push('/customer/dashboard')
    }, 2000)
    
  } catch (error) {
    // Restore form data
    Object.assign(form, formBackup)
    
    console.error('Registration error:', error)
    
    // Initialize default error messages
    let errorTitle = 'Registration Failed'
    let errorMessage = 'Please check your information and try again.'
    
    if (error.response?.status === 422) {
      
      const serverErrors = error.response.data.errors || {}
      const serverMessage = error.response.data.message || 'Validation failed'
      
      // Check specifically for email already exists error
      const emailErrors = serverErrors.email || []
      const isEmailExistsError = emailErrors.some(msg => 
        msg.toLowerCase().includes('already') || 
        msg.toLowerCase().includes('taken') ||
        msg.toLowerCase().includes('exists') ||
        msg.toLowerCase().includes('registered')
      )
      
      if (isEmailExistsError) {
        // Handle email already exists specifically
        errorTitle = 'Email Already Registered'
        errorMessage = 'This email address is already registered. Please use a different email or sign in to your existing account.'
        errors.email = emailErrors.find(msg => 
          msg.toLowerCase().includes('already') || 
          msg.toLowerCase().includes('taken') ||
          msg.toLowerCase().includes('exists') ||
          msg.toLowerCase().includes('registered')
        ) || 'This email address is already registered'
        errors.general = 'Please use a different email address'
      } else {
        // Handle other validation errors
        Object.keys(serverErrors).forEach(key => {
          if (serverErrors[key] && serverErrors[key].length > 0) {
            errors[key] = Array.isArray(serverErrors[key]) ? serverErrors[key][0] : serverErrors[key]
          }
        })
        
        errorTitle = 'Validation Error'
        errorMessage = serverMessage
        errors.general = 'Please fix the highlighted errors'
      }
      
    } else if (error.response?.status === 409) {
      // Handle 409 Conflict - Direct duplicate conflict
      errorTitle = 'Email Already Exists'
      errorMessage = 'This email address is already registered. Please use a different email.'
      errors.email = 'This email address is already registered'
      errors.general = 'Email conflict detected'
      
    } else if (error.response?.status === 400) {
      // Handle 400 Bad Request
      const serverErrors = error.response.data.errors || {}
      const serverMessage = error.response.data.message || 'Bad request'
      
      if (serverErrors && Object.keys(serverErrors).length > 0) {
        // Map Laravel validation errors to form fields
        Object.keys(serverErrors).forEach(key => {
          if (serverErrors[key] && serverErrors[key].length > 0) {
            errors[key] = Array.isArray(serverErrors[key]) ? serverErrors[key][0] : serverErrors[key]
          }
        })
        
        errorTitle = 'Invalid Data'
        errorMessage = 'Please check the form for errors and try again.'
        errors.general = 'Please fix the highlighted errors'
      } else {
        errorTitle = 'Invalid Request'
        errorMessage = serverMessage
        errors.general = serverMessage
      }
      
    } else if (error.response?.status >= 500) {
      // Handle server errors (5xx)
      errorTitle = 'Server Error'
      errorMessage = 'Something went wrong on our end. Please try again later.'
      errors.general = 'Server temporarily unavailable'
      
    } else if (error.response?.data?.message) {
      // Handle custom server messages
      errorTitle = 'Request Failed'
      errorMessage = error.response.data.message
      errors.general = error.response.data.message
      
    } else if (error.message && error.message.includes('Network Error')) {
      // Handle network/connection errors
      errorTitle = 'Connection Error'
      errorMessage = 'Unable to connect to server. Please check your internet connection.'
      errors.general = 'Connection failed. Please try again.'
      
    } else if (error.code === 'ECONNABORTED') {
      // Handle timeout errors
      errorTitle = 'Request Timeout'
      errorMessage = 'The request took too long. Please try again.'
      errors.general = 'Request timed out'
      
    } else {
      // Handle any other unexpected errors
      errorTitle = 'Unexpected Error'
      errorMessage = 'An unexpected error occurred. Please try again.'
      errors.general = 'Please try again later'
    }
    
    // Show error toast
    showToast('error', errorTitle, errorMessage)
    
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Toast Styles */
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  max-width: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
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

.toast.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.toast.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.toast-content {
  display: flex;
  align-items: flex-start;
  padding: 15px;
}

.toast-icon {
  flex-shrink: 0;
  margin-right: 12px;
}

.toast-message {
  flex: 1;
}

.toast-message h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
}

.toast-message p {
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
}

.toast-close {
  flex-shrink: 0;
  margin-left: 12px;
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.toast-close:hover {
  opacity: 1;
}

/* General Error Styles */
.general-error {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #721c24;
  background: #f8d7da;
  padding: 12px;
  border-radius: 6px;
  margin-top: 16px;
  font-size: 14px;
  border: 1px solid #f5c6cb;
}

.error-message {
  color: #721c24;
  font-size: 14px;
  margin-top: 5px;
  display: block;
}

/* Main Container */
.customer-register {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%);
  background-size: 200% 200%;
  animation: gradientShift 10s ease infinite;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.register-wrapper {
  display: flex;
  min-height: 100vh;
  box-shadow: 0 0 100px rgba(0, 0, 0, 0.1);
}

/* Left Side - Branding */
.brand-section {
  flex: 1;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  position: relative;
  overflow: hidden;
}

.brand-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><circle cx="150" cy="200" r="80" fill="rgba(255,255,255,0.12)"/><circle cx="750" cy="150" r="120" fill="rgba(255,255,255,0.08)"/><circle cx="300" cy="600" r="60" fill="rgba(255,255,255,0.15)"/><circle cx="800" cy="700" r="90" fill="rgba(255,255,255,0.06)"/><circle cx="100" cy="800" r="70" fill="rgba(255,255,255,0.10)"/></svg>');
  animation: circleFloat 20s ease-in-out infinite;
  z-index: 0;
}

@keyframes circleFloat {
  0%, 100% { 
    transform: translateY(0px);
    opacity: 0.7;
  }
  50% { 
    transform: translateY(-20px);
    opacity: 1;
  }
}

.brand-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: white;
  max-width: 480px;
}

.logo-container {
  margin-bottom: 40px;
  animation: fadeInUp 1s ease-out;
}

.logo {
  margin-bottom: 20px;
  display: inline-flex;
  align-items: center;
  gap: 16px;
  animation: float 3s ease-in-out infinite;
}

.logo-image {
  width: 60px;
  height: 60px;
  object-fit: contain;
  filter: brightness(0) invert(1);
  transition: transform 0.3s ease;
}

.logo:hover .logo-image {
  transform: scale(1.1) rotate(5deg);
}

.brand-name {
  font-size: 3rem;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Right Side - Form */
.form-section {
  flex: 1;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  position: relative;
}

.form-container {
  width: 100%;
  max-width: 420px;
  animation: slideInRight 0.8s ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.form-header {
  text-align: center;
  margin-bottom: 40px;
}

.form-header h1 {
  font-size: 2.25rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
  letter-spacing: -0.025em;
}

.form-header p {
  color: #6b7280;
  font-size: 1rem;
  font-weight: 400;
}

/* Form Styles */
.register-form {
  margin-bottom: 32px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
  letter-spacing: 0.025em;
}

.input-wrapper {
  position: relative;
}

.form-group input {
  width: 100%;
  padding: 14px 16px 14px 48px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #f9fafb;
  font-weight: 400;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
}

.form-group input.error {
  border-color: #ef4444;
  background: #fef2f2;
  box-shadow: 0 0 0 0.2rem rgba(239, 68, 68, 0.25);
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  transition: color 0.3s ease;
}

.form-group input:focus + .input-icon,
.input-wrapper:focus-within .input-icon {
  color: #3b82f6;
}

.password-toggle {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  color: #6b7280;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.password-toggle:hover {
  background: #f3f4f6;
  color: #374151;
}

.error-message {
  display: block;
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 6px;
  font-weight: 500;
  animation: shake 0.3s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

/* Checkbox Styles */
.checkbox-label {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
  gap: 12px;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  margin: 0;
  padding: 0;
  accent-color: #3b82f6;
  cursor: pointer;
  margin-top: 1px;
  flex-shrink: 0;
}

.terms-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.terms-link:hover {
  color: #2563eb;
  text-decoration: underline;
}

/* Register Button */
.register-btn {
  width: 100%;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
}

.register-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.register-btn:hover:not(:disabled)::before {
  opacity: 1;
}

.register-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4);
}

.register-btn:active:not(:disabled) {
  transform: translateY(0);
}

.register-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  opacity: 0.6;
}

.register-btn span {
  position: relative;
  z-index: 1;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Footer */
.form-footer {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #f3f4f6;
}

.form-footer p {
  color: #6b7280;
  margin-bottom: 16px;
  font-size: 0.875rem;
}

.signin-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.signin-link:hover {
  color: #2563eb;
  text-decoration: underline;
}

.back-home {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  padding: 8px 16px;
  border-radius: 8px;
}

.back-home:hover {
  color: #3b82f6;
  background: #f3f4f6;
  transform: translateX(-2px);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .register-wrapper {
    flex-direction: column;
  }
  
  .brand-section {
    padding: 40px 30px;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .brand-name {
    font-size: 2.5rem;
  }
}

@media (max-width: 768px) {
  .customer-register {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  }
  
  .form-section {
    padding: 20px;
  }
  
  .brand-section {
    padding: 30px 20px;
  }
  
  .brand-name {
    font-size: 2rem;
  }
  
  .form-header h1 {
    font-size: 1.875rem;
  }
  
  .logo {
    flex-direction: column;
    gap: 12px;
  }
  
  .logo-image {
    width: 50px;
    height: 50px;
  }
}

@media (max-width: 480px) {
  .form-container {
    max-width: 100%;
  }
  
  .form-group input {
    padding: 12px 16px 12px 44px;
  }
  
  .register-btn {
    padding: 14px 20px;
  }
  
  .logo-image {
    width: 40px;
    height: 40px;
  }
  
  .brand-name {
    font-size: 1.75rem;
  }
  
  .toast {
    right: 10px;
    left: 10px;
    max-width: none;
  }
}
</style>
