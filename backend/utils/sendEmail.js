const Brevo = require("@getbrevo/brevo");

const brevoApi = new Brevo.TransactionalEmailsApi();
brevoApi.authentications['apiKey'].apiKey = process.env.BREVO_API_KEY;

// ✅ Universal email sender using Brevo API (works on Render)
const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!to) throw new Error("No recipient email provided");

    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    sendSmtpEmail.sender = {
      name: "Smart Book",
      email: "sudhitareddy582@gmail.com", // must be your verified Brevo sender
    };
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;

    const response = await brevoApi.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Email sent to ${to}:`, response.messageId || "Success");
    return response;
  } catch (error) {
    console.error("❌ Brevo email failed:", error.response?.text || error.message);
    throw error;
  }
};

module.exports = sendEmail;
