# Defigma Web Server

A web server designed to facilitate quick and easy interaction with the Figma plugin **Defigma**.

## 🔗 Figma Plugin

- **Defigma**: [@Defigma Plugin](https://www.figma.com/community/plugin/1521829986293932983)

## 🚀 Quick Start

### Option 1: Using Pre-built Executable

1. Download the `.exe` file from the [Releases](../../releases) page
2. Launch the web server using the command:

   **Manual Launch:**

   ```bash
   ./defigma_web_server.exe D:\defold_projects\Futdits
   ```

   > Replace the second argument with your Defold project path

   **Double-Click Launch:**

   - Put the exe file in the path C:\defigma_web_server.exe
   - Place the included batch script from releases [Releases](../../releases) in the root folder of the Defold project
   - Use a batch script for easy double-click execution
   - No command line required!

   **Auto-Start with Windows:**

   - Set up automatic startup using Windows Task Scheduler
   - Server starts automatically when you log into Windows
   - No manual intervention needed

3. In Figma, click the **"Send to Web Server"** button in the plugin interface
4. ✅ All required files will automatically save to their designated directories

### Option 2: Running from Source with PM2

If you prefer to run the server from source code using PM2:

1. **Prerequisites**

   ```bash
   npm install -g pm2
   npm install
   ```

2. **Configuration**

   - Update the `cwd` parameter in `ecosystem.config.js` to your Defold project path

3. **Start the server**

   ```bash
   pm2 start ecosystem.config.js
   ```

4. **Monitor the server**
   ```bash
   pm2 status
   pm2 logs defigma-web-server
   ```

## 📁 Project Structure

```
defigma_web_server/
├── index.js                    # Main server file
├── package.json                # Node.js dependencies
├── ecosystem.config.js         # PM2 configuration
└── README.md                   # This file
```

## 🔧 Configuration

The server configuration can be modified in:

- **PM2 Mode**: `ecosystem.config.js`
- **Direct Mode**: Command line arguments

## 📋 Requirements

- **Node.js** (for running from source)
- **PM2** (optional, for process management)
- **Defold Project** (target directory for exported files)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues & Support

If you encounter any issues or need support:

- Check the [Issues](../../issues) page
- Create a new issue with detailed information about your problem
