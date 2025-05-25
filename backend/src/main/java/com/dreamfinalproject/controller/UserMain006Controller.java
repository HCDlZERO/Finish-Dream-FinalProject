package com.dreamfinalproject.controller;

import com.dreamfinalproject.dto.UserMain006RequestDTO;
import com.dreamfinalproject.dto.UserMain006ResponseDTO;
import com.dreamfinalproject.service.UserMain006Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import com.dreamfinalproject.repository.UserMain006Repository;

@RestController
@RequestMapping("/api/userMain006")
public class UserMain006Controller {

    @Autowired
    private UserMain006Service service;

    // 🔹 API 1: ดึงบิลล่าสุดโดย numberId
    @PostMapping(value = "/getLatestBill", produces = "application/json")
    public ResponseEntity<UserMain006ResponseDTO> getLatestBill(@RequestParam("id") Integer id) {
        UserMain006ResponseDTO response = service.getLatestBill(id);
        return ResponseEntity.ok(response);
    }


    // 🔹 API 2: ดึง QR Code จาก officerId
    @PostMapping(value = "/getQrCode", produces = "application/json")
    public ResponseEntity<UserMain006ResponseDTO> getQrCode(@RequestParam("officerId") String officerId) {
        UserMain006ResponseDTO response = service.getQrCode(officerId);
        return ResponseEntity.ok(response);
    }

    // 🔹 API 3: ดึงข้อมูล Bank จาก officerId
    @PostMapping(value = "/getBankInfo", produces = "application/json")
    public ResponseEntity<UserMain006ResponseDTO> getBankInfo(@RequestParam("officerId") String officerId) {
        UserMain006ResponseDTO response = service.getBankInfo(officerId);
        return ResponseEntity.ok(response);
    }

    // 🔹 API 4: อัปเดตสถานะบิล (paymentStatus = Yellow เท่านั้น)
    @PostMapping(value = "/updateBill", consumes = "application/json", produces = "application/json")
    public ResponseEntity<UserMain006ResponseDTO> updateBill(@RequestBody UserMain006RequestDTO dto) {
        UserMain006ResponseDTO response = service.updateBill(dto);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/getBillHistory", produces = "application/json")
    public ResponseEntity<UserMain006ResponseDTO> getBillHistory(@RequestParam("numberId") String numberId) {
        return ResponseEntity.ok(service.getBillHistory(numberId));
    }

    @PostMapping(value = "/getBillDetail", produces = "application/json")
    public ResponseEntity<UserMain006ResponseDTO> getBillDetail(@RequestParam("billId") String billId) {
        return ResponseEntity.ok(service.getBillDetail(billId));
    }

    @PostMapping(value = "/getUserDetail", produces = "application/json")
    public ResponseEntity<UserMain006ResponseDTO> getUserDetail(@RequestParam("numberId") String numberId) {
        return ResponseEntity.ok(service.getUserDetail(numberId));
    }

    @PostMapping(value = "/updateUserInfo", produces = "application/json")
    public ResponseEntity<UserMain006ResponseDTO> updateUserInfo(@RequestBody UserMain006RequestDTO dto) {
        return ResponseEntity.ok(service.updateUserInfo(dto));
    }

    @PostMapping(value = "/confirmBill", produces = "application/json")
    public ResponseEntity<UserMain006ResponseDTO> confirmBill(@RequestBody UserMain006RequestDTO dto) {
        return ResponseEntity.ok(service.confirmBill(dto));
    }

    @PostMapping(value = "/getOfficerContact", produces = "application/json")
    public ResponseEntity<UserMain006ResponseDTO> getOfficerContact(@RequestBody UserMain006RequestDTO dto) {
        return ResponseEntity.ok(service.getOfficerContact(dto));
    }
}
