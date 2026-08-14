package com.example.demo.security;

import model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import security.TokenService;

import static org.junit.jupiter.api.Assertions.*;

class TokenServiceTest {

    private TokenService tokenService;
    private User mockUser;

    @BeforeEach
    void setUp() {
        tokenService = new TokenService();
        ReflectionTestUtils.setField(tokenService, "secret", "minha-chave-super-secreta-de-teste");

        mockUser = new User("Administrador", "admin@teste.com", "senha123", "ADMIN");
    }

    @Test
    void deveGerarTokenComSucesso() {
        String token = tokenService.generateToken(mockUser);

        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    void deveValidarTokenEExtrairEmailComSucesso() {
        String token = tokenService.generateToken(mockUser);
        String emailValidado = tokenService.validateToken(token);

        assertEquals("admin@teste.com", emailValidado);
    }

    @Test
    void deveRetornarStringVaziaQuandoTokenForInvalido() {
        String emailValidado = tokenService.validateToken("um.token.completamente.invalido");

        assertEquals("", emailValidado);
    }
}