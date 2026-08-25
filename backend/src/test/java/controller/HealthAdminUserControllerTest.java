package controller;

import com.fasterxml.jackson.databind.ObjectMapper;
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
class HealthAdminUserControllerTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
    }

    // ========== HealthController ==========

    @Test
    void deveRetornarStatusUpSemAutenticacao() throws Exception {
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    // ========== AdminController ==========

    @Test
    void devePermitirAcessoAdminAoPingAdmin() throws Exception {
        String email = "admin-ping-" + UUID.randomUUID() + "@fazenda.com";
        cadastrarUsuario(email, "senha123", "ADMIN");
        String token = autenticar(email, "senha123");

        mockMvc.perform(get("/admin/ping")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void deveNegarAcessoUserAoPingAdmin() throws Exception {
        String email = "user-admin-" + UUID.randomUUID() + "@fazenda.com";
        cadastrarUsuario(email, "senha123", "USER");
        String token = autenticar(email, "senha123");

        mockMvc.perform(get("/admin/ping")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    void deveNegarAcessoSemAuthAoPingAdmin() throws Exception {
        mockMvc.perform(get("/admin/ping"))
                .andExpect(status().isUnauthorized());
    }

    // ========== UserController ==========

    @Test
    void devePermitirAcessoUserAoPingUser() throws Exception {
        String email = "user-ping-" + UUID.randomUUID() + "@fazenda.com";
        cadastrarUsuario(email, "senha123", "USER");
        String token = autenticar(email, "senha123");

        mockMvc.perform(get("/user/ping")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void devePermitirAcessoAdminAoPingUser() throws Exception {
        String email = "admin-user-" + UUID.randomUUID() + "@fazenda.com";
        cadastrarUsuario(email, "senha123", "ADMIN");
        String token = autenticar(email, "senha123");

        mockMvc.perform(get("/user/ping")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void deveNegarAcessoSemAuthAoPingUser() throws Exception {
        mockMvc.perform(get("/user/ping"))
                .andExpect(status().isUnauthorized());
    }

    // ---- Métodos auxiliares ----

    private void cadastrarUsuario(String email, String senha, String role) throws Exception {
        UserDTO userDTO = new UserDTO("Teste " + role, email, senha, role);
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userDTO)))
                .andExpect(status().isCreated());
    }

    private String autenticar(String email, String senha) throws Exception {
        AuthDTO authDTO = new AuthDTO(email, senha);
        String resposta = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(authDTO)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        return objectMapper.readTree(resposta).get("token").asText();
    }
}
