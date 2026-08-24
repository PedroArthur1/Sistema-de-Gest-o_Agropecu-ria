package controller;

import dto.ConsultaRequestDTO;
import dto.ConsultaResponseDTO;
import service.ConsultaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/consultas")
public class ConsultaController {

    @Autowired
    private ConsultaService consultaService;

    @PostMapping
    public ResponseEntity<ConsultaResponseDTO> registrar(@RequestBody @Valid ConsultaRequestDTO dto) {
        ConsultaResponseDTO response = consultaService.registrarConsulta(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/animal/{animalId}")
    public ResponseEntity<List<ConsultaResponseDTO>> listarPorAnimal(@PathVariable Long animalId) {
        List<ConsultaResponseDTO> lista = consultaService.listarPorAnimal(animalId);
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConsultaResponseDTO> buscarPorId(@PathVariable Long id) {
        ConsultaResponseDTO response = consultaService.buscarPorId(id);
        return ResponseEntity.ok(response);
    }
}
