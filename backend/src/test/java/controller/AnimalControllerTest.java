package controller;

import com.fasterxml.jackson.databind.JsonNode;
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

import java.util.UUID;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = com.example.demo.DemoApplication.class)
class AnimalControllerTest {

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

        String email = "agricultor-" + UUID.randomUUID() + "@fazenda.com";
        cadastrarUsuario(email, senha);
        token = autenticar(email, senha);
    }

    @Test
    void deveRetornarDadosDoAnimalDoAgricultorAutenticado() throws Exception {
        Long animalId = cadastrarAnimal(token);

        mockMvc.perform(get("/animais/{id}", animalId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(animalId))
                .andExpect(jsonPath("$.codigoIdentificacao").value("BOV-001"))
                .andExpect(jsonPath("$.especie").value("Bovino"))
                .andExpect(jsonPath("$.raca").value("Nelore"))
                .andExpect(jsonPath("$.sexo").value("MACHO"))
                .andExpect(jsonPath("$.peso").value(450.0))
                .andExpect(jsonPath("$.condicaoSaude").value("Saudável"));
    }

    @Test
    void deveRetornar404ParaAnimalInexistente() throws Exception {
        mockMvc.perform(get("/animais/{id}", 99999)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }

    @Test
    void deveRetornar404ParaAnimalDeOutroAgricultor() throws Exception {
        Long animalId = cadastrarAnimal(token);

        String outroEmail = "outro-" + UUID.randomUUID() + "@fazenda.com";
        cadastrarUsuario(outroEmail, senha);
        String tokenOutro = autenticar(outroEmail, senha);

        mockMvc.perform(get("/animais/{id}", animalId)
                        .header("Authorization", "Bearer " + tokenOutro))
                .andExpect(status().isNotFound());
    }

    @Test
    void deveRetornarProximasDosesPrevistas() throws Exception {
        Long animalId = cadastrarAnimal(token);

        // Registra vacinação com próxima dose no futuro
        registrarVacinacao(animalId, token, """
                {
                  "nomeVacina": "Febre Aftosa",
                  "dataAplicacao": "2026-01-10",
                  "dose": "5 mL",
                  "responsavel": "Dr. João Veterinário",
                  "dataProximaDose": "2028-06-10"
                }
                """);

        // Registra vacinação sem próxima dose
        registrarVacinacao(animalId, token, """
                {
                  "nomeVacina": "Brucelose",
                  "dataAplicacao": "2026-03-15",
                  "dose": "2 mL",
                  "responsavel": "Maria Técnica",
                  "dataProximaDose": null
                }
                """);

        mockMvc.perform(get("/animais/{animalId}/vacinacoes/proximas", animalId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].nomeVacina").value("Febre Aftosa"))
                .andExpect(jsonPath("$[0].dataProximaDose").value("2028-06-10"));
    }

    @Test
    void naoDevePermitirConsultaSemAutenticacao() throws Exception {
        mockMvc.perform(get("/animais/{id}", 1))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void deveAtualizarAnimalComSucesso() throws Exception {
        Long animalId = cadastrarAnimal(token);

        AnimalDTO dtoAtualizado = new AnimalDTO(animalId, "BOV-001", "Bovino", "Angus", "MACHO", "3 anos", 520.0, "Em Tratamento", "Observação atualizada", null, null);

        mockMvc.perform(put("/animais/{id}", animalId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dtoAtualizado)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(animalId))
                .andExpect(jsonPath("$.raca").value("Angus"))
                .andExpect(jsonPath("$.peso").value(520.0))
                .andExpect(jsonPath("$.condicaoSaude").value("Em Tratamento"))
                .andExpect(jsonPath("$.observacoes").value("Observação atualizada"));
    }

    @Test
    void deveRetornar400AoTentarAlterarCodigoIdentificacao() throws Exception {
        Long animalId = cadastrarAnimal(token);

        AnimalDTO dtoComCodigoDiferente = new AnimalDTO(animalId, "BOV-999", "Bovino", "Nelore", "MACHO", "2 anos", 450.0, "Saudável", null, null, null);

        mockMvc.perform(put("/animais/{id}", animalId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dtoComCodigoDiferente)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deveRetornar404AoTentarAtualizarAnimalDeOutroAgricultor() throws Exception {
        Long animalId = cadastrarAnimal(token);

        String outroEmail = "outro-" + UUID.randomUUID() + "@fazenda.com";
        cadastrarUsuario(outroEmail, senha);
        String tokenOutro = autenticar(outroEmail, senha);

        AnimalDTO dtoAtualizado = new AnimalDTO(animalId, "BOV-001", "Bovino", "Nelore", "MACHO", "2 anos", 480.0, "Saudável", null, null, null);

        mockMvc.perform(put("/animais/{id}", animalId)
                        .header("Authorization", "Bearer " + tokenOutro)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dtoAtualizado)))
                .andExpect(status().isNotFound());
    }

    // ---- Métodos auxiliares ----

    private void cadastrarUsuario(String emailUsuario, String senhaUsuario) throws Exception {
        UserDTO userDTO = new UserDTO("Agricultor Teste", emailUsuario, senhaUsuario, "USER");
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
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode json = objectMapper.readTree(resposta);
        return json.get("token").asText();
    }

    private Long cadastrarAnimal(String tokenUsuario) throws Exception {
        AnimalDTO animalDTO = new AnimalDTO(null, "BOV-001", "Bovino", "Nelore", "MACHO", "2 anos", 450.0, "Saudável", null, null, null);

        String resposta = mockMvc.perform(post("/animais")
                        .header("Authorization", "Bearer " + tokenUsuario)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(animalDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return objectMapper.readTree(resposta).get("id").asLong();
    }

    private void registrarVacinacao(Long animalId, String tokenUsuario, String corpo) throws Exception {
        mockMvc.perform(post("/animais/{animalId}/vacinacoes", animalId)
                        .header("Authorization", "Bearer " + tokenUsuario)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isCreated());
    }
}
