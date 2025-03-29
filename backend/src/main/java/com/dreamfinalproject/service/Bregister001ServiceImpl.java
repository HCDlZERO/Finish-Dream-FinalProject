package com.dreamfinalproject.service;

import com.dreamfinalproject.dto.RegisterRequest;
import com.dreamfinalproject.dto.RegisterResponseDTO;
import com.dreamfinalproject.repository.Bregister001Repository;
import com.dreamfinalproject.service.Bregister001Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class Bregister001ServiceImpl implements Bregister001Service {

    @Autowired
    private Bregister001Repository bregister001Repository;

    public RegisterResponseDTO register(RegisterRequest request) {
        String role = request.getRole();
        String firstName = request.getFirstName();
        String lastName = request.getLastName();
        String email = request.getEmail();
        String phoneNumber = request.getPhoneNumber();
        String numberId = request.getNumberId();
        String password = request.getPassword();
        String confirmPassword = request.getConfirmPassword();

        boolean isRegistered = false;

        if (role.equalsIgnoreCase("Member")) {
            isRegistered = bregister001Repository.MemberRegister(firstName, lastName, email, phoneNumber, role, numberId, password, confirmPassword);
        } else if (role.equalsIgnoreCase("Officer") || role.equalsIgnoreCase("HeadOfficer") || role.equalsIgnoreCase("Technician")) {
            isRegistered = bregister001Repository.OfficerRegister(firstName, lastName, email, phoneNumber, role, numberId, password, confirmPassword);
        } else {
            return new RegisterResponseDTO("บทบาทไม่ถูกต้อง", false);
        }

        if (isRegistered) {
            return new RegisterResponseDTO("ลงทะเบียนสำเร็จ", true);
        } else {
            return new RegisterResponseDTO("การลงทะเบียนล้มเหลว", false);
        }
    }
}
