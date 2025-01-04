package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/create/{userId}")
public ResponseEntity<String> createBooking(
        @PathVariable Long userId,
        @RequestBody @Valid Booking bookingRequest,
        BindingResult bindingResult) {
    // If there are validation errors, return them
    if (bindingResult.hasErrors()) {
        StringBuilder errorMessage = new StringBuilder("Validation failed: ");
        bindingResult.getAllErrors().forEach(error ->
                errorMessage.append(error.getDefaultMessage()).append("; ")
        );
        return ResponseEntity.badRequest().body(errorMessage.toString());
    }

    // Validate user existence
    Optional<User> userOptional = userRepository.findById(userId);
    if (userOptional.isEmpty()) {
        return ResponseEntity.badRequest().body("User not found");
    }

    User user = userOptional.get();

    // Map bookingRequest to a new Booking entity
    Booking booking = new Booking();
    booking.setName(bookingRequest.getName());
    booking.setAddress(bookingRequest.getAddress());
    booking.setMobileNumber(bookingRequest.getMobileNumber());
    booking.setStartDate(bookingRequest.getStartDate());
    booking.setEndDate(bookingRequest.getEndDate());
    booking.setGearType(bookingRequest.getGearType());
    booking.setHours(bookingRequest.getHours()); // Add this line to set the hours field
    booking.setUser(user);
    booking.setTripMode(bookingRequest.getTripMode());

    // Save the booking
    bookingRepository.save(booking);

    return ResponseEntity.ok("Booking created successfully");
}

@GetMapping("/allbookings")
public ResponseEntity<List<Booking>> getAllBookings() {
    List<Booking> bookings = bookingRepository.findAll();
    if (bookings.isEmpty()) {
        return ResponseEntity.noContent().build();
    }
    return ResponseEntity.ok(bookings);
}



@GetMapping("/list/{userId}")
public ResponseEntity<?> getBookingsByUserId(@PathVariable Long userId) {
    // Check if the user exists
    Optional<User> userOptional = userRepository.findById(userId);
    if (userOptional.isEmpty()) {
        return ResponseEntity.badRequest().body("User not found");
    }

    // Retrieve bookings for the user
    List<Booking> bookings = bookingRepository.findByUserId(userId);

    if (bookings.isEmpty()) {
        return ResponseEntity.ok(List.of()); // Return an empty list
    }

    return ResponseEntity.ok(bookings);
}   
}

