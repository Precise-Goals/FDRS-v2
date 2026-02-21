import React from "react";
import img from "../assets/fdrss.png";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <div className="footwrp">
      <div className="r1">
        <div className="c1">
          <div className="rr1">
            <img src={img} alt="footer" />
            <h1>
              FALCONS DISASTER <br /> <span>RESPONSE SYSTEM</span>
            </h1>
          </div>
          <p className="rr2">
            Falcons Disaster Response System is a cutting-edge platform for
            swift and effective disaster management. It integrates advanced
            technologies for efficient coordination and rescue efforts,
            featuring SOS signal generation, AI-powered rescue operations, and
            geo-sensing for accurate disaster tracking and resource allocation.
          </p>
        </div>
        <div className="pseudo"></div>
        <ul className="lks">
          <li>
            <Link to="/fdrs-documentation">Know More</Link>
          </li>
          <li>
            <Link to="/fdrs-development-team">Our Team</Link>
          </li>
          <li>
            <Link to="/">Get Started</Link>
          </li>
          <li>
            <Link to="https://fdrs-donation.netlify.app/" target="_blank">
              Donation Platform
            </Link>
          </li>
        </ul>
      </div>
      <p className="r2">Copyright 2025 - Made by Falcons all rights reserved</p>
    </div>
  );
};
