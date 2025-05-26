import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Home.css';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="home-page">
      <Header />
      <main>
        <Hero />
        <Features />
        <Testimonials />
        
        {!isAuthenticated && (
          <section className="cta-section">
            <div className="container">
              <h2>Ready to improve your English skills?</h2>
              <p>Sign up today to start your effective English learning journey.</p>
              <Link to="/register">
                <button className="cta-button">Sign up for free</button>
              </Link>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Home; 