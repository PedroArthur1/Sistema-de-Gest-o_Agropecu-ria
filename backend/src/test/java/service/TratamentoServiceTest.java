package service;

import dto.TratamentoRequestDTO;
import dto.TratamentoResponseDTO;
import model.Animal;
import model.Tratamento;
import model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;
import repository.TratamentoRepository;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TratamentoServiceTest {

    @Mock
    private TratamentoRepository tratamentoRepository;

    @Mock
    private AnimalService animalService;

    @InjectMocks
    private TratamentoService tratamentoService;

    private Animal animal;
    private Tratamento tratamento;

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

        tratamento = new Tratamento(
                animal, "Ivermectina",
                LocalDate.of(2026, 8, 15),
                "Parasitas intestinais",
                "10 mL", "Aplicação subcutânea"
        );
        tratamento.setId(1L);
    }

    @Test
    void deveRegistrarTratamentoComSucesso() {
        TratamentoRequestDTO dto = new TratamentoRequestDTO(
                1L, "Ivermectina",
                LocalDate.of(2026, 8, 15),
                "Parasitas intestinais",
                "10 mL", "Aplicação subcutânea"
        );

        when(animalService.buscarDoUsuario(1L)).thenReturn(animal);
        when(tratamentoRepository.save(any(Tratamento.class))).thenReturn(tratamento);

        TratamentoResponseDTO resultado = tratamentoService.registrarTratamento(dto);

        assertNotNull(resultado);
        assertEquals("Ivermectina", resultado.medicamento());
        assertEquals("Parasitas intestinais", resultado.motivo());
        assertEquals("10 mL", resultado.dosagem());
        verify(tratamentoRepository).save(any(Tratamento.class));
    }

    @Test
    void deveLancarExcecaoParaAnimalInexistente() {
        TratamentoRequestDTO dto = new TratamentoRequestDTO(
                99L, "Ivermectina",
                LocalDate.of(2026, 8, 15),
                "Parasitas", "10 mL", null
        );

        when(animalService.buscarDoUsuario(99L))
                .thenThrow(new ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND));

        assertThrows(ResponseStatusException.class,
                () -> tratamentoService.registrarTratamento(dto));
    }

    @Test
    void deveListarTratamentosPorAnimal() {
        when(animalService.buscarDoUsuario(1L)).thenReturn(animal);
        when(tratamentoRepository.findByAnimalId(1L)).thenReturn(List.of(tratamento));

        List<TratamentoResponseDTO> resultado = tratamentoService.listarPorAnimal(1L);

        assertEquals(1, resultado.size());
        assertEquals("Ivermectina", resultado.get(0).medicamento());
    }

    @Test
    void deveRetornarListaVaziaQuandoSemTratamentos() {
        when(animalService.buscarDoUsuario(1L)).thenReturn(animal);
        when(tratamentoRepository.findByAnimalId(1L)).thenReturn(List.of());

        List<TratamentoResponseDTO> resultado = tratamentoService.listarPorAnimal(1L);

        assertTrue(resultado.isEmpty());
    }

    @Test
    void deveRegistrarTratamentoSemDosagemEObservacoes() {
        TratamentoRequestDTO dto = new TratamentoRequestDTO(
                1L, "Antibiótico",
                LocalDate.of(2026, 8, 20),
                "Infecção cutânea",
                null, null
        );

        Tratamento tratSemExtras = new Tratamento(
                animal, "Antibiótico",
                LocalDate.of(2026, 8, 20),
                "Infecção cutânea", null, null
        );
        tratSemExtras.setId(2L);

        when(animalService.buscarDoUsuario(1L)).thenReturn(animal);
        when(tratamentoRepository.save(any(Tratamento.class))).thenReturn(tratSemExtras);

        TratamentoResponseDTO resultado = tratamentoService.registrarTratamento(dto);

        assertNotNull(resultado);
        assertNull(resultado.dosagem());
        assertNull(resultado.observacoes());
        assertNull(resultado.consultaId());
    }

    @Test
    void deveMapearConsultaIdQuandoVinculado() {
        model.Consulta consulta = new model.Consulta();
        consulta.setId(5L);
        tratamento.setConsulta(consulta);

        when(animalService.buscarDoUsuario(1L)).thenReturn(animal);
        when(tratamentoRepository.findByAnimalId(1L)).thenReturn(List.of(tratamento));

        List<TratamentoResponseDTO> resultado = tratamentoService.listarPorAnimal(1L);

        assertEquals(1, resultado.size());
        assertEquals(5L, resultado.get(0).consultaId());
    }
}
