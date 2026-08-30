package controller;

import dto.AuthDTO;
import dto.UserDTO;
import dto.AnimalDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
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
@ActiveProfiles("test")
class LembreteControllerTest {

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

        String email = "lembrete-" + UUID.randomUUID() + "@fazenda.com";
        cadastrarUsuario(email, senha);
        token = autenticar(email, senha);
    }

    @Test
    void deveObterLembretesComSucesso() throws Exception {
        Long animalId = cadastrarAnimal(token);

        // Registrar tratamento com data prevista
        mockMvc.perform(post("/tratamentos")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "animalId": %d,
                                  "medicamento": "Medicamento X",
                                  "data": "2026-08-15",
                                  "motivo": "Febre",
                                  "dataPrevista": "2026-09-01"
                                }
                                """.formatted(animalId)))
                .andExpect(status().isCreated());

        // Chamar o endpoint de lembretes
        mockMvc.perform(get("/vacinacoes/lembretes")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].vacina").value("Medicamento X"))
                .andExpect(jsonPath("$[0].tipo").value("Tratamento"));
    }

    private void cadastrarUsuario(String emailUsuario, String senhaUsuario) throws Exception {
        UserDTO userDTO = new UserDTO("Agricultor Lembrete", emailUsuario, senhaUsuario, "USER");
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
        AnimalDTO animalDTO = new AnimalDTO(null, "ANM-99", "Bovino", "Nelore", "MACHO", "1 ano", 200.0, "Saudável", null, null, null);

        String resposta = mockMvc.perform(post("/animais")
                        .header("Authorization", "Bearer " + tokenUsuario)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(animalDTO)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        return objectMapper.readTree(resposta).get("id").asLong();
    }
}
