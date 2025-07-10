import React, { useState, useEffect } from 'react';
import { Search, Bot, Settings, Zap, Target, Code, Shield, X } from 'lucide-react';
import { AgentConfig } from '../types';

interface CommandPaletteProps {
  onClose: () => void;
  onSelectAgent: (index: number) => void;
  onSelectTab: (tab: string) => void;
  agents: AgentConfig[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  onClose,
  onSelectAgent,
  onSelectTab,
  agents,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands = [
    {
      id: 'chat',
      title: 'Открыть ИИ-помощника',
      description: 'Чат с OB2 ИИ-агентом',
      icon: Bot,
      action: () => onSelectTab('chat'),
      category: 'Навигация'
    },
    {
      id: 'config',
      title: 'Настройки агента',
      description: 'Конфигурация ИИ-агента',
      icon: Settings,
      action: () => onSelectTab('config'),
      category: 'Навигация'
    },
    {
      id: 'integrations',
      title: 'OB2 Интеграции',
      description: 'Управление интеграциями OB2',
      icon: Zap,
      action: () => onSelectTab('integrations'),
      category: 'Навигация'
    },
    {
      id: 'new-config',
      title: 'Создать конфиг',
      description: 'Генерация OB2 конфига с ИИ',
      icon: Code,
      action: () => {
        onSelectTab('chat');
        window.dispatchEvent(new CustomEvent('ob2-command', { 
          detail: { command: 'new-config' } 
        }));
      },
      category: 'OB2 Действия'
    },
    {
      id: 'analyze-results',
      title: 'Анализ результатов',
      description: 'ИИ анализ последних результатов',
      icon: Target,
      action: () => {
        onSelectTab('chat');
        window.dispatchEvent(new CustomEvent('ob2-command', { 
          detail: { command: 'analyze-results' } 
        }));
      },
      category: 'OB2 Действия'
    },
    {
      id: 'optimize-proxies',
      title: 'Оптимизировать прокси',
      description: 'ИИ оптимизация прокси-листа',
      icon: Shield,
      action: () => {
        onSelectTab('chat');
        window.dispatchEvent(new CustomEvent('ob2-command', { 
          detail: { command: 'optimize-proxies' } 
        }));
      },
      category: 'OB2 Действия'
    }
  ];

  const filteredCommands = commands.filter(command =>
    command.title.toLowerCase().includes(query.toLowerCase()) ||
    command.description.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredCommands, selectedIndex, onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        <div className="flex items-center p-4 border-b border-gray-200">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск команд OB2..."
            className="flex-1 outline-none text-lg"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Команды не найдены</p>
            </div>
          ) : (
            <div className="p-2">
              {Object.entries(
                filteredCommands.reduce((acc, command) => {
                  if (!acc[command.category]) acc[command.category] = [];
                  acc[command.category].push(command);
                  return acc;
                }, {} as Record<string, typeof commands>)
              ).map(([category, categoryCommands]) => (
                <div key={category} className="mb-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                    {category}
                  </h3>
                  {categoryCommands.map((command, index) => {
                    const globalIndex = filteredCommands.indexOf(command);
                    return (
                      <button
                        key={command.id}
                        onClick={() => {
                          command.action();
                          onClose();
                        }}
                        className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                          selectedIndex === globalIndex
                            ? 'bg-blue-50 border border-blue-200'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                          selectedIndex === globalIndex
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          <command.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-900">{command.title}</p>
                          <p className="text-sm text-gray-500">{command.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span>↑↓ навигация</span>
              <span>Enter выбрать</span>
              <span>Esc закрыть</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>Ctrl+K</span>
              <span>открыть</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};