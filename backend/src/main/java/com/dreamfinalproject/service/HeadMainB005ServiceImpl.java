package com.dreamfinalproject.service;

import com.dreamfinalproject.dto.HeadMainB005RequestDTO;
import com.dreamfinalproject.dto.HeadMainB005ResponseDTO;
import com.dreamfinalproject.repository.HeadMainB005Repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class HeadMainB005ServiceImpl implements HeadMainB005Service {

    @Autowired
    private HeadMainB005Repository repository;

    @Override
    public List<HeadMainB005ResponseDTO> getAllOfficers() {
        return repository.fetchAllOfficers();
    }

    @Override
    public void deleteOfficerByNumberId(String numberId) {
        repository.deleteOfficer(numberId);
    }

    @Override
    public void addOfficer(HeadMainB005RequestDTO dto) {
        repository.insertOfficer(dto);
    }

    @Override
    public void handleRequestApproval(String numberId, String tag) {
        if ("Yes".equalsIgnoreCase(tag)) {
            repository.copyRequestToMembers(numberId);
            repository.deleteRequestMember(numberId);
        } else if ("No".equalsIgnoreCase(tag)) {
            repository.deleteRequestMember(numberId);
        }
    }

    @Override
    public void handleDeleteProcess(String numberId, String tag) {
        if ("Yes".equalsIgnoreCase(tag)) {
            repository.deleteFromMembers(numberId);
            repository.deleteFromDeletedMembers(numberId);
        } else if ("No".equalsIgnoreCase(tag)) {
            repository.deleteFromDeletedMembers(numberId);
        }
    }

    @Override
    public List<HeadMainB005ResponseDTO> getPendingUsers() {
        List<HeadMainB005ResponseDTO> pending = new ArrayList<>();
        pending.addAll(repository.getRequestMembersWithTag());
        pending.addAll(repository.getDeleteMembersWithTag());
        return pending;
    }

}
