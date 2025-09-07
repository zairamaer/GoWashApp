import { createRouter, createWebHistory } from 'vue-router'
import AdminLogin from '../components/AdminLogin.vue'
import AdminLayout from '../components/AdminLayout.vue'
import AdminDashboard from '../components/AdminDashboard.vue'
import ServiceManagement from '../components/ServiceManagement.vue'
import AppointmentsManagement from '../components/AppointmentsManagement.vue'
import PaymentsManagement from '../components/PaymentsManagement.vue'
import UpcomingSchedules from '../components/UpcomingSchedules.vue'
import CustomerManagement from '../components/CustomerManagement.vue'
import ApiTest from '../components/ApiTest.vue'
import LandingPage from '../components/LandingPage.vue'
import CustomerLogin from '../components/CustomerLogin.vue'
import CustomerRegister from '../components/CustomerRegister.vue'
import CustomerLayout from '../components/CustomerLayout.vue'
import CustomerDashboard from '../components/CustomerDashboard.vue'

const routes = [
  {
    path: '/',
    name: 'LandingPage',
    component: LandingPage
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLogin,
    meta: { requiresGuest: true }
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: AdminDashboard
      },
      {
        path: 'services',
        name: 'ServiceManagement',
        component: ServiceManagement
      },
      {
        path: 'appointments',
        name: 'AppointmentsManagement',
        component: AppointmentsManagement
      },
      {
        path: 'payments',
        name: 'PaymentsManagement',
        component: PaymentsManagement
      },
      {
        path: 'upcoming-schedules',
        name: 'UpcomingSchedules',
        component: UpcomingSchedules
      },
      {
        path: 'customers',
        name: 'CustomerManagement',
        component: CustomerManagement
      }
    ]
  },
  {
    path: '/customer/login',
    name: 'CustomerLogin',
    component: CustomerLogin,
    meta: { requiresGuest: true }
  },
  {
    path: '/customer/register',
    name: 'CustomerRegister',
    component: CustomerRegister,
    meta: { requiresGuest: true }
  },
  {
    path: '/customer',
    component: CustomerLayout,
    meta: { requiresCustomerAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'CustomerDashboard',
        component: CustomerDashboard
      },
      {
        path: 'book',
        name: 'CustomerBook',
        component: () => import('../components/CustomerBook.vue')
      },
      {
        path: 'appointments',
        name: 'CustomerAppointments',
        component: () => import('../components/CustomerAppointments.vue')
      }
    ]
  },
  {
    path: '/test',
    name: 'ApiTest',
    component: ApiTest
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const adminToken = localStorage.getItem('admin_token')
  const customerToken = localStorage.getItem('customer_token')
  const isAdminAuthenticated = !!adminToken
  const isCustomerAuthenticated = !!customerToken

  // Admin routes
  if (to.meta.requiresAuth && !isAdminAuthenticated) {
    next('/admin/login')
  } else if (to.meta.requiresGuest && isAdminAuthenticated && to.path.startsWith('/admin')) {
    next('/admin/dashboard')
  } else if (to.path === '/admin') {
    next('/admin/dashboard')
  }
  // Customer routes
  else if (to.meta.requiresCustomerAuth && !isCustomerAuthenticated) {
    next('/customer/login')
  } else if (to.meta.requiresGuest && isCustomerAuthenticated && to.path.startsWith('/customer')) {
    next('/customer/dashboard')
  } else if (to.path === '/customer') {
    next('/customer/dashboard')
  }
  // Default behavior
  else {
    next()
  }
})

export default router
