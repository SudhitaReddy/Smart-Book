document.addEventListener("DOMContentLoaded", () => {
  const otpForm = document.getElementById("otpForm");
  const resendBtn = document.getElementById("resendBtn");

  const userId = localStorage.getItem("signupUserId");

  // Verify OTP
  if (otpForm) {
    otpForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const otp = document.getElementById("otp").value.trim();

      try {
        const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, otp })
        });

        const data = await res.json();
        if (data.success) {
          localStorage.setItem("token", data.data.token);
          localStorage.setItem("loggedInUser", JSON.stringify(data.data.user));
          localStorage.removeItem("signupUserId");
          alert("Email verified successfully!");
          window.location.href = "index.html";
        } else {
          alert(data.message);
        }
      } catch (err) {
        console.error(err);
        alert("OTP verification failed");
      }
    });
  }

  // Resend OTP
  if (resendBtn) {
    resendBtn.addEventListener("click", async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/resend-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId })
        });

        const data = await res.json();
        alert(data.message);
      } catch (err) {
        console.error(err);
        alert("Failed to resend OTP");
      }
    });
  }
});
