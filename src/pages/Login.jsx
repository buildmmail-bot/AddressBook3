import "./Login.css";

function Login() {
  return (
    <div className="login-container">

      <div className="login-card">
        
        {/* LOGO */}
        <img
          src="https://upload.wikimedia.org/wikipedia/en/thumb/7/7e/ITC_Limited_Logo.svg/512px-ITC_Limited_Logo.svg.png"
          alt="logo"
          className="logo"
        />

        <h2>🔒 Admin Login</h2>
        <p className="subtitle">Sign in to manage your dashboard</p>

        {/* FORM */}
        <form>
          <label>Username/Email</label>
          <input type="text" placeholder="Enter Your Username/Email" />

          <label>Password</label>
          <input type="password" placeholder="Enter Your Password" />

          <button type="submit">Login</button>
        </form>
      </div>

      {/* WARNING BOX */}
      <div className="warning-box">
        ⚠️ This login page is strictly designed for the <b>administration</b> purpose.
        If you are a user, please go back to the <span>Home Page</span>.
      </div>

    </div>
  );
}

export default Login;