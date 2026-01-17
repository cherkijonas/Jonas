import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Plus, Code, FileText, Link as LinkIcon, Tag, X } from 'lucide-react';
import { knowledgeBaseService, KnowledgeItem } from '../../services/knowledgeBaseService';

export const KnowledgeBaseWidget: React.FC = () => {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<KnowledgeItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<KnowledgeItem['type'] | 'all'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchTerm, selectedType, items]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await knowledgeBaseService.getItems();
      setItems(data);
    } catch (error) {
      console.error('Error loading knowledge base:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = items;

    if (selectedType !== 'all') {
      filtered = filtered.filter((item) => item.type === selectedType);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(term) ||
          item.content?.toLowerCase().includes(term) ||
          item.tags.some((tag) => tag.toLowerCase().includes(term))
      );
    }

    setFilteredItems(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet élément ?')) return;

    try {
      await knowledgeBaseService.deleteItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const getTypeIcon = (type: KnowledgeItem['type']) => {
    switch (type) {
      case 'snippet':
        return <Code size={16} className="text-purple-600" />;
      case 'bookmark':
        return <LinkIcon size={16} className="text-blue-600" />;
      case 'note':
        return <FileText size={16} className="text-green-600" />;
    }
  };

  const getTypeColor = (type: KnowledgeItem['type']) => {
    switch (type) {
      case 'snippet':
        return 'bg-purple-100 text-purple-700';
      case 'bookmark':
        return 'bg-blue-100 text-blue-700';
      case 'note':
        return 'bg-green-100 text-green-700';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="h-16 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen size={20} className="text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-900">Knowledge Base</h3>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2">
          {[
            { value: 'all', label: 'Tous' },
            { value: 'note', label: 'Notes' },
            { value: 'snippet', label: 'Snippets' },
            { value: 'bookmark', label: 'Bookmarks' },
          ].map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value as any)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedType === type.value
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <BookOpen size={32} className="text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">
            {searchTerm ? 'Aucun résultat' : 'Base de connaissance vide'}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            {searchTerm
              ? 'Essayez une autre recherche'
              : 'Ajoutez vos notes, snippets et bookmarks'}
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {getTypeIcon(item.type)}
                  <h4 className="font-medium text-slate-900 truncate">{item.title}</h4>
                  {item.is_public && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                      Public
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X size={16} />
                </button>
              </div>

              {item.content && (
                <p className="text-sm text-slate-600 line-clamp-2 mb-2">{item.content}</p>
              )}

              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline truncate block mb-2"
                >
                  {item.url}
                </a>
              )}

              {item.tags.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  <Tag size={12} className="text-slate-400" />
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-slate-200 text-slate-600 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-slate-200 text-center">
        <p className="text-xs text-slate-500">
          {items.length} élément{items.length > 1 ? 's' : ''} au total
        </p>
      </div>
    </div>
  );
};
