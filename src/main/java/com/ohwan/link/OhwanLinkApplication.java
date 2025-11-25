package com.ohwan.link;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
public class OhwanLinkApplication {

    public static void main(String[] args) {
        System.out.println("=================================================");
        System.out.println("  Ohwan Link Web Application");
        System.out.println("=================================================");
        System.out.println();

        SpringApplication.run(OhwanLinkApplication.class, args);

        System.out.println();
        System.out.println("=================================================");
        System.out.println("  Application started successfully!");
        System.out.println("  Access at: http://localhost:8080");
        System.out.println("=================================================");
    }

    @Configuration
    public static class WebConfig implements WebMvcConfigurer {
        @Override
        public void addViewControllers(ViewControllerRegistry registry) {
            registry.addViewController("/").setViewName("forward:/index.html");
            registry.addViewController("/{x:[\\w\\-]+}").setViewName("forward:/index.html");
            registry.addViewController("/{x:^(?!api$).*$}/**/{y:[\\w\\-]+}").setViewName("forward:/index.html");
        }
    }
}
