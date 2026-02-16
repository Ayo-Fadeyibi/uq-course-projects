import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Applicants from './screens/Applicants'
import Interviews from './screens/Interviews'
import Questions from './screens/Questions'
import TakeInterview from "./components/TakeInterview/TakeInterview";
import Home from './screens/Home';
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <Router>
      <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/Interviews' element={<Interviews/>}/>
      <Route path='/Questions' element={<Questions/>}/>
      <Route path='/Applicants' element={<Applicants/>}/>
      <Route path="/interview/:id" element={<TakeInterview />} />
      </Routes>
      <Toaster position="top-right" />
    </Router>
   
  )
}

export default App