package service;

import dto.GrupoRebanhoDTO;
import model.Animal;
import model.GrupoRebanho;
import model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import repository.AnimalRepository;
import repository.GrupoRebanhoRepository;

import java.util.List;

@Service
public class GrupoRebanhoService {

    @Autowired
    private GrupoRebanhoRepository grupoRebanhoRepository;

    @Autowired
    private AnimalRepository animalRepository;

    @Autowired
    private UsuarioAutenticadoService usuarioAutenticadoService;

    @Transactional
    public GrupoRebanhoDTO criar(GrupoRebanhoDTO dto) {
        User proprietario = usuarioAutenticadoService.obterUsuario();

        if (grupoRebanhoRepository.existsByNomeAndProprietario(dto.nome().trim(), proprietario)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Já existe um lote com este nome.");
        }

        GrupoRebanho grupo = new GrupoRebanho();
        grupo.setNome(dto.nome().trim());
        grupo.setDescricao(dto.descricao() != null ? dto.descricao().trim() : null);
        grupo.setProprietario(proprietario);

        return toDTO(grupoRebanhoRepository.save(grupo));
    }

    @Transactional(readOnly = true)
    public List<GrupoRebanhoDTO> listarDoUsuario() {
        User proprietario = usuarioAutenticadoService.obterUsuario();
        return grupoRebanhoRepository.findByProprietario(proprietario).stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public GrupoRebanho buscarDoUsuario(Long id) {
        User proprietario = usuarioAutenticadoService.obterUsuario();
        return grupoRebanhoRepository.findByIdAndProprietario(id, proprietario)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lote não encontrado"));
    }

    @Transactional(readOnly = true)
    public GrupoRebanhoDTO buscarDoUsuarioComoDTO(Long id) {
        return toDTO(buscarDoUsuario(id));
    }

    @Transactional
    public GrupoRebanhoDTO atualizar(Long id, GrupoRebanhoDTO dto) {
        GrupoRebanho grupo = buscarDoUsuario(id);
        User proprietario = usuarioAutenticadoService.obterUsuario();

        if (!grupo.getNome().equalsIgnoreCase(dto.nome().trim()) &&
                grupoRebanhoRepository.existsByNomeAndProprietario(dto.nome().trim(), proprietario)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Já existe outro lote com este nome.");
        }

        grupo.setNome(dto.nome().trim());
        grupo.setDescricao(dto.descricao() != null ? dto.descricao().trim() : null);

        return toDTO(grupoRebanhoRepository.save(grupo));
    }

    @Transactional
    public void deletar(Long id) {
        GrupoRebanho grupo = buscarDoUsuario(id);
        
        // Antes de excluir, remover todos os animais deste grupo para evitar DataIntegrityViolationException
        // se a ForeignKey no DB não for ON DELETE CASCADE (o padrão é RESTRICT)
        // Optaremos por "desvincular" os animais do lote ao excluí-lo.
        List<Animal> animaisNoLote = animalRepository.findByProprietario(grupo.getProprietario()).stream()
                .filter(a -> a.getGrupoRebanho() != null && a.getGrupoRebanho().getId().equals(grupo.getId()))
                .toList();
                
        for (Animal animal : animaisNoLote) {
            animal.setGrupoRebanho(null);
            animalRepository.save(animal);
        }

        try {
            grupoRebanhoRepository.delete(grupo);
            grupoRebanhoRepository.flush();
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não foi possível excluir o lote devido a restrições de integridade.", e);
        }
    }

    private GrupoRebanhoDTO toDTO(GrupoRebanho grupo) {
        int qtdAnimais = (grupo.getAnimais() != null) ? grupo.getAnimais().size() : 0;
        return new GrupoRebanhoDTO(
                grupo.getId(),
                grupo.getNome(),
                grupo.getDescricao(),
                qtdAnimais
        );
    }
}
