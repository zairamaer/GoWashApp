<template>
  <div class="landing-page">
    <!-- Navigation -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-logo">
          <h2>GoWash</h2>
        </div>
        <div class="nav-menu">
          <a href="#home" class="nav-link">Home</a>
          <a href="#services" class="nav-link">Services</a>
          <a href="#about" class="nav-link">About</a>
          <a href="#contact" class="nav-link">Contact</a>
          <router-link to="/customer/login" class="nav-link login-btn">Login</router-link>
          <router-link to="/customer/register" class="nav-link register-btn">Register</router-link>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section id="home" class="hero">
      <div class="hero-container">
        <div class="hero-content">
          <h1 class="hero-title">Professional Car Wash Services</h1>
          <p class="hero-subtitle">Book your car wash appointment online and enjoy premium cleaning services at your convenience.</p>
          <div class="hero-buttons">
            <router-link to="/customer/register" class="btn btn-primary">Get Started</router-link>
            <router-link to="/customer/login" class="btn btn-secondary">Login</router-link>
          </div>
        </div>
        <div class="hero-image">
          <div class="car-wash-illustration">
            <div class="car">🚗</div>
            <div class="bubbles">
              <div class="bubble"></div>
              <div class="bubble"></div>
              <div class="bubble"></div>
              <div class="bubble"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Section -->
    <section id="services" class="services">
      <div class="container">
        <h2 class="section-title">Our Services</h2>
        <div class="services-grid">
          <div class="service-card">
            <div class="service-icon">🚿</div>
            <h3>Basic Wash</h3>
            <p>Exterior wash, wheel cleaning, and tire shine for a clean look.</p>
            <div class="service-price">Starting at $15</div>
          </div>
          <div class="service-card">
            <div class="service-icon">✨</div>
            <h3>Premium Wash</h3>
            <p>Complete exterior and interior cleaning with waxing and detailing.</p>
            <div class="service-price">Starting at $35</div>
          </div>
          <div class="service-card">
            <div class="service-icon">🏆</div>
            <h3>Deluxe Package</h3>
            <p>Full-service cleaning including engine bay, leather conditioning, and more.</p>
            <div class="service-price">Starting at $55</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <h2 class="section-title">Why Choose GoWash?</h2>
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon">📱</div>
            <h3>Easy Booking</h3>
            <p>Book your appointment online in just a few clicks</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">⏰</div>
            <h3>Flexible Scheduling</h3>
            <p>Choose your preferred date and time that works for you</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">💳</div>
            <h3>Secure Payment</h3>
            <p>Safe and secure payment processing for all transactions</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🌟</div>
            <h3>Quality Service</h3>
            <p>Professional staff and premium products for the best results</p>
          </div>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section id="about" class="about">
      <div class="container">
        <div class="about-content">
          <div class="about-text">
            <h2>About GoWash</h2>
            <p>GoWash is your trusted partner for professional car wash services. We've been serving customers with excellence and reliability for years, providing top-quality cleaning services that keep your vehicle looking its best.</p>
            <p>Our team of experienced professionals uses only the finest products and equipment to ensure your car receives the care it deserves. From basic washes to comprehensive detailing packages, we have the perfect service for every need and budget.</p>
            <div class="about-stats">
              <div class="stat">
                <h3>1000+</h3>
                <p>Happy Customers</p>
              </div>
              <div class="stat">
                <h3>5+</h3>
                <p>Years Experience</p>
              </div>
              <div class="stat">
                <h3>24/7</h3>
                <p>Online Booking</p>
              </div>
            </div>
          </div>
          <div class="about-image">
            <div class="about-placeholder">
              <div class="car-icon">🚗</div>
              <div class="sparkles">
                <div class="sparkle">✨</div>
                <div class="sparkle">✨</div>
                <div class="sparkle">✨</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="container">
        <div class="cta-content">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of satisfied customers and book your car wash appointment today!</p>
          <div class="cta-buttons">
            <router-link to="/customer/register" class="btn btn-primary btn-large">Book Now</router-link>
            <router-link to="/customer/login" class="btn btn-outline btn-large">Login</router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h3>GoWash</h3>
            <p>Professional car wash services at your convenience.</p>
          </div>
          <div class="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>Customer</h4>
            <ul>
              <li><router-link to="/customer/login">Login</router-link></li>
              <li><router-link to="/customer/register">Register</router-link></li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>Contact Info</h4>
            <p>📧 info@gowash.com</p>
            <p>📞 (555) 123-4567</p>
            <p>📍 123 Car Wash St, City, State</p>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2024 GoWash. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
// Landing page component
</script>

<style scoped>
.landing-page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #333;
}

