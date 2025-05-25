package com.dreamfinalproject.officerMainB003;

import com.dreamfinalproject.dto.OfficerMainB003RequestDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.sql.Date;
import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class OfficerMainB003ControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @Test
    void testGetUsersByOfficerId_shouldReturnOk() throws Exception {
        OfficerMainB003RequestDTO request = new OfficerMainB003RequestDTO();
        request.setOfficerId("123"); // ต้องมีในฐานข้อมูลจริง

        mockMvc.perform(post("/api/officerMainB003/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    void testCreateBill_shouldReturnSuccessMessage() throws Exception {
        OfficerMainB003RequestDTO dto = new OfficerMainB003RequestDTO();
        dto.setNumberId("U001"); // ต้องมีในฐานข้อมูลจริง
        dto.setCollectionOfficerId(101);
        dto.setUnitsUsed(5);
        dto.setBillDate(Date.valueOf(LocalDate.now()));

        mockMvc.perform(post("/api/officerMainB003/bills")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("สร้างบิลสำเร็จ"));
    }

    @Test
    void testGetBillsByNumberId_shouldReturnOk() throws Exception {
        mockMvc.perform(get("/api/officerMainB003/Usersbills")
                        .param("numberId", "U001")) // ต้องมีใน DB
                .andExpect(status().isOk());
    }

    @Test
    void testAddUser_shouldReturnOk() throws Exception {
        OfficerMainB003RequestDTO dto = new OfficerMainB003RequestDTO();
        dto.setNumberId("U999"); // ต้องไม่ซ้ำกับที่มีใน DB
        dto.setFirstName("Test");
        dto.setLastName("User");
        dto.setHouseNumber("123");
        dto.setStreet("Test St.");
        dto.setDistrict("District");
        dto.setCity("City");
        dto.setPostalCode("10110");
        dto.setRole("Member");
        dto.setZone(1);
        dto.setRegistrationDate(LocalDate.now());

        mockMvc.perform(post("/api/officerMainB003/Addusers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(content().string("User added successfully."));
    }

    @Test
    void testCancelUser_shouldReturnOk() throws Exception {
        OfficerMainB003RequestDTO dto = new OfficerMainB003RequestDTO();
        dto.setNumberId("U001");

        mockMvc.perform(post("/api/officerMainB003/Cancel")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(content().string("User has been marked as Cancel."));
    }

    @Test
    void testUpdateOfficerInfo_shouldReturnOk() throws Exception {
        OfficerMainB003RequestDTO dto = new OfficerMainB003RequestDTO();
        dto.setOfficerId("1249960"); // ✅ เปลี่ยนเป็น officerId ที่มีจริง
        dto.setQrCode("newQR123");
        dto.setBank("SCB");
        dto.setBankId("SCB-789");

        mockMvc.perform(post("/api/officerMainB003/updateOfficerInfo")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(content().string("Officer info updated successfully."));
    }


}
