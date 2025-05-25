package com.dreamfinalproject.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;

@Component
public class OfficerNotificationScheduler {

    private final OfficerNotificationService service;

    public OfficerNotificationScheduler(OfficerNotificationService service) {
        this.service = service;
    }

    // ✅ วันที่ 5
    @Scheduled(cron = "0 0 9 5 * ?")
    public void sendCashRequestReminder() {
        service.notifyCashPaymentRequests();
    }

    // ✅ วันที่ 8
    @Scheduled(cron = "0 0 9 8 * ?")
    public void sendOrangeBillReminder() {
        service.notifyOverdueOrangeBills();
    }

    // ✅ วันที่ 15
    @Scheduled(cron = "0 0 9 15 * ?")
    public void sendRedBillCutoffWarning() {
        service.notifyRedBillsOver14Days();
    }

    // ✅ สิ้นเดือน - 2 วัน
    @Scheduled(cron = "0 0 9 27-30 * ?") // เช็คเฉพาะช่วงสิ้นเดือน
    public void sendMeterCheckReminder() {
        LocalDate today = LocalDate.now();
        LocalDate endOfMonth = today.with(TemporalAdjusters.lastDayOfMonth());
        if (ChronoUnit.DAYS.between(today, endOfMonth) == 2) {
            service.notifyMeterCheckReminder();
        }
    }
}
