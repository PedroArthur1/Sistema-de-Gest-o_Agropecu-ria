package controller;

import dto.AlimentacaoRequestDTO;
import dto.AlimentacaoResponseDTO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import service.AlimentacaoService;

import java.util.List;

@RestController
@RequestMapping("/alimentacoes")
public class AlimentacaoController {

    @Autowired
    private AlimentacaoService alimentacaoService;

    @PostMapping
    public ResponseEntity<AlimentacaoResponseDTO> registrarAlimentacao(@RequestBody @Valid AlimentacaoRequestDTO dto) {
        AlimentacaoResponseDTO salvo = alimentacaoService.registrarAlimentacao(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    @GetMapping("/animal/{animalId}")
    public ResponseEntity<List<AlimentacaoResponseDTO>> listarPorAnimal(@PathVariable Long animalId) {
        List<AlimentacaoResponseDTO> historico = alimentacaoService.listarPorAnimal(animalId);
        return ResponseEntity.ok(historico);
    }

    @GetMapping
    public ResponseEntity<List<AlimentacaoResponseDTO>> listarTodas() {
        List<AlimentacaoResponseDTO> todas = alimentacaoService.listarTodas();
        return ResponseEntity.ok(todas);
    }
}