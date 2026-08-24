package dto;

import java.time.LocalDate;
import java.util.List;

public record ConsultaResponseDTO(
        Long id,
        Long animalId,
        LocalDate dataConsulta,
        String motivo,
        String profissionalResponsavel,
        String diagnostico,
        String observacoes,
        List<Long> tratamentoIds
) {}
