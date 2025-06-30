# Zephyr Web Server

A web server designed to facilitate quick and easy interaction with the Figma plugins **Zephyr** and **Zephyr Export**.

## 🔗 Figma Plugins

- **Zephyr**: [@Zephyr Plugin](https://www.figma.com/community/plugin/1232708359967478769)
- **Zephyr Export**: [@Zephyr Export Plugin](https://www.figma.com/community/plugin/1510209259209361431)

> **Note**: While Zephyr support is not yet available (coming soon!), the web server works seamlessly with Zephyr Export.

## 🚀 Quick Start

### Option 1: Using Pre-built Executable

1. Download the `.exe` file from the [Releases](../../releases) page
2. Launch the web server using the command:

   ```bash
   ./zephyr_web_server.exe D:\defold_projects\Futdits
   ```

   > Replace the second argument with your Defold project path

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
   pm2 logs zephyr-web-server
   ```

## 📁 Project Structure

```
zephyr_web_server/
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

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues & Support

If you encounter any issues or need support:

- Check the [Issues](../../issues) page
- Create a new issue with detailed information about your problem

## 🔮 Coming Soon

- **Zephyr Plugin Support** - Full integration with the main Zephyr plugin
