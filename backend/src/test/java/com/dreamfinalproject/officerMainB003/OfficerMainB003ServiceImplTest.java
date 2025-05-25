package com.dreamfinalproject.officerMainB003;

import com.dreamfinalproject.dto.OfficerMainB003RequestDTO;
import com.dreamfinalproject.dto.OfficerMainB003ResponseDTO;
import com.dreamfinalproject.repository.OfficerMainB003Repository;
import com.dreamfinalproject.service.OfficerMainB003ServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class OfficerMainB003ServiceImplTest {

    private OfficerMainB003Repository repository;
    private OfficerMainB003ServiceImpl service;

    @BeforeEach
    void setUp() {
        repository = mock(OfficerMainB003Repository.class);
        service = new OfficerMainB003ServiceImpl();
        service.repository = repository;
    }

    @Test
    void testGetUsersByOfficerId_shouldUpdateStatusToRed() {
        // Arrange
        String officerId = "123";
        String numberId = "U001";
        int zone = 1;

        LocalDate billDate = LocalDate.now().minusDays(16); // มากกว่า 15 วัน
        Date billDateAsDate = Date.valueOf(billDate); // ✅ ใช้ java.sql.Date

        OfficerMainB003ResponseDTO user = new OfficerMainB003ResponseDTO();
        user.setNumberId(numberId);
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setBillDate(billDateAsDate);
        user.setPaymentStatus("Gray");

        List<OfficerMainB003ResponseDTO> users = List.of(user);

        when(repository.getNumberIdByOfficerId(officerId)).thenReturn(numberId);
        when(repository.getZoneByNumberId(numberId)).thenReturn(zone);
        when(repository.getUsersByZoneWithBills(zone)).thenReturn(users);
        when(repository.getPenalizedLevelLatest(numberId)).thenReturn(null);

        // Act
        List<OfficerMainB003ResponseDTO> result = service.getUsersByOfficerId(officerId);

        // Assert
        assertEquals("Red", result.get(0).getPaymentStatus());
        verify(repository).updatePaymentStatusLatest(numberId, "Red");
        verify(repository).addPenaltyToLatestBill(numberId, 300);
        verify(repository).addToAmountDueLatestBill(numberId, 300);
        verify(repository).updatePenalizedLevelLatest(numberId, "Red");
    }

    @Test
    void testSaveBill_shouldCalculateAmountCorrectly() {
        OfficerMainB003RequestDTO dto = new OfficerMainB003RequestDTO();
        dto.setNumberId("U001");
        dto.setUnitsUsed(10);
        dto.setCollectionOfficerId(101);
        dto.setBillDate(Date.valueOf(LocalDate.now()));

        ArgumentCaptor<OfficerMainB003RequestDTO> captor = ArgumentCaptor.forClass(OfficerMainB003RequestDTO.class);

        service.saveBill(dto);
        verify(repository).saveBill(captor.capture());

        OfficerMainB003RequestDTO saved = captor.getValue();
        assertEquals(10 * 14 + 20, saved.getAmountDue());
        assertEquals("Gray", saved.getPaymentStatus());
    }

    @Test
    void testGetBillsByNumberId() {
        OfficerMainB003ResponseDTO bill = new OfficerMainB003ResponseDTO();
        bill.setNumberId("U001");
        when(repository.getBillsByNumberId("U001")).thenReturn(List.of(bill));

        List<OfficerMainB003ResponseDTO> result = service.getBillsByNumberId("U001");

        assertEquals(1, result.size());
        assertEquals("U001", result.get(0).getNumberId());
    }

    @Test
    void testAddUser() {
        OfficerMainB003RequestDTO dto = new OfficerMainB003RequestDTO();
        service.addUser(dto);
        verify(repository).insertMember(dto);
    }

    @Test
    void testCancelUser() {
        service.cancelUser("U001");
        verify(repository).markUserAsCancelled("U001");
    }

    @Test
    void testGetConfirmInfo() {
        OfficerMainB003ResponseDTO confirm = new OfficerMainB003ResponseDTO();
        confirm.setFirstName("John");
        confirm.setLastName("Doe");

        when(repository.getConfirmInfo("John", "Doe")).thenReturn(List.of(confirm));

        List<OfficerMainB003ResponseDTO> result = service.getConfirmInfo("John", "Doe");

        assertEquals(1, result.size());
        assertEquals("John", result.get(0).getFirstName());
    }

    @Test
    void testConfirmPayment() {
        service.confirmPayment("Jane", "Smith");
        verify(repository).confirmPaymentByName("Jane", "Smith");
    }

    @Test
    void testDeleteUser() {
        OfficerMainB003RequestDTO dto = new OfficerMainB003RequestDTO();
        service.deleteUser(dto);
        verify(repository).insertDeletedMember(dto);
    }

    @Test
    void testUpdateOfficerInfo() {
        OfficerMainB003RequestDTO dto = new OfficerMainB003RequestDTO();
        when(repository.updateOfficerInfo(dto)).thenReturn(true);

        boolean result = service.updateOfficerInfo(dto);
        assertTrue(result);
    }
}
