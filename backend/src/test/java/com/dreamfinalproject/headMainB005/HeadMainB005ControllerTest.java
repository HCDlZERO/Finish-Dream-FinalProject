package com.dreamfinalproject.headMainB005;

import com.dreamfinalproject.config.TestSecurityConfig;
import com.dreamfinalproject.controller.HeadMainB005Controller;
import com.dreamfinalproject.dto.HeadMainB005RequestDTO;
import com.dreamfinalproject.dto.HeadMainB005ResponseDTO;
import com.dreamfinalproject.service.HeadMainB005Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(HeadMainB005Controller.class)
@Import(TestSecurityConfig.class)
public class HeadMainB005ControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private HeadMainB005Service service;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testGetAllOfficers() throws Exception {
        HeadMainB005ResponseDTO officer = new HeadMainB005ResponseDTO();
        officer.setNumberId("001");
        officer.setFirstName("A");
        officer.setLastName("B");
        officer.setRole("Officer");
        officer.setZoneId(1);

        Mockito.when(service.getAllOfficers()).thenReturn(List.of(officer));

        mockMvc.perform(get("/api/headMainB005/officers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].numberId").value("001"));
    }

    @Test
    void testDeleteOfficer() throws Exception {
        mockMvc.perform(post("/api/headMainB005/deleteOfficer")
                        .param("numberId", "123"))
                .andExpect(status().isOk())
                .andExpect(content().string("Officer deleted successfully."));
    }

    @Test
    void testAddOfficerSuccess() throws Exception {
        HeadMainB005RequestDTO dto = new HeadMainB005RequestDTO();
        dto.setNumberId("001");
        dto.setFirstName("John");
        dto.setLastName("Doe");
        dto.setRole("Officer");
        dto.setZoneId(1);
        dto.setQrCode("base64");

        mockMvc.perform(post("/api/headMainB005/addOfficer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(content().string("Officer added successfully."));
    }

    @Test
    void testAddOfficerInvalidRole() throws Exception {
        HeadMainB005RequestDTO dto = new HeadMainB005RequestDTO();
        dto.setNumberId("001");
        dto.setFirstName("John");
        dto.setLastName("Doe");
        dto.setRole("Boss"); // ❌ Invalid Role
        dto.setZoneId(1);
        dto.setQrCode("base64");

        mockMvc.perform(post("/api/headMainB005/addOfficer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Role must be either 'Officer' or 'Technician'"));
    }

    @Test
    void testApproveRequest() throws Exception {
        mockMvc.perform(post("/api/headMainB005/approveRequest")
                        .param("numberId", "001")
                        .param("tag", "Yes"))
                .andExpect(status().isOk())
                .andExpect(content().string("Request processed successfully."));
    }

    @Test
    void testProcessDelete() throws Exception {
        mockMvc.perform(post("/api/headMainB005/processDelete")
                        .param("numberId", "001")
                        .param("tag", "No"))
                .andExpect(status().isOk())
                .andExpect(content().string("Delete processed successfully."));
    }

    @Test
    void testGetPendingUsers() throws Exception {
        HeadMainB005ResponseDTO dto = new HeadMainB005ResponseDTO();
        dto.setNumberId("123");
        dto.setFirstName("A");
        dto.setLastName("B");
        dto.setTag("Approve");

        Mockito.when(service.getPendingUsers()).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/headMainB005/pendingUsers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].numberId").value("123"))
                .andExpect(jsonPath("$[0].tag").value("Approve"));
    }
}
