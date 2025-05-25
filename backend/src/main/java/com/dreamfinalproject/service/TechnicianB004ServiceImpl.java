package com.dreamfinalproject.service;

import com.dreamfinalproject.dto.TechnicianB004ResponseDTO;
import com.dreamfinalproject.repository.TechnicianB004Repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TechnicianB004ServiceImpl implements TechnicianB004Service {

    @Autowired
    public TechnicianB004Repository repository;

    @Override
    public List<TechnicianB004ResponseDTO> getRedAndCancelledBills() {
        return repository.findRedAndCancelledBills();
    }

    @Override
    public TechnicianB004ResponseDTO getMemberInfoByNumberId(String numberId) {
        return repository.findMemberInfoByNumberId(numberId);
    }
}
