package com.dreamfinalproject.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Random;

@Repository
public class Bregister001Repository {

    @Autowired
    private DataSource dataSource;

    public boolean MemberRegister(String firstName, String lastName, String email, String phoneNumber, String role, String numberId, String password, String confirmPassword) {
        // ตรวจสอบว่า password กับ confirmPassword ตรงกันหรือไม่
        if (!password.equals(confirmPassword)) {
            System.out.println("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
            return false;
        }

        String sql = "SELECT * FROM Members WHERE First_name = ? AND Last_name = ? AND Number_id = ?";

        try (Connection connection = dataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(sql)) {

            preparedStatement.setString(1, firstName);
            preparedStatement.setString(2, lastName);
            preparedStatement.setString(3, numberId);

            try (ResultSet resultSet = preparedStatement.executeQuery()) {
                if (resultSet.next()) {
                    if (!isUserInfoExists(firstName, lastName, numberId)) {
                        // สร้าง UserId
                        String userId = generateUniqueId();
                        saveToUsersInfo(firstName, lastName, email, phoneNumber, role, numberId, password, userId); // เก็บข้อมูลลง UsersInfo
                        return true;
                    } else {
                        System.out.println("ข้อมูลซ้ำใน users_info");
                        return false;
                    }
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean OfficerRegister(String firstName, String lastName, String email, String phoneNumber, String role, String numberId, String password, String confirmPassword) {
        if (!password.equals(confirmPassword)) {
            System.out.println("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
            return false;
        }

        String sql = "SELECT * FROM Officers WHERE First_name = ? AND Last_name = ? AND Number_id = ?";

        try (Connection connection = dataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(sql)) {

            preparedStatement.setString(1, firstName);
            preparedStatement.setString(2, lastName);
            preparedStatement.setString(3, numberId);

            try (ResultSet resultSet = preparedStatement.executeQuery()) {
                if (resultSet.next()) {
                    if (!isOfficerInfoExists(firstName, lastName, numberId)) {
                        // สร้าง OfficerId
                        String officerId = generateUniqueId();
                        saveToOfficerInfo(firstName, lastName, email, phoneNumber, role, numberId, password, officerId); // เก็บข้อมูลลง officer_info
                        return true;
                    } else {
                        System.out.println("ข้อมูลซ้ำใน officer_info");
                        return false;
                    }
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    private boolean isUserInfoExists(String firstName, String lastName, String numberId) {
        String sql = "SELECT * FROM users_info WHERE First_name = ? AND Last_name = ? AND Number_id = ?";
        try (Connection connection = dataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(sql)) {

            preparedStatement.setString(1, firstName);
            preparedStatement.setString(2, lastName);
            preparedStatement.setString(3, numberId);

            try (ResultSet resultSet = preparedStatement.executeQuery()) {
                return resultSet.next();
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    private boolean isOfficerInfoExists(String firstName, String lastName, String numberId) {
        String sql = "SELECT * FROM officer_info WHERE First_name = ? AND Last_name = ? AND Number_id = ?";
        try (Connection connection = dataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(sql)) {

            preparedStatement.setString(1, firstName);
            preparedStatement.setString(2, lastName);
            preparedStatement.setString(3, numberId);

            try (ResultSet resultSet = preparedStatement.executeQuery()) {
                return resultSet.next();
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    private String generateUniqueId() {
        Random random = new Random();
        String id;
        do {
            id = "1" + String.format("%05d", random.nextInt(1000000)); // Generate 6-digit ID starting with 1
        } while (isIdExists(id)); // ตรวจสอบว่ามี ID นี้ในฐานข้อมูลหรือไม่
        return id;
    }

    private boolean isIdExists(String id) {
        String sql = "SELECT 1 FROM users_info WHERE User_id = ? UNION SELECT 1 FROM officer_info WHERE Officer_id = ?";
        try (Connection connection = dataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(sql)) {

            preparedStatement.setString(1, id);
            preparedStatement.setString(2, id);

            try (ResultSet resultSet = preparedStatement.executeQuery()) {
                return resultSet.next(); // ถ้ามีข้อมูลแสดงว่า ID ซ้ำ
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    private void saveToUsersInfo(String firstName, String lastName, String email, String phoneNumber, String role, String numberId, String password, String userId) {
        String sql = "INSERT INTO users_info (First_name, Last_name, Email, Phone_number, Role, Number_id, Password, User_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection connection = dataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(sql)) {

            preparedStatement.setString(1, firstName);
            preparedStatement.setString(2, lastName);
            preparedStatement.setString(3, email);
            preparedStatement.setString(4, phoneNumber);
            preparedStatement.setString(5, role);
            preparedStatement.setString(6, numberId);
            preparedStatement.setString(7, password);
            preparedStatement.setString(8, userId); // บันทึก UserId

            preparedStatement.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    private void saveToOfficerInfo(String firstName, String lastName, String email, String phoneNumber, String role, String numberId, String password, String officerId) {
        String sql = "INSERT INTO officer_info (First_name, Last_name, Email, Phone_number, Role, Number_id, Password, Officer_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection connection = dataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(sql)) {

            preparedStatement.setString(1, firstName);
            preparedStatement.setString(2, lastName);
            preparedStatement.setString(3, email);
            preparedStatement.setString(4, phoneNumber);
            preparedStatement.setString(5, role);
            preparedStatement.setString(6, numberId);
            preparedStatement.setString(7, password);
            preparedStatement.setString(8, officerId); // บันทึก OfficerId
            preparedStatement.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
