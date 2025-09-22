import React from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/HeroSection.css'

function HeroSection() {
  const navigate = useNavigate()

  const handleSigninClick = () => {
    navigate('/signin')
  }

  return (
    <div className='hero-container'>
      <div className="hero-content">
        <div className="title-container">
          <h2 className='title-1'>ACC LIBRARY</h2>
          <h2 className="title-2">MANAGEMENT SYSTEM</h2>
        </div>

        <p className='hero-subtitle'>Borrow Knowledge, Build Wisdom.</p>
        <button 
          id="signinBtn" 
          className="btn-primary"
          onClick={handleSigninClick}
        >
            Sign in
        </button>
        <p className='signup-text'>No account yet? <a href="/signup" className='signup-link link'>Signup now</a></p>

      </div>
      <img src="images/hero-bg.png" alt="" className="hero-image"/>
    </div>
  )
}

export default HeroSection