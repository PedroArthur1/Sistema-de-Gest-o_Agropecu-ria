package security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class SimpleCorsFilterTest {

    private SimpleCorsFilter filter;

    @BeforeEach
    void setUp() {
        filter = new SimpleCorsFilter();
    }

    @Test
    void deveAdicionarHeadersCorsEContinuarFiltroQuandoNaoOptions() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setMethod("GET");
        request.addHeader("Origin", "http://localhost:4200");

        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain filterChain = mock(FilterChain.class);

        filter.doFilterInternal(request, response, filterChain);

        assertEquals("http://localhost:4200", response.getHeader("Access-Control-Allow-Origin"));
        assertEquals("Origin", response.getHeader("Vary"));
        assertEquals("GET,POST,PUT,DELETE,OPTIONS,PATCH", response.getHeader("Access-Control-Allow-Methods"));
        
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void deveResponderOkEPararQuandoMetodoOptions() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setMethod("OPTIONS");
        request.addHeader("Origin", "http://localhost:4200");

        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain filterChain = mock(FilterChain.class);

        filter.doFilterInternal(request, response, filterChain);

        assertEquals(200, response.getStatus());
        verify(filterChain, never()).doFilter(any(), any());
    }

    @Test
    void deveAdicionarAsteriscoQuandoSemOrigin() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setMethod("GET");

        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain filterChain = mock(FilterChain.class);

        filter.doFilterInternal(request, response, filterChain);

        assertEquals("*", response.getHeader("Access-Control-Allow-Origin"));
        verify(filterChain).doFilter(request, response);
    }
}
