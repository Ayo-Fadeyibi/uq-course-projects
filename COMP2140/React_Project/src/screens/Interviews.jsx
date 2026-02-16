import React, { useState } from 'react'
import Navbar from '../components/Home/Navbar'
import Footer from '../components/Home/Footer'
import InterviewCard from '../components/Interview/InterviewCard'

const Interviews = () => {
  return (
    <div>
      <Navbar/>
      <InterviewCard/>
      <Footer/>
    </div>
  )
}

export default Interviews