package service;

import dto.AlimentacaoRequestDTO;
import dto.AlimentacaoResponseDTO;
import model.Alimentacao;
import model.Animal;
import repository.AlimentacaoRepository;
import repository.AnimalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AlimentacaoService {

    @Autowired
    private AlimentacaoRepository alimentacaoRepository;

    @Autowired
    private AnimalRepository animalRepository;

    public AlimentacaoResponseDTO registrarAlimentacao(AlimentacaoRequestDTO dto) {
        // 1. Busca todos os animais usando a lista de IDs que veio no DTO
        List<Animal> animais = animalRepository.findAllById(dto.animalIds());

        if (animais.isEmpty()) {
            throw new RuntimeException("Nenhum animal válido encontrado para os IDs informados.");
        }

        // 2. Monta a entidade passando a LISTA de animais
        Alimentacao alimentacao = new Alimentacao(
                animais,
                dto.tipoAlimento(),
                dto.quantidade(),
                dto.data(),
                dto.observacoes()
        );

        // 3. Salva no banco e devolve como DTO
        Alimentacao salva = alimentacaoRepository.save(alimentacao);
        return mapToDTO(salva);
    }

    public List<AlimentacaoResponseDTO> listarPorAnimal(Long animalId) {
        return alimentacaoRepository.findByAnimaisId(animalId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // Novo método: vai servir para popular a nova tela geral que vamos criar
    public List<AlimentacaoResponseDTO> listarTodas() {
        return alimentacaoRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // Método auxiliar para converter Entidade -> DTO
    private AlimentacaoResponseDTO mapToDTO(Alimentacao a) {
        // Transforma a lista de Entidades em uma lista de IDs (Long)
        List<Long> ids = a.getAnimais().stream()
                .map(Animal::getId)
                .collect(Collectors.toList());

        return new AlimentacaoResponseDTO(
                a.getId(),
                ids,
                a.getTipoAlimento(),
                a.getQuantidade(),
                a.getData(),
                a.getObservacoes()
        );
    }
}