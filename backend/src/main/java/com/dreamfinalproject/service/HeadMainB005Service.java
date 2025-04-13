package com.dreamfinalproject.service;

import com.dreamfinalproject.dto.HeadMainB005RequestDTO;
import com.dreamfinalproject.dto.HeadMainB005ResponseDTO;

import java.util.List;

public interface HeadMainB005Service {
    List<HeadMainB005ResponseDTO> getAllOfficers();
    void deleteOfficerByNumberId(String numberId);
    void addOfficer(HeadMainB005RequestDTO dto);
    void handleRequestApproval(String numberId, String tag);
    void handleDeleteProcess(String numberId, String tag);
    List<HeadMainB005ResponseDTO> getPendingUsers();

}
