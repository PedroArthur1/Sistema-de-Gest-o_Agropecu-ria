package controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import dto.AnimalDTO;
import dto.AuthDTO;
import dto.UserDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.List;
import java.util.UUID;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = com.example.demo.DemoApplication.class)
class AlimentacaoControllerTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private MockMvc mockMvc;
    private String token;
    private final String senha = "senha123";

    @BeforeEach
    void setUp() throws Exception {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();

        String email = "alimentacao-" + UUID.randomUUID() + "@fazenda.com";
        cadastrarUsuario(email, senha);
        token = autenticar(email, senha);
    }

    @Test
    void deveRegistrarAlimentacaoComSucesso() throws Exception {
        Long animalId = cadastrarAnimal(token);
        Long tipoAlimentoId = cadastrarTipoAlimento(token, "Silagem de Milho");

        mockMvc.perform(post("/alimentacoes")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "animalIds": [%d],
                                  "tipoAlimentoId": %d,
                                  "quantidade": "20 kg",
                                  "data": "2026-08-26",
                                  "observacoes": "Trato da manhã"
                                }
                                """.formatted(animalId, tipoAlimentoId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.tipoAlimento.nome").value("Silagem de Milho"))
                .andExpect(jsonPath("$.quantidade").value("20 kg"));
    }

    @Test
    void deveListarTodasAsAlimentacoesDoUsuario() throws Exception {
        Long animalId = cadastrarAnimal(token);
        Long tipoAlimentoId = cadastrarTipoAlimento(token, "Ração Concentrada");

        registrarAlimentacao(List.of(animalId), tipoAlimentoId, token, "5 kg");

        mockMvc.perform(get("/alimentacoes")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].tipoAlimento.nome").value("Ração Concentrada"));
    }

    @Test
    void deveListarAlimentacaoPorAnimal() throws Exception {
        Long animalId = cadastrarAnimal(token);
        Long tipoAlimentoId = cadastrarTipoAlimento(token, "Feno");

        registrarAlimentacao(List.of(animalId), tipoAlimentoId, token, "10 kg");

        mockMvc.perform(get("/alimentacoes/animal/{animalId}", animalId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void naoDeveAcessarAlimentacoesSemAutenticacao() throws Exception {
        mockMvc.perform(get("/alimentacoes"))
                .andExpect(status().isUnauthorized());
    }

    // ---- Métodos auxiliares ----

    private void cadastrarUsuario(String emailUsuario, String senhaUsuario) throws Exception {
        UserDTO userDTO = new UserDTO("Produtor Teste", emailUsuario, senhaUsuario, "USER");
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userDTO)))
                .andExpect(status().isCreated());
    }

    private String autenticar(String emailUsuario, String senhaUsuario) throws Exception {
        AuthDTO authDTO = new AuthDTO(emailUsuario, senhaUsuario);
        String resposta = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(authDTO)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        return objectMapper.readTree(resposta).get("token").asText();
    }

    private Long cadastrarAnimal(String tokenUsuario) throws Exception {
        AnimalDTO animalDTO = new AnimalDTO(
                null, "ALIM-" + UUID.randomUUID().toString().substring(0, 5), "Bovino", "Nelore", "MACHO",
                "2 anos", 450.0, "Excelente", null
        );

        String resposta = mockMvc.perform(post("/animais")
                        .header("Authorization", "Bearer " + tokenUsuario)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(animalDTO)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        return objectMapper.readTree(resposta).get("id").asLong();
    }

    private Long cadastrarTipoAlimento(String tokenUsuario, String nome) throws Exception {
        String resposta = mockMvc.perform(post("/tipos-alimento")
                        .header("Authorization", "Bearer " + tokenUsuario)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nome": "%s"
                                }
                                """.formatted(nome)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        
        return objectMapper.readTree(resposta).get("id").asLong();
    }

    private void registrarAlimentacao(List<Long> animalIds, Long tipoAlimentoId, String tokenUsuario, String qtd) throws Exception {
        mockMvc.perform(post("/alimentacoes")
                        .header("Authorization", "Bearer " + tokenUsuario)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "animalIds": %s,
                                  "tipoAlimentoId": %d,
                                  "quantidade": "%s",
                                  "data": "2026-08-26",
                                  "observacoes": null
                                }
                                """.formatted(animalIds.toString(), tipoAlimentoId, qtd)))
                .andExpect(status().isCreated());
    }
}
