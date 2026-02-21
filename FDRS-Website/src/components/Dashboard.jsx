import React, { useState, useEffect, useRef } from "react";
import { ref, onValue, update } from "firebase/database";
import { database, auth } from "../firebase";
import axios from "axios";
import "./style.css";
import MapComponent from "./Mappbox";
import { Link } from "react-router-dom";

function Dashboard() {
  const [signals, setSignals] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [adminDetails, setAdminDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [statusFilter, setStatusFilter] = useState("all");
  const [savingStatus, setSavingStatus] = useState("");

  const topRef = useRef(null);

  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth" });
    }
    const signalsRef = ref(database, "signals");
    const unsubscribe = onValue(signalsRef, async (snapshot) => {
      if (snapshot.exists()) {
        const signalsData = [];
        const locations = new Map();

        snapshot.forEach((signalSnapshot) => {
          const signalId = signalSnapshot.key;
          const signalData = signalSnapshot.val();

          if (
            signalData.latitude !== undefined &&
            signalData.longitude !== undefined
          ) {
            const key = `${Math.round(signalData.latitude)},${Math.round(
              signalData.longitude,
            )}`;
            const count = (locations.get(key) || 0) + 1;
            locations.set(key, count);

            signalsData.push({
              id: signalId,
              path: signalId,
              ...signalData,
              status: signalData.status || "critical",
              address: signalData.address || "Loading...",
            });
          } else if (typeof signalData === "object") {
            Object.entries(signalData).forEach(([nestedKey, nestedVal]) => {
              if (
                nestedVal &&
                nestedVal.latitude !== undefined &&
                nestedVal.longitude !== undefined
              ) {
                const key = `${Math.round(nestedVal.latitude)},${Math.round(
                  nestedVal.longitude,
                )}`;
                const count = (locations.get(key) || 0) + 1;
                locations.set(key, count);

                signalsData.push({
                  id: `${signalId}_${nestedKey}`,
                  path: `${signalId}/${nestedKey}`,
                  ...nestedVal,
                  status: nestedVal.status || "critical",
                  address: nestedVal.address || "Loading...",
                });
              }
            });
          }
        });

        const hotspotAreas = Array.from(locations.entries())
          .filter(([_, count]) => count >= 10)
          .map(([coords]) => {
            const [lat, lng] = coords.split(",");
            return {
              latitude: parseFloat(lat),
              longitude: parseFloat(lng),
              count: locations.get(coords),
            };
          });

        setHotspots(hotspotAreas);

        // Geocode addresses
        const signalsWithAddresses = [];
        const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

        for (const signal of signalsData) {
          if (signal.address && signal.address !== "Loading...") {
            signalsWithAddresses.push(signal);
            continue;
          }
          try {
            if (!googleApiKey) {
              signalsWithAddresses.push({
                ...signal,
                address: "API Key missing",
              });
              continue;
            }
            const response = await axios.get(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${signal.latitude},${signal.longitude}&key=${googleApiKey}`,
            );
            let formattedAddress = "Unknown Location";
            if (
              response.data.status === "OK" &&
              response.data.results.length > 0
            ) {
              formattedAddress = response.data.results[0].formatted_address;
            }
            signalsWithAddresses.push({
              ...signal,
              address: formattedAddress,
            });
          } catch (error) {
            console.error("Geocoding error:", error);
            signalsWithAddresses.push({
              ...signal,
              address: "Failed to fetch",
            });
          }
        }

        setSignals(signalsWithAddresses);
      }
    });

    const adminRef = ref(database, `admins/${auth.currentUser.uid}`);
    onValue(adminRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setAdminDetails(data);
        setEditData(data);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleEditToggle = () => {
    if (isEditing) {
      setEditData({ ...adminDetails });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    setSavingStatus("Saving...");
    try {
      const adminRef = ref(database, `admins/${auth.currentUser.uid}`);
      // Ensure lat/lng/personnelCount are stored as numbers
      const dataToSave = { ...editData };
      if (dataToSave.latitude)
        dataToSave.latitude = parseFloat(dataToSave.latitude) || 0;
      if (dataToSave.longitude)
        dataToSave.longitude = parseFloat(dataToSave.longitude) || 0;
      if (dataToSave.personnelCount)
        dataToSave.personnelCount = parseInt(dataToSave.personnelCount) || 0;
      await update(adminRef, dataToSave);
      setSavingStatus("Saved ✓");
      setIsEditing(false);
      setTimeout(() => setSavingStatus(""), 2000);
    } catch (err) {
      console.error("Save error:", err);
      setSavingStatus("Error saving");
    }
  };

  const handleFieldChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSignalStatus = async (signalPath, newStatus) => {
    try {
      const signalRef = ref(database, `signals/${signalPath}`);
      await update(signalRef, { status: newStatus });
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const filteredSignals =
    statusFilter === "all"
      ? signals
      : signals.filter((s) => s.status === statusFilter);

  const statusDot = (status) => {
    const colors = {
      critical: "#ef4444",
      dispatched: "#f59e0b",
      resolved: "#22c55e",
    };
    return (
      <span
        style={{
          display: "inline-block",
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          backgroundColor: colors[status] || "#9ca3af",
          marginRight: "6px",
        }}
      />
    );
  };

  const baseFields = [
    { key: "deptname", label: "Department Name" },
    { key: "type", label: "Department Type" },
    { key: "commanderName", label: "Commander / Head" },
    { key: "contactPhone", label: "Contact Phone" },
    { key: "personnelCount", label: "Personnel Count" },
    { key: "operationalSince", label: "Operational Since" },
    { key: "address", label: "Address" },
    { key: "latitude", label: "Latitude" },
    { key: "longitude", label: "Longitude" },
  ];

  const typeSpecificFields = () => {
    const t = adminDetails?.type || "";
    if (["ndrf", "crpf", "rpf"].includes(t)) {
      return [
        { key: "battalionNumber", label: "Battalion Number" },
        { key: "deploymentZone", label: "Deployment Zone" },
        { key: "specialization", label: "Specialization" },
      ];
    }
    if (t === "hospital") {
      return [
        { key: "hospitalBeds", label: "Total Beds" },
        { key: "emergencyWard", label: "Emergency Ward" },
        { key: "ambulanceCount", label: "Ambulance Count" },
      ];
    }
    if (t === "firedepartment") {
      return [
        { key: "vehicleCount", label: "Vehicle Count" },
        { key: "coverageRadiusKm", label: "Coverage Radius (km)" },
      ];
    }
    if (t === "police") {
      return [
        { key: "stationCode", label: "Station Code" },
        { key: "jurisdictionArea", label: "Jurisdiction Area" },
      ];
    }
    return [];
  };

  const detailFields = [...baseFields, ...typeSpecificFields()];

  return (
    <div className="dws" ref={topRef}>
      <div className="dashboard">
        <h1>Department Dashboard</h1>

        {/* Editable Admin Details - just below title */}
        {adminDetails && (
          <div className="admin-card">
            <div className="admin-card-header">
              <span className="admin-card-title">
                {adminDetails.deptname || "Department"}
              </span>
              <div className="admin-card-actions">
                {savingStatus && (
                  <span className="save-status">{savingStatus}</span>
                )}
                {isEditing ? (
                  <>
                    <button
                      className="btn-minimal btn-save"
                      onClick={handleSave}
                    >
                      Save
                    </button>
                    <button
                      className="btn-minimal btn-cancel"
                      onClick={handleEditToggle}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    className="btn-minimal btn-edit"
                    onClick={handleEditToggle}
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
            <div className="admin-card-body">
              {detailFields.map(({ key, label }) => (
                <div className="detail-row" key={key}>
                  <span className="detail-label">{label}</span>
                  {isEditing ? (
                    <input
                      className="detail-input"
                      value={editData[key] ?? ""}
                      onChange={(e) => handleFieldChange(key, e.target.value)}
                    />
                  ) : (
                    <span className="detail-value">
                      {typeof adminDetails[key] === "boolean"
                        ? adminDetails[key]
                          ? "Yes"
                          : "No"
                        : adminDetails[key] || "—"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hotspots */}
        {hotspots.length > 0 && (
          <div className="hotspots" style={{ marginTop: "16px" }}>
            <h2>⚠️ Critical Hotspots</h2>
            {hotspots.map((hotspot, index) => (
              <div key={index} className="hotspot">
                <strong>High Activity Area</strong>
                <p>Signals: {hotspot.count}</p>
                <p>
                  Location: {hotspot.latitude}, {hotspot.longitude}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Full-width Map */}
        <div className="map-full">
          <MapComponent />
        </div>

        {/* Signal Management Table */}
        <div className="signal-mgmt">
          <h2 className="signal-mgmt-title">Signal Management</h2>

          <div className="status-tabs">
            {["all", "critical", "dispatched", "resolved"].map((tab) => (
              <button
                key={tab}
                className={`status-tab ${statusFilter === tab ? "active" : ""}`}
                onClick={() => setStatusFilter(tab)}
              >
                {tab === "all"
                  ? "All"
                  : tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span className="tab-count">
                  {tab === "all"
                    ? signals.length
                    : signals.filter((s) => s.status === tab).length}
                </span>
              </button>
            ))}
          </div>

          <div className="signal-table-wrap">
            <table className="signal-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>UID</th>
                  <th>Timestamp</th>
                  <th>Location</th>
                  <th>Coordinates</th>
                  <th>Status</th>
                  <th>Action</th>
                  <th>Map</th>
                </tr>
              </thead>
              <tbody>
                {filteredSignals.length === 0 && (
                  <tr>
                    <td
                      colSpan="8"
                      style={{
                        textAlign: "center",
                        padding: "32px",
                        color: "#9ca3af",
                      }}
                    >
                      No signals found
                    </td>
                  </tr>
                )}
                {filteredSignals.map((signal, idx) => (
                  <tr
                    key={signal.id}
                    className={`signal-row status-${signal.status}`}
                  >
                    <td className="cell-num">{idx + 1}</td>
                    <td className="cell-uid">
                      {signal.id.substring(0, 12)}...
                    </td>
                    <td className="cell-time">
                      {signal.timestamp
                        ? new Date(signal.timestamp).toLocaleString()
                        : "—"}
                    </td>
                    <td className="cell-loc">{signal.address}</td>
                    <td className="cell-coord">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${signal.latitude},${signal.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#4b5563",
                          textDecoration: "underline",
                        }}
                      >
                        {signal.latitude?.toFixed(4)},{" "}
                        {signal.longitude?.toFixed(4)}
                      </a>
                    </td>
                    <td className="cell-status">
                      {statusDot(signal.status)}
                      {signal.status}
                    </td>
                    <td className="cell-action">
                      <select
                        className="status-select"
                        value={signal.status}
                        onChange={(e) =>
                          handleSignalStatus(signal.path, e.target.value)
                        }
                      >
                        <option value="critical">Critical</option>
                        <option value="dispatched">Dispatched</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                    <td>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${signal.latitude},${signal.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open in Google Maps"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "32px",
                          height: "32px",
                          borderRadius: "6px",
                          background: "#f3f4f6",
                          textDecoration: "none",
                          fontSize: "16px",
                          transition: "background 0.2s",
                        }}
                      >
                        📍
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
