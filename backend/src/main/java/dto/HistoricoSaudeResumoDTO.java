package dto;

import java.util.List;

public record HistoricoSaudeResumoDTO(
        Long animalId,
        String codigoAnimal,
        int totalEventos,
        int totalVacinas,
        int totalTratamentos,
        int totalConsultas,
        List<EventoSaudeDTO> eventos
) {}
