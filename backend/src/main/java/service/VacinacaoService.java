package service;

import dto.VacinacaoRequestDTO;
import dto.VacinacaoResponseDTO;
import model.Animal;
import model.Vacinacao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import repository.VacinacaoRepository;

import java.util.List;

@Service
public class VacinacaoService {

    @Autowired
    private VacinacaoRepository vacinacaoRepository;

    @Autowired
    private AnimalService animalService;

    @Transactional
    public VacinacaoResponseDTO registrar(Long animalId, VacinacaoRequestDTO dto) {
        validarRegistro(dto);
        Animal animal = animalService.buscarDoUsuario(animalId);

        Vacinacao vacinacao = new Vacinacao();
        vacinacao.setAnimal(animal);
        vacinacao.setNomeVacina(dto.nomeVacina().trim());
        vacinacao.setDataAplicacao(dto.dataAplicacao());
        vacinacao.setDose(dto.dose().trim());
        vacinacao.setResponsavel(dto.responsavel().trim());
        vacinacao.setDataProximaDose(dto.dataProximaDose());

        return toDTO(vacinacaoRepository.save(vacinacao));
    }

    @Transactional(readOnly = true)
    public List<VacinacaoResponseDTO> listarHistorico(Long animalId) {
        animalService.buscarDoUsuario(animalId);
        return vacinacaoRepository.findByAnimalIdOrderByDataAplicacaoDescIdDesc(animalId).stream()
                .map(this::toDTO)
                .toList();
    }

    private void validarRegistro(VacinacaoRequestDTO dto) {
        if (dto == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dados da vacinação são obrigatórios");
        }
        exigirPreenchido(dto.nomeVacina(), "Nome da vacina é obrigatório");
        exigirPreenchido(dto.dose(), "Dose administrada é obrigatória");
        exigirPreenchido(dto.responsavel(), "Responsável pela aplicação é obrigatório");
        if (dto.dataAplicacao() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Data da aplicação é obrigatória");
        }
        if (dto.dataProximaDose() != null && dto.dataProximaDose().isBefore(dto.dataAplicacao())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Data prevista para a próxima dose não pode ser anterior à data da aplicação"
            );
        }
    }

    private void exigirPreenchido(String valor, String mensagem) {
        if (valor == null || valor.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, mensagem);
        }
    }

    private VacinacaoResponseDTO toDTO(Vacinacao vacinacao) {
        return new VacinacaoResponseDTO(
                vacinacao.getId(),
                vacinacao.getAnimal().getId(),
                vacinacao.getNomeVacina(),
                vacinacao.getDataAplicacao(),
                vacinacao.getDose(),
                vacinacao.getResponsavel(),
                vacinacao.getDataProximaDose()
        );
    }
}
