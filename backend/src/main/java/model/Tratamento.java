package model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "tratamentos")
public class Tratamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_id", nullable = false)
    private Animal animal;

    @Column(nullable = false)
    private String medicamento;

    @Column(nullable = false)
    private LocalDate data;

    @Column(nullable = false)
    private String motivo;

    private String dosagem;
    private String observacoes;

    public Tratamento() {}

    public Tratamento(Animal animal, String medicamento, LocalDate data, String motivo, String dosagem, String observacoes) {
        this.animal = animal;
        this.medicamento = medicamento;
        this.data = data;
        this.motivo = motivo;
        this.dosagem = dosagem;
        this.observacoes = observacoes;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Animal getAnimal() { return animal; }
    public void setAnimal(Animal animal) { this.animal = animal; }
    public String getMedicamento() { return medicamento; }
    public void setMedicamento(String medicamento) { this.medicamento = medicamento; }
    public LocalDate getData() { return data; }
    public void setData(LocalDate data) { this.data = data; }
    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }
    public String getDosagem() { return dosagem; }
    public void setDosagem(String dosagem) { this.dosagem = dosagem; }
    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
}