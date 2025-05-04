package com.dreamfinalproject.service;

import com.dreamfinalproject.dto.UserMain006RequestDTO;
import com.dreamfinalproject.dto.UserMain006ResponseDTO;
import com.dreamfinalproject.repository.UserMain006Repository;

public interface UserMain006Service {
    UserMain006ResponseDTO getLatestBill(Integer id); // ✅ ใช้ Integer
    UserMain006ResponseDTO getQrCode(String officerId);
    UserMain006ResponseDTO getBankInfo(String officerId);
    UserMain006ResponseDTO updateBill(UserMain006RequestDTO dto);
    UserMain006ResponseDTO getBillHistory(String numberId);
    UserMain006ResponseDTO getBillDetail(String billId);
    UserMain006ResponseDTO getUserDetail(String numberId);
    UserMain006ResponseDTO updateUserInfo(UserMain006RequestDTO dto);
    UserMain006ResponseDTO confirmBill(UserMain006RequestDTO dto);
    UserMain006ResponseDTO getOfficerContact(UserMain006RequestDTO dto);
}