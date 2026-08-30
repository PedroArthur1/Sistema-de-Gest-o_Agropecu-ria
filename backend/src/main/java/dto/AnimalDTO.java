package dto;

public record AnimalDTO(
        Long id,
        String codigoIdentificacao,
        String especie,
        String raca,
        String sexo,
        String dataNascimentoOuIdade,
        Double peso,
        String condicaoSaude,
        String observacoes,
        Long grupoId,
        String grupoNome
) {
}
