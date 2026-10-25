import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SubmitCertificate from "./pages/SubmitCertificate";
import TaskHub from "./pages/TaskHub";
import TaskWorkspace from "./pages/TaskWorkspace";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ProtectedRoute from "./components/routing/ProtectedRoute";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/certificates/new" element={<ProtectedRoute><SubmitCertificate /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><TaskHub /></ProtectedRoute>} />
        <Route path="/tasks/:taskId" element={<ProtectedRoute><TaskWorkspace /></ProtectedRoute>} />
        {/* Fallback to Home if route is not found */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  );
}
