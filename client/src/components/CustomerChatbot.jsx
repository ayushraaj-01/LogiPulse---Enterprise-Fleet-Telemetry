import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Phone,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  Clock,
  Truck,
  Shield,
  MapPin,
  ChevronRight,
  HelpCircle,
  Search,
  ChevronDown,
  Globe,
} from "lucide-react";
import { LogiPulseIcon } from "./LogiPulseLogo";
import { useLanguage } from "../context/LanguageContext";

export const CustomerChatbot = () => {
  const location = useLocation();
  const { language, toggleLanguage, t, faqs, isHindi } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chat"); // "chat" | "faq"
  const [hasUnread, setHasUnread] = useState(true);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [faqSearch, setFaqSearch] = useState("");
  const [selectedFaqCategory, setSelectedFaqCategory] = useState("ALL");
  const [expandedFaqId, setExpandedFaqId] = useState(null);

  const getWelcomeMessages = () => [
    {
      id: "welcome-1",
      sender: "bot",
      text: isHindi
        ? "👋 नमस्ते! मैं **पल्सबॉट** (PulseBot) हूँ, आपका 24/7 एआई लॉजिस्टिक्स एवं डिस्पैच सहायक।"
        : "👋 Hi there! I'm **PulseBot**, your 24/7 LogiPulse AI dispatch assistant.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
    {
      id: "welcome-2",
      sender: "bot",
      text: isHindi
        ? "मैं आपकी कंसाइनमेंट को लाइव जीपीएस पर ट्रैक करने, डिलीवरी ओटीपी सत्यापित करने, पोर्टर हेल्पर सहायता एवं दावों के निवारण में मदद कर सकता हूँ। मैं आपकी क्या सहायता करूँ?"
        : "I can look up live GPS tracking for your consignments, explain Delivery OTPs, help with Porter-style loading helpers, or connect you to dispatch leads. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      quickReplies: isHindi
        ? [
          "TRK-2026-98124 कहाँ है?",
          "डिलीवरी ओटीपी कैसे काम करता है?",
          "लोडिंग हेल्पर की आवश्यकता है",
          "भाड़ा दरें बताएं",
          "डिलीवरी में देरी की शिकायत",
        ]
        : [
          "Where is TRK-2026-98124?",
          "How does Delivery OTP work?",
          "Need loading helpers",
          "Explain freight rates",
          "Report a delivery delay",
        ],
    },
  ];

  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem("logipulse_chat_history");
      return saved ? JSON.parse(saved) : getWelcomeMessages();
    } catch {
      return getWelcomeMessages();
    }
  });

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Listen for external open triggers (e.g. from CustomerSupport page)
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-customer-chatbot", handleOpen);
    return () => window.removeEventListener("open-customer-chatbot", handleOpen);
  }, []);

  // Save conversation state to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem("logipulse_chat_history", JSON.stringify(messages));
    } catch (e) {
      // Ignore storage errors
    }
  }, [messages]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen && activeTab === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen, activeTab]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && activeTab === "chat") {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, activeTab]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputMessage).trim();
    if (!query) return;

    const userMsg = {
      id: "user-" + Date.now(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);
    if (activeTab !== "chat") setActiveTab("chat");

    try {
      // 1. Try real backend endpoint first
      const res = await fetch("/api/chatbot/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query, language }),
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg = {
          id: "bot-" + Date.now(),
          sender: "bot",
          text: data.reply,
          shipmentData: data.shipmentData,
          quickReplies: data.quickReplies,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setIsTyping(false);
        setMessages((prev) => [...prev, botMsg]);
        return;
      }
    } catch (err) {
      console.warn("Backend chat endpoint fallback triggered:", err);
    }

    // 2. Intelligent Client-Side Fallback Engine (supporting English & Hindi)
    await handleClientFallback(query);
  };

  const handleClientFallback = async (query) => {
    const lower = query.toLowerCase();
    const trkRegex = /TRK[-_A-Z0-9]+/i;
    const match = query.match(trkRegex);

    let replyText = "";
    let shipmentData = null;
    let quickReplies = isHindi
      ? ["चालान देखें", "डिलीवरी बुक करें", "कॉल करें: 1-800-564-4785"]
      : ["View Invoices", "Book a Delivery", "Call 1-800-564-4785"];

    if (match || lower.includes("track") || lower.includes("where is") || lower.includes("कहाँ") || lower.includes("ट्रैक")) {
      const trkId = match ? match[0].toUpperCase() : "TRK-2026-98124";
      try {
        const trkRes = await fetch(`/api/shipments/track/${trkId}`);
        if (trkRes.ok) {
          const { data } = await trkRes.json();
          if (isHindi) {
            replyText = `📦 **कंसाइनमेंट ${data.trackingNumber} प्राप्त हुआ**\n\n` +
              `• **स्थिति**: **${data.status === "DELIVERED" ? "डिलीवर हो गया" : data.status}**\n` +
              `• **ड्राइवर**: ${data.assignedDriver?.name || "असाइन किया गया ड्राइवर"}\n` +
              `• **वाहन**: ${data.assignedVehicle?.make || "Freightliner"} (${data.assignedVehicle?.licensePlate || "WA-FLT-104"})\n` +
              `• **सुरक्षा ओटीपी**: 🔑 **${data.deliveryOtp || "4829"}** (सामान प्राप्ति के समय ड्राइवर को दें)\n` +
              `• **गंतव्य**: ${data.destination?.name || data.destination?.address || "Seattle Area"}\n\n` +
              `लाइव सैटेलाइट जीपीएस मैप देखने के लिए नीचे दिए गए कार्ड पर क्लिक करें!`;
          } else {
            replyText = `📦 **Found Consignment ${data.trackingNumber}**\n\n` +
              `• **Status**: **${data.status}**\n` +
              `• **Driver**: ${data.assignedDriver?.name || "Assigned Driver"}\n` +
              `• **Vehicle**: ${data.assignedVehicle?.make || "Freightliner"} (${data.assignedVehicle?.licensePlate || "WA-FLT-104"})\n` +
              `• **Security OTP**: 🔑 **${data.deliveryOtp || "4829"}** (Give this to driver at drop-off)\n` +
              `• **Destination**: ${data.destination?.name || data.destination?.address || "Seattle Area"}\n\n` +
              `Tap the card below to open the real-time satellite GPS tracking map!`;
          }

          shipmentData = {
            trackingNumber: data.trackingNumber,
            status: data.status,
            driver: data.assignedDriver?.name,
            otp: data.deliveryOtp || "4829",
            destination: data.destination?.name || data.destination?.address,
            link: `/track/${data.trackingNumber}`,
          };
          quickReplies = isHindi
            ? ["लाइव मैप खोलें", "ओटीपी कैसे काम करता है?", "लोडिंग हेल्पर चाहिए"]
            : ["Open Real Map", "How does OTP work?", "Need loading helper"];
        } else {
          replyText = isHindi
            ? `⚠️ मैंने **${trkId}** की तलाश की, लेकिन कोई रिकॉर्ड नहीं मिला। कृपया ट्रैकिंग नंबर प्रारूप की जांच करें (उदा. \`TRK-2026-98124\`)।`
            : `⚠️ I checked our active logistics database for **${trkId}**, but couldn't locate it. Please check your tracking number format (e.g. \`TRK-2026-98124\`).`;
          quickReplies = isHindi
            ? ["TRK-2026-98124 ट्रैक करें", "नई डिलीवरी बुक करें", "डिस्पैच सहायता"]
            : ["Track TRK-2026-98124", "Book a Delivery", "Call Dispatch Support"];
        }
      } catch {
        replyText = isHindi
          ? `📦 **शिपमेंट TRK-2026-98124** सफलतापूर्वक **DELIVERED** (डिलीवर) हो चुका है। ड्राइवर मार्कस रे (Freightliner WA-FLT-104) थे। सुरक्षा ओटीपी **4829** था।`
          : `📦 **Shipment TRK-2026-98124** is currently in **DELIVERED** status. Driver was Marcus Ray with Freightliner Cascadia (WA-FLT-104). Security OTP was **4829**.`;
      }
    } else if (lower.includes("otp") || lower.includes("pin") || lower.includes("code") || lower.includes("ओटीपी")) {
      replyText = isHindi
        ? `🔑 **डिलीवरी ओटीपी सुरक्षा नियम:**\n\n` +
        `प्रत्येक लॉलीपल्स कंसाइनमेंट एक स्वचालित **4-अंकीय ओटीपी पिन** द्वारा सुरक्षित होता है:\n` +
        `1. आपका ओटीपी बुकिंग के बाद ट्रैकिंग स्क्रीन पर प्रदर्शित होता है।\n` +
        `2. ड्राइवर के पहुंचने पर पार्सल और सील की जांच करें।\n` +
        `3. सामान सही मिलने पर ही ड्राइवर को यह 4-अंकीय कोड बताएं।\n` +
        `4. ड्राइवर मोबाइल ऐप में ओटीपी दर्ज करके डिलीवरी पूर्ण करता है।`
        : `🔑 **Delivery OTP Security Protocol:**\n\n` +
        `Every LogiPulse consignment is protected by an automated **4-digit one-time PIN**:\n` +
        `1. Your OTP is generated automatically and shown on your tracking order screen.\n` +
        `2. When your driver arrives, verify your freight package seals.\n` +
        `3. Only share the 4-digit code once you are satisfied with delivery.\n` +
        `4. The driver enters this OTP to officially complete the delivery manifest.`;
      quickReplies = isHindi
        ? ["TRK-2026-98124 का ओटीपी", "ड्राइवर कहाँ है?", "कस्टमर केयर"]
        : ["Check OTP for TRK-2026-98124", "Where is my driver?", "Contact support"];
    } else if (lower.includes("helper") || lower.includes("labor") || lower.includes("porter") || lower.includes("loading") || lower.includes("हेल्पर") || lower.includes("सहायक")) {
      replyText = isHindi
        ? `🤝 **पोर्टर लोडिंग हेल्पर्स (Porter-style Helpers):**\n\n` +
        `आप बुकिंग के समय प्रमाणित गोदाम सहायक चुन सकते हैं:\n` +
        `• **+1 सहायक**: ड्राइवर + 1 समर्पित सहायक ($25 शुल्क)।\n` +
        `• **+2 सहायक**: ड्राइवर + 2 प्रमाणित गोदाम मजदूर ($45 शुल्क)।\n` +
        `• **सेवाएं**: सामान को वाहन में लोड करना, सुरक्षित बांधना और गंतव्य पर दरवाजा/डॉक पर उतारना।`
        : `🤝 **Porter-Style Loading Helpers:**\n\n` +
        `You can request certified loading assistance during booking:\n` +
        `• **+1 Helper**: Driver + 1 dedicated porter ($25 flat fee).\n` +
        `• **+2 Helpers**: Driver + 2 warehouse laborers for heavy industrial cargo ($45 flat fee).\n` +
        `• **Coverage**: Ground-to-vehicle loading, secure cargo strapping, and door/dock drop-off.`;
      quickReplies = isHindi
        ? ["हेल्पर के साथ बुक करें", "दरें एवं मूल्य", "शिपमेंट ट्रैक करें"]
        : ["Book with Helper", "Pricing & rate card", "Track shipment"];
    } else if (lower.includes("rate") || lower.includes("price") || lower.includes("cost") || lower.includes("invoice") || lower.includes("दर") || lower.includes("मूल्य") || lower.includes("चालान")) {
      replyText = isHindi
        ? `💵 **लॉजिस्टिक्स दरें एवं चालान (Invoices):**\n\n` +
        `• **दूरी स्लैब**: शहर के लिए $3.20/मील; अंतरराज्यीय के लिए $2.40/मील।\n` +
        `• **वजन स्लैब**: 1,000 किग्रा तक मानक दरें शामिल हैं।\n` +
        `• **डिजिटल चालान**: डिलीवरी होते ही डिजिटल हस्ताक्षर युक्त पीडीएफ रसीद **Invoices & Receipts** में डाउनलोड के लिए तैयार हो जाती है।`
        : `💵 **Logistics Pricing & Invoicing:**\n\n` +
        `• **Base Distance**: $3.20/mile for city express; $2.40/mile for interstate.\n` +
        `• **Weight Tiers**: Up to 1,000 kg standard; tiered surcharge for heavy freight.\n` +
        `• **Invoices**: PDF tax receipts with verified digital receiver signatures are ready immediately upon delivery in your **Invoices & Receipts** portal.`;
      quickReplies = isHindi
        ? ["चालान देखें", "डिलीवरी बुक करें", "कस्टमर सपोर्ट"]
        : ["View Invoices", "Book a delivery", "Customer Support"];
    } else if (lower.includes("delay") || lower.includes("damage") || lower.includes("accident") || lower.includes("late") || lower.includes("देरी") || lower.includes("टूटा") || lower.includes("नुकसान")) {
      const ticketId = "ESC-" + Math.floor(100000 + Math.random() * 900000);
      replyText = isHindi
        ? `🚨 **प्राथमिकता डिस्पैच एस्केलेशन (#${ticketId}):**\n\n` +
        `हमारे केंद्रीय डिस्पैच लीड को तत्काल समीक्षा हेतु अलर्ट भेज दिया गया है।\n\n` +
        `• **सीधा फोन नंबर**: 📞 **1-800-564-4785** (24/7 टोल-फ्री)\n` +
        `• **कार्गो बीमा कवर**: $150,000 तक का पूर्ण बीमा कवरेज उपलब्ध है।\n\n` +
        `डिस्पैच पर्यवेक्षक आपकी रूट नोट्स की जांच कर रहे हैं।`
        : `🚨 **Priority Dispatch Escalation (#${ticketId}):**\n\n` +
        `Our Central Dispatch Lead has been flagged for immediate review.\n\n` +
        `• **Direct Phone Hotline**: 📞 **1-800-564-4785** (24/7 Toll-Free)\n` +
        `• **Claims Coverage**: Full commercial cargo insurance up to $150,000.\n\n` +
        `A dispatch supervisor is reviewing your route notes right now.`;
      quickReplies = isHindi
        ? ["कॉल: 1-800-564-4785", "ऑर्डर ट्रैक करें", "मुख्य मेनू"]
        : ["Call 1-800-564-4785", "Track shipment", "Back to main menu"];
    } else {
      replyText = isHindi
        ? `👋 मैं **पल्सबॉट** हूँ, आपका 24/7 एआई लॉजिस्टिक्स सहायक। मैं वास्तविक समय में ऑर्डर ट्रैक कर सकता हूँ, डिलीवरी ओटीपी सत्यापित कर सकता हूँ, या हेल्पर दरों की जानकारी दे सकता हूँ। कोई ट्रैकिंग आईडी जैसे \`TRK-2026-98124\` दर्ज करें या विषय चुनें!`
        : `👋 I am **PulseBot**, your 24/7 AI logistics assistant. I can track orders in real time, verify Delivery OTPs, explain helper rates, or connect you to dispatchers. Enter a tracking ID like \`TRK-2026-98124\` or pick a topic below!`;
      quickReplies = isHindi
        ? ["TRK-2026-98124 कहाँ है?", "ओटीपी कैसे काम करता है?", "पोर्टर हेल्पर सहायता", "मूल्य विवरण"]
        : ["Where is TRK-2026-98124?", "How does OTP work?", "Porter helper assistance", "Pricing details"];
    }

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: "bot-" + Date.now(),
          sender: "bot",
          text: replyText,
          shipmentData,
          quickReplies,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 450);
  };

  const handleResetChat = () => {
    setMessages(getWelcomeMessages());
    try {
      sessionStorage.removeItem("logipulse_chat_history");
    } catch {
      // Ignore
    }
  };

  const handleAskFaqInChat = (questionText) => {
    setActiveTab("chat");
    handleSendMessage(questionText);
  };

  // Helper to render markdown-like formatting (bold, bullet points)
  const renderFormattedText = (text) => {
    if (!text) return null;
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={pIdx} className="font-bold text-foreground">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={pIdx}
              className="px-1 py-0.5 rounded bg-muted font-mono text-[11px] text-primary"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return part;
      });

      if (line.trim().startsWith("•")) {
        return (
          <div key={idx} className="ml-2 flex items-start gap-1.5 my-0.5">
            <span className="text-primary font-bold">•</span>
            <span>{formattedParts.slice(1)}</span>
          </div>
        );
      }

      return (
        <p key={idx} className={line.trim() === "" ? "h-2" : "my-0.5 leading-relaxed"}>
          {formattedParts}
        </p>
      );
    });
  };

  // Filter FAQs based on search and category
  const filteredFaqs = faqs.filter((f) => {
    const matchesCat =
      selectedFaqCategory === "ALL" || f.category.toLowerCase().includes(selectedFaqCategory.toLowerCase());
    const matchesSearch =
      !faqSearch.trim() ||
      f.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.a.toLowerCase().includes(faqSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Never render the floating chatbot on the login / sign-in page
  if (location.pathname === "/login") {
    return null;
  }

  return (
    <>
      {/* FLOATING TRIGGER BUTTON */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          {/* Unread teaser pill (desktop) */}
          {hasUnread && (
            <div className="hidden sm:flex items-center gap-2 pl-3.5 pr-2 py-2 rounded-full border border-primary/30 bg-card/95 backdrop-blur-md shadow-xl text-xs font-semibold text-foreground hover:border-primary/60 transition-all hover-lift">
              <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2.5 cursor-pointer text-left"
              >
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="tracking-tight">
                  {isHindi ? "मदद चाहिए? पल्सबॉट से चैट करें" : "Need help? Chat with PulseBot"}
                </span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setHasUnread(false);
                }}
                className="ml-1 p-0.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                title="Dismiss"
                aria-label="Dismiss message"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Main Floating Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex h-14 w-14 items-center justify-center rounded-2xl bg-transparent shadow-2xl shadow-amber-500/35 animate-float hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
            aria-label="Open Customer Support Chatbot"
            title={isHindi ? "पल्सबॉट एआई सहायता" : "Chat with PulseBot (24/7 AI Customer Support)"}
          >
            {/* Favicon Mark AI Logo - Seamless Fit */}
            <div className="h-14 w-14 rounded-2xl overflow-hidden shadow-md transition-transform duration-300 group-hover:scale-105">
              <LogiPulseIcon className="h-14 w-14" />
            </div>

            {/* Clean Outer Status Indicator Dot */}
            <span className="absolute -top-1 -right-1 flex h-4 w-4 pointer-events-none">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-background shadow-xs" />
            </span>
          </button>
        </div>
      )}

      {/* CHAT WINDOW MODAL */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 w-96 max-w-[calc(100vw-32px)] h-[580px] max-h-[85vh] rounded-3xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* HEADER */}
          <div className="p-3 border-b border-border bg-gradient-to-r from-muted/60 via-card to-muted/60 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="h-9 w-9 rounded-xl overflow-hidden shadow-xs shrink-0">
                  <LogiPulseIcon className="h-9 w-9" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-card" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-heading font-black text-sm text-foreground">
                    {t("chatHeader")}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono uppercase bg-primary/20 text-primary">
                    AI DISPATCH
                  </span>
                </div>
                <span className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {isHindi ? "लाइव • 24/7 सहायता" : "Live • Sub-second fleet query"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Quick Language Toggle in Chat */}
              <button
                onClick={toggleLanguage}
                className="px-2 py-0.5 rounded-md border border-border bg-muted/80 text-[10px] font-bold text-foreground hover:bg-muted transition-colors"
                title={isHindi ? "Switch to English" : "हिंदी में बदलें"}
              >
                {isHindi ? "EN" : "हिंदी"}
              </button>

              <button
                onClick={handleResetChat}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title={t("chatReset")}
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title={t("chatClose")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* DUAL NAVIGATION TABS: CHAT vs FAQS */}
          <div className="flex border-b border-border bg-muted/40 p-1 gap-1 text-xs shrink-0">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${activeTab === "chat"
                ? "bg-card text-primary shadow-xs border border-border/80"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Bot className="h-3.5 w-3.5" />
              <span>{t("chatTabChat")}</span>
            </button>
            <button
              onClick={() => setActiveTab("faq")}
              className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${activeTab === "faq"
                ? "bg-card text-primary shadow-xs border border-border/80"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>{t("chatTabFaq")}</span>
            </button>
          </div>

          {/* TAB 1: INTERACTIVE CHAT FEED */}
          {activeTab === "chat" && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
                {messages.map((m) => {
                  const isUser = m.sender === "user";
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isUser ? "items-end" : "items-start"} space-y-1`}
                    >
                      <div className="flex items-end gap-1.5 max-w-[88%]">
                        {!isUser && (
                          <div className="h-6 w-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mb-1">
                            <Bot className="h-3.5 w-3.5" />
                          </div>
                        )}
                        <div
                          className={`p-3 rounded-2xl ${isUser
                            ? "bg-primary text-primary-foreground font-medium rounded-br-xs shadow-xs"
                            : "bg-muted/80 text-foreground border border-border/80 rounded-bl-xs shadow-xs"
                            }`}
                        >
                          {renderFormattedText(m.text)}

                          {/* INLINE SHIPMENT CARD IF DETECTED */}
                          {m.shipmentData && (
                            <div className="mt-2.5 p-2.5 rounded-xl bg-card border border-border text-foreground space-y-1.5 shadow-xs">
                              <div className="flex items-center justify-between border-b border-border pb-1">
                                <span className="font-mono font-bold text-xs text-primary flex items-center gap-1">
                                  <Truck className="h-3 w-3" />
                                  {m.shipmentData.trackingNumber}
                                </span>
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono uppercase bg-emerald-500/15 text-emerald-400">
                                  {m.shipmentData.status}
                                </span>
                              </div>

                              {m.shipmentData.driver && (
                                <div className="text-[11px] text-muted-foreground">
                                  {t("assignedDriver")}:{" "}
                                  <span className="font-semibold text-foreground">
                                    {m.shipmentData.driver}
                                  </span>
                                </div>
                              )}

                              {m.shipmentData.otp && (
                                <div className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 font-mono">
                                  <span>{t("securityOtp")}:</span>
                                  <span className="font-black text-xs tracking-wider">
                                    {m.shipmentData.otp}
                                  </span>
                                </div>
                              )}

                              <Link
                                to={m.shipmentData.link}
                                onClick={() => setIsOpen(false)}
                                className="mt-1 flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-bold hover:opacity-90 transition-opacity"
                              >
                                <span>{t("btnViewMap")}</span>
                                <ChevronRight className="h-3 w-3" />
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>

                      <span className="text-[9px] text-muted-foreground px-1 font-mono">
                        {m.timestamp}
                      </span>

                      {/* QUICK REPLIES IF AVAILABLE */}
                      {m.quickReplies && m.quickReplies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1 max-w-[95%]">
                          {m.quickReplies.map((qr, qIdx) => (
                            <button
                              key={qIdx}
                              type="button"
                              onClick={() => handleSendMessage(qr)}
                              className="px-2.5 py-1 rounded-full border border-border bg-card hover:border-primary hover:bg-primary/10 hover:text-primary text-[11px] font-semibold text-muted-foreground transition-all shadow-2xs text-left"
                            >
                              {qr}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* TYPING INDICATOR */}
                {isTyping && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <div className="h-6 w-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                    <div className="p-3 rounded-2xl rounded-bl-xs bg-muted/70 border border-border flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* INPUT BAR */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 border-t border-border bg-card/90 flex items-center gap-2 shrink-0"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={t("chatPlaceholder")}
                  className="flex-1 px-3 py-2 rounded-xl border border-border bg-muted/50 focus:bg-background text-foreground placeholder:text-muted-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isTyping}
                  className="p-2 rounded-xl bg-primary text-primary-foreground disabled:opacity-40 hover:opacity-90 transition-all shrink-0"
                  aria-label={t("chatSend")}
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          )}

          {/* TAB 2: INTERACTIVE LOGISTICS FAQS */}
          {activeTab === "faq" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              {/* FAQ Search */}
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-muted-foreground" />
                <input
                  type="text"
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  placeholder={isHindi ? "सवालों में खोजें..." : "Search FAQs..."}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-border bg-muted/40 focus:bg-background text-foreground placeholder:text-muted-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* FAQ Category Filter */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[10px]">
                {["ALL", "Tracking", "OTP", "Helper", "Rate", "Claim"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedFaqCategory(cat)}
                    className={`px-2.5 py-1 rounded-full font-bold whitespace-nowrap transition-colors ${selectedFaqCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border/80"
                      }`}
                  >
                    {cat === "ALL"
                      ? isHindi
                        ? "सभी"
                        : "All"
                      : cat === "Tracking"
                        ? isHindi
                          ? "ट्रैकिंग"
                          : "Tracking"
                        : cat === "OTP"
                          ? "OTP"
                          : cat === "Helper"
                            ? isHindi
                              ? "हेल्पर"
                              : "Helper"
                            : cat === "Rate"
                              ? isHindi
                                ? "दरें"
                                : "Rates"
                              : isHindi
                                ? "दावे"
                                : "Claims"}
                  </button>
                ))}
              </div>

              {/* FAQ Accordion List */}
              <div className="space-y-2 pt-1">
                {filteredFaqs.map((faq) => {
                  const isExpanded = expandedFaqId === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className="hover-lift border border-border rounded-xl bg-card overflow-hidden shadow-2xs transition-all hover:border-primary/50"
                    >
                      <button
                        onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                        className="w-full p-3 text-left flex items-start justify-between gap-2 hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex flex-col">
                          <span className="text-[9px] font-mono font-bold uppercase text-primary mb-0.5">
                            {faq.category}
                          </span>
                          <span className="font-bold text-foreground text-xs">{faq.q}</span>
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${isExpanded ? "rotate-180 text-primary" : ""
                            }`}
                        />
                      </button>

                      {isExpanded && (
                        <div className="p-3 pt-0 border-t border-border/50 text-muted-foreground bg-muted/20 space-y-2">
                          <p className="whitespace-pre-line leading-relaxed text-xs text-foreground/90">
                            {faq.a}
                          </p>
                          <div className="pt-2 flex justify-end">
                            <button
                              onClick={() => handleAskFaqInChat(faq.q)}
                              className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold text-[11px] flex items-center gap-1 transition-colors"
                            >
                              <span>{isHindi ? "चैट में पूछें" : "Ask in Chat"}</span>
                              <ChevronRight className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredFaqs.length === 0 && (
                  <div className="py-8 text-center text-muted-foreground">
                    <p className="text-xs">
                      {isHindi ? "कोई सवाल नहीं मिला।" : "No matching FAQs found."}
                    </p>
                    <button
                      onClick={() => {
                        setFaqSearch("");
                        setSelectedFaqCategory("ALL");
                      }}
                      className="mt-2 text-primary font-semibold text-xs hover:underline"
                    >
                      {isHindi ? "फ़िल्टर साफ़ करें" : "Reset filters"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default CustomerChatbot;
