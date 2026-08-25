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

import java.util.UUID;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = com.example.demo.DemoApplication.class)
class TratamentoControllerTest {

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

        String email = "tratamento-" + UUID.randomUUID() + "@fazenda.com";
        cadastrarUsuario(email, senha);
        token = autenticar(email, senha);
    }

    @Test
    void deveRegistrarTratamentoComSucesso() throws Exception {
        Long animalId = cadastrarAnimal(token);

        mockMvc.perform(post("/tratamentos")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "animalId": %d,
                                  "medicamento": "Ivermectina",
                                  "data": "2026-08-15",
                                  "motivo": "Parasitas intestinais",
                                  "dosagem": "10 mL",
                                  "observacoes": "Aplicação subcutânea"
                                }
                                """.formatted(animalId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.animalId").value(animalId))
                .andExpect(jsonPath("$.medicamento").value("Ivermectina"))
                .andExpect(jsonPath("$.motivo").value("Parasitas intestinais"))
                .andExpect(jsonPath("$.dosagem").value("10 mL"));
    }

    @Test
    void deveListarTratamentosPorAnimal() throws Exception {
        Long animalId = cadastrarAnimal(token);

        registrarTratamento(animalId, token, "Ivermectina", "Parasitas");
        registrarTratamento(animalId, token, "Antibiótico", "Infecção");

        mockMvc.perform(get("/tratamentos/animal/{animalId}", animalId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void naoDeveRegistrarTratamentoSemAutenticacao() throws Exception {
        mockMvc.perform(post("/tratamentos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "animalId": 1,
                                  "medicamento": "Ivermectina",
                                  "data": "2026-08-15",
                                  "motivo": "Parasitas",
                                  "dosagem": "10 mL",
                                  "observacoes": null
                                }
                                """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void naoDeveRegistrarTratamentoParaAnimalInexistente() throws Exception {
        mockMvc.perform(post("/tratamentos")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "animalId": 99999,
                                  "medicamento": "Ivermectina",
                                  "data": "2026-08-15",
                                  "motivo": "Parasitas",
                                  "dosagem": "10 mL",
                                  "observacoes": null
                                }
                                """))
                .andExpect(status().isNotFound());
    }

    @Test
    void naoDeveRegistrarTratamentoParaAnimalDeOutroUsuario() throws Exception {
        Long animalId = cadastrarAnimal(token);

        String outroEmail = "outro-trat-" + UUID.randomUUID() + "@fazenda.com";
        cadastrarUsuario(outroEmail, senha);
        String tokenOutro = autenticar(outroEmail, senha);

        mockMvc.perform(post("/tratamentos")
                        .header("Authorization", "Bearer " + tokenOutro)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "animalId": %d,
                                  "medicamento": "Ivermectina",
                                  "data": "2026-08-15",
                                  "motivo": "Parasitas",
                                  "dosagem": "10 mL",
                                  "observacoes": null
                                }
                                """.formatted(animalId)))
                .andExpect(status().isNotFound());
    }

    @Test
    void naoDeveListarTratamentosDeAnimalDeOutroUsuario() throws Exception {
        Long animalId = cadastrarAnimal(token);
        registrarTratamento(animalId, token, "Ivermectina", "Parasitas");

        String outroEmail = "outro2-trat-" + UUID.randomUUID() + "@fazenda.com";
        cadastrarUsuario(outroEmail, senha);
        String tokenOutro = autenticar(outroEmail, senha);

        mockMvc.perform(get("/tratamentos/animal/{animalId}", animalId)
                        .header("Authorization", "Bearer " + tokenOutro))
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
                .andReturn().getResponse().getContentAsString();

        return objectMapper.readTree(resposta).get("token").asText();
    }

    private Long cadastrarAnimal(String tokenUsuario) throws Exception {
        AnimalDTO animalDTO = new AnimalDTO(
                null, "TRAT-001", "Bovino", "Gir", "FEMEA",
                "4 anos", 380.0, "Saudável", null
        );

        String resposta = mockMvc.perform(post("/animais")
                        .header("Authorization", "Bearer " + tokenUsuario)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(animalDTO)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        return objectMapper.readTree(resposta).get("id").asLong();
    }

    private void registrarTratamento(Long animalId, String tokenUsuario, String medicamento, String motivo) throws Exception {
        mockMvc.perform(post("/tratamentos")
                        .header("Authorization", "Bearer " + tokenUsuario)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "animalId": %d,
                                  "medicamento": "%s",
                                  "data": "2026-08-15",
                                  "motivo": "%s",
                                  "dosagem": "10 mL",
                                  "observacoes": null
                                }
                                """.formatted(animalId, medicamento, motivo)))
                .andExpect(status().isCreated());
    }
}
