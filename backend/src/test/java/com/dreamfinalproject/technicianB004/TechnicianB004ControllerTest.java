package com.dreamfinalproject.technicianB004;

import com.dreamfinalproject.config.TestSecurityConfig;
import com.dreamfinalproject.controller.TechnicianB004Controller;
import com.dreamfinalproject.dto.TechnicianB004ResponseDTO;
import com.dreamfinalproject.service.TechnicianB004Service;
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

import static org.mockito.ArgumentMatchers.anyString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TechnicianB004Controller.class)
@Import(TestSecurityConfig.class)
public class TechnicianB004ControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TechnicianB004Service service;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testGetRedCancelledBills() throws Exception {
        TechnicianB004ResponseDTO dto = new TechnicianB004ResponseDTO();
        dto.setNumberId("123");
        dto.setFirstName("Somchai");
        dto.setLastName("Dee");

        Mockito.when(service.getRedAndCancelledBills()).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/technicianB004/bills/red-cancelled"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].numberId").value("123"))
                .andExpect(jsonPath("$[0].firstName").value("Somchai"))
                .andExpect(jsonPath("$[0].lastName").value("Dee"));
    }

    @Test
    void testGetMemberInfo() throws Exception {
        TechnicianB004ResponseDTO dto = new TechnicianB004ResponseDTO();
        dto.setNumberId("123");
        dto.setFirstName("Somchai");
        dto.setLastName("Dee");
        dto.setCity("Bangkok");

        Mockito.when(service.getMemberInfoByNumberId(anyString())).thenReturn(dto);

        mockMvc.perform(post("/api/technicianB004/member-info")
                        .param("numberId", "123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.numberId").value("123"))
                .andExpect(jsonPath("$.city").value("Bangkok"));
    }
}