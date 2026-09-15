package com.fixlat.portal.service;

import com.fixlat.portal.dto.CreateUserRequest;
import com.fixlat.portal.dto.UpdateUserRequest;
import com.fixlat.portal.dto.UserResponse;
import com.fixlat.portal.entity.Role;
import com.fixlat.portal.entity.User;
import com.fixlat.portal.exception.BadRequestException;
import com.fixlat.portal.exception.ResourceNotFoundException;
import com.fixlat.portal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = findUserById(id);
        return mapToResponse(user);
    }

    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("El correo electrónico ya se encuentra registrado: " + email);
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .active(request.isActive())
                .build();

        User saved = userRepository.save(user);
        log.info("Usuario creado exitosamente con ID: {} y rol: {}", saved.getId(), saved.getRole());
        return mapToResponse(saved);
    }

    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = findUserById(id);
        String newEmail = request.getEmail().trim().toLowerCase();

        if (!user.getEmail().equalsIgnoreCase(newEmail) && userRepository.existsByEmail(newEmail)) {
            throw new BadRequestException("El correo electrónico ya se encuentra registrado por otro usuario");
        }

        // Regla de negocio crítica: Debe conservarse siempre al menos un administrador activo
        boolean isCurrentlyActiveAdmin = (user.getRole() == Role.ADMIN && user.isActive());
        boolean willRemainActiveAdmin = (request.getRole() == Role.ADMIN && Boolean.TRUE.equals(request.getActive()));

        if (isCurrentlyActiveAdmin && !willRemainActiveAdmin) {
            long activeAdmins = userRepository.countByRoleAndActiveTrue(Role.ADMIN);
            if (activeAdmins <= 1) {
                throw new BadRequestException("No es posible desactivar o revocar el rol del único administrador activo del sistema.");
            }
        }

        user.setName(request.getName().trim());
        user.setEmail(newEmail);
        user.setRole(request.getRole());
        user.setActive(request.getActive());

        if (StringUtils.hasText(request.getPassword())) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        User updated = userRepository.save(user);
        log.info("Usuario con ID: {} actualizado exitosamente", id);
        return mapToResponse(updated);
    }

    @Transactional
    public UserResponse toggleUserStatus(Long id) {
        User user = findUserById(id);

        // Si se intenta desactivar a un admin activo, verificar la regla del último admin
        if (user.isActive() && user.getRole() == Role.ADMIN) {
            long activeAdmins = userRepository.countByRoleAndActiveTrue(Role.ADMIN);
            if (activeAdmins <= 1) {
                throw new BadRequestException("No es posible desactivar al único administrador activo del sistema.");
            }
        }

        user.setActive(!user.isActive());
        User updated = userRepository.save(user);
        log.info("Estado del usuario con ID: {} cambiado a activo={}", id, updated.isActive());
        return mapToResponse(updated);
    }

    private User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));
    }

    private UserResponse mapToResponse(User user) {
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
