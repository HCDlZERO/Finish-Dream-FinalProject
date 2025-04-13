package com.dreamfinalproject.service;

import com.dreamfinalproject.dto.TechnicianB004ResponseDTO;

import java.util.List;

public interface TechnicianB004Service {
    List<TechnicianB004ResponseDTO> getRedAndCancelledBills();
    TechnicianB004ResponseDTO getMemberInfoByNumberId(String numberId);
}
