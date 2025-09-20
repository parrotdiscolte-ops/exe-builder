using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Threading;
using System.Security.Cryptography;
using Newtonsoft.Json;

namespace NetworkAnalyzer
{
    public partial class MainForm : Form
    {
        private bool isDarkMode = false;
        private bool isCapturing = false;
        private bool isProxyRunning = false;
        private bool isEmulatorRunning = false;
        private List<PacketInfo> capturedPackets = new List<PacketInfo>();
        private List<SessionInfo> sessions = new List<SessionInfo>();

        public MainForm()
        {
            InitializeComponent();
            InitializeListViews();
            UpdateStatus("NetworkAnalyzer ready");
        }

        private void InitializeListViews()
        {
            // Setup capture list view columns
            captureListView.Columns.Add("Time", 100);
            captureListView.Columns.Add("Protocol", 80);
            captureListView.Columns.Add("Source", 120);
            captureListView.Columns.Add("Destination", 120);
            captureListView.Columns.Add("Length", 80);
            captureListView.Columns.Add("Info", 200);

            // Setup session list view columns
            sessionListView.Columns.Add("Session ID", 100);
            sessionListView.Columns.Add("Start Time", 120);
            sessionListView.Columns.Add("Duration", 80);
            sessionListView.Columns.Add("Packets", 80);
            sessionListView.Columns.Add("Size", 80);
            sessionListView.Columns.Add("Status", 80);
        }

        private void UpdateStatus(string message)
        {
            statusLabel.Text = message;
        }

        private void captureButton_Click(object sender, EventArgs e)
        {
            if (!isCapturing)
            {
                StartCapture();
            }
            else
            {
                StopCapture();
            }
        }

        private void StartCapture()
        {
            isCapturing = true;
            captureButton.Text = "Stop Capture";
            UpdateStatus("Packet capture started");
            
            // Simulate packet capture
            Task.Run(() => SimulatePacketCapture());
        }

        private void StopCapture()
        {
            isCapturing = false;
            captureButton.Text = "Start Capture";
            UpdateStatus("Packet capture stopped");
        }

        private void SimulatePacketCapture()
        {
            Random rand = new Random();
            string[] protocols = { "HTTP", "HTTPS", "TCP", "UDP", "DNS", "ARP" };
            
            while (isCapturing)
            {
                var packet = new PacketInfo
                {
                    Time = DateTime.Now,
                    Protocol = protocols[rand.Next(protocols.Length)],
                    Source = $"192.168.1.{rand.Next(1, 255)}",
                    Destination = $"192.168.1.{rand.Next(1, 255)}",
                    Length = rand.Next(64, 1500),
                    Info = $"Sample packet data {rand.Next(1000, 9999)}"
                };

                capturedPackets.Add(packet);

                Invoke(new Action(() =>
                {
                    var item = new ListViewItem(packet.Time.ToString("HH:mm:ss.fff"));
                    item.SubItems.Add(packet.Protocol);
                    item.SubItems.Add(packet.Source);
                    item.SubItems.Add(packet.Destination);
                    item.SubItems.Add(packet.Length.ToString());
                    item.SubItems.Add(packet.Info);
                    captureListView.Items.Add(item);

                    // Auto scroll to bottom
                    if (captureListView.Items.Count > 0)
                    {
                        captureListView.Items[captureListView.Items.Count - 1].EnsureVisible();
                    }
                }));

                Thread.Sleep(rand.Next(100, 1000)); // Random delay
            }
        }

