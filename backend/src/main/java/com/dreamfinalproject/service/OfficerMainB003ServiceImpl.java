package com.dreamfinalproject.service;

import com.dreamfinalproject.dto.OfficerMainB003RequestDTO;
import com.dreamfinalproject.dto.OfficerMainB003ResponseDTO;
import com.dreamfinalproject.repository.OfficerMainB003Repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class OfficerMainB003ServiceImpl implements OfficerMainB003Service {

    @Autowired
    private OfficerMainB003Repository repository;

    @Override
    public List<OfficerMainB003ResponseDTO> getUsersByOfficerId(String officerId) {
        // 1. ดึง number_id จาก officer_info โดยใช้ officerId
        String numberId = repository.getNumberIdByOfficerId(officerId);

        // 2. ใช้ numberId เพื่อ Query หา Zone จาก Officers
        int zone = repository.getZoneByNumberId(numberId);

        // 3. คำนวณวันที่เพื่อใช้ใน Query บิล
        LocalDate today = LocalDate.now();
        LocalDate firstDayOfCurrentMonth = today.withDayOfMonth(1);
        LocalDate lastDayOfPreviousMonth = firstDayOfCurrentMonth.minusDays(1);

        // 4. ดึงข้อมูล Users และ Bills ตาม Zone
        List<OfficerMainB003ResponseDTO> users = repository.getUsersByZoneWithBills(zone);

        // 5. ตรวจสอบและอัปเดตสถานะการจ่ายเงิน
        for (OfficerMainB003ResponseDTO user : users) {
            if (user.getBillDate() == null) {
                user.setMessage("ไม่มีข้อมูลบิล");
            } else {
                String paymentStatus = user.getPaymentStatus();

                // ✅ ห้ามแก้ถ้าเป็น Green
                if ("Green".equals(paymentStatus)) {
                    continue;
                }

                // ✅ เช็กว่าเป็น 2 วันสุดท้ายของเดือน
                int lastDay = today.lengthOfMonth(); // วันสุดท้ายของเดือน
                boolean isLastTwoDays = today.getDayOfMonth() >= (lastDay - 1);

                // ✅ ถ้าไม่ใช่ 2 วันสุดท้ายของเดือน และ status ยังเป็น Gray หรือ Yellow
                if (!isLastTwoDays && ("Gray".equals(paymentStatus) || "Yellow".equals(paymentStatus))) {

                    if (today.isAfter(firstDayOfCurrentMonth.plusDays(7))) {
                        user.setPaymentStatus("Orange");
                        repository.updatePaymentStatus(user.getNumberId(), "Orange");

                        if (today.isAfter(firstDayOfCurrentMonth.plusDays(14))) {
                            user.setPaymentStatus("Red");
                            repository.updatePaymentStatus(user.getNumberId(), "Red");
                        }
                    }
                }
            }
        }


        return users;
    }
    public void saveBill(OfficerMainB003RequestDTO requestDTO) {
        LocalDate today = LocalDate.now();
        LocalDate firstDayOfCurrentMonth = today.withDayOfMonth(1);
        LocalDate lastDayOfPreviousMonth = firstDayOfCurrentMonth.minusDays(1);

        //if (!today.equals(lastDayOfPreviousMonth) && !today.equals(lastDayOfPreviousMonth.minusDays(1))) {
           // throw new IllegalArgumentException("ไม่ถึงกำหนดสร้างบิล");
        //}

        double amountDue = (requestDTO.getUnitsUsed() * 14) + 20;
        requestDTO.setAmountDue(amountDue);
        requestDTO.setPaymentStatus("Gray");
        repository.saveBill(requestDTO);
    }

    @Override
    public List<OfficerMainB003ResponseDTO> getBillsByNumberId(String numberId) {
        return repository.getBillsByNumberId(numberId);
    }

    @Override
    public void addUser(OfficerMainB003RequestDTO requestDTO) {
        repository.insertMember(requestDTO);
    }

    @Override
    public void cancelUser(String numberId) {
        repository.markUserAsCancelled(numberId);
    }

    @Override
    public List<OfficerMainB003ResponseDTO> getConfirmInfo(String firstName, String lastName) {
        return repository.getConfirmInfo(firstName, lastName);
    }

    @Override
    public void confirmPayment(String firstName, String lastName) {
        repository.confirmPaymentByName(firstName, lastName);
    }


}
