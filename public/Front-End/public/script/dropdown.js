  class CustomDropdown extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });

      const placeholder = this.getAttribute('placeholder') || 'Selecione...';
      const options = this.getAttribute('options')
        ?.split(',')
        .map(opt => opt.trim()) || [];

      const id = Math.random().toString(36).substring(2, 9); // id único

      this.shadowRoot.innerHTML = `
          <style>
          :host {
            display: block;
            position: relative;
            width: 100%;
            font-family: 'FontePadrao';
            font-size: 14px;
          }

          .selected-label {
            display: block;
            padding: 8px;
            border: 1px solid var(--cor-border);
            border-radius: 4px;
            cursor: pointer;
            position: relative;
            background-color: white;
          }

          .selected-label span {
            color: var(--cinza-claro);
          }

          .options {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background-color: white;
            border: 1px solid #ccc;
            border-radius: 4px;
            margin-top: 2px;
            display: none;
          }

          .options label {
            display: block;
            padding: 10px;
            cursor: pointer;
          }

          .options label:hover {
            background-color: #eee;
          }

          input[type="checkbox"] {
            display: none;
          }

          input[type="checkbox"]:checked ~ .options {
            display: block;
          }
        </style>

        <input type="checkbox" id="${id}-toggle">
        <label for="${id}-toggle" class="selected-label"><span>${placeholder}</span></label>
        <div class="options">
          ${options.map((text, index) => `
            <input type="radio" name="${id}-dropdown" id="${id}-opt${index}" style="display:none">
            <label for="${id}-opt${index}" data-value="${text}">${text}</label>
          `).join('')}
        </div>
      `;


      this._setupBehavior();
    }

    _setupBehavior() {
      const shadow = this.shadowRoot;
      const toggle = shadow.querySelector('input[type="checkbox"]');
      const displaySpan = shadow.querySelector('.selected-label span');
      const optionLabels = shadow.querySelectorAll('.options label');

      optionLabels.forEach(label => {
        label.addEventListener('click', () => {
          const value = label.getAttribute('data-value');
          displaySpan.textContent = value;
          toggle.checked = false;

          // Emite evento personalizado
          this.dispatchEvent(new CustomEvent('change', {
            detail: { value },
            bubbles: true,
            composed: true
          }));
        });
      });

      // Fechar ao clicar fora
      document.addEventListener('click', (e) => {
        if (!this.contains(e.target) && !shadow.contains(e.target)) {
          toggle.checked = false;
        }
      });
    }
  }

  customElements.define('custom-dropdown', CustomDropdown);
