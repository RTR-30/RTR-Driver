package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User registerUser(User user) {
        // Check if email already exists
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already in use");
        }
        return userRepository.save(user);
    }

    public User loginUserByEmail(String email, String password) {
        return userRepository.findByEmailAndPassword(email, password);
    }
    
    public User loginUserByPhoneNumber(String phoneNumber, String password) {
        return userRepository.findByPhoneNumberAndPassword(phoneNumber, password);
    }
    

    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public void updateUser(User user) {
        userRepository.save(user);
    }
    
}

