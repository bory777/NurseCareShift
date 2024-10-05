import React, { useState } from 'react';
import '../styles/TagInput.css';

const TagInput: React.FC = () => {
  const [tags, setTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isComposing, setIsComposing] = useState(false);  // IMEの変換中かどうかを追跡

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isComposing && inputValue.trim()) {
      // 変換完了後のEnterでタグを追加
      setTags([...tags, inputValue.trim()]);
      setInputValue('');
      e.preventDefault();
    }
    if (e.key === 'Backspace' && !inputValue && tags.length) {
      setTags(tags.slice(0, -1));
    }
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="tag-input-container">
      <ul className="tag-list">
        {tags.map((tag, index) => (
          <li key={index} className="tag">
            {tag}
            <span className="tag-remove" onClick={() => handleRemoveTag(index)}>
              &times;
            </span>
          </li>
        ))}
      </ul>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => setIsComposing(true)}  // IMEの変換開始
        onCompositionEnd={() => setIsComposing(false)}   // IMEの変換終了
        placeholder="タグを入力..."
        className="tag-input"
      />
    </div>
  );
};

export default TagInput;
