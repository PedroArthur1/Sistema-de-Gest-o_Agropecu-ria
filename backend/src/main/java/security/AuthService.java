package security;

import dto.UserDTO;
import model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import repository.UserRepository;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;


    public User register(UserDTO userDTO) {
        // Verifica se o usuário já existe
        if (this.userRepository.findByEmail(userDTO.email()) != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email já cadastrado!");
        }

        // Criptografa a senha em um hash irreversível
        String encryptedPassword = new BCryptPasswordEncoder().encode(userDTO.password());

        // Cria o novo usuário (lembrando do campo 'nome' que adicionamos)
        User newUser = new User(userDTO.nome(), userDTO.email(), encryptedPassword, userDTO.role());

        return this.userRepository.save(newUser);
    }
}