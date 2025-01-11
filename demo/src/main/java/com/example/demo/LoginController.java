package com.example.demo;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/login")
public class LoginController {

    @Autowired
    private UserService userService;

   @PostMapping
public ResponseEntity<Map<String, Object>> loginUser(@RequestBody User user) {
    try {
        User loggedInUser;

        // Check if the input is an email or phone number and authenticate accordingly
        if (user.getEmail() != null && !user.getEmail().isEmpty()) {
            loggedInUser = userService.loginUserByEmail(user.getEmail(), user.getPassword());
        } else if (user.getPhoneNumber() != null && !user.getPhoneNumber().isEmpty()) {
            loggedInUser = userService.loginUserByPhoneNumber(user.getPhoneNumber(), user.getPassword());
        } else {
            return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("error", "Email or phone number is required for login."));
        }

        if (loggedInUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", "Invalid credentials."));
        }

        // Create a response map to store user details
        Map<String, Object> response = new HashMap<>();
        response.put("email", loggedInUser.getEmail());
        response.put("name", loggedInUser.getName());
        response.put("id", loggedInUser.getId());
        response.put("phoneNumber", loggedInUser.getPhoneNumber());
        response.put("field", loggedInUser.getField());

        // Return the response with the user details
        return ResponseEntity.ok(response);

    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Collections.singletonMap("error", "An unexpected error occurred. Please try again later."));
    }
}


}

