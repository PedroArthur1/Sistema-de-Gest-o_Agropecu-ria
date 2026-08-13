package dto;

import java.time.LocalDate;

public record VacinacaoRequestDTO(
        String nomeVacina,
        LocalDate dataAplicacao,
        String dose,
        String responsavel,
        LocalDate dataProximaDose
) {
}
