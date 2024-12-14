package com.dreamfinalproject.service;

import com.dreamfinalproject.dto.Blogin002RequestDTO;
import com.dreamfinalproject.repository.Blogin002Repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class Blogin002ServiceImpl implements Blogin002Service {

    @Autowired
    private Blogin002Repository blogin002Repository;

    @Override
    public String login(Blogin002RequestDTO loginRequest) {
        return blogin002Repository.findUserRole(
                loginRequest.getUsername(),
                loginRequest.getPassword(),
                loginRequest.getRole()
        );
    }
}