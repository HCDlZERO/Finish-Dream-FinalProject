package com.dreamfinalproject.dto;

import lombok.Data;

import java.util.Date;

@Data
public class OfficerMainB003ResponseDTO {
    private String firstName;
    private String lastName;
    private String numberId;
    private int collectionOfficerId;
    private Date billDate;
    private double unitsUsed;
    private double amountDue;
    private String paymentStatus;
    private String Message;
    private Date confirmDate;
    private String confirmTime;
    private String officerName;
    private String confirmImage;
}