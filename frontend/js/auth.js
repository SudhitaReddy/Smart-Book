document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ auth.js loaded");

  /* ----------------- SIGNUP ----------------- */
  const signupForm = document.getElementById("signupForm");
  const otpDiv = document.getElementById("otpDiv");
  const verifyOtpBtn = document.getElementById("verifyOtpBtn");
  const resendOtpBtn = document.getElementById("resendOtpBtn");

  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const mobile = document.getElementById("mobile").value.trim();
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      if (password !== confirmPassword) {
        return alert("Passwords do not match!");
      }

      try {
        // Step 1: Send OTP
        const res = await fetch("http://localhost:5000/api/auth/send-otp-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });

        const data = await res.json();
        if (!data.success) {
          if (data.redirect) {
            alert(data.message);
            window.location.href = data.redirect;
          } else {
            alert(data.message);
          }
          return;
        }

        // Show OTP input section
        alert("OTP sent to your email. Please check your inbox/spam.");
        otpDiv.classList.remove("d-none");

        // Step 2: Verify OTP
        verifyOtpBtn.addEventListener("click", async () => {
          const otp = document.getElementById("otp").value.trim();
          if (!otp) return alert("Please enter OTP");

          try {
            const verifyRes = await fetch("http://localhost:5000/api/auth/verify-otp-email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name, email, mobile, password, otp })
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              alert("Signup successful! Please login.");
              window.location.href = "login.html";
            } else {
              alert(verifyData.message);
            }
          } catch (err) {
            console.error("OTP verify error:", err);
            alert("Error verifying OTP");
          }
        });

        // Step 3: Resend OTP
        resendOtpBtn.addEventListener("click", async () => {
          try {
            const res = await fetch("http://localhost:5000/api/auth/send-otp-email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email })
            });

            const data = await res.json();
            alert(data.message);
          } catch (err) {
            console.error("Resend OTP error:", err);
            alert("Error resending OTP");
          }
        });

      } catch (err) {
        console.error("Signup error:", err);
        alert("Signup failed due to server error.");
      }
    });
  }

  /* ----------------- LOGIN ----------------- */
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      try {
        const res = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        console.log("🔎 Login response:", data);

        if (data.success) {
          localStorage.setItem("token", data.data.token);
          localStorage.setItem("loggedInUser", JSON.stringify(data.data.user));

          alert("Login successful!");
          window.location.href = "index.html"; // redirect to homepage
        } else {
          alert(data.message || "Invalid credentials");
        }
      } catch (err) {
        console.error("Login error:", err);
        alert("Login failed due to server error.");
      }
    });
  }
});
