package com.example.demo;

import java.io.IOException;
import java.util.Base64;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<String> registerUser(
            @RequestParam String name,
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam String phoneNumber,
            @RequestParam String field,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) MultipartFile profilePic) {
        try {
            User user = new User();
            user.setName(name);
            user.setEmail(email);
            user.setPassword(password);
            user.setPhoneNumber(phoneNumber);
            user.setField(field);
            user.setAddress(address);
    
            // Check if profilePic is provided
            if (profilePic != null && !profilePic.isEmpty()) {
                logger.info("File name: " + profilePic.getOriginalFilename());
                logger.info("File size: " + profilePic.getSize());
                user.setProfilePic(profilePic.getBytes()); // Convert to byte array
            } else {
                logger.info("No profile picture provided, proceeding with null.");
                user.setProfilePic(null);
            }
    
            userService.registerUser(user);
    
            return ResponseEntity.ok("User registered successfully.");
        } catch (Exception e) {
            logger.error("Error registering user: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("Error occurred: " + e.getMessage());
        }
    }
    

 @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            // Fetch user from the service layer by ID
            User user = userService.getUserById(id);

            // Check if user is found
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                     .body(Collections.singletonMap("message", "User not found with ID: " + id));
            }

            // Convert the profile picture to a base64 string if present
            String base64ProfilePic = (user.getProfilePic() != null && user.getProfilePic().length > 0)
                    ? Base64.getEncoder().encodeToString(user.getProfilePic())
                    : null;

            // Prepare response data
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("name", user.getName());
            response.put("email", user.getEmail());
            response.put("phoneNumber", user.getPhoneNumber());
            response.put("field", user.getField());
            response.put("profilePic", base64ProfilePic);
            response.put("address",user.getAddress());

            // Return response
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error retrieving user: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(Collections.singletonMap("message", "An unexpected error occurred. Please try again later."));
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<String> updateUser(
            @PathVariable Long id,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String password,
            @RequestParam(required = false) String phoneNumber,
            @RequestParam(required = false) String field,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) MultipartFile profilePic) {
    
        System.out.println("Received request to update user with ID: " + id);
    
        try {
            User user = userService.getUserById(id);
    
            if (user == null) {
                System.out.println("User not found with ID: " + id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                     .body("User not found with ID: " + id);
            }
    
            // Update the user's details if provided
            if (name != null) {
                user.setName(name);
                System.out.println("Updating name to: " + name);
            }
            if (email != null) {
                user.setEmail(email);
                System.out.println("Updating email to: " + email);
            }
            if (password != null) {
                user.setPassword(password);
                System.out.println("Updating password (hidden)");
            }
            if (phoneNumber != null) {
                user.setPhoneNumber(phoneNumber);
                System.out.println("Updating phone number to: " + phoneNumber);
            }
            if (field != null) {
                user.setField(field);
                System.out.println("Updating field to: " + field);
            }
            if (address != null) {
                user.setAddress(address);
                System.out.println("Updating address to: " + address);
            }
            if (profilePic != null && !profilePic.isEmpty()) {
                user.setProfilePic(profilePic.getBytes());
                System.out.println("Updating profile picture.");
            }
    
            userService.updateUser(user);
            System.out.println("User updated successfully.");
            return ResponseEntity.ok("User updated successfully.");
        } catch (Exception e) {
            System.out.println("Error updating user: " + e.getMessage());
            e.printStackTrace();  // Print the stack trace to help debug
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("Error occurred: " + e.getMessage());
        }
    }
    

}
