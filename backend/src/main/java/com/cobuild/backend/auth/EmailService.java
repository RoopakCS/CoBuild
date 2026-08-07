package com.cobuild.backend.auth;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:dharsan@gmail.com}")
    private String fromEmail;

    @Value("${resend.api.key:${RESEND_API_KEY:}}")
    private String resendApiKey;

    @Value("${cobuild.resend.from-email:CoBuild <onboarding@resend.dev>}")
    private String resendFromEmail;

    public void sendVerificationCode(String toEmail, String code) {
        String htmlContent = buildVerificationEmailHtml(code);

        // 1. Try Resend HTTPS API if API Key is configured (Works 100% on Render/Cloud hosts without SMTP port blocks)
        if (resendApiKey != null && !resendApiKey.trim().isEmpty()) {
            if (sendViaResendApi(toEmail, code, htmlContent)) {
                return;
            }
        }

        // 2. Fallback to JavaMailSender SMTP
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail, "CoBuild Team");
            helper.setReplyTo(fromEmail, "CoBuild Support");
            helper.setTo(toEmail);
            helper.setSubject("Your CoBuild verification code: " + code);

            // Add anti-spam headers for transactional emails
            mimeMessage.setHeader("Auto-Submitted", "auto-generated");
            mimeMessage.setHeader("X-Auto-Response-Suppress", "OOF, AutoReply");
            mimeMessage.setHeader("X-Priority", "1");

            String textFallback = "Welcome to CoBuild!\n\n" +
                    "Your 6-digit authentication code for registration is: " + code + "\n\n" +
                    "This code will expire in 10 minutes. If you did not request this verification, please ignore this email.\n\n" +
                    "Best regards,\nThe CoBuild Team";

            helper.setText(textFallback, htmlContent);

            mailSender.send(mimeMessage);
            log.info("HTML verification code email successfully sent to {}", toEmail);
        } catch (Exception e) {
            log.warn("Email delivery attempt to {} encountered an exception: {}", toEmail, e.getMessage());
        }
    }

    private boolean sendViaResendApi(String toEmail, String code, String htmlContent) {
        try {
            java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
            String from = resendFromEmail;
            
            // Format JSON body for Resend API
            String jsonPayload = "{"
                    + "\"from\":\"" + from + "\","
                    + "\"to\":[\"" + toEmail + "\"],"
                    + "\"subject\":\"Your CoBuild verification code: " + code + "\","
                    + "\"html\":\"" + htmlContent.replace("\"", "\\\"").replace("\n", "") + "\""
                    + "}";

            java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create("https://api.resend.com/emails"))
                    .header("Authorization", "Bearer " + resendApiKey.trim())
                    .header("Content-Type", "application/json")
                    .POST(java.net.http.HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            java.net.http.HttpResponse<String> response = client.send(request, java.net.http.HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("Resend HTTPS email successfully delivered to {}", toEmail);
                return true;
            } else {
                log.warn("Resend API returned status {}: {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.warn("Failed to send email via Resend HTTPS API: {}", e.getMessage());
        }
        return false;
    }

    private String buildVerificationEmailHtml(String code) {
        int currentYear = java.time.Year.now().getValue();
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "<title>Verify your email</title>" +
                "</head>" +
                "<body style='margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; -webkit-font-smoothing: antialiased;'>" +
                "  <table role='presentation' width='100%' cellspacing='0' cellpadding='0' border='0' style='background-color: #ffffff; padding: 48px 16px;'>" +
                "    <tr>" +
                "      <td align='center'>" +
                "        <table role='presentation' width='100%' cellspacing='0' cellpadding='0' border='0' style='max-width: 440px; text-align: left;'>" +
                "          <!-- Logo -->" +
                "          <tr>" +
                "            <td style='padding-bottom: 32px; border-bottom: 1px solid #f1f5f9;'>" +
                "              <span style='font-size: 20px; font-weight: 700; letter-spacing: -0.5px; color: #0f172a;'>CoBuild.</span>" +
                "            </td>" +
                "          </tr>" +
                "          <!-- Content -->" +
                "          <tr>" +
                "            <td style='padding-top: 32px; font-size: 15px; line-height: 1.6; color: #334155;'>" +
                "              <h1 style='font-size: 20px; font-weight: 600; color: #0f172a; margin: 0 0 12px 0; letter-spacing: -0.3px;'>Verify your email address</h1>" +
                "              <p style='margin: 0 0 28px 0; color: #475569;'>Use the code below to verify your email and finish setting up your account.</p>" +
                "              " +
                "              <!-- Minimalist Code Container -->" +
                "              <div style='background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 22px 24px; text-align: center; margin-bottom: 28px;'>" +
                "                <span style='display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; margin-bottom: 8px;'>Verification Code</span>" +
                "                <div style='font-family: ui-monospace, \"SF Mono\", Consolas, \"Courier New\", monospace; font-size: 32px; font-weight: 700; letter-spacing: 10px; color: #0f172a; margin-left: 10px;'>" + code + "</div>" +
                "              </div>" +
                "              " +
                "              <p style='margin: 0 0 32px 0; font-size: 13px; color: #64748b;'>This code expires in <strong>10 minutes</strong>. If you didn't request this email, no action is required.</p>" +
                "              " +
                "              <hr style='border: none; border-top: 1px solid #f1f5f9; margin: 0 0 24px 0;' />" +
                "              " +
                "              <!-- Footer -->" +
                "              <p style='margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5;'>" +
                "                &copy; " + currentYear + " CoBuild Inc. All rights reserved.<br>" +
                "                This is an automated transactional message." +
                "              </p>" +
                "            </td>" +
                "          </tr>" +
                "        </table>" +
                "      </td>" +
                "    </tr>" +
                "  </table>" +
                "</body>" +
                "</html>";
    }
}
