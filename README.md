<div align="center">

# 👻 GhostSaver

**Bot de WhatsApp silencioso para capturar y guardar mensajes de una sola vista (ViewOnce).**

![Version](https://img.shields.io/badge/version-2.0-6f42c1?style=for-the-badge)
![Node](https://img.shields.io/badge/node-%3E%3D20-339933?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Platform](https://img.shields.io/badge/Termux%20%7C%20Windows%20%7C%20Linux-lightgrey?style=for-the-badge)

Solo el owner y el super owner pueden usarlo. Sin respuestas en chats ajenos. Sin rastro.

</div>

---

## 📑 Contenido

- [Características](#-características)
- [Instalación](#-instalación)
- [Configuración](#️-configuración)
- [Mantener el bot corriendo](#-mantener-el-bot-corriendo)
- [Comandos](#-comandos)
- [Archivos guardados](#-archivos-guardados)
- [Seguridad](#-seguridad)
- [Tecnologías](#️-tecnologías)
- [Créditos](#-créditos)

---

## ✨ Características

| | Función | Detalle |
|---|---|---|
| 🤫 | **Silencio total** | Nunca responde en grupos ni en chats ajenos |
| 📷 | **Captura ViewOnce** | Guarda imágenes, videos y audios al instante |
| 💾 | **3 modos de guardado** | Almacenamiento local, reenvío al bot, o ambos |
| 🗑️ | **AntiDelete** | Detecta mensajes eliminados y te los reenvía en privado |
| 📱 | **Termux + PC** | Detecta la plataforma automáticamente |
| 🔷 | **TypeScript estricto** | Tipado completo |
| ⚡ | **ultra-baileys** | Versión mejorada de Baileys |
| 🔄 | **Auto-reload** | Recarga comandos sin reiniciar al modificar archivos |
| 🧠 | **Persistencia** | El modo de guardado y el AntiDelete sobreviven reinicios |

---

## 🚀 Instalación

> **Requisito:** Node.js `>= 20`

### 📱 Termux (Android)

Instala Termux desde [F-Droid](https://f-droid.org/packages/com.termux/) o desde su [GitHub oficial](https://github.com/termux/termux-app/releases). La versión de Play Store está desactualizada.

**1. Actualiza los paquetes e instala lo necesario**

```bash
pkg update -y && pkg upgrade -y && pkg install nodejs git -y
```

**2. Da permiso de almacenamiento** (acepta el aviso que sale en pantalla)

```bash
termux-setup-storage
```

**3. Clona el repositorio**

```bash
git clone https://github.com/BrayanRK/GhostSaver.git
```

**4. Entra a la carpeta**

```bash
cd GhostSaver
```

**5. Instala las dependencias**

```bash
npm install
```

**6. Inicia el bot**

```bash
npm start
```

### 💻 PC (Windows / Linux)

**1. Clona el repositorio**

```bash
git clone https://github.com/BrayanRK/GhostSaver.git
```

**2. Entra a la carpeta**

```bash
cd GhostSaver
```

**3. Instala las dependencias**

```bash
npm install
```

**4. Inicia el bot**

```bash
npm start
```

---

## ⚙️ Configuración

Edita [`src/config.ts`](src/config.ts) para cambiar el super owner y otras opciones:

```ts
superOwner: "57XXXXXXXXXX",  // Tu número (con código de país, sin +)
prefix: ".",                  // Prefijo de comandos
queueDelay: 1200,             // Delay anti-ban (ms)
```

---

## 🔋 Mantener el bot corriendo

### 📱 En Termux

Android cierra las apps en segundo plano para ahorrar batería. Para que Termux (y el bot) no se cierren, haz **los 4 pasos** en orden.

#### 1️⃣ Fijar Termux con el candado

1. Abre la pantalla de **apps recientes** (las ventanas abiertas).
2. En la tarjeta de **Termux**, toca los **3 puntos** (⋮).
3. Toca **Bloquear** (el candadito 🔒) y déjalo **cerrado**.

> El nombre y la posición del candado cambian según la marca (Samsung, Xiaomi, Motorola, etc.), pero siempre está en ese menú de la tarjeta.

#### 2️⃣ Activar el wakelock

Evita que el CPU se duerma con la pantalla apagada. Hazlo cada vez que abras Termux, antes de iniciar el bot:

```bash
termux-wake-lock
```

También puedes bajar la barra de notificaciones y tocar **Acquire wakelock** en la notificación de Termux. Para liberarlo:

```bash
termux-wake-unlock
```

#### 3️⃣ Quitar la optimización de batería

Ve a **Ajustes → Apps → Termux → Batería** y elige **Sin restricciones** (*Unrestricted*). En algunos teléfonos está en **Ajustes → Batería → Uso de batería por app**.

> ⚠️ No uses el **Ahorro de batería**: puede ignorar el wakelock y matar el proceso.

#### 4️⃣ Android 12 o superior: desactivar el "Phantom Process Killer"

Android 12+ mata los procesos hijos que no lanzó el sistema, y el wakelock no lo evita. Si Termux se cierra solo o ves `[Process completed (signal 9)]`, desactiva esa restricción.

**Opción A (Android 14 o superior):** ve a **Ajustes → Opciones de desarrollador** y activa **Desactivar restricciones de procesos secundarios** (*Disable child process restrictions*).

**Opción B (Android 12 / 13):** por ADB, desde una PC o con la depuración inalámbrica:

```bash
adb shell "/system/bin/device_config put activity_manager max_phantom_processes 2147483647"
```

> ℹ️ Con Android 15 algunos teléfonos siguen cerrando procesos aun con todo esto activo (hay [reportes abiertos](https://github.com/termux/termux-app/issues/5150)). Si te pasa, deja Termux fijado con el candado y abierto en segundo plano.

### ♻️ Con PM2 (recomendado)

PM2 mantiene el bot en segundo plano y lo reinicia si falla.

**Instalar PM2** (una sola vez)

```bash
npm install -g pm2
```

**Iniciar GhostSaver**

```bash
pm2 start npm --name "ghostsaver" -- start
```

**Ver logs en vivo**

```bash
pm2 logs ghostsaver
```

**Ver estado**

```bash
pm2 status
```

**Reiniciar**

```bash
pm2 restart ghostsaver
```

**Detener**

```bash
pm2 stop ghostsaver
```

**Arrancar solo al reiniciar el sistema** (solo PC / Linux)

```bash
pm2 startup
```

```bash
pm2 save
```

> En Termux, PM2 no puede registrarse al arranque del sistema, pero mantiene el bot vivo mientras Termux siga abierto en segundo plano con el candado y el wakelock activos.

---

## 📋 Comandos

Todos los comandos responden **solo en el chat del bot** (el chat "Tú").

| Comando | Aliases | Descripción |
|---------|---------|-------------|
| `vv` | `viewonce`, `vo`, `ver` | Guarda el ViewOnce citado |
| `config` | `cfg`, `status` | Panel de estado del bot |
| `saveset <modo>` | `modo`, `savemode` | Cambia el modo de guardado |
| `antidelete <on/off>` | `ad` | Activa o desactiva el AntiDelete |
| `alias <list/add/remove>` | `aliases` | Gestiona los aliases de `vv` |
| `prefix <on/off>` | `pfx` | Activa o desactiva el prefijo `.` |
| `menu` | `help`, `comandos` | Lista todos los comandos |
| `restart` | `reboot` | Reinicia el bot |
| `update` | `actualizar` | Actualiza desde git |

> Si el prefijo está **activo**, agrégale `.` al inicio: `.vv`, `.menu`, etc.

### 💾 Modos de guardado (`saveset`)

| Modo | Descripción |
|------|-------------|
| `storage` | Solo guarda en el almacenamiento interno |
| `forward` | Guarda en disco **y** reenvía al chat del bot |
| `chat` | Solo reenvía al chat del bot (sin guardar en disco) |

---

## 📁 Archivos guardados

```
GhostSaver/
└── <numero_del_contacto>/
    ├── fotos/
    │   └── GhostSaver_01.jpg
    ├── videos/
    │   └── GhostSaver_01.mp4
    └── audios/
        └── GhostSaver_01.ogg
```

| Plataforma | Ruta |
|------------|------|
| Termux | `/storage/emulated/0/GhostSaver/` |
| PC | `~/GhostSaver/` |

---

## 🔐 Seguridad

- El bot **ignora en silencio** cualquier mensaje que no sea del owner o del super owner.
- Las credenciales de sesión viven en `auth_info/`, excluido del repositorio con `.gitignore`.
- El `superOwner` está definido en `config.ts` para que siempre tenga acceso.

---

## 🛠️ Tecnologías

| Área | Herramienta |
|------|-------------|
| Runtime | Node.js 20+ con `tsx` |
| WhatsApp | `ultra-baileys` |
| Lenguaje | TypeScript estricto |
| Persistencia | `settings.json` (JSON plano) |
| Procesos | PM2 (opcional, recomendado) |

---

## 👻 Créditos

<div align="center">

Desarrollado por **[BrayanRK](https://github.com/BrayanRK)**

GhostSaver v2.0 — All rights reserved

</div>
