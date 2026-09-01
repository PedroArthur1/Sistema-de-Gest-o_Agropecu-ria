package service;

import dto.LembreteDTO;
import model.Animal;
import model.User;
import model.Vacinacao;
import model.Tratamento;
import repository.AnimalRepository;
import repository.VacinacaoRepository;
import repository.TratamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class LembreteService {

    @Autowired
    private AnimalRepository animalRepository;

    @Autowired
    private VacinacaoRepository vacinacaoRepository;

    @Autowired
    private TratamentoRepository tratamentoRepository;

    @Autowired
    private UsuarioAutenticadoService usuarioAutenticadoService;

    @Transactional(readOnly = true)
    public List<LembreteDTO> obterLembretesDoUsuario() {
        User proprietario = usuarioAutenticadoService.obterUsuario();
        List<Animal> animais = animalRepository.findByProprietario(proprietario);
        List<LembreteDTO> lembretes = new ArrayList<>();
        LocalDate hoje = LocalDate.now();

        for (Animal animal : animais) {
            // Vacinas
            List<Vacinacao> vacinacoes = vacinacaoRepository.findByAnimalIdOrderByDataAplicacaoDescIdDesc(animal.getId());
            for (Vacinacao v : vacinacoes) {
                if (v.getDataProximaDose() != null) {
                    String status = "Próxima";
                    if (v.getDataProximaDose().isBefore(hoje)) {
                        status = "Atrasada";
                    } else if (v.getDataProximaDose().isEqual(hoje)) {
                        status = "Hoje";
                    }
                    lembretes.add(new LembreteDTO(
                            animal.getId(),
                            animal.getCodigoIdentificacao(),
                            animal.getEspecie() + " / " + animal.getRaca(),
                            v.getNomeVacina(),
                            v.getDataProximaDose(),
                            status,
                            "Vacina"
                    ));
                }
            }

            // Tratamentos
            List<Tratamento> tratamentos = tratamentoRepository.findByAnimalId(animal.getId());
            for (Tratamento t : tratamentos) {
                if (t.getDataPrevista() != null) {
                    String status = "Próxima";
                    if (t.getDataPrevista().isBefore(hoje)) {
                        status = "Atrasada";
                    } else if (t.getDataPrevista().isEqual(hoje)) {
                        status = "Hoje";
                    }
                    lembretes.add(new LembreteDTO(
                            animal.getId(),
                            animal.getCodigoIdentificacao(),
                            animal.getEspecie() + " / " + animal.getRaca(),
                            t.getMedicamento(),
                            t.getDataPrevista(),
                            status,
                            "Tratamento"
                    ));
                }
            }
        }

        lembretes.sort((a, b) -> {
            if ("Atrasada".equals(a.status()) && !"Atrasada".equals(b.status())) return -1;
            if (!"Atrasada".equals(a.status()) && "Atrasada".equals(b.status())) return 1;
            return a.dataPrevista().compareTo(b.dataPrevista());
        });

        return lembretes;
    }
}