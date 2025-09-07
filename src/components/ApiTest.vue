<template>
  <div class="api-test">
    <div class="test-container">
      <h2>API Connection Test</h2>
      
      <div class="test-section">
        <h3>Test Admin Login</h3>
        <form @submit.prevent="testLogin" class="test-form">
          <div class="form-group">
            <label>Email:</label>
            <input v-model="testCredentials.email" type="email" placeholder="admin@example.com" />
          </div>
          <div class="form-group">
            <label>Password:</label>
            <input v-model="testCredentials.password" type="password" placeholder="password" />
          </div>
          <button type="submit" :disabled="testing">Test Login</button>
        </form>
        
        <div v-if="testResult" class="test-result">
          <h4>Test Result:</h4>
          <pre>{{ JSON.stringify(testResult, null, 2) }}</pre>
        </div>
        
        <div v-if="testError" class="test-error">
          <h4>Error:</h4>
          <p>{{ testError }}</p>
        </div>
      </div>
      
      <div class="test-section">
        <h3>Test Service Rates API (Public)</h3>
        <button @click="testServiceRates" :disabled="testing">Test Service Rates</button>
        
        <div v-if="serviceRatesResult" class="test-result">
          <h4>Service Rates (first 3):</h4>
          <pre>{{ JSON.stringify(serviceRatesResult.slice(0, 3), null, 2) }}</pre>
        </div>
        
        <div v-if="serviceRatesError" class="test-error">
          <h4>Service Rates Error:</h4>
          <p>{{ serviceRatesError }}</p>
        </div>
      </div>
      
      <div class="test-section">
        <h3>API Base URL Test</h3>
        <button @click="testBaseUrl" :disabled="testing">Test Base URL</button>
        
        <div v-if="baseUrlResult" class="test-result">
          <h4>Base URL Response:</h4>
          <pre>{{ JSON.stringify(baseUrlResult, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { adminAuthService, serviceApi } from '../services/api'

const testing = ref(false)
const testResult = ref(null)
const testError = ref('')
const serviceRatesResult = ref(null)
const serviceRatesError = ref('')
const baseUrlResult = ref(null)

const testCredentials = reactive({
  email: '',
  password: ''
})

const testLogin = async () => {
  testing.value = true
  testResult.value = null
  testError.value = ''
  
  try {
    const response = await adminAuthService.login(testCredentials.email, testCredentials.password)
    testResult.value = {
      status: 'success',
      data: response.data,
      headers: response.headers
    }
  } catch (error) {
    testError.value = error.response?.data || error.message
    testResult.value = {
      status: 'error',
      error: error.response?.data || error.message,
      statusCode: error.response?.status
    }
  } finally {
    testing.value = false
  }
}

const testServiceRates = async () => {
  testing.value = true
  serviceRatesResult.value = null
  serviceRatesError.value = ''
  
  try {
    const data = await serviceApi.getServiceRates()
    serviceRatesResult.value = data
  } catch (error) {
    serviceRatesError.value = error.response?.data || error.message
    console.error('Service rates test error:', error)
  } finally {
    testing.value = false
  }
}

const testBaseUrl = async () => {
  testing.value = true
  baseUrlResult.value = null
  
  try {
    const response = await fetch('https://gowashapp.online/api/service-rates')
    const data = await response.json()
    baseUrlResult.value = {
      status: response.status,
      statusText: response.statusText,
      data: data.slice(0, 2) // Show first 2 items
    }
  } catch (error) {
    baseUrlResult.value = {
      error: error.message,
      type: 'Network Error'
    }
  } finally {
    testing.value = false
  }
}
</script>

<style scoped>
.api-test {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.test-container {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.test-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.test-section:last-child {
  border-bottom: none;
}

.test-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: #4a5568;
}

.form-group input {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
}

button {
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.test-result, .test-error {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 16px;
  margin-top: 16px;
}

.test-error {
  background: #fed7d7;
  border-color: #feb2b2;
  color: #c53030;
}

pre {
  background: #2d3748;
  color: #e2e8f0;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
  margin: 8px 0;
}
</style>
