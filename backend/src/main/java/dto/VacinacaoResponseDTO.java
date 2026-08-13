package dto;

import java.time.LocalDate;

public record VacinacaoResponseDTO(
        Long id,
        Long animalId,
        String nomeVacina,
        LocalDate dataAplicacao,
        String dose,
        String responsavel,
        LocalDate dataProximaDose
) {
}
