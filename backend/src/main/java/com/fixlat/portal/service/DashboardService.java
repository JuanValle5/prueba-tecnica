package com.fixlat.portal.service;

import com.fixlat.portal.dto.DashboardMetricsResponse;
import com.fixlat.portal.entity.NoteStatus;
import com.fixlat.portal.repository.NoteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final NoteRepository noteRepository;

    @Value("${app.lambda.metrics-url:http://lambda-metrics:8082/metrics}")
    private String lambdaMetricsUrl;

    public DashboardMetricsResponse getMetrics() {
        // Intento 1: Invocar a la función AWS Lambda (local en Docker o remota en AWS)
        try {
            RestClient restClient = RestClient.builder()
                    .baseUrl(lambdaMetricsUrl)
                    .build();

            DashboardMetricsResponse lambdaResponse = restClient.get()
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(DashboardMetricsResponse.class);

            if (lambdaResponse != null) {
                log.info("Métricas obtenidas exitosamente desde AWS Lambda");
                return lambdaResponse;
            }
        } catch (Exception e) {
            log.warn("No se pudo contactar con AWS Lambda ({}), aplicando fallback local resiliente: {}",
                    lambdaMetricsUrl, e.getMessage());
        }

        // Fallback local: Cálculo directo desde el repositorio JPA
        return calculateMetricsFallback();
    }

    public DashboardMetricsResponse calculateMetricsFallback() {
        long total = noteRepository.count();
        long pendientes = noteRepository.countByStatus(NoteStatus.PENDIENTE);
        long enCurso = noteRepository.countByStatus(NoteStatus.EN_CURSO);
        long hechos = noteRepository.countByStatus(NoteStatus.HECHO);

        Map<String, Long> byStatus = new HashMap<>();
        byStatus.put("PENDIENTE", pendientes);
        byStatus.put("EN_CURSO", enCurso);
        byStatus.put("HECHO", hechos);

        return DashboardMetricsResponse.builder()
                .totalNotes(total)
                .byStatus(byStatus)
                .source("SPRING_BOOT_FALLBACK")
                .timestamp(LocalDateTime.now())
                .build();
    }
}
