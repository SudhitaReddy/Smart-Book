router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  const tempUser = tempUsers[email];
  if (!tempUser) return res.status(400).json({ success: false, message: "No OTP request found" });
  if (Date.now() > tempUser.expires) return res.status(400).json({ success: false, message: "OTP expired" });
  if (tempUser.otp !== otp) return res.status(400).json({ success: false, message: "Invalid OTP" });

  // Save user to DB
  const user = new User({
    name: tempUser.name,
    email: tempUser.email,
    mobile: tempUser.mobile,
    password: tempUser.password
  });
  await user.save();

  delete tempUsers[email];

  res.json({ success: true, message: "Registration completed successfully!" });
});
