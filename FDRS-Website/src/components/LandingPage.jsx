import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import iu1 from "../assets/h1.jpg";
import iu2 from "../assets/h2.jpg";
import iu3 from "../assets/h3.jpg";
import iu4 from "../assets/h4.jpg";
import { Footer } from "../container/Footer";

export const FadeInOutImage = ({ index }) => {
  const imageSources = [iu1, iu2, iu3, iu4];
  const imageUrl = imageSources[index];

  return <img src={imageUrl} alt={`studyHut-${index}`} className="fade" />;
};

export const LandingPage = () => {
  return (
    <>
      <div className="landing-page">
        <h1 className="st">
          FALCONS DISASTER
          <br /> <span>RESPONSE SYSTEM</span>
        </h1>
        <p className="sta">
          We streamline disaster response for rescuers, government departments,
          and the public, enabling efficient action.
        </p>
        <div className="auth-options">
          <Link to="/login" className="auth-button">
            Login
          </Link>
          <Link to="/signup" className="auth-button">
            Sign Up
          </Link>
          <Link to="https://fdrs-donations.vercel.app/" target="_blank" className="auth-button">Donation Platform</Link>
        </div> 
      </div>
      <div className="wrp">
        <img src={iu1} alt="bg" className="w" />
        <h1>FDRS</h1>
      </div>
    </>
  );
};
