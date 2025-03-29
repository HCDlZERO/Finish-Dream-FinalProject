package com.dreamfinalproject.service;

import com.dreamfinalproject.dto.Blogin002RequestDTO;
import com.dreamfinalproject.dto.Blogin002ResponseDTO;

public interface Blogin002Service {
    Blogin002ResponseDTO login(Blogin002RequestDTO loginRequest);
}