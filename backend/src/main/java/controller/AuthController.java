package controller;

import dto.AuthDTO;
import dto.LoginResponseDTO;
import dto.UserDTO;
import model.User;
import security.AuthService;
import security.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private AuthService authService;

    @Autowired
    private TokenService tokenService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody AuthDTO authDTO) {
        // Encapsula as credenciais para o Spring Security validar
        var usernamePassword = new UsernamePasswordAuthenticationToken(authDTO.email(), authDTO.password());
        var auth = this.authenticationManager.authenticate(usernamePassword);

        // Se a senha estiver correta, recupera o usuário e gera o token
        User user = (User) auth.getPrincipal();
        String token = this.tokenService.generateToken(user);

        // Devolve o token e a role no formato que o Angular espera
        return ResponseEntity.ok(new LoginResponseDTO(token, user.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "")));
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody UserDTO userDTO) {
        User registeredUser = this.authService.register(userDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(registeredUser);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.ok().build();
    }
}