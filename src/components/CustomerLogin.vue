<template>
  <div class="customer-login">
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
    
    <div class="login-wrapper">
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

      <!-- Right Side - Login Form -->
      <div class="form-section">
        <div class="form-container">
          <div class="form-header">
            <h1>Welcome Back</h1>
            <p>Sign in to book your car wash</p>
          </div>
          
          <div class="login-form">
            <div class="form-group">
              <label for="email">Email Address</label>
              <div class="input-wrapper">
                <input
                  type="email"
                  id="email"
                  v-model="form.email"
                  :class="{ 'error': errors.email }"
                  placeholder="Enter your email address"
                  @keydown.enter.prevent.stop="handleLoginSafely"
                  autocomplete="email"
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
              <label for="password">Password</label>
              <div class="input-wrapper">
                <input
                  :type="showPassword ? 'text' : 'password'"
                  id="password"
                  v-model="form.password"
                  :class="{ 'error': errors.password }"
                  placeholder="Enter your password"
                  @keydown.enter.prevent.stop="handleLoginSafely"
                  autocomplete="current-password"
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
            
            <div class="form-options">
              <a href="#" class="forgot-password" @click.prevent.stop="">Forgot password?</a>
            </div>
            
            <button 
              type="button" 
              @click.stop.prevent="handleLoginSafely" 
              class="login-btn" 
              :disabled="loading"
            >
              <span v-if="loading" class="spinner"></span>
              <span>{{ loading ? 'Signing in...' : 'Sign In' }}</span>
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
            <p>Don't have an account? <router-link to="/customer/register" class="signup-link">Create one here</router-link></p>
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
import { ref, reactive, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { customerAuthService } from '../services/api'

const router = useRouter()

// Persistent form data that won't be cleared on error
const form = reactive({
  email: '',
  password: ''
})

const errors = reactive({
  email: '',
  password: '',
  general: ''
})

const loading = ref(false)
const showPassword = ref(false)

// Toast notification system
const toast = reactive({
  show: false,
  type: 'success',
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

const clearErrors = () => {
  errors.email = ''
  errors.password = ''
  errors.general = ''
}

const validateForm = () => {
  clearErrors()
  
  let isValid = true
  
  if (!form.email?.trim()) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!form.email.includes('@') || !form.email.includes('.')) {
    errors.email = 'Please enter a valid email address'
    isValid = false
  }
  
  if (!form.password?.trim()) {
    errors.password = 'Password is required'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
    isValid = false
  }
  
  return isValid
}

// Bulletproof login handler with multiple safety layers
const handleLoginSafely = async () => {
  try {
    // Prevent any possible form submission or navigation
    event?.preventDefault?.()
    event?.stopPropagation?.()
    
    // Don't proceed if already loading
    if (loading.value) {
      return false
    }
    
    // Validate form
    if (!validateForm()) {
      return false
    }
    
    // Set loading state
    loading.value = true
    clearErrors()
    
    // Preserve form data in case of error
    const emailBackup = form.email
    const passwordBackup = form.password
    
    try {
      console.log('Attempting login with:', { email: form.email })
      
      const response = await customerAuthService.login(form.email, form.password)
      
      console.log('Login response:', response)
      
      // Check if response is valid
      if (!response || !response.data) {
        throw new Error('Invalid response from server')
      }
      
      // Store customer data and token
      if (response.data.access_token) {
        localStorage.setItem('customer_token', response.data.access_token)
      }
      
      if (response.data.data) {
        const customerData = {
          ...response.data.data,
          id: response.data.data.id || response.data.data.customerID
        }
        localStorage.setItem('customer_user', JSON.stringify(customerData))
      }
      
      // Show success toast
      showToast('success', 'Login Successful!', 'Welcome back! Redirecting to your dashboard...')
      
      // Redirect after delay
      setTimeout(() => {
        router.push('/customer/dashboard').catch(err => {
          console.error('Navigation error:', err)
          showToast('error', 'Navigation Error', 'Please try refreshing the page')
        })
      }, 2000)
      
    } catch (error) {
      // Restore form data
      form.email = emailBackup
      form.password = passwordBackup
      
      console.error('Login error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      })
      
      let errorTitle = 'Login Failed'
      let errorMessage = 'Please check your credentials and try again.'
      
      // Handle different error scenarios
      if (error.response) {
        // Server responded with error
        const status = error.response.status
        const data = error.response.data
        
        if (status === 401) {
          errorMessage = 'Invalid email or password. Please check your credentials.'
          errors.general = 'Invalid email or password'
        } else if (status === 422) {
          errorMessage = 'Please check your input and try again.'
          errors.general = 'Invalid input format'
        } else if (status === 429) {
          errorMessage = 'Too many login attempts. Please wait a moment and try again.'
          errors.general = 'Rate limited. Please wait.'
        } else if (status >= 500) {
          errorMessage = 'Server error. Please try again later.'
          errors.general = 'Server temporarily unavailable'
        } else if (data?.message) {
          errorMessage = data.message
          errors.general = data.message
        }
      } else if (error.request) {
        // Network error
        errorMessage = 'Unable to connect to server. Please check your internet connection.'
        errors.general = 'Network error. Please check your connection.'
      } else {
        // Other error
        errorMessage = 'An unexpected error occurred. Please try again.'
        errors.general = 'Unexpected error occurred'
      }
      
      // Show error toast
      showToast('error', errorTitle, errorMessage)
    }
    
  } catch (outerError) {
    // Absolute fallback for any unhandled errors
    console.error('Outer catch error:', outerError)
    
    showToast('error', 'System Error', 'An unexpected error occurred. Please refresh the page and try again.')
    errors.general = 'System error occurred'
    
  } finally {
    // Always reset loading state
    loading.value = false
  }
  
  // Always return false to prevent any default behavior
  return false
}

// Additional safety: Handle any uncaught errors
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error)
  if (loading.value) {
    loading.value = false
    showToast('error', 'Error', 'An unexpected error occurred')
  }
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  if (loading.value) {
    loading.value = false
    showToast('error', 'Error', 'A network error occurred')
  }
})
</script>

