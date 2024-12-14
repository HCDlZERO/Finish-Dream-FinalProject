package com.dreamfinalproject.controller;

import com.dreamfinalproject.dto.Blogin002RequestDTO;
import com.dreamfinalproject.service.Blogin002Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class Blogin002Controller {

    @Autowired
    private Blogin002Service blogin002Service;

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody Blogin002RequestDTO loginRequest) {
        String role = blogin002Service.login(loginRequest);
        return ResponseEntity.ok("Login success. Role: " + role);
    }
}
