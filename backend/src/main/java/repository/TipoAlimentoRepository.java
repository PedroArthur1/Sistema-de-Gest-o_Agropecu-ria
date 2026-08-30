package repository;

import model.TipoAlimento;
import model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TipoAlimentoRepository extends JpaRepository<TipoAlimento, Long> {
    List<TipoAlimento> findByProprietario(User proprietario);
    Optional<TipoAlimento> findByIdAndProprietario(Long id, User proprietario);
}