        private void injectorButton_Click(object sender, EventArgs e)
        {
            string dllPath = injectorTextBox.Text;
            if (string.IsNullOrEmpty(dllPath))
            {
                MessageBox.Show("Please specify DLL path", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            // Simulate DLL injection
            UpdateStatus($"Attempting DLL injection: {Path.GetFileName(dllPath)}");
            MessageBox.Show($"DLL injection simulated for: {Path.GetFileName(dllPath)}", 
                          "Injector", MessageBoxButtons.OK, MessageBoxIcon.Information);
            UpdateStatus("DLL injection completed (simulated)");
        }

        private void proxyStartButton_Click(object sender, EventArgs e)
        {
            if (!isProxyRunning)
            {
                StartProxy();
            }
            else
            {
                StopProxy();
            }
        }

        private void StartProxy()
        {
            if (!int.TryParse(proxyPortTextBox.Text, out int port) || port <= 0 || port > 65535)
            {
                MessageBox.Show("Invalid port number", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            isProxyRunning = true;
            proxyStartButton.Text = "Stop Proxy";
            UpdateStatus($"MITM Proxy started on port {port}");
        }

        private void StopProxy()
        {
            isProxyRunning = false;
            proxyStartButton.Text = "Start Proxy";
            UpdateStatus("MITM Proxy stopped");
        }

        private void emulatorStartButton_Click(object sender, EventArgs e)
        {
            if (!isEmulatorRunning)
            {
                StartEmulator();
            }
            else
            {
                StopEmulator();
            }
        }

        private void StartEmulator()
        {
            if (!int.TryParse(emulatorPortTextBox.Text, out int port) || port <= 0 || port > 65535)
            {
                MessageBox.Show("Invalid port number", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            isEmulatorRunning = true;
            emulatorStartButton.Text = "Stop Emulator";
            UpdateStatus($"Server emulator started on port {port}");
        }

        private void StopEmulator()
        {
            isEmulatorRunning = false;
            emulatorStartButton.Text = "Start Emulator";
            UpdateStatus("Server emulator stopped");
        }

        private void exportSessionToolStripMenuItem_Click(object sender, EventArgs e)
        {
            using (SaveFileDialog sfd = new SaveFileDialog())
            {
                sfd.Filter = "JSON files (*.json)|*.json|HAR files (*.har)|*.har|All files (*.*)|*.*";
                sfd.DefaultExt = "json";
                
                if (sfd.ShowDialog() == DialogResult.OK)
                {
                    try
                    {
                        var sessionData = new
                        {
                            sessions = sessions,
                            packets = capturedPackets,
                            exportTime = DateTime.Now,
                            version = "1.0"
                        };

                        string json = JsonConvert.SerializeObject(sessionData, Formatting.Indented);
                        File.WriteAllText(sfd.FileName, json);
                        
                        UpdateStatus($"Session exported to {Path.GetFileName(sfd.FileName)}");
                        MessageBox.Show("Session exported successfully!", "Export", 
                                      MessageBoxButtons.OK, MessageBoxIcon.Information);
                    }
                    catch (Exception ex)
                    {
                        MessageBox.Show($"Export failed: {ex.Message}", "Error", 
                                      MessageBoxButtons.OK, MessageBoxIcon.Error);
                    }
                }
            }
        }

        private void importSessionToolStripMenuItem_Click(object sender, EventArgs e)
        {
            using (OpenFileDialog ofd = new OpenFileDialog())
            {
                ofd.Filter = "JSON files (*.json)|*.json|HAR files (*.har)|*.har|All files (*.*)|*.*";
                
                if (ofd.ShowDialog() == DialogResult.OK)
                {
                    try
                    {
                        string json = File.ReadAllText(ofd.FileName);
                        dynamic sessionData = JsonConvert.DeserializeObject(json);
                        
                        UpdateStatus($"Session imported from {Path.GetFileName(ofd.FileName)}");
                        MessageBox.Show("Session imported successfully!", "Import", 
                                      MessageBoxButtons.OK, MessageBoxIcon.Information);
                    }
                    catch (Exception ex)
                    {
                        MessageBox.Show($"Import failed: {ex.Message}", "Error", 
                                      MessageBoxButtons.OK, MessageBoxIcon.Error);
                    }
                }
            }
        }

        private void base64ToolStripMenuItem_Click(object sender, EventArgs e)
        {
            string input = Microsoft.VisualBasic.Interaction.InputBox(
                "Enter text to encode/decode:", "Base64 Tool", "");
            
            if (!string.IsNullOrEmpty(input))
            {
                try
                {
                    // Try to decode first (assume it's base64)
                    byte[] data = Convert.FromBase64String(input);
                    string decoded = Encoding.UTF8.GetString(data);
                    MessageBox.Show($"Decoded: {decoded}", "Base64 Result");
                }
                catch
                {
                    // If decode fails, encode it
                    byte[] data = Encoding.UTF8.GetBytes(input);
                    string encoded = Convert.ToBase64String(data);
                    MessageBox.Show($"Encoded: {encoded}", "Base64 Result");
                }
            }
        }

        private void hashCalculatorToolStripMenuItem_Click(object sender, EventArgs e)
        {
            string input = Microsoft.VisualBasic.Interaction.InputBox(
                "Enter text to hash:", "Hash Calculator", "");
            
            if (!string.IsNullOrEmpty(input))
            {
                byte[] data = Encoding.UTF8.GetBytes(input);
                
                using (MD5 md5 = MD5.Create())
                using (SHA1 sha1 = SHA1.Create())
                using (SHA256 sha256 = SHA256.Create())
                {
                    string md5Hash = BitConverter.ToString(md5.ComputeHash(data)).Replace("-", "").ToLower();
                    string sha1Hash = BitConverter.ToString(sha1.ComputeHash(data)).Replace("-", "").ToLower();
                    string sha256Hash = BitConverter.ToString(sha256.ComputeHash(data)).Replace("-", "").ToLower();
                    
                    string result = $"MD5: {md5Hash}\nSHA1: {sha1Hash}\nSHA256: {sha256Hash}";
                    MessageBox.Show(result, "Hash Results");
                }
            }
        }

        private void darkModeToolStripMenuItem_Click(object sender, EventArgs e)
        {
            isDarkMode = !isDarkMode;
            ApplyTheme();
            UpdateStatus(isDarkMode ? "Dark mode enabled" : "Light mode enabled");
        }

        private void ApplyTheme()
        {
            if (isDarkMode)
            {
                this.BackColor = Color.FromArgb(45, 45, 48);
                this.ForeColor = Color.White;
                tabControl1.BackColor = Color.FromArgb(37, 37, 38);
                
                foreach (TabPage tab in tabControl1.TabPages)
                {
                    tab.BackColor = Color.FromArgb(45, 45, 48);
                    tab.ForeColor = Color.White;
                }
            }
            else
            {
                this.BackColor = SystemColors.Control;
                this.ForeColor = SystemColors.ControlText;
                tabControl1.BackColor = SystemColors.Control;
                
                foreach (TabPage tab in tabControl1.TabPages)
                {
                    tab.BackColor = SystemColors.Control;
                    tab.ForeColor = SystemColors.ControlText;
                }
            }
        }

        private void fullScreenToolStripMenuItem_Click(object sender, EventArgs e)
        {
            if (this.WindowState == FormWindowState.Maximized && this.FormBorderStyle == FormBorderStyle.None)
            {
                this.FormBorderStyle = FormBorderStyle.Sizable;
                this.WindowState = FormWindowState.Maximized;
                fullScreenToolStripMenuItem.Text = "Full Screen";
            }
            else
            {
                this.FormBorderStyle = FormBorderStyle.None;
                this.WindowState = FormWindowState.Maximized;
                fullScreenToolStripMenuItem.Text = "Exit Full Screen";
            }
        }
    }

    public class PacketInfo
    {
        public DateTime Time { get; set; }
        public string Protocol { get; set; }
        public string Source { get; set; }
        public string Destination { get; set; }
        public int Length { get; set; }
        public string Info { get; set; }
    }

    public class SessionInfo
    {
        public string SessionId { get; set; }
        public DateTime StartTime { get; set; }
        public TimeSpan Duration { get; set; }
        public int PacketCount { get; set; }
        public long TotalSize { get; set; }
        public string Status { get; set; }
    }
}