CREATE DATABASE IF NOT EXISTS aprimore
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE aprimore;

CREATE TABLE IF NOT EXISTS usuarios (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(254) NOT NULL,
    senha_hash VARCHAR(60) NOT NULL,
    perfil ENUM('ALUNO', 'PROFESSOR', 'ADMIN', 'CEO') NOT NULL DEFAULT 'ALUNO',
    status ENUM('ATIVO', 'INATIVO') NOT NULL DEFAULT 'ATIVO',
    ultimo_acesso DATETIME NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uq_usuarios_email UNIQUE (email),
    INDEX idx_usuarios_perfil_status (perfil, status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS turmas (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    professor_id BIGINT UNSIGNED NOT NULL,
    nome VARCHAR(120) NOT NULL,
    ano_letivo SMALLINT UNSIGNED NOT NULL,
    descricao VARCHAR(500) NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_turmas_professor FOREIGN KEY (professor_id) REFERENCES usuarios(id),
    CONSTRAINT uq_turmas_professor_nome_ano UNIQUE (professor_id, nome, ano_letivo),
    INDEX idx_turmas_professor (professor_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS alunos (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    turma_id BIGINT UNSIGNED NOT NULL,
    usuario_id BIGINT UNSIGNED NULL,
    nome VARCHAR(120) NOT NULL,
    data_nascimento DATE NULL,
    responsavel VARCHAR(120) NULL,
    email_responsavel VARCHAR(254) NULL,
    telefone_responsavel VARCHAR(30) NULL,
    necessidade_educacional VARCHAR(500) NULL,
    observacoes TEXT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_alunos_turma FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE CASCADE,
    CONSTRAINT fk_alunos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_alunos_turma (turma_id),
    INDEX idx_alunos_usuario (usuario_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS atividades (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    turma_id BIGINT UNSIGNED NOT NULL,
    professor_id BIGINT UNSIGNED NOT NULL,
    titulo VARCHAR(180) NOT NULL,
    materia VARCHAR(100) NOT NULL,
    descricao TEXT NULL,
    data_entrega DATE NULL,
    adaptada BOOLEAN NOT NULL DEFAULT FALSE,
    dificuldade ENUM('FACIL', 'MEDIA', 'DESAFIO') NOT NULL DEFAULT 'MEDIA',
    status ENUM('RASCUNHO', 'PUBLICADA', 'ENCERRADA') NOT NULL DEFAULT 'RASCUNHO',
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_atividades_turma FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE CASCADE,
    CONSTRAINT fk_atividades_professor FOREIGN KEY (professor_id) REFERENCES usuarios(id),
    INDEX idx_atividades_turma_entrega (turma_id, data_entrega),
    INDEX idx_atividades_professor (professor_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS submissoes (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    atividade_id BIGINT UNSIGNED NOT NULL,
    aluno_id BIGINT UNSIGNED NOT NULL,
    resposta TEXT NULL,
    nota DECIMAL(4,2) NULL,
    feedback TEXT NULL,
    status ENUM('PENDENTE', 'ENTREGUE', 'CORRIGIDA') NOT NULL DEFAULT 'PENDENTE',
    entregue_em DATETIME NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_submissoes_atividade FOREIGN KEY (atividade_id) REFERENCES atividades(id) ON DELETE CASCADE,
    CONSTRAINT fk_submissoes_aluno FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
    CONSTRAINT uq_submissoes_atividade_aluno UNIQUE (atividade_id, aluno_id),
    INDEX idx_submissoes_aluno_status (aluno_id, status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS frequencia (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    turma_id BIGINT UNSIGNED NOT NULL,
    aluno_id BIGINT UNSIGNED NOT NULL,
    data_aula DATE NOT NULL,
    presente BOOLEAN NOT NULL DEFAULT TRUE,
    justificativa VARCHAR(500) NULL,
    registrado_por BIGINT UNSIGNED NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_frequencia_turma FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE CASCADE,
    CONSTRAINT fk_frequencia_aluno FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
    CONSTRAINT fk_frequencia_usuario FOREIGN KEY (registrado_por) REFERENCES usuarios(id),
    CONSTRAINT uq_frequencia_aluno_data UNIQUE (aluno_id, data_aula),
    INDEX idx_frequencia_turma_data (turma_id, data_aula)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS mensagens (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    remetente_id BIGINT UNSIGNED NOT NULL,
    destinatario_id BIGINT UNSIGNED NOT NULL,
    assunto VARCHAR(180) NOT NULL,
    conteudo TEXT NOT NULL,
    lida_em DATETIME NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_mensagens_remetente FOREIGN KEY (remetente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_mensagens_destinatario FOREIGN KEY (destinatario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_mensagens_destinatario (destinatario_id, criado_em)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sentimentos (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    aluno_id BIGINT UNSIGNED NOT NULL,
    emocao VARCHAR(40) NOT NULL,
    intensidade TINYINT UNSIGNED NULL,
    observacao VARCHAR(500) NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_sentimentos_aluno FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
    CONSTRAINT chk_sentimentos_intensidade CHECK (intensidade IS NULL OR intensidade BETWEEN 1 AND 5),
    INDEX idx_sentimentos_aluno_data (aluno_id, criado_em)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS conquistas (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    aluno_id BIGINT UNSIGNED NOT NULL,
    titulo VARCHAR(120) NOT NULL,
    descricao VARCHAR(500) NULL,
    icone VARCHAR(40) NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_conquistas_aluno FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
    INDEX idx_conquistas_aluno (aluno_id, criado_em)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    usuario_id BIGINT UNSIGNED NULL,
    acao VARCHAR(120) NOT NULL,
    entidade VARCHAR(80) NOT NULL,
    entidade_id BIGINT UNSIGNED NULL,
    detalhes JSON NULL,
    ip_origem VARCHAR(45) NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_audit_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_audit_criado (criado_em),
    INDEX idx_audit_usuario (usuario_id, criado_em)
) ENGINE=InnoDB;