import React, { useState, useEffect } from "react";


const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=DM+Mono:wght@300;400;500&display=swap";

const CSS_KEYFRAMES = `
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeSlideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes scaleIn {
    from { transform: scale(0.6); opacity: 0; }
    to   { transform: scale(1);   opacity: 1; }
  }
  .admin-card { animation: fadeSlideUp .5s ease both; }
  .view-enter { animation: fadeSlideDown .35s ease both; }
  input:-webkit-autofill,
  input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px #f9f7f4 inset !important;
    -webkit-text-fill-color: #1c1610 !important;
    transition: background-color 9999s;
  }
`;

const S = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(145deg, #f5f1eb 0%, #ede8df 50%, #e8e0d4 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'DM Mono', monospace",
    position: "relative",
    overflow: "hidden",
  },
  bgPattern: {
    position: "absolute",
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(160,120,60,.07) 1px, transparent 1px),
      linear-gradient(90deg, rgba(160,120,60,.07) 1px, transparent 1px)
    `,
    backgroundSize: "52px 52px",
    pointerEvents: "none",
  },
  bgOrb1: {
    position: "absolute",
    width: 480,
    height: 480,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(198,160,80,0.12) 0%, transparent 70%)",
    top: "10%",
    right: "-10%",
    pointerEvents: "none",
  },
  bgOrb2: {
    position: "absolute",
    width: 360,
    height: 360,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(160,120,60,0.09) 0%, transparent 70%)",
    bottom: "5%",
    left: "-8%",
    pointerEvents: "none",
  },
  card: {
    position: "relative",
    width: "100%",
    maxWidth: 440,
    margin: "0 16px",
    padding: "52px 48px 40px",
    background: "rgba(255,253,248,0.92)",
    border: "1px solid rgba(160,120,60,0.18)",
    borderRadius: 6,
    boxShadow:
      "0 1px 0 rgba(255,255,255,0.9) inset, 0 24px 64px rgba(100,80,40,0.14), 0 4px 16px rgba(100,80,40,0.08)",
    backdropFilter: "blur(12px)",
  },
  accentBar: {
    position: "absolute",
    top: 0,
    left: 44,
    right: 44,
    height: 2,
    background:
      "linear-gradient(90deg, transparent,  rgba(205, 239, 171, 0.93) 20%, #c4f3db 50%, #ebcf96 10%)",
    borderRadius: "0 0 2px 2px",
  },
  badge: {
    position: "absolute",
    top: 22,
    right: 26,
    fontSize: 9,
    letterSpacing: "0.2em",
    color: "rgba(140,100,40,0.5)",
    textTransform: "uppercase",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  logoIcon: {
    width: 32,
    height: 32,
    border: "1.5px solid rgba(0, 0, 0, 0.96)",
    borderRadius: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 15,
    color: "#064e0d",
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 600,
    background: "rgba(205, 239, 171, 0.93)",
  },
  logoText: {
    fontSize: 11,
    letterSpacing: "0.26em",
    color: "#064e0d",
    textTransform: "uppercase",
  },
  heading: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 34,
    fontWeight: 300,
    color: "#064e0d",
    letterSpacing: "-0.01em",
    lineHeight: 1.2,
    marginTop: 22,
    marginBottom: 32,
  },
  divider: {
    height: 1,
    background:
      "linear-gradient(90deg, transparent, rgba(160,120,60,0.2) 50%, transparent)",
    marginBottom: 30,
  },
  fieldGroup: { marginBottom: 20 },
  label: {
    display: "block",
    fontSize: 15,
    letterSpacing: "0.2em",
    color: "#064e0d",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  inputWrap: { position: "relative" },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 16px",
    background: "#f9f7f4",
    border: "1px solid rgba(160,120,60,0.2)",
    borderRadius: 4,
    color: "#1c1610",
    fontSize: 13,
    fontFamily: "'DM Mono', monospace",
    outline: "none",
    transition: "border-color .22s, background .22s, box-shadow .22s",
    letterSpacing: "0.03em",
  },
  inputFocus: {
    borderColor: "rgba(160,120,60,0.55)",
    background: "#fff",
    boxShadow: "0 0 0 3px rgba(160,120,60,0.09)",
  },
  inputError: {
    borderColor: "rgba(200,60,60,0.55)",
    background: "rgba(200,60,60,0.03)",
  },
  eyeBtn: {
    position: "absolute",
    right: 14,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    fontSize: 15,
    lineHeight: 1,
    transition: "color .2s",
  },
  errorMsg: {
    fontSize: 11,
    color: "#c03838",
    marginTop: 6,
    letterSpacing: "0.03em",
  },
  forgotRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: -6,
    marginBottom: 28,
  },
  forgotLink: {
    fontSize: 13,
    color: "#064e0d",
    letterSpacing: "0.1em",
    cursor: "pointer",
    background: "none",
    border: "none",
    padding: 0,
    fontFamily: "'DM Mono', monospace",
    transition: "color .2s",
  },
  btn: {
    width: "100%",
    padding: "13px 0",
    background: "linear-gradient(135deg, rgba(205, 239, 171, 0.93) 0%, #c4f3db 50%, #a07828 100%)",
    backgroundSize: "200% 100%",
    border: "none",
    borderRadius: 4,
    color: "#064e0d",
    fontSize: 15,
    fontFamily: "'DM Mono', monospace",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    fontWeight: 500,
    cursor: "pointer",
    transition: "background-position .4s ease, transform .15s, box-shadow .2s",
    boxShadow: "0 4px 18px rgba(140,100,40,0.28)",
  },
  btnHover: {
    backgroundPosition: "100% 0",
    boxShadow: "0 6px 26px rgba(140,100,40,0.38)",
    transform: "translateY(-1px)",
  },
  btnDisabled: { opacity: 0.65, cursor: "not-allowed", transform: "none" },
  globalError: {
    background: "rgba(200,60,60,0.06)",
    border: "1px solid rgba(200,60,60,0.22)",
    borderRadius: 4,
    padding: "11px 14px",
    marginBottom: 20,
    fontSize: 12,
    color: "#b83030",
    letterSpacing: "0.03em",
  },
  successBox: { textAlign: "center", padding: "16px 0 6px" },
  successIcon: {
    width: 54,
    height: 54,
    borderRadius: "50%",
    border: "2px solid rgba(140,100,40,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    margin: "0 auto 20px",
    color: "#a07828",
    background: "rgba(160,120,60,0.07)",
    animation: "scaleIn .4s ease",
  },
  successTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 28,
    color: "#1c1610",
    fontWeight: 300,
    marginBottom: 10,
  },
  successSub: {
    fontSize: 12,
    color: "rgba(60,45,15,0.5)",
    letterSpacing: "0.04em",
    marginBottom: 30,
    lineHeight: 1.8,
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "rgba(140,100,40,0.65)",
    fontSize: 11,
    fontFamily: "'DM Mono', monospace",
    letterSpacing: "0.14em",
    cursor: "pointer",
    padding: 0,
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginTop: 22,
    transition: "color .2s",
  },
  footer: {
    marginTop: 30,
    paddingTop: 18,
    borderTop: "1px solid rgba(160,120,60,0.12)",
    display: "flex",
    justifyContent: "center",
  },
  footerText: {
    fontSize: 10,
    color: "rgba(100,75,30,0.35)",
    letterSpacing: "0.12em",
  },
};

const validateEmail = (v) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Enter a valid email address";

const validatePassword = (v) =>
  v.length >= 8 ? "" : "Password must be at least 8 characters";

export default function AdminLogin({ onLogin }) {
  const [view, setView] = useState("login");

  useEffect(() => {
    if (!document.getElementById("al-fonts")) {
      const link = document.createElement("link");
      link.id = "al-fonts";
      link.rel = "stylesheet";
      link.href = FONT_HREF;
      document.head.appendChild(link);
    }
    if (!document.getElementById("al-css")) {
      const style = document.createElement("style");
      style.id = "al-css";
      style.textContent = CSS_KEYFRAMES;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div style={S.page}>
      <div style={S.bgPattern} />
      <div style={S.bgOrb1} />
      <div style={S.bgOrb2} />

      <div style={S.card} className="admin-card">
        <div style={S.accentBar} />
        <span style={S.badge}>secure portal</span>

        {view === "login" && (
          <LoginView onForgot={() => setView("forgot")} onLogin={onLogin} />
        )}
        {view === "forgot" && (
          <ForgotView
            onBack={() => setView("login")}
            onSuccess={() => setView("forgot-success")}
          />
        )}
        {view === "forgot-success" && (
          <ForgotSuccessView onBack={() => setView("login")} />
        )}

        <div style={S.footer}>
          <span style={S.footerText}>© {new Date().getFullYear()} Admin Console</span>
        </div>
      </div>
      
    </div>
  );
}

function LoginView({ onForgot, onLogin}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  const [focused, setFocused] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false); 

  useEffect(() => {
    const errs = {};
    if (touched.email) errs.email = validateEmail(email);
    if (touched.password) errs.password = validatePassword(password);
    setErrors(errs);
  }, [email, password, touched]);

  // ✅ FIXED: Now actually calls your Django backend
  const handleSubmit = async () => {
    setTouched({ email: true, password: true });
    if (validateEmail(email) || validatePassword(password)) return;

    setLoading(true);
    setLoginError("");

    try {
   
const res = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
         credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

   if (res.ok) {
  localStorage.setItem("isAdmin", "true");
  localStorage.setItem("adminData", JSON.stringify(data));
  setShowSuccess(true);   // 👈 SHOW POPUP

  setTimeout(() => {
    onLogin(email);            // redirect after 1.5 sec
  }, 1500);




      } else {
        setLoginError(data.error || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      setLoginError("Could not connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    ...S.input,
    ...(focused === field ? S.inputFocus : {}),
    ...(errors[field] && touched[field] ? S.inputError : {}),
    paddingRight: field === "password" ? 44 : 16,
  });

  return (
    <div className="view-enter">
      <div style={S.logoRow}>
        <div style={S.logoIcon}>A</div>
        <span style={S.logoText}>Admin</span>
      </div>
      <h1 style={S.heading}>Welcome back.</h1>
      <div style={S.divider} />

      {loginError && <div style={S.globalError}>⚠ {loginError}</div>}

      <div style={S.fieldGroup}>
        <label style={S.label}>Email address</label>
        <div style={S.inputWrap}>
          <input
            type="email"
            value={email}
            placeholder="admin@example.com"
            style={inputStyle("email")}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocused("email")}
            onBlur={() => {
              setFocused(null);
              setTouched((p) => ({ ...p, email: true }));
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            autoComplete="email"
          />
        </div>
        {errors.email && touched.email && (
          <p style={S.errorMsg}>{errors.email}</p>
        )}
      </div>

      <div style={S.fieldGroup}>
        <label style={S.label}>Password</label>
        <div style={S.inputWrap}>
          <input
            type={showPw ? "text" : "password"}
            value={password}
            placeholder="••••••••••"
            style={inputStyle("password")}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setFocused("password")}
            onBlur={() => {
              setFocused(null);
              setTouched((p) => ({ ...p, password: true }));
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            autoComplete="current-password"
          />
          <button
            style={{
              ...S.eyeBtn,
              color: showPw ? "rgba(140,100,40,0.75)" : "rgba(140,100,40,0.35)",
            }}
            onClick={() => setShowPw((v) => !v)}
            type="button"
            aria-label="Toggle password visibility"
          >
            {showPw ? "●" : "○"}
          </button>
        </div>
        {errors.password && touched.password && (
          <p style={S.errorMsg}>{errors.password}</p>
        )}
      </div>

      <div style={S.forgotRow}>
        <button style={S.forgotLink} onClick={onForgot} type="button">
          Forgot password?
        </button>
      </div>

      <button
        style={{
          ...S.btn,
          ...(btnHover && !loading ? S.btnHover : {}),
          ...(loading ? S.btnDisabled : {}),
        }}
        onMouseEnter={() => setBtnHover(true)}
        onMouseLeave={() => setBtnHover(false)}
        onClick={handleSubmit}
        disabled={loading}
        type="button"
      >
        {loading ? "Authenticating…" : "Sign In →"}
      </button>
   

{/* ✅ SUCCESS POPUP */}
{showSuccess && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999
    }}
  >
    <div
      style={{
        background: "#fff",
        padding: "30px 40px",
        borderRadius: 12,
        textAlign: "center",
        boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
      }}
    >
      <h2 style={{ color: "#16a34a", marginBottom: 10 }}>
        ✅ Login Successful
      </h2>
      <p style={{ color: "#6b7280" }}>
        Redirecting...
      </p>
    </div>
  </div>
)}

</div>  
  );
}

function ForgotView({ onBack, onSuccess }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (touched) setError(validateEmail(email));
  }, [email, touched]);

  const handleSubmit = async () => {
    setTouched(true);
    if (validateEmail(email)) return;
    setLoading(true);
    setError("");
    try {
    const res = await fetch("http://127.0.0.1:8000/api/password-reset/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        onSuccess(); // Shows the "Check your inbox" screen
      } else {
        const data = await res.json();
        setError(data.error || "User with this email does not exist.");
      }
    } catch (err) {
      setError("Server connection failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="view-enter">
      <div style={S.logoRow}>
        <div style={S.logoIcon}>A</div>
        <span style={S.logoText}>Admin</span>
      </div>
      <h1 style={S.heading}>Reset password.</h1>
      <div style={S.divider} />

      <div style={S.fieldGroup}>
        <label style={S.label}>Email address</label>
        <input
          type="email"
          value={email}
          placeholder="admin@example.com"
          style={{
            ...S.input,
            ...(focused ? S.inputFocus : {}),
            ...(error && touched ? S.inputError : {}),
          }}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            setTouched(true);
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          autoComplete="email"
        />
        {error && touched && <p style={S.errorMsg}>{error}</p>}
      </div>

      <div style={{ marginTop: 28 }}>
        <button
          style={{
            ...S.btn,
            ...(btnHover && !loading ? S.btnHover : {}),
            ...(loading ? S.btnDisabled : {}),
          }}
          onMouseEnter={() => setBtnHover(true)}
          onMouseLeave={() => setBtnHover(false)}
          onClick={handleSubmit}
          disabled={loading}
          type="button"
        >
          {loading ? "Sending…" : "Send Reset Link →"}
        </button>
      </div>

      <button style={S.backBtn} onClick={onBack} type="button">
        ← Back to sign in
      </button>
    </div>
  );
}

function ForgotSuccessView({ onBack }) {
  const [btnHover, setBtnHover] = useState(false);

  return (
    <div className="view-enter">
      <div style={S.successBox}>
        <div style={S.successIcon}>✓</div>
        <h2 style={S.successTitle}>Check your inbox.</h2>
        <p style={S.successSub}>
          If an account exists for that address, you'll receive a password
          reset link shortly.
          <br />
          Check your spam folder if it doesn't arrive.
        </p>
        <button
          style={{ ...S.btn, ...(btnHover ? S.btnHover : {}) }}
          onMouseEnter={() => setBtnHover(true)}
          onMouseLeave={() => setBtnHover(false)}
          onClick={onBack}
          type="button"
        >
          Back to Sign In →
        </button>
      </div>
    </div>
  );
}               