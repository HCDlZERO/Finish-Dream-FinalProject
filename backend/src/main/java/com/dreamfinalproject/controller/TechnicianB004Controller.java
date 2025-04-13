package com.dreamfinalproject.controller;

import com.dreamfinalproject.dto.TechnicianB004ResponseDTO;
import com.dreamfinalproject.service.TechnicianB004Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/technicianB004")
public class TechnicianB004Controller {

    @Autowired
    private TechnicianB004Service technicianService;

    @GetMapping("/bills/red-cancelled")
    public ResponseEntity<List<TechnicianB004ResponseDTO>> getRedCancelledBills() {
        return ResponseEntity.ok(technicianService.getRedAndCancelledBills());
    }

    @PostMapping("/member-info")
    public ResponseEntity<TechnicianB004ResponseDTO> getMemberInfo(@RequestParam String numberId) {
        return ResponseEntity.ok(technicianService.getMemberInfoByNumberId(numberId));
    }
}
