import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Brain, Globe, MessageSquare, Bot } from 'lucide-react';
import { api } from '../lib/api';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Toggle } from '../components/ui/Toggle';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';

const models = [
  { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B' },
  { value: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B (Fast)' },
  { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
  { value: 'gemma2-9b-it', label: 'Gemma 2 9B' },
];

const languages = [
  { value: 'auto', label: 'Auto-detect' },
  { value: 'darija', label: 'Darija' },
  { value: 'arabic', label: 'Arabic' },
  { value: 'french', label: 'French' },
  { value: 'english', label: 'English' },
];

export default function AIConfig() {
  const { guildId } = useParams();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.config.get(guildId).then(d => {
      setConfig(d.config);
      setLoading(false);
    }).catch(console.error);
  }, [guildId]);

  const update = async (key, value) => {
    const updated = { ...config, [key]: value };
    setConfig(updated);
  };

  const save = async () => {
    setSaving(true);
    const d = await api.config.update(guildId, config);
    setConfig(d.config);
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold">AI Configuration</h1>
        <p className="text-sm text-gray-400">Configure the AI assistant behavior</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-xl bg-blurple/10"><Brain size={22} className="text-blurple" /></div>
            <div>
              <h3 className="font-medium">AI Model</h3>
              <p className="text-xs text-gray-500 mt-1">The LLM model used for responses</p>
            </div>
          </div>
          <Select options={models} value={config?.aiModel} onChange={v => update('aiModel', v)} />
        </Card>

        <Card>
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-xl bg-green/10"><Globe size={22} className="text-green" /></div>
            <div>
              <h3 className="font-medium">Language</h3>
              <p className="text-xs text-gray-500 mt-1">Preferred response language</p>
            </div>
          </div>
          <Select options={languages} value={config?.language} onChange={v => update('language', v)} />
        </Card>

        <Card>
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-xl bg-yellow/10"><MessageSquare size={22} className="text-yellow" /></div>
            <div>
              <h3 className="font-medium">Command Prefix</h3>
              <p className="text-xs text-gray-500 mt-1">Prefix for text commands</p>
            </div>
          </div>
          <input className="input-field max-w-[120px]" value={config?.prefix || 'ai'} onChange={e => update('prefix', e.target.value)} />
        </Card>

        <Card>
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-xl bg-fuchsia/10"><Bot size={22} className="text-fuchsia" /></div>
            <div>
              <h3 className="font-medium">Temperature</h3>
              <p className="text-xs text-gray-500 mt-1">Response creativity (0-1)</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <input type="range" min="0" max="1" step="0.1" value={config?.aiTemperature || 0.1}
              onChange={e => update('aiTemperature', parseFloat(e.target.value))}
              className="flex-1 accent-blurple" />
            <span className="text-sm font-mono text-gray-300 w-8">{config?.aiTemperature || 0.1}</span>
          </div>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
      </div>
    </div>
  );
}
