package controller;

import dto.AnimalDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import service.AnimalService;
import model.Animal;

import java.util.List;

@RestController
@RequestMapping("/animais")
public class AnimalController {

    @Autowired
    private AnimalService animalService;

    @PostMapping
    public ResponseEntity<AnimalDTO> cadastrar(@RequestBody AnimalDTO animalDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(animalService.cadastrar(animalDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Animal> atualizarAnimal(@PathVariable Long id, @RequestBody Animal animal) {
        Animal atualizado = animalService.atualizar(id, animal);
        return ResponseEntity.ok(atualizado);
    }

    @GetMapping
    public ResponseEntity<List<AnimalDTO>> listar() {
        return ResponseEntity.ok(animalService.listarDoUsuario());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnimalDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(animalService.buscarDoUsuarioComoDTO(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AnimalDTO> atualizar(@PathVariable Long id, @RequestBody AnimalDTO animalDTO) {
        return ResponseEntity.ok(animalService.atualizar(id, animalDTO));
    }
}
