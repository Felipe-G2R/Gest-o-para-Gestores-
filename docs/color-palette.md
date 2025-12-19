# Paleta de Cores - Gestão para Gestores 1.0

## Tema Facebook

O sistema utiliza a paleta de cores oficial do Facebook para manter uma identidade visual profissional e familiar aos usuários.

## Cores Principais

### Azul Facebook

| Nome | Hex | RGB | Uso |
|------|-----|-----|-----|
| **Primary Blue** | `#1877F2` | rgb(24, 119, 242) | Botões, links, elementos de destaque |
| **Primary Hover** | `#166FE5` | rgb(22, 111, 229) | Estado hover de botões |
| **Primary Light** | `#E7F3FF` | rgb(231, 243, 255) | Backgrounds de seleção |
| **Primary Dark** | `#0D5DC9` | rgb(13, 93, 201) | Estado active/pressed |

### Neutros

| Nome | Hex | RGB | Uso |
|------|-----|-----|-----|
| **Background** | `#F0F2F5` | rgb(240, 242, 245) | Fundo geral da aplicação |
| **Surface** | `#FFFFFF` | rgb(255, 255, 255) | Cards, modais, inputs |
| **Divider** | `#DADDE1` | rgb(218, 221, 225) | Linhas divisórias |
| **Disabled** | `#BCC0C4` | rgb(188, 192, 196) | Estados desabilitados |

### Texto

| Nome | Hex | RGB | Uso |
|------|-----|-----|-----|
| **Text Primary** | `#050505` | rgb(5, 5, 5) | Títulos, texto principal |
| **Text Secondary** | `#65676B` | rgb(101, 103, 107) | Labels, descrições |
| **Text Placeholder** | `#8A8D91` | rgb(138, 141, 145) | Placeholders de inputs |
| **Text White** | `#FFFFFF` | rgb(255, 255, 255) | Texto em botões primários |

### Semânticas

| Nome | Hex | RGB | Uso |
|------|-----|-----|-----|
| **Success** | `#31A24C` | rgb(49, 162, 76) | Alertas de sucesso, status ativo |
| **Success Light** | `#E7F5EA` | rgb(231, 245, 234) | Background de sucesso |
| **Warning** | `#F7B928` | rgb(247, 185, 40) | Alertas de atenção |
| **Warning Light** | `#FFF8E6` | rgb(255, 248, 230) | Background de warning |
| **Error** | `#F02849` | rgb(240, 40, 73) | Erros, status inativo |
| **Error Light** | `#FFEBE9` | rgb(255, 235, 233) | Background de erro |

## Implementação no Tailwind CSS

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        facebook: {
          // Primary
          primary: '#1877F2',
          'primary-hover': '#166FE5',
          'primary-light': '#E7F3FF',
          'primary-dark': '#0D5DC9',

          // Neutrals
          background: '#F0F2F5',
          surface: '#FFFFFF',
          divider: '#DADDE1',
          disabled: '#BCC0C4',

          // Text
          'text-primary': '#050505',
          'text-secondary': '#65676B',
          'text-placeholder': '#8A8D91',

          // Semantic
          success: '#31A24C',
          'success-light': '#E7F5EA',
          warning: '#F7B928',
          'warning-light': '#FFF8E6',
          error: '#F02849',
          'error-light': '#FFEBE9',
        }
      }
    }
  }
}
```

## Implementação no DaisyUI

```javascript
// tailwind.config.js
module.exports = {
  daisyui: {
    themes: [
      {
        facebook: {
          "primary": "#1877F2",
          "primary-focus": "#166FE5",
          "primary-content": "#FFFFFF",

          "secondary": "#65676B",
          "secondary-focus": "#050505",
          "secondary-content": "#FFFFFF",

          "accent": "#31A24C",
          "accent-focus": "#248F3D",
          "accent-content": "#FFFFFF",

          "neutral": "#F0F2F5",
          "neutral-focus": "#DADDE1",
          "neutral-content": "#050505",

          "base-100": "#FFFFFF",
          "base-200": "#F0F2F5",
          "base-300": "#DADDE1",
          "base-content": "#050505",

          "info": "#1877F2",
          "success": "#31A24C",
          "warning": "#F7B928",
          "error": "#F02849",

          "--rounded-box": "0.5rem",
          "--rounded-btn": "0.5rem",
          "--rounded-badge": "1rem",
          "--animation-btn": "0.2s",
          "--animation-input": "0.2s",
          "--btn-text-case": "none",
          "--navbar-padding": "0.5rem",
          "--border-btn": "1px",
        },
        "facebook-dark": {
          "primary": "#1877F2",
          "primary-focus": "#166FE5",
          "primary-content": "#FFFFFF",

          "secondary": "#B0B3B8",
          "secondary-focus": "#E4E6EB",
          "secondary-content": "#18191A",

          "accent": "#31A24C",
          "accent-focus": "#248F3D",
          "accent-content": "#FFFFFF",

          "neutral": "#242526",
          "neutral-focus": "#3A3B3C",
          "neutral-content": "#E4E6EB",

          "base-100": "#18191A",
          "base-200": "#242526",
          "base-300": "#3A3B3C",
          "base-content": "#E4E6EB",

          "info": "#1877F2",
          "success": "#31A24C",
          "warning": "#F7B928",
          "error": "#F02849",

          "--rounded-box": "0.5rem",
          "--rounded-btn": "0.5rem",
          "--rounded-badge": "1rem",
          "--animation-btn": "0.2s",
          "--animation-input": "0.2s",
          "--btn-text-case": "none",
          "--navbar-padding": "0.5rem",
          "--border-btn": "1px",
        }
      }
    ]
  }
}
```

## CSS Variables

```css
/* src/assets/styles/variables.css */
:root {
  /* Primary */
  --color-primary: #1877F2;
  --color-primary-hover: #166FE5;
  --color-primary-light: #E7F3FF;
  --color-primary-dark: #0D5DC9;

  /* Background */
  --color-background: #F0F2F5;
  --color-surface: #FFFFFF;
  --color-divider: #DADDE1;
  --color-disabled: #BCC0C4;

  /* Text */
  --color-text-primary: #050505;
  --color-text-secondary: #65676B;
  --color-text-placeholder: #8A8D91;

  /* Semantic */
  --color-success: #31A24C;
  --color-success-light: #E7F5EA;
  --color-warning: #F7B928;
  --color-warning-light: #FFF8E6;
  --color-error: #F02849;
  --color-error-light: #FFEBE9;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 4px 8px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 8px 16px rgba(0, 0, 0, 0.1);

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
}

