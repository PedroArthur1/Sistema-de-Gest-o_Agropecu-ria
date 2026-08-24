package service;

import dto.ConsultaRequestDTO;
import dto.ConsultaResponseDTO;
import model.Animal;
import model.Consulta;
import model.Tratamento;
import repository.ConsultaRepository;
import repository.TratamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ConsultaService {

    @Autowired
    private ConsultaRepository consultaRepository;

    @Autowired
    private TratamentoRepository tratamentoRepository;

    @Autowired
    private AnimalService animalService;

    @Transactional
    public ConsultaResponseDTO registrarConsulta(ConsultaRequestDTO dto) {
        Animal animal = animalService.buscarDoUsuario(dto.animalId());

        Consulta consulta = new Consulta(
                animal,
                dto.dataConsulta(),
                dto.motivo(),
                dto.profissionalResponsavel(),
                dto.diagnostico(),
                dto.observacoes()
        );

        Consulta salva = consultaRepository.save(consulta);

        // Vincular tratamentos existentes à consulta, se informados
        List<Long> tratamentoIds = dto.tratamentoIds();
        if (tratamentoIds != null && !tratamentoIds.isEmpty()) {
            List<Tratamento> tratamentos = tratamentoRepository.findAllById(tratamentoIds);
            for (Tratamento t : tratamentos) {
                if (!t.getAnimal().getId().equals(animal.getId())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Tratamento ID " + t.getId() + " não pertence ao animal informado.");
                }
                t.setConsulta(salva);
            }
            tratamentoRepository.saveAll(tratamentos);
        }

        return mapToDTO(salva);
    }

    @Transactional(readOnly = true)
    public List<ConsultaResponseDTO> listarPorAnimal(Long animalId) {
        // Garante que o animal pertence ao usuário autenticado
        animalService.buscarDoUsuario(animalId);

        return consultaRepository.findByAnimalIdOrderByDataConsultaDesc(animalId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ConsultaResponseDTO buscarPorId(Long id) {
        Consulta consulta = consultaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Consulta não encontrada."));

        // Garante que o animal pertence ao usuário autenticado
        animalService.buscarDoUsuario(consulta.getAnimal().getId());

        return mapToDTO(consulta);
    }

    private ConsultaResponseDTO mapToDTO(Consulta c) {
        List<Long> tratamentoIds = tratamentoRepository.findByAnimalId(c.getAnimal().getId())
                .stream()
                .filter(t -> t.getConsulta() != null && t.getConsulta().getId().equals(c.getId()))
                .map(Tratamento::getId)
                .collect(Collectors.toList());

        return new ConsultaResponseDTO(
                c.getId(),
                c.getAnimal().getId(),
                c.getDataConsulta(),
                c.getMotivo(),
                c.getProfissionalResponsavel(),
                c.getDiagnostico(),
                c.getObservacoes(),
                tratamentoIds
        );
    }
}
