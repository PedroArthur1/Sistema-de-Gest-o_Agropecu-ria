package repository; // Ajuste para o pacote correto do seu projeto

import model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Método que será chamado pelo Spring Security para validar o login
    UserDetails findByEmail(String email);

}