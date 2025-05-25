package com.dreamfinalproject.service;

import com.dreamfinalproject.dto.TechnicianB004ResponseDTO;
import com.dreamfinalproject.repository.TechnicianB004Repository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.mockito.Mockito.*;

public class TechnicianB004ServiceImplTest {

    private TechnicianB004ServiceImpl service;
    private TechnicianB004Repository repository;

    @BeforeEach
    void setUp() {
        repository = mock(TechnicianB004Repository.class);
        service = new TechnicianB004ServiceImpl();
        service.repository = repository;
    }

    @Test
    void testGetRedAndCancelledBills() {
        service.getRedAndCancelledBills();
        verify(repository).findRedAndCancelledBills();
    }

    @Test
    void testGetMemberInfoByNumberId() {
        String numberId = "123";
        service.getMemberInfoByNumberId(numberId);
        verify(repository).findMemberInfoByNumberId(numberId);
    }
}
