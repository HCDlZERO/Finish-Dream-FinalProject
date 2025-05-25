package com.dreamfinalproject.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class NotificationRepository {

    private final JdbcTemplate jdbcTemplate;

    public NotificationRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // ✅ วันที่ 1, 4, 6 → แจ้งเตือนแบบไม่มีเงื่อนไข
    public List<String> findAllUserPhones() {
        String sql = """
            SELECT phone_number
            FROM users_info
            WHERE phone_number IS NOT NULL
              AND LEN(phone_number) >= 10
            """;
        return jdbcTemplate.queryForList(sql, String.class);
    }

    // 🔶 เงื่อนไข Orange (8–14)
    public List<Map<String, Object>> findUsersWithLatestOrangeBills() {
        String sql = """
            SELECT u.phone_number, b.number_id
            FROM bills b
            JOIN (
                SELECT number_id, MAX(bill_date) AS latest_bill
                FROM bills
                GROUP BY number_id
            ) latest
              ON b.number_id = latest.number_id AND b.bill_date = latest.latest_bill
            JOIN users_info u ON u.number_id = b.number_id
            WHERE b.payment_status = 'Orange'
              AND u.phone_number IS NOT NULL
            """;
        return jdbcTemplate.queryForList(sql);
    }

    // 🔴 เงื่อนไข Red (15–21) + ค้างเกิน 14 วัน
    public List<Map<String, Object>> findUsersWithRedOver14Days() {
        String sql = """
            SELECT u.phone_number, b.number_id
            FROM bills b
            JOIN (
                SELECT number_id, MAX(bill_date) AS latest_bill
                FROM bills
                GROUP BY number_id
            ) latest
              ON b.number_id = latest.number_id AND b.bill_date = latest.latest_bill
            JOIN users_info u ON u.number_id = b.number_id
            WHERE b.payment_status = 'Red'
              AND DATEDIFF(DAY, b.bill_date, GETDATE()) > 14
              AND u.phone_number IS NOT NULL
            """;
        return jdbcTemplate.queryForList(sql);
    }
}
