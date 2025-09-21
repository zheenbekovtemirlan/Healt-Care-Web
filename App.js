import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/LoginPage'
import Registration from './pages/SignUpPage'
import MyAccount from './pages/MyAccountPage'
import Home from './pages/HomePage'
import DoctorsPage from './pages/DoctorsPage';
import ScrollToTop from "./components/ScrollToTop";
import DoctorDetailPage from './pages/DoctorDetailPage';
import AppoinymentsList from './pages/AppointmentsListPage'


function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/registration" element={<Registration />} />
      <Route path='/' element={<Home />} />
      <Route path='/myaccount' element={<MyAccount />} />
      <Route path='/doctors' element={<DoctorsPage />} />
      <Route path="/doctors/:id" element={<DoctorDetailPage />} />
      <Route path='/appointments' element={<AppoinymentsList />} />
      </Routes>
    </Router>
  );
}

export default App;
