import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import WhyNeed from "./pages/WhyNeed.jsx";
import Donate from "./pages/Donate.jsx";
import NeedBlood from "./pages/NeedBlood.jsx";
import HelpSupport from "./pages/HelpSupport.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import NotFound from "./pages/NotFound.jsx";
import ChatBot from "./components/ChatBot";
import AdminPanel from "./pages/AdminPanel";

function App() {
  return (
    <div className="app-shell">
      <Navbar />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/why-need" element={<WhyNeed />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/donate"
            element={
              <ProtectedRoute allowedRoles={["donor"]}>
                <Donate />
              </ProtectedRoute>
            }
          />

          <Route
            path="/need-blood"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <NeedBlood />
              </ProtectedRoute>
            }
          />

          <Route
            path="/help-support"
            element={
              <ProtectedRoute>
                <HelpSupport />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />

       
      <ChatBot />
     
    </div>
  );
}

export default App;
