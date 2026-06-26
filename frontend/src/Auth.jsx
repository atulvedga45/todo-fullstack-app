import { useState, useRef, useEffect } from "react";
import axios from "axios";

const AUTH_API = "http://localhost:8000/auth";

function Auth({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const inputRefs = useRef([]);

  useEffect(() => {
    let timer;
    if (step === 2 && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const handleRequestOTP = async (e) => {
    if (e) e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await axios.post(`${AUTH_API}/request-otp`, { email });
      setStep(2);
      setOtp(["", "", "", "", "", ""]);
      setTimeLeft(120); // Reset timer
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    } catch (error) {
      console.error(error);
      alert("Failed to send OTP");
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (timeLeft === 0) {
      alert("OTP expired. Please resend.");
      return;
    }
    const otpValue = otp.join("");
    if (otpValue.length !== 6) return;
    setLoading(true);
    try {
      const response = await axios.post(`${AUTH_API}/verify-otp`, { email, otp: otpValue });
      localStorage.setItem("token", response.data.access_token);
      if (onLoginSuccess) onLoginSuccess(response.data.access_token);
    } catch (error) {
      console.error(error);
      alert("Invalid or Expired OTP");
    }
    setLoading(false);
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="auth-card">
      <h2 className="auth-title">{step === 1 ? "Login / Register" : "Verify OTP"}</h2>
      <p className="auth-subtitle">
        {step === 1 ? "Enter your email to receive a 6-digit OTP." : `We sent an OTP to ${email}`}
      </p>

      {step === 1 ? (
        <form onSubmit={handleRequestOTP} className="auth-form">
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="auth-input"
          />
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Sending..." : "Request OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="auth-form">
          <div className="otp-container">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                ref={(el) => (inputRefs.current[index] = el)}
                className="otp-input"
                disabled={timeLeft === 0}
              />
            ))}
          </div>
          
          <div className="timer-display">
            {timeLeft > 0 ? (
              <span>Time remaining: <strong>{formatTime(timeLeft)}</strong></span>
            ) : (
              <span className="expired-text">OTP Expired</span>
            )}
          </div>

          <button type="submit" className="auth-btn" disabled={loading || otp.join("").length !== 6 || timeLeft === 0}>
            {loading ? "Verifying..." : "Verify & Login"}
          </button>

          <div className="auth-actions">
            <button type="button" className="auth-text-btn" onClick={handleRequestOTP} disabled={loading || timeLeft > 0}>
              Resend OTP
            </button>
            <span className="auth-divider">|</span>
            <button type="button" className="auth-text-btn" onClick={() => setStep(1)}>
              Change Email
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default Auth;
