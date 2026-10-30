
"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
const [email, setEmail] = useState("");
const [paymentLoading, setPaymentLoading] = useState(false);
const [paymentMessage, setPaymentMessage] = useState("");
  function uploadImage(event) {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      setResult("Please select an image.");
      return;
    }
    if (selected.size > 8 * 1024 * 1024) {
      setResult("Image must be smaller than 8 MB.");
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResult("");
  }

  async function buyPackage(packageId) {
  if (!email || !email.includes("@")) {
    setPaymentMessage("Please enter a valid email address.");
    return;
  }

  setPaymentLoading(true);
  setPaymentMessage("");

  try {
    const response = await fetch("/api/paystack", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        packageId,
        email,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Payment could not start.");
    }

    if (!data.authorization_url) {
      throw new Error("Paystack checkout link was not returned.");
    }

    window.location.href = data.authorization_url;
  } catch (error) {
    setPaymentMessage(error.message || "Payment failed.");
    setPaymentLoading(false);
  }
}
   async function analyze() {
      setResult("Upload a SportyBet screenshot first.");
      return;
    }
    setLoading(true);
    setResult("");
    try {
      const body = new FormData();
      body.append("image", file);
      const response = await fetch("/api/analyze", {
        method: "POST",
        body
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Analysis failed.");
      setResult(data.analysis || "No analysis was returned.");
    } catch (error) {
      setResult(error.message || "Could not analyze the screenshot.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#080d0a", color: "#f4f8f4", padding: "24px 16px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: 620, margin: "0 auto" }}>
        <p style={{ color: "#baff69", letterSpacing: 3, fontWeight: 800 }}>JAH AI</p>
        <h1 style={{ fontSize: "clamp(30px, 8vw, 48px)", marginBottom: 8 }}>VIRTUAL PREDICTOR</h1>
        <p style={{ color: "#aab8ae", lineHeight: 1.6 }}>Upload a virtual football screenshot for AI-assisted match information extraction and analysis.</p>

        <section style={{ border: "1px solid #2c4030", borderRadius: 20, padding: 20, marginTop: 24, background: "#101813" }}>
          <section style={{
  border: "1px solid #294236",
  borderRadius: 16,
  padding: 18,
  marginBottom: 22,
  background: "#101a16"
}}>
  <h2 style={{ color: "#baff69" }}>
    Choose Your Prediction Package
  </h2>

  <p style={{ color: "#aab8ae" }}>
    Enter your email and select a package to pay securely with Paystack.
  </p>

  <input
    type="email"
    placeholder="Enter your email address"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    style={{
      width: "100%",
      padding: 14,
      borderRadius: 9,
      marginBottom: 16,
      background: "#202b25",
      color: "white",
      border: "1px solid #526357",
      boxSizing: "border-box"
    }}
  />

  {[
    { id: "starter", name: "Starter", price: "GH₵350", uploads: "2 uploads", odds: "Odds 2–5" },
    { id: "silver", name: "Silver", price: "GH₵550", uploads: "3 uploads", odds: "Odds 5–10" },
    { id: "gold", name: "Gold", price: "GH₵850", uploads: "4 uploads", odds: "Odds 10–20" },
    { id: "vip", name: "VIP", price: "GH₵1,000", uploads: "5 uploads", odds: "Odds 20–30" }
  ].map((item) => (
    <div
      key={item.id}
      style={{
        border: "1px solid #405447",
        borderRadius: 12,
        padding: 14,
        marginBottom: 12
      }}
    >
      <h3 style={{ color: "#baff69", margin: "0 0 8px" }}>
        {item.name}
      </h3>

      <h2 style={{ color: "white", margin: "0 0 8px" }}>
        {item.price}
      </h2>

      <p style={{ color: "#aab8ae" }}>
        {item.uploads} • {item.odds}
      </p>

      <button
        onClick={() => buyPackage(item.id)}
        disabled={paymentLoading}
        style={{
          width: "100%",
          padding: 13,
          borderRadius: 9,
          border: "none",
          background: "#baff69",
          color: "#101a16",
          fontWeight: "bold",
          cursor: "pointer"
        }}
      >
        {paymentLoading ? "Please wait..." : "Buy Package"}
      </button>
    </div>
  ))}

  {paymentMessage && (
    <p style={{ color: "#ff7777" }}>
      {paymentMessage}
    </p>
  )}

  <p style={{ color: "#aab8ae", fontSize: 12 }}>
    Payments are processed through Paystack. Available payment methods depend on checkout eligibility.
  </p>
</section>
          <h2>Upload match screenshot</h2>
          <label style={{ display: "block", border: "2px dashed #53704d", borderRadius: 14, padding: 22, textAlign: "center", cursor: "pointer" }}>
            <span style={{ color: "#baff69", fontWeight: 700 }}>Choose image from phone</span>
            <input type="file" accept="image/*" onChange={uploadImage} style={{ display: "block", marginTop: 14, width: "100%" }} />
          </label>

          {preview && <img src={preview} alt="Uploaded screenshot" style={{ width: "100%", marginTop: 18, borderRadius: 12 }} />}

          <button onClick={analyze} disabled={loading} style={{ width: "100%", marginTop: 18, padding: 16, border: 0, borderRadius: 12, background: "#baff69", color: "#101810", fontWeight: 800, fontSize: 16 }}>
            {loading ? "Analyzing..." : "Analyze screenshot"}
          </button>

          {result && <div aria-live="polite" style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", marginTop: 20, padding: 16, borderRadius: 12, background: "#080d0a", lineHeight: 1.6 }}>{result}</div>}
        </section>

        <p style={{ marginTop: 22, fontSize: 13, color: "#9eaca2", lineHeight: 1.6 }}>AI analysis is not a guarantee of match outcomes. Virtual football results may be random; gamble responsibly.</p>
      </div>
    </main>
  );
}
