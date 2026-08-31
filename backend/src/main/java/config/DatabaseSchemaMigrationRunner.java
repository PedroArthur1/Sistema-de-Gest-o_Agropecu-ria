package config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;

@Component
public class DatabaseSchemaMigrationRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSchemaMigrationRunner.class);

    @Autowired
    private DataSource dataSource;

    @Override
    public void run(ApplicationArguments args) {
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {

            log.info("Executando verificações de compatibilidade de schema no banco de dados...");

            try {
                stmt.execute("ALTER TABLE alimentacoes DROP COLUMN IF EXISTS tipo_alimento");
                log.info("Migração schema: coluna obsoleta 'tipo_alimento' em 'alimentacoes' removida com sucesso (se existia).");
            } catch (Exception e) {
                log.warn("Aviso ao remover coluna 'tipo_alimento': {}", e.getMessage());
            }

        } catch (Exception e) {
            log.warn("Não foi possível conectar ao banco para migração de compatibilidade de schema: {}", e.getMessage());
        }
    }
}
