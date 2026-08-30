package controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import dto.GrupoRebanhoDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import service.GrupoRebanhoService;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class GrupoRebanhoControllerTest {

    private MockMvc mockMvc;

    @Mock
    private GrupoRebanhoService grupoRebanhoService;

    @InjectMocks
    private GrupoRebanhoController grupoRebanhoController;

    private ObjectMapper objectMapper;
    private GrupoRebanhoDTO grupoRebanhoDTO;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(grupoRebanhoController).build();
        objectMapper = new ObjectMapper();
        grupoRebanhoDTO = new GrupoRebanhoDTO(1L, "Lote A", "Animais de corte", 5);
    }

    @Test
    void deveCriarGrupoComSucesso() throws Exception {
        when(grupoRebanhoService.criar(any(GrupoRebanhoDTO.class))).thenReturn(grupoRebanhoDTO);

        mockMvc.perform(post("/grupos-rebanho")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(grupoRebanhoDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.nome").value("Lote A"));

        verify(grupoRebanhoService, times(1)).criar(any(GrupoRebanhoDTO.class));
    }

    @Test
    void deveListarGruposComSucesso() throws Exception {
        when(grupoRebanhoService.listarDoUsuario()).thenReturn(List.of(grupoRebanhoDTO));

        mockMvc.perform(get("/grupos-rebanho")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].nome").value("Lote A"));

        verify(grupoRebanhoService, times(1)).listarDoUsuario();
    }

    @Test
    void deveBuscarGrupoPorId() throws Exception {
        when(grupoRebanhoService.buscarDoUsuarioComoDTO(1L)).thenReturn(grupoRebanhoDTO);

        mockMvc.perform(get("/grupos-rebanho/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.nome").value("Lote A"));

        verify(grupoRebanhoService, times(1)).buscarDoUsuarioComoDTO(1L);
    }

    @Test
    void deveAtualizarGrupoComSucesso() throws Exception {
        when(grupoRebanhoService.atualizar(eq(1L), any(GrupoRebanhoDTO.class))).thenReturn(grupoRebanhoDTO);

        mockMvc.perform(put("/grupos-rebanho/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(grupoRebanhoDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Lote A"));

        verify(grupoRebanhoService, times(1)).atualizar(eq(1L), any(GrupoRebanhoDTO.class));
    }

    @Test
    void deveDeletarGrupoComSucesso() throws Exception {
        doNothing().when(grupoRebanhoService).deletar(1L);

        mockMvc.perform(delete("/grupos-rebanho/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(grupoRebanhoService, times(1)).deletar(1L);
    }
}
