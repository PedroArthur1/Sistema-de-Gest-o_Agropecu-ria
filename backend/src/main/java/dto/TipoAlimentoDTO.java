package dto;

import jakarta.validation.constraints.NotBlank;

public record TipoAlimentoDTO(
        Long id,
        @NotBlank(message = "O nome do tipo de alimento é obrigatório") String nome,
        String descricao
) {}
