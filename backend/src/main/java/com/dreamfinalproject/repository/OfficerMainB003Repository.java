package com.dreamfinalproject.repository;

import com.dreamfinalproject.dto.OfficerMainB003RequestDTO;
import com.dreamfinalproject.dto.OfficerMainB003ResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Repository
public class OfficerMainB003Repository {

    @Autowired
    private DataSource dataSource;

    // ค้นหาข้อมูล Users และ Bills ตาม Zone โดยเริ่มจากค้นหา number_id ใน table officer_info และ Officers
    public String getNumberIdByOfficerId(String officerId) {
        String numberId = null;

        // ค้นหา number_id จาก table officer_info
        String getNumberIdSql = "SELECT number_id FROM officer_info WHERE officer_id = ?";
        try (Connection connection = dataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(getNumberIdSql)) {

            preparedStatement.setString(1, officerId);

            try (ResultSet resultSet = preparedStatement.executeQuery()) {
                if (resultSet.next()) {
                    numberId = resultSet.getString("number_id");
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        return numberId;
    }

    public int getZoneByNumberId(String numberId) {
        int zone = 0;

        // ค้นหา Zone จาก table Officers โดยใช้ number_id
        String getZoneSql = "SELECT Zone_id FROM Officers WHERE Number_id = ?";
        try (Connection connection = dataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(getZoneSql)) {

            preparedStatement.setString(1, numberId);

            try (ResultSet resultSet = preparedStatement.executeQuery()) {
                if (resultSet.next()) {
                    zone = resultSet.getInt("Zone_id");
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        return zone;
    }

    public List<OfficerMainB003ResponseDTO> getUsersByZoneWithBills(int zone) {
        List<OfficerMainB003ResponseDTO> users = new ArrayList<>();

        String sql = """
        SELECT m.First_name, m.Last_name, m.Number_id, b.Bill_date, b.Payment_status
        FROM Members m
        LEFT JOIN (
            SELECT Number_id, MAX(Bill_date) AS LatestBillDate
            FROM Bills
            GROUP BY Number_id
        ) latest ON m.Number_id = latest.Number_id
        LEFT JOIN Bills b ON b.Number_id = latest.Number_id AND b.Bill_date = latest.LatestBillDate
        WHERE m.Zone_id = ?
    """;

        try (Connection connection = dataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(sql)) {

            // ✅ มีแค่ 1 parameter: zone
            preparedStatement.setInt(1, zone);

            try (ResultSet resultSet = preparedStatement.executeQuery()) {
                while (resultSet.next()) {
                    OfficerMainB003ResponseDTO user = new OfficerMainB003ResponseDTO();
                    user.setFirstName(resultSet.getString("First_name"));
                    user.setLastName(resultSet.getString("Last_name"));
                    user.setNumberId(resultSet.getString("Number_id"));
                    user.setBillDate(resultSet.getDate("Bill_date"));
                    user.setPaymentStatus(resultSet.getString("Payment_status"));
                    users.add(user);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        return users;
    }


    // บันทึกข้อมูลบิลใหม่
    public void saveBill(OfficerMainB003RequestDTO bill) {
        String sql = """
            INSERT INTO Bills (Number_id, Collection_officer_id, Bill_date, Units_used, Amount_due, Payment_status)
            VALUES (?, ?, ?, ?, ?, ?)
        """;

        try (Connection connection = dataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(sql)) {

            preparedStatement.setString(1, bill.getNumberId());
            preparedStatement.setInt(2, bill.getCollectionOfficerId());
            preparedStatement.setDate(3, new java.sql.Date(bill.getBillDate().getTime()));
            preparedStatement.setDouble(4, bill.getUnitsUsed());
            preparedStatement.setDouble(5, bill.getAmountDue());
            preparedStatement.setString(6, "Gray");

            preparedStatement.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    // อัปเดตสถานะการจ่ายเงิน
    public void updatePaymentStatus(String numberId, String status) {
        String sql = "UPDATE Bills SET Payment_status = ? WHERE Number_id = ?";

        try (Connection connection = dataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(sql)) {

            preparedStatement.setString(1, status);
            preparedStatement.setString(2, numberId);

            preparedStatement.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    // ดึงข้อมูลบิลทั้งหมดของผู้ใช้
    public List<OfficerMainB003ResponseDTO> getBillsByNumberId(String numberId) {
        List<OfficerMainB003ResponseDTO> bills = new ArrayList<>();
        String billSql = """
    SELECT TOP 1 * FROM Bills 
    WHERE Number_id = ?
    ORDER BY Bill_date DESC
""";
        String memberSql = "SELECT First_name, Last_name FROM Members WHERE Number_id = ?";

        try (Connection connection = dataSource.getConnection();
             PreparedStatement billStatement = connection.prepareStatement(billSql);
             PreparedStatement memberStatement = connection.prepareStatement(memberSql)) {

            billStatement.setString(1, numberId);
            try (ResultSet billResultSet = billStatement.executeQuery()) {
                while (billResultSet.next()) {
                    OfficerMainB003ResponseDTO bill = new OfficerMainB003ResponseDTO();
                    bill.setNumberId(billResultSet.getString("Number_id"));
                    bill.setCollectionOfficerId(billResultSet.getInt("Collection_officer_id"));
                    bill.setBillDate(billResultSet.getDate("Bill_date"));
                    bill.setUnitsUsed(billResultSet.getDouble("Units_used"));
                    bill.setAmountDue(billResultSet.getDouble("Amount_due"));
                    bill.setPaymentStatus(billResultSet.getString("Payment_status"));
                    bill.setCash(billResultSet.getString("Cash"));
                    bill.setCashTime(billResultSet.getString("Cash_time"));
                    bills.add(bill);
                }
            }

            memberStatement.setString(1, numberId);
            try (ResultSet memberResultSet = memberStatement.executeQuery()) {
                if (memberResultSet.next()) {
                    String firstName = memberResultSet.getString("First_name");
                    String lastName = memberResultSet.getString("Last_name");
                    for (OfficerMainB003ResponseDTO bill : bills) {
                        bill.setFirstName(firstName);
                        bill.setLastName(lastName);
                    }
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return bills;
    }




    public void insertMember(OfficerMainB003RequestDTO dto) {
        String sql = """
        INSERT INTO request_members 
        (Number_id, First_name, Last_name, House_number, Street, District, City, Postal_code, Role, Registration_date, Zone_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """;

        try (Connection connection = dataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(sql)) {

            preparedStatement.setString(1, dto.getNumberId());
            preparedStatement.setString(2, dto.getFirstName());
            preparedStatement.setString(3, dto.getLastName());
            preparedStatement.setString(4, dto.getHouseNumber());
            preparedStatement.setString(5, dto.getStreet());
            preparedStatement.setString(6, dto.getDistrict());
            preparedStatement.setString(7, dto.getCity());
            preparedStatement.setString(8, dto.getPostalCode());
            preparedStatement.setString(9, dto.getRole());
            preparedStatement.setDate(10, java.sql.Date.valueOf(String.valueOf(dto.getRegistrationDate())));
            preparedStatement.setInt(11, dto.getZone());

            preparedStatement.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void markUserAsCancelled(String numberId) {
        String sql = "UPDATE Bills SET Cancel_Users = 'Cancel' WHERE Number_id = ?";

        try (Connection connection = dataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(sql)) {

            preparedStatement.setString(1, numberId);
            preparedStatement.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public List<OfficerMainB003ResponseDTO> getConfirmInfo(String firstName, String lastName) {
        List<OfficerMainB003ResponseDTO> confirms = new ArrayList<>();

        String sql = """
        SELECT First_name, Last_name, Amount_due, Confirm_date, Confirm_time, Officer_name, Confirm_image
        FROM Bills_Comfrim
        WHERE First_name = ? AND Last_name = ?
    """;

        try (Connection connection = dataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(sql)) {

            preparedStatement.setString(1, firstName);
            preparedStatement.setString(2, lastName);

            try (ResultSet resultSet = preparedStatement.executeQuery()) {
                while (resultSet.next()) {
                    OfficerMainB003ResponseDTO dto = new OfficerMainB003ResponseDTO();
                    dto.setFirstName(resultSet.getString("First_name"));
                    dto.setLastName(resultSet.getString("Last_name"));
                    dto.setAmountDue(resultSet.getDouble("Amount_due"));
                    dto.setConfirmDate(resultSet.getDate("Confirm_date"));
                    dto.setConfirmTime(resultSet.getString("Confirm_time"));
                    dto.setOfficerName(resultSet.getString("Officer_name"));
                    dto.setConfirmImage(resultSet.getString("Confirm_image")); // อาจเป็น URL หรือ Base64

                    confirms.add(dto);
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return confirms;
    }

    public void confirmPaymentByName(String firstName, String lastName) {
        String getNumberIdSql = "SELECT Number_id FROM Members WHERE First_name = ? AND Last_name = ?";
        String checkBillExistsSql = "SELECT COUNT(*) FROM Bills WHERE Number_id = ?";
        String updateStatusSql = "UPDATE Bills SET Payment_status = 'Green' WHERE Number_id = ?";

        try (Connection connection = dataSource.getConnection();
             PreparedStatement numberStmt = connection.prepareStatement(getNumberIdSql)) {

            numberStmt.setString(1, firstName);
            numberStmt.setString(2, lastName);

            try (ResultSet rs = numberStmt.executeQuery()) {
                if (rs.next()) {
                    String numberId = rs.getString("Number_id");

                    // ตรวจสอบว่ามีบิลใน table Bills หรือไม่
                    try (PreparedStatement checkStmt = connection.prepareStatement(checkBillExistsSql)) {
                        checkStmt.setString(1, numberId);

                        try (ResultSet checkRs = checkStmt.executeQuery()) {
                            if (checkRs.next() && checkRs.getInt(1) > 0) {
                                // อัปเดต payment_status = 'Green'
                                try (PreparedStatement updateStmt = connection.prepareStatement(updateStatusSql)) {
                                    updateStmt.setString(1, numberId);
                                    updateStmt.executeUpdate();
                                }
                            }
                        }
                    }
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void insertDeletedMember(OfficerMainB003RequestDTO dto) {
        String sql = """
        INSERT INTO delete_members (Number_id, First_name, Last_name)
        VALUES (?, ?, ?)
    """;

        try (Connection connection = dataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(sql)) {

            preparedStatement.setString(1, dto.getNumberId());
            preparedStatement.setString(2, dto.getFirstName());
            preparedStatement.setString(3, dto.getLastName());

            preparedStatement.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void updatePaymentStatusLatest(String numberId, String status) {
        String sql = """
        UPDATE Bills
        SET payment_status = ?
        WHERE number_id = ?
          AND bill_date = (
              SELECT MAX(bill_date)
              FROM Bills
              WHERE number_id = ?
          )
    """;

        try (Connection connection = dataSource.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {

            statement.setString(1, status);
            statement.setString(2, numberId);
            statement.setString(3, numberId);
            statement.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }


    public void addPenaltyToLatestBill(String numberId, double penalty) {
        String sql = """
        UPDATE Bills
        SET cash = COALESCE(cash, 0) + ?
        WHERE number_id = ?
          AND bill_date = (
              SELECT MAX(bill_date)
              FROM Bills
              WHERE number_id = ?
          )
    """;

        try (Connection connection = dataSource.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {

            statement.setDouble(1, penalty);
            statement.setString(2, numberId);
            statement.setString(3, numberId);
            statement.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }


    public void addToAmountDueLatestBill(String numberId, double amount) {
        String sql = """
        UPDATE Bills
        SET amount_due = amount_due + ?
        WHERE number_id = ?
          AND bill_date = (
              SELECT MAX(bill_date)
              FROM Bills
              WHERE number_id = ?
          )
    """;

        try (Connection connection = dataSource.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {

            statement.setDouble(1, amount);
            statement.setString(2, numberId);
            statement.setString(3, numberId);
            statement.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

}
