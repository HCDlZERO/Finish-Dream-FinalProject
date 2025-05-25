package com.dreamfinalproject.service;

import com.dreamfinalproject.dto.RegisterRequest;
import com.dreamfinalproject.dto.RegisterResponseDTO;
import com.dreamfinalproject.repository.Bregister001Repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class Bregister001ServiceImpl implements Bregister001Service {

    private final Bregister001Repository bregister001Repository;

    @Autowired
    public Bregister001ServiceImpl(Bregister001Repository bregister001Repository) {
        this.bregister001Repository = bregister001Repository;
    }

    @Override
    public RegisterResponseDTO register(RegisterRequest request) {
        // 🔒 ป้องกัน request null
        if (request == null) {
            return new RegisterResponseDTO("คำขอลงทะเบียนว่างเปล่า", false);
        }

        String role = request.getRole();
        String firstName = request.getFirstName();
        String lastName = request.getLastName();
        String email = request.getEmail();
        String phoneNumber = request.getPhoneNumber();
        String numberId = request.getNumberId();
        String password = request.getPassword();
        String confirmPassword = request.getConfirmPassword();

        // 🔒 เช็ครหัสผ่านตรงกันหรือไม่
        if (password == null || confirmPassword == null || !password.equals(confirmPassword)) {
            return new RegisterResponseDTO("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน", false);
        }

        // 🔒 เช็ค role ว่างหรือไม่มี
        if (role == null || role.trim().isEmpty()) {
            return new RegisterResponseDTO("บทบาทไม่ถูกต้อง", false);
        }

        // ✅ เช็คบทบาทแล้วเลือกฟังก์ชันที่ถูกต้อง
        boolean isRegistered;
        String roleLower = role.trim().toLowerCase();
        switch (roleLower) {
            case "member":
                isRegistered = bregister001Repository.MemberRegister(firstName, lastName, email, phoneNumber, role, numberId, password, confirmPassword);
                break;
            case "officer":
            case "headofficer":
            case "technician":
                isRegistered = bregister001Repository.OfficerRegister(firstName, lastName, email, phoneNumber, role, numberId, password, confirmPassword);
                break;
            default:
                return new RegisterResponseDTO("บทบาทไม่ถูกต้อง", false);
        }

        // ✅ คืนค่าผลลัพธ์ตามสถานะ
        return isRegistered
                ? new RegisterResponseDTO("ลงทะเบียนสำเร็จ", true)
                : new RegisterResponseDTO("การลงทะเบียนล้มเหลว", false);
    }
}
