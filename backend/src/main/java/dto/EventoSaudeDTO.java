package dto;

import java.time.LocalDate;

public record EventoSaudeDTO(
        Long idOrigem,
        String tipo,
        LocalDate data,
        String titulo,
        String subtitulo,
        String descricao,
        String responsavel,
        LocalDate dataProxima,
        Long consultaId
) {}
