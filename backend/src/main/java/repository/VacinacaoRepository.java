package repository;

import model.Vacinacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VacinacaoRepository extends JpaRepository<Vacinacao, Long> {

    List<Vacinacao> findByAnimalIdOrderByDataAplicacaoDescIdDesc(Long animalId);
}
