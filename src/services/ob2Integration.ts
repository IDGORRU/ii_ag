// Реальная интеграция с Open Bullet 2
import { aiService } from './aiService';

export class OB2Integration {
  private ws: WebSocket | null = null;
  private isConnected = false;

  constructor() {
    this.connectToOB2();
  }

  // Подключение к Open Bullet 2 через WebSocket
  private connectToOB2() {
    try {
      // Подключение к локальному серверу OB2 (обычно порт 5000)
      this.ws = new WebSocket('ws://localhost:5000/api/ws');
      
      this.ws.onopen = () => {
        this.isConnected = true;
        console.log('✅ Подключен к Open Bullet 2');
        this.sendCommand('auth', { token: 'ob2-ai-agent' });
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleOB2Message(data);
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        console.log('❌ Соединение с OB2 потеряно');
        // Переподключение через 5 секунд
        setTimeout(() => this.connectToOB2(), 5000);
      };

      this.ws.onerror = (error) => {
        console.error('Ошибка WebSocket:', error);
      };
    } catch (error) {
      console.error('Не удалось подключиться к OB2:', error);
    }
  }

  // Отправка команды в OB2
  private sendCommand(type: string, data: any) {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify({ type, data }));
    }
  }

  // Обработка сообщений от OB2
  private handleOB2Message(message: any) {
    switch (message.type) {
      case 'job_status':
        this.handleJobStatus(message.data);
        break;
      case 'config_list':
        this.handleConfigList(message.data);
        break;
      case 'proxy_check':
        this.handleProxyCheck(message.data);
        break;
      case 'results':
        this.handleResults(message.data);
        break;
    }
  }

  // Создание конфигурации через ИИ
  async createConfig(target: string, requirements: string): Promise<string> {
    const config = await aiService.generateOB2Config(target, requirements);
    
    // Отправка конфига в OB2
    this.sendCommand('create_config', {
      name: `${target}_AI_Generated`,
      content: config
    });

    return config;
  }

  // Запуск задания в OB2
  startJob(configName: string, wordlist: string, proxylist: string) {
    this.sendCommand('start_job', {
      config: configName,
      wordlist: wordlist,
      proxies: proxylist,
      bots: 100,
      skip: 0
    });
  }

  // Остановка задания
  stopJob(jobId: string) {
    this.sendCommand('stop_job', { jobId });
  }

  // Получение статистики
  getStats() {
    this.sendCommand('get_stats', {});
  }

  // Проверка прокси через ИИ
  async checkProxies(proxies: string[]) {
    const analysis = await aiService.analyzeProxies(proxies);
    
    // Отправка результатов в OB2
    this.sendCommand('update_proxies', {
      working: analysis.working,
      dead: analysis.dead
    });

    return analysis;
  }

  // Анализ результатов через ИИ
  async analyzeResults(results: any[]) {
    const analysis = await aiService.analyzeResults(results);
    return analysis;
  }

  // Оптимизация настроек
  async optimizeSettings(currentSettings: any) {
    const optimized = await aiService.optimizeSettings(currentSettings);
    
    // Применение настроек в OB2
    this.sendCommand('update_settings', optimized);
    
    return optimized;
  }

  // Обработчики событий OB2
  private handleJobStatus(data: any) {
    console.log('Job Status:', data);
    // Отправка в UI
    window.dispatchEvent(new CustomEvent('ob2-job-status', { detail: data }));
  }

  private handleConfigList(data: any) {
    console.log('Config List:', data);
    window.dispatchEvent(new CustomEvent('ob2-config-list', { detail: data }));
  }

  private handleProxyCheck(data: any) {
    console.log('Proxy Check:', data);
    window.dispatchEvent(new CustomEvent('ob2-proxy-check', { detail: data }));
  }

  private handleResults(data: any) {
    console.log('Results:', data);
    window.dispatchEvent(new CustomEvent('ob2-results', { detail: data }));
  }

  // HTTP API для OB2 (если WebSocket недоступен)
  async httpRequest(endpoint: string, method: string = 'GET', data?: any) {
    try {
      const response = await fetch(`http://localhost:5000/api/${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ob2-ai-agent'
        },
        body: data ? JSON.stringify(data) : undefined
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`HTTP Request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Получение конфигураций через HTTP
  async getConfigs() {
    return await this.httpRequest('configs');
  }

  // Получение прокси через HTTP
  async getProxies() {
    return await this.httpRequest('proxies');
  }

  // Получение результатов через HTTP
  async getResults(jobId?: string) {
    const endpoint = jobId ? `results/${jobId}` : 'results';
    return await this.httpRequest(endpoint);
  }

  // Создание конфига через HTTP
  async createConfigHTTP(name: string, content: string) {
    return await this.httpRequest('configs', 'POST', { name, content });
  }

  // Запуск задания через HTTP
  async startJobHTTP(config: string, wordlist: string, proxies: string, settings: any) {
    return await this.httpRequest('jobs', 'POST', {
      config,
      wordlist,
      proxies,
      ...settings
    });
  }

  // Проверка подключения
  isConnectedToOB2(): boolean {
    return this.isConnected;
  }

  // Закрытие соединения
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }
}

// Экспорт синглтона
export const ob2Integration = new OB2Integration();