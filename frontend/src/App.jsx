import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Tentang from "./pages/Tentang";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import UpdatePassword from "./pages/UpdatePassword";
import Consultation from "./pages/Consultation";
import KonsultasiTeknis from "./pages/KonsultasiTeknis";
import Survey from "./pages/Survey";
import Chat from "./pages/Chat";
import AdminDashboard from "./pages/AdminDashboard";
import AdminReports from "./pages/AdminReports";
import AdminSurvey from "./pages/AdminSurvey";
import Reports from "./pages/Reports";
import GuestRoute from "./components/GuestRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import TestPage from "./pages/TestPage";
import TestRegister from "./pages/TestRegister";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tentang" element={<Tentang />} />
        <Route path="/survey" element={<Survey />} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/test-register" element={<TestRegister />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="*" element={<div style={{ padding: '2rem', textAlign: 'center' }}><h1>Route tidak ditemukan</h1><p>Jika Anda melihat ini, React app berjalan tetapi path tidak cocok.</p></div>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/consultation" element={<ProtectedRoute><Consultation /></ProtectedRoute>} />
        <Route path="/konsultasi-teknis" element={<ProtectedRoute><KonsultasiTeknis /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/chat/:consultationId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/update-password" element={<ProtectedRoute><UpdatePassword /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/survey" element={<AdminSurvey />} />
        {/* <Route path="/WBS" element={<WBS />} />
        <Route path="/dashboard" element={<Dashboard />} /> */}
      </Routes>
    </Router>
  );
}
