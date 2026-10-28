package br.com.aprimore.service;

import jakarta.mail.Authenticator;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.PasswordAuthentication;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

import java.util.Properties;

public final class EmailService {
    private EmailService() {
    }

    public static void enviarTokenRecuperacao(String destinatario, String token) throws MessagingException {
        String host = required("SMTP_HOST");
        String user = required("SMTP_USER");
        String password = required("SMTP_PASSWORD");
        String from = required("SMTP_FROM");
        String port = System.getenv().getOrDefault("SMTP_PORT", "587");

        Properties properties = new Properties();
        properties.put("mail.smtp.host", host);
        properties.put("mail.smtp.port", port);
        properties.put("mail.smtp.auth", "true");
        properties.put("mail.smtp.starttls.enable", "true");
        properties.put("mail.smtp.starttls.required", "true");
        properties.put("mail.smtp.connectiontimeout", "8000");
        properties.put("mail.smtp.timeout", "8000");
        properties.put("mail.smtp.writetimeout", "8000");

        Session session = Session.getInstance(properties, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(user, password);
            }
        });

        MimeMessage message = new MimeMessage(session);
        message.setFrom(new InternetAddress(from));
        message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(destinatario, false));
        message.setSubject("Recuperação de senha — Aprimore Educação", "UTF-8");
        message.setText(
            "Recebemos uma solicitação de recuperação de senha para sua conta Aprimore.\n\n"
                + "Use este código temporário na tela de redefinição:\n\n"
                + token + "\n\n"
                + "O código expira em 15 minutos e pode ser usado uma única vez. "
                + "Se você não solicitou a recuperação, ignore esta mensagem.\n\n"
                + "Por segurança, não compartilhe este código.",
            "UTF-8"
        );
        Transport.send(message);
    }

    private static String required(String name) {
        String value = System.getenv(name);
        if (value == null || value.isBlank()) {
            throw new IllegalStateException("A variável de ambiente " + name + " não foi configurada.");
        }
        return value;
    }
}