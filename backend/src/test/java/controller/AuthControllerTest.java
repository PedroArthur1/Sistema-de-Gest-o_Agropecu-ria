package controller;

import com.fasterxml.jackson.databind.JsonNode;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = com.example.demo.DemoApplication.class)
class AuthControllerTest {

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

    @Test
    void deveRegistrarNovoUsuarioComSucesso() throws Exception {
        String email = "novo-" + UUID.randomUUID() + "@fazenda.com";
        UserDTO userDTO = new UserDTO("Novo Agricultor", email, "senha123", "USER");

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nome").value("Novo Agricultor"))
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    void deveRetornar400ParaEmailDuplicado() throws Exception {
        String email = "duplicado-" + UUID.randomUUID() + "@fazenda.com";
        UserDTO userDTO = new UserDTO("Agricultor", email, "senha123", "USER");

        // Primeiro registro com sucesso
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userDTO)))
                .andExpect(status().isCreated());

        // Segundo registro com mesmo email deve falhar
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deveRealizarLoginComSucesso() throws Exception {
        String email = "login-" + UUID.randomUUID() + "@fazenda.com";
        String senha = "senha123";
        UserDTO userDTO = new UserDTO("Agricultor Login", email, senha, "USER");

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userDTO)))
                .andExpect(status().isCreated());

        AuthDTO authDTO = new AuthDTO(email, senha);
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(authDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role").value("USER"))
                .andExpect(jsonPath("$.nome").value("Agricultor Login"));
    }

    @Test
    void deveRetornar401ParaCredenciaisInvalidas() throws Exception {
        AuthDTO authDTO = new AuthDTO("naoexiste@fazenda.com", "senhaerrada");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(authDTO)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void deveRetornar401ParaSenhaErrada() throws Exception {
        String email = "senhaerrada-" + UUID.randomUUID() + "@fazenda.com";
        UserDTO userDTO = new UserDTO("Agricultor", email, "senha123", "USER");

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userDTO)))
                .andExpect(status().isCreated());

        AuthDTO authDTO = new AuthDTO(email, "senhaerradissima");
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(authDTO)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void deveRealizarLogoutComSucesso() throws Exception {
        String email = "logout-" + UUID.randomUUID() + "@fazenda.com";
        UserDTO userDTO = new UserDTO("Agricultor Logout", email, "senha123", "USER");

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userDTO)))
                .andExpect(status().isCreated());

        AuthDTO authDTO = new AuthDTO(email, "senha123");
        String resposta = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(authDTO)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String token = objectMapper.readTree(resposta).get("token").asText();

        mockMvc.perform(post("/auth/logout")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void deveRegistrarUsuarioAdmin() throws Exception {
        String email = "admin-" + UUID.randomUUID() + "@fazenda.com";
        UserDTO userDTO = new UserDTO("Admin", email, "senha123", "ADMIN");

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }
}
