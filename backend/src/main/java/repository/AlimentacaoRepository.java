package repository;

import model.Alimentacao;
import model.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AlimentacaoRepository extends JpaRepository<Alimentacao, Long> {
    @EntityGraph(attributePaths = {"animais", "tipoAlimento"})
    List<Alimentacao> findByAnimaisId(Long animalId);

    @EntityGraph(attributePaths = {"animais", "tipoAlimento"})
    @Query("SELECT DISTINCT a FROM Alimentacao a JOIN a.animais an WHERE an.proprietario.id = :usuarioId")
    List<Alimentacao> findDistinctByAnimaisProprietarioId(@Param("usuarioId") Long usuarioId);
}