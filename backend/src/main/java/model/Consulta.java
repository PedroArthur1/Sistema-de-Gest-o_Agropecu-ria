package model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "consultas")
public class Consulta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_id", nullable = false)
    private Animal animal;

    @Column(nullable = false)
    private LocalDate dataConsulta;

    @Column(nullable = false)
    private String motivo;

    @Column(nullable = false)
    private String profissionalResponsavel;

    private String diagnostico;

    private String observacoes;

    public Consulta() {}

    public Consulta(Animal animal, LocalDate dataConsulta, String motivo,
                    String profissionalResponsavel, String diagnostico, String observacoes) {
        this.animal = animal;
        this.dataConsulta = dataConsulta;
        this.motivo = motivo;
        this.profissionalResponsavel = profissionalResponsavel;
        this.diagnostico = diagnostico;
        this.observacoes = observacoes;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Animal getAnimal() { return animal; }
    public void setAnimal(Animal animal) { this.animal = animal; }

    public LocalDate getDataConsulta() { return dataConsulta; }
    public void setDataConsulta(LocalDate dataConsulta) { this.dataConsulta = dataConsulta; }

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }

    public String getProfissionalResponsavel() { return profissionalResponsavel; }
    public void setProfissionalResponsavel(String profissionalResponsavel) { this.profissionalResponsavel = profissionalResponsavel; }

    public String getDiagnostico() { return diagnostico; }
    public void setDiagnostico(String diagnostico) { this.diagnostico = diagnostico; }

    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
}
