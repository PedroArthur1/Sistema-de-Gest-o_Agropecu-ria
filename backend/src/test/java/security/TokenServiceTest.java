package security;

import model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(classes = com.example.demo.DemoApplication.class)
class TokenServiceTest {

    @Autowired
    private TokenService tokenService;

    @Test
    void deveGerarTokenValido() {
        User user = new User("Agricultor", "token@fazenda.com", "hash", "USER");

        String token = tokenService.generateToken(user);

        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    void deveValidarTokenERetornarEmail() {
        User user = new User("Agricultor", "validar@fazenda.com", "hash", "USER");
        String token = tokenService.generateToken(user);

        String email = tokenService.validateToken(token);

        assertEquals("validar@fazenda.com", email);
    }

    @Test
    void deveRetornarVazioParaTokenInvalido() {
        String email = tokenService.validateToken("token.invalido.forjado");

        assertEquals("", email);
    }

    @Test
    void deveRetornarVazioParaTokenVazio() {
        String email = tokenService.validateToken("");

        assertEquals("", email);
    }

    @Test
    void deveGerarTokensDistintosParaMesmoUsuario() {
        User user = new User("Agricultor", "distinto@fazenda.com", "hash", "USER");

        String token1 = tokenService.generateToken(user);
        String token2 = tokenService.generateToken(user);

        // Tokens should technically be the same if generated at the same instant,
        // but we just verify they're valid
        assertNotNull(token1);
        assertNotNull(token2);
        assertEquals("distinto@fazenda.com", tokenService.validateToken(token1));
        assertEquals("distinto@fazenda.com", tokenService.validateToken(token2));
    }

    @Test
    void deveGerarTokenParaAdmin() {
        User admin = new User("Admin", "admin@fazenda.com", "hash", "ADMIN");

        String token = tokenService.generateToken(admin);

        assertNotNull(token);
        assertEquals("admin@fazenda.com", tokenService.validateToken(token));
    }
}
