package com.dreamfinalproject.repository;

import com.dreamfinalproject.dto.UserMain006ResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import com.dreamfinalproject.dto.UserMain006RequestDTO;

import javax.sql.DataSource;
import java.sql.*;
import java.util.*;

@Repository
public class UserMain006Repository {

    @Autowired
    private DataSource dataSource;

    // หา number_id จาก id ที่ได้จาก login (id = user_id ใน users_info)
    // หา number_id, first_name, last_name จาก id (user_id ใน users_info)
    public Map<String, String> getNumberIdByUserId(Integer id) {
        String sql = "SELECT number_id, first_name, last_name FROM users_info WHERE user_id = ?";
        Map<String, String> result = new HashMap<>();

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, id); // ✅ เพราะ id เป็น Integer
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    result.put("number_id", rs.getString("number_id"));
                    result.put("first_name", rs.getString("first_name"));
                    result.put("last_name", rs.getString("last_name"));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return result.isEmpty() ? null : result;
    }



    public Map<String, Object> getLatestBillByNumberId(String numberId) {
        String sql = """
                SELECT TOP 1 * FROM Bills 
                WHERE Number_id = ? 
                ORDER BY Bill_date DESC
                """;
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, numberId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    Map<String, Object> bill = new HashMap<>();
                    bill.put("bill_id", rs.getInt("Bill_id"));
                    bill.put("amount_due", rs.getDouble("Amount_due"));
                    bill.put("bill_date", rs.getDate("Bill_date"));
                    bill.put("collection_officer_id", rs.getInt("Collection_officer_id"));
                    bill.put("number_id", rs.getString("Number_id"));
                    bill.put("payment_status", rs.getString("Payment_status"));
                    bill.put("units_used", rs.getDouble("Units_used"));
                    bill.put("cancel_users", rs.getString("Cancel_Users"));
                    bill.put("cash", rs.getString("Cash"));
                    bill.put("cash_time", rs.getString("Cash_time"));
                    return bill;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public String getQrCodeByOfficerId(String officerId) {
        String sql = "SELECT qr_code FROM officer_info WHERE officer_id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, officerId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) return rs.getString("qr_code");
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public Map<String, String> getBankInfo(String officerId) {
        String sql = "SELECT bank, bank_id FROM officer_info WHERE officer_id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, officerId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    Map<String, String> info = new HashMap<>();
                    info.put("bank", rs.getString("bank"));
                    info.put("bank_id", rs.getString("bank_id"));
                    return info;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public boolean updateLatestBill(String numberId, String paymentStatus, Integer cashTime) {
        String sql = """
                UPDATE Bills SET Payment_status = ?, Cash_time = ? 
                WHERE Number_id = ? AND Bill_date = (
                    SELECT MAX(Bill_date) FROM Bills WHERE Number_id = ?
                )
                """;
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, paymentStatus);
            stmt.setInt(2, cashTime);
            stmt.setString(3, numberId);
            stmt.setString(4, numberId);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<Map<String, Object>> getBillHistory(String numberId) {
        String sql = "SELECT Bill_id, Bill_date FROM Bills WHERE Number_id = ? ORDER BY Bill_date DESC";
        List<Map<String, Object>> list = new ArrayList<>();
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, numberId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> row = new HashMap<>();
                    row.put("bill_id", rs.getString("Bill_id"));
                    row.put("bill_date", rs.getDate("Bill_date"));
                    list.add(row);
                }
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return list;
    }

    public Map<String, Object> getBillDetail(String billId) {
        String sql = "SELECT * FROM Bills WHERE Bill_id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, billId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    ResultSetMetaData meta = rs.getMetaData();
                    Map<String, Object> row = new HashMap<>();
                    for (int i = 1; i <= meta.getColumnCount(); i++) {
                        row.put(meta.getColumnName(i), rs.getObject(i));
                    }
                    return row;
                }
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return null;
    }

    public Map<String, Object> getUserDetail(String numberId) {
        String sql = """
            SELECT m.First_name, m.Last_name, m.House_number, m.Street, m.District, m.City, m.Postal_code,
                   u.email, u.phone_number
            FROM Members m
            LEFT JOIN users_info u ON m.Number_id = u.Number_id
            WHERE m.Number_id = ?
        """;
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, numberId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    Map<String, Object> row = new HashMap<>();
                    row.put("first_name", rs.getString("First_name"));
                    row.put("last_name", rs.getString("Last_name"));
                    row.put("house_number", rs.getString("House_number"));
                    row.put("street", rs.getString("Street"));
                    row.put("district", rs.getString("District"));
                    row.put("city", rs.getString("City"));
                    row.put("postal_code", rs.getString("Postal_code"));
                    row.put("email", rs.getString("email"));
                    row.put("phone_number", rs.getString("phone_number"));
                    return row;
                }
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return null;
    }

    public boolean updateUserInfo(UserMain006RequestDTO dto) {
        try (Connection conn = dataSource.getConnection()) {
            conn.setAutoCommit(false);
            String memberSql = "UPDATE Members SET House_number=?, Street=?, District=?, City=?, Postal_code=? WHERE Number_id=?";
            try (PreparedStatement stmt = conn.prepareStatement(memberSql)) {
                stmt.setString(1, dto.getHouseNumber());
                stmt.setString(2, dto.getStreet());
                stmt.setString(3, dto.getDistrict());
                stmt.setString(4, dto.getCity());
                stmt.setString(5, dto.getPostalCode());
                stmt.setString(6, dto.getNumberId());
                stmt.executeUpdate();
            }
            String userSql = "UPDATE users_info SET email=?, phone_number=? WHERE Number_id=?";
            try (PreparedStatement stmt = conn.prepareStatement(userSql)) {
                stmt.setString(1, dto.getEmail());
                stmt.setString(2, dto.getPhoneNumber());
                stmt.setString(3, dto.getNumberId());
                stmt.executeUpdate();
            }
            conn.commit();
            return true;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean saveBillConfirm(UserMain006RequestDTO dto) {
        String sql = "INSERT INTO bills_Comfrim (First_name, Last_name, Amount_due, Confirm_date, Confirm_time, Officer_name, Confirm_image) VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, dto.getFirstName());
            stmt.setString(2, dto.getLastName());
            stmt.setDouble(3, dto.getAmountDue());
            stmt.setString(4, dto.getConfirmDate());
            stmt.setString(5, dto.getConfirmTime());
            stmt.setString(6, dto.getOfficerName());
            stmt.setString(7, dto.getConfirmImage());
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public Map<String, Object> getOfficerContact(String officerId) {
        String sql = "SELECT first_name, last_name, phone_number, Line_id FROM officer_info WHERE officer_id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, officerId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    Map<String, Object> row = new HashMap<>();
                    row.put("first_name", rs.getString("first_name"));
                    row.put("last_name", rs.getString("last_name"));
                    row.put("phone_number", rs.getString("phone_number"));
                    row.put("line_id", rs.getString("Line_id"));
                    return row;
                }
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return null;
    }
}
