package com.dreamfinalproject.service;

import com.dreamfinalproject.repository.OfficerNotificationRepository;
import org.springframework.stereotype.Service;

@Service
public class OfficerNotificationService {

    private final OfficerNotificationRepository repo;
    private final SmsService sms;

    public OfficerNotificationService(OfficerNotificationRepository repo, SmsService sms) {
        this.repo = repo;
        this.sms = sms;
    }

    // ✅ วันที่ 5
    public void notifyCashPaymentRequests() {
        for (var row : repo.findOfficersWithCashPaymentRequests()) {
            sms.sendSms((String) row.get("phone_number"),
                    "📢 Namjai: มีลูกบ้านแจ้งความประสงค์ชำระด้วยเงินสด กรุณาเตรียมดำเนินการรับเงินสดในวันที่ 6 เวลา 11:00 หรือ 17:00 น.");
        }
    }

    // ✅ วันที่ 8
    public void notifyOverdueOrangeBills() {
        for (var row : repo.findOfficersWithOrangeBills()) {
            sms.sendSms((String) row.get("phone_number"),
                    "⚠️ Namjai: มีลูกบ้านค้างค่าน้ำเกิน 7 วัน (สถานะส้ม) กรุณาติดตามเพื่อป้องกันค่าปรับเพิ่มเติม");
        }
    }

    // ✅ วันที่ 15
    public void notifyRedBillsOver14Days() {
        for (var row : repo.findOfficersWithRedBillsOver14Days()) {
            sms.sendSms((String) row.get("phone_number"),
                    "🚨 Namjai: มีลูกบ้านค้างค่าน้ำเกิน 14 วัน กรุณาเตรียมดำเนินการขั้นตอนตัดน้ำ หากยังไม่ชำระ");
        }
    }

    // ✅ สิ้นเดือน - 2 วัน
    public void notifyMeterCheckReminder() {
        for (String phone : repo.findAllOfficerPhones()) {
            sms.sendSms(phone,
                    "📢 Namjai: กรุณาเตรียมดำเนินการตรวจมาตรวัดน้ำของลูกบ้านในเขตที่รับผิดชอบให้ครบภายในสิ้นเดือน");
        }
    }
}
