package service;

import dto.AlimentacaoRequestDTO;
import dto.AlimentacaoResponseDTO;
import model.Alimentacao;
import model.Animal;
import model.GrupoRebanho;
import model.TipoAlimento;
import model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;
import repository.AlimentacaoRepository;
import repository.AnimalRepository;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AlimentacaoServiceTest {

    @Mock
    private AlimentacaoRepository alimentacaoRepository;

    @Mock
    private AnimalRepository animalRepository;

    @Mock
    private UsuarioAutenticadoService usuarioAutenticadoService;

    @Mock
    private TipoAlimentoService tipoAlimentoService;

    @InjectMocks
    private AlimentacaoService alimentacaoService;

    private User usuario;
    private User outroUsuario;
    private Animal animal;
    private TipoAlimento tipoAlimento;

    @BeforeEach
    void setUp() {
        usuario = new User("Produtor Teste", "teste@fazenda.com", "senha", "USER");
        usuario.setId(1L);

        outroUsuario = new User("Outro Produtor", "outro@fazenda.com", "senha", "USER");
        outroUsuario.setId(2L);

        animal = new Animal();
        animal.setId(10L);
        animal.setCodigoIdentificacao("BOV-001");
        animal.setEspecie("Bovino");
        animal.setRaca("Nelore");
        animal.setProprietario(usuario);

        tipoAlimento = new TipoAlimento(100L, "Silagem de Milho", "Alta qualidade", usuario);
    }

    @Test
    void deveRegistrarAlimentacaoPorAnimaisIndividuaisComSucesso() {
        AlimentacaoRequestDTO dto = new AlimentacaoRequestDTO(
                List.of(10L), null, 100L, "25 kg", LocalDate.of(2026, 8, 30), "Trato matinal"
        );

        when(usuarioAutenticadoService.obterUsuario()).thenReturn(usuario);
        when(animalRepository.findAllById(List.of(10L))).thenReturn(List.of(animal));
        when(tipoAlimentoService.buscarDoUsuario(100L)).thenReturn(tipoAlimento);

        Alimentacao alimentacaoSalva = new Alimentacao(
                List.of(animal), tipoAlimento, "25 kg", LocalDate.of(2026, 8, 30), "Trato matinal"
        );
        alimentacaoSalva.setId(1L);

        when(alimentacaoRepository.save(any(Alimentacao.class))).thenReturn(alimentacaoSalva);

        AlimentacaoResponseDTO response = alimentacaoService.registrarAlimentacao(dto);

        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals("25 kg", response.quantidade());
        assertEquals("Silagem de Milho", response.tipoAlimento().nome());
        assertEquals(1, response.animalIds().size());
        assertEquals(10L, response.animalIds().get(0));
    }

    @Test
    void deveRegistrarAlimentacaoPorGrupoComSucesso() {
        GrupoRebanho grupo = new GrupoRebanho();
        grupo.setId(5L);
        grupo.setNome("Lote de Engorda");
        grupo.setProprietario(usuario);

        animal.setGrupoRebanho(grupo);

        AlimentacaoRequestDTO dto = new AlimentacaoRequestDTO(
                null, 5L, 100L, "150 kg", LocalDate.of(2026, 8, 30), "Trato em lote"
        );

        when(usuarioAutenticadoService.obterUsuario()).thenReturn(usuario);
        when(animalRepository.findByGrupoRebanhoId(5L)).thenReturn(List.of(animal));
        when(tipoAlimentoService.buscarDoUsuario(100L)).thenReturn(tipoAlimento);

        Alimentacao alimentacaoSalva = new Alimentacao(
                List.of(animal), tipoAlimento, "150 kg", LocalDate.of(2026, 8, 30), "Trato em lote"
        );
        alimentacaoSalva.setId(2L);

        when(alimentacaoRepository.save(any(Alimentacao.class))).thenReturn(alimentacaoSalva);

        AlimentacaoResponseDTO response = alimentacaoService.registrarAlimentacao(dto);

        assertNotNull(response);
        assertEquals(2L, response.id());
        assertEquals("150 kg", response.quantidade());
    }

    @Test
    void deveLancarExcecaoQuandoAnimalPertenceAOutroUsuario() {
        Animal animalOutro = new Animal();
        animalOutro.setId(99L);
        animalOutro.setProprietario(outroUsuario);

        AlimentacaoRequestDTO dto = new AlimentacaoRequestDTO(
                List.of(99L), null, 100L, "25 kg", LocalDate.of(2026, 8, 30), null
        );

        when(usuarioAutenticadoService.obterUsuario()).thenReturn(usuario);
        when(animalRepository.findAllById(List.of(99L))).thenReturn(List.of(animalOutro));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> alimentacaoService.registrarAlimentacao(dto));

        assertEquals("Nenhum animal válido encontrado.", ex.getReason());
    }

    @Test
    void deveLancarExcecaoQuandoNemAnimalNemLoteInformados() {
        AlimentacaoRequestDTO dto = new AlimentacaoRequestDTO(
                null, null, 100L, "25 kg", LocalDate.of(2026, 8, 30), null
        );

        when(usuarioAutenticadoService.obterUsuario()).thenReturn(usuario);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> alimentacaoService.registrarAlimentacao(dto));

        assertEquals("Deve ser selecionado pelo menos um animal ou um lote.", ex.getReason());
    }

    @Test
    void deveListarTodasAsAlimentacoesDoUsuarioComSucesso() {
        Alimentacao alimentacao = new Alimentacao(
                List.of(animal), tipoAlimento, "30 kg", LocalDate.of(2026, 8, 28), null
        );
        alimentacao.setId(1L);

        when(usuarioAutenticadoService.obterUsuario()).thenReturn(usuario);
        when(alimentacaoRepository.findDistinctByAnimaisProprietarioId(1L)).thenReturn(List.of(alimentacao));

        List<AlimentacaoResponseDTO> lista = alimentacaoService.listarTodas();

        assertNotNull(lista);
        assertEquals(1, lista.size());
        assertEquals("Silagem de Milho", lista.get(0).tipoAlimento().nome());
    }

    @Test
    void deveMapearAlimentacaoSemTipoAlimentoSemLancarExcecao() {
        Alimentacao alimentacaoSemTipo = new Alimentacao(
                List.of(animal), null, "10 kg", LocalDate.of(2026, 8, 20), "Legado"
        );
        alimentacaoSemTipo.setId(99L);

        when(usuarioAutenticadoService.obterUsuario()).thenReturn(usuario);
        when(alimentacaoRepository.findDistinctByAnimaisProprietarioId(1L)).thenReturn(List.of(alimentacaoSemTipo));

        List<AlimentacaoResponseDTO> lista = alimentacaoService.listarTodas();

        assertNotNull(lista);
        assertEquals(1, lista.size());
        assertNull(lista.get(0).tipoAlimento());
    }
}
