package controller;

import dto.IndicadoresRebanhoDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import service.IndicadoresService;

/**
 * Controller que expõe os indicadores consolidados do rebanho do usuário autenticado.
 */
@RestController
@RequestMapping("/animais/indicadores")
public class IndicadoresController {

    @Autowired
    private IndicadoresService indicadoresService;

    /**
     * GET /animais/indicadores
     * Retorna os indicadores consolidados do rebanho (total, peso médio,
     * distribuição por espécie, raça, saúde e faixa etária).
     */
    @GetMapping
    public ResponseEntity<IndicadoresRebanhoDTO> obterIndicadores() {
        return ResponseEntity.ok(indicadoresService.calcular());
    }
}
