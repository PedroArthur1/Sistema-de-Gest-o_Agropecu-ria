package dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record TratamentoRequestDTO(
        @NotNull(message = "O ID do animal é obrigatório") Long animalId,
        @NotBlank(message = "O medicamento é obrigatório") String medicamento,
        @NotNull(message = "A data é obrigatória") LocalDate data,
        @NotBlank(message = "O motivo é obrigatório") String motivo,
        String dosagem,
        String observacoes
) {}