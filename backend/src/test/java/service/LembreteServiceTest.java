package service;

import dto.LembreteDTO;
import model.Animal;
import model.Tratamento;
import model.User;
import model.Vacinacao;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import repository.AnimalRepository;
import repository.TratamentoRepository;
import repository.VacinacaoRepository;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LembreteServiceTest {

    @Mock
    private AnimalRepository animalRepository;

    @Mock
    private VacinacaoRepository vacinacaoRepository;

    @Mock
    private TratamentoRepository tratamentoRepository;

    @Mock
    private UsuarioAutenticadoService usuarioAutenticadoService;

    @InjectMocks
    private LembreteService lembreteService;

    private User usuario;
    private Animal animal;

    @BeforeEach
    void setUp() {
        usuario = new User("Agricultor", "agri@fazenda.com", "hash", "USER");
        animal = new Animal();
        animal.setId(1L);
        animal.setCodigoIdentificacao("BOV-001");
        animal.setEspecie("Bovino");
        animal.setRaca("Nelore");
        animal.setProprietario(usuario);
    }

    @Test
    void deveObterLembretesOrdenadosCorretamente() {
        LocalDate hoje = LocalDate.now();

        Vacinacao vAtrasada = new Vacinacao();
        vAtrasada.setAnimal(animal);
        vAtrasada.setNomeVacina("Aftosa");
        vAtrasada.setDataProximaDose(hoje.minusDays(2));

        Tratamento tHoje = new Tratamento(
                animal, "Medicamento A", hoje, "Febre", "5ml", "obs", hoje
        );

        Vacinacao vProxima = new Vacinacao();
        vProxima.setAnimal(animal);
        vProxima.setNomeVacina("Raiva");
        vProxima.setDataProximaDose(hoje.plusDays(5));

        when(usuarioAutenticadoService.obterUsuario()).thenReturn(usuario);
        when(animalRepository.findByProprietario(usuario)).thenReturn(List.of(animal));
        when(vacinacaoRepository.findByAnimalIdOrderByDataAplicacaoDescIdDesc(1L)).thenReturn(List.of(vAtrasada, vProxima));
        when(tratamentoRepository.findByAnimalId(1L)).thenReturn(List.of(tHoje));

        List<LembreteDTO> resultado = lembreteService.obterLembretesDoUsuario();

        assertEquals(3, resultado.size());
        assertEquals("Atrasada", resultado.get(0).status());
        assertEquals("Aftosa", resultado.get(0).vacina());
        
        assertEquals("Hoje", resultado.get(1).status());
        assertEquals("Medicamento A", resultado.get(1).vacina());
        
        assertEquals("Próxima", resultado.get(2).status());
        assertEquals("Raiva", resultado.get(2).vacina());
    }
}
