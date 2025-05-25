package com.dreamfinalproject.blogin002;

import com.dreamfinalproject.config.TestSecurityConfig;
import com.dreamfinalproject.controller.Blogin002Controller;
import com.dreamfinalproject.dto.Blogin002RequestDTO;
import com.dreamfinalproject.dto.Blogin002ResponseDTO;
import com.dreamfinalproject.service.Blogin002ServiceImpl;
import com.dreamfinalproject.service.TokenService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(Blogin002Controller.class)
@Import(TestSecurityConfig.class)
public class Blogin002ControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockBean private Blogin002ServiceImpl blogin002Service;
    @MockBean private TokenService tokenService;

    @Test
    void testLogin_WithRealData_Success() throws Exception {
        Blogin002RequestDTO request = new Blogin002RequestDTO(
                "avenged21711@gmail.com", "avenged21711", "Member"
        );

        Blogin002ResponseDTO response = new Blogin002ResponseDTO(
                "avenged21711@gmail.com", "Member", "mock-token", 1499852
        );

        // ✅ แก้ตรงนี้
        when(blogin002Service.login(any(Blogin002RequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/login/authenticate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("avenged21711@gmail.com"))
                .andExpect(jsonPath("$.role").value("Member"))
                .andExpect(jsonPath("$.token").value("mock-token"))
                .andExpect(jsonPath("$.id").value(1499852));
    }

    @Test
    void testLogin_Failure_Unauthorized() throws Exception {
        Blogin002RequestDTO request = new Blogin002RequestDTO("invalid", "wrong", "Officer");

        // ✅ แก้ตรงนี้เช่นกัน
        when(blogin002Service.login(any(Blogin002RequestDTO.class)))
                .thenThrow(new RuntimeException("Invalid credentials"));

        mockMvc.perform(post("/api/login/authenticate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }
}
