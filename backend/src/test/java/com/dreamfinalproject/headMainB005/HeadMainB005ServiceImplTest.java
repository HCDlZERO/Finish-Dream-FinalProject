package com.dreamfinalproject.service;

import com.dreamfinalproject.dto.HeadMainB005RequestDTO;
import com.dreamfinalproject.dto.HeadMainB005ResponseDTO;
import com.dreamfinalproject.repository.HeadMainB005Repository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.mockito.Mockito.*;

public class HeadMainB005ServiceImplTest {

    private HeadMainB005ServiceImpl service;
    private HeadMainB005Repository repository;

    @BeforeEach
    void setUp() {
        repository = mock(HeadMainB005Repository.class);
        service = new HeadMainB005ServiceImpl();
        service.repository = repository;
    }

    @Test
    void testGetAllOfficers() {
        service.getAllOfficers();
        verify(repository).fetchAllOfficers();
    }

    @Test
    void testDeleteOfficerByNumberId() {
        service.deleteOfficerByNumberId("123");
        verify(repository).deleteOfficer("123");
    }

    @Test
    void testAddOfficer() {
        HeadMainB005RequestDTO dto = new HeadMainB005RequestDTO();
        service.addOfficer(dto);
        verify(repository).insertOfficer(dto);
    }

    @Test
    void testHandleRequestApprovalYes() {
        service.handleRequestApproval("001", "Yes");
        verify(repository).copyRequestToMembers("001");
        verify(repository).deleteRequestMember("001");
    }

    @Test
    void testHandleRequestApprovalNo() {
        service.handleRequestApproval("001", "No");
        verify(repository).deleteRequestMember("001");
    }

    @Test
    void testHandleDeleteProcessYes() {
        service.handleDeleteProcess("002", "Yes");
        verify(repository).deleteFromMembers("002");
        verify(repository).deleteFromDeletedMembers("002");
    }

    @Test
    void testHandleDeleteProcessNo() {
        service.handleDeleteProcess("002", "No");
        verify(repository).deleteFromDeletedMembers("002");
    }

    @Test
    void testGetPendingUsers() {
        when(repository.getRequestMembersWithTag()).thenReturn(List.of());
        when(repository.getDeleteMembersWithTag()).thenReturn(List.of());
        service.getPendingUsers();
        verify(repository).getRequestMembersWithTag();
        verify(repository).getDeleteMembersWithTag();
    }
}
