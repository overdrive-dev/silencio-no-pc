# KidsPC �️

Programa de controle parental que monitora o volume do ambiente, controla o tempo de uso e permite gerenciamento remoto pelo responsável via painel web.

## Funcionalidades

- **Medidor de volume flutuante** - Widget arrastável que mostra o nível de dB em tempo real
- **Sistema de strikes progressivos** - Avisos visuais, sonoros e ações automáticas
- **Controle de tempo** - Limite diário e horários permitidos por dia da semana
- **Painel web** - Responsável configura tudo remotamente (tempo, horários, senha, penalidades)
- **Pareamento por token** - Token único com expiração de 30 min para vincular PC
- **Proteção por senha** - Definida pelo responsável no painel web
- **Sync remoto** - Configurações sincronizadas automaticamente via Supabase
- **Auto-update** - Atualização automática do programa
- **Inicia com o Windows** - Roda automaticamente em background

## Instalação

### Requisitos
- Python 3.8+
- Windows 10/11

### Passos

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/silencio-no-pc.git
cd silencio-no-pc
```

2. Instale as dependências:
```bash
pip install -r requirements.txt
```

3. Execute:
```bash
python src/main.py
```

## Primeiro Uso

1. Na primeira execução, o programa pede para **vincular a uma conta** via token
2. O responsável gera o token no **painel web** e cola no programa
3. A **senha de acesso** é definida remotamente pelo responsável no painel web
4. O programa inicia minimizado na **system tray**

## Configurações

- **Volume (local)** - Clique direito na tray → Configurações (requer senha)
- **Tempo, horários, penalidades, senha** - Configurados pelo responsável no painel web

## Senha de Recuperação

Caso o responsável perca acesso ao painel web, use a senha backup: `Senha@123`

## Criar Instalador

```bash
pip install pyinstaller
python build.py
```

O executável será gerado em `dist/KidsPC_v{versão}.exe`.

## Licença

MIT License