/* Dark Mode */
[data-theme="dark"] {
  --color-background: #18191A;
  --color-surface: #242526;
  --color-divider: #3A3B3C;
  --color-disabled: #4E4F50;

  --color-text-primary: #E4E6EB;
  --color-text-secondary: #B0B3B8;
  --color-text-placeholder: #8A8D91;
}
```

## Exemplos de Uso

### Botões

```html
<!-- Botão Primário -->
<button class="btn btn-primary">
  Salvar Cliente
</button>

<!-- Botão Secundário -->
<button class="btn btn-ghost text-facebook-text-secondary">
  Cancelar
</button>

<!-- Botão de Sucesso -->
<button class="btn bg-facebook-success text-white">
  Ativar
</button>

<!-- Botão de Perigo -->
<button class="btn bg-facebook-error text-white">
  Excluir
</button>
```

### Cards

```html
<div class="card bg-facebook-surface shadow-md">
  <div class="card-body">
    <h2 class="card-title text-facebook-text-primary">
      Dra. Maria Silva
    </h2>
    <p class="text-facebook-text-secondary">
      São Paulo, SP
    </p>
    <div class="card-actions">
      <button class="btn btn-primary">
        Ver Detalhes
      </button>
    </div>
  </div>
</div>
```

### Status Badges

```html
<!-- Ativo -->
<span class="badge bg-facebook-success-light text-facebook-success">
  Ativo
</span>

<!-- Inativo -->
<span class="badge bg-facebook-error-light text-facebook-error">
  Inativo
</span>

<!-- Pausado -->
<span class="badge bg-facebook-warning-light text-facebook-warning">
  Pausado
</span>
```

### Forma de Pagamento

```html
<!-- PIX -->
<span class="badge bg-facebook-primary-light text-facebook-primary">
  PIX
</span>

<!-- Cartão -->
<span class="badge bg-facebook-success-light text-facebook-success">
  Cartão
</span>
```

## Preview Visual

```
┌─────────────────────────────────────────────────────────────┐
│  ████ #1877F2  Primary Blue                                 │
│  ████ #166FE5  Primary Hover                                │
│  ████ #E7F3FF  Primary Light                                │
├─────────────────────────────────────────────────────────────┤
│  ████ #F0F2F5  Background                                   │
│  ████ #FFFFFF  Surface                                      │
│  ████ #DADDE1  Divider                                      │
├─────────────────────────────────────────────────────────────┤
│  ████ #050505  Text Primary                                 │
│  ████ #65676B  Text Secondary                               │
│  ████ #8A8D91  Placeholder                                  │
├─────────────────────────────────────────────────────────────┤
│  ████ #31A24C  Success                                      │
│  ████ #F7B928  Warning                                      │
│  ████ #F02849  Error                                        │
└─────────────────────────────────────────────────────────────┘
```

---

*Documento atualizado em: 2025-12-18*
