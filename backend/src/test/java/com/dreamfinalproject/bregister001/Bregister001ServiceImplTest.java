package com.dreamfinalproject.bregister001;

import com.dreamfinalproject.dto.RegisterRequest;
import com.dreamfinalproject.dto.RegisterResponseDTO;
import com.dreamfinalproject.repository.Bregister001Repository;
import com.dreamfinalproject.service.Bregister001ServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class Bregister001ServiceImplTest {

    private Bregister001Repository mockRepository;
    private Bregister001ServiceImpl service;

    @BeforeEach
    void setUp() {
        mockRepository = mock(Bregister001Repository.class);
        service = new Bregister001ServiceImpl(mockRepository);  // ✅ ผ่าน constructor
    }

    @Test
    void testRegisterMemberSuccess() {
        RegisterRequest request = new RegisterRequest("วิไล", "ทองดี", "john@example.com", "0123456789", "0123456789", "1234567890123", "Member", "4567890123456");
        when(mockRepository.MemberRegister(anyString(), anyString(), anyString(), anyString(), anyString(), anyString(), anyString(), anyString())).thenReturn(true);

        RegisterResponseDTO response = service.register(request);

        assertTrue(response.isSuccess());
        assertEquals("ลงทะเบียนสำเร็จ", response.getMessage());
    }

    @Test
    void testRegisterOfficerFail() {
        RegisterRequest request = new RegisterRequest("สมศักดิ์", "เดชชัย", "jane@example.com", "0123456789", "0123456789", "1234567890123", "Officer", "2345678901234");
        when(mockRepository.OfficerRegister(anyString(), anyString(), anyString(), anyString(), anyString(), anyString(), anyString(), anyString())).thenReturn(false);

        RegisterResponseDTO response = service.register(request);

        assertFalse(response.isSuccess());
        assertEquals("การลงทะเบียนล้มเหลว", response.getMessage());
    }

    @Test
    void testRegisterInvalidRole() {
        RegisterRequest request = new RegisterRequest("Mark", "Smith", "mark@example.com", "0987654321", "Unknown", "1234567890123", "pass", "pass");

        RegisterResponseDTO response = service.register(request);

        assertFalse(response.isSuccess());
        assertEquals("บทบาทไม่ถูกต้อง", response.getMessage());
    }
}