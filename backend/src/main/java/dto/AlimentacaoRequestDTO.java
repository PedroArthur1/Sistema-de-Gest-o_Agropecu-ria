package dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public record AlimentacaoRequestDTO(
        @NotEmpty(message = "Pelo menos um animal deve ser selecionado") List<Long> animalIds,
        @NotNull(message = "O tipo de alimento é obrigatório") Long tipoAlimentoId,
        @NotBlank(message = "A quantidade é obrigatória") String quantidade,
        @NotNull(message = "A data é obrigatória") LocalDate data,
        String observacoes
) {}