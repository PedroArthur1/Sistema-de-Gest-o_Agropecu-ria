package controller;

import dto.TipoAlimentoDTO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import service.TipoAlimentoService;

import java.util.List;

@RestController
@RequestMapping("/tipos-alimento")
public class TipoAlimentoController {

    @Autowired
    private TipoAlimentoService tipoAlimentoService;

    @PostMapping
    public ResponseEntity<TipoAlimentoDTO> criar(@Valid @RequestBody TipoAlimentoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tipoAlimentoService.criar(dto));
    }

    @GetMapping
    public ResponseEntity<List<TipoAlimentoDTO>> listar() {
        return ResponseEntity.ok(tipoAlimentoService.listarDoUsuario());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TipoAlimentoDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(tipoAlimentoService.buscarDoUsuarioComoDTO(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TipoAlimentoDTO> atualizar(@PathVariable Long id, @Valid @RequestBody TipoAlimentoDTO dto) {
        return ResponseEntity.ok(tipoAlimentoService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        tipoAlimentoService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
