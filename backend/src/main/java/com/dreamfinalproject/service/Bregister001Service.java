package com.dreamfinalproject.service;

import com.dreamfinalproject.dto.RegisterRequest;
import com.dreamfinalproject.dto.RegisterResponseDTO;

public interface Bregister001Service {
    RegisterResponseDTO register(RegisterRequest request);  // เปลี่ยนจาก String เป็น RegisterResponseDTO
}
