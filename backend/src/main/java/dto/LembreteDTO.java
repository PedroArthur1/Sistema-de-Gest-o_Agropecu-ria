package dto;

import java.time.LocalDate;

public record LembreteDTO(
        Long animalId,
        String codigoAnimal,
        String nomeAnimal,
        String vacina,
        LocalDate dataPrevista,
        String status,
        String tipo
) {}