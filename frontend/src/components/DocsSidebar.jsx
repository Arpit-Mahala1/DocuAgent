import React from 'react';

const DocsSidebar = ({ files, onSelect, selected }) => (
  <ul className="space-y-2">
    {files.map((file) => (
      <li
        key={file}
        className={`px-3 py-1 rounded cursor-pointer ${selected === file ? 'bg-[var(--color-primary)] text-white' : 'hover:bg-[var(--color-surface)]'}`}
        onClick={() => onSelect(file)}
      >
        {file}
      </li>
    ))}
  </ul>
);

export default DocsSidebar;
