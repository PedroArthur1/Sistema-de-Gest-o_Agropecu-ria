package service;

import dto.AlimentacaoRequestDTO;
import dto.AlimentacaoResponseDTO;
import model.Alimentacao;
import model.Animal;
import repository.AlimentacaoRepository;
import repository.AnimalRepository;
import model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import dto.TipoAlimentoDTO;
import service.TipoAlimentoService;

@Service
public class AlimentacaoService {

    @Autowired
    private AlimentacaoRepository alimentacaoRepository;

    @Autowired
    private AnimalRepository animalRepository;

    @Autowired
    private UsuarioAutenticadoService usuarioAutenticadoService;
    
    @Autowired
    private TipoAlimentoService tipoAlimentoService;

    @Transactional
    public AlimentacaoResponseDTO registrarAlimentacao(AlimentacaoRequestDTO dto) {
        // 1. Busca todos os animais usando a lista de IDs que veio no DTO
        List<Animal> animais = animalRepository.findAllById(dto.animalIds());

        if (animais.isEmpty()) {
            throw new RuntimeException("Nenhum animal válido encontrado para os IDs informados.");
        }

        // 2. Busca o Tipo de Alimento
        model.TipoAlimento tipoAlimento = tipoAlimentoService.buscarDoUsuario(dto.tipoAlimentoId());

        // 3. Monta a entidade passando a LISTA de animais
        Alimentacao alimentacao = new Alimentacao(
                animais,
                tipoAlimento,
                dto.quantidade(),
                dto.data(),
                dto.observacoes()
        );

        // 3. Salva no banco e devolve como DTO
        Alimentacao salva = alimentacaoRepository.save(alimentacao);
        return mapToDTO(salva);
    }

    @Transactional(readOnly = true)
    public List<AlimentacaoResponseDTO> listarPorAnimal(Long animalId) {
        return alimentacaoRepository.findByAnimaisId(animalId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AlimentacaoResponseDTO> listarTodas() {
        User proprietario = usuarioAutenticadoService.obterUsuario();
        return alimentacaoRepository.findDistinctByAnimaisProprietarioId(proprietario.getId())
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
                new TipoAlimentoDTO(a.getTipoAlimento().getId(), a.getTipoAlimento().getNome(), a.getTipoAlimento().getDescricao()),
                a.getQuantidade(),
                a.getData(),
                a.getObservacoes()
        );
    }
}