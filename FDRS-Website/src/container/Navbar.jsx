import { Link, useNavigate } from "react-router-dom";
import React from "react";
import img from "../assets/fdrss.png";
import { useAuth } from "../contexts/AuthContext";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { FanIcon } from "lucide-react";

export const Navbar = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <nav className="nav">
      <div className="p1"></div>
      <div className="PUDO"></div>
      <ul className="l">
        <li>
          <Link to="/">
            <img src={img} alt="logo" className="logo" />
          </Link>
        </li>
        <li>
          <ul className="l1">
            <li>
              <Link to="/">Home</Link>
            </li>

            <li>
              <Link to="/fdrs-documentation">Know More</Link>
            </li>

            <li>
              <Link to="https://fdrs-donations.vercel.app/" target="_blank">
                Relief Platform
              </Link>
            </li>
            {currentUser ? (
              <li>
                <Link to="/dashboard">Board</Link>
              </li>
            ) : (
              <></>
            )}
            {currentUser ? (
              <li onClick={handleSignOut}>
                <Link>Sign Out</Link>
              </li>
            ) : (
              <li>
                <Link to="/login">Login</Link>
              </li>
            )}
            <li>
              <Link to='/diso'>
                <img className="diso" src="/diso.png" style={{}} alt="diso" />
              </Link>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  );
};
