package service;

import dto.TratamentoRequestDTO;
import dto.TratamentoResponseDTO;
import model.Animal;
import model.Tratamento;
import repository.TratamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TratamentoService {

    @Autowired
    private TratamentoRepository tratamentoRepository;

    @Autowired
    private AnimalService animalService;

    public TratamentoResponseDTO registrarTratamento(TratamentoRequestDTO dto) {
        Animal animal = animalService.buscarDoUsuario(dto.animalId());

        Tratamento tratamento = new Tratamento(
                animal,
                dto.medicamento(),
                dto.data(),
                dto.motivo(),
                dto.dosagem(),
                dto.observacoes()
        );

        Tratamento salvo = tratamentoRepository.save(tratamento);
        return mapToDTO(salvo);
    }

    public List<TratamentoResponseDTO> listarPorAnimal(Long animalId) {
        animalService.buscarDoUsuario(animalId);
        return tratamentoRepository.findByAnimalId(animalId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private TratamentoResponseDTO mapToDTO(Tratamento t) {
        return new TratamentoResponseDTO(
                t.getId(),
                t.getAnimal().getId(),
                t.getMedicamento(),
                t.getData(),
                t.getMotivo(),
                t.getDosagem(),
                t.getObservacoes(),
                t.getConsulta() != null ? t.getConsulta().getId() : null
        );
    }
}