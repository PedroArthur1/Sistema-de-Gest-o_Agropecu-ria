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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = com.example.demo.DemoApplication.class)
class VacinacaoControllerTest {

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
    void deveRegistrarVacinacaoParaAnimalCadastrado() throws Exception {
        Long animalId = cadastrarAnimal(token);

        mockMvc.perform(post("/animais/{animalId}/vacinacoes", animalId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nomeVacina": "Febre Aftosa",
                                  "dataAplicacao": "2026-08-12",
                                  "dose": "5 mL",
                                  "responsavel": "Dr. João Veterinário",
                                  "dataProximaDose": "2026-11-12"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.animalId").value(animalId))
                .andExpect(jsonPath("$.nomeVacina").value("Febre Aftosa"))
                .andExpect(jsonPath("$.dose").value("5 mL"))
                .andExpect(jsonPath("$.responsavel").value("Dr. João Veterinário"))
                .andExpect(jsonPath("$.dataAplicacao").value("2026-08-12"))
                .andExpect(jsonPath("$.dataProximaDose").value("2026-11-12"));
    }

    @Test
    void deveManterHistoricoDeVacinacaoDoAnimal() throws Exception {
        Long animalId = cadastrarAnimal(token);

        registrarVacinacao(animalId, token, """
                {
                  "nomeVacina": "Brucelose",
                  "dataAplicacao": "2026-01-10",
                  "dose": "2 mL",
                  "responsavel": "Maria Técnica",
                  "dataProximaDose": null
                }
                """);
        registrarVacinacao(animalId, token, """
                {
                  "nomeVacina": "Febre Aftosa",
                  "dataAplicacao": "2026-08-12",
                  "dose": "5 mL",
                  "responsavel": "Dr. João Veterinário",
                  "dataProximaDose": "2026-11-12"
                }
                """);

        mockMvc.perform(get("/animais/{animalId}/vacinacoes", animalId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].nomeVacina").value("Febre Aftosa"))
                .andExpect(jsonPath("$[1].nomeVacina").value("Brucelose"));
    }

    @Test
    void naoDeveRegistrarVacinacaoSemAnimalCadastrado() throws Exception {
        mockMvc.perform(post("/animais/{animalId}/vacinacoes", 9999)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nomeVacina": "Febre Aftosa",
                                  "dataAplicacao": "2026-08-12",
                                  "dose": "5 mL",
                                  "responsavel": "Dr. João Veterinário",
                                  "dataProximaDose": "2026-11-12"
                                }
                                """))
                .andExpect(status().isNotFound());
    }

    @Test
    void naoDeveRegistrarVacinacaoDeAnimalDeOutroAgricultor() throws Exception {
        Long animalId = cadastrarAnimal(token);

        String outroEmail = "outro-" + UUID.randomUUID() + "@fazenda.com";
        cadastrarUsuario(outroEmail, senha);
        String tokenOutro = autenticar(outroEmail, senha);

        mockMvc.perform(post("/animais/{animalId}/vacinacoes", animalId)
                        .header("Authorization", "Bearer " + tokenOutro)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nomeVacina": "Febre Aftosa",
                                  "dataAplicacao": "2026-08-12",
                                  "dose": "5 mL",
                                  "responsavel": "Dr. João Veterinário",
                                  "dataProximaDose": "2026-11-12"
                                }
                                """))
                .andExpect(status().isNotFound());
    }

    @Test
    void naoDeveRegistrarVacinacaoSemCamposObrigatorios() throws Exception {
        Long animalId = cadastrarAnimal(token);

        mockMvc.perform(post("/animais/{animalId}/vacinacoes", animalId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nomeVacina": "",
                                  "dataAplicacao": null,
                                  "dose": " ",
                                  "responsavel": null,
                                  "dataProximaDose": null
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void naoDevePermitirRegistroSemAutenticacao() throws Exception {
        mockMvc.perform(post("/animais/{animalId}/vacinacoes", 1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nomeVacina": "Febre Aftosa",
                                  "dataAplicacao": "2026-08-12",
                                  "dose": "5 mL",
                                  "responsavel": "Dr. João Veterinário",
                                  "dataProximaDose": "2026-11-12"
                                }
                                """))
                .andExpect(status().isForbidden());
    }

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
        AnimalDTO animalDTO = new AnimalDTO(
                null,
                "BOV-001",
                "Bovino",
                "Nelore",
                "MACHO",
                "2 anos",
                450.0,
                "Saudável",
                null
        );

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
