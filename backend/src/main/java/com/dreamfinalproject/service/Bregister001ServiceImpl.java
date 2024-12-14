package com.dreamfinalproject.service;

import com.dreamfinalproject.dto.RegisterRequest;
import com.dreamfinalproject.repository.Bregister001Repository;
import com.dreamfinalproject.service.Bregister001Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class Bregister001ServiceImpl implements Bregister001Service {

    @Autowired
    private Bregister001Repository bregister001Repository;

    public String register(RegisterRequest request) {
        String role = request.getRole();
        String firstName = request.getFirstName();
        String lastName = request.getLastName();
        String email = request.getEmail();
        String phoneNumber = request.getPhoneNumber();
        String numberId = request.getNumberId();
        String password = request.getPassword();
        String confirmPassword = request.getConfirmPassword();

        boolean isRegistered = false;

        if (role.equalsIgnoreCase("Resident")) {
            // ส่งข้อมูลทั้งหมดไปยัง Repository
            isRegistered = bregister001Repository.MemberRegister(firstName, lastName, email, phoneNumber, role, numberId, password, confirmPassword);
        } else if (role.equalsIgnoreCase("Officer") || role.equalsIgnoreCase("HeadOfficer") || role.equalsIgnoreCase("Technician")) {
            // ส่งข้อมูลทั้งหมดไปยัง Repository
            isRegistered = bregister001Repository.OfficerRegister(firstName, lastName, email, phoneNumber, role, numberId, password, confirmPassword);
        } else {
            return "บทบาทไม่ถูกต้อง";
        }

        if (isRegistered) {
            return "ลงทะเบียนสำเร็จ";
        } else {
            return "การลงทะเบียนล้มเหลว";
        }
    }
}
