const plist = require("@atom/plist")
const ScopeSelector = require("first-mate").ScopeSelector;

module.exports  = class TextMateTheme {
  constructor(contents) {
    this.contents = contents
    this.rulesets = []
    this.buildRulesets()
  }

  buildRulesets() {
    let left, variableSettings
    let { settings } = (left = plist.parseStringSync(this.contents)) != null ? left : {}
    if (settings == null) {
      settings = []
    }

    for (const setting of settings) {
      const { scope, name } = setting.settings
      if (scope || name) {
        continue
      }

      // Require all of these or invalid LESS will be generated if any required
      // variable value is missing
      const { background, foreground, caret, selection, invisibles, lineHighlight } = setting.settings
      if (background && foreground && caret && selection && lineHighlight && invisibles) {
        variableSettings = setting.settings
        break
      }
    }

    if (variableSettings == null) {
      throw new Error(`\
Could not find the required color settings in the theme.

The theme being converted must contain a settings array with all of the following keys:
  * background
  * caret
  * foreground
  * invisibles
  * lineHighlight
  * selection\
`)
    }

    this.buildSyntaxVariables(variableSettings)
    this.buildGlobalSettingsRulesets(variableSettings)
    return this.buildScopeSelectorRulesets(settings)
  }

  getStylesheet() {
    const lines = ['@import "syntax-variables";', ""]
    for (const { selector, properties } of this.getRulesets()) {
      lines.push(`${selector} {`)
      for (const name in properties) {
        const value = properties[name]
        lines.push(`  ${name}: ${value};`)
      }
      lines.push("}\n")
    }
    return lines.join("\n")
  }

  getRulesets() {
    return this.rulesets
  }

  getSyntaxVariables() {
    return this.syntaxVariables
  }

  buildSyntaxVariables(settings) {
    this.syntaxVariables = SyntaxVariablesTemplate
    for (const key in settings) {
      const value = settings[key]
      const replaceRegex = new RegExp(`\\{\\{${key}\\}\\}`, "g")
      this.syntaxVariables = this.syntaxVariables.replace(replaceRegex, this.translateColor(value))
    }
    return this.syntaxVariables
  }

  buildGlobalSettingsRulesets(settings) {
    this.rulesets.push({
      selector: "atom-text-editor",
      properties: {
        "background-color": "@syntax-background-color",
        color: "@syntax-text-color",
      },
    })

    this.rulesets.push({
      selector: "atom-text-editor .gutter",
      properties: {
        "background-color": "@syntax-gutter-background-color",
        color: "@syntax-gutter-text-color",
      },
    })

    this.rulesets.push({
      selector: "atom-text-editor .gutter .line-number.cursor-line",
      properties: {
        "background-color": "@syntax-gutter-background-color-selected",
        color: "@syntax-gutter-text-color-selected",
      },
    })

    this.rulesets.push({
      selector: "atom-text-editor .gutter .line-number.cursor-line-no-selection",
      properties: {
        color: "@syntax-gutter-text-color-selected",
      },
    })

    this.rulesets.push({
      selector: "atom-text-editor .wrap-guide",
      properties: {
        color: "@syntax-wrap-guide-color",
      },
    })

    this.rulesets.push({
      selector: "atom-text-editor .indent-guide",
      properties: {
        color: "@syntax-indent-guide-color",
      },
    })

    this.rulesets.push({
      selector: "atom-text-editor .invisible-character",
      properties: {
        color: "@syntax-invisible-character-color",
      },
    })

    this.rulesets.push({
      selector: "atom-text-editor.is-focused .cursor",
      properties: {
        "border-color": "@syntax-cursor-color",
      },
    })

    this.rulesets.push({
      selector: "atom-text-editor.is-focused .selection .region",
      properties: {
        "background-color": "@syntax-selection-color",
      },
    })

    return this.rulesets.push({
      selector: `atom-text-editor.is-focused .line-number.cursor-line-no-selection, \
atom-text-editor.is-focused .line.cursor-line`,
      properties: {
        "background-color": this.translateColor(settings.lineHighlight),
      },
    })
  }

  buildScopeSelectorRulesets(scopeSelectorSettings) {
    return (() => {
      const result = []
      for (const { name, scope, settings } of scopeSelectorSettings) {
        if (!scope) {
          continue
        }
        result.push(
          this.rulesets.push({
            comment: name,
            selector: this.translateScopeSelector(scope),
            properties: this.translateScopeSelectorSettings(settings),
          })
        )
      }
      return result
    })()
  }

  translateScopeSelector(textmateScopeSelector) {
    return new ScopeSelector(textmateScopeSelector).toCssSyntaxSelector()
  }

  translateScopeSelectorSettings({ foreground, background, fontStyle }) {
    const properties = {}

    if (fontStyle) {
      const fontStyles = fontStyle.split(/\s+/)
      if (fontStyles.includes("bold")) {
        properties["font-weight"] = "bold"
      }
      if (fontStyles.includes("italic")) {
        properties["font-style"] = "italic"
      }
      if (fontStyles.includes("underline")) {
        properties["text-decoration"] = "underline"
      }
    }

    if (foreground) {
      properties.color = this.translateColor(foreground)
    }
    if (background) {
      properties["background-color"] = this.translateColor(background)
    }
    return properties
  }

  translateColor(textmateColor) {
    textmateColor = `#${textmateColor.replace(/^#+/, "")}`
    if (textmateColor.length <= 7) {
      return textmateColor
    } else {
      const r = this.parseHexColor(textmateColor.slice(1, 3))
      const g = this.parseHexColor(textmateColor.slice(3, 5))
      const b = this.parseHexColor(textmateColor.slice(5, 7))
      let a = this.parseHexColor(textmateColor.slice(7, 9))
      a = Math.round((a / 255.0) * 100) / 100

      return `rgba(${r}, ${g}, ${b}, ${a})`
    }
  }

  parseHexColor(color) {
    const parsed = Math.min(255, Math.max(0, parseInt(color, 16)))
    if (isNaN(parsed)) {
      return 0
    } else {
      return parsed
    }
  }
}

const SyntaxVariablesTemplate = `\
// This defines all syntax variables that syntax themes must implement when they
// include a syntax-variables.less file.

// General colors
@syntax-text-color: {{foreground}};
@syntax-cursor-color: {{caret}};
@syntax-selection-color: {{selection}};
@syntax-background-color: {{background}};

// Guide colors
@syntax-wrap-guide-color: {{invisibles}};
@syntax-indent-guide-color: {{invisibles}};
@syntax-invisible-character-color: {{invisibles}};

// For find and replace markers
@syntax-result-marker-color: {{invisibles}};
@syntax-result-marker-color-selected: {{foreground}};

// Gutter colors
@syntax-gutter-text-color: {{foreground}};
@syntax-gutter-text-color-selected: {{foreground}};
@syntax-gutter-background-color: {{background}};
@syntax-gutter-background-color-selected: {{lineHighlight}};

// For git diff info. i.e. in the gutter
// These are static and were not extracted from your textmate theme
@syntax-color-renamed: #96CBFE;
@syntax-color-added: #A8FF60;
@syntax-color-modified: #E9C062;
@syntax-color-removed: #CC6666;\
`
