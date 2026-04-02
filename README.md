# Obsidian Ghost Text (Beta)

A high-performance fork of [j0rd1smit/obsidian-copilot-auto-completion](https://github.com/j0rd1smit/obsidian-copilot-auto-completion) optimized for speed and modern LLMs.

![demo](assets/demo-static.gif)

## Key Enhancements
- **Streaming API Support**: Suggestions begin appearing immediately as they are generated.
- **Faster Completions**: Optimized trigger detection and request handling for a smoother experience.
- **Modern Model Support**: Compatible with the latest OpenAI (including `o1` series), Azure OpenAI, and Ollama models.
- **Core Features Retained**: Context-aware suggestions, language detection, and `.gitignore`-like file exclusion are all still present.

## Recommended Configuration
- **Best Performance**: **OpenAI GPT-5.4 Nano** (highly recommended for speed/accuracy).
- **Local**: **Ollama** works great for privacy and zero latency.
- **OpenAI**: OpenAI API works flawlessly.
- **OpenRouter**: Not recommended (tested and found to be too slow for ghost-text).
- **Azure**: Support is included but currently **untested**.

## Installation via BRAT (Beta)
Since this plugin is in beta, the best way to install and stay updated is via the [BRAT plugin](https://github.com/TfTHacker/obsidian42-brat):

1. Install **BRAT** from the Community Plugins store.
2. Open BRAT settings and click **Add Beta plugin**.
3. Paste this repository URL: `https://github.com/sameert89/obsidian-ghost-text`
4. Click **Add Plugin** and enable **Ghost Text** in your Community Plugins settings.

## Getting Started
1. Go to **Settings** -> **Ghost Text**.
2. Configure your API provider (OpenAI, Azure, or Ollama).
3. Use the **Test Connection** button to verify your setup.
4. Start typing! Suggestions appear as transparent text. Press `Tab` to accept or `Right Arrow` for partial insertion.

## Keyboard Shortcuts
| Key | Action |
| --- | --- |
| `Tab` | Accept the entire suggestion |
| `Right Arrow` | Accept the next word of the suggestion |
| `Escape` | Reject or cancel the current suggestion |

---
*Support the original author: [Buy me a coffee](https://buymeacoffee.com/jordismit)*
