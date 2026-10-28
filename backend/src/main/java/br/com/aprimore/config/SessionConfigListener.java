package br.com.aprimore.config;

import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import jakarta.servlet.annotation.WebListener;

@WebListener
public class SessionConfigListener implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent event) {
        boolean secureCookie = Boolean.parseBoolean(
            System.getenv().getOrDefault("SESSION_COOKIE_SECURE", "true")
        );
        event.getServletContext().getSessionCookieConfig().setHttpOnly(true);
        event.getServletContext().getSessionCookieConfig().setSecure(secureCookie);
        event.getServletContext().getSessionCookieConfig().setName("APRIMORESESSION");
    }
}