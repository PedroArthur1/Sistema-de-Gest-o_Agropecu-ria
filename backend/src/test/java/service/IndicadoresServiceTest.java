package service;

import dto.DistribuicaoItemDTO;
import dto.IndicadoresRebanhoDTO;
import model.Animal;
import model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import repository.AnimalRepository;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class IndicadoresServiceTest {

    @Mock
    private AnimalRepository animalRepository;

    @Mock
    private UsuarioAutenticadoService usuarioAutenticadoService;

    @InjectMocks
    private IndicadoresService indicadoresService;

    private User usuario;

    @BeforeEach
    void setUp() {
        usuario = new User();
        when(usuarioAutenticadoService.obterUsuario()).thenReturn(usuario);
    }

    // ─── Testes de rebanho vazio ───────────────────────────────────────────────

    @Test
    void calcular_deveRetornarIndicadoresZerados_quandoNaoHaAnimais() {
        when(animalRepository.findByProprietario(usuario)).thenReturn(List.of());

        IndicadoresRebanhoDTO result = indicadoresService.calcular();

        assertEquals(0, result.totalAnimais());
        assertEquals(0.0, result.pesoMedio());
        assertEquals(0, result.totalMachos());
        assertEquals(0, result.totalFemeas());
        assertTrue(result.distribuicaoEspecie().isEmpty());
        assertTrue(result.distribuicaoRaca().isEmpty());
        assertTrue(result.distribuicaoSaude().isEmpty());
        assertTrue(result.distribuicaoIdade().isEmpty());
    }

    // ─── Testes de peso médio ──────────────────────────────────────────────────

    @Test
    void calcularPesoMedio_deveIgnorarNulosEZeros() {
        Animal comPeso = criarAnimal("Bovino", "Nelore", "Macho", "2020-01-01", 400.0, "Saudável");
        Animal semPeso = criarAnimal("Bovino", "Nelore", "Fêmea", "2021-01-01", null, "Saudável");
        Animal pesoZero = criarAnimal("Equino", "Quarto de Milha", "Macho", "2019-01-01", 0.0, "Saudável");

        double media = indicadoresService.calcularPesoMedio(List.of(comPeso, semPeso, pesoZero));

        assertEquals(400.0, media, 0.001);
    }

    @Test
    void calcularPesoMedio_deveRetornarZero_quandoTodosAnimaisSemPeso() {
        Animal semPeso1 = criarAnimal("Bovino", "Nelore", "Macho", "2020-01-01", null, "Saudável");
        Animal semPeso2 = criarAnimal("Bovino", "Angus", "Fêmea", "2021-01-01", 0.0, "Saudável");

        double media = indicadoresService.calcularPesoMedio(List.of(semPeso1, semPeso2));

        assertEquals(0.0, media, 0.001);
    }

    // ─── Testes de distribuição por sexo ──────────────────────────────────────

    @Test
    void contarPorSexo_deveSerInsensitiveCaseEIgnorarAcentos() {
        Animal m1 = criarAnimal("Bovino", "Nelore", "Macho",  "2020-01-01", 300.0, "Saudável");
        Animal m2 = criarAnimal("Bovino", "Nelore", "MACHO",  "2021-01-01", 350.0, "Saudável");
        // "Fêmea" com acento (como o formulário grava no banco)
        Animal f1 = criarAnimal("Bovino", "Angus",  "Fêmea",  "2022-01-01", 280.0, "Saudável");

        assertEquals(2, indicadoresService.contarPorSexo(List.of(m1, m2, f1), "MACHO"));
        // Deve encontrar "Fêmea" mesmo comparando com "FEMEA" (sem acento)
        assertEquals(1, indicadoresService.contarPorSexo(List.of(m1, m2, f1), "FEMEA"));
    }

    // ─── Testes de agrupamento por raça (top 6 + Outras) ─────────────────────

    @Test
    void agruparPor_deveAgruparRestanteComoOutras_quandoUltrapassarLimite() {
        List<Animal> animais = List.of(
                criarAnimal("Bovino", "Raça1", "Macho", "2020-01-01", 300.0, "Saudável"),
                criarAnimal("Bovino", "Raça2", "Macho", "2020-01-01", 300.0, "Saudável"),
                criarAnimal("Bovino", "Raça3", "Macho", "2020-01-01", 300.0, "Saudável"),
                criarAnimal("Bovino", "Raça4", "Macho", "2020-01-01", 300.0, "Saudável"),
                criarAnimal("Bovino", "Raça5", "Macho", "2020-01-01", 300.0, "Saudável"),
                criarAnimal("Bovino", "Raça6", "Macho", "2020-01-01", 300.0, "Saudável"),
                criarAnimal("Bovino", "Raça7", "Macho", "2020-01-01", 300.0, "Saudável")
        );

        List<DistribuicaoItemDTO> result = indicadoresService.agruparPor(animais, Animal::getRaca, 7, 6);

        assertEquals(7, result.size()); // 6 top + "Outras"
        assertEquals("Outras", result.get(result.size() - 1).nome());
        assertEquals(1, result.get(result.size() - 1).total());
    }

    @Test
    void agruparPor_naoDeveAdicionarOutras_quandoExatamenteLimite() {
        List<Animal> animais = List.of(
                criarAnimal("Bovino", "Raça1", "Macho", "2020-01-01", 300.0, "Saudável"),
                criarAnimal("Bovino", "Raça2", "Macho", "2020-01-01", 300.0, "Saudável")
        );

        List<DistribuicaoItemDTO> result = indicadoresService.agruparPor(animais, Animal::getRaca, 2, 6);

        assertEquals(2, result.size());
        assertTrue(result.stream().noneMatch(i -> "Outras".equals(i.nome())));
    }

    // ─── Testes de faixas etárias ─────────────────────────────────────────────

    @Test
    void calcularFaixasEtarias_deveClassificarCorretamente() {
        // Jovem: nascido há 6 meses
        String dataJovem = java.time.LocalDate.now().minusMonths(6).toString();
        // Adulto: nascido há 3 anos
        String dataAdulto = java.time.LocalDate.now().minusYears(3).toString();
        // Idoso: nascido há 8 anos
        String dataIdoso = java.time.LocalDate.now().minusYears(8).toString();

        List<Animal> animais = List.of(
                criarAnimal("Bovino", "Nelore", "Macho", dataJovem,  300.0, "Saudável"),
                criarAnimal("Bovino", "Angus",  "Fêmea", dataAdulto, 350.0, "Saudável"),
                criarAnimal("Equino", "Manga Larga", "Macho", dataIdoso, 450.0, "Saudável")
        );

        List<DistribuicaoItemDTO> result = indicadoresService.calcularFaixasEtarias(animais, 3);

        assertEquals(3, result.size());
        assertTrue(result.stream().anyMatch(i -> "Jovem (< 1 ano)".equals(i.nome()) && i.total() == 1));
        assertTrue(result.stream().anyMatch(i -> "Adulto (1-5 anos)".equals(i.nome()) && i.total() == 1));
        assertTrue(result.stream().anyMatch(i -> "Idoso (> 5 anos)".equals(i.nome()) && i.total() == 1));
    }

    @Test
    void calcularFaixasEtarias_deveClassificarComoNaoInformado_quandoDataInvalida() {
        Animal animal = criarAnimal("Bovino", "Nelore", "Macho", "data-invalida", 300.0, "Saudável");
        Animal semData = criarAnimal("Bovino", "Angus",  "Fêmea", null, 300.0, "Saudável");

        List<DistribuicaoItemDTO> result = indicadoresService.calcularFaixasEtarias(List.of(animal, semData), 2);

        assertEquals(1, result.size());
        assertEquals("Não informado", result.get(0).nome());
        assertEquals(2, result.get(0).total());
    }

    // ─── Teste de integração do método principal ──────────────────────────────

    @Test
    void calcular_deveRetornarIndicadoresCompletos_quandoHaAnimais() {
        String dataAdulto = java.time.LocalDate.now().minusYears(3).toString();
        List<Animal> animais = List.of(
                criarAnimal("Bovino", "Nelore", "Macho",  dataAdulto, 400.0, "Saudável"),
                criarAnimal("Bovino", "Nelore", "Fêmea",  dataAdulto, 350.0, "Saudável"),
                criarAnimal("Equino", "Manga Larga", "Macho", dataAdulto, 450.0, "Em tratamento")
        );
        when(animalRepository.findByProprietario(usuario)).thenReturn(animais);

        IndicadoresRebanhoDTO result = indicadoresService.calcular();

        assertEquals(3, result.totalAnimais());
        // (400 + 350 + 450) / 3 = 400.0
        assertEquals(400.0, result.pesoMedio(), 0.001);
        assertEquals(2, result.totalMachos());
        assertEquals(1, result.totalFemeas());
        assertFalse(result.distribuicaoEspecie().isEmpty());
        assertFalse(result.distribuicaoRaca().isEmpty());
        assertFalse(result.distribuicaoSaude().isEmpty());
        assertFalse(result.distribuicaoIdade().isEmpty());
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private Animal criarAnimal(String especie, String raca, String sexo, String data, Double peso, String saude) {
        Animal a = new Animal();
        a.setEspecie(especie);
        a.setRaca(raca);
        a.setSexo(sexo);
        a.setDataNascimentoOuIdade(data);
        a.setPeso(peso);
        a.setCondicaoSaude(saude);
        return a;
    }
}
