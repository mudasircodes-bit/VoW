import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./Home/Home";

import AdminLogin from "./Pages/AdminLogin";
import AdminAccess from "./Pages/AdminAccess";

import StudentIDCard from "./Pages/StudentIDCard";
import Login from "./Pages/Login";
import SignUp from "./Pages/SignUp";
import StudentDashboard from "./Pages/StudentDashboard";
import StudentProfile from "./Pages/StudentProfile";
import AdminDashboard from "./Pages/AdminDashboard";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";


import TeacherSignUp from "./Teacher/TeacherSignUp";

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>

        {/* Public Website */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Home />
              <Footer />
            </>
          }
        />

        {/* Student Portal */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/student-profile" element={<StudentProfile />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/student-id-card" element={<StudentIDCard />} />

        {/* teachers Portal */}
          <Route path="/teacher-signup" element={<TeacherSignUp />} />

        {/* Admin Portal */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-access" element={<AdminAccess />} />




          
      </Routes>
    </BrowserRouter>
  );
}

export default App;