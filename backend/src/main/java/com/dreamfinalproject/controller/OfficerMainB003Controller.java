// Controller: OfficerMainB003Controller
package com.dreamfinalproject.controller;

import com.dreamfinalproject.dto.OfficerMainB003RequestDTO;
import com.dreamfinalproject.dto.OfficerMainB003ResponseDTO;
import com.dreamfinalproject.service.OfficerMainB003Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/officerMainB003")
public class OfficerMainB003Controller {

    @Autowired
    private OfficerMainB003Service service;

    // ดึงข้อมูล User โดยใช้ OfficerId
    @PostMapping("/users")
    public ResponseEntity<List<OfficerMainB003ResponseDTO>> getUsersByOfficerId(@RequestBody OfficerMainB003RequestDTO requestDTO) {
        return ResponseEntity.ok(service.getUsersByOfficerId(requestDTO.getOfficerId()));
    }

    // บันทึกบิลค่าน้ำ
    @PostMapping("/bills")
    public ResponseEntity<OfficerMainB003ResponseDTO> saveBill(@RequestBody OfficerMainB003RequestDTO requestDTO) {
        OfficerMainB003ResponseDTO response = new OfficerMainB003ResponseDTO();
        try {
            service.saveBill(requestDTO);
            response.setMessage("สร้างบิลสำเร็จ");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.setMessage("เกิดข้อผิดพลาดในการสร้างบิล: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ✅ แก้ตรงนี้ เพิ่ม name ชัดเจน
    @GetMapping("/Usersbills")
    public ResponseEntity<List<OfficerMainB003ResponseDTO>> getBillsByNumberId(@RequestParam(name = "numberId") String numberId) {
        return ResponseEntity.ok(service.getBillsByNumberId(numberId));
    }

    @PostMapping("/Addusers")
    public ResponseEntity<String> addUser(@RequestBody OfficerMainB003RequestDTO requestDTO) {
        service.addUser(requestDTO);
        return ResponseEntity.ok("User added successfully.");
    }

    @PostMapping("/Cancel")
    public ResponseEntity<String> cancelUser(@RequestBody OfficerMainB003RequestDTO requestDTO) {
        service.cancelUser(requestDTO.getNumberId());
        return ResponseEntity.ok("User has been marked as Cancel.");
    }

    @PostMapping("/infoConfrim")
    public ResponseEntity<List<OfficerMainB003ResponseDTO>> getConfirmInfo(@RequestBody OfficerMainB003RequestDTO requestDTO) {
        return ResponseEntity.ok(service.getConfirmInfo(requestDTO.getFirstName(), requestDTO.getLastName()));
    }

    @PostMapping("/Confrim")
    public ResponseEntity<String> confirmPayment(@RequestBody OfficerMainB003RequestDTO requestDTO) {
        service.confirmPayment(requestDTO.getFirstName(), requestDTO.getLastName());
        return ResponseEntity.ok("Payment confirmed successfully.");
    }

    @PostMapping("/Deleteusers")
    public ResponseEntity<String> deleteUser(@RequestBody OfficerMainB003RequestDTO requestDTO) {
        service.deleteUser(requestDTO);
        return ResponseEntity.ok("User deleted (recorded) successfully.");
    }

    @PostMapping("/updateOfficerInfo")
    public ResponseEntity<String> updateOfficerInfo(@RequestBody OfficerMainB003RequestDTO requestDTO) {
        try {
            boolean updated = service.updateOfficerInfo(requestDTO);
            if (updated) {
                return ResponseEntity.ok("Officer info updated successfully.");
            } else {
                return ResponseEntity.badRequest().body("No valid data provided to update.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating officer info: " + e.getMessage());
        }
    }
}
