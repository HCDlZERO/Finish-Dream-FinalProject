package com.dreamfinalproject.service;

import com.dreamfinalproject.dto.UserMain006RequestDTO;
import com.dreamfinalproject.dto.UserMain006ResponseDTO;
import com.dreamfinalproject.repository.UserMain006Repository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class UserMain006ServiceImplTest {

    private UserMain006ServiceImpl service;
    private UserMain006Repository repository;

    @BeforeEach
    void setUp() {
        repository = mock(UserMain006Repository.class);
        service = new UserMain006ServiceImpl();
        service.repository = repository;
    }

    @Test
    void testGetLatestBillSuccess() {
        Map<String, String> userInfo = Map.of(
                "number_id", "1234567890123",
                "first_name", "วิไล",
                "last_name", "ทองดี"
        );

        Map<String, Object> bill = new HashMap<>();
        bill.put("amount_due", 350.0);

        when(repository.getNumberIdByUserId(1)).thenReturn(userInfo);
        when(repository.getLatestBillByNumberId("1234567890123")).thenReturn(bill);

        UserMain006ResponseDTO response = service.getLatestBill(1);

        assertEquals("success", response.getMessage());
        assertEquals(350.0, ((Map<?, ?>) response.getData()).get("amount_due"));
        assertEquals("วิไล", ((Map<?, ?>) response.getData()).get("first_name"));
    }

    @Test
    void testUpdateBillInvalidStatus() {
        UserMain006RequestDTO dto = new UserMain006RequestDTO();
        dto.setPaymentStatus("Red");
        dto.setCashTime(1);

        UserMain006ResponseDTO response = service.updateBill(dto);
        assertEquals("Invalid paymentStatus or cashTime", response.getMessage());
    }

    @Test
    void testUpdateBillSuccess() {
        UserMain006RequestDTO dto = new UserMain006RequestDTO();
        dto.setNumberId("1234567890123");
        dto.setPaymentStatus("Yellow");
        dto.setCashTime(1);

        when(repository.updateLatestBill(any(), any(), any())).thenReturn(true);

        UserMain006ResponseDTO response = service.updateBill(dto);
        assertEquals("Updated successfully", response.getMessage());
    }

    @Test
    void testConfirmBillSaved() {
        UserMain006RequestDTO dto = new UserMain006RequestDTO();
        when(repository.saveBillConfirm(any())).thenReturn(true);

        UserMain006ResponseDTO response = service.confirmBill(dto);
        assertEquals("saved", response.getMessage());
    }

    @Test
    void testGetOfficerContact() {
        Map<String, Object> contact = Map.of("first_name", "Officer", "phone_number", "0987654321");
        UserMain006RequestDTO dto = new UserMain006RequestDTO();
        dto.setOfficerId("off001");

        when(repository.getOfficerContact("off001")).thenReturn(contact);

        UserMain006ResponseDTO response = service.getOfficerContact(dto);
        assertEquals("success", response.getMessage());
        assertEquals("Officer", ((Map<?, ?>) response.getData()).get("first_name"));
    }
}
