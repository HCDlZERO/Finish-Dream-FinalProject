package com.dreamfinalproject.bregister001;

import com.dreamfinalproject.config.TestSecurityConfig;
import com.dreamfinalproject.controller.Bregister001Controller;
import com.dreamfinalproject.dto.RegisterRequest;
import com.dreamfinalproject.dto.RegisterResponseDTO;
import com.dreamfinalproject.service.Bregister001Service;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import com.fasterxml.jackson.databind.ObjectMapper;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(Bregister001Controller.class)
@Import(TestSecurityConfig.class)  // ✅ นำเข้า config ที่ปิด security สำหรับ test
public class Bregister001ControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private Bregister001Service bregister001Service;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testRegisterMemberSuccess() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "วิไล", "ทองดี", "john@example.com", "0123456789",
                "0123456789",           // confirmPassword
                "4567890123456",        // numberId
                "Member",
                "4567890123456"         // password
        );

        Mockito.when(bregister001Service.register(any(RegisterRequest.class)))
                .thenReturn(new RegisterResponseDTO("ลงทะเบียนสำเร็จ", true));

        mockMvc.perform(post("/api/bregister001/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("ลงทะเบียนสำเร็จ"))
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void testRegisterOfficerFail() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "สมศักดิ์", "เดชชัย", "jane@example.com", "0123456789",
                "0123456789",           // confirmPassword
                "2345678901234",        // numberId
                "Officer",
                "2345678901234"         // password
        );

        Mockito.when(bregister001Service.register(any(RegisterRequest.class)))
                .thenReturn(new RegisterResponseDTO("การลงทะเบียนล้มเหลว", false));

        mockMvc.perform(post("/api/bregister001/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("การลงทะเบียนล้มเหลว"))
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void testRegisterInvalidRole() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "Mark", "Smith", "mark@example.com",
                "0987654321", "0987654321", "0987654321", // password, confirm, phone
                "Unknown", "1234567890123"
        );

        RegisterResponseDTO mockedResponse = new RegisterResponseDTO("บทบาทไม่ถูกต้อง", false);

        // 👇 ต้องใส่บรรทัดนี้เพื่อให้ mockService ไม่ return null
        Mockito.when(bregister001Service.register(any(RegisterRequest.class))).thenReturn(mockedResponse);

        mockMvc.perform(post("/api/bregister001/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("บทบาทไม่ถูกต้อง"))
                .andExpect(jsonPath("$.success").value(false));
    }

}
