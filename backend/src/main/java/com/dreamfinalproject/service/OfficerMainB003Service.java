package com.dreamfinalproject.service;

import com.dreamfinalproject.dto.OfficerMainB003RequestDTO;
import com.dreamfinalproject.dto.OfficerMainB003ResponseDTO;

import java.util.List;

public interface OfficerMainB003Service {
    List<OfficerMainB003ResponseDTO> getUsersByOfficerId(String officerId);

    void saveBill(OfficerMainB003RequestDTO requestDTO);

    List<OfficerMainB003ResponseDTO> getBillsByNumberId(String numberId);

    void addUser(OfficerMainB003RequestDTO requestDTO);

    void cancelUser(String numberId);

    List<OfficerMainB003ResponseDTO> getConfirmInfo(String firstName, String lastName);

    void confirmPayment(String firstName, String lastName);

    void deleteUser(OfficerMainB003RequestDTO requestDTO);

    boolean updateOfficerInfo(OfficerMainB003RequestDTO requestDTO);




}