/* Navigation */
.navbar {
  background: #fff;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
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

.nav-logo h2 {
  color: #2563eb;
  font-size: 1.8rem;
  font-weight: 700;
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
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: #2563eb;
}

.login-btn {
  background: #f3f4f6;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.login-btn:hover {
  background: #e5e7eb;
  color: #2563eb;
}

.register-btn {
  background: #2563eb;
  color: white !important;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.register-btn:hover {
  background: #1d4ed8;
  color: white !important;
}

/* Hero Section */
.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 120px 0 80px;
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: 40px;
  opacity: 0.9;
  line-height: 1.6;
}

.hero-buttons {
  display: flex;
  gap: 20px;
}

.btn {
  display: inline-block;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.btn-primary {
  background: #fff;
  color: #2563eb;
}

.btn-primary:hover {
  background: #f8fafc;
  transform: translateY(-2px);
}

.btn-secondary {
  background: transparent;
  color: white;
  border-color: white;
}

.btn-secondary:hover {
  background: white;
  color: #2563eb;
}

.btn-large {
  padding: 16px 32px;
  font-size: 1.1rem;
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

/* Car Wash Illustration */
.car-wash-illustration {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}

.car {
  font-size: 8rem;
  animation: float 3s ease-in-out infinite;
}

.bubbles {
  position: absolute;
  width: 100%;
  height: 100%;
}

.bubble {
  position: absolute;
  background: rgba(255,255,255,0.3);
  border-radius: 50%;
  animation: bubble 4s infinite;
}

.bubble:nth-child(1) {
  width: 20px;
  height: 20px;
  left: 20%;
  animation-delay: 0s;
}

.bubble:nth-child(2) {
  width: 30px;
  height: 30px;
  left: 60%;
  animation-delay: 1s;
}

.bubble:nth-child(3) {
  width: 25px;
  height: 25px;
  left: 40%;
  animation-delay: 2s;
}

.bubble:nth-child(4) {
  width: 35px;
  height: 35px;
  left: 80%;
  animation-delay: 3s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes bubble {
  0% {
    bottom: -50px;
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    bottom: 100%;
    opacity: 0;
  }
}

/* Services Section */
.services {
  padding: 80px 0;
  background: #f8fafc;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 60px;
  color: #1f2937;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
}

.service-card {
  background: white;
  padding: 40px 30px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.service-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.service-card h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 15px;
  color: #1f2937;
}

.service-card p {
  color: #6b7280;
  margin-bottom: 20px;
  line-height: 1.6;
}

.service-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2563eb;
}

/* Features Section */
.features {
  padding: 80px 0;
  background: white;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
}

.feature-item {
  text-align: center;
  padding: 20px;
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.feature-item h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 15px;
  color: #1f2937;
}

.feature-item p {
  color: #6b7280;
  line-height: 1.6;
}

/* About Section */
.about {
  padding: 80px 0;
  background: #f8fafc;
}

.about-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.about-text h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 30px;
  color: #1f2937;
}

.about-text p {
  color: #6b7280;
  margin-bottom: 20px;
  line-height: 1.6;
  font-size: 1.1rem;
}

.about-stats {
  display: flex;
  gap: 40px;
  margin-top: 40px;
}

.stat {
  text-align: center;
}

.stat h3 {
  font-size: 2rem;
  font-weight: 700;
  color: #2563eb;
  margin-bottom: 5px;
}

.stat p {
  color: #6b7280;
  font-weight: 500;
}

.about-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.about-placeholder {
  position: relative;
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.car-icon {
  font-size: 6rem;
  color: white;
}

.sparkles {
  position: absolute;
  width: 100%;
  height: 100%;
}

.sparkle {
  position: absolute;
  font-size: 1.5rem;
  animation: sparkle 2s infinite;
}

.sparkle:nth-child(1) {
  top: 20%;
  left: 20%;
  animation-delay: 0s;
}

.sparkle:nth-child(2) {
  top: 30%;
  right: 20%;
  animation-delay: 0.7s;
}

.sparkle:nth-child(3) {
  bottom: 30%;
  left: 30%;
  animation-delay: 1.4s;
}

@keyframes sparkle {
  0%, 100% { opacity: 0; transform: scale(0.5); }
  50% { opacity: 1; transform: scale(1); }
}

/* CTA Section */
.cta {
  padding: 80px 0;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  text-align: center;
}

.cta-content h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 20px;
}

.cta-content p {
  font-size: 1.25rem;
  margin-bottom: 40px;
  opacity: 0.9;
}

.cta-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
}

/* Footer */
.footer {
  background: #1f2937;
  color: white;
  padding: 60px 0 20px;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  margin-bottom: 40px;
}

.footer-section h3,
.footer-section h4 {
  margin-bottom: 20px;
  color: #f9fafb;
}

.footer-section ul {
  list-style: none;
  padding: 0;
}

.footer-section ul li {
  margin-bottom: 10px;
}

.footer-section ul li a {
  color: #d1d5db;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-section ul li a:hover {
  color: #60a5fa;
}

.footer-section p {
  color: #d1d5db;
  line-height: 1.6;
}

.footer-bottom {
  border-top: 1px solid #374151;
  padding-top: 20px;
  text-align: center;
  color: #9ca3af;
}

/* Responsive Design */
@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }
  
  .hero-container {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .about-content {
    grid-template-columns: 1fr;
  }
  
  .about-stats {
    justify-content: center;
  }
  
  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }
}
</style>


