import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  AlertTriangle,
  Building2,
  Map as MapIcon,
  Zap,
  Users,
  Activity,
  ArrowRight,
  Flame,
  Wind,
  Mountain,
  DollarSign,
  Clock,
  ShieldAlert,
  FileText,
} from "lucide-react";

import "./ImpactAnalysis.css";
import earthquakeData from "../components/Disasters/earthquake.json";
import cycloneData from "../components/Disasters/cyclone.json";
import urbanfireData from "../components/Disasters/urbanfire.json";
import landslideData from "../components/Disasters/landslide.json";

const API_ENDPOINTS = {
  earthquake: "https://chgauravpc.pythonanywhere.com/api/earthquake",
  cyclone: "https://chgauravpc.pythonanywhere.com/api/cyclone",
  landslide: "https://chgauravpc.pythonanywhere.com/api/landslide",
  urbanfire: "https://chgauravpc.pythonanywhere.com/api/urbanfire",
};

const FALLBACKS = {
  earthquake: earthquakeData,
  cyclone: cycloneData,
  landslide: landslideData,
  urbanfire: urbanfireData,
};

const DISASTER_OPTS = [
  { id: "earthquake", label: "Earthquake", icon: Activity },
  { id: "cyclone", label: "Cyclone", icon: Wind },
  { id: "landslide", label: "Landslide", icon: Mountain },
  { id: "urbanfire", label: "Urban Fire", icon: Flame },
];

