package service;

import dto.TipoAlimentoDTO;
import model.TipoAlimento;
import model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;
import repository.TipoAlimentoRepository;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TipoAlimentoServiceTest {

    @Mock
    private TipoAlimentoRepository tipoAlimentoRepository;

    @Mock
    private UsuarioAutenticadoService usuarioAutenticadoService;

    @InjectMocks
    private TipoAlimentoService tipoAlimentoService;

    private User usuario;
    private TipoAlimento tipoAlimento;

    @BeforeEach
    void setUp() {
        usuario = new User("Agricultor", "agri@fazenda.com", "hash", "USER");
        usuario.setId(1L);

        tipoAlimento = new TipoAlimento(1L, "Ração", "Ração para engorda", usuario);
    }

    @Test
    void deveCriarTipoAlimentoComSucesso() {
        TipoAlimentoDTO dto = new TipoAlimentoDTO(null, "Ração", "Ração para engorda");

        when(usuarioAutenticadoService.obterUsuario()).thenReturn(usuario);
        when(tipoAlimentoRepository.save(any(TipoAlimento.class))).thenReturn(tipoAlimento);

        TipoAlimentoDTO resultado = tipoAlimentoService.criar(dto);

        assertNotNull(resultado);
        assertEquals("Ração", resultado.nome());
        verify(tipoAlimentoRepository).save(any(TipoAlimento.class));
    }

    @Test
    void deveListarTiposDoUsuario() {
        when(usuarioAutenticadoService.obterUsuario()).thenReturn(usuario);
        when(tipoAlimentoRepository.findByProprietario(usuario)).thenReturn(List.of(tipoAlimento));

        List<TipoAlimentoDTO> resultado = tipoAlimentoService.listarDoUsuario();

        assertEquals(1, resultado.size());
        assertEquals("Ração", resultado.get(0).nome());
    }

    @Test
    void deveBuscarTipoAlimentoPorId() {
        when(usuarioAutenticadoService.obterUsuario()).thenReturn(usuario);
        when(tipoAlimentoRepository.findByIdAndProprietario(1L, usuario)).thenReturn(Optional.of(tipoAlimento));

        TipoAlimento resultado = tipoAlimentoService.buscarDoUsuario(1L);

        assertNotNull(resultado);
        assertEquals(1L, resultado.getId());
    }

    @Test
    void deveLancarExcecaoAoBuscarTipoNaoEncontradoOuDeOutroUsuario() {
        when(usuarioAutenticadoService.obterUsuario()).thenReturn(usuario);
        when(tipoAlimentoRepository.findByIdAndProprietario(99L, usuario)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> tipoAlimentoService.buscarDoUsuario(99L));
    }

    @Test
    void deveDeletarComSucesso() {
        when(usuarioAutenticadoService.obterUsuario()).thenReturn(usuario);
        when(tipoAlimentoRepository.findByIdAndProprietario(1L, usuario)).thenReturn(Optional.of(tipoAlimento));

        tipoAlimentoService.deletar(1L);

        verify(tipoAlimentoRepository).delete(tipoAlimento);
    }
}
