import React from 'react'
import Navbar from '../components/Home/Navbar'
import Footer from '../components/Home/Footer'
import ApplicantCard from '../components/Applicant/ApplicantCard'

const Applicants = () => {
  return (
    <div>
      <Navbar/>
      <ApplicantCard/>
      <Footer/>
    </div>
  )
}

export default Applicants