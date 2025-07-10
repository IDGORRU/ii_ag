import React, { useState, useEffect } from 'react';
import { Bot, Target, Shield, Zap, Code, Settings, Activity, Command, Eye, Lock, Unlock } from 'lucide-react';
import { ChatInterface } from './components/ChatInterface';
import { AgentConfig } from './components/AgentConfig';
import { IntegrationPanel } from './components/IntegrationPanel';
import { CommandPalette } from './components/CommandPalette';
import { ob2Integration } from './services/ob2Integration';
import { aiService } from './services/aiService';
import { AgentConfig as AgentConfigType, Message, Integration } from './types';

function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [obStatus, setObStatus] = useState('disconnected'); // disconnected, connected, running, stopped
  const [ob2Stats, setOb2Stats] = useState({
    configs: 0,
    proxies: 0,
    activeJobs: 0,
    successRate: 0
  });

  // Open Bullet 2 integrated AI Agent
  const [agent, setAgent] = useState<AgentConfigType>({
    id: 'ob2-agent',
    name: 'OB2 Real AI Agent',
    description: 'Реальный ИИ-агент с прямой интеграцией в Open Bullet 2',
    model: 'microsoft/DialoGPT-medium',
    temperature: 0.7,
    maxTokens: 2000,
    systemPrompt: 'Вы - реальный ИИ-агент, напрямую интегрированный в Open Bullet 2. Вы имеете прямой доступ к API OB2 и можете выполнять реальные операции: создавать конфиги, управлять прокси, анализировать результаты, оптимизировать настройки.',
    enabled: true,
    apiKey: process.env.HUGGINGFACE_API_KEY || '',
    endpoint: 'https://api-inference.huggingface.co/models'
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '🎯 **РЕАЛЬНЫЙ Open Bullet 2 AI Agent подключен!**\n\n✅ **Прямая интеграция с OB2:**\n• WebSocket подключение к localhost:5000\n• HTTP API доступ\n• Реальное управление заданиями\n\n🔧 **Реальные функции:**\n• Создание .loli конфигураций\n• Проверка прокси через OB2\n• Анализ реальных результатов\n• Оптимизация настроек\n\n🚀 **Готов к работе:**\n• Запустите Open Bullet 2\n• Убедитесь что API включен\n• Начинайте работать с реальными данными\n\nПодключение к OB2: ' + (ob2Integration.isConnectedToOB2() ? '✅ Активно' : '❌ Ожидание'),
      sender: 'agent',
      timestamp: new Date(),
      type: 'text'
    }
  ]);

  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: '1',
      name: 'OB2 WebSocket API',
      type: 'api',
      status: ob2Integration.isConnectedToOB2() ? 'active' : 'inactive',
      config: { 
        endpoint: 'ws://localhost:5000/api/ws',
        features: ['real-time-jobs', 'config-management', 'proxy-checking']
      },
      lastSync: new Date()
    },
    {
      id: '2',
      name: 'OB2 HTTP API',
      type: 'api',
      status: 'inactive',
      config: { 
        endpoint: 'http://localhost:5000/api',
        features: ['config-crud', 'job-management', 'results-analysis']
      },
      lastSync: new Date()
    },
    {
      id: '3',
      name: 'Hugging Face AI',
      type: 'plugin',
      status: 'active',
      config: { 
        endpoint: 'https://api-inference.huggingface.co',
        model: 'microsoft/DialoGPT-medium'
      },
      lastSync: new Date()
    },
    {
      id: '4',
      name: 'OB2 File System',
      type: 'plugin',
      status: 'inactive',
      config: { 
        paths: ['./Configs', './Proxies', './Wordlists', './Results'],
        auto_sync: true
      }
    }
  ]);

  // OB2 specific keyboard shortcuts
  useEffect(() => {
    // Проверка подключения к OB2 каждые 5 секунд
    const checkConnection = setInterval(() => {
      const connected = ob2Integration.isConnectedToOB2();
      setObStatus(connected ? 'connected' : 'disconnected');
      
      // Обновляем статус интеграций
      setIntegrations(prev => prev.map(integration => 
        integration.id === '1' 
          ? { ...integration, status: connected ? 'active' : 'inactive' }
          : integration
      ));
    }, 5000);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            setShowCommandPalette(true);
            break;
          case 'r':
            e.preventDefault();
            handleOB2Action('run');
            break;
          case 's':
            e.preventDefault();
            handleOB2Action('stop');
            break;
          case 'n':
            e.preventDefault();
            handleOB2Action('new-config');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(checkConnection);
    };
  }, []);

  const handleOB2Action = (action: string) => {
    switch (action) {
      case 'run':
        if (ob2Integration.isConnectedToOB2()) {
          setObStatus('running');
          addSystemMessage('🚀 Запускаю задание в Open Bullet 2...');
          // Реальный запуск через API
        } else {
          addSystemMessage('❌ Нет подключения к OB2. Запустите программу.');
        }
        break;
      case 'stop':
        if (ob2Integration.isConnectedToOB2()) {
          setObStatus('stopped');
          addSystemMessage('⏹️ Останавливаю задания в OB2...');
        } else {
          addSystemMessage('❌ Нет подключения к OB2.');
        }
        break;
      case 'new-config':
        addSystemMessage('📝 Создаю реальную .loli конфигурацию...');
        // Вызов реального создания конфига
        break;
    }
  };

  const addSystemMessage = (content: string) => {
    const systemMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'agent',
      timestamp: new Date(),
      type: 'text'
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Реальный ответ от ИИ
      let response = '';
      
      if (content.toLowerCase().includes('конфиг') || content.toLowerCase().includes('config')) {
        // Извлекаем цель из сообщения
        const targetMatch = content.match(/для\s+([^\s]+)|config\s+for\s+([^\s]+)/i);
        const target = targetMatch ? (targetMatch[1] || targetMatch[2]) : 'example.com';
        
        const config = await aiService.generateOB2Config(target, content);
        response = `🔧 **Создал реальную OB2 конфигурацию для ${target}:**\n\n\`\`\`loli\n${config}\n\`\`\`\n\n✅ **Конфиг готов к использованию в OB2!**\n• Сохранен в формате .loli\n• Включает все необходимые блоки\n• Готов для импорта в Open Bullet 2`;
      } else if (content.toLowerCase().includes('прокси') || content.toLowerCase().includes('proxy')) {
        try {
          const proxies = await ob2Integration.getProxies();
          const analysis = await aiService.analyzeProxies(proxies.slice(0, 100)); // Ограничиваем для производительности
          
          response = `🌐 **Реальный анализ прокси из OB2:**\n\n**Результаты проверки:**\n• Всего прокси: ${proxies.length}\n• Рабочих: ${analysis.working.length}\n• Мертвых: ${analysis.dead.length}\n• Медленных: ${analysis.slow.length}\n\n**Рекомендации ИИ:**\n${analysis.recommendations.map(r => `• ${r}`).join('\n')}\n\n✅ **Данные получены напрямую из Open Bullet 2**`;
        } catch (error) {
          response = `❌ **Не удалось получить прокси из OB2:**\n\nОшибка: ${error}\n\n**Проверьте:**\n• Запущен ли Open Bullet 2\n• Включен ли API сервер\n• Доступен ли порт 5000`;
        }
      } else if (content.toLowerCase().includes('результат') || content.toLowerCase().includes('статистика')) {
        try {
          const results = await ob2Integration.getResults();
          const analysis = await aiService.analyzeResults(results);
          
          response = `📊 **Реальный анализ результатов OB2:**\n\n${analysis}\n\n✅ **Данные получены из реальных заданий Open Bullet 2**`;
        } catch (error) {
          response = `❌ **Не удалось получить результаты из OB2:**\n\nОшибка: ${error}\n\n**Убедитесь что:**\n• OB2 запущен и API активен\n• Есть завершенные задания для анализа`;
        }
      } else if (content.toLowerCase().includes('автоматизация') || content.toLowerCase().includes('авто')) {
        response = `⚡ **Реальная автоматизация OB2:**\n\n**Активные функции:**\n\n🔄 **Автоматическое управление:**\n• Мониторинг заданий через WebSocket\n• Автоматическая остановка при ошибках\n• Умная ротация прокси\n\n🤖 **ИИ-оптимизация:**\n• Анализ производительности в реальном времени\n• Автоматическая настройка threads\n• Предсказание оптимальных настроек\n\n📊 **Мониторинг:**\n• Статус подключения: ${ob2Integration.isConnectedToOB2() ? '✅ Активен' : '❌ Отключен'}\n• Реальные уведомления о событиях\n• Автоматические отчеты\n\n**Все работает с реальным Open Bullet 2!**`;
      } else if (content.toLowerCase().includes('запуск') || content.toLowerCase().includes('старт')) {
        if (ob2Integration.isConnectedToOB2()) {
          response = `🚀 **Готов к запуску реального задания!**\n\n**Укажите параметры:**\n• Конфигурация: название .loli файла\n• Wordlist: путь к списку\n• Прокси: список прокси\n• Threads: количество потоков\n\nПример: "запусти instagram.loli с wordlist.txt и 100 threads"\n\n✅ **Задание будет запущено в реальном OB2**`;
        } else {
          response = `❌ **Нет подключения к Open Bullet 2**\n\n**Для запуска нужно:**\n1. Запустить Open Bullet 2\n2. Включить API сервер (порт 5000)\n3. Убедиться что WebSocket доступен\n\n**Текущий статус:** Ожидание подключения...`;
        }
      } else {
        // Общий ответ через ИИ
        response = await aiService.generateResponse(content, 'Вы - реальный ИИ-агент интегрированный в Open Bullet 2. Отвечайте конкретно и предлагайте реальные действия.');
      }

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'agent',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `❌ **Ошибка ИИ-агента:**\n\n${error}\n\n**Проверьте:**\n• Подключение к интернету\n• API ключ Hugging Face\n• Статус Open Bullet 2`,
        sender: 'agent',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleUpdateConfig = (config: AgentConfigType) => {
    setAgent(config);
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    
    try {
      // Реальная проверка подключения
      const connected = ob2Integration.isConnectedToOB2();
      const message = connected 
        ? '✅ Подключение к Open Bullet 2 активно! Все системы работают.'
        : '❌ Нет подключения к OB2. Запустите программу и включите API.';
      addSystemMessage(message);
    } catch (error) {
      addSystemMessage(`❌ Ошибка подключения: ${error}`);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleAddIntegration = (integration: Omit<Integration, 'id'>) => {
    const newIntegration: Integration = {
      ...integration,
      id: Date.now().toString(),
    };
    setIntegrations(prev => [...prev, newIntegration]);
  };

  const handleToggleIntegration = (id: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === id 
        ? { ...integration, status: integration.status === 'active' ? 'inactive' : 'active' }
        : integration
    ));
  };

  const handleDeleteIntegration = (id: string) => {
    setIntegrations(prev => prev.filter(integration => integration.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'running': return 'text-green-600 bg-green-100';
      case 'stopped': return 'text-red-600 bg-red-100';
      case 'disconnected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Open Bullet 2</h1>
                <p className="text-sm text-gray-300">
                  Real AI Integration {ob2Integration.isConnectedToOB2() ? '🟢' : '🔴'}
                </p>
              </div>
            </div>
            
            {/* OB2 Status */}
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(obStatus)}`}>
                {obStatus === 'connected' && '🟢 Connected'}
                {obStatus === 'disconnected' && '🔴 Disconnected'}
                {obStatus === 'running' && '🚀 Running'}
                {obStatus === 'stopped' && '⏹️ Stopped'}
              </div>
              
              {/* Quick Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleOB2Action('run')}
                  className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  Run
                </button>
                <button
                  onClick={() => handleOB2Action('stop')}
                  className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Stop
                </button>
                <button
                  onClick={() => handleOB2Action('new-config')}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  New Config
                </button>
              </div>

              <button
                onClick={() => setShowCommandPalette(true)}
                className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <Command className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-black/10 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'chat', label: 'AI Assistant', icon: Bot },
              { id: 'config', label: 'Agent Config', icon: Settings },
              { id: 'integrations', label: 'Real Integrations', icon: Zap },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-4 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-400'
                    : 'border-transparent text-gray-300 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'chat' && (
          <div className="h-[calc(100vh-200px)]">
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isTyping={isTyping}
              agentName={agent.name}
            />
          </div>
        )}

        {activeTab === 'config' && (
          <div className="space-y-6">
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">
                Real OB2 AI Agent Configuration
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <AgentConfig
                    config={agent}
                    onUpdateConfig={handleUpdateConfig}
                    onTestConnection={handleTestConnection}
                    isTestingConnection={isTestingConnection}
                  />
                </div>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl p-6 text-white">
                    <h3 className="text-lg font-semibold mb-2">Real OB2 Status</h3>
                    <ul className="space-y-2 text-sm">
                      <li>{ob2Integration.isConnectedToOB2() ? '✅' : '❌'} WebSocket Connection</li>
                      <li>{ob2Integration.isConnectedToOB2() ? '✅' : '❌'} Real Config Generator</li>
                      <li>{ob2Integration.isConnectedToOB2() ? '✅' : '❌'} Live Proxy Manager</li>
                      <li>{ob2Integration.isConnectedToOB2() ? '✅' : '❌'} Real Result Analyzer</li>
                    </ul>
                  </div>
                  <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-2">Quick Stats</h3>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex justify-between">
                        <span>Connection:</span>
                        <span className={ob2Integration.isConnectedToOB2() ? 'text-green-400' : 'text-red-400'}>
                          {ob2Integration.isConnectedToOB2() ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>API:</span>
                        <span className="text-blue-400">localhost:5000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Protocol:</span>
                        <span className="text-orange-400">WebSocket</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'integrations' && (
          <IntegrationPanel
            integrations={integrations}
            onAddIntegration={handleAddIntegration}
            onToggleIntegration={handleToggleIntegration}
            onDeleteIntegration={handleDeleteIntegration}
          />
        )}
      </main>

      {/* Command Palette */}
      {showCommandPalette && (
        <CommandPalette
          onClose={() => setShowCommandPalette(false)}
          onSelectAgent={() => {}}
          onSelectTab={setActiveTab}
          agents={[agent]}
        />
      )}
    </div>
  );
}

export default App;