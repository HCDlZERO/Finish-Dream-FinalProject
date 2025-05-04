package com.dreamfinalproject.service;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

// ใช้ @RestControllerAdvice เพื่อจับข้อผิดพลาดทั่วทั้งแอป
@RestControllerAdvice
public class GlobalExceptionHandler {

    // จับ IllegalArgumentException ที่เกิดขึ้นจาก controller
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Object> handleIllegalArgumentException(IllegalArgumentException ex) {
        // สร้างข้อความที่ต้องการแสดง
        String errorMessage = ex.getMessage();

        // ส่งข้อความ error กับ status code 400 (Bad Request)
        return new ResponseEntity<>(new ErrorResponse("Bad Request", errorMessage), HttpStatus.BAD_REQUEST);
    }

    // คลาสสำหรับส่งข้อความ error ในรูปแบบ JSON
    public static class ErrorResponse {
        private String status;
        private String message;

        public ErrorResponse(String status, String message) {
            this.status = status;
            this.message = message;
        }

        // Getter และ Setter
        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}
