package service;

import dto.AnimalDTO;
import model.Animal;
import model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import repository.AnimalRepository;
import repository.GrupoRebanhoRepository;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AnimalServiceTest {

    @Mock
    private AnimalRepository animalRepository;

    @Mock
    private GrupoRebanhoRepository grupoRebanhoRepository;

    @Mock
    private UsuarioAutenticadoService usuarioAutenticadoService;

    @InjectMocks
    private AnimalService animalService;

    private User usuario;
    private Animal animal;

    @BeforeEach
    void setUp() {
        usuario = new User("Agricultor", "agri@fazenda.com", "hash", "USER");

        animal = new Animal();
        animal.setCodigoIdentificacao("BOV-001");
        animal.setEspecie("Bovino");
        animal.setRaca("Nelore");
        animal.setSexo("MACHO");
        animal.setDataNascimentoOuIdade("2 anos");
        animal.setPeso(450.0);
        animal.setCondicaoSaude("Saudável");
        animal.setProprietario(usuario);
    }

    @Test
    void deveCadastrarAnimalComSucesso() {
        AnimalDTO dto = new AnimalDTO(null, "BOV-001", "Bovino", "Nelore", "MACHO",
                "2 anos", 450.0, "Saudável", null, null, null);

        when(usuarioAutenticadoService.obterUsuario()).thenReturn(usuario);
        when(animalRepository.save(any(Animal.class))).thenReturn(animal);

        AnimalDTO resultado = animalService.cadastrar(dto);

        assertNotNull(resultado);
        assertEquals("BOV-001", resultado.codigoIdentificacao());
        assertEquals("Bovino", resultado.especie());
        verify(animalRepository).save(any(Animal.class));
    }

    @Test
    void deveLancarExcecaoQuandoCodigoIdentificacaoJaExiste() {
        AnimalDTO dto = new AnimalDTO(null, "BOV-001", "Bovino", "Nelore", "MACHO",
                "2 anos", 450.0, "Saudável", null, null, null);

        when(usuarioAutenticadoService.obterUsuario()).thenReturn(usuario);
        when(animalRepository.existsByCodigoIdentificacaoAndProprietario("BOV-001", usuario)).thenReturn(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> animalService.cadastrar(dto));
        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        assertTrue(ex.getReason().contains("Já existe um animal cadastrado com o código"));
    }

    @Test
    void deveLancarExcecaoParaDtoNulo() {
        assertThrows(ResponseStatusException.class, () -> animalService.cadastrar(null));
    }

    @Test
    void deveLancarExcecaoParaCodigoVazio() {
        AnimalDTO dto = new AnimalDTO(null, "", "Bovino", "Nelore", "MACHO",
                "2 anos", 450.0, "Saudável", null, null, null);

        assertThrows(ResponseStatusException.class, () -> animalService.cadastrar(dto));
    }

    @Test
    void deveLancarExcecaoParaEspecieVazia() {
        AnimalDTO dto = new AnimalDTO(null, "BOV-001", "", "Nelore", "MACHO",
                "2 anos", 450.0, "Saudável", null, null, null);

        assertThrows(ResponseStatusException.class, () -> animalService.cadastrar(dto));
    }

    @Test
    void deveLancarExcecaoParaRacaVazia() {
        AnimalDTO dto = new AnimalDTO(null, "BOV-001", "Bovino", "", "MACHO",
                "2 anos", 450.0, "Saudável", null, null, null);

        assertThrows(ResponseStatusException.class, () -> animalService.cadastrar(dto));
    }

    @Test
    void deveLancarExcecaoParaSexoNulo() {
        AnimalDTO dto = new AnimalDTO(null, "BOV-001", "Bovino", "Nelore", null,
                "2 anos", 450.0, "Saudável", null, null, null);

        assertThrows(ResponseStatusException.class, () -> animalService.cadastrar(dto));
    }

    @Test
    void deveLancarExcecaoParaDataNascimentoVazia() {
        AnimalDTO dto = new AnimalDTO(null, "BOV-001", "Bovino", "Nelore", "MACHO",
                "  ", 450.0, "Saudável", null, null, null);

        assertThrows(ResponseStatusException.class, () -> animalService.cadastrar(dto));
    }

    @Test
    void deveLancarExcecaoParaPesoNulo() {
        AnimalDTO dto = new AnimalDTO(null, "BOV-001", "Bovino", "Nelore", "MACHO",
                "2 anos", null, "Saudável", null, null, null);

        assertThrows(ResponseStatusException.class, () -> animalService.cadastrar(dto));
    }

    @Test
    void deveLancarExcecaoParaPesoNegativo() {
        AnimalDTO dto = new AnimalDTO(null, "BOV-001", "Bovino", "Nelore", "MACHO",
                "2 anos", -10.0, "Saudável", null, null, null);

        assertThrows(ResponseStatusException.class, () -> animalService.cadastrar(dto));
    }

    @Test
    void deveLancarExcecaoParaCondicaoSaudeVazia() {
        AnimalDTO dto = new AnimalDTO(null, "BOV-001", "Bovino", "Nelore", "MACHO",
                "2 anos", 450.0, "", null, null, null);

        assertThrows(ResponseStatusException.class, () -> animalService.cadastrar(dto));
    }

    @Test
    void deveListarAnimaisDoUsuario() {
        when(usuarioAutenticadoService.obterUsuario()).thenReturn(usuario);
        when(animalRepository.findByProprietario(usuario)).thenReturn(List.of(animal));

        List<AnimalDTO> resultado = animalService.listarDoUsuario();

        assertEquals(1, resultado.size());
        assertEquals("BOV-001", resultado.get(0).codigoIdentificacao());
    }

    @Test
    void deveRetornarListaVaziaQuandoSemAnimais() {
        when(usuarioAutenticadoService.obterUsuario()).thenReturn(usuario);
        when(animalRepository.findByProprietario(usuario)).thenReturn(List.of());

        List<AnimalDTO> resultado = animalService.listarDoUsuario();

        assertTrue(resultado.isEmpty());
    }

    @Test
    void deveBuscarAnimalDoUsuarioComSucesso() {
        when(usuarioAutenticadoService.obterUsuario()).thenReturn(usuario);
        when(animalRepository.findByIdAndProprietario(1L, usuario)).thenReturn(Optional.of(animal));

        AnimalDTO resultado = animalService.buscarDoUsuarioComoDTO(1L);

        assertNotNull(resultado);
        assertEquals("BOV-001", resultado.codigoIdentificacao());
    }

    @Test
    void deveLancarExcecaoQuandoAnimalNaoEncontrado() {
        when(usuarioAutenticadoService.obterUsuario()).thenReturn(usuario);
        when(animalRepository.findByIdAndProprietario(99L, usuario)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> animalService.buscarDoUsuario(99L));
    }

    @Test
    void deveCadastrarAnimalComObservacoes() {
        AnimalDTO dto = new AnimalDTO(null, "BOV-002", "Bovino", "Gir", "FEMEA", "3 anos", 380.0, "Em Observação", "Animal gestante", null, null);

        when(usuarioAutenticadoService.obterUsuario()).thenReturn(usuario);

        Animal animalComObs = new Animal();
        animalComObs.setCodigoIdentificacao("BOV-002");
        animalComObs.setEspecie("Bovino");
        animalComObs.setRaca("Gir");
        animalComObs.setSexo("FEMEA");
        animalComObs.setDataNascimentoOuIdade("3 anos");
        animalComObs.setPeso(380.0);
        animalComObs.setCondicaoSaude("Em Observação");
        animalComObs.setObservacoes("Animal gestante");
        animalComObs.setProprietario(usuario);

        when(animalRepository.save(any(Animal.class))).thenReturn(animalComObs);

        AnimalDTO resultado = animalService.cadastrar(dto);

        assertEquals("Animal gestante", resultado.observacoes());
    }

    @Test
    void deveAtualizarAnimalComSucesso() {
        AnimalDTO dtoAtualizacao = new AnimalDTO(1L, "BOV-001", "Bovino", "Angus", "MACHO", "3 anos", 500.0, "Em Tratamento", "Tratamento de casco", null, null);

        when(usuarioAutenticadoService.obterUsuario()).thenReturn(usuario);
        when(animalRepository.findByIdAndProprietario(1L, usuario)).thenReturn(Optional.of(animal));
        when(animalRepository.save(any(Animal.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AnimalDTO resultado = animalService.atualizar(1L, dtoAtualizacao);

        assertNotNull(resultado);
        assertEquals("BOV-001", resultado.codigoIdentificacao());
        assertEquals("Angus", resultado.raca());
        assertEquals(500.0, resultado.peso());
        assertEquals("Em Tratamento", resultado.condicaoSaude());
        assertEquals("Tratamento de casco", resultado.observacoes());
        verify(animalRepository).save(animal);
    }

    @Test
    void deveLancarExcecaoAoTentarAlterarCodigoIdentificacao() {
        AnimalDTO dtoAtualizacao = new AnimalDTO(1L, "BOV-999", "Bovino", "Nelore", "MACHO",
                "2 anos", 450.0, "Saudável", null, null, null);

        when(usuarioAutenticadoService.obterUsuario()).thenReturn(usuario);
        when(animalRepository.findByIdAndProprietario(1L, usuario)).thenReturn(Optional.of(animal));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> animalService.atualizar(1L, dtoAtualizacao));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertTrue(ex.getReason().contains("código de identificação não pode ser alterado"));
    }

    @Test
    void deveLancarExcecaoAoEditarAnimalDeOutroUsuario() {
        AnimalDTO dtoAtualizacao = new AnimalDTO(99L, "BOV-001", "Bovino", "Nelore", "MACHO",
                "2 anos", 450.0, "Saudável", null, null, null);

        when(usuarioAutenticadoService.obterUsuario()).thenReturn(usuario);
        when(animalRepository.findByIdAndProprietario(99L, usuario)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> animalService.atualizar(99L, dtoAtualizacao));
    }

    @Test
    void deveLancarExcecaoAoEditarComDadosInvalidos() {
        AnimalDTO dtoInvalido = new AnimalDTO(1L, "BOV-001", "Bovino", "", "MACHO",
                "2 anos", -50.0, "Saudável", null, null, null);

        when(usuarioAutenticadoService.obterUsuario()).thenReturn(usuario);
        when(animalRepository.findByIdAndProprietario(1L, usuario)).thenReturn(Optional.of(animal));

        assertThrows(ResponseStatusException.class, () -> animalService.atualizar(1L, dtoInvalido));
    }

    @Test
    void deveDeletarAnimalComSucesso() {
        when(usuarioAutenticadoService.obterUsuario()).thenReturn(usuario);
        when(animalRepository.findByIdAndProprietario(1L, usuario)).thenReturn(Optional.of(animal));

        animalService.deletar(1L);

        verify(animalRepository).delete(animal);
    }

    @Test
    void deveLancarExcecaoAoDeletarAnimalDeOutroUsuario() {
        when(usuarioAutenticadoService.obterUsuario()).thenReturn(usuario);
        when(animalRepository.findByIdAndProprietario(99L, usuario)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> animalService.deletar(99L));
        verify(animalRepository, never()).delete(any());
    }
}
