package com.dreamfinalproject.repository;

import com.dreamfinalproject.dto.HeadMainB005RequestDTO;
import com.dreamfinalproject.dto.HeadMainB005ResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class HeadMainB005Repository {

    @Autowired
    private DataSource dataSource;

    public List<HeadMainB005ResponseDTO> fetchAllOfficers() {
        List<HeadMainB005ResponseDTO> list = new ArrayList<>();
        String sql = "SELECT Number_id, First_name, Last_name, Role, Zone_id FROM Officers WHERE Role IN ('Officer', 'Technician')";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                HeadMainB005ResponseDTO dto = new HeadMainB005ResponseDTO();
                dto.setNumberId(rs.getString("Number_id"));
                dto.setFirstName(rs.getString("First_name"));
                dto.setLastName(rs.getString("Last_name"));
                dto.setRole(rs.getString("Role"));
                dto.setZoneId(rs.getInt("Zone_id"));
                list.add(dto);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return list;
    }

    public void deleteOfficer(String numberId) {
        String sql = "DELETE FROM Officers WHERE Number_id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, numberId);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void insertOfficer(HeadMainB005RequestDTO dto) {
        String sql = """
            INSERT INTO Officers (Number_id, First_name, Last_name, Role, Zone_id)
            VALUES (?, ?, ?, ?, ?)
        """;
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, dto.getNumberId());
            stmt.setString(2, dto.getFirstName());
            stmt.setString(3, dto.getLastName());
            stmt.setString(4, dto.getRole());
            stmt.setInt(5, dto.getZoneId());
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void copyRequestToMembers(String numberId) {
        String sql = """
            INSERT INTO Members (Number_id, First_name, Last_name, House_number, Street, District, City, Postal_code, Role, Registration_date, Zone_id)
            SELECT Number_id, First_name, Last_name, House_number, Street, District, City, Postal_code, Role, Registration_date, Zone_id
            FROM request_members
            WHERE Number_id = ?
        """;
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, numberId);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void deleteRequestMember(String numberId) {
        String sql = "DELETE FROM request_members WHERE Number_id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, numberId);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void deleteFromMembers(String numberId) {
        String sql = "DELETE FROM Members WHERE Number_id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, numberId);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void deleteFromDeletedMembers(String numberId) {
        String sql = "DELETE FROM delete_members WHERE Number_id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, numberId);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public List<HeadMainB005ResponseDTO> getRequestMembersWithTag() {
        List<HeadMainB005ResponseDTO> list = new ArrayList<>();
        String sql = "SELECT Number_id, First_name, Last_name FROM request_members";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                HeadMainB005ResponseDTO dto = new HeadMainB005ResponseDTO();
                dto.setNumberId(rs.getString("Number_id"));
                dto.setFirstName(rs.getString("First_name"));
                dto.setLastName(rs.getString("Last_name"));
                dto.setTag("Approve");
                list.add(dto);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return list;
    }

    public List<HeadMainB005ResponseDTO> getDeleteMembersWithTag() {
        List<HeadMainB005ResponseDTO> list = new ArrayList<>();
        String sql = "SELECT Number_id, First_name, Last_name FROM delete_members";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                HeadMainB005ResponseDTO dto = new HeadMainB005ResponseDTO();
                dto.setNumberId(rs.getString("Number_id"));
                dto.setFirstName(rs.getString("First_name"));
                dto.setLastName(rs.getString("Last_name"));
                dto.setTag("delete");
                list.add(dto);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return list;
    }

}
