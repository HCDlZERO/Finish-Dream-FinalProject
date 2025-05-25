package com.dreamfinalproject.blogin002;

import com.dreamfinalproject.dto.Blogin002RequestDTO;
import com.dreamfinalproject.dto.Blogin002ResponseDTO;
import com.dreamfinalproject.repository.Blogin002Repository;
import com.dreamfinalproject.service.Blogin002ServiceImpl;
import com.dreamfinalproject.service.TokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class Blogin002ServiceImplTest {

    private Blogin002Repository mockRepo;
    private TokenService mockTokenService;
    private Blogin002ServiceImpl blogin002Service;

    @BeforeEach
    void setUp() {
        mockRepo = mock(Blogin002Repository.class);
        mockTokenService = mock(TokenService.class);
        blogin002Service = new Blogin002ServiceImpl(mockRepo, mockTokenService);
    }


    @Test
    void testLoginMember_WithRealData() {
        // Arrange
        Blogin002RequestDTO request = new Blogin002RequestDTO(
                "avenged21711@gmail.com",
                "avenged21711",
                "Member"
        );

        when(mockRepo.findUser("avenged21711@gmail.com", "avenged21711", "Member"))
                .thenReturn(new String[]{"Member", "1499852"});

        when(mockTokenService.generateToken("avenged21711@gmail.com", "Member"))
                .thenReturn("mock-real-token");

        // Act
        Blogin002ResponseDTO response = blogin002Service.login(request);

        // Assert
        assertEquals("avenged21711@gmail.com", response.getUsername());
        assertEquals("Member", response.getRole());
        assertEquals("mock-real-token", response.getToken());
        assertEquals(1499852, response.getId());
    }


    @Test
    void testLoginOfficer_Failure() {
        Blogin002RequestDTO request = new Blogin002RequestDTO("test@email.com", "wrongpass", "Officer");

        when(mockRepo.findOfficerRole("test@email.com", "wrongpass", "Officer"))
                .thenReturn(null);

        assertThrows(RuntimeException.class, () -> blogin002Service.login(request));
    }
}
