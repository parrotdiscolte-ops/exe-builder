/**
 * NetworkAnalyzer - Modern C++ Code Builder
 * Interactive functionality for the web interface
 */

class NetworkAnalyzer {
    constructor() {
        this.editor = null;
        this.isCompiling = false;
        this.init();
    }

    init() {
        this.initializeEditor();
        this.bindEvents();
        this.setupKeyboardShortcuts();
        this.setupAccessibility();
        console.log('NetworkAnalyzer initialized successfully');
    }

    /**
     * Initialize CodeMirror editor with C++ syntax highlighting
     */
    initializeEditor() {
        const textarea = document.getElementById('codeEditor');
        
        if (typeof CodeMirror !== 'undefined') {
            this.editor = CodeMirror.fromTextArea(textarea, {
                mode: 'text/x-c++src',
                theme: 'default',
                lineNumbers: true,
                indentUnit: 4,
                tabSize: 4,
                indentWithTabs: false,
                lineWrapping: true,
                autoCloseBrackets: true,
                matchBrackets: true,
                styleActiveLine: true,
                extraKeys: {
                    'Ctrl-Enter': () => this.compileCode(),
                    'Ctrl-L': () => this.clearEditor(),
                    'F1': () => this.showHelp()
                }
            });
            
            // Set placeholder text
            this.editor.setValue('// Welcome to NetworkAnalyzer C++ Builder\n// Write your C++ code here and click "Compile Code" to build it\n\n#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}');
        } else {
            // Fallback for plain textarea
            textarea.value = '// Welcome to NetworkAnalyzer C++ Builder\n// Write your C++ code here and click "Compile Code" to build it\n\n#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}';
        }
    }

