package com.dreamfinalproject.service;

import com.dreamfinalproject.dto.OfficerMainB003RequestDTO;
import com.dreamfinalproject.dto.OfficerMainB003ResponseDTO;
import com.dreamfinalproject.repository.OfficerMainB003Repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Date;
import java.time.ZoneId;


@Service
public class OfficerMainB003ServiceImpl implements OfficerMainB003Service {

    @Autowired
    public OfficerMainB003Repository repository;

    @Override
    public List<OfficerMainB003ResponseDTO> getUsersByOfficerId(String officerId) {
        String numberId = repository.getNumberIdByOfficerId(officerId);
        int zone = repository.getZoneByNumberId(numberId);
        List<OfficerMainB003ResponseDTO> users = repository.getUsersByZoneWithBills(zone);

        LocalDate today = LocalDate.now();
        List<String> updatableStatuses = Arrays.asList("Gray", "Yellow", "Orange");

        for (OfficerMainB003ResponseDTO user : users) {
            if (user.getBillDate() == null) {
                user.setMessage("ไม่มีข้อมูลบิล");
                continue;
            }

            String paymentStatus = user.getPaymentStatus();
            if ("Green".equalsIgnoreCase(paymentStatus)) continue;

            // ✅ แปลงวันที่บิลให้เป็น LocalDate อย่างปลอดภัย
            LocalDate billDate;
            Object raw = user.getBillDate();
            if (raw instanceof java.sql.Date) {
                billDate = ((java.sql.Date) raw).toLocalDate();
            } else if (raw instanceof java.util.Date) {
                billDate = ((java.util.Date) raw).toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
            } else {
                user.setMessage("ไม่สามารถแปลงวันที่บิลได้");
                continue;
            }

            // ✅ เริ่มนับระยะเวลาชำระจากวันถัดจากวันที่ออกบิล
            LocalDate paymentStartDate = billDate.plusDays(1);

            // ✅ ข้าม 2 วันสุดท้ายของเดือนเพื่อป้องกันการเปลี่ยนสถานะผิดเวลา
            boolean isLastTwoDays = today.getDayOfMonth() >= today.lengthOfMonth() - 1;
            if (isLastTwoDays) continue;

            // ✅ ดึง Penalized_Level ล่าสุด
            String penalized = repository.getPenalizedLevelLatest(user.getNumberId());

            // ✅ 15 วันขึ้นไป → Red (ถ้ายังไม่เคยเป็น Red)
            if (today.isAfter(paymentStartDate.plusDays(14)) &&
                    (penalized == null || !penalized.equalsIgnoreCase("Red"))) {

                user.setPaymentStatus("Red");
                repository.updatePaymentStatusLatest(user.getNumberId(), "Red");
                repository.addPenaltyToLatestBill(user.getNumberId(), 300);
                repository.addToAmountDueLatestBill(user.getNumberId(), 300);
                repository.updatePenalizedLevelLatest(user.getNumberId(), "Red");

            }
            // ✅ 8-14 วัน → Orange (ถ้ายังไม่เคยเป็น Orange/Red)
            else if (
                    today.isAfter(paymentStartDate.plusDays(7)) &&
                            today.isBefore(paymentStartDate.plusDays(15)) &&
                            updatableStatuses.contains(paymentStatus) &&
                            (penalized == null || (!penalized.equalsIgnoreCase("Orange") && !penalized.equalsIgnoreCase("Red")))
            ) {
                user.setPaymentStatus("Orange");
                repository.updatePaymentStatusLatest(user.getNumberId(), "Orange");
                repository.addPenaltyToLatestBill(user.getNumberId(), 200);
                repository.addToAmountDueLatestBill(user.getNumberId(), 200);
                repository.updatePenalizedLevelLatest(user.getNumberId(), "Orange");
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

    @Override
    public void deleteUser(OfficerMainB003RequestDTO requestDTO) {
        repository.insertDeletedMember(requestDTO);
    }

    @Override
    public boolean updateOfficerInfo(OfficerMainB003RequestDTO dto) {
        return repository.updateOfficerInfo(dto);
    }




}
