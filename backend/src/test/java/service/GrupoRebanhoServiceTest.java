package service;

import dto.GrupoRebanhoDTO;
import model.Animal;
import model.GrupoRebanho;
import model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.server.ResponseStatusException;
import repository.AnimalRepository;
import repository.GrupoRebanhoRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GrupoRebanhoServiceTest {

    @Mock
    private GrupoRebanhoRepository grupoRebanhoRepository;

    @Mock
    private AnimalRepository animalRepository;

    @Mock
    private UsuarioAutenticadoService usuarioAutenticadoService;

    @InjectMocks
    private GrupoRebanhoService grupoRebanhoService;

    private User usuarioLogado;
    private GrupoRebanho grupoRebanho;
    private GrupoRebanhoDTO grupoRebanhoDTO;

    @BeforeEach
    void setUp() {
        usuarioLogado = new User();
        usuarioLogado.setId(1L);

        grupoRebanho = new GrupoRebanho();
        grupoRebanho.setId(1L);
        grupoRebanho.setNome("Lote A");
        grupoRebanho.setDescricao("Animais de corte");
        grupoRebanho.setProprietario(usuarioLogado);
        grupoRebanho.setAnimais(new ArrayList<>());

        grupoRebanhoDTO = new GrupoRebanhoDTO(null, "Lote A", "Animais de corte", 0);
    }

    @Test
    void deveCriarGrupoComSucesso() {
        when(usuarioAutenticadoService.obterUsuario()).thenReturn(usuarioLogado);
        when(grupoRebanhoRepository.existsByNomeAndProprietario(grupoRebanhoDTO.nome().trim(), usuarioLogado)).thenReturn(false);
        when(grupoRebanhoRepository.save(any(GrupoRebanho.class))).thenReturn(grupoRebanho);

        GrupoRebanhoDTO resultado = grupoRebanhoService.criar(grupoRebanhoDTO);

        assertNotNull(resultado);
        assertEquals(grupoRebanho.getNome(), resultado.nome());
        verify(grupoRebanhoRepository, times(1)).save(any(GrupoRebanho.class));
    }

    @Test
    void naoDeveCriarGrupoComNomeDuplicado() {
        when(usuarioAutenticadoService.obterUsuario()).thenReturn(usuarioLogado);
        when(grupoRebanhoRepository.existsByNomeAndProprietario(grupoRebanhoDTO.nome().trim(), usuarioLogado)).thenReturn(true);

        assertThrows(ResponseStatusException.class, () -> grupoRebanhoService.criar(grupoRebanhoDTO));
        verify(grupoRebanhoRepository, never()).save(any(GrupoRebanho.class));
    }

    @Test
    void deveListarGruposDoUsuario() {
        when(usuarioAutenticadoService.obterUsuario()).thenReturn(usuarioLogado);
        when(grupoRebanhoRepository.findByProprietario(usuarioLogado)).thenReturn(List.of(grupoRebanho));

        List<GrupoRebanhoDTO> resultados = grupoRebanhoService.listarDoUsuario();

        assertFalse(resultados.isEmpty());
        assertEquals(1, resultados.size());
        assertEquals(grupoRebanho.getNome(), resultados.get(0).nome());
    }

    @Test
    void deveBuscarGrupoPorIdComSucesso() {
        when(usuarioAutenticadoService.obterUsuario()).thenReturn(usuarioLogado);
        when(grupoRebanhoRepository.findByIdAndProprietario(1L, usuarioLogado)).thenReturn(Optional.of(grupoRebanho));

        GrupoRebanho resultado = grupoRebanhoService.buscarDoUsuario(1L);

        assertNotNull(resultado);
        assertEquals(grupoRebanho.getId(), resultado.getId());
    }

    @Test
    void naoDeveBuscarGrupoDeOutroUsuario() {
        when(usuarioAutenticadoService.obterUsuario()).thenReturn(usuarioLogado);
        when(grupoRebanhoRepository.findByIdAndProprietario(1L, usuarioLogado)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> grupoRebanhoService.buscarDoUsuario(1L));
    }

    @Test
    void deveAtualizarGrupoComSucesso() {
        when(usuarioAutenticadoService.obterUsuario()).thenReturn(usuarioLogado);
        when(grupoRebanhoRepository.findByIdAndProprietario(1L, usuarioLogado)).thenReturn(Optional.of(grupoRebanho));
        
        GrupoRebanhoDTO atualizarDTO = new GrupoRebanhoDTO(null, "Lote B", "Novo Lote", 0);
        when(grupoRebanhoRepository.existsByNomeAndProprietario(atualizarDTO.nome().trim(), usuarioLogado)).thenReturn(false);
        
        GrupoRebanho grupoAtualizado = new GrupoRebanho();
        grupoAtualizado.setId(1L);
        grupoAtualizado.setNome("Lote B");
        grupoAtualizado.setDescricao("Novo Lote");
        grupoAtualizado.setProprietario(usuarioLogado);
        
        when(grupoRebanhoRepository.save(any(GrupoRebanho.class))).thenReturn(grupoAtualizado);

        GrupoRebanhoDTO resultado = grupoRebanhoService.atualizar(1L, atualizarDTO);

        assertNotNull(resultado);
        assertEquals("Lote B", resultado.nome());
        verify(grupoRebanhoRepository, times(1)).save(any(GrupoRebanho.class));
    }

    @Test
    void deveDeletarGrupoEDesvincularAnimais() {
        when(usuarioAutenticadoService.obterUsuario()).thenReturn(usuarioLogado);
        when(grupoRebanhoRepository.findByIdAndProprietario(1L, usuarioLogado)).thenReturn(Optional.of(grupoRebanho));

        Animal animal = new Animal();
        animal.setGrupoRebanho(grupoRebanho);
        when(animalRepository.findByProprietario(usuarioLogado)).thenReturn(List.of(animal));

        grupoRebanhoService.deletar(1L);

        assertNull(animal.getGrupoRebanho());
        verify(animalRepository, times(1)).save(animal);
        verify(grupoRebanhoRepository, times(1)).delete(grupoRebanho);
    }
}
