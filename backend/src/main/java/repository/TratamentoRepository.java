package repository;

import model.Tratamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TratamentoRepository extends JpaRepository<Tratamento, Long> {

    List<Tratamento> findByAnimalId(Long animalId);
}