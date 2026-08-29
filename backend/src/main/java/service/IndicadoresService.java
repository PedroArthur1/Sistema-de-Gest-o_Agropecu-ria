package service;

import dto.DistribuicaoItemDTO;
import dto.IndicadoresRebanhoDTO;
import model.Animal;
import model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import repository.AnimalRepository;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Serviço responsável por calcular todos os indicadores consolidados
 * do rebanho do usuário autenticado.
 * A lógica de agregação reside aqui, no backend, em vez de no frontend.
 */
@Service
public class IndicadoresService {

    private static final int LIMITE_RACAS = 6;

    @Autowired
    private AnimalRepository animalRepository;

    @Autowired
    private UsuarioAutenticadoService usuarioAutenticadoService;

    @Transactional(readOnly = true)
    public IndicadoresRebanhoDTO calcular() {
        User proprietario = usuarioAutenticadoService.obterUsuario();
        List<Animal> animais = animalRepository.findByProprietario(proprietario);

        long total = animais.size();

        if (total == 0) {
            return new IndicadoresRebanhoDTO(
                    0, 0.0, 0, 0, 0, 0,
                    List.of(), List.of(), List.of(), List.of()
            );
        }

        double pesoMedio = calcularPesoMedio(animais);
        long totalMachos = contarPorSexo(animais, "MACHO");
        long totalFemeas = contarPorSexo(animais, "FEMEA");
        int percentualMachos = percentual(totalMachos, total);
        int percentualFemeas = percentual(totalFemeas, total);

        List<DistribuicaoItemDTO> distribuicaoEspecie = agruparPor(animais, Animal::getEspecie, total, -1);
        List<DistribuicaoItemDTO> distribuicaoRaca    = agruparPor(animais, Animal::getRaca, total, LIMITE_RACAS);
        List<DistribuicaoItemDTO> distribuicaoSaude   = agruparPor(animais, Animal::getCondicaoSaude, total, -1);
        List<DistribuicaoItemDTO> distribuicaoIdade   = calcularFaixasEtarias(animais, total);

        return new IndicadoresRebanhoDTO(
                total, pesoMedio, totalMachos, totalFemeas,
                percentualMachos, percentualFemeas,
                distribuicaoEspecie, distribuicaoRaca, distribuicaoSaude, distribuicaoIdade
        );
    }

    // ─── Métodos Auxiliares ───────────────────────────────────────────────────

    /**
     * Calcula a média de peso ignorando valores nulos ou menores/iguais a zero.
     */
    double calcularPesoMedio(List<Animal> animais) {
        return animais.stream()
                .filter(a -> a.getPeso() != null && a.getPeso() > 0)
                .mapToDouble(Animal::getPeso)
                .average()
                .orElse(0.0);
    }

    /**
     * Conta animais pelo sexo (case-insensitive).
     */
    long contarPorSexo(List<Animal> animais, String sexo) {
        return animais.stream()
                .filter(a -> sexo.equalsIgnoreCase(
                        a.getSexo() != null ? a.getSexo().trim() : ""))
                .count();
    }

    /**
     * Agrupa animais por um campo e retorna a distribuição.
     * Se limite > 0, aplica o agrupamento "Outras" para o restante.
     */
    List<DistribuicaoItemDTO> agruparPor(
            List<Animal> animais,
            java.util.function.Function<Animal, String> extrator,
            long total,
            int limite
    ) {
        Map<String, Long> contagem = animais.stream()
                .collect(Collectors.groupingBy(
                        a -> {
                            String valor = extrator.apply(a);
                            if (valor == null || valor.isBlank()) return "Não informado";
                            String trimmed = valor.trim();
                            return Character.toUpperCase(trimmed.charAt(0)) + trimmed.substring(1).toLowerCase();
                        },
                        Collectors.counting()
                ));

        List<DistribuicaoItemDTO> lista = contagem.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(e -> new DistribuicaoItemDTO(e.getKey(), e.getValue(), percentual(e.getValue(), total)))
                .collect(Collectors.toCollection(ArrayList::new));

        if (limite > 0 && lista.size() > limite) {
            List<DistribuicaoItemDTO> top = lista.subList(0, limite);
            List<DistribuicaoItemDTO> restante = lista.subList(limite, lista.size());
            long totalRestante = restante.stream().mapToLong(DistribuicaoItemDTO::total).sum();
            List<DistribuicaoItemDTO> resultado = new ArrayList<>(top);
            resultado.add(new DistribuicaoItemDTO("Outras", totalRestante, percentual(totalRestante, total)));
            return Collections.unmodifiableList(resultado);
        }

        return Collections.unmodifiableList(lista);
    }

    /**
     * Calcula a distribuição por faixas etárias.
     * Interpreta o campo dataNascimentoOuIdade como string ISO (yyyy-MM-dd).
     * Animais com data inválida ou ausente vão para "Não informado".
     */
    List<DistribuicaoItemDTO> calcularFaixasEtarias(List<Animal> animais, long total) {
        LocalDate hoje = LocalDate.now();
        long jovem = 0, adulto = 0, idoso = 0, naoInformado = 0;

        for (Animal a : animais) {
            String dataStr = a.getDataNascimentoOuIdade();
            if (dataStr == null || dataStr.isBlank()) {
                naoInformado++;
                continue;
            }
            try {
                LocalDate nascimento = LocalDate.parse(dataStr.trim());
                int anos = nascimento.until(hoje).getYears();
                if (anos < 1) jovem++;
                else if (anos <= 5) adulto++;
                else idoso++;
            } catch (DateTimeParseException e) {
                naoInformado++;
            }
        }

        List<DistribuicaoItemDTO> resultado = new ArrayList<>();
        if (jovem > 0)       resultado.add(new DistribuicaoItemDTO("Jovem (< 1 ano)",    jovem,       percentual(jovem,       total)));
        if (adulto > 0)      resultado.add(new DistribuicaoItemDTO("Adulto (1-5 anos)",  adulto,      percentual(adulto,      total)));
        if (idoso > 0)       resultado.add(new DistribuicaoItemDTO("Idoso (> 5 anos)",   idoso,       percentual(idoso,       total)));
        if (naoInformado > 0) resultado.add(new DistribuicaoItemDTO("Não informado",     naoInformado, percentual(naoInformado, total)));
        return Collections.unmodifiableList(resultado);
    }

    /**
     * Calcula percentual arredondado.
     */
    int percentual(long parte, long total) {
        if (total == 0) return 0;
        return (int) Math.round((double) parte / total * 100);
    }
}
