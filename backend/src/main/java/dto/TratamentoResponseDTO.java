package dto;

import java.time.LocalDate;

public record TratamentoResponseDTO(
        Long id,
        Long animalId,
        String medicamento,
        LocalDate data,
        String motivo,
        String dosagem,
        String observacoes,
        Long consultaId
) {}