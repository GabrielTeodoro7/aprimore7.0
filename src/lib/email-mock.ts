import { toast } from "sonner";
import { registrarLog } from "./auth-store";

export type EmailPayload = { to: string; subject: string; body: string };

export function enviarEmail({ to, subject, body }: EmailPayload) {
  // eslint-disable-next-line no-console
  console.group(`%c[E-MAIL ENVIADO] ${subject}`, "color:#6366f1;font-weight:bold;font-size:13px");
  // eslint-disable-next-line no-console
  console.table({ Para: to, Assunto: subject, Data: new Date().toLocaleString("pt-BR") });
  // eslint-disable-next-line no-console
  console.log(`%c${body}`, "color:#374151");
  // eslint-disable-next-line no-console
  console.groupEnd();
  registrarLog({ perfil: "sistema", usuario: to, acao: `E-mail: ${subject}` });
  toast.success("E-mail enviado", { description: `Para ${to} — veja detalhes no console.` });
}

export const templates = {
  boasVindas: (nome: string, email: string, senha: string, role: string) => ({
    to: email,
    subject: "Bem-vindo(a) à plataforma Aprimore",
    body: `Olá ${nome},\n\nSua conta de ${role} foi criada com sucesso.\n\nE-mail: ${email}\nSenha temporária: ${senha}\n\nAcesse: ${typeof window !== "undefined" ? window.location.origin : ""}/login\n\nRecomendamos trocar a senha no primeiro acesso.\n\nAbraços,\nEquipe Aprimore`,
  }),
  recuperarSenha: (nome: string, email: string, senha: string) => ({
    to: email,
    subject: "Redefinição de senha — Aprimore",
    body: `Olá ${nome},\n\nUma nova senha temporária foi gerada para sua conta: ${senha}\n\nUse-a para entrar e cadastrar uma nova senha.\n\nAbraços,\nEquipe Aprimore`,
  }),
  mensagemResponsavel: (nomeAluno: string, emailResp: string, mensagem: string, professor: string) => ({
    to: emailResp,
    subject: `Mensagem sobre ${nomeAluno}`,
    body: `Olá,\n\n${mensagem}\n\nAtenciosamente,\n${professor}`,
  }),
};

export function gerarSenhaTemporaria(): string {
  return Math.random().toString(36).slice(2, 10);
}
