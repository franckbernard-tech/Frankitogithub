/**
 * Configuration centralisée pour Frankito-IA
 *
 * Charge les variables d'environnement depuis .env
 * et fournit une interface unifiée pour toute l'application
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const config = {
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    authorizedChatId: process.env.AUTHORIZED_CHAT_ID || '673173233'
  },

  n8n: {
    apiUrl: process.env.N8N_API_URL || 'https://n8n.srv1289936.hstgr.cloud',
    apiKey: process.env.N8N_API_KEY,
    // Credential IDs (peuvent être overridés via .env)
    telegramCredentialId: process.env.N8N_TELEGRAM_CRED_ID || 'FSYQgwtSukrusz8V'
  },

  workflows: {
    masterId: process.env.MASTER_WORKFLOW_ID || 'dMksAyCROpecNL7A'
  },

  /**
   * Valide que toutes les variables critiques sont présentes
   * @throws {Error} Si une variable critique est manquante
   * @returns {boolean} true si tout est OK
   */
  validate() {
    const errors = [];

    if (!this.telegram.botToken) {
      errors.push('TELEGRAM_BOT_TOKEN is required');
    }

    if (!this.n8n.apiKey) {
      errors.push('N8N_API_KEY is required');
    }

    if (!this.n8n.apiUrl) {
      errors.push('N8N_API_URL is required');
    }

    if (errors.length > 0) {
      throw new Error('Configuration errors:\n' + errors.map(e => `  - ${e}`).join('\n'));
    }

    return true;
  },

  /**
   * Affiche un résumé de la configuration (sans exposer les secrets)
   * @returns {object} Configuration résumée
   */
  summary() {
    return {
      telegram: {
        botToken: this.telegram.botToken ? '***' + this.telegram.botToken.slice(-8) : 'NOT SET',
        authorizedChatId: this.telegram.authorizedChatId
      },
      n8n: {
        apiUrl: this.n8n.apiUrl,
        apiKey: this.n8n.apiKey ? '***' + this.n8n.apiKey.slice(-20) : 'NOT SET',
        telegramCredentialId: this.n8n.telegramCredentialId
      },
      workflows: {
        masterId: this.workflows.masterId
      }
    };
  }
};

module.exports = config;
