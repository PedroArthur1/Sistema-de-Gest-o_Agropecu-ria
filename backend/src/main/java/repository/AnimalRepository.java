package repository;

import model.Animal;
import model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnimalRepository extends JpaRepository<Animal, Long> {

    List<Animal> findByProprietario(User proprietario);

    Optional<Animal> findByIdAndProprietario(Long id, User proprietario);
}
