package controller;

import dto.LembreteDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import service.LembreteService;

import java.util.List;

@RestController
@RequestMapping("/vacinacoes/lembretes")
public class LembreteController {

    @Autowired
    private LembreteService lembreteService;

    @GetMapping
    public ResponseEntity<List<LembreteDTO>> listarLembretes() {
        return ResponseEntity.ok(lembreteService.obterLembretesDoUsuario());
    }
}