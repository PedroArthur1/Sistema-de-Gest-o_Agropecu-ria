package config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;

/**
 * DataSource de producao a partir de env vars reais do Render.
 * Falha com mensagem clara se faltar DB_* ou se o valor ainda tiver ${...}.
 */
@Configuration
@Profile("prod")
public class ProductionDataSourceConfig {

    @Bean
    public DataSource dataSource() {
        String jdbcUrl = firstNonBlank(System.getenv("SPRING_DATASOURCE_URL"), null);
        String username = firstNonBlank(System.getenv("SPRING_DATASOURCE_USERNAME"), System.getenv("DB_USER"));
        String password = firstNonBlank(System.getenv("SPRING_DATASOURCE_PASSWORD"), System.getenv("DB_PASS"));

        if (jdbcUrl == null) {
            String databaseUrl = System.getenv("DATABASE_URL");
            if (databaseUrl != null && !databaseUrl.isBlank()) {
                ParsedDatabaseUrl parsed = parseDatabaseUrl(databaseUrl);
                jdbcUrl = parsed.jdbcUrl();
                if (username == null) {
                    username = parsed.user();
                }
                if (password == null) {
                    password = parsed.password();
                }
            }
        }

        if (jdbcUrl == null) {
            String host = requireEnv("DB_HOST");
            String port = firstNonBlank(System.getenv("DB_PORT"), "5432");
            String database = requireEnv("DB_NAME");
            jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + database;
        }

        rejectUnresolvedPlaceholders(jdbcUrl, "URL do banco");
        username = requireValue(username, "DB_USER (ou usuario na DATABASE_URL)");
        password = requireValue(password, "DB_PASS (ou senha na DATABASE_URL)");
        rejectUnresolvedPlaceholders(username, "DB_USER");
        rejectUnresolvedPlaceholders(password, "DB_PASS");

        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl(jdbcUrl);
        dataSource.setUsername(username);
        dataSource.setPassword(password);
        dataSource.setDriverClassName("org.postgresql.Driver");
        return dataSource;
    }

    private static ParsedDatabaseUrl parseDatabaseUrl(String databaseUrl) {
        String raw = databaseUrl.trim();
        String withoutScheme = raw
                .replaceFirst("^jdbc:", "")
                .replaceFirst("^postgres(ql)?://", "");

        String user = null;
        String password = null;
        String hostPart = withoutScheme;
        int at = withoutScheme.indexOf('@');
        if (at >= 0) {
            String userInfo = withoutScheme.substring(0, at);
            hostPart = withoutScheme.substring(at + 1);
            int colon = userInfo.indexOf(':');
            if (colon >= 0) {
                user = userInfo.substring(0, colon);
                password = userInfo.substring(colon + 1);
            } else {
                user = userInfo;
            }
        }
        return new ParsedDatabaseUrl(user, password, "jdbc:postgresql://" + hostPart);
    }

    private static String requireEnv(String name) {
        return requireValue(System.getenv(name), name);
    }

    private static String requireValue(String value, String label) {
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(
                    "Variavel ausente no Render: " + label
                            + ". Em Environment, defina DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS "
                            + "com valores reais do Postgres (Info do banco), "
                            + "ou adicione DATABASE_URL pelo botao Link Database. "
                            + "Nao use texto ${DB_HOST} como valor.");
        }
        return value;
    }

    private static void rejectUnresolvedPlaceholders(String value, String label) {
        if (value != null && value.contains("${")) {
            throw new IllegalStateException(
                    label + " contem placeholder literal: " + value
                            + ". Apague no Render qualquer env cujo valor seja ${DB_HOST}/${DB_PASS}/etc. "
                            + "Cole o hostname/usuario/senha reais da pagina do Postgres.");
        }
    }

    private static String firstNonBlank(String first, String second) {
        if (first != null && !first.isBlank()) {
            return first;
        }
        if (second != null && !second.isBlank()) {
            return second;
        }
        return null;
    }

    private record ParsedDatabaseUrl(String user, String password, String jdbcUrl) {
    }
}
