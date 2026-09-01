package service;

import dto.EventoSaudeDTO;
import dto.HistoricoSaudeResumoDTO;
import model.Animal;
import model.Consulta;
import model.Tratamento;
import model.Vacinacao;
import repository.ConsultaRepository;
import repository.TratamentoRepository;
import repository.VacinacaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class HistoricoSaudeService {

    @Autowired
    private AnimalService animalService;

    @Autowired
    private VacinacaoRepository vacinacaoRepository;

    @Autowired
    private TratamentoRepository tratamentoRepository;

    @Autowired
    private ConsultaRepository consultaRepository;

    @Transactional(readOnly = true)
    public HistoricoSaudeResumoDTO buscarHistoricoConsolidado(Long animalId) {
        Animal animal = animalService.buscarDoUsuario(animalId);

        List<Vacinacao> vacinacoes = vacinacaoRepository.findByAnimalIdOrderByDataAplicacaoDescIdDesc(animalId);
        List<Tratamento> tratamentos = tratamentoRepository.findByAnimalId(animalId);
        List<Consulta> consultas = consultaRepository.findByAnimalIdOrderByDataConsultaDesc(animalId);

        List<EventoSaudeDTO> eventos = new ArrayList<>();

        if (vacinacoes != null) {
            for (Vacinacao v : vacinacoes) {
                eventos.add(new EventoSaudeDTO(
                        v.getId(),
                        "VACINACAO",
                        v.getDataAplicacao(),
                        v.getNomeVacina(),
                        "Dose: " + v.getDose(),
                        "Aplicação de vacina " + v.getNomeVacina() + " (" + v.getDose() + ")",
                        v.getResponsavel(),
                        v.getDataProximaDose(),
                        null
                ));
            }
        }

        if (tratamentos != null) {
            for (Tratamento t : tratamentos) {
                StringBuilder desc = new StringBuilder();
                if (t.getDosagem() != null && !t.getDosagem().isBlank()) {
                    desc.append("Dosagem: ").append(t.getDosagem());
                }
                if (t.getObservacoes() != null && !t.getObservacoes().isBlank()) {
                    if (!desc.isEmpty()) desc.append(" | ");
                    desc.append("Obs: ").append(t.getObservacoes());
                }

                String resp = t.getConsulta() != null ? t.getConsulta().getProfissionalResponsavel() : null;
                Long cId = t.getConsulta() != null ? t.getConsulta().getId() : null;

                eventos.add(new EventoSaudeDTO(
                        t.getId(),
                        "TRATAMENTO",
                        t.getData(),
                        t.getMedicamento(),
                        "Motivo: " + t.getMotivo(),
                        desc.toString(),
                        resp,
                        t.getDataPrevista(),
                        cId
                ));
            }
        }

        if (consultas != null) {
            for (Consulta c : consultas) {
                StringBuilder desc = new StringBuilder();
                if (c.getDiagnostico() != null && !c.getDiagnostico().isBlank()) {
                    desc.append("Diagnóstico: ").append(c.getDiagnostico());
                }
                if (c.getObservacoes() != null && !c.getObservacoes().isBlank()) {
                    if (!desc.isEmpty()) desc.append(" | ");
                    desc.append(c.getObservacoes());
                }

                eventos.add(new EventoSaudeDTO(
                        c.getId(),
                        "CONSULTA",
                        c.getDataConsulta(),
                        c.getMotivo(),
                        "Profissional: " + c.getProfissionalResponsavel(),
                        desc.toString(),
                        c.getProfissionalResponsavel(),
                        null,
                        c.getId()
                ));
            }
        }

        // Ordenar cronologicamente em ordem decrescente (mais recente primeiro)
        eventos.sort(Comparator.comparing(EventoSaudeDTO::data, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(EventoSaudeDTO::idOrigem, Comparator.nullsLast(Comparator.reverseOrder())));

        int totalVacinas = vacinacoes != null ? vacinacoes.size() : 0;
        int totalTratamentos = tratamentos != null ? tratamentos.size() : 0;
        int totalConsultas = consultas != null ? consultas.size() : 0;
        int totalEventos = eventos.size();

        return new HistoricoSaudeResumoDTO(
                animal.getId(),
                animal.getCodigoIdentificacao(),
                totalEventos,
                totalVacinas,
                totalTratamentos,
                totalConsultas,
                eventos
        );
    }
}
