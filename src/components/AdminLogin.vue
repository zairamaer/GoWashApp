<template>
  <div class="admin-login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>GoWash Admin</h1>
        <p>Service Management Portal</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="form.email"
            required
            placeholder="Enter your email"
            :disabled="loading"
            :class="{ 'error': validationErrors.email }"
            @blur="validateEmail"
            @input="clearFieldError('email')"
          />
          <span v-if="validationErrors.email" class="field-error">
            {{ validationErrors.email }}
          </span>
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <div class="password-input-container">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="form.password"
              required
              placeholder="Enter your password"
              :disabled="loading"
              :class="{ 'error': validationErrors.password }"
              @blur="validatePassword"
              @input="clearFieldError('password')"
            />
            <button
              type="button"
              class="password-toggle"
              @click="togglePasswordVisibility"
              :disabled="loading"
              tabindex="-1"
            >
              <svg v-if="showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94l9.88 9.88ZM9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19l-9.84-9.95Z"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
          <span v-if="validationErrors.password" class="field-error">
            {{ validationErrors.password }}
          </span>
        </div>
        
        <button type="submit" class="login-btn" :disabled="loading || !isFormValid">
          <span v-if="loading">
            <svg class="spinner" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="4" opacity="0.25"/>
              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" opacity="0.75"/>
            </svg>
            Signing in...
          </span>
          <span v-else>Sign In</span>
        </button>
      </form>
    </div>

  <!-- Toast Notifications -->
  <Transition name="toast" appear>
    <div 
      v-if="toast.show" 
      :class="['toast', `toast-${toast.type}`]"
    >
      <div class="toast-icon">
        <svg v-if="toast.type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22,4 12,14.01 9,11.01"></polyline>
        </svg>
        <svg v-else-if="toast.type === 'error'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      </div>
      <div class="toast-content">
        <div class="toast-title">{{ toast.title }}</div>
        <div class="toast-message">{{ toast.message }}</div>
      </div>
      <button @click="hideToast" class="toast-close">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { adminAuthService } from '../services/api'

const router = useRouter()

const loading = ref(false)
const showPassword = ref(false)

const form = reactive({
  email: '',
  password: ''
})

const validationErrors = reactive({
  email: '',
  password: ''
})

const toast = reactive({
  show: false,
  type: 'success', // 'success' | 'error'
  title: '',
  message: '',
  timeout: null
})

// Computed property to check if form is valid
const isFormValid = computed(() => {
  return form.email && 
         form.password && 
         !validationErrors.email && 
         !validationErrors.password &&
         validateEmailFormat(form.email)
})

// Password toggle function
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

// Validation functions
const validateEmailFormat = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validateEmail = () => {
  if (!form.email) {
    validationErrors.email = 'Email is required'
  } else if (!validateEmailFormat(form.email)) {
    validationErrors.email = 'Please enter a valid email address'
  } else {
    validationErrors.email = ''
  }
}

const validatePassword = () => {
  if (!form.password) {
    validationErrors.password = 'Password is required'
  } else if (form.password.length < 6) {
    validationErrors.password = 'Password must be at least 6 characters'
  } else {
    validationErrors.password = ''
  }
}

const clearFieldError = (field) => {
  if (validationErrors[field]) {
    validationErrors[field] = ''
  }
}

const validateForm = () => {
  validateEmail()
  validatePassword()
  return !validationErrors.email && !validationErrors.password
}

// Toast functions
const showToast = (type, title, message, duration = 5000) => {
  // Clear any existing timeout
  if (toast.timeout) {
    clearTimeout(toast.timeout)
  }

  toast.type = type
  toast.title = title
  toast.message = message
  toast.show = true

  // Auto-hide toast after duration
  toast.timeout = setTimeout(() => {
    hideToast()
  }, duration)
}

const hideToast = () => {
  toast.show = false
  if (toast.timeout) {
    clearTimeout(toast.timeout)
    toast.timeout = null
  }
}

const handleLogin = async () => {
  // Validate form before submission
  if (!validateForm()) {
    showToast('error', 'Validation Error', 'Please fix the errors below')
    return
  }

  loading.value = true
  
  try {
    const response = await adminAuthService.login(form.email, form.password)
    
    // Handle different possible response structures
    const token = response.data.access_token || response.data.token
    const admin = response.data.admin || response.data.user
    
    if (token) {
      localStorage.setItem('admin_token', token)
      if (admin) {
        localStorage.setItem('admin_user', JSON.stringify(admin))
      }
      
      showToast('success', 'Login Successful', 'Welcome back! Redirecting to dashboard...')
      
      // Redirect after a short delay to show the success message
      setTimeout(() => {
        router.push('/admin/dashboard')
      }, 1500)
    } else {
      throw new Error('Invalid response from server')
    }
  } catch (err) {
    console.error('Login error:', err)
    
    let errorTitle = 'Login Failed'
    let errorMessage = 'Please try again'
    
    // Handle different error response structures
    if (err.response?.data?.message) {
      errorMessage = err.response.data.message
    } else if (err.response?.data?.error) {
      errorMessage = err.response.data.error
    } else if (err.response?.status === 401) {
      errorTitle = 'Authentication Failed'
      errorMessage = 'Invalid email or password'
    } else if (err.response?.status === 422) {
      errorTitle = 'Validation Error'
      errorMessage = 'Please check your email and password format'
    } else if (err.code === 'NETWORK_ERROR' || !err.response) {
      errorTitle = 'Connection Error'
      errorMessage = 'Network error. Please check your connection.'
    } else {
      errorMessage = err.message || 'An unexpected error occurred'
    }
    
    showToast('error', errorTitle, errorMessage)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.admin-login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 2rem;
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.login-header p {
  color: #6b7280;
  font-size: 0.875rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input:disabled {
  background-color: #f9fafb;
  opacity: 0.6;
}

.form-group input.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.password-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-container input {
  width: 100%;
  padding-right: 3rem;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.password-toggle:hover:not(:disabled) {
  color: #374151;
  background-color: #f3f4f6;
}

.password-toggle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.password-toggle:focus {
  outline: none;
  color: #667eea;
  background-color: rgba(102, 126, 234, 0.1);
}

.field-error {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.login-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.spinner {
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Toast Styles */
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 2000;
  min-width: 320px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  color: white;
}

.toast-success {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.95) 0%, rgba(21, 128, 61, 0.95) 100%);
}

.toast-error {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(185, 28, 28, 0.95) 100%);
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

.toast-content {
  flex: 1;
}

.toast-title {
  margin: 0 0 4px 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
}

.toast-message {
  margin: 0;
  font-size: 0.8rem;
  opacity: 0.9;
  color: white;
  line-height: 1.4;
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
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Toast Transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .toast {
    top: 15px;
    right: 15px;
    left: 15px;
    max-width: none;
    min-width: auto;
  }
  
  .toast-content {
    padding: 14px 20px;
  }
  
  .toast-title {
    font-size: 0.8rem;
  }
  
  .toast-message {
    font-size: 0.75rem;
  }
}

/* Responsive Design */
@media (max-width: 480px) {
  .toast {
    top: 20px;
    right: 20px;
    left: 20px;
    max-width: none;
    min-width: auto;
  }
  
  .login-card {
    padding: 30px 20px;
    margin: 10px;
  }
  
  .login-header h1 {
    font-size: 24px;
  }
  
  .password-toggle {
    right: 0.5rem;
  }
}
</style>