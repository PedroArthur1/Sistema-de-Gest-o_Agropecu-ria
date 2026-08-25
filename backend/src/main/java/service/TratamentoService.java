package service;

import dto.TratamentoRequestDTO;
import dto.TratamentoResponseDTO;
import model.Animal;
import model.Tratamento;
import repository.TratamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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

        if (dto.dataPrevista() != null && dto.dataPrevista().isBefore(dto.data())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Data prevista para a próxima dose não pode ser anterior à data do tratamento"
            );
        }

        Tratamento tratamento = new Tratamento(
                animal,
                dto.medicamento(),
                dto.data(),
                dto.motivo(),
                dto.dosagem(),
                dto.observacoes(),
                dto.dataPrevista()
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
                t.getDataPrevista(),
                t.getConsulta() != null ? t.getConsulta().getId() : null
        );
    }
}