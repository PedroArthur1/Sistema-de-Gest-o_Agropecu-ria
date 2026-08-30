package dto;

import java.time.LocalDate;
import java.util.List;

public record AlimentacaoResponseDTO(
        Long id,
        List<Long> animalIds,
        TipoAlimentoDTO tipoAlimento,
        String quantidade,
        LocalDate data,
        String observacoes
) {}