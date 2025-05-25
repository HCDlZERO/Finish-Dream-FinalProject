// --- Service Impl ---
package com.dreamfinalproject.service;

import com.dreamfinalproject.dto.UserMain006RequestDTO;
import com.dreamfinalproject.dto.UserMain006ResponseDTO;
import com.dreamfinalproject.repository.UserMain006Repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class UserMain006ServiceImpl implements UserMain006Service {

    @Autowired
    public UserMain006Repository repository;

    @Override
    public UserMain006ResponseDTO getLatestBill(Integer id) {
        Map<String, String> userInfo = repository.getNumberIdByUserId(id);

        if (userInfo == null) {
            throw new RuntimeException("ไม่พบหมายเลขผู้ใช้งานที่ระบุ");
        }

        String numberId = userInfo.get("number_id");
        String firstName = userInfo.get("first_name");
        String lastName = userInfo.get("last_name");

        // 🔥 ดึงบิลล่าสุด
        Map<String, Object> latestBill = repository.getLatestBillByNumberId(numberId);

        if (latestBill != null) {
            // ✅ แทรก first_name และ last_name เข้าไปใน Map
            latestBill.put("first_name", firstName);
            latestBill.put("last_name", lastName);
        }

        return new UserMain006ResponseDTO("success", latestBill);
    }



    @Override
    public UserMain006ResponseDTO getQrCode(String officerId) {
        return new UserMain006ResponseDTO("success", repository.getQrCodeByOfficerId(officerId));
    }

    @Override
    public UserMain006ResponseDTO getBankInfo(String officerId) {
        return new UserMain006ResponseDTO("success", repository.getBankInfo(officerId));
    }

    @Override
    public UserMain006ResponseDTO updateBill(UserMain006RequestDTO dto) {
        if (!"Yellow".equalsIgnoreCase(dto.getPaymentStatus()) || (dto.getCashTime() != 1 && dto.getCashTime() != 2)) {
            return new UserMain006ResponseDTO("Invalid paymentStatus or cashTime", null);
        }
        boolean updated = repository.updateLatestBill(dto.getNumberId(), dto.getPaymentStatus(), dto.getCashTime());
        return new UserMain006ResponseDTO(updated ? "Updated successfully" : "Update failed", null);
    }

    @Override
    public UserMain006ResponseDTO getBillHistory(String numberId) {
        return new UserMain006ResponseDTO("success", repository.getBillHistory(numberId));
    }

    @Override
    public UserMain006ResponseDTO getBillDetail(String billId) {
        return new UserMain006ResponseDTO("success", repository.getBillDetail(billId));
    }

    @Override
    public UserMain006ResponseDTO getUserDetail(String numberId) {
        return new UserMain006ResponseDTO("success", repository.getUserDetail(numberId));
    }

    @Override
    public UserMain006ResponseDTO updateUserInfo(UserMain006RequestDTO dto) {
        boolean updated = repository.updateUserInfo(dto);
        return new UserMain006ResponseDTO(updated ? "updated" : "failed", null);
    }

    @Override
    public UserMain006ResponseDTO confirmBill(UserMain006RequestDTO dto) {
        boolean saved = repository.saveBillConfirm(dto);
        return new UserMain006ResponseDTO(saved ? "saved" : "failed", null);
    }

    @Override
    public UserMain006ResponseDTO getOfficerContact(UserMain006RequestDTO dto) {
        return new UserMain006ResponseDTO("success", repository.getOfficerContact(dto.getOfficerId()));
    }
}