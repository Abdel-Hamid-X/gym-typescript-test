import Navbar from "@/scenes/navbar"
import Home from "@/scenes/home"
import Benefits from "@/scenes/benefits"
import OurClasses from "@/scenes/ourClasses"
import ContactUs from "@/scenes/contactUs"
import Footer from"@/scenes/footer"
import { useEffect, useState } from "react";
import { SelectedPage } from "@/shared/types";
import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/auth/AuthContext";
import ProtectedRoute from "@/auth/ProtectedRoute";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Profile from "@/pages/Profile";
import SubscriptionPlans from "@/pages/SubscriptionPlans";
import NotFound from "@/pages/NotFound";
import AdminRoute from "@/auth/AdminRoute";
import AdminDashboard from "@/pages/AdminDashboard";

const LandingPage = () => {
  const [
    selectedPage,
    setselectedPage] = useState<SelectedPage>(
      SelectedPage.Home
    );
  const [
    isTopOfPage,
    setIsTopOfPage] = useState(
      true
    );
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY === 0) {
        setIsTopOfPage(true);
        setselectedPage(SelectedPage.Home);
      }
      if (window.scrollY !== 0)
        setIsTopOfPage(false);
    }
    window.addEventListener(
      "scroll",
      handleScroll
    );
    return () => window.removeEventListener(
      "scroll",
      handleScroll
    );
  }, []
  );

  return (
    <>
      <div className="App bg-gray-20">
        <Navbar
          istopofpage={isTopOfPage}
          selectedPage={selectedPage}
          setselectedPage={setselectedPage}
        />

        <Home
          setselectedPage={setselectedPage}
        />
        <Benefits
          setselectedPage={setselectedPage}
        />
        <OurClasses
          setselectedPage={setselectedPage}
        />
        <ContactUs
          setselectedPage={setselectedPage}
        />
        <Footer/>

      </div>
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscriptions"
          element={
            <ProtectedRoute role="member">
              <SubscriptionPlans />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
