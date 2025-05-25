package com.dreamfinalproject.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SmsService {

    @Value("${twilio.account_sid}")
    private String accountSid;

    @Value("${twilio.auth_token}")
    private String authToken;

    @Value("${twilio.phone_number}")
    private String fromPhone;

    private boolean initialized = false;

    @PostConstruct
    public void init() {
        if (!initialized) {
            Twilio.init(accountSid, authToken);
            initialized = true;
        }
    }

    public void sendSms(String toPhone, String messageText) {
        try {
            // ✅ แปลงเบอร์ไทย เช่น 0928123456 → +66928123456
            if (toPhone != null && toPhone.startsWith("0")) {
                toPhone = "+66" + toPhone.substring(1);
            }

            System.out.println("📨 Sending SMS to: " + toPhone);
            System.out.println("📝 Message: " + messageText);

            Message.creator(
                    new PhoneNumber(toPhone),
                    new PhoneNumber(fromPhone),
                    messageText
            ).create();

            System.out.println("✅ SMS sent successfully to: " + toPhone);
        } catch (Exception e) {
            System.err.println("❌ Failed to send SMS to: " + toPhone);
            System.err.println("💥 Reason: " + e.getMessage());
        }
    }
}
