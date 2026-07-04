import { useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

const quickQuestions = [
  "How to register?",
  "I need blood",
  "How to donate blood?",
  "Find O+ donors",
  "Emergency help",
];

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function getBloodGroupFromText(text) {
  const cleanText = text.toUpperCase().replace(/\s/g, "");
  return bloodGroups.find((group) => cleanText.includes(group));
}

function getAuthToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("lifedropToken") ||
    localStorage.getItem("bloodBankToken") ||
    localStorage.getItem("authToken")
  );
}

function getLocalReply(message) {
  const text = message.toLowerCase();

  if (
    text.includes("register") ||
    text.includes("signup") ||
    text.includes("sign up")
  ) {
    return "To register, click the Register button, choose Donor or Patient, fill your name, email, password, phone, blood group and city, then submit the form.";
  }

  if (text.includes("login")) {
    return "To login, click Login, enter your registered email or admin username and password, then you will be redirected based on your role.";
  }

  if (text.includes("donate") || text.includes("donation")) {
    return "To donate blood, first register as a Donor. After login, open the Donate page and update your availability and donation details.";
  }

  if (text.includes("need blood") || text.includes("request")) {
    return "If you need blood, register as a Patient. After login, open the Need Blood page and submit your blood group, hospital, city and contact details.";
  }

  if (text.includes("emergency") || text.includes("urgent")) {
    return "For emergency blood need, submit a blood request after login and also contact your nearest hospital or blood bank immediately.";
  }

  if (text.includes("help") || text.includes("support")) {
    return "You can use the Help & Support page after login to send your query or issue to the support team.";
  }

  if (text.includes("eligible") || text.includes("eligibility")) {
    return "Basic donor eligibility: age 18+, healthy condition, proper weight, and no recent major illness. Always consult a doctor or blood bank staff before donating.";
  }

  if (text.includes("hi") || text.includes("hello") || text.includes("hey")) {
    return "Hello! I am LifeDrop Assistant. I can help you with registration, login, blood donation, blood request and emergency guidance.";
  }

  return "I can help with registration, login, blood donation process, blood request process, emergency help and support guidance.";
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! I am LifeDrop Assistant. How can I help you today?",
    },
  ]);

  const addMessage = (sender, text) => {
    setMessages((prev) => [...prev, { sender, text }]);
  };

  const findDonors = async (bloodGroup) => {
    const token = getAuthToken();

    if (!token) {
      return "Please login first to search available donors. You can still ask me how to register, how to login, how to donate, or how to request blood.";
    }

    try {
      const response = await fetch(`${API_BASE_URL}/donors`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return data.message || "Please login again to search donors.";
      }

      const donors = data.donors || data || [];

      if (!Array.isArray(donors)) {
        return "Sorry, donor data format is not correct.";
      }

      const matchedDonors = donors.filter((donor) => {
        if (!bloodGroup) return true;
        return donor.bloodGroup === bloodGroup;
      });

      if (matchedDonors.length === 0) {
        return bloodGroup
          ? `No ${bloodGroup} donor found right now.`
          : "No donor found right now.";
      }

      const donorList = matchedDonors
        .slice(0, 5)
        .map(
          (donor, index) =>
            `${index + 1}. ${donor.name} - ${donor.bloodGroup}, ${donor.city}, Phone: ${donor.phone}`
        )
        .join("\n");

      return bloodGroup
        ? `Available ${bloodGroup} donors:\n${donorList}`
        : `Available donors:\n${donorList}`;
    } catch (error) {
      return "Unable to connect with backend. Please make sure backend is running or deployed correctly.";
    }
  };

  const processMessage = async (messageText) => {
    const lowerText = messageText.toLowerCase();
    const bloodGroup = getBloodGroupFromText(messageText);

    const isDonorSearch =
      lowerText.includes("find") ||
      lowerText.includes("available donor") ||
      lowerText.includes("show donor") ||
      lowerText.includes("donor list") ||
      lowerText.includes("donors near") ||
      bloodGroup;

    if (isDonorSearch) {
      return await findDonors(bloodGroup);
    }

    return getLocalReply(messageText);
  };

  const handleSend = async (messageFromButton = "") => {
    const finalMessage = messageFromButton || input.trim();

    if (!finalMessage) return;

    addMessage("user", finalMessage);
    setInput("");
    setIsTyping(true);

    const reply = await processMessage(finalMessage);

    setTimeout(() => {
      addMessage("bot", reply);
      setIsTyping(false);
    }, 500);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleSend();
  };

  return (
    <div className="chatbot-wrapper">
      {isOpen && (
        <div className="chatbot-box">
          <div className="chatbot-header">
            <div>
              <h3>LifeDrop Assistant</h3>
              <p>Online blood support</p>
            </div>

            <button type="button" onClick={() => setIsOpen(false)}>
              ×
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`chatbot-message ${
                  message.sender === "bot" ? "bot-message" : "user-message"
                }`}
              >
                {message.text.split("\n").map((line, lineIndex) => (
                  <span key={lineIndex}>
                    {line}
                    <br />
                  </span>
                ))}
              </div>
            ))}

            {isTyping && (
              <div className="chatbot-message bot-message">Typing...</div>
            )}
          </div>

          <div className="chatbot-quick">
            {quickQuestions.map((question) => (
              <button
                type="button"
                key={question}
                onClick={() => handleSend(question)}
              >
                {question}
              </button>
            ))}
          </div>

          <form className="chatbot-input" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Ask about blood donation..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />

            <button type="submit">Send</button>
          </form>
        </div>
      )}

      <button
        type="button"
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "×" : "AI"}
      </button>
    </div>
  );
}