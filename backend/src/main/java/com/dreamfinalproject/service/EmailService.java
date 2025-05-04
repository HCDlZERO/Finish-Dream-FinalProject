package com.dreamfinalproject.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class EmailService {

    @Value("${resend.api.key}")
    private String apiKey;

    @Value("${resend.from.email}")
    private String fromEmail;

    public void sendOtpEmail(String toEmail, String otpCode) {
        String subject = "รหัส OTP สำหรับยืนยันตัวตน - Namjai";
        String htmlContent = "<p>สวัสดีค่ะ</p>" +
                "<p>รหัส OTP ของคุณคือ <b>" + otpCode + "</b></p>" +
                "<p>รหัสนี้มีอายุ 5 นาที กรุณาอย่าเปิดเผยให้ผู้อื่นทราบ</p>" +
                "<p>ขอบคุณที่ใช้บริการ Namjai</p>";

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();
        body.put("from", fromEmail);
        body.put("to", toEmail);
        body.put("subject", subject);
        body.put("html", htmlContent);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            restTemplate.postForEntity("https://api.resend.com/emails", request, String.class);
            System.out.println("✅ OTP email sent to " + toEmail);
        } catch (Exception e) {
            System.out.println("❌ Failed to send OTP email: " + e.getMessage());
        }
    }
}
