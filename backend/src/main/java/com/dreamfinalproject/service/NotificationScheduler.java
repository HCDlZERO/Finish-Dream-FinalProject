package com.dreamfinalproject.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class NotificationScheduler {

    private final NotificationService notificationService;

    public NotificationScheduler(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // 1️⃣ วันที่ 1: แจ้งเตือนยอดค่าน้ำ
    @Scheduled(cron = "0 0 9 1 * ?")  // 09:00 วันที่ 1
    public void monthlyBillReminder() {
        notificationService.notifyUsersMonthlyBill();
    }

    // 2️⃣ วันที่ 4: แจ้งว่ากำลังจะหมดเวลาชำระด้วยเงินสด
    @Scheduled(cron = "0 0 9 4 * ?")  // 09:00 วันที่ 4
    public void cashDeadlineReminder() {
        notificationService.notifyUsersBeforeCashDeadline();
    }

    // 3️⃣ วันที่ 6: แจ้งว่าครบกำหนดชำระเงินวันนี้
    @Scheduled(cron = "0 0 9 6 * ?")  // 09:00 วันที่ 6
    public void finalDeadlineReminder() {
        notificationService.notifyUsersFinalDeadline();
    }

    // 4️⃣ วันที่ 8–14: แจ้งว่าค้างชำระ (Orange) [ชั่วคราวรันเวลา 01:32]
    @Scheduled(cron = "0 36 1 8-14 * ?") // 01:32 วันที่ 8–14
    public void overdueOrangeReminder() {
        notificationService.notifyUsersOverdueOrange();
    }




    // 5️⃣ วันที่ 15–21: แจ้งเตือนตัดน้ำ (Red + เกิน 14 วัน)
    @Scheduled(cron = "0 41 0 15-21 * ?") // 00:01 วันที่ 15–21
    public void cutWaterRedReminder() {
        notificationService.notifyUsersCutWaterRed();
    }
}
