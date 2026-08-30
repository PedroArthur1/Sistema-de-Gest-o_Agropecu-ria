package dto;

/**
 * DTO para representar a distribuição de um grupo (espécie, raça, etc.)
 * dentro do rebanho, com total e percentual calculados.
 */
public record DistribuicaoItemDTO(
        String nome,
        long total,
        int percentual
) {}
