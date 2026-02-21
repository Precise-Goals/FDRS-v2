import React from "react";
import { motion } from "framer-motion";
import Robo from "./Robo";

export const About = () => {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const scaleUp = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <main className="w-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased selection:bg-primary/20 selection:text-primary font-[Inter]">
      <Robo />
      <div className="w-full px-[5%] mx-auto py-16 flex flex-col gap-20">
        {/* Hero Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="flex flex-col gap-8 max-w-7xl mx-auto w-full"
        >
          <div className="flex flex-col-reverse lg:flex-row justify-between items-center gap-12 lg:gap-20">
            <div className="flex flex-col gap-8 max-w-2xl">
              <motion.div
                variants={fadeUp}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 w-fit border border-blue-100 dark:border-blue-800"
              >
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="text-xs font-semibold text-primary dark:text-blue-300 tracking-wide uppercase">
                  Mission Statement
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-5xl lg:text-5xl font-black tracking-tight text-start text-slate-900 dark:text-white leading-[1.1]"
              >
                Empowering communities with rapid, decentralized disaster
                response.
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-lg lg:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-light"
              >
                FDRS (Falcons Disaster Response System) connects field
                responders, command centers, and donors in real-time. By
                bridging the gap between SOS signals and aid deployment, we
                ensure no call for help goes unanswered, leveraging cutting-edge
                technology for humanitarian aid.
              </motion.p>

              <motion.div variants={fadeUp} className="flex gap-4 mt-2">
                <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-lg font-bold text-sm hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-lg shadow-slate-200 dark:shadow-none flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">
                    rocket_launch
                  </span>
                  Get Started
                </button>
                <button className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-8 py-4 rounded-lg font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">
                    code
                  </span>
                  View on GitHub
                </button>
              </motion.div>
            </div>

            <motion.div
              variants={scaleUp}
              className="relative w-full max-w-lg lg:max-w-xl aspect-square flex-shrink-0"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent-teal/20 rounded-full blur-3xl opacity-60"></div>
              <img
                alt="Global Network Abstract"
                className="relative z-10 w-full h-full object-cover rounded-2xl shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 ring-4 ring-white dark:ring-slate-800"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7pDrbVw8eEuSiQI-6WNoZ4ZZ1CPdZx5AjoVH4UFTKNJGojJaSZ-AGFzlCUFYONX9eAvjR9BcGx-wGZRn-j7BdBV_MntqVrGwj7xUFzB2s3j7ib6lp_0jVr55x8QvTXKLZk07GZhRZurYyCjow4QgGamhM4qWYv4U_uRXpthX8Ngy7dkNd8fwvdr2ax1DP2Lv6GNzC2WEKkA3Lk4UBrRIhHVSlc8uUKgt-4HUlXcElKIhC0iCbj8hTPxrxjkd4ViQVqhY2V0biQyBJ"
              />
            </motion.div>
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto w-full"
        >
          <motion.div
            variants={fadeUp}
            className="bg-surface-light dark:bg-surface-dark p-10 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-soft group hover:-translate-y-1 transition-transform duration-300"
          >
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-4xl">groups</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">
              Potential Lives Impacted
            </p>
            <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              30M+
            </p>
            <p className="text-base text-slate-500 mt-4 font-normal leading-snug">
              Successfully coordinated rescue and relief operations across 14
              high-risk countries since our inception in 2020.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="bg-surface-light dark:bg-surface-dark p-10 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-soft group hover:-translate-y-1 transition-transform duration-300"
          >
            <div className="w-14 h-14 bg-teal-50 dark:bg-teal-900/20 rounded-xl flex items-center justify-center text-accent-teal mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-4xl">bolt</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">
              Sync Latency
            </p>
            <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              &lt; 1s
            </p>
            <p className="text-base text-slate-500 mt-4 font-normal leading-snug">
              Achieving near-instantaneous global data propagation, ensuring
              command centers see field updates as they happen.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="bg-surface-light dark:bg-surface-dark p-10 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-soft group hover:-translate-y-1 transition-transform duration-300"
          >
            <div className="w-14 h-14 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-accent-orange mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-4xl">
                translate
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">
              Global Reach
            </p>
            <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              100+
            </p>
            <p className="text-base text-slate-500 mt-4 font-normal leading-snug">
              Native language support breaks communication barriers, allowing
              local communities to request aid effectively.
            </p>
          </motion.div>
        </motion.section>

        {/* Core USP */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="max-w-7xl mx-auto w-full py-8"
        >
          <div className="flex flex-col gap-3 mb-12 text-center">
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-900/30 w-fit mx-auto border border-purple-100 dark:border-purple-800"
            >
              <span className="material-symbols-outlined text-sm text-purple-600">
                wifi_tethering_off
              </span>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-300 tracking-wide uppercase">
                Core USP
              </span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="text-4xl font-black text-slate-900 dark:text-white tracking-tight"
            >
              Innovative Fallback Communication
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
            >
              When cellular networks collapse during disasters, FDRS doesn't go
              dark. We leverage resilient legacy technologies like Radio Mesh
              Links (LoRa) and Bluetooth to create an unbreakable communication
              web.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            <motion.div
              variants={fadeUp}
              className="bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-8 rounded-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <span className="material-symbols-outlined text-9xl text-red-500">
                  signal_disconnected
                </span>
              </div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
                  <span className="material-symbols-outlined">cancel</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                  Standard Systems
                </h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-red-400 mt-1 shrink-0">
                    signal_cellular_off
                  </span>
                  <div>
                    <strong className="block text-slate-700 dark:text-slate-300">
                      Complete Blackout
                    </strong>
                    <span className="text-sm text-slate-500">
                      Relies 100% on cellular/internet infrastructure which
                      often fails first.
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-red-400 mt-1 shrink-0">
                    cloud_off
                  </span>
                  <div>
                    <strong className="block text-slate-700 dark:text-slate-300">
                      Cloud Dependency
                    </strong>
                    <span className="text-sm text-slate-500">
                      No local processing; requires server connection to sync
                      critical data.
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-red-400 mt-1 shrink-0">
                    hourglass_empty
                  </span>
                  <div>
                    <strong className="block text-slate-700 dark:text-slate-300">
                      High Latency
                    </strong>
                    <span className="text-sm text-slate-500">
                      Information bottlenecks occur when partial connectivity is
                      restored.
                    </span>
                  </div>
                </li>
              </ul>
            </motion.div>

            <motion.div
              variants={scaleUp}
              className="bg-white dark:bg-surface-dark border-2 border-primary/20 p-8 rounded-2xl shadow-xl shadow-primary/5 relative overflow-hidden transform md:-translate-y-4"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <span className="material-symbols-outlined text-9xl text-primary">
                  hub
                </span>
              </div>
              <div className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                FDRS Advantage
              </div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">
                    check_circle
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  FDRS Mesh Protocol
                </h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-1 shrink-0">
                    settings_input_antenna
                  </span>
                  <div>
                    <strong className="block text-slate-900 dark:text-white">
                      LoRa Mesh Networking
                    </strong>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Uses Long Range radio frequency (868/915 MHz) to hop
                      signals between devices up to 15km apart without internet.
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-1 shrink-0">
                    bluetooth_drive
                  </span>
                  <div>
                    <strong className="block text-slate-900 dark:text-white">
                      Bluetooth Bridging
                    </strong>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Creates local clusters of user devices to aggregate SOS
                      signals and pass them to the nearest LoRa node.
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-1 shrink-0">
                    sync_saved_locally
                  </span>
                  <div>
                    <strong className="block text-slate-900 dark:text-white">
                      Async Data Sync
                    </strong>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Stores data locally and automatically syncs to the cloud
                      the moment any single node in the mesh finds a connection.
                    </span>
                  </div>
                </li>
              </ul>
            </motion.div>
          </div>
        </motion.section>

        {/* Modular Architecture */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="@container max-w-7xl mx-auto w-full"
        >
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-3">
              <motion.h2
                variants={fadeUp}
                className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight"
              >
                Modular Architecture
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl"
              >
                FDRS integrates four core modules to ensure seamless
                communication between field responders and command centers. Each
                module is designed to operate independently yet sync perfectly
                within the ecosystem.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                variants={fadeUp}
                className="bg-surface-light dark:bg-surface-dark p-8 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:shadow-glow transition-all duration-300 cursor-default group relative overflow-hidden flex flex-col h-full"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <span className="material-symbols-outlined text-8xl text-primary">
                    smartphone
                  </span>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                  <span className="material-symbols-outlined text-3xl">
                    smartphone
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  Flutter App
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed flex-grow">
                  Cross-platform mobile solution for responders. Features
                  offline-first architecture, local database caching, and
                  intuitive UI for high-stress environments.
                </p>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="bg-surface-light dark:bg-surface-dark p-8 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:shadow-glow transition-all duration-300 cursor-default group relative overflow-hidden flex flex-col h-full"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <span className="material-symbols-outlined text-8xl text-primary">
                    desktop_windows
                  </span>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                  <span className="material-symbols-outlined text-3xl">
                    desktop_windows
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  Web Portal
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed flex-grow">
                  Real-time command center dashboard for HQ. Provides granular
                  control over resource allocation, live heatmap visualization
                  of SOS signals, and personnel tracking.
                </p>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="bg-surface-light dark:bg-surface-dark p-8 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:shadow-glow transition-all duration-300 cursor-default group relative overflow-hidden flex flex-col h-full"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <span className="material-symbols-outlined text-8xl text-primary">
                    token
                  </span>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                  <span className="material-symbols-outlined text-3xl">
                    token
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  Blockchain
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed flex-grow">
                  Immutable ledger on Ethereum ensuring 100% transparency. Every
                  donation and major supply chain movement is recorded, building
                  trust with international donors.
                </p>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="bg-surface-light dark:bg-surface-dark p-8 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:shadow-glow transition-all duration-300 cursor-default group relative overflow-hidden flex flex-col h-full"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <span className="material-symbols-outlined text-8xl text-primary">
                    android
                  </span>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                  <span className="material-symbols-outlined text-3xl">
                    android
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  Legacy Android
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed flex-grow">
                  Highly optimized native Java app specifically engineered for
                  older, low-resource devices (Android 4.4+) still common in
                  remote developing regions.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Graphs and Metrics section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto w-full"
        >
          <motion.div
            variants={fadeUp}
            className="bg-surface-light dark:bg-surface-dark p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col"
          >
            <div className="mb-8">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                SOS Response Latency
              </h3>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-4xl font-black text-slate-900 dark:text-white">
                  -45%
                </span>
                <span className="text-xs font-bold text-accent-teal bg-teal-50 dark:bg-teal-900/30 px-2.5 py-1 rounded text-teal-700 dark:text-teal-300 uppercase tracking-wide">
                  Significant Improvement
                </span>
              </div>
              <p className="text-base text-slate-500 mt-3">
                Dramatic reduction in the average time from signal generation to
                first responder acknowledgement, measured in milliseconds.
              </p>
            </div>
            <div className="flex-1 min-h-[250px] w-full relative">
              <svg
                className="w-full h-full overflow-visible"
                viewBox="0 0 400 150"
              >
                <line
                  stroke="#cbd5e1"
                  strokeWidth="1"
                  x1="0"
                  x2="400"
                  y1="150"
                  y2="150"
                ></line>
                <line
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                  x1="0"
                  x2="400"
                  y1="100"
                  y2="100"
                ></line>
                <line
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                  x1="0"
                  x2="400"
                  y1="50"
                  y2="50"
                ></line>
                <motion.path
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  d="M0,40 C50,40 100,60 150,90 C200,120 250,130 300,135 C350,140 400,142 400,142"
                  fill="none"
                  stroke="#137fec"
                  strokeLinecap="round"
                  strokeWidth="3"
                />
                <motion.path
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 0.2 }}
                  transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
                  d="M0,40 C50,40 100,60 150,90 C200,120 250,130 300,135 C350,140 400,142 400,142 L400,150 L0,150 Z"
                  fill="url(#gradient-blue)"
                />
                <defs>
                  <linearGradient
                    id="gradient-blue"
                    x1="0%"
                    x2="0%"
                    y1="0%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      style={{ stopColor: "#137fec", stopOpacity: 1 }}
                    ></stop>
                    <stop
                      offset="100%"
                      style={{ stopColor: "#137fec", stopOpacity: 0 }}
                    ></stop>
                  </linearGradient>
                </defs>
                <circle
                  className="hover:r-6 transition-all"
                  cx="0"
                  cy="40"
                  fill="#137fec"
                  r="5"
                ></circle>
                <circle
                  className="hover:r-6 transition-all"
                  cx="150"
                  cy="90"
                  fill="#137fec"
                  r="5"
                ></circle>
                <circle
                  className="hover:r-6 transition-all"
                  cx="300"
                  cy="135"
                  fill="#137fec"
                  r="5"
                ></circle>
              </svg>
              {/* <div className="flex justify-between mt-6 text-sm font-medium text-slate-400">
                <span>2020</span>
                <span>2021</span>
                <span>2022</span>
                <span>2023</span>
              </div> */}
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="bg-surface-light dark:bg-surface-dark p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col"
          >
            <div className="mb-8">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Donation Trust Index
              </h3>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-4xl font-black text-slate-900 dark:text-white">
                  +85%
                </span>
                <span className="text-xs font-bold text-accent-teal bg-teal-50 dark:bg-teal-900/30 px-2.5 py-1 rounded text-teal-700 dark:text-teal-300 uppercase tracking-wide">
                  Trust Growth
                </span>
              </div>
              <p className="text-base text-slate-500 mt-3">
                Year-over-year growth in donor confidence, directly correlated
                with our implementation of verified transparent transactions via
                Blockchain.
              </p>
            </div>
            <div className="flex-1 min-h-[250px] flex items-end justify-between gap-6 px-4">
              <div className="w-full flex flex-col items-center gap-3 group">
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg relative h-56 overflow-hidden">
                  <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: "30%" }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="absolute bottom-0 w-full bg-accent-teal opacity-40 group-hover:opacity-50 transition-opacity"
                  ></motion.div>
                </div>
                <span className="text-sm font-medium text-slate-400">2020</span>
              </div>
              <div className="w-full flex flex-col items-center gap-3 group">
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg relative h-56 overflow-hidden">
                  <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: "55%" }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                    className="absolute bottom-0 w-full bg-accent-teal opacity-60 group-hover:opacity-70 transition-opacity"
                  ></motion.div>
                </div>
                <span className="text-sm font-medium text-slate-400">2021</span>
              </div>
              <div className="w-full flex flex-col items-center gap-3 group">
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg relative h-56 overflow-hidden">
                  <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: "75%" }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                    className="absolute bottom-0 w-full bg-accent-teal opacity-80 group-hover:opacity-90 transition-opacity"
                  ></motion.div>
                </div>
                <span className="text-sm font-medium text-slate-400">2022</span>
              </div>
              <div className="w-full flex flex-col items-center gap-3 group">
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg relative h-56 overflow-hidden">
                  <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: "95%" }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                    className="absolute bottom-0 w-full bg-accent-teal group-hover:brightness-110 transition-all shadow-[0_0_15px_rgba(32,201,151,0.4)]"
                  ></motion.div>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-200">
                  2023
                </span>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Powered by Modern Technology */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="border-t border-slate-200 dark:border-slate-800 pt-12 max-w-7xl mx-auto w-full"
        >
          <p className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest mb-10">
            Powered by Modern Technology
          </p>
          <motion.div
            variants={staggerContainer}
            className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-60 grayscale hover:grayscale-0 transition-all duration-500"
          >
            <motion.div
              variants={scaleUp}
              className="flex flex-col items-center gap-3"
            >
              <span className="material-symbols-outlined text-5xl text-[#02569B]">
                flutter_dash
              </span>
              <span className="text-sm font-bold text-slate-600">Flutter</span>
            </motion.div>
            <motion.div
              variants={scaleUp}
              className="flex flex-col items-center gap-3"
            >
              <span className="material-symbols-outlined text-5xl text-[#61DAFB]">
                javascript
              </span>
              <span className="text-sm font-bold text-slate-600">React</span>
            </motion.div>
            <motion.div
              variants={scaleUp}
              className="flex flex-col items-center gap-3"
            >
              <span className="material-symbols-outlined text-5xl text-[#3C3C3D]">
                deployed_code
              </span>
              <span className="text-sm font-bold text-slate-600">Solidity</span>
            </motion.div>
            <motion.div
              variants={scaleUp}
              className="flex flex-col items-center gap-3"
            >
              <span className="material-symbols-outlined text-5xl text-[#339933]">
                terminal
              </span>
              <span className="text-sm font-bold text-slate-600">Node.js</span>
            </motion.div>
            <motion.div
              variants={scaleUp}
              className="flex flex-col items-center gap-3"
            >
              <span className="material-symbols-outlined text-5xl text-[#FF6C37]">
                cloud_queue
              </span>
              <span className="text-sm font-bold text-slate-600">AWS</span>
            </motion.div>
          </motion.div>
        </motion.section>
      </div>
    </main>
  );
};
