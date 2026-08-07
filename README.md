# Soninho Feliz 🌙

> Skill para **Amazon Alexa** que reproduz sons suaves de piano instrumental combinados com o ruído relaxante de chuva — para ajudar bebês e crianças a relaxar e dormir.

Feita com foco no público: **pais de bebês e crianças**.

## 🎤 Demonstração

> "Alexa, abre soninho feliz"

A skill responde e começa a tocar o áudio relaxante em loop.

## ✨ Funcionalidades

- Reprodução em **loop contínuo** (via `AudioPlayer.PlaybackNearlyFinished → ENQUEUE`).
- Controle por voz: abrir, tocar, pausar, continuar e parar.
- Áudio servido por **URL pública estável no Amazon S3** (não usa URL pré-assinada, que expira em 60s e inviabilizaria o streaming contínuo).

## 🏗️ Arquitetura

```
Alexa Device
   │
   ▼
Alexa Skill (interaction model pt-BR)
   │
   ▼
AWS Lambda (Node.js / ask-sdk-core)
   │
   ▼
Amazon S3 (público) → Áudio piano-rain.mp3
```

## 📁 Estrutura do projeto

```
.
├── skill-package/
│   ├── skill.json                          # Manifesto da skill (interface AudioPlayer)
│   └── interactionModels/custom/pt-BR.json  # Invocation name + intents
├── lambda/
│   ├── index.js                            # Handler da skill (streaming contínuo)
│   ├── util.js                             # Helper de URL (S3)
│   ├── package.json                        # Dependências (ask-sdk-core, ask-sdk-model)
│   └── local-debugger.js                   # Servidor de teste local (opcional)
├── legal/
│   ├── privacy-policy.html
│   └── terms-of-use.html
├── image/
│   ├── Large Icon.png                      # 512x512 px
│   └── Small Icon.png                      # 108x108 px
└── README.md
```

> **Nota:** o arquivo de áudio `piano-rain.mp3` **não** é mantido no repositório. Ele está armazenado no bucket S3 público e é servido pela URL abaixo.

## 🗣️ Invocation e Intents

- **Invocation name**: `soninho feliz`
- `PlayMusicIntent`: "começar soninho feliz", "quero ouvir soninho feliz", "tocar soninho feliz"
- Intents padrão: `AMAZON.HelpIntent`, `AMAZON.StopIntent`, `AMAZON.CancelIntent`, `AMAZON.PauseIntent`, `AMAZON.ResumeIntent`, `AMAZON.FallbackIntent`, `AMAZON.NavigateHomeIntent`

## 🎵 Configuração do áudio

Em `lambda/index.js`, a constante `AUDIO_URL` aponta para o arquivo no S3:

```
https://soninho-feliz-audio.s3.us-east-1.amazonaws.com/piano-rain.mp3
```

Requisitos para o `AudioPlayer` da Alexa:
- **HTTPS** público e estável.
- Suporte a **Range requests** (`HTTP 206 Partial Content`) e `Content-Type: audio/mp3`.

## 🛠️ Deploy (Alexa-hosted)

1. Crie a skill como **Custom → Alexa-Hosted (Node.js)**, idioma **Portuguese (BR)**.
2. Na aba **Code**, sobrescreva:
   - `index.js`, `package.json` e `util.js` com os arquivos locais.
3. Na aba **Build → JSON Editor**, cole o conteúdo de `pt-BR.json` → **Save** e **Build Model**.
4. Na aba **Build → Interfaces**, habilite **AudioPlayer** e faça Build.
5. Clique em **Deploy**.
6. Teste em **Test → Development** ou em um dispositivo Echo real.

## 🔐 Privacidade

A skill **não coleta, armazena, processa ou compartilha** dados pessoais. Consulte:

- [Política de Privacidade](legal/privacy-policy.html)
- [Termos de Uso](legal/terms-of-use.html)

## 📜 Licença

Distribuído sob a licença **Apache-2.0**. Consulte [LICENSE](LICENSE) para mais detalhes.

---

Feito com ❤️ para as noites tranquilas dos pequenos.
