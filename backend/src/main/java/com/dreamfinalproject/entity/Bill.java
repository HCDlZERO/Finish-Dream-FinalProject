package com.dreamfinalproject.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Data
@Entity
@Table(name = "Bills")
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Bill_id")
    private int billId;

    @Column(name = "Number_id", nullable = false)
    private String numberId;

    @Column(name = "Collection_officer_id", nullable = false)
    private int collectionOfficerId;

    @Column(name = "Bill_date", nullable = false)
    @Temporal(TemporalType.DATE)
    private Date billDate;

    @Column(name = "Units_used", nullable = false)
    private BigDecimal unitsUsed;

    @Column(name = "Amount_due", nullable = false)
    private BigDecimal amountDue;

    @Column(name = "Payment_status", nullable = false)
    private String paymentStatus;
}
