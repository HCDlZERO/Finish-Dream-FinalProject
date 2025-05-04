package com.dreamfinalproject.dto;

public class UserMain006RequestDTO {
    private String numberId;
    private String officerId;
    private String paymentStatus;
    private Integer cashTime;
    private String billId;
    private String firstName;
    private String lastName;
    private String houseNumber;
    private String street;
    private String district;
    private String city;
    private String postalCode;
    private String email;
    private String phoneNumber;
    private Double amountDue;
    private String confirmDate;
    private String confirmTime;
    private String officerName;
    private String confirmImage;

    private int id;

    // ✅ Add Getter & Setter for numberId
    public String getNumberId() { return numberId; }
    public void setNumberId(String numberId) { this.numberId = numberId; }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getOfficerId() { return officerId; }
    public void setOfficerId(String officerId) { this.officerId = officerId; }
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    public Integer getCashTime() { return cashTime; }
    public void setCashTime(Integer cashTime) { this.cashTime = cashTime; }
    public String getBillId() { return billId; }
    public void setBillId(String billId) { this.billId = billId; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getHouseNumber() { return houseNumber; }
    public void setHouseNumber(String houseNumber) { this.houseNumber = houseNumber; }
    public String getStreet() { return street; }
    public void setStreet(String street) { this.street = street; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public Double getAmountDue() { return amountDue; }
    public void setAmountDue(Double amountDue) { this.amountDue = amountDue; }
    public String getConfirmDate() { return confirmDate; }
    public void setConfirmDate(String confirmDate) { this.confirmDate = confirmDate; }
    public String getConfirmTime() { return confirmTime; }
    public void setConfirmTime(String confirmTime) { this.confirmTime = confirmTime; }
    public String getOfficerName() { return officerName; }
    public void setOfficerName(String officerName) { this.officerName = officerName; }
    public String getConfirmImage() { return confirmImage; }
    public void setConfirmImage(String confirmImage) { this.confirmImage = confirmImage; }
}
