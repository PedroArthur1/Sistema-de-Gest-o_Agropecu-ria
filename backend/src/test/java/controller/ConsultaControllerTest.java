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
class ConsultaControllerTest {

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

        String email = "consulta-" + UUID.randomUUID() + "@fazenda.com";
        cadastrarUsuario(email, senha);
        token = autenticar(email, senha);
    }

    @Test
    void deveRegistrarConsultaVeterinariaComSucesso() throws Exception {
        Long animalId = cadastrarAnimal(token);

        mockMvc.perform(post("/consultas")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "animalId": %d,
                                  "dataConsulta": "2026-08-20",
                                  "motivo": "Revisão periódica",
                                  "profissionalResponsavel": "Dr. Maria Veterinária",
                                  "diagnostico": "Animal saudável",
                                  "observacoes": "Sem alterações",
                                  "tratamentoIds": []
                                }
                                """.formatted(animalId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.animalId").value(animalId))
                .andExpect(jsonPath("$.motivo").value("Revisão periódica"))
                .andExpect(jsonPath("$.profissionalResponsavel").value("Dr. Maria Veterinária"))
                .andExpect(jsonPath("$.diagnostico").value("Animal saudável"));
    }

    @Test
    void deveListarConsultasPorAnimal() throws Exception {
        Long animalId = cadastrarAnimal(token);

        // Registrar duas consultas
        registrarConsulta(animalId, token, "Revisão periódica", "Dr. João");
        registrarConsulta(animalId, token, "Claudicação", "Dr. Maria");

        mockMvc.perform(get("/consultas/animal/{animalId}", animalId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void deveBuscarConsultaPorId() throws Exception {
        Long animalId = cadastrarAnimal(token);

        String resposta = mockMvc.perform(post("/consultas")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "animalId": %d,
                                  "dataConsulta": "2026-08-20",
                                  "motivo": "Check-up",
                                  "profissionalResponsavel": "Dr. Ana",
                                  "diagnostico": null,
                                  "observacoes": null,
                                  "tratamentoIds": []
                                }
                                """.formatted(animalId)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long consultaId = objectMapper.readTree(resposta).get("id").asLong();

        mockMvc.perform(get("/consultas/{id}", consultaId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(consultaId))
                .andExpect(jsonPath("$.motivo").value("Check-up"));
    }

    @Test
    void deveRetornar404ParaConsultaInexistente() throws Exception {
        mockMvc.perform(get("/consultas/{id}", 99999)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }

    @Test
    void naoDeveRegistrarConsultaSemAutenticacao() throws Exception {
        mockMvc.perform(post("/consultas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "animalId": 1,
                                  "dataConsulta": "2026-08-20",
                                  "motivo": "Revisão",
                                  "profissionalResponsavel": "Dr. João",
                                  "diagnostico": null,
                                  "observacoes": null,
                                  "tratamentoIds": []
                                }
                                """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void naoDeveRegistrarConsultaParaAnimalDeOutroUsuario() throws Exception {
        Long animalId = cadastrarAnimal(token);

        String outroEmail = "outro-consulta-" + UUID.randomUUID() + "@fazenda.com";
        cadastrarUsuario(outroEmail, senha);
        String tokenOutro = autenticar(outroEmail, senha);

        mockMvc.perform(post("/consultas")
                        .header("Authorization", "Bearer " + tokenOutro)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "animalId": %d,
                                  "dataConsulta": "2026-08-20",
                                  "motivo": "Revisão",
                                  "profissionalResponsavel": "Dr. João",
                                  "diagnostico": null,
                                  "observacoes": null,
                                  "tratamentoIds": []
                                }
                                """.formatted(animalId)))
                .andExpect(status().isNotFound());
    }

    @Test
    void naoDeveListarConsultasDeAnimalDeOutroUsuario() throws Exception {
        Long animalId = cadastrarAnimal(token);
        registrarConsulta(animalId, token, "Revisão", "Dr. João");

        String outroEmail = "outro2-consulta-" + UUID.randomUUID() + "@fazenda.com";
        cadastrarUsuario(outroEmail, senha);
        String tokenOutro = autenticar(outroEmail, senha);

        mockMvc.perform(get("/consultas/animal/{animalId}", animalId)
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
        AnimalDTO animalDTO = new AnimalDTO(null, "CONSUL-001", "Bovino", "Nelore", "MACHO", "3 anos", 500.0, "Saudável", null, null, null);

        String resposta = mockMvc.perform(post("/animais")
                        .header("Authorization", "Bearer " + tokenUsuario)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(animalDTO)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        return objectMapper.readTree(resposta).get("id").asLong();
    }

    private void registrarConsulta(Long animalId, String tokenUsuario, String motivo, String profissional) throws Exception {
        mockMvc.perform(post("/consultas")
                        .header("Authorization", "Bearer " + tokenUsuario)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "animalId": %d,
                                  "dataConsulta": "2026-08-20",
                                  "motivo": "%s",
                                  "profissionalResponsavel": "%s",
                                  "diagnostico": null,
                                  "observacoes": null,
                                  "tratamentoIds": []
                                }
                                """.formatted(animalId, motivo, profissional)))
                .andExpect(status().isCreated());
    }
}
