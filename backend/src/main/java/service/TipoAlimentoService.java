package service;

import dto.TipoAlimentoDTO;
import model.TipoAlimento;
import model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import repository.TipoAlimentoRepository;

import java.util.List;

@Service
public class TipoAlimentoService {

    @Autowired
    private TipoAlimentoRepository tipoAlimentoRepository;

    @Autowired
    private UsuarioAutenticadoService usuarioAutenticadoService;

    @Transactional
    public TipoAlimentoDTO criar(TipoAlimentoDTO dto) {
        User proprietario = usuarioAutenticadoService.obterUsuario();
        
        TipoAlimento tipoAlimento = new TipoAlimento();
        tipoAlimento.setNome(dto.nome().trim());
        tipoAlimento.setDescricao(dto.descricao() != null ? dto.descricao().trim() : null);
        tipoAlimento.setProprietario(proprietario);

        return toDTO(tipoAlimentoRepository.save(tipoAlimento));
    }

    @Transactional(readOnly = true)
    public List<TipoAlimentoDTO> listarDoUsuario() {
        User proprietario = usuarioAutenticadoService.obterUsuario();
        return tipoAlimentoRepository.findByProprietario(proprietario).stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public TipoAlimento buscarDoUsuario(Long id) {
        User proprietario = usuarioAutenticadoService.obterUsuario();
        return tipoAlimentoRepository.findByIdAndProprietario(id, proprietario)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tipo de alimento não encontrado"));
    }
    
    @Transactional(readOnly = true)
    public TipoAlimentoDTO buscarDoUsuarioComoDTO(Long id) {
        return toDTO(buscarDoUsuario(id));
    }

    @Transactional
    public TipoAlimentoDTO atualizar(Long id, TipoAlimentoDTO dto) {
        TipoAlimento tipoAlimento = buscarDoUsuario(id);
        
        tipoAlimento.setNome(dto.nome().trim());
        tipoAlimento.setDescricao(dto.descricao() != null ? dto.descricao().trim() : null);

        return toDTO(tipoAlimentoRepository.save(tipoAlimento));
    }

    @Transactional
    public void deletar(Long id) {
        TipoAlimento tipoAlimento = buscarDoUsuario(id);
        
        // Regra de negócio importante (soft delete ou bloqueio):
        // Como definimos no plano usar FK com restrição, o H2 vai lançar DataIntegrityViolationException
        // automaticamente se tentarmos excluir um tipo de alimento em uso. O ideal é capturar isso num 
        // ControllerAdvice ou tratar aqui, mas por ora vamos deixar o Spring lidar ou deletar caso não tenha vínculo.
        try {
            tipoAlimentoRepository.delete(tipoAlimento);
            tipoAlimentoRepository.flush();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não é possível excluir um tipo de alimento que já foi utilizado em um registro de alimentação.");
        }
    }

    private TipoAlimentoDTO toDTO(TipoAlimento tipoAlimento) {
        return new TipoAlimentoDTO(
                tipoAlimento.getId(),
                tipoAlimento.getNome(),
                tipoAlimento.getDescricao()
        );
    }
}
