package com.dreamfinalproject.service;

import com.dreamfinalproject.dto.Blogin002RequestDTO;
import com.dreamfinalproject.dto.Blogin002ResponseDTO;
import com.dreamfinalproject.repository.Blogin002Repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class Blogin002ServiceImpl implements Blogin002Service {

    @Autowired
    private Blogin002Repository blogin002Repository;

    @Autowired
    private TokenService tokenService;

    @Override
    public Blogin002ResponseDTO login(Blogin002RequestDTO loginRequest) {
        String[] userRoleAndId = null;

        if ("Member".equals(loginRequest.getRole())) {
            userRoleAndId = blogin002Repository.findUser(
                    loginRequest.getUsername(),
                    loginRequest.getPassword(),
                    loginRequest.getRole()
            );
        } else if ("Officer".equals(loginRequest.getRole())) {
            userRoleAndId = blogin002Repository.findOfficerRole(
                    loginRequest.getUsername(),
                    loginRequest.getPassword(),
                    loginRequest.getRole()
            );
        }

        if (userRoleAndId != null) {
            if ("Member".equals(userRoleAndId[0])) {
                return loginMember(loginRequest, userRoleAndId);
            } else if ("Officer".equals(userRoleAndId[0])) {
                return loginOfficer(loginRequest, userRoleAndId);
            }
        }

        // หากไม่พบข้อมูล
        throw new RuntimeException("Invalid username, password, or role.");
    }

    private Blogin002ResponseDTO loginMember(Blogin002RequestDTO loginRequest, String[] userRoleAndId) {
        String token = tokenService.generateToken(loginRequest.getUsername(), userRoleAndId[0]);
        return new Blogin002ResponseDTO(loginRequest.getUsername(), userRoleAndId[0], token, Integer.parseInt(userRoleAndId[1]));
    }

    private Blogin002ResponseDTO loginOfficer(Blogin002RequestDTO loginRequest, String[] userRoleAndId) {
        String token = tokenService.generateToken(loginRequest.getUsername(), userRoleAndId[0]);
        return new Blogin002ResponseDTO(loginRequest.getUsername(), userRoleAndId[0], token, Integer.parseInt(userRoleAndId[1]));
    }
}
