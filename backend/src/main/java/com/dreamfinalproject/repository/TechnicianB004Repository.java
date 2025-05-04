package com.dreamfinalproject.repository;

import com.dreamfinalproject.dto.TechnicianB004ResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class TechnicianB004Repository {

    @Autowired
    private DataSource dataSource;

    public List<TechnicianB004ResponseDTO> findRedAndCancelledBills() {
        List<TechnicianB004ResponseDTO> results = new ArrayList<>();

        String sql = """
            SELECT b.Number_id, m.First_name, m.Last_name
                    FROM Bills b
                    JOIN (
                        SELECT Number_id, MAX(Bill_date) AS LatestBillDate
                        FROM Bills
                        GROUP BY Number_id
                    ) latest ON b.Number_id = latest.Number_id AND b.Bill_date = latest.LatestBillDate
                    JOIN Members m ON b.Number_id = m.Number_id
                    WHERE b.Payment_status = 'Red' AND b.Cancel_Users = 'Cancel'
                    
        """;

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                TechnicianB004ResponseDTO dto = new TechnicianB004ResponseDTO();
                dto.setNumberId(rs.getString("Number_id"));
                dto.setFirstName(rs.getString("First_name"));
                dto.setLastName(rs.getString("Last_name"));
                results.add(dto);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return results;
    }

    public TechnicianB004ResponseDTO findMemberInfoByNumberId(String numberId) {
        TechnicianB004ResponseDTO dto = null;

        String sql = """
            SELECT First_name, Last_name, House_number, Street, District, City
            FROM Members
            WHERE Number_id = ?
        """;

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, numberId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    dto = new TechnicianB004ResponseDTO();
                    dto.setNumberId(numberId);
                    dto.setFirstName(rs.getString("First_name"));
                    dto.setLastName(rs.getString("Last_name"));
                    dto.setHouseNumber(rs.getString("House_number"));
                    dto.setStreet(rs.getString("Street"));
                    dto.setDistrict(rs.getString("District"));
                    dto.setCity(rs.getString("City"));
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return dto;
    }
}