<style scoped>
/* Toast Notifications */
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  min-width: 320px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  animation: slideInRight 0.3s ease-out;
}

.toast.success {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.95) 0%, rgba(21, 128, 61, 0.95) 100%);
  color: white;
}

.toast.error {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(185, 28, 28, 0.95) 100%);
  color: white;
}

.toast-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
}

.toast-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

.toast-message {
  flex: 1;
}

.toast-message h4 {
  margin: 0 0 4px 0;
  font-size: 0.875rem;
  font-weight: 600;
}

.toast-message p {
  margin: 0;
  font-size: 0.8rem;
  opacity: 0.9;
}

.toast-close {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  flex-shrink: 0;
}

.toast-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* General Error Message */
.general-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-top: 16px;
  animation: shake 0.3s ease-in-out;
}

.general-error svg {
  flex-shrink: 0;
}

/* Main Container */
.customer-login {
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

.login-wrapper {
  display: flex;
  min-height: 100vh;
  box-shadow: 0 0 100px rgba(0, 0, 0, 0.1);
}

/* Left Side - Branding */
.brand-section {
  flex: 1;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
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

.brand-description h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 16px;
  opacity: 0.95;
  animation: fadeInUp 1s ease-out 0.2s both;
}

.brand-description p {
  font-size: 1.1rem;
  line-height: 1.6;
  opacity: 0.8;
  margin-bottom: 40px;
  animation: fadeInUp 1s ease-out 0.4s both;
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
.login-form {
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

/* Form Options */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.forgot-password {
  color: #3b82f6;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 600;
  transition: color 0.2s ease;
}

.forgot-password:hover {
  color: #2563eb;
  text-decoration: underline;
}

/* Login Button */
.login-btn {
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

.login-btn::before {
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

.login-btn:hover:not(:disabled)::before {
  opacity: 1;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4);
}

.login-btn:active:not(:disabled) {
  transform: translateY(0);
}

.login-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.login-btn span {
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

/* Social Login */
.social-login {
  margin-bottom: 32px;
}

.divider {
  position: relative;
  margin: 32px 0 24px;
  text-align: center;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, #e5e7eb 50%, transparent 100%);
}

.divider span {
  background: white;
  padding: 0 16px;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
}

.social-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  color: #374151;
}

.social-btn:hover {
  border-color: #d1d5db;
  background: #f9fafb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
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

.signup-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.signup-link:hover {
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
  .login-wrapper {
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
  .customer-login {
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
  
  .social-buttons {
    grid-template-columns: 1fr;
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
  
  .login-btn {
    padding: 14px 20px;
  }
  
  .logo-image {
    width: 40px;
    height: 40px;
  }
  
  .brand-name {
    font-size: 1.75rem;
  }
}
</style>
