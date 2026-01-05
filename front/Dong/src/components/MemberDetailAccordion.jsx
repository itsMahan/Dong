import React from 'react';
import { useTranslation } from 'react-i18next';

function MemberDetailAccordion({ onToggle, showDetails, theme, selectedMemberName, onSelect, members }) {
  const { t } = useTranslation();
  const handleSelectChange = (event) => {
    const memberName = event.target.value;
    onSelect(memberName);
    onToggle(!!memberName); 
  };

  return (
    <div className={`my-4 p-4 rounded-lg border ${
      theme === 'light' ? 'border-gray-200' : 'border-gray-700'
    }`}>
      <select
        value={selectedMemberName || ''}
        onChange={handleSelectChange}
        className={`block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md cursor-pointer ${
          theme === 'light'
            ? 'bg-white text-gray-900'
            : 'bg-gray-700 text-white'
        }`}
      >
        <option value="">{t("-- Select a member to see details --")}</option>
        {members.map((member) => (
          <option key={member.id} value={member.name}>
            {member.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default MemberDetailAccordion;
