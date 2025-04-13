package com.dreamfinalproject.controller;

import com.dreamfinalproject.dto.HeadMainB005RequestDTO;
import com.dreamfinalproject.dto.HeadMainB005ResponseDTO;
import com.dreamfinalproject.service.HeadMainB005Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/headMainB005")
public class HeadMainB005Controller {

    @Autowired
    private HeadMainB005Service service;

    // เส้นที่ 1: GET Officers ทั้ง Officer และ Technician
    @GetMapping("/officers")
    public ResponseEntity<List<HeadMainB005ResponseDTO>> getAllOfficers() {
        return ResponseEntity.ok(service.getAllOfficers());
    }

    // เส้นที่ 2: POST ลบ Officer โดยใช้ Number_id ผ่าน Params
    @PostMapping("/deleteOfficer")
    public ResponseEntity<String> deleteOfficer(@RequestParam String numberId) {
        service.deleteOfficerByNumberId(numberId);
        return ResponseEntity.ok("Officer deleted successfully.");
    }

    // เส้นที่ 3: POST เพิ่ม Officer/Technician
    @PostMapping("/addOfficer")
    public ResponseEntity<String> addOfficer(@RequestBody HeadMainB005RequestDTO dto) {
        if (!dto.getRole().equals("Officer") && !dto.getRole().equals("Technician")) {
            return ResponseEntity.badRequest().body("Role must be either 'Officer' or 'Technician'");
        }
        service.addOfficer(dto);
        return ResponseEntity.ok("Officer added successfully.");
    }

    // เส้นที่ 4: อนุมัติ/ปฏิเสธ request_members
    @PostMapping("/approveRequest")
    public ResponseEntity<String> approveRequest(
            @RequestParam String numberId,
            @RequestParam String tag) {
        service.handleRequestApproval(numberId, tag);
        return ResponseEntity.ok("Request processed successfully.");
    }

    // เส้นที่ 5: ลบ delete_members (และ Members ถ้า Yes)
    @PostMapping("/processDelete")
    public ResponseEntity<String> processDelete(
            @RequestParam String numberId,
            @RequestParam String tag) {
        service.handleDeleteProcess(numberId, tag);
        return ResponseEntity.ok("Delete processed successfully.");
    }
    @GetMapping("/pendingUsers")
    public ResponseEntity<List<HeadMainB005ResponseDTO>> getPendingUsers() {
        List<HeadMainB005ResponseDTO> result = service.getPendingUsers();
        return ResponseEntity.ok(result);
    }

}
