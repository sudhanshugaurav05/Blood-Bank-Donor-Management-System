import { useState } from "react";
import { Bot, Send, X } from "lucide-react";
import api from "../api/axios.js";
import { useAndroidBackClose } from "../hooks/useAndroidBackClose.js";

const quickQuestions = [
  "How to register?",
  "How to donate blood?",
  "Find O+ donors",
  "Emergency help",
];

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hi! I am LifeDrop Assistant. Ask me about registration, donation, blood requests, or donor search.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useAndroidBackClose(isOpen, () => setIsOpen(false));

  const getLocalReply = (text) => {
    const msg = text.toLowerCase();

    if (msg.includes("register") || msg.includes("signup")) {
      return "To register, click Register button, choose Donor or Patient, fill details, and create your account.";
    }

    if (msg.includes("donate")) {
      return "To donate blood, register as a donor, complete eligibility details, then login and update your availability.";
    }

    if (msg.includes("need") || msg.includes("request")) {
      return "To request blood, register/login as a patient and go to Need Blood page. Fill blood group, city, hospital and contact details.";
    }

    if (msg.includes("emergency") || msg.includes("help")) {
      return "For emergency, create a blood request with correct blood group and city. If matching eligible donors are available, details will be sent to your email.";
    }

    return null;
  };

  const extractBloodGroup = (text) => {
    const upperText = text.toUpperCase();
    const groups = ["AB+", "AB-", "A+", "A-", "B+", "B-", "O+", "O-"];
    return groups.find((group) => upperText.includes(group));
  };

  const findDonors = async (bloodGroup) => {
    try {
      const response = await api.get("/donors");
      const donors = response.data?.donors || [];

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
      if (error.response?.status === 401) {
        return "Please login first to search available donors.";
      }

      return (
        error.response?.data?.message ||
        "Unable to load donors right now. Please try again later."
      );
    }
  };

  const handleSend = async (customText) => {
    const text = customText || input.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { from: "user", text }]);
    setInput("");
    setLoading(true);

    let reply = getLocalReply(text);

    const isDonorSearch =
      text.toLowerCase().includes("donor") ||
      text.toLowerCase().includes("find") ||
      text.toLowerCase().includes("blood");

    if (!reply && isDonorSearch) {
      const bloodGroup = extractBloodGroup(text);
      reply = await findDonors(bloodGroup);
    }

    if (!reply) {
      reply =
        "I can help you with registration, blood donation, blood request, donor search, and emergency support.";
    }

    setMessages((prev) => [...prev, { from: "bot", text: reply }]);
    setLoading(false);
  };

  return (
    <>
      {isOpen && (
        <div
          className="chatbot-backdrop"
          onClick={() => setIsOpen(false)}
        />
      )}

      {isOpen && (
        <div
          className="chatbot-window"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="chatbot-header">
            <div>
              <h3>LifeDrop Assistant</h3>
              <p>Online blood support</p>
            </div>

            <button
              type="button"
              className="chatbot-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
            >
              <X size={20} />
            </button>
          </div>

          <div className="chatbot-body">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`chat-message ${
                  message.from === "bot" ? "bot" : "user"
                }`}
              >
                {message.text}
              </div>
            ))}

            {loading && <div className="chat-message bot">Typing...</div>}
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

          <form
            className="chatbot-input"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about blood donation..."
            />

            <button type="submit">
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className="chatbot-toggle"
        onClick={() => setIsOpen((value) => !value)}
        aria-label="Open chatbot"
      >
        {isOpen ? <X size={26} /> : <Bot size={26} />}
        <span>AI</span>
      </button>
    </>
  );
};

export default ChatBot;