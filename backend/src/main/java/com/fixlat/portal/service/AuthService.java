package com.fixlat.portal.service;

import com.fixlat.portal.dto.AuthRequest;
import com.fixlat.portal.dto.AuthResponse;
import com.fixlat.portal.dto.UserResponse;
import com.fixlat.portal.entity.User;
import com.fixlat.portal.exception.BadRequestException;
import com.fixlat.portal.exception.ResourceNotFoundException;
import com.fixlat.portal.repository.UserRepository;
import com.fixlat.portal.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Transactional(readOnly = true)
    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new BadRequestException("Credenciales inválidas"));

        // Regla de negocio: Los usuarios inactivos no pueden acceder ni continuar utilizando el área autenticada
        if (!user.isActive()) {
            throw new BadRequestException("Tu cuenta se encuentra inactiva. Contacta a un administrador.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Credenciales inválidas");
        }

        String token = jwtUtils.generateToken(user.getEmail(), user.getRole().name(), user.getId());

        UserResponse userResponse = UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();

        return AuthResponse.builder()
                .token(token)
                .user(userResponse)
                .build();
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con email: " + email));

        if (!user.isActive()) {
            throw new BadRequestException("Tu cuenta se encuentra inactiva");
        }

        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
