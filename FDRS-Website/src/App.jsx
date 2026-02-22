import React, { useEffect, useState } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Signup from "./components/Signup";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./contexts/AuthContext";
import "mapbox-gl/dist/mapbox-gl.css";
import { FadeInOutImage, LandingPage } from "./components/LandingPage";
import { Navbar } from "./container/Navbar";
import { Teams } from "./container/Teams";
import { About } from "./container/About";
import { Footer } from "./container/Footer";
import Chatbot from "./components/Bot";
import Robo from "./container/Robo";
import { ImpactAnalysis } from "./container/ImpactAnalysis";
import { Diso } from "./components/Diso";
// import Robo from "./container/Robo";

function App() {
  return (
    <ChakraProvider>
      <AuthProvider>
        <BrowserRouter
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/fdrs-documentation" element={<About />} />
            <Route path="/fdrs-development-team" element={<Teams />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            {/* <Route path="/fdrs-blockchain-donation" element={<Blockch />} /> */}
            <Route path="/diso" element={<Diso />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                  <ImpactAnalysis />
                  <Chatbot />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
