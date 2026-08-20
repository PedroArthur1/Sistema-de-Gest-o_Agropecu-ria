package controller;

import dto.TratamentoRequestDTO;
import dto.TratamentoResponseDTO;
import service.TratamentoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tratamentos")
public class TratamentoController {

    @Autowired
    private TratamentoService tratamentoService;

    @PostMapping
    public ResponseEntity<TratamentoResponseDTO> registrar(@RequestBody @Valid TratamentoRequestDTO dto) {
        TratamentoResponseDTO response = tratamentoService.registrarTratamento(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/animal/{animalId}")
    public ResponseEntity<List<TratamentoResponseDTO>> listarPorAnimal(@PathVariable Long animalId) {
        List<TratamentoResponseDTO> lista = tratamentoService.listarPorAnimal(animalId);
        return ResponseEntity.ok(lista);
    }
}