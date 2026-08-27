package repository;

import model.Alimentacao;
import model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AlimentacaoRepository extends JpaRepository<Alimentacao, Long> {
    List<Alimentacao> findByAnimaisId(Long animalId);
    List<Alimentacao> findDistinctByAnimaisProprietario(User proprietario);
}