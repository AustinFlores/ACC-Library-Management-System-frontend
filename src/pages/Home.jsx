import React, {useState} from 'react'
import Header from './Header'
import HeroSection from './HeroSection'
import About from './About'

function Home() {

  return (
    <div className="container">
      <Header />
      <HeroSection />
  </div>
  )
}

export default Home