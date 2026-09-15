package com.fixlat.portal.config;

import com.fixlat.portal.entity.Note;
import com.fixlat.portal.entity.NoteStatus;
import com.fixlat.portal.entity.Role;
import com.fixlat.portal.entity.User;
import com.fixlat.portal.repository.NoteRepository;
import com.fixlat.portal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final NoteRepository noteRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.demo.admin-email:admin@fixlat.com}")
    private String adminEmail;

    @Value("${app.demo.admin-password:Admin123!}")
    private String adminPassword;

    @Value("${app.demo.admin-name:Administrador FIXLAT}")
    private String adminName;

    @Value("${app.demo.user-email:user@fixlat.com}")
    private String userEmail;

    @Value("${app.demo.user-password:User123!}")
    private String userPassword;

    @Value("${app.demo.user-name:Usuario Demostración}")
    private String userName;

    @Override
    public void run(String... args) {
        seedUsers();
        seedNotes();
    }

    private void seedUsers() {
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = User.builder()
                    .name(adminName)
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .role(Role.ADMIN)
                    .active(true)
                    .build();
            userRepository.save(admin);
            log.info(">>> Cuenta DEMO Administrador creada: {}", adminEmail);
        }

        if (!userRepository.existsByEmail(userEmail)) {
            User user = User.builder()
                    .name(userName)
                    .email(userEmail)
                    .password(passwordEncoder.encode(userPassword))
                    .role(Role.USER)
                    .active(true)
                    .build();
            userRepository.save(user);
            log.info(">>> Cuenta DEMO Usuario creada: {}", userEmail);
        }
    }

    private void seedNotes() {
        if (noteRepository.count() == 0) {
            noteRepository.save(Note.builder()
                    .title("Revisión de sensores de temperatura")
                    .content("Comprobar calibración y reporte de telemetría cada 5 minutos en el concentrador principal.")
                    .status(NoteStatus.PENDIENTE)
                    .posX(60.0)
                    .posY(80.0)
                    .color("#FEF08A") // Amarillo
                    .build());

            noteRepository.save(Note.builder()
                    .title("Integración firmware v2.4 en concentradores")
                    .content("Actualización OTA de dispositivos IoT y verificación de compatibilidad de tramas.")
                    .status(NoteStatus.EN_CURSO)
                    .posX(380.0)
                    .posY(80.0)
                    .color("#BAE6FD") // Azul
                    .build());

            noteRepository.save(Note.builder()
                    .title("Despliegue de gateway LoRaWAN")
                    .content("Pruebas de cobertura completadas con éxito en el sector industrial.")
                    .status(NoteStatus.HECHO)
                    .posX(700.0)
                    .posY(80.0)
                    .color("#BBF7D0") // Verde
                    .build());

            noteRepository.save(Note.builder()
                    .title("Pruebas de conectividad MQTT / AWS IoT")
                    .content("Validar certificados X.509 y tópicos de telemetría hacia la nube.")
                    .status(NoteStatus.PENDIENTE)
                    .posX(60.0)
                    .posY(360.0)
                    .color("#FED7AA") // Naranja
                    .build());

            log.info(">>> Notas iniciales de demostración creadas exitosamente");
        }
    }
}
