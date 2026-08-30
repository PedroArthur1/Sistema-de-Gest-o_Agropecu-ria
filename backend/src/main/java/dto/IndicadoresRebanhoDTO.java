package dto;

import java.util.List;

/**
 * DTO de resposta consolidada dos indicadores do rebanho.
 * Retornado pelo endpoint GET /animais/indicadores.
 */
public record IndicadoresRebanhoDTO(
        long totalAnimais,
        double pesoMedio,
        long totalMachos,
        long totalFemeas,
        int percentualMachos,
        int percentualFemeas,
        List<DistribuicaoItemDTO> distribuicaoEspecie,
        List<DistribuicaoItemDTO> distribuicaoRaca,
        List<DistribuicaoItemDTO> distribuicaoSaude,
        List<DistribuicaoItemDTO> distribuicaoIdade
) {}
