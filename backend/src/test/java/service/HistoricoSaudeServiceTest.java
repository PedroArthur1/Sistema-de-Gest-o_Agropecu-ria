package service;

import dto.HistoricoSaudeResumoDTO;
import model.Animal;
import model.Consulta;
import model.Tratamento;
import model.User;
import model.Vacinacao;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import repository.ConsultaRepository;
import repository.TratamentoRepository;
import repository.VacinacaoRepository;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HistoricoSaudeServiceTest {

    @Mock
    private AnimalService animalService;

    @Mock
    private VacinacaoRepository vacinacaoRepository;

    @Mock
    private TratamentoRepository tratamentoRepository;

    @Mock
    private ConsultaRepository consultaRepository;

    @InjectMocks
    private HistoricoSaudeService historicoSaudeService;

    private Animal animal;
    private User usuario;

    @BeforeEach
    void setUp() {
        usuario = new User("Agricultor", "agri@fazenda.com", "hash", "USER");
        animal = new Animal();
        animal.setId(1L);
        animal.setCodigoIdentificacao("BOV-001");
        animal.setEspecie("Bovino");
        animal.setRaca("Nelore");
        animal.setSexo("MACHO");
        animal.setProprietario(usuario);
    }

    @Test
    void deveBuscarHistoricoConsolidadoOrdenadoCronologicamenteComSucesso() {
        Vacinacao v1 = new Vacinacao();
        v1.setId(10L);
        v1.setAnimal(animal);
        v1.setNomeVacina("Febre Aftosa");
        v1.setDataAplicacao(LocalDate.of(2026, 8, 10));
        v1.setDose("1ª Dose");
        v1.setResponsavel("Carlos");
        v1.setDataProximaDose(LocalDate.of(2027, 2, 10));

        Tratamento t1 = new Tratamento(
                animal,
                "Antibiótico X",
                LocalDate.of(2026, 8, 25),
                "Infecção respiratória",
                "10ml",
                "Aplicação intramuscular",
                LocalDate.of(2026, 9, 1)
        );
        t1.setId(20L);

        Consulta c1 = new Consulta(
                animal,
                LocalDate.of(2026, 8, 15),
                "Rotina",
                "Dra. Camila",
                "Início de quadro respiratório",
                "Indicar antibiótico"
        );
        c1.setId(30L);
        t1.setConsulta(c1);

        when(animalService.buscarDoUsuario(1L)).thenReturn(animal);
        when(vacinacaoRepository.findByAnimalIdOrderByDataAplicacaoDescIdDesc(1L)).thenReturn(List.of(v1));
        when(tratamentoRepository.findByAnimalId(1L)).thenReturn(List.of(t1));
        when(consultaRepository.findByAnimalIdOrderByDataConsultaDesc(1L)).thenReturn(List.of(c1));

        HistoricoSaudeResumoDTO resumo = historicoSaudeService.buscarHistoricoConsolidado(1L);

        assertNotNull(resumo);
        assertEquals(1L, resumo.animalId());
        assertEquals("BOV-001", resumo.codigoAnimal());
        assertEquals(3, resumo.totalEventos());
        assertEquals(1, resumo.totalVacinas());
        assertEquals(1, resumo.totalTratamentos());
        assertEquals(1, resumo.totalConsultas());
        assertEquals(3, resumo.eventos().size());

        // Deve estar ordenado em ordem decrescente de data:
        // 1º: Tratamento em 2026-08-25
        // 2º: Consulta em 2026-08-15
        // 3º: Vacinação em 2026-08-10
        assertEquals("TRATAMENTO", resumo.eventos().get(0).tipo());
        assertEquals(LocalDate.of(2026, 8, 25), resumo.eventos().get(0).data());
        assertEquals("Antibiótico X", resumo.eventos().get(0).titulo());
        assertEquals("Dra. Camila", resumo.eventos().get(0).responsavel());

        assertEquals("CONSULTA", resumo.eventos().get(1).tipo());
        assertEquals(LocalDate.of(2026, 8, 15), resumo.eventos().get(1).data());
        assertEquals("Rotina", resumo.eventos().get(1).titulo());

        assertEquals("VACINACAO", resumo.eventos().get(2).tipo());
        assertEquals(LocalDate.of(2026, 8, 10), resumo.eventos().get(2).data());
        assertEquals("Febre Aftosa", resumo.eventos().get(2).titulo());
    }

    @Test
    void deveRetornarHistoricoVazioQuandoAnimalNaoPossuiEventos() {
        when(animalService.buscarDoUsuario(1L)).thenReturn(animal);
        when(vacinacaoRepository.findByAnimalIdOrderByDataAplicacaoDescIdDesc(1L)).thenReturn(Collections.emptyList());
        when(tratamentoRepository.findByAnimalId(1L)).thenReturn(Collections.emptyList());
        when(consultaRepository.findByAnimalIdOrderByDataConsultaDesc(1L)).thenReturn(Collections.emptyList());

        HistoricoSaudeResumoDTO resumo = historicoSaudeService.buscarHistoricoConsolidado(1L);

        assertNotNull(resumo);
        assertEquals(0, resumo.totalEventos());
        assertEquals(0, resumo.totalVacinas());
        assertEquals(0, resumo.totalTratamentos());
        assertEquals(0, resumo.totalConsultas());
        assertTrue(resumo.eventos().isEmpty());
    }

    @Test
    void deveLancarExcecaoQuandoAnimalNaoPertencerAoUsuario() {
        when(animalService.buscarDoUsuario(99L)).thenThrow(
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Animal não encontrado")
        );

        assertThrows(ResponseStatusException.class, () -> historicoSaudeService.buscarHistoricoConsolidado(99L));
        verifyNoInteractions(vacinacaoRepository, tratamentoRepository, consultaRepository);
    }
}
