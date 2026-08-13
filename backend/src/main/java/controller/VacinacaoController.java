package controller;

import dto.VacinacaoRequestDTO;
import dto.VacinacaoResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import service.VacinacaoService;

import java.util.List;

@RestController
@RequestMapping("/animais/{animalId}/vacinacoes")
public class VacinacaoController {

    @Autowired
    private VacinacaoService vacinacaoService;

    @PostMapping
    public ResponseEntity<VacinacaoResponseDTO> registrar(
            @PathVariable Long animalId,
            @RequestBody VacinacaoRequestDTO request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(vacinacaoService.registrar(animalId, request));
    }

    @GetMapping
    public ResponseEntity<List<VacinacaoResponseDTO>> listarHistorico(@PathVariable Long animalId) {
        return ResponseEntity.ok(vacinacaoService.listarHistorico(animalId));
    }
}
