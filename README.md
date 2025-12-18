# Defigma Web Server

A web server designed to facilitate quick and easy interaction with the Figma plugin **Defigma**.

## 🔗 Figma Plugin

- **Defigma**: [@Defigma Plugin](https://www.figma.com/community/plugin/1521829986293932983)

## 🚀 Quick Start

### Option 1: Running with PM2 (Recommended)

For the best experience with advanced features and post-processing capabilities:

1. **Prerequisites**

   ```bash
   npm install -g pm2
   npm install
   ```

2. **Start the server**

   **Basic launch (without post-processing):**

   ```bash
   pm2 start $HOME/figma_plugins/Defigma_Web_Server/index.js --name defigma_web_server -- $PWD
   ```

   **Launch with post-processing command:**

   ```bash
   pm2 start $HOME/figma_plugins/Defigma_Web_Server/index.js --name defigma_web_server -- $PWD "$PWD/init_default_gui_script.py"
   ```

   > **Note:** The second argument is optional. It specifies a command that will be executed each time after files are transferred from Figma to the web server. For example, you can use it to run a script that processes the received files.

3. **Create a launcher script**

   You can create a convenient launcher script file (e.g., `start_project.sh`) with the following content:

   ```bash
   pm2 delete defigma_web_server
   pm2 start $HOME/figma_plugins/Defigma_Web_Server/index.js --name defigma_web_server -- $PWD
   ```

4. In Figma, click the **"Send to Web Server"** button in the plugin interface
5. ✅ All required files will automatically save to their designated directories

### Option 2: Using Pre-built Executable

If you prefer a simple executable file:

1. Download the `.exe` file from the [Releases](../../releases) page
2. Launch the web server using the command:

   **Manual Launch:**

   ```bash
   ./defigma_web_server.exe D:\defold_projects\My_Project
   ```

   > Replace the second argument with your Defold project path

   **Double-Click Launch:**

   - Put the exe file in the path C:\defigma_web_server.exe
   - Place the included batch script from releases [Releases](../../releases) in the root folder of the Defold project
   - Use a batch script for easy double-click execution
   - No command line required!

3. In Figma, click the **"Send to Web Server"** button in the plugin interface
4. ✅ All required files will automatically save to their designated directories

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
