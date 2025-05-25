package com.dreamfinalproject.service;

import com.dreamfinalproject.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SmsService smsService;

    public NotificationService(NotificationRepository notificationRepository, SmsService smsService) {
        this.notificationRepository = notificationRepository;
        this.smsService = smsService;
    }

    /**
     * ✅ วันที่ 1 → แจ้งยอดค่าน้ำ
     */
    @Transactional
    public void notifyUsersMonthlyBill() {
        List<String> phones = notificationRepository.findAllUserPhones();
        for (String phone : phones) {
            if (phone != null && !phone.isEmpty()) {
                smsService.sendSms(phone, "📢 Namjai: กรุณาชำระค่าน้ำประจำเดือนภายในวันที่ 14");
            }
        }
    }

    /**
     * ✅ วันที่ 4 → แจ้งวันสุดท้ายของการชำระเงินสด
     */
    @Transactional
    public void notifyUsersBeforeCashDeadline() {
        List<String> phones = notificationRepository.findAllUserPhones();
        for (String phone : phones) {
            if (phone != null && !phone.isEmpty()) {
                smsService.sendSms(phone, "📢 Namjai: เหลือเวลาอีกไม่กี่วันสำหรับการชำระเงินสด อย่าลืมนะครับ");
            }
        }
    }

    /**
     * ✅ วันที่ 6 → แจ้งว่าครบกำหนดชำระเงินวันนี้
     */
    @Transactional
    public void notifyUsersFinalDeadline() {
        List<String> phones = notificationRepository.findAllUserPhones();
        for (String phone : phones) {
            if (phone != null && !phone.isEmpty()) {
                smsService.sendSms(phone, "📢 Namjai: วันนี้คือวันสุดท้ายของการชำระค่าน้ำ โปรดชำระทันที");
            }
        }
    }

    /**
     * ✅ วันที่ 8–14 → แจ้งว่าค้างชำระ (สถานะ Orange)
     */
    @Transactional
    public void notifyUsersOverdueOrange() {
        List<Map<String, Object>> users = notificationRepository.findUsersWithLatestOrangeBills();

        for (Map<String, Object> row : users) {
            String phone = (String) row.get("phone_number");
            if (phone != null && !phone.isEmpty()) {
                smsService.sendSms(phone,
                        "❗ Namjai: คุณยังไม่ได้ชำระค่าน้ำและเลยกำหนดแล้ว โปรดชำระด่วนภายในวันที่ 14 มิฉะนั้นจะไม่สามารถชำระด้วยเงินสด และต้องเสียค่าปรับ 200 บาท");
            }
        }
    }

    /**
     * ✅ วันที่ 15–21 → แจ้งเตือนตัดน้ำ (สถานะ Red + เกิน 14 วัน)
     */
    @Transactional
    public void notifyUsersCutWaterRed() {
        List<Map<String, Object>> users = notificationRepository.findUsersWithRedOver14Days();

        for (Map<String, Object> row : users) {
            String phone = (String) row.get("phone_number");
            if (phone != null && !phone.isEmpty()) {
                smsService.sendSms(phone,
                        "🚨 Namjai: คุณยังไม่ได้ชำระค่าน้ำเกิน 14 วัน เจ้าหน้าที่อาจตัดน้ำ และจะมีค่าปรับรวม 500 บาทหากต้องการใช้งานใหม่");
            }
        }
    }
}
