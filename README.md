# 👻 GhostSaver v2.0

> **Bot de WhatsApp silencioso para capturar y guardar mensajes de una sola vista (ViewOnce).**  
> Solo el owner y el super owner pueden usarlo. Sin respuestas en chats ajenos. Sin rastro.

---

## ✨ Características

- 🤫 **Silencioso total** – nunca responde en grupos ni chats ajenos
- 📷 **Captura ViewOnce** – guarda imágenes, videos y audios al instante
- 💾 **3 modos de guardado** – almacenamiento local, reenvío al bot, o ambos
- 🗑️ **AntiDelete** – detecta mensajes eliminados y te los reenvía en privado
- 📱 **Termux + PC** – detecta la plataforma automáticamente
- 🔷 **TypeScript estricto** – tipado completo
- ⚡ **ultra-baileys** – versión mejorada de Baileys
- 🔄 **Auto-reload** – recarga comandos sin reiniciar al modificar archivos
- 💾 **Persistencia** – el modo de guardado y el AntiDelete sobreviven reinicios

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
superOwner: "5732230904061",  // 👈 Tu número (con código de país, sin +)
prefix: ".",                   // Prefijo de comandos
queueDelay: 1200,              // Delay anti-ban (ms)
```

---

## 🔋 Mantener el bot corriendo (sin que se cierre)

### En Termux — Candado de notificación

Para que Android no mate Termux cuando la pantalla se apaga:

1. Desliza el panel de notificaciones hacia abajo
2. Busca la notificación de **Termux**
3. Toca el **🔒 candado** que aparece en la notificación (o mantenla fija)
4. Esto evita que Android cierre la sesión de Termux en segundo plano

> También puedes ir a **Ajustes → Batería → Termux** y desactivar la optimización de batería para que nunca se cierre.

### Con PM2 (recomendado para PC y Termux)

PM2 mantiene el bot corriendo en segundo plano, lo reinicia si falla y arranca automático al encender.

```bash
# Instalar PM2 globalmente (una sola vez)
npm install -g pm2

# Iniciar GhostSaver con PM2
pm2 start npm --name "ghostsaver" -- start

# Ver logs en vivo
pm2 logs ghostsaver

# Ver estado
pm2 status

# Reiniciar
pm2 restart ghostsaver

# Detener
pm2 stop ghostsaver

# Que arranque solo al reiniciar el sistema (PC/Linux)
pm2 startup
pm2 save
```

> En Termux, PM2 no puede registrarse al arranque del sistema, pero sí mantiene el bot corriendo mientras Termux esté abierto en segundo plano con el candado activo.

---

## 📋 Comandos

Todos los comandos responden **solo en el chat del bot** (chat "Tú").

| Comando | Aliases | Descripción |
|---------|---------|-------------|
| `vv` | `viewonce`, `vo`, `ver` | Guarda el ViewOnce citado |
| `config` | `cfg`, `status` | Panel de estado del bot |
| `saveset <modo>` | `modo`, `savemode` | Cambia el modo de guardado |
| `antidelete <on/off>` | `ad` | Activa/desactiva el AntiDelete |
| `alias <list/add/remove>` | `aliases` | Gestiona aliases del `vv` |
| `prefix <on/off>` | `pfx` | Activa/desactiva el prefijo `.` |
| `menu` | `help`, `comandos` | Lista todos los comandos |
| `restart` | `reboot` | Reinicia el bot |
| `update` | `actualizar` | Actualiza desde git |

> Si el prefijo está **activo**, agrégale `.` al inicio: `.vv`, `.menu`, etc.

### Modos de guardado (`saveset`)

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
    ├── fotos/
    │   └── GhostSaver_01.jpg
    ├── videos/
    │   └── GhostSaver_01.mp4
    └── audios/
        └── GhostSaver_01.ogg
```

En Termux: `/storage/emulated/0/GhostSaver/`  
En PC: `~/GhostSaver/`

---

## 🔐 Seguridad

- El bot **ignora silenciosamente** cualquier mensaje que no sea del owner o super owner
- Las credenciales de sesión están en `auth_info/` (excluido del repo via `.gitignore`)
- El `superOwner` está hardcodeado en `config.ts` para que siempre tenga acceso

---

## 🛠️ Tecnologías

- **Runtime:** Node.js 20+ con `tsx`
- **WhatsApp:** ultra-baileys
- **Lenguaje:** TypeScript estricto
- **Persistencia:** `settings.json` (JSON plano)
- **Proceso:** PM2 (opcional pero recomendado)

---

## 👻 Créditos

Desarrollado por **BrayanRK**  
GhostSaver v2.0 — All rights reserved
