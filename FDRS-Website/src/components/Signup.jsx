import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, database } from "../firebase";
import "../app.css";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [deptname, setDeptname] = useState("");
  const [type, setType] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [commanderName, setCommanderName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [personnelCount, setPersonnelCount] = useState("");
  const [operationalSince, setOperationalSince] = useState("");

  // Conditional fields
  const [battalionNumber, setBattalionNumber] = useState("");
  const [deploymentZone, setDeploymentZone] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [hospitalBeds, setHospitalBeds] = useState("");
  const [emergencyWard, setEmergencyWard] = useState(false);
  const [ambulanceCount, setAmbulanceCount] = useState("");
  const [vehicleCount, setVehicleCount] = useState("");
  const [coverageRadiusKm, setCoverageRadiusKm] = useState("");
  const [stationCode, setStationCode] = useState("");
  const [jurisdictionArea, setJurisdictionArea] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [locStatus, setLocStatus] = useState("");
  const navigate = useNavigate();

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocStatus("Geolocation not supported");
      return;
    }
    setLocStatus("Detecting...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toString());
        setLongitude(pos.coords.longitude.toString());
        setLocStatus("Location detected ✓");
      },
      (err) => {
        setLocStatus("Failed to detect location");
        console.error("Geolocation error:", err);
      },
      { enableHighAccuracy: true },
    );
  };

  const isForceType = ["ndrf", "crpf", "rpf"].includes(type);
  const isHospital = type === "hospital";
  const isFireDept = type === "firedepartment";
  const isPolice = type === "police";

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      const adminData = {
        deptname,
        type,
        address,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        commanderName,
        contactPhone,
        personnelCount: personnelCount ? parseInt(personnelCount) : 0,
        operationalSince,
        isNdrfCrpf: isForceType,
      };

      if (isForceType) {
        adminData.battalionNumber = battalionNumber;
        adminData.deploymentZone = deploymentZone;
        adminData.specialization = specialization;
      }
      if (isHospital) {
        adminData.hospitalBeds = hospitalBeds ? parseInt(hospitalBeds) : 0;
        adminData.emergencyWard = emergencyWard;
        adminData.ambulanceCount = ambulanceCount
          ? parseInt(ambulanceCount)
          : 0;
      }
      if (isFireDept) {
        adminData.vehicleCount = vehicleCount ? parseInt(vehicleCount) : 0;
        adminData.coverageRadiusKm = coverageRadiusKm
          ? parseFloat(coverageRadiusKm)
          : 0;
      }
      if (isPolice) {
        adminData.stationCode = stationCode;
        adminData.jurisdictionArea = jurisdictionArea;
      }

      const adminRef = ref(database, `admins/${user.uid}`);
      await set(adminRef, adminData);

      navigate("/dashboard");
    } catch (error) {
      setError("Error during signup. Please try again.");
      console.error("Error during signup:", error);
    }

    setLoading(false);
  };

  return (
    <div className="signup-page">
      <div className="container">
        <h2>Register Department</h2>
        <form onSubmit={handleSignup}>
          <div className="ccc1">
            <div>
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Department Name:</label>
              <input
                type="text"
                value={deptname}
                onChange={(e) => setDeptname(e.target.value)}
                required
              />
            </div>
            <div className="ty">
              <label>Department Type:</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
              >
                <option value="">Select Type</option>
                <option value="police">Police</option>
                <option value="hospital">Hospital</option>
                <option value="firedepartment">Fire Department</option>
                <option value="ndrf">NDRF</option>
                <option value="crpf">CRPF</option>
                <option value="rpf">RPF Military</option>
              </select>
            </div>
            <div>
              <label>Commander / Head Name:</label>
              <input
                type="text"
                value={commanderName}
                onChange={(e) => setCommanderName(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Contact Phone:</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="ccc2">
            <div>
              <label>Personnel Count:</label>
              <input
                type="number"
                value={personnelCount}
                onChange={(e) => setPersonnelCount(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Operational Since:</label>
              <input
                type="date"
                value={operationalSince}
                onChange={(e) => setOperationalSince(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Address:</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
            <div className="loc-detect-row">
              <label>Location (Lat / Lng):</label>
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <input
                  type="text"
                  placeholder="Latitude"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  style={{ flex: 1 }}
                />
                <input
                  type="text"
                  placeholder="Longitude"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={detectLocation}
                  style={{
                    whiteSpace: "nowrap",
                    padding: "8px 14px",
                    fontSize: "12px",
                  }}
                >
                  📍 Detect
                </button>
              </div>
              {locStatus && (
                <small
                  style={{
                    color: locStatus.includes("✓") ? "green" : "#888",
                    marginTop: "4px",
                  }}
                >
                  {locStatus}
                </small>
              )}
            </div>

            {/* Conditional fields for NDRF/CRPF/RPF */}
            {isForceType && (
              <>
                <div>
                  <label>Battalion Number:</label>
                  <input
                    type="text"
                    value={battalionNumber}
                    onChange={(e) => setBattalionNumber(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>Deployment Zone:</label>
                  <input
                    type="text"
                    value={deploymentZone}
                    onChange={(e) => setDeploymentZone(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>Specialization:</label>
                  <input
                    type="text"
                    placeholder="e.g. Flood Rescue, Counter-terrorism"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {/* Conditional fields for Hospital */}
            {isHospital && (
              <>
                <div>
                  <label>Total Beds:</label>
                  <input
                    type="number"
                    value={hospitalBeds}
                    onChange={(e) => setHospitalBeds(e.target.value)}
                    required
                  />
                </div>
                <div
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <label>Emergency Ward Available:</label>
                  <input
                    type="checkbox"
                    checked={emergencyWard}
                    onChange={(e) => setEmergencyWard(e.target.checked)}
                  />
                </div>
                <div>
                  <label>Ambulance Count:</label>
                  <input
                    type="number"
                    value={ambulanceCount}
                    onChange={(e) => setAmbulanceCount(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {/* Conditional fields for Fire Department */}
            {isFireDept && (
              <>
                <div>
                  <label>Vehicle Count:</label>
                  <input
                    type="number"
                    value={vehicleCount}
                    onChange={(e) => setVehicleCount(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>Coverage Radius (km):</label>
                  <input
                    type="number"
                    value={coverageRadiusKm}
                    onChange={(e) => setCoverageRadiusKm(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {/* Conditional fields for Police */}
            {isPolice && (
              <>
                <div>
                  <label>Station Code:</label>
                  <input
                    type="text"
                    value={stationCode}
                    onChange={(e) => setStationCode(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>Jurisdiction Area:</label>
                  <input
                    type="text"
                    value={jurisdictionArea}
                    onChange={(e) => setJurisdictionArea(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {error && <p style={{ color: "red" }}>{error}</p>}
            <button type="submit" disabled={loading}>
              Register Department
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;
