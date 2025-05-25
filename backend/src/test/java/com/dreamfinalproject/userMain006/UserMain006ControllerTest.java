package com.dreamfinalproject.controller;

import com.dreamfinalproject.config.TestSecurityConfig;
import com.dreamfinalproject.dto.UserMain006RequestDTO;
import com.dreamfinalproject.dto.UserMain006ResponseDTO;
import com.dreamfinalproject.service.UserMain006Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserMain006Controller.class)
@Import(TestSecurityConfig.class)
public class UserMain006ControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserMain006Service service;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testGetLatestBillSuccess() throws Exception {
        Mockito.when(service.getLatestBill(1))
                .thenReturn(new UserMain006ResponseDTO("success", Map.of("amount_due", 100)));

        mockMvc.perform(post("/api/userMain006/getLatestBill?id=1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("success"))
                .andExpect(jsonPath("$.data.amount_due").value(100));
    }

    @Test
    void testGetQrCode() throws Exception {
        Mockito.when(service.getQrCode("123")).thenReturn(new UserMain006ResponseDTO("success", "qr-value"));

        mockMvc.perform(post("/api/userMain006/getQrCode?officerId=123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value("qr-value"));
    }

    @Test
    void testUpdateBillInvalid() throws Exception {
        UserMain006RequestDTO dto = new UserMain006RequestDTO();
        dto.setPaymentStatus("Red");

        Mockito.when(service.updateBill(any())).thenReturn(new UserMain006ResponseDTO("Invalid paymentStatus or cashTime", null));

        mockMvc.perform(post("/api/userMain006/updateBill")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Invalid paymentStatus or cashTime"));
    }

    @Test
    void testConfirmBill() throws Exception {
        UserMain006RequestDTO dto = new UserMain006RequestDTO();
        dto.setFirstName("Test");

        Mockito.when(service.confirmBill(any())).thenReturn(new UserMain006ResponseDTO("saved", null));

        mockMvc.perform(post("/api/userMain006/confirmBill")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("saved"));
    }

    @Test
    void testGetOfficerContact() throws Exception {
        UserMain006RequestDTO dto = new UserMain006RequestDTO();
        dto.setOfficerId("abc");

        Mockito.when(service.getOfficerContact(any()))
                .thenReturn(new UserMain006ResponseDTO("success", Map.of("phone_number", "0987")));

        mockMvc.perform(post("/api/userMain006/getOfficerContact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.phone_number").value("0987"));
    }
}
