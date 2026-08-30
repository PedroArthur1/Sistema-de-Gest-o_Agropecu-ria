package controller;

import dto.GrupoRebanhoDTO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import service.GrupoRebanhoService;

import java.util.List;

@RestController
@RequestMapping("/grupos-rebanho")
public class GrupoRebanhoController {

    @Autowired
    private GrupoRebanhoService grupoRebanhoService;

    @PostMapping
    public ResponseEntity<GrupoRebanhoDTO> criar(@Valid @RequestBody GrupoRebanhoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(grupoRebanhoService.criar(dto));
    }

    @GetMapping
    public ResponseEntity<List<GrupoRebanhoDTO>> listar() {
        return ResponseEntity.ok(grupoRebanhoService.listarDoUsuario());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GrupoRebanhoDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(grupoRebanhoService.buscarDoUsuarioComoDTO(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GrupoRebanhoDTO> atualizar(@PathVariable Long id, @Valid @RequestBody GrupoRebanhoDTO dto) {
        return ResponseEntity.ok(grupoRebanhoService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        grupoRebanhoService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
