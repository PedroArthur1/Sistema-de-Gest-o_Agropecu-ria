package repository;

import model.Vacinacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface VacinacaoRepository extends JpaRepository<Vacinacao, Long> {

    List<Vacinacao> findByAnimalIdOrderByDataAplicacaoDescIdDesc(Long animalId);

    List<Vacinacao> findByAnimalIdAndDataProximaDoseAfterOrderByDataProximaDoseAsc(Long animalId, LocalDate data);
}
