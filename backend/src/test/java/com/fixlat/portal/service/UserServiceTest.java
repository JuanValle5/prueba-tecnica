package com.fixlat.portal.service;

import com.fixlat.portal.dto.UpdateUserRequest;
import com.fixlat.portal.entity.Role;
import com.fixlat.portal.entity.User;
import com.fixlat.portal.exception.BadRequestException;
import com.fixlat.portal.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User activeAdmin;

    @BeforeEach
    void setUp() {
        activeAdmin = User.builder()
                .id(1L)
                .name("Admin Test")
                .email("admin@test.com")
                .password("encoded_pass")
                .role(Role.ADMIN)
                .active(true)
                .build();
    }

    @Test
    @DisplayName("Debe lanzar excepción al intentar desactivar el único administrador activo")
    void shouldThrowExceptionWhenDeactivatingLastActiveAdmin() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(activeAdmin));
        when(userRepository.countByRoleAndActiveTrue(Role.ADMIN)).thenReturn(1L);

        UpdateUserRequest updateRequest = new UpdateUserRequest();
        updateRequest.setName("Admin Test");
        updateRequest.setEmail("admin@test.com");
        updateRequest.setRole(Role.ADMIN);
        updateRequest.setActive(false); // Intento de desactivar

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            userService.updateUser(1L, updateRequest);
        });

        assertTrue(ex.getMessage().contains("único administrador activo"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Debe lanzar excepción al intentar cambiar el rol del único administrador activo a USER")
    void shouldThrowExceptionWhenDemotingLastActiveAdmin() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(activeAdmin));
        when(userRepository.countByRoleAndActiveTrue(Role.ADMIN)).thenReturn(1L);

        UpdateUserRequest updateRequest = new UpdateUserRequest();
        updateRequest.setName("Admin Test");
        updateRequest.setEmail("admin@test.com");
        updateRequest.setRole(Role.USER); // Intento de degradar rol
        updateRequest.setActive(true);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            userService.updateUser(1L, updateRequest);
        });

        assertTrue(ex.getMessage().contains("único administrador activo"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Debe permitir actualizar si existen más de un administrador activo")
    void shouldAllowUpdateWhenMultipleActiveAdminsExist() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(activeAdmin));
        when(userRepository.countByRoleAndActiveTrue(Role.ADMIN)).thenReturn(2L);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateUserRequest updateRequest = new UpdateUserRequest();
        updateRequest.setName("Admin Modificado");
        updateRequest.setEmail("admin@test.com");
        updateRequest.setRole(Role.USER);
        updateRequest.setActive(true);

        assertDoesNotThrow(() -> userService.updateUser(1L, updateRequest));
        verify(userRepository).save(any(User.class));
    }
}