    /**
     * Bind event listeners to UI elements
     */
    bindEvents() {
        // Compile button
        const compileBtn = document.getElementById('compileBtn');
        if (compileBtn) {
            compileBtn.addEventListener('click', () => this.compileCode());
        }

        // Editor tools
        const clearBtn = document.getElementById('clearCode');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearEditor());
        }

        const sampleBtn = document.getElementById('loadSample');
        if (sampleBtn) {
            sampleBtn.addEventListener('click', () => this.loadSample());
        }

        // Modal controls
        const helpBtn = document.getElementById('helpBtn');
        const aboutBtn = document.getElementById('aboutBtn');
        const helpModal = document.getElementById('helpModal');
        const modalClose = helpModal?.querySelector('.modal-close');
        const modalBackdrop = helpModal?.querySelector('.modal-backdrop');

        if (helpBtn && helpModal) {
            helpBtn.addEventListener('click', () => this.showHelp());
        }

        if (aboutBtn) {
            aboutBtn.addEventListener('click', () => this.showAbout());
        }

        if (modalClose && helpModal) {
            modalClose.addEventListener('click', () => this.hideModal(helpModal));
        }

        if (modalBackdrop && helpModal) {
            modalBackdrop.addEventListener('click', () => this.hideModal(helpModal));
        }

        // Handle escape key for modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal.active');
                if (activeModal) {
                    this.hideModal(activeModal);
                }
            }
        });
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Enter to compile
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.compileCode();
            }
            
            // Ctrl+L to clear editor
            if (e.ctrlKey && e.key === 'l') {
                e.preventDefault();
                this.clearEditor();
            }
            
            // F1 for help
            if (e.key === 'F1') {
                e.preventDefault();
                this.showHelp();
            }
        });
    }

    /**
     * Setup accessibility features
     */
    setupAccessibility() {
        // Add aria-live region for dynamic content announcements
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'announcements';
        document.body.appendChild(liveRegion);
    }

    /**
     * Announce message to screen readers
     * @param {string} message - Message to announce
     */
    announce(message) {
        const liveRegion = document.getElementById('announcements');
        if (liveRegion) {
            liveRegion.textContent = message;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }

    /**
     * Get current code from editor
     * @returns {string} Current code content
     */
    getCurrentCode() {
        if (this.editor) {
            return this.editor.getValue();
        }
        const textarea = document.getElementById('codeEditor');
        return textarea ? textarea.value : '';
    }

    /**
     * Set code in editor
     * @param {string} code - Code to set in editor
     */
    setCode(code) {
        if (this.editor) {
            this.editor.setValue(code);
        } else {
            const textarea = document.getElementById('codeEditor');
            if (textarea) {
                textarea.value = code;
            }
        }
    }

    /**
     * Clear the editor content
     */
    clearEditor() {
        if (confirm('Are you sure you want to clear all code? This action cannot be undone.')) {
            this.setCode('');
            this.hideOutputPanels();
            this.announce('Editor cleared');
            
            // Focus editor after clearing
            if (this.editor) {
                this.editor.focus();
            } else {
                const textarea = document.getElementById('codeEditor');
                if (textarea) textarea.focus();
            }
        }
    }

    /**
     * Load sample code
     */
    loadSample() {
        const sampleCode = `// Sample C++ Program - Simple Calculator
#include <iostream>
#include <iomanip>

class Calculator {
private:
    double num1, num2;
    char operation;

public:
    void getInput() {
        std::cout << "Enter first number: ";
        std::cin >> num1;
        
        std::cout << "Enter operation (+, -, *, /): ";
        std::cin >> operation;
        
        std::cout << "Enter second number: ";
        std::cin >> num2;
    }
    
    void calculate() {
        double result = 0;
        bool validOperation = true;
        
        switch(operation) {
            case '+':
                result = num1 + num2;
                break;
            case '-':
                result = num1 - num2;
                break;
            case '*':
                result = num1 * num2;
                break;
            case '/':
                if (num2 != 0) {
                    result = num1 / num2;
                } else {
                    std::cout << "Error: Division by zero!" << std::endl;
                    validOperation = false;
                }
                break;
            default:
                std::cout << "Error: Invalid operation!" << std::endl;
                validOperation = false;
        }
        
        if (validOperation) {
            std::cout << std::fixed << std::setprecision(2);
            std::cout << num1 << " " << operation << " " << num2 << " = " << result << std::endl;
        }
    }
};

int main() {
    std::cout << "=== NetworkAnalyzer C++ Calculator ===" << std::endl;
    
    Calculator calc;
    calc.getInput();
    calc.calculate();
    
    std::cout << "Thank you for using NetworkAnalyzer!" << std::endl;
    return 0;
}`;

        const currentCode = this.getCurrentCode().trim();
        if (currentCode && !confirm('This will replace your current code. Continue?')) {
            return;
        }

        this.setCode(sampleCode);
        this.hideOutputPanels();
        this.announce('Sample code loaded');
    }

    /**
     * Hide all output panels
     */
    hideOutputPanels() {
        const errorPanel = document.getElementById('errorOutput');
        const successPanel = document.getElementById('successOutput');
        
        if (errorPanel) {
            errorPanel.hidden = true;
        }
        if (successPanel) {
            successPanel.hidden = true;
        }
    }

    /**
     * Show error output
     * @param {string} error - Error message to display
     */
    showError(error) {
        const errorPanel = document.getElementById('errorOutput');
        const errorContent = document.getElementById('errorContent');
        
        if (errorPanel && errorContent) {
            errorContent.textContent = error;
            errorPanel.hidden = false;
            
            // Hide success panel
            const successPanel = document.getElementById('successOutput');
            if (successPanel) {
                successPanel.hidden = true;
            }
            
            this.announce('Compilation failed. Check error messages.');
        }
    }

    /**
     * Show success output with download link
     * @param {string} downloadUrl - URL to download the compiled executable
     */
    showSuccess(downloadUrl) {
        const successPanel = document.getElementById('successOutput');
        const downloadLink = document.getElementById('downloadLink');
        
        if (successPanel && downloadLink) {
            downloadLink.href = downloadUrl;
            successPanel.hidden = false;
            
            // Hide error panel
            const errorPanel = document.getElementById('errorOutput');
            if (errorPanel) {
                errorPanel.hidden = true;
            }
            
            this.announce('Compilation successful. Download link is ready.');
        }
    }

    /**
     * Set compile button loading state
     * @param {boolean} loading - Whether button should show loading state
     */
    setCompileLoading(loading) {
        const btn = document.getElementById('compileBtn');
        if (btn) {
            btn.disabled = loading;
            if (loading) {
                btn.classList.add('loading');
                btn.setAttribute('aria-label', 'Compiling code, please wait');
            } else {
                btn.classList.remove('loading');
                btn.setAttribute('aria-label', 'Compile code');
            }
        }
    }

    /**
     * Compile the current code
     */
    async compileCode() {
        if (this.isCompiling) {
            return;
        }

        const code = this.getCurrentCode().trim();
        if (!code) {
            alert('Please enter some C++ code before compiling.');
            return;
        }

        this.isCompiling = true;
        this.setCompileLoading(true);
        this.hideOutputPanels();
        this.announce('Starting compilation...');

        try {
            const response = await fetch('/sse', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: {
                        source: code
                    }
                })
            });

            const result = await response.json();

            if (result.outputs?.error) {
                this.showError(result.outputs.error);
            } else if (result.outputs?.download) {
                this.showSuccess(result.outputs.download);
            } else {
                this.showError('Unexpected response from server. Please try again.');
            }

        } catch (error) {
            console.error('Compilation error:', error);
            this.showError('Failed to connect to server. Please check your connection and try again.');
        } finally {
            this.isCompiling = false;
            this.setCompileLoading(false);
        }
    }

    /**
     * Show modal
     * @param {HTMLElement} modal - Modal element to show
     */
    showModal(modal) {
        if (modal) {
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
            
            // Focus first focusable element
            const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusable) {
                focusable.focus();
            }
            
            // Trap focus within modal
            this.trapFocus(modal);
        }
    }

    /**
     * Hide modal
     * @param {HTMLElement} modal - Modal element to hide
     */
    hideModal(modal) {
        if (modal) {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
        }
    }

    /**
     * Trap focus within an element
     * @param {HTMLElement} element - Element to trap focus within
     */
    trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleTabKey = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            }
        };

        element.addEventListener('keydown', handleTabKey);
        
        // Clean up event listener when modal is hidden
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class' && !element.classList.contains('active')) {
                    element.removeEventListener('keydown', handleTabKey);
                    observer.disconnect();
                }
            });
        });
        
        observer.observe(element, { attributes: true });
    }

    /**
     * Show help modal
     */
    showHelp() {
        const modal = document.getElementById('helpModal');
        this.showModal(modal);
    }

    /**
     * Show about information
     */
    showAbout() {
        alert('NetworkAnalyzer C++ Builder v1.0\\n\\nA modern, accessible web interface for compiling C++ code.\\n\\nFeatures:\\n• Syntax highlighting\\n• Real-time compilation\\n• Error reporting\\n• Keyboard shortcuts\\n• Full accessibility support\\n\\n© 2024 NetworkAnalyzer');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NetworkAnalyzer();
});

// Handle service worker registration for offline support (future enhancement)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Service worker registration would go here
        console.log('Service Worker API is supported');
    });
}