export const ImpactAnalysis = () => {
  const [selectedType, setSelectedType] = useState("earthquake");
  const [useLiveApi, setUseLiveApi] = useState(false);
  const [disasterData, setDisasterData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const triggerHaptic = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      if (!useLiveApi) {
        if (isMounted) {
          setDisasterData(FALLBACKS[selectedType]);
          setIsLoading(false);
        }
        return;
      }
      try {
        const response = await axios.get(API_ENDPOINTS[selectedType], {
          timeout: 5000,
        });
        if (isMounted) {
          setDisasterData(response.data);
          setIsLoading(false);
        }
      } catch (err) {
        console.warn(
          `[API WARNING] Endpoint ${API_ENDPOINTS[selectedType]} failed or timed out. Falling back to local high-fidelity JSON data.`,
        );
        if (isMounted) {
          setDisasterData(FALLBACKS[selectedType]);
          setIsLoading(false);
        }
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [selectedType, useLiveApi]);

  if (isLoading || !disasterData) {
    return (
      <div
        id="ia"
        className="ia-container"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="ia-max-width-wrapper" style={{ width: "100%" }}>
          <div
            style={{
              height: "4rem",
              width: "100%",
              maxWidth: "42rem",
              margin: "0 auto 2rem",
              backgroundColor: "var(--ia-gray-200)",
              borderRadius: "1rem",
              animation: "ia-pulse-monochrome 2s infinite",
            }}
          ></div>
          <div
            style={{
              height: "8rem",
              backgroundColor: "var(--ia-gray-100)",
              borderRadius: "1rem",
              animation: "ia-pulse-monochrome 2s infinite",
            }}
          ></div>
          <div className="ia-bento-grid">
            <div
              className="ia-col-span-4"
              style={{
                height: "18.75rem",
                backgroundColor: "var(--ia-gray-100)",
                borderRadius: "1rem",
                animation: "ia-pulse-monochrome 2s infinite",
              }}
            ></div>
            <div
              className="ia-col-span-4"
              style={{
                height: "18.75rem",
                backgroundColor: "var(--ia-gray-100)",
                borderRadius: "1rem",
                animation: "ia-pulse-monochrome 2s infinite",
              }}
            ></div>
            <div
              className="ia-col-span-4"
              style={{
                height: "18.75rem",
                backgroundColor: "var(--ia-gray-100)",
                borderRadius: "1rem",
                animation: "ia-pulse-monochrome 2s infinite",
              }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  const assessment = disasterData?.assessment || {};
  const meta = disasterData?.metadata || {};
  const inputLoc = meta?.input || { latitude: 0, longitude: 0 };

  // Human Impact
  const popRisk =
    assessment["Estimated Affected Population"]?.["Risk categories"] ||
    assessment["Estimated Affected Population"]?.[
      "Risk categories (trapped, injured, displaced)"
    ] ||
    {};
  const displacedText = popRisk?.Displaced || "Unknown";
  const trappedText = popRisk?.Trapped || "Unknown";
  const estCas = assessment["Estimated Casualties"] || {};
  const fatalityText =
    estCas["Potential fatalities estimate"] ||
    estCas["Potential fatalities estimate (range)"] ||
    "Unknown";
  const injuredRaw =
    estCas["Potential injured estimate"] ||
    estCas["Potential injured estimate (range)"] ||
    "Unknown";

  const textDesc =
    assessment["Textual Description of Damage"] ||
    "No textual analysis available.";
  const econ = assessment["Economic Impact Estimate"] || {};

  let actionItems = [];
  const recs = assessment["Emergency Response Recommendations"];
  if (Array.isArray(recs)) {
    actionItems = recs.map((r) => r.Action || r.Details || JSON.stringify(r));
  } else if (typeof recs === "object") {
    const arr =
      recs["Immediate actions needed"] ||
      recs["Immediate actions needed (prioritized)"] ||
      [];
    if (Array.isArray(arr)) {
      actionItems = arr;
    } else if (typeof arr === "string") {
      actionItems = [arr];
    } else {
      actionItems = Object.values(arr);
    }
  }

  const timelines = assessment["Recovery Timeline Estimate"] || {};
  const bldgDmg =
    assessment["Infrastructure Damage Assessment"]?.["Buildings"] ||
    assessment["Building Destruction Percentage"] ||
    "Unknown status";
  const roadDmg =
    assessment["Infrastructure Damage Assessment"]?.["Roads"] ||
    assessment["Road Accessibility Status"]?.[
      "Critical access routes affected"
    ] ||
    "Impassable";
  const pwrDmg =
    assessment["Infrastructure Damage Assessment"]?.["Other infrastructure"] ||
    assessment["Additional Numerical Metrics"]?.[
      "Water/power outage percentage"
    ] ||
    "Offline";
  const severityScore =
    assessment["Damage Severity Score"] ||
    assessment["Disaster Intensity Rating"] * 10 ||
    "NA";

  const intensityRating = assessment["Disaster Intensity Rating"] || "N/A";
  const areaAffected =
    assessment["Additional Numerical Metrics"]?.["Area affected (km²)"] ||
    "Unknown";
  const critInfra =
    assessment["Additional Numerical Metrics"]?.[
      "Critical infrastructure damaged"
    ] || "Unknown";

  const secRisksRaw = assessment["Secondary Disaster Risks"] || [];
  const secRisks = Array.isArray(secRisksRaw) ? secRisksRaw : [];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <div id="ia" className="ia-container">
      <div className="ia-max-width-wrapper">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="ia-selector-strip"
        >
          {DISASTER_OPTS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                setSelectedType(opt.id);
                triggerHaptic();
              }}
              className={`ia-selector-btn ${selectedType === opt.id ? "active" : ""}`}
            >
              <opt.icon size={16} strokeWidth={2} />
              {opt.label}
            </button>
          ))}
          <div className="ia-toggle-wrapper">
            <span className={`ia-toggle-label ${!useLiveApi ? "active" : ""}`}>
              Local API
            </span>
            <button
              className="ia-toggle-btn"
              data-state={useLiveApi ? "on" : "off"}
              onClick={() => {
                setUseLiveApi(!useLiveApi);
                triggerHaptic();
              }}
            >
              <span className="ia-toggle-thumb"></span>
            </button>
            <span className={`ia-toggle-label ${useLiveApi ? "active" : ""}`}>
              Live API
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          key={`header-${selectedType}`}
          className="ia-card ia-header"
        >
          <div className="ia-header-left">
            <div className="ia-header-title-wrapper">
              <div className="ia-header-icon">
                <AlertTriangle size={24} strokeWidth={2} />
              </div>
              <h1 className="ia-title">
                {assessment["Disaster Type Identified"] ||
                  disasterData.disaster_type?.toUpperCase()}
              </h1>
            </div>
            <div className="ia-header-tags">
              <span className="ia-tag">
                <MapIcon size={14} />
                {inputLoc.latitude.toFixed(4)}, {inputLoc.longitude.toFixed(4)}
              </span>
              <span className="ia-tag">
                <Activity size={14} /> AI Analysis
              </span>
              <span className="ia-tag">
                {assessment["Damage Severity Category"]} Range
              </span>
            </div>
          </div>
          <div className="ia-header-right">
            <div>
              <p className="ia-severity-label">Severity Score</p>
              <div className="ia-severity-score">{severityScore}</div>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`bento-${selectedType}`}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="ia-bento-grid"
          >
            {/* --- KEY METRICS STRIP --- */}
            <motion.div
              variants={itemVariants}
              className="ia-col-span-12 ia-metrics-strip"
            >
              <div className="ia-metric-item">
                <p className="ia-metric-item-label">Area Affected</p>
                <p className="ia-metric-item-val">{areaAffected}</p>
              </div>
              <div className="ia-metric-item">
                <p className="ia-metric-item-label">Crit. Infra Damage</p>
                <p className="ia-metric-item-val red-text">{critInfra}</p>
              </div>
              <div className="ia-metric-item">
                <p className="ia-metric-item-label">Est. Displaced</p>
                <p className="ia-metric-item-val">{displacedText}</p>
              </div>
              <div className="ia-metric-item">
                <p className="ia-metric-item-label">Intensity Rating</p>
                <p className="ia-metric-item-val">{intensityRating} / 10</p>
              </div>
              <div className="ia-metric-item">
                <p className="ia-metric-item-label">Sec. Disaster Risks</p>
                <p className="ia-metric-item-val">
                  {secRisks.length} Identified
                </p>
              </div>
            </motion.div>

            {/* --- ROW 1 --- */}
            <motion.div
              variants={itemVariants}
              className="ia-col-span-5"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              <div className="ia-card hoverable" style={{ flexGrow: 1 }}>
                <div className="ia-card-header">
                  <h3 className="ia-card-title">
                    <div className="ia-icon-box">
                      <Users size={18} strokeWidth={2} />
                    </div>
                    Human Impact
                  </h3>
                </div>
                <div className="ia-card-content">
                  <div>
                    <p className="ia-metric-label">Total Displaced</p>
                    <p className="ia-metric-val-lg">{displacedText}</p>
                  </div>
                  <div>
                    <p className="ia-metric-label">Casualty Estimate</p>
                    <p className="ia-metric-val-md ia-text-red">
                      {fatalityText}
                    </p>
                  </div>
                  <div className="ia-metric-subtext-box">
                    <p className="ia-metric-subtext">
                      <strong>Trapped/Injured:</strong> {trappedText} /{" "}
                      {injuredRaw}
                    </p>
                  </div>
                </div>
              </div>

              <div className="ia-card hoverable" style={{ flexGrow: 1 }}>
                <div className="ia-card-header">
                  <h3 className="ia-card-title">
                    <div className="ia-icon-box">
                      <DollarSign size={18} strokeWidth={2} />
                    </div>
                    Economic Assessment
                  </h3>
                </div>
                <div className="ia-card-content">
                  <div>
                    <p className="ia-metric-label">Total Impact Range</p>
                    <p className="ia-metric-val-lg">
                      {econ["Total economic impact range"] || "Unassessed"}
                    </p>
                  </div>
                  <div>
                    <p className="ia-metric-label">Infrastructure Damage</p>
                    <p className="ia-metric-val-sm">
                      {econ["Estimated infrastructure damage cost"] ||
                        "Pending"}
                    </p>
                  </div>
                  <div className="ia-divider"></div>
                  <div>
                    <p className="ia-metric-label">Property Loss</p>
                    <p className="ia-metric-val-sm">
                      {econ["Property losses estimate"] || "Pending"}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="ia-col-span-7 ia-card ia-dark-card hoverable"
            >
              <div className="ia-card-header">
                <h3 className="ia-card-title">
                  <div className="ia-icon-box">
                    <FileText size={18} />
                  </div>
                  Assessment Overview
                </h3>
              </div>
              <div
                className="ia-card-content ia-custom-scroll"
                style={{ overflowY: "auto" }}
              >
                <p
                  className="ia-dark-card-text"
                  style={{
                    fontSize: "1.0625rem",
                    lineHeight: "1.45",
                    letterSpacing: "0.01em",
                    textAlign: "justify",
                  }}
                >
                  {textDesc}
                </p>
                <img
                  src="/img.avif"
                  alt="image"
                  style={{
                    height: "100%",
                    width: "100%",
                    borderRadius: "4rem",
                  }}
                />
              </div>
            </motion.div>

            {/* --- ROW 2: INFRASTRUCTURE --- */}
            <motion.div variants={itemVariants} className="ia-col-span-3">
              <InfraSmallCard
                icon={<Building2 size={18} />}
                title="Structures"
                status={
                  bldgDmg.includes("Destroyed") || bldgDmg.includes("Severe")
                    ? "Critical"
                    : "Compromised"
                }
                desc={bldgDmg}
              />
            </motion.div>
            <motion.div variants={itemVariants} className="ia-col-span-3">
              <InfraSmallCard
                icon={<MapIcon size={18} />}
                title="Transit Maps"
                status={
                  roadDmg.includes("Impassable") || roadDmg.includes("Critical")
                    ? "Impassable"
                    : "Restricted"
                }
                desc={roadDmg}
              />
            </motion.div>
            <motion.div variants={itemVariants} className="ia-col-span-3">
              <InfraSmallCard
                icon={<Zap size={18} />}
                title="City Utilities"
                status={
                  pwrDmg.includes("Offline") || pwrDmg.includes("Critical")
                    ? "Offline"
                    : "Unstable"
                }
                desc={pwrDmg}
              />
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="ia-col-span-3 ia-risks-card hoverable"
            >
              <h3 className="ia-risks-title">
                <ShieldAlert size={18} /> Secondary Threats
              </h3>
              <div className="ia-risks-list ia-custom-scroll">
                {secRisks.map((risk, idx) => {
                  const level = risk["Risk Level"] || risk["Risk level"];
                  const isHigh = level === "High";
                  return (
                    <div key={idx} className="ia-risk-item">
                      <div className="ia-risk-item-row">
                        <span className="ia-risk-name">{risk.Risk}</span>
                        <span
                          className={`ia-status-pill ${isHigh ? "red-pill" : ""}`}
                        >
                          {level}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {secRisks.length === 0 && (
                  <p className="ia-empty-text">
                    No secondary risks identified.
                  </p>
                )}
              </div>
            </motion.div>

            {/* --- ROW 3: RECOVERY & ACTIONS --- */}
            <motion.div
              variants={itemVariants}
              className="ia-col-span-8 ia-action-card hoverable"
            >
              <div className="ia-relative ia-z-10" style={{ flexGrow: 1 }}>
                <h3 className="ia-action-title">
                  <Activity size={20} strokeWidth={2} />
                  Action Protocols
                </h3>
                <ul className="ia-action-list">
                  {actionItems.slice(0, 4).map((action, idx) => (
                    <li key={idx} className="ia-action-item">
                      <ArrowRight
                        size={16}
                        className="ia-text-muted"
                        style={{ marginTop: "0.125rem", flexShrink: 0 }}
                      />
                      <span>
                        {typeof action === "string"
                          ? action
                          : action.Details || action.Action}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={triggerHaptic}
                className="ia-button ia-button-red"
              >
                Dispatch First Responders{" "}
                <ArrowRight size={16} strokeWidth={2} />
              </button>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="ia-col-span-4 ia-card hoverable"
            >
              <div className="ia-card-header">
                <h3 className="ia-card-title">
                  <div className="ia-icon-box">
                    <Clock size={18} strokeWidth={2} />
                  </div>
                  Recovery Timeline
                </h3>
              </div>
              <div className="ia-timeline-track">
                <div className="ia-timeline-item">
                  <div className="ia-timeline-dot red-dot"></div>
                  <div className="ia-timeline-content">
                    <p className="ia-timeline-content-label red-text">
                      Short-term (0-7 d)
                    </p>
                    <p className="ia-timeline-content-desc">
                      {timelines["Short-term (0-7 days)"] || "Immediate SAR"}
                    </p>
                  </div>
                </div>

                <div className="ia-timeline-item">
                  <div className="ia-timeline-dot"></div>
                  <div className="ia-timeline-content">
                    <p className="ia-timeline-content-label">Medium (1-3 mo)</p>
                    <p className="ia-timeline-content-desc">
                      {timelines["Medium-term (1-3 months)"] ||
                        "Debris & Temp Housing"}
                    </p>
                  </div>
                </div>

                <div className="ia-timeline-item">
                  <div className="ia-timeline-dot"></div>
                  <div className="ia-timeline-content">
                    <p className="ia-timeline-content-label">
                      Long-term (3+ mo)
                    </p>
                    <p className="ia-timeline-content-desc">
                      {timelines["Long-term (3+ months)"] ||
                        "Full reconstruction"}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// Reusable Small Infra Card
const InfraSmallCard = ({ icon, title, status, desc }) => {
  const isCritical =
    status === "Critical" ||
    status === "Impassable" ||
    status === "Offline" ||
    status === "High";

  return (
    <div className="ia-infra-small hoverable">
      <div className="ia-infra-header">
        <div className="ia-infra-title-wrap">
          <div className="ia-infra-icon">{icon}</div>
          <h3 className="ia-infra-title">{title}</h3>
        </div>
        <span className={`ia-status-pill ${isCritical ? "red-pill" : ""}`}>
          {status}
        </span>
      </div>
      <div
        className="ia-infra-desc ia-custom-scroll"
        style={{ overflowY: "auto", flexGrow: 1 }}
      >
        <p>{desc}</p>
      </div>
    </div>
  );
};
