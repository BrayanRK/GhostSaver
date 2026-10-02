# 👻 GhostSaver v2.0

> **Bot de WhatsApp silencioso para capturar y guardar mensajes de una sola vista (ViewOnce).**  
> Solo el owner y el super owner pueden usarlo. Sin respuestas en chats ajenos. Sin rastro.

---

## ✨ Características

- 👻 **Silencioso total** — nunca responde en grupos ni chats ajenos
- 📸 **Captura automática** — guarda ViewOnce de imágenes, videos y audios al instante
- 💾 **3 modos de guardado** — almacenamiento local, reenvío al bot, o ambos
- 🗑️ **AntiDelete** — detecta mensajes eliminados y te los reenvía en privado
- 📱 **Termux + PC** — detecta la plataforma automáticamente
- 🔧 **TypeScript estricto** — tipado completo, sin `any` ocultos
- ⚡ **ultra-baileys** — versión mejorada de Baileys
- 🔄 **Auto-reload** — recarga comandos sin reiniciar al modificar archivos
- 💿 **Persistencia** — el modo de guardado y el estado del AntiDelete sobreviven reinicios

---

## 🚀 Instalación

### Termux (Android)
```bash
# Prerequisitos
pkg update && pkg install nodejs git -y
termux-setup-storage

# Clonar e instalar
git clone https://github.com/BrayanRK/GhostSaver.git
cd GhostSaver
npm install

# Iniciar
npm start
```

### PC (Windows / Linux)
```bash
git clone https://github.com/BrayanRK/GhostSaver.git
cd GhostSaver
npm install
npm start
```

> **Node.js >= 20** requerido.

---

## ⚙️ Configuración

Edita [`src/config.ts`](src/config.ts) para cambiar el super owner y otras opciones:

```ts
superOwner: "5732230904061",  // ← Tu número (con código de país, sin +)
prefix: ".",                   // Prefijo de comandos
queueDelay: 1200,              // Delay anti-ban (ms)
```

---

## 📋 Comandos

Todos los comandos responden **solo en el chat del bot** (chat "Tú").

| Comando | Aliases | Descripción |
|---------|---------|-------------|
| `.vv` | `viewonce`, `vo`, `ver` | Guarda el ViewOnce citado |
| `.config` | `cfg`, `status` | Panel de estado del bot |
| `.saveset <modo>` | `modo`, `savemode` | Cambia el modo de guardado |
| `.antidelete <on/off>` | `ad` | Activa/desactiva el AntiDelete |
| `.alias <list/add/remove>` | `aliases` | Gestiona aliases del `.vv` |
| `.menu` | `help`, `comandos` | Lista todos los comandos |
| `.restart` | `reboot` | Reinicia el bot |
| `.update` | `actualizar` | Actualiza desde git |

### Modos de guardado (`.saveset`)

| Modo | Descripción |
|------|-------------|
| `storage` | Solo guarda en almacenamiento interno |
| `forward` | Guarda en disco **y** reenvía al chat del bot |
| `chat` | Solo reenvía al chat del bot (sin guardar en disco) |

---

## 📁 Estructura de archivos guardados

```
GhostSaver/
└── <número_del_contacto>/
    ├── img_1720000000000.jpg
    ├── vid_1720000001000.mp4
    └── aud_1720000002000.ogg
```

En Termux: `/storage/emulated/0/GhostSaver/`  
En PC: `~/GhostSaver/`

---

## 🛡️ Seguridad

- El bot **ignora silenciosamente** cualquier mensaje que no sea del owner o super owner
- Las credenciales de sesión están en `auth_info/` (excluido del repo via `.gitignore`)
- El `superOwner` está hardcodeado en `config.ts` para que siempre tenga acceso

---

## 🏗️ Tecnologías

- **Runtime:** Node.js 20+ con `tsx` (sin paso de compilación)
- **WhatsApp:** ultra-baileys
- **Lenguaje:** TypeScript estricto
- **Persistencia:** `settings.json` (JSON plano)

---

## 👤 Créditos

Desarrollado por **Brayan** / bytebot  
GhostSaver v2.0 — All rights reserved
