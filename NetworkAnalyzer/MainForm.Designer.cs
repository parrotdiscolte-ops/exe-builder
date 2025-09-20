namespace NetworkAnalyzer
{
    partial class MainForm
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.tabControl1 = new System.Windows.Forms.TabControl();
            this.captureTab = new System.Windows.Forms.TabPage();
            this.injectorTab = new System.Windows.Forms.TabPage();
            this.proxyTab = new System.Windows.Forms.TabPage();
            this.analyzerTab = new System.Windows.Forms.TabPage();
            this.sessionsTab = new System.Windows.Forms.TabPage();
            this.emulatorTab = new System.Windows.Forms.TabPage();
            this.hexEditorTab = new System.Windows.Forms.TabPage();
            this.menuStrip1 = new System.Windows.Forms.MenuStrip();
            this.fileToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.exportSessionToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.importSessionToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.toolsToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.base64ToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.hashCalculatorToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.viewToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.darkModeToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.fullScreenToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.statusStrip1 = new System.Windows.Forms.StatusStrip();
            this.statusLabel = new System.Windows.Forms.ToolStripStatusLabel();
            this.captureButton = new System.Windows.Forms.Button();
            this.captureListView = new System.Windows.Forms.ListView();
            this.injectorTextBox = new System.Windows.Forms.TextBox();
            this.injectorButton = new System.Windows.Forms.Button();
            this.proxyPortTextBox = new System.Windows.Forms.TextBox();
            this.proxyStartButton = new System.Windows.Forms.Button();
            this.analyzerTextArea = new System.Windows.Forms.TextBox();
            this.sessionListView = new System.Windows.Forms.ListView();
            this.emulatorPortTextBox = new System.Windows.Forms.TextBox();
            this.emulatorStartButton = new System.Windows.Forms.Button();
            this.hexTextBox = new System.Windows.Forms.TextBox();
            this.tabControl1.SuspendLayout();
            this.captureTab.SuspendLayout();
            this.injectorTab.SuspendLayout();
            this.proxyTab.SuspendLayout();
            this.analyzerTab.SuspendLayout();
            this.sessionsTab.SuspendLayout();
            this.emulatorTab.SuspendLayout();
            this.hexEditorTab.SuspendLayout();
            this.menuStrip1.SuspendLayout();
            this.statusStrip1.SuspendLayout();
            this.SuspendLayout();
            // 
            // tabControl1
            // 
            this.tabControl1.Controls.Add(this.captureTab);
            this.tabControl1.Controls.Add(this.injectorTab);
            this.tabControl1.Controls.Add(this.proxyTab);
            this.tabControl1.Controls.Add(this.analyzerTab);
            this.tabControl1.Controls.Add(this.sessionsTab);
            this.tabControl1.Controls.Add(this.emulatorTab);
            this.tabControl1.Controls.Add(this.hexEditorTab);
            this.tabControl1.Dock = System.Windows.Forms.DockStyle.Fill;
            this.tabControl1.Location = new System.Drawing.Point(0, 24);
            this.tabControl1.Name = "tabControl1";
            this.tabControl1.SelectedIndex = 0;
            this.tabControl1.Size = new System.Drawing.Size(800, 404);
            this.tabControl1.TabIndex = 0;
            // 
            // captureTab
            // 
            this.captureTab.Controls.Add(this.captureListView);
            this.captureTab.Controls.Add(this.captureButton);
            this.captureTab.Location = new System.Drawing.Point(4, 22);
            this.captureTab.Name = "captureTab";
            this.captureTab.Padding = new System.Windows.Forms.Padding(3);
            this.captureTab.Size = new System.Drawing.Size(792, 378);
            this.captureTab.TabIndex = 0;
            this.captureTab.Text = "Capture";
            this.captureTab.UseVisualStyleBackColor = true;
            // 
            // injectorTab
            // 
            this.injectorTab.Controls.Add(this.injectorButton);
            this.injectorTab.Controls.Add(this.injectorTextBox);
            this.injectorTab.Location = new System.Drawing.Point(4, 22);
            this.injectorTab.Name = "injectorTab";
            this.injectorTab.Padding = new System.Windows.Forms.Padding(3);
            this.injectorTab.Size = new System.Drawing.Size(792, 378);
            this.injectorTab.TabIndex = 1;
            this.injectorTab.Text = "Injector";
            this.injectorTab.UseVisualStyleBackColor = true;
            // 
            // proxyTab
            // 
            this.proxyTab.Controls.Add(this.proxyStartButton);
            this.proxyTab.Controls.Add(this.proxyPortTextBox);
            this.proxyTab.Location = new System.Drawing.Point(4, 22);
            this.proxyTab.Name = "proxyTab";
            this.proxyTab.Size = new System.Drawing.Size(792, 378);
            this.proxyTab.TabIndex = 2;
            this.proxyTab.Text = "Proxy";
            this.proxyTab.UseVisualStyleBackColor = true;
            // 
            // analyzerTab
            // 
            this.analyzerTab.Controls.Add(this.analyzerTextArea);
            this.analyzerTab.Location = new System.Drawing.Point(4, 22);
            this.analyzerTab.Name = "analyzerTab";
            this.analyzerTab.Size = new System.Drawing.Size(792, 378);
            this.analyzerTab.TabIndex = 3;
            this.analyzerTab.Text = "Analyzer";
            this.analyzerTab.UseVisualStyleBackColor = true;
            // 
            // sessionsTab
            // 
            this.sessionsTab.Controls.Add(this.sessionListView);
            this.sessionsTab.Location = new System.Drawing.Point(4, 22);
            this.sessionsTab.Name = "sessionsTab";
            this.sessionsTab.Size = new System.Drawing.Size(792, 378);
            this.sessionsTab.TabIndex = 4;
            this.sessionsTab.Text = "Sessions";
            this.sessionsTab.UseVisualStyleBackColor = true;
            // 
            // emulatorTab
            // 
            this.emulatorTab.Controls.Add(this.emulatorStartButton);
            this.emulatorTab.Controls.Add(this.emulatorPortTextBox);
            this.emulatorTab.Location = new System.Drawing.Point(4, 22);
            this.emulatorTab.Name = "emulatorTab";
            this.emulatorTab.Size = new System.Drawing.Size(792, 378);
            this.emulatorTab.TabIndex = 5;
            this.emulatorTab.Text = "Emulator";
            this.emulatorTab.UseVisualStyleBackColor = true;
            // 
            // hexEditorTab
            // 
            this.hexEditorTab.Controls.Add(this.hexTextBox);
            this.hexEditorTab.Location = new System.Drawing.Point(4, 22);
            this.hexEditorTab.Name = "hexEditorTab";
            this.hexEditorTab.Size = new System.Drawing.Size(792, 378);
            this.hexEditorTab.TabIndex = 6;
            this.hexEditorTab.Text = "Hex Editor";
            this.hexEditorTab.UseVisualStyleBackColor = true;
            // 
            // menuStrip1
            // 
            this.menuStrip1.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.fileToolStripMenuItem,
            this.toolsToolStripMenuItem,
            this.viewToolStripMenuItem});
            this.menuStrip1.Location = new System.Drawing.Point(0, 0);
            this.menuStrip1.Name = "menuStrip1";
            this.menuStrip1.Size = new System.Drawing.Size(800, 24);
            this.menuStrip1.TabIndex = 1;
            this.menuStrip1.Text = "menuStrip1";
            // 
            // fileToolStripMenuItem
            // 
            this.fileToolStripMenuItem.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.exportSessionToolStripMenuItem,
            this.importSessionToolStripMenuItem});
            this.fileToolStripMenuItem.Name = "fileToolStripMenuItem";
            this.fileToolStripMenuItem.Size = new System.Drawing.Size(37, 20);
            this.fileToolStripMenuItem.Text = "File";
            // 
            // exportSessionToolStripMenuItem
            // 
            this.exportSessionToolStripMenuItem.Name = "exportSessionToolStripMenuItem";
            this.exportSessionToolStripMenuItem.Size = new System.Drawing.Size(155, 22);
            this.exportSessionToolStripMenuItem.Text = "Export Session...";
            this.exportSessionToolStripMenuItem.Click += new System.EventHandler(this.exportSessionToolStripMenuItem_Click);
            // 
            // importSessionToolStripMenuItem
            // 
            this.importSessionToolStripMenuItem.Name = "importSessionToolStripMenuItem";
            this.importSessionToolStripMenuItem.Size = new System.Drawing.Size(155, 22);
            this.importSessionToolStripMenuItem.Text = "Import Session...";
            this.importSessionToolStripMenuItem.Click += new System.EventHandler(this.importSessionToolStripMenuItem_Click);
            // 
            // toolsToolStripMenuItem
            // 
            this.toolsToolStripMenuItem.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.base64ToolStripMenuItem,
            this.hashCalculatorToolStripMenuItem});
            this.toolsToolStripMenuItem.Name = "toolsToolStripMenuItem";
            this.toolsToolStripMenuItem.Size = new System.Drawing.Size(46, 20);
            this.toolsToolStripMenuItem.Text = "Tools";
            // 
            // base64ToolStripMenuItem
            // 
            this.base64ToolStripMenuItem.Name = "base64ToolStripMenuItem";
            this.base64ToolStripMenuItem.Size = new System.Drawing.Size(156, 22);
            this.base64ToolStripMenuItem.Text = "Base64 Encoder";
            this.base64ToolStripMenuItem.Click += new System.EventHandler(this.base64ToolStripMenuItem_Click);
            // 
            // hashCalculatorToolStripMenuItem
            // 
            this.hashCalculatorToolStripMenuItem.Name = "hashCalculatorToolStripMenuItem";
            this.hashCalculatorToolStripMenuItem.Size = new System.Drawing.Size(156, 22);
            this.hashCalculatorToolStripMenuItem.Text = "Hash Calculator";
            this.hashCalculatorToolStripMenuItem.Click += new System.EventHandler(this.hashCalculatorToolStripMenuItem_Click);
            // 
            // viewToolStripMenuItem
            // 
            this.viewToolStripMenuItem.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.darkModeToolStripMenuItem,
            this.fullScreenToolStripMenuItem});
            this.viewToolStripMenuItem.Name = "viewToolStripMenuItem";
            this.viewToolStripMenuItem.Size = new System.Drawing.Size(44, 20);
            this.viewToolStripMenuItem.Text = "View";
            // 
            // darkModeToolStripMenuItem
            // 
            this.darkModeToolStripMenuItem.Name = "darkModeToolStripMenuItem";
            this.darkModeToolStripMenuItem.Size = new System.Drawing.Size(132, 22);
            this.darkModeToolStripMenuItem.Text = "Dark Mode";
            this.darkModeToolStripMenuItem.Click += new System.EventHandler(this.darkModeToolStripMenuItem_Click);
            // 
            // fullScreenToolStripMenuItem
            // 
            this.fullScreenToolStripMenuItem.Name = "fullScreenToolStripMenuItem";
            this.fullScreenToolStripMenuItem.Size = new System.Drawing.Size(132, 22);
            this.fullScreenToolStripMenuItem.Text = "Full Screen";
            this.fullScreenToolStripMenuItem.Click += new System.EventHandler(this.fullScreenToolStripMenuItem_Click);
            // 
            // statusStrip1
            // 
            this.statusStrip1.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.statusLabel});
            this.statusStrip1.Location = new System.Drawing.Point(0, 428);
            this.statusStrip1.Name = "statusStrip1";
            this.statusStrip1.Size = new System.Drawing.Size(800, 22);
            this.statusStrip1.TabIndex = 2;
            this.statusStrip1.Text = "statusStrip1";
            // 
            // statusLabel
            // 
            this.statusLabel.Name = "statusLabel";
            this.statusLabel.Size = new System.Drawing.Size(39, 17);
            this.statusLabel.Text = "Ready";
            // 
            // captureButton
            // 
            this.captureButton.Location = new System.Drawing.Point(6, 6);
            this.captureButton.Name = "captureButton";
            this.captureButton.Size = new System.Drawing.Size(100, 23);
            this.captureButton.TabIndex = 0;
            this.captureButton.Text = "Start Capture";
            this.captureButton.UseVisualStyleBackColor = true;
            this.captureButton.Click += new System.EventHandler(this.captureButton_Click);
            // 
            // captureListView
            // 
            this.captureListView.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.captureListView.Location = new System.Drawing.Point(6, 35);
            this.captureListView.Name = "captureListView";
            this.captureListView.Size = new System.Drawing.Size(780, 337);
            this.captureListView.TabIndex = 1;
            this.captureListView.UseCompatibleStateImageBehavior = false;
            this.captureListView.View = System.Windows.Forms.View.Details;
            // 
            // injectorTextBox
            // 
            this.injectorTextBox.Location = new System.Drawing.Point(6, 6);
            this.injectorTextBox.Name = "injectorTextBox";
            this.injectorTextBox.Size = new System.Drawing.Size(200, 20);
            this.injectorTextBox.TabIndex = 0;
            this.injectorTextBox.Text = "C:\\\\path\\\\to\\\\dll.dll";
            // 
            // injectorButton
            // 
            this.injectorButton.Location = new System.Drawing.Point(212, 4);
            this.injectorButton.Name = "injectorButton";
            this.injectorButton.Size = new System.Drawing.Size(75, 23);
            this.injectorButton.TabIndex = 1;
            this.injectorButton.Text = "Inject DLL";
            this.injectorButton.UseVisualStyleBackColor = true;
            this.injectorButton.Click += new System.EventHandler(this.injectorButton_Click);
            // 
            // proxyPortTextBox
            // 
            this.proxyPortTextBox.Location = new System.Drawing.Point(6, 6);
            this.proxyPortTextBox.Name = "proxyPortTextBox";
            this.proxyPortTextBox.Size = new System.Drawing.Size(100, 20);
            this.proxyPortTextBox.TabIndex = 0;
            this.proxyPortTextBox.Text = "8080";
            // 
            // proxyStartButton
            // 
            this.proxyStartButton.Location = new System.Drawing.Point(112, 4);
            this.proxyStartButton.Name = "proxyStartButton";
            this.proxyStartButton.Size = new System.Drawing.Size(75, 23);
            this.proxyStartButton.TabIndex = 1;
            this.proxyStartButton.Text = "Start Proxy";
            this.proxyStartButton.UseVisualStyleBackColor = true;
            this.proxyStartButton.Click += new System.EventHandler(this.proxyStartButton_Click);
            // 
            // analyzerTextArea
            // 
            this.analyzerTextArea.Dock = System.Windows.Forms.DockStyle.Fill;
            this.analyzerTextArea.Font = new System.Drawing.Font("Consolas", 9F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.analyzerTextArea.Location = new System.Drawing.Point(0, 0);
            this.analyzerTextArea.Multiline = true;
            this.analyzerTextArea.Name = "analyzerTextArea";
            this.analyzerTextArea.ScrollBars = System.Windows.Forms.ScrollBars.Both;
            this.analyzerTextArea.Size = new System.Drawing.Size(792, 378);
            this.analyzerTextArea.TabIndex = 0;
            this.analyzerTextArea.Text = "Protocol analysis results will appear here...";
            // 
            // sessionListView
            // 
            this.sessionListView.Dock = System.Windows.Forms.DockStyle.Fill;
            this.sessionListView.Location = new System.Drawing.Point(0, 0);
            this.sessionListView.Name = "sessionListView";
            this.sessionListView.Size = new System.Drawing.Size(792, 378);
            this.sessionListView.TabIndex = 0;
            this.sessionListView.UseCompatibleStateImageBehavior = false;
            this.sessionListView.View = System.Windows.Forms.View.Details;
            // 
            // emulatorPortTextBox
            // 
            this.emulatorPortTextBox.Location = new System.Drawing.Point(6, 6);
            this.emulatorPortTextBox.Name = "emulatorPortTextBox";
            this.emulatorPortTextBox.Size = new System.Drawing.Size(100, 20);
            this.emulatorPortTextBox.TabIndex = 0;
            this.emulatorPortTextBox.Text = "9999";
            // 
            // emulatorStartButton
            // 
            this.emulatorStartButton.Location = new System.Drawing.Point(112, 4);
            this.emulatorStartButton.Name = "emulatorStartButton";
            this.emulatorStartButton.Size = new System.Drawing.Size(100, 23);
            this.emulatorStartButton.TabIndex = 1;
            this.emulatorStartButton.Text = "Start Emulator";
            this.emulatorStartButton.UseVisualStyleBackColor = true;
            this.emulatorStartButton.Click += new System.EventHandler(this.emulatorStartButton_Click);
            // 
            // hexTextBox
            // 
            this.hexTextBox.Dock = System.Windows.Forms.DockStyle.Fill;
            this.hexTextBox.Font = new System.Drawing.Font("Consolas", 9F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.hexTextBox.Location = new System.Drawing.Point(0, 0);
            this.hexTextBox.Multiline = true;
            this.hexTextBox.Name = "hexTextBox";
            this.hexTextBox.ScrollBars = System.Windows.Forms.ScrollBars.Both;
            this.hexTextBox.Size = new System.Drawing.Size(792, 378);
            this.hexTextBox.TabIndex = 0;
            this.hexTextBox.Text = "00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F";
            // 
            // MainForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(800, 450);
            this.Controls.Add(this.tabControl1);
            this.Controls.Add(this.statusStrip1);
            this.Controls.Add(this.menuStrip1);
            this.MainMenuStrip = this.menuStrip1;
            this.Name = "MainForm";
            this.Text = "NetworkAnalyzer v1.0";
            this.WindowState = System.Windows.Forms.FormWindowState.Maximized;
            this.tabControl1.ResumeLayout(false);
            this.captureTab.ResumeLayout(false);
            this.injectorTab.ResumeLayout(false);
            this.injectorTab.PerformLayout();
            this.proxyTab.ResumeLayout(false);
            this.proxyTab.PerformLayout();
            this.analyzerTab.ResumeLayout(false);
            this.analyzerTab.PerformLayout();
            this.sessionsTab.ResumeLayout(false);
            this.emulatorTab.ResumeLayout(false);
            this.emulatorTab.PerformLayout();
            this.hexEditorTab.ResumeLayout(false);
            this.hexEditorTab.PerformLayout();
            this.menuStrip1.ResumeLayout(false);
            this.menuStrip1.PerformLayout();
            this.statusStrip1.ResumeLayout(false);
            this.statusStrip1.PerformLayout();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.TabControl tabControl1;
        private System.Windows.Forms.TabPage captureTab;
        private System.Windows.Forms.TabPage injectorTab;
        private System.Windows.Forms.TabPage proxyTab;
        private System.Windows.Forms.TabPage analyzerTab;
        private System.Windows.Forms.TabPage sessionsTab;
        private System.Windows.Forms.TabPage emulatorTab;
        private System.Windows.Forms.TabPage hexEditorTab;
        private System.Windows.Forms.MenuStrip menuStrip1;
        private System.Windows.Forms.ToolStripMenuItem fileToolStripMenuItem;
        private System.Windows.Forms.ToolStripMenuItem exportSessionToolStripMenuItem;
        private System.Windows.Forms.ToolStripMenuItem importSessionToolStripMenuItem;
        private System.Windows.Forms.ToolStripMenuItem toolsToolStripMenuItem;
        private System.Windows.Forms.ToolStripMenuItem base64ToolStripMenuItem;
        private System.Windows.Forms.ToolStripMenuItem hashCalculatorToolStripMenuItem;
        private System.Windows.Forms.ToolStripMenuItem viewToolStripMenuItem;
        private System.Windows.Forms.ToolStripMenuItem darkModeToolStripMenuItem;
        private System.Windows.Forms.ToolStripMenuItem fullScreenToolStripMenuItem;
        private System.Windows.Forms.StatusStrip statusStrip1;
        private System.Windows.Forms.ToolStripStatusLabel statusLabel;
        private System.Windows.Forms.Button captureButton;
        private System.Windows.Forms.ListView captureListView;
        private System.Windows.Forms.TextBox injectorTextBox;
        private System.Windows.Forms.Button injectorButton;
        private System.Windows.Forms.TextBox proxyPortTextBox;
        private System.Windows.Forms.Button proxyStartButton;
        private System.Windows.Forms.TextBox analyzerTextArea;
        private System.Windows.Forms.ListView sessionListView;
        private System.Windows.Forms.TextBox emulatorPortTextBox;
        private System.Windows.Forms.Button emulatorStartButton;
        private System.Windows.Forms.TextBox hexTextBox;
    }
}