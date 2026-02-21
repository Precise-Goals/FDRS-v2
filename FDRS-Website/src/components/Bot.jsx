import { Volume } from "lucide-react";
import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(true);
  const audioRef = useRef(null);

  const speakText = async (text) => {
    const sarvamKey = import.meta.env.VITE_SARVAM_API;
    if (!sarvamKey) {
      console.warn("VITE_SARVAM_API key missing, skipping TTS");
      return;
    }

    // Strip markdown for cleaner speech
    const cleanText = text
      .replace(/[#*_`~\[\]()>!|-]/g, "")
      .replace(/\n+/g, ". ")
      .trim()
      .substring(0, 500); // Sarvam has a text length limit

    if (!cleanText) return;

    try {
      setIsSpeaking(true);
      const res = await fetch("https://api.sarvam.ai/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-subscription-key": sarvamKey,
        },
        body: JSON.stringify({
          inputs: [cleanText],
          target_language_code: "en-IN",
          speaker: "shubh",
          model: "bulbul:v3",
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        console.error("Sarvam TTS error:", res.status, errBody);
        setIsSpeaking(false);
        return;
      }

      const data = await res.json();
      if (data.audios && data.audios[0]) {
        // Stop any currently playing audio
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }

        const audio = new Audio(`data:audio/wav;base64,${data.audios[0]}`);

        // Use Web Audio API to boost volume beyond 100%
        const audioCtx = new (
          window.AudioContext || window.webkitAudioContext
        )();
        const source = audioCtx.createMediaElementSource(audio);
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = 3.0; // 300% volume
        source.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        audioRef.current = audio;
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => setIsSpeaking(false);
        await audio.play();
      } else {
        setIsSpeaking(false);
      }
    } catch (err) {
      console.error("TTS error:", err);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage = {
      content: inputMessage,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://api.together.xyz/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_TOGETHER_API}`,
          },
          body: JSON.stringify({
            model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
            messages: [
              {
                role: "system",
                content: `You are DISO, an expert AI consultant for the FDRS (Flood & Disaster Response System). You ONLY assist with disaster management, calamity response, emergency preparedness, life safety, security threats, and related topics such as:
- Natural disasters (floods, earthquakes, cyclones, tsunamis, landslides, droughts, wildfires)
- Man-made disasters (industrial accidents, building collapses, chemical spills)
- Emergency response protocols and SOPs
- Search and rescue operations
- Evacuation planning and shelter management
- First aid and medical emergencies during disasters
- Disaster risk reduction and mitigation strategies
- Early warning systems and monitoring
- Relief coordination (NDRF, CRPF, RPF, Police, Fire Brigade, Hospitals)
- Post-disaster rehabilitation and recovery

If the user asks anything NOT related to the above topics, you MUST respond ONLY with:
"I can only assist with handling, monitoring, and answering queries related to calamities, disasters, and danger-to-life safety & security. Please ask me something related to disaster management."

Do NOT answer general knowledge, coding, entertainment, or any other off-topic questions. Stay strictly in your domain. Keep answers concise, actionable, and professional.`,
              },
              ...messages.map((msg) => ({
                role: msg.sender === "user" ? "user" : "assistant",
                content: msg.content,
              })),
              { role: "user", content: inputMessage },
            ],
            temperature: 0.7,
            max_tokens: 1000,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();

      if (!data.choices || !data.choices[0]?.message?.content) {
        throw new Error("Invalid response format from API");
      }

      const botContent = data.choices[0].message.content;

      const botResponse = {
        content: botContent,
        sender: "bot",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botResponse]);

      // Auto-speak the bot response
      speakText(botContent);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        content: `Error: ${error.message}`,
        sender: "bot",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const MessageContent = ({ content }) => (
    <div style={{ overflow: "auto" }}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1
              style={{
                fontSize: "1.8em",
                fontWeight: "bold",
                margin: "0.5em 0",
              }}
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              style={{
                fontSize: "1.5em",
                fontWeight: "bold",
                margin: "0.5em 0",
              }}
            >
              {children}
            </h2>
          ),
          p: ({ children }) => <p style={{ margin: "0 0" }}>{children}</p>,
          ul: ({ children }) => (
            <ul style={{ marginLeft: "1.5em", listStyle: "disc" }}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol style={{ marginLeft: "1.5em" }}>{children}</ol>
          ),
          li: ({ children }) => (
            <li style={{ margin: "0.2em 0" }}>{children}</li>
          ),
          strong: ({ children }) => (
            <strong style={{ fontWeight: "bold" }}>{children}</strong>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );

  return (
    <div className="qora" style={{ margin: "0 15%", padding: "20px" }}>
      <h2 className="disopfp">
        <img className="diso" src="/diso.png" alt="diso" /> Diso Consultant
      </h2>
      <div
        style={{
          width: "100%",
          height: "400px",
          overflowY: "auto",
          border: " 1px solid #333",
          padding: " 20px",
          margin: " 2% 0",
          borderRadius: " 5rem",
        }}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              marginBottom: "0",
              padding: "0.35em 1.75em",
              // backgroundColor: message.sender === "user" ? "#f0f0f0" : "#fff",
              backgroundColor: "#fff",
              borderRadius: "5px",
            }}
          >
            <div
              style={{
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ color: "#000", fontSize: "1em" }}>
                {message.sender === "user" ? "You" : "FDRS"}:
              </span>
              {message.sender === "bot" && (
                <button
                  onClick={() =>
                    isSpeaking ? stopSpeaking() : speakText(message.content)
                  }
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "16px",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    opacity: 0.6,
                    transition: "opacity 0.2s",
                  }}
                  onMouseEnter={(e) => (e.target.style.opacity = 1)}
                  onMouseLeave={(e) => (e.target.style.opacity = 0.6)}
                  title={isSpeaking ? "Stop speaking" : "Read aloud"}
                >
                  {isSpeaking ? "🔇" : "🔊"}
                </button>
              )}
            </div>
            <MessageContent content={message.content} />
            <div style={{ fontSize: "0.8em", color: "#666", marginTop: "0" }}>
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ padding: "0.35em 1.75em" }}>Processing...</div>
        )}
      </div>

      <form
        onSubmit={handleSendMessage}
        style={{ display: "flex", gap: "10px" }}
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "2rem",
            border: "1px solid #ccc",
          }}
        />
        <button
          type="submit"
          className="btnct"
          disabled={isLoading}
          style={{
            padding: "2% 6%",
            borderRadius: "1em",
            border: "none",
            backgroundColor: "rgb(0, 0, 0)",
            color: "white",
            cursor: "pointer",
            maxWidth: "15rem",
            fontSize: "20px",
            marginLeft: "0em",
          }}
        >
          Send <span>↗</span>
        </button>
      </form>
    </div>
  );
};

export default ChatBot;
