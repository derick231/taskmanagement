import React from 'react'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import Homepage from './pages/Homepage'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import WorkspacePage from './pages/WorkspacePage.jsx'

const MyRoute = () => {
  return (
    <div>
        <Router>
            <Routes>
                <Route path='/' element={<LandingPage/>}/>
                <Route path='/dashboard' element={<Homepage/>}/>
                <Route path='/auth' element={<AuthPage/>}/>
                <Route path='/workspace/:id' element={<WorkspacePage/>}/>
            </Routes>
        </Router>
    </div>
  )
}

export default MyRoute