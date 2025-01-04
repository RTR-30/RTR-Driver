package com.example.demo;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is mandatory")
    private String name;

    @NotBlank(message = "Address is mandatory")
    private String address;

    @NotBlank(message = "Mobile number is mandatory")
    private String mobileNumber;

    @NotNull(message = "Start date is mandatory")
    private String startDate;

    private String endDate; // Optional

    private String hours; // Add this field
    private String tripMode;

    @NotBlank(message = "Gear type is mandatory")
    private String gearType;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public Booking() {
    }

    public Booking(Long id, @NotBlank(message = "Name is mandatory") String name,
            @NotBlank(message = "Address is mandatory") String address,
            @NotBlank(message = "Mobile number is mandatory") String mobileNumber,
            @NotNull(message = "Start date is mandatory") String startDate, String endDate, String hours,
            @NotBlank(message = "Gear type is mandatory") String gearType, User user,String tripMode) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.mobileNumber = mobileNumber;
        this.startDate = startDate;
        this.endDate = endDate;
        this.hours = hours;
        this.gearType = gearType;
        this.user = user;
        this.tripMode=tripMode;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

    public String getHours() {
        return hours;
    }

    public void setHours(String hours) {
        this.hours = hours;
    }

    public String getGearType() {
        return gearType;
    }

    public void setGearType(String gearType) {
        this.gearType = gearType;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getTripMode(){
        return tripMode;
    }

    public void setTripMode(String tripMode){
        this.tripMode = tripMode;
    }
}
