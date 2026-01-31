# Silêncio no PC 🔇

Programa de controle parental que monitora o volume do ambiente e aplica punições progressivas quando o barulho ultrapassa os limites configurados.

## Funcionalidades

- **Medidor de volume flutuante** - Widget arrastável que mostra o nível de dB em tempo real
- **Sistema de strikes progressivos:**
  1. Popup "Abaixe o volume!"
  2. Toca áudio de aviso no volume máximo
  3. Popup "Último aviso - próximo desliga internet!"
  4. Reinicia o PC
  5. Reincidência após reinício → Bloqueia internet
- **Detecção inteligente** - Média móvel + detecção de picos
- **Modo calibração** - Ajusta limites automaticamente baseado no ruído ambiente
- **Proteção por senha** - Todas as configurações requerem senha dos pais
- **Log de eventos** - Histórico completo de strikes e ações
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

2. Crie um ambiente virtual (opcional):
```bash
python -m venv venv
venv\Scripts\activate
```

3. Instale as dependências:
```bash
pip install -r requirements.txt
```

4. Execute:
```bash
python src/main.py
```

## Primeiro Uso

1. Na primeira execução, você será solicitado a criar uma **senha dos pais**
2. Opcionalmente, faça a **calibração** para medir o ruído ambiente
3. O programa iniciará minimizado na **system tray**

## Configurações

Clique com botão direito no ícone da bandeja → Configurações (requer senha)

- **Limites de decibéis** - Ajuste com sliders
- **Horários ativos** - Defina quando o programa deve monitorar
- **Tempo de bloqueio** - Duração do bloqueio de internet
- **Áudio de aviso** - Escolha um arquivo de áudio personalizado

## Senha de Recuperação

Caso esqueça a senha dos pais, use a senha backup: `Senha@123`

## Criar Instalador

Para criar um executável instalável:

```bash
pip install pyinstaller
pyinstaller --onefile --windowed --icon=assets/icons/icon.ico --name="SilencioNoPC" src/main.py
```

## Licença

MIT License
