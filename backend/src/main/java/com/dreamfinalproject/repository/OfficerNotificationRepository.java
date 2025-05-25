package com.dreamfinalproject.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Map;

@Repository
public class OfficerNotificationRepository {

    private final JdbcTemplate jdbcTemplate;

    public OfficerNotificationRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // ✅ วันที่ 5: ลูกบ้านขอจ่ายเงินสด
    public List<Map<String, Object>> findOfficersWithCashPaymentRequests() {
        return jdbcTemplate.queryForList("""
            SELECT DISTINCT b.collection_officer_id, o.phone_number
            FROM bills b
            JOIN (SELECT number_id, MAX(bill_date) AS latest_bill FROM bills GROUP BY number_id) latest
              ON b.number_id = latest.number_id AND b.bill_date = latest.latest_bill
            JOIN officer_info o ON b.collection_officer_id = o.officer_id
            WHERE b.payment_status = 'Yellow' AND b.cash_time IS NOT NULL
        """);
    }

    // ✅ วันที่ 8: ค้างค่าน้ำ 7–14 วัน สถานะ Orange
    public List<Map<String, Object>> findOfficersWithOrangeBills() {
        return jdbcTemplate.queryForList("""
            SELECT DISTINCT b.collection_officer_id, o.phone_number
            FROM bills b
            JOIN (SELECT number_id, MAX(bill_date) AS latest_bill FROM bills GROUP BY number_id) latest
              ON b.number_id = latest.number_id AND b.bill_date = latest.latest_bill
            JOIN officer_info o ON b.collection_officer_id = o.officer_id
            WHERE b.payment_status = 'Orange'
              AND DATEDIFF(DAY, b.bill_date, GETDATE()) BETWEEN 7 AND 14
        """);
    }

    // ✅ วันที่ 15: ค้างเกิน 14 วัน สถานะ Red
    public List<Map<String, Object>> findOfficersWithRedBillsOver14Days() {
        return jdbcTemplate.queryForList("""
            SELECT DISTINCT b.collection_officer_id, o.phone_number
            FROM bills b
            JOIN (SELECT number_id, MAX(bill_date) AS latest_bill FROM bills GROUP BY number_id) latest
              ON b.number_id = latest.number_id AND b.bill_date = latest.latest_bill
            JOIN officer_info o ON b.collection_officer_id = o.officer_id
            WHERE b.payment_status = 'Red'
              AND DATEDIFF(DAY, b.bill_date, GETDATE()) > 14
        """);
    }

    // ✅ สิ้นเดือน - 2 วัน: แจ้งให้เช็คมาตรวัดน้ำ (ไม่มีเงื่อนไข)
    public List<String> findAllOfficerPhones() {
        return jdbcTemplate.queryForList("""
            SELECT phone_number FROM officer_info
            WHERE phone_number IS NOT NULL AND LEN(phone_number) >= 10
        """, String.class);
    }
}
