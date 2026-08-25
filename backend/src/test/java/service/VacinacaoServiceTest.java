package service;

import dto.VacinacaoRequestDTO;
import dto.VacinacaoResponseDTO;
import model.Animal;
import model.User;
import model.Vacinacao;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;
import repository.VacinacaoRepository;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VacinacaoServiceTest {

    @Mock
    private VacinacaoRepository vacinacaoRepository;

    @Mock
    private AnimalService animalService;

    @InjectMocks
    private VacinacaoService vacinacaoService;

    private Animal animal;
    private Vacinacao vacinacao;

    @BeforeEach
    void setUp() {
        User usuario = new User("Agricultor", "agri@fazenda.com", "hash", "USER");

        animal = new Animal();
        animal.setCodigoIdentificacao("BOV-001");
        animal.setEspecie("Bovino");
        animal.setRaca("Nelore");
        animal.setSexo("MACHO");
        animal.setDataNascimentoOuIdade("2 anos");
        animal.setPeso(450.0);
        animal.setCondicaoSaude("Saudável");
        animal.setProprietario(usuario);

        vacinacao = new Vacinacao();
        vacinacao.setAnimal(animal);
        vacinacao.setNomeVacina("Febre Aftosa");
        vacinacao.setDataAplicacao(LocalDate.of(2026, 8, 12));
        vacinacao.setDose("5 mL");
        vacinacao.setResponsavel("Dr. João");
        vacinacao.setDataProximaDose(LocalDate.of(2026, 11, 12));
    }

    @Test
    void deveRegistrarVacinacaoComSucesso() {
        VacinacaoRequestDTO dto = new VacinacaoRequestDTO(
                "Febre Aftosa", LocalDate.of(2026, 8, 12),
                "5 mL", "Dr. João", LocalDate.of(2026, 11, 12));

        when(animalService.buscarDoUsuario(1L)).thenReturn(animal);
        when(vacinacaoRepository.save(any(Vacinacao.class))).thenReturn(vacinacao);

        VacinacaoResponseDTO resultado = vacinacaoService.registrar(1L, dto);

        assertNotNull(resultado);
        assertEquals("Febre Aftosa", resultado.nomeVacina());
        assertEquals("5 mL", resultado.dose());
        verify(vacinacaoRepository).save(any(Vacinacao.class));
    }

    @Test
    void deveLancarExcecaoParaDtoNulo() {
        assertThrows(ResponseStatusException.class, () -> vacinacaoService.registrar(1L, null));
    }

    @Test
    void deveLancarExcecaoParaNomeVacinaVazio() {
        VacinacaoRequestDTO dto = new VacinacaoRequestDTO(
                "", LocalDate.of(2026, 8, 12),
                "5 mL", "Dr. João", null);

        assertThrows(ResponseStatusException.class, () -> vacinacaoService.registrar(1L, dto));
    }

    @Test
    void deveLancarExcecaoParaDoseVazia() {
        VacinacaoRequestDTO dto = new VacinacaoRequestDTO(
                "Febre Aftosa", LocalDate.of(2026, 8, 12),
                "  ", "Dr. João", null);

        assertThrows(ResponseStatusException.class, () -> vacinacaoService.registrar(1L, dto));
    }

    @Test
    void deveLancarExcecaoParaResponsavelNulo() {
        VacinacaoRequestDTO dto = new VacinacaoRequestDTO(
                "Febre Aftosa", LocalDate.of(2026, 8, 12),
                "5 mL", null, null);

        assertThrows(ResponseStatusException.class, () -> vacinacaoService.registrar(1L, dto));
    }

    @Test
    void deveLancarExcecaoParaDataAplicacaoNula() {
        VacinacaoRequestDTO dto = new VacinacaoRequestDTO(
                "Febre Aftosa", null,
                "5 mL", "Dr. João", null);

        assertThrows(ResponseStatusException.class, () -> vacinacaoService.registrar(1L, dto));
    }

    @Test
    void deveLancarExcecaoParaProximaDoseAnteriorAplicacao() {
        VacinacaoRequestDTO dto = new VacinacaoRequestDTO(
                "Febre Aftosa", LocalDate.of(2026, 8, 12),
                "5 mL", "Dr. João", LocalDate.of(2026, 1, 1));

        assertThrows(ResponseStatusException.class, () -> vacinacaoService.registrar(1L, dto));
    }

    @Test
    void deveRegistrarVacinacaoSemProximaDose() {
        VacinacaoRequestDTO dto = new VacinacaoRequestDTO(
                "Brucelose", LocalDate.of(2026, 3, 15),
                "2 mL", "Maria Técnica", null);

        Vacinacao vacSemProxima = new Vacinacao();
        vacSemProxima.setAnimal(animal);
        vacSemProxima.setNomeVacina("Brucelose");
        vacSemProxima.setDataAplicacao(LocalDate.of(2026, 3, 15));
        vacSemProxima.setDose("2 mL");
        vacSemProxima.setResponsavel("Maria Técnica");

        when(animalService.buscarDoUsuario(1L)).thenReturn(animal);
        when(vacinacaoRepository.save(any(Vacinacao.class))).thenReturn(vacSemProxima);

        VacinacaoResponseDTO resultado = vacinacaoService.registrar(1L, dto);

        assertNull(resultado.dataProximaDose());
    }

    @Test
    void deveListarHistoricoDeVacinacao() {
        when(animalService.buscarDoUsuario(1L)).thenReturn(animal);
        when(vacinacaoRepository.findByAnimalIdOrderByDataAplicacaoDescIdDesc(1L))
                .thenReturn(List.of(vacinacao));

        List<VacinacaoResponseDTO> resultado = vacinacaoService.listarHistorico(1L);

        assertEquals(1, resultado.size());
        assertEquals("Febre Aftosa", resultado.get(0).nomeVacina());
    }

    @Test
    void deveRetornarListaVaziaQuandoSemHistorico() {
        when(animalService.buscarDoUsuario(1L)).thenReturn(animal);
        when(vacinacaoRepository.findByAnimalIdOrderByDataAplicacaoDescIdDesc(1L))
                .thenReturn(List.of());

        List<VacinacaoResponseDTO> resultado = vacinacaoService.listarHistorico(1L);

        assertTrue(resultado.isEmpty());
    }

    @Test
    void deveListarProximasDoses() {
        when(animalService.buscarDoUsuario(1L)).thenReturn(animal);
        when(vacinacaoRepository.findByAnimalIdAndDataProximaDoseAfterOrderByDataProximaDoseAsc(
                eq(1L), any(LocalDate.class)))
                .thenReturn(List.of(vacinacao));

        List<VacinacaoResponseDTO> resultado = vacinacaoService.listarProximasDoses(1L);

        assertEquals(1, resultado.size());
        assertEquals(LocalDate.of(2026, 11, 12), resultado.get(0).dataProximaDose());
    }
}
