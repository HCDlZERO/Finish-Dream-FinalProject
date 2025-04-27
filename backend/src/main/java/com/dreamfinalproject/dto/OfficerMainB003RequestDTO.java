package com.dreamfinalproject.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.Date;


@Data
public class OfficerMainB003RequestDTO {
    private String firstName;
    private String lastName;
    private String numberId;
    private int collectionOfficerId;
    private Date billDate;
    private double unitsUsed;
    private double amountDue;
    private String paymentStatus;
    private String officerId;
    private String houseNumber;
    private String street;
    private String district;
    private String city;
    private String postalCode;
    private String role;
    private LocalDate registrationDate;
    private int zone;
    private String lineId;
    private String bank;
    private String bankId;
    private String qrCode;

}