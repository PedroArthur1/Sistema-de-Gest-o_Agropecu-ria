package security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Service
public class TokenService {

    // Lê a variável secret que configuramos no application.properties
    @Value("${api.security.token.secret}")
    private String secret;

    public String generateToken(User user) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret); // Define o algoritmo e a chave de assinatura
            return JWT.create()
                    .withIssuer("SistemaAgropecuaria") // Nome da aplicação emissora
                    .withSubject(user.getEmail()) // Identificação do usuário logado (email)
                    .withExpiresAt(genExpirationDate()) // Tempo de validade do token
                    .sign(algorithm);
        } catch (JWTCreationException exception) {
            throw new RuntimeException("Erro ao gerar token JWT", exception);
        }
    }

    public String validateToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.require(algorithm)
                    .withIssuer("SistemaAgropecuaria")
                    .build()
                    .verify(token) // Verifica a autenticidade do token
                    .getSubject(); // Extrai e retorna o email do usuário
        } catch (JWTVerificationException exception) {
            return ""; // Retorna string vazia se o token for inválido, expirado ou forjado
        }
    }

    private Instant genExpirationDate() {
        return Instant.now().plus(java.time.Duration.ofHours(2));
    }
}