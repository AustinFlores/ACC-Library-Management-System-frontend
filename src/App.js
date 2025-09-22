import React, { use, useEffect, useState } from 'react'
import Home from './pages/Home.jsx'
import Signin from './pages/Signin.jsx'
import Signup from './pages/Signup.jsx'
import VisitLibrary from './pages/VisitLibrary.jsx'
import RequestQR from './pages/RequestQR.jsx'
import BrowseBooks from './pages/BrowseBooks.jsx'
import BorrowRequest from './pages/BorrowRequest.jsx';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Contact from './pages/Contact.jsx'
import Faqs from './pages/Faqs.jsx'
import './styles/App.css'

function App() {

  return (
    <div className='App'>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/visit-library" element={<VisitLibrary />} />
        <Route path="/requestqr" element={<RequestQR />} />
        <Route path="/browse-books" element={<BrowseBooks />} />
        <Route path="/borrow-request" element={<BorrowRequest />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faqs" element={<Faqs />} />
      </Routes>
    </Router>
    </div>
  )
}

export default App