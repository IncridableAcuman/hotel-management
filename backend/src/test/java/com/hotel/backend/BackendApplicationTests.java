package com.hotel.backend;

import io.github.cdimascio.dotenv.Dotenv;
import io.github.cdimascio.dotenv.DotenvEntry;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class BackendApplicationTests {

    static {
        try {
            Dotenv dotenv = Dotenv.load();
            for (DotenvEntry entry : dotenv.entries()) {
                System.setProperty(entry.getKey(), entry.getValue());
            }
        } catch (Exception ignored) {
        }
    }

    @Test
    void contextLoads() {
    }

}
