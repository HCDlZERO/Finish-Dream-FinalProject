package com.dreamfinalproject.dto;
public class UserMain006ResponseDTO {
    private String message;
    private Object data;

    public UserMain006ResponseDTO() {}
    public UserMain006ResponseDTO(String message, Object data) {
        this.message = message;
        this.data = data;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Object getData() { return data; }
    public void setData(Object data) { this.data = data; }
}