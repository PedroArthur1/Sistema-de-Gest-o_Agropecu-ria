package dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public record ConsultaRequestDTO(
        @NotNull(message = "O ID do animal é obrigatório") Long animalId,
        @NotNull(message = "A data da consulta é obrigatória") LocalDate dataConsulta,
        @NotBlank(message = "O motivo é obrigatório") String motivo,
        @NotBlank(message = "O profissional responsável é obrigatório") String profissionalResponsavel,
        String diagnostico,
        String observacoes,
        List<Long> tratamentoIds
) {}
