-- Execute como administrador do MySQL e substitua o marcador por uma senha forte.
-- Não reutilize a senha de produção em desenvolvimento.
CREATE USER IF NOT EXISTS 'aprimore_app'@'localhost'
  IDENTIFIED BY 'SUBSTITUA_POR_UMA_SENHA_FORTE';

GRANT SELECT, INSERT, UPDATE, DELETE
  ON aprimore.*
  TO 'aprimore_app'@'localhost';

FLUSH PRIVILEGES;
